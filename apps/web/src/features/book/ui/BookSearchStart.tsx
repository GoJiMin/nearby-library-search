import type {SyntheticEvent} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {Button, Heading, Input, Text} from '@/shared/ui';
import {useBookSearchStart} from '../model/useBookSearchStart';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const {queryText, searchMode, setQueryText} = useBookSearchStart();
  const normalizedQuery = queryText.trim();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedQuery) {
      return;
    }

    onSubmitSearch(
      searchMode === 'title'
        ? {
            page: 1,
            title: normalizedQuery,
          }
        : {
            author: normalizedQuery,
            page: 1,
          },
    );
  }

  return (
    <section
      aria-labelledby="book-search-start-heading"
      className="rounded-panel border-line bg-surface-strong shadow-card w-full border px-6 py-8 sm:px-8 sm:py-10"
    >
      <div className="mb-6 space-y-2">
        <Heading as="h2" id="book-search-start-heading" size="xl">
          도서 검색 시작
        </Heading>
        <Text size="sm">첫 검색 시작 기능의 상태 경계와 제출 구조를 준비합니다.</Text>
      </div>

      <form aria-label="도서 검색 시작" className="space-y-4" onSubmit={handleSubmit}>
        <Text as="p" size="sm">
          검색 기준: {searchMode === 'title' ? '책 제목' : '저자명'}
        </Text>

        <div className="space-y-2">
          <label className="text-text text-sm font-medium" htmlFor="book-search-start-input">
            검색어
          </label>
          <Input
            id="book-search-start-input"
            name="queryText"
            onChange={event => setQueryText(event.target.value)}
            value={queryText}
          />
        </div>

        <Button disabled={normalizedQuery.length === 0} type="submit">
          검색 시작
        </Button>
      </form>
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
