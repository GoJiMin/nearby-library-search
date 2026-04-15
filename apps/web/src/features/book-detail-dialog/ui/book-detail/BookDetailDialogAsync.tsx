import {Suspense} from 'react';
import {X} from 'lucide-react';
import {lazyWithPreload} from '@/shared/lib/lazyWithPreload';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';
import {BookDetailDialogLoadingContent} from './BookDetailDialogLoadingContent';
import {useBookDetailDialogStore} from '../../model/useBookDetailDialogStore';

const LazyBookDetailDialog = lazyWithPreload(async () => {
  const {BookDetailDialog} = await import('./BookDetailDialog');

  return {
    default: BookDetailDialog,
  };
});

function BookDetailDialogLoadingDialog() {
  const closeBookDetailDialog = useBookDetailDialogStore(state => state.closeBookDetailDialog);
  const selectedBookDetail = useBookDetailDialogStore(state => state.selectedBookDetail);
  const open = selectedBookDetail != null;

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeBookDetailDialog();
        }
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="gap-0 overflow-hidden sm:h-[min(calc(100vh-32px),720px)] sm:w-[min(calc(100vw-32px),980px)] sm:p-0"
        mobileFullscreen
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>도서 상세 정보</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <button
            aria-label="닫기"
            className="shadow-card bg-surface-strong text-text-muted hover:text-text focus-visible:ring-accent-soft absolute top-[max(env(safe-area-inset-top),1rem)] right-[max(env(safe-area-inset-right),1rem)] z-10 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none sm:top-4 sm:right-4"
            type="button"
          >
            <LucideIcon icon={X} strokeWidth={2.2} />
          </button>
        </DialogClose>
        <div className="h-full min-h-0 overflow-y-auto lg:overflow-hidden">
          <BookDetailDialogLoadingContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookDetailDialogAsync() {
  const hasSelectedBookDetail = useBookDetailDialogStore(state => state.selectedBookDetail != null);

  if (!hasSelectedBookDetail) {
    return null;
  }

  return (
    <Suspense fallback={<BookDetailDialogLoadingDialog />}>
      <LazyBookDetailDialog />
    </Suspense>
  );
}

function preloadBookDetailDialog() {
  return LazyBookDetailDialog.preload();
}

export {BookDetailDialogAsync, preloadBookDetailDialog};
