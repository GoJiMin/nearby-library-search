import type {FastifyPluginAsync} from 'fastify';
import type {AppFixtures} from '../../../app/fixtures.types.js';
import {developmentConfig} from '../../../config/env.js';
import {requestLibraryApi} from '../../../libraryApi/requestLibraryApi.js';
import type {BookSearchQuery} from '../../../schemas/book.js';
import {
  createRetryableUpstreamRequestError,
  toLibraryApiErrorResponse,
} from '../../../utils/error.js';
import type {Result} from '../../../utils/result.types.js';
import {normalizeBookSearchResponse} from './normalizeResponse.js';
import {parseBookSearchQuery} from './parseQuery.js';

async function fetchBookSearchPayload(query: BookSearchQuery): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('BOOK_SEARCH_UPSTREAM_ERROR', '도서 검색');

  try {
    const response = await requestLibraryApi({
      endpoint: '/srchBooks',
      queryParams: {
        author: query.author,
        isbn13: query.isbn13,
        pageNo: query.page,
        pageSize: query.pageSize,
        title: query.title,
      },
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
type BookSearchFixtureResolver = AppFixtures['bookSearch'];

function createBookSearchRoute(fixtureResolver?: BookSearchFixtureResolver): FastifyPluginAsync {
  return async app => {
    app.get('/api/books/search', async (request, reply) => {
      const parsedQuery = parseBookSearchQuery(request.query);

      if (!parsedQuery.ok) {
        reply.status(parsedQuery.error.status);

        return parsedQuery.error;
      }

      if (developmentConfig.useDevFixtures && fixtureResolver) {
        const fixtureResult = fixtureResolver.resolve(parsedQuery.value);

        if (!fixtureResult.ok) {
          app.log.warn({errorTitle: fixtureResult.error.title}, 'Book search fixture response could not be resolved safely');

          reply.status(fixtureResult.error.status);

          return fixtureResult.error;
        }

        return fixtureResult.value;
      }

      const bookSearchPayload = await fetchBookSearchPayload(parsedQuery.value);

      if (!bookSearchPayload.ok) {
        app.log.warn({errorTitle: bookSearchPayload.error.title}, 'Book search upstream request failed');

        reply.status(bookSearchPayload.error.status);

        return bookSearchPayload.error;
      }

      const normalizedBookSearchResponse = normalizeBookSearchResponse(bookSearchPayload.value);

      if (!normalizedBookSearchResponse.ok) {
        app.log.warn(
          {errorTitle: normalizedBookSearchResponse.error.title},
          'Book search upstream response could not be normalized',
        );

        reply.status(normalizedBookSearchResponse.error.status);

        return normalizedBookSearchResponse.error;
      }

      return normalizedBookSearchResponse.value;
    });
  };
}

export {createBookSearchRoute};
