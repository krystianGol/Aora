import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { icons } from '../constants'
import { VideoView, useVideoPlayer } from 'expo-video'
import useAppWrite from '../lib/useAppWrite'
import { savePost } from '../lib/appwrite'
import { useGlobalContext } from '../context/GlobalProvider'

const VideoCard = ({ video: { title, thumbnail, video, creator: { username, avatar } }, postId }) => {

    const [play, setPlay] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = false;
        player.play();
    });

    return (
        <View className="flex flex-col items-center px-4 mb-14">
            <View className="flex flex-row gap-3 items-start">
                <View className="flex justify-center items-center flex-row flex-1">
                    <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
                        <Image
                            source={{ uri: avatar }}
                            className="w-full h-full rounded-lg"
                            resizeMode="cover"
                        >
                        </Image>
                    </View>
                    <View className="flex justify-center flex-1 ml-3 gap-y-1">
                        <Text className="font-psemibold text-sm text-white"
                            numberOfLines={1}>{title}
                        </Text>
                        <Text className="text-xs text-gray-100 font-pregular"
                            numberOfLines={1}>
                            {username}
                        </Text>
                    </View>
                </View>
                <View className="pt-2">
                    <TouchableOpacity
                        onPress={() => savePost(postId)}
                    >
                        <Image
                            source={icons.menu}
                            className="w-5 h-5"
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {play && videoUrl ? (
                <VideoView
                    style={styles.video}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                />
            ) : (
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                        setPlay(true)
                        setVideoUrl(video)
                    }}
                    className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
                >
                    <Image
                        source={{ uri: thumbnail }}
                        className="w-full h-full rounded-xl mt-3"
                        resizeMode="cover"
                    />
                    <Image
                        source={icons.play}
                        className="w-12 h-12 absolute"
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            )}
        </View >
    )
}

const styles = StyleSheet.create({
    video: {
        width: '100%',
        height: 240,
        borderRadius: 12,
        marginTop: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    }
});

export default VideoCard