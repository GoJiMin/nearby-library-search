import {LocateFixed, Minus, Plus} from 'lucide-react';
import type {ReactNode} from 'react';
import {LucideIcon, Skeleton} from '@/shared/ui';

type LibrarySearchResultMapPanelProps = {
  children: ReactNode;
};

function LibrarySearchResultMapPanel({children}: LibrarySearchResultMapPanelProps) {
  return (
    <section
      aria-label="도서관 지도 패널"
      className="bg-surface-muted relative min-h-[360px] overflow-hidden"
    >
      {children}
    </section>
  );
}

function LibrarySearchResultMapPlaceholderBody() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.46)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.46)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_62%)]" />
      <Skeleton className="absolute top-[28%] left-[42%] h-8 w-8 rounded-full bg-white/75" />
      <Skeleton className="absolute top-[57%] left-[73%] h-8 w-8 rounded-full bg-white/75" />
      <div className="absolute top-1/2 left-[58%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <Skeleton className="bg-accent h-12 w-12 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/90" />
      </div>
      <div className="absolute right-6 bottom-6 flex flex-col gap-2.5">
        <LibrarySearchResultMapControl ariaLabel="지도 확대" icon={Plus} />
        <LibrarySearchResultMapControl ariaLabel="지도 축소" icon={Minus} />
        <LibrarySearchResultMapControl ariaLabel="선택 위치로 이동" icon={LocateFixed} />
      </div>
    </>
  );
}

function LibrarySearchResultMapControl({
  ariaLabel,
  icon,
}: {
  ariaLabel: string;
  icon: typeof Plus;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="shadow-card bg-surface-strong text-text-muted inline-flex h-11 w-11 items-center justify-center rounded-full"
      type="button"
    >
      <LucideIcon className="h-5 w-5" icon={icon} strokeWidth={2.1} />
    </button>
  );
}

export {LibrarySearchResultMapPanel, LibrarySearchResultMapPlaceholderBody};
export type {LibrarySearchResultMapPanelProps};
