import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const authFlags = vi.hoisted(() => ({ devLoginEnabled: false }))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  get devLoginEnabled() {
    return authFlags.devLoginEnabled
  },
}))

import { auth } from '@/auth'

const mockedAuth = vi.mocked(auth)

describe('Home page', () => {
  it('shows login and signup buttons when not logged in', async () => {
    mockedAuth.mockResolvedValue(null as any)

    const { default: Home } = await import('@/app/(site)/page')
    render(await Home())

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('hides login and signup buttons when logged in', async () => {
    mockedAuth.mockResolvedValue({
      user: { name: 'Test User', email: 'test@example.com' },
      expires: '2099-01-01',
    } as any)

    const { default: Home } = await import('@/app/(site)/page')
    render(await Home())

    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument()
  })

  it('renders the welcome heading and description', async () => {
    mockedAuth.mockResolvedValue(null as any)

    const { default: Home } = await import('@/app/(site)/page')
    render(await Home())

    expect(screen.getByText('Olivero Recall')).toBeInTheDocument()
    expect(screen.getByText(/learn smarter, not harder/i)).toBeInTheDocument()
  })

  it('sends both buttons to /sign-in when the dev login is enabled', async () => {
    authFlags.devLoginEnabled = true
    mockedAuth.mockResolvedValue(null as any)

    const { default: Home } = await import('@/app/(site)/page')
    render(await Home())

    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/sign-in')
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/sign-in')
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument()

    authFlags.devLoginEnabled = false
  })
})
