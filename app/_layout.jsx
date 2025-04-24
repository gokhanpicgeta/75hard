import {Stack} from 'expo-router'

export default function RootLayout(){
    return(
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown:false}} />
            <Stack.Screen name="index" options={{title: "Home"}} />
            <Stack.Screen name="task-list" options={{title: "Task List"}} />
         </Stack>
    )
}