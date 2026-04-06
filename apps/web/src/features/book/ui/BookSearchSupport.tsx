import {Button, Text} from '@/shared/ui';
import {BOOK_SEARCH_MODE_CONFIG, type BookSearchMode} from '../model/useBookSearchStart';

const BOOK_SEARCH_SUPPORT_COPY =
  '책 제목이나 저자명으로 검색을 시작하면, 원하는 책을 고른 뒤 가까운 도서관을 바로 찾을 수 있어요.';

type BookSearchSupportProps = {
  onSelectExampleQuery: (queryText: string) => void;
  searchMode: BookSearchMode;
};

function BookSearchSupport({onSelectExampleQuery, searchMode}: BookSearchSupportProps) {
  const {exampleQueries} = BOOK_SEARCH_MODE_CONFIG[searchMode];

  return (
    <div className="space-y-2">
      <Text className="max-w-xl text-balance text-[0.92rem] leading-6" size="sm" tone="muted">
        {BOOK_SEARCH_SUPPORT_COPY}
      </Text>
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map(exampleQuery => (
          <Button
            key={exampleQuery}
            className="min-h-8 rounded-full border-0 bg-white/65 px-3 text-[0.8rem] font-medium text-text-muted shadow-none hover:bg-white hover:text-text"
            onClick={() => onSelectExampleQuery(exampleQuery)}
            size="sm"
            type="button"
            variant="secondary"
          >
            {exampleQuery}
          </Button>
        ))}
      </div>
    </div>
  );
}

export {BookSearchSupport};
export type {BookSearchSupportProps};
