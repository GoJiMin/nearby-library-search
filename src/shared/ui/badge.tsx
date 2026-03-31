import { cva, type VariantProps } from 'class-variance-authority'
import clsx, { type ClassValue } from 'clsx'
import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const badgeVariants = cva(
  'inline-flex items-center gap-2 rounded-pill px-3 py-2 text-sm font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-accent-soft text-accent-strong',
        muted: 'bg-surface-muted text-text-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type BadgeProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={mergeClassNames(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
