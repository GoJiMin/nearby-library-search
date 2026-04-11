import {ChevronLeft, ChevronRight, MoreHorizontal} from 'lucide-react';
import {useShallow} from 'zustand/react/shallow';
import {LIBRARY_SEARCH_PAGE_SIZE} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LucideIcon, Text} from '@/shared/ui';

type LibrarySearchResultPaginationItem =
  | {
      page: number;
      type: 'page';
    }
  | {
      id: 'ellipsis-start' | 'ellipsis-end';
      type: 'ellipsis';
    };

type LibrarySearchResultPaginationProps = {
  page?: number;
  pageSize?: number;
  totalCount: number;
};

function createPageItems(startPage: number, endPage: number): LibrarySearchResultPaginationItem[] {
  return Array.from({length: endPage - startPage + 1}, (_, index) => ({
    page: startPage + index,
    type: 'page' as const,
  }));
}

function getLibrarySearchResultPaginationItems(
  currentPage: number,
  totalPages: number,
): LibrarySearchResultPaginationItem[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 5) {
    return createPageItems(1, totalPages);
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const lastPage = totalPages;

  if (safeCurrentPage <= 3) {
    return [
      ...createPageItems(1, 3),
      {
        id: 'ellipsis-end',
        type: 'ellipsis',
      },
      {
        page: lastPage,
        type: 'page',
      },
    ];
  }

  if (safeCurrentPage >= lastPage - 2) {
    return [
      {
        page: 1,
        type: 'page',
      },
      {
        id: 'ellipsis-start',
        type: 'ellipsis',
      },
      ...createPageItems(lastPage - 2, lastPage),
    ];
  }

  return [
    {
      page: 1,
      type: 'page',
    },
    {
      id: 'ellipsis-start',
      type: 'ellipsis',
    },
    {
      page: safeCurrentPage,
      type: 'page',
    },
    {
      id: 'ellipsis-end',
      type: 'ellipsis',
    },
    {
      page: lastPage,
      type: 'page',
    },
  ];
}

function createPageItemClassName(isCurrentPage: boolean) {
  return isCurrentPage
    ? 'bg-accent text-white font-bold shadow-[0_10px_24px_-12px_rgba(59,93,217,0.8)]'
    : 'text-text-muted font-medium hover:bg-surface-muted';
}

function LibrarySearchResultPagination({page, pageSize, totalCount}: LibrarySearchResultPaginationProps) {
  const {changeLibraryResultPage, fallbackPage} = useFindLibraryStore(
    useShallow(state => ({
      changeLibraryResultPage: state.changeLibraryResultPage,
      fallbackPage: state.currentLibrarySearchParams?.page,
    })),
  );
  const currentPage = page ?? fallbackPage ?? 1;
  const resolvedPageSize = pageSize ?? LIBRARY_SEARCH_PAGE_SIZE;
  const totalPages = Math.ceil(totalCount / resolvedPageSize);
  const paginationItems = getLibrarySearchResultPaginationItems(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="도서관 검색 결과 페이지네이션" className="flex items-center justify-center gap-2">
      <button
        aria-label="이전 페이지"
        className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        disabled={isFirstPage}
        onClick={() => changeLibraryResultPage(currentPage - 1)}
        type="button"
      >
        <LucideIcon className="h-4 w-4" icon={ChevronLeft} strokeWidth={2} />
      </button>

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
          <button
            aria-label={`${item.page}페이지`}
            className={`focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors outline-none focus-visible:ring-4 ${createPageItemClassName(false)}`}
            key={item.page}
            onClick={() => changeLibraryResultPage(item.page)}
            type="button"
          >
            {item.page}
          </button>
        );
      })}

      <button
        aria-label="다음 페이지"
        className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        disabled={isLastPage}
        onClick={() => changeLibraryResultPage(currentPage + 1)}
        type="button"
      >
        <LucideIcon className="h-4 w-4" icon={ChevronRight} strokeWidth={2} />
      </button>
    </nav>
  );
}

export {LibrarySearchResultPagination};
export type {LibrarySearchResultPaginationProps};
