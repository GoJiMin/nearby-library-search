import {Suspense} from 'react';
import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';

const LazyRegionSelectDialog = lazyWithPreload(async () => {
  const {RegionSelectDialog} = await import('./RegionSelectDialog');

  return {
    default: RegionSelectDialog,
  };
});

function RegionSelectDialogAsync() {
  return (
    <Suspense fallback={null}>
      <LazyRegionSelectDialog />
    </Suspense>
  );
}

function preloadRegionSelectDialog() {
  return LazyRegionSelectDialog.preload();
}

export {RegionSelectDialogAsync, preloadRegionSelectDialog};
