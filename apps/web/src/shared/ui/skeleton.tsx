import clsx, {type ClassValue} from 'clsx';
import type {HTMLAttributes} from 'react';
import {twMerge} from 'tailwind-merge';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

function mergeClassNames(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Skeleton({className, ...props}: SkeletonProps) {
  return <div className={mergeClassNames('animate-pulse rounded-2xl bg-black/10', className)} {...props} />;
}

export {Skeleton};
export type {SkeletonProps};
