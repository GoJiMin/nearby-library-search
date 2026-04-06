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
    <form aria-label="도서 검색 시작" className="space-y-4" onSubmit={onSubmit}>
      <div aria-labelledby={tabPanelLabelledBy} className="space-y-3" id={tabPanelId} role="tabpanel">
        <div className="space-y-2">
          <label className="sr-only" htmlFor={inputId}>
            {activeSearchModeOption.inputLabel}
          </label>
          <div className="rounded-3xl bg-surface-muted p-2 shadow-soft">
            <div className="relative flex items-center gap-2">
              <LucideIcon className="pointer-events-none absolute left-4 size-5 text-text-muted" icon={Search} strokeWidth={1.8} />
              <Input
                aria-describedby={isSubmitDisabled ? `${helperTextId} ${characterCountId}` : characterCountId}
                className="min-h-14 rounded-2xl border-0 bg-transparent py-4 pr-2 pl-11 shadow-none focus-visible:ring-0"
                id={inputId}
                maxLength={MAX_BOOK_SEARCH_TERM_LENGTH}
                name="queryText"
                onChange={event => onQueryTextChange(event.target.value)}
                placeholder={activeSearchModeOption.placeholder}
                value={queryText}
              />
              <Button
                className="bg-linear-to-br from-accent to-accent-strong min-h-11 shrink-0 rounded-2xl px-5 text-sm font-bold shadow-soft hover:bg-accent-strong sm:px-6"
                disabled={isSubmitDisabled}
                type="submit"
              >
                검색
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-2 px-1">
            {isSubmitDisabled ? (
              <Text className="max-w-lg text-balance" id={helperTextId} size="sm" tone="muted">
                {activeSearchModeOption.disabledHelperText}
              </Text>
            ) : (
              <span aria-hidden="true" />
            )}

            <Text className="tabular-nums" id={characterCountId} size="sm" tone="muted">
              {queryTextLength} / {MAX_BOOK_SEARCH_TERM_LENGTH}
            </Text>
          </div>
        </div>
      </div>
    </form>
  );
}

export {BookSearchQueryForm};
export type {BookSearchQueryFormProps};
