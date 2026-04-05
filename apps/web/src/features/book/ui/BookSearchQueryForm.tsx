import {BOOK_SEARCH_MODE_CONFIG, type BookSearchMode} from '../model/useBookSearchStart';
import type {SyntheticEvent} from 'react';
import {Button, Input, Text} from '@/shared/ui';

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
  const inputId = `${baseId}-input`;
  const tabPanelId = `${baseId}-panel`;
  const tabPanelLabelledBy = `${baseId}-tab-${searchMode}`;

  return (
    <form aria-label="도서 검색 시작" className="space-y-4" onSubmit={onSubmit}>
      <div aria-labelledby={tabPanelLabelledBy} className="space-y-4" id={tabPanelId} role="tabpanel">
        <div className="space-y-2">
          <label className="text-text text-sm font-medium" htmlFor={inputId}>
            {activeSearchModeOption.inputLabel}
          </label>
          <Input
            id={inputId}
            name="queryText"
            onChange={event => onQueryTextChange(event.target.value)}
            placeholder={activeSearchModeOption.placeholder}
            value={queryText}
          />
        </div>

        <div className="space-y-2">
          <Button disabled={isSubmitDisabled} type="submit">
            검색 시작
          </Button>

          {isSubmitDisabled ? (
            <Text size="sm" tone="muted">
              {activeSearchModeOption.disabledHelperText}
            </Text>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export {BookSearchQueryForm};
export type {BookSearchQueryFormProps};
