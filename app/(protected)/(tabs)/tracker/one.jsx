// app/(top-tabs)/index.tsx
import { StyleSheet, Text, View } from "react-native";

export default function TabOneScreen() {
  {
    console.log("Rendering TabOneScreen in Tab One");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
