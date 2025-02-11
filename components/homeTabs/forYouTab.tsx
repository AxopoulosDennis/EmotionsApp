import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground"

type Reply = {
  id: string;
  user: string;
  userImage: string;
  text: string;
  time: number;
  replyingTo?: string; // Added to track who the reply is addressing
};

type Comment = {
  id: string;
  user: string;
  userImage: string;
  text: string;
  time: number;
  replies: Reply[];
};

type VideoItem = {
  id: string;
  uri: string;
  user: string;
  userImage: string;
  description: string;
  likes: number;
  comments: Comment[]; // Array of comments
  shares: number;
  saved: number;
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
    neutral: number;
  };
};

const videos: VideoItem[] = [
  {
    id: "1",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    user: "John Doe",
    userImage: "https://randomuser.me/api/portraits/women/3.jpg",
    description: "Check out this cool video!",
    likes: 123,
    comments: [
      {
        id: "1-1",
        user: "Alice",
        userImage: "https://randomuser.me/api/portraits/women/1.jpg",
        text: "Great video!",
        time: 3,
        replies: [
          { 
            id: "1-1-1", 
            user: "Bob", 
            userImage: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "I agree!" ,
            time: 2,
            replyingTo: "Alice"
          },
          // ... other replies
        ],
      },
      // ... other comments
    ],
    shares: 80,
    saved: 90,
    emotions: {
      happy: 10,
      sad: 5,
      angry: 2,
      surprised: 1,
      disgusted: 0,
      fearful: 3,
      neutral: 15,
    },
  },
  {
    id: "2",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    user: "Jane Smith",
    userImage: "https://randomuser.me/api/portraits/men/4.jpg",
    description: "Amazing scenery!",
    likes: 456,
    comments: [
      {
        id: "2-1",
        user: "Alice",
        userImage: "https://randomuser.me/api/portraits/women/1.jpg",
        text: "Great video!",
        time:4,
        replies: [
          { 
            time: 2,
            id: "2-1-1", 
            user: "Bob", 
            userImage: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "I agree!" ,
            replyingTo: "Alice"

          },
          // ... other replies
        ],
      },
      // ... other comments
    ],
    shares: 80,
    saved: 90,
    emotions: {
      happy: 1200,
      sad: 10,
      angry: 3,
      surprised: 2,
      disgusted: 1,
      fearful: 0,
      neutral: 25,
    },
  },
  {
    id: "3",
    uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    user: "Jane Smith",
    userImage: "https://randomuser.me/api/portraits/men/4.jpg",
    description: "Amazing scenery!",
    likes: 456,
    comments: [
      {
        id: "3-1",
        user: "Alice",
        userImage: "https://randomuser.me/api/portraits/women/1.jpg",
        text: "Great video!",
        time:4,
        replies: [
          { 
            time: 2,
            id: "3-1-1", 
            user: "Bob", 
            userImage: "https://randomuser.me/api/portraits/men/2.jpg",
            text: "I agree!",
            replyingTo: "Alice"

          },
          // ... other replies
        ],
      },
      // ... other comments
    ],
    shares: 80,
    saved: 90,
    emotions: {
      happy: 1200,
      sad: 10,
      angry: 3,
      surprised: 2,
      disgusted: 1,
      fearful: 0,
      neutral: 25,
    },
  },
];

interface LiveTabProps {
  passHeight: number;
  passWidth: number;
}

const ForYouTab: React.FC<LiveTabProps> = ({ passHeight, passWidth }) => {

  
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const tabBarHeight = useBottomTabOverflow();
  const height = passHeight - tabBarHeight ;
  const width = passWidth;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean[]>(videos.map(() => false));
  const [showIcon, setShowIcon] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const sliderTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [videosState, setVideosState] = useState<VideoItem[]>(videos);

  const videoRefs = useRef<(Video | null)[]>([]);

  const isSeeking = useRef(false);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index ?? 0;
        setCurrentIndex(visibleIndex);    
        // Force state update to ensure proper video handling
        setIsPlaying(prev => prev.map((_, idx) => idx === visibleIndex));
    }
  }, []);

  

  useEffect(() => {
    videoRefs.current.forEach((ref, index) => {
    // Reset slider values immediately when video changes
    setSliderValue(0);
    setCurrentTime(0);
    setDuration(0);

      
      if (ref) {
        if (index === currentIndex) {
          // Reset video to start and play
          ref.setPositionAsync(0);
          ref.playAsync();
        } else {
          ref.pauseAsync();
        }
      }
    });
    

    
  }, [currentIndex]);

  useEffect(() => {


  }, [currentIndex]);

  const togglePlayPause = (index: number) => {
    console.log("togglePlayPause");

    setIsPlaying((prevState) => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      
      if (videoRefs.current[index]) {
        newState[index] ? videoRefs.current[index]?.playAsync() : videoRefs.current[index]?.pauseAsync();
      }
  
      return newState;
    });
    
    setShowIcon(true);
    setTimeout(() => setShowIcon(false), 200);
  };

  const lastUpdateRef = useRef(0);

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded && status.durationMillis > 0) {
      const newPosition = status.positionMillis;
      const newDuration = status.durationMillis;
  
      // Immediate update for time display
      setCurrentTime(newPosition);
      setDuration(newDuration);
  
      // Debounced slider update
      if (sliderTimeout.current) clearTimeout(sliderTimeout.current);
      sliderTimeout.current = setTimeout(() => {
        setSliderValue(newPosition / newDuration);
      }, 300);
    }
  }, []);

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

const commentsListRef = useRef<FlatList<Comment> | null>(null);


const handleCommentSubmit = () => {
  if (commentInput.trim() && currentVideoId) {
    Keyboard.dismiss();

    const newComment: Comment | Reply = {
      id: Math.random().toString(),
      user: "Current User",
      userImage: "https://randomuser.me/api/portraits/women/3.jpg",
      time: 1,
      text: commentInput,
      ...(replyingTo ? { replyingTo } : {}), // Add replyingTo field for replies
      ...(replyingTo ? {} : { replies: [] }),
    };

    setVideosState((prevVideos) =>
      prevVideos.map((video) => {
        if (video.id !== currentVideoId) return video;

        if (replyingTo) {
          const updatedComments = video.comments.map((comment) => {
            if (comment.id !== selectedCommentId) return comment;
            return {
              ...comment,
              replies: [...comment.replies, newComment as Reply],
            };
          });
          return { ...video, comments: updatedComments };
        } else {
          return {
            ...video,
            comments: [...video.comments, newComment as Comment],
          };
        }
      })
    );

    setCommentInput("");
    setReplyingTo(null);
    setSelectedCommentId(null);

    // Scroll to the bottom after a short delay
    setTimeout(() => {
      commentsListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }
};
const renderComment = ({ item }: { item: Comment }) => (
  <View style={styles.commentItem}>
    <TouchableOpacity
      delayPressIn={0} // This makes sure it responds immediately
      style={styles.commentContent}
      onPress={() => {
        setSelectedCommentId(item.id);
        setReplyingTo(item.user);
      }}
    >
      <Image source={{ uri: item.userImage }} style={styles.replyUserImage} />
      <View style={styles.replyContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{item.user}</Text>
          <Text style={styles.replyTime}>{item.time}m</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </TouchableOpacity>

    {/* Render replies */}
    {item.replies.map((reply) => (
          <TouchableOpacity key={reply.id}
          style={styles.replyContainer}
          onPress={() => {
            setSelectedCommentId(item.id);  // Parent comment ID
            setReplyingTo(reply.user); // User being replied to
          }}
        >
          <Image source={{ uri: reply.userImage }} style={styles.replyUserImage} />
          <View style={styles.replyContent}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUsername}>{reply.user}</Text>
              <Text style={styles.replyTime}>{reply.time}m</Text>
            </View>
          
          
            <Text style={styles.commentText}>
              {reply.replyingTo && (          
                <Text style={styles.replyingToText}>@{reply.replyingTo} </Text>
               )}
              {reply.text}
          </Text>
        </View>

        </TouchableOpacity>

    ))}

    
  </View>
);

      
const renderItem = ({ item, index }: { item: VideoItem; index: number }) => {
  const sortedEmotions = Object.entries(item.emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 1);

  const emotionEmojis: { [key: string]: string } = {
    happy: "😊",
    sad: "😢",
    angry: "😡",
    surprised: "😲",
    disgusted: "🤢",
    fearful: "😨",
    neutral: "😐",
  };

  return (
      <View >
        <View style={styles.screenContainer}>
          <TouchableOpacity onPress={() => togglePlayPause(index)} style={styles.videoWrapper} activeOpacity={1}>
            <Video
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[index] = ref;
                }
              }}
              source={{ uri: item.uri }}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay={isPlaying[index]}
              onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              style={[styles.video, { height: height , width: width}]}
              useNativeControls = {false}
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

          <View style={[styles.overlay, { paddingBottom: tabBarHeight }]}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.username}>@{item.user}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
              <Slider
                  style={styles.slider}
                  value={sliderValue}
                  onValueChange={(value) => {
                    isSeeking.current = true;
                    setSliderValue(value);
                  }}
                  onSlidingComplete={(value) => {
                    isSeeking.current = false;
                    const seekToTime = value * duration;
                    videoRefs.current[index]?.setStatusAsync({
                      positionMillis: seekToTime,
                      seekMillisToleranceAfter: 0,
                      seekMillisToleranceBefore: 0,
                    });
                  }}
                  thumbTintColor="transparent"
                />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Image source={{ uri: item.userImage }} style={styles.userImage} />
            <MaterialCommunityIcons name="plus" size={20} color="#fff" style={styles.plusIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            {sortedEmotions.map(([emotion, count], idx) => (
              <View key={idx}>
                <Text style={styles.emotionText}>{emotionEmojis[emotion]}</Text>
                <Text style={styles.counterText}>{count}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setCurrentVideoId(item.id);
              setIsCommentModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="comment-plus-outline" size={28} color="#fff" />
            <Text style={styles.counterText}>{item.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="share" size={30} color="#fff" />
            <Text style={styles.counterText}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="bookmark-outline" size={30} color="#fff" />
            <Text style={styles.counterText}>{item.saved}</Text>
          </TouchableOpacity>
        </View>
        
      </View>
  );
};

  return (
    <>
<FlatList
  style={[styles.flatListContent]}
  data={videosState}
  keyExtractor={(item) => item.id}
  pagingEnabled
  showsVerticalScrollIndicator={false}

  onViewableItemsChanged={handleViewableItemsChanged}
  viewabilityConfig={{
    itemVisiblePercentThreshold: 90, // Higher threshold for more precise triggering
    waitForInteraction: true
  }}
  renderItem={renderItem}
  snapToInterval={height}
  decelerationRate="fast"
  initialNumToRender={1}
  maxToRenderPerBatch={1}
  windowSize={3}
/>

      <Modal
        visible={isCommentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsCommentModalVisible(false);
          setReplyingTo(null);
          setSelectedCommentId(null);
        }}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            style={styles.modalOverlay}
          >    
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity 
                onPress={() => setIsCommentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={commentsListRef}
              data={videosState.find((video) => video.id === currentVideoId)?.comments || []}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
              ListEmptyComponent={() => (
                <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
              )}
            />

<View style={styles.inputContainer}>
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>Replying to @{replyingTo}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setReplyingTo(null);
                      setSelectedCommentId(null);
                    }}
                  >
                    <Ionicons name="close" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              )}
  <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder={replyingTo ? `Reply to @${replyingTo}...` : "Add a comment..."}
                  placeholderTextColor="#999"
                  value={commentInput}
                  onChangeText={setCommentInput}
                  multiline
                />
                 <TouchableOpacity
                  onPress={handleCommentSubmit}
                  style={styles.sendButton}
                  disabled={!commentInput.trim()}
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={commentInput.trim() ? "#2196F3" : "#999"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  replyingToText: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  flatListContent: {
    flex: 1,
  },
  screenContainer: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "black",
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  video: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
  },
  userInfoContainer: {
    maxWidth: "75%",
    padding: 12,
    marginLeft: -10,
    marginBottom: -15,
  },
  username: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    color: "#fff",
    fontSize: 16,
    maxWidth: 250,
    marginBottom: 10,
  },
  actions: {
    position: "absolute",
    right: 10,
    bottom: 140,
    flexDirection: "column",
    alignItems: "center",
    justifyContent:'center'
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 6,
    justifyContent:'center',
    alignItems:'center'
  },
  bufferingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  iconOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  userImage: {
    width: 34,
    height: 34,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  plusIcon: {
    position: "absolute",
    bottom: "99%",
    right: "5%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 0,
  },
  progressContainer: {
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 40,
  },
  slider: {
    width: "100%",
    height: 20,
    marginBottom: -20,
  },
  timeText: {
    color: "#fff",
    fontSize: 11,
    marginRight: 4,
    alignSelf: "flex-end",
  },
  emotionText: {
    color: "#fff",
    fontSize: 28,
    margin: 0,
    padding: 0,

  },
  
  counterContainer: {
    justifyContent:'center',
    alignItems:'center',
    textAlign:'center'  },
  counterText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
    justifyContent:'center',
    alignItems:'center',
    textAlign:'center'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingTop: 40,
  },
  modalContent: {
    width: "100%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    height: "80%",
  },
  commentInput: {
    height: 100,    
    width: "85%",

    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  commentItem: {
    padding: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 16,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  commentsList: {
    padding: 10
  },
  commentUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding:10,
    borderRadius: 20,
    backgroundColor: '#3333330A',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent:'space-between'
  },
  commentTime:{
    fontWeight: '400',
    color: '#333',
    fontSize: 12,
    marginRight: 10,
  },
  replyTime:{
    fontWeight: '400',
    color: '#333',
    fontSize: 13,
    alignItems:'center',
    textAlignVertical:'center'
  },
  commentUsername: {
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },

  
  replyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f2f5',
  },
  replyButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginLeft: 20,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
    
  },
  replyUserImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,

  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#fff',

  },
  inputWrapper: {
    
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f2f5',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },

  noCommentsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },

});

export default ForYouTab;