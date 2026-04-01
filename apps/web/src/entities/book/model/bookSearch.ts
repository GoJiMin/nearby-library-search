import type { Isbn13 } from '@nearby-library-search/contracts'
import { z } from 'zod'
import {
  createOptionalTrimmedStringSchema,
  createPositiveIntegerSchema,
  normalizeOptionalString,
} from '@/shared/validation'

const DEFAULT_BOOK_SEARCH_PAGE = 1
const DEFAULT_BOOK_SEARCH_PAGE_SIZE = 10
const MAX_BOOK_SEARCH_PAGE_SIZE = 20
const MAX_BOOK_SEARCH_TERM_LENGTH = 100

type BookSearchParams = {
  title?: string
  author?: string
  isbn13?: Isbn13
  page?: number
  pageSize?: number
}

type NormalizedBookSearchParams = {
  title?: string
  author?: string
  isbn13?: Isbn13
  page: number
  pageSize: number
}

const bookSearchParamsSchema = z
  .object({
    author: createOptionalTrimmedStringSchema(MAX_BOOK_SEARCH_TERM_LENGTH),
    isbn13: z.preprocess(
      normalizeOptionalString,
      z.string().regex(/^\d{13}$/).optional(),
    ),
    page: createPositiveIntegerSchema(DEFAULT_BOOK_SEARCH_PAGE),
    pageSize: createPositiveIntegerSchema(
      DEFAULT_BOOK_SEARCH_PAGE_SIZE,
      MAX_BOOK_SEARCH_PAGE_SIZE,
    ),
    title: createOptionalTrimmedStringSchema(MAX_BOOK_SEARCH_TERM_LENGTH),
  })
  .refine(({ title, author, isbn13 }) => Boolean(title || author || isbn13), {
    message: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
    path: ['query'],
  })

function normalizeBookSearchParams(
  params: BookSearchParams,
): NormalizedBookSearchParams {
  return bookSearchParamsSchema.parse(params)
}

export { normalizeBookSearchParams }
export type { BookSearchParams, NormalizedBookSearchParams }
