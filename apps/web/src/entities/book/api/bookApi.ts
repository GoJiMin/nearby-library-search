import type {
  BookDetailResponse,
  BookSearchResponse,
  Isbn13,
} from '@nearby-library-search/contracts'
import { requestGet } from '@/shared/request'
import {
  BOOK_SEARCH_PAGE_SIZE,
  type BookSearchParams,
} from '../model/bookSchema'

async function getBooks({
  title,
  author,
  isbn13,
  page,
}: BookSearchParams) {
  return requestGet<BookSearchResponse>({
    endpoint: '/api/books/search',
    queryParams: {
      title,
      author,
      isbn13,
      page,
      pageSize: BOOK_SEARCH_PAGE_SIZE,
    },
  })
}

async function getBookDetail(isbn13: Isbn13) {
  return requestGet<BookDetailResponse>({
    endpoint: `/api/books/${isbn13}`,
  })
}

export { getBookDetail, getBooks }
