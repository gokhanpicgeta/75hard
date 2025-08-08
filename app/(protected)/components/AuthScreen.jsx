import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { setDoc, doc } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const TOTAL_DAYS = 75;
  const TASKS_PER_DAY = 3; // 2 workouts + water

  const handleAuth = async () => {
    try {
      if (isSignup) {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await AsyncStorage.setItem("user", JSON.stringify(user));

        // const querySnapshot = await getDocs(collection(db, "users"));
        // querySnapshot.forEach((doc) => {
        //   console.log(`${doc.id} => ${doc.data()}`);
        // });

        // // Initialize user data in Firestore
        try {
          console.log("Attempting to write document");
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            username: username || email.split("@")[0],
            friends: [],
            currentAttempt: null,
            prevAttempts: null,
          });
          console.log("Document written and user signed up");
        } catch (e) {
          console.error("Error adding user: ", e);
        }
        Alert.alert("Success", "Account created! You are now logged in.");
      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        await AsyncStorage.setItem("user", JSON.stringify(user));
        await AsyncStorage.setItem("userToken", idToken);
        await AsyncStorage.setItem("userId", user.uid);
        // try {
        //   console.log("Attempting to write document");
        //   await setDoc(doc(db, "users", user.uid), {
        //     email: user.email,
        //     username: username || email.split("@")[0],
        //     friends: [],
        //     currentAttempt: null,
        //     prevAttempts: null,
        //   });
        //   console.log("Document written with");
        // } catch (e) {
        //   console.error("Error adding document: ", e);
        // }

        Alert.alert("Success", "Logged in successfully!");
      }
      router.replace("/(tabs)/");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isSignup ? "Sign Up" : "Log In"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {isSignup && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignup ? "Sign Up" : "Log In"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.toggleText}>
          {isSignup
            ? "Already have an account? Log In"
            : "Need an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleText: {
    color: "#007AFF",
    textAlign: "center",
    fontSize: 16,
  },
});

export default AuthScreen;
