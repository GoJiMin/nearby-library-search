import type {BookSearchParams} from '@/entities/book';
import {BookSearchStart} from '@/features/book';
import {Heading} from '@/shared/ui';

function HomePage() {
  function handleSubmitSearch(_params: BookSearchParams) {}

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pt-2 sm:gap-8 sm:pt-4">
      <Heading as="h1" size="display">
        찾고 싶은 책을 먼저 검색해보세요
      </Heading>
      <BookSearchStart onSubmitSearch={handleSubmitSearch} />
    </div>
  );
}

export {HomePage};
