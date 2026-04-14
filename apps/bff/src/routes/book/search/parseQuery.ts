import type {ErrorResponse} from '@nearby-library-search/contracts';
import type {ZodError} from 'zod';
import {bookSearchQuerySchema} from './bookSearchQuerySchema.js';
import type {BookSearchQuery} from './bookSearchQuerySchema.js';
import {createErrorResponse} from '../../../utils/error.js';
import type {Result} from '../../../utils/result.types.js';

function getBookSearchQueryError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;
  const [issuePath] = firstIssue?.path ?? [];

  switch (issuePath) {
    case 'title':
      return createErrorResponse('BOOK_SEARCH_TITLE_INVALID', '도서명은 100자 이하의 문자열이어야 합니다.', 400);
    case 'author':
      return createErrorResponse('BOOK_SEARCH_AUTHOR_INVALID', '저자명은 100자 이하의 문자열이어야 합니다.', 400);
    case 'isbn13':
      return createErrorResponse('BOOK_SEARCH_ISBN13_INVALID', 'ISBN13은 13자리 숫자 문자열이어야 합니다.', 400);
    case 'page':
      return createErrorResponse('BOOK_SEARCH_PAGE_INVALID', 'page는 1 이상의 정수여야 합니다.', 400);
    case 'pageSize':
      return createErrorResponse('BOOK_SEARCH_PAGE_SIZE_INVALID', 'pageSize는 1 이상 20 이하의 정수여야 합니다.', 400);
    case 'query':
      return createErrorResponse(
        'BOOK_SEARCH_QUERY_MISSING',
        '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
        400,
      );
    default:
      return createErrorResponse(
        'BOOK_SEARCH_QUERY_INVALID',
        '도서 검색 요청이 올바르지 않습니다. 다시 확인해주세요.',
        400,
      );
  }
}

function parseBookSearchQuery(query: unknown): Result<BookSearchQuery> {
  const result = bookSearchQuerySchema.safeParse(query);

  if (result.success) {
    return {
      ok: true,
      value: result.data as BookSearchQuery,
    };
  }

  return {
    ok: false,
    error: getBookSearchQueryError(result.error),
  };
}

export {getBookSearchQueryError, parseBookSearchQuery};
