import React from 'react';
import { RobotController } from '../controllers/RobotController';
import { PickAndPlaceController } from '../controllers/PickAndPlaceController';
import { ControlMode, AxisName } from '../types/robot';

interface RobotDashboardProps {
  robotController: RobotController;
  pickAndPlaceController: PickAndPlaceController;
  controlMode: ControlMode;
  setControlMode: (mode: ControlMode) => void;
  showAxes: boolean;
  setShowAxes: (show: boolean) => void;
  onResetCamera: () => void;
}

export const RobotDashboard: React.FC<RobotDashboardProps> = ({
  robotController,
  pickAndPlaceController,
  controlMode,
  setControlMode,
  showAxes,
  setShowAxes,
  onResetCamera,
}) => {
  const j1 = robotController.joints.j1;
  const j2 = robotController.joints.j2;
  const j3 = robotController.joints.j3;

  const handleSliderChange = (jointKey: 'j1' | 'j2' | 'j3', value: number) => {
    if (controlMode !== 'MANUAL') {
      setControlMode('MANUAL');
    }
    robotController.setSingleJointTarget(jointKey, value);
  };

  const handleAxisChange = (jointKey: 'j1' | 'j2' | 'j3', axis: AxisName) => {
    const axes = {
      j1: robotController.joints.j1.axis,
      j2: robotController.joints.j2.axis,
      j3: robotController.joints.j3.axis,
    };
    axes[jointKey] = axis;
    robotController.setJointAxes(axes.j1, axes.j2, axes.j3);
  };

  const handleGoHome = () => {
    if (controlMode === 'MANUAL') {
      robotController.setJointTargets(
        pickAndPlaceController.config.homePose.j1,
        pickAndPlaceController.config.homePose.j2,
        pickAndPlaceController.config.homePose.j3
      );
    } else {
      pickAndPlaceController.state = 'HOME';
    }
  };

  return (
    <aside className="dashboard-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="logo-title">
          <h2>🤖 TWINOPS</h2>
          <span className="subtitle">REAL-TIME INDUSTRIAL DIGITAL TWIN</span>
        </div>
        <div className="status-indicator">
          <span className="dot online"></span>
          <span className="status-text">SIMULATION ONLINE</span>
        </div>
      </div>

      {/* Control Mode Selector */}
      <div className="section-card">
        <div className="section-title">CONTROL MODE</div>
        <div className="mode-toggle">
          <button
            className={`btn-mode ${controlMode === 'AUTO' ? 'active' : ''}`}
            onClick={() => setControlMode('AUTO')}
          >
            🔄 AUTO MODE
          </button>
          <button
            className={`btn-mode ${controlMode === 'MANUAL' ? 'active' : ''}`}
            onClick={() => setControlMode('MANUAL')}
          >
            🎛️ MANUAL MODE
          </button>
        </div>
        <button className="btn-action full" onClick={handleGoHome}>
          🏠 GO HOME POSE
        </button>
      </div>

      {/* Robot Telemetry Status */}
      <div className="section-card">
        <div className="section-title">ROBOT TELEMETRY</div>
        <div className="telemetry-grid">
          <div className="tel-item">
            <span className="tel-label">J1 (Turret)</span>
            <span className="tel-val">{j1.currentAngleDeg >= 0 ? `+${j1.currentAngleDeg.toFixed(1)}°` : `${j1.currentAngleDeg.toFixed(1)}°`}</span>
          </div>
          <div className="tel-item">
            <span className="tel-label">J2 (Shoulder)</span>
            <span className="tel-val">{j2.currentAngleDeg >= 0 ? `+${j2.currentAngleDeg.toFixed(1)}°` : `${j2.currentAngleDeg.toFixed(1)}°`}</span>
          </div>
          <div className="tel-item">
            <span className="tel-label">J3 (Elbow)</span>
            <span className="tel-val">{j3.currentAngleDeg >= 0 ? `+${j3.currentAngleDeg.toFixed(1)}°` : `${j3.currentAngleDeg.toFixed(1)}°`}</span>
          </div>
        </div>

        <div className="status-summary">
          <div className="status-row">
            <span>Robot State:</span>
            <span className={`badge ${robotController.isMoving ? 'moving' : 'idle'}`}>
              {robotController.isMoving ? 'MOVING' : 'IDLE'}
            </span>
          </div>
          <div className="status-row">
            <span>End Effector:</span>
            <span className={`badge ${pickAndPlaceController.endEffectorState === 'CARRYING' ? 'carrying' : 'free'}`}>
              {pickAndPlaceController.endEffectorState}
            </span>
          </div>
          <div className="status-row">
            <span>Process Step:</span>
            <span className="badge state-name">{pickAndPlaceController.state}</span>
          </div>
          <div className="status-row">
            <span>Data Stream:</span>
            <span className="badge stream">SIMULATED TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Manual Joint Control Panel */}
      <div className="section-card">
        <div className="section-title">MANUAL JOINT CONTROL</div>
        
        {/* J1 Control */}
        <div className="joint-control">
          <div className="joint-label-row">
            <span>J1 Angle</span>
            <span className="val-badge">{j1.currentAngleDeg.toFixed(1)}°</span>
          </div>
          <div className="slider-row">
            <button className="btn-step" onClick={() => handleSliderChange('j1', j1.currentAngleDeg - 5)}>-</button>
            <input
              type="range"
              min={j1.minAngleDeg}
              max={j1.maxAngleDeg}
              step={1}
              value={j1.currentAngleDeg}
              onChange={(e) => handleSliderChange('j1', parseFloat(e.target.value))}
            />
            <button className="btn-step" onClick={() => handleSliderChange('j1', j1.currentAngleDeg + 5)}>+</button>
          </div>
        </div>

        {/* J2 Control */}
        <div className="joint-control">
          <div className="joint-label-row">
            <span>J2 Angle</span>
            <span className="val-badge">{j2.currentAngleDeg.toFixed(1)}°</span>
          </div>
          <div className="slider-row">
            <button className="btn-step" onClick={() => handleSliderChange('j2', j2.currentAngleDeg - 5)}>-</button>
            <input
              type="range"
              min={j2.minAngleDeg}
              max={j2.maxAngleDeg}
              step={1}
              value={j2.currentAngleDeg}
              onChange={(e) => handleSliderChange('j2', parseFloat(e.target.value))}
            />
            <button className="btn-step" onClick={() => handleSliderChange('j2', j2.currentAngleDeg + 5)}>+</button>
          </div>
        </div>

        {/* J3 Control */}
        <div className="joint-control">
          <div className="joint-label-row">
            <span>J3 Angle</span>
            <span className="val-badge">{j3.currentAngleDeg.toFixed(1)}°</span>
          </div>
          <div className="slider-row">
            <button className="btn-step" onClick={() => handleSliderChange('j3', j3.currentAngleDeg - 5)}>-</button>
            <input
              type="range"
              min={j3.minAngleDeg}
              max={j3.maxAngleDeg}
              step={1}
              value={j3.currentAngleDeg}
              onChange={(e) => handleSliderChange('j3', parseFloat(e.target.value))}
            />
            <button className="btn-step" onClick={() => handleSliderChange('j3', j3.currentAngleDeg + 5)}>+</button>
          </div>
        </div>
      </div>

      {/* Axis Debug & Configuration */}
      <div className="section-card">
        <div className="section-title">VISUAL JOINT AXIS DEBUG</div>
        <label className="checkbox-row">
          <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} />
          <span>Show Joint Local Axis Helpers</span>
        </label>

        <div className="axis-config-grid">
          <div className="axis-item">
            <span>J1 Axis:</span>
            <select value={j1.axis} onChange={(e) => handleAxisChange('j1', e.target.value as AxisName)}>
              <option value="X">X Axis</option>
              <option value="Y">Y Axis</option>
              <option value="Z">Z Axis</option>
            </select>
          </div>
          <div className="axis-item">
            <span>J2 Axis:</span>
            <select value={j2.axis} onChange={(e) => handleAxisChange('j2', e.target.value as AxisName)}>
              <option value="X">X Axis</option>
              <option value="Y">Y Axis</option>
              <option value="Z">Z Axis</option>
            </select>
          </div>
          <div className="axis-item">
            <span>J3 Axis:</span>
            <select value={j3.axis} onChange={(e) => handleAxisChange('j3', e.target.value as AxisName)}>
              <option value="X">X Axis</option>
              <option value="Y">Y Axis</option>
              <option value="Z">Z Axis</option>
            </select>
          </div>
        </div>

        <button className="btn-action outline full" style={{ marginTop: '0.75rem' }} onClick={onResetCamera}>
          🎥 RESET CAMERA VIEW
        </button>
      </div>

      {/* Digital Twin Data Flow Architecture */}
      <div className="section-card architecture">
        <div className="section-title">DIGITAL TWIN ARCHITECTURE</div>
        <div className="flow-diagram">
          <div className="flow-node">PHYSICAL ROBOT</div>
          <div className="flow-arrow">↓ (Joint Telemetry)</div>
          <div className="flow-node active">TwinOps Controller</div>
          <div className="flow-arrow">↓ (Quaternion Local Transforms)</div>
          <div className="flow-node highlight">3D DIGITAL TWIN</div>
        </div>
      </div>
    </aside>
  );
};
