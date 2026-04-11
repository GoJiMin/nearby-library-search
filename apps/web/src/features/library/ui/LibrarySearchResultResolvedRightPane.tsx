import type {LibraryCode} from '@nearby-library-search/contracts';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultMap} from '../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultDetails} from './LibrarySearchResultDetails';

type LibrarySearchResultResolvedRightPaneProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  params: LibrarySearchParams;
};

function LibrarySearchResultResolvedRightPane({focusRequest, params}: LibrarySearchResultResolvedRightPaneProps) {
  const selectedLibraryCode = useFindLibraryStore(state => state.selectedLibraryCode);
  const response = useGetSearchLibraries(params);
  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;

  return (
    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
      <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
        <LibrarySearchResultMap focusRequest={focusRequest} items={response.items} />
      </section>
      <LibrarySearchResultDetails library={currentSelectedLibrary} />
    </div>
  );
}

export {LibrarySearchResultResolvedRightPane};
export type {LibrarySearchResultResolvedRightPaneProps};
