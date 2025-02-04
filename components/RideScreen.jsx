import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, Text, Image, ScrollView, TouchableOpacity, Modal,Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation } from '../config/redux/reducers/locationSlice';
import carIcon from '../assets/icons/car.png';
import motorbikeIcon from '../assets/icons/motorbike.png';
import rickshawIcon from '../assets/icons/rickshaw.png';
import { db } from '../config/firebase/firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { auth } from '../config/firebase/firebaseConfig';
import { getAddressFromLatLng } from "../src/utils/getAddressFromLatLng";
import { serverTimestamp } from "firebase/firestore";
import { ActivityIndicator } from 'react-native'; 

export default function RideBookingScreen() {
    const [destination, setDestination] = useState('');
    const [predictions, setPredictions] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [distance, setDistance] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const dispatch = useDispatch();
    const selectedLocation = useSelector(state => state.location.location);
    const currentLocation = useSelector(state => state.location.currentLocation);

    const icons = [
        { id: 'car', name: 'Car', icon: carIcon, rate: 30 },
        { id: 'bike', name: 'Bike', icon: motorbikeIcon, rate: 15 },
        { id: 'rickshaw', name: 'Rickshaw', icon: rickshawIcon, rate: 20 },
    ];

    const apiKey = 'AlzaSyFAxj_bAiwc90VRMjwmpvA2vyxENVfscPx';

    const fetchAutocomplete = async (query) => {
        try {
            const response = await fetch(`https://maps.gomaps.pro/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`);
            const data = await response.json();

            setPredictions(data.results);
        } catch (error) {
            console.error('Error fetching autocomplete predictions:', error);
        }
    };

    const selectDestination = async (item) => {
        dispatch(setLocation(item.geometry.location));
        setDestination(item.name);
        setModalVisible(false);
        if (currentLocation) {
            calculateDistance(currentLocation, item.geometry.location);
        } else {
            console.error("Current location not available");
        }
    };

    const calculateDistance = async (originLocation, destinationLocation) => {
        try {
            if (!originLocation || !destinationLocation) {
                console.error("Invalid locations for distance calculation");
                return;
            }

            const origin = `${originLocation.lat},${originLocation.lng}`;
            const destination = `${destinationLocation.lat},${destinationLocation.lng}`;
            const response = await fetch(`https://maps.gomaps.pro/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`);
            const data = await response.json();

            console.log("Distance API Response:", data);

            if (data.status === "OK" && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];
                if (leg && leg.distance) {
                    const dist = leg.distance.value / 1000;
                    setDistance(dist);
                } else {
                    console.error("No distance data found in the response");
                }
            } else {
                console.error("Invalid response from distance API", data);
            }
        } catch (error) {
            console.error('Error calculating distance:', error);
        }
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
    };
    const handleBookRide = async () => {

        console.log("i m heree")
        console.log("Selected Vehicle:", selectedVehicle);
        console.log("Current Location:", currentLocation);
        console.log("Selected Location:", selectedLocation);
        if (!selectedVehicle || !currentLocation || !selectedLocation) {
          alert("Please select a vehicle and destination.");
          return;
        }

        setIsLoading(true); // Start loading
        const pickupAddress = await getAddressFromLatLng(currentLocation.lat, currentLocation.lng);
        const destinationAddress = await getAddressFromLatLng(selectedLocation.lat, selectedLocation.lng);
        const rideData = {
          userId: auth.currentUser.uid, 
          userEmail: auth.currentUser.email, 
          pickup: pickupAddress, 
          destination: destinationAddress, 
          currentLocation: {
            lat: currentLocation.lat,
            lng: currentLocation.lng,
          },
          destinationLocation: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
          },
          vehicleType: selectedVehicle.name,
          fare: Math.round(distance * selectedVehicle.rate),
          status: "pending", 
          createdAt: serverTimestamp(),
        };
        console.log("Ride Data:", rideData);
        try {
          const docRef = await addDoc(collection(db, "rides"), rideData);
          console.log("Ride booked with ID: ", docRef.id);
          Alert.alert("Ride Booked!", "Your ride is booked");
        } catch (error) {
          console.error("Error booking ride: ", error);
          alert("Failed to book ride. Please try again.");
        }
        finally {
          setIsLoading(false); // Stop loading after API response
      }
      };

    return (
        <View style={styles.container}>
            {/* Destination Input Field */}
            <TouchableOpacity style={styles.input} onPress={() => setModalVisible(true)}>
                <Text>{destination || "Select Destination"}</Text>
            </TouchableOpacity>

            {/* Destination Search Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Destination"
                        value={destination}
                        onChangeText={(text) => {
                            setDestination(text);
                            fetchAutocomplete(text);
                        }}
                    />
                    <ScrollView>
                        {predictions.map((item) => (
                            <TouchableOpacity key={item.place_id} onPress={() => selectDestination(item)}>
                                <Text>{item.name}</Text>
                                <Text>{item.formatted_address}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Button title="Close" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            {/* Select Vehicle Section */}
            <Text style={styles.heading}>Select Your Ride</Text>

            <FlatList
                data={icons}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.iconContainer,
                            selectedVehicle?.id === item.id && styles.selectedIcon,
                        ]}
                        onPress={() => handleSelectVehicle(item)}
                    >
                        <Image source={item.icon} style={styles.iconImage} />
                        <Text style={styles.iconName}>{item.name}</Text>
                        {/* Show fare if distance is available */}
                        {distance !== null && (
                            <Text style={styles.fareText}>Rs {Math.round(distance * item.rate)}</Text>
                        )}
                    </TouchableOpacity>
                )}
            />

            {/* Book Ride Button */}
            <View style={styles.bookButtonContainer}>
            <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookRide}
                disabled={isLoading} // Disable button while loading
            >
                {isLoading ? ( 
                    <ActivityIndicator size="small" color="white" /> // Show loader
                ) : (
                    <Text style={styles.bookButtonText}>Book Ride</Text>
                )}
            </TouchableOpacity>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
      justifyContent: 'flex-end', 
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 20,
      paddingHorizontal: 10,
      justifyContent: 'center',
      borderRadius: 10,
    },
    modalContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    iconContainer: {
      alignItems: 'center',
      padding: 0,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 10,
      marginHorizontal: 10,
      width: 100,
      justifyContent: 'center',
      flexDirection: 'column',
      height: 120,
      marginBottom: 10,
    },
    selectedIcon: {
      borderColor: 'blue',
      borderWidth: 2,
    },
    iconImage: {
      width: 60,
      height: 60,
      resizeMode: 'contain',
    },
    iconName: {
      marginTop: 1,
      fontSize: 14,
      fontWeight: 'bold',
    },
    fareText: {
      marginTop: 5,
      fontSize: 14,
      fontWeight: 'bold',
      color: 'green',
    },
    bookButtonContainer: {
      marginTop: 0,
      paddingHorizontal: 20,
    },
    bookButton: {
      backgroundColor: 'purple',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    bookButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });