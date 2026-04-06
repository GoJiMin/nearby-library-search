import type {BookSearchParams} from '@/entities/book';
import {BookSearchStart} from '@/features/book';
import {Heading, Text} from '@/shared/ui';

function HomePage() {
  function handleSubmitSearch(_params: BookSearchParams) {}

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-9 pt-10 pb-12 text-center sm:gap-10 sm:pt-14 sm:pb-16 lg:gap-12 lg:pt-20">
      <div className="flex w-full max-w-4xl flex-col items-center gap-5 sm:gap-6">
        <Heading
          as="h1"
          className="max-w-4xl text-[clamp(3.15rem,9vw,6rem)] leading-[0.94] tracking-[-0.085em] text-balance"
          size="display"
        >
          찾고 싶은 책을
          <br />
          <span className="text-accent-strong italic">가까운 도서관으로</span>
        </Heading>
        <Text className="max-w-[38rem] text-balance text-[clamp(1rem,1.5vw,1.25rem)] leading-[1.55]" size="base">
          책 제목이나 저자명으로 먼저 검색해보세요. 원하는 책을 고른 뒤, 지금 갈 수 있는 가까운 도서관을 빠르게 찾을 수 있어요.
        </Text>
      </div>

      <div className="w-full max-w-xl">
        <BookSearchStart onSubmitSearch={handleSubmitSearch} />
      </div>
    </div>
  );
}

export {HomePage};
