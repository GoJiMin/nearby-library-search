import type { RequestQueryParams } from './requestType'

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

export { buildRequestQueryString }
