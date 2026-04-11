import {create} from 'zustand';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {parseSearchLibrariesParams} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import type {RegionSelectionState} from './bookSearchResultPage.contract';

type BookSearchResultFlowState = {
  currentLibrarySearchParams: LibrarySearchParams | null;
  lastRegionSelection: RegionSelectionState | null;
  libraryResultBook: BookSelectionActionPayload | null;
  regionDialogBook: BookSelectionActionPayload | null;
  selectedLibraryCode: LibraryCode | null;
};

type BookSearchResultFlowActions = {
  backToRegionSelect: () => void;
  changeLibraryResultPage: (page: number) => void;
  closeLibraryResultDialog: () => void;
  closeRegionDialog: () => void;
  confirmRegion: (params: LibrarySearchParams) => void;
  openRegionDialog: (payload: BookSelectionActionPayload) => void;
  resetBookSearchResultFlow: () => void;
  selectLibrary: (code: LibraryCode) => void;
};

type BookSearchResultFlowStore = BookSearchResultFlowState & BookSearchResultFlowActions;

function createInitialState(): BookSearchResultFlowState {
  return {
    currentLibrarySearchParams: null,
    lastRegionSelection: null,
    libraryResultBook: null,
    regionDialogBook: null,
    selectedLibraryCode: null,
  };
}

const useBookSearchResultFlowStore = create<BookSearchResultFlowStore>((set, get) => ({
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
      selectedLibraryCode: null,
    });
  },
  openRegionDialog: payload => {
    set({
      regionDialogBook: payload,
    });
  },
  resetBookSearchResultFlow: () => {
    set(createInitialState());
  },
  selectLibrary: code => {
    set({
      selectedLibraryCode: code,
    });
  },
}));

export {useBookSearchResultFlowStore};
export type {BookSearchResultFlowActions, BookSearchResultFlowState, BookSearchResultFlowStore};
