import React, { useEffect } from 'react';
import type {
  AIInferenceMetrics,
  HeadingData,
  MotionSample,
  NavigationMetrics,
  SensorStatus,
} from '../types';
import { Icon } from './Icon';

interface DockAnalysisPanelProps {
  open: boolean;
  onClose: () => void;
  recentMotion: MotionSample[];
  peakThreshold: number;
  aiMetrics: AIInferenceMetrics;
  navigationMetrics: NavigationMetrics;
  headingData: HeadingData;
  sensorStatus: SensorStatus;
  isSimulating: boolean;
  currentHeading: number;
  onOpenArchitecture: () => void;
  onInjectSample: (ax?: number, ay?: number, az?: number) => void;
  onToggleSimulator: () => void;
  onSetHeading: (heading: number) => void;
  onResetTracking: () => void;
}

/**
 * Dock-attached slide-up analysis panel for desktop (lg+).
 * Renders the IMU signal analysis (accelerometer magnitude + 3-axis gyro X/Y/Z)
 * along with AI model status and simulator controls. Backdrop-blurs the page underneath.
 */
export const DockAnalysisPanel: React.FC<DockAnalysisPanelProps> = ({
  open,
  onClose,
  recentMotion,
  peakThreshold,
  aiMetrics,
  navigationMetrics,
  headingData,
  sensorStatus,
  isSimulating,
  currentHeading,
  onOpenArchitecture,
  onInjectSample,
  onToggleSimulator,
  onSetHeading,
  onResetTracking,
}) => {
  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock background scroll while panel is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="hidden lg:block fixed inset-0 z-[550]"
        style={{
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(6px) saturate(140%)',
          WebkitBackdropFilter: 'blur(6px) saturate(140%)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
        aria-hidden
      />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Signal analysis panel"
        className="hidden lg:flex fixed left-0 right-0 bottom-0 z-[560] flex-col"
        style={{
          height: 'min(78vh, 720px)',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
          background: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-border)',
          borderTopLeftRadius: 'var(--radius-xl)',
          borderTopRightRadius: 'var(--radius-xl)',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.35)',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* Header strip */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: '20px 28px 12px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="flex items-center justify-center"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-inset)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              <Icon name="expand_more" size={20} />
            </button>
            <div>
              <div
                className="uppercase font-bold"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.12em',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Signal Analysis
              </div>
              <div
                className="font-semibold"
                style={{ fontSize: '18px', color: 'var(--color-text-primary)' }}
              >
                Live IMU Feed
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatChip
              icon={sensorStatus.hasHardwareMotion ? 'verified_user' : 'science'}
              label={sensorStatus.hasHardwareMotion ? 'IMU Live' : 'Simulator'}
              color={sensorStatus.hasHardwareMotion ? 'var(--color-success)' : 'var(--color-warning)'}
            />
            <StatChip
              icon="memory"
              label={aiMetrics.isLoaded ? `${aiMetrics.lastLatencyMs.toFixed(1)} ms` : 'Loading…'}
              color={aiMetrics.isLoaded ? 'var(--color-accent-text)' : 'var(--color-text-tertiary)'}
            />
            <button
              type="button"
              onClick={onOpenArchitecture}
              className="btn btn-accent"
              title="Inspect MLP architecture & benchmarks"
            >
              <Icon name="schema" size={14} />
              <span>Architecture</span>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
          style={{
            padding: '20px 28px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
            gap: 20,
          }}
        >
          {/* Left column: IMU graphs */}
          <div className="flex flex-col gap-4 min-w-0">
            <ImuAnalysisBlock
              recentMotion={recentMotion}
              peakThreshold={peakThreshold}
            />
          </div>

          {/* Right column: AI status + simulator */}
          <div className="flex flex-col gap-4 min-w-0">
            <AiStatusBlock
              aiMetrics={aiMetrics}
              onOpenArchitecture={onOpenArchitecture}
            />
            <SimulatorBlock
              isSimulating={isSimulating}
              currentHeading={currentHeading}
              navigationMetrics={navigationMetrics}
              headingData={headingData}
              onInjectSample={onInjectSample}
              onToggleSimulator={onToggleSimulator}
              onSetHeading={onSetHeading}
              onResetTracking={onResetTracking}
            />
          </div>
        </div>
      </section>
    </>
  );
};

const StatChip: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => (
  <div
    className="flex items-center gap-1.5"
    style={{
      padding: '6px 10px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-bg-inset)',
      border: '1px solid var(--color-border)',
      fontSize: '11px',
      fontWeight: 600,
      color,
      fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
    }}
  >
    <Icon name={icon} size={12} />
    <span>{label}</span>
  </div>
);

// ============================================================
// IMU block (extracted from SensorWaveform, repainted for panel)
// ============================================================

const ImuAnalysisBlock: React.FC<{ recentMotion: MotionSample[]; peakThreshold: number }> = ({
  recentMotion,
  peakThreshold,
}) => {
  const accelCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const gyroXCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const gyroYCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const gyroZCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const bgColor = '#0a0a0a';
  const gridColor = '#1f1f1f';
  const accent = '#c3f38b';

  const drawAccel = () => {
    const canvas = accelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    const maxVal = 4.0;
    const getY = (val: number) => {
      const clamped = Math.max(0, Math.min(maxVal, val));
      return height - (clamped / maxVal) * (height - 14) - 7;
    };
    const threshY = getY(peakThreshold);
    ctx.strokeStyle = 'rgba(255, 180, 171, 0.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(width, threshY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ffb4ab';
    ctx.font = '9px "Google Sans Mono", monospace';
    ctx.fillText(`TH: ${peakThreshold.toFixed(2)} m/s²`, 6, threshY - 4);

    if (recentMotion.length < 2) {
      ctx.fillStyle = '#8d9382';
      ctx.font = '9px "Google Sans Mono", monospace';
      ctx.fillText('awaiting IMU samples…', width / 2 - 50, height / 2);
      return;
    }

    const stepX = width / Math.max(recentMotion.length - 1, 1);
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(195, 243, 139, 0.16)';
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getY(sample.filteredMagnitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  };

  const drawGyro = (
    canvas: HTMLCanvasElement | null,
    seriesKey: 'gx' | 'gy' | 'gz',
    color: string,
    maxDeg: number,
  ) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    const midY = height / 2;
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();
    ctx.fillStyle = '#8d9382';
    ctx.font = '8px "Google Sans Mono", monospace';
    ctx.fillText(`+${maxDeg}°/s`, 4, 9);
    ctx.fillText('0', 4, midY - 2);
    ctx.fillText(`-${maxDeg}°/s`, 4, height - 4);
    if (recentMotion.length < 2) {
      ctx.fillStyle = '#8d9382';
      ctx.font = '9px "Google Sans Mono", monospace';
      ctx.fillText('awaiting IMU samples…', width / 2 - 50, midY + 4);
      return;
    }
    const stepX = width / Math.max(recentMotion.length - 1, 1);
    const getY = (degS: number) => {
      const clamped = Math.max(-maxDeg, Math.min(maxDeg, degS));
      return midY - (clamped / maxDeg) * (midY - 6);
    };
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    recentMotion.forEach((sample, i) => {
      const x = i * stepX;
      const y = getY(sample[seriesKey]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  useEffect(() => { drawAccel(); }, [recentMotion, peakThreshold]);
  useEffect(() => { drawGyro(gyroXCanvasRef.current, 'gx', '#38bdf8', 50); }, [recentMotion]);
  useEffect(() => { drawGyro(gyroYCanvasRef.current, 'gy', '#10b981', 50); }, [recentMotion]);
  useEffect(() => { drawGyro(gyroZCanvasRef.current, 'gz', '#a78bfa', 50); }, [recentMotion]);

  const latest = recentMotion[recentMotion.length - 1];

  const panelStyle: React.CSSProperties = {
    background: bgColor,
    color: '#e5e2e1',
    borderRadius: 'var(--radius-xl)',
    padding: 20,
    border: '1px solid var(--color-border)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
  };

  const canvasWrap: React.CSSProperties = {
    width: '100%',
    height: 80,
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 6,
    border: '1px solid #1f1f1f',
    background: bgColor,
  };

  return (
    <div style={panelStyle}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -96,
          right: -96,
          width: 192,
          height: 192,
          background: accent,
          opacity: 0.06,
          borderRadius: '50%',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <div
          className="uppercase font-bold"
          style={{
            fontSize: '11px',
            letterSpacing: '0.08em',
            color: '#e5e2e1',
          }}
        >
          IMU SIGNAL ANALYSIS
        </div>
        <div
          style={{
            fontFamily: "'Google Sans Mono', monospace",
            fontSize: '12px',
            color: '#8d9382',
          }}
        >
          REF: 9.81 m/s²
        </div>
      </div>

      {/* Live counter pills */}
      <div
        className="flex flex-wrap items-center gap-2 mt-4"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <PanelPill label="ACCEL MAG" value={latest ? `${latest.filteredMagnitude.toFixed(2)} m/s²` : '0.00 m/s²'} color={accent} />
        <PanelPill label="GYRO X" value={latest ? `${latest.gx.toFixed(1)} °/s` : '0.0 °/s'} color="#38bdf8" />
        <PanelPill label="GYRO Y" value={latest ? `${latest.gy.toFixed(1)} °/s` : '0.0 °/s'} color="#10b981" />
        <PanelPill label="GYRO Z" value={latest ? `${latest.gz.toFixed(1)} °/s` : '0.0 °/s'} color="#a78bfa" />
      </div>

      <div className="mt-4" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1" style={{ color: accent }}>
            <Icon name="show_chart" size={14} />
            Accelerometer (Dynamic Gait)
          </div>
          <span
            style={{
              fontFamily: "'Google Sans Mono', monospace",
              fontSize: '12px',
              color: '#e5e2e1',
            }}
          >
            {latest ? `${latest.filteredMagnitude.toFixed(2)}` : '0.00'} m/s²
          </span>
        </div>
        <div style={{ ...canvasWrap, marginTop: 6 }}>
          <canvas ref={accelCanvasRef} width={760} height={80} className="w-full h-full block" />
        </div>
      </div>

      <div className="mt-4" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center justify-between text-[11px] font-bold">
          <div className="flex items-center gap-1" style={{ color: '#a78bfa' }}>
            <Icon name="sync" size={14} />
            Gyroscope (3-Axis Rotation)
          </div>
          <div
            className="flex items-center gap-2"
            style={{ fontFamily: "'Google Sans Mono', monospace", fontSize: '10px' }}
          >
            <PanelLegend color="#38bdf8" label="X" />
            <PanelLegend color="#10b981" label="Y" />
            <PanelLegend color="#a78bfa" label="Z" />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <PanelGyroRow label="X" color="#38bdf8" canvasRef={gyroXCanvasRef} />
          <PanelGyroRow label="Y" color="#10b981" canvasRef={gyroYCanvasRef} />
          <PanelGyroRow label="Z" color="#a78bfa" canvasRef={gyroZCanvasRef} />
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4"
        style={{ borderTop: '1px solid var(--color-border)', position: 'relative', zIndex: 1 }}
      >
        <div className="flex items-center gap-2" style={{ color: '#e5e2e1' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          <span className="uppercase font-bold" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>
            STEP DETECTED
          </span>
        </div>
        <div
          className="uppercase font-bold"
          style={{
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: '#8d9382',
          }}
        >
          FILTER: COMPLEMENTARY (ACTIVE)
        </div>
      </div>
    </div>
  );
};

const PanelPill: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      padding: '4px 10px',
      borderRadius: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid #1f1f1f',
      minWidth: 0,
    }}
  >
    <span
      style={{
        fontSize: '9px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: '12px',
        color: '#e5e2e1',
        fontFamily: "'Google Sans Mono', monospace",
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </span>
  </div>
);

const PanelLegend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span className="flex items-center gap-1" style={{ color: '#8d9382' }}>
    <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: color }} />
    {label}
  </span>
);

const PanelGyroRow: React.FC<{
  label: string;
  color: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}> = ({ label, color, canvasRef }) => (
  <div className="flex items-center gap-2" style={{ width: '100%' }}>
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 22,
        height: 22,
        borderRadius: 4,
        background: `${color}22`,
        color,
        fontFamily: "'Google Sans Mono', monospace",
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {label}
    </div>
    <div
      style={{
        flex: 1,
        height: 60,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 6,
        border: '1px solid #1f1f1f',
        background: '#0a0a0a',
      }}
    >
      <canvas ref={canvasRef} width={760} height={60} className="w-full h-full block" />
    </div>
  </div>
);

// ============================================================
// AI status block (compact)
// ============================================================

const AiStatusBlock: React.FC<{
  aiMetrics: AIInferenceMetrics;
  onOpenArchitecture: () => void;
}> = ({ aiMetrics, onOpenArchitecture }) => {
  const isWebGpu = aiMetrics.executionProvider === 'webgpu';
  const isWasm = aiMetrics.executionProvider === 'wasm';
  const isReady = aiMetrics.isLoaded;
  const isStatic = aiMetrics.isStationary;

  const providerLabel = isWebGpu
    ? 'WebGPU'
    : isWasm
    ? 'WASM'
    : aiMetrics.isLoading
    ? 'Loading'
    : 'Init';

  return (
    <div
      className="surface-card p-4"
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <div className="flex items-center justify-between">
        <div
          className="uppercase font-bold"
          style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}
        >
          Edge Inertial MLP
        </div>
        <span
          className="badge"
          style={{
            background: 'var(--color-accent-soft)',
            color: 'var(--color-accent-text)',
            fontSize: '9px',
          }}
        >
          {providerLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniMetric label="Latency" value={isReady ? `${aiMetrics.lastLatencyMs.toFixed(1)} ms` : '—'} />
        <MiniMetric label="Inferences" value={aiMetrics.totalInferences.toLocaleString()} />
        <MiniMetric label="Speed" value={isStatic ? '0.0 km/h' : `${aiMetrics.instantaneousSpeedKmh.toFixed(1)} km/h`} />
        <MiniMetric label="Turn Δ" value={isStatic ? '0.0°' : `${aiMetrics.instantaneousTurnDeltaDeg.toFixed(1)}°`} />
      </div>

      <button
        type="button"
        onClick={onOpenArchitecture}
        className="btn btn-accent"
        style={{ justifyContent: 'center' }}
      >
        <Icon name="schema" size={14} />
        <span>Inspect Architecture</span>
      </button>
    </div>
  );
};

const MiniMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    className="surface-inset"
    style={{ padding: '8px 10px' }}
  >
    <div
      className="uppercase"
      style={{
        fontSize: '9px',
        letterSpacing: '0.08em',
        color: 'var(--color-text-tertiary)',
        fontWeight: 600,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: "'Google Sans Mono', monospace",
        fontSize: '14px',
        color: 'var(--color-text-primary)',
        fontVariantNumeric: 'tabular-nums',
        marginTop: 2,
      }}
    >
      {value}
    </div>
  </div>
);

// ============================================================
// Simulator block (compact)
// ============================================================

const SimulatorBlock: React.FC<{
  isSimulating: boolean;
  currentHeading: number;
  navigationMetrics: NavigationMetrics;
  headingData: HeadingData;
  onInjectSample: (ax?: number, ay?: number, az?: number) => void;
  onToggleSimulator: () => void;
  onSetHeading: (heading: number) => void;
  onResetTracking: () => void;
}> = ({ isSimulating, currentHeading, onInjectSample, onToggleSimulator, onSetHeading, onResetTracking }) => {
  const directions = [
    { label: 'N', deg: 0 },
    { label: 'E', deg: 90 },
    { label: 'S', deg: 180 },
    { label: 'W', deg: 270 },
  ];
  const turn = (delta: number) => {
    onSetHeading((currentHeading + delta + 360) % 360);
  };

  return (
    <div className="surface-card p-4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        className="uppercase font-bold"
        style={{ fontSize: '11px', letterSpacing: '0.08em', color: 'var(--color-text-primary)' }}
      >
        Inertial Simulator
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onInjectSample(0.6, 2.2, 9.81)}
          className="btn btn-accent"
          style={{ padding: '6px 8px', justifyContent: 'center' }}
          title="Inject Single IMU Step"
        >
          <Icon name="show_chart" size={13} />
          <span>Step</span>
        </button>
        <button
          type="button"
          onClick={onToggleSimulator}
          className={`btn ${isSimulating ? 'btn-danger' : 'btn-success'}`}
          style={{ padding: '6px 8px', justifyContent: 'center' }}
          title="Toggle Continuous Motion"
        >
          <Icon
            name={isSimulating ? 'stop' : 'play_arrow'}
            size={13}
            filled
          />
          <span>{isSimulating ? 'Stop' : 'Stream'}</span>
        </button>
        <button
          type="button"
          onClick={onResetTracking}
          className="btn"
          style={{ padding: '6px 8px', justifyContent: 'center' }}
          title="Reset Trajectory"
        >
          <Icon name="delete_outline" size={13} />
          <span>Reset</span>
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <div className="flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
            <Icon name="explore" size={12} />
            Bearing
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => turn(-15)} className="btn" style={{ padding: '2px 6px', fontSize: '10px' }}>
              <Icon name="rotate_left" size={10} />−15°
            </button>
            <span
              style={{
                fontFamily: "'Google Sans Mono', monospace",
                fontSize: '12px',
                color: 'var(--color-accent-text)',
                fontWeight: 700,
                minWidth: 32,
                textAlign: 'center',
              }}
            >
              {Math.round(currentHeading)}°
            </span>
            <button type="button" onClick={() => turn(15)} className="btn" style={{ padding: '2px 6px', fontSize: '10px' }}>
              <Icon name="rotate_right" size={10} />+15°
            </button>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={359}
          value={Math.round(currentHeading)}
          onChange={(e) => onSetHeading(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div className="grid grid-cols-4 gap-1 mt-2">
          {directions.map(({ label, deg }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSetHeading(deg)}
              className="btn"
              style={{
                padding: '4px 0',
                fontSize: '10px',
                justifyContent: 'center',
                background: Math.round(currentHeading) === deg ? 'var(--color-accent-soft)' : undefined,
                color: Math.round(currentHeading) === deg ? 'var(--color-accent-text)' : undefined,
                borderColor: Math.round(currentHeading) === deg ? 'var(--color-accent)' : undefined,
              }}
            >
              {label} ({deg}°)
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};