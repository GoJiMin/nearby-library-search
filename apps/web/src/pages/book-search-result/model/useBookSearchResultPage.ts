import type {NavigateFunction} from 'react-router-dom';
import {useShallow} from 'zustand/react/shallow';
import type {LibraryCode} from '@nearby-library-search/contracts';
import type {BookSearchParams} from '@/entities/book';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import {useBookSearchResultFlowStore} from './useBookSearchResultFlowStore';

type UseBookSearchResultPageArgs = {
  navigate: NavigateFunction;
  params: BookSearchParams;
};

function useBookSearchResultPage({navigate, params}: UseBookSearchResultPageArgs) {
  const {
    backToRegionSelect,
    changeLibraryResultPage,
    closeLibraryResultDialog,
    closeRegionDialog,
    confirmRegion,
    currentLibrarySearchParams,
    lastRegionSelection,
    libraryResultBook,
    openRegionDialog,
    resetBookSearchResultFlow,
    regionDialogBook,
    selectedLibraryCode,
    selectLibrary,
  } = useBookSearchResultFlowStore(
    useShallow(state => ({
      backToRegionSelect: state.backToRegionSelect,
      changeLibraryResultPage: state.changeLibraryResultPage,
      closeLibraryResultDialog: state.closeLibraryResultDialog,
      closeRegionDialog: state.closeRegionDialog,
      confirmRegion: state.confirmRegion,
      currentLibrarySearchParams: state.currentLibrarySearchParams,
      lastRegionSelection: state.lastRegionSelection,
      libraryResultBook: state.libraryResultBook,
      openRegionDialog: state.openRegionDialog,
      resetBookSearchResultFlow: state.resetBookSearchResultFlow,
      regionDialogBook: state.regionDialogBook,
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );

  function createPageHref(page: number) {
    const nextSearchParams = new URLSearchParams({
      page: String(page),
    });

    if (params.title) {
      nextSearchParams.set('title', params.title);
    }

    if (params.author) {
      nextSearchParams.set('author', params.author);
    }

    return `/books?${nextSearchParams.toString()}`;
  }

  function handleSubmitSearch(nextParams: BookSearchParams) {
    const nextSearchParams = new URLSearchParams({
      page: String(nextParams.page),
    });

    if (nextParams.title) {
      nextSearchParams.set('title', nextParams.title);
    }

    if (nextParams.author) {
      nextSearchParams.set('author', nextParams.author);
    }

    navigate({
      pathname: '/books',
      search: `?${nextSearchParams.toString()}`,
    });
  }

  function handleRegionDialogOpenChange(open: boolean) {
    if (!open) {
      closeRegionDialog();
    }
  }

  function handleLibraryResultDialogOpenChange(open: boolean) {
    if (!open) {
      closeLibraryResultDialog();
    }
  }

  function handleBackToRegionSelect() {
    backToRegionSelect();
  }

  function handleSelectBook(payload: BookSelectionActionPayload) {
    openRegionDialog(payload);
  }

  function handleSelectLibrary(code: LibraryCode) {
    selectLibrary(code);
  }

  function handleChangeLibraryResultPage(page: number) {
    changeLibraryResultPage(page);
  }

  function handleConfirmRegion(nextParams: LibrarySearchParams) {
    confirmRegion(nextParams);
  }

  return {
    createPageHref,
    currentLibrarySearchParams,
    handleBackToRegionSelect,
    handleChangeLibraryResultPage,
    handleConfirmRegion,
    handleLibraryResultDialogOpenChange,
    handleRegionDialogOpenChange,
    handleSelectLibrary,
    handleSelectBook,
    handleSubmitSearch,
    isLibraryResultDialogOpen: currentLibrarySearchParams != null && libraryResultBook != null,
    isRegionDialogOpen: regionDialogBook != null,
    lastRegionSelection,
    libraryResultBook,
    resetBookSearchResultFlow,
    selectedLibraryCode,
    selectedBook: regionDialogBook,
  };
}

export {useBookSearchResultPage};
export type {UseBookSearchResultPageArgs};
