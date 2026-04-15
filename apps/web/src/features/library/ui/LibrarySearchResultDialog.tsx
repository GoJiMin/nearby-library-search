import {X} from 'lucide-react';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {QueryErrorBoundary} from '@/shared/feedback';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';
import {LibrarySearchResultContent} from './LibrarySearchResultContent';
import {LibrarySearchResultErrorContent} from './states/LibrarySearchResultErrorContent';

function LibrarySearchResultDialog() {
  const {closeLibraryResultDialog, params, selectedBook} = useFindLibraryStore(
    useShallow(state => ({
      closeLibraryResultDialog: state.closeLibraryResultDialog,
      params: state.currentLibrarySearchParams,
      selectedBook: state.libraryResultBook,
    })),
  );
  const open = params != null && selectedBook != null;

  if (!open || params == null || selectedBook == null) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeLibraryResultDialog();
        }
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="gap-0 overflow-hidden sm:h-[min(calc(100vh-32px),800px)] sm:w-[min(calc(100vw-32px),1080px)] sm:p-0"
        mobileFullscreen
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>도서관 검색 결과</DialogTitle>
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
        <QueryErrorBoundary
          fallback={({error, reset}) => <LibrarySearchResultErrorContent error={error} onRetry={reset} />}
        >
          <LibrarySearchResultContent />
        </QueryErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

export {LibrarySearchResultDialog};
