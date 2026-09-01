import React from 'react';
import { Icon } from './Icon';

export type DockTab = 'map' | 'telemetry' | 'analysis';

interface MobileDockProps {
  activeTab: DockTab;
  onChangeTab: (tab: DockTab) => void;
}

const tabs: { key: DockTab; label: string; icon: string; hideOn?: 'lg' }[] = [
  { key: 'map', label: 'MAP', icon: 'map' },
  { key: 'telemetry', label: 'TELEMETRY', icon: 'monitoring', hideOn: 'lg' },
  { key: 'analysis', label: 'ANALYSIS', icon: 'analytics' },
];

export const MobileDock: React.FC<MobileDockProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[600]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.18)',
      }}
      aria-label="Primary"
    >
      <div className="flex justify-around items-center h-16 px-4">
        {tabs.map(({ key, label, icon, hideOn }) => {
          const isActive = activeTab === key;
          const visibilityClass = hideOn === 'lg' ? 'lg:hidden' : '';
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChangeTab(key)}
              className={`flex flex-col items-center gap-1 transition-colors ${visibilityClass}`}
              style={{
                minWidth: 64,
                color: isActive ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={icon} size={22} filled={isActive} />
              <span
                className="uppercase font-bold"
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};