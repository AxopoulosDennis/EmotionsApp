// ProfileScreen.tsx
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, Image, View, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import PostsTab from '../../components/profileTabs/PostsTab';
import RepostsTab from '../../components/profileTabs/RepostsTab';
import SavedTab from '../../components/profileTabs/SavedTab';
import ReactionTab from '../../components/profileTabs/ReactionsTab';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const currentUser = { username: "johndoe2" };

const userProfile = {
  username: "johndoe",
  profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
  bio: "Traveler ✈ | Content Creator 🎥 | Dreamer 🌍 Follow for daily content!",
  followers: 1200,
  following: 300,
  subscribers: 400,
  uploads: [{ id: "1", uri: "https://www.w3schools.com/html/mov_bbb.mp4" }, { id: "2", uri: "https://www.w3schools.com/html/movie.mp4" }],
  reposts: [{ id: "11", uri: "https://www.w3schools.com/html/mov_bbb.mp4" }],
  saved: [{ id: "21", uri: "https://www.w3schools.com/html/mov_bbb.mp4" }],
  reactions: [{ id: "23", uri: "https://www.w3schools.com/html/movie.mp4" }],
};

const ProfileScreen: React.FC = () => {
  const tabBarHeight = useBottomTabOverflow();
  const [activeTab, setActiveTab] = useState<string>("Posts");

  const renderTabContent = () => {
    switch (activeTab) {
      case "Posts":
        return <PostsTab data={userProfile.uploads} tabBarHeight={tabBarHeight} />;
      case "Reposts":
        return <RepostsTab data={userProfile.reposts} tabBarHeight={tabBarHeight} />;
      case "Saved":
        return <SavedTab data={userProfile.saved} tabBarHeight={tabBarHeight} />;
      case "Reactions":
        return <ReactionTab data={userProfile.reactions} tabBarHeight={tabBarHeight} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[3]}>
        <View style={styles.profileHeader}>
          <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
          <View style={styles.statsContainer}>
            <View style={styles.stat}><Text style={styles.statNumber}>{userProfile.followers}</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{userProfile.following}</Text><Text style={styles.statLabel}>Following</Text></View>
            <View style={styles.stat}><Text style={styles.statNumber}>{userProfile.subscribers}</Text><Text style={styles.statLabel}>Subscribers</Text></View>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <Text style={styles.username}>{userProfile.username}</Text>
          <Text style={styles.bio}>{userProfile.bio}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editProfileButton}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

<>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Posts" && styles.activeTab]}
            onPress={() => setActiveTab("Posts")}
          >
            <Text style={[styles.tabText, activeTab === "Posts" && styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Reposts" && styles.activeTab]}
            onPress={() => setActiveTab("Reposts")}
          >
            <Text style={[styles.tabText, activeTab === "Reposts" && styles.activeTabText]}>Reposts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Saved" && styles.activeTab]}
            onPress={() => setActiveTab("Saved")}
          >
            <Text style={[styles.tabText, activeTab === "Saved" && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Reactions" && styles.activeTab]}
            onPress={() => setActiveTab("Reactions")}
          >
            <Text style={[styles.tabText, activeTab === "Reactions" && styles.activeTabText]}>Reactions</Text>
          </TouchableOpacity>
        </View>
</>
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  profileHeader: { flexDirection: "row", alignItems: "center", padding: 5, justifyContent: "space-between" },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: "#fff" },
  statsContainer: { flexDirection: "row", flex: 1, justifyContent: "space-around", marginLeft: 30 },
  stat: { alignItems: "center" },
  statNumber: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statLabel: { color: "#ccc", fontSize: 12 },
  profileContainer: { paddingHorizontal: 8, marginTop: 10 },
  username: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  bio: { color: "#ccc", fontSize: 13, marginTop: 3, paddingRight: 50 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 6},
  editProfileButton: { flexDirection: "row", flex: 1, backgroundColor: "#262626", paddingVertical: 8, borderRadius: 6, alignItems: "center", marginRight: 12, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "bold", marginLeft: 8 },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", backgroundColor: "#000", paddingTop:10},
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  tabText: { color: "#888", fontSize: 14, fontWeight: "bold" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  activeTabText: { color: "#fff" },
});

export default ProfileScreen;
