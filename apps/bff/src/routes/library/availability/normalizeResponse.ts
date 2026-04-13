import type {ErrorResponse, LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../../../schemas/library.js';
import {createRetryableUpstreamResponseError} from '../../../utils/error.js';
import {getLibraryApiResponseRoot, isLibraryApiRecord} from '../../../utils/libraryApiResponse.js';
import {normalizeNullableString} from '../../../utils/normalize.js';
import type {Result} from '../../../utils/result.types.js';

function normalizeLibraryAvailabilityFlag(value: unknown): LibraryAvailabilityResponse['hasBook'] | null {
  const normalizedValue = normalizeNullableString(value);

  return normalizedValue === 'Y' || normalizedValue === 'N' ? normalizedValue : null;
}

function normalizeLibraryAvailabilityResponse(
  payload: unknown,
  params: LibraryAvailabilityParams,
): Result<LibraryAvailabilityResponse> {
  const invalidResponseError: ErrorResponse = createRetryableUpstreamResponseError(
    'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
    '대출 가능 여부 조회',
  );
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
