import {useLayoutEffect} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultList} from './LibrarySearchResultList';

type LibrarySearchResultListSectionProps = {
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  setResolvedPage: Dispatch<SetStateAction<number | null>>;
  selectedLibraryCode: LibraryCode | null;
  setResolvedItems: Dispatch<SetStateAction<LibrarySearchItem[] | null>>;
};

function LibrarySearchResultListSection({
  onSelectLibrary,
  params,
  setResolvedPage,
  selectedLibraryCode,
  setResolvedItems,
}: LibrarySearchResultListSectionProps) {
  const {selectLibrary, setResolvedLibraryTotalCount} = useFindLibraryStore(
    useShallow(state => ({
      selectLibrary: state.selectLibrary,
      setResolvedLibraryTotalCount: state.setResolvedLibraryTotalCount,
    })),
  );
  const response = useGetSearchLibraries(params);

  useLayoutEffect(() => {
    setResolvedItems(previous => (previous === response.items ? previous : response.items));
    setResolvedPage(previous => (previous === params.page ? previous : params.page));
    setResolvedLibraryTotalCount(response.totalCount);

    if (selectedLibraryCode != null || response.items.length === 0) {
      return;
    }

    selectLibrary(response.items[0].code);
  }, [
    response.items,
    response.totalCount,
    params.page,
    selectLibrary,
    selectedLibraryCode,
    setResolvedItems,
    setResolvedPage,
    setResolvedLibraryTotalCount,
  ]);

  return (
    <LibrarySearchResultList
      items={response.items}
      onSelectLibrary={onSelectLibrary}
      selectedLibraryCode={selectedLibraryCode}
    />
  );
}

export {LibrarySearchResultListSection};
export type {LibrarySearchResultListSectionProps};
