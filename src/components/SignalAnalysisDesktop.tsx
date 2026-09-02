import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { NavigationMetrics, SensorStatus } from '../types';

interface SignalAnalysisDesktopProps {
  navigationMetrics: NavigationMetrics;
  sensorStatus: SensorStatus;
}

const SAMPLE_NMEA = [
  { t: '$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47', o: 0.4 },
  { t: '$GPGSA,A,3,04,05,,09,12,,,24,,,,,2.5,1.3,2.1*39', o: 0.6 },
  { t: '$GPGSV,2,1,08,01,40,083,46,02,17,308,41,12,07,344,39,14,22,228,45*75', o: 0.8 },
  { t: '$GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A', o: 1, accent: true },
  { t: '$GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48', o: 0.8 },
  { t: '$GPGGA,123520,4807.039,N,01131.002,E,1,08,0.9,545.4,M,46.9,M,,*42', o: 0.6 },
  { t: '$GPGSA,A,3,04,05,,09,12,,,24,,,,,2.5,1.3,2.1*39', o: 0.4 },
  { t: '$GPGSV,2,1,08,01,40,083,46,02,17,308,41,12,07,344,39,14,22,228,45*75', o: 0.3 },
];

export const SignalAnalysisDesktop: React.FC<SignalAnalysisDesktopProps> = () => {
  const [constView, setConstView] = useState<'GPS' | 'GAL' | 'BDS'>('GPS');
  const [liveFeed, setLiveFeed] = useState(true);

  // Animated spectrum path (subtle wobble around the L1 peak)
  const [spectrumPath, setSpectrumPath] = useState(
    'M0 180 Q 50 170, 100 175 T 200 160 T 300 180 T 350 120 T 380 40 T 400 20 T 420 40 T 450 140 T 500 170 T 600 165 T 700 175 T 800 180 L800 200 L0 200 Z'
  );
  useEffect(() => {
    const t = setInterval(() => {
      const w = (Math.random() - 0.5) * 4;
      const x = (Math.random() - 0.5) * 4;
      setSpectrumPath(
        `M0 180 Q 50 ${170 + w}, 100 ${175 - w} T 200 ${160 + w} T 300 ${180 - w} T 350 120 T 380 40 T 400 20 T 420 40 T 450 140 T 500 ${170 - x} T 600 ${165 + x} T 700 175 T 800 180 L800 200 L0 200 Z`
      );
    }, 800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        padding: 32,
        gap: 24,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
        minHeight: '100%',
      }}
    >
      {/* Background glows */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: 0,
          right: 0,
          width: 800,
          height: 800,
          background: 'rgba(195,243,139,0.05)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          transform: 'translate(33%, -33%)',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: 0,
          left: 0,
          width: 600,
          height: 600,
          background: 'rgba(1,100,180,0.10)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          transform: 'translate(-25%, 25%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-end relative" style={{ marginBottom: 16, zIndex: 1 }}>
        <div>
          <div className="flex items-center" style={{ gap: 12, marginBottom: 8 }}>
            <Icon name="query_stats" size={24} style={{ color: 'var(--color-accent-text)' }} />
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                lineHeight: '34px',
                letterSpacing: '-0.02em',
                fontWeight: 700,
              }}
            >
              Signal Analysis
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              maxWidth: 600,
              fontSize: 16,
              color: 'var(--color-text-tertiary)',
            }}
          >
            Advanced telemetry stream monitoring and multi-sensor correlation logging.
          </p>
        </div>
        <div className="flex" style={{ gap: 12 }}>
          <button
            type="button"
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
            <Icon name="file_download" size={18} />
            Export Log
          </button>
          <button
            type="button"
            onClick={() => setLiveFeed((v) => !v)}
            className="flex items-center"
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: liveFeed ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
              color: liveFeed ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              gap: 8,
              cursor: 'pointer',
              boxShadow: liveFeed ? '0 0 12px rgba(195,243,139,0.30)' : 'none',
            }}
          >
            <Icon name="play_arrow" size={18} />
            {liveFeed ? 'Live Feed' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="grid relative"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 16,
          zIndex: 1,
        }}
      >
        {/* LEFT (col-span-8) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 8', gap: 16 }}
        >
          {/* RF Spectrum Density */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div className="flex justify-between items-start" style={{ marginBottom: 24 }}>
              <div>
                <h3
                  className="flex items-center gap-2 uppercase"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  <span
                    className="rounded-full animate-pulse"
                    style={{ width: 8, height: 8, background: 'var(--color-accent)' }}
                  />
                  RF Spectrum Density
                </h3>
                <div
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 22,
                    lineHeight: '28px',
                    color: 'var(--color-text-primary)',
                    fontWeight: 500,
                    marginTop: 4,
                  }}
                >
                  1575.42 MHz (L1)
                </div>
              </div>
              <div className="flex" style={{ gap: 8 }}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'var(--color-bg-inset)',
                    color: 'var(--color-text-primary)',
                    fontSize: 11,
                    fontFamily: "'Google Sans Mono',monospace",
                  }}
                >
                  BW: 20MHz
                </span>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'var(--color-bg-inset)',
                    color: 'var(--color-accent-text)',
                    fontSize: 11,
                    fontFamily: "'Google Sans Mono',monospace",
                  }}
                >
                  SNR: 42dB
                </span>
              </div>
            </div>
            <div style={{ height: 192, width: '100%', position: 'relative' }}>
              <svg
                viewBox="0 0 800 200"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                style={{ color: 'var(--color-accent)' }}
              >
                <defs>
                  <linearGradient id="spectrumGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="currentColor" strokeOpacity="0.10" strokeWidth="0.5">
                  <path d="M0 40 H800 M0 80 H800 M0 120 H800 M0 160 H800" fill="none" />
                  <path d="M100 0 V200 M200 0 V200 M300 0 V200 M400 0 V200 M500 0 V200 M600 0 V200 M700 0 V200" fill="none" />
                </g>
                <path d={spectrumPath} fill="url(#spectrumGrad)" />
                <path
                  d={spectrumPath.replace(/ L800 200 L0 200 Z/g, '')}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.80"
                  strokeWidth="2"
                />
                <path
                  d="M0 185 L 50 182 L 100 187 L 150 183 L 200 188 L 250 181 L 300 189 L 350 185 L 800 186"
                  fill="none"
                  stroke="var(--color-error)"
                  strokeDasharray="4 4"
                  strokeOpacity="0.50"
                  strokeWidth="1"
                />
              </svg>
              <div
                className="absolute left-0 right-0 flex justify-between"
                style={{
                  bottom: -22,
                  fontSize: 10,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-text-tertiary)',
                  opacity: 0.7,
                }}
              >
                <span>-10MHz</span>
                <span>Fc</span>
                <span>+10MHz</span>
              </div>
            </div>
          </div>

          {/* Constellation Carrier Phase */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div className="flex justify-between items-start" style={{ marginBottom: 24 }}>
              <h3
                className="uppercase"
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Constellation Carrier Phase
              </h3>
              <div className="flex" style={{ gap: 8 }}>
                {(['GPS', 'GAL', 'BDS'] as const).map((c) => {
                  const active = constView === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setConstView(c)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 8,
                        background: active ? 'var(--color-bg-inset)' : 'var(--color-bg-inset)',
                        color: active ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        fontSize: 11,
                        fontFamily: "'Google Sans Mono',monospace",
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div
              className="flex"
              style={{ height: 160, gap: 16 }}
            >
              <div
                className="flex-1 relative"
                style={{
                  borderRadius: 10,
                  background: 'var(--color-bg-inset)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ opacity: 0.20, color: 'var(--color-text-tertiary)' }}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" />
                  <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeDasharray="2 2" strokeWidth="1" />
                  <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="1" />
                  <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="1" />
                  <circle cx="140" cy="60" fill="var(--color-accent)" r="4" />
                  <circle cx="60" cy="120" fill="#a4c9ff" r="5" />
                  <circle cx="80" cy="40" fill="var(--color-error)" r="3" />
                  <circle cx="160" cy="140" fill="var(--color-accent)" r="6" />
                  <circle cx="110" cy="80" fill="#a4c9ff" r="4" />
                  <circle cx="40" cy="90" fill="var(--color-accent)" r="5" />
                </svg>
              </div>
              <div className="relative" style={{ flex: 2 }}>
                <svg viewBox="0 0 600 150" width="100%" height="100%" preserveAspectRatio="none">
                  <path
                    d="M0 75 Q 100 20, 200 80 T 400 90 T 600 60"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.5"
                    strokeOpacity="0.8"
                  />
                  <path
                    d="M0 100 Q 150 140, 300 80 T 500 40 T 600 90"
                    fill="none"
                    stroke="#a4c9ff"
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                  />
                  <path
                    d="M0 40 Q 200 10, 350 110 T 550 130 T 600 120"
                    fill="none"
                    stroke="var(--color-text-tertiary)"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                </svg>
                <div
                  className="absolute flex flex-col"
                  style={{ top: 8, right: 8, gap: 4 }}
                >
                  {[
                    { c: 'var(--color-accent)', l: 'G04' },
                    { c: '#a4c9ff', l: 'G12' },
                    { c: 'var(--color-text-tertiary)', l: 'G22' },
                  ].map(({ c, l }) => (
                    <span
                      key={l}
                      className="flex items-center"
                      style={{
                        gap: 4,
                        fontSize: 10,
                        fontFamily: "'Google Sans Mono',monospace",
                        color: c,
                      }}
                    >
                      <span style={{ width: 8, height: 2, background: c }} />
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (col-span-4) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 4', gap: 16 }}
        >
          {/* Nav Solution */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <h3
              className="uppercase"
              style={{
                margin: 0,
                fontBottom: 16,
                fontSize: 11,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-tertiary)',
                marginBottom: 16,
              }}
            >
              Nav Solution
            </h3>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <NavField label="Latitude" value="34.0522°" />
              <NavField label="Longitude" value="-118.2437°" />
              <NavField label="Altitude" value="112.4 m" />
              <NavField label="Velocity" value="0.05 m/s" />
            </div>
          </div>

          {/* IMU Fusion */}
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <h3
              className="flex items-center justify-between uppercase"
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-tertiary)',
                marginBottom: 16,
              }}
            >
              <span>IMU Fusion</span>
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 6,
                  background: 'var(--color-accent-soft)',
                  color: 'var(--color-accent-text)',
                  fontSize: 9,
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              >
                KALMAN FILT
              </span>
            </h3>
            <div className="flex flex-col" style={{ gap: 16 }}>
              <FusedBar
                label="Accel (g)"
                value="[ 0.01, -0.02,  0.98 ]"
                segs={['var(--color-error)', '#a4c9ff', 'var(--color-accent)']}
                opa={[0.4, 0.6, 1]}
              />
              <FusedBar
                label="Gyro (°/s)"
                value="[ 0.05,  0.11, -0.02 ]"
                segs={['var(--color-error)', '#a4c9ff', 'var(--color-accent)']}
                opa={[0.4, 0.6, 1]}
                widths={['25%', '50%', '25%']}
              />
            </div>
          </div>

          {/* NMEA stream */}
          <div
            className="flex flex-col flex-1"
            style={{
              minHeight: 300,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              overflow: 'hidden',
            }}
          >
            <div
              className="flex justify-between items-center"
              style={{
                padding: 16,
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-bg-inset)',
              }}
            >
              <h3
                className="uppercase"
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                Raw NMEA Stream
              </h3>
              <span
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: 'var(--color-accent)',
                  boxShadow: '0 0 8px rgba(195,243,139,0.8)',
                }}
              />
            </div>
            <div
              className="relative flex-1"
              style={{
                padding: 16,
                fontFamily: "'Google Sans Mono',monospace",
                fontSize: 12,
                lineHeight: 1.3,
                color: 'var(--color-text-tertiary)',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{
                  height: 32,
                  background: 'linear-gradient(to bottom, var(--color-bg-elevated), transparent)',
                  zIndex: 1,
                }}
              />
              <div className="flex flex-col" style={{ gap: 4 }}>
                {SAMPLE_NMEA.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      opacity: n.o,
                      color: n.accent ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    {n.t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: 4 secondary metrics */}
        <div
          className="grid relative"
          style={{
            gridColumn: 'span 12',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 16,
            marginTop: 16,
          }}
        >
          <SecondaryMetric label="HDOP" value="0.8" icon="my_location" tone="accent" />
          <SecondaryMetric label="VDOP" value="1.2" icon="height" tone="default" />
          <SecondaryMetric label="PDOP" value="1.5" icon="public" tone="default" />
          <SecondaryMetric label="SATS TRACKED" value="24 / 32" tone="accent" spinning />
        </div>
      </div>
    </div>
  );
};

const NavField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col" style={{ gap: 4 }}>
    <span
      className="uppercase"
      style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 16,
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
        fontWeight: 500,
      }}
    >
      {value}
    </span>
  </div>
);

const FusedBar: React.FC<{
  label: string;
  value: string;
  segs: string[];
  opa: number[];
  widths?: string[];
}> = ({ label, value, segs, opa, widths }) => (
  <div className="flex flex-col" style={{ gap: 4 }}>
    <div
      className="flex justify-between"
      style={{ fontFamily: "'Google Sans Mono',monospace", fontSize: 12, color: 'var(--color-text-tertiary)' }}
    >
      <span>{label}</span>
      <span style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
    <div
      className="flex w-full overflow-hidden"
      style={{ height: 6, borderRadius: 9999, background: 'var(--color-bg-inset)' }}
    >
      {segs.map((c, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: c,
            opacity: opa[i],
            width: widths ? widths[i] : undefined,
          }}
        />
      ))}
    </div>
  </div>
);

const SecondaryMetric: React.FC<{
  label: string;
  value: string;
  icon?: string;
  tone: 'accent' | 'default';
  spinning?: boolean;
}> = ({ label, value, icon, tone, spinning }) => (
  <div
    className="flex items-center justify-between"
    style={{
      padding: 16,
      borderRadius: 16,
      background: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}
  >
    <div className="flex flex-col" style={{ gap: 4 }}>
      <span
        className="uppercase"
        style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Google Sans Flex','Inter',sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: tone === 'accent' ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
        }}
      >
        {value}
      </span>
    </div>
    {spinning ? (
      <div
        className="rounded-full animate-spin"
        style={{
          width: 32,
          height: 32,
          border: '2px solid var(--color-accent)',
          borderTopColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          className="rounded-full"
          style={{ width: 8, height: 8, background: 'var(--color-accent)' }}
        />
      </div>
    ) : icon ? (
      <Icon name={icon} size={20} style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }} />
    ) : null}
  </div>
);
