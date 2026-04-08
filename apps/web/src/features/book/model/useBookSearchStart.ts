import {useState} from 'react';
import type {BookSearchMode} from './bookSearchStart.contract';

type UseBookSearchStartOptions = {
  initialQueryText?: string;
  initialSearchMode?: BookSearchMode;
};

function useBookSearchStart({
  initialQueryText = '',
  initialSearchMode = 'title',
}: UseBookSearchStartOptions = {}) {
  const [searchMode, setSearchMode] = useState<BookSearchMode>(initialSearchMode);
  const [queryText, setQueryText] = useState(initialQueryText);

  return {
    queryText,
    searchMode,
    setQueryText,
    setSearchMode,
  };
}

export {useBookSearchStart};
export type {UseBookSearchStartOptions};
