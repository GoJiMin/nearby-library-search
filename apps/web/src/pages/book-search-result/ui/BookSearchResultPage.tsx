import {Link, Navigate, useNavigate, useSearchParams} from 'react-router-dom';
import {SecondaryPageHeader} from '@/app/layouts';
import type {BookSearchParams} from '@/entities/book';
import {BookSearchResult, readBookSearchResultUrlState} from '@/features/book';
import {LibrarySearchResultDialog} from '@/features/library';
import {RegionSelectDialog} from '@/features/region';
import {Button, Card, Heading, Text} from '@/shared/ui';
import {useBookSearchResultPage} from '../model/useBookSearchResultPage';

type BookSearchResultPageContentProps = {
  params: BookSearchParams;
};

function BookSearchResultPageContent({params}: BookSearchResultPageContentProps) {
  const navigate = useNavigate();
  const {
    currentLibrarySearchParams,
    createPageHref,
    handleConfirmRegion,
    handleLibraryResultDialogOpenChange,
    handleRegionDialogOpenChange,
    handleSelectBook,
    handleSubmitSearch,
    isLibraryResultDialogOpen,
    isRegionDialogOpen,
    lastRegionSelection,
    libraryResultBook,
    selectedBook,
    selectedLibraryCode,
  } = useBookSearchResultPage({
    navigate,
    params,
  });

  return (
    <>
      <SecondaryPageHeader />
      <BookSearchResult
        createPageHref={createPageHref}
        onSelectBook={handleSelectBook}
        onSubmitSearch={handleSubmitSearch}
        params={params}
      />
      <RegionSelectDialog
        lastSelection={lastRegionSelection}
        onConfirm={handleConfirmRegion}
        onOpenChange={handleRegionDialogOpenChange}
        open={isRegionDialogOpen}
        selectedBook={selectedBook}
      />
      <LibrarySearchResultDialog
        onBackToRegionSelect={() => {}}
        onChangePage={() => {}}
        onCheckAvailability={() => {}}
        onOpenChange={handleLibraryResultDialogOpenChange}
        onSelectLibrary={() => {}}
        open={isLibraryResultDialogOpen}
        params={currentLibrarySearchParams}
        selectedBook={libraryResultBook}
        selectedLibraryCode={selectedLibraryCode}
      />
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
