import { getBooks } from '../api/bookApi'
import {
  normalizeBookSearchParams,
  type BookSearchParams,
  type NormalizedBookSearchParams,
} from './bookSearch'

function createBookSearchQueryKey(params: NormalizedBookSearchParams) {
  return [...booksQueryKeys.search.all(), params] as const
}

const booksQueryKeys = {
  all: () => ['books'] as const,
  search: {
    all: () => [...booksQueryKeys.all(), 'search'] as const,
    list: (params: BookSearchParams) =>
      createBookSearchQueryKey(normalizeBookSearchParams(params)),
  },
}

const booksQueryOptions = {
  search: (params: BookSearchParams) => {
    const normalizedParams = normalizeBookSearchParams(params)

    return {
      queryFn: () => getBooks(normalizedParams),
      queryKey: createBookSearchQueryKey(normalizedParams),
    }
  },
}

export { booksQueryKeys, booksQueryOptions }
