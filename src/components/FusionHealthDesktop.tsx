import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface FusionHealthDesktopProps {
  navigationMetrics?: never;
  sensorStatus?: never;
}

export const FusionHealthDesktop: React.FC<FusionHealthDesktopProps> = () => {
  const [drift, setDrift] = useState(0.04);
  const [confidence, setConfidence] = useState(98.2);
  useEffect(() => {
    const t = setInterval(() => {
      setDrift((d) => Math.max(0.02, Math.min(0.12, d + (Math.random() - 0.5) * 0.02)));
      setConfidence((c) => Math.max(96, Math.min(99.5, c + (Math.random() - 0.5) * 1)));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        padding: 32,
        gap: 32,
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            Fusion Health
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: 16,
              color: 'var(--color-text-tertiary)',
            }}
          >
            Core system diagnostics and sensor fusion integrity.
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 16 }}>
          <div className="flex flex-col items-end" style={{ gap: 4 }}>
            <span
              className="uppercase"
              style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
            >
              Fusion_Status
            </span>
            <span
              style={{
                fontFamily: "'Google Sans Flex','Inter',sans-serif",
                fontSize: 22,
                color: 'var(--color-accent-text)',
                fontWeight: 500,
              }}
            >
              NOMINAL
            </span>
          </div>
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: 'var(--color-accent-soft)',
            }}
          >
            <Icon name="check_circle" size={24} style={{ color: 'var(--color-accent-text)' }} />
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 24,
        }}
      >
        {/* LEFT: 3 core metrics stacked (col-span-3) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 3', gap: 24 }}
        >
          {/* Drift Variance */}
          <div
            className="flex flex-col justify-between relative overflow-hidden"
            style={{
              height: 192,
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(195,243,139,0.05) 0%, transparent 60%)',
              }}
            />
            <span
              className="uppercase relative"
              style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
            >
              Drift Variance
            </span>
            <div className="flex items-baseline relative" style={{ gap: 4, marginTop: 8 }}>
              <span
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 28,
                  lineHeight: '34px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                }}
              >
                {drift.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              >
                m/s
              </span>
            </div>
            <div
              className="w-full overflow-hidden relative"
              style={{ height: 8, borderRadius: 9999, background: 'var(--color-bg-inset)', marginTop: 16 }}
            >
              <div
                style={{
                  width: '15%',
                  height: '100%',
                  borderRadius: 9999,
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 8px rgba(195,243,139,0.5)',
                }}
              />
            </div>
          </div>

          {/* Signal Confidence */}
          <div
            className="flex flex-col justify-between relative overflow-hidden"
            style={{
              height: 192,
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(164,201,255,0.05) 0%, transparent 60%)',
              }}
            />
            <span
              className="uppercase relative"
              style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
            >
              Signal Confidence
            </span>
            <div className="flex items-baseline relative" style={{ gap: 4, marginTop: 8 }}>
              <span
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 28,
                  lineHeight: '34px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                }}
              >
                {confidence.toFixed(1)}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              >
                %
              </span>
            </div>
            <div
              className="relative flex-1"
              style={{ marginTop: 16, minHeight: 50 }}
            >
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                style={{ color: '#a4c9ff' }}
              >
                <path
                  d="M0 35 Q 10 30, 20 32 T 40 25 T 60 28 T 80 15 T 100 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M0 40 L0 35 Q 10 30, 20 32 T 40 25 T 60 28 T 80 15 T 100 10 L100 40 Z"
                  fill="currentColor"
                  opacity="0.10"
                />
              </svg>
            </div>
          </div>

          {/* Sensor Status */}
          <div
            className="flex flex-col flex-1"
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <span
              className="uppercase"
              style={{
                fontSize: 10,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-tertiary)',
                marginBottom: 16,
              }}
            >
              Sensor Status
            </span>
            <div className="flex flex-col" style={{ gap: 12 }}>
              <SensorRow label="GNSS" status="LOCKED" tone="accent" />
              <SensorRow label="IMU" status="SYNCED" tone="accent" />
              <SensorRow label="Wheel Tick" status="ACTIVE" tone="secondary" />
              <SensorRow label="Lidar" status="OFFLINE" tone="muted" />
            </div>
          </div>
        </div>

        {/* CENTER: Fusion Engine Core (col-span-9) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 9', gap: 24 }}
        >
          <div
            className="relative flex flex-col flex-1"
            style={{
              minHeight: 500,
              padding: 32,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.30)',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(195,243,139,0.10) 0%, var(--color-bg-elevated) 60%, var(--color-bg-elevated) 100%)',
              }}
            />
            <span
              className="absolute uppercase"
              style={{
                top: 24,
                left: 24,
                fontSize: 10,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-tertiary)',
              }}
            >
              Fusion Engine Core
            </span>
            <div
              className="relative flex-1 flex flex-col items-center justify-center"
              style={{ padding: 32 }}
            >
              <div
                className="relative flex items-center justify-center"
                style={{ width: 384, height: 384 }}
              >
                {/* Outer Ring */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 200 200"
                  style={{ animation: 'spin 20s linear infinite' }}
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(195,243,139,0.30)"
                    strokeDasharray="4 8"
                    strokeWidth="1"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeDasharray="40 160"
                    strokeDashoffset="0"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeDasharray="40 160"
                    strokeDashoffset="100"
                    strokeWidth="2"
                  />
                </svg>

                {/* Middle Ring */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 200 200"
                  style={{ animation: 'spin 15s linear infinite reverse' }}
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="rgba(164,201,255,0.40)"
                    strokeDasharray="2 4"
                    strokeWidth="1"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#a4c9ff"
                    strokeDasharray="20 180"
                    strokeWidth="3"
                  />
                </svg>

                {/* Connecting lines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 200 200"
                >
                  <line x1="100" y1="10" x2="100" y2="30" stroke="rgba(195,243,139,0.50)" strokeWidth="1" />
                  <line x1="100" y1="190" x2="100" y2="170" stroke="rgba(195,243,139,0.50)" strokeWidth="1" />
                  <line x1="10" y1="100" x2="30" y2="100" stroke="rgba(164,201,255,0.50)" strokeWidth="1" />
                  <line x1="190" y1="100" x2="170" y2="100" stroke="rgba(164,201,255,0.50)" strokeWidth="1" />
                </svg>

                {/* Inner core */}
                <div
                  className="relative flex flex-col items-center justify-center"
                  style={{
                    width: 128,
                    height: 128,
                    borderRadius: 9999,
                    background: 'var(--color-bg-inset)',
                    border: '2px solid rgba(195,243,139,0.20)',
                    boxShadow: '0 0 30px rgba(195,243,139,0.10)',
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{ background: 'rgba(195,243,139,0.05)' }}
                  />
                  <span
                    className="relative"
                    style={{
                      fontFamily: "'Google Sans Flex','Inter',sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    KALMAN
                  </span>
                  <span
                    className="relative uppercase"
                    style={{
                      fontSize: 10,
                      fontFamily: "'Google Sans Mono',monospace",
                      letterSpacing: '0.10em',
                      fontWeight: 700,
                      color: 'var(--color-accent-text)',
                      marginTop: 4,
                    }}
                  >
                    FILTER
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom interlocks row (3 cols) */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 24,
            }}
          >
            <InterlockCard
              label="Interlock Alpha"
              title="Clock Sync"
              value="1.2ms"
              valueLabel="Latency"
              icon="sync"
              tone="accent"
            />
            <InterlockCard
              label="Interlock Beta"
              title="Data Pipeline"
              value="4.8 GB/s"
              valueLabel="Throughput"
              icon="cable"
              tone="secondary"
            />
            <InterlockCard
              label="Interlock Gamma"
              title="Redundancy"
              value="Standby"
              valueLabel="Status"
              icon="cloud_off"
              tone="muted"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const SensorRow: React.FC<{ label: string; status: string; tone: 'accent' | 'secondary' | 'muted' }> = ({
  label,
  status,
  tone,
}) => {
  const dotColor =
    tone === 'accent'
      ? 'var(--color-accent)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-text-tertiary)';
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center" style={{ gap: 8 }}>
        <span
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            background: dotColor,
            boxShadow: `0 0 5px ${dotColor}`,
          }}
        />
        <span
          style={{
            fontFamily: "'Google Sans Mono',monospace",
            fontSize: 12,
            color: tone === 'muted' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
      </div>
      <span
        className="uppercase"
        style={{
          fontSize: 10,
          fontFamily: "'Google Sans Mono',monospace",
          color: tone === 'muted' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          letterSpacing: '0.10em',
        }}
      >
        {status}
      </span>
    </div>
  );
};

const InterlockCard: React.FC<{
  label: string;
  title: string;
  value: string;
  valueLabel: string;
  icon: string;
  tone: 'accent' | 'secondary' | 'muted';
}> = ({ label, title, value, valueLabel, icon, tone }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-text-tertiary)';
  return (
    <div
      className="flex flex-col"
      style={{
        padding: 20,
        borderRadius: 16,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderLeft: `4px solid ${tone === 'muted' ? 'var(--color-border)' : color}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        opacity: tone === 'muted' ? 0.7 : 1,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col" style={{ gap: 4 }}>
          <span
            className="uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.10em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: "'Google Sans Flex','Inter',sans-serif",
              fontSize: 16,
              color: 'var(--color-text-primary)',
            }}
          >
            {title}
          </span>
        </div>
        <Icon name={icon} size={20} style={{ color }} />
      </div>
      <div
        className="flex justify-between items-end"
        style={{ marginTop: 12 }}
      >
        <span
          className="uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.10em',
            fontWeight: 700,
            color: 'var(--color-text-tertiary)',
          }}
        >
          {valueLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: tone === 'muted' ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};
