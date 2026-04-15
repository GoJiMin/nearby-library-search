import {Suspense} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {QueryErrorBoundary} from '@/shared/feedback';
import {BookSearchResultContent} from './BookSearchResultContent';
import {BookSearchResultSearchBar} from './BookSearchResultSearchBar';
import {BookSearchResultErrorContent} from './states/BookSearchResultErrorContent';
import {BookSearchResultLoadingContent} from './states/BookSearchResultLoadingContent';

type BookSearchResultProps = {
  createPageHref: (page: number) => string;
  onSubmitSearch: (params: BookSearchParams) => void;
  params: BookSearchParams;
};

function BookSearchResult({createPageHref, params, onSubmitSearch}: BookSearchResultProps) {
  const searchBarKey = `${params.title ? 'title' : 'author'}:${params.title ?? params.author ?? ''}`;
  const queryText = params.title ?? params.author ?? '';

  return (
    <section aria-label="도서 검색 결과 화면" className="flex w-full flex-1 justify-center py-2 sm:px-6 md:py-0">
      <div className="flex w-full max-w-5xl flex-col items-center gap-6">
        <BookSearchResultSearchBar key={searchBarKey} onSubmitSearch={onSubmitSearch} params={params} />
        <QueryErrorBoundary
          fallback={({error, reset}) => <BookSearchResultErrorContent error={error} onRetry={reset} />}
          resetKeys={[params.author, params.page, params.title]}
        >
          <Suspense fallback={<BookSearchResultLoadingContent queryText={queryText} />}>
            <BookSearchResultContent createPageHref={createPageHref} params={params} queryText={queryText} />
          </Suspense>
        </QueryErrorBoundary>
      </div>
    </section>
  );
}

export {BookSearchResult};
export type {BookSearchResultProps};
