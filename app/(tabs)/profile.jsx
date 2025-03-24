import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '../../components/SearchInput'
import EmptyState from '../../components/EmptyState'
import { getUserPosts, signOut } from '../../lib/appwrite'
import useAppWrite from '../../lib/useAppWrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import { icons } from "../../constants"
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'

const Profile = () => {

    const { user, setUser, setIsLogged } = useGlobalContext();
    const { data: posts, refetch } = useAppWrite(() => getUserPosts(user.$id));

    const logout = async () => {
        await signOut();
        setUser(null);
        setIsLogged(false);
        router.replace('/sign-in');
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={posts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                    <VideoCard
                        video={item}
                    />
                )}
                ListHeaderComponent={() => (
                    <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
                        <TouchableOpacity
                            className="flex w-full items-end mb-10"
                            onPress={logout}
                        >
                            <Image
                                source={icons.logout}
                                resizeMode="contain"
                                className="w-6 h-6"
                            />
                        </TouchableOpacity>
                        <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
                            <Image
                                source={{ uri: user?.avatar }}
                                className="w-[90%] h-[90%] rounded-lg"
                                resizeMode="cover"
                            />
                        </View>
                        <InfoBox
                            title={user?.username}
                            containerStyles='mt-5'
                            titleStyle='text-lg'
                        />
                        <View className="mt-5 flex flex-row">
                            <InfoBox
                                title={posts.length || 0}
                                subtitle="Posts"
                                containerStyles='mr-10'
                            />
                            <InfoBox
                                title={'1.2k'}
                                subtitle='Followers'
                            />
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        title="No videos found"
                        subtitle="No videos found for this search query"
                        isOnBookmarkScreen={false}
                    />
                )}
            />
        </SafeAreaView>
    )
}

export default Profile