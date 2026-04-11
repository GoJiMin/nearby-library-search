import type {ReactNode} from 'react';

type LibrarySearchResultMapPanelProps = {
  children: ReactNode;
};

function LibrarySearchResultMapPanel({children}: LibrarySearchResultMapPanelProps) {
  return (
    <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
      {children}
    </section>
  );
}

export {LibrarySearchResultMapPanel};
export type {LibrarySearchResultMapPanelProps};
