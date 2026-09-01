import React from 'react';
import type { HeadingData, NavigationMetrics, SensorStatus } from '../types';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface CompassDialProps {
  headingData: HeadingData;
  navigationMetrics: NavigationMetrics;
  sensorStatus: SensorStatus;
}

const CARDINALS: { label: string; deg: number }[] = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

const INTERCARDINALS: { label: string; deg: number }[] = [
  { label: 'NE', deg: 45 },
  { label: 'SE', deg: 135 },
  { label: 'SW', deg: 225 },
  { label: 'NW', deg: 315 },
];

export const CompassDial: React.FC<CompassDialProps> = ({
  headingData,
  navigationMetrics,
  sensorStatus,
}) => {
  const { isDark } = useTheme();

  const heading = ((headingData.heading % 360) + 360) % 360;
  const speedMps = (navigationMetrics.currentSpeedKmh / 3.6).toFixed(1);
  const speedKmh = navigationMetrics.currentSpeedKmh.toFixed(1);
  const distance = Math.round(navigationMetrics.totalDistanceMeters);

  const bezelColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const ringColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const tickColor = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)';
  const tickMinor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const faceColor = isDark ? '#0b0d12' : '#f8f9fb';
  const cardinalColor = isDark ? '#eaedf3' : '#1a1a2e';
  const subColor = isDark ? '#8b92a8' : '#5a5f72';
  const accent = isDark ? '#89b4fa' : '#1a73e8';
  const dangerColor = isDark ? '#f87171' : '#d93025';

  const sourceLabel = (() => {
    switch (headingData.source) {
      case 'absolute': return 'Absolute';
      case 'webkit': return 'Webkit';
      case 'rotation-matrix': return 'Rotation Matrix';
      case 'alpha': return 'Alpha';
      case 'simulated': return 'Simulated';
      default: return 'Fallback';
    }
  })();

  const ticks: { deg: number; major: boolean }[] = [];
  for (let i = 0; i < 360; i += 5) {
    ticks.push({ deg: i, major: i % 30 === 0 });
  }

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 125;
  const rTickMajor = rOuter - 12;
  const rTickMinor = rOuter - 7;

  return (
    <div className="flex flex-col gap-4 w-full" style={{ fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif" }}>
      {/* Dial + center readout */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: 320,
          margin: '0 auto',
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          height="100%"
          style={{ display: 'block', overflow: 'visible' }}
          aria-label="Compass dial"
        >
          <defs>
            <radialGradient id="compassFace" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? '#181b23' : '#ffffff'} />
              <stop offset="100%" stopColor={faceColor} />
            </radialGradient>
            <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dangerColor} />
              <stop offset="100%" stopColor={isDark ? '#7f1d1d' : '#b91c1c'} />
            </linearGradient>
          </defs>

          {/* Outer bezel */}
          <circle cx={cx} cy={cy} r={rOuter + 4} fill={bezelColor} />
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="url(#compassFace)"
            stroke={ringColor}
            strokeWidth={1}
          />

          {/* Rotating dial: ticks + cardinals */}
          <g
            style={{
              transform: `rotate(${-heading}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 120ms cubic-bezier(0.2, 0.8, 0.4, 1)',
            }}
          >
            {ticks.map(({ deg, major }) => {
              const angle = (deg - 90) * (Math.PI / 180);
              const r1 = major ? rOuter - 1 : rOuter - 1;
              const r2 = major ? rTickMajor : rTickMinor;
              const x1 = cx + r1 * Math.cos(angle);
              const y1 = cy + r1 * Math.sin(angle);
              const x2 = cx + r2 * Math.cos(angle);
              const y2 = cy + r2 * Math.sin(angle);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={major ? tickColor : tickMinor}
                  strokeWidth={major ? 1.5 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {INTERCARDINALS.map(({ label, deg }) => {
              const angle = (deg - 90) * (Math.PI / 180);
              const r = rTickMajor - 14;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle) + 4;
              return (
                <text
                  key={label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={subColor}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="'Google Sans Flex', 'Google Sans Text', sans-serif"
                >
                  {label}
                </text>
              );
            })}

            {CARDINALS.map(({ label, deg }) => {
              const angle = (deg - 90) * (Math.PI / 180);
              const r = rTickMajor - 18;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle) + 5;
              return (
                <text
                  key={label}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={cardinalColor}
                  fontSize={label === 'N' ? '16' : '14'}
                  fontWeight={700}
                  fontFamily="'Google Sans Flex', 'Google Sans Text', sans-serif"
                >
                  {label}
                </text>
              );
            })}

            {/* Inner ring */}
            <circle cx={cx} cy={cy} r={rTickMajor - 38} fill="none" stroke={ringColor} strokeWidth={1} />
          </g>

          {/* Fixed center hub + needle */}
          <g>
            {/* North needle (red) */}
            <polygon
              points={`${cx},${cy - 78} ${cx - 8},${cy - 4} ${cx + 8},${cy - 4}`}
              fill="url(#needleGrad)"
              style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }}
            />
            {/* South needle (subdued) */}
            <polygon
              points={`${cx},${cy + 78} ${cx - 8},${cy + 4} ${cx + 8},${cy + 4}`}
              fill={isDark ? '#5a6178' : '#8b90a0'}
              style={{ filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.4))` }}
            />
            {/* Center cap */}
            <circle cx={cx} cy={cy} r={6} fill={isDark ? '#181b23' : '#ffffff'} stroke={accent} strokeWidth={2} />
            <circle cx={cx} cy={cy} r={2} fill={accent} />

            {/* Fixed top indicator (the direction we're pointing) */}
            <polygon
              points={`${cx},${cy - rOuter + 2} ${cx - 6},${cy - rOuter + 12} ${cx + 6},${cy - rOuter + 12}`}
              fill={accent}
            />
          </g>
        </svg>

        {/* Numeric readout overlay (center) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingTop: 18 }}
        >
          <div
            className="metric-value font-bold"
            style={{
              fontSize: '32px',
              lineHeight: 1,
              color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(heading)}°
          </div>
          <div
            className="text-[10px] uppercase tracking-[0.18em] mt-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Heading
          </div>
        </div>
      </div>

      {/* Quick stats below the dial */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="surface-inset flex flex-col items-center justify-center px-2 py-2">
          <Icon name="speed" size={14} style={{ color: 'var(--color-accent)' }} />
          <div className="metric-value text-sm font-semibold mt-1">{speedMps}</div>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
            m/s · {speedKmh} km/h
          </div>
        </div>
        <div className="surface-inset flex flex-col items-center justify-center px-2 py-2">
          <Icon name="route" size={14} style={{ color: 'var(--color-accent)' }} />
          <div className="metric-value text-sm font-semibold mt-1">{distance}</div>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
            m total
          </div>
        </div>
        <div className="surface-inset flex flex-col items-center justify-center px-2 py-2">
          <Icon
            name={headingData.calibrated ? 'verified' : 'gpp_maybe'}
            size={14}
            style={{ color: headingData.calibrated ? 'var(--color-success)' : 'var(--color-warning)' }}
          />
          <div className="metric-value text-sm font-semibold mt-1">
            {Math.round(headingData.pitch)}°
          </div>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)' }}>
            pitch · {sourceLabel}
          </div>
        </div>
      </div>

      {/* Sensor status footer */}
      <div
        className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] px-1"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="status-dot"
            style={{
              background: sensorStatus.hasHardwareMotion ? 'var(--color-success)' : 'var(--color-warning)',
            }}
          />
          {sensorStatus.hasHardwareMotion ? 'IMU Live (6-DOF)' : 'Simulator Ready'}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="explore" size={12} style={{ color: 'var(--color-accent)' }} />
          Magnetic
        </div>
      </div>
    </div>
  );
};