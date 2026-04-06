import type {PropsWithChildren} from 'react';

function AppLayout({children}: PropsWithChildren) {
  return (
    <div className="from-surface-muted via-background to-background min-h-screen bg-linear-to-b">
      <div className="mx-auto flex min-h-screen w-full max-w-300 flex-col px-5 pt-5 pb-10 sm:px-8 sm:pt-7 sm:pb-14">
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}

export {AppLayout};
