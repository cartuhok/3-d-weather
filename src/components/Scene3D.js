import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useControls } from 'leva';
import UltimateLensFlare from './lensflare/LensFlare';
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

// Lens flare visibility logic - show whenever sun model is visible (daytime)
const useLensFlareVisibility = (weatherData, isNight) => {
  return React.useMemo(() => {
    // Show lens flare during any daytime condition (when sun model is visible)
    return !isNight && weatherData;
  }, [isNight, weatherData]);
};

// Post-processing effects with Ultimate Lens Flare - only render when needed
const PostProcessingEffects = ({ showLensFlare }) => {
  const lensFlareControls = useControls('Lens Flare', {
    enabled: { value: true, render: () => showLensFlare },
    positionX: {
      value: -26,
      min: -100,
      max: 100,
      step: 1,
    },
    positionY: {
      value: 6,
      min: -50,
      max: 50,
      step: 1,
    },
    positionZ: {
      value: -60,
      min: -100,
      max: 100,
      step: 1,
    },
    opacity: {
      value: 1.00,
      min: 0,
      max: 1,
      step: 0.01,
    },
    glareSize: {
      value: 0.35,
      min: 0,
      max: 2,
      step: 0.01,
    },
    starPoints: {
      value: 6,
      min: 3,
      max: 12,
      step: 1,
    },
    animated: true,
    followMouse: false,
    anamorphic: false,
    colorGain: '#38150b',
    flareSpeed: {
      value: 0.40,
      min: 0,
      max: 1,
      step: 0.01,
    },
    flareShape: {
      value: 0.10,
      min: 0,
      max: 1,
      step: 0.01,
    },
    flareSize: {
      value: 0.01,
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    secondaryGhosts: true,
    ghostScale: {
      value: 0.10,
      min: 0,
      max: 2,
      step: 0.01,
    },
    aditionalStreaks: true,
    starBurst: true,
    haloScale: {
      value: 0.50,
      min: 0,
      max: 2,
      step: 0.01,
    },
  });

  const bloomControls = useControls('Bloom', {
    bloomIntensity: {
      value: 0.3,
      min: 0,
      max: 2,
      step: 0.01,
    },
    bloomThreshold: {
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });
  
  if (!showLensFlare) return null;
  
  return (
    <EffectComposer>
      <UltimateLensFlare
        position={[lensFlareControls.positionX, lensFlareControls.positionY, lensFlareControls.positionZ]}
        opacity={lensFlareControls.opacity}
        glareSize={lensFlareControls.glareSize}
        starPoints={lensFlareControls.starPoints}
        animated={lensFlareControls.animated}
        followMouse={lensFlareControls.followMouse}
        anamorphic={lensFlareControls.anamorphic}
        colorGain={new THREE.Color(lensFlareControls.colorGain)}
        flareSpeed={lensFlareControls.flareSpeed}
        flareShape={lensFlareControls.flareShape}
        flareSize={lensFlareControls.flareSize}
        secondaryGhosts={lensFlareControls.secondaryGhosts}
        ghostScale={lensFlareControls.ghostScale}
        aditionalStreaks={lensFlareControls.aditionalStreaks}
        starBurst={lensFlareControls.starBurst}
        haloScale={lensFlareControls.haloScale}
        dirtTextureFile="/lensDirtTexture.jpg"
      />
      <Bloom 
        intensity={bloomControls.bloomIntensity} 
        threshold={bloomControls.bloomThreshold} 
      />
    </EffectComposer>
  );
};

const Scene3D = ({ weatherData, isLoading }) => {
  
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

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 1, 8], fov: 60 }}
        gl={{ alpha: false }}
      >
        <Suspense fallback={null}>
          {/* Set scene background dynamically */}
          <SceneBackground backgroundColor={getBackgroundColor()} />
          
          {/* Sky with dynamic sun position based on time of day */}
          <Sky
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
          
          {/* Stars only visible at night */}
          {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
          
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
          
          <WeatherVisualization 
            weatherData={weatherData} 
            isLoading={isLoading}
          />
          
          {/* Post-processing effects including Ultimate Lens Flare */}
          <PostProcessingEffects showLensFlare={showLensFlare} />
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 2, 0]}
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