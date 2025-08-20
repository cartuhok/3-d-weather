import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { EffectComposer, LensFlare } from '@react-three/postprocessing';
import * as THREE from 'three';
import WeatherVisualization from './WeatherVisualization';

// Component to handle scene background
const SceneBackground = ({ backgroundColor }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [scene, backgroundColor]);
  
  return null;
};

// Component to handle post-processing effects inside the Canvas
const PostProcessingEffects = ({ isNight }) => {
  // Disabled due to circular reference issues with @react-three/postprocessing
  // The library seems to have compatibility issues that cause JSON serialization errors
  return null;
};

const Scene3D = ({ weatherData, isLoading }) => {
  
  const isNightTime = () => {
    if (!weatherData?.location?.localtime) return false;
    const localTime = weatherData.location.localtime;
    const currentHour = new Date(localTime).getHours();
    return currentHour >= 19 || currentHour <= 6;
  };

  // Calculate sun position based on time and location
  const sunPosition = useMemo(() => {
    if (!weatherData?.location) {
      // Default position for day/night - ensure sun is visible during day
      const hour = new Date().getHours();
      if (hour >= 6 && hour <= 18) {
        // Daytime - put sun high in sky
        const dayProgress = (hour - 6) / 12; // 0 to 1 from sunrise to sunset
        const angle = dayProgress * Math.PI; // 0 to π
        return [
          Math.sin(angle) * 50,
          Math.cos(angle) * 50 + 25, // Keep sun above horizon
          30
        ];
      } else {
        // Nighttime - sun below horizon
        return [0, -50, 0];
      }
    }

    const { lat, lon, localtime } = weatherData.location;
    const date = new Date(localtime);
    const hour = date.getHours() + date.getMinutes() / 60;
    
    // Simplified but more reliable sun position
    if (hour >= 6 && hour <= 18) {
      // Daytime positioning
      const dayProgress = (hour - 6) / 12; // 0 at sunrise, 1 at sunset
      const sunAngle = dayProgress * Math.PI; // 0 to π
      
      // Position sun in an arc across the sky
      const distance = 100;
      const elevation = Math.sin(sunAngle) * 0.7 + 0.3; // Keep sun reasonably high
      
      return [
        Math.sin(sunAngle - Math.PI/2) * distance * 0.8,
        elevation * distance,
        Math.cos(sunAngle - Math.PI/2) * distance * 0.3
      ];
    } else {
      // Nighttime - moon position
      return [0, -30, 50];
    }
  }, [weatherData?.location]);

  const isNight = isNightTime();
  
  // Sky turbidity based on weather conditions
  const getTurbidity = () => {
    if (!weatherData?.current?.condition) return 2;
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('storm') || condition.includes('heavy rain')) return 8;
    if (condition.includes('rain') || condition.includes('overcast')) return 6;
    if (condition.includes('cloudy')) return 4;
    return 2; // clear sky
  };

  // Vivid realistic sky colors
  const getBackgroundColor = () => {
    if (isNight) return '#0A1428';
    
    if (!weatherData?.current?.condition) return '#1976D2'; // beautiful sky blue
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('storm')) return '#263238'; // dark storm gray
    if (condition.includes('rain') || condition.includes('overcast')) return '#546E7A'; // overcast gray
    if (condition.includes('cloudy')) return '#42A5F5'; // bright cloudy blue
    return '#1976D2'; // beautiful clear sky blue
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 1, 8], fov: 60 }}
        gl={{ alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Set scene background dynamically */}
          <SceneBackground backgroundColor={getBackgroundColor()} />
          
          {/* Sky with fixed day/night logic */}
          <Sky
            inclination={isNight ? 0.3 : 0.9}
            turbidity={isNight ? 20 : 2}
          />
          
          <ambientLight intensity={isNight ? 0.2 : 0.4} />
          <directionalLight 
            position={sunPosition} 
            intensity={isNight ? 0.1 : 1} 
            color={isNight ? "#4169E1" : "#FFFFFF"}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          <WeatherVisualization 
            weatherData={weatherData} 
            isLoading={isLoading}
          />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 2, 0]}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
            minDistance={3}
            maxDistance={20}
          />
          
          {/* Post-processing effects */}
          <PostProcessingEffects isNight={isNight} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;