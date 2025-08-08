import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AttemptsCarousel from "../components/AttemptCarousel";
import CurrentAttemptCard from "../components/CurrentAttempt";
import { db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

//TODO: Create a failed challenge button, create a dictionary of challenges that store the progress for each so they can be viewed later?
// I need a way to store which challenge is 75 hard, soft, or a custom challenge, so current attempt prolly needs more things than just days,
// maybe a key for a key-value task name, and the name of the challenge possibly.

export default function HomeScreen() {
  const [currentAttempt, setCurrentAttempt] = useState([]);
  const [prevAttempts, setPrevAttempts] = useState([]);
  const [user, setUser] = useState({});

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        //console.log("saved user is", JSON.parse(savedUser));
        if (savedUser != null) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          "currentAttempt",
          JSON.stringify(currentAttempt)
        );
      } catch (error) {
        console.error("Error saving current data in local storage:", error);
      }
    };
    saveData();
  }, [currentAttempt]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        console.log("loading data home screen");
        console.log("Current user is: ", user);

        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          console.log("snapshot of data is", snap.data());
          setCurrentAttempt(snap.data().currentAttempt);
          setPrevAttempts(snap.data().prevAttempts);
          //setProfile(snap.data());
        } else {
          console.warn("User doc not found in Firestore");
        }

        // const savedCurrentAttempt = await AsyncStorage.getItem(
        //   "currentAttempt"
        // );
        // const savedPrevAttempts = await AsyncStorage.getItem("prevAttempts");
        //setPrevAttempts(JSON.parse(savedPrevAttempts));
        //console.log("current Attempt", JSON.parse(savedCurrentAttempt));

        //setCurrentAttempt(JSON.parse(savedCurrentAttempt));
        // setAttempts(JSON.parse(attemptsData))
        //console.log("home screen current attempt data", currentAttempt);
      };
      loadData();
    }, [user])
  );

  const startNewChallenge = async (challenge) => {
    try {
      await AsyncStorage.setItem("selectedChallenge", challenge);

      if (challenge === "75 Hard") {
        console.log(
          "75 hard is chosen, now store list of challenges in async storage"
        );

        await AsyncStorage.setItem(
          "challenges",
          JSON.stringify([
            "45 minute Outdoor workout",
            "Additional 45 minute Outdoor/Indoor workout",
            "1 gallon of water",
            "Reading 10 pages of a non fiction book",
            "Take a progress picture",
          ])
        );
      } else if (challenge === "75 Soft") {
        console.log(
          "75 soft is chosen, now store list of challenges in async storage"
        );
        await AsyncStorage.setItem(
          "challenges",
          JSON.stringify([
            "45 minute workout",
            "3 Liters of water",
            "Reading 10 pages of any book",
            "Take a progress picture",
          ])
        );
      }

      router.push("/task-list");
    } catch (e) {
      console.error("Failed to save challenge:", e);
    }
  };

  if (currentAttempt) {
    return (
      <ScrollView>
        <CurrentAttemptCard attempt={currentAttempt} />
        <View style={styles.attemptsBox}>
          <AttemptsCarousel attempts={prevAttempts} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <LinearGradient
        colors={["#ff5f6d", "#ffc371"]}
        style={styles.startChallengeHeader}
      >
        <Text style={styles.startChallengeText}>Start new challenge</Text>
      </LinearGradient>
      {/* 75 Hard Card */}
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => startNewChallenge("75 Hard")}
      >
        <LinearGradient colors={["#007AFF", "#00C4FF"]} style={styles.gradient}>
          <Text style={styles.cardTitle}>75 Hard</Text>
          <Text style={styles.cardDetails}>
            💪 2 Workouts (45 min each, 1 outdoor){"\n"}
            💧 1 Gallon of Water{"\n"}
            🍽️ Follow a Diet (No Cheat Meals){"\n"}
            📖 Read 10 Pages (Non-Fiction){"\n"}
            📸 Take a Progress Picture
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* 75 Soft Card */}
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => startNewChallenge("75 Soft")}
      >
        <LinearGradient colors={["#34C759", "#7ED957"]} style={styles.gradient}>
          <Text style={styles.cardTitle}>75 Soft</Text>
          <Text style={styles.cardDetails}>
            🏋️ 1 Workout (45 min){"\n"}
            🥗 Eat Well (1 Cheat Meal Allowed){"\n"}
            💦 Drink 3L of Water{"\n"}
            📚 Read 10 Pages (Any Book){"\n"}
            📷 Take a Progress Picture
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* Custom Challenge Option */}
      <TouchableOpacity
        style={styles.customButton}
        onPress={() => selectChallenge("Custom")}
      >
        <Text style={styles.customButtonText}>Create Custom Challenge</Text>
      </TouchableOpacity>
      {/* Display stats, a running catalog of attempts,  */}
      <View style={styles.attemptsBox}>
        <AttemptsCarousel attempts={prevAttempts} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  startChallengeHeader: {
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
  startChallengeText: {
    fontSize: 20,
  },
  challengeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden", // Ensures gradient stays within rounded corners
    elevation: 6, // Deeper Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  gradient: {
    padding: 25,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 15,
    textShadowColor: "rgba(0, 0, 0, 0.2)", // Subtle text shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardDetails: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    opacity: 0.9, // Slightly faded for contrast
  },
  customButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  customButtonText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "600",
  },
  attemptsBox: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingTop: 10,
  },
});
