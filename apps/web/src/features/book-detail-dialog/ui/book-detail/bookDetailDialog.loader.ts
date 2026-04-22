import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';

const LazyBookDetailDialog = lazyWithPreload(async () => {
  const {BookDetailDialog} = await import('./BookDetailDialog');

  return {
    default: BookDetailDialog,
  };
});

function preloadBookDetailDialog() {
  return LazyBookDetailDialog.preload();
}

export {LazyBookDetailDialog, preloadBookDetailDialog};
