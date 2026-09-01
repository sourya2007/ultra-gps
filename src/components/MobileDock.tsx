import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';

export type DockTab = 'telemetry' | 'ai' | 'sim';

interface MobileDockProps {
  activeTab: DockTab;
  onChangeTab: (tab: DockTab) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDock: React.FC<MobileDockProps> = ({
  activeTab,
  onChangeTab,
  isOpen,
  onToggleOpen,
  onClose,
  children,
}) => {
  const { isDark } = useTheme();
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    dragCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (dragStartY.current == null || dragCurrentY.current == null) return;
    const delta = dragCurrentY.current - dragStartY.current;
    if (delta > 60) {
      onClose();
    } else if (delta < -60) {
      onToggleOpen();
    }
    dragStartY.current = null;
    dragCurrentY.current = null;
  };

  const tabs: { key: DockTab; label: string; icon: string }[] = [
    { key: 'telemetry', label: 'Compass', icon: 'explore' },
    { key: 'ai', label: 'AI', icon: 'memory' },
    { key: 'sim', label: 'Sim', icon: 'tune' },
  ];

  const dockBg = isDark ? 'rgba(15, 17, 23, 0.92)' : 'rgba(255, 255, 255, 0.94)';
  const dockBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <>
      <div
        ref={sheetRef}
        className="lg:hidden fixed inset-x-0 bottom-0 z-[500] flex flex-col"
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(calc(100% - 108px))',
          transition: 'transform 0.38s cubic-bezier(0.2, 0, 0, 1)',
          maxHeight: '78vh',
          background: dockBg,
          borderTop: `1px solid ${dockBorder}`,
          borderRadius: '20px 20px 0 0',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.18)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          color: isDark ? '#eaedf3' : '#1a1a2e',
          fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
          touchAction: 'pan-y',
        }}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (!isOpen) onToggleOpen(); }}
          className="flex justify-center pt-2 pb-1"
          style={{ cursor: 'grab' }}
          role="button"
          aria-label={isOpen ? 'Drag down to collapse' : 'Tap to open dock'}
        >
          <span
            style={{
              width: 36,
              height: 4,
              borderRadius: 9999,
              background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
            }}
          />
        </div>

        <div
          className="flex items-center gap-1 px-3"
          style={{
            borderBottom: `1px solid ${dockBorder}`,
            paddingBottom: 6,
          }}
        >
          {tabs.map(({ key, label, icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (!isOpen) onToggleOpen();
                  onChangeTab(key);
                }}
                className="flex items-center gap-1.5"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? '#ffffff' : 'inherit',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
              >
                <Icon name={icon} size={14} filled={isActive} />
                <span>{label}</span>
              </button>
            );
          })}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center"
            style={{
              padding: 6,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
            aria-label="Collapse dock"
            title="Collapse"
          >
            <Icon name="expand_more" size={18} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{
            padding: '12px 16px 20px',
            maxHeight: 'calc(78vh - 92px)',
          }}
        >
          {isOpen ? children : null}
        </div>
      </div>
    </>
  );
};