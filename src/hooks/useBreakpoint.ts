import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_MIN = 768;
const DESKTOP_MIN = 1024;

function detect(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w >= DESKTOP_MIN) return 'desktop';
  if (w >= TABLET_MIN) return 'tablet';
  return 'mobile';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(detect);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const desktop = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const tablet = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
    const apply = () => {
      const w = window.innerWidth;
      if (w >= DESKTOP_MIN) setBp('desktop');
      else if (w >= TABLET_MIN) setBp('tablet');
      else setBp('mobile');
    };
    apply();
    const handler = () => apply();
    desktop.addEventListener('change', handler);
    tablet.addEventListener('change', handler);
    window.addEventListener('resize', handler);
    return () => {
      desktop.removeEventListener('change', handler);
      tablet.removeEventListener('change', handler);
      window.removeEventListener('resize', handler);
    };
  }, []);
  return bp;
}
