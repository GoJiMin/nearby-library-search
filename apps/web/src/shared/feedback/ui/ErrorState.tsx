import {TriangleAlert} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Badge, Button, Card, Heading, LucideIcon, Text} from '@/shared/ui';

type ErrorStateProps = {
  actionLabel?: string;
  description?: string;
  href?: string;
  label?: string;
  title?: string;
};

function ErrorState({
  title = '화면을 불러오지 못했습니다',
  description = '예상하지 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  label = '오류',
  actionLabel = '홈으로 돌아가기',
  href = '/',
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <Card className="shadow-card relative w-full overflow-hidden px-6 py-8 sm:px-10 sm:py-12">
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white/90 to-transparent" />
        <div className="bg-accent-soft absolute top-4 -right-16 h-44 w-44 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge className="mb-5">
              <LucideIcon icon={TriangleAlert} size={16} strokeWidth={2.2} />
              {label}
            </Badge>
            <Card className="bg-surface inline-flex rounded-3xl p-3 shadow-[inset_0_0_0_1px_rgba(2,32,71,0.05)]">
              <div className="bg-accent-soft text-accent-strong inline-flex h-14 w-14 items-center justify-center rounded-2xl">
                <LucideIcon icon={TriangleAlert} size={26} strokeWidth={2.2} />
              </div>
            </Card>
            <Heading as="h1" className="mt-6 mb-4 max-w-2xl" size="display">
              {title}
            </Heading>
            <Text className="mb-8 max-w-xl">{description}</Text>
          </div>

          <div className="flex min-w-55 flex-col gap-3">
            <Button asChild className="w-full justify-center">
              <Link to={href}>{actionLabel}</Link>
            </Button>
            <Text size="sm">일시적인 문제일 수 있습니다. 홈으로 이동한 뒤 다시 시도해 주세요.</Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

export {ErrorState};
export type {ErrorStateProps};
