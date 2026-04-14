import {Suspense} from 'react';
import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';
import {useFindLibraryStore} from '@/features/find-library';

const LazyRegionSelectDialog = lazyWithPreload(async () => {
  const {RegionSelectDialog} = await import('./RegionSelectDialog');

  return {
    default: RegionSelectDialog,
  };
});

function RegionSelectDialogAsync() {
  const hasRegionDialogBook = useFindLibraryStore(state => state.regionDialogBook != null);

  if (!hasRegionDialogBook) {
    return null;
  }

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
