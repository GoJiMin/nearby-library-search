import type {PropsWithChildren} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {Button, Heading, Text} from '@/shared/ui';

function UnexpectedErrorFallback() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6">
      <Heading as="h1" className="mb-4 text-center" size="xl">
        화면을 불러오지 못했어요
      </Heading>
      <div className="flex flex-col items-center gap-1">
        <Text className="text-center" size="sm">
          예상하지 못한 문제가 발생했습니다.
        </Text>
        <Text className="text-center" size="sm">
          홈으로 돌아가 다시 시도해 주세요.
        </Text>
      </div>
      <Button className="mt-6 rounded-xl" onClick={() => window.location.assign('/')}>
        홈으로 돌아가기
      </Button>
    </section>
  );
}

function UnexpectedErrorBoundary({children}: PropsWithChildren) {
  return <ErrorBoundary fallbackRender={() => <UnexpectedErrorFallback />}>{children}</ErrorBoundary>;
}

export {UnexpectedErrorBoundary};
