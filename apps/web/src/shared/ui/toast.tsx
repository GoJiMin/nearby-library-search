import {toast as sonnerToast, type ExternalToast} from 'sonner';
import {AlertToast, type ToastTone} from './AlertToast';

type ToastContent = {
  description?: string;
  title: string;
};

function showToast(tone: ToastTone, {title, description}: ToastContent, options?: ExternalToast) {
  return sonnerToast.custom(
    toastId => <AlertToast description={description} title={title} toastId={String(toastId)} tone={tone} />,
    {
      duration: 4000,
      ...options,
    },
  );
}

const toast = {
  dismiss: sonnerToast.dismiss,
  error(content: ToastContent, options?: ExternalToast) {
    return showToast('error', content, options);
  },
  info(content: ToastContent, options?: ExternalToast) {
    return showToast('info', content, options);
  },
  show(content: ToastContent, options?: ExternalToast) {
    return showToast('info', content, options);
  },
  success(content: ToastContent, options?: ExternalToast) {
    return showToast('success', content, options);
  },
} as const;

export {toast};
export type {ToastContent};
