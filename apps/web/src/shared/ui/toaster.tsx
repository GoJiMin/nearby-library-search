import {Toaster as SonnerToaster} from 'sonner';

function AppToaster() {
  return (
    <SonnerToaster
      expand={false}
      gap={12}
      position="top-center"
      toastOptions={{
        unstyled: true,
      }}
      visibleToasts={4}
    />
  );
}

export {AppToaster};
