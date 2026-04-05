import {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER, type BookSearchMode} from '../model/useBookSearchStart';

type BookSearchModeTabsProps = {
  baseId: string;
  searchMode: BookSearchMode;
  onChangeSearchMode: (searchMode: BookSearchMode) => void;
};

function BookSearchModeTabs({baseId, searchMode, onChangeSearchMode}: BookSearchModeTabsProps) {
  const tabPanelId = `${baseId}-panel`;

  return (
    <div
      aria-label="검색 기준 선택"
      className="bg-surface-muted inline-flex w-full rounded-pill p-1 sm:w-auto"
      role="tablist"
    >
      {BOOK_SEARCH_MODE_ORDER.map(mode => {
        const isSelected = mode === searchMode;
        const option = BOOK_SEARCH_MODE_CONFIG[mode];

        return (
          <button
            key={mode}
            aria-controls={tabPanelId}
            aria-selected={isSelected}
            className={`focus-visible:ring-accent-soft min-h-11 flex-1 rounded-pill px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-4 sm:flex-none ${
              isSelected ? 'bg-accent text-white shadow-soft' : 'text-text-muted hover:bg-surface-strong hover:text-text'
            }`}
            id={`${baseId}-tab-${mode}`}
            onClick={() => onChangeSearchMode(mode)}
            role="tab"
            tabIndex={isSelected ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export {BookSearchModeTabs};
export type {BookSearchModeTabsProps};
