import { useState } from 'react'
import type { PainPoint, AreaSummary } from '../lib/types'
import { scoreColor, scoreBand, salienceLabel, buildLabel, adoptionLabel, quadrant } from '../lib/types'

interface Props {
  painPoints: PainPoint[]
  areas: AreaSummary[]
  areaFilter: string | null
  onAreaFilter: (area: string | null) => void
}

type SortKey = 'salience' | 'score' | 'matches'

export default function PainPointList({ painPoints, areas, areaFilter, onAreaFilter }: Props) {
  const [sort, setSort] = useState<SortKey>('score')
  const [minSalience, setMinSalience] = useState(4)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  let filtered = painPoints.filter(pp => pp.maxSalience >= minSalience)
  if (areaFilter) filtered = filtered.filter(pp => pp.area === areaFilter)

  if (sort === 'salience') filtered.sort((a, b) => b.maxSalience - a.maxSalience || b.topScore - a.topScore)
  else if (sort === 'score') filtered.sort((a, b) => b.topScore - a.topScore || b.maxSalience - a.maxSalience)
  else filtered.sort((a, b) => b.matchCount - a.matchCount || b.topScore - a.topScore)

  const shown = filtered.slice(0, 80)

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          All Pain Points
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            {shown.length} of {filtered.length}
            {areaFilter && (
              <> in <span style={{ color: 'var(--accent)' }}>{areas.find(a => a.id === areaFilter)?.label}</span>
                <button onClick={() => onAreaFilter(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>clear</button>
              </>
            )}
          </span>
        </h2>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort</span>
          {(['score', 'salience', 'matches'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: sort === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: sort === s ? 'var(--accent)' : 'none',
                color: sort === s ? '#fff' : 'var(--text-muted)',
              }}
            >
              {s === 'score' ? 'Score' : s === 'salience' ? 'Salience' : 'Matches'}
            </button>
          ))}
          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: 8 }}>Min</span>
          {[0, 3, 4, 5].map(v => (
            <button
              key={v}
              onClick={() => setMinSalience(v)}
              style={{
                padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                border: minSalience === v ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: minSalience === v ? 'var(--accent)' : 'none',
                color: minSalience === v ? '#fff' : 'var(--text-muted)',
              }}
            >
              {v === 0 ? 'All' : `${v}+`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {shown.map(pp => {
        const isOpen = expanded.has(pp.id)
        const area = areas.find(a => a.id === pp.area)
        const q = quadrant(pp.maxSalience, pp.topScore)

        return (
          <div
            key={pp.id}
            className={`pp-item ${isOpen ? 'expanded' : ''}`}
            onClick={() => toggle(pp.id)}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{pp.label}</div>
                <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 1 }}>
                  {area?.label || pp.area}
                  <span style={{ marginLeft: 8, color: q === 'Act Now' ? 'var(--green)' : q === 'Strategic Bet' ? 'var(--amber)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {q}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 11 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: pp.maxSalience >= 4 ? 'var(--red)' : pp.maxSalience >= 3 ? 'var(--amber)' : 'var(--text-muted)', display: 'block' }}>{pp.maxSalience}</span>
                Pain
              </div>
              <div style={{ textAlign: 'center', fontSize: 11 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: scoreColor(pp.topScore), display: 'block' }}>{pp.topScore}</span>
                Score
              </div>
              <div style={{ textAlign: 'center', fontSize: 11 }}>
                <span style={{ fontSize: 15, fontWeight: 700, display: 'block' }}>{pp.matchCount}</span>
                Caps
              </div>
            </div>

            {isOpen && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                {/* Description */}
                {pp.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
                    {pp.description}
                  </div>
                )}
                {/* Market score detail */}
                {pp.market && (
                  <div style={{ marginBottom: pp.matches.length ? 12 : 0, fontSize: 12 }}>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div><span style={{ color: 'var(--red)', fontWeight: 600 }}>{pp.market.pain}/5</span> <span style={{ color: 'var(--text-muted)' }}>{salienceLabel(pp.market.pain)} pain</span></div>
                      <div><span style={{ color: 'var(--amber)', fontWeight: 600 }}>{pp.market.adoption}/5</span> <span style={{ color: 'var(--text-muted)' }}>{adoptionLabel(pp.market.adoption)} market</span></div>
                      <div><span style={{ color: 'var(--green)', fontWeight: 600 }}>{pp.market.build}/5</span> <span style={{ color: 'var(--text-muted)' }}>{buildLabel(pp.market.build)} build</span></div>
                    </div>
                    {pp.market.flags && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                        {[
                          ...((pp.market.flags as any).pain_salience || []),
                          ...((pp.market.flags as any).adoption_likelihood || []),
                          ...((pp.market.flags as any).build_complexity_inv || []),
                        ].map((flag: string, i: number) => (
                          <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 3, background: 'var(--surface3)', color: 'var(--text-muted)' }}>
                            {flag.length > 50 ? flag.substring(0, 48) + '...' : flag}
                          </span>
                        ))}
                      </div>
                    )}
                    {pp.rationale && (
                      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 12 }}>
                        {pp.rationale}
                      </div>
                    )}
                  </div>
                )}
                {/* AI capability matches */}
                {pp.matches.length > 0 && (
                  <div style={{ borderTop: pp.market ? '1px solid var(--border-subtle)' : 'none', paddingTop: pp.market ? 10 : 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>AI Capability Matches</div>
                    {pp.matches.slice(0, 5).map((m, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 50px 1fr', gap: 10, padding: '8px 0', borderBottom: i < Math.min(pp.matches.length, 5) - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: 12, alignItems: 'baseline' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{m.capLabel}</div>
                        <div>
                          <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: scoreColor(m.score) + '22', color: scoreColor(m.score) }}>
                            {m.score}
                          </span>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.sketch || m.rationale}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                            {salienceLabel(m.pain)} pain · {adoptionLabel(m.adoption)} · {buildLabel(m.build)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
