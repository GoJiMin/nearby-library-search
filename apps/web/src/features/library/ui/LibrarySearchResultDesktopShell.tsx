import type {ReactNode} from 'react';

type LibrarySearchResultDesktopShellProps = {
  detailPanel: ReactNode;
  listPanel: ReactNode;
  mapPanel: ReactNode;
};

function LibrarySearchResultDesktopShell({
  detailPanel,
  listPanel,
  mapPanel,
}: LibrarySearchResultDesktopShellProps) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[304px_minmax(0,1fr)]">
      {listPanel}
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px]">
        {mapPanel}
        {detailPanel}
      </div>
    </div>
  );
}

export {LibrarySearchResultDesktopShell};
export type {LibrarySearchResultDesktopShellProps};
