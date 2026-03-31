import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AppErrorFallback } from './AppErrorFallback'

function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <AppErrorFallback
        description={error.statusText || '요청한 화면을 열 수 없습니다.'}
        title={`${error.status} 오류가 발생했습니다`}
      />
    )
  }

  return <AppErrorFallback />
}

export { RouteErrorPage }
