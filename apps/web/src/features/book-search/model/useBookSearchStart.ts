import {useState} from 'react';
import type {BookSearchMode, BookSearchQueryTextByMode} from './bookSearchStart.contract';

type UseBookSearchStartOptions = {
  initialQueryTextByMode?: Partial<BookSearchQueryTextByMode>;
  initialSearchMode?: BookSearchMode;
};

function useBookSearchStart({
  initialQueryTextByMode,
  initialSearchMode = 'title',
}: UseBookSearchStartOptions = {}) {
  const [searchMode, setSearchMode] = useState<BookSearchMode>(initialSearchMode);
  const [queryTextByMode, setQueryTextByMode] = useState<BookSearchQueryTextByMode>(() => ({
    author: initialQueryTextByMode?.author ?? '',
    title: initialQueryTextByMode?.title ?? '',
  }));
  const queryText = queryTextByMode[searchMode];
  const normalizedQuery = queryText.trim();
  const canSubmit = normalizedQuery.length > 0;

  function setQueryText(nextQueryText: string) {
    setQueryTextByMode(previousQueryTextByMode => ({
      ...previousQueryTextByMode,
      [searchMode]: nextQueryText,
    }));
  }

  return {
    canSubmit,
    normalizedQuery,
    queryText,
    searchMode,
    setQueryText,
    setSearchMode,
  };
}

export {useBookSearchStart};
export type {UseBookSearchStartOptions};
