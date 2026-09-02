import React, { useState } from 'react';
import { Icon } from './Icon';
import { MapView } from './MapView';
import type {
  Coordinates,
  MapLayerType,
  PathPoint,
  TrackingMode,
} from '../types';

interface RoutePlanningDesktopProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  hasReceivedFix: boolean;
  setManualLocation: (lat: number, lng: number) => void;
  acquireCurrentLocation: () => void;
  activeLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
}

type TransportMode = 'car' | 'walk' | 'bike' | 'transit';

const MODES: { key: TransportMode; label: string; icon: string; duration: string }[] = [
  { key: 'car', label: 'Drive', icon: 'directions_car', duration: '02:45' },
  { key: 'walk', label: 'Walk', icon: 'directions_walk', duration: '14:00' },
  { key: 'bike', label: 'Bike', icon: 'pedal_bike', duration: '05:30' },
  { key: 'transit', label: 'Transit', icon: 'directions_transit', duration: '04:15' },
];

const MAP_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBDBscuEB0_XWwo8xhiJ4h1xTfIQHRdQUPnp7RxNG3QwZcm6hCOlRI6AWL79itZUuv2ZF0KKeWNf5hKsyMXKwiTwEm6c-FqpKTw4JgdXXj1D5E8xEsVEFBoEWJf1zgOeyr_qpF27xlBUOI7lWXpCNUUx1e4eITo8GHjR0S1DJKaUBH6pLh9cQx57u1api-VW9OmCul5kLzFmAjPPVILac54FO0sKgwYCCBtrVYjZYLKxcqTVjJrm9Xe';

export const RoutePlanningDesktop: React.FC<RoutePlanningDesktopProps> = (props) => {
  const { location, heading, mode, path, hasReceivedFix, setManualLocation, acquireCurrentLocation, activeLayer, onChangeLayer } = props;
  const [from, setFrom] = useState('Current Location');
  const [to, setTo] = useState('47.6205° N, 122.3493° W');
  const [modeSel, setModeSel] = useState<TransportMode>('car');
  const [waypoints, setWaypoints] = useState<string[]>([]);

  return (
    <div
      className="w-full h-full flex"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', fontFamily: "'Google Sans Flex','Inter',sans-serif" }}
    >
      {/* LEFT: Sidebar controls */}
      <div
        className="flex flex-col"
        style={{
          width: 400,
          flexShrink: 0,
          height: '100%',
          background: 'var(--color-bg-elevated)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.20)',
          padding: 24,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ marginTop: 8, marginBottom: 32 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            Plan Route
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: 14,
              color: 'var(--color-text-tertiary)',
            }}
          >
            Configure waypoints and navigation parameters.
          </p>
        </div>

        {/* Route inputs */}
        <div className="flex flex-col relative" style={{ gap: 16, marginBottom: 32 }}>
          {/* Vertical timeline line */}
          <div
            aria-hidden
            className="absolute"
            style={{
              left: 16,
              top: 32,
              bottom: 32,
              width: 2,
              background: 'var(--color-border)',
              zIndex: 0,
            }}
          />

          {/* Origin */}
          <div className="flex items-start" style={{ gap: 16 }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: 'var(--color-bg-inset)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.20)',
                marginTop: 8,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <span
                className="rounded-full animate-pulse"
                style={{ width: 12, height: 12, background: 'var(--color-accent)' }}
              />
            </div>
            <div
              className="flex-1 relative group"
              style={{
                background: 'var(--color-bg-inset)',
                borderRadius: 10,
                padding: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                borderBottom: '2px solid var(--color-border)',
              }}
            >
              <label
                className="block uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                }}
              >
                Origin
              </label>
              <input
                value={from}
                readOnly
                type="text"
                className="w-full"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              />
            </div>
          </div>

          {/* Waypoints */}
          {waypoints.map((wp, i) => (
            <div key={i} className="flex items-center" style={{ gap: 16, paddingLeft: 48 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: 'var(--color-text-tertiary)',
                }}
              />
              <div
                className="flex-1"
                style={{
                  background: 'var(--color-bg-inset)',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  color: 'var(--color-text-primary)',
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              >
                {wp}
              </div>
            </div>
          ))}

          {/* Add waypoint */}
          <button
            type="button"
            onClick={() => setWaypoints((w) => [...w, `Waypoint ${w.length + 1}`])}
            className="flex items-center"
            style={{
              gap: 16,
              paddingLeft: 48,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <Icon name="add" size={18} />
            </div>
            <span
              className="uppercase"
              style={{
                fontSize: 11,
                letterSpacing: '0.10em',
                fontWeight: 700,
              }}
            >
              Add Waypoint
            </span>
          </button>

          {/* Destination */}
          <div className="flex items-start" style={{ gap: 16 }}>
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: 'rgba(255,180,171,0.15)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.20)',
                marginTop: 8,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Icon
                name="location_on"
                size={16}
                filled
                style={{ color: 'var(--color-error-text)' }}
              />
            </div>
            <div
              className="flex-1 relative"
              style={{
                background: 'var(--color-bg-inset)',
                borderRadius: 10,
                padding: 12,
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                borderBottom: '2px solid var(--color-border)',
              }}
            >
              <label
                className="block uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 4,
                }}
              >
                Destination
              </label>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                type="text"
                className="w-full"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: 14,
                  fontFamily: "'Google Sans Mono',monospace",
                }}
              />
            </div>
          </div>
        </div>

        {/* Parameters Bento */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {/* Vehicle profile (col-span-2) */}
          <div
            className="flex flex-col justify-between col-span-2"
            style={{
              gridColumn: 'span 2',
              padding: 16,
              borderRadius: 12,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span
                className="uppercase"
                style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
              >
                Vehicle Profile
              </span>
              <Icon name="directions_car" size={18} style={{ color: 'var(--color-text-tertiary)' }} />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div
                  style={{
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Off-Road Heavy
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "'Google Sans Mono',monospace",
                    color: 'var(--color-text-tertiary)',
                    marginTop: 4,
                  }}
                >
                  GVW: 12,500 kg
                </div>
              </div>
              <Icon name="expand_more" size={20} style={{ color: 'var(--color-accent-text)' }} />
            </div>
          </div>

          {/* Terrain */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="block uppercase"
              style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 8 }}
            >
              Terrain
            </span>
            <div
              style={{
                fontFamily: "'Google Sans Flex','Inter',sans-serif",
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              Mixed
            </div>
            <div
              className="w-full overflow-hidden"
              style={{ height: 4, borderRadius: 9999, background: 'var(--color-bg-elevated)', marginTop: 12 }}
            >
              <div style={{ width: '60%', height: '100%', background: 'var(--color-accent)' }} />
            </div>
          </div>

          {/* Avoidance */}
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span
              className="block uppercase"
              style={{ fontSize: 10, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)', marginBottom: 8 }}
            >
              Avoidance
            </span>
            <div className="flex flex-wrap" style={{ gap: 6, marginTop: 4 }}>
              {['Tolls', 'Water'].map((a) => (
                <span
                  key={a}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'rgba(255,180,171,0.15)',
                    color: 'var(--color-error-text)',
                    fontSize: 11,
                    fontFamily: "'Google Sans Mono',monospace",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Summary */}
        <div
          className="relative overflow-hidden"
          style={{
            padding: 24,
            borderRadius: 16,
            background: 'var(--color-accent-soft)',
            border: '1px solid rgba(195,243,139,0.30)',
            marginTop: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div
            aria-hidden
            className="absolute"
            style={{
              top: -16,
              right: -16,
              width: 96,
              height: 96,
              background: 'var(--color-accent)',
              opacity: 0.15,
              borderRadius: '50%',
              filter: 'blur(24px)',
            }}
          />
          <div
            className="flex justify-between items-end relative"
            style={{ marginBottom: 24 }}
          >
            <div>
              <span
                className="block uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-accent-text)',
                  marginBottom: 4,
                }}
              >
                Est. Duration
              </span>
              <div
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 28,
                  lineHeight: '34px',
                  letterSpacing: '-0.02em',
                  fontWeight: 700,
                  color: 'var(--color-accent-text)',
                }}
              >
                02:45:00
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                className="block uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  fontWeight: 700,
                  color: 'var(--color-accent-text)',
                  marginBottom: 4,
                }}
              >
                Distance
              </span>
              <div
                style={{
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 22,
                  fontWeight: 500,
                  color: 'var(--color-accent-text)',
                }}
              >
                142.8 km
              </div>
            </div>
          </div>
          <button
            type="button"
            className="w-full flex items-center justify-center"
            style={{
              padding: '16px 0',
              borderRadius: 12,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontFamily: "'Google Sans Flex','Inter',sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              gap: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            <Icon name="near_me" size={20} filled />
            Start Navigation
          </button>
        </div>
      </div>

      {/* RIGHT: Map area */}
      <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${MAP_BG}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.40) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.20) 100%)',
          }}
          aria-hidden
        />

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

        {/* Floating map controls */}
        <div
          className="absolute flex flex-col"
          style={{ top: 24, right: 24, gap: 8 }}
        >
          <button
            type="button"
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
              cursor: 'pointer',
            }}
          >
            <Icon name="layers" size={20} />
          </button>
          <div
            className="flex flex-col"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
              marginTop: 16,
            }}
          >
            <button
              type="button"
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
            >
              <Icon name="add" size={20} />
            </button>
            <div style={{ height: 1, background: 'var(--color-border)' }} />
            <button
              type="button"
              className="flex items-center justify-center"
              style={{ width: 40, height: 40, background: 'transparent', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer' }}
            >
              <Icon name="remove" size={20} />
            </button>
          </div>
          <button
            type="button"
            className="flex items-center justify-center"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
              cursor: 'pointer',
              marginTop: 16,
            }}
          >
            <Icon name="my_location" size={20} style={{ color: 'var(--color-accent-text)' }} />
          </button>
        </div>

        {/* Transport mode chips floating at top */}
        <div
          className="absolute flex"
          style={{ top: 24, left: 24, gap: 8 }}
        >
          {MODES.map(({ key, icon, duration }) => {
            const active = key === modeSel;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setModeSel(key)}
                className="flex items-center"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: active ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                  color: active ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.20)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  gap: 6,
                }}
              >
                <Icon name={icon} size={16} filled={active} />
                {duration}
              </button>
            );
          })}
        </div>

        {/* Bottom: Elevation profile overlay */}
        <div
          className="absolute flex items-center"
          style={{
            left: 24,
            right: 24,
            bottom: 24,
            height: 128,
            padding: 16,
            gap: 24,
            borderRadius: 16,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.30)',
          }}
        >
          <div className="flex flex-col justify-between shrink-0" style={{ height: '100%' }}>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <span
                className="uppercase"
                style={{ fontSize: 9, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
              >
                Elevation Max
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-text-primary)',
                }}
              >
                4,392 m
              </span>
            </div>
            <div className="flex flex-col" style={{ gap: 4 }}>
              <span
                className="uppercase"
                style={{ fontSize: 9, letterSpacing: '0.10em', fontWeight: 700, color: 'var(--color-text-tertiary)' }}
              >
                Elevation Min
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Google Sans Mono',monospace",
                  color: 'var(--color-text-primary)',
                }}
              >
                12 m
              </span>
            </div>
          </div>
          <div className="flex-1 relative" style={{ height: '100%' }}>
            <svg
              className="w-full h-full"
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              style={{ color: 'var(--color-accent)', filter: 'drop-shadow(0 0 8px rgba(195,243,139,0.4))' }}
            >
              <defs>
                <linearGradient id="elevGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 35 L10 32 L20 34 L30 25 L40 28 L50 15 L60 18 L70 5 L80 12 L90 8 L100 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0 35 L10 32 L20 34 L30 25 L40 28 L50 15 L60 18 L70 5 L80 12 L90 8 L100 20 L100 40 L0 40 Z"
                fill="url(#elevGrad)"
                opacity="0.2"
              />
            </svg>
            {/* Current position marker */}
            <div
              className="absolute"
              style={{
                left: '20%',
                top: 0,
                bottom: 0,
                width: 1,
                background: 'var(--color-text-primary)',
                borderLeft: '1px dashed var(--color-text-tertiary)',
                opacity: 0.6,
              }}
            />
          </div>
          <div className="shrink-0 flex" style={{ gap: 8 }}>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.20)',
              }}
            >
              Export GPX
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
