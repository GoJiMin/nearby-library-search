import {LoaderCircle} from 'lucide-react';

type LoadingStateProps = {
  label?: string;
};

function LoadingState({label = '로딩 중'}: LoadingStateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div aria-live="polite" role="status">
        <LoaderCircle aria-hidden className="text-foreground size-8 animate-spin" strokeWidth={2.25} />
        <span className="sr-only">{label}</span>
      </div>
    </div>
  );
}

export {LoadingState};
export type {LoadingStateProps};
