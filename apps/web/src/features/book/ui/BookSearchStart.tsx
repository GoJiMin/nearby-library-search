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
    <section aria-labelledby="book-search-start-heading" className="w-full">
      <Heading as="h2" className="sr-only" id="book-search-start-heading" size="md">
        도서 검색 시작
      </Heading>

      <div className="space-y-4">
        <div className="space-y-3 rounded-[30px] border border-white/80 bg-white/90 p-3 shadow-[0_22px_52px_-30px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-4">
          <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
          <BookSearchQueryForm
            baseId={baseId}
            isSubmitDisabled={isSubmitDisabled}
            onQueryTextChange={setQueryText}
            onSubmit={handleSubmit}
            queryText={queryText}
            searchMode={searchMode}
          />
        </div>

        <div className="px-1">
          <BookSearchSupport onSelectExampleQuery={setQueryText} searchMode={searchMode} />
        </div>
      </div>
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
