import React from 'react';
import { Icon } from './Icon';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onOpenArchitecture: () => void;
  onRequestPermissions: () => void;
  onLocateNow?: () => void;
  hasPermissions: boolean;
  isAiLoaded?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenArchitecture,
  onRequestPermissions,
  onLocateNow,
  hasPermissions,
  isAiLoaded = false,
  onToggleSidebar,
  isSidebarOpen = true,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 panel-section lg:px-5"
      style={{
        background: 'var(--color-bg-secondary)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'var(--color-accent-soft)',
          }}
        >
          <Icon name="explore" size={20} style={{ color: 'var(--color-accent)' }} filled />
        </div>
        <div>
          <p
            className="m-0 text-[10px] font-semibold uppercase tracking-[0.18em] hidden lg:block"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Navigation
          </p>
          <h1
            className="text-base font-bold tracking-tight flex items-center gap-2 m-0"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span>Ultra-GPS</span>
            <span
              className="badge hidden lg:inline-flex"
              style={{
                background: isAiLoaded ? 'var(--color-success-soft)' : 'var(--color-accent-soft)',
                color: isAiLoaded ? 'var(--color-success-text)' : 'var(--color-accent-text)',
                fontSize: '9px',
              }}
            >
              <span
                className="status-dot"
                style={{
                  background: isAiLoaded ? 'var(--color-success)' : 'var(--color-accent)',
                }}
              />
              {isAiLoaded ? 'AI Ready' : 'Compiling...'}
            </span>
          </h1>
          <p className="text-xs m-0 hidden lg:block" style={{ color: 'var(--color-text-tertiary)' }}>
            6-DOF Sensor Fusion · ONNX Inertial MLP · Instantaneous Odometry
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn hidden lg:inline-flex"
            title={isSidebarOpen ? 'Hide Telemetry Panel' : 'Show Telemetry Panel'}
            style={{ padding: '6px 10px' }}
          >
            <Icon
              name={isSidebarOpen ? 'left_panel_close' : 'left_panel_open'}
              size={18}
              style={{ color: 'var(--color-text-secondary)' }}
            />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ padding: '6px 10px' }}
        >
          <Icon
            name={isDark ? 'light_mode' : 'dark_mode'}
            size={18}
            style={{ color: isDark ? 'var(--color-warning-text)' : 'var(--color-accent-text)' }}
            filled={isDark}
          />
        </button>

        {onLocateNow && (
          <button onClick={onLocateNow} className="btn btn-accent hidden lg:inline-flex" title="Acquire Current Device Location">
            <Icon name="my_location" size={16} style={{ color: 'var(--color-accent-text)' }} />
            <span>Locate</span>
          </button>
        )}

        <button onClick={onOpenArchitecture} className="btn btn-accent hidden lg:inline-flex" title="AI Architecture & Benchmarks">
          <Icon name="memory" size={16} style={{ color: 'var(--color-accent-text)' }} />
          <span>Architecture</span>
        </button>

        <button
          onClick={onRequestPermissions}
          className={`btn ${hasPermissions ? 'btn-success' : 'btn-accent'} hidden lg:inline-flex`}
          title="Request Sensor Permissions"
        >
          <Icon
            name={hasPermissions ? 'verified_user' : 'shield'}
            size={16}
            filled={hasPermissions}
            style={{ color: hasPermissions ? 'var(--color-success-text)' : 'var(--color-accent-text)' }}
          />
          <span>{hasPermissions ? 'Sensors Ready' : 'Init Sensors'}</span>
        </button>
      </div>
    </header>
  );
};
