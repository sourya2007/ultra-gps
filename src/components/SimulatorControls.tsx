import React from 'react';
import { Icon } from './Icon';

interface SimulatorControlsProps {
  isSimulating: boolean;
  currentHeading: number;
  onInjectSample: (ax?: number, ay?: number, az?: number) => void;
  onToggleSimulator: () => void;
  onSetHeading: (heading: number) => void;
  onResetTracking: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  isSimulating,
  currentHeading,
  onInjectSample,
  onToggleSimulator,
  onSetHeading,
  onResetTracking,
}) => {
  const handleTurn = (delta: number) => {
    const newHeading = (currentHeading + delta + 360) % 360;
    onSetHeading(newHeading);
  };

  const directions = [
    { label: 'North', deg: 0 },
    { label: 'East', deg: 90 },
    { label: 'South', deg: 180 },
    { label: 'West', deg: 270 },
  ];

  return (
    <div className="surface-card flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <span
          className="uppercase font-semibold"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '0.03em' }}
        >
          Inertial Sensor Simulator
        </span>
        <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
          Record → Smooth → ONNX → Plot
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onInjectSample(0.6, 2.2, 9.81)}
          className="btn btn-accent"
          style={{ padding: '8px 12px', justifyContent: 'center' }}
          title="Inject Single IMU Step"
        >
          <Icon name="show_chart" size={15} style={{ color: 'var(--color-accent-text)' }} />
          <span>Inject Step</span>
        </button>

        <button
          onClick={onToggleSimulator}
          className={`btn ${isSimulating ? 'btn-danger' : 'btn-success'}`}
          style={{ padding: '8px 12px', justifyContent: 'center' }}
          title="Toggle Continuous Motion Simulator"
        >
          <Icon
            name={isSimulating ? 'stop' : 'play_arrow'}
            size={15}
            filled
            style={{ color: isSimulating ? 'var(--color-error-text)' : 'var(--color-success-text)' }}
          />
          <span>{isSimulating ? 'Stop' : 'Stream'}</span>
        </button>

        <button
          onClick={onResetTracking}
          className="btn"
          style={{ padding: '8px 12px', justifyContent: 'center' }}
          title="Clear Trajectory Path & Counters"
        >
          <Icon name="delete_outline" size={15} style={{ color: 'var(--color-error-text)' }} />
          <span>Reset</span>
        </button>
      </div>

      {/* Heading Controls */}
      <div
        className="flex flex-col gap-2 pt-2"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <Icon name="explore" size={14} style={{ color: 'var(--color-accent)' }} />
            Bearing Orientation
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTurn(-15)}
              className="btn"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              title="Turn 15° Left"
            >
              <Icon name="rotate_left" size={12} />
              −15°
            </button>
            <span className="metric-value font-bold text-sm" style={{ color: 'var(--color-accent-text)', minWidth: '36px', textAlign: 'center' }}>
              {Math.round(currentHeading)}°
            </span>
            <button
              onClick={() => handleTurn(15)}
              className="btn"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              title="Turn 15° Right"
            >
              <Icon name="rotate_right" size={12} />
              +15°
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="359"
          value={Math.round(currentHeading)}
          onChange={(e) => onSetHeading(Number(e.target.value))}
        />

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {directions.map(({ label, deg }) => (
            <button
              key={label}
              onClick={() => onSetHeading(deg)}
              className="btn"
              style={{
                padding: '5px 0',
                fontSize: '10px',
                justifyContent: 'center',
                background: Math.round(currentHeading) === deg ? 'var(--color-accent-soft)' : undefined,
                color: Math.round(currentHeading) === deg ? 'var(--color-accent-text)' : undefined,
                borderColor: Math.round(currentHeading) === deg ? 'var(--color-accent)' : undefined,
              }}
            >
              {label} ({deg}°)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
