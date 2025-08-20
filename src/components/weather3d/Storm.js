import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds as DreiClouds, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import Rain from './Rain';

const Storm = () => {
  const lightningRef = useRef();
  const cloudsRef = useRef();

  useFrame((state) => {
    if (Math.random() < 0.01) {
      if (lightningRef.current) {
        lightningRef.current.intensity = 3;
        setTimeout(() => {
          if (lightningRef.current) lightningRef.current.intensity = 0;
        }, 100);
      }
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.005;
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
        color="#E6E6FA"
        distance={20}
      />
    </group>
  );
};

export default Storm;