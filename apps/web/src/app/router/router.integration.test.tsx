import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProvider } from '@/app/providers'
import { routes } from './router'

function renderRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routes, { initialEntries })

  return render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  )
}

describe('app router integration', () => {
  it('renders the home route with the app shell and initial state', () => {
    renderRouter(['/'])

    expect(
      screen.getByRole('heading', {
        name: '책 제목만 입력하면 가까운 도서관을 바로 보여드릴게요',
      })
    ).toBeInTheDocument()
    expect(screen.getByText('동네 도서관 찾기')).toBeInTheDocument()
    expect(screen.getByText('초기 상태')).toBeInTheDocument()
  })

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing'])

    expect(
      screen.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: '홈으로 돌아가기' })
    ).toHaveAttribute('href', '/')
  })
})
