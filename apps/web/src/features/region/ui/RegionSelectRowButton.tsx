import clsx from 'clsx';
import type {ReactNode} from 'react';

type RegionSelectRowButtonProps = {
  children: ReactNode;
  isSelected?: boolean;
  onClick: () => void;
  selectionTone?: 'accent' | 'neutral';
  trailing?: ReactNode;
};

function RegionSelectRowButton({
  children,
  isSelected = false,
  onClick,
  selectionTone = 'neutral',
  trailing,
}: RegionSelectRowButtonProps) {
  return (
    <button
      aria-pressed={isSelected}
      className={clsx(
        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] transition-colors',
        isSelected
          ? selectionTone === 'accent'
            ? 'bg-accent text-surface-muted shadow-[0_12px_24px_-14px_rgba(55,85,195,0.75)]'
            : 'bg-surface-muted text-text shadow-[0_10px_24px_-18px_rgba(25,28,30,0.28)]'
          : 'text-text-muted hover:bg-surface-muted/80',
      )}
      type="button"
      onClick={onClick}
    >
      <span className={clsx('min-w-0 truncate', isSelected && 'font-semibold')}>{children}</span>
      {trailing}
    </button>
  );
}

export {RegionSelectRowButton};
export type {RegionSelectRowButtonProps};
