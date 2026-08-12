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
        'border-ink flex items-baseline justify-between gap-4 border-b pb-1.5',
        className
      )}
    >
      <div className="flex items-baseline gap-2">
        <span className="label text-vermillion">§{n}</span>
        <span className="label text-ink">{title}</span>
      </div>
      {meta ? <span className="label text-ink-mute">{meta}</span> : null}
    </div>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="label inline-flex h-[18px] min-w-[18px] items-center justify-center border border-current px-1 pt-px opacity-70">
      {children}
    </span>
  )
}

export function DataRow({ k, v, accent }: { k: string; v: ReactNode; accent?: boolean }) {
  return (
    <div className="border-ink/12 flex items-baseline justify-between gap-3 border-b py-[7px]">
      <span className="label text-ink-mute">{k}</span>
      <span
        className={cn(
          'font-mono text-[12px] tabular-nums',
          accent ? 'text-vermillion' : 'text-ink'
        )}
      >
        {v}
      </span>
    </div>
  )
}
