import type {BookSearchParams} from '@/entities/book';
import {Card, Heading, Text} from '@/shared/ui';

type BookSearchResultScreenProps = {
  params: BookSearchParams;
};

function BookSearchResultScreen({params}: BookSearchResultScreenProps) {
  const searchModeLabel = params.title ? '책 제목' : '저자명';
  const queryText = params.title ?? params.author ?? '';

  return (
    <section
      aria-labelledby="book-search-result-heading"
      className="flex w-full flex-1 justify-center px-4 py-12 sm:px-6"
    >
      <div className="flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <Heading as="h1" id="book-search-result-heading" size="xl">
            검색 결과
          </Heading>
          <Text size="sm">{`"${queryText}" 검색 상태를 기준으로 결과 화면을 구성합니다.`}</Text>
        </div>

        <Card aria-label="현재 도서 검색 상태" className="px-6 py-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1">
              <Text size="sm">검색 기준</Text>
              <Text as="strong" className="block text-text" size="base" tone="default">
                {searchModeLabel}
              </Text>
            </div>
            <div className="space-y-1">
              <Text size="sm">검색어</Text>
              <Text as="strong" className="block text-text" size="base" tone="default">
                {queryText}
              </Text>
            </div>
            <div className="space-y-1">
              <Text size="sm">현재 페이지</Text>
              <Text as="strong" className="block text-text" size="base" tone="default">
                {params.page}
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export {BookSearchResultScreen};
export type {BookSearchResultScreenProps};
