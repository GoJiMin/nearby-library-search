import {Link} from 'react-router-dom';
import {Button, Heading, Text} from '@/shared/ui';

type SimpleFallbackStateProps = {
  actionHref?: string;
  actionLabel?: string;
  descriptions: ReadonlyArray<string>;
  title: string;
};

function SimpleFallbackState({
  title,
  descriptions,
  actionLabel = '홈으로 돌아가기',
  actionHref = '/',
}: SimpleFallbackStateProps) {
  return (
    <section className="flex min-h-[calc(100vh-96px)] flex-col items-center justify-center">
      <Heading as="h1" className="mb-4 text-center" size="xl">
        {title}
      </Heading>
      <div className="flex flex-col items-center">
        {descriptions.map(description => (
          <Text key={description} className="text-center" size="sm">
            {description}
          </Text>
        ))}
      </div>
      <Button asChild className="mt-6 rounded-xl" size="sm">
        <Link to={actionHref}>{actionLabel}</Link>
      </Button>
    </section>
  );
}

export {SimpleFallbackState};
export type {SimpleFallbackStateProps};
