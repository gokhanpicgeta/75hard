import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CircularProgress from "./CircularProgressBar";

const AttemptCard = ({ attempt }) => {
  const dateObj = new Date(parseInt(attempt.startDate, 10));

  //TODO: A way to calculate days completed?

  // Extract day, month, and year

  const day = dateObj.getDate(); // Day of the month (1-31)
  const month = dateObj.getMonth() + 1; // Month (0-based, so add 1 for 1-12)
  const year = dateObj.getFullYear(); // Year (four digits)
  //console.log("loading attempt card", attempt, attempt.progress.length);
  const formattedDate = `${day}/${month}/${year}`;
  return (
    <View style={styles.card}>
      <TouchableOpacity>
        <View style={styles.attemptCardHeader}>
          <View style={styles.attemptCardTitle}>
            <Text style={styles.cardTitle}>
              Attempt {attempt.attemptNumber}
            </Text>
            <Text>{attempt.name}</Text>
          </View>
          <CircularProgress
            progress={Math.round((attempt.daysCompleted / 75) * 100, 3)}
            failed={true}
          />
        </View>
        <Text style={styles.cardDate}>Started on: {formattedDate}</Text>
        <Text>Days completed: {attempt.daysCompleted} </Text>

        {/*TODO: calculate how to display progress, probably the day number? */}
        {/*<Text style={styles.cardProgress}>Progress: {attempt.progress}%</Text>*/}
        {/* Add any additional key details here */}
      </TouchableOpacity>
    </View>
  );
};

const AttemptsCarousel = ({ attempts }) => {
  //console.log("LOADING CAROUSEL", attempts);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attempts History</Text>
      <FlatList
        data={attempts}
        horizontal={true}
        keyExtractor={(item) => item.attemptNumber.toString()}
        renderItem={({ item }) => <AttemptCard attempt={item} />}
        contentContainerStyle={styles.listContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default AttemptsCarousel;

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    width: 200, // fixed width so that cards don't span full width
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 3,
  },
  attemptCardHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  attemptCardTitle: {
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardProgress: {
    fontSize: 14,
    color: "#333",
  },
});
