import clsx, {type ClassValue} from 'clsx';
import type {ElementType, HTMLAttributes, ReactNode} from 'react';
import {twMerge} from 'tailwind-merge';

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: ElementType;
  children: ReactNode;
  size?: 'display' | 'xl' | 'lg' | 'md';
};

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const headingSizeClassName = {
  display: 'text-3xl md:text-5xl leading-[1.06] tracking-[-0.05em]',
  xl: 'text-3xl leading-[1.12] tracking-[-0.05em]',
  lg: 'text-2xl leading-[1.16] tracking-[-0.03em]',
  md: 'text-xl leading-[1.2] tracking-[-0.02em]',
} as const;

function Heading({as, children, className, size = 'lg', ...props}: HeadingProps) {
  const Component = as ?? 'h2';

  return (
    <Component className={mergeClassNames('text-text font-semibold', headingSizeClassName[size], className)} {...props}>
      {children}
    </Component>
  );
}

export {Heading};
export type {HeadingProps};
