import type { Rating } from '@prisma/client'
import type { LogRow } from '@/lib/study'
import { cn } from '@/lib/cn'
import { DataRow, SectionHead } from './ui'

const GRADE_MARK: Record<Rating, string> = {
  AGAIN: 'bg-vermillion',
  HARD: 'bg-ink/40',
  GOOD: 'bg-ink',
  EASY: 'bg-cobalt',
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
        <div className="flex items-end gap-[3px] pt-5">
          {forecast.map((v, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1.5">
              <span className="label text-ink pointer-events-none absolute -top-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                {v > 0 ? v : '—'}
              </span>
              <div className="flex h-[74px] w-full items-end">
                <div
                  className={cn(
                    'w-full transition-all duration-300',
                    i === 0 ? 'bg-vermillion' : 'bg-ink/75 group-hover:bg-ink'
                  )}
                  style={{ height: `${Math.max(v > 0 ? 4 : 1.5, (v / peak) * 100)}%` }}
                />
              </div>
              <span
                className={cn(
                  'font-mono text-[8px] leading-none',
                  i % 7 === 0 ? 'text-ink' : 'text-ink-mute/50'
                )}
              >
                {i % 7 === 0 ? (i === 0 ? 'TDY' : `+${i}`) : '·'}
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
              className="aspect-square w-full"
              style={{
                // Resolved from the palette rather than hex literals, so the
                // cells follow the theme. color-mix supplies the per-cell alpha
                // that a bare var() cannot.
                backgroundColor:
                  v === 0
                    ? 'var(--heat-empty)'
                    : `color-mix(in srgb, var(--vermillion) ${Math.round((0.2 + v * 0.8) * 100)}%, transparent)`,
              }}
            />
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="label text-ink-mute">18 weeks</span>
          <span className="label text-ink-mute">today</span>
        </div>
      </section>

      <section className="flex min-h-[168px] flex-1 flex-col">
        <SectionHead n="07" title="Review log" meta={`${totalEntries} entries`} />
        <ul className="hide-scroll min-h-0 flex-1 overflow-y-auto">
          {log.length === 0 ? (
            <li className="label text-ink-mute py-4">No cards graded yet.</li>
          ) : (
            log.slice(0, 8).map((e, i) => (
              <li
                key={`${e.id}-${e.ts}-${i}`}
                className={cn(
                  'border-ink/12 hover:bg-paper-2/60 flex items-start gap-2.5 border-b py-2.5 transition-colors duration-150',
                  i === 0 && 'anim-fade'
                )}
              >
                <span className={cn('mt-[6px] h-[6px] w-[6px] shrink-0', GRADE_MARK[e.grade])} />
                <span className="min-w-0 flex-1 truncate font-serif text-[13.5px] leading-snug">
                  {e.front}
                </span>
                <span className="label text-ink-mute shrink-0 pt-0.5">{e.interval}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
