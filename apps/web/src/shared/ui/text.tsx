import clsx, {type ClassValue} from 'clsx';
import type {ElementType, HTMLAttributes, ReactNode} from 'react';
import {twMerge} from 'tailwind-merge';

type TextProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  tone?: 'default' | 'muted';
  size?: 'base' | 'sm';
};

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const textToneClassName = {
  default: 'text-text',
  muted: 'text-text-muted',
} as const;

const textSizeClassName = {
  base: 'text-base leading-7',
  sm: 'text-sm leading-6 sm:text-base',
} as const;

function Text({as, children, className, tone = 'muted', size = 'base', ...props}: TextProps) {
  const Component = as ?? 'p';

  return (
    <Component className={mergeClassNames(textToneClassName[tone], textSizeClassName[size], className)} {...props}>
      {children}
    </Component>
  );
}

export {Text};
export type {TextProps};
