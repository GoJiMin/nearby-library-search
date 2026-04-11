import type {LibraryCode} from '@nearby-library-search/contracts';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {LibrarySearchResultMap} from '../../map/ui/LibrarySearchResultMap';

type LibrarySearchResultSelectedMapProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  params: LibrarySearchParams;
};

function LibrarySearchResultSelectedMap({focusRequest, params}: LibrarySearchResultSelectedMapProps) {
  const response = useGetSearchLibraries(params);

  return <LibrarySearchResultMap focusRequest={focusRequest} items={response.items} />;
}

export {LibrarySearchResultSelectedMap};
export type {LibrarySearchResultSelectedMapProps};
