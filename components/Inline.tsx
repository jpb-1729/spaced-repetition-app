import { Fragment } from 'react'

// Inline markdown for card text: `code`, **bold**, and *italic*.
// Emphasis markers must hug non-space text, so `a * b` stays literal.
// Underscore italics are unsupported because snake_case identifiers are common.
// Block syntax is deliberately unsupported; cards are short strings.
const TOKEN = /(`[^`\n]+`|\*\*\S(?:[^*\n]*\S)?\*\*|\*\S(?:[^*\n]*\S)?\*)/g

export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN)
  if (parts.length === 1) return <>{text}</>

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
        if (part.startsWith('`')) {
          return (
            <code
              key={i}
              className="bg-paper-2 rounded-[3px] px-[0.35em] py-[0.1em] font-mono text-[0.85em] font-medium"
            >
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
        return <em key={i}>{part.slice(1, -1)}</em>
      })}
    </>
  )
}
