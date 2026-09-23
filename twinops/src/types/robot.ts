export type AxisName = 'X' | 'Y' | 'Z';

export interface JointConfig {
  objectName: string;
  axis: AxisName;
  dir: number; // 1 or -1 to invert direction if local node axes differ
  minAngleDeg: number;
  maxAngleDeg: number;
  currentAngleDeg: number;
  targetAngleDeg: number;
}

export interface RobotJointConfigMap {
  j1: JointConfig;
  j2: JointConfig;
  j3: JointConfig;
  tipName: string;
}

export interface RobotTelemetry {
  j1: number; // degrees
  j2: number; // degrees
  j3: number; // degrees
  timestamp: number;
}

export type RobotState = 'IDLE' | 'MOVING' | 'HOMING' | 'ERROR';
export type EndEffectorState = 'FREE' | 'CARRYING';
export type ControlMode = 'AUTO' | 'MANUAL';

export type PickAndPlaceState =
  | 'HOME'
  | 'MOVE_TO_PICKUP_APPROACH'
  | 'MOVE_TO_PICKUP'
  | 'PICK'
  | 'LIFT'
  | 'MOVE_TO_PLACE_APPROACH'
  | 'MOVE_TO_PLACE'
  | 'PLACE'
  | 'RETRACT'
  | 'RETURN_HOME'
  | 'WAIT'
  | 'PAUSED';
