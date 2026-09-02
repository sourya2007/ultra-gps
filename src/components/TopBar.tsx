import React from 'react';
import { Icon } from './Icon';

interface TopBarProps {
  hasPermissions: boolean;
  isAiLoaded?: boolean;
  onRequestPermissions?: () => void;
  onOpenSettings?: () => void;
  onOpenArchitecture?: () => void;
}

function uptime(): string {
  // Synthetic uptime counter (re-rolled on remount)
  return '24:12:05:08';
}

export const TopBar: React.FC<TopBarProps> = ({
  hasPermissions,
  isAiLoaded = false,
  onRequestPermissions,
  onOpenSettings,
  onOpenArchitecture,
}) => {
  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-between"
      style={{
        left: 288,
        height: 64,
        padding: '0 32px',
        background: 'var(--color-bg-primary)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left: status pills */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2"
          style={{
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span
            className="rounded-full animate-pulse"
            style={{ width: 8, height: 8, background: 'var(--color-accent)' }}
          />
          <span
            className="uppercase"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              fontFamily: "'Google Sans Flex','Inter',sans-serif",
            }}
          >
            GNSS LOCK
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          style={{
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'var(--color-bg-inset)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Icon
            name="neurology"
            size={14}
            style={{ color: isAiLoaded ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)' }}
          />
          <span
            className="uppercase"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              fontFamily: "'Google Sans Flex','Inter',sans-serif",
            }}
          >
            {isAiLoaded ? 'AI ACTIVE' : 'AI STANDBY'}
          </span>
        </div>
      </div>

      {/* Right: system uptime + actions */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end" style={{ marginRight: 8 }}>
          <span
            className="uppercase"
            style={{
              fontSize: 9,
              letterSpacing: '0.10em',
              fontWeight: 700,
              color: 'var(--color-text-tertiary)',
            }}
          >
            SYSTEM_UPTIME
          </span>
          <span
            style={{
              fontFamily: "'Google Sans Mono',monospace",
              fontSize: 12,
              color: 'var(--color-accent-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {uptime()}
          </span>
        </div>

        {onRequestPermissions && (
          <button
            type="button"
            onClick={onRequestPermissions}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title={hasPermissions ? 'Sensors Ready' : 'Init Sensors'}
          >
            <Icon name={hasPermissions ? 'verified_user' : 'person'} size={18} filled={hasPermissions} />
          </button>
        )}

        {onOpenArchitecture && (
          <button
            type="button"
            onClick={onOpenArchitecture}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title="AI Architecture"
          >
            <Icon name="memory" size={18} />
          </button>
        )}

        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--color-bg-inset)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
            title="Settings"
          >
            <Icon name="settings" size={18} />
          </button>
        )}

        {/* Avatar */}
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: 'var(--color-accent)',
            color: 'var(--color-text-inverse)',
          }}
          title="User"
        >
          <Icon name="person" size={18} />
        </div>
      </div>
    </header>
  );
};
