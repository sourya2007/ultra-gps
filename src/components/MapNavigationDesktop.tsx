import React, { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { MapView } from './MapView';
import type {
  Coordinates,
  HeadingData,
  MapLayerType,
  PathPoint,
  SensorStatus,
  TrackingMode,
} from '../types';

interface MapNavigationDesktopProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  hasReceivedFix: boolean;
  setManualLocation: (lat: number, lng: number) => void;
  acquireCurrentLocation: () => void;
  headingData: HeadingData;
  sensorStatus: SensorStatus;
  gpsEnabled: boolean;
  toggleGps: () => void;
  requestSensorPermissions: () => void;
  activeLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function cardinalFromHeading(h: number): string {
  const norm = ((h % 360) + 360) % 360;
  const labels = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(norm / 45) % 8;
  return labels[idx];
}

export const MapNavigationDesktop: React.FC<MapNavigationDesktopProps> = (props) => {
  const {
    location,
    heading,
    mode,
    path,
    hasReceivedFix,
    setManualLocation,
    acquireCurrentLocation,
    headingData,
    sensorStatus,
    gpsEnabled,
    toggleGps,
    requestSensorPermissions,
    activeLayer,
    onChangeLayer,
  } = props;

  // Track whether the user has selected an active route. When false, the
  // overview card shows the current location + ETA only (no REM).
  const [activeRouteName, setActiveRouteName] = useState<string>('');

  const isRouteActive = activeRouteName.trim().length > 0;

  // Synthetic flight metrics (mocked for the demo)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const distNm = 24.8;
  const speedKt = (182 + (Math.sin(tick / 4) * 2)).toFixed(1);
  const headingDialDeg = Math.round(headingData.heading) % 360;
  const latStr = Math.abs(location.latitude).toFixed(4);
  const latHemi = location.latitude >= 0 ? 'N' : 'S';
  const lngStr = Math.abs(location.longitude).toFixed(4);
  const lngHemi = location.longitude >= 0 ? 'E' : 'W';
  const altitudeFt = location.altitude ? Math.round(location.altitude * 3.281).toLocaleString() : '4,280';
  const eta = formatCountdown(60 * 60 * 14 + 60 * 22);

  // Animated data ticker
  const tickerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!tickerRef.current) return;
    const inner = tickerRef.current;
    if (inner.dataset.cloned !== '1') {
      inner.innerHTML = inner.innerHTML + inner.innerHTML;
      inner.dataset.cloned = '1';
    }
  }, []);

  return (
    <div
      className="relative w-full h-full"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed Leaflet map background — fills the entire viewport
          behind the floating left/right widgets. */}
      <div
        className="absolute inset-0 z-0"
        style={{ minHeight: 0 }}
      >
        <MapView
          location={location}
          heading={heading}
          mode={mode}
          path={path}
          hasReceivedFix={hasReceivedFix}
          onSetLocation={setManualLocation}
          onLocateNow={acquireCurrentLocation}
          isSidebarOpen={false}
          activeLayer={activeLayer}
          onChangeLayer={onChangeLayer}
        />
      </div>
      {/* Reticle overlay sits on top of the map */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 64,
          height: 64,
          opacity: 0.5,
          zIndex: 5,
        }}
      >
        <div style={{ position: 'absolute', left: 0, top: '50%', width: 16, height: 1, background: 'rgba(195,243,139,0.7)' }} />
        <div style={{ position: 'absolute', right: 0, top: '50%', width: 16, height: 1, background: 'rgba(195,243,139,0.7)' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: 16, background: 'rgba(195,243,139,0.7)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', width: 1, height: 16, background: 'rgba(195,243,139,0.7)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 9999, border: '1px solid rgba(195,243,139,0.30)' }} />
        <div style={{ position: 'absolute', inset: 4, borderRadius: 9999, border: '1px dashed rgba(195,243,139,0.10)' }} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: 4,
            borderRadius: 9999,
            background: 'var(--color-accent)',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 8px var(--color-accent)',
          }}
        />
      </div>

      {/* Map layer select (top-right of map) */}
      {onChangeLayer && (
        <div
          className="absolute"
          style={{
            top: 24,
            right: 24,
            zIndex: 10,
            display: 'flex',
            gap: 6,
            padding: 4,
            borderRadius: 12,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.30)',
            pointerEvents: 'auto',
          }}
        >
          {([
            { key: 'street', label: 'Street', icon: 'map' },
            { key: 'satellite', label: 'Satellite', icon: 'satellite' },
            { key: 'dark', label: 'Dark', icon: 'dark_mode' },
          ] as const).map(({ key, label, icon }) => {
            const isActive = activeLayer === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChangeLayer(key)}
                className="flex items-center"
                style={{
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: isActive ? 'var(--color-accent-soft)' : 'transparent',
                  color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                  border: isActive
                    ? '1px solid var(--color-accent)'
                    : '1px solid transparent',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
                title={`${label} Layer`}
              >
                <Icon name={icon} size={14} filled={isActive} />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating widgets layer — left/center/right panels sit on top of the map. */}
      <div
        className="relative z-10 flex w-full h-full pointer-events-none"
        style={{ padding: 24, gap: 12 }}
      >
        {/* LEFT: Telemetry & Navigation Stack */}
        <div
          className="flex flex-col"
          style={{ width: 380, gap: 12, height: '100%', pointerEvents: 'auto' }}
        >
          {/* Route Overview Card */}
          <div
            className="flex flex-col relative overflow-hidden"
            style={{
              padding: 24,
              gap: 16,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.20)',
            }}
          >
            {/* Decorative corner glow */}
            <div
              aria-hidden
              className="absolute"
              style={{
                top: -48,
                right: -48,
                width: 128,
                height: 128,
                background: 'var(--color-accent)',
                opacity: 0.10,
                borderRadius: '50%',
                filter: 'blur(32px)',
              }}
            />
            <div className="flex items-center justify-between">
              <span
                className="flex items-center gap-2 uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <Icon
                  name={isRouteActive ? 'explore' : 'my_location'}
                  size={16}
                  style={{ color: 'var(--color-accent-text)' }}
                />
                {isRouteActive ? 'Active Route' : 'Current Position'}
              </span>
              {isRouteActive && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(195,243,139,0.18)',
                    color: 'var(--color-accent-text)',
                    fontSize: 10,
                    fontFamily: "'Google Sans Mono',monospace",
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  Lock: Sat-12
                </span>
              )}
            </div>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 28,
                  lineHeight: '34px',
                  letterSpacing: '-0.02em',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                {isRouteActive ? activeRouteName : 'Current Location'}
              </h2>
              <p
                className="flex items-center gap-2"
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <Icon
                  name={isRouteActive ? 'distance' : 'satellite_alt'}
                  size={14}
                />
                {isRouteActive
                  ? `${distNm} NM to target`
                  : `${latStr}° ${latHemi}, ${lngStr}° ${lngHemi}`}
              </p>
            </div>
            <div className="flex" style={{ gap: 16, marginTop: 8 }}>
              <div
                className="flex-1 flex flex-col"
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--color-bg-inset)',
                }}
              >
                <span
                  className="uppercase"
                  style={{ fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.10em', fontWeight: 700 }}
                >
                  {isRouteActive ? 'ETA' : 'Local Time'}
                </span>
                <span
                  style={{
                    fontFamily: "'Google Sans Mono',monospace",
                    fontSize: 22,
                    lineHeight: '28px',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {isRouteActive ? eta : '14:22:00'}
                </span>
              </div>
              {isRouteActive && (
                <div
                  className="flex-1 flex flex-col"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--color-bg-inset)',
                  }}
                >
                  <span
                    className="uppercase"
                    style={{ fontSize: 9, color: 'var(--color-text-tertiary)', letterSpacing: '0.10em', fontWeight: 700 }}
                  >
                    Distance
                  </span>
                  <span
                    style={{
                      fontFamily: "'Google Sans Mono',monospace",
                      fontSize: 22,
                      lineHeight: '28px',
                      fontWeight: 500,
                      color: 'var(--color-accent-text)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {distNm} NM
                  </span>
                </div>
              )}
            </div>
            {!isRouteActive && (
              <div
                className="flex"
                style={{ gap: 8, marginTop: 4 }}
              >
                <input
                  type="text"
                  placeholder="Enter destination to start a route..."
                  value={activeRouteName}
                  onChange={(e) => setActiveRouteName(e.target.value)}
                  className="flex-1"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--color-bg-inset)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    fontFamily: "'Google Sans Mono',monospace",
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (activeRouteName.trim().length > 0) {
                      // User already typed a name → no-op (typing is the action)
                    } else {
                      setActiveRouteName('Echo Base Delta');
                    }
                  }}
                  className="flex items-center"
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: 'var(--color-accent)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    gap: 6,
                  }}
                >
                  <Icon name="navigation" size={16} filled />
                  Start
                </button>
              </div>
            )}
            {isRouteActive && (
              <button
                type="button"
                onClick={() => setActiveRouteName('')}
                className="flex items-center justify-center"
                style={{
                  padding: '8px 0',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  gap: 6,
                }}
              >
                <Icon name="close" size={14} />
                End Route
              </button>
            )}
          </div>

          {/* Speed + Heading Bento */}
          <div
            className="grid"
            style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            {/* Speed */}
            <div
              className="flex flex-col justify-between relative"
              style={{
                padding: 20,
                aspectRatio: '1 / 1',
                borderRadius: 16,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.20)',
              }}
            >
              <span
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
              >
                GS (KTS)
              </span>
              <div className="flex items-baseline" style={{ gap: 4, marginTop: 'auto' }}>
                <span
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 42,
                    lineHeight: 1,
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.04em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.floor(parseFloat(speedKt))}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: "'Google Sans Mono',monospace",
                    color: 'var(--color-accent-text)',
                    fontWeight: 500,
                  }}
                >
                  .{speedKt.split('.')[1]}
                </span>
              </div>
              <div style={{ width: '100%', height: 32, marginTop: 8, opacity: 0.65 }}>
                <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="speedGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#c3f38b" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,25 L10,22 L20,26 L30,20 L40,24 L50,15 L60,18 L70,10 L80,14 L90,5 L100,8"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                  />
                  <path
                    d="M0,25 L10,22 L20,26 L30,20 L40,24 L50,15 L60,18 L70,10 L80,14 L90,5 L100,8 L100,30 L0,30 Z"
                    fill="url(#speedGrad)"
                    opacity="0.20"
                  />
                </svg>
              </div>
            </div>

            {/* Heading dial */}
            <div
              className="flex flex-col justify-between relative"
              style={{
                padding: 20,
                aspectRatio: '1 / 1',
                borderRadius: 16,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 8px 28px rgba(0,0,0,0.20)',
              }}
            >
              <span
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
              >
                HDG (MAG)
              </span>
              <div
                className="relative flex items-center justify-center"
                style={{ width: '100%', aspectRatio: '1 / 1' }}
              >
                <svg
                  viewBox="0 0 100 100"
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                >
                  {/* Background ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="3"
                  />
                  {/* Green fill arc — fills clockwise from North (top, 0°)
                      based on the current heading. circumference = 2*pi*45 = 282.74. */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(headingDialDeg / 360) * 282.74} 282.74`}
                    transform="rotate(-90 50 50)"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(195,243,139,0.7))',
                      transition: 'stroke-dasharray 0.5s ease-out',
                    }}
                  />
                  {/* Cardinal tick marks */}
                  <line x1="50" y1="5" x2="50" y2="14" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <line x1="50" y1="86" x2="50" y2="95" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <line x1="5" y1="50" x2="14" y2="50" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  <line x1="86" y1="50" x2="95" y2="50" stroke="var(--color-text-tertiary)" strokeWidth="2" />
                  {/* North marker (slightly thicker red tick) */}
                  <line
                    x1="50"
                    y1="5"
                    x2="50"
                    y2="18"
                    stroke="var(--color-error)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <text
                    x="50"
                    y="3"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="700"
                    fill="var(--color-error)"
                    fontFamily="'Google Sans Mono',monospace"
                  >
                    N
                  </text>
                </svg>
                {/* Center readout — accurate degree synced to on-device compass */}
                <div
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    inset: 24,
                    borderRadius: 9999,
                    background: 'var(--color-bg-inset)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Google Sans Flex','Inter',sans-serif",
                      fontSize: 26,
                      lineHeight: 1,
                      fontWeight: 700,
                      color: 'var(--color-text-primary)',
                      letterSpacing: '-0.02em',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {String(headingDialDeg).padStart(3, '0')}
                  </span>
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 9,
                      fontFamily: "'Google Sans Mono',monospace",
                      color: 'var(--color-accent-text)',
                      letterSpacing: '0.10em',
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    DEG · {cardinalFromHeading(headingDialDeg)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Action Buttons */}
          <div className="flex" style={{ gap: 12 }}>
            <button
              type="button"
              onClick={toggleGps}
              className="flex-1 flex items-center justify-center"
              style={{
                height: 56,
                gap: 8,
                borderRadius: 12,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
              title={sensorStatus.gpsStatusText}
            >
              <Icon
                name={gpsEnabled ? 'cell_tower' : 'cell_off'}
                size={20}
                style={{ color: gpsEnabled ? 'var(--color-accent-text)' : 'var(--color-text-primary)' }}
              />
              {gpsEnabled ? 'GPS: ON' : 'GPS: OFF'}
            </button>
            <button
              type="button"
              onClick={requestSensorPermissions}
              className="flex-1 flex items-center justify-center"
              style={{
                height: 56,
                gap: 8,
                borderRadius: 12,
                background: 'var(--color-accent)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(195,243,139,0.30)',
              }}
            >
              <Icon
                name="add_location"
                size={20}
                filled
                style={{ color: 'var(--color-text-inverse)' }}
              />
              Set Waypoint
            </button>
          </div>
        </div>

        {/* CENTER: empty spacer — map is now full-bleed behind everything */}
        <div className="flex-1" style={{ pointerEvents: 'none' }} />

        {/* RIGHT: Live Telemetry coordinates panel */}
        <div
          className="flex flex-col justify-end"
          style={{ width: 320, gap: 12, pointerEvents: 'auto' }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              padding: 24,
              gap: 16,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.30)',
            }}
          >
            {/* Scanline overlay */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(transparent,transparent 2px,rgba(255,255,255,0.03) 2px,rgba(255,255,255,0.03) 4px)',
              }}
            />
            <div
              className="relative flex items-center justify-between"
              style={{ marginBottom: 12 }}
            >
              <span
                className="flex items-center gap-2 uppercase"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <span
                  className="rounded-full animate-pulse"
                  style={{ width: 8, height: 8, background: 'var(--color-error)' }}
                />
                LIVE TELEMETRY
              </span>
              <Icon name="satellite_alt" size={18} style={{ color: 'var(--color-text-tertiary)' }} />
            </div>
            <div className="relative flex flex-col" style={{ gap: 12 }}>
              <CoordRow label="Latitude" value={latStr} suffix={latHemi} tone="accent" />
              <CoordRow label="Longitude" value={lngStr} suffix={lngHemi} tone="accent" />
              <CoordRow label="Altitude (MSL)" value={`+ ${altitudeFt}`} suffix="FT" tone="default" />
            </div>
            <div
              className="relative overflow-hidden"
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border-subtle)',
                height: 24,
              }}
            >
              <div
                ref={tickerRef}
                className="whitespace-nowrap"
                style={{
                  fontFamily: "'Google Sans Mono',monospace",
                  fontSize: 10,
                  color: 'var(--color-text-tertiary)',
                  animation: 'tickerScroll 10s linear infinite',
                  display: 'flex',
                  gap: 16,
                }}
              >
                <span>DAT: OK</span>
                <span>|</span>
                <span>SYNC: 12ms</span>
                <span>|</span>
                <span>SIG: STR</span>
                <span>|</span>
                <span>ERR: 0.002</span>
                <span>|</span>
                <span>DAT: OK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const CoordRow: React.FC<{ label: string; value: string; suffix: string; tone: 'accent' | 'default' }> = ({
  label,
  value,
  suffix,
  tone,
}) => (
  <div className="flex flex-col" style={{ gap: 4 }}>
    <span
      className="uppercase"
      style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.10em', fontWeight: 700 }}
    >
      {label}
    </span>
    <div
      className="flex items-baseline justify-between"
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        background: 'var(--color-bg-inset)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span
        style={{
          fontFamily: "'Google Sans Mono',monospace",
          fontSize: 22,
          lineHeight: '28px',
          fontWeight: 500,
          color: tone === 'accent' ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 12,
          fontFamily: "'Google Sans Mono',monospace",
          color: 'var(--color-text-tertiary)',
        }}
      >
        {suffix}
      </span>
    </div>
  </div>
);
