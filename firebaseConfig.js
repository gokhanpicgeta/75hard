import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';




const firebaseConfig = {
    apiKey: "AIzaSyCKIHXS8n5eshPh7HxvZWLkoTO_Cd8r744",
    authDomain: "challenge-d0c05.firebaseapp.com",
    projectId: "challenge-d0c05",
    storageBucket: "challenge-d0c05.firebasestorage.app",
    messagingSenderId: "507423046380",
    appId: "1:507423046380:web:59b5e2b9bb069d473083c9",
    measurementId: "G-EL4XEL5DP1"
  };
  

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(firebaseApp);
//const auth = getAuth(firebaseApp);
const auth = initializeAuth(firebaseApp,{
  persistence: getReactNativePersistence(AsyncStorage)
})

// Export the initialized services
export { firebaseApp, db, auth };
