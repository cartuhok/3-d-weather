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
    emissive: '#FFD700',
    emissiveIntensity: 0.3,
  });

  return (
    <group position={[0, 3, 0]}>
      <Sphere ref={sunRef} args={[1.8, 32, 32]} material={sunMaterial} />
      
      {/* Sun lighting */}
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFD700" distance={25} />
    </group>
  );
};

export default Sun;