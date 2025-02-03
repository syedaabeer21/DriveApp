import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router";
import { auth } from "../config/firebase/firebaseConfig";
import Map from "../components/Map";
import RideScreen from "../components/RideScreen";
import { signOut } from "firebase/auth";


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
        alert("logout")
      }).catch((error) => {
        // An error happened.
      });
    }
  
  ;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.t}>riderApp</Text>
        <TouchableOpacity onPress={logout}><Text style={styles.t} >Logout</Text></TouchableOpacity>
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
    flexDirection: 'column', // Ensure vertical layout
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    backgroundColor:'blue',
  },
  t: {
    color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
  },
  mapContainer: {
    flex: 0.5, // 70% space for map
  },
  rideContainer: {
    flex: 0.5, // 30% space for ride booking
    backgroundColor: '#fff', // Optional: Add background color
  },
});