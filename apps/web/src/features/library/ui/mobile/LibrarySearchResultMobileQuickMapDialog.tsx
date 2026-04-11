import type {LibraryCode} from '@nearby-library-search/contracts';
import {X} from 'lucide-react';
import type {LibrarySearchParams} from '@/entities/library';
import {Dialog, DialogClose, DialogContent, DialogTitle, LucideIcon} from '@/shared/ui';
import {LibrarySearchResultSelectedMap} from '../common/LibrarySearchResultSelectedMap';

type LibrarySearchResultMobileQuickMapDialogProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  params: LibrarySearchParams;
};

function LibrarySearchResultMobileQuickMapDialog({
  focusRequest,
  onOpenChange,
  open,
  params,
}: LibrarySearchResultMobileQuickMapDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-surface-strong top-0 left-0 block h-dvh w-dvw max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">도서관 위치 지도</DialogTitle>
        <DialogClose asChild>
          <button
            aria-label="지도 닫기"
            className="bg-surface-strong/92 border-line/60 text-text-muted hover:text-text hover:bg-surface-strong focus-visible:ring-accent-soft absolute top-[max(env(safe-area-inset-top),1rem)] right-[max(env(safe-area-inset-right),1rem)] z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-4 focus-visible:outline-none"
            type="button"
          >
            <LucideIcon className="h-5 w-5" icon={X} strokeWidth={2.2} />
          </button>
        </DialogClose>
        <div aria-label="도서관 지도 패널" className="bg-surface-muted relative h-full overflow-hidden">
          <LibrarySearchResultSelectedMap focusRequest={focusRequest} params={params} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {LibrarySearchResultMobileQuickMapDialog};
export type {LibrarySearchResultMobileQuickMapDialogProps};
