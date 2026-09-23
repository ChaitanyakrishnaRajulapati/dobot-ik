import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RobotModel } from './RobotModel';
import { RobotController } from '../controllers/RobotController';
import { PickAndPlaceController } from '../controllers/PickAndPlaceController';
import { ControlMode } from '../types/robot';

interface SceneProps {
  robotController: RobotController;
  pickAndPlaceController: PickAndPlaceController;
  controlMode: ControlMode;
  showAxes: boolean;
  onTelemetryUpdate: (j1: number, j2: number, j3: number) => void;
}

export const Scene: React.FC<SceneProps> = ({
  robotController,
  pickAndPlaceController,
  controlMode,
  showAxes,
  onTelemetryUpdate,
}) => {
  const blockRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const { scene } = useThree();

  useEffect(() => {
    if (blockRef.current) {
      pickAndPlaceController.setBlockAndScene(blockRef.current, scene);
    }
  }, [pickAndPlaceController, scene]);

  useFrame((_, delta) => {
    if (controlMode === 'AUTO') {
      pickAndPlaceController.update(delta);
    }
    robotController.update(delta);

    onTelemetryUpdate(
      robotController.joints.j1.currentAngleDeg,
      robotController.joints.j2.currentAngleDeg,
      robotController.joints.j3.currentAngleDeg
    );
  });

  return (
    <>
      <color attach="background" args={['#0b1120']} />
      <fog attach="fog" args={['#0b1120', 10, 30]} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={15}
        target={[0.8, 0.8, 0]}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 4, -6]} intensity={0.4} color="#38bdf8" />

      {/* Factory Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.2} />
      </mesh>
      <gridHelper args={[30, 60, 0x38bdf8, 0x334155]} position={[0, 0.001, 0]} />

      {/* Work Table & Pickup Zone */}
      <group position={[1.8, 0, 1.0]}>
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.05, 0.8]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.5} />
        </mesh>
        {[-0.35, 0.35].map((x) =>
          [-0.35, 0.35].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.175, z]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.35, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.6} />
            </mesh>
          ))
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.378, 0]}>
          <ringGeometry args={[0.12, 0.14, 32]} />
          <meshBasicMaterial color="#f97316" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Orange Block A */}
      <mesh ref={blockRef} position={[1.8, 0.475, 1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Placement Crate Zone */}
      <group position={[1.8, 0, -1.0]}>
        <mesh position={[0, 0.02, 0]} receiveShadow>
          <boxGeometry args={[0.8, 0.04, 0.8]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[-0.38, 0.18, 0]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.8]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0.38, 0.18, 0]} castShadow>
          <boxGeometry args={[0.04, 0.32, 0.8]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, 0.38]} castShadow>
          <boxGeometry args={[0.8, 0.32, 0.04]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, -0.38]} castShadow>
          <boxGeometry args={[0.8, 0.32, 0.04]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} metalness={0.4} />
        </mesh>
      </group>

      {/* Robot Model */}
      <RobotModel controller={robotController} showAxes={showAxes} />
    </>
  );
};
