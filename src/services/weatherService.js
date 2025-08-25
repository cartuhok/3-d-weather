import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'your-api-key-here';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const weatherService = {
  getCurrentWeather: async (location) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=3&aqi=no&alerts=no`
      );
      
      // Return just the data we need to avoid circular references
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${latitude},${longitude}`);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        }
      );
    });
  }
};

export const getWeatherConditionType = (condition) => {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
    return 'sunny';
  }
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'stormy';
  }
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return 'cloudy';
  }
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rainy';
  }
  if (conditionLower.includes('snow') || conditionLower.includes('blizzard')) {
    return 'snowy';
  }
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'foggy';
  }
  
  return 'cloudy';
};