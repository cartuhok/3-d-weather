import React from 'react';
import { Clouds as DreiClouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';

const Clouds = ({ intensity = 0.7, speed = 0.1, weatherCondition = 'partly-cloudy', isPartlyCloudy = false }) => {
  // Determine cloud colors based on weather condition
  const getCloudColors = () => {
    switch (weatherCondition) {
      case 'stormy':
      case 'thunderstorm':
      case 'heavy-rain':
        return {
          primary: '#4A4A4A',
          secondary: '#5A5A5A', 
          tertiary: '#3A3A3A',
          light: '#6A6A6A',
          intensity: intensity * 1.2
        };
      case 'overcast':
      case 'light-rain':
        return {
          primary: '#B0B0B0',
          secondary: '#C0C0C0',
          tertiary: '#A0A0A0',
          light: '#D0D0D0',
          intensity: intensity * 1.1
        };
      case 'partly-cloudy':
      case 'cloudy':
      default:
        return {
          primary: '#FFFFFF',
          secondary: '#F8F8F8',
          tertiary: '#F0F0F0',
          light: '#FAFAFA',
          intensity: intensity
        };
    }
  };

  const colors = getCloudColors();
  return (
    <group>
      <DreiClouds material={THREE.MeshLambertMaterial}>
        {/* Large fluffy cloud cluster */}
        <Cloud
          segments={80}
          bounds={[12, 4, 4]}
          volume={15}
          color={colors.primary}
          fade={50}
          speed={speed}
          opacity={colors.intensity}
          position={[-5, 4, -2]}
        />
        <Cloud
          segments={70}
          bounds={[14, 3, 3]}
          volume={12}
          color={colors.secondary}
          fade={60}
          speed={speed * 0.7}
          opacity={colors.intensity * 0.9}
          position={[6, 3.5, -1]}
        />
        <Cloud
          segments={60}
          bounds={[10, 3, 3]}
          volume={10}
          color={colors.tertiary}
          fade={70}
          speed={speed * 1.1}
          opacity={colors.intensity * 0.8}
          position={[0, 5.5, -3]}
        />
        {/* Additional smaller fluffy clouds */}
        <Cloud
          segments={50}
          bounds={[8, 2.5, 2.5]}
          volume={8}
          color={colors.light}
          fade={80}
          speed={speed * 0.9}
          opacity={colors.intensity * 0.6}
          position={[-8, 3, -4]}
        />
        <Cloud
          segments={45}
          bounds={[6, 2, 2]}
          volume={6}
          color={colors.secondary}
          fade={90}
          speed={speed * 1.3}
          opacity={colors.intensity * 0.5}
          position={[8, 6, -2]}
        />
        <Cloud
          segments={55}
          bounds={[9, 2.5, 2.5]}
          volume={9}
          color={colors.tertiary}
          fade={75}
          speed={speed * 0.6}
          opacity={colors.intensity * 0.7}
          position={[-2, 2.5, -5]}
        />
        
        {/* Foreground clouds that appear in front of sun/moon for partly cloudy conditions */}
        {isPartlyCloudy && (
          <>
            <Cloud
              segments={40}
              bounds={[6, 2, 2]}
              volume={5}
              color={colors.secondary}
              fade={90}
              speed={speed * 0.8}
              opacity={colors.intensity * 0.4}
              position={[-1, 3.5, 2]} // Positive Z to be in front of sun/moon
            />
            <Cloud
              segments={35}
              bounds={[5, 1.5, 1.5]}
              volume={4}
              color={colors.light}
              fade={95}
              speed={speed * 1.2}
              opacity={colors.intensity * 0.3}
              position={[1.5, 2.8, 1.5]} // Positive Z to be in front of sun/moon
            />
            <Cloud
              segments={30}
              bounds={[4, 1.2, 1.2]}
              volume={3}
              color={colors.tertiary}
              fade={85}
              speed={speed * 0.9}
              opacity={colors.intensity * 0.35}
              position={[0.5, 4.2, 1.8]} // Positive Z to be in front of sun/moon
            />
          </>
        )}
      </DreiClouds>
    </group>
  );
};

export default Clouds;