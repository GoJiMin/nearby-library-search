import {useState} from 'react';

type BookSearchMode = 'title' | 'author';

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

export {useBookSearchStart};
export type {BookSearchMode};
