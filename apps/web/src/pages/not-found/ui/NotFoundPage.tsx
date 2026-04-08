import {SimpleFallbackState} from '@/shared/feedback';

function NotFoundPage() {
  return (
    <SimpleFallbackState
      descriptions={['요청한 경로가 존재하지 않거나 아직 준비되지 않았습니다.', '홈으로 돌아가서 다시 탐색해 주세요.']}
      title="페이지를 찾을 수 없어요"
    />
  );
}

export {NotFoundPage};
