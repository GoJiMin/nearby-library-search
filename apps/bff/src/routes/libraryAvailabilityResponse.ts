import type {ErrorResponse, LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../schemas/library.js';
import {getLibraryApiResponseRoot, isLibraryApiRecord} from '../utils/libraryApiResponse.js';
import {normalizeNullableString} from '../utils/normalize.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

function normalizeLibraryAvailabilityFlag(value: unknown): LibraryAvailabilityResponse['hasBook'] | null {
  const normalizedValue = normalizeNullableString(value);

  return normalizedValue === 'Y' || normalizedValue === 'N' ? normalizedValue : null;
}

function normalizeLibraryAvailabilityResponse(
  payload: unknown,
  params: LibraryAvailabilityParams,
): Result<LibraryAvailabilityResponse> {
  const invalidResponseError: ErrorResponse = {
    detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    status: 502,
    title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
  };
  const responseRoot = getLibraryApiResponseRoot(payload);
  const result = isLibraryApiRecord(responseRoot.result) ? responseRoot.result : null;

  if (result === null) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  const hasBook = normalizeLibraryAvailabilityFlag(result.hasBook);
  const loanAvailable = normalizeLibraryAvailabilityFlag(result.loanAvailable);

  if (hasBook === null || loanAvailable === null) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  return {
    ok: true,
    value: {
      hasBook,
      isbn13: params.isbn13,
      libraryCode: params.libraryCode,
      loanAvailable,
    },
  };
}

export {normalizeLibraryAvailabilityResponse};
