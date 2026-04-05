import type {BookSearchMode} from '../model/useBookSearchStart';
import type {ReactNode, SyntheticEvent} from 'react';
import {Button, Input, Text} from '@/shared/ui';

type BookSearchQueryFormProps = {
  baseId: string;
  children?: ReactNode;
  disabledHelperText: string;
  formLabel: string;
  inputLabel: string;
  isSubmitDisabled: boolean;
  placeholder: string;
  queryText: string;
  searchMode: BookSearchMode;
  onQueryTextChange: (queryText: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

function BookSearchQueryForm({
  baseId,
  children,
  disabledHelperText,
  formLabel,
  inputLabel,
  isSubmitDisabled,
  placeholder,
  queryText,
  searchMode,
  onQueryTextChange,
  onSubmit,
}: BookSearchQueryFormProps) {
  const inputId = `${baseId}-input`;
  const tabPanelId = `${baseId}-panel`;
  const tabPanelLabelledBy = `${baseId}-tab-${searchMode}`;

  return (
    <form aria-label={formLabel} className="space-y-4" onSubmit={onSubmit}>
      {children}

      <div aria-labelledby={tabPanelLabelledBy} className="space-y-4" id={tabPanelId} role="tabpanel">
        <div className="space-y-2">
          <label className="text-text text-sm font-medium" htmlFor={inputId}>
            {inputLabel}
          </label>
          <Input
            id={inputId}
            name="queryText"
            onChange={event => onQueryTextChange(event.target.value)}
            placeholder={placeholder}
            value={queryText}
          />
        </div>

        <div className="space-y-2">
          <Button disabled={isSubmitDisabled} type="submit">
            검색 시작
          </Button>

          {isSubmitDisabled ? (
            <Text size="sm" tone="muted">
              {disabledHelperText}
            </Text>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export {BookSearchQueryForm};
export type {BookSearchQueryFormProps};
