import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SearchTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.tabTitle}>Search Tab Content</Text>
      {/* Add your Search tab content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  tabTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default SearchTab;