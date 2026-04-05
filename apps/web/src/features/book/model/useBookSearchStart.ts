import {useState} from 'react';

type BookSearchMode = 'title' | 'author';

type BookSearchModeOption = {
  disabledHelperText: string;
  inputLabel: string;
  label: string;
  placeholder: string;
  value: BookSearchMode;
};

const BOOK_SEARCH_MODE_OPTIONS: ReadonlyArray<BookSearchModeOption> = [
  {
    disabledHelperText: '검색을 시작하려면 책 제목을 입력해주세요.',
    inputLabel: '책 제목',
    label: '책 제목',
    placeholder: '찾고 싶은 책 제목을 입력해주세요',
    value: 'title',
  },
  {
    disabledHelperText: '검색을 시작하려면 저자명을 입력해주세요.',
    inputLabel: '저자명',
    label: '저자명',
    placeholder: '찾고 싶은 저자명을 입력해주세요',
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
export type {BookSearchMode, BookSearchModeOption};
