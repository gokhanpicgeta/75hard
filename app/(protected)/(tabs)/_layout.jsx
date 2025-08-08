import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AuthContext } from "../../utils/authContext";
import { useState, useContext, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const authState = useContext(AuthContext);

  console.log("auth state: ", authState);
  // useEffect(() => {
  //   const getActiveChallenge = async () => {
  //     try {
  //       const challenge = await AsyncStorage.getItem("currentAttempt");
  //       setActiveChallenge(JSON.parse(challenge) || null);
  //     } catch (e) {
  //       console.error("Failed to load active challenge:", e);
  //     }
  //   };
  //   getActiveChallenge();
  // }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#f5f5f5", // Match your home screen background
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: "#333",
        },
        headerRight: () => (
          <Pressable
            style={({ pressed }) => [
              styles.logoutIcon,
              pressed && styles.iconPressed,
            ]}
            onPress={authState.logOut} // Placeholder for your logout function
            android_ripple={{ color: "#e0e0e0" }} // Subtle ripple for Android
            accessibilityLabel="Log out"
            accessibilityHint="Logs you out of the application"
          >
            <Icon
              name="logout"
              size={24}
              color="#666" // Subtle gray color
            />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="calendar" color={color} />
          ),
          href: authState.activeChallenge ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Social",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="users" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutIcon: {
    marginRight: Platform.OS === "ios" ? 15 : 12, // Consistent spacing
    padding: 8, // Ensure tappable area (min 44x44 dp for iOS, 48x48 dp for Android)
  },
  iconPressed: {
    opacity: 0.6, // Subtle press feedback for iOS
  },
});
