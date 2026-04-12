import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultDetails} from './LibrarySearchResultDetails';

type LibrarySearchResultSelectedDetailsProps = {
  layout?: 'desktop' | 'mobile';
  params: LibrarySearchParams;
};

function LibrarySearchResultSelectedDetails({
  layout = 'desktop',
  params,
}: LibrarySearchResultSelectedDetailsProps) {
  const selectedLibraryCode = useFindLibraryStore(state => state.selectedLibraryCode);
  const response = useGetSearchLibraries(params);
  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;

  return <LibrarySearchResultDetails isbn13={params.isbn} layout={layout} library={currentSelectedLibrary} />;
}

export {LibrarySearchResultSelectedDetails};
export type {LibrarySearchResultSelectedDetailsProps};
