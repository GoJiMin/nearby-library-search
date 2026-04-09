import {useState} from 'react';
import {DETAIL_REGION_OPTIONS_BY_REGION} from '@/entities/region';
import type {RegionSelectionState} from './regionSelectDialog.contract';

type UseRegionSelectDialogDraftArgs = {
  lastSelection?: RegionSelectionState | null;
};

function getDetailRegionHelperMessage({
  isDetailRegionFallback,
  selectedRegion,
}: {
  isDetailRegionFallback: boolean;
  selectedRegion?: RegionSelectionState['region'];
}) {
  if (selectedRegion == null) {
    return '시/도를 먼저 선택해주세요.';
  }

  if (isDetailRegionFallback) {
    return '세종시는 세부 지역 구분이 없어 전체 지역으로 검색합니다.';
  }

  return null;
}

function useRegionSelectDialogDraft({lastSelection}: UseRegionSelectDialogDraftArgs) {
  const [draftSelection, setDraftSelection] = useState<RegionSelectionState | null>(() => lastSelection ?? null);

  const selectedRegion = draftSelection?.region;
  const selectedDetailRegion = draftSelection?.detailRegion;
  const detailRegionOptions = selectedRegion ? (DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []) : [];
  const isDetailRegionEnabled = selectedRegion != null;
  const isDetailRegionFallback = isDetailRegionEnabled && detailRegionOptions.length <= 1;
  const visibleDetailRegionOptions = isDetailRegionFallback ? [] : detailRegionOptions;
  const detailRegionHelperMessage = getDetailRegionHelperMessage({
    isDetailRegionFallback,
    selectedRegion,
  });

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
