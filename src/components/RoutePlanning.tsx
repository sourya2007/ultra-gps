import React, { useState } from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

type TransportMode = 'car' | 'walk' | 'bike' | 'transit';

interface ModeSpec {
  key: TransportMode;
  label: string;
  icon: string;
  duration: string;
}

const MODES: ModeSpec[] = [
  { key: 'car', label: 'Drive', icon: 'directions_car', duration: '22m' },
  { key: 'walk', label: 'Walk', icon: 'directions_walk', duration: '1h 45m' },
  { key: 'bike', label: 'Bike', icon: 'pedal_bike', duration: '45m' },
  { key: 'transit', label: 'Transit', icon: 'directions_transit', duration: '35m' },
];

export const RoutePlanning: React.FC = () => {
  const { isDark } = useTheme();
  const [from, setFrom] = useState('Your Location');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState<TransportMode>('car');

  const onSwap = () => {
    setFrom(to || 'Your Location');
    setTo(from === 'Your Location' ? '' : from);
  };

  const activeMode = MODES.find((m) => m.key === mode)!;
  const distanceKm = '12.4';

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search Card */}
      <div
        className="surface-card"
        style={{
          padding: 14,
          position: 'relative',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex flex-col gap-3 relative">
          {/* From input */}
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <Icon
                name="my_location"
                size={20}
                filled
                style={{ color: 'var(--color-accent-text)' }}
              />
            </div>
            <input
              className="w-full px-3 focus:outline-none focus:ring-1 text-sm"
              style={{
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                border: '1px solid transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Your Location"
              type="text"
            />
          </div>

          {/* Dashed connector */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 11,
              top: 30,
              bottom: 30,
              width: 2,
              borderLeft: '2px dashed var(--color-text-tertiary)',
              opacity: 0.5,
            }}
          />

          {/* To input */}
          <div className="flex items-center gap-3">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{ width: 24, height: 24 }}
            >
              <Icon
                name="location_on"
                size={20}
                filled
                style={{ color: 'var(--color-error-text)' }}
              />
            </div>
            <input
              className="w-full px-3 focus:outline-none focus:ring-1 text-sm"
              style={{
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
                border: '1px solid transparent',
                color: 'var(--color-text-primary)',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Choose destination..."
              type="text"
            />
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={onSwap}
            aria-label="Swap origin and destination"
            className="absolute flex items-center justify-center"
            style={{
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Icon name="swap_vert" size={18} />
          </button>
        </div>
      </div>

      {/* Transport mode chips */}
      <div className="flex gap-2">
        {MODES.map(({ key, icon, duration }) => {
          const active = key === mode;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className="flex-1 flex items-center justify-center"
              style={{
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: active
                  ? 'var(--color-accent)'
                  : 'var(--color-bg-inset)',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                color: active ? 'var(--color-text-inverse)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                boxShadow: active ? '0 0 15px rgba(195,243,139,0.15)' : 'none',
              }}
            >
              <Icon name={icon} size={18} filled={active} style={{ marginRight: 6 }} />
              <span>{duration}</span>
            </button>
          );
        })}
      </div>

      {/* Map area with animated route line */}
      <div
        className="relative w-full"
        style={{
          height: 'clamp(220px, 40vh, 360px)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(180deg, #0a0a0a 0%, #181818 100%)'
            : 'linear-gradient(180deg, #f0f4e8 0%, #e0e8d0 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Stylized "map" backdrop */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at 30% 30%, rgba(195,243,139,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(195,243,139,0.03) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 30% 30%, rgba(67,160,71,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(67,160,71,0.04) 0%, transparent 50%)',
          }}
        />
        {/* Grid lines */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{ opacity: isDark ? 0.12 : 0.18 }}
        >
          <defs>
            <pattern id="route-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={isDark ? '#3a3a3a' : '#a8b89a'}
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#route-grid)" />
        </svg>

        {/* Animated route line */}
        <svg
          aria-hidden
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 0 8px rgba(195,243,139,0.5))' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M20,80 Q40,40 60,30 T80,20"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="0"
          />
          <circle cx="20" cy="80" r="2.5" fill="var(--color-accent)" />
          <circle cx="80" cy="20" r="2.5" fill="var(--color-error)" />
        </svg>

        {/* Summary card (overlay bottom) */}
        <div
          className="absolute left-4 right-4 flex flex-col gap-3"
          style={{
            bottom: 12,
            padding: 16,
            borderRadius: 'var(--radius-lg)',
            background: isDark
              ? 'rgba(15, 17, 23, 0.92)'
              : 'rgba(255, 255, 255, 0.94)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-end gap-2">
                <span
                  className="font-bold"
                  style={{
                    fontSize: 26,
                    lineHeight: 1,
                    color: 'var(--color-accent-text)',
                    fontFamily: "'Google Sans Flex', sans-serif",
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {activeMode.duration.split(' ')[0]}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'var(--color-text-tertiary)',
                    fontFamily: "'Google Sans Flex', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  min
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 2,
                    fontFamily: "'Google Sans Mono', monospace",
                  }}
                >
                  ({distanceKm} km)
                </span>
              </div>
              <p
                className="m-0 mt-1"
                style={{
                  fontSize: 14,
                  color: 'var(--color-text-primary)',
                  fontFamily: "'Google Sans Flex', sans-serif",
                }}
              >
                Fastest route via Main St
              </p>
            </div>
            <div
              className="flex items-center gap-1.5"
              style={{ paddingTop: 4 }}
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
                }}
              >
                GPS Ready
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2"
            style={{
              height: 52,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontFamily: "'Google Sans Flex', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(195,243,139,0.20)',
            }}
          >
            <Icon name="navigation" size={22} filled />
            <span>START NAVIGATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};