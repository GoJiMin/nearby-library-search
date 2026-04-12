import type {PropsWithChildren} from 'react';
import {Toaster as SonnerToaster} from 'sonner';
import {GlobalErrorDetector} from './GlobalErrorDetector';
import {ReactQueryProvider} from './ReactQueryProvider';
import {UnexpectedErrorBoundary} from './UnexpectedErrorBoundary';

function AppProvider({children}: PropsWithChildren) {
  return (
    <UnexpectedErrorBoundary>
      <ReactQueryProvider>
        <GlobalErrorDetector />
        <SonnerToaster
          className="[--width:420px]"
          expand={false}
          gap={12}
          mobileOffset={12}
          position="top-center"
          toastOptions={{
            unstyled: true,
          }}
          visibleToasts={4}
        />
        {children}
      </ReactQueryProvider>
    </UnexpectedErrorBoundary>
  );
}

export {AppProvider};
