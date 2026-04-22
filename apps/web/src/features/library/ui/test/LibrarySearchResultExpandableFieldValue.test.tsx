import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {LibrarySearchResultExpandableFieldValue} from '../common/LibrarySearchResultExpandableFieldValue';

const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;

function createMockDomRect(width: number, height: number): DOMRect {
  return {
    bottom: height,
    height,
    left: 0,
    right: width,
    toJSON: () => ({}),
    top: 0,
    width,
    x: 0,
    y: 0,
  } as DOMRect;
}

type GeometryState = {
  availableWidth: number;
  measuredWidth: number;
};

describe('LibrarySearchResultExpandableFieldValue', () => {
  let geometry: GeometryState;
  let resizeObserverCallback: ResizeObserverCallback | null;

  beforeEach(() => {
    geometry = {
      availableWidth: 180,
      measuredWidth: 220,
    };
    resizeObserverCallback = null;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);

      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockExpandableFieldRect(
      this: HTMLElement,
    ) {
      if (this.dataset.slot === 'library-search-expandable-field-content') {
        return createMockDomRect(geometry.availableWidth, 24);
      }

      if (this.dataset.slot === 'library-search-expandable-field-measure') {
        return createMockDomRect(geometry.measuredWidth, 24);
      }

      return originalGetBoundingClientRect.call(this);
    });
    vi.stubGlobal(
      'ResizeObserver',
      class MockResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          resizeObserverCallback = callback;
        }

        disconnect() {}
        observe() {}
        unobserve() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('현재 폭에서 1줄을 넘길 때만 더보기를 보여준다', async () => {
    geometry.availableWidth = 180;
    geometry.measuredWidth = 240;

    render(<LibrarySearchResultExpandableFieldValue label="운영 시간" value="평일 - 09:00~22:00, 주말 - 09:00~17:00" />);

    expect(await screen.findByRole('button', {name: '운영 시간 더보기'})).toBeInTheDocument();
  });

  it('현재 폭에 들어가면 더보기를 보여주지 않는다', async () => {
    geometry.availableWidth = 320;
    geometry.measuredWidth = 220;

    render(<LibrarySearchResultExpandableFieldValue label="운영 시간" value="평일 - 09:00~22:00, 주말 - 09:00~17:00" />);

    await waitFor(() => {
      expect(screen.queryByRole('button', {name: '운영 시간 더보기'})).not.toBeInTheDocument();
    });
  });

  it('폭이 줄어들면 더보기 표시를 다시 계산한다', async () => {
    geometry.availableWidth = 320;
    geometry.measuredWidth = 220;

    render(<LibrarySearchResultExpandableFieldValue label="휴관일" value="매주 토요일, 일요일 / 법정공휴일" />);

    await waitFor(() => {
      expect(screen.queryByRole('button', {name: '휴관일 더보기'})).not.toBeInTheDocument();
    });

    geometry.availableWidth = 160;

    const contentNode = document.querySelector('[data-slot="library-search-expandable-field-content"]');

    if (!(contentNode instanceof HTMLElement) || resizeObserverCallback == null) {
      throw new Error('Expandable field measurement hooks are not available.');
    }

    resizeObserverCallback(
      [
        {
          borderBoxSize: [],
          contentBoxSize: [],
          contentRect: createMockDomRect(geometry.availableWidth, 24),
          devicePixelContentBoxSize: [],
          target: contentNode,
        } as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    );

    expect(await screen.findByRole('button', {name: '휴관일 더보기'})).toBeInTheDocument();
  });

  it('값이 바뀌면 펼침 상태를 초기화한다', async () => {
    const user = userEvent.setup();
    const {rerender} = render(
      <LibrarySearchResultExpandableFieldValue label="운영 시간" value={'평일 - 09:00~22:00\n주말 - 09:00~17:00'} />,
    );

    await user.click(await screen.findByRole('button', {name: '운영 시간 더보기'}));

    expect(screen.getByRole('button', {name: '운영 시간 접기'})).toBeInTheDocument();
    expect(document.querySelector('[data-slot="library-search-expandable-field-content"]')).toHaveTextContent(
      '평일 - 09:00~22:00 주말 - 09:00~17:00',
    );

    rerender(
      <LibrarySearchResultExpandableFieldValue label="운영 시간" value={'평일 - 10:00~20:00\n주말 - 10:00~16:00'} />,
    );

    expect(await screen.findByRole('button', {name: '운영 시간 더보기'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '운영 시간 접기'})).not.toBeInTheDocument();
    expect(document.querySelector('[data-slot="library-search-expandable-field-content"]')).toHaveTextContent(
      '평일 - 10:00~20:00 / 주말 - 10:00~16:00',
    );
  });
});
