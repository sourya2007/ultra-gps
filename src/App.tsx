import React, { useState } from 'react';
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
import { useBreakpoint } from './hooks/useBreakpoint';
import { DesktopShell } from './components/DesktopShell';
import { Icon } from './components/Icon';
import { MapNavigationDesktop } from './components/MapNavigationDesktop';
import { TelemetryAnalysisDesktop } from './components/TelemetryAnalysisDesktop';
import { SignalAnalysisDesktop } from './components/SignalAnalysisDesktop';
import { RoutePlanningDesktop } from './components/RoutePlanningDesktop';
import { FusionHealthDesktop } from './components/FusionHealthDesktop';
import { AILabDesktop } from './components/AILabDesktop';
import { SettingsDesktop } from './components/SettingsDesktop';
import { CalibrationDesktop } from './components/CalibrationDesktop';
import { useTheme } from './context/ThemeContext';
import { calculateWaypointInfo } from './utils/geodesy';
import type {
  Coordinates,
  HeadingData,
  MapLayerType,
  NavigationMetrics,
  SensorStatus,
  TrackingMode,
  PathPoint,
  Waypoint,
} from './types';
import type { AIInferenceMetrics } from './types';

// Map the dock tab (mobile) to the sidebar key (desktop).
type SidebarKey = 'map' | 'route' | 'telemetry' | 'analysis' | 'fusion' | 'ai-lab' | 'calibration' | 'settings';

export type ActiveTab =
  | 'map'
  | 'route'
  | 'data'
  | 'fusion'
  | 'ai-lab'
  | 'stats'
  | 'calibration';

const DOCK_TO_SIDEBAR: Record<ActiveTab, SidebarKey> = {
  map: 'map',
  route: 'route',
  data: 'telemetry', // mobile "data" tab = desktop "telemetry"
  fusion: 'fusion',
  'ai-lab': 'ai-lab',
  stats: 'analysis', // mobile "stats" tab = desktop "analysis"
  calibration: 'calibration',
};
const SIDEBAR_TO_DOCK: Record<SidebarKey, ActiveTab> = {
  map: 'map',
  route: 'route',
  telemetry: 'data',
  analysis: 'stats',
  fusion: 'fusion',
  'ai-lab': 'ai-lab',
  calibration: 'calibration',
  settings: 'map', // settings opens a panel (not a dock tab) on mobile
};

const PAGE_TITLE: Record<ActiveTab, string> = {
  map: 'Map',
  route: 'Route',
  data: 'Telemetry',
  fusion: 'Fusion',
  'ai-lab': 'AI Lab',
  stats: 'Analysis',
  calibration: 'Calibration',
};

const DOCK_HEIGHT = 64;

interface MapBlockProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  waypoints?: Waypoint[];
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
  waypoints,
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
      waypoints={waypoints}
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

  const { isDark, toggleTheme } = useTheme();

  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  const bp = useBreakpoint();
  const isDesktop = bp === 'desktop';
  const isTablet = bp === 'tablet';
  const isDesktopOrTablet = isDesktop || isTablet;

  // Mobile/tablet only: opens the dock analysis panel on desktop for the stats tab
  const isAnalysisPanelOpen = activeTab === 'stats' && isDesktop;

  const handleDockTabChange = (tab: DockTab) => {
    if (tab === 'stats' && isDesktop) {
      setActiveTab((prev) => (prev === 'stats' ? 'map' : 'stats'));
      return;
    }
    setActiveTab(tab);
  };

  const addWaypoint = (label: string, lat?: number, lng?: number) => {
    const location = state.currentLocation;
    const newWaypoint: Waypoint = {
      id: crypto.randomUUID(),
      label,
      latitude: lat ?? location.latitude,
      longitude: lng ?? location.longitude,
    };
    setWaypoints((prev) => [...prev, newWaypoint]);
  };

  const removeWaypoint = (id: string) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
  };

  const calculateRouteInfo = () => {
    if (!state.currentLocation || waypoints.length === 0) return null;
    const current = state.currentLocation;
    const firstWaypoint = waypoints[0];
    const { distanceMeters, bearingDegrees, etaMinutes } = calculateWaypointInfo(
      current.latitude,
      current.longitude,
      firstWaypoint.latitude,
      firstWaypoint.longitude,
      state.navigationMetrics.currentSpeedMps
    );
    return {
      distanceKm: Number((distanceMeters / 1000).toFixed(2)),
      bearing: Number(bearingDegrees.toFixed(0)),
      etaMinutes,
      waypoint: firstWaypoint,
    };
  };

  const handleSidebarSelect = (key: SidebarKey) => {
    if (key === 'settings') {
      setIsSettingsOpen(true);
      return;
    }
    setActiveTab(SIDEBAR_TO_DOCK[key]);
  };

  const mapProps: MapBlockProps = {
    location: state.currentLocation,
    heading: state.headingData.heading,
    mode: state.mode,
    path: state.pathHistory,
    waypoints,
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

  const isAccelDrifting = (() => {
    const samples = state.recentMotion;
    if (!samples || samples.length < 10) return false;
    const lastN = samples.slice(-20);
    const mean =
      lastN.reduce((s, m) => s + m.filteredMagnitude, 0) / Math.max(lastN.length, 1);
    const variance =
      lastN.reduce((s, m) => s + (m.filteredMagnitude - mean) ** 2, 0) /
      Math.max(lastN.length, 1);
    return Math.sqrt(variance) > 0.5;
  })();

  // ------------------------- DESKTOP / TABLET LAYOUT -------------------------
  if (isDesktopOrTablet) {
    const sidebarKey: SidebarKey = DOCK_TO_SIDEBAR[activeTab] ?? 'map';
    const mapBlock = (
      <MapBlock {...mapProps} />
    );

    return (
      <>
        <DesktopShell
          activeKey={sidebarKey}
          onSelect={handleSidebarSelect}
          hasPermissions={sensorStatus.permissionGranted}
          isAiLoaded={aiMetrics.isLoaded}
          onRequestPermissions={requestSensorPermissions}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenArchitecture={() => setIsArchitectureOpen(true)}
        >
          {activeTab === 'map' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <MapNavigationDesktop
                  {...mapProps}
                  headingData={telemetryProps.headingData}
                  sensorStatus={telemetryProps.sensorStatus}
                  navigationMetricsKmh={state.navigationMetrics.currentSpeedKmh}
                  gpsEnabled={telemetryProps.gpsEnabled}
                  toggleGps={telemetryProps.toggleGps}
                  requestSensorPermissions={telemetryProps.requestSensorPermissions}
                />
              ) : (
                // Tablet: split pane — map + small right rail
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: 'minmax(0, 1fr) 360px',
                    gap: 12,
                    padding: 16,
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <div style={{ minHeight: 0 }}>{mapBlock}</div>
                  <div
                    className="flex flex-col"
                    style={{ gap: 12, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}
                  >
                    <TelemetryBlock {...telemetryProps} />
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
              )}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <TelemetryAnalysisDesktop
                  recentMotion={state.recentMotion}
                  navigationMetrics={state.navigationMetrics}
                  sensorStatus={sensorStatus}
                  aiMetrics={aiMetrics}
                  location={state.currentLocation}
                  headingData={state.headingData}
                />
              ) : (
                // Tablet: IMU + quick telemetry
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: 'minmax(0, 1fr) 360px',
                    gap: 12,
                    padding: 16,
                    height: '100%',
                  }}
                >
                  <SensorWaveform recentMotion={state.recentMotion} peakThreshold={0.25} />
                  <div
                    className="flex flex-col"
                    style={{ gap: 12, minHeight: 0, overflowY: 'auto' }}
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
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <SignalAnalysisDesktop
                  sensorStatus={sensorStatus}
                  location={state.currentLocation}
                  recentMotion={state.recentMotion}
                />
              ) : (
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    padding: 16,
                  }}
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
              )}
            </div>
          )}

          {activeTab === 'route' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <RoutePlanningDesktop
                  {...mapProps}
                  waypoints={waypoints}
                  onAddWaypoint={addWaypoint}
                  onRemoveWaypoint={removeWaypoint}
                  routeInfo={calculateRouteInfo()}
                />
              ) : (
                <div style={{ padding: 16 }}>
                  <RoutePlanning
                    currentLocation={state.currentLocation}
                    waypoints={waypoints}
                    onAddWaypoint={addWaypoint}
                    onRemoveWaypoint={removeWaypoint}
                    routeInfo={calculateRouteInfo()}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'fusion' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <FusionHealthDesktop
                  sensorStatus={sensorStatus}
                  navigationMetrics={state.navigationMetrics}
                  headingData={state.headingData}
                  aiMetrics={aiMetrics}
                  recentMotion={state.recentMotion}
                />
              ) : (
                <div style={{ padding: 16 }}>
                  <FusionHealth />
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-lab' && (
            <div className="w-full h-full">
              {isDesktop ? (
                <AILabDesktop
                  onOpenArchitecture={() => setIsArchitectureOpen(true)}
                  aiMetrics={aiMetrics}
                  recentMotion={state.recentMotion}
                  navigationMetrics={state.navigationMetrics}
                  sensorStatus={sensorStatus}
                />
              ) : (
                <div style={{ padding: 16 }}>
                  <AILab />
                </div>
              )}
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="w-full h-full">
              <CalibrationDesktop
                sensorStatus={sensorStatus}
                headingData={state.headingData}
                recentMotion={state.recentMotion}
                onResetSensors={resetTracking}
                onConfirmAlignment={() => setActiveTab('map')}
              />
            </div>
          )}
        </DesktopShell>

        {/* Desktop: Settings opens as fullscreen overlay (use the desktop layout) */}
        {isDesktop && isSettingsOpen && (
          <div
            className="fixed inset-0 z-[1000] overflow-auto"
            style={{ background: 'var(--color-bg-primary)' }}
          >
            <div className="flex items-center justify-between" style={{ padding: 24 }}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="flex items-center"
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Icon name="arrow_back" size={18} />
                Back
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center"
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Icon name={isDark ? 'light_mode' : 'dark_mode'} size={18} />
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            <SettingsDesktop
              onToggleTheme={toggleTheme}
              sensorStatus={sensorStatus}
              headingData={state.headingData}
              navigationMetrics={state.navigationMetrics}
              aiMetrics={aiMetrics}
            />
            <div
              className="flex justify-center"
              style={{ padding: '0 32px 32px 32px' }}
            >
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  background: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
              >
                Close Settings
              </button>
            </div>
          </div>
        )}

        {/* Mobile/tablet: use the original panel (it's already full-screen modal) */}
        {!isDesktop && (
          <SettingsPanel
            open={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            sensorStatus={sensorStatus}
            headingData={state.headingData}
            activeMapLayer={mapLayer}
            onChangeMapLayer={setMapLayer}
            isAccelDrifting={isAccelDrifting}
          />
        )}

        <AIArchitectureModal
          isOpen={isArchitectureOpen}
          onClose={() => setIsArchitectureOpen(false)}
        />
      </>
    );
  }

  // ------------------------- MOBILE LAYOUT (unchanged) -------------------------
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
            <div
              className="h-[min(36vh,320px)] flex-none md:flex-1 md:min-h-0 md:h-full"
            >
              <MapBlock {...mapProps} />
            </div>

            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide flex flex-col gap-3"
            >
              <TelemetryBlock {...telemetryProps} />
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

        {activeTab === 'data' && (
          <div
            className="flex flex-col gap-3 px-4 pb-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       md:h-full md:overflow-hidden"
          >
            <div
              className="flex flex-col gap-3 md:min-h-0 md:h-full md:overflow-y-auto scrollbar-hide"
            >
              <div className="h-[min(28vh,260px)] flex-none md:flex-none md:h-[min(34vh,360px)]">
                <MapBlock {...mapProps} />
              </div>
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

            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide flex flex-col gap-3"
            >
              <SensorWaveform
                recentMotion={state.recentMotion}
                peakThreshold={0.25}
              />
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

        {activeTab === 'stats' && (
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

        {activeTab === 'route' && (
          <div className="px-4 pb-4 md:p-5">
            <RoutePlanning currentLocation={state.currentLocation} waypoints={waypoints} onAddWaypoint={addWaypoint} onRemoveWaypoint={removeWaypoint} routeInfo={calculateRouteInfo()} />
          </div>
        )}

        {activeTab === 'fusion' && (
          <div className="px-4 pb-4 md:p-5">
            <FusionHealth />
          </div>
        )}

        {activeTab === 'ai-lab' && (
          <div className="px-4 pb-4 md:p-5">
            <AILab />
          </div>
        )}

        {activeTab === 'calibration' && (
          <div className="w-full h-full" style={{ padding: 16, overflowY: 'auto' }}>
            <CalibrationDesktop
              sensorStatus={sensorStatus}
              headingData={state.headingData}
              recentMotion={state.recentMotion}
              onResetSensors={resetTracking}
              onConfirmAlignment={() => setActiveTab('map')}
            />
          </div>
        )}
      </main>

      <MobileDock activeTab={activeTab} onChangeTab={handleDockTabChange} />

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

      <AIArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

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
