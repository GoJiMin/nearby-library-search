import {Suspense} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import type {LibrarySearchParams} from '@/entities/library';
import {LibrarySearchResultList} from '../common/LibrarySearchResultList';
import {LibrarySearchResultListPlaceholder} from '../common/loading/LibrarySearchResultListPlaceholder';
import {LibrarySearchResultRightPanel} from './LibrarySearchResultRightPanel';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultRightPanelPlaceholder} from './loading/LibrarySearchResultRightPanelPlaceholder';

type LibrarySearchResultDesktopLayoutProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

function LibrarySearchResultDesktopLayout({
  focusRequest,
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultDesktopLayoutProps) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultSidebar>
        <Suspense fallback={<LibrarySearchResultListPlaceholder />}>
          <LibrarySearchResultList
            onSelectLibrary={onSelectLibrary}
            params={params}
            selectedLibraryCode={selectedLibraryCode}
          />
        </Suspense>
      </LibrarySearchResultSidebar>
      <Suspense fallback={<LibrarySearchResultRightPanelPlaceholder />}>
        <LibrarySearchResultRightPanel focusRequest={focusRequest} params={params} />
      </Suspense>
    </div>
  );
}

export {LibrarySearchResultDesktopLayout};
export type {LibrarySearchResultDesktopLayoutProps};
