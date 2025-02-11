import React from "react";
import { View, Text, StyleSheet } from "react-native";

const LiveTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.tabTitle}>Live Tab Content</Text>
      {/* Add your Live tab content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default LiveTab;