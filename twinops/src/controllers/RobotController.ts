import * as THREE from 'three';
import { RobotJointConfigMap, AxisName } from '../types/robot';

export interface InternalJointData {
  node: THREE.Object3D | null;
  initialQuaternion: THREE.Quaternion;
  axis: AxisName;
  dir: number;
  currentAngleDeg: number;
  targetAngleDeg: number;
  startAngleDeg: number;
  minAngleDeg: number;
  maxAngleDeg: number;
}

export class RobotController {
  public joints: {
    j1: InternalJointData;
    j2: InternalJointData;
    j3: InternalJointData;
  };
  public tipNode: THREE.Object3D | null = null;
  public moveProgress = 1.0;
  public moveDuration = 1.0;
  public isMoving = false;

  constructor(config: RobotJointConfigMap) {
    this.joints = {
      j1: {
        node: null,
        initialQuaternion: new THREE.Quaternion(),
        axis: config.j1.axis,
        dir: config.j1.dir,
        currentAngleDeg: config.j1.currentAngleDeg,
        targetAngleDeg: config.j1.targetAngleDeg,
        startAngleDeg: config.j1.currentAngleDeg,
        minAngleDeg: config.j1.minAngleDeg,
        maxAngleDeg: config.j1.maxAngleDeg,
      },
      j2: {
        node: null,
        initialQuaternion: new THREE.Quaternion(),
        axis: config.j2.axis,
        dir: config.j2.dir,
        currentAngleDeg: config.j2.currentAngleDeg,
        targetAngleDeg: config.j2.targetAngleDeg,
        startAngleDeg: config.j2.currentAngleDeg,
        minAngleDeg: config.j2.minAngleDeg,
        maxAngleDeg: config.j2.maxAngleDeg,
      },
      j3: {
        node: null,
        initialQuaternion: new THREE.Quaternion(),
        axis: config.j3.axis,
        dir: config.j3.dir,
        currentAngleDeg: config.j3.currentAngleDeg,
        targetAngleDeg: config.j3.targetAngleDeg,
        startAngleDeg: config.j3.currentAngleDeg,
        minAngleDeg: config.j3.minAngleDeg,
        maxAngleDeg: config.j3.maxAngleDeg,
      },
    };
  }

  public bindNodes(
    j1Node: THREE.Object3D | null,
    j2Node: THREE.Object3D | null,
    j3Node: THREE.Object3D | null,
    tipNode: THREE.Object3D | null
  ) {
    if (j1Node) {
      this.joints.j1.node = j1Node;
      this.joints.j1.initialQuaternion.copy(j1Node.quaternion);
    }
    if (j2Node) {
      this.joints.j2.node = j2Node;
      this.joints.j2.initialQuaternion.copy(j2Node.quaternion);
    }
    if (j3Node) {
      this.joints.j3.node = j3Node;
      this.joints.j3.initialQuaternion.copy(j3Node.quaternion);
    }
    this.tipNode = tipNode;

    this.applyAllJointRotations();
  }

  public setJointAxes(j1Axis: AxisName, j2Axis: AxisName, j3Axis: AxisName) {
    this.joints.j1.axis = j1Axis;
    this.joints.j2.axis = j2Axis;
    this.joints.j3.axis = j3Axis;
    this.applyAllJointRotations();
  }

  public setJointTargets(j1Deg: number, j2Deg: number, j3Deg: number, speedMultiplier = 1.0) {
    const target1 = THREE.MathUtils.clamp(j1Deg, this.joints.j1.minAngleDeg, this.joints.j1.maxAngleDeg);
    const target2 = THREE.MathUtils.clamp(j2Deg, this.joints.j2.minAngleDeg, this.joints.j2.maxAngleDeg);
    const target3 = THREE.MathUtils.clamp(j3Deg, this.joints.j3.minAngleDeg, this.joints.j3.maxAngleDeg);

    this.joints.j1.startAngleDeg = this.joints.j1.currentAngleDeg;
    this.joints.j2.startAngleDeg = this.joints.j2.currentAngleDeg;
    this.joints.j3.startAngleDeg = this.joints.j3.currentAngleDeg;

    this.joints.j1.targetAngleDeg = target1;
    this.joints.j2.targetAngleDeg = target2;
    this.joints.j3.targetAngleDeg = target3;

    const dist1 = Math.abs(target1 - this.joints.j1.startAngleDeg);
    const dist2 = Math.abs(target2 - this.joints.j2.startAngleDeg);
    const dist3 = Math.abs(target3 - this.joints.j3.startAngleDeg);
    const maxDist = Math.max(dist1, dist2, dist3);

    if (maxDist < 0.01) {
      this.moveProgress = 1.0;
      this.isMoving = false;
      return;
    }

    const baseDuration = maxDist / 60.0; // 60 deg / sec base velocity
    this.moveDuration = Math.max(0.3, baseDuration / speedMultiplier);
    this.moveProgress = 0.0;
    this.isMoving = true;
  }

  public setSingleJointTarget(jointKey: 'j1' | 'j2' | 'j3', angleDeg: number) {
    const j = this.joints[jointKey];
    j.targetAngleDeg = THREE.MathUtils.clamp(angleDeg, j.minAngleDeg, j.maxAngleDeg);
    j.currentAngleDeg = j.targetAngleDeg;
    this.applyJointRotation(jointKey);
  }

  public update(deltaSeconds: number) {
    if (!this.isMoving) return;

    this.moveProgress += deltaSeconds / this.moveDuration;

    if (this.moveProgress >= 1.0) {
      this.moveProgress = 1.0;
      this.isMoving = false;

      this.joints.j1.currentAngleDeg = this.joints.j1.targetAngleDeg;
      this.joints.j2.currentAngleDeg = this.joints.j2.targetAngleDeg;
      this.joints.j3.currentAngleDeg = this.joints.j3.targetAngleDeg;
    } else {
      const t = this.easeInOutCubic(this.moveProgress);

      this.joints.j1.currentAngleDeg = this.joints.j1.startAngleDeg + (this.joints.j1.targetAngleDeg - this.joints.j1.startAngleDeg) * t;
      this.joints.j2.currentAngleDeg = this.joints.j2.startAngleDeg + (this.joints.j2.targetAngleDeg - this.joints.j2.startAngleDeg) * t;
      this.joints.j3.currentAngleDeg = this.joints.j3.startAngleDeg + (this.joints.j3.targetAngleDeg - this.joints.j3.startAngleDeg) * t;
    }

    this.applyAllJointRotations();
  }

  public applyAllJointRotations() {
    this.applyJointRotation('j1');
    this.applyJointRotation('j2');
    this.applyJointRotation('j3');
  }

  private applyJointRotation(jointKey: 'j1' | 'j2' | 'j3') {
    const joint = this.joints[jointKey];
    if (!joint.node) return;

    const angleRad = THREE.MathUtils.degToRad(joint.currentAngleDeg) * joint.dir;
    const axisVector = this.getAxisVector(joint.axis);

    // CRITICAL LOCAL ROTATION MATRIX: newLocal = initialLocal * QuaternionFromAxisAngle(localJointAxis, currentJointAngle)
    const qRot = new THREE.Quaternion().setFromAxisAngle(axisVector, angleRad);
    joint.node.quaternion.copy(joint.initialQuaternion).multiply(qRot);
  }

  private getAxisVector(axis: AxisName): THREE.Vector3 {
    switch (axis) {
      case 'X': return new THREE.Vector3(1, 0, 0);
      case 'Y': return new THREE.Vector3(0, 1, 0);
      case 'Z': return new THREE.Vector3(0, 0, 1);
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
