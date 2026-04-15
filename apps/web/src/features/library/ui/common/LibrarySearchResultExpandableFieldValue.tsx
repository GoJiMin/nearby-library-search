import {useId, useLayoutEffect, useRef, useState} from 'react';
import {decodeHtmlEntities} from '@/shared/lib/decodeHtmlEntities';

type LibrarySearchResultExpandableFieldValueProps = {
  label: string;
  value: string;
};

function normalizeExpandedValue(value: string) {
  return decodeHtmlEntities(value)
    .replace(/\s*\/\s*/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function createCollapsedValue(value: string) {
  return value.replace(/\n+/g, ' / ');
}

function estimateOverflow(value: string) {
  return value.includes('\n') || value.length > 90;
}

function LibrarySearchResultExpandableFieldValue({
  label,
  value,
}: LibrarySearchResultExpandableFieldValueProps) {
  const expandedValue = normalizeExpandedValue(value);
  const collapsedValue = createCollapsedValue(expandedValue);
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(() => estimateOverflow(expandedValue));

  useLayoutEffect(() => {
    if (isExpanded) {
      return;
    }

    const node = contentRef.current;

    if (node == null) {
      return;
    }

    const measureOverflow = () => {
      if (node.clientHeight === 0 || node.scrollHeight === 0) {
        return;
      }

      setIsOverflowing(node.scrollHeight > node.clientHeight + 1);
    };

    const frameId = window.requestAnimationFrame(measureOverflow);
    window.addEventListener('resize', measureOverflow);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', measureOverflow);
    };
  }, [collapsedValue, expandedValue, isExpanded]);

  const actionLabel = isExpanded ? `${label} 접기` : `${label} 더보기`;

  return (
    <div className="space-y-2">
      <p
        id={contentId}
        ref={contentRef}
        className={
          isExpanded
            ? 'text-text text-sm leading-6 break-words whitespace-pre-line sm:text-base'
            : 'text-text line-clamp-2 text-sm leading-6 break-words sm:text-base'
        }
      >
        {isExpanded ? expandedValue : collapsedValue}
      </p>
      {isOverflowing && (
        <button
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={actionLabel}
          className="text-accent hover:text-accent-strong focus-visible:ring-accent-soft inline-flex rounded-full px-1 py-1 text-sm font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
          onClick={() => {
            setIsExpanded(previous => !previous);
          }}
          type="button"
        >
          {isExpanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}

export {LibrarySearchResultExpandableFieldValue};
export type {LibrarySearchResultExpandableFieldValueProps};
