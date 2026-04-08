import {type KeyboardEvent, useRef} from 'react';
import {BOOK_SEARCH_MODE_CONFIG, BOOK_SEARCH_MODE_ORDER, type BookSearchMode} from '../../model/bookSearchStart.contract';

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
      className="bg-surface inline-flex w-fit rounded-xl border border-white/75 px-1.5 py-1.5 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
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
            className={`focus-visible:ring-accent-soft rounded-xl px-6 py-1 text-xs transition-all duration-200 outline-none focus-visible:ring-4 md:px-5 md:py-2 md:text-sm ${
              isSelected ? 'bg-surface-strong text-accent shadow-soft' : 'text-text-muted hover:text-text'
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
