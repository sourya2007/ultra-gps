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
      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
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

      {/* Sensor health diagnostic line */}
      <div
        className="surface-inset flex items-center justify-between px-3 py-2 text-xs"
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

      {/* Main Telemetry Bento Grid */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Coordinates */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between border" style={{ minHeight: '96px' }}>
          <div
            className="font-label-caps text-label-caps text-on-surface-variant uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            COORDINATES
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: '22px',
                lineHeight: '28px',
                color: 'var(--color-text-primary)',
              }}
            >
              {location.latitude.toFixed(4)}° N
            </div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '18px',
                marginTop: 4,
                color: 'var(--color-text-tertiary)',
              }}
            >
              {location.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between border" style={{ minHeight: '96px' }}>
          <div
            className="font-label-caps text-label-caps uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            HEADING
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: '22px',
                lineHeight: '28px',
                color: 'var(--color-text-primary)',
              }}
            >
              {Math.round(headingData.heading).toFixed(1)}°
            </div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '18px',
                marginTop: 4,
                color: 'var(--color-text-tertiary)',
              }}
            >
              Magnetic
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between border" style={{ minHeight: '96px' }}>
          <div
            className="font-label-caps text-label-caps uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            SPEED
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: '22px',
                lineHeight: '28px',
                color: 'var(--color-text-primary)',
              }}
            >
              {(navigationMetrics.currentSpeedKmh / 3.6).toFixed(1)}{' '}
              <span style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>m/s</span>
            </div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '18px',
                marginTop: 4,
                color: 'var(--color-text-tertiary)',
              }}
            >
              {navigationMetrics.currentSpeedKmh.toFixed(2)} km/h
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="surface-card p-3 lg:p-4 flex flex-col justify-between border" style={{ minHeight: '96px' }}>
          <div
            className="font-label-caps text-label-caps uppercase"
            style={{
              fontSize: '11px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            DISTANCE
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: '22px',
                lineHeight: '28px',
                color: 'var(--color-text-primary)',
              }}
            >
              {Math.round(navigationMetrics.totalDistanceMeters)}{' '}
              <span style={{ fontSize: '14px', color: 'var(--color-text-tertiary)' }}>m</span>
            </div>
            <div
              style={{
                fontFamily: "'Google Sans Mono', 'JetBrains Mono', monospace",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '18px',
                marginTop: 4,
                color: 'var(--color-text-tertiary)',
              }}
            >
              Session Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};