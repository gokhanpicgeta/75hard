import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="daily-progress" options={{ title: "Daily Tracker" }} />
      <Tabs.Screen name="calendar" options={{ title: "Progress" }} />
    </Tabs>
  );
}
