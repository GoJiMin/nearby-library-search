import type {LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../../../../src/routes/library/availability/libraryAvailabilityParamsSchema.js';
import {createRetryableUpstreamRequestError, createRetryableUpstreamResponseError} from '../../../../src/utils/error.js';
import type {Result} from '../../../../src/utils/result.types.js';
import {libraryAvailabilityHoldings} from './holdings.js';

function getLibraryAvailabilityFixtureResult(params: LibraryAvailabilityParams): Result<LibraryAvailabilityResponse> {
  const holding = libraryAvailabilityHoldings.find(
    item => item.isbn13 === params.isbn13 && item.libraryCode === params.libraryCode,
  );

  if (holding === undefined) {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError(
        'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
        '대출 가능 여부 조회',
      ),
    };
  }

  switch (holding.status) {
    case 'available':
      return {
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: holding.isbn13,
          libraryCode: holding.libraryCode,
          loanAvailable: 'Y',
        },
      };
    case 'unavailable':
      return {
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: holding.isbn13,
          libraryCode: holding.libraryCode,
          loanAvailable: 'N',
        },
      };
    case 'not-owned':
      return {
        ok: true,
        value: {
          hasBook: 'N',
          isbn13: holding.isbn13,
          libraryCode: holding.libraryCode,
          loanAvailable: 'N',
        },
      };
    case 'error':
      return {
        ok: false,
        error: createRetryableUpstreamRequestError(
          'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
          '대출 가능 여부 조회',
        ),
      };
  }
}

export {getLibraryAvailabilityFixtureResult};
