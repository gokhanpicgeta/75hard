import { Stack } from "expo-router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { signInWithCustomToken } from "firebase/auth";

export default function RootLayout() {
  const router = useRouter();
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        console.log("Firebase auth at start:", auth);

        const savedToken = await AsyncStorage.getItem("userToken");
        const savedUserId = await AsyncStorage.getItem("userId");

        console.log("Raw stored token:", savedToken);
        console.log("Raw stored userId:", savedUserId);

        const storedToken = savedToken ? JSON.parse(savedToken) : null;
        const storedUserId = savedUserId ? JSON.parse(savedUserId) : null;

        console.log("Parsed token:", storedToken);
        console.log("Parsed userId:", storedUserId);

        if (!storedToken || !storedUserId) {
          console.log("No stored credentials, redirecting to login");
          router.replace("/");
          return;
        }

        const user = await new Promise((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(
              "onAuthStateChanged fired with user:",
              currentUser?.uid
            );
            unsubscribe();
            resolve(currentUser);
          });
        });

        console.log("Firebase user after waiting:", user?.uid);

        if (user && user.uid === storedUserId) {
          console.log("User session restored via Firebase");
          router.replace("/(tabs)/tracker");
        } else {
          console.log("No valid session in Firebase, clearing stored data");
          await AsyncStorage.setItem("sessionExpired", "true");
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem("user");
          router.replace("/");
        }
      } catch (error) {
        console.error("Error in checkAuthState:", error.message);
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userId");
        await AsyncStorage.removeItem("user");
        router.replace("/");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Auth state changed, user logged in:", user.uid);
        router.replace("/(tabs)/tracker");
      } else {
        console.log("Auth state changed, no user");
        checkAuthState();
      }
    });

    checkAuthState();

    return () => unsubscribe();
  }, [router]);
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="task-list" options={{ title: "Task List" }} />
    </Stack>
  );
}
