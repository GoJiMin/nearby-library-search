import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';
import {LoaderCircle, Search} from 'lucide-react';
import {useGetLibraryAvailability} from '@/entities/library';
import {useLibraryAvailabilityCtaState} from '@/features/library/model/useLibraryAvailabilityCtaState';
import {Button, LucideIcon, Text} from '@/shared/ui';

type LibrarySearchResultAvailabilityActionProps = {
  buttonLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  showSpinner?: boolean;
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
      <Text className="px-1 text-center text-xs" tone="muted">
        전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.
      </Text>
    </div>
  );
}

function LibrarySearchResultAvailabilityCta({isbn13, libraryCode}: LibrarySearchResultAvailabilityCtaProps) {
  const availabilityQuery = useGetLibraryAvailability({
    isbn13,
    libraryCode,
  });
  const {buttonLabel, disabled, markRequested, showSpinner} = useLibraryAvailabilityCtaState({
    data: availabilityQuery.data,
    hasSelectedLibrary: true,
    isError: availabilityQuery.isError,
    isFetching: availabilityQuery.isFetching,
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
    />
  );
}

export {LibrarySearchResultAvailabilityAction, LibrarySearchResultAvailabilityCta};
export type {LibrarySearchResultAvailabilityActionProps, LibrarySearchResultAvailabilityCtaProps};
