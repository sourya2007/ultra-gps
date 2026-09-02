import React, { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface SettingsDesktopProps {
  onToggleTheme?: () => void;
  onClose?: () => void;
  onExportLogs?: () => void;
  onSaveConfig?: () => void;
}

export const SettingsDesktop: React.FC<SettingsDesktopProps> = ({
  onToggleTheme: _onToggleTheme,
  onExportLogs,
  onSaveConfig,
}) => {
  // Synthetic dynamic values
  const [cpu, setCpu] = useState(65);
  const [mem, setMem] = useState(82);
  const [temp, setTemp] = useState(42);
  const [imuRate, setImuRate] = useState(85);
  const [gpsDp, setGpsDp] = useState(40);
  const [magVar, setMagVar] = useState(92);
  useEffect(() => {
    const t = setInterval(() => {
      setCpu((v) => Math.max(40, Math.min(85, v + (Math.random() - 0.5) * 6)));
      setMem((v) => Math.max(70, Math.min(95, v + (Math.random() - 0.5) * 3)));
      setTemp((v) => Math.max(38, Math.min(55, v + (Math.random() - 0.5) * 1)));
      setImuRate((v) => Math.max(80, Math.min(95, v + (Math.random() - 0.5) * 2)));
      setGpsDp((v) => Math.max(30, Math.min(50, v + (Math.random() - 0.5) * 3)));
      setMagVar((v) => Math.max(70, Math.min(99, v + (Math.random() - 0.5) * 8)));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="w-full flex flex-col"
      style={{
        padding: 32,
        gap: 32,
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex','Inter',sans-serif",
        minHeight: '100%',
        maxWidth: 1280,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: '34px',
              letterSpacing: '-0.02em',
              fontWeight: 700,
            }}
          >
            System Settings
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              maxWidth: 720,
              fontSize: 16,
              color: 'var(--color-text-tertiary)',
            }}
          >
            Configure local telemetry parameters, sensor fusion thresholds, and network connectivity.
          </p>
        </div>
        <div className="flex" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={onExportLogs}
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Export Logs
          </button>
          <button
            type="button"
            onClick={onSaveConfig}
            style={{
              padding: '8px 24px',
              borderRadius: 9999,
              background: 'var(--color-accent)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(195,243,139,0.30)',
            }}
          >
            Save Config
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          gap: 24,
        }}
      >
        {/* LEFT col-span-4 */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 4', gap: 24 }}
        >
          {/* Sensor Calibration */}
          <div
            className="relative overflow-hidden"
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              aria-hidden
              className="absolute"
              style={{
                top: -48,
                right: -48,
                width: 128,
                height: 128,
                background: '#0164b4',
                opacity: 0.20,
                borderRadius: '50%',
                filter: 'blur(32px)',
              }}
            />
            <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
              <Icon name="tune" size={20} style={{ color: '#a4c9ff' }} />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Sensor Calibration
              </h2>
            </div>
            <div className="flex flex-col relative" style={{ gap: 20 }}>
              <SettingBar label="IMU Polling Rate" value="1000 Hz" pct={imuRate} tone="accent" />
              <SettingBar label="GPS Dilution Precision" value="< 1.5" pct={gpsDp} tone="secondary" />
              <SettingBar label="Magnetometer Variance" value="High" pct={magVar} tone="error" />
              <button
                type="button"
                className="w-full flex items-center justify-center"
                style={{
                  padding: '12px 0',
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <Icon name="sync" size={16} />
                Initiate Zeroing Sequence
              </button>
            </div>
          </div>

          {/* Data Stream */}
          <div
            className="flex flex-col"
            style={{
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
              <Icon name="network_node" size={20} style={{ color: '#a4c9ff' }} />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Data Stream
              </h2>
            </div>
            <div className="flex flex-col" style={{ gap: 16 }}>
              <ToggleRow title="NTRIP Corrections" subtitle="RTK via Cellular" on />
              <ToggleRow title="Local Logging" subtitle="/dev/nvme0n1 (1.2TB free)" on tone="accent" />
              <ToggleRow title="Cloud Sync" subtitle="Requires Enterprise License" muted />
            </div>
          </div>
        </div>

        {/* RIGHT col-span-8 */}
        <div
          className="flex flex-col"
          style={{ gridColumn: 'span 8', gap: 24 }}
        >
          {/* HUD Layout */}
          <div
            className="relative overflow-hidden flex flex-col"
            style={{
              minHeight: 300,
              padding: 24,
              borderRadius: 16,
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                opacity: 0.10,
              }}
            />
            <div className="flex items-center relative" style={{ gap: 12, marginBottom: 24 }}>
              <Icon name="display_settings" size={20} style={{ color: 'var(--color-accent-text)' }} />
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Google Sans Flex','Inter',sans-serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                Telemetry HUD Layout
              </h2>
            </div>
            <div
              className="grid relative flex-1"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
            >
              <HudTile
                active
                label="Standard"
                desc="Primary metrics + Map"
                visual="standard"
              />
              <HudTile label="Data Dense" desc="Multi-sensor matrices" visual="dense" />
              <HudTile label="Minimal" desc="Distraction-free mode" visual="minimal" />
            </div>
          </div>

          {/* Bottom row: Hardware Status + System Build */}
          <div
            className="grid"
            style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}
          >
            <div
              className="flex flex-col"
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              }}
            >
              <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
                <Icon name="memory" size={20} style={{ color: 'var(--color-accent-text)' }} />
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Hardware Status
                </h2>
              </div>
              <div className="flex flex-col" style={{ gap: 24 }}>
                <RingMetric
                  label="CPU Load"
                  subtitle="ARM Cortex-A78AE"
                  pct={cpu}
                />
                <RingMetric
                  label="Memory Usage"
                  subtitle="13.1 GB / 16.0 GB"
                  pct={mem}
                  tone="secondary"
                />
                <div
                  className="flex justify-between items-center"
                  style={{
                    marginTop: 'auto',
                    paddingTop: 16,
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.10em',
                      fontWeight: 700,
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    Thermal State
                  </span>
                  <span
                    className="flex items-center"
                    style={{
                      fontSize: 12,
                      fontFamily: "'Google Sans Mono',monospace",
                      color: 'var(--color-text-primary)',
                      gap: 6,
                    }}
                  >
                    <span
                      className="rounded-full inline-block"
                      style={{ width: 8, height: 8, background: 'var(--color-accent)' }}
                    />
                    {temp}°C Nominal
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex flex-col"
              style={{
                padding: 24,
                borderRadius: 16,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.20)',
              }}
            >
              <div className="flex items-center" style={{ gap: 12, marginBottom: 24 }}>
                <Icon name="terminal" size={20} style={{ color: 'var(--color-text-tertiary)' }} />
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Google Sans Flex','Inter',sans-serif",
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  System Build
                </h2>
              </div>
              <div
                className="flex-1"
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'var(--color-bg-inset)',
                  fontFamily: "'Google Sans Mono','Fira Code',monospace",
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: 'var(--color-text-tertiary)',
                  overflow: 'auto',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-accent-text)' }}>root@ultra-gps:~#</span> cat /etc/os-release
                </div>
                <div style={{ marginTop: 8, color: 'var(--color-text-tertiary)' }}>
                  NAME="UltraOS"<br />
                  VERSION="4.2.1-lts"<br />
                  ID=ultraos<br />
                  BUILD_ID="20231024.1"<br />
                  KERNEL="5.15.0-rt"
                </div>
                <div style={{ marginTop: 16 }}>
                  <span style={{ color: 'var(--color-accent-text)' }}>root@ultra-gps:~#</span> dmesg | grep -i rtk
                </div>
                <div style={{ marginTop: 8 }}>
                  [ &nbsp;&nbsp;2.145] u-blox ZED-F9P RTK initialized<br />
                  [ &nbsp;&nbsp;2.150] NTRIP client started on ttyACM0<br />
                  [ &nbsp;&nbsp;4.321] RTK FIX achieved (32 sats)
                </div>
                <div style={{ marginTop: 16 }} className="animate-pulse">
                  <span style={{ color: 'var(--color-accent-text)' }}>root@ultra-gps:~#</span> _
                </div>
              </div>
              <div
                className="flex justify-between items-center"
                style={{ marginTop: 16, padding: '0 8px' }}
              >
                <span
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.10em',
                    fontWeight: 700,
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Last Updated: 2 days ago
                </span>
                <button
                  type="button"
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.10em',
                    color: 'var(--color-accent-text)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Check for Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingBar: React.FC<{
  label: string;
  value: string;
  pct: number;
  tone: 'accent' | 'secondary' | 'error';
}> = ({ label, value, pct, tone }) => {
  const color =
    tone === 'accent'
      ? 'var(--color-accent)'
      : tone === 'secondary'
      ? '#a4c9ff'
      : 'var(--color-error)';
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex justify-between">
        <span
          className="uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.10em',
            fontWeight: 700,
            color: 'var(--color-text-tertiary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: tone === 'error' ? 'var(--color-error-text)' : 'var(--color-accent-text)',
          }}
        >
          {value}
        </span>
      </div>
      <div
        className="w-full overflow-hidden"
        style={{ height: 6, borderRadius: 9999, background: 'var(--color-bg-inset)' }}
      >
        <div
          className={tone === 'error' ? 'animate-pulse' : ''}
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 9999,
            background: color,
            boxShadow: tone === 'accent' ? '0 0 10px rgba(195,243,139,0.5)' : 'none',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};

const ToggleRow: React.FC<{
  title: string;
  subtitle: string;
  on?: boolean;
  muted?: boolean;
  tone?: 'accent';
}> = ({ title, subtitle, on, muted, tone }) => {
  return (
    <label
      className="flex items-center justify-between"
      style={{ cursor: 'pointer', opacity: muted ? 0.5 : 1 }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Google Sans Flex','Inter',sans-serif",
            fontSize: 14,
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            marginTop: 2,
            fontFamily: "'Google Sans Mono',monospace",
          }}
        >
          {subtitle}
        </div>
      </div>
      <div
        className="relative"
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: on
            ? tone === 'accent'
              ? 'rgba(195,243,139,0.20)'
              : 'var(--color-bg-inset)'
            : 'var(--color-bg-inset)',
          border: on && tone === 'accent' ? '1px solid rgba(195,243,139,0.30)' : '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: on ? 22 : 2,
            width: 18,
            height: 18,
            borderRadius: 9999,
            background: on
              ? tone === 'accent'
                ? 'var(--color-accent)'
                : 'var(--color-text-primary)'
              : 'var(--color-border)',
            transition: 'left 0.3s ease',
            boxShadow: on && tone === 'accent' ? '0 0 8px rgba(195,243,139,0.8)' : 'none',
          }}
        />
      </div>
    </label>
  );
};

const HudTile: React.FC<{
  active?: boolean;
  label: string;
  desc: string;
  visual: 'standard' | 'dense' | 'minimal';
}> = ({ active, label, desc, visual }) => {
  return (
    <div
      className="relative"
      style={{
        padding: 16,
        borderRadius: 12,
        background: 'var(--color-bg-inset)',
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
        boxShadow: active ? '0 0 20px rgba(195,243,139,0.05)' : 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 96,
          borderRadius: 8,
          background: 'var(--color-bg-elevated)',
          padding: 8,
          display: 'flex',
          gap: 4,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {visual === 'standard' && (
          <svg
            viewBox="0 0 100 100"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            style={{ color: 'var(--color-accent)' }}
          >
            <path
              d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z"
              fill="currentColor"
              opacity="0.20"
            />
            <path
              d="M0,50 Q25,20 50,50 T100,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
        {visual === 'dense' && (
          <>
            <div style={{ flex: 1, background: 'var(--color-bg-inset)', borderRadius: 4 }} />
            <div className="flex flex-col" style={{ width: '33%', gap: 4 }}>
              <div style={{ flex: 1, background: 'var(--color-bg-inset)', borderRadius: 4 }} />
              <div style={{ flex: 1, background: 'var(--color-bg-inset)', borderRadius: 4 }} />
            </div>
          </>
        )}
        {visual === 'minimal' && (
          <div className="flex items-center justify-center w-full">
            <div
              className="rounded-full animate-spin"
              style={{
                width: 64,
                height: 64,
                border: '4px solid var(--color-bg-inset)',
                borderTopColor: '#a4c9ff',
              }}
            />
          </div>
        )}
      </div>
      <div>
        <div
          className="uppercase"
          style={{
            fontSize: 11,
            letterSpacing: '0.10em',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            fontFamily: "'Google Sans Mono',monospace",
          }}
        >
          {desc}
        </div>
      </div>
      {active && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            top: 24,
            right: 24,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: 'var(--color-accent)',
          }}
        >
          <Icon name="check" size={12} style={{ color: 'var(--color-text-inverse)' }} />
        </div>
      )}
    </div>
  );
};

const RingMetric: React.FC<{
  label: string;
  subtitle: string;
  pct: number;
  tone?: 'accent' | 'secondary';
}> = ({ label, subtitle, pct, tone = 'accent' }) => {
  const color = tone === 'accent' ? 'var(--color-accent)' : '#a4c9ff';
  const circumference = 100;
  const offset = circumference - pct;
  return (
    <div className="flex items-center" style={{ gap: 16 }}>
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: 9999,
          background: 'var(--color-bg-inset)',
        }}
      >
        <svg className="absolute" viewBox="0 0 36 36" width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--color-bg-elevated)"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray="100 100"
            strokeDashoffset={offset}
          />
        </svg>
        <span
          style={{
            fontFamily: "'Google Sans Mono',monospace",
            fontSize: 10,
            color: 'var(--color-text-primary)',
          }}
        >
          {pct}%
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div
          className="uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.10em',
            fontWeight: 700,
            color: 'var(--color-text-tertiary)',
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12,
            fontFamily: "'Google Sans Mono',monospace",
            color: 'var(--color-text-primary)',
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
};
