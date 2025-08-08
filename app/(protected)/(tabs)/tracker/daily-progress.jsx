import { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../../../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../../../utils/authContext";

const DAILY_TASKS = [
  { id: "1", name: "Workout (45 min)" },
  { id: "2", name: "Drink 1 Gallon of Water" },
  { id: "3", name: "Read 10 Pages" },
  { id: "4", name: "Follow Diet Plan" },
  { id: "5", name: "Take Progress Picture" },
];

export default function Progress() {
  const [currentDay, setCurrentDay] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState([]);

  const authState = useContext(AuthContext);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      console.log("useFocusEffect triggered for Daily Progress tab");
      const loadData = async () => {
        console.log("loading daily progress");
        try {
          const challenge = await AsyncStorage.getItem("selectedChallenge");
          const storedTasks = await AsyncStorage.getItem("challenges");
          const savedCurrentAttempt = await AsyncStorage.getItem(
            "currentAttempt"
          );
          const savedAttemptNumber = await AsyncStorage.getItem(
            "attemptNumber"
          );
          const savedUser = await AsyncStorage.getItem("user");
          setUser(JSON.parse(savedUser));

          console.log("daily challengs are ", JSON.parse(storedTasks));
          //const savedCompletedDays = await AsyncStorage.getItem("completedDays");

          // console.log("saved current attempt", savedCurrentAttempt);
          // console.log("attempt number: ", savedAttemptNumber);
          console.log(
            "Day on task list load",
            JSON.parse(savedCurrentAttempt).currentDay
          );
          setCurrentDay(JSON.parse(savedCurrentAttempt).currentDay);
          //setCompletedDays(JSON.parse(savedCompletedDays));

          setTasks(
            storedTasks
              ? JSON.parse(storedTasks).map((task, index) => ({
                  id: index,
                  name: task,
                }))
              : []
          );

          setCurrentAttempt(JSON.parse(savedCurrentAttempt));
        } catch (e) {
          console.error("Failed to load data:", e);
        }
      };
      loadData();
    }, [])
  );

  useEffect(() => {
    console.log("currentDay updated to:", currentDay);
  }, [currentDay]);

  useEffect(() => {
    const saveProgress = async () => {
      try {
        if (currentAttempt) {
          //console.log("setting current attempt", currentAttempt);
          await AsyncStorage.setItem(
            "currentAttempt",
            JSON.stringify(currentAttempt)
          );

          await updateDoc(doc(db, "users", user.uid), {
            currentAttempt: currentAttempt,
          });
        }
      } catch (e) {
        console.error("Failed to save progress:", e);
      }
    };
    saveProgress();
  }, [currentAttempt]);

  const toggleTask = (taskId) => {
    setCurrentAttempt((prevCurrentAttempt) => {
      //console.log("prev current attempt", prevCurrentAttempt.progress[0]);
      const updatedProgress = prevCurrentAttempt.progress;
      console.log("Updated progress", updatedProgress[0]);

      const currentDayTasks = updatedProgress[currentDay];
      //? { ...updatedProgress[currentDay] }
      //: {};

      currentDayTasks[taskId] = !currentDayTasks[taskId];
      console.log("taskId currdayTasks", taskId, currentDayTasks);
      const isComplete = currentDayTasks.every((task) => task === true);
      console.log("is complete", isComplete);

      const prevCompletedDays = prevCurrentAttempt.isDaysComplete;

      prevCompletedDays[currentDay] = isComplete;

      const updatedCompletedDays = prevCompletedDays;

      const countCompletedDays = () => {
        return updatedCompletedDays.reduce(
          (count, isComplete) => count + (isComplete ? 1 : 0),
          0
        );
      };

      updatedProgress[currentDay] = currentDayTasks;

      return {
        ...prevCurrentAttempt,
        progress: updatedProgress,
        isDaysComplete: updatedCompletedDays,
        daysCompleted: countCompletedDays(),
      };
    });

    /*
    setProgress((prev) => ({
      ...prev,
      [currentDay]: {
        ...prev[currentDay],
        [taskId]: !prev[currentDay]?.[taskId],
      },
    }));
    */
  };

  const goBack = () => {
    if (currentDay > 0) {
      setCurrentAttempt((prevCurrentAttempt) => {
        return {
          ...prevCurrentAttempt,
          currentDay: currentDay - 1,
        };
      });
      setCurrentDay(currentDay - 1);
    }
  };

  const goForward = () => {
    if (currentDay < 74) {
      setCurrentAttempt((prevCurrentAttempt) => {
        return {
          ...prevCurrentAttempt,
          currentDay: currentDay + 1,
        };
      });
      setCurrentDay(currentDay + 1);
    }
  };

  //TODO: Logic for failing challenge. Add challenge to prev attempts, set current attempt to null, maybe send user back
  // to home screen if current attempt is null?
  const failedChallenge = async () => {
    console.log("Challenge failed!");

    const savedPrevAttempts = await AsyncStorage.getItem("prevAttempts");
    const attemptNumber = JSON.parse(
      await AsyncStorage.getItem("attemptNumber")
    );
    const prevAttempts = JSON.parse(savedPrevAttempts);

    const updatedPrevAttempts = [...(prevAttempts || []), currentAttempt];
    await AsyncStorage.setItem(
      "prevAttempts",
      JSON.stringify(updatedPrevAttempts)
    );
    setCurrentAttempt(null);
    await AsyncStorage.setItem("currentAttempt", JSON.stringify(null));
    await updateDoc(doc(db, "users", user.uid), {
      prevAttempts: updatedPrevAttempts,
    });
    await updateDoc(doc(db, "users", user.uid), {
      currentAttempt: null,
    });

    authState.toggleActiveChallenge();

    router.replace("/");
    console.log("Updated prevAttempts", updatedPrevAttempts);
    //setCurrentAttempt(null)
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          disabled={currentDay === 0}
          style={styles.navButton}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={currentDay === 0 ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
        <Text style={styles.dayHeader}>Day {currentDay + 1} of 75</Text>
        <TouchableOpacity
          onPress={goForward}
          disabled={currentDay === 74}
          style={styles.navButton}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={currentDay === 74 ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.taskItem,
              currentAttempt?.progress?.[currentDay]?.[item.id] &&
                styles.taskCompleted,
            ]}
            onPress={() => toggleTask(item.id)}
          >
            <Text style={styles.taskText}>{item.name}</Text>
            <View style={styles.checkbox}>
              <Text style={styles.checkboxText}>
                {currentAttempt?.progress?.[currentDay]?.[item.id] ? "✓" : ""}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.taskList}
      />

      <LinearGradient
        // Define your gradient colors. Adjust the colors to fit your design.
        colors={["#e3121d", "#d11f29"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.failedButtonGradient}
      >
        <TouchableOpacity onPress={failedChallenge} style={styles.failedButton}>
          <Text style={styles.failedButtonText}>Fail Challenge</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light gray background
    paddingTop: 20, // More top padding for status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayHeader: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  navButton: {
    padding: 10,
  },
  taskList: {
    padding: 15,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  taskCompleted: {
    backgroundColor: "#e6f7e6", // Light green when done
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    flex: 1, // Allows text to wrap nicely
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
  checkboxText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
  failedButtonGradient: {
    borderRadius: 8,
    margin: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  failedButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  failedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
