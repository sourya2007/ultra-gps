import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface AILabDesktopProps {
  onOpenArchitecture?: () => void;
  onRunSimulation?: () => void;
  onExportData?: () => void;
}

export const AILabDesktop: React.FC<AILabDesktopProps> = ({
  onOpenArchitecture: _onOpenArchitecture,
  onRunSimulation,
  onExportData,
}) => {
  const [accuracy, setAccuracy] = useState(98.4);
  const [latency, setLatency] = useState(12.8);
  const [noiseDb, setNoiseDb] = useState(-42.5);
  const [epoch, setEpoch] = useState(14209);
  const [filterSel, setFilterSel] = useState<'kalman' | 'nn'>('nn');

  useEffect(() => {
    const t = setInterval(() => {
      setAccuracy((v) => Math.max(97, Math.min(99.5, v + (Math.random() - 0.5) * 0.3)));
      setLatency((v) => Math.max(8, Math.min(20, v + (Math.random() - 0.5) * 1.2)));
      setNoiseDb((v) => Math.max(-50, Math.min(-30, v + (Math.random() - 0.5) * 1.5)));
      setEpoch((v) => v + 1);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Generate spectrum bars
  const bars = Array.from({ length: 24 }, (_, i) => {
    const h = 20 + ((i * 17 + epoch) % 70);
    const isHigh = h > 70;
    return { h, isHigh };
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            AI Analysis Lab
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              maxWidth: 720,
              fontSize: 16,
              color: 'var(--color-text-tertiary)',
            }}
          >
            Advanced telemetry analysis comparing raw IMU output against the current AI predictive model. Review noise rejection, velocity predictions, and real-time filter diagnostics.
          </p>
        </div>
        <div className="flex items-center" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={onExportData}
            className="flex items-center"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Icon name="download" size={18} />
            Export Data
          </button>
          <button
            type="button"
            onClick={onRunSimulation}
            className="flex items-center"
            style={{
              padding: '10px 24px',
              borderRadius: 10,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(195,243,139,0.30)',
            }}
          >
            <Icon name="play_arrow" size={18} />
            Run Simulation
          </button>
        </div>
      </div>

      {/* Quick stats row (4 cards) */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 24,
        }}
      >
        <StatCard
          label="Model Accuracy"
          value={accuracy.toFixed(1)}
          unit="%"
          icon="check_circle"
          tone="accent"
          bar={accuracy}
        />
        <StatCard
          label="Latency Delay"
          value={latency.toFixed(1)}
          unit="ms"
          icon="speed"
          tone="secondary"
          bar={25}
        />
        <StatCard
          label="Noise Rejection"
          value={noiseDb.toFixed(1)}
          unit="dB"
          icon="graphic_eq"
          tone="tertiary"
          bar={85}
        />
        <StatCard
          label="Current Epoch"
          value={epoch.toLocaleString()}
          icon="update"
          tone="error"
          bar={45}
        />
      </div>

      {/* Main Bento grid (col-span-8 + col-span-4) */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 24,
        }}
      >
        {/* Velocity Predictor (col-span-8) */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            gridColumn: 'span 8',
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{
              padding: '24px 24px 8px 24px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <Icon name="timeline" size={20} style={{ color: 'var(--color-accent-text)' }} />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Velocity Predictor: AI vs Raw IMU
              </h2>
            </div>
            <div className="flex items-center" style={{ gap: 16 }}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <span
                  className="rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: 'var(--color-text-tertiary)',
                    border: '1px solid var(--color-text-primary)',
                  }}
                />
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Raw Data
                </span>
              </div>
              <div className="flex items-center" style={{ gap: 6 }}>
                <span
                  className="rounded-full"
                  style={{
                    width: 12,
                    height: 12,
                    background: 'var(--color-accent)',
                    boxShadow: '0 0 8px rgba(195,243,139,0.6)',
                  }}
                />
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-accent-text)',
                  }}
                >
                  AI Prediction
                </span>
              </div>
            </div>
          </div>
          <div
            className="relative flex-1"
            style={{ padding: 24, minHeight: 400 }}
          >
            {/* Y-axis labels */}
            <div
              className="absolute flex flex-col justify-between"
              style={{
                top: 24,
                bottom: 48,
                left: 24,
                fontSize: 10,
                fontFamily: "'Google Sans Mono',monospace",
                color: 'var(--color-text-tertiary)',
              }}
            >
              <span>120m/s</span>
              <span>90m/s</span>
              <span>60m/s</span>
              <span>30m/s</span>
              <span>0m/s</span>
            </div>
            {/* Grid lines */}
            <div
              className="absolute flex flex-col justify-between pointer-events-none"
              style={{
                top: 24,
                bottom: 48,
                left: 80,
                right: 24,
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 1,
                    width: '100%',
                    background: i === 4 ? 'var(--color-border)' : 'var(--color-border)',
                    borderTop: '1px dashed var(--color-border)',
                  }}
                />
              ))}
            </div>
            {/* SVG graph */}
            <div
              className="absolute"
              style={{ top: 24, bottom: 48, left: 80, right: 24 }}
            >
              <svg
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
                width="100%"
                height="100%"
              >
                <defs>
                  <linearGradient id="aiGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#c3f38b" stopOpacity="1" />
                    <stop offset="100%" stopColor="#c3f38b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Raw data (jagged) */}
                <path
                  d="M0,350 L20,345 L40,360 L60,330 L80,310 L100,325 L120,290 L140,295 L160,270 L180,285 L200,240 L220,255 L240,210 L260,225 L280,180 L300,200 L320,150 L340,165 L360,120 L380,140 L400,90 L420,110 L440,70 L460,85 L480,50 L500,70 L520,30 L540,55 L560,20 L580,45 L600,10 L620,35 L640,15 L660,30 L680,25 L700,50 L720,45 L740,70 L760,65 L780,100 L800,90 L820,130 L840,120 L860,160 L880,150 L900,190 L920,180 L940,220 L960,210 L980,260 L1000,250"
                  fill="none"
                  stroke="var(--color-text-tertiary)"
                  strokeOpacity="0.6"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                {/* AI (smooth) */}
                <path
                  d="M0,345 C50,340 100,315 150,280 C200,245 250,200 300,165 C350,130 400,95 450,75 C500,55 550,35 600,25 C650,15 700,45 750,80 C800,115 850,150 900,195 C950,240 980,255 1000,260"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
                <path
                  d="M0,400 L0,345 C50,340 100,315 150,280 C200,245 250,200 300,165 C350,130 400,95 450,75 C500,55 550,35 600,25 C650,15 700,45 750,80 C800,115 850,150 900,195 C950,240 980,255 1000,260 L1000,400 Z"
                  fill="url(#aiGrad)"
                  opacity="0.2"
                />
                {/* Playhead */}
                <line
                  x1="750"
                  x2="750"
                  y1="0"
                  y2="400"
                  stroke="var(--color-error)"
                  strokeDasharray="4"
                  strokeWidth="1"
                />
                <circle cx="750" cy="80" fill="var(--color-accent)" r="6" />
                <circle cx="750" cy="80" fill="var(--color-accent)" r="12" opacity="0.2" className="animate-ping" />
              </svg>
            </div>
            {/* X-axis */}
            <div
              className="absolute flex justify-between"
              style={{
                left: 56,
                right: 24,
                bottom: 16,
                fontSize: 10,
                fontFamily: "'Google Sans Mono',monospace",
                color: 'var(--color-text-tertiary)',
              }}
            >
              <span>T-10s</span>
              <span>T-8s</span>
              <span>T-6s</span>
              <span>T-4s</span>
              <span>T-2s</span>
              <span style={{ color: 'var(--color-accent-text)', fontWeight: 700 }}>NOW</span>
            </div>
          </div>
        </div>

        {/* Right column (col-span-4) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 4', gap: 24 }}
        >
          {/* Noise Rejection Spectrum */}
          <div
            className="flex flex-col"
            style={{
              padding: 24,
              gap: 16,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: 8 }}>
                <Icon name="graphic_eq" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Noise Spectrum
                </h3>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-text-tertiary)',
                }}
              >
                {noiseDb.toFixed(1)} dB AVG
              </span>
            </div>
            <div
              className="flex items-end"
              style={{ height: 128, gap: 4 }}
            >
              {bars.map(({ h, isHigh }, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{
                    height: `${h}%`,
                    background: isHigh ? 'rgba(255,180,171,0.60)' : 'rgba(164,201,255,0.60)',
                    borderRadius: '2px 2px 0 0',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 1, background: 'var(--color-bg-primary)' }} />
                  <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 2, background: 'var(--color-bg-primary)' }} />
                </div>
              ))}
            </div>
            <div
              className="flex justify-between"
              style={{
                fontSize: 10,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
              }}
            >
              <span>0Hz</span>
              <span>100Hz</span>
              <span>500Hz</span>
              <span>1kHz</span>
            </div>
            <div className="flex" style={{ gap: 16 }}>
              <button
                type="button"
                onClick={() => setFilterSel('kalman')}
                className="flex-1"
                style={{
                  padding: '8px 0',
                  borderRadius: 8,
                  background: filterSel === 'kalman' ? 'var(--color-bg-inset)' : 'transparent',
                  color: filterSel === 'kalman' ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Kalman Filter
              </button>
              <button
                type="button"
                onClick={() => setFilterSel('nn')}
                className="flex-1"
                style={{
                  padding: '8px 0',
                  borderRadius: 8,
                  background: filterSel === 'nn' ? 'rgba(195,243,139,0.10)' : 'transparent',
                  color: filterSel === 'nn' ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                  border: filterSel === 'nn' ? '1px solid rgba(195,243,139,0.30)' : '1px solid var(--color-border)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: filterSel === 'nn' ? 'inset 0 0 8px rgba(195,243,139,0.10)' : 'none',
                }}
              >
                AI Neural Net
              </button>
            </div>
          </div>

          {/* Filter Diagnostics Table */}
          <div
            className="flex flex-col flex-1 overflow-hidden"
            style={{
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                padding: 20,
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center" style={{ gap: 8 }}>
                <Icon name="memory" size={20} style={{ color: '#a4c9ff' }} />
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Filter Diagnostics
                </h3>
              </div>
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr',
                padding: '12px 20px',
                background: 'var(--color-bg-inset)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.10em',
                color: 'var(--color-text-tertiary)',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <span>Parameter</span>
              <span style={{ textAlign: 'right' }}>Current</span>
              <span style={{ textAlign: 'right' }}>Variance</span>
            </div>
            <div className="flex flex-col" style={{ overflowY: 'auto', maxHeight: 220 }}>
              <DiagRow label="Kalman Gain (K)" current="0.8241" variance="±0.002" tone="accent" />
              <DiagRow label="Process Noise (Q)" current="1.04e-3" variance="±1.2e-4" tone="accent" />
              <DiagRow label="Meas. Noise (R)" current="4.52e-2" variance="±3.1e-3" tone="error" />
              <DiagRow label="Innovation (y)" current="0.0124" variance="±0.001" tone="accent" />
              <DiagRow label="Covariance (P)" current="Matrix 3x3" variance="Stable" tone="secondary" />
            </div>
          </div>
        </div>

        {/* BOTTOM: Spatial Context */}
        <div
          className="relative overflow-hidden"
          style={{
            gridColumn: 'span 12',
            minHeight: 280,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDGn6g4hQjPzBSEXIwCHXG24LAEhzPbYiqYb1Za1YR11eWNoFz-m9sxnwmYJtWhoSUpgICAozbJFPt4Ae6V7qDtUJtsZ_m1tRGzWwXCwT6la6njfgEgNvgtjan2_SFOUadHGi9fzk-jbXN4m4IkY7aV7ZquRn9eLLJrIYt9b-UakahZ30EV7ZiCekJH-cdp6yMkxB808epHmcCivdK4zOOG3_z0s_TBcHP-afMHQUXz3t0BBRK1Tv9t')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.30,
              mixBlendMode: 'luminosity',
              filter: 'grayscale(1)',
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, var(--color-bg-elevated) 0%, var(--color-bg-elevated) 50%, transparent 100%)' }}
            aria-hidden
          />
          <div
            className="relative flex flex-col justify-center"
            style={{
              width: '50%',
              padding: 32,
              gap: 16,
            }}
          >
            <span
              className="flex items-center"
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: 'var(--color-bg-inset)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                gap: 8,
                width: 'fit-content',
              }}
            >
              <span
                className="rounded-full animate-pulse"
                style={{ width: 8, height: 8, background: '#a4c9ff' }}
              />
              Spatial Context Lock
            </span>
            <h2
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: '34px',
                letterSpacing: '-0.02em',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              Track Geometry Correlation
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 16,
                color: 'var(--color-text-tertiary)',
                lineHeight: 1.5,
              }}
            >
              The AI model is currently correlating raw GNSS positional drift against known topological maps of the testing circuit to improve inertial dead-reckoning accuracy during tunnel/canopy obstruction.
            </p>
            <div className="flex" style={{ gap: 32, marginTop: 16 }}>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Current Sector
                </span>
                <span
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 22,
                    fontWeight: 500,
                    color: 'var(--color-accent-text)',
                  }}
                >
                  Flugplatz
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Lateral G Max
                </span>
                <span
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 22,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  1.84g
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: 4 }}>
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Map Confidence
                </span>
                <span
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#a4c9ff',
                  }}
                >
                  99.8%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string;
  unit?: string;
  icon: string;
  tone: 'accent' | 'secondary' | 'tertiary' | 'error';
  bar: number;
}> = ({ label, value, unit, icon, tone, bar }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : tone === 'tertiary'
      ? 'var(--color-text-tertiary)'
      : 'var(--color-error)';
  const textColor =
    tone === 'accent'
      ? 'var(--color-accent-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : tone === 'tertiary'
      ? 'var(--color-text-tertiary)'
      : 'var(--color-error-text)';
  return (
    <div
      className="relative overflow-hidden"
      style={{
        padding: 24,
        gap: 8,
        borderRadius: 16,
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            tone === 'accent'
              ? 'linear-gradient(135deg, rgba(195,243,139,0.10) 0%, transparent 60%)'
              : tone === 'secondary'
              ? 'linear-gradient(135deg, rgba(164,201,255,0.10) 0%, transparent 60%)'
              : tone === 'error'
              ? 'linear-gradient(135deg, rgba(255,180,171,0.10) 0%, transparent 60%)'
              : 'linear-gradient(135deg, rgba(164,201,255,0.10) 0%, transparent 60%)',
          opacity: 0,
          transition: 'opacity 0.3s',
        }}
      />
      <div className="flex items-center justify-between relative">
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
        <Icon name={icon} size={20} style={{ color: textColor }} />
      </div>
      <div className="flex items-end relative" style={{ gap: 4 }}>
        <span
          style={{
            fontFamily: "'Google Sans Flex','Inter',sans-serif",
            fontSize: 32,
            lineHeight: 1,
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "'Google Sans Mono',monospace",
              fontSize: 12,
              color: textColor,
              marginBottom: 2,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      <div
        className="w-full overflow-hidden relative"
        style={{ height: 4, borderRadius: 9999, background: 'var(--color-bg-inset)', marginTop: 8 }}
      >
        <div
          style={{
            width: `${bar}%`,
            height: '100%',
            borderRadius: 9999,
            background: color,
          }}
        />
      </div>
    </div>
  );
};

const DiagRow: React.FC<{
  label: string;
  current: string;
  variance: string;
  tone: 'accent' | 'error' | 'secondary';
}> = ({ label, current, variance, tone }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent-text)'
      : tone === 'error'
      ? 'var(--color-error-text)'
      : '#a4c9ff';
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: '1fr 1fr 1fr',
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Google Sans Mono',monospace",
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Google Sans Mono',monospace",
          color,
          textAlign: 'right',
          fontWeight: 500,
        }}
      >
        {current}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Google Sans Mono',monospace",
          color: 'var(--color-text-tertiary)',
          textAlign: 'right',
        }}
      >
        {variance}
      </span>
    </div>
  );
};
