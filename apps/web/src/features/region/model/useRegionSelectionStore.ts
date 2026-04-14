import {create} from 'zustand';
import type {RegionSelectionState} from './regionSelection.contract';

type RegionSelectionActions = {
  initializeSelection: (selection?: RegionSelectionState | null) => void;
  resetSelection: () => void;
  selectDetailRegion: (detailRegion?: RegionSelectionState['detailRegion']) => void;
  selectRegion: (region: RegionSelectionState['region']) => void;
};

type RegionSelectionStore = {
  selection: RegionSelectionState | null;
} & RegionSelectionActions;

const useRegionSelectionStore = create<RegionSelectionStore>(set => ({
  initializeSelection: selection => {
    set({
      selection: selection ?? null,
    });
  },
  resetSelection: () => {
    set({
      selection: null,
    });
  },
  selectDetailRegion: detailRegion => {
    set(currentState => {
      if (currentState.selection == null) {
        return currentState;
      }

      return {
        selection: {
          detailRegion,
          region: currentState.selection.region,
        },
      };
    });
  },
  selectRegion: region => {
    set({
      selection: {region},
    });
  },
  selection: null,
}));

export {useRegionSelectionStore};
export type {RegionSelectionActions, RegionSelectionStore};
