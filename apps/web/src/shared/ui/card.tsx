import clsx, {type ClassValue} from 'clsx';
import type {HTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({className, ...props}: CardProps) {
  return (
    <div
      className={mergeClassNames('border-line bg-surface-strong rounded-panel shadow-soft border', className)}
      {...props}
    />
  );
}

function CardHeader({className, ...props}: CardProps) {
  return <div className={mergeClassNames('flex flex-col gap-3', className)} {...props} />;
}

function CardContent({className, ...props}: CardProps) {
  return <div className={mergeClassNames(className)} {...props} />;
}

function CardFooter({className, ...props}: CardProps) {
  return <div className={mergeClassNames('flex items-center gap-3', className)} {...props} />;
}

export {Card, CardContent, CardFooter, CardHeader};
export type {CardProps};
