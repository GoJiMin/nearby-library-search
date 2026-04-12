import {useEffect} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {clearGlobalRequestError, RequestError, useGlobalRequestError} from '@/shared/request';
import {toast} from '@/shared/ui';

function GlobalErrorDetector() {
  const error = useGlobalRequestError();
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
      clearGlobalRequestError();
      return;
    }

    showBoundary(error);
    clearGlobalRequestError();
  }, [error, showBoundary]);

  return null;
}

export {GlobalErrorDetector};
