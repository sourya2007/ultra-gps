import React, { useMemo, useState } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';
import type { AIInferenceMetrics, MotionSample, SensorStatus } from '../types';

interface FusionHealthProps {
  sensorStatus?: SensorStatus;
  aiMetrics?: AIInferenceMetrics;
  recentMotion?: MotionSample[];
}

export const FusionHealth: React.FC<FusionHealthProps> = ({
  sensorStatus,
  aiMetrics,
  recentMotion = [],
}) => {
  const { isDark } = useTheme();
  const [blackout, setBlackout] = useState(false);

  // Drift variance from real accel magnitudes
  const drift = useMemo(() => {
    if (recentMotion.length < 4) return 0.12;
    const samples = recentMotion.slice(-30);
    const mags = samples.map((s) => s.filteredMagnitude);
    const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
    const variance = mags.reduce((a, b) => a + (b - mean) ** 2, 0) / mags.length;
    const base = Math.sqrt(variance);
    return blackout ? Math.min(2.5, base + 0.3) : Math.max(0.12, base);
  }, [recentMotion, blackout]);

  // The circular gauge: 283 is the circumference of a circle with r=45
  const circumference = 283;
  const gnssPct = blackout || !sensorStatus?.gpsActive ? 0 : 0.6;
  const insPct = blackout ? 0.9 : sensorStatus?.hasHardwareMotion ? 0.3 : 0.6;
  const gnssOffset = circumference * (1 - gnssPct);
  const insOffset = circumference * (1 - insPct);

  // Sparkline paths from real motion variance
  const motionStd = useMemo(() => {
    if (recentMotion.length < 4) return 0.1;
    const mags = recentMotion.slice(-20).map((s) => s.filteredMagnitude);
    const mean = mags.reduce((a, b) => a + b, 0) / mags.length;
    return Math.sqrt(mags.reduce((a, b) => a + (b - mean) ** 2, 0) / mags.length);
  }, [recentMotion]);
  const wobble = Math.min(20, motionStd * 30);
  const gnssPath = blackout
    ? `M0,20 Q10,25 20,40 T40,80 T60,95 T80,98 T100,99`
    : `M0,${20 - wobble} Q10,${25 - wobble} 20,${40 - wobble} T40,${80 - wobble} T60,${85 - wobble} T80,${30 - wobble} T100,${20 - wobble}`;
  const aiPath = blackout
    ? `M0,80 Q10,75 20,60 T40,20 T60,15 T80,70 T100,80`
    : `M0,${75 - wobble} Q10,${70 - wobble} 20,${55 - wobble} T40,${25 - wobble} T60,${20 - wobble} T80,${60 - wobble} T100,${75 - wobble}`;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Fusion Engine Core */}
      <div
        className="relative"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
          overflow: 'hidden',
        }}
      >
        {/* Soft corner glow */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 128,
            height: 128,
            background: 'var(--color-accent)',
            opacity: 0.10,
            borderRadius: '50%',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />
        <div className="flex items-center justify-between relative z-10">
          <h3
            className="font-semibold"
            style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
          >
            Fusion Engine Core
          </h3>
          <div
            className="flex items-center gap-1.5"
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-inset)',
              border: '1px solid rgba(195,243,139,0.30)',
            }}
          >
            <span
              className="status-dot"
              style={{ background: 'var(--color-accent)' }}
            />
            <span
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--color-accent-text)',
                fontFamily: "'Google Sans Mono', monospace",
              }}
            >
              {aiMetrics?.isLoaded ? `${aiMetrics.modelName.split(' ')[0]}-Active` : 'Standby'}
            </span>
          </div>
        </div>

        {/* Main gauge */}
        <div className="flex flex-col items-center justify-center py-4 relative z-10">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 'min(180px, 45vw)', height: 'min(180px, 45vw)' }}
          >
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'rotate(-90deg)' }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-bg-inset)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={gnssOffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={insOffset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="flex flex-col items-center text-center">
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Drift Variance
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  style={{
                    fontFamily: "'Google Sans Mono', monospace",
                    fontSize: 28,
                    color: 'var(--color-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 500,
                  }}
                >
                  {drift.toFixed(2)}
                </span>
                <span
                  style={{
                    fontFamily: "'Google Sans Mono', monospace",
                    fontSize: 13,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  m
                </span>
              </div>
              <span
                className="mt-1"
                style={{
                  fontSize: 10,
                  color: 'var(--color-accent-text)',
                  background: 'rgba(195,243,139,0.10)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                AI COMPENSATING
              </span>
            </div>
          </div>

          <div className="w-full flex justify-between px-6 mt-3">
            <div className="flex flex-col items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: 'var(--color-accent)' }}
              />
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                GNSS ({Math.round(gnssPct * 100)}%)
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: 'var(--color-accent)' }}
              />
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                INS ({Math.round(insPct * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signal vs Confidence */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-semibold"
            style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
          >
            Signal vs Confidence
          </h3>
          <Icon name="show_chart" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
        </div>
        <div
          className="relative w-full overflow-hidden"
          style={{
            height: 'clamp(80px, 18vh, 120px)',
            borderBottom: '1px solid var(--color-border)',
            borderLeft: '1px solid var(--color-border)',
            paddingLeft: 4,
            paddingBottom: 2,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="2 2" />
            <path
              d={gnssPath}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={aiPath}
              fill="none"
              stroke="var(--color-accent)"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            <defs>
              <linearGradient id="ai-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.20" />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${aiPath} L100,100 L0,100 Z`}
              fill="url(#ai-gradient)"
            />
          </svg>
        </div>
        <div className="flex justify-between mt-2">
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            -60s
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            NOW
          </span>
        </div>
      </div>

      {/* Drift Topography */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
        }}
      >
        <h3
          className="font-semibold mb-3"
          style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
        >
          Drift Topography
        </h3>
        <div
          className="relative"
          style={{
            width: '100%',
            height: 'clamp(100px, 20vh, 140px)',
            background: isDark
              ? 'radial-gradient(ellipse at center, rgba(20,20,20,1) 0%, rgba(0,0,0,1) 100%)'
              : 'radial-gradient(ellipse at center, rgba(220,220,220,1) 0%, rgba(180,180,180,1) 100%)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 35% 40%, rgba(255,180,171,0.30) 0%, transparent 60%)',
              mixBlendMode: 'screen',
              opacity: blackout ? 0.8 : 0.4,
              transform: 'translate(20%, -20%) scale(1.4)',
              transition: 'opacity 0.5s ease',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 65% 70%, rgba(195,243,139,0.20) 0%, transparent 60%)',
              mixBlendMode: 'screen',
              opacity: 0.5,
              transform: 'translate(-20%, 20%)',
            }}
          />
        </div>
      </div>

      {/* System Interlocks */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
        }}
      >
        <h3
          className="font-semibold mb-2"
          style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
        >
          System Interlocks
        </h3>
        <p
          className="m-0 mb-3"
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          Test Dead Reckoning transition parameters under simulated signal loss.
        </p>

        <div
          className="flex items-center justify-between"
          style={{
            padding: 12,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border)',
            marginBottom: 10,
          }}
        >
          <div>
            <div
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.08em',
                color: 'var(--color-text-primary)',
              }}
            >
              GNSS Blackout
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--color-text-tertiary)',
                fontFamily: "'Google Sans Mono', monospace",
                marginTop: 2,
              }}
            >
              Force INS primary
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBlackout((b) => !b)}
            aria-label="Toggle GNSS blackout"
            className="relative"
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: blackout ? 'var(--color-error)' : 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'background 0.3s ease',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: blackout ? 22 : 2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: 'var(--color-text-primary)',
                transition: 'left 0.3s ease',
              }}
            />
          </button>
        </div>

        <button
          type="button"
          className="w-full"
          style={{
            height: 44,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(195,243,139,0.10)',
            border: '1px solid var(--color-accent)',
            color: 'var(--color-accent-text)',
            fontFamily: "'Google Sans Flex', sans-serif",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Calibrate Inertial Sensors
        </button>
      </div>
    </div>
  );
};