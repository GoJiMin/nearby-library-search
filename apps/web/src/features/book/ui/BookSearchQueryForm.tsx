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
  const helperTextId = `${baseId}-helper`;
  const inputId = `${baseId}-input`;
  const tabPanelId = `${baseId}-panel`;
  const tabPanelLabelledBy = `${baseId}-tab-${searchMode}`;
  const queryTextLength = queryText.length;

  return (
    <form aria-label="도서 검색 시작" className="w-full" onSubmit={onSubmit}>
      <div aria-labelledby={tabPanelLabelledBy} className="flex items-center gap-2" id={tabPanelId} role="tabpanel">
        <Input
          aria-describedby={isSubmitDisabled ? `${helperTextId} ${characterCountId}` : characterCountId}
          className="rounded-2xl border-0 bg-white/65 py-4 pr-2 pl-6 shadow-none placeholder:text-[#8f96a6] focus-visible:ring-0"
          id={inputId}
          maxLength={MAX_BOOK_SEARCH_TERM_LENGTH}
          name="queryText"
          onChange={event => onQueryTextChange(event.target.value)}
          placeholder={activeSearchModeOption.placeholder}
          value={queryText}
          autoComplete="off"
        />
        <Button
          className="rounded-2xl py-4 disabled:bg-gray-400"
          disabled={isSubmitDisabled}
          type="submit"
          aria-label="검색"
        >
          <LucideIcon className="text-white" icon={Search} strokeWidth={1.8} size={26} />
        </Button>
      </div>
      <Text className="mt-2 pr-20 text-end tabular-nums" id={characterCountId} size="sm" tone="muted">
        {queryTextLength} / {MAX_BOOK_SEARCH_TERM_LENGTH}
      </Text>
    </form>
  );
}

export {BookSearchQueryForm};
export type {BookSearchQueryFormProps};
