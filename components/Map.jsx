import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActivityIndicator, Button, StyleSheet, View, Text } from 'react-native';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentLocation } from '../config/redux/reducers/locationSlice';

export default function Map() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const mapRef = useRef(null); // 
  const dispatch = useDispatch();

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        dispatch(
          setCurrentLocation({
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          })
        );
        setLocation(currentLocation);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Unable to fetch current location');
        setLoading(false);
      }
    }

    getCurrentLocation();
  }, []);

  const destinationLocation = useSelector((state) => state.location.location);

  useEffect(() => {
    if (location && destinationLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.coords.latitude, longitude: location.coords.longitude },
          { latitude: destinationLocation.lat, longitude: destinationLocation.lng }
        ],
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true }
      );
    }
  }, [location, destinationLocation]); 


  const decodePolyline = (encoded) => {
    if (!encoded) {
        console.error("Encoded polyline is empty!");
        return [];
    }

    let points = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlat = result & 1 ? ~(result >> 1) : result >> 1;
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        let dlng = result & 1 ? ~(result >> 1) : result >> 1;
        lng += dlng;

        points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    console.log("Decoded Polyline Points:", points); // 
    return points;
};



  const getDirection = async () => {
    if (!location || !destinationLocation) {
      console.error('Location or destination not available');
      return;
    }

    const origin = `${location.coords.latitude},${location.coords.longitude}`;
    const destination = `${destinationLocation.lat},${destinationLocation.lng}`;
    const apiKey = 'AlzaSygG7UsMwA2DOhQ5P588iErobS8CHcarI0g'; 
    const url = `https://maps.gomaps.pro/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      
      console.log("Full API Response:", JSON.stringify(json, null, 2)); // 
  
      if (json.routes && json.routes.length > 0) {
          console.log("Overview Polyline:", JSON.stringify(json.routes[0].overview_polyline, null, 2));
  
          if (json.routes[0].overview_polyline && json.routes[0].overview_polyline.points) {
              console.log("Polyline Points Found!");
              setEncodedPolyline(json.routes[0].overview_polyline.points);
          } else {
              console.error("Polyline exists but 'points' field is missing", json.routes[0].overview_polyline);
          }
      } else {
          console.error("No valid routes found in API response.");
      }
  } catch (error) {
      console.error("Error fetching directions:", error);
  }
  
  };

  
  const getInitialRegion = () => {
    if (!location) return null;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
  };

  return (
    <View style={styles.container}>
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {loading && <ActivityIndicator size="large" color="blue" style={styles.indicator} />}
      {location && (
        <MapView
         ref={mapRef} 
          style={styles.map}
          initialRegion={getInitialRegion()} 
        >
          {/* Current Location Marker */}
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={'My Location'}
            pinColor="red" // Custom marker color
          />

          {/* Destination Location Marker */}
          {destinationLocation && (
            <Marker
              coordinate={{
                latitude: destinationLocation.lat,
                longitude: destinationLocation.lng,
              }}
              title={'Destination'}
            />
          )}

          {/* Polyline for Directions */}
          {encodedPolyline && (
            <Polyline
              coordinates={decodePolyline(encodedPolyline)}
              strokeColor="#764abc"
              strokeWidth={6}
            />
          )}
        </MapView>
      )}
      <View style={styles.btn}>
        <Button onPress={getDirection} title="Get Direction" color="#841584"  />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%', 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  indicator: {
    marginTop:'40%'
  },
  btn:{
    position:'absolute',
    bottom:0,
    width:'100%'
  }
});