import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const Day = ({ day, isCurrentDay = false, isCompleted = false, onPress }) => {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.dayCircle,
          isCurrentDay && styles.currentDay,
          isCompleted && styles.completedDay,
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.dayText,
            isCurrentDay && styles.currentDayText,
            isCompleted && styles.completedDayText,
          ]}
        >
          {day}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Calendar = ({ attempt }) => {
  const [currentAttempt, setCurrentAttempt] = useState({});
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const savedCurrentAttempt = await AsyncStorage.getItem(
          "currentAttempt"
        );
        console.log(JSON.parse(savedCurrentAttempt).currentDay);
        setCurrentAttempt(JSON.parse(savedCurrentAttempt));
      };
      loadData();
    }, [])
  );

  const renderDay = ({ item, index }) => {
    const dayNumber = index + 1;
    const isCurrentDay = dayNumber === currentAttempt.currentDay + 1;
    const isComplete = currentAttempt.isDaysComplete[index];
    //console.log(index, currentAttempt.isDaysComplete[index]);

    return (
      <Day
        day={dayNumber}
        isCurrentDay={isCurrentDay}
        isCompleted={isComplete}
        onPress={() => handleDayClick(index)}
      />
    );
  };

  const handleDayClick = async (dayNumber) => {
    try {
      const updatedAttempt = await new Promise((resolve) => {
        setCurrentAttempt((prevCurrentAttempt) => {
          const newAttempt = {
            ...prevCurrentAttempt,
            currentDay: dayNumber,
          };
          resolve(newAttempt);
          return newAttempt;
        });
      });

      await AsyncStorage.setItem(
        "currentAttempt",
        JSON.stringify(updatedAttempt)
      );

      router.replace("daily-progress");
    } catch (error) {
      console.error("Error in handleDayClick:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Day {currentAttempt.currentDay + 1} </Text>
      <FlatList
        data={currentAttempt.isDaysComplete}
        numColumns={7}
        keyExtractor={(item, index) => index}
        renderItem={renderDay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "violet",
    textAlign: "center",
    marginVertical: 20,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#899",
    justifyContent: "center",
    alignItems: "center",
    margin: 7,
  },
  currentDay: {
    backgroundColor: "#800080", // Purple for current day
  },
  completedDay: {
    backgroundColor: "#00FF00", // Green for completed days
  },
  dayText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  currentDayText: {
    color: "#fff",
  },
  completedDayText: {
    color: "#000",
  },
});

export default Calendar;
