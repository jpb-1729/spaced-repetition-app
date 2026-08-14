import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Shared Swiss primitives for the admin surface. The rest of the site builds
   these inline, but admin repeats the same form and table shapes across nine
   routes, so they are factored out here to keep the idiom in one place. */

/** Filled call-to-action. Inverts on hover, matching the study-page CTA. */
export const btnSolid =
  'label border-ink bg-ink text-paper hover:bg-transparent hover:text-ink inline-block cursor-pointer border px-4 py-2.5 transition-colors disabled:cursor-default disabled:opacity-50'

/** Outlined secondary action. Fills on hover, matching EnrollButton. */
export const btnOutline =
  'label border-ink text-ink hover:bg-ink hover:text-paper inline-block cursor-pointer border px-4 py-2.5 transition-colors disabled:cursor-default disabled:opacity-50'

/** Inline destructive action inside a table row. */
export const btnDanger =
  'label text-vermillion cursor-pointer transition-opacity hover:opacity-60 disabled:cursor-default disabled:opacity-50'

/** Inline neutral action inside a table row. */
export const btnQuiet = 'label text-ink-mute hover:text-vermillion transition-colors'

export const inputClass =
  'border-ink/25 focus:border-ink text-ink w-full border bg-transparent px-3 py-2.5 text-[14px] transition-colors'

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
    <div className="border-ink flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b pb-3">
      <div className="min-w-0">
        <span className="label text-vermillion">{eyebrow}</span>
        <h1 className="mt-2.5 font-serif text-[26px] leading-tight font-medium tracking-tight">
          {title}
        </h1>
      </div>
      {(meta || actions) && (
        <div className="flex items-center gap-5">
          {meta ? <span className="label text-ink-mute">{meta}</span> : null}
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
      <label htmlFor={htmlFor} className="label text-ink-mute block">
        {label}
        {required && <span className="text-vermillion"> *</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint ? <p className="text-ink-mute mt-2 text-[12px] leading-relaxed">{hint}</p> : null}
      {error ? <p className="text-vermillion mt-2 text-[12px]">{error}</p> : null}
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
        className="accent-vermillion size-4 cursor-pointer"
      />
      <label htmlFor={id} className="label text-ink cursor-pointer">
        {label}
      </label>
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p className="border-vermillion/40 text-vermillion border px-3 py-2.5 text-[13px]">
      {children}
    </p>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-ink-mute py-16 text-center font-serif text-xl italic">{children}</p>
}

/* Cells carry their own horizontal padding rather than relying on the table's
   spacing: a right-aligned figure column sits directly against the next
   left-aligned one, so without it "1" and "Draft" collide. The outermost
   columns stay flush so the table aligns with the rules above it. */
const cellX = 'px-4 first:pl-0 last:pr-0'

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('label text-ink-mute pb-2 text-left font-normal', cellX, className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('py-3.5 text-[14px]', cellX, className)}>{children}</td>
}

/** Right-aligned figure cell, tabular so columns of counts line up. */
export function TdNum({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        'text-ink py-3.5 text-right font-mono text-[13px] tabular-nums',
        cellX,
        className
      )}
    >
      {children}
    </td>
  )
}
