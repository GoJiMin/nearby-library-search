import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';

const LazyLibrarySearchResultDialog = lazyWithPreload(async () => {
  const {LibrarySearchResultDialog} = await import('./LibrarySearchResultDialog');

  return {
    default: LibrarySearchResultDialog,
  };
});

function preloadLibrarySearchResultDialog() {
  return LazyLibrarySearchResultDialog.preload();
}

export {LazyLibrarySearchResultDialog, preloadLibrarySearchResultDialog};
