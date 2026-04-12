import {useEffect} from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {consumeRequestError, RequestError, useNextRequestError} from '@/shared/request';
import {toast} from '@/shared/ui';

function GlobalErrorDetector() {
  const queuedError = useNextRequestError();
  const {showBoundary} = useErrorBoundary();

  useEffect(() => {
    if (!queuedError) {
      return;
    }

    if (queuedError.error instanceof RequestError) {
      toast.error({
        description: queuedError.error.message,
        title: '요청을 완료하지 못했어요',
      });
      consumeRequestError(queuedError.id);
      return;
    }

    showBoundary(queuedError.error);
    consumeRequestError(queuedError.id);
  }, [queuedError, showBoundary]);

  return null;
}

export {GlobalErrorDetector};
