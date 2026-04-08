import {Link} from 'react-router-dom';
import {Heading, Text} from '@/shared/ui';

function NotFoundPage() {
  return (
    <section className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center">
      <Heading as="h1" size="xl" className="mb-4">
        페이지를 찾을 수 없어요
      </Heading>
      <Text size="sm">요청한 경로가 존재하지 않거나 아직 준비되지 않았습니다.</Text>
      <Text size="sm">홈으로 돌아가서 다시 탐색해 주세요.</Text>
      <Link
        className="bg-accent mt-6 inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold text-white"
        to="/"
      >
        홈으로 돌아가기
      </Link>
    </section>
  );
}

export {NotFoundPage};
