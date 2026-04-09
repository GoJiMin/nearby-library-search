import {useState} from 'react';
import {DETAIL_REGION_OPTIONS_BY_REGION, REGION_OPTIONS} from '@/entities/region';
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
    return '시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.';
  }

  if (isDetailRegionFallback) {
    return '세종시는 세부 지역 구분이 없어 전체 지역으로 검색합니다.';
  }

  return null;
}

function getSelectionSummaryText(draftSelection: RegionSelectionState | null) {
  if (draftSelection == null) {
    return '지역을 선택해주세요';
  }

  const regionLabel = REGION_OPTIONS.find(option => option.code === draftSelection.region)?.label ?? draftSelection.region;

  if (draftSelection.detailRegion == null) {
    return `${regionLabel} 전체`;
  }

  const detailRegionLabel =
    DETAIL_REGION_OPTIONS_BY_REGION[draftSelection.region]?.find(option => option.code === draftSelection.detailRegion)?.label ??
    draftSelection.detailRegion;

  return `${regionLabel} > ${detailRegionLabel}`;
}

function useRegionSelectDialogDraft({lastSelection}: UseRegionSelectDialogDraftArgs) {
  const [draftSelection, setDraftSelection] = useState<RegionSelectionState | null>(() => lastSelection ?? null);

  const selectedRegion = draftSelection?.region;
  const selectedDetailRegion = draftSelection?.detailRegion;
  const detailRegionOptions = selectedRegion ? (DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []) : [];
  const isDetailRegionEnabled = selectedRegion != null;
  const isDetailRegionFallback = isDetailRegionEnabled && detailRegionOptions.length <= 1;
  const isSelectionComplete = draftSelection != null;
  const isResetDisabled = draftSelection == null;
  const selectionSummaryText = getSelectionSummaryText(draftSelection);
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

  function handleReset() {
    setDraftSelection(null);
  }

  return {
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
  };
}

export {useRegionSelectDialogDraft};
export type {UseRegionSelectDialogDraftArgs};
