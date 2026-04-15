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

function LibrarySearchResultExpandableFieldValue({
  label,
  value,
}: LibrarySearchResultExpandableFieldValueProps) {
  const expandedValue = normalizeExpandedValue(value);
  const collapsedValue = createCollapsedValue(expandedValue);
  const valueSignature = `${collapsedValue}\u0000${expandedValue}`;
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement | null>(null);
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const previousValueSignatureRef = useRef(valueSignature);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (previousValueSignatureRef.current === valueSignature) {
      return;
    }

    previousValueSignatureRef.current = valueSignature;
    setIsExpanded(false);
    setIsOverflowing(false);
  }, [valueSignature]);

  useLayoutEffect(() => {
    if (isExpanded) {
      return;
    }

    const contentNode = contentRef.current;
    const measureNode = measureRef.current;

    if (contentNode == null || measureNode == null) {
      return;
    }

    const measureOverflow = () => {
      const availableWidth = contentNode.getBoundingClientRect().width;
      const measuredWidth = measureNode.getBoundingClientRect().width;

      if (availableWidth === 0 || measuredWidth === 0) {
        return;
      }

      setIsOverflowing(measuredWidth > availableWidth + 1);
    };

    const frameId = window.requestAnimationFrame(measureOverflow);
    const resizeObserver =
      typeof window.ResizeObserver === 'undefined'
        ? null
        : new window.ResizeObserver(() => {
            measureOverflow();
          });

    let cancelled = false;
    const fontReadyPromise = document.fonts?.ready;

    resizeObserver?.observe(contentNode);

    void fontReadyPromise?.then(() => {
      if (!cancelled) {
        measureOverflow();
      }
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [collapsedValue, isExpanded]);

  const actionLabel = isExpanded ? `${label} 접기` : `${label} 더보기`;

  return (
    <div className="relative space-y-1">
      <p
        data-slot="library-search-expandable-field-content"
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
      {!isExpanded && (
        <span
          aria-hidden="true"
          className="text-text pointer-events-none invisible fixed top-0 left-[-9999px] w-max whitespace-nowrap text-sm leading-6 select-none"
          data-slot="library-search-expandable-field-measure"
          ref={measureRef}
        >
          {collapsedValue}
        </span>
      )}
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
