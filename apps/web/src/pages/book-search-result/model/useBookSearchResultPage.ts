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
  const [selectedBook, setSelectedBook] = useState<BookSelectionActionPayload | null>(null);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
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
    setIsRegionDialogOpen(open);
  }

  function handleSelectBook(payload: BookSelectionActionPayload) {
    setSelectedBook(payload);
    setIsRegionDialogOpen(true);
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
    isRegionDialogOpen,
    lastRegionSelection,
    selectedBook,
  };
}

export {useBookSearchResultPage};
export type {UseBookSearchResultPageArgs};
