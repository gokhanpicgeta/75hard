import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, createContext, useEffect } from "react";
import { SplashScreen } from "expo-router";
const authStorageKey = "auth-key";

SplashScreen.preventAutoHideAsync();

export const AuthContext = createContext({
  isLoggedIn: false,
  logIn: () => {},
  logOut: () => {},
  isReady: false,
  activeChallenge: false,
  toggleActiveChallenge: () => {},
});

export function AuthProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(false);

  const storeAuthState = async (newState) => {
    try {
      const jsonValue = JSON.stringify(newState);
      await AsyncStorage.setItem(authStorageKey, jsonValue);
    } catch (e) {
      console.log("Error storing auth state", e);
    }
  };

  const logIn = async () => {
    setIsLoggedIn(true);
    try {
      const currRaw = await AsyncStorage.getItem("currentAttempt");
      const curr = JSON.parse(currRaw) || null;
      console.log("current attempt", curr);
      const bool = curr ? true : false;
      setActiveChallenge(bool);
      console.log("bool", bool);
      storeAuthState({ isLoggedIn: true, activeChallenge: bool });
    } catch (e) {
      console.log("Error getting current attempt", e);
    }
  };

  const logOut = async () => {
    setIsLoggedIn(false);
    storeAuthState({ isLoggedIn: false, activeChallenge: activeChallenge });
    await AsyncStorage.clear();
  };

  const toggleActiveChallenge = () => {
    setActiveChallenge((prev) => !prev);
    storeAuthState({ activeChallenge: !activeChallenge });
  };

  useEffect(() => {
    const loadAuthStateFromStorage = async () => {
      //TODO
      try {
        const authFromStorage = await AsyncStorage.getItem(authStorageKey);
        if (authFromStorage !== null) {
          const authState = JSON.parse(authFromStorage);
          setIsLoggedIn(authState.isLoggedIn);
          setActiveChallenge(authState.activeChallenge);
        }
      } catch (e) {
        console.log("Error loading auth state from storage", e);
      }
      setIsReady(true);
    };
    loadAuthStateFromStorage();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        activeChallenge,
        logIn,
        logOut,
        toggleActiveChallenge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
