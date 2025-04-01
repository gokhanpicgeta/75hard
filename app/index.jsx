import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Link} from 'expo-router'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Welcome to the 75 hard challenge </Text>
      <Link href="/about">Go to About Screen</Link>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
