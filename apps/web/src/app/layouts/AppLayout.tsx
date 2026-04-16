import type {PropsWithChildren} from 'react';

function AppLayout({children}: PropsWithChildren) {
  return (
    <div className="from-surface-muted via-background to-background flex min-h-screen flex-col bg-linear-to-b">
      <div className="mx-auto flex w-full max-w-300 flex-1 flex-col px-5 pt-5 sm:px-8 sm:pt-7">
        <main className="flex flex-1 flex-col pb-10 sm:pb-14">{children}</main>
      </div>
      <footer className="text-text-muted w-full px-5 pb-3 text-right text-xs sm:px-8 sm:pb-4 md:text-sm">
        © 2026 니어립 by prolip
      </footer>
    </div>
  );
}

export {AppLayout};
