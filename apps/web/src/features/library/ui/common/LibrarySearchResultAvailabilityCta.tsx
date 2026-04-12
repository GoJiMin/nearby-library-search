import {LoaderCircle, Search} from 'lucide-react';
import {Button, LucideIcon, Text} from '@/shared/ui';

type LibrarySearchResultAvailabilityActionProps = {
  buttonLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  showSpinner?: boolean;
};

function LibrarySearchResultAvailabilityAction({
  buttonLabel = '대출 가능 여부 조회',
  disabled = false,
  onClick,
  showSpinner = false,
}: LibrarySearchResultAvailabilityActionProps) {
  return (
    <div className="grid gap-2">
      <Button
        aria-busy={showSpinner || undefined}
        className="w-full rounded-2xl"
        disabled={disabled}
        onClick={onClick}
        size="lg"
        variant="default"
      >
        <LucideIcon
          className={showSpinner ? 'h-4 w-4 animate-spin' : 'h-4 w-4'}
          icon={showSpinner ? LoaderCircle : Search}
          strokeWidth={2.2}
        />
        {buttonLabel}
      </Button>
      <Text className="px-1 text-sm" size="sm" tone="muted">
        대출 가능 여부는 전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.
      </Text>
    </div>
  );
}

export {LibrarySearchResultAvailabilityAction};
export type {LibrarySearchResultAvailabilityActionProps};
