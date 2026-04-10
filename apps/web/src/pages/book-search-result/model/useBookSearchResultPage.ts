import {useState} from 'react';
import type {NavigateFunction} from 'react-router-dom';
import type {LibraryCode} from '@nearby-library-search/contracts';
import type {BookSearchParams} from '@/entities/book';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import type {RegionSelectionState} from './bookSearchResultPage.contract';

type UseBookSearchResultPageArgs = {
  navigate: NavigateFunction;
  params: BookSearchParams;
};

function useBookSearchResultPage({navigate, params}: UseBookSearchResultPageArgs) {
  const [regionDialogBook, setRegionDialogBook] = useState<BookSelectionActionPayload | null>(null);
  const [libraryResultBook, setLibraryResultBook] = useState<BookSelectionActionPayload | null>(null);
  const [lastRegionSelection, setLastRegionSelection] = useState<RegionSelectionState | null>(null);
  const [currentLibrarySearchParams, setCurrentLibrarySearchParams] = useState<LibrarySearchParams | null>(
    null,
  );
  const [selectedLibraryCode, setSelectedLibraryCode] = useState<LibraryCode | null>(null);

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
      setRegionDialogBook(null);
    }
  }

  function handleLibraryResultDialogOpenChange(open: boolean) {
    if (!open) {
      setCurrentLibrarySearchParams(null);
      setLibraryResultBook(null);
      setSelectedLibraryCode(null);
    }
  }

  function handleBackToRegionSelect() {
    if (libraryResultBook == null) {
      return;
    }

    setRegionDialogBook(libraryResultBook);
    setCurrentLibrarySearchParams(null);
    setLibraryResultBook(null);
    setSelectedLibraryCode(null);
  }

  function handleSelectBook(payload: BookSelectionActionPayload) {
    setRegionDialogBook(payload);
  }

  function handleConfirmRegion(nextParams: LibrarySearchParams) {
    setLastRegionSelection({
      detailRegion: nextParams.detailRegion,
      region: nextParams.region,
    });

    setLibraryResultBook(regionDialogBook);
    setCurrentLibrarySearchParams({
      ...nextParams,
      page: 1,
    });
    setSelectedLibraryCode(null);
    setRegionDialogBook(null);
  }

  return {
    createPageHref,
    currentLibrarySearchParams,
    handleBackToRegionSelect,
    handleConfirmRegion,
    handleLibraryResultDialogOpenChange,
    handleRegionDialogOpenChange,
    handleSelectBook,
    handleSubmitSearch,
    isLibraryResultDialogOpen: currentLibrarySearchParams != null && libraryResultBook != null,
    isRegionDialogOpen: regionDialogBook != null,
    lastRegionSelection,
    libraryResultBook,
    selectedLibraryCode,
    selectedBook: regionDialogBook,
  };
}

export {useBookSearchResultPage};
export type {UseBookSearchResultPageArgs};
