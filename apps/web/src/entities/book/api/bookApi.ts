import type {
  BookDetailResponse,
  BookSearchResponse,
  Isbn13,
} from '@nearby-library-search/contracts'
import { requestGet } from '@/shared/request'

type GetBooksParams = {
  title?: string
  author?: string
  isbn13?: Isbn13
  page?: number
  pageSize?: number
}

async function getBooks({
  title,
  author,
  isbn13,
  page,
  pageSize,
}: GetBooksParams) {
  return requestGet<BookSearchResponse>({
    endpoint: '/api/books/search',
    queryParams: {
      title,
      author,
      isbn13,
      page,
      pageSize,
    },
  })
}

async function getBookDetail(isbn13: Isbn13) {
  return requestGet<BookDetailResponse>({
    endpoint: `/api/books/${isbn13}`,
  })
}

export { getBookDetail, getBooks }
