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
    detailRegionOptions,
    handleSelectDetailRegion,
    handleSelectRegion,
    selectedDetailRegion,
    selectedRegion,
  };
}

export {useRegionSelectDialogDraft};
export type {UseRegionSelectDialogDraftArgs};
