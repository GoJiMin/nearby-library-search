import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {Heading} from '@/shared/ui';
import {createBookSearchStartParams} from '../model/createBookSearchStartParams';
import {useBookSearchStart} from '../model/useBookSearchStart';
import {BookSearchModeTabs} from './BookSearchModeTabs';
import {BookSearchQueryForm} from './BookSearchQueryForm';
import {BookSearchSupport} from './BookSearchSupport';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const baseId = useId();
  const {queryText, searchMode, setQueryText, setSearchMode} = useBookSearchStart();
  const normalizedQuery = queryText.trim();
  const isSubmitDisabled = normalizedQuery.length === 0;

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedQuery) {
      return;
    }

    onSubmitSearch(createBookSearchStartParams({queryText, searchMode}));
  }

  return (
    <section
      aria-labelledby="book-search-start-heading"
      className="rounded-panel border-line bg-surface-strong shadow-card w-full border px-6 py-8 sm:px-8 sm:py-10"
    >
      <div className="mb-6">
        <Heading as="h2" id="book-search-start-heading" size="xl">
          도서 검색 시작
        </Heading>
      </div>

      <div className="space-y-4">
        <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
        <BookSearchQueryForm
          baseId={baseId}
          isSubmitDisabled={isSubmitDisabled}
          onQueryTextChange={setQueryText}
          onSubmit={handleSubmit}
          queryText={queryText}
          searchMode={searchMode}
        />
        <BookSearchSupport onSelectExampleQuery={setQueryText} searchMode={searchMode} />
      </div>
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
