import type {
  BookDetailResponse,
  BookSearchResponse,
  Isbn13,
} from '@nearby-library-search/contracts'
import { requestGet } from '@/shared/request'
import type { BookSearchParams } from '../model/bookSearch'

async function getBooks({
  title,
  author,
  isbn13,
  page,
  pageSize,
}: BookSearchParams) {
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
