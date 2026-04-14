import {Suspense} from 'react';
import {useFindLibraryStore} from '@/features/find-library';
import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';

const LazyLibrarySearchResultDialog = lazyWithPreload(async () => {
  const {LibrarySearchResultDialog} = await import('./LibrarySearchResultDialog');

  return {
    default: LibrarySearchResultDialog,
  };
});

function LibrarySearchResultDialogAsync() {
  const hasLibrarySearchResultDialog = useFindLibraryStore(
    state => state.currentLibrarySearchParams != null && state.libraryResultBook != null,
  );

  if (!hasLibrarySearchResultDialog) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyLibrarySearchResultDialog />
    </Suspense>
  );
}

function preloadLibrarySearchResultDialog() {
  return LazyLibrarySearchResultDialog.preload();
}

export {LibrarySearchResultDialogAsync, preloadLibrarySearchResultDialog};
