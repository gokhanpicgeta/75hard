import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";

export default function AddFriendScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams();

  const [potentialFriends] = useState([
    { id: "1", name: "Alice Johnson" },
    { id: "2", name: "Bob Smith" },
    { id: "3", name: "Charlie Brown" },
    { id: "4", name: "Dana Lee" },
  ]);

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleAddFriend = (friendId) => {
    console.log(`Added friend with ID: ${friendId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace(returnTo)}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Friend</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search friends..."
          placeholderTextColor="#666"
        />
      </View>

      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={potentialFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <Text style={styles.friendName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddFriend(item.id)}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    flex: 1,
    marginHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
