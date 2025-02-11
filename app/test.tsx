import React, { useRef, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import Slider from '@react-native-community/slider';
import { Video, ResizeMode } from "expo-av";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";

let { height, width } = Dimensions.get("window");

type VideoItem = {
  id: string;
  uri: string;
  user: string;
  description: string;
  likes: number;
  comments: number;
};

const videos: VideoItem[] = [
  {
    id: "1",
    uri: "https://www.w3schools.com/html/mov_bbb.mp4",
    user: "John Doe",
    description: "Check out this cool video! Check out this cool video! Check out this cool video!Check out this cool video!",
    likes: 123,
    comments: 45,
  },
  {
    id: "2",
    uri: "https://www.w3schools.com/html/movie.mp4",
    user: "Jane Smith",
    description: "Amazing scenery!",
    likes: 456,
    comments: 67,
  },
  {
    id: "3",
    uri: "https://www.w3schools.com/html/mov_bbb.mp4",
    user: "Alice Johnson",
    description: "Fun times!",
    likes: 789,
    comments: 89,
  },
];

export default function App() {
  const tabBarHeight = useBottomTabOverflow();
  height = height - tabBarHeight;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean[]>(videos.map(() => false));
  const [showIcon, setShowIcon] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);

  const videoRefs = useRef<(Video | null)[]>([]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index ?? 0;
      setCurrentIndex(visibleIndex);
      setIsPlaying(videos.map((_, idx) => idx === visibleIndex));
    }
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((ref, index) => {
      if (ref && index !== currentIndex) {
        ref.pauseAsync();
      }
    });
  }, [currentIndex]);

  const togglePlayPause = (index: number) => {
    setIsPlaying((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      return newState;
    });
    setShowIcon(true);
    setTimeout(() => setShowIcon(false), 200);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.durationMillis > 0) {
      setDuration(status.durationMillis);
      setCurrentTime(status.positionMillis);
      setSliderValue(status.positionMillis / status.durationMillis); // normalize current time to a 0-1 range
    }
  };
  useFocusEffect(
    useCallback(() => {
      setIsPlaying((prevState) => {
        const newState = [...prevState];
        newState[currentIndex] = true;
        return newState;
      });
      return () => {
        setIsPlaying((prevState) => prevState.map(() => false));
      };
    }, [currentIndex])
  );

  

  const renderItem = ({ item, index }: { item: VideoItem; index: number }) => (
    <View style={[styles.videoContainer]}>
      <View style={[styles.screenContainer, { paddingBottom: tabBarHeight }]}>
        <TouchableOpacity onPress={() => togglePlayPause(index)} style={styles.videoWrapper} activeOpacity={1}>
          <Video
            ref={(ref) => {
              if (ref) {
                videoRefs.current[index] = ref;
              }
            }}
            source={{ uri: item.uri }}
            style={[styles.video]}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isPlaying[index]}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate} // Update current time and duration
          />
          {showIcon && (
            <View style={styles.iconOverlay}>
              {isPlaying[index] ? (
                <Ionicons name="pause" size={50} color="rgba(255, 255, 255, 0.8)" />
              ) : (
                <Ionicons name="play" size={50} color="rgba(255, 255, 255, 0.8)" />
              )}
            </View>
          )}
        </TouchableOpacity>

        {isBuffering && <ActivityIndicator size="large" color="#fff" style={styles.bufferingIndicator} />}
        
        {/* Grouped User Info, Description, and Progress Container */}
        <View style={[styles.overlay, { paddingBottom: tabBarHeight }]}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>@{item.user}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)} / {formatTime(duration)}</Text>
            <Slider
              style={styles.slider}
              value={sliderValue}
              onValueChange={(value) => {
                setSliderValue(value);
                const seekToTime = value * duration;
                videoRefs.current[index]?.setStatusAsync({ positionMillis:seekToTime, seekMillisToleranceAfter: 0, seekMillisToleranceBefore: 0 });   
              }}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#262626"
              thumbTintColor="transparent"
              tapToSeek

            />
          </View>
        </View>
      </View>

      {/* Action Buttons positioned vertically on the right */}
      <View style={styles.actions}>


      <TouchableOpacity style={styles.actionButton}>
          <Image
            source={{ uri: "https://www.w3schools.com/w3images/avatar2.png" }} // Replace with the actual user image URL
            style={styles.userImage}
          />
          <MaterialCommunityIcons name="plus" size={20} color="#fff" style={styles.plusIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="comment-plus-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="share" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="bookmark-outline" size={30} color="#fff" />
        </TouchableOpacity>


      </View>
    </View>
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  return (
    <FlatList
      data={videos}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    height,
    width,
    position: 'relative',
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
  video: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  userInfoContainer: {
  },
  username: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    maxWidth: 250,
  },
  actions: {
    position: 'absolute',
    right: 10,
    bottom: 160,
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  bufferingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  iconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  userImage: {
    width: 34,
    height: 34,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  plusIcon: {
    position: 'absolute',
    bottom: '80%',
    right: '15%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 0,
  },
  progressContainer: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: 20,
    marginBottom: -20,
  },
  timeText: {
    color: '#fff',
    fontSize: 11,
    marginRight:4,
    alignSelf:'flex-end'
  },
});
