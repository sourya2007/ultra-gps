import React from 'react';
import type { AIInferenceMetrics } from '../types';
import { Icon } from './Icon';

interface AIModelStatusPanelProps {
  aiMetrics: AIInferenceMetrics;
  onOpenArchitecture: () => void;
}

export const AIModelStatusPanel: React.FC<AIModelStatusPanelProps> = ({
  aiMetrics,
  onOpenArchitecture,
}) => {
  const isWebGpu = aiMetrics.executionProvider === 'webgpu';
  const isWasm = aiMetrics.executionProvider === 'wasm';
  const isReady = aiMetrics.isLoaded;
  const isStatic = aiMetrics.isStationary;

  const providerBadge = () => {
    if (isWebGpu) return { label: 'WebGPU Accelerated', bg: 'var(--color-success-soft)', color: 'var(--color-success-text)', icon: 'bolt' };
    if (isWasm) return { label: 'WASM SIMD', bg: 'var(--color-accent-soft)', color: 'var(--color-accent-text)', icon: 'bolt' };
    if (aiMetrics.isLoading) return { label: 'Compiling Shaders...', bg: 'var(--color-warning-soft)', color: 'var(--color-warning-text)', icon: 'hourglass_top' };
    return { label: 'Initializing', bg: 'var(--color-bg-inset)', color: 'var(--color-text-tertiary)', icon: 'sync' };
  };

  const provider = providerBadge();

  return (
    <div className="surface-card flex flex-col gap-2.5 p-3 text-xs">
      {/* Header */}
      <div
        className="flex items-center justify-between pb-2"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <div
          className="flex items-center gap-1.5 font-bold uppercase text-xs"
          style={{ color: 'var(--color-text-primary)', letterSpacing: '0.03em' }}
        >
          <Icon name="memory" size={16} style={{ color: 'var(--color-accent)' }} />
          Edge Inertial MLP (IO-VNBD Exp 2)
        </div>

        <div className="flex items-center gap-2">
          {isStatic && (
            <span
              className="badge"
              style={{
                background: 'var(--color-warning-soft)',
                color: 'var(--color-warning-text)',
                fontSize: '9px',
              }}
            >
              <Icon name="lock" size={10} style={{ color: 'var(--color-warning-text)' }} filled />
              ZUPT Static
            </span>
          )}

          <span
            className={`badge ${aiMetrics.isLoading ? 'animate-pulse' : ''}`}
            style={{
              background: provider.bg,
              color: provider.color,
              fontSize: '9px',
            }}
          >
            <Icon name={provider.icon} size={12} style={{ color: provider.color }} filled />
            {provider.label}
          </span>

          <button
            onClick={onOpenArchitecture}
            className="btn"
            style={{ padding: '4px 6px' }}
            title="Inspect MLP Architecture & Benchmarks"
          >
            <Icon name="info" size={16} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Model Spec & Latency */}
      <div
        className="surface-inset flex items-center justify-between px-3 py-2 text-xs"
      >
        <div className="flex items-center gap-1.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
          {isReady ? (
            <Icon name="check_circle" size={14} style={{ color: 'var(--color-success)' }} filled />
          ) : (
            <Icon name="warning" size={14} style={{ color: 'var(--color-warning)' }} filled />
          )}
          <span className="truncate">{aiMetrics.modelName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-semibold">
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>Latency:</span>
          <span
            style={{
              color: aiMetrics.lastLatencyMs < 5 ? 'var(--color-success-text)' : 'var(--color-accent-text)',
              fontFamily: "'Google Sans Mono', monospace",
            }}
          >
            {aiMetrics.lastLatencyMs.toFixed(1)} ms
          </span>
        </div>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Inst Vector */}
        <div className="surface-inset p-2.5">
          <div className="metric-label flex items-center gap-1 mb-1">
            <Icon name="timeline" size={12} style={{ color: 'var(--color-accent)' }} />
            Inst Vector
          </div>
          <div className="metric-value text-xs font-bold">
            {isStatic ? '0.00 m' : `${aiMetrics.lastDisplacement.magnitude.toFixed(2)} m`}
          </div>
          <div className="text-[9px] truncate" style={{ color: 'var(--color-text-tertiary)' }}>
            {isStatic ? 'Zero Drift Lock' : `dX: ${aiMetrics.lastDisplacement.dx.toFixed(2)} | dY: ${aiMetrics.lastDisplacement.dy.toFixed(2)}`}
          </div>
        </div>

        {/* Inst Speed */}
        <div className="surface-inset p-2.5">
          <div className="metric-label flex items-center gap-1 mb-1">
            <Icon name="speed" size={12} style={{ color: 'var(--color-success)' }} />
            Inst Speed
          </div>
          <div className="metric-value text-xs font-bold">
            {isStatic ? '0.0 km/h' : `${aiMetrics.instantaneousSpeedKmh.toFixed(1)} km/h`}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--color-success-text)', opacity: 0.7 }}>
            {isStatic ? 'Static (0.00 m/s)' : `${aiMetrics.instantaneousSpeedMps.toFixed(2)} m/s`}
          </div>
        </div>

        {/* Inst Turn */}
        <div className="surface-inset p-2.5">
          <div className="metric-label flex items-center gap-1 mb-1">
            <Icon name="navigation" size={12} style={{ color: 'var(--color-accent)' }} />
            Inst Turn Δ
          </div>
          <div className="metric-value text-xs font-bold">
            {isStatic ? '0.0°' : `${aiMetrics.instantaneousTurnDeltaDeg.toFixed(1)}°`}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-tertiary)' }}>
            {isStatic ? 'Stationary' : 'dTheta (Instant)'}
          </div>
        </div>

        {/* Inference Count */}
        <div className="surface-inset p-2.5">
          <div className="metric-label flex items-center gap-1 mb-1">
            <Icon name="autorenew" size={12} style={{ color: 'var(--color-accent)' }} />
            Inferences
          </div>
          <div className="metric-value text-xs font-bold">
            {aiMetrics.totalInferences.toLocaleString()}
          </div>
          <div className="text-[9px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Avg: {aiMetrics.avgLatencyMs.toFixed(1)}ms
          </div>
        </div>
      </div>
    </div>
  );
};
