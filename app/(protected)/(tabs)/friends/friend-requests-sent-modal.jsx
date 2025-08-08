import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { auth, db } from "../../../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons"; // For checkmark and close icons

export default function FriendRequestsSent() {
  const router = useRouter();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const user = auth.currentUser;
      console.log("current user is ", user?.uid);

      try {
        const friendRequestsRef = collection(db, "friendRequests");
        const q = query(
          friendRequestsRef,
          where("from", "==", user?.uid),
          where("status", "==", "pending")
        );

        console.log("friend requests query: ", q);

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            console.log("Friend requests snapshot: ", snapshot.docs[0]?.data());
            const requests = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setFriendRequests(requests);
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

  const handleClose = () => {
    setModalVisible(false);
    router.back();
  };

  const handleAcceptRequest = async (requestId, fromUid) => {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, { status: "accepted" });
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      friends: arrayUnion(fromUid),
    });
    await updateDoc(doc(db, "users", fromUid), {
      friends: arrayUnion(auth.currentUser.uid),
    });
  };

  const handleRejectRequest = async (requestId) => {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, { status: "rejected" });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sent Friend Requests</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {friendRequests.length > 0 ? (
          friendRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <Text style={styles.requestText}>
                you sent {request.toUsername || "Unknown User"} a request
              </Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleRejectRequest(request.id)}
                  style={styles.actionButton}
                >
                  <Icon name="close" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No pending friend requests</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff", // Solid white background for full-screen modal
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  requestCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  requestText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
});
