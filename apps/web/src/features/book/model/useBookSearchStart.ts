import {useState} from 'react';
import type {BookSearchMode} from './bookSearchStart';

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
