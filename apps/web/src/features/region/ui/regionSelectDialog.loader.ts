import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';

const LazyRegionSelectDialog = lazyWithPreload(async () => {
  const {RegionSelectDialog} = await import('./RegionSelectDialog');

  return {
    default: RegionSelectDialog,
  };
});

function preloadRegionSelectDialog() {
  return LazyRegionSelectDialog.preload();
}

export {LazyRegionSelectDialog, preloadRegionSelectDialog};
