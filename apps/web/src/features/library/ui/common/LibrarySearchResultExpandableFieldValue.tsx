import {useEffect, useId, useLayoutEffect, useRef, useState} from 'react';
import {decodeHtmlEntities} from '@/shared/lib/decodeHtmlEntities';

type LibrarySearchResultExpandableFieldValueProps = {
  label: string;
  value: string;
};

function normalizeExpandedValue(value: string) {
  return decodeHtmlEntities(value)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function createCollapsedValue(value: string) {
  return value.replace(/\n+/g, ' / ');
}

function estimateOverflow(value: string) {
  return value.includes('\n') || value.length > 32;
}

function LibrarySearchResultExpandableFieldValue({
  label,
  value,
}: LibrarySearchResultExpandableFieldValueProps) {
  const expandedValue = normalizeExpandedValue(value);
  const collapsedValue = createCollapsedValue(expandedValue);
  const hasOverflowHint = estimateOverflow(expandedValue);
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(hasOverflowHint);

  useEffect(() => {
    setIsExpanded(false);
    setIsOverflowing(hasOverflowHint);
  }, [expandedValue, hasOverflowHint]);

  useLayoutEffect(() => {
    if (isExpanded) {
      return;
    }

    const node = contentRef.current;

    if (node == null) {
      return;
    }

    const measureOverflow = () => {
      if (node.clientHeight === 0 || node.clientWidth === 0) {
        return;
      }

      const hasMeasuredOverflow = node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1;

      setIsOverflowing(hasOverflowHint || hasMeasuredOverflow);
    };

    const frameId = window.requestAnimationFrame(measureOverflow);
    const resizeObserver =
      typeof window.ResizeObserver === 'undefined'
        ? null
        : new window.ResizeObserver(() => {
            measureOverflow();
          });

    resizeObserver?.observe(node);
    window.addEventListener('resize', measureOverflow);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measureOverflow);
    };
  }, [collapsedValue, hasOverflowHint, isExpanded]);

  const actionLabel = isExpanded ? `${label} 접기` : `${label} 더보기`;

  return (
    <div className="space-y-1">
      <p
        id={contentId}
        ref={contentRef}
        className={
          isExpanded
            ? 'text-text text-sm leading-6 break-words whitespace-pre-line'
            : 'text-text line-clamp-1 text-sm leading-6 break-words'
        }
      >
        {isExpanded ? expandedValue : collapsedValue}
      </p>
      {isOverflowing && (
        <button
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={actionLabel}
          className="text-accent hover:text-accent-strong focus-visible:ring-accent-soft inline-flex self-start rounded-full px-0 py-0.5 text-sm leading-none font-semibold transition-colors focus-visible:ring-4 focus-visible:outline-none"
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
