import type {
  CreateRequestInitProps,
  RequestHeaders,
  RequestInitWithMethod,
  RequestQueryParams,
} from './requestType'

function buildRequestQueryString(queryParams?: RequestQueryParams) {
  if (!queryParams) {
    return ''
  }

  const searchParams = new URLSearchParams()

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()

  return queryString.length > 0 ? `?${queryString}` : ''
}

function createRequestInit({
  method,
  body,
  headers = {},
}: CreateRequestInitProps): RequestInitWithMethod {
  const normalizedHeaders: RequestHeaders = { ...headers }

  if (body instanceof FormData) {
    return {
      body,
      headers: normalizedHeaders,
      method,
    }
  }

  if (body && method !== 'GET') {
    return {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        ...normalizedHeaders,
      },
      method,
    }
  }

  return {
    headers: normalizedHeaders,
    method,
  }
}

export { buildRequestQueryString, createRequestInit }
