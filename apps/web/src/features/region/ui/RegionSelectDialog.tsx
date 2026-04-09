import clsx from 'clsx';
import {ChevronRight, MapPin} from 'lucide-react';
import type {ReactNode} from 'react';
import {REGION_OPTIONS} from '@/entities/region';
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
} from '@/shared/ui';
import type {RegionSelectionState} from '../model/regionSelectDialog.contract';
import {useRegionSelectDialogDraft} from '../model/useRegionSelectDialogDraft';

type RegionSelectRowButtonProps = {
  children: ReactNode;
  isSelected?: boolean;
  onClick: () => void;
  selectionTone?: 'accent' | 'neutral';
  trailing?: ReactNode;
};

function RegionSelectRowButton({
  children,
  isSelected = false,
  onClick,
  selectionTone = 'neutral',
  trailing,
}: RegionSelectRowButtonProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={clsx(
        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors',
        isSelected
          ? selectionTone === 'accent'
            ? 'bg-accent text-on-primary shadow-sm'
            : 'bg-surface-strong text-text shadow-[0_10px_24px_-12px_rgba(25,28,30,0.18)]'
          : 'text-text hover:bg-surface-muted',
      )}
      type="button"
      onClick={onClick}
    >
      <span className={clsx('min-w-0 truncate', isSelected && 'font-semibold')}>{children}</span>
      {trailing}
    </button>
  );
}

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
  const {detailRegionOptions, handleSelectDetailRegion, handleSelectRegion, selectedDetailRegion, selectedRegion} =
    useRegionSelectDialogDraft({lastSelection});

  void onConfirm;
  void selectedBook;

  const isDetailRegionEnabled = selectedRegion != null;

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

        <section className="grid grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] overflow-hidden">
          <section aria-labelledby="region-dialog-region-heading" className="bg-surface-muted/40 px-4 py-5 sm:px-5">
            <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase" id="region-dialog-region-heading">
              시/도
            </h3>
            <ul className="mt-4 space-y-1.5">
              {REGION_OPTIONS.map(regionOption => (
                <li key={regionOption.code}>
                  <RegionSelectRowButton
                    isSelected={regionOption.code === selectedRegion}
                    selectionTone="accent"
                    trailing={
                      regionOption.code === selectedRegion ? (
                        <LucideIcon className="h-4 w-4 shrink-0" icon={ChevronRight} strokeWidth={2.1} />
                      ) : null
                    }
                    onClick={() => {
                      handleSelectRegion(regionOption.code);
                    }}
                  >
                    {regionOption.label}
                  </RegionSelectRowButton>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-disabled={!isDetailRegionEnabled}
            aria-labelledby="region-dialog-detail-heading"
            className={clsx('bg-surface px-4 py-5 sm:px-5', !isDetailRegionEnabled && 'opacity-60')}
          >
            <h3 className="text-text-muted text-xs font-semibold tracking-wide uppercase" id="region-dialog-detail-heading">
              세부 지역
            </h3>
            {isDetailRegionEnabled ? (
              <ul className="mt-4 space-y-1.5">
                <li>
                  <RegionSelectRowButton
                    isSelected={selectedDetailRegion == null}
                    onClick={() => {
                      handleSelectDetailRegion(undefined);
                    }}
                  >
                    전체
                  </RegionSelectRowButton>
                </li>
                {detailRegionOptions.map(detailRegionOption => (
                  <li key={detailRegionOption.code}>
                    <RegionSelectRowButton
                      isSelected={selectedDetailRegion === detailRegionOption.code}
                      onClick={() => {
                        handleSelectDetailRegion(detailRegionOption.code);
                      }}
                    >
                      {detailRegionOption.label}
                    </RegionSelectRowButton>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                aria-hidden="true"
                className="bg-surface-muted/70 mt-4 min-h-72 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
              />
            )}
            <span className="sr-only">
              {isDetailRegionEnabled
                ? `${detailRegionOptions.length}개의 세부 지역을 선택할 수 있습니다.`
                : '시도를 먼저 선택해야 세부 지역을 고를 수 있습니다.'}
            </span>
          </section>
        </section>
      </DialogContent>
    </Dialog>
  );
}

export {RegionSelectDialog};
export type {RegionSelectDialogProps};
