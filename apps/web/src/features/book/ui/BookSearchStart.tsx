import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {Heading, Text} from '@/shared/ui';
import {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER, useBookSearchStart} from '../model/useBookSearchStart';
import {BookSearchModeTabs} from './BookSearchModeTabs';
import {BookSearchQueryForm} from './BookSearchQueryForm';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const baseId = useId();
  const {queryText, searchMode, setQueryText, setSearchMode} = useBookSearchStart();
  const activeSearchModeOption = BOOK_SEARCH_MODE_CONFIG[searchMode];
  const normalizedQuery = queryText.trim();
  const isSubmitDisabled = normalizedQuery.length === 0;

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

      <BookSearchQueryForm
        baseId={baseId}
        disabledHelperText={activeSearchModeOption.disabledHelperText}
        formLabel="도서 검색 시작"
        inputLabel={activeSearchModeOption.inputLabel}
        isSubmitDisabled={isSubmitDisabled}
        onQueryTextChange={setQueryText}
        onSubmit={handleSubmit}
        placeholder={activeSearchModeOption.placeholder}
        queryText={queryText}
        searchMode={searchMode}
      >
        <BookSearchModeTabs
          baseId={baseId}
          onChangeSearchMode={setSearchMode}
          searchMode={searchMode}
          searchModeConfig={BOOK_SEARCH_MODE_CONFIG}
          searchModeOrder={BOOK_SEARCH_MODE_ORDER}
          tabListLabel="검색 기준 선택"
        />
      </BookSearchQueryForm>
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
