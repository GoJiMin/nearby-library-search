import {Suspense} from 'react';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultBody} from './LibrarySearchResultBody';
import {LibrarySearchResultLoadingContent} from './states/LibrarySearchResultLoadingContent';

function LibrarySearchResultContent() {
  const params = useFindLibraryStore(state => state.currentLibrarySearchParams);

  if (params == null) {
    return null;
  }

  return (
    <Suspense fallback={<LibrarySearchResultLoadingContent />}>
      <LibrarySearchResultBody params={params} />
    </Suspense>
  );
}

export {LibrarySearchResultContent};
