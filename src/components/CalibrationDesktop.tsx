import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

interface CalibrationDesktopProps {
  onResetSensors?: () => void;
  onConfirmAlignment?: () => void;
}

interface Criterion {
  key: string;
  title: string;
  desc: string;
  status: 'pass' | 'pending' | 'warn';
  badge: string;
  progress?: number;
  tone: 'accent' | 'secondary' | 'error' | 'muted';
}

const CRITERIA: Criterion[] = [
  {
    key: 'static',
    title: 'Static Stability',
    desc: 'Variance < 0.05° over 10s',
    status: 'pass',
    badge: 'PASS',
    tone: 'accent',
  },
  {
    key: 'mag',
    title: 'Magnetometer Interference',
    desc: 'Deviation < 2µT from baseline',
    status: 'pending',
    badge: 'PENDING',
    tone: 'muted',
  },
  {
    key: 'thermal',
    title: 'Thermal Equilibrium',
    desc: 'Core temp drift < 0.1°C/min',
    status: 'warn',
    badge: 'WARN',
    progress: 85,
    tone: 'error',
  },
  {
    key: 'gps',
    title: 'GPS Baseline Vector',
    desc: 'Fixed RTK lock required',
    status: 'pass',
    badge: 'PASS',
    tone: 'accent',
  },
];

export const CalibrationDesktop: React.FC<CalibrationDesktopProps> = ({
  onResetSensors,
  onConfirmAlignment,
}) => {
  const [pitch, setPitch] = useState(15.2);
  const [roll, setRoll] = useState(-4.8);
  const [yaw, setYaw] = useState(182.4);

  const cubeRef = useRef<SVGGElement | null>(null);
  const streamRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (cubeRef.current) {
      cubeRef.current.style.transform = `rotateX(${pitch}deg) rotateY(${
        yaw - 180
      }deg) rotateZ(${roll}deg)`;
    }
  }, [pitch, roll, yaw]);

  useEffect(() => {
    const t = setInterval(() => {
      const node = streamRef.current;
      if (!node) return;
      while (node.firstChild && node.children.length > 8) {
        node.removeChild(node.lastChild as Node);
      }
      const now = new Date();
      const timeStr = `${now
        .getHours()
        .toString()
        .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      const types = ['ACC', 'GYR', 'MAG'];
      const type = types[Math.floor(Math.random() * 3)];
      let x = '0.000',
        y = '0.000',
        z = '0.000';
      if (type === 'ACC') {
        x = (Math.random() * 0.01).toFixed(3);
        y = (Math.random() * -0.02).toFixed(3);
        z = (9.8 + Math.random() * 0.05).toFixed(3);
      } else if (type === 'GYR') {
        x = (Math.random() * 0.01 - 0.005).toFixed(3);
        y = (Math.random() * 0.01 - 0.005).toFixed(3);
        z = (Math.random() * 0.01 - 0.005).toFixed(3);
      } else {
        x = (20 + Math.random() * 10).toFixed(2);
        y = (-20 + Math.random() * 15).toFixed(2);
        z = (40 + Math.random() * 10).toFixed(2);
      }

      const line = document.createElement('div');
      line.textContent = `[${timeStr}] ${type}: X: ${x}, Y: ${y}, Z: ${z}`;
      node.prepend(line);
      while (node.children.length > 8) {
        node.removeChild(node.lastChild as Node);
      }
    }, 200);
    return () => clearInterval(t);
  }, []);

  const fmt = (v: number, withSign = false) => {
    const sign = withSign && v > 0 ? '+' : '';
    return `${sign}${v.toFixed(1)}°`;
  };

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
      <div
        className="flex items-end justify-between"
        style={{
          paddingBottom: 16,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            className="block"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-text)',
              marginBottom: 8,
            }}
          >
            Phase 3 // Hardware Integration
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            IMU Calibration Sequence
          </h1>
        </div>
        <div className="flex" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={onResetSensors}
            className="flex items-center"
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              gap: 8,
            }}
          >
            <Icon name="sync" size={16} />
            Reset Sensors
          </button>
          <button
            type="button"
            onClick={onConfirmAlignment}
            className="flex items-center"
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              gap: 8,
              boxShadow: '0 0 15px rgba(195,243,139,0.30)',
            }}
          >
            <Icon name="check_circle" size={16} />
            Confirm Alignment
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 24,
        }}
      >
        {/* Left column */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          {/* 3D Viewport */}
          <div
            className="relative overflow-hidden"
            style={{
              height: 560,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            {/* Grid overlay */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.2,
              }}
            />
            {/* Soft ambient gradient */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, var(--color-accent-soft), transparent 60%)',
                opacity: 0.5,
              }}
            />

            {/* IMU SVG */}
            <div
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
                width: 'min(420px, 80%)',
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg
                viewBox="0 0 400 400"
                width="100%"
                height="100%"
                style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))' }}
              >
                {/* Axes */}
                <line
                  x1="200"
                  y1="200"
                  x2="350"
                  y2="200"
                  stroke="var(--color-error)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.7"
                />
                <text
                  x="360"
                  y="206"
                  fill="var(--color-error)"
                  fontFamily="'Google Sans Mono',monospace"
                  fontSize="14"
                >
                  X
                </text>
                <line
                  x1="200"
                  y1="200"
                  x2="200"
                  y2="50"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.7"
                />
                <text
                  x="192"
                  y="42"
                  fill="var(--color-accent)"
                  fontFamily="'Google Sans Mono',monospace"
                  fontSize="14"
                >
                  Y
                </text>
                <line
                  x1="200"
                  y1="200"
                  x2="50"
                  y2="350"
                  stroke="#a4c9ff"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.7"
                />
                <text
                  x="35"
                  y="368"
                  fill="#a4c9ff"
                  fontFamily="'Google Sans Mono',monospace"
                  fontSize="14"
                >
                  Z
                </text>

                {/* Cube */}
                <g
                  ref={cubeRef}
                  style={{
                    transformOrigin: '200px 200px',
                    transition: 'transform 0.1s linear',
                  }}
                >
                  {/* Top */}
                  <path
                    d="M 200 120 L 280 150 L 200 180 L 120 150 Z"
                    fill="var(--color-bg-inset)"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="2"
                  />
                  {/* Left */}
                  <path
                    d="M 120 150 L 200 180 L 200 260 L 120 230 Z"
                    fill="var(--color-bg-primary)"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="2"
                  />
                  {/* Right */}
                  <path
                    d="M 200 180 L 280 150 L 280 230 L 200 260 Z"
                    fill="var(--color-bg-secondary)"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="2"
                  />
                  {/* Status LED */}
                  <circle cx="200" cy="150" r="10" fill="var(--color-accent)">
                    <animate
                      attributeName="opacity"
                      values="1;0.4;1"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Direction marker */}
                  <path
                    d="M 230 140 L 260 150 L 230 160 Z"
                    fill="var(--color-info)"
                    opacity="0.9"
                  />
                </g>
              </svg>
            </div>

            {/* MODE badge */}
            <div
              className="absolute"
              style={{
                top: 20,
                left: 20,
                padding: '8px 14px',
                borderRadius: 12,
                background: 'var(--color-bg-inset)',
                border: '1px solid var(--color-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="block"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                }}
              >
                MODE
              </div>
              <div
                style={{
                  fontFamily: "'Google Sans Mono',monospace",
                  fontSize: 18,
                  fontWeight: 500,
                  color: 'var(--color-accent-text)',
                }}
              >
                KINEMATIC
              </div>
            </div>

            {/* Live readout */}
            <div
              className="absolute flex items-center"
              style={{
                bottom: 20,
                right: 20,
                gap: 16,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'var(--color-bg-inset)',
                border: '1px solid var(--color-border)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Readout label="PITCH" value={fmt(pitch, true)} tone="error" />
              <div
                style={{ width: 1, height: 24, background: 'var(--color-border)' }}
              />
              <Readout label="ROLL" value={fmt(roll, true)} tone="secondary" />
              <div
                style={{ width: 1, height: 24, background: 'var(--color-border)' }}
              />
              <Readout label="YAW" value={fmt(yaw)} tone="accent" />
            </div>
          </div>

          {/* Sliders */}
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            <SliderCard
              icon="swap_vert"
              iconColor="var(--color-error)"
              label="Pitch Offset"
              rangeLabel="± 45.0°"
              tone="error"
              min={-45}
              max={45}
              step={0.1}
              value={pitch}
              onChange={setPitch}
            />
            <SliderCard
              icon="360"
              iconColor="#a4c9ff"
              label="Roll Offset"
              rangeLabel="± 180.0°"
              tone="secondary"
              min={-180}
              max={180}
              step={0.1}
              value={roll}
              onChange={setRoll}
            />
            <SliderCard
              icon="explore"
              iconColor="var(--color-accent-text)"
              label="Yaw Offset"
              rangeLabel="0–360°"
              tone="accent"
              min={0}
              max={360}
              step={0.1}
              value={yaw}
              onChange={setYaw}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col" style={{ gap: 24 }}>
          {/* Criteria */}
          <div
            className="flex flex-col flex-1"
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              minHeight: 360,
            }}
          >
            <div
              className="flex items-center"
              style={{
                gap: 12,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Icon
                name="fact_check"
                size={20}
                style={{ color: 'var(--color-accent-text)' }}
              />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                Alignment Criteria
              </h2>
            </div>
            <div className="flex flex-col flex-1" style={{ gap: 12 }}>
              {CRITERIA.map((c) => (
                <CriterionRow key={c.key} c={c} />
              ))}
            </div>
          </div>

          {/* Raw sensor stream */}
          <div
            className="relative overflow-hidden"
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              height: 220,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 16 }}
            >
              <span
                className="uppercase"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Raw Sensor Stream
              </span>
              <span
                className="flex items-center"
                style={{
                  gap: 8,
                  fontSize: 12,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-accent-text)',
                }}
              >
                <span
                  className="status-dot"
                  style={{ background: 'var(--color-accent)' }}
                />
                100Hz
              </span>
            </div>
            <div
              ref={streamRef}
              className="flex flex-col"
              style={{
                gap: 4,
                fontFamily: "'Google Sans Mono',monospace",
                fontSize: 12,
                lineHeight: 1.4,
                color: 'var(--color-text-tertiary)',
                opacity: 0.85,
              }}
            >
              <div>[17:02:45.102] ACC: X: 0.002, Y: -0.014, Z: 9.801</div>
              <div>[17:02:45.112] GYR: X: -0.001, Y: 0.004, Z: -0.002</div>
              <div>[17:02:45.122] MAG: X: 24.10, Y: -12.30, Z: 45.88</div>
              <div>[17:02:45.132] ACC: X: 0.003, Y: -0.012, Z: 9.805</div>
            </div>
            {/* Fade overlay */}
            <div
              aria-hidden
              className="absolute"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
                height: 60,
                background:
                  'linear-gradient(to bottom, transparent, var(--color-bg-elevated))',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Readout: React.FC<{
  label: string;
  value: string;
  tone: 'error' | 'secondary' | 'accent';
}> = ({ label, value, tone }) => {
  const color =
    tone === 'error'
      ? 'var(--color-error-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-accent-text)';
  return (
    <div className="flex flex-col items-center" style={{ gap: 2 }}>
      <span
        className="uppercase"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--color-text-tertiary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Google Sans Mono',monospace",
          fontSize: 18,
          fontWeight: 500,
          color,
        }}
      >
        {value}
      </span>
    </div>
  );
};

const SliderCard: React.FC<{
  icon: string;
  iconColor: string;
  label: string;
  rangeLabel: string;
  tone: 'error' | 'secondary' | 'accent';
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ icon, iconColor, label, rangeLabel, tone, min, max, step, value, onChange }) => {
  const accent =
    tone === 'error'
      ? 'var(--color-error)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-accent)';
  const rangeColor =
    tone === 'error'
      ? 'rgba(255,180,171,0.15)'
      : tone === 'secondary'
      ? 'rgba(164,201,255,0.15)'
      : 'var(--color-accent-soft)';
  const valueColor =
    tone === 'error'
      ? 'var(--color-error-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-accent-text)';

  const display = (() => {
    if (min < 0 && max > 0) {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(1)}°`;
    }
    return `${value.toFixed(1)}°`;
  })();

  const leftLabel = min < 0 ? `${min}°` : `0°`;
  const rightLabel = max > 0 ? `+${max}°` : `${max}°`;

  return (
    <div
      className="relative overflow-hidden"
      style={{
        padding: 20,
        borderRadius: 16,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
      }}
    >
      <div
        aria-hidden
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: 64,
          height: 64,
          background: accent,
          opacity: 0.10,
          borderBottomLeftRadius: '100%',
        }}
      />
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 16, position: 'relative' }}
      >
        <span
          className="flex items-center"
          style={{ gap: 8, fontSize: 15, fontWeight: 600 }}
        >
          <Icon name={icon} size={18} style={{ color: iconColor }} />
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-bg-inset)',
            padding: '4px 8px',
            borderRadius: 6,
          }}
        >
          {rangeLabel}
        </span>
      </div>
      <div className="flex flex-col" style={{ gap: 12, position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: 6,
            appearance: 'none',
            WebkitAppearance: 'none',
            borderRadius: 9999,
            background: rangeColor,
            outline: 'none',
            accentColor: accent,
            cursor: 'pointer',
          }}
        />
        <div
          className="flex justify-between"
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>{leftLabel}</span>
          <span style={{ color: valueColor, fontWeight: 500 }}>{display}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

const CriterionRow: React.FC<{ c: Criterion }> = ({ c }) => {
  const accentBg =
    c.tone === 'accent'
      ? 'var(--color-accent-soft)'
      : c.tone === 'secondary'
      ? 'rgba(164,201,255,0.15)'
      : c.tone === 'error'
      ? 'var(--color-error-soft)'
      : 'var(--color-bg-inset)';
  const badgeColor =
    c.tone === 'accent'
      ? 'var(--color-accent-text)'
      : c.tone === 'secondary'
      ? '#a4c9ff'
      : c.tone === 'error'
      ? 'var(--color-error-text)'
      : 'var(--color-text-tertiary)';
  const borderColor =
    c.tone === 'accent'
      ? 'var(--color-accent)'
      : c.tone === 'error'
      ? 'var(--color-error)'
      : 'var(--color-border)';

  return (
    <div
      className="flex items-start"
      style={{
        gap: 12,
        padding: 16,
        borderRadius: 12,
        background: accentBg,
        border: `1px solid ${c.tone === 'muted' ? 'var(--color-border)' : borderColor}`,
        opacity: c.tone === 'muted' ? 1 : 1,
      }}
    >
      <div style={{ marginTop: 2 }}>
        <Icon
          name={
            c.status === 'pass'
              ? 'check_circle'
              : c.status === 'warn'
              ? 'warning'
              : 'radio_button_unchecked'
          }
          size={20}
          filled={c.status === 'pass'}
          style={{
            color:
              c.status === 'pass'
                ? 'var(--color-accent-text)'
                : c.status === 'warn'
                ? 'var(--color-error-text)'
                : 'var(--color-text-tertiary)',
          }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 4,
            color: 'var(--color-text-primary)',
          }}
        >
          {c.title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontFamily: "'Google Sans Mono',monospace",
          }}
        >
          {c.desc}
        </div>
        {typeof c.progress === 'number' && (
          <div
            style={{
              marginTop: 10,
              height: 4,
              borderRadius: 9999,
              background: 'var(--color-bg-inset)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${c.progress}%`,
                height: '100%',
                borderRadius: 9999,
                background: 'var(--color-error)',
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "'Google Sans Mono',monospace",
          color: badgeColor,
          padding: '4px 8px',
          borderRadius: 6,
          background:
            c.tone === 'muted'
              ? 'var(--color-bg-inset)'
              : c.tone === 'accent'
              ? 'var(--color-accent-soft)'
              : c.tone === 'error'
              ? 'var(--color-error-soft)'
              : 'rgba(164,201,255,0.15)',
          alignSelf: 'flex-start',
          whiteSpace: 'nowrap',
        }}
      >
        {c.badge}
      </div>
    </div>
  );
};

export default CalibrationDesktop;