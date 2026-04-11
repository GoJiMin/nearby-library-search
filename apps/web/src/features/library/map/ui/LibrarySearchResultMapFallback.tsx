import type {KakaoMapSdkLoadErrorCode} from '@/shared/kakao-map';
import {Heading, Skeleton, Text} from '@/shared/ui';
import {LibrarySearchResultMapControls} from './LibrarySearchResultMapControls';

function LibrarySearchResultMapPlaceholderBody() {
  return (
    <>
      <Skeleton className="h-full w-full rounded-none" />
      <LibrarySearchResultMapControls />
    </>
  );
}

function LibrarySearchResultMapUnavailableBody({diagnosticCode}: {diagnosticCode?: KakaoMapSdkLoadErrorCode | null}) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.38)_1px,transparent_1px)] bg-size-[44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_64%)]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="shadow-card bg-surface-strong/92 max-w-76 rounded-3xl px-6 py-5 text-center backdrop-blur-sm">
          <Heading as="h3" size="sm">
            지도를 표시할 수 없어요
          </Heading>
          <Text className="mt-2" size="sm" tone="muted">
            카카오 지도 설정을 확인한 뒤 다시 시도해 주세요.
          </Text>
          {diagnosticCode ? (
            <Text className="mt-3 font-mono text-xs leading-5" size="sm" tone="muted">
              개발 진단: {diagnosticCode}
            </Text>
          ) : null}
        </div>
      </div>
      <LibrarySearchResultMapControls />
    </>
  );
}

function LibrarySearchResultMapNoCoordinateBody() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.38)_1px,transparent_1px)] bg-size-[44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_64%)]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="shadow-card bg-surface-strong/92 max-w-76 rounded-3xl px-6 py-5 text-center backdrop-blur-sm">
          <Heading as="h3" size="sm">
            지도로 표시할 수 있는 위치 정보가 없어요
          </Heading>
          <Text className="mt-2" size="sm" tone="muted">
            현재 페이지 결과는 목록과 상세 정보로만 확인할 수 있어요.
          </Text>
        </div>
      </div>
    </>
  );
}

export {
  LibrarySearchResultMapNoCoordinateBody,
  LibrarySearchResultMapPlaceholderBody,
  LibrarySearchResultMapUnavailableBody,
};
