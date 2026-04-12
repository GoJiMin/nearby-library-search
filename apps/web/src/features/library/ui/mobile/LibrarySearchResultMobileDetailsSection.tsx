import type {LibraryCode} from '@nearby-library-search/contracts';
import {Map} from 'lucide-react';
import {hasLibraryCoordinates, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {kakaoMapConfig} from '@/shared/env';
import {Button, LucideIcon} from '@/shared/ui';
import {
  LibrarySearchResultAvailabilityAction,
  LibrarySearchResultAvailabilityCta,
} from '../common/LibrarySearchResultAvailabilityCta';
import {LibrarySearchResultDetailsFields} from '../common/LibrarySearchResultDetails';
import {LibrarySearchResultDetailsFieldsPlaceholder} from '../common/loading/LibrarySearchResultDetailsPlaceholder';

type LibrarySearchResultMobileDetailsSectionProps = {
  onOpenQuickMap: (code: LibraryCode) => void;
  params: LibrarySearchParams;
};

type SelectedLibrary = ReturnType<typeof useGetSearchLibraries>['items'][number] | null;
type QuickMapState = 'hidden' | 'openable' | 'unavailable' | 'without-coordinate';

function resolveQuickMapState({
  selectedLibrary,
}: {
  selectedLibrary: SelectedLibrary;
}): QuickMapState {
  if (!kakaoMapConfig.isEnabled) {
    return 'unavailable';
  }

  if (selectedLibrary == null) {
    return 'hidden';
  }

  if (!hasLibraryCoordinates(selectedLibrary)) {
    return 'without-coordinate';
  }

  return 'openable';
}

function LibrarySearchResultMobileQuickMapAction({
  onOpenQuickMap,
  selectedLibrary,
}: {
  onOpenQuickMap: (code: LibraryCode) => void;
  selectedLibrary: SelectedLibrary;
}) {
  const quickMapState = resolveQuickMapState({selectedLibrary});

  function renderDisabledQuickMapButton(buttonLabel: string) {
    return (
      <Button className="w-full rounded-2xl" disabled size="lg" variant="secondary">
        <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
        {buttonLabel}
      </Button>
    );
  }

  if (quickMapState === 'hidden') {
    return null;
  }

  if (quickMapState === 'openable') {
    const openableLibrary = selectedLibrary;

    if (openableLibrary == null) {
      return null;
    }

    return (
      <Button className="w-full rounded-2xl" onClick={() => onOpenQuickMap(openableLibrary.code)} size="lg" variant="secondary">
        <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
        지도로 보기
      </Button>
    );
  }

  if (quickMapState === 'unavailable') {
    return renderDisabledQuickMapButton('지도를 표시할 수 없어요');
  }

  return renderDisabledQuickMapButton('위치 정보가 없어요');
}

function LibrarySearchResultMobileDetailsSectionFallback() {
  return (
    <section aria-label="선택된 도서관 정보 패널" className="bg-surface border-line/40 border-b px-6 py-5">
      <div className="flex flex-col gap-6">
        <LibrarySearchResultDetailsFieldsPlaceholder />
        <div className="grid gap-3">
          <Button className="w-full rounded-2xl" disabled size="lg" variant="secondary">
            <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
            지도로 보기
          </Button>
          <LibrarySearchResultAvailabilityAction disabled />
        </div>
      </div>
    </section>
  );
}

function LibrarySearchResultMobileDetailsSection({
  onOpenQuickMap,
  params,
}: LibrarySearchResultMobileDetailsSectionProps) {
  const response = useGetSearchLibraries(params);
  const selectedLibraryCode = useFindLibraryStore(state => state.selectedLibraryCode);
  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;

  return (
    <section aria-label="선택된 도서관 정보 패널" className="bg-surface border-line/40 border-b px-6 py-5">
      <div className="flex flex-col gap-6">
        <div>
          <LibrarySearchResultDetailsFields library={currentSelectedLibrary} />
        </div>
        <div className="grid gap-3">
          <LibrarySearchResultMobileQuickMapAction
            onOpenQuickMap={onOpenQuickMap}
            selectedLibrary={currentSelectedLibrary}
          />
          {currentSelectedLibrary == null ? (
            <LibrarySearchResultAvailabilityAction disabled />
          ) : (
            <LibrarySearchResultAvailabilityCta isbn13={params.isbn} libraryCode={currentSelectedLibrary.code} />
          )}
        </div>
      </div>
    </section>
  );
}

export {LibrarySearchResultMobileDetailsSection, LibrarySearchResultMobileDetailsSectionFallback};
export type {LibrarySearchResultMobileDetailsSectionProps};
