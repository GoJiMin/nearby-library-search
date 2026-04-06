import {Slot} from '@radix-ui/react-slot';
import {cva, type VariantProps} from 'class-variance-authority';
import clsx, {type ClassValue} from 'clsx';
import type {ButtonHTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-accent-soft disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent-strong',
        secondary: 'border-line bg-surface-strong text-text border hover:bg-surface-muted',
        ghost: 'text-text hover:bg-accent-soft',
      },
      size: {
        default: 'min-h-11 px-5 py-3',
        sm: 'min-h-10 px-4 py-2.5 text-sm',
        lg: 'min-h-12 px-6 py-3.5 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Button({className, variant, size, asChild = false, type = 'button', ...props}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return <Component className={mergeClassNames(buttonVariants({variant, size}), className)} type={type} {...props} />;
}

export {Button};
export type {ButtonProps};
