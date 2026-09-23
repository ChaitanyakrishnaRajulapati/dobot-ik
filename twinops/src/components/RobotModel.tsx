import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RobotController } from '../controllers/RobotController';

interface RobotModelProps {
  controller: RobotController;
  showAxes: boolean;
}

export const RobotModel: React.FC<RobotModelProps> = ({ controller, showAxes }) => {
  const baseRef = useRef<THREE.Group>(null);
  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const tipRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (j1Ref.current && j2Ref.current && j3Ref.current && tipRef.current) {
      controller.bindNodes(j1Ref.current, j2Ref.current, j3Ref.current, tipRef.current);
    }
  }, [controller]);

  return (
    <group ref={baseRef} position={[0, 0, 0]}>
      {/* Base Pedestal */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.6, 0.5, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Joint 1: Turret (Y-Axis) */}
      <group ref={j1Ref} position={[0, 0.5, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.45, 0.4, 32]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.8} />
        </mesh>
        {/* Base Offset Arm to Shoulder Pivot */}
        <mesh position={[0.3, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.25, 0.35]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} metalness={0.8} />
        </mesh>
        {showAxes && <primitive object={new THREE.AxesHelper(0.6)} />}

        {/* Joint 2: Shoulder (Z-Axis or X-Axis) */}
        <group ref={j2Ref} position={[0.6, 0.35, 0]}>
          {/* Shoulder Bearing Cap */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 0.4, 24]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Link 1 (Rear Arm: Length = 1.35m) */}
          <mesh position={[0, 0.675, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.22, 1.35, 0.22]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.3} metalness={0.9} />
          </mesh>
          {showAxes && <primitive object={new THREE.AxesHelper(0.6)} />}

          {/* Joint 3: Elbow (Z-Axis or X-Axis) */}
          <group ref={j3Ref} position={[0, 1.35, 0]}>
            {/* Elbow Bearing Cap */}
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.35, 24]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Link 2 (Forearm: Length = 1.47m) */}
            <mesh position={[0.735, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.47, 0.18, 0.18]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.6} />
            </mesh>
            {showAxes && <primitive object={new THREE.AxesHelper(0.6)} />}

            {/* Suction Cup / End Effector Assembly */}
            <mesh position={[1.47, -0.1, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.3} />
            </mesh>
            <mesh position={[1.47, -0.22, 0]} rotation={[Math.PI, 0, 0]} castShadow>
              <coneGeometry args={[0.12, 0.12, 24]} />
              <meshStandardMaterial color="#22c55e" roughness={0.2} />
            </mesh>

            {/* Tip Node / End Effector Contact Point */}
            <group ref={tipRef} position={[1.47, -0.28, 0]}>
              {showAxes && <primitive object={new THREE.AxesHelper(0.4)} />}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
