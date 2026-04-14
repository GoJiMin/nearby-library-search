import {useEffect} from 'react';
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom';
import {SecondaryPageHeader} from '@/app/layouts';
import type {BookSearchParams} from '@/entities/book';
import {BookDetailDialogAsync, useBookDetailDialogStore} from '@/features/book-detail-dialog';
import {BookSearchResult, readBookSearchResultUrlState} from '@/features/book-search';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultDialog} from '@/features/library';
import {RegionSelectDialogAsync} from '@/features/region';
import {Button, Card, Heading, Text} from '@/shared/ui';

type BookSearchResultPageContentProps = {
  params: BookSearchParams;
};

function createPageHref(params: BookSearchParams, page: number) {
  const nextSearchParams = new URLSearchParams({
    page: String(page),
  });

  if (params.title) {
    nextSearchParams.set('title', params.title);
  }

  if (params.author) {
    nextSearchParams.set('author', params.author);
  }

  return `/books?${nextSearchParams.toString()}`;
}

function BookSearchResultPageContent({params}: BookSearchResultPageContentProps) {
  const navigate = useNavigate();
  const resetBookDetailDialog = useBookDetailDialogStore(state => state.resetBookDetailDialog);
  const hasRegionDialogBook = useFindLibraryStore(state => state.regionDialogBook != null);
  const resetFindLibraryFlow = useFindLibraryStore(state => state.resetFindLibraryFlow);

  useEffect(() => {
    resetFindLibraryFlow();
  }, [resetFindLibraryFlow]);

  useEffect(() => {
    resetBookDetailDialog();

    return () => {
      resetBookDetailDialog();
    };
  }, [params.author, params.page, params.title, resetBookDetailDialog]);

  function handleSubmitSearch(nextParams: BookSearchParams) {
    const nextSearchParams = new URLSearchParams({
      page: String(nextParams.page),
    });

    if (nextParams.title) {
      nextSearchParams.set('title', nextParams.title);
    }

    if (nextParams.author) {
      nextSearchParams.set('author', nextParams.author);
    }

    navigate({
      pathname: '/books',
      search: `?${nextSearchParams.toString()}`,
    });
  }

  return (
    <>
      <SecondaryPageHeader />
      <BookSearchResult
        createPageHref={page => createPageHref(params, page)}
        onSubmitSearch={handleSubmitSearch}
        params={params}
      />
      <BookDetailDialogAsync />
      {hasRegionDialogBook && <RegionSelectDialogAsync />}
      <LibrarySearchResultDialog />
    </>
  );
}

function BookSearchResultPage() {
  const [searchParams] = useSearchParams();
  const urlStateResult = readBookSearchResultUrlState(searchParams);

  if (urlStateResult.kind === 'empty') {
    return <Navigate replace to="/" />;
  }

  if (urlStateResult.kind === 'recoverable') {
    return (
      <div className="flex w-full flex-1 flex-col">
        <SecondaryPageHeader />
        <section className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6">
          <Card className="w-full max-w-2xl px-6 py-8 text-left sm:px-8">
            <div className="space-y-4">
              <Heading as="h1" size="xl">
                검색 결과를 불러올 수 없어요
              </Heading>
              <Text>{urlStateResult.message}</Text>
              <Button asChild className="mt-2">
                <Link to="/">검색 다시 시작</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col">
      <BookSearchResultPageContent params={urlStateResult.data.params} />
    </div>
  );
}

export {BookSearchResultPage};
