import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const authMock = vi.hoisted(() => ({ signIn: vi.fn(), devLoginEnabled: false }))

vi.mock('@/auth', () => authMock)

import SignIn from '@/components/SignIn'

describe('SignIn component', () => {
  it('renders the Continue with Google button', () => {
    render(<SignIn />)

    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })

  it('renders the Google icon', () => {
    const { container } = render(<SignIn />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('hides the dev login form when devLoginEnabled is false', () => {
    render(<SignIn />)

    expect(
      screen.queryByRole('button', { name: /sign in without password/i })
    ).not.toBeInTheDocument()
  })

  it('shows the dev login form when devLoginEnabled is true', () => {
    authMock.devLoginEnabled = true
    render(<SignIn />)

    expect(screen.getByRole('button', { name: /sign in without password/i })).toBeInTheDocument()
    authMock.devLoginEnabled = false
  })
})
