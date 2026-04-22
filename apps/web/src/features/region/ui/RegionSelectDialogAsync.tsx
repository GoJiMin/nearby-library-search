import {Suspense} from 'react';
import {useFindLibraryStore} from '@/features/find-library';
import {LazyRegionSelectDialog} from './regionSelectDialog.loader';

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

export {RegionSelectDialogAsync};
