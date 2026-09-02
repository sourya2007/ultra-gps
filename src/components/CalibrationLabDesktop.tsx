import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

interface CalibrationLabDesktopProps {
  navigationMetrics?: never;
  sensorStatus?: never;
}

export const CalibrationLabDesktop: React.FC<CalibrationLabDesktopProps> = () => {
  const [pitch, setPitch] = useState(15.2);
  const [roll, setRoll] = useState(-4.8);
  const [yaw, setYaw] = useState(182.4);

  // Live data stream
  const terminalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      if (!terminalRef.current) return;
      const now = new Date();
      const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const type = ['ACC', 'GYR', 'MAG'][Math.floor(Math.random() * 3)];
      let line = '';
      if (type === 'ACC') {
        const x = (Math.random() * 0.01).toFixed(3);
        const y = (Math.random() * -0.02).toFixed(3);
        const z = (9.8 + Math.random() * 0.05).toFixed(3);
        line = `[${tStr}] ${type}: X: ${x}, Y: ${y}, Z: ${z}`;
      } else if (type === 'GYR') {
        const x = (Math.random() * 0.01 - 0.005).toFixed(3);
        const y = (Math.random() * 0.01 - 0.005).toFixed(3);
        const z = (Math.random() * 0.01 - 0.005).toFixed(3);
        line = `[${tStr}] ${type}: X: ${x}, Y: ${y}, Z: ${z}`;
      } else {
        const x = (20 + Math.random() * 10).toFixed(2);
        const y = (-20 + Math.random() * 15).toFixed(2);
        const z = (40 + Math.random() * 10).toFixed(2);
        line = `[${tStr}] ${type}: X: ${x}, Y: ${y}, Z: ${z}`;
      }
      const div = document.createElement('div');
      div.textContent = line;
      terminalRef.current.prepend(div);
      if (terminalRef.current.children.length > 10) {
        const last = terminalRef.current.lastChild;
        if (last) terminalRef.current.removeChild(last);
      }
    }, 250);
    return () => clearInterval(t);
  }, []);

  // IMU cube transform
  const imuCubeTransform = `rotateX(${pitch}deg) rotateY(${yaw - 180}deg) rotateZ(${roll}deg)`;

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
            className="block uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.10em',
              fontWeight: 700,
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
              boxShadow: '0 4px 16px rgba(195,243,139,0.30)',
            }}
          >
            <Icon name="check_circle" size={16} />
            Confirm Alignment
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 24,
        }}
      >
        {/* LEFT (col-span-8) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 8', gap: 24 }}
        >
          {/* 3D Viewport */}
          <div
            className="relative"
            style={{
              height: 600,
              padding: 32,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(195,243,139,0.05) 0%, transparent 50%, rgba(164,201,255,0.05) 100%)',
                opacity: 0.5,
              }}
            />
            {/* Grid lines overlay */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                opacity: 0.20,
              }}
            />
            <div
              className="relative"
              style={{ width: '100%', maxWidth: 448, aspectRatio: '1 / 1' }}
            >
              <svg
                viewBox="0 0 400 400"
                width="100%"
                height="100%"
                style={{ filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.5))', transition: 'transform 0.1s ease-out' }}
              >
                <line x1="200" y1="200" x2="350" y2="200" stroke="var(--color-error)" strokeDasharray="5 5" strokeWidth="4" />
                <text x="360" y="205" fontFamily="'Google Sans Mono',monospace" fontSize="14" fill="var(--color-error)">X</text>
                <line x1="200" y1="200" x2="200" y2="50" stroke="var(--color-accent)" strokeDasharray="5 5" strokeWidth="4" />
                <text x="195" y="40" fontFamily="'Google Sans Mono',monospace" fontSize="14" fill="var(--color-accent)">Y</text>
                <line x1="200" y1="200" x2="50" y2="350" stroke="#a4c9ff" strokeDasharray="5 5" strokeWidth="4" />
                <text x="35" y="365" fontFamily="'Google Sans Mono',monospace" fontSize="14" fill="#a4c9ff">Z</text>
                <g
                  style={{
                    transformOrigin: '200px 200px',
                    transform: imuCubeTransform,
                    transition: 'transform 0.1s ease-out',
                  }}
                >
                  <path d="M 200 120 L 280 150 L 200 180 L 120 150 Z" fill="var(--color-bg-elevated)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <path d="M 120 150 L 200 180 L 200 260 L 120 230 Z" fill="var(--color-bg-inset)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <path d="M 200 180 L 280 150 L 280 230 L 200 260 Z" fill="var(--color-bg-elevated)" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <circle cx="200" cy="150" fill="var(--color-accent)" r="10" className="animate-pulse" />
                  <path d="M 230 140 L 260 150 L 230 160 Z" fill="#0164b4" opacity="0.80" />
                </g>
              </svg>
            </div>
            {/* Mode overlay */}
            <div
              className="absolute"
              style={{
                top: 24,
                left: 24,
                padding: 12,
                borderRadius: 10,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
              }}
            >
              <span
                className="block uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                }}
              >
                Mode
              </span>
              <span
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--color-accent-text)',
                }}
              >
                KINEMATIC
              </span>
            </div>
            {/* Bottom right pitch/roll/yaw */}
            <div
              className="absolute flex items-center"
              style={{
                bottom: 24,
                right: 24,
                padding: 16,
                gap: 24,
                borderRadius: 12,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.20)',
              }}
            >
              <AxisDisplay label="Pitch" value={`${pitch > 0 ? '+' : ''}${pitch.toFixed(1)}°`} color="var(--color-error)" />
              <div style={{ width: 1, height: 32, background: 'var(--color-border)' }} />
              <AxisDisplay label="Roll" value={`${roll > 0 ? '+' : ''}${roll.toFixed(1)}°`} color="#a4c9ff" />
              <div style={{ width: 1, height: 32, background: 'var(--color-border)' }} />
              <AxisDisplay label="Yaw" value={`${yaw.toFixed(1)}°`} color="var(--color-accent)" />
            </div>
          </div>

          {/* Sliders row (3 cols) */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 24,
            }}
          >
            <CalibSlider
              label="Pitch Offset"
              icon="swap_vert"
              iconColor="var(--color-error)"
              range="± 45.0°"
              min={-45}
              max={45}
              value={pitch}
              onChange={setPitch}
              color="var(--color-error)"
            />
            <CalibSlider
              label="Roll Offset"
              icon="360"
              iconColor="#a4c9ff"
              range="± 180.0°"
              min={-180}
              max={180}
              value={roll}
              onChange={setRoll}
              color="#a4c9ff"
            />
            <CalibSlider
              label="Yaw Offset"
              icon="explore"
              iconColor="var(--color-accent)"
              range="0-360°"
              min={0}
              max={360}
              value={yaw}
              onChange={setYaw}
              color="var(--color-accent)"
            />
          </div>
        </div>

        {/* RIGHT (col-span-4) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 4', gap: 24 }}
        >
          {/* Alignment Criteria */}
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
            <div
              className="flex items-center"
              style={{
                gap: 12,
                marginBottom: 24,
                paddingBottom: 16,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <Icon name="fact_check" size={20} style={{ color: 'var(--color-accent-text)' }} />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Alignment Criteria
              </h2>
            </div>
            <div className="flex flex-col" style={{ gap: 16, flex: 1 }}>
              <CriteriaItem
                ok
                title="Static Stability"
                desc="Variance < 0.05° over 10s"
                status="Pass"
              />
              <CriteriaItem
                ok={false}
                title="Magnetometer Interference"
                desc="Deviation < 2µT from baseline"
                status="Pending"
              />
              <CriteriaItem
                warn
                title="Thermal Equilibrium"
                desc="Core temp drift < 0.1°C/min"
                status="Warn"
                progress={85}
              />
              <CriteriaItem
                ok
                title="GPS Baseline Vector"
                desc="Fixed RTK lock required"
                status="Pass"
                pushDown
              />
            </div>
          </div>

          {/* Raw sensor stream */}
          <div
            className="relative overflow-hidden"
            style={{
              height: 256,
              padding: 16,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              aria-hidden
              className="absolute left-0 right-0 bottom-0 pointer-events-none"
              style={{
                height: 32,
                background: 'linear-gradient(to top, var(--color-bg-elevated), transparent)',
                zIndex: 10,
              }}
            />
            <div
              className="flex items-center justify-between relative"
              style={{ marginBottom: 16, zIndex: 20 }}
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
                Raw Sensor Stream
              </span>
              <span
                className="flex items-center"
                style={{
                  fontSize: 10,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-accent-text)',
                  gap: 6,
                }}
              >
                <span
                  className="rounded-full animate-pulse"
                  style={{ width: 8, height: 8, background: 'var(--color-accent)' }}
                />
                100Hz
              </span>
            </div>
            <div
              ref={terminalRef}
              className="relative flex flex-col"
              style={{
                fontFamily: "'Google Sans Mono',monospace",
                fontSize: 12,
                lineHeight: 1.3,
                color: 'var(--color-text-tertiary)',
                gap: 4,
                opacity: 0.7,
                overflow: 'hidden',
                maxHeight: 180,
              }}
            >
              <div>[17:02:45.102] ACC: X: 0.002, Y: -0.014, Z: 9.801</div>
              <div>[17:02:45.112] GYR: X:-0.001, Y: 0.004, Z:-0.002</div>
              <div>[17:02:45.122] MAG: X: 24.10, Y:-12.30, Z: 45.88</div>
              <div>[17:02:45.132] ACC: X: 0.003, Y: -0.012, Z: 9.805</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AxisDisplay: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex flex-col items-center" style={{ gap: 4 }}>
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
        fontSize: 22,
        color,
        fontWeight: 500,
      }}
    >
      {value}
    </span>
  </div>
);

const CalibSlider: React.FC<{
  label: string;
  icon: string;
  iconColor: string;
  range: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
  color: string;
}> = ({ label, icon, iconColor, range, min, max, value, onChange, color }) => (
  <div
    className="relative overflow-hidden"
    style={{
      padding: 24,
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
        background: color,
        opacity: 0.10,
        borderBottomLeftRadius: '100%',
        mixBlendMode: 'screen',
      }}
    />
    <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
      <span
        className="flex items-center"
        style={{
          gap: 8,
          fontFamily: "'Google Sans Flex','Inter',sans-serif",
          fontSize: 16,
          color: 'var(--color-text-primary)',
          fontWeight: 600,
        }}
      >
        <Icon name={icon} size={18} style={{ color: iconColor }} />
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontFamily: "'Google Sans Mono',monospace",
          color: 'var(--color-text-tertiary)',
          background: 'var(--color-bg-inset)',
          padding: '4px 8px',
          borderRadius: 6,
        }}
      >
        {range}
      </span>
    </div>
    <div className="flex flex-col" style={{ gap: 16 }}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: color,
        }}
      />
      <div
        className="flex justify-between"
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          fontFamily: "'Google Sans Mono',monospace",
        }}
      >
        <span>
          {min}
          {range.includes('360') ? '°' : '°'}
        </span>
        <span style={{ color, fontWeight: 500 }}>
          {value > 0 && !range.includes('360') ? '+' : ''}
          {value.toFixed(1)}°
        </span>
        <span>
          {max}
          {range.includes('360') ? '°' : '°'}
        </span>
      </div>
    </div>
  </div>
);

const CriteriaItem: React.FC<{
  ok?: boolean;
  warn?: boolean;
  title: string;
  desc: string;
  status: string;
  progress?: number;
  pushDown?: boolean;
}> = ({ ok, warn, title, desc, status, progress, pushDown }) => {
  const bg = ok
    ? 'var(--color-bg-elevated)'
    : warn
    ? 'var(--color-bg-elevated)'
    : 'var(--color-bg-inset)';
  const border = ok
    ? '1px solid rgba(195,243,139,0.30)'
    : warn
    ? '1px solid rgba(255,180,171,0.30)'
    : '1px solid var(--color-border)';
  const statusColor = ok
    ? 'var(--color-accent-text)'
    : warn
    ? 'var(--color-error-text)'
    : 'var(--color-text-primary)';
  const statusBg = ok
    ? 'rgba(195,243,139,0.10)'
    : warn
    ? 'rgba(255,180,171,0.10)'
    : 'var(--color-bg-elevated)';
  return (
    <div
      className="flex items-start"
      style={{
        gap: 16,
        padding: 16,
        borderRadius: 10,
        background: bg,
        border,
        marginTop: pushDown ? 'auto' : 0,
      }}
    >
      <div style={{ marginTop: 4 }}>
        {ok ? (
          <Icon name="check_circle" size={20} filled style={{ color: 'var(--color-accent-text)' }} />
        ) : warn ? (
          <Icon name="warning" size={20} style={{ color: 'var(--color-error)' }} />
        ) : (
          <Icon name="radio_button_unchecked" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "'Google Sans Flex','Inter',sans-serif",
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: 4,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
          }}
        >
          {desc}
        </p>
        {progress !== undefined && (
          <div
            className="w-full overflow-hidden"
            style={{
              marginTop: 12,
              height: 6,
              borderRadius: 9999,
              background: 'var(--color-bg-inset)',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--color-error)',
                borderRadius: 9999,
              }}
            />
          </div>
        )}
      </div>
      <span
        className="uppercase"
        style={{
          padding: '2px 8px',
          borderRadius: 6,
          background: statusBg,
          color: statusColor,
          fontSize: 10,
          letterSpacing: '0.10em',
          fontWeight: 700,
          height: 'fit-content',
        }}
      >
        {status}
      </span>
    </div>
  );
};
