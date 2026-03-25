import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Problem {
  label: string
  score: number
  rubric_level: string
  reasoning: string
}

interface SubCategory {
  label: string
  sub_avg: number
  problems: Record<string, Problem>
}

interface Domain {
  domain_label: string
  domain_avg: number
  sub_categories: Record<string, SubCategory>
}

interface CompanyHeatmap {
  company_id: string
  company_name: string
  scored_at: string
  domains: Record<string, Domain>
}

const COMPANIES = [
  'acasus', 'cspd', 'ipeople', 'kinetic',
  'phinma', 'rising', 'school-for-life', 'wise',
]

interface OrgProfile {
  id: string
  name: string
  description: string
  archetype: string
  hq: string
  headcount: string
  revenue: string
  website: string
}

const ORG_PROFILES: OrgProfile[] = [
  {
    id: 'acasus', name: 'Acasus',
    description: 'International development consulting firm specializing in large-scale public sector reform in health and education in LMICs',
    archetype: 'Advisory', hq: 'Baar, Switzerland',
    headcount: '201–1,000', revenue: '$10M–$100M',
    website: 'acasus.com',
  },
  {
    id: 'cspd', name: 'Catholic Schools Parramatta Diocese',
    description: 'Catholic diocesan K-12 system operating 80 schools and 6 early learning centres in Western Sydney serving ~43,000 students',
    archetype: 'Operator', hq: 'Parramatta, Australia',
    headcount: '1,000+', revenue: '$100M+',
    website: 'parra.catholic.edu.au',
  },
  {
    id: 'ipeople', name: 'iPeople Inc',
    description: 'Philippine education holding company operating STEM-focused higher education, blended learning, and K-12 across 7+ institutions serving ~74,000 students',
    archetype: 'Operator', hq: 'Manila, Philippines',
    headcount: '1,001–2,500', revenue: '$100M+',
    website: 'ipeople.com.ph',
  },
  {
    id: 'kinetic', name: 'Kinetic Software',
    description: 'UK vertical SaaS for higher education operations — student accommodation, conferencing, catering, and engagement across 350+ institutions',
    archetype: 'SaaS Vendor', hq: 'Milton Keynes, UK',
    headcount: '51–100', revenue: '$10M–$100M',
    website: 'kineticsoftware.com',
  },
  {
    id: 'phinma', name: 'PHINMA Education',
    description: 'Largest private higher education network in Southeast Asia — 13 institutions, 177,000+ students, acquisition-and-turnaround model targeting underserved markets',
    archetype: 'Operator', hq: 'Makati, Philippines',
    headcount: '3,500–5,000', revenue: '$100M+',
    website: 'phinma.edu.ph',
  },
  {
    id: 'rising', name: 'Rising Academies',
    description: 'Mission-driven B-Corp operating 900+ affordable schools and government partnerships in Sub-Saharan Africa with WhatsApp-native AI tutoring (Rori, Tari)',
    archetype: 'Operator', hq: 'Sierra Leone',
    headcount: '501–1,000', revenue: '$1M–$10M',
    website: 'risingacademies.com',
  },
  {
    id: 'school-for-life', name: 'School for Life Foundation',
    description: 'Australian-registered education charity operating 10 schools in rural Uganda serving 4,500+ students, funded through Australian philanthropy',
    archetype: 'Operator', hq: 'Sydney / Uganda',
    headcount: '201–500', revenue: '$2M–$5M',
    website: 'schoolforlife.org.au',
  },
  {
    id: 'wise', name: 'WISE',
    description: 'Global education innovation platform housed in Qatar Foundation — biennial summits, $1M education prize, and research on education innovation and policy',
    archetype: 'Advisory', hq: 'Doha, Qatar',
    headcount: '11–50', revenue: 'Grant-funded',
    website: 'wise-qatar.org',
  },
]

const ARCHETYPE_COLORS: Record<string, string> = {
  Operator: 'var(--green)',
  'SaaS Vendor': 'var(--accent)',
  Advisory: 'var(--amber)',
}

function scoreColor(s: number): string {
  if (s >= 0.7) return 'var(--red)'
  if (s >= 0.5) return 'var(--amber)'
  if (s >= 0.3) return 'var(--text-muted)'
  return 'var(--border)'
}

function scoreBg(s: number): string {
  if (s >= 0.7) return 'var(--red-dim)'
  if (s >= 0.5) return 'var(--amber-dim)'
  return 'transparent'
}

function scoreBar(s: number) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 48, height: 6, borderRadius: 3,
        background: 'var(--surface3)',
      }}>
        <div style={{
          width: `${s * 100}%`, height: '100%', borderRadius: 3,
          background: scoreColor(s),
        }} />
      </div>
      <span style={{ fontSize: 12, color: scoreColor(s), fontWeight: 600, minWidth: 28 }}>
        {(s * 100).toFixed(0)}
      </span>
    </div>
  )
}

type ViewMode = 'heatmap' | 'top'

export default function PainPoints() {
  const [data, setData] = useState<Record<string, CompanyHeatmap>>({})
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap')
  const [domainFilter, setDomainFilter] = useState<string | null>(null)

  useEffect(() => {
    Promise.all(
      COMPANIES.map(id =>
        fetch(`/data/companies/${id}.json`)
          .then(r => r.json())
          .then(d => [id, d] as [string, CompanyHeatmap])
      )
    ).then(entries => {
      setData(Object.fromEntries(entries))
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading pain point data...</div>

  const companies = Object.values(data)
  const allDomains = companies.length > 0
    ? Object.entries(companies[0].domains).map(([id, d]) => ({ id, label: d.domain_label }))
    : []

  // Aggregate top pain points across all orgs
  const topPains: { company: string; domain: string; sub: string; problem: Problem; problemId: string }[] = []
  for (const co of companies) {
    for (const [domId, dom] of Object.entries(co.domains)) {
      if (domainFilter && domId !== domainFilter) continue
      for (const [, sub] of Object.entries(dom.sub_categories)) {
        for (const [pId, p] of Object.entries(sub.problems)) {
          if (p.score >= 0.5) {
            topPains.push({ company: co.company_name, domain: dom.domain_label, sub: sub.label, problem: p, problemId: pId })
          }
        }
      }
    }
  }
  topPains.sort((a, b) => b.problem.score - a.problem.score)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Pain Points by Organization</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Pain Points by Organization</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 680 }}>
        141 pain points scored per organization across {allDomains.length} domains.
        Scores represent likelihood that the organization experiences this pain (0–100).
      </p>

      {/* Organization Profiles */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Organizations</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          8 organizations profiled across 3 archetypes: 5 operators, 1 SaaS vendor, 2 advisory.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12,
        }}>
          {ORG_PROFILES.map(org => (
            <Link key={org.id} to={`/organizations/${org.id}`} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '16px 18px',
              textDecoration: 'none', color: 'inherit',
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{org.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                  padding: '2px 8px', borderRadius: 4,
                  color: ARCHETYPE_COLORS[org.archetype] || 'var(--text-muted)',
                  background: 'var(--surface3)',
                }}>
                  {org.archetype}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                {org.description}
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '4px 16px', fontSize: 11, color: 'var(--text-muted)',
              }}>
                <div><span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>HQ:</span> {org.hq}</div>
                <div><span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Headcount:</span> {org.headcount}</div>
                <div><span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Revenue:</span> {org.revenue}</div>
                <div><span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Web:</span> {org.website}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 6, padding: 2 }}>
          {(['heatmap', 'top'] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                borderRadius: 4, color: viewMode === m ? 'var(--text)' : 'var(--text-muted)',
                background: viewMode === m ? 'var(--surface3)' : 'transparent',
              }}
            >
              {m === 'heatmap' ? 'Heatmap' : 'Top Pain Points'}
            </button>
          ))}
        </div>

        <select
          value={domainFilter || ''}
          onChange={e => setDomainFilter(e.target.value || null)}
          style={{
            padding: '6px 10px', fontSize: 12, borderRadius: 6,
            background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
          }}
        >
          <option value="">All domains</option>
          {allDomains.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </div>

      {viewMode === 'top' && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            {topPains.length} pain points scoring 50+{domainFilter ? ' (filtered)' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {topPains.slice(0, 80).map((tp, i) => (
              <div
                key={`${tp.company}-${tp.problemId}-${i}`}
                style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 60px',
                  gap: 12, alignItems: 'center', padding: '8px 12px',
                  background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                  borderRadius: 4, cursor: 'pointer',
                }}
                onClick={() => setExpanded(expanded === `${tp.company}-${tp.problemId}` ? null : `${tp.company}-${tp.problemId}`)}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{tp.company}</span>
                <div>
                  <span style={{ fontSize: 12 }}>{tp.problem.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{tp.domain}</span>
                </div>
                {scoreBar(tp.problem.score)}
              </div>
            ))}
          </div>
          {expanded && (() => {
            const tp = topPains.find(t => `${t.company}-${t.problemId}` === expanded)
            if (!tp) return null
            return (
              <div style={{
                marginTop: 8, padding: 16, background: 'var(--surface2)',
                borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {tp.company} — {tp.problem.label}
                </div>
                <div style={{ marginBottom: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                  {tp.domain} &gt; {tp.sub} &middot; Level: {tp.problem.rubric_level}
                </div>
                {tp.problem.reasoning}
              </div>
            )
          })()}
        </div>
      )}

      {viewMode === 'heatmap' && (
        <div style={{ overflowX: 'auto' }}>
          {(domainFilter ? allDomains.filter(d => d.id === domainFilter) : allDomains).map(domain => {
            const firstCo = companies[0]
            const dom = firstCo.domains[domain.id]
            if (!dom) return null

            return (
              <div key={domain.id} style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
                  {domain.label}
                </h3>

                {Object.entries(dom.sub_categories).map(([subId, sub]) => {
                  const problems = Object.keys(sub.problems)

                  return (
                    <div key={subId} style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        {sub.label}
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 11, width: 200 }}>
                              Pain Point
                            </th>
                            {companies.map(co => (
                              <th key={co.company_id} style={{
                                textAlign: 'center', padding: '4px 6px', color: 'var(--text-muted)',
                                fontWeight: 500, fontSize: 10, width: 80,
                              }}>
                                {co.company_name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {problems.map(pId => (
                            <tr
                              key={pId}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setExpanded(expanded === pId ? null : pId)}
                            >
                              <td style={{
                                padding: '5px 8px', color: 'var(--text-secondary)', fontSize: 12,
                                borderBottom: '1px solid var(--border-subtle)',
                              }}>
                                {sub.problems[pId].label}
                              </td>
                              {companies.map(co => {
                                const p = co.domains[domain.id]?.sub_categories[subId]?.problems[pId]
                                const s = p?.score ?? 0
                                return (
                                  <td key={co.company_id} style={{
                                    textAlign: 'center', padding: '5px 4px',
                                    borderBottom: '1px solid var(--border-subtle)',
                                  }}>
                                    <span style={{
                                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                                      fontSize: 11, fontWeight: 600,
                                      color: scoreColor(s), background: scoreBg(s),
                                    }}>
                                      {(s * 100).toFixed(0)}
                                    </span>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Expanded reasoning for selected row */}
                      {expanded && problems.includes(expanded) && (
                        <div style={{
                          margin: '4px 0 8px', padding: 12, background: 'var(--surface)',
                          borderRadius: 6, border: '1px solid var(--border-subtle)',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                            {sub.problems[expanded]?.label}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                            {companies.map(co => {
                              const p = co.domains[domain.id]?.sub_categories[subId]?.problems[expanded]
                              if (!p) return null
                              return (
                                <div key={co.company_id} style={{
                                  padding: 10, background: 'var(--surface2)', borderRadius: 6,
                                  fontSize: 11, lineHeight: 1.6, color: 'var(--text-secondary)',
                                }}>
                                  <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{co.company_name}</span>
                                    <span style={{ color: scoreColor(p.score) }}>{(p.score * 100).toFixed(0)}</span>
                                  </div>
                                  {p.reasoning}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
