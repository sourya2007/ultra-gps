import React from 'react';
import { Sidebar, type SidebarKey } from './Sidebar';
import { TopBar } from './TopBar';

interface DesktopShellProps {
  activeKey: SidebarKey;
  onSelect: (key: SidebarKey) => void;
  hasPermissions: boolean;
  isAiLoaded?: boolean;
  onRequestPermissions?: () => void;
  onOpenSettings?: () => void;
  onOpenArchitecture?: () => void;
  children: React.ReactNode;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  activeKey,
  onSelect,
  hasPermissions,
  isAiLoaded,
  onRequestPermissions,
  onOpenSettings,
  onOpenArchitecture,
  children,
}) => {
  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
      }}
    >
      <Sidebar activeKey={activeKey} onSelect={onSelect} />
      <TopBar
        hasPermissions={hasPermissions}
        isAiLoaded={isAiLoaded}
        onRequestPermissions={onRequestPermissions}
        onOpenSettings={onOpenSettings}
        onOpenArchitecture={onOpenArchitecture}
      />
      <main
        className="absolute"
        style={{
          top: 64,
          left: 288,
          right: 0,
          bottom: 0,
          overflow: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  );
};
