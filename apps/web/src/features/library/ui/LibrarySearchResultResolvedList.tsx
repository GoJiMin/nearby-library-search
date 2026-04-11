import {useLayoutEffect} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultList} from './LibrarySearchResultList';

type LibrarySearchResultResolvedListProps = {
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

function LibrarySearchResultResolvedList({
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultResolvedListProps) {
  const {selectLibrary, setResolvedLibraryTotalCount} = useFindLibraryStore(
    useShallow(state => ({
      selectLibrary: state.selectLibrary,
      setResolvedLibraryTotalCount: state.setResolvedLibraryTotalCount,
    })),
  );
  const response = useGetSearchLibraries(params);

  useLayoutEffect(() => {
    setResolvedLibraryTotalCount(response.totalCount);

    if (selectedLibraryCode != null || response.items.length === 0) {
      return;
    }

    selectLibrary(response.items[0].code);
  }, [response.items, response.totalCount, selectLibrary, selectedLibraryCode, setResolvedLibraryTotalCount]);

  return (
    <LibrarySearchResultList
      items={response.items}
      onSelectLibrary={onSelectLibrary}
      selectedLibraryCode={selectedLibraryCode}
    />
  );
}

export {LibrarySearchResultResolvedList};
export type {LibrarySearchResultResolvedListProps};
