import { Stack } from "expo-router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { AuthProvider } from "./utils/authContext";

export default function RootLayout() {
  const router = useRouter();

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{ title: "Login", headerShown: false }}
        />
      </Stack>
    </AuthProvider>
  );
}
