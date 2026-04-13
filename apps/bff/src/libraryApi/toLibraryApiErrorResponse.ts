import type {ErrorResponse} from '@nearby-library-search/contracts';
import {createErrorResponse} from '../utils/error.js';

class LibraryApiRequestConfigError extends Error {
  detail;
  status;
  title;

  constructor(missingParams: string[]) {
    const detail = `필수 요청 파라미터가 누락되었습니다: ${missingParams.join(', ')}`;

    super(detail);

    this.name = 'LibraryApiRequestConfigError';
    this.title = 'LIBRARY_API_REQUIRED_PARAM_MISSING';
    this.detail = detail;
    this.status = 400;
  }
}

function toLibraryApiErrorResponse(error: unknown, fallbackError: ErrorResponse): ErrorResponse {
  if (error instanceof LibraryApiRequestConfigError) {
    return createErrorResponse(error.title, error.detail, error.status);
  }

  return fallbackError;
}

export {LibraryApiRequestConfigError, toLibraryApiErrorResponse};
