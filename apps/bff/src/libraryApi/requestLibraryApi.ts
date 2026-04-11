import {libraryApiConfig} from '../config/env.js';

type LibraryApiEndpoint = '/srchBooks' | '/srchDtlList' | '/libSrchByBook' | '/bookExist';

type LibraryApiQueryValue = string | number | boolean | null | undefined;

type LibraryApiQueryParams = Record<string, LibraryApiQueryValue>;

type RequestLibraryApiProps = {
  endpoint: LibraryApiEndpoint;
  queryParams?: LibraryApiQueryParams;
  requiredQueryParams?: string[];
};

const LIBRARY_API_REQUEST_TIMEOUT_MS = 5000;

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

function isEmptyQueryValue(value: LibraryApiQueryValue) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  return false;
}

function assertRequiredQueryParams(queryParams: LibraryApiQueryParams, requiredQueryParams: string[]) {
  const missingParams = requiredQueryParams.filter(key => isEmptyQueryValue(queryParams[key]));

  if (missingParams.length > 0) {
    throw new LibraryApiRequestConfigError(missingParams);
  }
}

function createLibraryApiUrl({endpoint, queryParams = {}}: RequestLibraryApiProps) {
  const requestUrl = new URL(endpoint.slice(1), `${libraryApiConfig.baseUrl.replace(/\/$/, '')}/`);

  requestUrl.searchParams.set('authKey', libraryApiConfig.authKey);
  requestUrl.searchParams.set('format', 'json');

  Object.entries(queryParams).forEach(([key, value]) => {
    if (isEmptyQueryValue(value)) {
      return;
    }

    requestUrl.searchParams.set(key, typeof value === 'string' ? value.trim() : String(value));
  });

  return requestUrl;
}

async function requestLibraryApi({endpoint, queryParams, requiredQueryParams = []}: RequestLibraryApiProps) {
  assertRequiredQueryParams(queryParams ?? {}, requiredQueryParams);

  const requestUrl = createLibraryApiUrl({endpoint, queryParams});

  return fetch(requestUrl, {
    method: 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(LIBRARY_API_REQUEST_TIMEOUT_MS),
  });
}

export type {LibraryApiEndpoint, LibraryApiQueryParams, LibraryApiQueryValue};
export {LibraryApiRequestConfigError, requestLibraryApi};
