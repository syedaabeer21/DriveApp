import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9qsN6TZD6revRb6amGz8YRMKfjPcmobU",
  authDomain: "driveapp-101b3.firebaseapp.com",
  projectId: "driveapp-101b3",
  storageBucket: "driveapp-101b3.firebasestorage.app",
  messagingSenderId: "43883412847",
  appId: "1:43883412847:web:9728ec5e77846b0f4bbc9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { db };