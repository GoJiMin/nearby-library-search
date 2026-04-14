import {Suspense} from 'react';
import {X} from 'lucide-react';
import {useShallow} from 'zustand/react/shallow';
import {useBookDetailDialogStore} from '../../model/useBookDetailDialogStore';
import {QueryErrorBoundary} from '@/shared/feedback';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';
import {BookDetailDialogLoadingContent} from './BookDetailDialogLoadingContent';
import {BookDetailDialogResolvedContent} from './BookDetailDialogResolvedContent';
import {BookDetailDialogErrorContent} from './states/BookDetailDialogErrorContent';

function BookDetailDialog() {
  const {closeBookDetailDialog, selectedBookDetail} = useBookDetailDialogStore(
    useShallow(state => ({
      closeBookDetailDialog: state.closeBookDetailDialog,
      selectedBookDetail: state.selectedBookDetail,
    })),
  );
  const open = selectedBookDetail != null;

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeBookDetailDialog();
        }
      }}
    >
      {selectedBookDetail != null && (
        <DialogContent
          aria-describedby={undefined}
          className="h-[min(calc(100vh-32px),720px)] w-[min(calc(100vw-32px),980px)] gap-0 overflow-hidden p-0 sm:p-0"
          showCloseButton={false}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>도서 상세 정보</DialogTitle>
          </DialogHeader>
          <DialogClose asChild>
            <button
              aria-label="닫기"
              className="shadow-card bg-surface-strong text-text-muted hover:text-text focus-visible:ring-accent-soft absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
              type="button"
            >
              <LucideIcon icon={X} strokeWidth={2.2} />
            </button>
          </DialogClose>
          <div className="h-full min-h-0 overflow-y-auto lg:overflow-hidden">
            <QueryErrorBoundary
              fallback={({error, reset}) => <BookDetailDialogErrorContent error={error} onRetry={reset} />}
            >
              <Suspense fallback={<BookDetailDialogLoadingContent />}>
                <BookDetailDialogResolvedContent isbn13={selectedBookDetail.isbn13} />
              </Suspense>
            </QueryErrorBoundary>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export {BookDetailDialog};
