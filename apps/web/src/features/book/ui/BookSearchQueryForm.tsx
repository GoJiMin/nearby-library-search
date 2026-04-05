import type {ReactNode, SyntheticEvent} from 'react';
import {Button, Input, Text} from '@/shared/ui';

type BookSearchQueryFormProps = {
  children?: ReactNode;
  disabledHelperText: string;
  formLabel: string;
  inputId: string;
  inputLabel: string;
  isSubmitDisabled: boolean;
  placeholder: string;
  queryText: string;
  tabPanelId: string;
  tabPanelLabelledBy: string;
  onQueryTextChange: (queryText: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
};

function BookSearchQueryForm({
  children,
  disabledHelperText,
  formLabel,
  inputId,
  inputLabel,
  isSubmitDisabled,
  placeholder,
  queryText,
  tabPanelId,
  tabPanelLabelledBy,
  onQueryTextChange,
  onSubmit,
}: BookSearchQueryFormProps) {
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
