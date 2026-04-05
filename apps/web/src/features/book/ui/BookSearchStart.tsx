import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {Button, Heading, Input, Text} from '@/shared/ui';
import {BOOK_SEARCH_MODE_OPTIONS, useBookSearchStart} from '../model/useBookSearchStart';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const baseId = useId();
  const {queryText, searchMode, setQueryText, setSearchMode} = useBookSearchStart();
  const normalizedQuery = queryText.trim();
  const inputId = `${baseId}-input`;
  const selectedTabId = `${baseId}-tab-${searchMode}`;
  const tabPanelId = `${baseId}-panel`;

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
        <div
          aria-label="검색 기준 선택"
          className="bg-surface-muted inline-flex w-full rounded-pill p-1 sm:w-auto"
          role="tablist"
        >
          {BOOK_SEARCH_MODE_OPTIONS.map(option => {
            const isSelected = option.value === searchMode;

            return (
              <button
                key={option.value}
                aria-controls={tabPanelId}
                aria-selected={isSelected}
                className={`focus-visible:ring-accent-soft min-h-11 flex-1 rounded-pill px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-4 sm:flex-none ${
                  isSelected ? 'bg-accent text-white shadow-soft' : 'text-text-muted hover:bg-surface-strong hover:text-text'
                }`}
                id={`${baseId}-tab-${option.value}`}
                onClick={() => setSearchMode(option.value)}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div aria-labelledby={selectedTabId} className="space-y-4" id={tabPanelId} role="tabpanel">
          <div className="space-y-2">
            <label className="text-text text-sm font-medium" htmlFor={inputId}>
              검색어
            </label>
            <Input
              id={inputId}
              name="queryText"
              onChange={event => setQueryText(event.target.value)}
              value={queryText}
            />
          </div>

          <Button disabled={normalizedQuery.length === 0} type="submit">
            검색 시작
          </Button>
        </div>
      </form>
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
