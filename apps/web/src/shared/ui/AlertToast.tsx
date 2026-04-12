import {CircleAlert, CircleCheckBig, Info, X} from 'lucide-react';
import type {ButtonHTMLAttributes, ReactNode} from 'react';
import clsx, {type ClassValue} from 'clsx';
import {toast as sonnerToast} from 'sonner';
import {twMerge} from 'tailwind-merge';

type ToastTone = 'error' | 'info' | 'success';

type ToastActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

type AlertToastProps = {
  description?: string;
  title: string;
  toastId: string;
  tone: ToastTone;
};

const TOAST_TONE_META: Record<
  ToastTone,
  {
    icon: typeof CircleAlert;
    iconClassName: string;
  }
> = {
  error: {
    icon: CircleAlert,
    iconClassName: 'bg-red-500/12 text-red-600',
  },
  info: {
    icon: Info,
    iconClassName: 'bg-accent-soft text-accent',
  },
  success: {
    icon: CircleCheckBig,
    iconClassName: 'bg-emerald-500/12 text-emerald-600',
  },
};

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function ToastAction({children, className, type = 'button', ...props}: ToastActionProps) {
  return (
    <button
      className={mergeClassNames(
        'text-text-muted hover:text-text focus-visible:ring-accent-soft inline-flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-4',
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

function AlertToast({title, description, tone, toastId}: AlertToastProps) {
  const {icon: Icon, iconClassName} = TOAST_TONE_META[tone];

  return (
    <div className="border-line bg-surface shadow-card flex w-[min(92vw,420px)] items-start gap-4 rounded-3xl border px-4 py-4 backdrop-blur">
      <div className={mergeClassNames('mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', iconClassName)}>
        <Icon size={20} strokeWidth={2.2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-text text-sm font-semibold">{title}</p>
        {description && <p className="text-text-muted mt-1 text-sm leading-5">{description}</p>}
      </div>

      <ToastAction aria-label="토스트 닫기" onClick={() => sonnerToast.dismiss(toastId)}>
        <X size={18} strokeWidth={2.2} />
      </ToastAction>
    </div>
  );
}

export {AlertToast};
export type {ToastTone};
