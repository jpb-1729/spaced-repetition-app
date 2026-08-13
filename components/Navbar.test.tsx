import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  signOut: vi.fn(),
}))

import Navbar from '@/components/Navbar'

describe('Navbar', () => {
  it('renders the wordmark linking home', () => {
    render(<Navbar />)

    const wordmark = screen.getByRole('link', { name: /olivero recall/i })
    expect(wordmark).toBeInTheDocument()
    expect(wordmark).toHaveAttribute('href', '/')
  })

  it('hides navigation links when user is not logged in', () => {
    render(<Navbar />)

    expect(screen.queryByText('Study')).not.toBeInTheDocument()
    expect(screen.queryByText('Decks')).not.toBeInTheDocument()
  })

  it('shows navigation links when user is logged in', () => {
    const user = { name: 'Test User', image: '/test.jpg' }
    render(<Navbar user={user} />)

    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Decks')).toBeInTheDocument()
  })

  it('renders correct navigation links with proper hrefs', () => {
    const user = { name: 'Test User', image: '/test.jpg' }
    render(<Navbar user={user} />)

    const studyLink = screen.getByRole('link', { name: /study/i })
    const decksLink = screen.getByRole('link', { name: /decks/i })

    expect(studyLink).toHaveAttribute('href', '/study')
    expect(decksLink).toHaveAttribute('href', '/decks')
  })
})
