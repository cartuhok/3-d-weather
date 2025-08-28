import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Sun = () => {
  const sunRef = useRef();
  
  // Load Solar System Scope sun texture
  const sunTexture = useLoader(THREE.TextureLoader, '/textures/sun_2k.jpg');
  
  useFrame((state, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1;
    }
  });

  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
  });

  // Lens flare trigger sphere - completely invisible
  const flareMaterial = new THREE.MeshPhysicalMaterial({
    transparent: true,
    opacity: 0, // Completely invisible
    emissive: '#FFD700',
    emissiveIntensity: 2.0,
    transmission: 1,
  });

  return (
    <group position={[0, 4.5, 0]}>
      <Sphere ref={sunRef} args={[2, 32, 32]} material={sunMaterial} />
      
      {/* Lens flare trigger sphere - marks as no-occlusion for lens flare system */}
      <Sphere 
        args={[1.6, 32, 32]} 
        material={flareMaterial}
        userData={{ lensflare: 'no-occlusion' }}
      />
      
      {/* Sun lighting */}
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFD700" distance={25} />
    </group>
  );
};

export default Sun;