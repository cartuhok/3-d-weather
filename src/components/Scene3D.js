import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import UltimateLensFlare from './lensflare/LensFlare';
import ForecastPortals from './ForecastPortals';
import { getWeatherConditionType } from '../services/weatherService';
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

// Lens flare visibility logic - follows exact same logic as Sun model visibility
const useLensFlareVisibility = (weatherData, isNight) => {
  return React.useMemo(() => {
    if (isNight || !weatherData) return false;
    
    const currentCondition = weatherData?.current?.condition?.text;
    const weatherType = currentCondition ? getWeatherConditionType(currentCondition) : null;
    
    // Check if it's partly cloudy based on the condition text
    const isPartlyCloudy = () => {
      if (!currentCondition) return false;
      const condition = currentCondition.toLowerCase();
      return condition.includes('partly') || condition.includes('few clouds') || 
             condition.includes('scattered') || condition.includes('broken clouds');
    };
    
    // Replicate the EXACT same logic from WeatherVisualization renderWeatherEffect()
    switch (weatherType) {
      case 'sunny':
        return true; // Sun always appears for sunny (with or without clouds)
      case 'cloudy':
        return isPartlyCloudy(); // Sun only appears if partly cloudy
      case 'rainy':
        return false; // No sun - only clouds and rain
      case 'snowy':
        return false; // No sun - only clouds and snow  
      case 'stormy':
        return false; // No sun - storm effect only
      case 'foggy':
        return false; // No sun - only clouds/fog
      default:
        return isPartlyCloudy(); // Default case shows sun only if partly cloudy
    }
  }, [isNight, weatherData]);
};

// Post-processing effects with Ultimate Lens Flare - only render when needed
const PostProcessingEffects = ({ showLensFlare, isPortalMode = false }) => {
  // Define main scene lens flare values (now using the portal screenshot values)
  const mainSceneDefaults = {
    positionX: 180,
    positionY: -115,
    positionZ: -39,
    opacity: 1.00,
    glareSize: 0.35,
    starPoints: 6,
    animated: true,
    followMouse: false,
    anamorphic: true,
    colorGain: '#38150b',
    flareSpeed: 0.45,
    flareShape: 0.33,
    flareSize: 0.03,
    secondaryGhosts: true,
    ghostScale: 0.70,
    aditionalStreaks: true,
    starBurst: true,
    haloScale: 0.36,
  };

  // Define portal mode lens flare values (now using the original main screen values)
  const portalModeDefaults = {
    positionX: -26,
    positionY: 6,
    positionZ: -60,
    opacity: 1.00,
    glareSize: 0.35,
    starPoints: 6,
    animated: true,
    followMouse: false,
    anamorphic: false,
    colorGain: '#38150b',
    flareSpeed: 0.40,
    flareShape: 0.10,
    flareSize: 0.01,
    secondaryGhosts: true,
    ghostScale: 0.10,
    aditionalStreaks: true,
    starBurst: true,
    haloScale: 0.50,
  };

  // Use appropriate defaults based on portal mode
  const currentDefaults = isPortalMode ? portalModeDefaults : mainSceneDefaults;

  // Use values directly without Leva controls
  const lensFlareSettings = currentDefaults;
  
  // Define bloom values for different modes
  const mainSceneBloom = {
    bloomIntensity: 0.3,
    bloomThreshold: 0.9,
  };

  const portalModeBloom = {
    bloomIntensity: 0.97,
    bloomThreshold: 0.85,
  };

  const bloomSettings = isPortalMode ? portalModeBloom : mainSceneBloom;
  
  if (!showLensFlare) return null;
  
  return (
    <EffectComposer>
      <UltimateLensFlare
        position={[lensFlareSettings.positionX, lensFlareSettings.positionY, lensFlareSettings.positionZ]}
        opacity={lensFlareSettings.opacity}
        glareSize={lensFlareSettings.glareSize}
        starPoints={lensFlareSettings.starPoints}
        animated={lensFlareSettings.animated}
        followMouse={lensFlareSettings.followMouse}
        anamorphic={lensFlareSettings.anamorphic}
        colorGain={new THREE.Color(lensFlareSettings.colorGain)}
        flareSpeed={lensFlareSettings.flareSpeed}
        flareShape={lensFlareSettings.flareShape}
        flareSize={lensFlareSettings.flareSize}
        secondaryGhosts={lensFlareSettings.secondaryGhosts}
        ghostScale={lensFlareSettings.ghostScale}
        aditionalStreaks={lensFlareSettings.aditionalStreaks}
        starBurst={lensFlareSettings.starBurst}
        haloScale={lensFlareSettings.haloScale}
        dirtTextureFile="/lensDirtTexture.jpg"
      />
      <Bloom 
        intensity={bloomSettings.bloomIntensity} 
        threshold={bloomSettings.bloomThreshold} 
      />
    </EffectComposer>
  );
};

const Scene3D = ({ weatherData, isLoading, onPortalModeChange, onSetExitPortalFunction, onPortalWeatherDataChange }) => {
  const [portalMode, setPortalMode] = React.useState(false);
  const [portalWeatherData, setPortalWeatherData] = React.useState(null);
  

  const exitPortal = () => {
    setPortalMode(false);
    setPortalWeatherData(null);
    onPortalModeChange?.(false);
    onPortalWeatherDataChange?.(null);
  };

  const handlePortalStateChange = (isPortalActive, dayData) => {
    setPortalMode(isPortalActive);
    onPortalModeChange?.(isPortalActive);
    if (isPortalActive && dayData) {
      // Create weather data for the portal day
      const portalData = {
        current: {
          temp_f: dayData.day.maxtemp_f,
          condition: dayData.day.condition,
          is_day: 1,
          humidity: dayData.day.avghumidity,
          wind_mph: dayData.day.maxwind_mph,
          feelslike_f: dayData.day.maxtemp_f, // Approximate feels like temp
          vis_miles: 10, // Default visibility
        },
        location: {
          name: weatherData?.location?.name || 'Unknown',
          region: weatherData?.location?.region || '',
          localtime: dayData.date + 'T12:00'
        }
      };
      setPortalWeatherData(portalData);
      onPortalWeatherDataChange?.(portalData);
    } else {
      setPortalWeatherData(null);
      onPortalWeatherDataChange?.(null);
    }
  };

  // Provide exit function to parent
  React.useEffect(() => {
    onSetExitPortalFunction?.(() => exitPortal);
  }, [onSetExitPortalFunction]);
  
  const getTimeOfDay = () => {
    if (!weatherData?.location?.localtime) return 'day';
    const localTime = weatherData.location.localtime;
    const currentHour = new Date(localTime).getHours();
    
    if (currentHour >= 19 || currentHour <= 6) return 'night';
    if (currentHour >= 6 && currentHour < 8) return 'dawn';
    if (currentHour >= 17 && currentHour < 19) return 'dusk';
    return 'day';
  };

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
  }, [weatherData?.location?.lat, weatherData?.location?.lon, weatherData?.location?.localtime]);

  const isNight = isNightTime();
  const timeOfDay = getTimeOfDay();
  const showLensFlare = useLensFlareVisibility(weatherData, isNight);
  const showPortalLensFlare = useLensFlareVisibility(portalWeatherData, false);
  
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
    
    // Dawn/dusk specific colors
    if (timeOfDay === 'dawn') return '#2D1B3D'; // Deep purple-blue for dawn
    if (timeOfDay === 'dusk') return '#3D2914'; // Deep orange-brown for dusk
    
    if (!weatherData?.current?.condition) return '#0D7FDB'; // vivid sky blue
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('storm')) return '#263238'; // dark storm gray
    if (condition.includes('rain') || condition.includes('overcast')) return '#546E7A'; // overcast gray
    if (condition.includes('cloudy')) return '#1E88E5'; // bright blue with clouds
    return '#0D7FDB'; // vivid clear sky blue
  };

  // Component to handle mobile responsive text inside Canvas
  const ResponsiveText = ({ isNight, isLoading }) => {
    const { viewport } = useThree();
    const isMobile = viewport.width < 6;
    const textScale = isMobile ? 0.7 : 1;
    const textPosition = isMobile ? [0, -1.8, 0] : [0, -2.1, 0];
    
    if (isLoading) return null;
    
    return (
      <Text
        position={textPosition}
        fontSize={0.2 * textScale}
        color={isNight ? "#FFFFFF" : "#333333"}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.7}
      >
        THREE DAY FORECAST
      </Text>
    );
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 1, 10], fov: 60 }}
        gl={{ alpha: false, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          {/* Scene background only for portal mode - Sky handles main scene */}
          {portalMode && <SceneBackground key={`bg-${timeOfDay}-${portalMode}`} backgroundColor={getBackgroundColor()} />}
          
          {/* Sky with dynamic sun position based on time of day */}
          <Sky
            key={`main-sky-${timeOfDay}-${portalMode}`}
            sunPosition={(() => {
              switch(timeOfDay) {
                case 'dawn':
                  return [100, -5, 100]; // Sun below horizon for darker dawn
                case 'dusk':
                  return [-100, -5, 100]; // Sun below horizon for darker dusk
                case 'night':
                  return [0, 0, 0]; // Keep existing night value
                default: // day
                  return [100, 20, 100]; // Keep existing day value
              }
            })()}
            inclination={(() => {
              switch(timeOfDay) {
                case 'dawn':
                case 'dusk':
                  return 0.6; // Medium inclination for dawn/dusk
                case 'night':
                  return 0.3; // Keep existing night value
                default: // day
                  return 0.9; // Keep existing day value
              }
            })()}
            turbidity={(() => {
              switch(timeOfDay) {
                case 'dawn':
                case 'dusk':
                  return 8; // Higher turbidity for atmospheric scattering
                case 'night':
                  return 50; // Keep existing night value
                default: // day
                  return 2; // Keep existing day value
              }
            })()}
          />
          
          <ambientLight intensity={(() => {
            switch(timeOfDay) {
              case 'dawn':
              case 'dusk':
                return 0.25; // Darker ambient light for dawn/dusk
              case 'night':
                return 0.2; // Keep existing night value
              default: // day
                return 0.4; // Keep existing day value
            }
          })()} />
          <directionalLight 
            position={sunPosition} 
            intensity={(() => {
              switch(timeOfDay) {
                case 'dawn':
                case 'dusk':
                  return 0.6; // Dimmer directional light for dawn/dusk
                case 'night':
                  return 0.5; // Keep existing night value
                default: // day
                  return 1; // Keep existing day value
              }
            })()} 
            color={(() => {
              switch(timeOfDay) {
                case 'dawn':
                  return "#9B59B6"; // Purple-pink for dawn
                case 'dusk':
                  return "#E67E22"; // Warm orange for dusk
                case 'night':
                  return "#4169E1"; // Keep existing night value
                default: // day
                  return "#FFFFFF"; // Keep existing day value
              }
            })()}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          {!portalMode ? (
            <>
              {/* Main Scene */}
              {/* Stars only visible at night in main scene */}
              {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
              
              <WeatherVisualization 
                weatherData={weatherData} 
                isLoading={isLoading}
              />
              
              {/* Three Day Forecast 3D Label - responsive for mobile */}
              <ResponsiveText isNight={isNight} isLoading={isLoading} />

              {/* 3D Forecast Portals */}
              <ForecastPortals 
                weatherData={weatherData} 
                isLoading={isLoading}
                onPortalStateChange={handlePortalStateChange}
              />
              
              {/* Post-processing effects including Ultimate Lens Flare */}
              <PostProcessingEffects showLensFlare={showLensFlare} isPortalMode={false} />
            </>
          ) : (
            <>
              {/* Fullscreen Portal Content with Day Sky */}
              <SceneBackground backgroundColor={'#0D7FDB'} />
              <Sky
                sunPosition={[100, 20, 100]}
                inclination={0.9}
                turbidity={2}
              />
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                color="#FFFFFF"
              />
              <group position={[0, -1, 0]}>
                <WeatherVisualization 
                  weatherData={portalWeatherData} 
                  isLoading={false}
                  portalMode={false}
                />
              </group>
              
              {/* Add lens flare effect for portal mode when sun should be visible */}
              <PostProcessingEffects showLensFlare={showPortalLensFlare} isPortalMode={true} />
            </>
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={portalMode ? [0, 2, 0] : [0, 2, 0]}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
            maxAzimuthAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 2}
            minDistance={3}
            maxDistance={20}
          />
          
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;