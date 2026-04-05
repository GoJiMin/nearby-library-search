import {useState} from 'react';

type BookSearchMode = 'title' | 'author';

type BookSearchModeMeta = {
  disabledHelperText: string;
  inputLabel: string;
  label: string;
  placeholder: string;
};

const BOOK_SEARCH_MODE_CONFIG: Readonly<Record<BookSearchMode, BookSearchModeMeta>> = {
  title: {
    disabledHelperText: '검색을 시작하려면 책 제목을 입력해주세요.',
    inputLabel: '책 제목',
    label: '책 제목',
    placeholder: '찾고 싶은 책 제목을 입력해주세요',
  },
  author: {
    disabledHelperText: '검색을 시작하려면 저자명을 입력해주세요.',
    inputLabel: '저자명',
    label: '저자명',
    placeholder: '찾고 싶은 저자명을 입력해주세요',
  },
};

const BOOK_SEARCH_MODE_ORDER: ReadonlyArray<BookSearchMode> = ['title', 'author'];

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

export {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER, useBookSearchStart};
export type {BookSearchMode, BookSearchModeMeta};
