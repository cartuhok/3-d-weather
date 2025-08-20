import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Moon = () => {
  const moonRef = useRef();
  const glowRef = useRef();
  
  // Load Solar System Scope moon texture
  const moonTexture = useLoader(THREE.TextureLoader, '/textures/moon_2k.jpg');

  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.05;
    }
  });

  const moonMaterial = new THREE.MeshLambertMaterial({
    map: moonTexture,
    emissive: '#111111',
    emissiveIntensity: 0.1,
  });


  return (
    <group position={[0, 3, 0]}>
      <Sphere ref={moonRef} args={[1.8, 32, 32]} material={moonMaterial} />
      
      
      {/* Soft moonlight */}
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#E6E6FA" />
    </group>
  );
};

export default Moon;