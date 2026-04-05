import type {BookSearchMode, BookSearchModeOption} from '../model/useBookSearchStart';

type BookSearchModeTabsProps = {
  baseId: string;
  options: ReadonlyArray<BookSearchModeOption>;
  searchMode: BookSearchMode;
  tabListLabel: string;
  onChangeSearchMode: (searchMode: BookSearchMode) => void;
};

function BookSearchModeTabs({
  baseId,
  options,
  searchMode,
  tabListLabel,
  onChangeSearchMode,
}: BookSearchModeTabsProps) {
  const tabPanelId = `${baseId}-panel`;

  return (
    <div
      aria-label={tabListLabel}
      className="bg-surface-muted inline-flex w-full rounded-pill p-1 sm:w-auto"
      role="tablist"
    >
      {options.map(option => {
        const isSelected = option.value === searchMode;

        return (
          <button
            key={option.value}
            aria-controls={tabPanelId}
            aria-selected={isSelected}
            className={`focus-visible:ring-accent-soft min-h-11 flex-1 rounded-pill px-4 py-2 text-sm font-semibold outline-none transition-colors focus-visible:ring-4 sm:flex-none ${
              isSelected ? 'bg-accent text-white shadow-soft' : 'text-text-muted hover:bg-surface-strong hover:text-text'
            }`}
            id={`${baseId}-tab-${option.value}`}
            onClick={() => onChangeSearchMode(option.value)}
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
