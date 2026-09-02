import React, { useEffect, useRef, useState } from 'react';
import type { NavigationMetrics, SensorStatus } from '../types';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';
import { useDeviceHeading } from '../hooks/useDeviceHeading';

interface CompassDialProps {
  navigationMetrics: NavigationMetrics;
  sensorStatus: SensorStatus;
  /** Fallback heading (e.g. from the PDR/GPS fusion) used only if the device
   * orientation sensor is unavailable on this device. The compass is normally
   * driven by the live device magnetometer (works even when GPS is off). */
  fallbackHeading?: number;
  /** Fallback source label (e.g. "GPS", "Simulated") */
  fallbackSource?: 'webkit' | 'absolute' | 'rotation-matrix' | 'alpha' | 'simulated' | 'fallback';
  /** Optional pitch (degrees) shown in the stats row */
  pitch?: number;
  /** Whether the device heading has been magnetometer-calibrated */
  calibrated?: boolean;
}

const CARDINALS: { label: string; deg: number }[] = [
  { label: 'N', deg: 0 },
  { label: 'E', deg: 90 },
  { label: 'S', deg: 180 },
  { label: 'W', deg: 270 },
];

const cardinalFromHeading = (h: number): string => {
  const norm = ((h % 360) + 360) % 360;
  const idx = Math.round(norm / 45) % 8;
  const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return labels[idx];
};

const supportsVibrate = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

/**
 * Exponential moving average helper for smoothing a noisy signal.
 * alpha = 0  →  no smoothing (pass-through)
 * alpha = 1  →  freeze the value
 */
const ema = (prev: number, next: number, alpha: number): number =>
  prev * (1 - alpha) + next * alpha;

export const CompassDial: React.FC<CompassDialProps> = ({
  navigationMetrics,
  sensorStatus,
  fallbackHeading = 0,
  fallbackSource = 'fallback',
  pitch = 0,
  calibrated = false,
}) => {
  const { isDark } = useTheme();

  const speedMps = (navigationMetrics.currentSpeedKmh / 3.6).toFixed(1);
  const distance = Math.round(navigationMetrics.totalDistanceMeters);

  // --- Read the on-device compass directly (independent of GPS) ---
  const device = useDeviceHeading();

  // --- Smooth the device heading with an EMA to kill magnetometer jitter ---
  // alpha = 0.15 means it takes ~6 samples (~120ms at 50Hz) to converge,
  // which removes per-frame glitchiness without introducing visible lag.
  const smoothedDeviceRef = useRef<number>(device.heading);
  useEffect(() => {
    if (!device.available) return;
    let delta = device.heading - smoothedDeviceRef.current;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    smoothedDeviceRef.current = smoothedDeviceRef.current + delta * 0.15;
  }, [device.heading, device.available]);

  // Use the device heading (smoothed) as the primary source. Only when the
  // device sensor is completely unavailable do we fall back to the PDR/GPS
  // fused heading, in which case the dial freezes on the last known good value
  // to prevent the visible glitchy oscillation.
  const frozenRef = useRef<number>(fallbackHeading);
  useEffect(() => {
    if (device.available) {
      frozenRef.current = smoothedDeviceRef.current;
    }
  }, [device.available]);

  const liveHeading = device.available ? smoothedDeviceRef.current : frozenRef.current;
  const source = device.available ? device.source : fallbackSource;

  // --- Smooth heading with wraparound handling ---
  // `continuous` is the monotonic (unbounded) rotation that lets the visual
  // dial cross 359°→0° smoothly without snapping. All of the bezel rotation
  // derives from this value.
  const continuousRef = useRef<number>(liveHeading);
  const targetRef = useRef<number>(liveHeading);
  const lastHapticCardinalRef = useRef<number>(-1);
  const rafRef = useRef<number | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    // Find shortest path from current continuous to the new live target so
    // 359°→0° takes the +1 path rather than the −359 path.
    const prev = continuousRef.current;
    let delta = liveHeading - prev;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    targetRef.current = prev + delta;
  }, [liveHeading]);

  useEffect(() => {
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      const prevCont = continuousRef.current;
      const target = targetRef.current;
      // Critically-damped follow with ~150ms time constant
      const k = 1 - Math.exp(-dt / 0.15);
      const next = prevCont + (target - prevCont) * k;
      continuousRef.current = Math.abs(target - next) < 0.0005 ? target : next;
      force((n) => (n + 1) % 1_000_000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const continuous = continuousRef.current;
  const displayHeading = ((continuous % 360) + 360) % 360;
  const activeCardinal = cardinalFromHeading(displayHeading);

  // --- Haptic feedback at each PERFECT cardinal direction (within ±0.5deg) ---
  useEffect(() => {
    const h = displayHeading;
    let nearest = -1;
    let minDist = Infinity;
    for (const c of CARDINALS) {
      let d = Math.abs(h - c.deg);
      if (d > 180) d = 360 - d;
      if (d < minDist) {
        minDist = d;
        nearest = c.deg;
      }
    }
    // Fire haptic only when the live heading is within 0.5deg of a perfect
    // cardinal. Re-arms once the user moves more than 3deg away so it fires
    // exactly once per cardinal crossing.
    if (minDist <= 0.5 && lastHapticCardinalRef.current !== nearest) {
      lastHapticCardinalRef.current = nearest;
      if (supportsVibrate()) {
        try {
          navigator.vibrate(15);
        } catch {
          /* ignore */
        }
      }
    } else if (minDist > 3) {
      lastHapticCardinalRef.current = -1;
    }
  }, [displayHeading]);

  // --- Theme-aware colors ---
  const palette = isDark
    ? {
        cardBg: '#0a0a0a',
        faceOuter: '#000000',
        faceInner: '#181818',
        hubBg: '#1a1a1a',
        hubBorder: '#3a3a3a',
        centerReadoutBg: '#1a1a1a',
        centerReadoutBorder: '#3a3a3a',
        tickMajor: '#ffffff',
        tickMinor: '#a0a0a0',
        tickMicro: '#555555',
        numColor: '#a0a0a0',
        cardinal: '#ffffff',
        cardinalN: '#ef4444',
        cardinalS: '#3b82f6',
        needleN: '#ef4444',
        needleS: '#f5f5f5',
        centerDegree: '#ffffff',
        centerCardinal: '#c3c9b6',
        statBg: '#0e0e0e',
        statBorder: '#1f1f1f',
        statText: '#e5e2e1',
        statCaption: '#8d9382',
        accent: '#c3f38b',
        accentSoft: 'rgba(195, 243, 139, 0.2)',
        headerColor: '#e5e2e1',
        divider: '#1f1f1f',
      }
    : {
        cardBg: '#ffffff',
        faceOuter: '#f5f5f5',
        faceInner: '#ffffff',
        hubBg: '#ffffff',
        hubBorder: '#d0d4cc',
        centerReadoutBg: '#eef0ec',
        centerReadoutBorder: '#c0c4bc',
        tickMajor: '#1a1c19',
        tickMinor: '#5a5d57',
        tickMicro: '#c0c4bc',
        numColor: '#5a5d57',
        cardinal: '#1a1c19',
        cardinalN: '#d93025',
        cardinalS: '#1a73e8',
        needleN: '#d93025',
        needleS: '#5a5d57',
        centerDegree: '#1a1c19',
        centerCardinal: '#5a5d57',
        statBg: '#f5f5f5',
        statBorder: '#e1e3df',
        statText: '#1a1c19',
        statCaption: '#5a5d57',
        accent: '#426910',
        accentSoft: 'rgba(66, 105, 16, 0.18)',
        headerColor: '#1a1c19',
        divider: '#e1e3df',
      };

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 6;
  const rTickMajor = rOuter - 6;
  const rTickMinor = rOuter - 4;
  const rTickMicro = rOuter - 2;
  const rNumber = rOuter - 16;
  const rCardinal = rOuter - 38;

  // Build ticks: major every 30° (with numbers), minor every 10°, micro every 2°
  const ticks: { deg: number; major: boolean; minor: boolean; number?: number }[] = [];
  for (let d = 0; d < 360; d += 2) {
    const isMajor = d % 30 === 0;
    const isMinor = d % 10 === 0;
    ticks.push({
      deg: d,
      major: isMajor,
      minor: !isMajor && isMinor,
      number: isMajor ? (d === 0 ? 360 : d) : undefined,
    });
  }

  // Center grey circle: holds the degree value. Cardinal letter sits outside, to the right.
  const centerCircleRadius = 22;

  // Needle geometry — fixed (does not rotate with the dial)
  const needleTip = rOuter - 64;
  const needleBaseHalf = 6;
  const needleGap = centerCircleRadius + 4;

  // For each number on the outer ring, compute the position relative to the
  // dial center. The number's local rotation is computed inline (counter-
  // rotation by `continuous`) so the digit stays upright in the world frame
  // as the bezel rotates.
  const numberR = rNumber;
  const numberElements = ticks
    .filter((t) => t.number !== undefined)
    .map(({ deg, number }) => {
      const angle = (deg - 90) * (Math.PI / 180);
      const x = cx + numberR * Math.cos(angle);
      const y = cy + numberR * Math.sin(angle);
      return { deg, number, x, y };
    });

  const sourceLabel = (() => {
    switch (source) {
      case 'absolute': return 'Absolute';
      case 'webkit': return 'iOS Compass';
      case 'alpha': return 'Alpha';
      case 'simulated': return 'Sim';
      case 'rotation-matrix': return 'Rot Matrix';
      case 'fallback':
      default:
        return device.available ? 'Compass' : 'Fallback';
    }
  })();

  return (
    <div
      className="flex flex-col gap-3 w-full"
      style={{
        fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
        background: palette.cardBg,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 12,
        boxShadow: 'var(--shadow-lg)',
        color: palette.statText,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{
          paddingBottom: 8,
          borderBottom: `1px solid ${palette.divider}`,
        }}
      >
        <div
          className="uppercase font-bold"
          style={{ fontSize: '10px', letterSpacing: '0.1em', color: palette.headerColor }}
        >
          HEADING
        </div>
        <div
          style={{
            fontFamily: "'Google Sans Mono', monospace",
            fontSize: '12px',
            color: palette.statCaption,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(displayHeading)}°
        </div>
      </div>

      {/* Dial — STATIC bezel, only the center readout updates */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          aspectRatio: '1 / 1',
          maxWidth: 260,
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
            <radialGradient id={`faceGrad-${isDark ? 'd' : 'l'}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={palette.faceInner} />
              <stop offset="100%" stopColor={palette.faceOuter} />
            </radialGradient>
          </defs>

          {/* Outer disc */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill={`url(#faceGrad-${isDark ? 'd' : 'l'})`}
            stroke={palette.hubBorder}
            strokeWidth={1}
          />

          {/* ROTATING bezel: ticks + cardinals + degree numbers all spin
              together as the user turns the device. The bezel is rotated by
              -continuous so that as the live heading increases, the bezel
              rotates counter-clockwise (the "N" tick moves to the left). */}
          <g
            style={{
              transform: `rotate(${-continuous}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'none',
            }}
          >
            {ticks.map(({ deg, major, minor }) => {
              const angle = (deg - 90) * (Math.PI / 180);
              const r1 = rOuter - 1;
              const r2 = major ? rTickMajor : minor ? rTickMinor : rTickMicro;
              const x1 = cx + r1 * Math.cos(angle);
              const y1 = cy + r1 * Math.sin(angle);
              const x2 = cx + r2 * Math.cos(angle);
              const y2 = cy + r2 * Math.sin(angle);
              return (
                <line
                  key={`tick-${deg}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={
                    major ? palette.tickMajor : minor ? palette.tickMinor : palette.tickMicro
                  }
                  strokeWidth={major ? 1.5 : minor ? 1 : 0.6}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Cardinal letters (N/E/S/W) — placed inward of numbers, rotate with the dial */}
            {CARDINALS.map(({ label, deg }) => {
              const angle = (deg - 90) * (Math.PI / 180);
              const r = rCardinal;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle) + 5;
              const fill =
                label === 'N'
                  ? palette.cardinalN
                  : label === 'S'
                  ? palette.cardinalS
                  : palette.cardinal;
              return (
                <text
                  key={`card-${label}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill={fill}
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="'Google Sans Flex', 'Google Sans Text', sans-serif"
                >
                  {label}
                </text>
              );
            })}

            {/* Outer degree numbers — placed INSIDE the rotating bezel group
                so they stay anchored to their tick (i.e. the "30" digit moves
                around the ring as the dial spins). Each digit is COUNTER-
                ROTATED by `continuous` so its world orientation stays UPRIGHT
                relative to the viewer — it never tumbles or tilts as the dial
                rotates. Net effect: the digits move with their tick but
                always read normally to the user. */}
            {numberElements.map(({ deg, number, x, y }) => (
              <text
                key={`num-${deg}`}
                x={x}
                y={y}
                fill={palette.numColor}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Google Sans Flex', 'Google Sans Text', sans-serif"
                transform={`rotate(${continuous} ${x} ${y})`}
              >
                {number}
              </text>
            ))}
          </g>

          {/* Center grey circle — static, holds the degree value */}
          <circle
            cx={cx}
            cy={cy}
            r={centerCircleRadius}
            fill={palette.centerReadoutBg}
            stroke={palette.centerReadoutBorder}
            strokeWidth={1}
          />

          {/* Fixed red N-needle and white S-needle — always pointing up/down */}
          <polygon
            points={`${cx},${cy - needleTip} ${cx - needleBaseHalf},${cy - needleGap} ${cx + needleBaseHalf},${cy - needleGap}`}
            fill={palette.needleN}
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
          />
          <polygon
            points={`${cx},${cy + needleTip} ${cx - needleBaseHalf},${cy + needleGap} ${cx + needleBaseHalf},${cy + needleGap}`}
            fill={palette.needleS}
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
          />

          {/* Fixed top + bottom axis bars */}
          <rect x={cx - 9} y={cy - rOuter + 1} width={18} height={4} rx={1} fill={palette.needleN} />
          <rect x={cx - 9} y={cy + rOuter - 5} width={18} height={4} rx={1} fill={palette.cardinalS} />
        </svg>

        {/* Center readout overlay — degree inside the grey circle,
            cardinal letter to the RIGHT of the circle. */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="flex items-center"
            style={{
              transform: 'translateX(-10px)',
              gap: 6,
            }}
          >
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: centerCircleRadius * 2,
                height: centerCircleRadius * 2,
                color: palette.centerDegree,
                fontSize: '20px',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
                fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
              }}
            >
              {Math.round(displayHeading)}°
            </div>
            <div
              className="uppercase font-bold"
              style={{
                fontSize: '13px',
                letterSpacing: '0.04em',
                color: palette.centerCardinal,
                lineHeight: 1,
                fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
              }}
            >
              {activeCardinal}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats below the dial */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        <div
          className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md"
          style={{ background: palette.statBg, border: `1px solid ${palette.statBorder}` }}
        >
          <Icon name="speed" size={12} style={{ color: palette.accent }} />
          <div
            className="font-semibold mt-0.5"
            style={{
              fontSize: '13px',
              color: palette.statText,
              fontFamily: "'Google Sans Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {speedMps}
          </div>
          <div
            className="uppercase tracking-wider text-center w-full"
            style={{ fontSize: '8px', color: palette.statCaption }}
          >
            m/s
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md"
          style={{ background: palette.statBg, border: `1px solid ${palette.statBorder}` }}
        >
          <Icon name="route" size={12} style={{ color: palette.accent }} />
          <div
            className="font-semibold mt-0.5"
            style={{
              fontSize: '13px',
              color: palette.statText,
              fontFamily: "'Google Sans Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {distance}
          </div>
          <div
            className="uppercase tracking-wider text-center w-full"
            style={{ fontSize: '8px', color: palette.statCaption }}
          >
            m total
          </div>
        </div>
        <div
          className="flex flex-col items-center justify-center px-1 py-1.5 rounded-md"
          style={{ background: palette.statBg, border: `1px solid ${palette.statBorder}` }}
        >
          <Icon
            name={calibrated ? 'verified' : 'gpp_maybe'}
            size={12}
            style={{ color: calibrated ? palette.accent : palette.statCaption }}
          />
          <div
            className="font-semibold mt-0.5"
            style={{
              fontSize: '13px',
              color: palette.statText,
              fontFamily: "'Google Sans Mono', monospace",
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {Math.round(pitch)}°
          </div>
          <div
            className="uppercase tracking-wider text-center w-full"
            style={{ fontSize: '8px', color: palette.statCaption }}
          >
            pitch
          </div>
        </div>
      </div>

      {/* Sensor status footer */}
      <div
        className="flex items-center justify-between gap-2"
        style={{
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: palette.statCaption,
          padding: '0 4px',
          borderTop: `1px solid ${palette.divider}`,
          paddingTop: 8,
          marginTop: 2,
        }}
      >
        <div className="flex items-center gap-1 min-w-0">
          <span
            className="status-dot shrink-0"
            style={{
              background: device.available
                ? palette.accent
                : sensorStatus.hasHardwareMotion
                ? palette.accent
                : palette.statCaption,
            }}
          />
          <span className="truncate">
            {device.available
              ? 'On-Device Compass'
              : sensorStatus.hasHardwareMotion
              ? 'IMU Live'
              : 'Sim Ready'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Icon name="explore" size={10} style={{ color: palette.accent }} />
          <span className="truncate">{sourceLabel}</span>
        </div>
      </div>
    </div>
  );
};