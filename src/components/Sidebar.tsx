import React from 'react';
import { Icon } from './Icon';

export type SidebarKey = 'map' | 'route' | 'telemetry' | 'analysis' | 'fusion' | 'ai-lab' | 'settings';

interface SidebarProps {
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
}

const NAV: { key: SidebarKey; label: string; icon: string }[] = [
  { key: 'map', label: 'Map', icon: 'map' },
  { key: 'route', label: 'Route', icon: 'route' },
  { key: 'telemetry', label: 'Telemetry', icon: 'insights' },
  { key: 'analysis', label: 'Analysis', icon: 'query_stats' },
  { key: 'fusion', label: 'Fusion', icon: 'hub' },
  { key: 'ai-lab', label: 'AI Lab', icon: 'psychology' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];

const LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1UG87PDFzNhBfGSZR4LDJOntmAf6LAM4ElNyvqfMHad6sxEhbb1lwyUP98G_A7DMa4I3sCXjMMco-lSAOVGntbiL8CG_Zkbjjo2Ot-OzNo3EogLlxHEDIkSAKK5IPYO3Eh_BgC5mPvYmazB8p_2vlWIedfp8NieT2doSx_u86VnS4-J-J09wGJuo1yJaJQExR4CpyZW4YO7Vax0f_roKz8KriYNTl8pZ5i1gzjZy9NJWlsJscib56pyZbM';

export const Sidebar: React.FC<SidebarProps> = ({ activeKey, onSelect }) => {
  return (
    <aside
      className="fixed left-0 top-0 h-full z-50 flex flex-col"
      style={{
        width: 288,
        background: 'var(--color-bg-primary)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.10)',
      }}
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <div className="flex items-center gap-3" style={{ padding: 24, marginBottom: 16 }}>
        <img
          src={LOGO_URL}
          alt="Ultra-GPS"
          className="object-contain"
          style={{ height: 32, width: 'auto' }}
        />
        <span
          className="tracking-tight"
          style={{
            fontFamily: "'Google Sans Flex','Inter',sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          ULTRA-GPS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '0 16px 24px' }}>
        <ul className="flex flex-col gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {NAV.map(({ key, label, icon }) => {
            const isActive = activeKey === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onSelect(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className="w-full flex items-center text-left transition-all group"
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? 'var(--color-accent-soft)' : 'transparent',
                    color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-primary)',
                    fontWeight: isActive ? 600 : 500,
                    boxShadow: isActive ? '0 0 12px rgba(195,243,139,0.20)' : 'none',
                    cursor: 'pointer',
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 14,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--color-bg-inset)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Icon
                    name={icon}
                    size={20}
                    filled={isActive}
                    style={{
                      marginRight: 16,
                      color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
                    }}
                  />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / version chip */}
      <div style={{ padding: '0 24px 24px' }}>
        <div
          className="flex items-center gap-2"
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-tertiary)',
            fontSize: 10,
            fontFamily: "'Google Sans Mono',monospace",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <Icon name="deployed_code" size={14} style={{ color: 'var(--color-accent-text)' }} />
          <span>v2.4.1 · Build 8902</span>
        </div>
      </div>
    </aside>
  );
};
