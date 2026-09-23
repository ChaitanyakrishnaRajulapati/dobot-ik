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
    }
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
  }

  public resetBlockPosition() {
    if (!this.blockMesh || !this.scene) return;

    if (this.blockMesh.parent !== this.scene) {
      this.scene.attach(this.blockMesh);
    }
    this.blockMesh.position.copy(this.initialBlockPos);
    this.blockMesh.rotation.set(0, 0, 0);
    this.endEffectorState = 'FREE';
  }
}
