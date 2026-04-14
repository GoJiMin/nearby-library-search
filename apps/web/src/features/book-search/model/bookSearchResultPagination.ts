type BookSearchResultPaginationItem =
  | {
      page: number;
      type: 'page';
    }
  | {
      id: 'ellipsis-start' | 'ellipsis-end';
      type: 'ellipsis';
    };

function createPageItems(startPage: number, endPage: number): BookSearchResultPaginationItem[] {
  return Array.from({length: endPage - startPage + 1}, (_, index) => ({
    page: startPage + index,
    type: 'page' as const,
  }));
}

function getBookSearchResultPaginationItems(currentPage: number, totalPages: number): BookSearchResultPaginationItem[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 5) {
    return createPageItems(1, totalPages);
  }

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  let startPage = Math.max(1, safeCurrentPage - 1);
  const items: BookSearchResultPaginationItem[] = [];

  const endPage = Math.min(totalPages, startPage + 2);

  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - 2);
  }

  if (startPage > 1) {
    items.push({
      page: 1,
      type: 'page',
    });
  }

  if (startPage > 2) {
    items.push({
      id: 'ellipsis-start',
      type: 'ellipsis',
    });
  }

  items.push(...createPageItems(startPage, endPage));

  if (endPage < totalPages - 1) {
    items.push({
      id: 'ellipsis-end',
      type: 'ellipsis',
    });
  }

  if (endPage < totalPages) {
    items.push({
      page: totalPages,
      type: 'page',
    });
  }

  return items;
}

export {getBookSearchResultPaginationItems};
export type {BookSearchResultPaginationItem};
