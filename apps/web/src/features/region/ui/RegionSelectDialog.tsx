import {useLayoutEffect} from 'react';
import {MapPin, X} from 'lucide-react';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';
import {useRegionSelectionStore} from '../model/useRegionSelectionStore';
import {RegionSelectDetailRegionPanel} from './RegionSelectDetailRegionPanel';
import {RegionSelectDialogFooter} from './RegionSelectDialogFooter';
import {RegionSelectRegionList} from './RegionSelectRegionList';

function RegionSelectDialogContent() {
  return (
    <DialogContent
      aria-describedby={undefined}
      className="grid grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden px-2 pb-[max(env(safe-area-inset-bottom),0px)] sm:h-[min(calc(100vh-32px),680px)] sm:w-[min(calc(100vw-32px),580px)] sm:px-6 sm:pb-5"
      mobileFullscreen
      showCloseButton={false}
    >
      <DialogHeader className="px-4 pt-[max(env(safe-area-inset-top),1.5rem)] sm:px-4 sm:pt-2">
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
        <RegionSelectRegionList />
        <RegionSelectDetailRegionPanel />
      </section>
      <RegionSelectDialogFooter />
    </DialogContent>
  );
}

function RegionSelectDialog() {
  const {closeRegionDialog, lastRegionSelection, open} = useFindLibraryStore(
    useShallow(state => ({
      closeRegionDialog: state.closeRegionDialog,
      lastRegionSelection: state.lastRegionSelection,
      open: state.regionDialogBook != null,
    })),
  );
  const initializeSelection = useRegionSelectionStore(state => state.initializeSelection);
  const resetSelection = useRegionSelectionStore(state => state.resetSelection);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    initializeSelection(lastRegionSelection);

    return () => {
      resetSelection();
    };
  }, [initializeSelection, lastRegionSelection, open, resetSelection]);

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeRegionDialog();
        }
      }}
    >
      <RegionSelectDialogContent />
    </Dialog>
  );
}

export {RegionSelectDialog};
