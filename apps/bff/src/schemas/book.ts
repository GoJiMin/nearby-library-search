import { z } from 'zod'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 20
const MAX_SEARCH_TERM_LENGTH = 100

function normalizeOptionalQueryString(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return value
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function createPositiveIntegerQuerySchema(
  fallbackValue: number,
  maxValue?: number,
) {
  return z.preprocess(
    (value) => {
      if (value === undefined) {
        return fallbackValue
      }

      if (typeof value !== 'string') {
        return value
      }

      const normalizedValue = value.trim()

      if (!normalizedValue) {
        return fallbackValue
      }

      const parsedValue = Number(normalizedValue)

      return Number.isInteger(parsedValue) ? parsedValue : Number.NaN
    },
    maxValue === undefined
      ? z.number().int().min(1)
      : z.number().int().min(1).max(maxValue),
  )
}

const bookSearchQuerySchema = z
  .object({
    author: z.preprocess(
      normalizeOptionalQueryString,
      z.string().max(MAX_SEARCH_TERM_LENGTH).optional(),
    ),
    isbn13: z.preprocess(
      normalizeOptionalQueryString,
      z.string().regex(/^\d{13}$/).optional(),
    ),
    page: createPositiveIntegerQuerySchema(DEFAULT_PAGE),
    pageSize: createPositiveIntegerQuerySchema(
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
    title: z.preprocess(
      normalizeOptionalQueryString,
      z.string().max(MAX_SEARCH_TERM_LENGTH).optional(),
    ),
  })
  .refine(
    ({ title, author, isbn13 }) => Boolean(title || author || isbn13),
    {
      message: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
      path: ['query'],
    },
  )

type BookSearchQuery = z.infer<typeof bookSearchQuerySchema>

export {
  bookSearchQuerySchema,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_SEARCH_TERM_LENGTH,
}
export type { BookSearchQuery }
