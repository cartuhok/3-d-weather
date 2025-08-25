import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds as DreiClouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import Rain from './Rain';

const Storm = () => {
  const lightningRef = useRef();
  const cloudsRef = useRef();
  const lightningBoltRef = useRef();
  const lightningActive = useRef(false);

  useFrame((state) => {
    // Lightning strikes with random timing (back to normal frequency)
    if (Math.random() < 0.008 && !lightningActive.current) {
      lightningActive.current = true;
      
      if (lightningBoltRef.current) {
        lightningBoltRef.current.visible = true;
      }
      
      if (lightningRef.current) {
        // Bright initial flash
        lightningRef.current.intensity = 15;
        
        // Quick flicker effect
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 50);
        
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 20;
        }, 100);
        
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 150);
        
        // Final brief flash
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 10;
        }, 200);
        
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
          if (lightningBoltRef.current) {
            lightningBoltRef.current.visible = false;
          }
          lightningActive.current = false;
        }, 250);
      }
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.002; // Slower cloud movement
    }
  });

  return (
    <group>
      <group ref={cloudsRef}>
        <DreiClouds material={THREE.MeshLambertMaterial}>
          <Cloud
            segments={40}
            bounds={[12, 3, 3]}
            volume={8}
            color="#2C2C2C"
            fade={100}
            speed={0.2}
            opacity={0.8}
            position={[-5, 4, -2]}
          />
          <Cloud
            segments={40}
            bounds={[12, 3, 3]}
            volume={8}
            color="#404040"
            fade={100}
            speed={0.15}
            opacity={0.7}
            position={[5, 3, -1]}
          />
          <Cloud
            segments={40}
            bounds={[10, 3, 3]}
            volume={6}
            color="#1A1A1A"
            fade={100}
            speed={0.25}
            opacity={0.9}
            position={[0, 5, -3]}
          />
        </DreiClouds>
      </group>
      
      <Rain count={1500} />
      
      <pointLight
        ref={lightningRef}
        position={[0, 8, 0]}
        intensity={0}
        color="#FFFFFF"
        distance={30}
        decay={1}
        castShadow
      />
      
      {/* Visual lightning bolt */}
      <line ref={lightningBoltRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array([
              0, 8, 0,    // Start point (cloud level)
              -0.5, 6, 0,  // First bend
              0.3, 4, 0,   // Second bend
              -0.2, 2, 0,  // Third bend
              0, 0, 0      // Ground level
            ])}
            count={5}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#FFFFFF" 
          linewidth={3}
          transparent
          opacity={0.9}
        />
      </line>
    </group>
  );
};

export default Storm;