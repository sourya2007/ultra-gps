import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';
import type { HeadingData, MapLayerType, SensorStatus } from '../types';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  sensorStatus: SensorStatus;
  headingData: HeadingData;
  activeMapLayer: MapLayerType;
  onChangeMapLayer: (layer: MapLayerType) => void;
  /** Derived accelerometer health: true when the recent motion samples show
   *  high variance that hasn't been smoothed out — i.e. the sensor is
   *  "drifting" and the device should be recalibrated. */
  isAccelDrifting?: boolean;
}

const MAP_LAYER_OPTIONS: { key: MapLayerType; label: string; icon: string }[] = [
  { key: 'dark', label: 'Dark', icon: 'dark_mode' },
  { key: 'street', label: 'Light', icon: 'wb_sunny' },
  { key: 'satellite', label: 'Sat', icon: 'satellite' },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onClose,
  sensorStatus,
  headingData,
  activeMapLayer,
  onChangeMapLayer,
  isAccelDrifting = false,
}) => {
  const { isDark, toggleTheme } = useTheme();

  // Local UI state — persisted in sessionStorage so the value sticks across opens
  const [units, setUnits] = useState<'metric' | 'imperial'>(() => {
    if (typeof window === 'undefined') return 'metric';
    return (sessionStorage.getItem('setting:units') as 'metric' | 'imperial') || 'metric';
  });
  const [sensitivity, setSensitivity] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.85;
    const v = Number(sessionStorage.getItem('setting:sensitivity'));
    return Number.isFinite(v) && v >= 0 && v <= 1 ? v : 0.85;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('setting:units', units);
    }
  }, [units]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('setting:sensitivity', String(sensitivity));
    }
  }, [sensitivity]);

  // Lock background scroll while panel is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Derived sensor status info
  const gyroStatus = sensorStatus.gyroAvailable
    ? sensorStatus.hasHardwareMotion
      ? { label: 'Calibrated', tone: 'success' as const }
      : { label: 'Standby', tone: 'warning' as const }
    : { label: 'Unavailable', tone: 'error' as const };
  const accelStatus = sensorStatus.accelAvailable
    ? isAccelDrifting
      ? { label: 'Drifting', tone: 'error' as const }
      : sensorStatus.hasHardwareMotion
      ? { label: 'Calibrated', tone: 'success' as const }
      : { label: 'Standby', tone: 'warning' as const }
    : { label: 'Unavailable', tone: 'error' as const };
  const magStatus = headingData.source === 'absolute' || headingData.source === 'webkit'
    ? { label: 'Nominal', tone: 'success' as const }
    : headingData.source === 'fallback'
    ? { label: 'Degraded', tone: 'warning' as const }
    : { label: 'Calibrating', tone: 'warning' as const };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[650]"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px) saturate(140%)',
          WebkitBackdropFilter: 'blur(6px) saturate(140%)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
        aria-hidden
      />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="System Settings"
        className="fixed inset-0 z-[660] flex flex-col"
        style={{
          background: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
          fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(8px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.2, 0, 0, 1), transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-4 shrink-0"
          style={{
            height: 64,
            padding: '0 20px',
            borderBottom: '1px solid var(--color-border)',
            background: 'var(--color-bg-primary)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            <Icon name="arrow_back" size={20} />
          </button>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent-text)' }}
          >
            <Icon name="explore" size={20} filled />
          </div>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            System Settings
          </h1>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
          style={{ padding: '16px' }}
        >
          {/* Sensor Calibration Group */}
          <Section title="Sensor Calibration" icon="sensors">
            <Row
              icon="360"
              iconColor="var(--color-accent)"
              title="Gyroscope"
              status={gyroStatus.label}
              statusTone={gyroStatus.tone}
            />
            <Divider />
            <Row
              icon="speed"
              iconColor="var(--color-accent)"
              title="Accelerometer"
              status={accelStatus.label}
              statusTone={accelStatus.tone}
              trailingDot={accelStatus.tone === 'error'}
            />
            <Divider />
            <Row
              icon="explore"
              iconColor="var(--color-accent)"
              title="Magnetometer"
              status={magStatus.label}
              statusTone={magStatus.tone}
            />
          </Section>

          {/* Display & Preferences Group */}
          <Section title="Display & Preferences" icon="tv_options_edit_channels">
            {/* Map Style */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div
                className="font-semibold"
                style={{ fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: 12 }}
              >
                Map Style
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MAP_LAYER_OPTIONS.map(({ key, label, icon }) => {
                  const active = activeMapLayer === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onChangeMapLayer(key)}
                      className="flex flex-col items-center gap-2"
                      style={{
                        padding: '14px 8px',
                        borderRadius: 'var(--radius-md)',
                        background: active
                          ? 'var(--color-accent-soft)'
                          : 'var(--color-bg-inset)',
                        border: `1px solid ${
                          active ? 'var(--color-accent)' : 'var(--color-border)'
                        }`,
                        color: active
                          ? 'var(--color-accent-text)'
                          : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon name={icon} size={26} />
                      <span
                        className="uppercase font-bold"
                        style={{ fontSize: '11px', letterSpacing: '0.08em' }}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme toggle */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div>
                <div
                  className="font-semibold"
                  style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
                >
                  Color Mode
                </div>
                <div
                  style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: 2 }}
                >
                  Current: {isDark ? 'Dark' : 'Light'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle color mode"
                className="theme-toggle"
              />
            </div>

            {/* Measurement System */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '16px', borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div>
                <div
                  className="font-semibold"
                  style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
                >
                  Measurement System
                </div>
                <div
                  style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: 2 }}
                >
                  Current: {units === 'metric' ? 'Metric' : 'Imperial'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnits((u) => (u === 'metric' ? 'imperial' : 'metric'))}
                aria-label="Toggle measurement system"
                className="theme-toggle"
                style={{
                  background: units === 'metric' ? 'var(--color-accent)' : 'var(--color-bg-inset)',
                }}
              />
            </div>

            {/* IMU Filter Sensitivity slider */}
            <div style={{ padding: '16px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <div
                  className="font-semibold"
                  style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
                >
                  IMU Filter Sensitivity
                </div>
                <div
                  style={{
                    fontFamily: "'Google Sans Mono', monospace",
                    fontSize: '13px',
                    color: 'var(--color-accent-text)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {sensitivity.toFixed(2)}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div
                className="flex justify-between"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 4,
                }}
              >
                <span>Raw</span>
                <span>Smooth</span>
              </div>
            </div>
          </Section>

          {/* System Info */}
          <div
            className="flex flex-col items-center justify-center"
            style={{ padding: '24px 16px' }}
          >
            <div
              className="text-center"
              style={{
                fontFamily: "'Google Sans Mono', monospace",
                fontSize: '12px',
                color: 'var(--color-text-tertiary)',
                lineHeight: 1.6,
              }}
            >
              System v2.4.1 (Build 8902)
              <br />
              <span style={{ opacity: 0.7 }}>Last synced: 2m ago</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// =================== Sub-components ===================

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div
    className="surface-card"
    style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      marginBottom: 12,
      position: 'relative',
    }}
  >
    <div
      className="flex items-center justify-between"
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      <Icon name={icon} size={18} style={{ color: 'var(--color-text-tertiary)' }} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>
  </div>
);

const Divider: React.FC = () => (
  <div style={{ borderBottom: '1px solid var(--color-border-subtle)' }} />
);

type Tone = 'success' | 'warning' | 'error';

const Row: React.FC<{
  icon: string;
  iconColor: string;
  title: string;
  status: string;
  statusTone: Tone;
  trailingDot?: boolean;
}> = ({ icon, iconColor, title, status, statusTone, trailingDot = false }) => {
  const statusColor =
    statusTone === 'success'
      ? 'var(--color-success-text)'
      : statusTone === 'warning'
      ? 'var(--color-warning-text)'
      : 'var(--color-error-text)';

  return (
    <button
      type="button"
      className="flex items-center justify-between w-full text-left"
      style={{
        padding: '14px 16px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-inset)',
            color: iconColor,
          }}
        >
          <Icon name={icon} size={20} filled />
        </div>
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: '15px', color: 'var(--color-text-primary)' }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: 2,
            }}
          >
            Status: <span style={{ color: statusColor, fontWeight: 600 }}>{status}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {trailingDot && (
          <span
            className="status-dot"
            style={{
              background:
                statusTone === 'error'
                  ? 'var(--color-error)'
                  : statusTone === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
            }}
          />
        )}
        <Icon name="chevron_right" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
      </div>
    </button>
  );
};