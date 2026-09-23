import { RobotTelemetry } from '../types/robot';

export class RobotTelemetryService {
  private subscribers: ((data: RobotTelemetry) => void)[] = [];

  public subscribe(callback: (data: RobotTelemetry) => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    };
  }

  public emitTelemetry(j1: number, j2: number, j3: number) {
    const telemetry: RobotTelemetry = {
      j1,
      j2,
      j3,
      timestamp: Date.now(),
    };

    this.subscribers.forEach((cb) => cb(telemetry));
  }
}

export const telemetryService = new RobotTelemetryService();
