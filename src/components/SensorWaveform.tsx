import React, { useEffect, useRef, useState } from 'react';
import type { MotionSample } from '../types';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

export type WaveformViewMode = 'DUAL' | 'ACCEL' | 'GYRO';

interface SensorWaveformProps {
  recentMotion: MotionSample[];
  peakThreshold: number;
}

export const SensorWaveform: React.FC<SensorWaveformProps> = ({
  recentMotion,
  peakThreshold,
}) => {
  const accelCanvasRef = useRef<HTMLCanvasElement>(null);
  const gyroCanvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode] = useState<WaveformViewMode>('DUAL');
  const { isDark } = useTheme();

  // Theme-aware colors — panel is always dark per design
  const bgColor = '#0a0a0a';
  const gridColor = '#1f1f1f';
  const labelColor = '#8d9382';
  const signalColor = isDark ? '#c3f38b' : '#426910';
  const signalColorSoft = isDark ? 'rgba(195, 243, 139, 0.14)' : 'rgba(66, 105, 16, 0.16)';

  // Draw Accelerometer Waveform
  useEffect(() => {
    const canvas = accelCanvasRef.current;
    if (!canvas || viewMode === 'GYRO') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

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

    if (recentMotion.length < 2) return;

    const stepX = width / Math.max(recentMotion.length - 1, 1);

    // Filled area under signal
    ctx.beginPath();
    ctx.strokeStyle = signalColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = signalColorSoft;

    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getY(sample.filteredMagnitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Add a soft fill underneath the line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }, [recentMotion, peakThreshold, viewMode, isDark, bgColor, gridColor, signalColor, signalColorSoft]);

  // Draw Gyroscope Waveform
  useEffect(() => {
    const canvas = gyroCanvasRef.current;
    if (!canvas || viewMode === 'ACCEL') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const midY = height / 2;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    const maxDegS = 50.0;
    const getGyroY = (degS: number) => {
      const clamped = Math.max(-maxDegS, Math.min(maxDegS, degS));
      return midY - (clamped / maxDegS) * (midY - 6);
    };

    ctx.fillStyle = labelColor;
    ctx.font = '8px "Google Sans Mono", monospace';
    ctx.fillText('+50°/s', 4, 10);
    ctx.fillText('0°/s', 4, midY - 2);
    ctx.fillText('-50°/s', 4, height - 4);

    if (recentMotion.length < 2) return;

    const stepX = width / Math.max(recentMotion.length - 1, 1);

    // Z (Yaw) - Cyan
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#38bdf8' : '#0284c7';
    ctx.lineWidth = 1.8;
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getGyroY(sample.gz);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // X (Pitch) - Rose
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#f43f5e' : '#e11d48';
    ctx.lineWidth = 1.2;
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getGyroY(sample.gx);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Y (Roll) - Emerald
    ctx.beginPath();
    ctx.strokeStyle = isDark ? '#10b981' : '#059669';
    ctx.lineWidth = 1.2;
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getGyroY(sample.gy);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, [recentMotion, viewMode, isDark, bgColor, gridColor, labelColor]);

  const latestSample = recentMotion[recentMotion.length - 1];

  return (
    <div
      className="flex flex-col gap-4 w-full"
      style={{
        background: '#0a0a0a',
        color: '#e5e2e1',
        borderRadius: 'var(--radius-xl)',
        padding: 20,
        border: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
      }}
    >
      {/* Subtle green tech glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -96,
          right: -96,
          width: 192,
          height: 192,
          background: 'var(--color-accent)',
          opacity: 0.05,
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
            fontSize: '14px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          REF: 9.81 m/s²
        </div>
      </div>

      {/* Accel Waveform */}
      {(viewMode === 'DUAL' || viewMode === 'ACCEL') && (
        <div
          className="flex flex-col gap-1"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="flex items-center justify-between text-[11px] font-bold">
            <div
              className="flex items-center gap-1"
              style={{ color: 'var(--color-accent-text)' }}
            >
              <Icon name="show_chart" size={14} />
              Accelerometer (Dynamic Gait)
            </div>
            <span
              style={{
                fontFamily: "'Google Sans Mono', monospace",
                fontSize: '14px',
                color: '#e5e2e1',
              }}
            >
              Mag: {latestSample ? latestSample.filteredMagnitude.toFixed(2) : '0.00'} m/s²
            </span>
          </div>
          <div
            className="w-full h-24 overflow-hidden relative"
            style={{
              borderBottom: '1px solid var(--color-border)',
              background: 'transparent',
            }}
          >
            <canvas ref={accelCanvasRef} width={400} height={96} className="w-full h-full block" />
          </div>
        </div>
      )}

      {/* Gyro Waveform (hidden by default) */}
      {(viewMode === 'DUAL' || viewMode === 'GYRO') && (
        <div className="flex flex-col gap-1 hidden">
          <canvas ref={gyroCanvasRef} width={400} height={80} className="w-full h-full block" />
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-4"
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
            style={{ background: 'var(--color-accent)' }}
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
            color: 'var(--color-text-tertiary)',
          }}
        >
          FILTER: COMPLEMENTARY (ACTIVE)
        </div>
      </div>
    </div>
  );
};
