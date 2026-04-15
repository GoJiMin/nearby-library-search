import * as DialogPrimitive from '@radix-ui/react-dialog';
import clsx, {type ClassValue} from 'clsx';
import {X} from 'lucide-react';
import {forwardRef, type ComponentPropsWithoutRef, type ElementRef} from 'react';
import {twMerge} from 'tailwind-merge';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({className, ...props}, ref) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={mergeClassNames('fixed inset-0 z-50 bg-slate-950/24 backdrop-blur-[2px]', className)}
      ref={ref}
      {...props}
    />
  );
});

type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  mobileFullscreen?: boolean;
  showCloseButton?: boolean;
};

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({children, className, mobileFullscreen = false, showCloseButton = true, ...props}, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={mergeClassNames(
          'bg-surface-strong shadow-card fixed z-50 grid outline-none',
          mobileFullscreen
            ? 'top-0 left-0 h-dvh w-dvw max-w-none translate-x-0 translate-y-0 gap-5 rounded-none border-0 p-0 sm:top-1/2 sm:left-1/2 sm:w-[min(calc(100vw-32px),560px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-panel sm:border sm:p-8'
            : 'border-line rounded-panel top-1/2 left-1/2 w-[min(calc(100vw-32px),560px)] -translate-x-1/2 -translate-y-1/2 gap-5 border p-6 sm:p-8',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            aria-label="닫기"
            className="text-text-muted hover:text-text hover:bg-surface-muted focus-visible:ring-accent-soft absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

function DialogHeader({className, ...props}: ComponentPropsWithoutRef<'header'>) {
  return <header className={mergeClassNames('flex flex-col gap-2 text-left', className)} {...props} />;
}

function DialogFooter({className, ...props}: ComponentPropsWithoutRef<'footer'>) {
  return (
    <footer
      className={mergeClassNames('flex flex-col-reverse gap-3 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({className, ...props}, ref) {
  return (
    <DialogPrimitive.Title
      className={mergeClassNames('text-text text-2xl font-semibold', className)}
      ref={ref}
      {...props}
    />
  );
});

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({className, ...props}, ref) {
  return (
    <DialogPrimitive.Description
      className={mergeClassNames('text-text-muted text-sm leading-6', className)}
      ref={ref}
      {...props}
    />
  );
});

export {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger};
