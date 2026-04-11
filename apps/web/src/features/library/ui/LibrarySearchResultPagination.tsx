import {ChevronLeft, ChevronRight} from 'lucide-react';
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

function LibrarySearchResultPagination() {
  const {changeLibraryResultPage, currentPage, totalCount} = useFindLibraryStore(
    useShallow(state => ({
      changeLibraryResultPage: state.changeLibraryResultPage,
      currentPage: state.currentLibrarySearchParams?.page ?? 1,
      totalCount: state.resolvedLibraryTotalCount,
    })),
  );

  if (totalCount == null) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / LIBRARY_SEARCH_PAGE_SIZE);
  const paginationItems = getLibrarySearchResultPaginationItems(currentPage, totalPages);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="도서관 검색 결과 페이지네이션" className="flex items-center justify-center gap-1">
      <button
        aria-label="이전 페이지"
        className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        disabled={isFirstPage}
        onClick={() => changeLibraryResultPage(currentPage - 1)}
        type="button"
      >
        <LucideIcon className="h-3.5 w-3.5" icon={ChevronLeft} strokeWidth={2} />
      </button>

      {paginationItems.map(item => {
        if (item.type === 'ellipsis') {
          return (
            <span
              aria-label="페이지 생략"
              className="text-text-muted inline-flex shrink-0 items-center justify-center px-1 text-xs font-semibold tracking-[-0.18em]"
              key={item.id}
              role="img"
            >
              ...
            </span>
          );
        }

        if (item.page === currentPage) {
          return (
            <Text
              aria-current="page"
              as="span"
              className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-xs ${createPageItemClassName(true)}`}
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
            className={`focus-visible:ring-accent-soft inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-xs transition-colors outline-none focus-visible:ring-4 ${createPageItemClassName(false)}`}
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
        className="border-line text-text-muted hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50"
        disabled={isLastPage}
        onClick={() => changeLibraryResultPage(currentPage + 1)}
        type="button"
      >
        <LucideIcon className="h-3.5 w-3.5" icon={ChevronRight} strokeWidth={2} />
      </button>
    </nav>
  );
}

export {LibrarySearchResultPagination};
