import { libraryApiConfig } from '../config/env.js'

type LibraryApiEndpoint = '/srchBooks' | '/srchDtlList' | '/libSrchByBook'

type LibraryApiQueryValue = string | number | boolean | null | undefined

type LibraryApiQueryParams = Record<string, LibraryApiQueryValue>

type RequestLibraryApiProps = {
  endpoint: LibraryApiEndpoint
  queryParams?: LibraryApiQueryParams
}

const LIBRARY_API_REQUEST_TIMEOUT_MS = 5000

function isEmptyQueryValue(value: LibraryApiQueryValue) {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim().length === 0
  }

  return false
}

function createLibraryApiUrl({
  endpoint,
  queryParams = {},
}: RequestLibraryApiProps) {
  const requestUrl = new URL(
    endpoint.slice(1),
    `${libraryApiConfig.baseUrl.replace(/\/$/, '')}/`,
  )

  requestUrl.searchParams.set('authKey', libraryApiConfig.authKey)
  requestUrl.searchParams.set('format', 'json')

  Object.entries(queryParams).forEach(([key, value]) => {
    if (isEmptyQueryValue(value)) {
      return
    }

    requestUrl.searchParams.set(
      key,
      typeof value === 'string' ? value.trim() : String(value),
    )
  })

  return requestUrl
}

async function requestLibraryApi({
  endpoint,
  queryParams,
}: RequestLibraryApiProps) {
  const requestUrl = createLibraryApiUrl({ endpoint, queryParams })

  return fetch(requestUrl, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
    redirect: 'error',
    signal: AbortSignal.timeout(LIBRARY_API_REQUEST_TIMEOUT_MS),
  })
}

export type {
  LibraryApiEndpoint,
  LibraryApiQueryParams,
  LibraryApiQueryValue,
}
export { requestLibraryApi }
