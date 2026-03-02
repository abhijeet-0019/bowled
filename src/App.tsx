import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { UI } from './components/UI';
import { Ball } from './components/Ball';
import { Pitch, Stumps } from './components/Environment';
import { Sky, Environment as DreiEnvironment, OrbitControls } from '@react-three/drei';

export default function App() {
  return (
    <div className="w-full h-screen bg-[#f5f5f0] overflow-hidden relative font-sans">
      <UI />
      
      <Canvas
        shadows
        camera={{ position: [0, 2.5, 3], fov: 45 }}
        className="w-full h-full"
        onCreated={({ camera }) => camera.lookAt(0, 0, -20)}
      >
        <color attach="background" args={['#f5f5f0']} />
        <fog attach="fog" args={['#f5f5f0', 10, 40]} />
        
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        
        <Suspense fallback={null}>
          <Pitch />
          <Stumps />
          <Ball />
        </Suspense>
        
        {/* Optional: Add a subtle grid or ground plane outside the pitch */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#e8e8e3" roughness={1} />
        </mesh>
      </Canvas>
    </div>
  );
}
