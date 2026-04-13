import type {BookSearchItem, BookSearchResponse, ErrorResponse} from '@nearby-library-search/contracts';
import {z} from 'zod';
import type {BookSearchQuery} from '../../../../src/schemas/book.js';
import {createRetryableUpstreamResponseError} from '../../../../src/utils/error.js';
import {bookSearchFixtureItems} from './data.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

type BookSearchFixtureResolverOptions = {
  createResponse?: (query: BookSearchQuery) => unknown;
};

const bookSearchFixtureItemSchema = z.object({
  author: z.string(),
  detailUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
  isbn13: z.string().regex(/^\d{13}$/),
  loanCount: z.number().nullable(),
  publicationYear: z.string().nullable(),
  publisher: z.string().nullable(),
  title: z.string(),
});

const bookSearchFixtureResponseSchema = z.object({
  items: z.array(bookSearchFixtureItemSchema),
  totalCount: z.number().int().nonnegative(),
});

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

function matchesBookSearchFixtureItem(item: BookSearchItem, query: BookSearchQuery) {
  if (query.isbn13) {
    return item.isbn13 === query.isbn13;
  }

  if (query.title) {
    return normalizeSearchTerm(item.title).includes(normalizeSearchTerm(query.title));
  }

  if (query.author) {
    return normalizeSearchTerm(item.author).includes(normalizeSearchTerm(query.author));
  }

  return false;
}

function createBookSearchFixtureResponse(query: BookSearchQuery): BookSearchResponse {
  const filteredItems = bookSearchFixtureItems.filter(item => matchesBookSearchFixtureItem(item, query));
  const startIndex = (query.page - 1) * query.pageSize;
  const endIndex = startIndex + query.pageSize;

  return {
    items: filteredItems.slice(startIndex, endIndex),
    totalCount: filteredItems.length,
  };
}

function resolveBookSearchFixtureResult(
  query: BookSearchQuery,
  options: BookSearchFixtureResolverOptions = {},
): Result<BookSearchResponse> {
  const createResponse = options.createResponse ?? createBookSearchFixtureResponse;

  try {
    const response = createResponse(query);
    const parsedResponse = bookSearchFixtureResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      return {
        ok: false,
        error: createRetryableUpstreamResponseError('BOOK_SEARCH_RESPONSE_INVALID', '도서 검색'),
      };
    }

    return {
      ok: true,
      value: parsedResponse.data,
    };
  } catch {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError('BOOK_SEARCH_RESPONSE_INVALID', '도서 검색'),
    };
  }
}

export {resolveBookSearchFixtureResult};
