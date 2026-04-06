import type {BookSearchParams} from '@/entities/book';
import {BookSearchStart} from '@/features/book';
import {Heading, Text} from '@/shared/ui';

function HomePage() {
  function handleSubmitSearch(_params: BookSearchParams) {}

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-10 pt-8 pb-10 text-center sm:gap-12 sm:pt-12 sm:pb-14 lg:gap-14 lg:pt-16">
      <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-5">
        <Heading as="h1" className="max-w-4xl text-balance" size="display">
          찾고 싶은 책을
          <br />
          <span className="text-accent-strong italic">가까운 도서관으로</span>
        </Heading>
        <Text className="max-w-2xl text-balance" size="base">
          책 제목이나 저자명으로 먼저 검색해보세요. 원하는 책을 고른 뒤, 지금 갈 수 있는 가까운 도서관을 빠르게 찾을 수 있어요.
        </Text>
      </div>

      <div className="w-full max-w-3xl">
        <BookSearchStart onSubmitSearch={handleSubmitSearch} />
      </div>
    </div>
  );
}

export {HomePage};
