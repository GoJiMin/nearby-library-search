export type ErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_SERVER_ERROR'

export type ErrorResponse = {
  success: false
  error: {
    code: ErrorCode
    message: string
    retryable: boolean
  }
}
