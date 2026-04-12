import type {LibraryCode} from '@nearby-library-search/contracts';
import type {LibrarySearchParams} from '@/entities/library';
import {LibrarySearchResultSelectedDetails} from '../common/LibrarySearchResultSelectedDetails';
import {LibrarySearchResultSelectedMap} from '../common/LibrarySearchResultSelectedMap';

type LibrarySearchResultRightPanelProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  params: LibrarySearchParams;
};

function LibrarySearchResultRightPanel({focusRequest, params}: LibrarySearchResultRightPanelProps) {
  return (
    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_265px]">
      <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
        <LibrarySearchResultSelectedMap focusRequest={focusRequest} params={params} />
      </section>
      <LibrarySearchResultSelectedDetails params={params} />
    </div>
  );
}

export {LibrarySearchResultRightPanel};
export type {LibrarySearchResultRightPanelProps};
