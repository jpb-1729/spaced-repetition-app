import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function SectionHead({
  n,
  title,
  meta,
  className,
}: {
  n: string
  title: string
  meta?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-ink flex items-baseline justify-between gap-4 border-b-2 pb-2.5',
        className
      )}
    >
      <div className="flex items-baseline gap-2.5">
        <span className="label text-accent">§{n}</span>
        <h2 className="text-[17px] leading-tight font-extrabold tracking-[-0.01em]">{title}</h2>
      </div>
      {meta ? <span className="text-ink-mute text-[13px]">{meta}</span> : null}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="border-rule-2 text-ink-soft bg-paper inline-flex items-center justify-center rounded-[3px] border border-b-2 px-[5px] pt-[3px] pb-[2px] font-mono text-[11px] leading-none font-medium whitespace-nowrap">
      {children}
    </kbd>
  )
}

export function DataRow({ k, v, accent }: { k: string; v: ReactNode; accent?: boolean }) {
  return (
    <div className="border-rule flex items-baseline justify-between gap-3 border-b py-[9px] text-[14px]">
      <span className="text-ink-mute">{k}</span>
      <span className={cn('font-medium tabular-nums', accent ? 'text-accent' : 'text-ink')}>
        {v}
      </span>
    </div>
  )
}
