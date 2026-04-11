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
  const hasCoordinateItems = response.items.some(hasLibraryCoordinates);
  const isMapUnavailable = !kakaoMapConfig.isEnabled;
  const canOpenQuickMap = currentSelectedLibrary != null && !isMapUnavailable && hasCoordinateItems;
  const mapSummary = isMapUnavailable
    ? '지도를 표시할 수 없어요.'
    : !hasCoordinateItems
      ? '지도로 표시할 수 있는 위치 정보가 없어요.'
      : null;

  return (
    <section aria-label="선택된 도서관 정보 패널" className="bg-surface border-line/40 border-b px-6 py-5">
      <div className="flex flex-col gap-6">
        <div>
          <LibrarySearchResultDetailsFields library={currentSelectedLibrary} />
        </div>
        <div className="grid gap-3">
          {canOpenQuickMap ? (
            <Button
              className="w-full rounded-2xl"
              onClick={() => onOpenQuickMap(currentSelectedLibrary.code)}
              size="lg"
              variant="secondary"
            >
              <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
              지도로 보기
            </Button>
          ) : mapSummary ? (
            <Text className="px-1 text-sm" size="sm" tone="muted">
              {mapSummary}
            </Text>
          ) : null}
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
