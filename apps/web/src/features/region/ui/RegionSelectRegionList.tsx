import {ChevronRight} from 'lucide-react';
import {REGION_OPTIONS} from '@/entities/region';
import {Heading, LucideIcon} from '@/shared/ui';
import {RegionSelectRowButton} from './RegionSelectRowButton';

type RegionSelectRegionListProps = {
  onSelectRegion: (regionCode: string) => void;
  selectedRegion?: string;
};

function RegionSelectRegionList({onSelectRegion, selectedRegion}: RegionSelectRegionListProps) {
  return (
    <section aria-labelledby="region-dialog-region-heading" className="bg-surface-muted/35 flex min-h-0 flex-col">
      <Heading
        as="h3"
        className="text-text-muted px-4 py-3 tracking-[0.08em] uppercase"
        id="region-dialog-region-heading"
        size="xs"
      >
        시/도
      </Heading>
      <ul className="flex-1 space-y-1 overflow-y-auto py-2 pr-2 [scrollbar-color:theme(colors.line)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
        {REGION_OPTIONS.map(regionOption => (
          <li key={regionOption.code}>
            <RegionSelectRowButton
              isSelected={regionOption.code === selectedRegion}
              selectionTone="accent"
              trailing={
                regionOption.code === selectedRegion ? (
                  <LucideIcon className="h-4 w-4 shrink-0" icon={ChevronRight} strokeWidth={2.1} />
                ) : null
              }
              onClick={() => {
                onSelectRegion(regionOption.code);
              }}
            >
              {regionOption.label}
            </RegionSelectRowButton>
          </li>
        ))}
      </ul>
    </section>
  );
}

export {RegionSelectRegionList};
export type {RegionSelectRegionListProps};
