import clsx from 'clsx';
import {CheckCircle2} from 'lucide-react';
import {Heading, LucideIcon} from '@/shared/ui';
import {REGION_SELECT_SCROLL_AREA_CLASS, RegionSelectRowButton} from './RegionSelectRowButton';

type VisibleDetailRegionOption = {
  code: string;
  label: string;
};

type RegionSelectDetailRegionPanelProps = {
  detailRegionHelperMessage: string | null;
  isDetailRegionEnabled: boolean;
  isDetailRegionFallback: boolean;
  onSelectDetailRegion: (detailRegion?: string) => void;
  selectedDetailRegion?: string;
  visibleDetailRegionOptions: VisibleDetailRegionOption[];
};

function RegionSelectDetailRegionPanel({
  detailRegionHelperMessage,
  isDetailRegionEnabled,
  isDetailRegionFallback,
  onSelectDetailRegion,
  selectedDetailRegion,
  visibleDetailRegionOptions,
}: RegionSelectDetailRegionPanelProps) {
  return (
    <section
      aria-disabled={!isDetailRegionEnabled}
      aria-labelledby="region-dialog-detail-heading"
      className={clsx('bg-surface flex min-h-0 flex-col', !isDetailRegionEnabled && 'opacity-60')}
    >
      <Heading
        as="h3"
        className="text-text-muted px-4 py-3 tracking-[0.08em] uppercase"
        id="region-dialog-detail-heading"
        size="xs"
      >
        세부 지역
      </Heading>
      {isDetailRegionEnabled ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <ul className={REGION_SELECT_SCROLL_AREA_CLASS}>
            <li>
              <RegionSelectRowButton
                isSelected={selectedDetailRegion == null}
                onClick={() => {
                  onSelectDetailRegion(undefined);
                }}
                trailing={
                  !selectedDetailRegion ? (
                    <LucideIcon className="text-accent h-4.5 w-4.5 shrink-0" icon={CheckCircle2} strokeWidth={2.1} />
                  ) : null
                }
              >
                전체
              </RegionSelectRowButton>
            </li>
            {visibleDetailRegionOptions.map(detailRegionOption => (
              <li key={detailRegionOption.code}>
                <RegionSelectRowButton
                  isSelected={selectedDetailRegion === detailRegionOption.code}
                  trailing={
                    selectedDetailRegion === detailRegionOption.code ? (
                      <LucideIcon className="text-accent h-4.5 w-4.5 shrink-0" icon={CheckCircle2} strokeWidth={2.1} />
                    ) : null
                  }
                  onClick={() => {
                    onSelectDetailRegion(detailRegionOption.code);
                  }}
                >
                  {detailRegionOption.label}
                </RegionSelectRowButton>
              </li>
            ))}
          </ul>
          {isDetailRegionFallback && detailRegionHelperMessage ? (
            <p className="text-text-muted px-4 pt-2 pb-4 text-sm leading-6">{detailRegionHelperMessage}</p>
          ) : null}
        </div>
      ) : (
        <div className="flex-1 px-2 py-2">
          <div className="bg-surface-muted/70 flex h-full min-h-[292px] items-center justify-center rounded-2xl px-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
            <p className="text-text-muted text-sm leading-6">{detailRegionHelperMessage}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export {RegionSelectDetailRegionPanel};
export type {RegionSelectDetailRegionPanelProps};
