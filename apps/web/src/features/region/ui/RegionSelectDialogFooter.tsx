import {DETAIL_REGION_OPTIONS_BY_REGION, REGION_OPTIONS} from '@/entities/region';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {preloadLibrarySearchResultDialog} from '@/features/library';
import {Button, DialogFooter, Text} from '@/shared/ui';
import {createRegionSelectConfirmParams} from '../model/createRegionSelectConfirmParams';
import type {RegionSelectionState} from '../model/regionSelection.contract';
import {useRegionSelectionStore} from '../model/useRegionSelectionStore';

function getSelectionSummaryText(selection: RegionSelectionState | null) {
  if (selection == null) {
    return '지역을 선택해주세요';
  }

  const regionLabel = REGION_OPTIONS.find(option => option.code === selection.region)?.label ?? selection.region;

  if (selection.detailRegion == null) {
    return `${regionLabel} 전체`;
  }

  const detailRegionLabel =
    DETAIL_REGION_OPTIONS_BY_REGION[selection.region]?.find(option => option.code === selection.detailRegion)?.label ??
    selection.detailRegion;

  return `${regionLabel} > ${detailRegionLabel}`;
}

function RegionSelectDialogFooter() {
  const selection = useRegionSelectionStore(state => state.selection);
  const resetSelection = useRegionSelectionStore(state => state.resetSelection);
  const {confirmRegion, selectedBook} = useFindLibraryStore(
    useShallow(state => ({
      confirmRegion: state.confirmRegion,
      selectedBook: state.regionDialogBook,
    })),
  );
  const isConfirmDisabled = selection == null || selectedBook == null;
  const isResetDisabled = selection == null;
  const selectionSummaryText = getSelectionSummaryText(selection);

  function handlePreloadLibrarySearchResultDialog() {
    void preloadLibrarySearchResultDialog().catch(() => {});
  }

  function handleConfirm() {
    if (selection == null || selectedBook == null) {
      return;
    }

    handlePreloadLibrarySearchResultDialog();

    confirmRegion(
      createRegionSelectConfirmParams({
        selectedBook,
        selection,
      }),
    );
  }

  return (
    <DialogFooter className="border-line mt-4 flex flex-col items-start gap-4 border-t px-4 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-0">
      <div aria-atomic="true" aria-live="polite" className="flex min-w-0 flex-wrap items-center gap-2">
        <Text className="text-text-muted">현재 선택 : </Text>
        <Text className="min-w-0 text-sm font-semibold">{selectionSummaryText}</Text>
      </div>
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <Button
          className="rounded-full px-5"
          disabled={isResetDisabled}
          size="sm"
          variant="secondary"
          onClick={resetSelection}
        >
          초기화
        </Button>
        <Button
          className="rounded-full px-6"
          disabled={isConfirmDisabled}
          size="sm"
          onClick={handleConfirm}
          onFocus={handlePreloadLibrarySearchResultDialog}
          onPointerEnter={handlePreloadLibrarySearchResultDialog}
          onTouchStart={handlePreloadLibrarySearchResultDialog}
        >
          선택 완료
        </Button>
      </div>
    </DialogFooter>
  );
}

export {RegionSelectDialogFooter};
