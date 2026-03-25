import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Scores {
  market_need: number
  technical_feasibility: number
  competitive_advantage: number
  revenue_potential: number
  strategic_alignment: number
}

interface Idea {
  name: string
  one_liner: string
  problem: string
  ai_technique: string
  how_it_works: string
  target_companies: string[]
  buyer_persona: string
  tier: string
  confidence: string
  _cellDomain: string
  _cellSubCategory: string
  _cellHeat: number
  _cellOppScore: number
  scores: Scores
  weighted_score: number
  scoring_rationale: string
  also_known_as: string[]
  duplicate_count: number
}

interface Data {
  generated: string
  original_count: number
  deduped_count: number
  tier_breakdown: Record<string, number>
  ideas: Idea[]
}

const TIER_COLORS: Record<string, { color: string; bg: string }> = {
  tier1: { color: 'var(--green)', bg: 'rgba(52,211,153,0.12)' },
  tier2: { color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)' },
  tier3: { color: 'var(--text-muted)', bg: 'var(--surface3)' },
}

export default function ProductIdeas() {
  const [data, setData] = useState<Data | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<string | null>(null)
  const [domainFilter, setDomainFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/product-ideas-scored.json')
      .then(r => r.json())
      .then(setData)
  }, [])

  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>

  const domains = [...new Set(data.ideas.map(i => i._cellDomain))].sort()
  let ideas = data.ideas
  if (tierFilter) ideas = ideas.filter(i => i.tier === tierFilter)
  if (domainFilter) ideas = ideas.filter(i => i._cellDomain === domainFilter)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Product Ideas</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Product Ideas</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, maxWidth: 680 }}>
        {data.deduped_count} AI product ideas scored across 5 dimensions. Originally {data.original_count} ideas, deduplicated and ranked.
      </p>

      {/* Tier summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {Object.entries(data.tier_breakdown).map(([tier, count]) => {
          const tc = TIER_COLORS[tier] || TIER_COLORS.tier3
          return (
            <button
              key={tier}
              onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tierFilter === tier ? tc.bg : 'var(--surface)',
                color: tierFilter === tier ? tc.color : 'var(--text-muted)',
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, color: tc.color }}>{count}</div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>{tier}</div>
            </button>
          )
        })}
        <select
          value={domainFilter || ''}
          onChange={e => setDomainFilter(e.target.value || null)}
          style={{
            padding: '6px 10px', fontSize: 12, borderRadius: 6, alignSelf: 'center',
            background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
          }}
        >
          <option value="">All domains</option>
          {domains.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Ideas list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {ideas.map((idea, i) => {
          const tc = TIER_COLORS[idea.tier] || TIER_COLORS.tier3
          const isExpanded = expanded === idea.name
          return (
            <div key={i}>
              <div
                onClick={() => setExpanded(isExpanded ? null : idea.name)}
                style={{
                  display: 'grid', gridTemplateColumns: '50px 1fr 100px 60px',
                  gap: 12, alignItems: 'center', padding: '10px 12px', cursor: 'pointer',
                  background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 6,
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px 6px',
                  borderRadius: 4, color: tc.color, background: tc.bg, textTransform: 'uppercase',
                }}>
                  {idea.tier}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{idea.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{idea.one_liner}</div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{idea._cellDomain}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: tc.color, textAlign: 'right' }}>
                  {idea.weighted_score.toFixed(1)}
                </span>
              </div>

              {isExpanded && (
                <div style={{
                  padding: 16, background: 'var(--surface2)', borderRadius: 8, margin: '2px 0 6px',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Problem</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{idea.problem}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>How It Works</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{idea.how_it_works}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>AI Technique: </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{idea.ai_technique}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Buyer: </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{idea.buyer_persona}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Confidence: </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{idea.confidence}</span>
                    </div>
                  </div>

                  {/* Scores */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {Object.entries(idea.scores).map(([k, v]) => (
                      <div key={k} style={{
                        padding: '6px 10px', background: 'var(--surface)', borderRadius: 6, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: v >= 4 ? 'var(--green)' : v >= 3 ? 'var(--amber)' : 'var(--text-muted)' }}>{v}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Target companies */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {idea.target_companies.map((c, j) => (
                      <span key={j} style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: 'var(--accent-dim)', color: 'var(--accent)',
                      }}>{c}</span>
                    ))}
                  </div>

                  {idea.scoring_rationale && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      {idea.scoring_rationale}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
