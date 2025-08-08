import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Progress from "./daily-progress";
import Calendar from "./calendar";
import TabOneScreen from "./one";
import TabTwoScreen from "./two";

export default function TrackerScreen() {
  const [index, setIndex] = useState(0);

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={["Progress", "Calendar"]}
        selectedIndex={index}
        onChange={(e) => {
          setIndex(e.nativeEvent.selectedSegmentIndex);
          //tab = e.nativeEvent.value.toLowerCase();
        }}
        style={styles.segment}
      />
      {index === 0 ? <Progress /> : <Calendar setIndex={setIndex} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  segment: { margin: 16 },
});
