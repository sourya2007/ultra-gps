import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates, MapLayerType, PathPoint, TrackingMode, Waypoint } from '../types';
import { Icon } from './Icon';

interface MapViewProps {
  location: Coordinates;
  heading: number;
  mode: TrackingMode;
  path: PathPoint[];
  waypoints?: Waypoint[];
  hasReceivedFix?: boolean;
  onSetLocation?: (lat: number, lng: number) => void;
  onLocateNow?: () => void;
  isSidebarOpen?: boolean;
  activeLayer?: MapLayerType;
  onChangeLayer?: (layer: MapLayerType) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  location,
  heading,
  mode,
  path,
  waypoints,
  hasReceivedFix = false,
  onSetLocation,
  onLocateNow,
  isSidebarOpen = false,
  activeLayer: controlledLayer,
  onChangeLayer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const gpsPolylineRef = useRef<L.Polyline | null>(null);
  const aiPolylineRef = useRef<L.Polyline | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const autoFollowRef = useRef<boolean>(true);
  const initialCenteredRef = useRef<boolean>(false);
  const prevModeRef = useRef<TrackingMode>(mode);
  const prevHeadingRef = useRef<number>(heading);
  const continuousHeadingRef = useRef<number>(heading);

  const [internalLayer, setInternalLayer] = useState<MapLayerType>('satellite');
  const [currentZoom, setCurrentZoom] = useState<number>(18);
  const activeLayer = controlledLayer ?? internalLayer;

  const CARTO_API_KEY = 'cb1_2q2m_1_e92555c70605d55997b6b223';

  const getTileLayerConfig = (type: MapLayerType): { url: string; options: L.TileLayerOptions } => {
    switch (type) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 26,
            maxNativeZoom: 19,
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
          },
        };
      case 'dark':
        // Dark Matter: full Google-Maps-like dark style with all roads, buildings,
        // POIs, parks, water bodies, and labels rendered in dark theme.
        return {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
          options: {
            maxZoom: 26,
            maxNativeZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          },
        };
      case 'street':
      default:
        // Voyager: full Google-Maps-like light style with roads, buildings, parks,
        // water bodies, POIs, and labels.
        return {
          url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_API_KEY}`,
          options: {
            maxZoom: 26,
            maxNativeZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          },
        };
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [location.latitude, location.longitude],
      zoom: 18,
      minZoom: 1,
      maxZoom: 26,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      zoomControl: false,
    });

    const config = getTileLayerConfig('satellite');
    const initialTiles = L.tileLayer(config.url, config.options).addTo(map);
    tileLayerRef.current = initialTiles;

    map.on('zoomend', () => {
      setCurrentZoom(Number(map.getZoom().toFixed(1)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onSetLocation) {
        onSetLocation(e.latlng.lat, e.latlng.lng);
      }
    });

    map.on('dragstart', () => {
      autoFollowRef.current = false;
    });

    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const switchLayer = (newLayer: MapLayerType) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (controlledLayer === undefined) {
      setInternalLayer(newLayer);
    }
    onChangeLayer?.(newLayer);

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const config = getTileLayerConfig(newLayer);
    const newTiles = L.tileLayer(config.url, config.options).addTo(map);
    tileLayerRef.current = newTiles;
  };

  // Re-create tile layer whenever the active layer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    const config = getTileLayerConfig(activeLayer);
    tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(map);
  }, [activeLayer]);

  // Direction Marker
  const createDirectionIcon = (currentMode: TrackingMode) => {
    const isAi = currentMode === 'AI_TRANSFORMER';
    const mainColor = isAi ? '#a78bfa' : '#60a5fa';
    const pulseColor = isAi ? 'rgba(167, 139, 250, 0.45)' : 'rgba(96, 165, 250, 0.35)';

    return L.divIcon({
      className: 'custom-location-marker',
      html: `
        <div class="location-marker-wrapper" style="position: relative; width: 52px; height: 52px; transform: translate(-50%, -50%);">
          <div class="location-heading-rotator" style="
            position: absolute; top: 50%; left: 50%; width: 0; height: 0;
            transition: transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1);
            transform-origin: 0 0; pointer-events: none;
          ">
            <div style="
              position: absolute; top: 0; left: 0; width: 0; height: 0;
              transform: translate(-50%, -100%);
              border-left: 22px solid transparent;
              border-right: 22px solid transparent;
              border-top: 42px solid ${pulseColor};
            "></div>
            <div style="
              position: absolute; top: 0; left: 0; width: 3.5px; height: 24px;
              background: ${mainColor}; transform: translate(-50%, -100%);
              border-radius: 2px; box-shadow: 0 0 8px ${mainColor};
            "></div>
          </div>
          <div style="
            position: absolute; top: 50%; left: 50%; width: 20px; height: 20px;
            background: ${mainColor}; border: 3.5px solid #ffffff; border-radius: 50%;
            transform: translate(-50%, -50%); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
          "></div>
        </div>
      `,
      iconSize: [0, 0],
    });
  };

  // Update Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLng: L.LatLngTuple = [location.latitude, location.longitude];

    if (hasReceivedFix && !initialCenteredRef.current) {
      initialCenteredRef.current = true;
      autoFollowRef.current = true;
      map.setView(latLng, 18, { animate: true });
    }

    if (!markerRef.current) {
      markerRef.current = L.marker(latLng, {
        icon: createDirectionIcon(mode),
        zIndexOffset: 1000,
      }).addTo(map);
      prevModeRef.current = mode;
    } else {
      markerRef.current.setLatLng(latLng);
      if (prevModeRef.current !== mode) {
        markerRef.current.setIcon(createDirectionIcon(mode));
        prevModeRef.current = mode;
      }
    }

    const rotators = document.querySelectorAll('.location-heading-rotator');
    if (rotators.length > 0) {
      let delta = heading - prevHeadingRef.current;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      continuousHeadingRef.current += delta;
      prevHeadingRef.current = heading;
      rotators.forEach((el) => {
        (el as HTMLElement).style.transform = `rotate(${continuousHeadingRef.current}deg)`;
      });
    }

    const isAi = mode === 'AI_TRANSFORMER';
    const accuracy = location.accuracy ?? (isAi ? 6 : 10);
    const circleColor = isAi ? '#a78bfa' : '#60a5fa';

    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle(latLng, {
        radius: accuracy,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.16,
        weight: 1.5,
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng(latLng);
      accuracyCircleRef.current.setRadius(accuracy);
      accuracyCircleRef.current.setStyle({
        color: circleColor,
        fillColor: circleColor,
      });
    }

    if (autoFollowRef.current) {
      map.panTo(latLng, { animate: true, duration: 0.3 });
    }
  }, [location.latitude, location.longitude, heading, mode, location.accuracy, hasReceivedFix]);

  // Plot trajectory
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const gpsPoints: L.LatLngTuple[] = [];
    const aiPoints: L.LatLngTuple[] = [];

    path.forEach((pt) => {
      if (pt.mode === 'GPS') {
        gpsPoints.push([pt.lat, pt.lng]);
      } else {
        aiPoints.push([pt.lat, pt.lng]);
      }
    });

    if (!gpsPolylineRef.current) {
      gpsPolylineRef.current = L.polyline(gpsPoints, {
        color: '#60a5fa',
        weight: 4.5,
        opacity: 0.9,
        smoothFactor: 1,
      }).addTo(map);
    } else {
      gpsPolylineRef.current.setLatLngs(gpsPoints);
    }

    if (!aiPolylineRef.current) {
      aiPolylineRef.current = L.polyline(aiPoints, {
        color: '#a78bfa',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '6, 6',
        smoothFactor: 1,
      }).addTo(map);
    } else {
      aiPolylineRef.current.setLatLngs(aiPoints);
    }
  }, [path]);

  // Plot waypoints and route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous waypoint markers and route if they exist
    if (waypointMarkersRef.current) {
      waypointMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    // Render waypoint markers
    const markers: L.Marker[] = [];
    if (waypoints) {
      waypoints.forEach((wp) => {
        const marker = L.marker([wp.latitude, wp.longitude], {
          icon: L.divIcon({
            className: 'custom-waypoint-marker',
            html: `
              <div style="
                width: 20px; height: 20px;
                background: var(--color-accent);
                border: 2px solid var(--color-bg-elevated);
                border-radius: 50%;
                position: relative;
              ">
                <span style={{
                  position: 'absolute', top: 50%, left: 50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--color-text-inverse)', fontWeight: 700, fontSize: 10
                }>
                  {wp.label.charAt(0)}
                </span>
              </div>
            `,
            iconSize: [20, 20],
          }),
        }).addTo(map);
        markers.push(marker);
      });
    }
    waypointMarkersRef.current = markers;

    // Render route polyline through waypoints
    if (waypoints && waypoints.length > 1) {
      const latLngs: L.LatLngTuple[] = waypoints.map((wp) => [wp.latitude, wp.longitude] as L.LatLngTuple);
      routePolylineRef.current = L.polyline(latLngs, {
        color: '#c3f38b',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
      }).addTo(map);
    } else {
      routePolylineRef.current = null;
    }
  }, [waypoints]);

  const handleCenterMap = () => {
    if (!mapInstanceRef.current) return;
    autoFollowRef.current = true;
    mapInstanceRef.current.setView([location.latitude, location.longitude], Math.max(18, currentZoom), {
      animate: true,
    });
    if (onLocateNow) {
      onLocateNow();
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn(1);
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut(1);
  };

  const layers: { key: MapLayerType; label: string; icon: string }[] = [
    { key: 'satellite', label: 'Satellite', icon: 'public' },
    { key: 'street', label: 'Street', icon: 'map' },
    { key: 'dark', label: 'Dark', icon: 'layers' },
  ];

  const dynamicLeftOffset = isSidebarOpen ? 'max(416px, 1rem)' : '1rem';

  const overlaySurface: React.CSSProperties = {
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    boxShadow: 'var(--shadow-md)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--color-canvas-bg)' }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Status pill — top center */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] flex items-center gap-2 px-3 py-1.5"
        style={{
          ...overlaySurface,
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
        }}
      >
        <span
          className="status-dot"
          style={{
            background: hasReceivedFix ? 'var(--color-success)' : 'var(--color-accent)',
          }}
        />
        {hasReceivedFix
          ? `${mode === 'AI_TRANSFORMER' ? 'AI MLP' : 'GPS'} TRACKING`
          : 'SEARCHING_GPS TRACKING'}
      </div>

      {/* Map Style Switcher — top-left, pill segmented control.
          Hidden when a parent component (desktop/tablet shell) provides
          its own layer switcher via activeLayer/onChangeLayer. */}
      {controlledLayer === undefined && (
      <div
        className="absolute z-[500] flex items-center gap-1 p-1"
        style={{
          ...overlaySurface,
          top: '1rem',
          left: dynamicLeftOffset,
          borderRadius: 'var(--radius-md)',
          padding: 4,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {layers.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => switchLayer(key)}
            className="flex items-center gap-1.5"
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: activeLayer === key ? 700 : 500,
              fontFamily: "'Google Sans Flex', 'Google Sans Text', sans-serif",
              background: activeLayer === key ? 'var(--color-accent)' : 'transparent',
              color: activeLayer === key ? 'var(--color-text-inverse)' : 'inherit',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title={`${label} Layer`}
          >
            <Icon name={icon} size={14} filled={activeLayer === key} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      )}

      {/* Right Controls — circular, matching reference */}
      <div className="absolute bottom-4 lg:bottom-6 right-4 z-[500] flex flex-col gap-2">
        <button
          onClick={handleCenterMap}
          className="flex items-center justify-center"
          style={{
            ...overlaySurface,
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
          }}
          title="Recenter on user"
          aria-label="Recenter on user"
        >
          <Icon name="explore" size={22} style={{ color: 'var(--color-text-primary)' }} />
        </button>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              autoFollowRef.current = true;
              mapInstanceRef.current.panTo([location.latitude, location.longitude]);
            }
          }}
          className="flex items-center justify-center"
          style={{
            ...overlaySurface,
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
          }}
          title="My location"
          aria-label="My location"
        >
          <Icon name="my_location" size={22} style={{ color: 'var(--color-accent-text)' }} filled />
        </button>

        <div
          className="flex flex-col overflow-hidden"
          style={{
            ...overlaySurface,
            borderRadius: 'var(--radius-full)',
            padding: 0,
          }}
        >
          <button
            onClick={handleZoomIn}
            style={{
              width: 48,
              height: 36,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--color-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
            }}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Icon name="add" size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              width: 48,
              height: 36,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'inherit',
            }}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Icon name="remove" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
