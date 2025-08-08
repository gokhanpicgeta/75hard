import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { AuthContext } from "../utils/authContext";

export default function TaskList() {
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [tasks, setTasks] = useState([]); // Renamed from challenges for clarity
  const [newTask, setNewTask] = useState("");
  const [prevAttempts, setPrevAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState([]);
  const [attemptNumber, setAttemptNumber] = useState(0);

  const authState = useContext(AuthContext);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const challenge = await AsyncStorage.getItem("selectedChallenge");
        const storedTasks = await AsyncStorage.getItem("challenges");
        const prevAttemptsData = await AsyncStorage.getItem("prevAttempts");
        const currentAttemptData = await AsyncStorage.getItem("currentAttempt");
        const attemptNumberData = await AsyncStorage.getItem("attemptNumber");

        setPrevAttempts(JSON.parse(prevAttemptsData) || {});
        setCurrentAttempt(JSON.parse(currentAttemptData) || []);
        setAttemptNumber(JSON.parse(attemptNumberData) || 0);
        setSelectedChallenge(challenge || "75 Hard");

        setTasks(
          storedTasks
            ? JSON.parse(storedTasks).map((task, index) => ({
                id: index, // Add IDs to existing tasks
                name: task,
              }))
            : []
        );
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    };
    loadData();
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [
        ...tasks,
        { id: tasks.length, name: newTask.trim() },
      ];
      setTasks(updatedTasks);
      setNewTask("");
      saveTasks(updatedTasks);
    }
  };

  const saveTasks = async (tasks) => {
    try {
      // Store only the names in "challenges" to match index.jsx
      console.log("Updated tasks", tasks);
      await AsyncStorage.setItem(
        "challenges",
        JSON.stringify(tasks.map((task) => task.name))
      );
    } catch (e) {
      console.error("Failed to save tasks:", e);
    }
  };

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>{item.name}</Text>
      <View style={styles.checkbox}>
        {/* Placeholder for future toggle functionality */}
        <Ionicons name="checkmark" size={16} color="transparent" />
      </View>
    </View>
  );

  const startChallenge = async () => {
    try {
      //TODO: Fix attempt number when switching accounts
      const newAttemptNumber = attemptNumber + 1;
      setAttemptNumber(newAttemptNumber);

      const tempProgress = {};

      for (let i = 0; i < 75; i++) {
        tempProgress[i] = [];
        for (let j = 0; j < tasks.length; j++) {
          tempProgress[i].push(false);
        }
      }

      console.log(
        "initial temp progress",
        tempProgress,
        tempProgress.length,
        tempProgress[0].length
      );

      const savedUser = await AsyncStorage.getItem("user");
      const user = JSON.parse(savedUser);
      const userRef = doc(db, "users", user.uid);

      const attempt = {
        progress: tempProgress,
        name: selectedChallenge,
        startDate: Date.now().toString(),
        id_to_task: tasks,
        attemptNumber: newAttemptNumber,
        isDaysComplete: Array(75).fill(false),
        daysCompleted: 0,
        currentDay: 0,
      };

      await setDoc(
        userRef,
        { attempts: attemptNumber + 1, currentAttempt: attempt },
        { merge: true }
      );

      await AsyncStorage.setItem("currentAttempt", JSON.stringify(attempt));

      await AsyncStorage.setItem(
        "attemptNumber",
        JSON.stringify(newAttemptNumber)
      );

      authState.toggleActiveChallenge();
      // setCurrentAttempt({
      //   progress: [],
      //   name: selectedChallenge,
      //   startDate: Date.now().toString(),
      //   id_to_task: tasks,
      //   attemptNumber: newAttemptNumber,
      // });

      router.push("./(tabs)/tracker/daily-progress");
    } catch (e) {
      console.error("error starting challenge", e);
    }
  };

  const gradientColors =
    selectedChallenge === "75 Hard"
      ? ["#007AFF", "#00C4FF"]
      : ["#34C759", "#7ED957"];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={gradientColors} style={styles.header}>
        <Text style={styles.headerTitle}>{selectedChallenge} Tasks</Text>
      </LinearGradient>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a custom task (e.g., Meditate 10 min)"
          placeholderTextColor="#999"
          value={newTask}
          onChangeText={setNewTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startChallenge}>
        <LinearGradient
          colors={["#34C759", "#7ED957"]}
          style={styles.startButtonGradient}
        >
          <Text style={styles.startButtonText}>Start Challenge</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  taskList: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    elevation: 2,
  },
  input: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  startButton: {
    margin: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  startButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
});
