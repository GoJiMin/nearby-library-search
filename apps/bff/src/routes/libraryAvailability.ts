import type {ErrorResponse} from '@nearby-library-search/contracts';
import type {FastifyPluginAsync} from 'fastify';
import {parseLibraryAvailabilityParams} from './libraryAvailabilityParams.js';
import {normalizeLibraryAvailabilityResponse} from './libraryAvailabilityResponse.js';
import {requestLibraryApi} from '../libraryApi/requestLibraryApi.js';
import {createRetryableUpstreamRequestError, toLibraryApiErrorResponse} from '../utils/error.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

async function fetchLibraryAvailabilityPayload(libraryCode: string, isbn13: string): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('LIBRARY_AVAILABILITY_UPSTREAM_ERROR', '대출 가능 여부 조회');

  try {
    const response = await requestLibraryApi({
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

export const libraryAvailabilityRoute: FastifyPluginAsync = async app => {
  app.get('/api/libraries/:libraryCode/books/:isbn13/availability', async (request, reply) => {
    const parsedParams = parseLibraryAvailabilityParams(request.params);

    if (!parsedParams.ok) {
      reply.status(parsedParams.error.status);

      return parsedParams.error;
    }

    const libraryAvailabilityPayload = await fetchLibraryAvailabilityPayload(
      parsedParams.value.libraryCode,
      parsedParams.value.isbn13,
    );

    if (!libraryAvailabilityPayload.ok) {
      app.log.warn({errorTitle: libraryAvailabilityPayload.error.title}, 'Library availability upstream request failed');

      reply.status(libraryAvailabilityPayload.error.status);

      return libraryAvailabilityPayload.error;
    }

    const normalizedLibraryAvailabilityResponse = normalizeLibraryAvailabilityResponse(
      libraryAvailabilityPayload.value,
      parsedParams.value,
    );

    if (!normalizedLibraryAvailabilityResponse.ok) {
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
