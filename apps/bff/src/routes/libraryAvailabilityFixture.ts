import type {ErrorResponse, LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../schemas/library.js';
import {createRetryableUpstreamRequestError, createRetryableUpstreamResponseError} from '../utils/error.js';
import {libraryAvailabilityFixtureItems} from './libraryAvailabilityFixture.data.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

function resolveLibraryAvailabilityFixtureResult(params: LibraryAvailabilityParams): Result<LibraryAvailabilityResponse> {
  const fixtureItem = libraryAvailabilityFixtureItems.find(
    item => item.isbn13 === params.isbn13 && item.libraryCode === params.libraryCode,
  );

  if (fixtureItem === undefined) {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError(
        'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
        '대출 가능 여부 조회',
      ),
    };
  }

  switch (fixtureItem.scenario) {
    case 'available':
      return {
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: fixtureItem.isbn13,
          libraryCode: fixtureItem.libraryCode,
          loanAvailable: 'Y',
        },
      };
    case 'unavailable':
      return {
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: fixtureItem.isbn13,
          libraryCode: fixtureItem.libraryCode,
          loanAvailable: 'N',
        },
      };
    case 'not-owned':
      return {
        ok: true,
        value: {
          hasBook: 'N',
          isbn13: fixtureItem.isbn13,
          libraryCode: fixtureItem.libraryCode,
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

export {resolveLibraryAvailabilityFixtureResult};
