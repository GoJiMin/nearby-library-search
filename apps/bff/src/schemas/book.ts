import {z} from 'zod';
import {createPositiveIntegerQuerySchema, normalizeOptionalQueryString} from './query.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;
const MAX_SEARCH_TERM_LENGTH = 100;

const bookSearchQuerySchema = z
  .object({
    author: z.preprocess(normalizeOptionalQueryString, z.string().max(MAX_SEARCH_TERM_LENGTH).optional()),
    isbn13: z.preprocess(
      normalizeOptionalQueryString,
      z
        .string()
        .regex(/^\d{13}$/)
        .optional(),
    ),
    page: createPositiveIntegerQuerySchema(DEFAULT_PAGE),
    pageSize: createPositiveIntegerQuerySchema(DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
    title: z.preprocess(normalizeOptionalQueryString, z.string().max(MAX_SEARCH_TERM_LENGTH).optional()),
  })
  .refine(({title, author, isbn13}) => Boolean(title || author || isbn13), {
    message: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
    path: ['query'],
  });

const bookDetailParamsSchema = z.object({
  isbn13: z.preprocess(normalizeOptionalQueryString, z.string().regex(/^\d{13}$/)),
});

type BookSearchQuery = z.infer<typeof bookSearchQuerySchema>;
type BookDetailParams = z.infer<typeof bookDetailParamsSchema>;

export {
  bookDetailParamsSchema,
  bookSearchQuerySchema,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_SEARCH_TERM_LENGTH,
};
export type {BookDetailParams, BookSearchQuery};
