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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [dockTab, setDockTab] = useState<DockTab>('telemetry');

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden select-none"
      style={{
        background: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
        fontFamily: "'Google Sans Flex', 'Google Sans Text', 'Google Sans', sans-serif",
        transition: 'background-color 0.35s ease, color 0.35s ease',
      }}
    >
      {/* Top Navigation Header */}
      <Header
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onRequestPermissions={requestSensorPermissions}
        onLocateNow={acquireCurrentLocation}
        hasPermissions={sensorStatus.permissionGranted}
        isAiLoaded={aiMetrics.isLoaded}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:block relative overflow-y-auto lg:overflow-hidden bg-[var(--color-bg-tertiary)] lg:bg-transparent scrollbar-hide">
        {/* Map View Section */}
        <div className="w-full h-[42vh] lg:h-full lg:absolute lg:inset-0 z-0 flex-shrink-0 p-3 pb-0 lg:p-0">
          <div className="w-full h-full rounded-3xl lg:rounded-none overflow-hidden shadow-sm lg:shadow-none relative">
            <MapView
              location={state.currentLocation}
              heading={state.headingData.heading}
              mode={state.mode}
              path={state.pathHistory}
              hasReceivedFix={state.hasReceivedFix}
              onSetLocation={setManualLocation}
              onLocateNow={acquireCurrentLocation}
              isSidebarOpen={isSidebarOpen}
            />
          </div>
        </div>

        {/* Sidebar / Mobile Bento Grid */}
        <div
          className={`
            w-full flex flex-col gap-3 p-4 pt-3 z-10
            lg:surface-glass lg:absolute lg:top-4 lg:bottom-4 lg:left-4 lg:w-96 lg:max-w-[calc(100vw-32px)] lg:overflow-y-auto lg:transition-all lg:duration-300 lg:ease-[cubic-bezier(0.2,0,0,1)] scrollbar-hide
            ${
              isSidebarOpen
                ? 'lg:translate-x-0 lg:opacity-100 lg:pointer-events-auto'
                : 'lg:-translate-x-[120%] lg:opacity-0 lg:pointer-events-none'
            }
          `}
        >
          <div className="hidden lg:block">
            <AIModelStatusPanel
              aiMetrics={aiMetrics}
              onOpenArchitecture={() => setIsArchitectureOpen(true)}
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

          <SensorWaveform
            recentMotion={state.recentMotion}
            peakThreshold={0.25}
          />

          <div className="hidden lg:block">
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
      </div>

      {/* Mobile-only bottom dock with the rest of the panels */}
      <MobileDock
        isOpen={isDockOpen}
        activeTab={dockTab}
        onChangeTab={setDockTab}
        onToggleOpen={() => setIsDockOpen((v) => !v)}
        onClose={() => setIsDockOpen(false)}
      >
        {dockTab === 'ai' && (
          <AIModelStatusPanel
            aiMetrics={aiMetrics}
            onOpenArchitecture={() => setIsArchitectureOpen(true)}
          />
        )}
        {dockTab === 'telemetry' && (
          <CompassDial
            headingData={state.headingData}
            navigationMetrics={state.navigationMetrics}
            sensorStatus={sensorStatus}
          />
        )}
        {dockTab === 'sim' && (
          <SimulatorControls
            isSimulating={sensorStatus.isSimulating}
            currentHeading={state.headingData.heading}
            onInjectSample={injectSample}
            onToggleSimulator={toggleMotionSimulator}
            onSetHeading={setManualHeading}
            onResetTracking={resetTracking}
          />
        )}
      </MobileDock>

      {/* AI Architecture Modal */}
      <AIArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
};

export default App;
