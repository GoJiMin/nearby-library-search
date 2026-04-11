import type {LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../schemas/library.js';
import {getLibraryApiResponseRoot, isLibraryApiRecord} from '../utils/libraryApiResponse.js';
import {normalizeNullableString} from '../utils/normalize.js';

function normalizeLibraryAvailabilityFlag(value: unknown): LibraryAvailabilityResponse['hasBook'] | null {
  const normalizedValue = normalizeNullableString(value);

  return normalizedValue === 'Y' || normalizedValue === 'N' ? normalizedValue : null;
}

function normalizeLibraryAvailabilityResponse(
  payload: unknown,
  params: LibraryAvailabilityParams,
): LibraryAvailabilityResponse | null {
  const responseRoot = getLibraryApiResponseRoot(payload);
  const result = isLibraryApiRecord(responseRoot.result) ? responseRoot.result : null;

  if (result === null) {
    return null;
  }

  const hasBook = normalizeLibraryAvailabilityFlag(result.hasBook);
  const loanAvailable = normalizeLibraryAvailabilityFlag(result.loanAvailable);

  if (hasBook === null || loanAvailable === null) {
    return null;
  }

  return {
    hasBook: hasBook as LibraryAvailabilityResponse['hasBook'],
    isbn13: params.isbn13,
    libraryCode: params.libraryCode,
    loanAvailable: loanAvailable as LibraryAvailabilityResponse['loanAvailable'],
  };
}

export {normalizeLibraryAvailabilityResponse};
