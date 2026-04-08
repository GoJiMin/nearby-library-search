import {ChevronLeft, ChevronRight, MoreHorizontal} from 'lucide-react';
import {Link} from 'react-router-dom';
import {LucideIcon, Text} from '@/shared/ui';
import {getBookSearchResultPaginationItems} from '../../model/bookSearchResultPagination';

type BookSearchResultPaginationProps = {
  createPageHref: (page: number) => string;
  currentPage: number;
  totalPages: number;
};

function createPageItemClassName(isCurrentPage: boolean) {
  return isCurrentPage
    ? 'bg-accent text-white font-bold shadow-[0_10px_24px_-12px_rgba(59,93,217,0.8)]'
    : 'text-text-muted font-medium hover:bg-surface-muted';
}

function BookSearchResultPagination({createPageHref, currentPage, totalPages}: BookSearchResultPaginationProps) {
  const paginationItems = getBookSearchResultPaginationItems(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="도서 검색 결과 페이지네이션" className="flex items-center justify-center gap-2 pt-6 pb-8">
      {isFirstPage ? (
        <span
          aria-label="이전 페이지"
          aria-disabled="true"
          className="border-line text-text-muted inline-flex h-10 w-10 items-center justify-center rounded-full border opacity-50"
        >
          <LucideIcon className="h-4 w-4" icon={ChevronLeft} strokeWidth={2} />
        </span>
      ) : (
        <Link
          aria-label="이전 페이지"
          className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4"
          to={createPageHref(currentPage - 1)}
        >
          <LucideIcon className="h-4 w-4" icon={ChevronLeft} strokeWidth={2} />
        </Link>
      )}

      {paginationItems.map(item => {
        if (item.type === 'ellipsis') {
          return (
            <span
              aria-label="페이지 생략"
              className="text-text-muted inline-flex h-10 w-10 items-center justify-center"
              key={item.id}
              role="img"
            >
              <LucideIcon className="h-4 w-4" icon={MoreHorizontal} strokeWidth={2} />
            </span>
          );
        }

        if (item.page === currentPage) {
          return (
            <Text
              aria-current="page"
              as="span"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm ${createPageItemClassName(true)}`}
              key={item.page}
              size="sm"
            >
              {item.page}
            </Text>
          );
        }

        return (
          <Link
            aria-label={`${item.page}페이지`}
            className={`focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors outline-none focus-visible:ring-4 ${createPageItemClassName(false)}`}
            key={item.page}
            to={createPageHref(item.page)}
          >
            {item.page}
          </Link>
        );
      })}

      {isLastPage ? (
        <span
          aria-label="다음 페이지"
          aria-disabled="true"
          className="border-line text-text-muted inline-flex h-10 w-10 items-center justify-center rounded-full border opacity-50"
        >
          <LucideIcon className="h-4 w-4" icon={ChevronRight} strokeWidth={2} />
        </span>
      ) : (
        <Link
          aria-label="다음 페이지"
          className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4"
          to={createPageHref(currentPage + 1)}
        >
          <LucideIcon className="h-4 w-4" icon={ChevronRight} strokeWidth={2} />
        </Link>
      )}
    </nav>
  );
}

export {BookSearchResultPagination};
export type {BookSearchResultPaginationProps};
