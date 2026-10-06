import type { Rating } from '@prisma/client'
import type { LogRow } from '@/lib/study'
import { cn } from '@/lib/cn'
import { Inline } from '@/components/Inline'
import { DataRow, SectionHead } from './ui'

const GRADE_MARK: Record<Rating, string> = {
  AGAIN: 'bg-grade-again',
  HARD: 'bg-grade-hard',
  GOOD: 'bg-grade-good',
  EASY: 'bg-grade-easy',
}

/* Maps a day's 0..1 intensity onto the five filled steps of the heat ramp;
   an empty day stays at heat-0. */
function heatStep(v: number) {
  return v === 0 ? 0 : Math.min(5, 1 + Math.floor(v * 5))
}

export interface MetricsSummary {
  reviewed: number
  again: number
  accuracy: number
  elapsed: number
  stability: number
}

export function Metrics({
  summary,
  forecast,
  heat,
  log,
  streak,
  totalEntries,
}: {
  summary: MetricsSummary
  forecast: number[]
  heat: number[]
  log: LogRow[]
  streak: number
  totalEntries: number
}) {
  const peak = Math.max(1, ...forecast)
  const mm = String(Math.floor(summary.elapsed / 60)).padStart(2, '0')
  const ss = String(summary.elapsed % 60).padStart(2, '0')

  return (
    <div className="flex min-h-full flex-col gap-8">
      <section>
        <SectionHead n="04" title="Session summary" />
        <div className="pt-1">
          <DataRow k="Reviewed" v={String(summary.reviewed).padStart(3, '0')} />
          <DataRow k="Forgotten" v={String(summary.again).padStart(3, '0')} accent />
          <DataRow
            k="Accuracy"
            v={summary.reviewed ? `${Math.round(summary.accuracy * 100)}%` : '—'}
          />
          <DataRow k="Mean stability" v={summary.stability.toFixed(1)} />
          <DataRow k="Elapsed" v={`${mm}:${ss}`} />
          <DataRow
            k="Sec / card"
            v={summary.reviewed ? (summary.elapsed / summary.reviewed).toFixed(1) : '—'}
          />
        </div>
      </section>

      <section>
        <SectionHead n="05" title="Forecast" meta="14 days" />
        <div className="flex items-end gap-[3px] pt-6">
          {forecast.map((v, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1.5">
              <span className="text-ink pointer-events-none absolute -top-5 text-[12px] font-bold tabular-nums opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {v > 0 ? v : '—'}
              </span>
              <div className="flex h-[74px] w-full items-end">
                <div
                  className={cn(
                    'w-full rounded-t-[2px] transition-all duration-300',
                    i === 0 ? 'bg-accent' : 'bg-grade-easy group-hover:bg-ink'
                  )}
                  style={{ height: `${Math.max(v > 0 ? 4 : 1.5, (v / peak) * 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  'font-mono text-[10.5px] leading-none font-medium',
                  i % 7 === 0 ? 'text-ink-mute' : 'text-rule-2'
                )}
              >
                {i % 7 === 0 ? (i === 0 ? 'Today' : `+${i}`) : '·'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead n="06" title="Consistency" meta={`${streak} day streak`} />
        <div className="grid grid-flow-col grid-rows-7 gap-[2px] pt-4">
          {heat.map((v, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-[2px]"
              // Resolved from the palette rather than hex literals, so the
              // cells follow the theme.
              style={{ backgroundColor: `var(--heat-${heatStep(v)})` }}
            />
          ))}
        </div>
        <div className="text-ink-mute mt-2.5 flex items-center justify-between font-mono text-[11px]">
          <span>18 weeks</span>
          <span>Today</span>
        </div>
      </section>

      <section className="flex min-h-[168px] flex-1 flex-col">
        <SectionHead n="07" title="Review log" meta={`${totalEntries} entries`} />
        <ul className="hide-scroll min-h-0 flex-1 overflow-y-auto">
          {log.length === 0 ? (
            <li className="text-ink-mute py-4 font-serif text-[14px] italic">
              No cards graded yet.
            </li>
          ) : (
            log.slice(0, 8).map((e, i) => (
              <li
                key={`${e.id}-${e.ts}-${i}`}
                className={cn(
                  'border-rule flex items-start gap-2.5 border-b py-[11px] transition-colors duration-150',
                  i === 0 && 'anim-fade'
                )}
              >
                <span
                  className={cn('mt-[5px] size-2.5 shrink-0 rounded-[2px]', GRADE_MARK[e.grade])}
                />
                <span className="min-w-0 flex-1 truncate font-serif text-[14.5px] leading-snug font-medium">
                  <Inline text={e.front} />
                </span>
                <span className="text-ink-mute shrink-0 pt-0.5 font-mono text-[11.5px]">
                  {e.interval}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
