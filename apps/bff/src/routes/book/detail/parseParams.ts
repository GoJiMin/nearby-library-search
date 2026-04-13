import type {ErrorResponse} from '@nearby-library-search/contracts';
import type {ZodError} from 'zod';
import {bookDetailParamsSchema} from '../../../schemas/book.js';
import type {BookDetailParams} from '../../../schemas/book.js';
import {createErrorResponse} from '../../../utils/error.js';
import type {Result} from '../../../utils/result.types.js';

function getBookDetailParamsError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;

  if (firstIssue?.path[0] === 'isbn13') {
    return createErrorResponse('BOOK_DETAIL_ISBN13_INVALID', 'isbn13은 13자리 숫자 문자열이어야 합니다.', 400);
  }

  return createErrorResponse('BOOK_DETAIL_PARAMS_INVALID', '도서 상세 요청 경로가 올바르지 않습니다.', 400);
}

function parseBookDetailParams(params: unknown): Result<BookDetailParams> {
  const result = bookDetailParamsSchema.safeParse(params);

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    };
  }

  return {
    ok: false,
    error: getBookDetailParamsError(result.error),
  };
}

export {getBookDetailParamsError, parseBookDetailParams};
