export const getAddressFromLatLng = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
        {
          headers: {
            "User-Agent": "DriveApp/1.0 (syedaabeerfatima108@gmail.com)", // Add your app name and email here
          },
        }
      );
  
      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (data.error) {
        console.error("API Error:", data.error);
        return "Unknown Location";
      }
  
      return data.display_name || "Unknown Location";
    } catch (error) {
      console.error("Error fetching address:", error);
      return "Unknown Location";
    }
  };
  