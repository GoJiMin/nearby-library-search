import {BookSearchStart} from '@/features/book';
import type {BookSearchParams} from '@/entities/book';
import {Text} from '@/shared/ui';
import {BrandMessage} from './BrandMessage';

function HomePage() {
  function handleSubmitSearch(_params: BookSearchParams) {}

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-9 pt-10 pb-12 text-center sm:gap-10 sm:pt-14 sm:pb-16 lg:gap-12 lg:pt-20">
      <div className="flex w-full max-w-4xl flex-col items-center gap-5 sm:gap-6">
        <BrandMessage />
        <Text className="leading-[1.55] text-balance" size="base">
          궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.
          <br />
          지금 바로 빌릴 수 있는 가장 가까운 도서관을 찾아드릴게요.
        </Text>
      </div>

      <div className="w-full max-w-xl">
        <BookSearchStart onSubmitSearch={handleSubmitSearch} />
      </div>
    </div>
  );
}

export {HomePage};
