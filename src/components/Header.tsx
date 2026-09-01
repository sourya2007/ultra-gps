import React from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  pageTitle: string;
  onOpenArchitecture: () => void;
  onRequestPermissions: () => void;
  onLocateNow?: () => void;
  hasPermissions: boolean;
  isAiLoaded?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenArchitecture,
  onRequestPermissions,
  onLocateNow,
  hasPermissions,
  isAiLoaded = false,
  onToggleSidebar,
  isSidebarOpen = true,
  onOpenSettings,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <header
      className="flex items-center justify-between gap-4 px-5 panel-section"
      style={{
        height: 64,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: Brand + Page title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenArchitecture}
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent-soft)',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-accent-text)',
          }}
          aria-label="AI Architecture"
          title="AI Architecture & Benchmarks"
        >
          <Icon name="explore" size={20} filled />
        </button>
        <span
          className="font-semibold tracking-tight whitespace-nowrap"
          style={{
            fontSize: '18px',
            color: 'var(--color-text-primary)',
          }}
        >
          {pageTitle}
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div
          className="flex items-center h-10 px-3"
          style={{
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
          }}
        >
          <Icon name="search" size={18} style={{ color: 'var(--color-text-tertiary)' }} />
          <input
            className="w-full bg-transparent border-none focus:outline-none text-sm px-2"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
            }}
            placeholder="Search destination…"
            type="text"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onLocateNow && (
          <button
            onClick={onLocateNow}
            className="btn hidden lg:inline-flex"
            style={{ padding: '6px 10px' }}
            title="Acquire Current Device Location"
          >
            <Icon name="my_location" size={16} style={{ color: 'var(--color-accent-text)' }} />
            <span>Locate</span>
          </button>
        )}

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn hidden lg:inline-flex"
            style={{ padding: '6px 10px' }}
            title={isSidebarOpen ? 'Hide Telemetry Panel' : 'Show Telemetry Panel'}
          >
            <Icon
              name={isSidebarOpen ? 'left_panel_close' : 'left_panel_open'}
              size={18}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="btn"
          style={{ padding: '6px 10px' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <Icon
            name={isDark ? 'light_mode' : 'dark_mode'}
            size={18}
            style={{ color: isDark ? 'var(--color-warning-text)' : 'var(--color-accent-text)' }}
            filled={isDark}
          />
        </button>

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="btn"
            style={{ padding: '6px 10px' }}
            title="System Settings"
            aria-label="System Settings"
          >
            <Icon
              name="settings"
              size={18}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </button>
        )}

        <button
          onClick={onRequestPermissions}
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent)',
            border: 'none',
            color: 'var(--color-text-inverse)',
            cursor: 'pointer',
          }}
          title={hasPermissions ? 'Sensors Ready' : 'Init Sensors'}
        >
          <Icon
            name={hasPermissions ? 'verified_user' : 'person'}
            size={18}
            filled={hasPermissions}
          />
        </button>

        {isAiLoaded && (
          <span
            className="badge"
            style={{
              background: 'var(--color-success-soft)',
              color: 'var(--color-success-text)',
              fontSize: '9px',
            }}
          >
            <span className="status-dot" style={{ background: 'var(--color-success)' }} />
            AI
          </span>
        )}
      </div>
    </header>
  );
};