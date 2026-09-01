# ultra-GPS

A modern, high-precision React web application that fuses **OpenStreetMap** rendering with **Pedestrian Dead Reckoning (PDR)** sensor fusion — using accelerometer, gyroscope, and compass data — and seamlessly switches to an **ONNX neural inertial model** running in the browser when GPS is lost or turned off.

> **Architecture:** Gaussian 6-DOF filtering → Zero-Velocity Update (ZUPT) gating → ONNX MLP/Transformer inference → Spherical geodesy translation → Leaflet map plotting

---

## Table of Contents

- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [The 5-Step Tracking Pipeline](#the-5-step-tracking-pipeline)
- [Mathematical Foundation](#mathematical-foundation)
- [Machine Learning Models](#machine-learning-models)
- [Tracking Modes](#tracking-modes)
- [Usage Guide](#usage-guide)
  - [Mobile (Hardware IMU)](#mobile-hardware-imu)
  - [Desktop (Built-in Simulator)](#desktop-built-in-simulator)
  - [Keyboard Controls](#keyboard-controls)
  - [Map Controls](#map-controls)
  - [Sensor Waveform View Modes](#sensor-waveform-view-modes)
- [Code Structure](#code-structure)
- [Research & Training](#research--training)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Citations](#citations)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server (with HTTPS via basic-ssl)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Lint the codebase
npm run lint
```

The app opens at `https://localhost:5173`. A browser warning about the self-signed SSL certificate is expected — proceed to the site anyway.

### First Run Checklist

1. **Grant sensor permissions** — click **INIT SENSORS** (top-right) and allow `DeviceOrientation` and `DeviceMotion` access
2. **Acquire GPS** — click **LOCATE ME** or wait for automatic acquisition
3. **Test on desktop without hardware** — click **AUTO STREAM** in the sidebar to activate the built-in IMU simulator
4. **Switch tracking modes** — toggle GPS on/off to see seamless fallback between GPS and AI odometry

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 19.2.7 | UI components and state management |
| **Language** | TypeScript | ~6.0.2 | Static typing and interfaces |
| **Build Tool** | Vite | 8.1.1 | Fast dev server and production bundler |
| **Styling** | Tailwind CSS v4 | 4.3.3 | Utility-first CSS framework |
| **Maps** | Leaflet + OpenStreetMap | 1.9.4 | Interactive map rendering with 3 tile layers |
| **AI Runtime** | onnxruntime-web | 1.29.0 | ONNX model inference via WebGPU/WASM |
| **Icons** | Lucide React | 1.34.0 | Clean SVG icon library |
| **Linting** | oxlint | 1.71.0 | Fast Rust-based linter for JS/TS |
| **SSL** | @vitejs/plugin-basic-ssl | 2.3.0 | Self-signed HTTPS for sensor APIs |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ultra-GPS Application                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐     ┌──────────────────────────────────┐  │
│  │     src/ (Frontend)  │     │   model/ (Python Research)       │  │
│  │                      │     │                                  │  │
│  │  ┌────────────────┐  │     │  ┌──────────┐  ┌──────────────┐  │  │
│  │  │ useLocation    │  │     │  │  MLP     │  │  Transformer │  │  │
│  │  │ Tracker Hook   │──┼────▶│  │  (Exp 2) │  │  (Exp 1)     │  │  │
│  │  └────────────────┘  │     │  │79,636 prm│  │ 94,084 prm   │  │  │
│  │         │            │     │  │0.141m med│  │ 0.089m med   │  │  │
│  │  ┌────────────────┐  │     │  └──────────┘  └──────────────┘  │  │
│  │  │ Components     │  │     │  ┌──────────┐  ┌──────────────┐  │  │
│  │  │  - MapView     │  │     │  │ dataset  │  │   train.py   │  │  │
│  │  │  - Telemetry   │  │     │  │ .py      │  │  .py         │  │  │
│  │  │  - Waveform    │  │     │  └──────────┘  └──────────────┘  │  │
│  │  │  - Simulator   │  │     │                                  │  │
│  │  │  - AIModel     │  │     │  public/models/                  │  │
│  │  └────────────────┘  │     │  ├── inertial_mlp.onnx           │  │
│  │         │            │     │  └── inertial_transformer.onnx   │  │
│  │  ┌────────────────┐  │     └──────────────────────────────────┘  │
│  │  │  Services      │  │                                          │
│  │  │  - pdrEngine   │  │     ┌──────────────────────────────┐     │  │
│  │  │  - aiInertial  │  │     │   ONNX Runtime (Browser)     │     │  │
│  │  │    Engine      │  │     │  WebGPU (preferred)          │     │  │
│  │  └────────────────┘  │     │  WASM SIMD (fallback)        │     │  │
│  │         │            │     └──────────────────────────────┘     │  │
│  │  ┌────────────────┐  │                                          │
│  │  │  Utilities     │  │     ┌──────────────────────────────┐     │  │
│  │  │  - filter.ts   │  │     │   Gaussian 6-DOF IMU         │     │  │
│  │  │  - geodesy.ts  │  │     │   Kernel Size: 7, σ: 1.2     │     │  │
│  │  │  - orientation │  │     └──────────────────────────────┘     │  │
│  │  └────────────────┘  │                                          │
│  └──────────────────────┘     └──────────────────────────────────┘  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         Data Flow (5-Step Pipeline)                  │
│                                                                     │
│  Step 1: Record → Step 2: Gaussian Smooth → Step 3: Display        │
│  → Step 4: ONNX Inference (ZUPT Gate) → Step 5: Geodesy Plot       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The 5-Step Tracking Pipeline

Every sensor sample flows through this deterministic pipeline in the `pdrEngine.ts` service:

```
Sensor Stream → Gaussian Filter → HUD/Waveform Display → ONNX MLP → Map Plot
```

### Step 1 — Record
The browser's `devicemotion` event provides raw 6-DOF IMU data:
- **Accelerometer**: `ax`, `ay`, `az` (m/s², includes gravity via `accelerationIncludingGravity`)
- **Gyroscope**: `gx`, `gy`, `gz` (°/s angular velocity)

> On mobile, `accelerationIncludingGravity` is preferred to match the physical IMU standard. If only `acceleration` is available, 9.81 m/s² is synthesized into the Z-axis.

### Step 2 — Gaussian Smoothing
A 6-DOF Gaussian filter (`GaussianIMUFilter6D` in `src/utils/filter.ts`) convolves each axis independently with a discrete Gaussian kernel:

```
G(x) = (1 / (σ √(2π))) · exp(−x² / (2σ²))
```

| Parameter | Value |
|-----------|-------|
| Kernel Size | 7 |
| Sigma (σ) | 1.2 |
| Channels | ax, ay, az, gx, gy, gz (independent) |

This suppresses high-frequency sensor noise while preserving gait dynamics.

### Step 3 — Display
Smoothed samples are pushed into a rolling buffer (`maxMotionSamples = 80`) and rendered in real-time:
- **`SensorWaveform`**: Canvas plots for acceleration magnitude, step triggers, pitch, and roll
- **`TelemetryPanel`**: Live HUD showing position, heading, speed, and ONNX output
- **`AIModelStatusPanel`**: Inference latency, displacement vector, and ZUPT badge

### Step 4 — ONNX Inference (ZUPT Gate)
The `aiInertialEngine.ts` service maintains a rolling buffer of 20 samples (2.0 seconds at 10 Hz) and performs inference every 200 ms (5 Hz):

```
Input:  T=20 sequence × 6 features = 120-dimensional vector
Output: [dx, dy, speed_mps, turn_delta_rad]
```

**ZUPT (Zero-Velocity Update) Anti-Drift Gate:**

Before inference, the engine computes acceleration variance and average gyroscope magnitude. If the device is stationary (`variance < 0.05` AND `avg_gyro_deg < 1.8`), all odometry outputs are zeroed — preventing drift during standing pauses.

### Step 5 — Geodesy Plot
Step displacement (`d`) and bearing (`θ`) are converted to Earth coordinates using **direct spherical geodesy**:

```
φ₂ = arcsin(sin φ₁ · cos(d/R) + cos φ₁ · sin(d/R) · cos θ)
λ₂ = λ₁ + arctan2(sin θ · sin(d/R) · cos φ₁, cos(d/R) − sin φ₁ · sin φ₂)
```

Where `R = 6,371,000 m` (WGS-84 mean Earth radius). The new position is plotted on the Leaflet map with dual-color paths:
- **Sky blue (#38bdf8)**: GPS trajectory
- **Vibrant indigo (#818cf8)**: AI/Transformer odometry trajectory

---

## Mathematical Foundation

### Weinberg Step Length Estimation

The biomechanical fourth-root acceleration equation (Weinberg, 2002):

$$SL = K \cdot \sqrt[4]{a_{\max} - a_{\min}}$$

Where:
- `SL` = step length (meters)
- `K` = calibrated gait constant (tunable in the calibration modal)
- `a_max`, `a_min` = peak vertical accelerations during foot-strike and stance phases

### Gyro-Compass Complementary Filter

Fuses gyroscope rotation rate with tilt-compensated compass heading to prevent jitter and gyro drift:

$$\theta_{t} = \alpha \cdot (\theta_{t-1} + \omega_z \cdot \Delta t) + (1 - \alpha) \cdot \theta_{\text{compass}}$$

Where:
- `α` = complementary filter weight (tunable)
- `ω_z` = Z-axis gyroscope rotation rate (rad/s)
- `θ_compass` = tilt-compensated heading from magnetometer/Euler angles

### Spherical Geodesy Translation

Converts step displacement and bearing into exact Earth coordinates:

$$\phi_2 = \arcsin(\sin\phi_1 \cos(d/R) + \cos\phi_1 \sin(d/R) \cos\theta)$$

$$\lambda_2 = \lambda_1 + \arctan2(\sin\theta \sin(d/R) \cos\phi_1, \cos(d/R) - \sin\phi_1 \sin\phi_2)$$

### Robust Compass Heading from W3C Euler Angles

Computes bearing from `alpha` (azimuth), `beta` (pitch), `gamma` (roll):

```javascript
x = −sin(α)·cos(γ) − cos(α)·sin(β)·sin(γ)
y =  cos(α)·cos(γ) − sin(α)·sin(β)·sin(γ)
heading = atan2(x, y)   // normalized to 0°–360°
```

This works correctly across portrait/landscape device orientations.

---

## Machine Learning Models

Two pre-trained ONNX models are shipped with the application for real-time inertial odometry:

### Inertial MLP (Experiment 2 — Active Model)

| Property | Value |
|----------|-------|
| **Architecture** | Dense MLP with ZUPT regularization |
| **Parameters** | 79,636 |
| **Layers** | Linear(120 → 256) → Linear(256 → 128) → Linear(128 → 64) |
| **Activations** | GELU |
| **Normalization** | LayerNorm(120) |
| **Input** | 20-step × 6-DOF IMU sequence (120D float32) |
| **Outputs** | `[dx, dy, speed_mps, turn_delta_rad]` |
| **Training Epochs** | 15 |
| **Training Time** | 282.64 seconds |
| **Best Median Error** | **0.141 m** |
| **Inference Latency** | < 1.0 ms (WebGPU) |
| **Training Dataset** | IO-VNBD |

**Head Structure:**
- **2D Displacement Head**: `[dx, dy]` in meters
- **Instantaneous Speed Head**: `Softplus(Linear(64 → 1))` in m/s
- **Instantaneous Turn Head**: `Linear(64 → 1)` in radians

### IO-Transformer (Experiment 1 — Reference Model)

| Property | Value |
|----------|-------|
| **Architecture** | Self-attention Transformer |
| **Parameters** | 94,084 |
| **Best Median Error** | 0.089 m |
| **Inference Latency** | < 5.0 ms |
| **Output** | Window-aggregated displacement |

### Classical Weinberg PDR (Baseline)

| Property | Value |
|----------|-------|
| **Parameters** | Heuristic (no learned weights) |
| **Median Error** | 0.620 m |
| **Inference Latency** | 0.1 ms |
| **Output** | Cadence-window averaged |

### Key Difference: Instantaneous vs. Averaged

Unlike classical PDR that averages step timestamps over a 10-second cadence window, the **Inertial MLP outputs strictly instantaneous kinematics** per inference step — no rolling mean or lag is introduced into the speed HUD. This is achieved through the `Softplus` activation on the speed head, which guarantees non-negative instantaneous velocity.

---

## Tracking Modes

| Mode | Behavior | Trigger |
|------|----------|---------|
| **`GPS`** | Standard GPS positioning with OpenStreetMap | GPS enabled and locked |
| **`AI_TRANSFORMER`** | ONNX neural odometry only, no GPS | GPS disabled or unavailable |
| **`SEARCHING_GPS`** | Hybrid: GPS + AI backup | Initial acquisition or GPS lost |

**Automatic fallback sequence:**

```
GPS Lock → GPS Lost/Disabled → SEARCHING_GPS → AI_TRANSFORMER (Neural Inertial Active)
                                                              ↑
                                              GPS Re-acquired → returns to GPS mode
```

**Default starting location:** New Delhi, India (28.6139°N, 77.2090°E) — used as a seed until GPS acquires a fix. IP geolocation (`get.geojs.io`, `ipapi.co`) provides a coarse initial position if GPS is unavailable.

---

## Usage Guide

### Mobile (Hardware IMU)

The app uses the device's built-in sensors via the W3C DeviceMotion and DeviceOrientation APIs.

1. **Open on a mobile browser** — navigate to `https://your-server:5173`
2. **Grant permissions** — tap **INIT SENSORS** and allow motion/orientation access (iOS 13+ requires explicit `requestPermission()`)
3. **Acquire GPS** — tap **LOCATE ME** and allow geolocation access
4. **Walk with the device** — the app tracks your movement in real-time
5. **GPS loss handling** — if GPS signal drops, the app automatically continues with neural odometry

**Note:** iOS requires HTTPS for sensor APIs. The Vite dev server uses `@vitejs/plugin-basic-ssl` for self-signed HTTPS.

### Desktop (Built-in Simulator)

Test the full pipeline without physical hardware using the sidebar controls:

1. **INJECT STEP** — Stream a single realistic IMU step sample (ax=0.6, ay=2.2, az=9.81) into the Gaussian + ONNX pipeline
2. **AUTO STREAM** — Toggle continuous IMU motion simulation at 30 Hz with sinusoidal gait patterns and noise
3. **BEARING ORIENTATION** — Use the -15°/+15° buttons, slider, or N/E/S/W compass buttons to rotate heading
4. **RESET PATH** — Clear all trajectory points and counters

The simulator generates realistic 6-DOF streams including gravity, gait acceleration, angular velocity, and random noise.

### Keyboard Controls

| Key | Action |
|-----|--------|
| `W` / `↑` | Inject single IMU step sample |
| `A` / `←` | Turn heading 15° left |
| `D` / `→` | Turn heading 15° right |
| `Space` | Toggle continuous simulator |

> Note: Keys are ignored when focus is on an input or textarea element.

### Map Controls

- **Layers**: Switch between Satellite (ArcGIS), Street (OpenStreetMap), and Dark (CartoDB) tiles
- **Zoom**: Infinite zoom (1x–26x) with smooth animation
- **Auto-follow**: Map follows your position automatically; drag to disable and explore
- **Click map**: Click anywhere to reposition the location pin manually
- **Zoom buttons**: Top-right corner controls with center/locate button

### Sensor Waveform View Modes

The `SensorWaveform` component offers three display modes:

| Mode | Display |
|------|---------|
| **DUAL** | Accelerometer magnitude + Gyroscope 3-axis |
| **ACCEL** | Accelerometer magnitude only (amplitude + filtered + threshold) |
| **GYRO** | Gyroscope X/Pitch, Y/Roll, Z/Yaw angular velocity |

- **Threshold line**: Red dashed line at the peak detection threshold (default 0.25 m/s²)
- **Live telemetry grid**: Raw 6-DOF values + pitch, roll, heading — updated every frame

---

## Code Structure

```
ultra-gps/
├── index.html                     # HTML entry point (dark theme, #root mount)
├── package.json                   # Dependencies and npm scripts
├── vite.config.ts                 # Vite + React + Tailwind + basic-ssl (HTTPS)
├── tsconfig*.json                 # TypeScript configurations
├── .oxlintrc.json                 # Linting rules (React hooks, component exports)
├── .gitignore                     # Excludes node_modules, dist, __pycache__, IDE files
├── README.md                      # This file
├── citation.md                    # Academic references and scientific citations
│
├── src/                           # Main application source
│   ├── main.tsx                   # React 19 entry point
│   ├── App.tsx                    # Root layout: Map + Sidebar panels
│   ├── index.css                  # Global styles (Tailwind directives, dark theme)
│   │
│   ├── types/index.ts             # All TypeScript interfaces
│   │   ├── TrackingMode           # 'GPS' | 'AI_TRANSFORMER' | 'SEARCHING_GPS'
│   │   ├── Coordinates            # lat/lng/altitude/accuracy/speed/heading
│   │   ├── HeadingData            # heading, rawHeading, source, pitch, roll, calibrated
│   │   ├── MotionSample           # Full 6-DOF IMU sample with Gaussian-smoothed fields
│   │   ├── NavigationMetrics      # distance, speed, displacement, inference count
│   │   ├── AIInferenceMetrics     # ONNX model status, latency, execution provider
│   │   ├── PathPoint              # lat/lng/timestamp/mode/heading/displacement
│   │   └── SensorStatus           # GPS, IMU, permission, simulation state
│   │
│   ├── hooks/
│   │   └── useLocationTracker.ts  # Central hook: GPS, sensors, simulator, keyboard
│   │       # Subscribes to pdrEngine and aiInertialEngine
│   │       # Manages navigator.geolocation watcher
│   │       # Handles DeviceMotion / DeviceOrientation events
│   │       # Provides simulator and keyboard control callbacks
│   │
│   ├── services/
│   │   ├── pdrEngine.ts           # TrackerEngine: 5-step PDR pipeline
│   │   │   # processDeviceMotion() — main entry for sensor data
│   │   │   # updateGpsPosition() — GPS coordinate updates
│   │   │   # updateOrientation() — heading from Euler angles
│   │   │   # handleOnnxOdometryUpdate() — Step 5: plot ONNX displacement
│   │   │   # injectSimulatedSample() — desktop simulator injection
│   │   │
│   │   └── aiInertialEngine.ts    # AIInertialEngine: ONNX MLP inference
│   │       # initializeModel() — loads ONNX model via WebGPU/WASM
│   │       # processSensorSample() — Steps 1,2,4: record, smooth, infer
│   │       # runInference() — ZUPT gate + ONNX session.run()
│   │       # ZUPT detection: variance < 0.05 && avg_gyro < 1.8°/s
│   │
│   ├── components/
│   │   ├── Header.tsx             # Top nav: logo, AI status badge, Locate Me, Sensors, AI Architecture
│   │   ├── MapView.tsx            # Leaflet map: marker, paths, layers, zoom controls
│   │   │   # Three tile layers: Satellite, Street, Dark
│   │   │   # Dual-color polylines: GPS (sky blue) vs AI (indigo dashed)
│   │   │   # Rotating heading beam + center dot marker
│   │   │   # Zoom level overlay, multi-track legend
│   │   │
│   │   ├── TelemetryPanel.tsx     # HUD: mode pill, sensor health, 4-metric grid
│   │   │   # Position (lat/lng), Heading (degrees + cardinal), ONNX output, Distance/Speed
│   │   │   # GPS toggle button, sensor permission button
│   │   │
│   │   ├── SensorWaveform.tsx     # Canvas waveform: accel magnitude + gyro 3-axis
│   │   │   # View mode switcher (DUAL / ACCEL / GYRO)
│   │   │   # 6-DOF real-time telemetry grid
│   │   │
│   │   ├── SimulatorControls.tsx  # Desktop simulator: inject, auto-stream, heading, reset
│   │   │   # Turn buttons (-15°/+15°), heading slider, N/E/S/W compass buttons
│   │   │
│   │   ├── AIModelStatusPanel.tsx # ONNX model telemetry: provider, latency, metrics
│   │   │   # ZUPT static badge, execution provider badge (WebGPU/WASM)
│   │   │   # 4-metric grid: Inst Vector, Inst Speed, Inst Turn, Inference Count
│   │   │
│   │   └── AIArchitectureModal.tsx # Modal: MLP architecture diagram, benchmark table
│   │       # MLP vs Transformer vs Weinberg comparison
│   │       # Strictly instantaneous kinematics explanation
│   │
│   └── utils/
│       ├── filter.ts              # GaussianIMUFilter6D + GaussianFilter1D
│       │   # 1D Gaussian convolution with normalized kernel
│       │   # Independent filters per IMU axis
│       │
│       ├── geodesy.ts             # Spherical Earth math
│       │   # calculateDestinationPoint() — direct geodesy
│       │   # calculateHaversineDistance() — great-circle distance
│       │   # WGS-84: R = 6,371,000 m
│       │
│       └── orientation.ts         # Compass heading calculations
│           # computeRobustCompassHeading() — W3C Euler angles
│           # normalizeDegrees() — 0–360° normalization
│           # angularDifference() — signed angular delta
│
├── public/                        # Static assets served by Vite
│   ├── favicon.svg                # App favicon
│   ├── icons.svg                  # Icon sprite
│   └── models/
│       ├── inertial_mlp.onnx      # Exp 2: Dense MLP (79,636 params)
│       └── inertial_transformer.onnx # Exp 1: Transformer (94,084 params)
│
└── model/                         # Python research code (training, dataset, experiments)
    └── research/
        ├── dataset.py             # PyTorch dataset loader for IO-VNBD
        ├── train.py               # Transformer training script
        ├── train_mlp.py           # MLP training script with ZUPT regularization
        ├── transformer_model.py   # IO-Transformer architecture
        ├── mlp_model.py           # Dense MLP architecture
        ├── export_onnx.py         # Export Transformer to ONNX
        ├── export_mlp_onnx.py     # Export MLP to ONNX
        ├── data/raw/              # 100+ CSV files of IMU recordings
        │   # S-* = Straight walking, V-* = Variable speed, turns
        ├── experiments/
        │   ├── exp_1/             # Transformer experiment
        │   │   ├── best_transformer.pt
        │   │   ├── results/inertial_transformer.onnx
        │   │   └── results/training_metrics.json
        │   └── exp_2/             # MLP experiment (active model)
        │       ├── best_mlp.pt
        │       ├── results/inertial_mlp.onnx
        │       └── results/training_metrics.json
        └── experiments/exp_1/README.md  # Transformer experiment notes
```

---

## Research & Training

The Python research code in `model/research/` is where the ONNX models are trained and exported.

### Dataset

The **IO-VNBD** (Inertial and Odometry Vehicle Navigation Benchmark) dataset provides labeled 6-DOF IMU recordings with ground-truth displacement. Data files are stored as CSV in `model/research/data/raw/` with prefixes indicating activity:

| Prefix | Activity |
|--------|----------|
| `S-*` | Straight walking |
| `V-*` | Variable speed walking |
| `S-S*`, `S-V*` | Straight/variable with turns |

### Training

```bash
# Train the Transformer model
python model/research/train.py

# Train the MLP model (with ZUPT regularization)
python model/research/train_mlp.py

# Export to ONNX format for browser inference
python model/research/export_onnx.py       # Transformer
python model/research/export_mlp_onnx.py   # MLP
```

### Benchmark Results (IO-VNBD Dataset)

| Model | Parameters | Median Error | Latency (WebGPU) | Output Type |
|-------|-----------|-------------|------------------|-------------|
| **MLP (Exp 2)** | 79,636 | **0.141 m** | < 1.0 ms | Instantaneous |
| **Transformer (Exp 1)** | 94,084 | **0.089 m** | < 5.0 ms | Window-Averaged |
| **Weinberg PDR** | Heuristic | 0.620 m | 0.1 ms | Cadence-Window |

The MLP achieves **4.4× better accuracy** than classical Weinberg PDR and produces **instantaneous** velocity/turn outputs (no rolling average lag).

---

## Deployment

### Development

```bash
npm run dev        # Starts Vite dev server on https://localhost:5173
```

The dev server uses `@vitejs/plugin-basic-ssl` for automatic HTTPS — required for sensor APIs on mobile browsers.

### Production Build

```bash
npm run build      # TypeScript check + Vite production build
```

This outputs a `dist/` directory containing:
- Bundled and tree-shaken JavaScript/CSS
- Minified assets with content hashing
- Copied `public/` assets (models, icons, favicon)

### Hosting Requirements

| Requirement | Details |
|-------------|---------|
| **HTTPS** | Required for `navigator.geolocation`, `DeviceMotionEvent`, and `DeviceOrientationEvent` |
| **Static file serving** | The `public/models/` directory must be served alongside the app |
| **MIME types** | `.onnx` files must be served with `application/onnx` or `application/octet-stream` |
| **Node.js** | 20+ recommended for Vite 8 compatibility |

### Example Deployment Targets

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**GitHub Pages** (requires `vite-build` with `base: '/repo-name/'` in `vite.config.ts`):
```bash
npm run build
# Deploy dist/ contents to gh-pages branch
```

**Self-hosted (Nginx example):**
```nginx
server {
    listen 443 ssl;
    server_name ultra-gps.example.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/ultra-gps/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # ONNX models need correct MIME type
    location /models/ {
        alias /var/www/ultra-gps/public/models/;
        add_header Content-Type application/octet-stream;
    }
}
```

### Docker (Optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY public/models /usr/share/nginx/html/models
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
```

---

## Troubleshooting

### Common Issues and Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| **WebGPU not available** | Browser/device lacks WebGPU support | Falls back to WASM SIMD automatically. Ensure Chrome 113+ or Edge 113+ |
| **Model loading failed** | ONNX fetch blocked or MIME type wrong | Check browser Network tab for `/models/inertial_mlp.onnx` response. Verify server serves `.onnx` files |
| **"Compiling Shaders..."** | WebGPU shader compilation in progress | Wait 5–10 seconds on first load; subsequent visits use cached compilation |
| **Sensors not available** | Desktop browser lacks IMU hardware | Use **AUTO STREAM** simulator button or press `W`/`Space` keys |
| **GPS unavailable** | No GPS hardware or permission denied | IP geolocation seeds an approximate location; neural odometry continues navigation |
| **iOS sensor permission denied** | iOS 13+ requires explicit `requestPermission()` | Tap **INIT SENSORS** button — this triggers the iOS permission prompt |
| **Map tiles not loading** | Network restriction or CORS | Verify internet access; try switching to Dark or Street tile layer |
| **Path not updating** | Tracker state not notifying | Check `useLocationTracker` subscriptions; `notify()` fires on every state change |
| **Simulator not running** | Interval not created or already running | Toggle **AUTO STREAM** off, then back on |
| **ZUPT locked when moving** | Low motion variance + low gyro | Increase walking intensity or check if device is handheld vs pocketed |
| **Build fails** | TypeScript or lint error | Run `npm run build` to see detailed errors; fix according to `tsconfig` |

### Browser Support Matrix

| Browser | WebGPU | Sensors (IMU) | Geolocation | Min Version |
|---------|--------|---------------|-------------|-------------|
| **Chrome** | ✅ | ✅ | ✅ | 113+ |
| **Edge** | ✅ | ✅ | ✅ | 113+ |
| **Firefox** | ❌ (WASM fallback) | ✅ | ✅ | Latest |
| **Safari** | ❌ (WASM fallback) | ✅ (iOS 13+ permission) | ✅ | iOS 13+, macOS Sonoma+ |
| **Samsung Internet** | ✅ | ✅ | ✅ | Latest |

### Debugging Tips

- Open browser DevTools (F12) → Console tab to see inference warnings and sensor errors
- Check `Network` tab to verify ONNX model loads successfully
- The `SensorStatus` object tracks `gpsStatusText`, `hasHardwareMotion`, and `permissionGranted` for diagnostics
- `AIInferenceMetrics.executionProvider` shows `webgpu`, `wasm`, `failed`, or `initializing`

---

## Citations

This project implements algorithms from the following foundational research:

### 1. Weinberg Step Length Estimation (2002)

> Weinberg, H. (2002). *Using the ADXL202 in Pedometer and Personal Navigation Applications*. Analog Devices Application Note, AN-602, 1-6.
>
> **Key contribution**: Non-linear biomechanical fourth-root acceleration step length equation: `SL = K · (a_max − a_min)^(1/4)`

### 2. Zero Velocity Update (ZUPT) (2005)

> Foxlin, E. (2005). *Pedestrian Tracking with Shoe-Mounted Inertial Sensors*. IEEE Computer Graphics and Applications, 25(6), 38–46. https://doi.org/10.1109/MCG.2005.140
>
> **Key contribution**: Formalized ZUPT technique for INS — detecting stationary stance phases eliminates cubic position drift in accelerometer integration.

### 3. Step-and-Heading PDR Survey (2013)

> Harle, R. (2013). *A Survey of Indoor Inertial Positioning Systems for Pedestrians*. IEEE Communications Surveys & Tutorials, 15(3), 1281–1293. https://doi.org/10.1109/SURV.2012.121912.00075
>
> **Key contribution**: Defined the comprehensive framework for SH-PDR including gravity decoupling, gyro-compass fusion, and orientation-invariant signal filtering.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Install dependencies**: `npm install`
4. **Run dev server**: `npm run dev` to test changes locally
5. **Lint before committing**: `npm run lint` (oxlint)
6. **Build to verify**: `npm run build`
7. **Commit**: `git commit -m "feat: description of change"`
8. **Push and open a PR**

### Areas for Contribution

- **New ONNX architectures**: Add a model to `model/research/`, train and export to ONNX, then copy to `public/models/`
- **Sensor data**: Contribute CSV recordings to `model/research/data/raw/`
- **UI components**: Add new sidebar panels or map overlays under `src/components/`
- **Filter improvements**: Enhance `src/utils/filter.ts` with additional smoothing options
- **Geodesy precision**: Improve `src/utils/geodesy.ts` with Vincenty or ellipsoidal models
- **Performance**: Optimize inference interval, buffer sizes, or rendering

### Code Style Conventions

- **Language**: TypeScript strict mode
- **Linter**: oxlint with `react/rules-of-hooks` and `react/only-export-components` rules
- **Components**: Function components with React hooks; named exports plus default export where applicable
- **Constants**: Magic numbers extracted to named constants in utilities
- **No emojis**: Clean cyberpunk-technical design with SVG icons only

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with React 19, Vite 8, Tailwind CSS v4, Leaflet, and onnxruntime-web*
