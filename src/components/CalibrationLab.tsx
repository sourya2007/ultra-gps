import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface CalibrationLabProps {
  pitch: number;
  roll: number;
  yaw: number;
}

export const CalibrationLab: React.FC<CalibrationLabProps> = ({
  pitch,
  roll,
  yaw,
}) => {
  const { isDark } = useTheme();
  const [alignState, setAlignState] = useState<'idle' | 'running' | 'done'>('idle');
  const [criteria, setCriteria] = useState({
    gravity: true,
    velocity: false,
    vibration: false,
  });

  // Live pitch/roll with small jitter to feel real
  const [livePitch, setLivePitch] = useState(pitch);
  const [liveRoll, setLiveRoll] = useState(roll);
  useEffect(() => {
    const t = setInterval(() => {
      setLivePitch(pitch + (Math.random() * 0.2 - 0.1));
      setLiveRoll(roll + (Math.random() * 0.1 - 0.05));
    }, 200);
    return () => clearInterval(t);
  }, [pitch, roll]);

  const onStartAlignment = () => {
    if (alignState === 'running') return;
    setAlignState('running');
    // Step through criteria so the user sees progress
    setTimeout(() => setCriteria((c) => ({ ...c, velocity: true })), 1200);
    setTimeout(() => setCriteria((c) => ({ ...c, vibration: true })), 2400);
    setTimeout(() => setAlignState('done'), 3500);
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Top status grid */}
      <div className="grid grid-cols-2 gap-2">
        <div
          style={{
            ...cardStyle,
            padding: 12,
            background: isDark ? '#1c1b1b' : 'var(--color-bg-elevated)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="precision_manufacturing" size={14} style={{ color: 'var(--color-accent)' }} />
            <span
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Mount Angle
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Google Sans Mono', monospace",
              fontSize: 18,
              lineHeight: '24px',
              color: 'var(--color-text-primary)',
            }}
          >
            {alignState === 'running' ? 'ALIGNING...' : 'DETECTING...'}
          </div>
          <div
            className="flex items-center gap-1 mt-1"
            style={{
              fontSize: 10,
              color: 'var(--color-accent-text)',
              animation: 'pulse 1.6s ease-in-out infinite',
            }}
          >
            <span
              className="status-dot"
              style={{ background: 'var(--color-accent)' }}
            />
            AI Inference Active
          </div>
        </div>
        <div
          style={{
            ...cardStyle,
            padding: 12,
            background: isDark ? '#1c1b1b' : 'var(--color-bg-elevated)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon name="speed" size={14} style={{ color: 'var(--color-accent)' }} />
            <span
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--color-text-tertiary)',
              }}
            >
              System State
            </span>
          </div>
          <div
            style={{
              fontFamily: "'Google Sans Mono', monospace",
              fontSize: 18,
              lineHeight: '24px',
              color: 'var(--color-text-primary)',
            }}
          >
            CALIBRATING
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--color-accent-text)',
              marginTop: 4,
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            Collecting Baseline
          </div>
        </div>
      </div>

      {/* 3D Visualization Area */}
      <div
        className="relative"
        style={{
          width: '100%',
          height: 280,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          background: isDark
            ? 'linear-gradient(180deg, #0a0a0a 0%, #181818 100%)'
            : 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Top overlay: live telemetry */}
        <div
          className="absolute top-0 left-0 w-full p-3 flex justify-between z-10"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, transparent 100%)',
          }}
        >
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Pitch
              </span>
              <span
                style={{
                  fontFamily: "'Google Sans Mono', monospace",
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {livePitch >= 0 ? '+' : ''}
                {livePitch.toFixed(1)}°
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Roll
              </span>
              <span
                style={{
                  fontFamily: "'Google Sans Mono', monospace",
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {liveRoll.toFixed(1)}°
              </span>
            </div>
            <div className="flex flex-col">
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Yaw
              </span>
              <span
                style={{
                  fontFamily: "'Google Sans Mono', monospace",
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {yaw.toFixed(1)}°
              </span>
            </div>
          </div>
        </div>

        {/* Wireframe grid + dashed circle */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{ opacity: isDark ? 0.30 : 0.18 }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="calib-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="var(--color-text-tertiary)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#calib-grid)" />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.3"
            strokeDasharray="1 2"
          />
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke="var(--color-accent)"
            strokeWidth="0.3"
          />
          <line
            x1="0"
            y1="50"
            x2="100"
            y2="50"
            stroke="var(--color-accent)"
            strokeWidth="0.3"
          />
        </svg>

        {/* Telemetry chip bottom-right */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-2 z-10"
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            background: isDark ? 'rgba(15,17,23,0.9)' : 'rgba(255,255,255,0.9)',
            border: '1px solid var(--color-border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            className="status-dot"
            style={{ background: 'var(--color-accent)' }}
          />
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-text-primary)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            50Hz Telemetry
          </span>
        </div>
      </div>

      {/* Alignment Criteria */}
      <div>
        <h3
          className="font-semibold mb-2"
          style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
        >
          Alignment Criteria
        </h3>
        <div className="flex flex-col gap-2">
          <AlignmentRow
            ok={criteria.gravity}
            icon="check"
            title="Gravity Vector"
            subtitle="Static reference established"
            rightText="1G OK"
          />
          <AlignmentRow
            ok={criteria.velocity}
            icon="directions_car"
            title="Forward Velocity Vector"
            subtitle="Drive >15mph straight to solve"
            rightText={criteria.velocity ? 'SOLVED' : 'PENDING'}
            rightColor={criteria.velocity ? 'var(--color-accent-text)' : 'var(--color-text-primary)'}
            pending={!criteria.velocity}
          />
          <AlignmentRow
            ok={criteria.vibration}
            icon="vibration"
            title="Chassis Vibration Baseline"
            subtitle="Filtering engine noise"
            rightText=""
            showWave={!criteria.vibration}
          />
        </div>
      </div>

      {/* Start alignment button */}
      <button
        type="button"
        onClick={onStartAlignment}
        disabled={alignState === 'running'}
        className="w-full flex items-center justify-center gap-2"
        style={{
          height: 52,
          borderRadius: 'var(--radius-md)',
          background:
            alignState === 'done'
              ? 'var(--color-accent)'
              : 'var(--color-accent)',
          color: 'var(--color-text-inverse)',
          border: 'none',
          fontFamily: "'Google Sans Flex', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          cursor: alignState === 'running' ? 'wait' : 'pointer',
          boxShadow: '0 0 15px rgba(195,243,139,0.20)',
          transition: 'all 0.25s ease',
        }}
      >
        {alignState === 'running' ? (
          <>
            <Icon name="refresh" size={20} />
            <span>Analyzing Dynamics...</span>
          </>
        ) : alignState === 'done' ? (
          <>
            <Icon name="check_circle" size={20} />
            <span>Alignment Complete</span>
          </>
        ) : (
          <>
            <Icon name="auto_fix_high" size={20} />
            <span>Start Dynamic Alignment</span>
          </>
        )}
      </button>
    </div>
  );
};

const AlignmentRow: React.FC<{
  ok: boolean;
  icon: string;
  title: string;
  subtitle: string;
  rightText: string;
  rightColor?: string;
  pending?: boolean;
  showWave?: boolean;
}> = ({ ok, icon, title, subtitle, rightText, rightColor, pending, showWave }) => {
  const { isDark } = useTheme();
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: 12,
        background: isDark ? '#1c1b1b' : 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {pending && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -4,
            background: 'var(--color-accent)',
            opacity: 0.05,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />
      )}
      <div className="flex items-center gap-3 relative z-10">
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            background: ok
              ? 'rgba(195,243,139,0.15)'
              : isDark
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.04)',
            border: ok
              ? '1px solid rgba(195,243,139,0.30)'
              : '1px solid var(--color-border)',
          }}
        >
          {ok ? (
            <Icon name={icon} size={14} style={{ color: 'var(--color-accent-text)' }} />
          ) : showWave ? (
            <Icon name={icon} size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          ) : (
            <span
              className="status-dot"
              style={{ background: 'var(--color-accent)' }}
            />
          )}
        </div>
        <div>
          <div
            className="font-semibold"
            style={{ fontSize: 14, color: 'var(--color-text-primary)' }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 10,
              color: ok ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
              fontFamily: "'Google Sans Mono', monospace",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <div className="relative z-10" style={{ minWidth: 60, textAlign: 'right' }}>
        {showWave ? (
          <svg width="64" height="16" viewBox="0 0 100 20">
            <path
              d="M0,10 Q5,20 10,10 T20,10 T30,10 T40,5 T50,15 T60,10 T70,10 T80,10 T90,10 T100,10"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              opacity="0.7"
              style={{ animation: 'pulse 1s ease-in-out infinite' }}
            />
          </svg>
        ) : (
          <span
            style={{
              fontFamily: "'Google Sans Mono', monospace",
              fontSize: 12,
              color: rightColor || 'var(--color-accent-text)',
              fontWeight: 600,
            }}
          >
            {rightText}
          </span>
        )}
      </div>
    </div>
  );
};