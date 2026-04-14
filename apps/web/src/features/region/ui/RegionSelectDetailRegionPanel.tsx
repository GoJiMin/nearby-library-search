import clsx from 'clsx';
import {CheckCircle2} from 'lucide-react';
import {DETAIL_REGION_OPTIONS_BY_REGION} from '@/entities/region';
import {Heading, LucideIcon} from '@/shared/ui';
import type {RegionSelectionState} from '../model/regionSelection.contract';
import {useRegionSelectionStore} from '../model/useRegionSelectionStore';
import {RegionSelectRowButton} from './RegionSelectRowButton';

type VisibleDetailRegionOption = {
  code: string;
  label: string;
};

function getDetailRegionHelperMessage({
  hasSingleDetailRegionOption,
  selectedRegion,
}: {
  hasSingleDetailRegionOption: boolean;
  selectedRegion?: RegionSelectionState['region'];
}) {
  if (selectedRegion == null) {
    return '시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.';
  }

  if (hasSingleDetailRegionOption) {
    return '세종시는 세부 지역 구분이 없어 전체 지역으로 검색합니다.';
  }

  return null;
}

function RegionSelectDetailRegionPanel() {
  const selection = useRegionSelectionStore(state => state.selection);
  const selectDetailRegion = useRegionSelectionStore(state => state.selectDetailRegion);
  const selectedRegion = selection?.region;
  const selectedDetailRegion = selection?.detailRegion;
  const detailRegionOptions = selectedRegion != null ? (DETAIL_REGION_OPTIONS_BY_REGION[selectedRegion] ?? []) : [];
  const hasSingleDetailRegionOption = selectedRegion != null && detailRegionOptions.length <= 1;
  const detailRegionHelperMessage = getDetailRegionHelperMessage({
    hasSingleDetailRegionOption,
    selectedRegion,
  });
  const visibleDetailRegionOptions: VisibleDetailRegionOption[] = hasSingleDetailRegionOption ? [] : detailRegionOptions;

  return (
    <section
      aria-disabled={selectedRegion == null}
      aria-labelledby="region-dialog-detail-heading"
      className={clsx('bg-surface flex min-h-0 flex-col', selectedRegion == null && 'opacity-60')}
    >
      <Heading
        as="h3"
        className="text-text-muted px-4 py-3 tracking-[0.08em] uppercase"
        id="region-dialog-detail-heading"
        size="xs"
      >
        세부 지역
      </Heading>
      {selectedRegion != null ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ul className="[&::-webkit-scrollbar-thumb]:bg-line flex-1 space-y-1 overflow-y-auto py-2 pr-2 [scrollbar-color:var(--color-line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <li>
              <RegionSelectRowButton
                isSelected={selectedDetailRegion == null}
                onClick={() => {
                  selectDetailRegion(undefined);
                }}
                trailing={!selectedDetailRegion && (
                  <LucideIcon className="text-accent h-4.5 w-4.5 shrink-0" icon={CheckCircle2} strokeWidth={2.1} />
                )}
              >
                전체
              </RegionSelectRowButton>
            </li>
            {visibleDetailRegionOptions.map(detailRegionOption => (
              <li key={detailRegionOption.code}>
                <RegionSelectRowButton
                  isSelected={selectedDetailRegion === detailRegionOption.code}
                  trailing={selectedDetailRegion === detailRegionOption.code && (
                    <LucideIcon className="text-accent h-4.5 w-4.5 shrink-0" icon={CheckCircle2} strokeWidth={2.1} />
                  )}
                  onClick={() => {
                    selectDetailRegion(detailRegionOption.code);
                  }}
                >
                  {detailRegionOption.label}
                </RegionSelectRowButton>
              </li>
            ))}
          </ul>
          {hasSingleDetailRegionOption && detailRegionHelperMessage && (
            <p className="text-text-muted px-4 pt-2 pb-4 text-sm leading-6">{detailRegionHelperMessage}</p>
          )}
        </div>
      ) : (
        <div className="flex-1 px-2 py-2">
          <div className="flex h-full min-h-73 items-center justify-center rounded-2xl px-8 text-center">
            <p className="text-sm leading-6 text-gray-600">{detailRegionHelperMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export {RegionSelectDetailRegionPanel};
