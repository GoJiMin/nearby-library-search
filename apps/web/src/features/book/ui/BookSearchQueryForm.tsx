import {MAX_BOOK_SEARCH_TERM_LENGTH} from '@/entities/book';
import {Search} from 'lucide-react';
import type {SyntheticEvent} from 'react';
import {Button, Input, LucideIcon, Text} from '@/shared/ui';
import {BOOK_SEARCH_MODE_CONFIG, type BookSearchMode} from '../model/useBookSearchStart';

type BookSearchQueryFormProps = {
  baseId: string;
  isSubmitDisabled: boolean;
  queryText: string;
  searchMode: BookSearchMode;
  onQueryTextChange: (queryText: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

function BookSearchQueryForm({
  baseId,
  isSubmitDisabled,
  queryText,
  searchMode,
  onQueryTextChange,
  onSubmit,
}: BookSearchQueryFormProps) {
  const activeSearchModeOption = BOOK_SEARCH_MODE_CONFIG[searchMode];
  const characterCountId = `${baseId}-character-count`;
  const inputId = `${baseId}-input`;
  const tabPanelId = `${baseId}-panel`;
  const tabPanelLabelledBy = `${baseId}-tab-${searchMode}`;
  const queryTextLength = queryText.length;

  return (
    <form aria-label="도서 검색 시작" className="w-full" onSubmit={onSubmit}>
      <div
        aria-labelledby={tabPanelLabelledBy}
        className="relative flex w-full items-center"
        id={tabPanelId}
        role="tabpanel"
      >
        <Input
          aria-describedby={characterCountId}
          className="w-full rounded-2xl border-0 bg-white/65 py-3 pr-14 pl-6 shadow-sm placeholder:text-[#8f96a6] focus-visible:ring-0 md:py-5 md:pr-16"
          id={inputId}
          maxLength={MAX_BOOK_SEARCH_TERM_LENGTH}
          name="queryText"
          onChange={event => onQueryTextChange(event.target.value)}
          placeholder={activeSearchModeOption.placeholder}
          value={queryText}
          autoComplete="off"
        />
        <Button
          className="text-accent absolute right-2 flex aspect-square items-center justify-center rounded-xl p-2 transition-colors disabled:text-gray-300 md:right-3"
          disabled={isSubmitDisabled}
          type="submit"
          aria-label="검색"
          variant="ghost"
        >
          <LucideIcon
            className={isSubmitDisabled ? 'text-gray-400' : 'text-primary'}
            icon={Search}
            strokeWidth={2.2}
            size={24}
          />
        </Button>
      </div>
      <Text className="mt-2 pr-4 text-end tabular-nums opacity-60" id={characterCountId} size="sm" tone="muted">
        {queryTextLength} / {MAX_BOOK_SEARCH_TERM_LENGTH}
      </Text>
    </form>
  );
}

export {BookSearchQueryForm};
export type {BookSearchQueryFormProps};
