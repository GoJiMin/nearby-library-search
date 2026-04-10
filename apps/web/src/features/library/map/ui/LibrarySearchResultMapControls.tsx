import {LocateFixed, Minus, Plus} from 'lucide-react';
import {LucideIcon} from '@/shared/ui';

type LibrarySearchResultMapControlsProps = {
  isLocateDisabled?: boolean;
  onLocate?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

function LibrarySearchResultMapControls({
  isLocateDisabled = false,
  onLocate,
  onZoomIn,
  onZoomOut,
}: LibrarySearchResultMapControlsProps = {}) {
  return (
    <div className="pointer-events-none absolute right-6 bottom-6 z-10 flex flex-col gap-2.5">
      <LibrarySearchResultMapControl ariaLabel="지도 확대" icon={Plus} onClick={onZoomIn} />
      <LibrarySearchResultMapControl ariaLabel="지도 축소" icon={Minus} onClick={onZoomOut} />
      <LibrarySearchResultMapControl
        ariaLabel="선택 위치로 이동"
        disabled={isLocateDisabled}
        icon={LocateFixed}
        onClick={onLocate}
      />
    </div>
  );
}

function LibrarySearchResultMapControl({
  ariaLabel,
  disabled = false,
  icon,
  onClick,
}: {
  ariaLabel: string;
  disabled?: boolean;
  icon: typeof Plus;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="shadow-card bg-surface-strong text-text-muted pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <LucideIcon className="h-5 w-5" icon={icon} strokeWidth={2.1} />
    </button>
  );
}

export {LibrarySearchResultMapControls};
