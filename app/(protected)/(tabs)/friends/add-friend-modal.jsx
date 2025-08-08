import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Alert } from "react-native";
import { db } from "../../../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
  arrayUnion,
  updateDoc,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../../../firebaseConfig";

export default function AddFriendModal() {
  const router = useRouter();
  const [searchUsername, setSearchUsername] = useState("");

  const checkDuplicateRequest = async (targetUid) => {
    const currentUid = auth.currentUser.uid;
    const q = query(
      collection(db, "friendRequests"),
      where("from", "==", currentUid),
      where("to", "==", targetUid),
      where("status", "==", "pending")
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty; // Returns true if a pending request exists
  };

  const checkExistingFriend = async (targetUid) => {
    const currentUid = auth.currentUser.uid;
    const userRef = doc(db, "users", currentUid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const friends = userSnap.data().friends || [];
      return friends.includes(targetUid); // Returns true if targetUid is in friends array
    }
    return false; // Return false if document doesn't exist
  };

  const handleSearchFriend = async () => {
    if (!searchUsername.trim()) {
      Alert.alert("Error", "Please enter a username to search.");
      return;
    }

    console.log(`Searching for user: ${searchUsername}`);
    Alert.alert("Add Friend", `Add ${searchUsername} as a friend?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add",
        onPress: async () => {
          try {
            console.log("Searching for user in Firestore");
            const usersRef = collection(db, "users");
            console.log("usersRef:", usersRef);

            const q = query(
              usersRef,
              orderBy("username"),
              startAt(searchUsername),
              endAt(searchUsername + "\uf8ff")
            );
            //TODO: BUG FIX: counts w or whi or whif as whiff
            console.log("query:", q);

            const querySnapshot = await getDocs(q);
            console.log("Query snapshot:", querySnapshot);

            const results = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("Results:", results);

            if (results.length === 0) {
              console.log(`No user found with username: ${searchUsername}`);
              Alert.alert("Error", "No user found with that username.");
              router.back();
              return;
            }

            //const userId = await AsyncStorage.getItem("userId");

            const user = auth.currentUser;
            console.log("user is ", user);
            const userId = user.uid;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            const username = userSnap.data().username;
            console.log("Username:", username);

            const friendRequestsRef = collection(db, "friendRequests");

            //TODO: Not being able to add yourself as a friend

            if (results[0].id === userId) {
              console.log("Cannot add yourself as a friend!");
              Alert.alert("Error", "You cannot add yourself as a friend.");
              router.back();
              return;
            }

            // Check if the user is already a friend
            if (await checkExistingFriend(results[0].id)) {
              console.log("User is already a friend!");
              Alert.alert("Error", "You are already friends with this user.");
              router.back();
              return;
            }

            // Check if a friend request already exists
            if (await checkDuplicateRequest(results[0].id)) {
              console.log("Duplicate request exists!");
              Alert.alert(
                "Error",
                "You have already sent a friend request to this user."
              );
              router.back();
              return;
            }

            console.log("fr ref", friendRequestsRef);
            await addDoc(friendRequestsRef, {
              from: userId,
              fromUsername: username,
              to: results[0].id,
              toUsername: searchUsername,
              status: "pending",
              createdAt: serverTimestamp(),
            });

            console.log(`Sent friend request: ${searchUsername}`);
            setSearchUsername("");
            router.back(); // Dismiss the modal
          } catch (error) {
            console.error("Error searching for user:", error);
            Alert.alert("Error", `Failed to search: ${error.message}`);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true} // Controlled by the router
      onRequestClose={() => router.back()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add a Friend</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter username..."
              placeholderTextColor="#666"
              value={searchUsername}
              autoCapitalize="none"
              onChangeText={setSearchUsername}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchFriend}
            >
              <Text style={styles.searchButtonText}>Add Friend</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    width: "85%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    alignItems: "center",
  },
  searchInput: {
    width: "70%",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
