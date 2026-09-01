import React from 'react';
import type { Coordinates, HeadingData, NavigationMetrics, TrackingMode, SensorStatus, AIInferenceMetrics } from '../types';
import { Icon } from './Icon';

interface TelemetryPanelProps {
  mode: TrackingMode;
  location: Coordinates;
  headingData: HeadingData;
  navigationMetrics: NavigationMetrics;
  sensorStatus: SensorStatus;
  aiMetrics?: AIInferenceMetrics;
  gpsEnabled: boolean;
  onToggleGps: () => void;
  onRequestPermissions: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  mode,
  location,
  headingData,
  navigationMetrics,
  sensorStatus,
  gpsEnabled,
  onToggleGps,
  onRequestPermissions,
}) => {
  const isAi = mode === 'AI_TRANSFORMER';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top Status & GPS Control Header — desktop only */}
      <div className="surface-card hidden lg:flex flex-col gap-3 p-4">
        <div
          className="flex flex-wrap items-center justify-between gap-2 pb-3"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
        <div className="flex items-center gap-2">
          {/* Mode Badge */}
          <div
            className="badge"
            style={{
              background: isAi
                ? 'var(--color-accent-soft)'
                : mode === 'GPS'
                ? 'var(--color-success-soft)'
                : 'var(--color-bg-inset)',
              color: isAi
                ? 'var(--color-accent-text)'
                : mode === 'GPS'
                ? 'var(--color-success-text)'
                : 'var(--color-text-tertiary)',
            }}
          >
            <span
              className="status-dot"
              style={{
                background: isAi
                  ? 'var(--color-accent)'
                  : mode === 'GPS'
                  ? 'var(--color-success)'
                  : 'var(--color-text-tertiary)',
              }}
            />
            {isAi ? 'AI MLP (WebGPU)' : mode === 'GPS' ? 'GPS Active' : 'Acquiring Position'}
          </div>

          {/* Pipeline Tag */}
          <div
            className="badge"
            style={{
              background: 'var(--color-bg-inset)',
              color: 'var(--color-text-tertiary)',
              fontSize: '9px',
            }}
          >
            <Icon name="tune" size={12} style={{ color: 'var(--color-text-tertiary)' }} />
            Gaussian + ZUPT
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={onToggleGps} className="btn btn-accent">
            <Icon name="cell_tower" size={14} style={{ color: 'var(--color-accent-text)' }} />
            <span>{gpsEnabled ? 'GPS: On' : 'GPS: Off (AI)'}</span>
          </button>

          {!sensorStatus.permissionGranted && (
            <button onClick={onRequestPermissions} className="btn" title="Grant Sensor Permissions">
              <Icon name="warning" size={14} style={{ color: 'var(--color-warning-text)' }} filled />
              <span>Sensors</span>
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Sensor Health Diagnostic Line — desktop only */}
      <div
        className="surface-inset hidden lg:flex items-center justify-between px-3 py-2 text-xs"
      >
        <div className="flex items-center gap-2 truncate" style={{ color: 'var(--color-text-secondary)' }}>
          <Icon name="satellite_alt" size={14} style={{ color: 'var(--color-accent)' }} />
          <span className="truncate">{sensorStatus.gpsStatusText}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
          <Icon name="memory" size={14} style={{ color: 'var(--color-accent)' }} />
          {sensorStatus.hasHardwareMotion ? (
            <span style={{ color: 'var(--color-success-text)', fontWeight: 600 }}>IMU Live (6-DOF)</span>
          ) : (
            <span style={{ color: 'var(--color-text-tertiary)' }}>Simulator Ready</span>
          )}
        </div>
      </div>

      {/* Main Telemetry Grid (Bento Boxes) */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Coordinates Box */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between" style={{ minHeight: '88px' }}>
          <div className="metric-label mb-2 tracking-widest text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
            COORDINATES
          </div>
          <div>
            <div className="metric-value text-[15px] lg:text-sm font-semibold truncate">
              {location.latitude.toFixed(4)}° N
            </div>
            <div className="metric-value text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {location.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Heading Box */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between" style={{ minHeight: '88px' }}>
          <div className="metric-label mb-2 tracking-widest text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
            HEADING
          </div>
          <div>
            <div className="metric-value text-[15px] lg:text-sm font-semibold truncate">
              {Math.round(headingData.heading).toFixed(1)}°
            </div>
            <div className="metric-value text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Magnetic
            </div>
          </div>
        </div>

        {/* Speed Box */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between" style={{ minHeight: '88px' }}>
          <div className="metric-label mb-2 tracking-widest text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
            SPEED
          </div>
          <div>
            <div className="metric-value text-[15px] lg:text-sm font-semibold truncate">
              {(navigationMetrics.currentSpeedKmh / 3.6).toFixed(1)} m/s
            </div>
            <div className="metric-value text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {navigationMetrics.currentSpeedKmh.toFixed(2)} km/h
            </div>
          </div>
        </div>

        {/* Distance Box */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between" style={{ minHeight: '88px' }}>
          <div className="metric-label mb-2 tracking-widest text-[10px]" style={{ color: 'var(--color-text-primary)' }}>
            DISTANCE
          </div>
          <div>
            <div className="metric-value text-[15px] lg:text-sm font-semibold truncate">
              {Math.round(navigationMetrics.totalDistanceMeters)} m
            </div>
            <div className="metric-value text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              Session Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
