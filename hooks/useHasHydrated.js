import { useSyncExternalStore } from 'react';

function subscribe() {
  // Static value එකක් නිසා subscribe කරන්න දෙයක් නෑ, empty cleanup function එකක් return කරනවා
  return () => {};
}

export function useHasHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,   // Client snapshot — hydration ඉවර උනාට පස්සේ true
    () => false   // Server snapshot — SSR render එකේදී false
  );
}