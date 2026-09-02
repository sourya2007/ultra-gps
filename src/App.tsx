import React, { useEffect, useState } from 'react';
import { useLocationTracker } from './hooks/useLocationTracker';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { TelemetryPanel } from './components/TelemetryPanel';
import { AIModelStatusPanel } from './components/AIModelStatusPanel';
import { SensorWaveform } from './components/SensorWaveform';
import { SimulatorControls } from './components/SimulatorControls';
import { AIArchitectureModal } from './components/AIArchitectureModal';
import { MobileDock, type DockTab } from './components/MobileDock';
import { CompassDial } from './components/CompassDial';
import { DockAnalysisPanel } from './components/DockAnalysisPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { RoutePlanning } from './components/RoutePlanning';
import { FusionHealth } from './components/FusionHealth';
import { AILab } from './components/AILab';
import type {
  Coordinates,
  HeadingData,
  MapLayerType,
  NavigationMetrics,
  SensorStatus,
  TrackingMode,
  PathPoint,
} from './types';
import type { AIInferenceMetrics } from './types';

const PAGE_TITLE: Record<DockTab, string> = {
  map: 'Map',
  route: 'Route',
  data: 'Data',
  fusion: 'Fusion',
  'ai-lab': 'AI Lab',
  stats: 'Stats',
};

const DOCK_HEIGHT = 64;

interface MapBlockProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  hasReceivedFix: boolean;
  setManualLocation: (lat: number, lng: number) => void;
  acquireCurrentLocation: () => void;
  activeLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
}

const MapBlock: React.FC<MapBlockProps> = ({
  location,
  heading,
  mode,
  path,
  hasReceivedFix,
  setManualLocation,
  acquireCurrentLocation,
  activeLayer,
  onChangeLayer,
}) => (
  <div
    className="w-full h-full rounded-3xl md:rounded-2xl overflow-hidden"
    style={{
      background: 'var(--color-canvas-bg)',
      position: 'relative',
      border: '1px solid var(--color-border)',
      minHeight: 0,
    }}
  >
    <MapView
      location={location}
      heading={heading}
      mode={mode}
      path={path}
      hasReceivedFix={hasReceivedFix}
      onSetLocation={setManualLocation}
      onLocateNow={acquireCurrentLocation}
      isSidebarOpen={false}
      activeLayer={activeLayer}
      onChangeLayer={onChangeLayer}
    />
  </div>
);

interface TelemetryProps {
  mode: TrackingMode;
  location: Coordinates;
  headingData: HeadingData;
  navigationMetrics: NavigationMetrics;
  sensorStatus: SensorStatus;
  aiMetrics: AIInferenceMetrics;
  gpsEnabled: boolean;
  toggleGps: () => void;
  requestSensorPermissions: () => void;
}

const TelemetryBlock: React.FC<TelemetryProps> = ({
  mode,
  location,
  headingData,
  navigationMetrics,
  sensorStatus,
  aiMetrics,
  gpsEnabled,
  toggleGps,
  requestSensorPermissions,
}) => (
  <TelemetryPanel
    mode={mode}
    location={location}
    headingData={headingData}
    navigationMetrics={navigationMetrics}
    sensorStatus={sensorStatus}
    aiMetrics={aiMetrics}
    gpsEnabled={gpsEnabled}
    onToggleGps={toggleGps}
    onRequestPermissions={requestSensorPermissions}
  />
);

export const App: React.FC = () => {
  const {
    state,
    aiMetrics,
    gpsEnabled,
    sensorStatus,
    toggleGps,
    injectSample,
    toggleMotionSimulator,
    setManualHeading,
    setManualLocation,
    resetTracking,
    requestSensorPermissions,
    acquireCurrentLocation,
  } = useLocationTracker();

  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<DockTab>('map');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');

  // Responsive helper: are we on a desktop-class viewport (lg+, ≥1024px)?
  // The "ANALYSIS" dock button opens a slide-up panel on desktop instead of
  // navigating to a dedicated page (the panel is dock-attached with backdrop blur).
  const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const apply = () => setIsDesktopViewport(mq.matches);
    apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', apply);
      else mq.removeListener(apply);
    };
  }, []);

  // Derived: the slide-up analysis panel is open when the user has selected the
  // STATS tab *and* we're on a desktop-class viewport.
  const isAnalysisPanelOpen = activeTab === 'stats' && isDesktopViewport;

  // Handle dock tab changes — on desktop, STATS toggles the panel;
  // on mobile/tablet it switches pages (page-mode is handled in the render below).
  const handleDockTabChange = (tab: DockTab) => {
    if (tab === 'stats' && isDesktopViewport) {
      setActiveTab((prev) => (prev === 'stats' ? 'map' : 'stats'));
      return;
    }
    setActiveTab(tab);
  };

  const mapProps: MapBlockProps = {
    location: state.currentLocation,
    heading: state.headingData.heading,
    mode: state.mode,
    path: state.pathHistory,
    hasReceivedFix: state.hasReceivedFix,
    setManualLocation,
    acquireCurrentLocation,
    activeLayer: mapLayer,
    onChangeLayer: setMapLayer,
  };

  const telemetryProps: TelemetryProps = {
    mode: state.mode,
    location: state.currentLocation,
    headingData: state.headingData,
    navigationMetrics: state.navigationMetrics,
    sensorStatus,
    aiMetrics,
    gpsEnabled,
    toggleGps,
    requestSensorPermissions,
  };

  // Derive accelerometer "drift" state from the variance of recent motion
  // samples. High short-window variance (relative to a stationary baseline)
  // suggests the sensor hasn't been calibrated or is being affected by
  // high-frequency noise. The SettingsPanel surfaces this as a status row.
  const isAccelDrifting = (() => {
    const samples = state.recentMotion;
    if (!samples || samples.length < 10) return false;
    const lastN = samples.slice(-20);
    const mean =
      lastN.reduce((s, m) => s + m.filteredMagnitude, 0) / Math.max(lastN.length, 1);
    const variance =
      lastN.reduce((s, m) => s + (m.filteredMagnitude - mean) ** 2, 0) /
      Math.max(lastN.length, 1);
    // Drift if std-dev exceeds ~0.5 m/s² (raw accelerometer jitter)
    return Math.sqrt(variance) > 0.5;
  })();

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden select-none"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex', 'Google Sans Text', 'Google Sans', sans-serif",
        transition: 'background-color 0.25s ease, color 0.25s ease',
      }}
    >
      <Header
        pageTitle={PAGE_TITLE[activeTab]}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onRequestPermissions={requestSensorPermissions}
        onLocateNow={acquireCurrentLocation}
        hasPermissions={sensorStatus.permissionGranted}
        isAiLoaded={aiMetrics.isLoaded}
        isSidebarOpen={false}
        onToggleSidebar={undefined}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Page content. The Header is a normal flex child above this <main>
          (NOT position:fixed), so the page already starts directly below
          the 64px header — no extra top padding is needed. The bottom dock
          is fixed-positioned, so we reserve space at the bottom for it. */}
      <main
        className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden scrollbar-hide"
        style={{
          paddingBottom: `calc(${DOCK_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
          background: 'var(--color-bg-primary)',
        }}
      >
        {/* MAP page */}
        {activeTab === 'map' && (
          <div
            className="flex flex-col gap-3 px-4 pb-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-5 lg:p-6
                       md:h-full md:overflow-hidden"
          >
            {/* Left column: map only */}
            <div
              className="h-[min(42vh,380px)] flex-none md:flex-1 md:min-h-0 md:h-full"
            >
              <MapBlock {...mapProps} />
            </div>

            {/* Right column: telemetry bento (top) + compass dial (below) */}
            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide flex flex-col gap-3"
            >
              <TelemetryBlock {...telemetryProps} />
              {/* Compass dial below the bento on desktop */}
              <div className="hidden lg:block">
                <CompassDial
                  fallbackHeading={state.headingData.heading}
                  fallbackSource={state.headingData.source}
                  pitch={state.headingData.pitch}
                  calibrated={state.headingData.calibrated}
                  navigationMetrics={state.navigationMetrics}
                  sensorStatus={sensorStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* DATA page (formerly TELEMETRY) — mobile + tablet only.
            Shows the map + compass dial + IMU signal analysis. Telemetry bento
            (COORDS/SPEED/HEADING/DISTANCE) lives on the MAP page only. */}
        {activeTab === 'data' && (
          <div
            className="flex flex-col gap-3 px-4 pb-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       md:h-full md:overflow-hidden"
          >
            {/* Left column: map + compass on mobile; just the map on tablet */}
            <div
              className="flex flex-col gap-3 md:min-h-0 md:h-full md:overflow-y-auto scrollbar-hide"
            >
              <div className="h-[min(34vh,320px)] flex-none md:flex-none md:h-[min(34vh,360px)]">
                <MapBlock {...mapProps} />
              </div>
              {/* Compass below the map on mobile only — on tablet the IMU panel takes the right rail instead */}
              <div className="md:hidden">
                <CompassDial
                  fallbackHeading={state.headingData.heading}
                  fallbackSource={state.headingData.source}
                  pitch={state.headingData.pitch}
                  calibrated={state.headingData.calibrated}
                  navigationMetrics={state.navigationMetrics}
                  sensorStatus={sensorStatus}
                />
              </div>
            </div>

            {/* Right column: IMU signal analysis on tablet; on mobile it sits below */}
            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide flex flex-col gap-3"
            >
              <SensorWaveform
                recentMotion={state.recentMotion}
                peakThreshold={0.25}
              />
              {/* Compass on tablet (right rail, below IMU) — on mobile the compass is in the left column */}
              <div className="hidden md:block">
                <CompassDial
                  fallbackHeading={state.headingData.heading}
                  fallbackSource={state.headingData.source}
                  pitch={state.headingData.pitch}
                  calibrated={state.headingData.calibrated}
                  navigationMetrics={state.navigationMetrics}
                  sensorStatus={sensorStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* STATS page (formerly ANALYSIS) — only on mobile/tablet; desktop opens the dock panel instead.
            IMU signal analysis lives on the DATA view, so this page just
            shows the AI model status + simulator controls. */}
        {activeTab === 'stats' && !isDesktopViewport && (
          <div
            className="flex flex-col gap-3 px-4 pb-4
                       md:h-full md:overflow-hidden"
          >
            <div
              className="flex flex-col gap-3 md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide"
            >
              <AIModelStatusPanel
                aiMetrics={aiMetrics}
                onOpenArchitecture={() => setIsArchitectureOpen(true)}
              />
              <SimulatorControls
                isSimulating={sensorStatus.isSimulating}
                currentHeading={state.headingData.heading}
                onInjectSample={injectSample}
                onToggleSimulator={toggleMotionSimulator}
                onSetHeading={setManualHeading}
                onResetTracking={resetTracking}
              />
            </div>
          </div>
        )}

        {/* ROUTE page — Route planning UI */}
        {activeTab === 'route' && (
          <div className="px-4 pb-4 md:p-5">
            <RoutePlanning />
          </div>
        )}

        {/* FUSION page — Fusion engine health */}
        {activeTab === 'fusion' && (
          <div className="px-4 pb-4 md:p-5">
            <FusionHealth />
          </div>
        )}

        {/* AI LAB page — AI filter diagnostics */}
        {activeTab === 'ai-lab' && (
          <div className="px-4 pb-4 md:p-5">
            <AILab />
          </div>
        )}
      </main>

      {/* Bottom tab bar — visible on all sizes */}
      <MobileDock activeTab={activeTab} onChangeTab={handleDockTabChange} />

      {/* Desktop-only slide-up analysis panel attached to the dock */}
      <DockAnalysisPanel
        open={isAnalysisPanelOpen}
        onClose={() => setActiveTab('map')}
        recentMotion={state.recentMotion}
        peakThreshold={0.25}
        aiMetrics={aiMetrics}
        navigationMetrics={state.navigationMetrics}
        headingData={state.headingData}
        sensorStatus={sensorStatus}
        isSimulating={sensorStatus.isSimulating}
        currentHeading={state.headingData.heading}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onInjectSample={injectSample}
        onToggleSimulator={toggleMotionSimulator}
        onSetHeading={setManualHeading}
        onResetTracking={resetTracking}
      />

      {/* AI Architecture Modal */}
      <AIArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* System Settings Panel */}
      <SettingsPanel
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sensorStatus={sensorStatus}
        headingData={state.headingData}
        activeMapLayer={mapLayer}
        onChangeMapLayer={setMapLayer}
        isAccelDrifting={isAccelDrifting}
      />
    </div>
  );
};

export default App;