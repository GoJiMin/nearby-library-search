import type {ErrorResponse} from '@nearby-library-search/contracts';
import type {ZodError} from 'zod';
import {libraryAvailabilityParamsSchema} from '../schemas/library.js';
import type {LibraryAvailabilityParams} from '../schemas/library.js';
import {createErrorResponse} from '../utils/error.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

function getLibraryAvailabilityParamsError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;

  switch (firstIssue?.path[0]) {
    case 'libraryCode':
      return createErrorResponse(
        'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
        'libraryCode는 비어 있지 않은 문자열이어야 합니다.',
        400,
      );
    case 'isbn13':
      return createErrorResponse('LIBRARY_AVAILABILITY_ISBN13_INVALID', 'isbn13은 13자리 숫자 문자열이어야 합니다.', 400);
    default:
      return createErrorResponse(
        'LIBRARY_AVAILABILITY_PARAMS_INVALID',
        '대출 가능 여부 요청 경로가 올바르지 않습니다.',
        400,
      );
  }
}

function parseLibraryAvailabilityParams(params: unknown): Result<LibraryAvailabilityParams> {
  const result = libraryAvailabilityParamsSchema.safeParse(params);

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    };
  }

  return {
    ok: false,
    error: getLibraryAvailabilityParamsError(result.error),
  };
}

export {getLibraryAvailabilityParamsError, parseLibraryAvailabilityParams};
