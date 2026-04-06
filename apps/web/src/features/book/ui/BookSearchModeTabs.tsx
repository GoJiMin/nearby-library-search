import {type KeyboardEvent, useRef} from 'react';
import {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER, type BookSearchMode} from '../model/useBookSearchStart';

type BookSearchModeTabsProps = {
  baseId: string;
  searchMode: BookSearchMode;
  onChangeSearchMode: (searchMode: BookSearchMode) => void;
};

function BookSearchModeTabs({baseId, searchMode, onChangeSearchMode}: BookSearchModeTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tabPanelId = `${baseId}-panel`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % BOOK_SEARCH_MODE_ORDER.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + BOOK_SEARCH_MODE_ORDER.length) % BOOK_SEARCH_MODE_ORDER.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = BOOK_SEARCH_MODE_ORDER.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextMode = BOOK_SEARCH_MODE_ORDER[nextIndex];

    onChangeSearchMode(nextMode);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      aria-label="검색 기준 선택"
      className="bg-surface-muted inline-flex w-full rounded-pill p-1 sm:w-auto"
      role="tablist"
    >
      {BOOK_SEARCH_MODE_ORDER.map((mode, index) => {
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
            onKeyDown={event => handleKeyDown(event, index)}
            ref={node => {
              tabRefs.current[index] = node;
            }}
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
