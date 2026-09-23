import * as THREE from 'three';
import { RobotController } from './RobotController';
import { PickAndPlaceState, EndEffectorState } from '../types/robot';

export interface TargetPose {
  j1: number;
  j2: number;
  j3: number;
}

export interface PickAndPlaceConfig {
  homePose: TargetPose;
  pickupApproachPose: TargetPose;
  pickupPose: TargetPose;
  liftPose: TargetPose;
  placeApproachPose: TargetPose;
  placePose: TargetPose;
  retractPose: TargetPose;
  waitDuration: number;
}

export class PickAndPlaceController {
  public state: PickAndPlaceState = 'HOME';
  public endEffectorState: EndEffectorState = 'FREE';
  public config: PickAndPlaceConfig;
  private stateTimer = 0;
  private robotController: RobotController;
  private blockMesh: THREE.Object3D | null = null;
  private scene: THREE.Scene | null = null;
  private initialBlockPos = new THREE.Vector3();

  constructor(robotController: RobotController, config: PickAndPlaceConfig) {
    this.robotController = robotController;
    this.config = config;
  }

  public setBlockAndScene(blockMesh: THREE.Object3D | null, scene: THREE.Scene | null) {
    this.blockMesh = blockMesh;
    this.scene = scene;
    if (blockMesh) {
      this.initialBlockPos.copy(blockMesh.position);
      this.calculateExactIKPoses();
    }
  }

  /**
   * Dynamically solves exact joint angles for block pickup & crate placement
   * to guarantee 100% alignment with zero visual offset.
   */
  public calculateExactIKPoses() {
    if (!this.blockMesh) return;

    const blockX = this.initialBlockPos.x; // 1.8
    const blockZ = this.initialBlockPos.z; // 1.0
    const tableTopY = 0.375;
    const blockHeight = 0.2;
    const pickupTipY = tableTopY + blockHeight; // 0.575m (exact top surface of block)

    const crateX = 1.8;
    const crateZ = -1.0;
    const crateFloorY = 0.04;
    const placeTipY = crateFloorY + blockHeight; // 0.24m (exact top surface of block in crate)

    // Solve IK for Pickup
    const pickupIK = this.solveRobotIK(blockX, pickupTipY, blockZ);
    const pickupApproachIK = this.solveRobotIK(blockX, pickupTipY + 0.3, blockZ);
    const liftIK = this.solveRobotIK(blockX, pickupTipY + 0.4, blockZ);

    // Solve IK for Placement
    const placeIK = this.solveRobotIK(crateX, placeTipY, crateZ);
    const placeApproachIK = this.solveRobotIK(crateX, placeTipY + 0.3, crateZ);
    const retractIK = this.solveRobotIK(crateX, placeTipY + 0.4, crateZ);

    this.config.pickupApproachPose = { j1: pickupApproachIK.j1Deg, j2: pickupApproachIK.j2Deg, j3: pickupApproachIK.j3Deg };
    this.config.pickupPose = { j1: pickupIK.j1Deg, j2: pickupIK.j2Deg, j3: pickupIK.j3Deg };
    this.config.liftPose = { j1: liftIK.j1Deg, j2: liftIK.j2Deg, j3: liftIK.j3Deg };

    this.config.placeApproachPose = { j1: placeApproachIK.j1Deg, j2: placeApproachIK.j2Deg, j3: placeApproachIK.j3Deg };
    this.config.placePose = { j1: placeIK.j1Deg, j2: placeIK.j2Deg, j3: placeIK.j3Deg };
    this.config.retractPose = { j1: retractIK.j1Deg, j2: retractIK.j2Deg, j3: retractIK.j3Deg };
  }

  private solveRobotIK(targetX: number, targetY: number, targetZ: number) {
    const j1Rad = Math.atan2(targetZ, targetX);
    const radial = Math.sqrt(targetX * targetX + targetZ * targetZ);

    // Shoulder pivot position: (X0 = 0.6, Y0 = 0.85)
    // Tip downward offset: Y_offset = -0.28m
    const dr = radial - 0.6;
    const dz = targetY - (0.85 - 0.28);

    const L1 = 1.35;
    const L2 = 1.47;

    const radiusSq = dr * dr + dz * dz;
    const radius = Math.sqrt(radiusSq);
    const gamma = Math.atan2(dz, dr);

    const cosBeta = (radiusSq - L1 * L1 - L2 * L2) / (-2.0 * L1 * L2);
    const clampedCosBeta = THREE.MathUtils.clamp(cosBeta, -1.0, 1.0);
    const beta = Math.acos(clampedCosBeta);

    const alpha = radius > 0 ? Math.asin(THREE.MathUtils.clamp((L2 * Math.sin(beta)) / radius, -1.0, 1.0)) : 0;

    const j2Rad = (Math.PI / 2.0) - alpha - gamma;
    const j3Rad = Math.PI - beta - alpha - gamma;

    return {
      j1Deg: THREE.MathUtils.radToDeg(j1Rad),
      j2Deg: THREE.MathUtils.radToDeg(j2Rad),
      j3Deg: THREE.MathUtils.radToDeg(j3Rad)
    };
  }

  public update(deltaSeconds: number) {
    if (this.robotController.isMoving) {
      return;
    }

    switch (this.state) {
      case 'HOME':
        this.robotController.setJointTargets(
          this.config.homePose.j1,
          this.config.homePose.j2,
          this.config.homePose.j3
        );
        this.state = 'MOVE_TO_PICKUP_APPROACH';
        break;

      case 'MOVE_TO_PICKUP_APPROACH':
        this.robotController.setJointTargets(
          this.config.pickupApproachPose.j1,
          this.config.pickupApproachPose.j2,
          this.config.pickupApproachPose.j3
        );
        this.state = 'MOVE_TO_PICKUP';
        break;

      case 'MOVE_TO_PICKUP':
        this.robotController.setJointTargets(
          this.config.pickupPose.j1,
          this.config.pickupPose.j2,
          this.config.pickupPose.j3
        );
        this.state = 'PICK';
        break;

      case 'PICK':
        this.attachBlockToTip();
        this.endEffectorState = 'CARRYING';
        this.state = 'LIFT';
        break;

      case 'LIFT':
        this.robotController.setJointTargets(
          this.config.liftPose.j1,
          this.config.liftPose.j2,
          this.config.liftPose.j3
        );
        this.state = 'MOVE_TO_PLACE_APPROACH';
        break;

      case 'MOVE_TO_PLACE_APPROACH':
        this.robotController.setJointTargets(
          this.config.placeApproachPose.j1,
          this.config.placeApproachPose.j2,
          this.config.placeApproachPose.j3
        );
        this.state = 'MOVE_TO_PLACE';
        break;

      case 'MOVE_TO_PLACE':
        this.robotController.setJointTargets(
          this.config.placePose.j1,
          this.config.placePose.j2,
          this.config.placePose.j3
        );
        this.state = 'PLACE';
        break;

      case 'PLACE':
        this.detachBlockFromTip();
        this.endEffectorState = 'FREE';
        this.state = 'RETRACT';
        break;

      case 'RETRACT':
        this.robotController.setJointTargets(
          this.config.retractPose.j1,
          this.config.retractPose.j2,
          this.config.retractPose.j3
        );
        this.state = 'RETURN_HOME';
        break;

      case 'RETURN_HOME':
        this.robotController.setJointTargets(
          this.config.homePose.j1,
          this.config.homePose.j2,
          this.config.homePose.j3
        );
        this.state = 'WAIT';
        this.stateTimer = 0;
        break;

      case 'WAIT':
        this.stateTimer += deltaSeconds;
        if (this.stateTimer >= this.config.waitDuration) {
          this.resetBlockPosition();
          this.state = 'MOVE_TO_PICKUP_APPROACH';
        }
        break;

      case 'PAUSED':
        break;
    }
  }

  public attachBlockToTip() {
    if (!this.blockMesh || !this.robotController.tipNode) return;
    this.robotController.tipNode.attach(this.blockMesh);
  }

  public detachBlockFromTip() {
    if (!this.blockMesh || !this.scene) return;
    this.scene.attach(this.blockMesh);
    // Align block exactly inside crate
    this.blockMesh.position.set(1.8, 0.14, -1.0);
    this.blockMesh.rotation.set(0, 0, 0);
  }

  public resetBlockPosition() {
    if (!this.blockMesh || !this.scene) return;

    if (this.blockMesh.parent !== this.scene) {
      this.scene.attach(this.blockMesh);
    }
    this.blockMesh.position.copy(this.initialBlockPos); // (1.8, 0.475, 1.0)
    this.blockMesh.rotation.set(0, 0, 0);
    this.endEffectorState = 'FREE';
  }
}
