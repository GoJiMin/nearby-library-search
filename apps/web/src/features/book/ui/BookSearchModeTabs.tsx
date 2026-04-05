import type {BookSearchMode, BookSearchModeMeta} from '../model/useBookSearchStart';

type BookSearchModeTabsProps = {
  baseId: string;
  searchModeConfig: Readonly<Record<BookSearchMode, BookSearchModeMeta>>;
  searchModeOrder: ReadonlyArray<BookSearchMode>;
  searchMode: BookSearchMode;
  tabListLabel: string;
  onChangeSearchMode: (searchMode: BookSearchMode) => void;
};

function BookSearchModeTabs({
  baseId,
  searchModeConfig,
  searchModeOrder,
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
      {searchModeOrder.map(mode => {
        const isSelected = mode === searchMode;
        const option = searchModeConfig[mode];

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
