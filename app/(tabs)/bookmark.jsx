import { View, Text, FlatList, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import Trending from '../../components/Trending'
import EmptyState from '../../components/EmptyState'
import { getAllPosts, getLatesPosts, getSavedPosts } from '../../lib/appwrite'
import useAppWrite from '../../lib/useAppWrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'

const Bookmark = () => {

    const { user } = useGlobalContext();
    const { data: savedPosts, refetch } = useAppWrite(() => getSavedPosts(user.$id));

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }

    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={savedPosts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                    <VideoCard
                        video={item}
                    />
                )}
                ListHeaderComponent={() => (
                    <View className="flex my-6 px-4 space-y-6">
                        <View className="flex justify-between items-start flex-row mb-6">
                            <View>
                                <Text className="text-3xl font-psemibold text-white">
                                    Saved Videos
                                </Text>
                            </View>
                        </View>
                        <SearchInput
                            placeholder="Search your saved videos"
                        />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        title="No videos found"
                        subtitle="Save your first video"
                        isOnBookmarkScreen={true}
                    />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    )
}

export default Bookmark