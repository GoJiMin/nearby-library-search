import type {FastifyPluginAsync} from 'fastify';
import type {AppFixtures} from '../../../app/fixtures.types.js';
import {developmentConfig} from '../../../config/env.js';
import {requestLibraryApi} from '../../../libraryApi/requestLibraryApi.js';
import {
  createRetryableUpstreamRequestError,
  toLibraryApiErrorResponse,
} from '../../../utils/error.js';
import type {Result} from '../../../utils/result.types.js';
import {normalizeBookDetailResponse} from './normalizeResponse.js';
import {parseBookDetailParams} from './parseParams.js';

async function fetchBookDetailPayload(isbn13: string): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('BOOK_DETAIL_UPSTREAM_ERROR', '도서 상세');

  try {
    const response = await requestLibraryApi({
      endpoint: '/srchDtlList',
      queryParams: {
        isbn13,
        loaninfoYN: 'Y',
      },
      requiredQueryParams: ['isbn13'],
    });

    if (!response.ok) {
      return {
        ok: false,
        error: upstreamError,
      };
    }

    return {
      ok: true,
      value: await response.json(),
    };
  } catch (error) {
    return {
      ok: false,
      error: toLibraryApiErrorResponse(error, upstreamError),
    };
  }
}
type BookDetailFixtureResolver = AppFixtures['bookDetail'];

function createBookDetailRoute(fixtureResolver?: BookDetailFixtureResolver): FastifyPluginAsync {
  return async app => {
    app.get('/api/books/:isbn13', async (request, reply) => {
      const parsedParams = parseBookDetailParams(request.params);

      if (!parsedParams.ok) {
        reply.status(parsedParams.error.status);

        return parsedParams.error;
      }

      if (developmentConfig.useDevFixtures && fixtureResolver) {
        const fixtureResult = fixtureResolver.resolve(parsedParams.value);

        if (!fixtureResult.ok) {
          reply.status(fixtureResult.error.status);

          return fixtureResult.error;
        }

        return fixtureResult.value;
      }

      const bookDetailPayload = await fetchBookDetailPayload(parsedParams.value.isbn13);

      if (!bookDetailPayload.ok) {
        app.log.warn({errorTitle: bookDetailPayload.error.title}, 'Book detail upstream request failed');

        reply.status(bookDetailPayload.error.status);

        return bookDetailPayload.error;
      }

      const normalizedBookDetailResponse = normalizeBookDetailResponse(bookDetailPayload.value);

      if (!normalizedBookDetailResponse.ok) {
        app.log.warn(
          {errorTitle: normalizedBookDetailResponse.error.title},
          'Book detail upstream response could not be normalized',
        );

        reply.status(normalizedBookDetailResponse.error.status);

        return normalizedBookDetailResponse.error;
      }

      return normalizedBookDetailResponse.value;
    });
  };
}

export {createBookDetailRoute};
