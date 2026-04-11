import {Suspense} from 'react';
import {X} from 'lucide-react';
import {QueryErrorBoundary} from '@/shared/feedback';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';
import {LibrarySearchResultContent} from './LibrarySearchResultContent';
import {LibrarySearchResultErrorContent} from './states/LibrarySearchResultErrorContent';
import {LibrarySearchResultLoadingContent} from './states/LibrarySearchResultLoadingContent';

function LibrarySearchResultDialog({
  onBackToRegionSelect,
  onChangePage,
  onCheckAvailability,
  onOpenChange,
  onSelectLibrary,
  open,
  params,
  selectedBook,
  selectedLibraryCode,
}: LibrarySearchResultDialogProps) {
  if (!open || params == null || selectedBook == null) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="h-[min(calc(100vh-32px),800px)] w-[min(calc(100vw-32px),1080px)] gap-0 overflow-hidden p-0 sm:p-0"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>도서관 검색 결과</DialogTitle>
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
        <QueryErrorBoundary
          fallback={({error, reset}) => (
            <LibrarySearchResultErrorContent error={error} onClose={() => onOpenChange(false)} onRetry={reset} />
          )}
        >
          <Suspense fallback={<LibrarySearchResultLoadingContent />}>
            <LibrarySearchResultContent
              onBackToRegionSelect={onBackToRegionSelect}
              onChangePage={onChangePage}
              onCheckAvailability={onCheckAvailability}
              onOpenChange={onOpenChange}
              onSelectLibrary={onSelectLibrary}
              params={params}
              selectedLibraryCode={selectedLibraryCode}
            />
          </Suspense>
        </QueryErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

export {LibrarySearchResultDialog};
