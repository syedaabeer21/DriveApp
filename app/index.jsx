import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../config/firebase/firebaseConfig";
import Map from "../components/Map";
import RideScreen from "../components/RideScreen";
import { signOut } from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons"; // Icons for header branding
import { Feather } from "@expo/vector-icons"; // Icons for logout button


export default function Index() {
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        console.log(uid);
      } else {
        router.push('/login');
      }
    });
  }, [])
    const logout =() =>{
      signOut(auth).then(() => {
        alert("logout Successfully")
      }).catch((error) => {
        
      });
    }
  
  ;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="directions-car" size={26} color="white" />
          <Text style={styles.t}>Drive</Text>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    </View>
      <View style={styles.mapContainer}>
        <Map />
      </View>
      <View style={styles.rideContainer}>
        <RideScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'purple',
    elevation: 5, // Shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
 logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  t: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8, // Space between icon & text
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ff4757",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  mapContainer: {
    flex: 0.5, 
  },
  rideContainer: {
    flex: 0.5, 
    backgroundColor: '#fff', 
  },
 
  
});