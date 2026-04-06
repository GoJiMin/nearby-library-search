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
      className="w-full rounded-[28px] border border-white/70 bg-white/90 p-3 shadow-card backdrop-blur-xl sm:p-4"
    >
      <div className="mb-3 px-1">
        <Heading
          as="h2"
          className="text-left text-[0.7rem] leading-5 font-medium tracking-[0.14em] text-text-muted uppercase"
          id="book-search-start-heading"
          size="md"
        >
          도서 검색 시작
        </Heading>
      </div>

      <div className="space-y-3">
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
