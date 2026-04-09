import clsx from 'clsx';
import {CheckCircle2, ChevronRight, MapPin} from 'lucide-react';
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
  Heading,
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

const SCROLL_AREA_CLASS =
  'flex-1 overflow-y-auto px-2 py-2 [scrollbar-color:theme(colors.line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5';

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
        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] transition-colors',
        isSelected
          ? selectionTone === 'accent'
            ? 'bg-accent text-on-primary shadow-[0_12px_24px_-14px_rgba(55,85,195,0.75)]'
            : 'bg-surface-muted text-text shadow-[0_10px_24px_-18px_rgba(25,28,30,0.28)]'
          : 'text-text hover:bg-surface-muted/80',
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
      <DialogContent
        className="grid h-[min(calc(100vh-32px),640px)] w-[min(calc(100vw-32px),640px)] grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
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

        <section className="grid min-h-0 grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] overflow-hidden">
          <section aria-labelledby="region-dialog-region-heading" className="bg-surface-muted/35 flex min-h-0 flex-col">
            <Heading
              as="h3"
              className="text-text-muted px-5 py-3 tracking-[0.08em] uppercase"
              id="region-dialog-region-heading"
              size="xs"
            >
              시/도
            </Heading>
            <div className={SCROLL_AREA_CLASS}>
              <ul className="space-y-1">
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
            </div>
          </section>

          <section
            aria-disabled={!isDetailRegionEnabled}
            aria-labelledby="region-dialog-detail-heading"
            className={clsx('bg-surface flex min-h-0 flex-col', !isDetailRegionEnabled && 'opacity-60')}
          >
            <Heading
              as="h3"
              className="text-text-muted px-5 py-3 tracking-[0.08em] uppercase"
              id="region-dialog-detail-heading"
              size="xs"
            >
              세부 지역
            </Heading>
            {isDetailRegionEnabled ? (
              <div className={SCROLL_AREA_CLASS}>
                <ul className="space-y-1">
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
                        trailing={
                          selectedDetailRegion === detailRegionOption.code ? (
                            <LucideIcon className="text-accent h-4.5 w-4.5 shrink-0" icon={CheckCircle2} strokeWidth={2.1} />
                          ) : null
                        }
                        onClick={() => {
                          handleSelectDetailRegion(detailRegionOption.code);
                        }}
                      >
                        {detailRegionOption.label}
                      </RegionSelectRowButton>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex-1 px-2 py-2">
                <div
                  aria-hidden="true"
                  className="bg-surface-muted/70 h-full min-h-[292px] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                />
              </div>
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
