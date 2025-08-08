import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CircularProgress from "./CircularProgressBar";

// Constants for the challenge
const TOTAL_DAYS = 75;

const CurrentAttemptCard = ({ attempt }) => {
  // Parse start date from timestamp
  const dateObj = new Date(parseInt(attempt.startDate, 10));
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // 0-based, so add 1
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // Calculate completion percentage
  const completionPercentage = (
    (attempt.daysCompleted / TOTAL_DAYS) *
    100
  ).toFixed(0);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Attempt #{attempt.attemptNumber}</Text>
      <Text>{attempt.name}</Text>
      <View style={styles.statRow}>
        <Text style={styles.label}>Days Completed:</Text>
        <Text style={styles.value}>
          {attempt.daysCompleted}/{TOTAL_DAYS}
        </Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Progress:</Text>
        <CircularProgress progress={completionPercentage} failed={false} />
      </View>
      <View style={styles.statRow}>
        <Text style={styles.label}>Started On:</Text>
        <Text style={styles.value}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
});

export default CurrentAttemptCard;
