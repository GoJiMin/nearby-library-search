import { apiConfig } from '@/shared/env'
import { RequestError, RequestGetError } from './requestError'
import type {
  CreateRequestErrorProps,
  CreateRequestInitProps,
  RequestErrorInfo,
  RequestHeaders,
  RequestInitWithMethod,
  RequestMethodProps,
  RequestProps,
  RequestQueryParams,
  WithErrorHandling,
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

function createRequestUrl({
  baseUrl = apiConfig.baseUrl ?? '',
  endpoint,
  queryParams,
}: Pick<RequestProps, 'baseUrl' | 'endpoint' | 'queryParams'>) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`
  const queryString = buildRequestQueryString(queryParams)

  return `${normalizedBaseUrl}${normalizedEndpoint}${queryString}`
}

async function handleRequestError({
  response,
  body,
  requestInit,
  errorHandlingType,
}: CreateRequestErrorProps) {
  const fallbackErrorInfo: RequestErrorInfo = {
    detail: '요청을 처리하는 중 문제가 발생했습니다.',
    status: response.status,
    title: 'REQUEST_ERROR',
  }

  let parsedErrorInfo: Partial<RequestErrorInfo> = {}

  try {
    parsedErrorInfo = (await response.json()) as Partial<RequestErrorInfo>
  } catch {
    parsedErrorInfo = {}
  }

  const errorInfo = { ...fallbackErrorInfo, ...parsedErrorInfo }

  if (requestInit.method === 'GET') {
    return new RequestGetError({
      endpoint: response.url,
      errorHandlingType,
      message: errorInfo.detail,
      method: requestInit.method,
      name: errorInfo.title,
      requestBody: body ?? null,
      status: errorInfo.status,
    })
  }

  return new RequestError({
    endpoint: response.url,
    message: errorInfo.detail,
    method: requestInit.method,
    name: errorInfo.title,
    requestBody: body ?? null,
    status: errorInfo.status,
  })
}

async function request<T>({
  withResponse = true,
  ...props
}: WithErrorHandling<RequestProps>) {
  const requestUrl = createRequestUrl(props)
  const requestInit = createRequestInit(props)
  const response = await fetch(requestUrl, requestInit)

  if (!response.ok) {
    throw await handleRequestError({
      body: props.body ?? null,
      errorHandlingType: props.errorHandlingType,
      requestInit,
      response,
    })
  }

  if (!withResponse || response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

async function requestGet<T>({
  headers = {},
  withResponse = true,
  errorHandlingType = 'errorBoundary',
  ...props
}: WithErrorHandling<RequestMethodProps>) {
  return request<T>({
    ...props,
    errorHandlingType,
    headers,
    method: 'GET',
    withResponse,
  })
}

async function requestPost<T = void>({
  headers = {},
  withResponse = false,
  ...props
}: RequestMethodProps) {
  return request<T>({
    ...props,
    headers,
    method: 'POST',
    withResponse,
  })
}

export { requestGet, requestPost }
