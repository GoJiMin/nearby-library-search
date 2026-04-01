import type {ErrorResponse} from '@nearby-library-search/contracts';
import {LibraryApiRequestConfigError} from '../libraryApi/requestLibraryApi.js';

const RETRYABLE_ERROR_SUFFIX = '잠시 후 다시 시도해주세요.';

function createErrorResponse(title: ErrorResponse['title'], detail: string, status: number): ErrorResponse {
  return {
    detail,
    status,
    title,
  };
}

function createRetryableUpstreamRequestError(title: ErrorResponse['title'], resourceName: string) {
  return createErrorResponse(title, `${resourceName} 정보를 불러오지 못했습니다. ${RETRYABLE_ERROR_SUFFIX}`, 502);
}

function createRetryableUpstreamResponseError(title: ErrorResponse['title'], resourceName: string) {
  return createErrorResponse(
    title,
    `${resourceName} 응답을 처리하는 중 문제가 발생했습니다. ${RETRYABLE_ERROR_SUFFIX}`,
    502,
  );
}

function toLibraryApiErrorResponse(error: unknown, fallbackError: ErrorResponse): ErrorResponse {
  if (error instanceof LibraryApiRequestConfigError) {
    return createErrorResponse(error.title, error.detail, error.status);
  }

  return fallbackError;
}

export {
  createErrorResponse,
  createRetryableUpstreamRequestError,
  createRetryableUpstreamResponseError,
  toLibraryApiErrorResponse,
};
