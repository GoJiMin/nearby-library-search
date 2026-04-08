import {BOOK_SEARCH_PAGE_SIZE, useGetSearchBooks, type BookSearchParams} from '@/entities/book';
import {Heading} from '@/shared/ui';
import {BookSearchResultList} from './BookSearchResultList';
import {BookSearchResultPagination} from './BookSearchResultPagination';
import {BookSearchResultEmptyContent} from './states/BookSearchResultEmptyContent';

type BookSearchResultContentProps = {
  createPageHref: (page: number) => string;
  params: BookSearchParams;
  queryText: string;
};

function BookSearchResultContent({createPageHref, params, queryText}: BookSearchResultContentProps) {
  const {items, totalCount} = useGetSearchBooks(params);
  const totalPages = Math.ceil(totalCount / BOOK_SEARCH_PAGE_SIZE);

  if (totalCount === 0) {
    return <BookSearchResultEmptyContent queryText={queryText} />;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <Heading as="h1" size="lg">
        <span className="text-accent">{queryText}</span>에 대한 {totalCount}개의 검색 결과가 있습니다.
      </Heading>
      <BookSearchResultList items={items} />
      <BookSearchResultPagination
        createPageHref={createPageHref}
        currentPage={params.page}
        totalPages={totalPages}
      />
    </div>
  );
}

export {BookSearchResultContent};
export type {BookSearchResultContentProps};
