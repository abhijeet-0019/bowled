import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import {
  PITCH_LENGTH, STUMP_Z, STUMP_HEIGHT,
  STUMP_RADIUS, STUMP_SPACING
} from '../constants';

const PITCH_WIDTH = 3.05;

export const Pitch = () => {
  const { bouncePoint } = useGameStore();

  return (
    <group>
      <mesh position={[0, 0, -PITCH_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[PITCH_WIDTH, PITCH_LENGTH]} />
        <meshStandardMaterial color="#c2b280" roughness={0.8} />
      </mesh>
      
      {bouncePoint && (
        <mesh position={[bouncePoint[0], 0.01, bouncePoint[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
};

const Stump = ({ position, hitType, isHit }: { position: [number, number, number], hitType: 'middle' | 'off' | 'leg', isHit: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const velRef = useRef(new THREE.Vector3());
  const rotVelRef = useRef(new THREE.Vector3());
  const hasHitRef = useRef(false);

  useFrame((state, delta) => {
    if (isHit && !hasHitRef.current) {
      hasHitRef.current = true;
      if (hitType === 'middle') {
        velRef.current.set(0, 1.5, -4);
        rotVelRef.current.set(-6, 0, 0);
      } else {
        velRef.current.set(
          (Math.random() - 0.5) * 3,
          Math.random() * 2 + 1,
          -Math.random() * 4 - 2
        );
        rotVelRef.current.set(
          -Math.random() * 5 - 5,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        );
      }
    } else if (!isHit && hasHitRef.current) {
      hasHitRef.current = false;
      if (groupRef.current) {
        groupRef.current.position.set(...position);
        groupRef.current.rotation.set(0, 0, 0);
      }
    }

    if (isHit && groupRef.current) {
      const dt = Math.min(delta, 0.1);
      velRef.current.y -= 9.81 * dt; // gravity
      
      groupRef.current.position.add(velRef.current.clone().multiplyScalar(dt));
      groupRef.current.rotation.x += rotVelRef.current.x * dt;
      groupRef.current.rotation.y += rotVelRef.current.y * dt;
      groupRef.current.rotation.z += rotVelRef.current.z * dt;

      // Floor collision
      if (groupRef.current.position.y < 0) {
        groupRef.current.position.y = 0;
        velRef.current.y *= -0.5;
        velRef.current.x *= 0.8;
        velRef.current.z *= 0.8;
        rotVelRef.current.multiplyScalar(0.8);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, STUMP_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[STUMP_RADIUS, STUMP_RADIUS, STUMP_HEIGHT, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>
    </group>
  );
};

const Bail = ({ position, isHit }: { position: [number, number, number], isHit: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const velRef = useRef(new THREE.Vector3());
  const rotVelRef = useRef(new THREE.Vector3());
  const hasHitRef = useRef(false);

  useFrame((state, delta) => {
    if (isHit && !hasHitRef.current) {
      hasHitRef.current = true;
      velRef.current.set(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 2,
        -Math.random() * 4 - 1
      );
      rotVelRef.current.set(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
    } else if (!isHit && hasHitRef.current) {
      hasHitRef.current = false;
      if (groupRef.current) {
        groupRef.current.position.set(...position);
        groupRef.current.rotation.set(0, 0, 0);
      }
    }

    if (isHit && groupRef.current) {
      const dt = Math.min(delta, 0.1);
      velRef.current.y -= 9.81 * dt;
      
      groupRef.current.position.add(velRef.current.clone().multiplyScalar(dt));
      groupRef.current.rotation.x += rotVelRef.current.x * dt;
      groupRef.current.rotation.y += rotVelRef.current.y * dt;
      groupRef.current.rotation.z += rotVelRef.current.z * dt;

      if (groupRef.current.position.y < 0) {
        groupRef.current.position.y = 0;
        velRef.current.y *= -0.5;
        velRef.current.x *= 0.8;
        velRef.current.z *= 0.8;
        rotVelRef.current.multiplyScalar(0.8);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, STUMP_SPACING, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
};

export const Stumps = () => {
  const { stumpHit } = useGameStore();

  return (
    <group>
      <Stump position={[0, 0, STUMP_Z]} hitType="middle" isHit={stumpHit === 'middle'} />
      <Stump position={[-STUMP_SPACING, 0, STUMP_Z]} hitType="off" isHit={stumpHit === 'off'} />
      <Stump position={[STUMP_SPACING, 0, STUMP_Z]} hitType="leg" isHit={stumpHit === 'leg'} />
      
      <Bail position={[-STUMP_SPACING / 2, STUMP_HEIGHT + 0.01, STUMP_Z]} isHit={stumpHit !== null} />
      <Bail position={[STUMP_SPACING / 2, STUMP_HEIGHT + 0.01, STUMP_Z]} isHit={stumpHit !== null} />
    </group>
  );
};
