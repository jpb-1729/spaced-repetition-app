import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Inline } from './Inline'

describe('Inline', () => {
  it('renders plain text unchanged', () => {
    render(
      <p>
        <Inline text="What is 2+2?" />
      </p>
    )
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders backticks as code', () => {
    render(
      <p>
        <Inline text="Which type is `char` in MySQL?" />
      </p>
    )
    const code = screen.getByText('char')
    expect(code.tagName).toBe('CODE')
    expect(screen.getByText('char').closest('p')).toHaveTextContent('Which type is char in MySQL?')
  })

  it('renders bold and italic', () => {
    render(
      <p>
        <Inline text="**strong** and *soft* and snake_case_name" />
      </p>
    )
    expect(screen.getByText('strong').tagName).toBe('STRONG')
    expect(screen.getByText('soft').tagName).toBe('EM')
    expect(screen.getByText('soft').closest('p')).toHaveTextContent(
      'strong and soft and snake_case_name'
    )
  })

  it('leaves unbalanced markers alone', () => {
    render(
      <p>
        <Inline text="a * b and 2 ** 3" />
      </p>
    )
    expect(screen.getByText('a * b and 2 ** 3')).toBeInTheDocument()
  })
})
