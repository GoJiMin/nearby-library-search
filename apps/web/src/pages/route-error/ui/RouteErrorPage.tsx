import {isRouteErrorResponse, useRouteError} from 'react-router-dom';
import {SimpleFallbackState} from '@/shared/feedback';

function RouteErrorPage() {
  const error = useRouteError();

  const descriptions = isRouteErrorResponse(error)
    ? ['요청한 화면을 불러오는 중 문제가 발생했습니다.', '홈으로 돌아가서 다시 시도해 주세요.']
    : ['예상하지 못한 문제가 발생했습니다.', '홈으로 돌아가서 다시 시도해 주세요.'];

  return (
    <SimpleFallbackState
      descriptions={descriptions}
      title="화면을 불러오지 못했어요"
    />
  );
}

export {RouteErrorPage};
