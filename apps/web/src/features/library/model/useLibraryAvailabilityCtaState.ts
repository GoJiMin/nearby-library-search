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

function useLibraryAvailabilityCtaState({
  data: _data,
  hasSelectedLibrary,
  isError: _isError,
  isFetching: _isFetching,
}: UseLibraryAvailabilityCtaStateParams) {
  const [hasRequested, setHasRequested] = useState(false);

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
    status: 'idle' as LibraryAvailabilityCtaStatus,
  };
}

export {useLibraryAvailabilityCtaState};
export type {LibraryAvailabilityCtaStatus, UseLibraryAvailabilityCtaStateParams};
