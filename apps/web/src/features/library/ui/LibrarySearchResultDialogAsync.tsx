import {Suspense} from 'react';
import {useFindLibraryStore} from '@/features/find-library';
import {LazyLibrarySearchResultDialog} from './librarySearchResultDialog.loader';

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

export {LibrarySearchResultDialogAsync};
