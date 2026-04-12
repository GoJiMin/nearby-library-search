import type {PropsWithChildren} from 'react';
import {AppToaster} from '@/shared/ui';
import {GlobalErrorDetector} from './GlobalErrorDetector';
import {ReactQueryProvider} from './ReactQueryProvider';
import {UnexpectedErrorBoundary} from './UnexpectedErrorBoundary';

function AppProvider({children}: PropsWithChildren) {
  return (
    <UnexpectedErrorBoundary>
      <ReactQueryProvider>
        <GlobalErrorDetector />
        <AppToaster />
        {children}
      </ReactQueryProvider>
    </UnexpectedErrorBoundary>
  );
}

export {AppProvider};
