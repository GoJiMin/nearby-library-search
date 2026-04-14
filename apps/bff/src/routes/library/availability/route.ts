import type {FastifyPluginAsync} from 'fastify';
import type {AppFixtures} from '../../../app/fixtures.types.js';
import {developmentConfig} from '../../../config/env.js';
import {fetchLibraryApi} from '../../../libraryApi/fetchLibraryApi.js';
import {toLibraryApiErrorResponse} from '../../../libraryApi/toLibraryApiErrorResponse.js';
import {createRetryableUpstreamRequestError} from '../../../utils/error.js';
import {isErrorResult} from '../../../utils/result.js';
import type {Result} from '../../../utils/result.types.js';
import {parseLibraryAvailabilityParams} from './parseParams.js';
import {normalizeLibraryAvailabilityResponse} from './normalizeResponse.js';

async function fetchLibraryAvailabilityPayload(libraryCode: string, isbn13: string): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('LIBRARY_AVAILABILITY_UPSTREAM_ERROR', '대출 가능 여부 조회');

  try {
    const response = await fetchLibraryApi({
      endpoint: '/bookExist',
      queryParams: {
        isbn13,
        libCode: libraryCode,
      },
      requiredQueryParams: ['libCode', 'isbn13'],
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

type LibraryAvailabilityFixtureResolver = AppFixtures['libraryAvailability'];

function createLibraryAvailabilityRoute(fixtureResolver?: LibraryAvailabilityFixtureResolver): FastifyPluginAsync {
  return async app => {
    app.get('/api/libraries/:libraryCode/books/:isbn13/availability', async (request, reply) => {
      const parsedParams = parseLibraryAvailabilityParams(request.params);

      if (isErrorResult(parsedParams)) {
        reply.status(parsedParams.error.status);

        return parsedParams.error;
      }

      if (developmentConfig.useDevFixtures && fixtureResolver) {
        const fixtureResult = fixtureResolver.resolve(parsedParams.value);

        if (isErrorResult(fixtureResult)) {
          reply.status(fixtureResult.error.status);

          return fixtureResult.error;
        }

        return fixtureResult.value;
      }

      const libraryAvailabilityPayload = await fetchLibraryAvailabilityPayload(
        parsedParams.value.libraryCode,
        parsedParams.value.isbn13,
      );

      if (isErrorResult(libraryAvailabilityPayload)) {
        app.log.warn({errorTitle: libraryAvailabilityPayload.error.title}, 'Library availability upstream request failed');

        reply.status(libraryAvailabilityPayload.error.status);

        return libraryAvailabilityPayload.error;
      }

      const normalizedLibraryAvailabilityResponse = normalizeLibraryAvailabilityResponse(
        libraryAvailabilityPayload.value,
        parsedParams.value,
      );

      if (isErrorResult(normalizedLibraryAvailabilityResponse)) {
        app.log.warn(
          {errorTitle: normalizedLibraryAvailabilityResponse.error.title},
          'Library availability upstream response could not be normalized',
        );

        reply.status(normalizedLibraryAvailabilityResponse.error.status);

        return normalizedLibraryAvailabilityResponse.error;
      }

      return normalizedLibraryAvailabilityResponse.value;
    });
  };
}

export {createLibraryAvailabilityRoute};
