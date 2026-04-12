import {useEffect} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {RequestError, useGlobalRequestError, useResetGlobalRequestError} from '@/shared/request';
import {toast} from '@/shared/ui';

function GlobalErrorDetector() {
  const error = useGlobalRequestError();
  const resetGlobalRequestError = useResetGlobalRequestError();
  const {showBoundary} = useErrorBoundary();

  useEffect(() => {
    if (!error) {
      return;
    }

    if (error instanceof RequestError) {
      toast.error({
        description: error.message,
        title: '요청을 완료하지 못했어요',
      });
      resetGlobalRequestError();
      return;
    }

    showBoundary(error);
    resetGlobalRequestError();
  }, [error, resetGlobalRequestError, showBoundary]);

  return null;
}

export {GlobalErrorDetector};
