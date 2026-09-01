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
import type { Coordinates, HeadingData, NavigationMetrics, SensorStatus, TrackingMode, PathPoint } from './types';
import type { AIInferenceMetrics } from './types';

const PAGE_TITLE: Record<DockTab, string> = {
  map: 'Map',
  telemetry: 'Telemetry',
  analysis: 'Analysis',
};

const DOCK_HEIGHT = 64;

const HEADER_HEIGHT = 64;

interface MapBlockProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  hasReceivedFix: boolean;
  setManualLocation: (lat: number, lng: number) => void;
  acquireCurrentLocation: () => void;
}

const MapBlock: React.FC<MapBlockProps> = ({
  location,
  heading,
  mode,
  path,
  hasReceivedFix,
  setManualLocation,
  acquireCurrentLocation,
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
  const [activeTab, setActiveTab] = useState<DockTab>('map');

  const mapProps: MapBlockProps = {
    location: state.currentLocation,
    heading: state.headingData.heading,
    mode: state.mode,
    path: state.pathHistory,
    hasReceivedFix: state.hasReceivedFix,
    setManualLocation,
    acquireCurrentLocation,
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
      />

      {/* Page content. paddingTop accounts for fixed header; paddingBottom for fixed bottom dock. */}
      <main
        className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden scrollbar-hide"
        style={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: `calc(${DOCK_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
          background: 'var(--color-bg-primary)',
        }}
      >
        {/* MAP page */}
        {activeTab === 'map' && (
          <div
            className="flex flex-col gap-3 p-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-5 lg:p-6
                       md:h-full md:overflow-hidden"
          >
            <div
              className="h-[min(42vh,380px)] md:h-full md:min-h-0"
            >
              <MapBlock {...mapProps} />
            </div>

            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide"
            >
              <TelemetryBlock {...telemetryProps} />
            </div>
          </div>
        )}

        {/* TELEMETRY page */}
        {activeTab === 'telemetry' && (
          <div
            className="flex flex-col gap-3 p-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-5 lg:p-6
                       md:h-full md:overflow-hidden"
          >
            <div
              className="flex flex-col gap-3 md:min-h-0 md:h-full md:overflow-y-auto scrollbar-hide"
            >
              <div className="h-[min(34vh,320px)] md:flex-none">
                <MapBlock {...mapProps} />
              </div>
              <CompassDial
                headingData={state.headingData}
                navigationMetrics={state.navigationMetrics}
                sensorStatus={sensorStatus}
              />
            </div>

            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide"
            >
              <TelemetryBlock {...telemetryProps} />
            </div>
          </div>
        )}

        {/* ANALYSIS page */}
        {activeTab === 'analysis' && (
          <div
            className="flex flex-col gap-3 p-4
                       md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-4 md:p-5
                       lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-5 lg:p-6
                       md:h-full md:overflow-hidden"
          >
            <div
              className="md:overflow-y-auto md:pr-1 md:min-h-0 scrollbar-hide"
            >
              <SensorWaveform
                recentMotion={state.recentMotion}
                peakThreshold={0.25}
              />
            </div>

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
      </main>

      {/* Bottom tab bar — visible on all sizes */}
      <MobileDock activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* AI Architecture Modal */}
      <AIArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
};

export default App;