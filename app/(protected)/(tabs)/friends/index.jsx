import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth, db } from "../../../../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import FriendsList from "../../components/FriendsList";

// Placeholder data for friends
// const dummyFriends = [
//   { id: "1", name: "Alex Johnson", daysCompleted: 45, totalDays: 75 },
//   { id: "2", name: "Sarah Miller", daysCompleted: 30, totalDays: 75 },
//   { id: "3", name: "Michael Brown", daysCompleted: 60, totalDays: 75 },
//   { id: "4", name: "Emily Davis", daysCompleted: 15, totalDays: 75 },
// ];

const FriendItem = ({
  name,
  daysCompleted,
  totalDays,
  onViewProgress,
  onRemove,
}) => {
  const progressPercentage = Math.round((daysCompleted / totalDays) * 100);

  return (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{name}</Text>
        <Text style={styles.friendProgress}>
          {daysCompleted}/{totalDays} Days ({progressPercentage}%)
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity style={styles.viewButton} onPress={onViewProgress}>
          <Text style={styles.viewButtonText}>View Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FriendsScreen = () => {
  const router = useRouter();

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      console.log("current user is ", user.uid);

      //Logic for noticatiions for friend requests
      try {
        const friendRequestsRef = collection(db, "friendRequests");

        const q = query(
          friendRequestsRef,
          where("to", "==", user.uid),
          where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const count = snapshot.docs.length;
            setPendingRequestsCount(count);
          },
          (error) => {
            console.error("Error fetching friend requests: ", error);
          }
        );
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching friend requests: ", error);
      }
    }, [])
  );

  const handleAddFriend = () => {
    // Placeholder: Navigate to Add Friend screen
    // router.push({
    //   pathname: "add-friend",
    //   params: { returnTo: "friends" },
    // });
    router.push({
      pathname: "/friends/add-friend-modal",
      params: { returnTo: "friends" },
    });
  };

  const handleViewFriendRequests = () => {
    router.push("/friends/friend-requests-recieved-modal");
  };

  const handleSentFriendRequests = () => {
    router.push("/friends/friend-requests-sent-modal");
  };

  const handleViewProgress = (friendId) => {
    // Placeholder: Navigate to friend's progress screen
    router.push({ pathname: "friend-progress", params: { friendId } });
  };

  const handleRemoveFriend = (friendId) => {
    // Placeholder: Remove friend logic
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove this friend?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => console.log(`Removed friend ${friendId}`),
        },
      ]
    );
  };

  const renderFriend = ({ item }) => (
    <FriendItem
      name={item.name}
      daysCompleted={item.daysCompleted}
      totalDays={item.totalDays}
      onViewProgress={() => handleViewProgress(item.id)}
      onRemove={() => handleRemoveFriend(item.id)}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleAddFriend}>
            <Icon name="add" size={30} color="#007AFF" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleViewFriendRequests}>
            <Icon
              name="notifications"
              size={30}
              color="#007AFF"
              style={styles.icon}
            />
            {pendingRequestsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSentFriendRequests}>
            <Icon name="drafts" size={30} color="#007AFF" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      {/* {dummyFriends.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You have no friends yet.</Text>
          <Text style={styles.emptySubText}>
            Add a friend to see their progress!
          </Text>
          <TouchableOpacity
            style={styles.addButtonEmpty}
            onPress={handleAddFriend}
          >
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dummyFriends}
          renderItem={renderFriend}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )} */}
      <FriendsList />
    </ScrollView>
  );
};

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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: 8,
  },
  badge: {
    position: "absolute",
    top: -5, // Adjust to position in top-right
    right: -5,
    backgroundColor: "red",
    borderRadius: 10, // Circular badge
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
  },
  friendCard: {
    flexDirection: "row",
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  friendProgress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00FF00",
    borderRadius: 4,
  },
  friendActions: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  viewButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  addButtonEmpty: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
});

export default FriendsScreen;
