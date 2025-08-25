import React from 'react';
import { getWeatherConditionType } from '../services/weatherService';
import Sun from './weather3d/Sun';
import Moon from './weather3d/Moon';
import Clouds from './weather3d/Clouds';
import Rain from './weather3d/Rain';
import Snow from './weather3d/Snow';
import Storm from './weather3d/Storm';
import { Text } from '@react-three/drei';

const WeatherVisualization = ({ weatherData, isLoading }) => {

  // Check if it's nighttime based on local time
  const isNightTime = () => {
    if (!weatherData?.location?.localtime) return false;
    const localTime = weatherData.location.localtime;
    const currentHour = new Date(localTime).getHours();
    return currentHour >= 19 || currentHour <= 6; // 7 PM to 6 AM is night
  };
  
  const isNight = isNightTime();
  const currentCondition = weatherData?.current?.condition?.text;
  const weatherType = currentCondition ? getWeatherConditionType(currentCondition) : null;


  if (isLoading || !weatherData) {
    return null;
  }

  // Check if it's partly cloudy based on the condition text
  const isPartlyCloudy = () => {
    if (!currentCondition) return false;
    const condition = currentCondition.toLowerCase();
    return condition.includes('partly') || condition.includes('few clouds') || 
           condition.includes('scattered') || condition.includes('broken clouds');
  };

  const renderWeatherEffect = () => {
    const partlyCloudy = isPartlyCloudy();
    
    switch (weatherType) {
      case 'sunny':
        if (partlyCloudy) {
          return (
            <>
              {isNight ? <Moon /> : <Sun />}
              <Clouds intensity={0.5} speed={0.1} isPartlyCloudy={true} />
            </>
          );
        }
        return isNight ? <Moon /> : <Sun />;
      case 'cloudy':
        return (
          <>
            {isNight ? <Moon /> : <Sun />}
            <Clouds intensity={0.7} speed={0.1} isPartlyCloudy={partlyCloudy} />
          </>
        );
      case 'rainy':
        return (
          <>
            <Clouds intensity={0.8} speed={0.15} />
            <Rain count={800} />
          </>
        );
      case 'snowy':
        return (
          <>
            <Clouds intensity={0.6} speed={0.05} />
            <Snow count={400} />
          </>
        );
      case 'stormy':
        return <Storm />;
      case 'foggy':
        return <Clouds intensity={0.9} speed={0.05} />;
      default:
        if (partlyCloudy) {
          return (
            <>
              {isNight ? <Moon /> : <Sun />}
              <Clouds intensity={0.5} speed={0.1} isPartlyCloudy={true} />
            </>
          );
        }
        return isNight ? <Moon /> : <Sun />;
    }
  };

  return (
    <group>
      {renderWeatherEffect()}
      
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.5}
        color={isNight ? "#FFFFFF" : "#333333"}
        anchorX="center"
        anchorY="middle"
      >
        {currentCondition}
      </Text>
    </group>
  );
};

export default WeatherVisualization;