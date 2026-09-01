import { useEffect, useState } from 'react';

export type DeviceHeadingSource = 'absolute' | 'webkit' | 'alpha' | 'none';

interface DeviceHeadingState {
  /** Smoothed device heading in degrees clockwise from North (0..360) */
  heading: number;
  /** Raw heading as last reported by the OS, useful for debugging */
  rawHeading: number;
  source: DeviceHeadingSource;
  available: boolean;
}

const normalize = (deg: number): number => ((deg % 360) + 360) % 360;

/**
 * Subscribes to the browser's `deviceorientation*` events and returns the
 * device-relative compass heading in degrees clockwise from true North.
 *
 * - iOS Safari: reads `webkitCompassHeading` (already in 0..360, clockwise from North)
 * - Android + desktop Chromium: uses `event.alpha` (counter-clockwise from North per spec)
 *   so we flip with `360 - alpha` to match the iOS convention used elsewhere in the app
 *
 * This hook is independent of GPS — it returns a live heading as long as the
 * underlying device exposes motion/orientation sensors, regardless of whether
 * geolocation services are available.
 */
export const useDeviceHeading = (): DeviceHeadingState => {
  const [state, setState] = useState<DeviceHeadingState>({
    heading: 0,
    rawHeading: 0,
    source: 'none',
    available: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const supported =
      'DeviceOrientationEvent' in window ||
      // @ts-expect-error — legacy iOS detection
      'DeviceOrientationEvent' in (window.webkitOrientationEvent || {});

    if (!supported) return;

    const handleAbsolute = (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;
      // Android: alpha is counter-clockwise from the device's "up" axis; flip for clockwise-from-north
      const heading = normalize(360 - event.alpha);
      setState((prev) => ({
        ...prev,
        heading,
        rawHeading: heading,
        source: 'absolute',
        available: true,
      }));
    };

    const handleStandard = (event: DeviceOrientationEvent) => {
      // @ts-expect-error — iOS-specific property
      const webkitHeading = event.webkitCompassHeading;
      if (typeof webkitHeading === 'number' && !Number.isNaN(webkitHeading)) {
        const heading = normalize(webkitHeading);
        setState((prev) => ({
          ...prev,
          heading,
          rawHeading: heading,
          source: 'webkit',
          available: true,
        }));
        return;
      }
      if (event.alpha == null) return;
      // Fallback: alpha is degrees of rotation around the Z axis (counter-clockwise).
      const heading = normalize(360 - event.alpha);
      setState((prev) => ({
        ...prev,
        heading,
        rawHeading: heading,
        source: prev.source === 'absolute' ? 'absolute' : 'alpha',
        available: true,
      }));
    };

    window.addEventListener('deviceorientationabsolute', handleAbsolute as EventListener, {
      passive: true,
    });
    window.addEventListener('deviceorientation', handleStandard, { passive: true });

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbsolute as EventListener);
      window.removeEventListener('deviceorientation', handleStandard);
    };
  }, []);

  return state;
};