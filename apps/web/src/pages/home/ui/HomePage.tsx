import {useNavigate} from 'react-router-dom';
import {BookSearchStart} from '@/features/book';
import type {BookSearchParams} from '@/entities/book';
import {Text} from '@/shared/ui';
import {BrandMessage} from './BrandMessage';

function HomePage() {
  const navigate = useNavigate();

  function handleSubmitSearch(params: BookSearchParams) {
    const searchParams = new URLSearchParams({
      page: String(params.page),
    });

    if (params.title) {
      searchParams.set('title', params.title);
    }

    if (params.author) {
      searchParams.set('author', params.author);
    }

    navigate({
      pathname: '/books',
      search: `?${searchParams.toString()}`,
    });
  }

  return (
    <section className="mx-auto flex h-full w-full max-w-5xl flex-1 flex-col items-center justify-center">
      <div className="mb-5 flex flex-col gap-5 text-center md:mb-6 md:gap-6">
        <BrandMessage />
        <Text className="leading-[1.55] text-balance" size="sm">
          궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.
          <br />
          지금 바로 빌릴 수 있는 가장 가까운 도서관을 찾아드릴게요.
        </Text>
      </div>

      <BookSearchStart onSubmitSearch={handleSubmitSearch} />
    </section>
  );
}

export {HomePage};
