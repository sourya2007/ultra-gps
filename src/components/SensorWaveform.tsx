import React, { useEffect, useRef } from 'react';
import type { MotionSample } from '../types';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface SensorWaveformProps {
  recentMotion: MotionSample[];
  peakThreshold: number;
}

interface SeriesSpec {
  key: 'ax' | 'ay' | 'az' | 'gx' | 'gy' | 'gz' | 'filteredMagnitude' | 'rawMagnitude';
  label: string;
  color: string;
  width: number;
}

export const SensorWaveform: React.FC<SensorWaveformProps> = ({
  recentMotion,
  peakThreshold,
}) => {
  const accelCanvasRef = useRef<HTMLCanvasElement>(null);
  const gyroXCanvasRef = useRef<HTMLCanvasElement>(null);
  const gyroYCanvasRef = useRef<HTMLCanvasElement>(null);
  const gyroZCanvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  // Theme-aware colors — dark IMU panel (the panel itself is intentionally dark
  // so the colored signals stay high-contrast and readable, matching the reference).
  const bgColor = '#0a0a0a';
  const gridColor = '#1f1f1f';
  const labelColor = '#8d9382';
  const accent = '#c3f38b';

  const seriesAccel: SeriesSpec = {
    key: 'filteredMagnitude',
    label: 'Accel Magnitude',
    color: isDark ? '#c3f38b' : '#a7d471',
    width: 2,
  };

  const seriesGx: SeriesSpec = {
    key: 'gx',
    label: 'Gyro X (Pitch)',
    color: isDark ? '#38bdf8' : '#0284c7',
    width: 1.6,
  };
  const seriesGy: SeriesSpec = {
    key: 'gy',
    label: 'Gyro Y (Roll)',
    color: isDark ? '#10b981' : '#059669',
    width: 1.6,
  };
  const seriesGz: SeriesSpec = {
    key: 'gz',
    label: 'Gyro Z (Yaw)',
    color: isDark ? '#a78bfa' : '#7c3aed',
    width: 1.6,
  };

  // Draw a centered bidirectional line graph for gyro (range -maxDeg .. +maxDeg)
  const drawGyro = (
    canvas: HTMLCanvasElement | null,
    series: SeriesSpec,
    maxDeg: number,
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Horizontal gridlines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const midY = height / 2;
    // Zero line stronger
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = labelColor;
    ctx.font = '8px "Google Sans Mono", monospace';
    ctx.fillText(`+${maxDeg}°/s`, 4, 9);
    ctx.fillText('0', 4, midY - 2);
    ctx.fillText(`-${maxDeg}°/s`, 4, height - 4);

    if (recentMotion.length < 2) {
      // Empty state
      ctx.fillStyle = labelColor;
      ctx.font = '9px "Google Sans Mono", monospace';
      ctx.fillText('awaiting IMU samples…', width / 2 - 50, midY + 4);
      return;
    }

    const getY = (degS: number) => {
      const clamped = Math.max(-maxDeg, Math.min(maxDeg, degS));
      return midY - (clamped / maxDeg) * (midY - 6);
    };

    const stepX = width / Math.max(recentMotion.length - 1, 1);

    ctx.beginPath();
    ctx.strokeStyle = series.color;
    ctx.lineWidth = series.width;
    ctx.lineJoin = 'round';
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const v = sample[series.key] as number;
      const y = getY(v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  // Draw accel as 0..maxVal one-sided magnitude graph
  const drawAccel = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Horizontal gridlines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const maxVal = 4.0;
    const getY = (val: number) => {
      const clamped = Math.max(0, Math.min(maxVal, val));
      return height - (clamped / maxVal) * (height - 14) - 7;
    };

    // Step threshold line
    const threshY = getY(peakThreshold);
    ctx.strokeStyle = isDark ? 'rgba(255, 180, 171, 0.7)' : 'rgba(220, 38, 38, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(width, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? '#ffb4ab' : '#dc2626';
    ctx.font = '9px "Google Sans Mono", monospace';
    ctx.fillText(`TH: ${peakThreshold.toFixed(2)} m/s²`, 6, threshY - 4);

    if (recentMotion.length < 2) {
      ctx.fillStyle = labelColor;
      ctx.font = '9px "Google Sans Mono", monospace';
      ctx.fillText('awaiting IMU samples…', width / 2 - 50, height / 2);
      return;
    }

    const stepX = width / Math.max(recentMotion.length - 1, 1);

    // Filled area under signal
    ctx.beginPath();
    ctx.strokeStyle = seriesAccel.color;
    ctx.lineWidth = seriesAccel.width;
    ctx.lineJoin = 'round';
    ctx.fillStyle = isDark ? 'rgba(195, 243, 139, 0.16)' : 'rgba(66, 105, 16, 0.16)';

    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getY(sample.filteredMagnitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Fill under the line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    drawAccel(accelCanvasRef.current);
  }, [recentMotion, peakThreshold, isDark, seriesAccel.color]);

  useEffect(() => {
    drawGyro(gyroXCanvasRef.current, seriesGx, 50);
  }, [recentMotion, isDark, seriesGx.color]);

  useEffect(() => {
    drawGyro(gyroYCanvasRef.current, seriesGy, 50);
  }, [recentMotion, isDark, seriesGy.color]);

  useEffect(() => {
    drawGyro(gyroZCanvasRef.current, seriesGz, 50);
  }, [recentMotion, isDark, seriesGz.color]);

  const latest = recentMotion[recentMotion.length - 1];

  const panelStyle: React.CSSProperties = {
    background: bgColor,
    color: '#e5e2e1',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(12px, 3vw, 20px)',
    border: '1px solid var(--color-border)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
  };

  const canvasWrapStyle: React.CSSProperties = {
    width: '100%',
    height: 'clamp(60px, 12vh, 80px)',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 6,
    border: '1px solid #1f1f1f',
    background: bgColor,
  };

  return (
    <div className="flex flex-col gap-4 w-full" style={panelStyle}>
      {/* Subtle green tech glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -96,
          right: -96,
          width: 192,
          height: 192,
          background: accent,
          opacity: 0.06,
          borderRadius: '50%',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div
          className="uppercase font-bold"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: '#e5e2e1',
          }}
        >
          IMU SIGNAL ANALYSIS
        </div>
        <div
          style={{
            fontFamily: "'Google Sans Mono', monospace",
            fontSize: '12px',
            color: labelColor,
          }}
        >
          REF: 9.81 m/s²
        </div>
      </div>

      {/* Live counters row */}
      <div
        className="flex flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <Pill label="ACCEL MAG" value={latest ? `${latest.filteredMagnitude.toFixed(2)} m/s²` : '0.00 m/s²'} color={accent} />
        <Pill label="GYRO X" value={latest ? `${latest.gx.toFixed(1)} °/s` : '0.0 °/s'} color="#38bdf8" />
        <Pill label="GYRO Y" value={latest ? `${latest.gy.toFixed(1)} °/s` : '0.0 °/s'} color="#10b981" />
        <Pill label="GYRO Z" value={latest ? `${latest.gz.toFixed(1)} °/s` : '0.0 °/s'} color="#a78bfa" />
      </div>

      {/* Accelerometer Waveform */}
      <div
        className="flex flex-col gap-2"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div
            className="flex items-center gap-1"
            style={{ color: accent }}
          >
            <Icon name="show_chart" size={14} />
            Accelerometer (Dynamic Gait)
          </div>
          <span
            style={{
              fontFamily: "'Google Sans Mono', monospace",
              fontSize: '12px',
              color: '#e5e2e1',
            }}
          >
            {latest ? `${latest.filteredMagnitude.toFixed(2)}` : '0.00'} m/s²
          </span>
        </div>
        <div style={canvasWrapStyle}>
          <canvas ref={accelCanvasRef} width={560} height={80} className="w-full h-full block" />
        </div>
      </div>

      {/* Gyroscope Waveforms — X, Y, Z stacked */}
      <div
        className="flex flex-col gap-3"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div
            className="flex items-center gap-1"
            style={{ color: '#a78bfa' }}
          >
            <Icon name="sync" size={14} />
            Gyroscope (3-Axis Rotation)
          </div>
          <div
            className="flex items-center gap-2"
            style={{ fontFamily: "'Google Sans Mono', monospace", fontSize: '10px' }}
          >
            <LegendDot color="#38bdf8" label="X" />
            <LegendDot color="#10b981" label="Y" />
            <LegendDot color="#a78bfa" label="Z" />
          </div>
        </div>

        <GyroRow label="X" color="#38bdf8" canvasRef={gyroXCanvasRef} />
        <GyroRow label="Y" color="#10b981" canvasRef={gyroYCanvasRef} />
        <GyroRow label="Z" color="#a78bfa" canvasRef={gyroZCanvasRef} />
      </div>

      {/* Footer */}
      <div
        className="flex flex-nowrap items-center justify-between gap-2 pt-4"
        style={{
          borderTop: '1px solid var(--color-border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          className="flex items-center gap-2"
          style={{ color: '#e5e2e1' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: accent }}
          />
          <span
            className="uppercase font-bold"
            style={{ fontSize: '10px', letterSpacing: '0.08em' }}
          >
            STEP DETECTED
          </span>
        </div>
        <div
          className="uppercase font-bold"
          style={{
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: labelColor,
          }}
        >
          FILTER: COMPLEMENTARY (ACTIVE)
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      padding: '4px 10px',
      borderRadius: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1f1f1f',
      minWidth: 0,
    }}
  >
    <span
      style={{
        fontSize: '9px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '12px',
        color: '#e5e2e1',
        fontFamily: "'Google Sans Mono', monospace",
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
  </div>
);

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="flex items-center gap-1" style={{ color: '#8d9382' }}>
    <span
      className="inline-block rounded-full"
      style={{ width: 6, height: 6, background: color }}
    />
    {label}
  </span>
);

const GyroRow: React.FC<{
  label: string;
  color: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}> = ({ label, color, canvasRef }) => (
  <div
    className="flex items-center gap-2"
    style={{ width: '100%' }}
  >
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        background: `${color}22`,
        color,
        fontFamily: "'Google Sans Mono', monospace",
        fontSize: '11px',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
    <div
      style={{
        flex: 1,
        height: 'clamp(48px, 10vh, 60px)',
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 6,
        border: '1px solid #1f1f1f',
        background: '#0a0a0a',
      }}
    >
      <canvas ref={canvasRef} width={520} height={60} className="w-full h-full block" />
    </div>
  </div>
);