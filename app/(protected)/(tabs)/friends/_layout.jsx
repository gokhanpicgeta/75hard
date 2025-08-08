import { Stack } from "expo-router";

export default function FriendLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-friend-modal"
        options={{
          presentation: "transparentModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="friend-requests-recieved-modal"
        options={{
          presentation: "modal",
          headerShown: false,
          title: "Friend Requests Received",
        }}
      />
      <Stack.Screen
        name="friend-requests-sent-modal"
        options={{
          presentation: "modal",
          headerShown: false,
          title: "Friend Requests Sent",
        }}
      />
    </Stack>
  );
}
