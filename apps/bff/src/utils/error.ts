import type { ErrorResponse } from '@nearby-library-search/contracts'

function createErrorResponse(
  title: ErrorResponse['title'],
  detail: string,
  status: number,
): ErrorResponse {
  return {
    detail,
    status,
    title,
  }
}

export { createErrorResponse }
