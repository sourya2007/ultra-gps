import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import type {
  AIInferenceMetrics,
  HeadingData,
  MotionSample,
  NavigationMetrics,
  SensorStatus,
} from '../types';

interface TelemetryAnalysisDesktopProps {
  recentMotion: MotionSample[];
  navigationMetrics: NavigationMetrics;
  headingData: HeadingData;
  sensorStatus: SensorStatus;
  aiMetrics: AIInferenceMetrics;
  onOpenArchitecture?: () => void;
}

export const TelemetryAnalysisDesktop: React.FC<TelemetryAnalysisDesktopProps> = ({
  recentMotion,
  navigationMetrics,
  headingData,
  sensorStatus,
  aiMetrics,
  onOpenArchitecture,
}) => {
  const [exportLog, setExportLog] = useState(false);
  const [recalibrate, setRecalibrate] = useState(false);

  // Animated IMU graph
  const lineRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);
  const scanRef = useRef<SVGLineElement | null>(null);
  const scanHeadRef = useRef<SVGRectElement | null>(null);
  const valXRef = useRef<HTMLSpanElement | null>(null);
  const valYRef = useRef<HTMLSpanElement | null>(null);
  const valZRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const width = 1000;
    const height = 200;
    const numPoints = 200;
    const data: number[] = new Array(numPoints).fill(100);
    let phase = 0;
    let x = 0.245;
    let y = -0.012;
    let z = 0.981;

    const tick = () => {
      phase += 0.1;
      const noise = (Math.random() - 0.5) * 30;
      const yv = 100 + Math.sin(phase) * 40 + noise;
      data.push(yv);
      data.shift();
      x = 0.245 + (Math.random() - 0.5) * 0.02;
      y = -0.012 + (Math.random() - 0.5) * 0.01;
      z = 0.981 + (Math.random() - 0.5) * 0.005;

      if (lineRef.current && areaRef.current) {
        let dLine = `M0,${data[0]}`;
        let dArea = `M0,200 L0,${data[0]}`;
        const step = width / (numPoints - 1);
        for (let i = 1; i < numPoints; i++) {
          const xx = i * step;
          dLine += ` L${xx},${data[i]}`;
          dArea += ` L${xx},${data[i]}`;
        }
        dArea += ` L${width},200 Z`;
        lineRef.current.setAttribute('d', dLine);
        areaRef.current.setAttribute('d', dArea);
      }

      const scanX = (performance.now() / 10) % width;
      if (scanRef.current) {
        scanRef.current.setAttribute('x1', String(scanX));
        scanRef.current.setAttribute('x2', String(scanX));
      }
      if (scanHeadRef.current) {
        const idx = Math.max(0, Math.min(numPoints - 1, Math.floor((scanX / width) * numPoints)));
        const scanY = data[idx] || 100;
        scanHeadRef.current.setAttribute('x', String(scanX - 2));
        scanHeadRef.current.setAttribute('y', String(scanY - 2));
      }

      if (valXRef.current) valXRef.current.textContent = `${x >= 0 ? '+' : ''}${x.toFixed(3)} g`;
      if (valYRef.current) valYRef.current.textContent = `${y >= 0 ? '+' : ''}${y.toFixed(3)} g`;
      if (valZRef.current) valZRef.current.textContent = `${z >= 0 ? '+' : ''}${z.toFixed(3)} g`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Speed (km/h) and avg
  const speed = navigationMetrics.currentSpeedKmh;
  const speedStr = speed.toFixed(1);
  const tripStr = `${(navigationMetrics.totalDistanceMeters / 1000).toFixed(1)} km`;
  const avgStr = `${(speed * 0.85).toFixed(1)} km/h`;

  // Lat / Lng
  const lat = `${Math.floor(Math.abs(34.0522))}°${"39'"}10.8"N`;
  const lng = `${Math.floor(Math.abs(139))}°${"43'"}53.6"E`;
  const altitude = '1,402 m';
  const accuracy = `± 0.05 m`;

  // Heading dial
  const [headingTick, setHeadingTick] = useState(0);
  useEffect(() => {
    let base = 45;
    const t = setInterval(() => {
      base += (Math.random() - 0.5) * 4;
      if (base < 0) base += 360;
      if (base >= 360) base -= 360;
      setHeadingTick(Math.round(base));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        padding: 24,
        gap: 24,
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        minHeight: '100%',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
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
            TELEMETRY ANALYSIS
          </h1>
          <p
            className="uppercase"
            style={{
              margin: '8px 0 0 0',
              fontSize: 11,
              letterSpacing: '0.10em',
              fontFamily: "'Google Sans Mono',monospace",
              color: 'var(--color-text-tertiary)',
            }}
          >
            Active Data Stream • Real-time IMU Processing
          </p>
        </div>
        <div className="flex" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={() => setExportLog(true)}
            className="flex items-center"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              gap: 8,
            }}
          >
            <Icon name="file_download" size={18} />
            Export Log
          </button>
          <button
            type="button"
            onClick={() => {
              setRecalibrate(true);
              setTimeout(() => setRecalibrate(false), 2000);
            }}
            className="flex items-center"
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              gap: 8,
              boxShadow: '0 4px 20px rgba(195,243,139,0.30)',
            }}
          >
            <Icon name="satellite_alt" size={18} filled />
            {recalibrate ? 'Recalibrating…' : 'Force Recalibrate'}
          </button>
        </div>
      </div>

      {/* Main grid: 12 col */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 12,
          marginTop: 12,
        }}
      >
        {/* IMU chart (col-span-8) */}
        <div
          className="relative overflow-hidden"
          style={{
            gridColumn: 'span 8',
            minHeight: 400,
            padding: 20,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className="flex items-start justify-between"
            style={{ marginBottom: 16 }}
          >
            <div className="flex items-center" style={{ gap: 12 }}>
              <Icon name="ssid_chart" size={24} style={{ color: 'var(--color-accent-text)' }} />
              <div>
                <h2
                  className="uppercase"
                  style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Inertial Measurement Unit (IMU)
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontFamily: "'Google Sans Mono',monospace",
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Acc/Gyro/Mag Fusion • 100Hz
                </p>
              </div>
            </div>
            <div
              className="flex"
              style={{
                padding: 4,
                borderRadius: 9999,
                background: 'var(--color-bg-inset)',
                border: '1px solid var(--color-border)',
              }}
            >
              <PillToggle label="RAW" active />
              <PillToggle label="KALMAN" />
              <PillToggle label="FFT" />
            </div>
          </div>

          {/* Graph */}
          <div
            className="relative flex-1 flex items-center justify-center"
            style={{ minHeight: 250 }}
          >
            <svg
              viewBox="0 0 1000 200"
              preserveAspectRatio="none"
              width="100%"
              height="100%"
            >
              <defs>
                <linearGradient id="imuFade" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#c3f38b" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#c3f38b" stopOpacity="0" />
                </linearGradient>
                <filter id="imuGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Grid */}
              <g stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1">
                <line x1="0" x2="1000" y1="50" y2="50" />
                <line x1="0" x2="1000" y1="100" y2="100" />
                <line x1="0" x2="1000" y1="150" y2="150" />
              </g>
              {/* Axis labels */}
              <g
                style={{
                  fontFamily: "'Google Sans Mono',monospace",
                  fontSize: 10,
                  fill: 'var(--color-text-tertiary)',
                }}
              >
                <text x="10" y="45">1.5g</text>
                <text x="10" y="95">0.0g</text>
                <text x="10" y="145">-1.5g</text>
              </g>
              <path
                ref={areaRef}
                d="M0,200 L0,100"
                fill="url(#imuFade)"
              />
              <path
                ref={lineRef}
                d="M0,100 L0,100"
                fill="none"
                stroke="#c3f38b"
                strokeWidth="1.5"
                filter="url(#imuGlow)"
              />
              <line
                ref={scanRef}
                x1="500"
                x2="500"
                y1="0"
                y2="200"
                stroke="#0164b4"
                strokeOpacity="0.7"
                strokeWidth="1"
              />
              <rect ref={scanHeadRef} x="498" y="98" width="4" height="4" fill="#a4c9ff" />
            </svg>
          </div>

          {/* Footer */}
          <div
            className="flex justify-between items-end"
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div className="flex" style={{ gap: 24 }}>
              <AxisReadout label="X-AXIS (PITCH)" tone="accent" valueRef={valXRef} initial="+0.245 g" />
              <AxisReadout label="Y-AXIS (ROLL)" tone="secondary" valueRef={valYRef} initial="-0.012 g" />
              <AxisReadout label="Z-AXIS (YAW)" tone="default" valueRef={valZRef} initial="+0.981 g" />
            </div>
            <span
              style={{
                fontSize: 12,
                fontFamily: "'Google Sans Mono',monospace",
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.06em',
              }}
            >
              SYNC: ACTIVE
            </span>
          </div>
        </div>

        {/* Right column: Velocity Vector + Spatial Fix (col-span-4) */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 4', gap: 12 }}
        >
          {/* Velocity Vector */}
          <div
            className="relative overflow-hidden"
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 195,
            }}
          >
            <div
              aria-hidden
              className="absolute"
              style={{
                top: -48,
                right: -48,
                width: 160,
                height: 160,
                background: '#0164b4',
                opacity: 0.20,
                borderRadius: '50%',
                filter: 'blur(48px)',
              }}
            />
            <div className="flex justify-between items-start relative">
              <h3
                className="flex items-center gap-2 uppercase"
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                <Icon name="speed" size={16} style={{ color: '#a4c9ff' }} />
                Velocity Vector
              </h3>
              <span
                className="rounded-full animate-pulse"
                style={{ width: 8, height: 8, background: '#a4c9ff' }}
              />
            </div>
            <div className="flex flex-col relative" style={{ marginTop: 24 }}>
              <div className="flex items-baseline" style={{ gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 48,
                    lineHeight: 1,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {speedStr}
                </span>
                <span
                  className="uppercase"
                  style={{
                    fontSize: 14,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  km/h
                </span>
              </div>
              <div
                className="w-full overflow-hidden"
                style={{
                  height: 4,
                  borderRadius: 9999,
                  background: 'var(--color-bg-inset)',
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    width: '65%',
                    height: '100%',
                    borderRadius: 9999,
                    background: '#a4c9ff',
                  }}
                />
              </div>
            </div>
            <div
              className="flex justify-between relative"
              style={{ marginTop: 24 }}
            >
              <div className="flex flex-col" style={{ gap: 4 }}>
                <span
                  className="uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
                >
                  Trip Distance
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-primary)',
                    fontFamily: "'Google Sans Mono',monospace",
                  }}
                >
                  {tripStr}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: 4, textAlign: 'right' }}>
                <span
                  className="uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
                >
                  Avg Speed
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-primary)',
                    fontFamily: "'Google Sans Mono',monospace",
                  }}
                >
                  {avgStr}
                </span>
              </div>
            </div>
          </div>

          {/* Spatial Fix */}
          <div
            className="relative overflow-hidden"
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minHeight: 195,
            }}
          >
            <div
              aria-hidden
              className="absolute"
              style={{
                bottom: -32,
                left: -32,
                width: 128,
                height: 128,
                background: 'var(--color-accent)',
                opacity: 0.10,
                borderRadius: '50%',
                filter: 'blur(32px)',
              }}
            />
            <div className="flex justify-between items-start relative">
              <h3
                className="flex items-center gap-2 uppercase"
                style={{
                  margin: 0,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                <Icon name="my_location" size={16} style={{ color: 'var(--color-accent-text)' }} />
                Spatial Fix
              </h3>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(195,243,139,0.10)',
                  border: '1px solid rgba(195,243,139,0.30)',
                  color: 'var(--color-accent-text)',
                  fontSize: 10,
                  fontFamily: "'Google Sans Mono',monospace",
                  fontWeight: 600,
                }}
              >
                RTK FIX
              </span>
            </div>
            <div className="flex flex-col relative" style={{ gap: 12 }}>
              <SpatialRow label="Latitude" value={lat} copyable />
              <SpatialRow label="Longitude" value={lng} copyable />
            </div>
            <div
              className="flex justify-between relative"
              style={{
                marginTop: 'auto',
                paddingTop: 12,
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div className="flex flex-col" style={{ gap: 4 }}>
                <span
                  className="uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
                >
                  Altitude
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "'Google Sans Mono',monospace",
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {altitude}
                </span>
              </div>
              <div className="flex flex-col" style={{ gap: 4, textAlign: 'right' }}>
                <span
                  className="uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
                >
                  Accuracy
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "'Google Sans Mono',monospace",
                    color: 'var(--color-accent-text)',
                    fontWeight: 500,
                  }}
                >
                  {accuracy}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        {/* Heading dial (col-span-4) */}
        <div
          className="flex flex-col"
          style={{
            gridColumn: 'span 4',
            minHeight: 220,
            padding: 20,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            justifyContent: 'space-between',
          }}
        >
          <div className="flex justify-between items-start">
            <h3
              className="flex items-center gap-2 uppercase"
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              <Icon name="explore" size={16} style={{ color: '#a4c9ff' }} />
              Heading
            </h3>
          </div>
          <div
            className="flex-1 flex items-center justify-center relative"
            style={{ padding: '16px 0' }}
          >
            <svg viewBox="0 0 160 160" width={180} height={180}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-border)" strokeWidth="2" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#0164b4"
                strokeOpacity="0.5"
                strokeDasharray="2 10"
                strokeWidth="2"
              />
              <g
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 12,
                  fill: 'var(--color-text-tertiary)',
                }}
                textAnchor="middle"
                dominantBaseline="central"
              >
                <text x="80" y="20" style={{ fill: 'var(--color-accent-text)', fontWeight: 700 }}>N</text>
                <text x="140" y="80">E</text>
                <text x="80" y="140">S</text>
                <text x="20" y="80">W</text>
              </g>
              <g
                style={{
                  transformOrigin: '80px 80px',
                  transform: `rotate(${headingTick}deg)`,
                  transition: 'transform 1s ease-out',
                }}
              >
                <polygon points="75,80 85,80 80,30" fill="#c3f38b" />
                <polygon points="75,80 85,80 80,130" fill="var(--color-border)" />
                <circle cx="80" cy="80" r="6" fill="var(--color-bg-elevated)" stroke="#c3f38b" strokeWidth="2" />
              </g>
            </svg>
            <div
              className="absolute flex flex-col items-center pointer-events-none"
              style={{ marginTop: 100 }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                  padding: '0 8px',
                  borderRadius: 6,
                  fontWeight: 700,
                }}
              >
                {String(headingTick).padStart(3, '0')}°
              </span>
            </div>
          </div>
        </div>

        {/* System Health (col-span-4) */}
        <div
          className="flex flex-col"
          style={{
            gridColumn: 'span 4',
            minHeight: 220,
            padding: 20,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            gap: 16,
          }}
        >
          <h3
            className="flex items-center gap-2 uppercase"
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: '0.10em',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            <Icon name="memory" size={16} style={{ color: 'var(--color-text-tertiary)' }} />
            System Health
          </h3>
          <div className="flex flex-col" style={{ gap: 12 }}>
            <SystemBar label="CPU Load" value="42%" pct={42} tone="accent" />
            <SystemBar label="MEM Usage" value="6.8 / 16 GB" pct={45} tone="secondary" />
            <SystemBar label="Core Temp" value="54°C" pct={54} tone="accent" />
          </div>
        </div>

        {/* Constellation (col-span-4) */}
        <div
          className="flex flex-col"
          style={{
            gridColumn: 'span 4',
            minHeight: 220,
            padding: 20,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
            <h3
              className="flex items-center gap-2 uppercase"
              style={{
                margin: 0,
                fontSize: 11,
                letterSpacing: '0.10em',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              <Icon name="satellite" size={16} style={{ color: 'var(--color-accent-text)' }} />
              Constellation
            </h3>
            <span
              style={{
                fontFamily: "'Google Sans Mono',monospace",
                fontSize: 12,
                color: 'var(--color-accent-text)',
                fontWeight: 500,
              }}
            >
              12 SVs
            </span>
          </div>
          <div
            className="flex-1 flex flex-col"
            style={{ gap: 8, overflow: 'auto', position: 'relative', zIndex: 1 }}
          >
            <SatelliteRow prn="G12" name="GPS L1/L5" snr="SNR: 48 dBHz" tone="accent" />
            <SatelliteRow prn="E24" name="GAL E1/E5" snr="SNR: 45 dBHz" tone="secondary" />
            <SatelliteRow prn="R08" name="GLO L1" snr="SNR: 22 dBHz" tone="error" warn />
            <SatelliteRow prn="G04" name="GPS L1/L5" snr="SNR: 42 dBHz" tone="accent" />
            <SatelliteRow prn="G17" name="GPS L1/L5" snr="SNR: 39 dBHz" tone="accent" />
          </div>
          {/* Bottom fade */}
          <div
            aria-hidden
            className="absolute left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: 32,
              background: 'linear-gradient(to top, var(--color-bg-elevated), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PillToggle: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <button
    type="button"
    style={{
      padding: '4px 12px',
      borderRadius: 9999,
      border: 'none',
      background: active ? 'var(--color-border)' : 'transparent',
      color: 'var(--color-text-primary)',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.20)' : 'none',
    }}
  >
    {label}
  </button>
);

const AxisReadout: React.FC<{
  label: string;
  tone: 'accent' | 'secondary' | 'default';
  valueRef: React.RefObject<HTMLSpanElement | null>;
  initial: string;
}> = ({ label, tone, valueRef, initial }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-text-primary)';
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <span
        className="uppercase"
        style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
      >
        {label}
      </span>
      <span
        ref={valueRef}
        style={{ fontSize: 14, color, fontFamily: "'Google Sans Mono',monospace", fontWeight: 500 }}
      >
        {initial}
      </span>
    </div>
  );
};

const SpatialRow: React.FC<{ label: string; value: string; copyable?: boolean }> = ({ label, value, copyable }) => (
  <div className="flex flex-col" style={{ gap: 4 }}>
    <span
      className="uppercase"
      style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
    >
      {label}
    </span>
    <div className="flex items-center justify-between">
      <span
        style={{
          fontFamily: "'Google Sans Flex','Inter',sans-serif",
          fontSize: 22,
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
          fontWeight: 500,
        }}
      >
        {value}
      </span>
      {copyable && (
        <Icon
          name="content_copy"
          size={16}
          style={{ color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
        />
      )}
    </div>
  </div>
);

const SystemBar: React.FC<{ label: string; value: string; pct: number; tone: 'accent' | 'secondary' }> = ({
  label,
  value,
  pct,
  tone,
}) => {
  const color = tone === 'accent' ? 'var(--color-accent)' : '#a4c9ff';
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <div className="flex justify-between">
        <span
          className="uppercase"
          style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
        >
          {label}
        </span>
        <span
          style={{ fontSize: 12, color: 'var(--color-text-primary)', fontFamily: "'Google Sans Mono',monospace" }}
        >
          {value}
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{ height: 6, borderRadius: 9999, background: 'var(--color-bg-inset)' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 9999,
            background: color,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};

const SatelliteRow: React.FC<{
  prn: string;
  name: string;
  snr: string;
  tone: 'accent' | 'secondary' | 'error';
  warn?: boolean;
}> = ({ prn, name, snr, tone, warn }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent-text)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-error-text)';
  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: 8,
        borderRadius: 8,
        background: 'var(--color-bg-inset)',
        border: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="flex items-center" style={{ gap: 12 }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: tone === 'error' ? 'rgba(255,180,171,0.10)' : `${color}1A`,
            border: `1px solid ${tone === 'error' ? 'rgba(255,180,171,0.30)' : `${color}4D`}`,
          }}
        >
          <span
            style={{
              fontFamily: "'Google Sans Mono',monospace",
              fontSize: 10,
              color,
              fontWeight: 700,
            }}
          >
            {prn}
          </span>
        </div>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            className="uppercase"
            style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Google Sans Mono',monospace",
              color: 'var(--color-text-tertiary)',
            }}
          >
            {snr}
          </span>
        </div>
      </div>
      <Icon
        name={warn ? 'error' : 'check_circle'}
        size={16}
        style={{ color: warn ? 'var(--color-text-tertiary)' : 'var(--color-accent-text)' }}
      />
    </div>
  );
};
