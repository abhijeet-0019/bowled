import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { playBounceSound, playHitSound, playMissSound } from '../utils/audio';
import {
  GRAVITY, BALL_RADIUS, RESTITUTION, STUMP_Z, STUMP_HEIGHT,
  STUMP_RADIUS, STUMP_SPACING, PITCH_LENGTH, MIN_BOUNCE_Z
} from '../constants';

export const Ball = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const { ballState, throwBall, bounceBall, hitStump, missBall, spin, resetDelivery, setBouncePoint } = useGameStore();
  
  const posRef = useRef(new THREE.Vector3(0, 1.5, 0));
  const velRef = useRef(new THREE.Vector3(0, 0, 0));
  const trailPointsRef = useRef<THREE.Vector3[]>([]);
  
  const [isAiming, setIsAiming] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragCurrent = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  // Reset position when returning to idle
  useEffect(() => {
    if (ballState === 'idle') {
      posRef.current.set(0, 1.5, 0);
      velRef.current.set(0, 0, 0);
      trailPointsRef.current = [];
      if (meshRef.current) {
        meshRef.current.position.copy(posRef.current);
        meshRef.current.rotation.set(0, 0, 0);
      }
      if (trailRef.current) {
        trailRef.current.geometry.setFromPoints([]);
      }
    }
  }, [ballState]);

  const handlePointerDown = (e: React.PointerEvent | any) => {
    if (ballState !== 'idle') return;
    setIsAiming(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    dragCurrent.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent | any) => {
    if (!isAiming) return;
    dragCurrent.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent | any) => {
    if (!isAiming) return;
    setIsAiming(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    const dx = dragCurrent.current.x - dragStart.current.x;
    const dy = dragCurrent.current.y - dragStart.current.y;
    
    const power = Math.max(0, Math.min(dy, 300)) / 300; // 0 to 1
    const angle = Math.max(-150, Math.min(dx, 150)) / 150; // -1 to 1
    
    let vz = -15 - power * 15; // -15 to -30
    let vy = 1 + power * 3; // 1 to 4
    let vx = -angle * 4; // -4 to 4
    
    const y0 = posRef.current.y;
    const a = 0.5 * GRAVITY;
    const b = vy;
    const c = y0 - BALL_RADIUS;
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant >= 0) {
      const t = (-b - Math.sqrt(discriminant)) / (2 * a);
      const bounceZ = vz * t;
      
      if (bounceZ < MIN_BOUNCE_Z) {
        vz = MIN_BOUNCE_Z / t;
      }
    }
    
    velRef.current.set(vx, vy, vz);
    throwBall();
  };

  useFrame((state, delta) => {
    if (ballState === 'flying' || ballState === 'bounced' || ballState === 'hit' || ballState === 'missed') {
      const dt = Math.min(delta, 0.1);
      
      const pos = posRef.current;
      const vel = velRef.current;
      
      // Stop updating position if it rolls far away
      if (pos.z < STUMP_Z - 10) return;

      const nextPos = pos.clone().add(vel.clone().multiplyScalar(dt));
      vel.y += GRAVITY * dt;
      
      // Check bounce
      if (nextPos.y <= BALL_RADIUS && vel.y < 0) {
        nextPos.y = BALL_RADIUS;
        
        // Proportional bounce based on distance to stumps
        const distanceToStumps = Math.abs(STUMP_Z - nextPos.z);
        const bounceMultiplier = 1 + (distanceToStumps / 15); // Increase bounce if pitched further
        vel.y = -vel.y * RESTITUTION * bounceMultiplier;
        
        // Add some friction on bounce
        vel.x *= 0.9;
        vel.z *= 0.85; // Slow down slightly more to allow higher arc
        
        if (useGameStore.getState().ballState === 'flying') {
          bounceBall();
          playBounceSound();
          setBouncePoint([nextPos.x, nextPos.y, nextPos.z]);
          
          const spinRad = spin.degree * (Math.PI / 180) * (spin.direction === 'Left' ? -1 : 1);
          const currentVx = vel.x;
          const currentVz = vel.z;
          
          vel.x = currentVx * Math.cos(spinRad) - currentVz * Math.sin(spinRad);
          vel.z = currentVx * Math.sin(spinRad) + currentVz * Math.cos(spinRad);
        }
      }
      
      // Check collision with stumps
      if (pos.z > STUMP_Z && nextPos.z <= STUMP_Z) {
        const tHit = (STUMP_Z - pos.z) / (nextPos.z - pos.z);
        const hitX = pos.x + (nextPos.x - pos.x) * tHit;
        const hitY = pos.y + (nextPos.y - pos.y) * tHit;
        
        const hitMargin = 0.04;
        const hitMiddle = Math.abs(hitX) < STUMP_RADIUS + BALL_RADIUS + hitMargin;
        const hitOff = Math.abs(hitX + STUMP_SPACING) < STUMP_RADIUS + BALL_RADIUS + hitMargin; // Left stump
        const hitLeg = Math.abs(hitX - STUMP_SPACING) < STUMP_RADIUS + BALL_RADIUS + hitMargin; // Right stump
        const hitHeight = hitY > 0 && hitY < STUMP_HEIGHT + BALL_RADIUS + hitMargin;
        
        const currentState = useGameStore.getState().ballState;
        if (currentState !== 'hit' && currentState !== 'missed') {
          if ((hitMiddle || hitOff || hitLeg) && hitHeight) {
            if (currentState === 'bounced') {
              const hitType = hitMiddle ? 'middle' : (hitOff ? 'off' : 'leg');
              hitStump(hitType);
              playHitSound();
              // Bounce off stumps
              vel.z = -vel.z * 0.3;
              vel.x = vel.x * 0.5 + (Math.random() - 0.5) * 2;
              vel.y = vel.y * 0.5 + Math.random() * 2;
            } else {
              missBall(); // Invalid hit (full toss)
              playMissSound();
            }
            setTimeout(() => resetDelivery(), 3000);
          } else {
            missBall();
            playMissSound();
            setTimeout(() => resetDelivery(), 3000);
          }
        }
      }
      
      if (nextPos.z < STUMP_Z - 2) {
         const currentState = useGameStore.getState().ballState;
         if (currentState !== 'hit' && currentState !== 'missed') {
           missBall();
           playMissSound();
           setTimeout(() => resetDelivery(), 3000);
         }
      }
      
      pos.copy(nextPos);

      // Update trail
      if (ballState === 'flying' || ballState === 'bounced') {
        trailPointsRef.current.push(pos.clone());
        if (trailPointsRef.current.length > 50) {
          trailPointsRef.current.shift();
        }
        if (trailRef.current) {
          trailRef.current.geometry.setFromPoints(trailPointsRef.current);
        }
      }
    }
    
    if (meshRef.current) {
      meshRef.current.position.copy(posRef.current);
      
      if (ballState !== 'idle') {
        const speed = velRef.current.length();
        meshRef.current.rotation.x += speed * delta * 0.5;
        meshRef.current.rotation.z -= velRef.current.x * delta * 0.5;
      }
    }
  });

  return (
    <>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#ff0000" opacity={0.5} transparent linewidth={2} />
      </line>
      
      {ballState === 'idle' && (
        <mesh
          position={[0, 1.5, 2]}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerOut={handlePointerUp}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </>
  );
};

