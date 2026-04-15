import {Heading, Text} from '@/shared/ui';

type BookSearchResultEmptyContentProps = {
  queryText: string;
};

function BookSearchResultEmptyContent({queryText}: BookSearchResultEmptyContentProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Heading as="h1" size="md">
        <span className="text-accent">{queryText}</span>에 대한 0개의 검색 결과를 찾았어요.
      </Heading>
      <Text size="sm">검색 결과가 없어요. 검색어를 조금 바꿔 다시 검색해보세요.</Text>
    </div>
  );
}

export {BookSearchResultEmptyContent};
export type {BookSearchResultEmptyContentProps};
