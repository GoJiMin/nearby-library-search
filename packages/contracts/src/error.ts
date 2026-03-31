export type CommonErrorTitle =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_SERVER_ERROR'

export type ErrorTitle = CommonErrorTitle | (string & {})

export type ErrorResponse = {
  title: ErrorTitle
  detail: string
  status: number
}
