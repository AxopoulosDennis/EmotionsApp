// VideoGrid.tsx
import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface VideoGridProps {
  data: { id: string; uri: string }[];
  tab: string;
  tabBarHeight: number;
}

const VideoGrid: React.FC<VideoGridProps> = ({ data, tab, tabBarHeight }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id}
    numColumns={3}
    contentContainerStyle={{ paddingBottom: tabBarHeight }}
    scrollEnabled={false} // Let ScrollView handle scrolling
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.videoContainer}>
        <Video
          source={{ uri: item.uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={false}
        />
      </TouchableOpacity>
    )}
    ListEmptyComponent={<Text style={styles.emptyText}>No {tab.toLowerCase()} yet</Text>}
  />
);

const styles = StyleSheet.create({
  videoContainer: {
    width: '33%',
    height: 150, 
    margin: 1,
    backgroundColor: '#111',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default VideoGrid;
