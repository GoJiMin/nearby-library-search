import {MapPin, X} from 'lucide-react';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  LucideIcon,
  Text,
} from '@/shared/ui';
import {createRegionSelectConfirmParams} from '../model/createRegionSelectConfirmParams';
import type {RegionSelectionState} from '../model/regionSelectDialog.contract';
import {useRegionSelectDialogDraft} from '../model/useRegionSelectDialogDraft';
import {RegionSelectDetailRegionPanel} from './RegionSelectDetailRegionPanel';
import {RegionSelectRegionList} from './RegionSelectRegionList';

type RegionSelectDialogProps = {
  lastSelection?: RegionSelectionState | null;
  onConfirm: (params: LibrarySearchParams) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedBook: BookSelectionActionPayload | null;
};

function RegionSelectDialog({lastSelection, onConfirm, onOpenChange, open, selectedBook}: RegionSelectDialogProps) {
  const {
    draftSelection,
    detailRegionHelperMessage,
    handleReset,
    handleSelectDetailRegion,
    handleSelectRegion,
    isDetailRegionEnabled,
    isDetailRegionFallback,
    isResetDisabled,
    isSelectionComplete,
    selectedDetailRegion,
    selectedRegion,
    selectionSummaryText,
    visibleDetailRegionOptions,
  } = useRegionSelectDialogDraft({lastSelection});

  const isConfirmDisabled = selectedBook == null || !isSelectionComplete;

  function handleConfirm() {
    if (selectedBook == null || draftSelection == null) {
      return;
    }

    onConfirm(
      createRegionSelectConfirmParams({
        draftSelection,
        selectedBook,
      }),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="grid h-[min(calc(100vh-32px),680px)] w-[min(calc(100vw-32px),600px)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 px-2 sm:px-6"
        showCloseButton={false}
      >
        <DialogHeader className="px-4 pt-6 sm:px-4 sm:pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LucideIcon className="text-accent h-6 w-6 sm:h-7 sm:w-7" icon={MapPin} strokeWidth={2.1} />
              <DialogTitle className="text-base font-semibold sm:text-lg">검색 지역 선택</DialogTitle>
            </div>
            <DialogClose asChild>
              <button
                aria-label="닫기"
                className="text-text-muted hover:text-text hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
                type="button"
              >
                <LucideIcon icon={X} strokeWidth={2.3} />
              </button>
            </DialogClose>
          </div>
          <div aria-hidden="true" className="mt-1 md:mt-3" data-slot="region-dialog-progress-rail">
            <div className="bg-surface-muted grid h-1 grid-cols-2 gap-1 overflow-hidden rounded-full">
              <div className="bg-accent h-full rounded-full" />
              <div className="bg-line/60 h-full rounded-full" />
            </div>
          </div>
        </DialogHeader>
        <section className="mt-3 grid min-h-0 grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] overflow-hidden">
          <RegionSelectRegionList selectedRegion={selectedRegion} onSelectRegion={handleSelectRegion} />
          <RegionSelectDetailRegionPanel
            detailRegionHelperMessage={detailRegionHelperMessage}
            isDetailRegionEnabled={isDetailRegionEnabled}
            isDetailRegionFallback={isDetailRegionFallback}
            selectedDetailRegion={selectedDetailRegion}
            visibleDetailRegionOptions={visibleDetailRegionOptions}
            onSelectDetailRegion={handleSelectDetailRegion}
          />
        </section>
        <DialogFooter className="border-line mt-4 flex flex-col items-start gap-4 border-t px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Text className="text-text-muted text-sm">현재 선택</Text>
            <Text className="min-w-0 text-sm font-semibold">{selectionSummaryText}</Text>
          </div>
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button
              className="rounded-full px-5"
              disabled={isResetDisabled}
              size="sm"
              variant="secondary"
              onClick={handleReset}
            >
              초기화
            </Button>
            <Button className="rounded-full px-6" disabled={isConfirmDisabled} size="sm" onClick={handleConfirm}>
              선택 완료
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {RegionSelectDialog};
export type {RegionSelectDialogProps};
