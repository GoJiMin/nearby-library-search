import type {Isbn13} from '@nearby-library-search/contracts';
import {getBookDetail, getBooks} from '../api/bookApi';
import type {BookSearchParams} from './bookSchema';

function createBookSearchQueryKey(params: BookSearchParams) {
  return [...booksQueryKeys.search.all(), params] as const;
}

function createBookDetailQueryKey(isbn13: Isbn13) {
  return [...booksQueryKeys.detail.all(), isbn13] as const;
}

const booksQueryKeys = {
  all: () => ['books'] as const,
  detail: {
    all: () => [...booksQueryKeys.all(), 'detail'] as const,
    byIsbn13: (isbn13: Isbn13) => createBookDetailQueryKey(isbn13),
  },
  search: {
    all: () => [...booksQueryKeys.all(), 'search'] as const,
    list: (params: BookSearchParams) => createBookSearchQueryKey(params),
  },
};

const booksQueryOptions = {
  detail: (isbn13: Isbn13) => ({
    queryFn: () => getBookDetail(isbn13),
    queryKey: createBookDetailQueryKey(isbn13),
  }),
  search: (params: BookSearchParams) => ({
    queryFn: () => getBooks(params),
    queryKey: createBookSearchQueryKey(params),
  }),
};

export {booksQueryKeys, booksQueryOptions};
