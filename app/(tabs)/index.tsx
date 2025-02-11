import React, { useState } from "react";
import { View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity,
} from "react-native";
import { useBottomTabOverflow } from "@/components/ui/TabBarBackground";

// Import your tab components
import LiveTab from "@/components/homeTabs/liveTab";
import ExploreTab from "@/components/homeTabs/exploreTab";
import SubscribedTab from "@/components/homeTabs/subscribed";
import ForYouTab from "@/components/homeTabs/forYouTab";
import SearchTab from "@/components/homeTabs/searchTab";
import { PanGestureHandler, State } from "react-native-gesture-handler";

let { height, width } = Dimensions.get("window");

export default function App() {
  const tabBarHeight = useBottomTabOverflow();
  // Tab state
  const [activeTab, setActiveTab] = useState("ForYou");



  return (
    <View style={[styles.container, { paddingBottom: tabBarHeight }]}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Live" && styles.activeTab]}
          onPress={() => setActiveTab("Live")}
        >
          <Text style={[styles.tabText, activeTab === "Live" && styles.activeTabText]}>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Explore" && styles.activeTab]}
          onPress={() => setActiveTab("Explore")}
        >
          <Text style={[styles.tabText, activeTab === "Explore" && styles.activeTabText]}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Subscribed" && styles.activeTab]}
          onPress={() => setActiveTab("Subscribed")}
        >
          <Text style={[styles.tabText, activeTab === "Subscribed" && styles.activeTabText]}>Subscribed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ForYou" && styles.activeTab]}
          onPress={() => setActiveTab("ForYou")}
        >
          <Text style={[styles.tabText, activeTab === "ForYou" && styles.activeTabText]}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Search" && styles.activeTab]}
          onPress={() => setActiveTab("Search")}
        >
          <Text style={[styles.tabText, activeTab === "Search" && styles.activeTabText]}>Search</Text>
        </TouchableOpacity>
      </View>

        <View style={[styles.contentContainer, ]}>
          {activeTab === "Live" && <LiveTab />}
          {activeTab === "Explore" && <ExploreTab />}
          {activeTab === "Subscribed" && <SubscribedTab passHeight={height} passWidth={width} />}
          {activeTab === "ForYou" && <ForYouTab passHeight={height} passWidth={width} />}
          {activeTab === "Search" && <SearchTab />}
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", position:'relative' },
  
  // Tabs
  tabContainer: { 
    position:'absolute',
    top: 40,
    left: 0,
    // borderBottomWidth: 1, 
    borderBottomColor: "#333",  
    backgroundColor: "transparent", 
    paddingTop: 10,
    zIndex:2,
    flexDirection:'row'
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor:"transparent"},
  tabText: { color: "#888", fontSize: 13, fontWeight: "bold" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  activeTabText: { color: "#fff" },

  // Content
  contentContainer: { flex: 1},
});
