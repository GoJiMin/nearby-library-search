import {useState} from 'react';
import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom';
import {SecondaryPageHeader} from '@/app/layouts';
import type {BookSearchParams} from '@/entities/book';
import type {LibrarySearchParams} from '@/entities/library';
import {BookSearchResult, type BookSelectionActionPayload, readBookSearchResultUrlState} from '@/features/book';
import {RegionSelectDialog, type RegionSelectionState} from '@/features/region';
import {Button, Card, Heading, Text} from '@/shared/ui';

function BookSearchResultPage() {
  const [selectedBook, setSelectedBook] = useState<BookSelectionActionPayload | null>(null);
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [lastRegionSelection] = useState<RegionSelectionState | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlStateResult = readBookSearchResultUrlState(searchParams);

  function createPageHref(page: number) {
    const nextSearchParams = new URLSearchParams({
      page: String(page),
    });

    if (urlStateResult.kind !== 'ok') {
      return '/books';
    }

    if (urlStateResult.data.params.title) {
      nextSearchParams.set('title', urlStateResult.data.params.title);
    }

    if (urlStateResult.data.params.author) {
      nextSearchParams.set('author', urlStateResult.data.params.author);
    }

    return `/books?${nextSearchParams.toString()}`;
  }

  function handleSubmitSearch(params: BookSearchParams) {
    const nextSearchParams = new URLSearchParams({
      page: String(params.page),
    });

    if (params.title) {
      nextSearchParams.set('title', params.title);
    }

    if (params.author) {
      nextSearchParams.set('author', params.author);
    }

    navigate({
      pathname: '/books',
      search: `?${nextSearchParams.toString()}`,
    });
  }

  function handleRegionDialogOpenChange(open: boolean) {
    setIsRegionDialogOpen(open);
  }

  function handleSelectBook(payload: BookSelectionActionPayload) {
    setSelectedBook(payload);
    setIsRegionDialogOpen(true);
  }

  function handleConfirmRegion(params: LibrarySearchParams) {
    void params;
  }

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
      <SecondaryPageHeader />
      <BookSearchResult
        createPageHref={createPageHref}
        onSelectBook={handleSelectBook}
        onSubmitSearch={handleSubmitSearch}
        params={urlStateResult.data.params}
      />
      <RegionSelectDialog
        lastSelection={lastRegionSelection}
        onConfirm={handleConfirmRegion}
        onOpenChange={handleRegionDialogOpenChange}
        open={selectedBook != null && isRegionDialogOpen}
        selectedBook={selectedBook}
      />
    </div>
  );
}

export {BookSearchResultPage};
