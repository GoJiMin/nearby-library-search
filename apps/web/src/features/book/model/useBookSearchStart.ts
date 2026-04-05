import {useState} from 'react';

type BookSearchMode = 'title' | 'author';

const BOOK_SEARCH_MODE_OPTIONS: ReadonlyArray<{
  label: string;
  value: BookSearchMode;
}> = [
  {
    label: '책 제목',
    value: 'title',
  },
  {
    label: '저자명',
    value: 'author',
  },
];

function useBookSearchStart() {
  const [searchMode, setSearchMode] = useState<BookSearchMode>('title');
  const [queryText, setQueryText] = useState('');

  return {
    queryText,
    searchMode,
    setQueryText,
    setSearchMode,
  };
}

export {BOOK_SEARCH_MODE_OPTIONS, useBookSearchStart};
export type {BookSearchMode};
