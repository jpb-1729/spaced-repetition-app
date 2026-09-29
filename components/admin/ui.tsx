import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Shared primitives for the admin surface. The rest of the site builds these
   inline, but admin repeats the same form and table shapes across nine routes,
   so they are factored out here to keep the idiom in one place. */

/** Primary action: the solid ink button from globals.css. */
export const btnSolid = 'btn'

/** Secondary action: the outlined button from globals.css. */
export const btnOutline = 'btn-ghost'

/** Inline destructive action inside a table row. */
export const btnDanger =
  'text-bad cursor-pointer text-[13px] font-semibold underline decoration-rule-2 underline-offset-[3px] transition-colors hover:decoration-bad disabled:cursor-default disabled:opacity-50'

/** Inline neutral action inside a table row. */
export const btnQuiet =
  'text-ink text-[13px] font-semibold underline decoration-rule-2 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent'

export const inputClass = 'field'

export function PageHead({
  eyebrow,
  title,
  meta,
  actions,
}: {
  eyebrow: string
  title: string
  meta?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="border-rule flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b pb-6">
      <div className="min-w-0">
        <span className="label text-accent">{eyebrow}</span>
        <h1 className="mt-2.5 text-[clamp(30px,3.6vw,40px)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance">
          {title}
        </h1>
      </div>
      {(meta || actions) && (
        <div className="flex items-center gap-5">
          {meta ? <span className="text-ink-mute text-[13px]">{meta}</span> : null}
          {actions}
        </div>
      )}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-ink block text-[13.5px] font-semibold">
        {label}
        {required && <span className="text-bad"> *</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="text-ink-mute mt-2 text-[12px] leading-relaxed">{hint}</p> : null}
      {error ? <p className="text-bad mt-2 text-[12.5px]">{error}</p> : null}
    </div>
  )
}

/** Checkboxes carry their own label, so they sit outside <Field>. */
export function CheckField({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string
  name: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        id={id}
        name={name}
        type="checkbox"
        value="true"
        defaultChecked={defaultChecked}
        className="accent-accent size-4 cursor-pointer"
      />
      <label htmlFor={id} className="text-ink cursor-pointer text-[13.5px] font-semibold">
        {label}
      </label>
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className="border-bad/40 bg-bad/5 text-bad rounded border px-3 py-2.5 text-[13px]">
      {children}
    </p>
  )
}

/** Published / Draft marker: a dot and a word, never Yes / No. */
export function StatusChip({ published }: { published: boolean }) {
  return (
    <span className="text-ink-soft border-rule-2 inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-[12.5px] font-medium whitespace-nowrap">
      <span
        className={cn('size-2 rounded-full', published ? 'bg-good' : 'bg-rule-2')}
        aria-hidden
      />
      {published ? 'Published' : 'Draft'}
    </span>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-ink-mute py-16 text-center font-serif text-xl italic">{children}</p>
}

/* Cells carry their own horizontal padding rather than relying on the table's
   spacing: a right-aligned figure column sits directly against the next
   left-aligned one, so without it "1" and "Draft" collide. The outermost
   columns stay flush so the table aligns with the rules above it. */
const cellX = 'px-3 first:pl-0 last:pr-0'

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'label text-ink-mute border-ink border-b-2 pt-3.5 pb-3 text-left whitespace-nowrap',
        cellX,
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('py-3.5 text-[14.5px]', cellX, className)}>{children}</td>
}

/** Right-aligned figure cell, tabular so columns of counts line up. */
export function TdNum({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        'text-ink py-3.5 text-right text-[15px] font-semibold tabular-nums',
        cellX,
        className
      )}
    >
      {children}
    </td>
  )
}
