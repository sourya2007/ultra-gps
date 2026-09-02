import React from 'react';
import { Icon } from './Icon';

export const AILab: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* AI Filter Status */}
      <div
        className="flex justify-between items-center"
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 12,
        }}
      >
        <div className="flex items-center gap-2">
          <Icon name="psychology" size={20} style={{ color: 'var(--color-accent-text)' }} />
          <span
            className="font-semibold"
            style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
          >
            AI Filter Status
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-accent)',
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
            v4.2-Active
          </span>
        </div>
      </div>

      {/* Velocity Predictor */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
        }}
      >
        <div className="flex justify-between items-end mb-3">
          <div>
            <div
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Velocity Predictor
            </div>
            <div
              className="font-semibold"
              style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
            >
              AI vs Raw IMU
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#e5e2e1' }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--color-text-tertiary)',
                  fontFamily: "'Google Sans Mono', monospace",
                }}
              >
                RAW
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'var(--color-accent)' }}
              />
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--color-accent-text)',
                  fontFamily: "'Google Sans Mono', monospace",
                  filter: 'drop-shadow(0 0 4px rgba(195,243,139,0.5))',
                }}
              >
                AI
              </span>
            </div>
          </div>
        </div>

        <div
          className="relative w-full"
          style={{
            height: 110,
            background: 'var(--color-canvas-bg)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}
        >
          {/* Grid lines */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, var(--color-border) 0 1px, transparent 1px 27px)',
              opacity: 0.3,
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Raw IMU noisy line */}
            <path
              d="M0,70 L5,65 L10,75 L15,60 L20,72 L25,55 L30,68 L35,50 L40,65 L45,45 L50,60 L55,40 L60,55 L65,35 L70,50 L75,30 L80,45 L85,25 L90,40 L95,20 L100,35"
              fill="none"
              stroke="#e5e2e1"
              strokeOpacity="0.6"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
            {/* AI filtered smooth curve */}
            <path
              d="M0,68 C 10,68 20,60 30,58 C 40,56 50,48 60,45 C 70,42 80,35 90,32 C 95,30 100,28 100,28"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'drop-shadow(0 0 8px rgba(195,243,139,0.4))' }}
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
            T-10s
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

      {/* Dual stat row: Noise Rejection + NHC Snap */}
      <div className="grid grid-cols-2 gap-2">
        {/* Noise Rejection */}
        <div
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 140,
          }}
        >
          <div>
            <div
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--color-text-tertiary)',
              }}
            >
              Noise Rejection
            </div>
            <div
              className="font-semibold"
              style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
            >
              Spectrum
            </div>
          </div>
          <div className="flex items-end gap-1 flex-1">
            {[0.4, 0.6, 0.8, 1.0, 0.95, 0.5, 0.3].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  borderRadius: '2px 2px 0 0',
                  background:
                    h >= 0.7
                      ? 'var(--color-accent)'
                      : h >= 0.4
                      ? 'var(--color-accent)'
                      : 'var(--color-accent)',
                  opacity: h >= 0.7 ? 0.85 : h >= 0.4 ? 0.5 : 0.30,
                  boxShadow:
                    h >= 0.85
                      ? '0 0 4px rgba(195,243,139,0.3)'
                      : 'none',
                }}
              />
            ))}
          </div>
          <div
            className="text-center"
            style={{
              fontSize: 10,
              color: 'var(--color-accent-text)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            High-Freq Blocked
          </div>
        </div>

        {/* NHC Snap */}
        <div
          className="relative"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 12,
            minHeight: 140,
            overflow: 'hidden',
          }}
        >
          <div className="relative z-10">
            <div
              className="uppercase font-bold"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--color-text-tertiary)',
              }}
            >
              NHC Snap
            </div>
            <div
              className="font-semibold"
              style={{ fontSize: 16, color: 'var(--color-text-primary)' }}
            >
              Map Match
            </div>
          </div>
          {/* Abstract map visualizer */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'var(--color-canvas-bg)',
              marginTop: 50,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '80%',
                  height: 1,
                  background: 'var(--color-border)',
                  transform: 'rotate(-12deg)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '60%',
                  height: 1,
                  background: 'var(--color-accent)',
                  transform: 'rotate(-12deg)',
                  boxShadow: '0 0 6px rgba(195,243,139,0.6)',
                }}
              />
              {/* Drifting raw point */}
              <div
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(229,226,225,0.5)',
                  transform: 'translate(-30px, -10px)',
                }}
              />
              {/* Snap line */}
              <div
                style={{
                  position: 'absolute',
                  width: 16,
                  height: 1,
                  background: 'rgba(195,243,139,0.5)',
                  transform: 'rotate(-45deg) translate(-12px, -8px)',
                  borderTop: '1px dashed rgba(195,243,139,0.5)',
                }}
              />
              {/* Snapped point */}
              <div
                style={{
                  position: 'absolute',
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 6px rgba(195,243,139,0.5)',
                }}
              />
            </div>
          </div>
          <div
            className="mt-auto text-right"
            style={{
              position: 'absolute',
              right: 12,
              bottom: 8,
              fontSize: 10,
              color: 'var(--color-text-tertiary)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            Dev: 1.2m
          </div>
        </div>
      </div>

      {/* Filter Diagnostics data grid */}
      <div
        style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 12,
            background: 'var(--color-bg-inset)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <span
            className="uppercase font-bold"
            style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Filter Diagnostics
          </span>
        </div>
        <DataRow label="Kalman Innov X" value="0.023" tone="accent" />
        <DataRow label="Kalman Innov Y" value="0.018" tone="accent" />
        <DataRow label="Zero-Vel Update" value="FALSE" tone="text" />
        <DataRow label="NHC Active" value="TRUE" tone="accent" />
      </div>

      {/* Retrain model button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2"
        style={{
          height: 44,
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(195,243,139,0.10)',
          border: '1px solid var(--color-accent)',
          color: 'var(--color-accent-text)',
          fontFamily: "'Google Sans Flex', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <Icon name="refresh" size={18} />
        Retrain Model Weights
      </button>
    </div>
  );
};

const DataRow: React.FC<{ label: string; value: string; tone: 'accent' | 'text' }> = ({
  label,
  value,
  tone,
}) => (
  <div
    className="flex justify-between items-center"
    style={{
      padding: '10px 14px',
      borderBottom: '1px solid var(--color-border-subtle)',
    }}
  >
    <span
      style={{
        fontSize: 13,
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Mono', monospace",
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 13,
        color:
          tone === 'accent'
            ? 'var(--color-accent-text)'
            : 'var(--color-text-primary)',
        fontFamily: "'Google Sans Mono', monospace",
        fontWeight: 600,
      }}
    >
      {value}
    </span>
  </div>
);