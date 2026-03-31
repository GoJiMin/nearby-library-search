import clsx, { type ClassValue } from 'clsx'
import type { LucideIcon as LucideIconType, LucideProps } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

type LucideIconProps = LucideProps & {
  icon: LucideIconType
}

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function LucideIcon({
  icon: Icon,
  className,
  'aria-label': ariaLabel,
  strokeWidth = 2,
  ...props
}: LucideIconProps) {
  const isDecorative = ariaLabel == null

  return (
    <Icon
      aria-hidden={isDecorative}
      aria-label={ariaLabel}
      className={mergeClassNames(props.onClick && 'cursor-pointer', className)}
      role={isDecorative ? undefined : 'img'}
      strokeWidth={strokeWidth}
      {...props}
    />
  )
}

export { LucideIcon }
export type { LucideIconProps }
