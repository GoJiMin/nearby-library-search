import { getBooks } from '../api/bookApi'
import type { BookSearchParams } from './bookSchema'

function createBookSearchQueryKey(params: BookSearchParams) {
  return [...booksQueryKeys.search.all(), params] as const
}

const booksQueryKeys = {
  all: () => ['books'] as const,
  search: {
    all: () => [...booksQueryKeys.all(), 'search'] as const,
    list: (params: BookSearchParams) => createBookSearchQueryKey(params),
  },
}

const booksQueryOptions = {
  search: (params: BookSearchParams) => ({
    queryFn: () => getBooks(params),
    queryKey: createBookSearchQueryKey(params),
  }),
}

export { booksQueryKeys, booksQueryOptions }
