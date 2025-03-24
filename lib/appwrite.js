import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    videoCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID,
    storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID
};


const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount)
            throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        );
        return newUser;
    }
    catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
}


export async function signIn(email, password) {
    try {

        const session = await account.createEmailPasswordSession(email, password);

        return session;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
}


export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error) {
        throw new Error(error);
    }
}


export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount();

        if (!currentAccount)
            throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if (!currentUser)
            throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.error(error);
        throw new Error(error);
        return null;
    }
}


export async function getAllPosts() {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc('$createdAt')]
        );

        return posts.documents;

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}


export async function getLatesPosts() {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        );

        return posts.documents;

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export async function searchPosts(query) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.search("title", query)]
        );

        return posts.documents;

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export async function getUserPosts(userId) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal('creator', userId)]
        );

        return posts.documents;

    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export async function savePost(postId) {
    try {
        const currentUser = await getCurrentUser();

        const postDocument = await databases.getDocument(
            config.databaseId,
            config.videoCollectionId,
            postId
        );

        const existingLikedByUsers = postDocument.likedBy || [];

        const isAlreadySaved = existingLikedByUsers.some(user => user.$id === currentUser.$id);

        let updatedLikeByUsers;
        if (isAlreadySaved) {
            updatedLikeByUsers = existingLikedByUsers.filter(user => user.$id !== currentUser.$id);
        } else {
            updatedLikeByUsers = [...existingLikedByUsers, currentUser.$id];
        }

        const updatedPost = await databases.updateDocument(
            config.databaseId,
            config.videoCollectionId,
            postId,
            {
                likedBy: updatedLikeByUsers
            }
        );

        console.log(isAlreadySaved ? "Post unsaved" : "Post saved", updatedPost);
        return updatedPost;

    } catch (error) {
        console.error("Error saving post:", error);
        throw new Error(error);
    }
}



export async function getSavedPosts(userId) {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId
        );

        const savedPosts = posts.documents.filter(post =>
            post.likedBy.some(user => user.$id === userId)
        );

        return savedPosts;

    } catch (error) {
        console.error("Error fetching saved posts:", error);
        throw new Error(error);
    }
}



export async function signOut() {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        throw new Error(error)
    }
}

export async function getFilePreview(fileId, type) {
    let fileUrl;

    try {
        if (type === 'video') {
            fileUrl = storage.getFileView(config.storageId, fileId)
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(config.storageId, fileId, 2000, 2000, 'top', 100)
        } else {
            throw new Error('Invalid file type')
        }

        if (!fileUrl)
            throw Error;

        return fileUrl;
    } catch (error) {
        throw new Error(error)
    }
}

export async function uploadFile(file, typeFile) {
    if (!file) {
        return;
    }
    const { mimeType, ...rest } = file;
    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri,
    };

    try {
        const uploadedFile = await storage.createFile(
            config.storageId,
            ID.unique(),
            asset
        )

        const fileUrl = await getFilePreview(uploadedFile.$id, typeFile);

        return fileUrl;

    } catch (error) {
        throw new Error(error)
    }
}

export async function createVideo(form) {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video')
        ])
        const newPost = await databases.createDocument(
            config.databaseId,
            config.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId
            }
        )
        return newPost;
    } catch (error) {
        throw new Error(error);
    }
}
