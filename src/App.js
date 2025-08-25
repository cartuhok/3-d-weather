import React, { useState, useEffect } from 'react';
import './App.css';
import Scene3D from './components/Scene3D';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import LocationSelector from './components/LocationSelector';
import { weatherService } from './services/weatherService';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLocationName, setCurrentLocationName] = useState('');

  useEffect(() => {
    loadCurrentLocationWeather();
  }, []);

  const loadCurrentLocationWeather = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const location = await weatherService.getCurrentLocation();
      const data = await weatherService.getCurrentWeather(location);
      setWeatherData(data);
      setCurrentLocationName(`${data.location.name}, ${data.location.region}`);
    } catch (error) {
      console.error('Error loading weather:', error);
      setError('Unable to load weather data. Please try entering a city manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = async (location) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await weatherService.getCurrentWeather(location);
      setWeatherData(data);
      setCurrentLocationName(`${data.location.name}, ${data.location.region}`);
    } catch (error) {
      console.error('Error loading weather for location:', error);
      setError('Unable to load weather data for this location. Please try a different city.');
    } finally {
      setIsLoading(false);
    }
  };

  const isNightTime = () => {
    if (!weatherData?.location?.localtime) return false;
    const localTime = weatherData.location.localtime;
    const currentHour = new Date(localTime).getHours();
    return currentHour >= 19 || currentHour <= 6;
  };

  const isNight = isNightTime();
  const textColor = isNight ? 'text-white' : 'text-black';

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* 3D Scene fills entire viewport - base layer */}
      <div className="absolute inset-0 z-0">
        <Scene3D 
          weatherData={weatherData} 
          isLoading={isLoading} 
        />
      </div>
      
      {/* All UI elements overlay on top of the canvas */}
      {weatherData && !isLoading && (
        <>
          {/* Location Selector */}
          <LocationSelector 
            onLocationChange={handleLocationChange}
            currentLocation={currentLocationName}
            isLoading={isLoading}
            isNight={isNight}
          />

          {/* Location Info - overlay */}
          <div className={`absolute top-20 left-6 z-20 ${textColor}`}>
            <div className="text-sm opacity-60">
              {weatherData.location.name.toUpperCase()}
            </div>
            <div className="text-xs opacity-50 mt-1">
              {weatherData.location.region}
            </div>
          </div>

          {/* Temperature Display - overlay */}
          <div className={`absolute bottom-80 left-6 z-20 ${textColor}`}>
            <div className="flex items-baseline mb-2">
              <span className="text-8xl font-extralight leading-none tracking-tight">
                {Math.round(weatherData.current.temp_f)}
              </span>
              <span className="text-3xl font-extralight ml-1 opacity-80">°</span>
            </div>
            <div className="text-lg font-light opacity-70 capitalize">
              {weatherData.current.condition.text}
            </div>
          </div>

          {/* High/Low temps - overlay */}
          <div className={`absolute bottom-80 right-6 text-right z-20 ${textColor}`}>
            <div className="text-sm opacity-60 space-y-1">
              <div>H: {Math.round(weatherData.current.temp_f + 5)}°</div>
              <div>L: {Math.round(weatherData.current.temp_f - 10)}°</div>
            </div>
          </div>

          {/* Forecast at bottom - overlay */}
          <Forecast weatherData={weatherData} isLoading={isLoading} isNight={isNight} />
          
          {/* Bottom Weather Stats - overlay */}
          <div className={`absolute bottom-6 left-6 right-6 z-20 ${textColor}`}>
            <div className="grid grid-cols-4 gap-4 text-center text-base">
              <div>
                <div className="opacity-60 mb-2 text-sm">HUMIDITY</div>
                <div className={textColor}>{weatherData.current.humidity}%</div>
              </div>
              <div>
                <div className="opacity-60 mb-2 text-sm">WIND</div>
                <div className={textColor}>{Math.round(weatherData.current.wind_mph)} mph</div>
              </div>
              <div>
                <div className="opacity-60 mb-2 text-sm">FEELS LIKE</div>
                <div className={textColor}>{Math.round(weatherData.current.feelslike_f)}°</div>
              </div>
              <div>
                <div className="opacity-60 mb-2 text-sm">VISIBILITY</div>
                <div className={textColor}>{Math.round(weatherData.current.vis_miles)} mi</div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-50">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-light">Loading weather data...</p>
        </div>
      )}
      
      {error && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-sm mx-4 text-center border border-white/20">
            <p className="text-white text-lg font-light mb-6 leading-relaxed">{error}</p>
            <button 
              onClick={loadCurrentLocationWeather} 
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-white font-light transition-all duration-300 border border-white/30 hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
