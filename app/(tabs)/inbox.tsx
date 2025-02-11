import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const messages = [
  {
    id: "1",
    user: "janedoe",
    preview: "Hey, let's catch up soon!",
    time: "2m",
    unread: true,
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "2",
    user: "sarah",
    preview: "Your video is amazing!",
    time: "5m",
    unread: false,
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "3",
    user: "alex",
    preview: "When are we filming next?",
    time: "10m",
    unread: false,
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: "4",
    user: "mike",
    preview: "Let's meet tomorrow!",
    time: "1h",
    unread: true,
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: "5",
    user: "emily",
    preview: "Can you send me the files?",
    time: "3h",
    unread: true,
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
  },
];

const users = [
  {
    id: "1",
    name: "janedoe",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    emoticon: "😊",
  },
  {
    id: "2",
    name: "sarah",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    emoticon: "🎉",
  },
  {
    id: "3",
    name: "alex",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    emoticon: "🔥",
  },
  {
    id: "4",
    name: "mike",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    emoticon: "🚀",
  },
  {
    id: "5",
    name: "emily",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    emoticon: "💬",
  },
  {
    id: "6",
    name: "mike",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    emoticon: "🚀",
  },
];

export default function InboxScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState(messages);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = messages.filter(
      (message) =>
        message.user.toLowerCase().includes(query.toLowerCase()) ||
        message.preview.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="pencil-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* User Profiles */}
      <View style={styles.userListContainer}>
        <FlatList
          horizontal
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userProfile}>
              <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              {item.emoticon && (
                <View style={styles.emoticonContainer}>
                  <Text style={styles.emoticonText}>{item.emoticon}</Text>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.userList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Message List */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.messageItem}>
            {/* Avatar */}
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

            {/* Message Info */}
            <View style={styles.messageContent}>
              <Text style={[styles.messageUser, item.unread && styles.unreadUser]}>
                {item.user}
              </Text>
              <Text
                style={[styles.messagePreview, item.unread && styles.unreadPreview]}
                numberOfLines={1}
              >
                {item.preview}
              </Text>
            </View>

            {/* Time */}
            <Text style={styles.messageTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userListContainer: {
    alignItems: "center", // Center the user profiles horizontally
    paddingVertical: 10,
  },
  userList: {
    justifyContent: "center", // Center the items in the list
  },
  userProfile: {
    marginHorizontal: 12, // Reduced margin between profiles
    alignItems: "center",
  },
  userAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  emoticonContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#333",
    borderRadius: 50,
    padding: 4,
  },
  emoticonText: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: 2,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: "#262626",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageUser: {
    color: "#fff",
    fontSize: 16,
  },
  unreadUser: {
    fontWeight: "bold",
  },
  messagePreview: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },
  unreadPreview: {
    fontWeight: "bold",
    color: "#fff",
  },
  messageTime: {
    color: "#777",
    fontSize: 12,
  },
});