import {useSyncExternalStore} from 'react';

function getSnapshot(query: string) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia(query).matches;
}

function subscribe(query: string, onStoreChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = window.matchMedia(query);

  mediaQueryList.addEventListener('change', onStoreChange);

  return () => {
    mediaQueryList.removeEventListener('change', onStoreChange);
  };
}

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onStoreChange => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    () => false,
  );
}

export {useMediaQuery};
