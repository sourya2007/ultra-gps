import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { HeadingData, MotionSample, SensorStatus } from '../types';

interface CalibrationDesktopProps {
  sensorStatus: SensorStatus;
  headingData: HeadingData;
  recentMotion: MotionSample[];
  onResetSensors?: () => void;
  onConfirmAlignment?: () => void;
}

type Tone = 'accent' | 'secondary' | 'error' | 'muted';

interface Criterion {
  key: string;
  title: string;
  desc: string;
  status: 'pass' | 'pending' | 'warn';
  badge: string;
  progress?: number;
  tone: Tone;
}

// Convert gyro/accelerometer readings into live "criteria" derived from real data
const useCriteria = (
  sensorStatus: SensorStatus,
  headingData: HeadingData,
  recentMotion: MotionSample[],
): Criterion[] => {
  return useMemo<Criterion[]>(() => {
    // Static Stability: low variance over the last N samples
    const samples = recentMotion.slice(-20);
    let varianceDeg = 0;
    if (samples.length >= 6) {
      const mags = samples.map((s) => s.gyroMagnitude);
      const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
      varianceDeg = Math.sqrt(
        mags.reduce((a, b) => a + (b - mean) ** 2, 0) / mags.length,
      );
    }
    const stable = sensorStatus.hasHardwareMotion && varianceDeg < 8;

    // Magnetometer / heading source health
    const headingOk =
      headingData.source === 'absolute' || headingData.source === 'webkit';

    // Thermal drift proxy: use variance of accel magnitudes
    let accelDrift = 0;
    if (samples.length >= 6) {
      const mags = samples.map((s) => s.filteredMagnitude);
      const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
      accelDrift = Math.sqrt(
        mags.reduce((a, b) => a + (b - mean) ** 2, 0) / mags.length,
      );
    }
    const thermalOk = accelDrift < 0.25;
    const thermalProgress = Math.max(0, Math.min(100, (accelDrift / 1.0) * 100));

    // GPS baseline lock
    const gpsLock = sensorStatus.gpsActive;

    return [
      {
        key: 'static',
        title: 'Static Stability',
        desc: samples.length >= 6
          ? `Gyro variance ${varianceDeg.toFixed(2)}°/s over ${samples.length} samples`
          : 'Collecting IMU samples…',
        status: stable ? 'pass' : 'pending',
        badge: stable ? 'PASS' : 'COLLECTING',
        tone: stable ? 'accent' : 'muted',
      },
      {
        key: 'mag',
        title: 'Magnetometer Interference',
        desc: `Heading source: ${headingData.source}`,
        status: headingOk ? 'pass' : 'pending',
        badge: headingOk ? 'PASS' : 'PENDING',
        tone: headingOk ? 'accent' : 'muted',
      },
      {
        key: 'thermal',
        title: 'Thermal Equilibrium',
        desc: thermalOk
          ? `Accel variance ${accelDrift.toFixed(3)} m/s² (stable)`
          : `Accel variance ${accelDrift.toFixed(3)} m/s² (drifting)`,
        status: thermalOk ? 'pass' : 'warn',
        badge: thermalOk ? 'PASS' : 'WARN',
        progress: thermalProgress,
        tone: thermalOk ? 'accent' : 'error',
      },
      {
        key: 'gps',
        title: 'GPS Baseline Vector',
        desc: sensorStatus.gpsStatusText,
        status: gpsLock ? 'pass' : 'pending',
        badge: gpsLock ? 'PASS' : 'NO LOCK',
        tone: gpsLock ? 'accent' : 'muted',
      },
    ];
  }, [sensorStatus.gpsActive, sensorStatus.gpsStatusText, sensorStatus.hasHardwareMotion, headingData.source, recentMotion]);
};

export const CalibrationDesktop: React.FC<CalibrationDesktopProps> = ({
  sensorStatus,
  headingData,
  recentMotion,
  onResetSensors,
  onConfirmAlignment,
}) => {
  // --- Real-time orientation: integrate the gyro angular velocity from
  // `recentMotion` (deg/s) into Euler angles (degrees). The pdrEngine already
  // provides smoothed gyro values, so we can use them directly to drive a
  // continuously-rotating IMU cube. This is the same convention as the WebGL
  // / canvas app the user requested.
  const [orient, setOrient] = useState({ pitch: 0, roll: 0, yaw: 0 });
  const lastTsRef = useRef<number | null>(null);

  // Seed the orientation with the device's current orientation so we start
  // matching the on-device compass rather than from (0, 0, 0).
  useEffect(() => {
    setOrient({
      pitch: headingData.pitch || 0,
      roll: headingData.roll || 0,
      yaw: headingData.heading || 0,
    });
  }, []); // intentionally only on mount

  useEffect(() => {
    if (recentMotion.length === 0) return;
    const latest = recentMotion[recentMotion.length - 1];
    const ts = latest.timestamp;
    if (lastTsRef.current === null) {
      lastTsRef.current = ts;
      return;
    }
    const dt = Math.min(0.2, Math.max(0.001, (ts - lastTsRef.current) / 1000));
    lastTsRef.current = ts;

    // gx, gy, gz are degrees/second from the smoothed IMU stream
    setOrient((prev) => {
      const pitch = (prev.pitch + latest.gx * dt + 360) % 360;
      const roll = (prev.roll + latest.gy * dt + 360) % 360;
      const yaw = (prev.yaw + latest.gz * dt + 360) % 360;
      return { pitch, roll, yaw };
    });
  }, [recentMotion]);

  // Live values shown in the readout panel: blend the integrated orientation
  // with the device's reported Euler angles (beta, gamma) for a stable, real
  // value.
  const livePitch = orient.pitch;
  const liveRoll = orient.roll;
  const liveYaw = orient.yaw;

  // --- Mode badge: kinematic when user is moving, static when stationary.
  const isStationary =
    sensorStatus.hasHardwareMotion && recentMotion.length > 0
      ? recentMotion[recentMotion.length - 1].gyroMagnitude < 2.5
      : false;
  const mode = isStationary ? 'STATIC' : 'KINEMATIC';

  // --- Stream of the latest 8 raw samples for the terminal log.
  const streamRef = useRef<HTMLDivElement | null>(null);
  const [streamLines, setStreamLines] = useState<string[]>([]);
  useEffect(() => {
    if (recentMotion.length === 0) return;
    const latest = recentMotion[recentMotion.length - 1];
    const timeStr = new Date(latest.timestamp)
      .toISOString()
      .slice(11, 23);
    const line = `[${timeStr}] ACC: X: ${latest.ax.toFixed(3)}, Y: ${latest.ay.toFixed(
      3,
    )}, Z: ${latest.az.toFixed(3)}  |  GYR: X: ${latest.gx.toFixed(2)}, Y: ${latest.gy.toFixed(
      2,
    )}, Z: ${latest.gz.toFixed(2)}`;
    setStreamLines((prev) => {
      const next = [line, ...prev];
      return next.slice(0, 8);
    });
  }, [recentMotion]);

  const criteria = useCriteria(sensorStatus, headingData, recentMotion);

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
          {/* 3D Canvas */}
          <ImuCanvas3D
            pitch={livePitch}
            roll={liveRoll}
            yaw={liveYaw}
            mode={mode}
            sensorAvailable={sensorStatus.hasHardwareMotion}
          />

          {/* Sliders (read-only, mirrors live orientation) */}
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
          >
            <SliderReadout
              icon="swap_vert"
              iconColor="var(--color-error)"
              label="Pitch Offset"
              rangeLabel="± 180°"
              tone="error"
              value={livePitch}
            />
            <SliderReadout
              icon="360"
              iconColor="#a4c9ff"
              label="Roll Offset"
              rangeLabel="± 180°"
              tone="secondary"
              value={liveRoll}
            />
            <SliderReadout
              icon="explore"
              iconColor="var(--color-accent-text)"
              label="Yaw Heading"
              rangeLabel="0–360°"
              tone="accent"
              value={liveYaw}
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
              {criteria.map((c) => (
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
                  style={{
                    background: sensorStatus.hasHardwareMotion
                      ? 'var(--color-accent)'
                      : 'var(--color-text-tertiary)',
                  }}
                />
                {sensorStatus.hasHardwareMotion ? 'IMU LIVE' : 'AWAITING'}
              </span>
            </div>
            <div
              ref={streamRef}
              className="flex flex-col"
              style={{
                gap: 4,
                fontFamily: "'Google Sans Mono',monospace",
                fontSize: 11,
                lineHeight: 1.4,
                color: 'var(--color-text-tertiary)',
                opacity: 0.85,
              }}
            >
              {streamLines.length === 0 && (
                <div style={{ opacity: 0.6 }}>
                  Waiting for IMU samples… enable permissions to begin streaming.
                </div>
              )}
              {streamLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
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

// ----- 3D IMU Canvas -----
// Uses a true HTML5 canvas + custom painter to render an isometric cube that
// rotates from the live gyro Euler angles. (Avoids a heavy 3D dependency.)
interface ImuCanvas3DProps {
  pitch: number;
  roll: number;
  yaw: number;
  mode: string;
  sensorAvailable: boolean;
}

const formatDeg = (v: number, withSign = false): string => {
  const sign = withSign && v > 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}°`;
};

const ImuCanvas3D: React.FC<ImuCanvas3DProps> = ({
  pitch,
  roll,
  yaw,
  mode,
  sensorAvailable,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Convert degrees → radians, with axis mapping that matches the IMU's
    // physical frame (Y = yaw, X = pitch, Z = roll).
    const yawRad = ((yaw - 180) * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const rollRad = (roll * Math.PI) / 180;

    // 3-axis rotation matrix Rz(yaw) * Rx(pitch) * Rz(roll)
    const rot = (x: number, y: number, z: number) => {
      // Rz(roll)
      const cR = Math.cos(rollRad);
      const sR = Math.sin(rollRad);
      const x1 = x * cR - y * sR;
      const y1 = x * sR + y * cR;
      const z1 = z;
      // Rx(pitch)
      const cP = Math.cos(pitchRad);
      const sP = Math.sin(pitchRad);
      const x2 = x1;
      const y2 = y1 * cP - z1 * sP;
      const z2 = y1 * sP + z1 * cP;
      // Rz(yaw)
      const cY = Math.cos(yawRad);
      const sY = Math.sin(yawRad);
      const x3 = x2 * cY - y2 * sY;
      const y3 = x2 * sY + y2 * cY;
      const z3 = z2;
      return [x3, y3, z3];
    };

    let raf = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      const gridStep = 28;
      ctx.strokeStyle = 'rgba(141,147,130,0.20)';
      ctx.lineWidth = 1;
      for (let x = (cx % gridStep); x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = (cy % gridStep); y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Unit cube vertices (s = half size in world units)
      const s = 70;
      const verts: [number, number, number][] = [
        [-s, -s, -s],
        [s, -s, -s],
        [s, s, -s],
        [-s, s, -s],
        [-s, -s, s],
        [s, -s, s],
        [s, s, s],
        [-s, s, s],
      ];

      // Project each vertex
      const focal = 380;
      const proj = verts.map(([x, y, z]) => {
        const [rx, ry, rz] = rot(x, y, z);
        // Simple perspective projection
        const depth = focal / (focal + rz + 400);
        return {
            x: cx + rx * depth,
            y: cy + ry * depth,
            z: rz,
          };
      });

      // Faces: [indices, color, stroke]
      const faces: { idx: [number, number, number, number]; fill: string; stroke: string }[] = [
        { idx: [0, 1, 2, 3], fill: '#353534', stroke: '#8d9382' }, // back
        { idx: [4, 5, 6, 7], fill: '#a8d672', stroke: '#385d02' }, // front (accent face)
        { idx: [0, 1, 5, 4], fill: '#2a2a2a', stroke: '#8d9382' }, // bottom
        { idx: [3, 2, 6, 7], fill: '#1f1f1f', stroke: '#8d9382' }, // top
        { idx: [0, 3, 7, 4], fill: '#131313', stroke: '#8d9382' }, // left
        { idx: [1, 2, 6, 5], fill: '#201f1f', stroke: '#8d9382' }, // right
      ];

      // Painter's algorithm: draw faces in order of increasing average z (back to front)
      const ordered = faces
        .map((f) => ({
          ...f,
          avgZ:
            (proj[f.idx[0]].z +
              proj[f.idx[1]].z +
              proj[f.idx[2]].z +
              proj[f.idx[3]].z) /
            4,
        }))
        .sort((a, b) => a.avgZ - b.avgZ);

      for (const f of ordered) {
        ctx.beginPath();
        const p0 = proj[f.idx[0]];
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i < f.idx.length; i++) {
          const p = proj[f.idx[i]];
          ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = f.fill;
        ctx.fill();
        ctx.strokeStyle = f.stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Highlight the "front face" centroid with an arrow / status LED
      const front = [proj[4], proj[5], proj[6], proj[7]];
      const cxf = (front[0].x + front[1].x + front[2].x + front[3].x) / 4;
      const cyf = (front[0].y + front[1].y + front[2].y + front[3].y) / 4;

      // Animated LED
      const t = performance.now() / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2);
      ctx.beginPath();
      ctx.arc(cxf, cyf, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(195,243,139,${0.5 + pulse * 0.4})`;
      ctx.shadowColor = '#c3f38b';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Direction arrow pointing out of front face (along +Z in object space)
      const arrow = rot(0, 0, s * 1.6);
      const fz = focal / (focal + arrow[2] + 400);
      const ax = cx + arrow[0] * fz;
      const ay = cy + arrow[1] * fz;
      ctx.beginPath();
      ctx.moveTo(cxf, cyf);
      ctx.lineTo(ax, ay);
      ctx.strokeStyle = '#0164b4';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Arrow head
      ctx.beginPath();
      ctx.arc(ax, ay, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0164b4';
      ctx.fill();

      // Axes legend (top-right of canvas)
      const axisLen = 60;
      const axisOrigin = { x: w - 90, y: 70 };
      const drawAxis = (label: string, vec: [number, number, number], color: string) => {
        const [rx, ry, rz] = rot(vec[0], vec[1], vec[2]);
        const fz2 = focal / (focal + rz + 400);
        const ex = axisOrigin.x + rx * fz2 * 1.2;
        const ey = axisOrigin.y + ry * fz2 * 1.2;
        ctx.beginPath();
        ctx.moveTo(axisOrigin.x, axisOrigin.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = '10px "Google Sans Mono", monospace';
        ctx.fillText(label, ex + 4, ey + 4);
      };
      drawAxis('X', [axisLen, 0, 0], '#ffb4ab');
      drawAxis('Y', [0, axisLen, 0], '#c3f38b');
      drawAxis('Z', [0, 0, axisLen], '#a4c9ff');

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [pitch, roll, yaw]);

  return (
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
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, var(--color-accent-soft), transparent 60%)',
          opacity: 0.5,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

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
          {mode}
        </div>
      </div>

      {/* Live readout overlay */}
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
        <Readout label="PITCH" value={formatDeg(pitch, true)} tone="error" />
        <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />
        <Readout label="ROLL" value={formatDeg(roll, true)} tone="secondary" />
        <div style={{ width: 1, height: 24, background: 'var(--color-border)' }} />
        <Readout label="YAW" value={formatDeg(yaw)} tone="accent" />
      </div>

      {/* Sensor availability notice */}
      {!sensorAvailable && (
        <div
          className="absolute"
          style={{
            top: 20,
            right: 20,
            padding: '8px 14px',
            borderRadius: 12,
            background: 'var(--color-warning-soft)',
            border: '1px solid var(--color-warning)',
            color: 'var(--color-warning-text)',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icon name="warning" size={14} />
          IMU not active — start the simulator to see rotation
        </div>
      )}
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

const SliderReadout: React.FC<{
  icon: string;
  iconColor: string;
  label: string;
  rangeLabel: string;
  tone: 'error' | 'secondary' | 'accent';
  value: number;
}> = ({ icon, iconColor, label, rangeLabel, tone, value }) => {
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

  // Map [0..360] to slider position 0..100
  const pct = (value / 360) * 100;

  const display = (() => {
    const sign = value > 180 ? '-' : '+';
    const normalized = value > 180 ? 360 - value : value;
    return `${sign}${normalized.toFixed(1)}°`;
  })();

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
        <div
          className="relative w-full"
          style={{
            height: 6,
            borderRadius: 9999,
            background: rangeColor,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -3,
              left: `calc(${pct}% - 7px)`,
              width: 14,
              height: 14,
              borderRadius: 9999,
              background: accent,
              border: '2px solid var(--color-bg-secondary)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              transition: 'left 0.1s linear',
            }}
          />
        </div>
        <div
          className="flex justify-between"
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>0°</span>
          <span style={{ color: valueColor, fontWeight: 500 }}>{display}</span>
          <span>360°</span>
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