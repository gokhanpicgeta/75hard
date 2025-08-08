import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import CircularProgress from "./CircularProgressBar";

// FriendsList component
const FriendsList = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch friend data in batches
  const fetchFriendsData = async (friendIds) => {
    if (!friendIds.length) return [];

    // Split friend IDs into batches of 10 (Firestore "in" clause limit)
    const batches = [];
    const idsCopy = [...friendIds]; // Avoid mutating original array
    while (idsCopy.length) {
      batches.push(idsCopy.splice(0, 10));
    }

    const friendDocs = [];
    for (const batch of batches) {
      try {
        const q = query(
          collection(db, "users"),
          where("__name__", "in", batch)
        );
        const snapshot = await getDocs(q);
        friendDocs.push(...snapshot.docs);
      } catch (error) {
        console.error("Error fetching friend batch:", error);
      }
    }

    // Map documents to usable data
    return friendDocs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        username: data.username || "Unknown",
        challengeName: data.currentAttempt?.name || "N/A",
        daysCompleted: data.currentAttempt?.daysCompleted || 0,
      };
    });
  };

  // Function to remove a friend
  const removeFriend = async (friendUid) => {
    const currentUid = auth.currentUser.uid;

    try {
      // Remove friendUid from current user's friends array
      const currentUserRef = doc(db, "users", currentUid);
      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendUid),
      });

      // Remove currentUid from friend's friends array
      const friendUserRef = doc(db, "users", friendUid);
      await updateDoc(friendUserRef, {
        friends: arrayRemove(currentUid),
      });

      // Refetch friends data to update the UI
      const updatedFriends = await fetchFriendsData(
        (await getDoc(currentUserRef)).data().friends || []
      );
      setFriendsData(updatedFriends);
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        // Get the current user's friends array
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const friendIds = userDoc.data()?.friends || [];

        if (friendIds.length === 0) {
          setFriendsData([]);
          setLoading(false);
          return;
        }

        // Fetch friend details
        const data = await fetchFriendsData(friendIds);
        setFriendsData(data);
        setLoading(false);
      };

      fetchData();
    }, [])
  );

  // Handle loading and empty states
  if (loading) {
    return <Text>Loading friends...</Text>;
  }

  if (friendsData.length === 0) {
    return <Text>You have no friends yet.</Text>;
  }

  // Render the friends list
  return (
    <FlatList
      data={friendsData}
      keyExtractor={(item) => item.uid}
      renderItem={({ item }) => (
        <View style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.status}>Name: {item.challengeName}</Text>
            <Text style={styles.status}>
              Days Completed: {item.daysCompleted}
            </Text>
          </View>
          <CircularProgress
            progress={((item.daysCompleted / 75) * 100).toFixed(0)}
            failed={false}
          />
          <TouchableOpacity
            onPress={() => removeFriend(item.uid)}
            style={styles.removeButton}
          >
            <Icon name="close" size={20} color="red" />
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  friendCard: {
    flexDirection: "row", // Align info and button horizontally
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flex: 1, // Take up remaining space
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  status: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 5,
  },
});

export default FriendsList;
