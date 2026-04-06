import {BookSearchStart} from '@/features/book';
import type {BookSearchParams} from '@/entities/book';
import {Text} from '@/shared/ui';
import {BrandMessage} from './BrandMessage';

function HomePage() {
  function handleSubmitSearch(_params: BookSearchParams) {}

  return (
    <section className="flex h-full w-full max-w-5xl flex-1 flex-col items-center justify-center">
      <div className="mb-10 flex flex-col gap-6 text-center">
        <BrandMessage />
        <Text className="leading-[1.55] text-balance" size="base">
          궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.
          <br />
          지금 바로 빌릴 수 있는 가장 가까운 도서관을 찾아드릴게요.
        </Text>
      </div>

      <BookSearchStart onSubmitSearch={handleSubmitSearch} />
    </section>
  );
}

export {HomePage};
