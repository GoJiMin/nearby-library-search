import type {ReactNode} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {Map, Search} from 'lucide-react';
import {hasLibraryCoordinates, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {kakaoMapConfig} from '@/shared/env';
import {Button, LucideIcon, Text} from '@/shared/ui';
import {LibrarySearchResultDetailsFields} from '../common/LibrarySearchResultDetails';
import {LibrarySearchResultDetailsFieldsPlaceholder} from '../common/loading/LibrarySearchResultDetailsPlaceholder';

type LibrarySearchResultMobileDetailsSectionProps = {
  onOpenQuickMap: (code: LibraryCode) => void;
  params: LibrarySearchParams;
};

type QuickMapState = 'hidden' | 'openable' | 'unavailable' | 'without-coordinate';

function resolveQuickMapState({
  selectedLibrary,
}: {
  selectedLibrary: ReturnType<typeof useGetSearchLibraries>['items'][number] | null;
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
          <Button className="w-full rounded-2xl" disabled size="lg" variant="default">
            <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
            대출 가능 여부 조회
          </Button>
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
  const quickMapState = resolveQuickMapState({selectedLibrary: currentSelectedLibrary});
  const openableLibrary = quickMapState === 'openable' ? currentSelectedLibrary : null;
  let quickMapAction: ReactNode = null;

  if (openableLibrary != null) {
    quickMapAction = (
      <Button className="w-full rounded-2xl" onClick={() => onOpenQuickMap(openableLibrary.code)} size="lg" variant="secondary">
        <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
        지도로 보기
      </Button>
    );
  } else if (quickMapState === 'unavailable') {
    quickMapAction = (
      <Text className="px-1 text-sm" size="sm" tone="muted">
        지도를 표시할 수 없어요.
      </Text>
    );
  } else if (quickMapState === 'without-coordinate') {
    quickMapAction = (
      <Text className="px-1 text-sm" size="sm" tone="muted">
        위치 정보가 없어요.
      </Text>
    );
  }

  return (
    <section aria-label="선택된 도서관 정보 패널" className="bg-surface border-line/40 border-b px-6 py-5">
      <div className="flex flex-col gap-6">
        <div>
          <LibrarySearchResultDetailsFields library={currentSelectedLibrary} />
        </div>
        <div className="grid gap-3">
          {quickMapAction}
          <Button className="w-full rounded-2xl" disabled={currentSelectedLibrary == null} size="lg" variant="default">
            <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
            대출 가능 여부 조회
          </Button>
        </div>
      </div>
    </section>
  );
}

export {LibrarySearchResultMobileDetailsSection, LibrarySearchResultMobileDetailsSectionFallback};
export type {LibrarySearchResultMobileDetailsSectionProps};
