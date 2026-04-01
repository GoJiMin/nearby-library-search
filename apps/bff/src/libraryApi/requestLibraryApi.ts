import { libraryApiConfig } from '../config/env.js'

type LibraryApiEndpoint = '/srchBooks' | '/srchDtlList' | '/libSrchByBook'

type LibraryApiQueryValue = string | number | boolean | null | undefined

type LibraryApiQueryParams = Record<string, LibraryApiQueryValue>

type RequestLibraryApiProps = {
  endpoint: LibraryApiEndpoint
  queryParams?: LibraryApiQueryParams
}

const LIBRARY_API_REQUEST_TIMEOUT_MS = 5000

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
    if (value === null || value === undefined) {
      return
    }

    requestUrl.searchParams.set(key, String(value))
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
