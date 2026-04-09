import {useState} from 'react';
import type {NavigateFunction} from 'react-router-dom';
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
  const [lastRegionSelection] = useState<RegionSelectionState | null>(null);

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

  function handleSelectBook(payload: BookSelectionActionPayload) {
    setRegionDialogBook(payload);
  }

  function handleConfirmRegion(nextParams: LibrarySearchParams) {
    void nextParams;
  }

  return {
    createPageHref,
    handleConfirmRegion,
    handleRegionDialogOpenChange,
    handleSelectBook,
    handleSubmitSearch,
    isRegionDialogOpen: regionDialogBook != null,
    lastRegionSelection,
    selectedBook: regionDialogBook,
  };
}

export {useBookSearchResultPage};
export type {UseBookSearchResultPageArgs};
