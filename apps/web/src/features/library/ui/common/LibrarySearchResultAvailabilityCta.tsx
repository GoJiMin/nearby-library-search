import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';
import {LoaderCircle, Search} from 'lucide-react';
import {useGetLibraryAvailability} from '@/entities/library';
import {
  type LibraryAvailabilityCtaStatus,
  useLibraryAvailabilityCtaState,
} from '@/features/library/model/useLibraryAvailabilityCtaState';
import {Button, LucideIcon, Text} from '@/shared/ui';

type LibrarySearchResultAvailabilityActionProps = {
  buttonLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  showSpinner?: boolean;
  status?: LibraryAvailabilityCtaStatus;
};

type LibrarySearchResultAvailabilityCtaProps = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
};

function LibrarySearchResultAvailabilityAction({
  buttonLabel = '대출 가능 여부 조회',
  disabled = false,
  onClick,
  showSpinner = false,
  status = 'idle',
}: LibrarySearchResultAvailabilityActionProps) {
  const isResultStatus =
    status === 'success-available' || status === 'success-unavailable' || status === 'success-not-owned';
  const buttonClassName = isResultStatus
    ? 'w-full rounded-2xl bg-transparent text-accent ring-1 ring-accent/30 ring-inset hover:bg-transparent hover:text-accent pointer-events-none'
    : 'w-full rounded-2xl ring-1 ring-transparent ring-inset';

  return (
    <div className="grid gap-2">
      <Button
        aria-busy={showSpinner || undefined}
        className={buttonClassName}
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
      <Text className="px-1 text-center text-xs" tone="muted">
        전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.
      </Text>
    </div>
  );
}

function LibrarySearchResultAvailabilityCta({isbn13, libraryCode}: LibrarySearchResultAvailabilityCtaProps) {
  const requestIdentity = `${libraryCode}:${isbn13}`;
  const availabilityQuery = useGetLibraryAvailability({
    isbn13,
    libraryCode,
  });
  const {buttonLabel, disabled, markRequested, showSpinner, status} = useLibraryAvailabilityCtaState({
    data: availabilityQuery.data,
    hasSelectedLibrary: true,
    isError: availabilityQuery.isError,
    isFetching: availabilityQuery.isFetching,
    requestIdentity,
  });

  const handleCheckAvailability = async () => {
    markRequested();

    if (availabilityQuery.data != null) {
      return;
    }

    await availabilityQuery.refetch();
  };

  return (
    <LibrarySearchResultAvailabilityAction
      buttonLabel={buttonLabel}
      disabled={disabled}
      onClick={handleCheckAvailability}
      showSpinner={showSpinner}
      status={status}
    />
  );
}

export {LibrarySearchResultAvailabilityAction, LibrarySearchResultAvailabilityCta};
export type {LibrarySearchResultAvailabilityActionProps, LibrarySearchResultAvailabilityCtaProps};
