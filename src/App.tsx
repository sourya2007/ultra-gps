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

const PAGE_TITLE: Record<DockTab, string> = {
  map: 'Map',
  telemetry: 'Telemetry',
  analysis: 'Analysis',
};

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

      {/* Page content */}
      <main
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          paddingTop: 64,
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          background: 'var(--color-bg-primary)',
        }}
      >
        {/* MAP page */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-3 p-4">
            <div
              className="w-full rounded-3xl overflow-hidden"
              style={{
                height: 'min(42vh, 360px)',
                background: 'var(--color-canvas-bg)',
                position: 'relative',
                border: '1px solid var(--color-border)',
              }}
            >
              <MapView
                location={state.currentLocation}
                heading={state.headingData.heading}
                mode={state.mode}
                path={state.pathHistory}
                hasReceivedFix={state.hasReceivedFix}
                onSetLocation={setManualLocation}
                onLocateNow={acquireCurrentLocation}
                isSidebarOpen={false}
              />
            </div>

            <TelemetryPanel
              mode={state.mode}
              location={state.currentLocation}
              headingData={state.headingData}
              navigationMetrics={state.navigationMetrics}
              sensorStatus={sensorStatus}
              aiMetrics={aiMetrics}
              gpsEnabled={gpsEnabled}
              onToggleGps={toggleGps}
              onRequestPermissions={requestSensorPermissions}
            />
          </div>
        )}

        {/* TELEMETRY page */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-3 p-4">
            <div
              className="w-full rounded-3xl overflow-hidden"
              style={{
                height: 'min(38vh, 320px)',
                background: 'var(--color-canvas-bg)',
                position: 'relative',
                border: '1px solid var(--color-border)',
              }}
            >
              <MapView
                location={state.currentLocation}
                heading={state.headingData.heading}
                mode={state.mode}
                path={state.pathHistory}
                hasReceivedFix={state.hasReceivedFix}
                onSetLocation={setManualLocation}
                onLocateNow={acquireCurrentLocation}
                isSidebarOpen={false}
              />
            </div>

            <TelemetryPanel
              mode={state.mode}
              location={state.currentLocation}
              headingData={state.headingData}
              navigationMetrics={state.navigationMetrics}
              sensorStatus={sensorStatus}
              aiMetrics={aiMetrics}
              gpsEnabled={gpsEnabled}
              onToggleGps={toggleGps}
              onRequestPermissions={requestSensorPermissions}
            />

            <CompassDial
              headingData={state.headingData}
              navigationMetrics={state.navigationMetrics}
              sensorStatus={sensorStatus}
            />
          </div>
        )}

        {/* ANALYSIS page */}
        {activeTab === 'analysis' && (
          <div className="flex flex-col gap-3 p-4">
            <SensorWaveform
              recentMotion={state.recentMotion}
              peakThreshold={0.25}
            />

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
      </main>

      {/* Bottom tab bar */}
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