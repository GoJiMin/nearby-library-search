import {useFindLibraryStore} from '@/features/find-library';
import {Button} from '@/shared/ui';

function LibrarySearchResultChangeRegionButton() {
  const backToRegionSelect = useFindLibraryStore(state => state.backToRegionSelect);

  return (
    <Button
      className="rounded-full px-3 text-text-muted hover:text-text"
      onClick={backToRegionSelect}
      size="sm"
      type="button"
      variant="ghost"
    >
      지역 변경
    </Button>
  );
}

export {LibrarySearchResultChangeRegionButton};
