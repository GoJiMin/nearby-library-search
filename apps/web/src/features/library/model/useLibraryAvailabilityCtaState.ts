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

function resolveLibraryAvailabilityButtonLabel(status: LibraryAvailabilityCtaStatus) {
  switch (status) {
    case 'success-available':
      return '대출이 가능해요';
    case 'success-unavailable':
      return '대출이 불가능해요';
    case 'success-not-owned':
      return '소장하지 않아요';
    case 'error':
      return '재시도';
    default:
      return '대출 가능 여부 조회';
  }
}

function shouldDisableLibraryAvailabilityButton({
  hasSelectedLibrary,
  status,
}: {
  hasSelectedLibrary: boolean;
  status: LibraryAvailabilityCtaStatus;
}) {
  if (!hasSelectedLibrary) {
    return true;
  }

  switch (status) {
    case 'pending':
      return true;
    default:
      return false;
  }
}

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
  const buttonLabel = resolveLibraryAvailabilityButtonLabel(status);
  const disabled = shouldDisableLibraryAvailabilityButton({
    hasSelectedLibrary,
    status,
  });
  const showSpinner = status === 'pending';

  const markRequested = () => {
    setHasRequested(true);
  };

  const resetRequested = () => {
    setHasRequested(false);
  };

  return {
    buttonLabel,
    disabled,
    hasRequested,
    markRequested,
    resetRequested,
    showSpinner,
    status,
  };
}

export {useLibraryAvailabilityCtaState};
export type {LibraryAvailabilityCtaStatus, UseLibraryAvailabilityCtaStateParams};
