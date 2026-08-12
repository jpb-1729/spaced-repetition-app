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
  retention,
  summary,
  forecast,
  heat,
  log,
  streak,
  totalEntries,
}: {
  retention: number
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
        <SectionHead n="04" title="Retention" meta="estimated" />
        <div className="flex items-end justify-between gap-4 pt-4 pb-3">
          <div className="font-serif text-[62px] leading-[0.78] font-light tracking-[-0.04em] tabular-nums">
            {Math.round(retention * 100)}
            <span className="text-vermillion text-[26px]">%</span>
          </div>
          <p className="label text-ink-mute max-w-[9rem] pb-1 text-right leading-[1.6]">
            Mean recall probability across all cards
          </p>
        </div>
        <Curve retention={retention} />
      </section>

      <section>
        <SectionHead n="05" title="Session summary" />
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
        <SectionHead n="06" title="Forecast" meta="14 days" />
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
        <SectionHead n="07" title="Consistency" meta={`${streak} day streak`} />
        <div className="grid grid-flow-col grid-rows-7 gap-[2px] pt-4">
          {heat.map((v, i) => (
            <div
              key={i}
              className="aspect-square w-full"
              style={{
                backgroundColor:
                  v === 0 ? 'rgba(22,21,15,0.07)' : `rgba(193,64,42,${0.2 + v * 0.8})`,
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
        <SectionHead n="08" title="Review log" meta={`${totalEntries} entries`} />
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

function Curve({ retention }: { retention: number }) {
  const decay = 1.1 + retention * 2.4
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = i / 40
    const y = Math.exp(-x * (3.4 - decay * 0.6))
    return `${(x * 200).toFixed(2)},${(46 - y * 42).toFixed(2)}`
  })
  return (
    <svg viewBox="0 0 200 48" className="mt-1 w-full" preserveAspectRatio="none" height="48">
      <line x1="0" y1="47" x2="200" y2="47" stroke="rgba(22,21,15,0.25)" strokeWidth="0.5" />
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={t * 200}
          y1="0"
          x2={t * 200}
          y2="47"
          stroke="rgba(22,21,15,0.12)"
          strokeWidth="0.5"
          strokeDasharray="1.5 2"
        />
      ))}
      <polyline points={pts.join(' ')} fill="none" stroke="#c1402a" strokeWidth="1.1" />
    </svg>
  )
}
