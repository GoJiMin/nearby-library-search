import {useState} from 'react';
import type {LibraryAvailabilityResponse} from '@nearby-library-search/contracts';

type LibraryAvailabilityCtaStatus =
  | 'idle'
  | 'pending'
  | 'success-available'
  | 'success-unavailable'
  | 'success-not-owned'
  | 'error';

type UseLibraryAvailabilityCtaStateParams = {
  data: LibraryAvailabilityResponse | undefined;
  hasSelectedLibrary: boolean;
  isError: boolean;
  isFetching: boolean;
};

function resolveLibraryAvailabilityCtaStatus({
  data,
  hasRequested,
  hasSelectedLibrary,
  isError,
  isFetching,
}: UseLibraryAvailabilityCtaStateParams & {
  hasRequested: boolean;
}): LibraryAvailabilityCtaStatus {
  if (!hasSelectedLibrary || !hasRequested) {
    return 'idle';
  }

  if (isFetching) {
    return 'pending';
  }

  if (isError) {
    return 'error';
  }

  if (data?.hasBook === 'N') {
    return 'success-not-owned';
  }

  if (data?.loanAvailable === 'Y') {
    return 'success-available';
  }

  if (data?.loanAvailable === 'N') {
    return 'success-unavailable';
  }

  return 'pending';
}

function useLibraryAvailabilityCtaState({
  data,
  hasSelectedLibrary,
  isError,
  isFetching,
}: UseLibraryAvailabilityCtaStateParams) {
  const [hasRequested, setHasRequested] = useState(false);
  const status = resolveLibraryAvailabilityCtaStatus({
    data,
    hasRequested,
    hasSelectedLibrary,
    isError,
    isFetching,
  });

  const markRequested = () => {
    setHasRequested(true);
  };

  const resetRequested = () => {
    setHasRequested(false);
  };

  return {
    buttonLabel: '대출 가능 여부 조회',
    disabled: !hasSelectedLibrary,
    hasRequested,
    markRequested,
    resetRequested,
    showSpinner: false,
    status,
  };
}

export {useLibraryAvailabilityCtaState};
export type {LibraryAvailabilityCtaStatus, UseLibraryAvailabilityCtaStateParams};
