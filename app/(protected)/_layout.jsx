import { Redirect, Stack } from "expo-router";
import { useContext, useEffect } from "react";
import { AuthContext } from "../utils/authContext";

export default function ProtectedLayout() {
  const authState = useContext(AuthContext);

  if (!authState.isReady) {
    return null; // Optionally, you can show a loading spinner here
  }

  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
