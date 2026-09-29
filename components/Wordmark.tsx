import { cn } from '@/lib/cn'

/* The ink tile carries a forgetting curve decaying onto its axes, ending in
   the accent dot: the next review. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" aria-hidden className="size-[30px] shrink-0">
        <rect x="1" y="1" width="30" height="30" rx="3" className="fill-ink" />
        <path
          d="M6 26 H26 M6 6 V26"
          className="stroke-paper"
          fill="none"
          strokeOpacity={0.35}
          strokeWidth={1.2}
        />
        <path
          d="M6 7 C 8 18, 13 22, 26 24"
          className="stroke-accent"
          fill="none"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        <circle cx="26" cy="24" r="2.4" className="fill-accent stroke-ink" strokeWidth={1.5} />
      </svg>
      <span className="text-[21px] leading-none font-extrabold tracking-[-0.035em]">
        Olivero Recall
      </span>
    </span>
  )
}
