import type {CSSProperties, PropsWithChildren} from 'react';
import {Toaster as SonnerToaster} from 'sonner';
import {GlobalErrorDetector} from './GlobalErrorDetector';
import {ReactQueryProvider} from './ReactQueryProvider';
import {UnexpectedErrorBoundary} from './UnexpectedErrorBoundary';

const TOAST_VIEWPORT_STYLE = {
  '--width': '420px',
} as CSSProperties;

function AppProvider({children}: PropsWithChildren) {
  return (
    <UnexpectedErrorBoundary>
      <ReactQueryProvider>
        <GlobalErrorDetector />
        <SonnerToaster
          expand={false}
          gap={12}
          mobileOffset={12}
          position="top-center"
          style={TOAST_VIEWPORT_STYLE}
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
