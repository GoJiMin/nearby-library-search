import clsx, { type ClassValue } from 'clsx'
import type { InputHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

type InputProps = InputHTMLAttributes<HTMLInputElement>

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      className={mergeClassNames(
        'border-line bg-surface-strong text-text placeholder:text-text-muted selection:bg-accent shadow-soft focus-visible:border-accent focus-visible:ring-accent-soft flex min-h-12 w-full rounded-2xl border px-4 py-3 text-base transition-colors outline-none selection:text-white focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      type={type}
      {...props}
    />
  )
}

export { Input }
export type { InputProps }
