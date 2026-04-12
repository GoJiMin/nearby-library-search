import type {BookDetailResponse, ErrorResponse} from '@nearby-library-search/contracts';
import type {BookDetailParams} from '../schemas/book.js';
import {createRetryableUpstreamRequestError, createRetryableUpstreamResponseError} from '../utils/error.js';
import {bookDetailFixtureItems} from './bookDetailFixture.data.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

function resolveBookDetailFixtureResult(params: BookDetailParams): Result<BookDetailResponse> {
  const fixtureItem = bookDetailFixtureItems.find(item => item.isbn13 === params.isbn13);

  if (fixtureItem === undefined) {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError('BOOK_DETAIL_RESPONSE_INVALID', '도서 상세'),
    };
  }

  switch (fixtureItem.scenario) {
    case 'success-rich':
    case 'success-minimal':
    case 'empty':
      if (fixtureItem.response === undefined) {
        return {
          ok: false,
          error: createRetryableUpstreamResponseError('BOOK_DETAIL_RESPONSE_INVALID', '도서 상세'),
        };
      }

      return {
        ok: true,
        value: fixtureItem.response,
      };
    case 'error':
      return {
        ok: false,
        error: createRetryableUpstreamRequestError('BOOK_DETAIL_UPSTREAM_ERROR', '도서 상세'),
      };
  }
}

export {resolveBookDetailFixtureResult};
