import {SearchX} from 'lucide-react';
import {Badge, Card, Heading, LucideIcon, Text} from '@/shared/ui';

type EmptyStateProps = {
  description: string;
  label?: string;
  title: string;
};

function EmptyState({title, description, label = '빈 상태'}: EmptyStateProps) {
  return (
    <Card className="relative overflow-hidden px-6 py-8 text-left sm:px-8 sm:py-10">
      <div className="bg-accent-soft absolute top-0 -right-12 h-40 w-40 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <div className="bg-accent-soft text-accent-strong mb-5 inline-flex h-14 w-14 items-center justify-center rounded-3xl">
            <LucideIcon icon={SearchX} size={24} strokeWidth={2.1} />
          </div>
          <Badge className="mb-4" variant="muted">
            {label}
          </Badge>
          <Heading as="strong" className="mb-3 block" size="xl">
            {title}
          </Heading>
          <Text className="max-w-xl" size="sm">
            {description}
          </Text>
        </div>

        <div className="grid min-w-55 gap-3 sm:max-w-70">
          <Card className="bg-surface-strong rounded-3xl p-4 shadow-[inset_0_0_0_1px_rgba(2,32,71,0.05)]">
            <Heading as="strong" className="mb-1 block" size="md">
              도서 검색
            </Heading>
            <Text size="sm">제목을 입력하면 검색 흐름이 여기서 이어집니다.</Text>
          </Card>
          <Card className="bg-surface-muted rounded-3xl p-4 shadow-none">
            <div className="bg-line mb-3 h-px w-full" />
            <Text size="sm">검색 전에는 결과 대신 다음 단계 안내만 보여줍니다.</Text>
          </Card>
        </div>
      </div>
    </Card>
  );
}

export {EmptyState};
export type {EmptyStateProps};
