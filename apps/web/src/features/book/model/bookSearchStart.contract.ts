type BookSearchMode = 'title' | 'author';

type BookSearchModeMeta = {
  disabledHelperText: string;
  exampleQueries: ReadonlyArray<string>;
  inputLabel: string;
  label: string;
  placeholder: string;
};

const BOOK_SEARCH_MODE_CONFIG: Readonly<Record<BookSearchMode, BookSearchModeMeta>> = {
  title: {
    disabledHelperText: '검색을 시작하려면 책 제목을 입력해주세요.',
    exampleQueries: ['파친코', '아몬드', '채식주의자', '하우스메이드'],
    inputLabel: '책 제목',
    label: '책 제목',
    placeholder: '찾고 싶은 책 제목을 입력해주세요',
  },
  author: {
    disabledHelperText: '검색을 시작하려면 저자명을 입력해주세요.',
    exampleQueries: ['한강', '김영하', '이민진', '무라카미 하루키'],
    inputLabel: '저자명',
    label: '저자명',
    placeholder: '찾고 싶은 저자명을 입력해주세요',
  },
};

const BOOK_SEARCH_MODE_ORDER: ReadonlyArray<BookSearchMode> = ['title', 'author'];

export {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER};
export type {BookSearchMode, BookSearchModeMeta};
