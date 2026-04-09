import {MapPin} from 'lucide-react';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  LucideIcon,
  Text,
} from '@/shared/ui';
import type {RegionSelectionState} from '../model/regionSelectDialog.contract';

type RegionSelectDialogProps = {
  lastSelection?: RegionSelectionState | null;
  onConfirm: (params: LibrarySearchParams) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedBook: BookSelectionActionPayload | null;
};

function RegionSelectDialog({
  lastSelection,
  onConfirm,
  onOpenChange,
  open,
  selectedBook,
}: RegionSelectDialogProps) {
  void lastSelection;
  void onConfirm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(calc(100vw-32px),640px)] gap-0 overflow-hidden p-0" showCloseButton={false}>
        <DialogHeader className="bg-surface px-6 pt-6 pb-5 sm:px-8 sm:pt-7 sm:pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="bg-accent/10 text-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                <LucideIcon className="h-4.5 w-4.5" icon={MapPin} strokeWidth={2.1} />
              </div>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-base font-semibold sm:text-lg">검색 지역 선택</DialogTitle>
                <DialogDescription className="text-text-muted text-sm leading-6">
                  선택한 책을 기준으로 도서관 검색 지역을 고르는 단계예요.
                </DialogDescription>
              </div>
            </div>
            <DialogClose asChild>
              <button
                aria-label="닫기"
                className="text-text-muted hover:text-text hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
                type="button"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ×
                </span>
              </button>
            </DialogClose>
          </div>

          <div aria-hidden="true" className="mt-5" data-slot="region-dialog-progress-rail">
            <div className="bg-surface-muted grid h-1.5 grid-cols-2 gap-1 overflow-hidden rounded-full">
              <div className="bg-accent h-full rounded-full" />
              <div className="bg-line/60 h-full rounded-full" />
            </div>
          </div>
        </DialogHeader>

        <section className="bg-surface-muted/45 px-6 py-8 sm:px-8 sm:py-10">
          <div className="bg-surface rounded-panel flex min-h-36 items-center justify-center px-6 py-8 text-center shadow-[0_12px_32px_-8px_rgba(25,28,30,0.06)]">
            <Text className="text-text-muted max-w-sm leading-7">
              {selectedBook ? `"${selectedBook.title}" 소장 도서관을 찾기 위한 지역 선택 단계를 준비하고 있어요.` : null}
            </Text>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export {RegionSelectDialog};
export type {RegionSelectDialogProps};
