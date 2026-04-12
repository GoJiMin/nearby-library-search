import {BookOpen, X} from 'lucide-react';
import {DialogClose, DialogContent, DialogHeader, DialogTitle, Heading, LucideIcon, Skeleton, Text} from '@/shared/ui';

const bookDetailMetaLabels = ['저자', '출판 정보', 'ISBN', '분류 정보'] as const;
const bookDetailAgeStatWidths = ['w-16', 'w-20', 'w-16', 'w-24'] as const;

function BookDetailDialogShell() {
  return (
    <DialogContent
      aria-describedby={undefined}
      className="h-[min(calc(100vh-32px),760px)] w-[min(calc(100vw-32px),980px)] gap-0 overflow-hidden p-0 sm:p-0"
      showCloseButton={false}
    >
      <DialogHeader className="sr-only">
        <DialogTitle>도서 상세 정보</DialogTitle>
      </DialogHeader>
      <DialogClose asChild>
        <button
          aria-label="닫기"
          className="shadow-card bg-surface-strong text-text-muted hover:text-text focus-visible:ring-accent-soft absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
          type="button"
        >
          <LucideIcon icon={X} strokeWidth={2.2} />
        </button>
      </DialogClose>
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <aside className="border-line bg-surface-muted/35 flex items-center justify-center border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10">
          <div className="flex w-full max-w-52 flex-col gap-3 sm:max-w-56">
            <Text as="p" className="text-xs font-semibold tracking-[0.12em] uppercase" size="sm">
              도서 표지
            </Text>
            <div className="bg-surface border-line flex aspect-[3/4] items-center justify-center rounded-3xl border">
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <LucideIcon className="text-text-muted h-10 w-10" icon={BookOpen} strokeWidth={1.8} />
                <Text size="sm">표지와 핵심 정보를 이 자리에서 함께 보여드릴게요.</Text>
              </div>
            </div>
          </div>
        </aside>
        <div className="min-h-0 overflow-y-auto">
          <div className="flex min-h-full flex-col px-6 py-8 sm:px-8 sm:py-10">
            <section aria-hidden="true" className="border-line flex flex-col gap-3 border-b pb-6 pr-12 sm:pb-8">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-10 w-4/5 rounded-full" />
              <Skeleton className="h-6 w-1/2 rounded-full" />
              <Skeleton className="h-5 w-3/5 rounded-full" />
            </section>

            <section className="border-line flex flex-col gap-5 border-b py-6 sm:py-8">
              <div className="space-y-1">
                <Heading as="h2" size="sm">
                  기본 정보
                </Heading>
                <Text size="sm">제목, 저자, 출판 정보와 ISBN 같은 핵심 정보를 이 영역에 정리합니다.</Text>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {bookDetailMetaLabels.map(label => (
                  <div className="space-y-2" key={label}>
                    <Text as="p" size="sm">
                      {label}
                    </Text>
                    <Skeleton className="h-6 w-4/5 rounded-full" />
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-5 py-6 sm:py-8">
              <div className="space-y-1">
                <Heading as="h2" size="sm">
                  대출 정보
                </Heading>
                <Text size="sm">전체 대출 정보와 연령별 대출 흐름을 같은 화면에서 바로 확인할 수 있습니다.</Text>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Text as="p" size="sm">
                    전체 대출 정보
                  </Text>
                  <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Text as="p" size="sm">
                    연령별 대출 정보
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {bookDetailAgeStatWidths.map(widthClassName => (
                      <Skeleton className={`h-9 rounded-full ${widthClassName}`} key={widthClassName} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export {BookDetailDialogShell};
