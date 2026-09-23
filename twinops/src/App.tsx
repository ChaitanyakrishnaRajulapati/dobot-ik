import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { RobotDashboard } from './components/RobotDashboard';
import { RobotController } from './controllers/RobotController';
import { PickAndPlaceController, PickAndPlaceConfig } from './controllers/PickAndPlaceController';
import { RobotJointConfigMap, ControlMode } from './types/robot';
import './App.css';

const DEFAULT_JOINT_CONFIG: RobotJointConfigMap = {
  j1: { objectName: 'J1', axis: 'Y', dir: 1, minAngleDeg: -135, maxAngleDeg: 135, currentAngleDeg: 0, targetAngleDeg: 0 },
  j2: { objectName: 'J2', axis: 'Z', dir: 1, minAngleDeg: -85, maxAngleDeg: 85, currentAngleDeg: 0, targetAngleDeg: 0 },
  j3: { objectName: 'J3', axis: 'Z', dir: 1, minAngleDeg: -90, maxAngleDeg: 90, currentAngleDeg: 0, targetAngleDeg: 0 },
  tipName: 'Tip',
};

const PICK_AND_PLACE_CONFIG: PickAndPlaceConfig = {
  homePose: { j1: 0, j2: 0, j3: 0 },
  pickupApproachPose: { j1: 29, j2: 24, j3: 42 },
  pickupPose: { j1: 29, j2: 44, j3: 56 },
  liftPose: { j1: 29, j2: 15, j3: 25 },
  placeApproachPose: { j1: -29, j2: 15, j3: 25 },
  placePose: { j1: -29, j2: 44, j3: 56 },
  retractPose: { j1: -29, j2: 15, j3: 25 },
  waitDuration: 1.5,
};

export const App: React.FC = () => {
  const robotController = useMemo(() => new RobotController(DEFAULT_JOINT_CONFIG), []);
  const pickAndPlaceController = useMemo(
    () => new PickAndPlaceController(robotController, PICK_AND_PLACE_CONFIG),
    [robotController]
  );

  const [controlMode, setControlMode] = useState<ControlMode>('AUTO');
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [, setTick] = useState<number>(0);

  const handleTelemetryUpdate = () => {
    setTick((t) => (t + 1) % 1000);
  };

  const handleResetCamera = () => {
    window.location.reload();
  };

  return (
    <div className="twinops-app">
      <div className="canvas-wrapper">
        <Canvas shadows camera={{ position: [4.2, 3.2, 4.2], fov: 45 }}>
          <Scene
            robotController={robotController}
            pickAndPlaceController={pickAndPlaceController}
            controlMode={controlMode}
            showAxes={showAxes}
            onTelemetryUpdate={handleTelemetryUpdate}
          />
        </Canvas>
      </div>

      <RobotDashboard
        robotController={robotController}
        pickAndPlaceController={pickAndPlaceController}
        controlMode={controlMode}
        setControlMode={setControlMode}
        showAxes={showAxes}
        setShowAxes={setShowAxes}
        onResetCamera={handleResetCamera}
      />
    </div>
  );
};

export default App;
