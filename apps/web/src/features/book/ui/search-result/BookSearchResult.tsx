import type {BookSearchParams} from '@/entities/book';
import {BookSearchResultSearchBar} from './BookSearchResultSearchBar';

type BookSearchResultProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
  params: BookSearchParams;
};

function BookSearchResult({params, onSubmitSearch}: BookSearchResultProps) {
  const searchBarKey = `${params.title ? 'title' : 'author'}:${params.title ?? params.author ?? ''}`;

  return (
    <section aria-label="도서 검색 결과 화면" className="flex w-full flex-1 justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-5xl flex-col items-center gap-6">
        <BookSearchResultSearchBar
          key={searchBarKey}
          onSubmitSearch={onSubmitSearch}
          params={params}
        />
      </div>
    </section>
  );
}

export {BookSearchResult};
export type {BookSearchResultProps};
