import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: null,
  currentLocation: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setCurrentLocation: (state, action) => {
        state.currentLocation = action.payload;  // ✅ Current location set karna
    },
    clearLocation: (state) => {
      state.location = { lat: null, lng: null };
    }
  }
});

export const { setLocation,setCurrentLocation, clearLocation } = locationSlice.actions;

export default locationSlice.reducer;