import {useState} from 'react';
import {DETAIL_REGION_OPTIONS_BY_REGION} from '@/entities/region';
import type {RegionSelectionState} from './regionSelectDialog.contract';

type UseRegionSelectDialogDraftArgs = {
  lastSelection?: RegionSelectionState | null;
};

function useRegionSelectDialogDraft({lastSelection}: UseRegionSelectDialogDraftArgs) {
  const [draftSelection, setDraftSelection] = useState<RegionSelectionState | null>(() => lastSelection ?? null);

  const selectedRegion = draftSelection?.region;
  const selectedDetailRegion = draftSelection?.detailRegion;
  const detailRegionOptions = selectedRegion ? (DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []) : [];
  const isDetailRegionEnabled = selectedRegion != null;
  const isDetailRegionFallback = isDetailRegionEnabled && detailRegionOptions.length <= 1;
  const visibleDetailRegionOptions = isDetailRegionFallback ? [] : detailRegionOptions;
  const detailRegionHelperMessage =
    selectedRegion == null
      ? '시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.'
      : isDetailRegionFallback
        ? '세부 지역 없이 이 지역 전체를 검색합니다.'
        : null;

  function handleSelectRegion(region: RegionSelectionState['region']) {
    setDraftSelection({region});
  }

  function handleSelectDetailRegion(detailRegion?: RegionSelectionState['detailRegion']) {
    setDraftSelection(currentDraft => {
      if (currentDraft == null) {
        return currentDraft;
      }

      return {
        detailRegion,
        region: currentDraft.region,
      };
    });
  }

  return {
    detailRegionHelperMessage,
    handleSelectDetailRegion,
    handleSelectRegion,
    isDetailRegionEnabled,
    isDetailRegionFallback,
    selectedDetailRegion,
    selectedRegion,
    visibleDetailRegionOptions,
  };
}

export {useRegionSelectDialogDraft};
export type {UseRegionSelectDialogDraftArgs};
