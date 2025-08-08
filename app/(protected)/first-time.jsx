import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const firstLaunch = await AsyncStorage.getItem("isFirstTime");
        const challenge = await AsyncStorage.getItem("selectedChallenge");
        if (firstLaunch === null) {
          await AsyncStorage.setItem("isFirstTime", "false");
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
          setSelectedChallenge(challenge || "75 Hard");
        }
      } catch (e) {
        console.error("Failed to check first launch:", e);
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  const selectChallenge = async (challenge) => {
    try {
      await AsyncStorage.setItem("selectedChallenge", challenge);
      setSelectedChallenge(challenge);
      setIsFirstLaunch(false);

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

  const resetFirstLaunch = async () => {
    try {
      await AsyncStorage.clear();
      setIsFirstLaunch(true);
      setSelectedChallenge(null);
    } catch (e) {
      console.error("Failed to reset:", e);
    }
  };

  if (isFirstLaunch === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Welcome to 75 Challenge</Text>
        <Text style={styles.subtitle}>Pick your challenge to begin:</Text>

        {/* 75 Hard Card */}
        <TouchableOpacity
          style={styles.challengeCard}
          onPress={() => selectChallenge("75 Hard")}
        >
          <LinearGradient
            colors={["#007AFF", "#00C4FF"]}
            style={styles.gradient}
          >
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
          onPress={() => selectChallenge("75 Soft")}
        >
          <LinearGradient
            colors={["#34C759", "#7ED957"]}
            style={styles.gradient}
          >
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

        {/* Debug Reset */}
        <TouchableOpacity onPress={resetFirstLaunch} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset to First Launch</Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {selectedChallenge}</Text>
      <Link href="/progress" style={styles.link}>
        <Text style={styles.linkText}>Go to Progress</Text>
      </Link>
      <TouchableOpacity onPress={resetFirstLaunch} style={styles.resetButton}>
        <Text style={styles.resetText}>Reset to First Launch</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5", // Softer gray background
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  cardLink: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  link: {
    marginTop: 20,
  },
  linkText: {
    fontSize: 18,
    color: "#007AFF",
    fontWeight: "500",
  },
  resetButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ff4444",
    borderRadius: 5,
    alignSelf: "center",
  },
  resetText: {
    color: "#fff",
    fontSize: 14,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginTop: 20,
  },
});
