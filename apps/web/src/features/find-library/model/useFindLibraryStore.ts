import {create} from 'zustand';
import type {DetailRegionCode, LibraryCode, RegionCode} from '@nearby-library-search/contracts';
import {parseSearchLibrariesParams} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';

type RegionSelectionState = {
  detailRegion?: DetailRegionCode;
  region: RegionCode;
};

type FindLibraryState = {
  currentLibrarySearchParams: LibrarySearchParams | null;
  lastRegionSelection: RegionSelectionState | null;
  libraryResultBook: BookSelectionActionPayload | null;
  regionDialogBook: BookSelectionActionPayload | null;
  resolvedLibraryTotalCount: number | null;
  selectedLibraryCode: LibraryCode | null;
};

type FindLibraryActions = {
  backToRegionSelect: () => void;
  changeLibraryResultPage: (page: number) => void;
  closeLibraryResultDialog: () => void;
  closeRegionDialog: () => void;
  confirmRegion: (params: LibrarySearchParams) => void;
  openRegionDialog: (payload: BookSelectionActionPayload) => void;
  resetFindLibraryFlow: () => void;
  selectLibrary: (code: LibraryCode) => void;
  setResolvedLibraryTotalCount: (totalCount: number) => void;
};

type FindLibraryStore = FindLibraryState & FindLibraryActions;

function createInitialState(): FindLibraryState {
  return {
    currentLibrarySearchParams: null,
    lastRegionSelection: null,
    libraryResultBook: null,
    regionDialogBook: null,
    resolvedLibraryTotalCount: null,
    selectedLibraryCode: null,
  };
}

const useFindLibraryStore = create<FindLibraryStore>((set, get) => ({
  ...createInitialState(),
  backToRegionSelect: () => {
    const {libraryResultBook} = get();

    if (libraryResultBook == null) {
      return;
    }

    set({
      currentLibrarySearchParams: null,
      libraryResultBook: null,
      regionDialogBook: libraryResultBook,
      resolvedLibraryTotalCount: null,
      selectedLibraryCode: null,
    });
  },
  changeLibraryResultPage: page => {
    const {currentLibrarySearchParams} = get();

    if (currentLibrarySearchParams == null) {
      return;
    }

    set({
      currentLibrarySearchParams: parseSearchLibrariesParams({
        ...currentLibrarySearchParams,
        page,
      }),
      selectedLibraryCode: null,
    });
  },
  closeLibraryResultDialog: () => {
    set({
      currentLibrarySearchParams: null,
      libraryResultBook: null,
      resolvedLibraryTotalCount: null,
      selectedLibraryCode: null,
    });
  },
  closeRegionDialog: () => {
    set({
      regionDialogBook: null,
    });
  },
  confirmRegion: params => {
    const {regionDialogBook} = get();

    set({
      currentLibrarySearchParams: parseSearchLibrariesParams({
        ...params,
        page: 1,
      }),
      lastRegionSelection: {
        detailRegion: params.detailRegion,
        region: params.region,
      },
      libraryResultBook: regionDialogBook,
      regionDialogBook: null,
      resolvedLibraryTotalCount: null,
      selectedLibraryCode: null,
    });
  },
  openRegionDialog: payload => {
    set({
      regionDialogBook: payload,
    });
  },
  resetFindLibraryFlow: () => {
    set(createInitialState());
  },
  selectLibrary: code => {
    set({
      selectedLibraryCode: code,
    });
  },
  setResolvedLibraryTotalCount: totalCount => {
    if (get().resolvedLibraryTotalCount === totalCount) {
      return;
    }

    set({
      resolvedLibraryTotalCount: totalCount,
    });
  },
}));

export {useFindLibraryStore};
export type {FindLibraryActions, FindLibraryState, FindLibraryStore, RegionSelectionState};
