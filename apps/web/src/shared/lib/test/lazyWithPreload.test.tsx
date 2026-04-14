import {render, screen} from '@testing-library/react';
import {Suspense} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {lazyWithPreload} from '../lazyWithPreload';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return {
    promise,
    reject,
    resolve,
  };
}

function LabelComponent({label}: {label: string}) {
  return <p>{label}</p>;
}

describe('lazyWithPreload', () => {
  it('Suspense fallback 뒤에 lazy component를 렌더링한다', async () => {
    const deferred = createDeferred<{default: typeof LabelComponent}>();
    const importer = vi.fn(() => deferred.promise);
    const AsyncLabel = lazyWithPreload(importer);

    render(
      <Suspense fallback={<p>로딩 중</p>}>
        <AsyncLabel label="지연 로드 성공" />
      </Suspense>,
    );

    expect(screen.getByText('로딩 중')).toBeInTheDocument();

    deferred.resolve({default: LabelComponent});

    expect(await screen.findByText('지연 로드 성공')).toBeInTheDocument();
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('preload를 여러 번 호출해도 importer는 한 번만 실행된다', async () => {
    const importer = vi.fn(async () => ({default: LabelComponent}));
    const AsyncLabel = lazyWithPreload(importer);

    const [firstModule, secondModule, thirdModule] = await Promise.all([
      AsyncLabel.preload(),
      AsyncLabel.preload(),
      AsyncLabel.preload(),
    ]);

    expect(firstModule.default).toBe(LabelComponent);
    expect(secondModule.default).toBe(LabelComponent);
    expect(thirdModule.default).toBe(LabelComponent);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('preload 후 render해도 importer를 다시 호출하지 않는다', async () => {
    const importer = vi.fn(async () => ({default: LabelComponent}));
    const AsyncLabel = lazyWithPreload(importer);

    await AsyncLabel.preload();

    render(
      <Suspense fallback={<p>로딩 중</p>}>
        <AsyncLabel label="미리 불러온 컴포넌트" />
      </Suspense>,
    );

    expect(await screen.findByText('미리 불러온 컴포넌트')).toBeInTheDocument();
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('preload 실패 후 다음 render에서 다시 importer를 시도할 수 있다', async () => {
    const importer = vi.fn(async () => {
      if (importer.mock.calls.length === 1) {
        throw new Error('preload 실패');
      }

      return {default: LabelComponent};
    });
    const AsyncLabel = lazyWithPreload(importer);

    await expect(AsyncLabel.preload()).rejects.toThrow('preload 실패');
    expect(importer).toHaveBeenCalledTimes(1);

    render(
      <Suspense fallback={<p>로딩 중</p>}>
        <AsyncLabel label="재시도 성공" />
      </Suspense>,
    );

    expect(await screen.findByText('재시도 성공')).toBeInTheDocument();
    expect(importer).toHaveBeenCalledTimes(2);
  });
});
