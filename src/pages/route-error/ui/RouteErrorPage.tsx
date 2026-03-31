import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ErrorState } from '@/shared/feedback'

function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorState
        description={error.statusText || '요청한 화면을 열 수 없습니다.'}
        title={`${error.status} 오류가 발생했습니다`}
      />
    )
  }

  return <ErrorState />
}

export { RouteErrorPage }
