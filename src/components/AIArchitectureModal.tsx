import React from 'react';
import { Icon } from './Icon';

interface AIArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIArchitectureModal: React.FC<AIArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-overlay)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-xl)',
          color: 'var(--color-text-primary)',
          fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
          transition: 'background-color 0.35s ease, border-color 0.35s ease',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Icon name="memory" size={22} style={{ color: 'var(--color-accent)' }} />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider m-0">
                Inertial Odometry Neural Architecture (Exp 2: Dense MLP)
              </h2>
              <p className="text-[11px] m-0" style={{ color: 'var(--color-text-tertiary)' }}>
                Trained on IO-VNBD Benchmark Dataset with Normalized Target Scaling
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <Icon name="close" size={18} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {/* Architecture Pipeline */}
          <div className="surface-inset p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase" style={{ color: 'var(--color-accent-text)' }}>
              <Icon name="layers" size={16} />
              Dense MLP Neural Pipeline (6-DOF IMU → Instantaneous Vectors)
            </div>
            <div
              className="p-3 text-[11px] leading-relaxed"
              style={{
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div>1. Input: <span style={{ color: 'var(--color-accent-text)' }}>T=20 (2.0s context) @ 10Hz, 6-DOF [ax, ay, az, gx, gy, gz] → Flattened 120D</span></div>
              <div>2. Normalization: <span style={{ color: 'var(--color-warning-text)' }}>LayerNorm(120) for dynamic sensor scaling</span></div>
              <div>3. Dense Backbone: <span style={{ color: 'var(--color-accent-text)' }}>Linear(120 → 256) → Linear(256 → 128) → Linear(128 → 64) with GELU</span></div>
              <div>4. Instantaneous Heads:</div>
              <div className="pl-3">• <span style={{ color: 'var(--color-success-text)' }}>2D Displacement Head: [dX, dY] (meters)</span></div>
              <div className="pl-3">• <span style={{ color: 'var(--color-warning-text)' }}>Instantaneous Speed Head: Softplus(Linear(64 → 1)) (m/s)</span></div>
              <div className="pl-3">• <span style={{ color: 'var(--color-accent-text)' }}>Instantaneous Turn Head: Linear(64 → 1) (radians)</span></div>
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="surface-inset p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase" style={{ color: 'var(--color-success-text)' }}>
              <Icon name="table_chart" size={16} />
              Experiment Benchmarks (IO-VNBD Dataset)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-left border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-tertiary)' }}>
                    <th className="py-2 pr-2 font-semibold">Model / Experiment</th>
                    <th className="py-2 px-2 font-semibold">Parameters</th>
                    <th className="py-2 px-2 font-semibold">Median Err</th>
                    <th className="py-2 px-2 font-semibold">Inference Latency</th>
                    <th className="py-2 pl-2 font-semibold">Speed / Turn Outputs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="font-bold"
                    style={{
                      color: 'var(--color-success-text)',
                      background: 'var(--color-success-soft)',
                      borderBottom: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <td className="py-2 pr-2">Exp 2: Inertial MLP (Active)</td>
                    <td className="py-2 px-2" style={{ color: 'var(--color-text-primary)' }}>79,636</td>
                    <td className="py-2 px-2" style={{ color: 'var(--color-success-text)' }}>0.070 m</td>
                    <td className="py-2 px-2" style={{ color: 'var(--color-accent-text)' }}>&lt; 1.0 ms (WebGPU)</td>
                    <td className="py-2 pl-2" style={{ color: 'var(--color-success-text)' }}>Instantaneous</td>
                  </tr>
                  <tr style={{ color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td className="py-2 pr-2">Exp 1: IO-Transformer</td>
                    <td className="py-2 px-2" style={{ color: 'var(--color-text-primary)' }}>94,084</td>
                    <td className="py-2 px-2">0.089 m</td>
                    <td className="py-2 px-2">&lt; 5.0 ms</td>
                    <td className="py-2 pl-2">Window Aggregated</td>
                  </tr>
                  <tr style={{ color: 'var(--color-text-secondary)' }}>
                    <td className="py-2 pr-2">Classical Weinberg PDR</td>
                    <td className="py-2 px-2" style={{ color: 'var(--color-text-primary)' }}>Heuristic</td>
                    <td className="py-2 px-2">0.620 m</td>
                    <td className="py-2 px-2">0.1 ms</td>
                    <td className="py-2 pl-2">Cadence Window</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Instantaneous Processing */}
          <div className="surface-inset p-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase" style={{ color: 'var(--color-accent-text)' }}>
              <Icon name="electric_bolt" size={14} />
              Strictly Instantaneous Kinematics
            </div>
            <p className="text-[11px] leading-relaxed m-0" style={{ color: 'var(--color-text-secondary)' }}>
              Unlike classical cadence windows that average step timestamps over 10 seconds, the{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Inertial MLP</span>{' '}
              directly outputs instantaneous velocity (v_inst) and turn angle change (dTheta_inst) per inference step. No rolling mean or lag is introduced into the speed HUD.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
            <Icon name="fork_right" size={14} />
            <span>Experiments: model/research/experiments/exp_2/</span>
          </div>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '6px 20px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
