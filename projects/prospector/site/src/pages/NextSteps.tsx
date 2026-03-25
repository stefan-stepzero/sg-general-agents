import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Risk {
  id: string
  label: string
  score: number
  level: string
  reasoning: string
  domain: string
  sub: string
}

interface ProfileField {
  value: string
  evidence: string
}

interface CompanyNextSteps {
  name: string
  summary: string
  economic: {
    industry: string
    financial: string
    market_position: ProfileField
    growth_phase: ProfileField
    macro_sensitivity: ProfileField
    revenue_model: ProfileField
    key_dependencies: ProfileField
  }
  internal_risks: Risk[]
  external_risks: Risk[]
  regulatory: ProfileField
  geo_scope: ProfileField
  tech_maturity: string
  news_items: { headline: string; date: string; summary: string }[]
}

type AllData = Record<string, CompanyNextSteps>

interface Indicator {
  category: string
  indicator: string
  value: string
  signal: 'positive' | 'negative' | 'neutral' | 'watch'
  detail: string
}

interface CompanyIndicators {
  name: string
  external_indicators: Indicator[]
  internal_indicators: Indicator[]
}

type AllIndicators = Record<string, CompanyIndicators>

interface CompetitorEntry {
  name: string
  positioning: string
  differentiation: string
  relationship: string
}

interface AdvDisadv {
  label: string
  detail: string
}

interface Metric {
  label: string
  value: string
  context: string
}

interface CompanyLandscape {
  name: string
  market: string
  market_size: string
  position: string
  position_detail: string
  advantages: AdvDisadv[]
  disadvantages: AdvDisadv[]
  competitors: CompetitorEntry[]
  metrics: Metric[]
}

type AllLandscape = Record<string, CompanyLandscape>

interface LookalikePainPoint {
  pain: string
  prevalence: string
  detail: string
}

interface LookalikeEntry {
  name: string
  hq: string
  detail: string
}

interface CompanyLookalikes {
  name: string
  sub_archetype: string
  sub_archetype_detail: string
  defining_traits: string[]
  lookalikes: LookalikeEntry[]
  common_pain_points: LookalikePainPoint[]
}

type AllLookalikes = Record<string, CompanyLookalikes>

// AI Opportunities data
interface TopCapability {
  capId: string
  label: string
  catLabel: string
  fit: number
  specificity: string
  reasoning: string
}

interface TopOpportunity {
  subId: string
  label: string
  domId: string
  domLabel: string
  problemHeat: number
  hotCompanies: number
  salience: number
  bestCapFit: number
  opportunityScore: number
  topCapabilities: TopCapability[]
}

interface ProductCluster {
  capId: string
  capLabel: string
  catLabel: string
  specificity: string
  problemAreas: { subLabel: string; domLabel: string; heat: number; score: number }[]
}

interface CompanyBrief {
  name: string
  hotSubCategories: {
    subId: string
    label: string
    domLabel: string
    score: number
    topCapabilities: TopCapability[]
  }[]
  topProblems: { label: string; score: number; domain: string }[]
  problemCount: number
}

interface CrossAnalysis {
  generated: string
  top_opportunities: TopOpportunity[]
  product_clusters: ProductCluster[]
  company_briefs: Record<string, CompanyBrief>
  summary: { total_opportunity_nodes: number; nodes_above_threshold: number; product_cluster_count: number }
}

interface ProductIdea {
  name: string
  one_liner: string
  problem: string
  ai_technique: string
  how_it_works: string
  why_now: string
  buyer: string
  user: string
  moat: string
  build_complexity: string
  market_score: number
  build_score: number
  total_score: number
  tier: string
  product?: string
}

interface ProductIdeasData {
  ideas: ProductIdea[]
  tier_breakdown: { tier1: number; tier2: number; tier3: number }
  deduped_count: number
}

function scoreColor(s: number): string {
  if (s >= 0.7) return 'var(--red)'
  if (s >= 0.5) return 'var(--amber)'
  return 'var(--text-muted)'
}

function scoreBg(s: number): string {
  if (s >= 0.7) return 'var(--red-dim)'
  if (s >= 0.5) return 'var(--amber-dim)'
  return 'transparent'
}

function RiskTable({ risks, expanded, setExpanded }: {
  risks: Risk[]
  expanded: string | null
  setExpanded: (id: string | null) => void
}) {
  if (risks.length === 0) return <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 8 }}>No significant risks identified</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {risks.map((r, i) => (
        <div key={`${r.id}-${i}`}>
          <div
            onClick={() => setExpanded(expanded === `${r.id}-${i}` ? null : `${r.id}-${i}`)}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 60px', gap: 8,
              alignItems: 'center', padding: '7px 10px', cursor: 'pointer',
              background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
            }}
          >
            <div>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{r.domain} &gt; {r.sub}</span>
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.level}</span>
            <span style={{
              fontSize: 11, fontWeight: 600, textAlign: 'center', padding: '1px 6px',
              borderRadius: 4, color: scoreColor(r.score), background: scoreBg(r.score),
            }}>
              {(r.score * 100).toFixed(0)}
            </span>
          </div>
          {expanded === `${r.id}-${i}` && (
            <div style={{
              padding: '8px 12px', margin: '0 0 4px', fontSize: 11, lineHeight: 1.7,
              color: 'var(--text-secondary)', background: 'var(--surface2)', borderRadius: 4,
              borderLeft: `3px solid ${scoreColor(r.score)}`,
            }}>
              {r.reasoning}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const SIGNAL_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  positive: { color: 'var(--green)', bg: 'var(--green-dim)', label: 'Tailwind' },
  negative: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'Headwind' },
  neutral: { color: 'var(--text-muted)', bg: 'var(--surface3)', label: 'Neutral' },
  watch: { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'Watch' },
}

function IndicatorRow({ ind, isExpanded, onToggle, even }: {
  ind: Indicator; isExpanded: boolean; onToggle: () => void; even: boolean
}) {
  const s = SIGNAL_STYLES[ind.signal] || SIGNAL_STYLES.neutral
  return (
    <>
      <div
        onClick={onToggle}
        style={{
          display: 'grid', gridTemplateColumns: '100px 1fr 130px 70px', gap: 8,
          alignItems: 'center', padding: '7px 10px', cursor: 'pointer',
          background: even ? 'var(--surface)' : 'transparent', borderRadius: 4,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {ind.category}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500 }}>{ind.indicator}</span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>{ind.value}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '2px 8px',
          borderRadius: 4, color: s.color, background: s.bg,
        }}>
          {s.label}
        </span>
      </div>
      {isExpanded && (
        <div style={{
          padding: '8px 12px', margin: '0 0 4px', fontSize: 11, lineHeight: 1.7,
          color: 'var(--text-secondary)', background: 'var(--surface2)', borderRadius: 4,
          borderLeft: `3px solid ${s.color}`,
        }}>
          {ind.detail}
        </div>
      )}
    </>
  )
}

function ForceCard({ label, field }: { label: string; field: ProfileField }) {
  if (!field.value) return null
  return (
    <div style={{
      padding: 12, background: 'var(--surface)', borderRadius: 8,
      borderLeft: '3px solid var(--accent-dim)',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{field.value}</div>
      {field.evidence && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{field.evidence}</div>
      )}
    </div>
  )
}

export default function NextSteps() {
  const [data, setData] = useState<AllData | null>(null)
  const [indicators, setIndicators] = useState<AllIndicators | null>(null)
  const [landscape, setLandscape] = useState<AllLandscape | null>(null)
  const [lookalikes, setLookalikes] = useState<AllLookalikes | null>(null)
  const [crossAnalysis, setCrossAnalysis] = useState<CrossAnalysis | null>(null)
  const [productIdeas, setProductIdeas] = useState<ProductIdeasData | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [tab, setTab] = useState<'ai-opportunities' | 'peer-group' | 'landscape' | 'indicators' | 'risks' | 'economic' | 'context'>('ai-opportunities')

  useEffect(() => {
    Promise.all([
      fetch('/data/companies/next-steps.json').then(r => r.json()),
      fetch('/data/companies/indicators.json').then(r => r.json()),
      fetch('/data/companies/competitive-landscape.json').then(r => r.json()),
      fetch('/data/companies/lookalikes.json').then(r => r.json()),
      fetch('/data/companies/cross-analysis.json').then(r => r.json()).catch(() => null),
      fetch('/data/companies/product-ideas.json').then(r => r.json()).catch(() => null),
    ]).then(([d, ind, land, look, cross, ideas]: [AllData, AllIndicators, AllLandscape, AllLookalikes, CrossAnalysis | null, ProductIdeasData | null]) => {
      setData(d)
      setIndicators(ind)
      setLandscape(land)
      setLookalikes(look)
      setCrossAnalysis(cross)
      setProductIdeas(ideas)
      setSelected(Object.keys(d)[0])
    })
  }, [])

  if (!data) return <div style={{ color: 'var(--text-muted)' }}>Loading...</div>

  const companies = Object.entries(data)
  const co = selected ? data[selected] : null

  // Cross-company comparison: aggregate top risks
  const crossRisks: { company: string; risk: Risk; type: 'internal' | 'external' }[] = []
  for (const [cid, c] of companies) {
    for (const r of c.external_risks.slice(0, 5)) crossRisks.push({ company: c.name, risk: r, type: 'external' })
    for (const r of c.internal_risks.slice(0, 5)) crossRisks.push({ company: c.name, risk: r, type: 'internal' })
  }
  crossRisks.sort((a, b) => b.risk.score - a.risk.score)

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <span>Next Steps</span>
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Next Steps: Beyond Process Pain</h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 700 }}>
        Internal and external risks, driving economic forces, and strategic context per organization.
        Not just operational processes — this view surfaces market pressures, regulatory exposure,
        financial dynamics, and competitive positioning that shape where AI investment makes sense.
      </p>

      {/* Company selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {companies.map(([cid, c]) => (
          <button
            key={cid}
            onClick={() => { setSelected(cid); setExpanded(null) }}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600, border: 'none',
              cursor: 'pointer', borderRadius: 6,
              color: selected === cid ? 'var(--text)' : 'var(--text-muted)',
              background: selected === cid ? 'var(--accent-dim)' : 'var(--surface)',
            }}
          >
            {c.name}
          </button>
        ))}
        <button
          onClick={() => { setSelected(null); setExpanded(null) }}
          style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 600, border: 'none',
            cursor: 'pointer', borderRadius: 6,
            color: selected === null ? 'var(--text)' : 'var(--text-muted)',
            background: selected === null ? 'var(--accent-dim)' : 'var(--surface)',
          }}
        >
          Cross-Company
        </button>
      </div>

      {/* Cross-company view */}
      {!co && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Highest-Severity Risks Across All Organizations</h2>

          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 10 }}>External Risks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {crossRisks.filter(r => r.type === 'external').slice(0, 20).map((cr, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '110px 1fr 100px 50px',
                  gap: 8, alignItems: 'center', padding: '6px 10px',
                  background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{cr.company}</span>
                  <span style={{ fontSize: 12 }}>{cr.risk.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cr.risk.domain}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textAlign: 'center', padding: '1px 6px',
                    borderRadius: 4, color: scoreColor(cr.risk.score), background: scoreBg(cr.risk.score),
                  }}>
                    {(cr.risk.score * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)', marginBottom: 10 }}>Internal Risks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {crossRisks.filter(r => r.type === 'internal').slice(0, 20).map((cr, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '110px 1fr 100px 50px',
                  gap: 8, alignItems: 'center', padding: '6px 10px',
                  background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>{cr.company}</span>
                  <span style={{ fontSize: 12 }}>{cr.risk.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cr.risk.domain}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, textAlign: 'center', padding: '1px 6px',
                    borderRadius: 4, color: scoreColor(cr.risk.score), background: scoreBg(cr.risk.score),
                  }}>
                    {(cr.risk.score * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Single company view */}
      {co && (
        <>
          {/* Summary */}
          <div style={{
            padding: 16, background: 'var(--surface)', borderRadius: 10,
            marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            {co.summary}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 6, padding: 2, marginBottom: 20, width: 'fit-content' }}>
            {([
              ['ai-opportunities', 'AI Opportunities'],
              ['peer-group', 'Peer Group'],
              ['landscape', 'Competitive Landscape'],
              ['indicators', 'Key Indicators'],
              ['risks', 'Internal & External Risks'],
              ['economic', 'Economic Forces'],
              ['context', 'Strategic Context'],
            ] as [typeof tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setExpanded(null) }}
                style={{
                  padding: '7px 16px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  borderRadius: 4, color: tab === t ? 'var(--text)' : 'var(--text-muted)',
                  background: tab === t ? 'var(--surface3)' : 'transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* AI OPPORTUNITIES TAB */}
          {tab === 'ai-opportunities' && crossAnalysis && selected && (() => {
            const brief = crossAnalysis.company_briefs[selected]
            // Filter product ideas for this company
            const companyName = brief?.name || ''
            const relevantIdeas = productIdeas?.ideas
              .filter(idea => idea.problem.toLowerCase().includes(companyName.toLowerCase()))
              .sort((a, b) => b.total_score - a.total_score)
              .slice(0, 8) || []

            // Get this company's top pain domains from the brief
            const hotSubs = brief?.hotSubCategories?.slice(0, 8) || []
            const topProblems = brief?.topProblems?.slice(0, 10) || []

            return (
              <div>
                {/* Methodology summary */}
                <div style={{
                  padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    How This Was Built
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontSize: 12 }}>1. Process Taxonomy</div>
                      Built a generic process map per archetype (10 areas, ~300 terminal pain points for operators) grounded in real operational workflows.
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontSize: 12 }}>2. Market Scoring</div>
                      Each pain point scored on 3 binary checklists: <strong>Pain Salience</strong> (board-visible?), <strong>Adoption Likelihood</strong> (greenfield? structured data?), <strong>Build Complexity</strong> (standard pattern?).
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontSize: 12 }}>3. AI Capability Matching</div>
                      34 AI capabilities (generation, extraction, classification, prediction, optimization, agents) matched against each pain point with fit scores and reasoning.
                    </div>
                    <div style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 6 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2, fontSize: 12 }}>4. Product Ideation</div>
                      High-scoring intersections generate concrete product concepts with buyer, user, moat, build complexity, and "why now" — scored independently, no premature bundling.
                    </div>
                  </div>
                </div>

                {/* Company AI summary */}
                <div style={{
                  padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
                  borderLeft: '4px solid var(--green)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    {companyName} — Opportunity Profile
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {brief ? (
                      <>
                        <strong style={{ color: 'var(--green)' }}>{brief.problemCount}</strong> pain points scored.
                        Highest-heat domains: <strong style={{ color: 'var(--text)' }}>{hotSubs.slice(0, 3).map(s => `${s.label} (${s.score})`).join(', ')}</strong>.
                        {relevantIdeas.length > 0 && (
                          <> {relevantIdeas.length} AI product ideas identified — {relevantIdeas.filter(i => i.tier === 'tier1').length} high-priority, {relevantIdeas.filter(i => i.tier === 'tier2').length} medium.</>
                        )}
                      </>
                    ) : 'No company brief available.'}
                  </div>
                </div>

                {/* Hot Pain Domains with AI Capabilities */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    Highest-Opportunity Pain Domains
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      where AI capability fit is strongest
                    </span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Each domain shows the AI capabilities best suited to address its pain points.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {hotSubs.map((sub, i) => (
                      <div key={sub.subId}>
                        <div
                          onClick={() => setExpanded(expanded === `ai-sub-${i}` ? null : `ai-sub-${i}`)}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr 140px 60px', gap: 8,
                            alignItems: 'center', padding: '10px 14px', cursor: 'pointer',
                            background: 'var(--surface)', borderRadius: expanded === `ai-sub-${i}` ? '8px 8px 0 0' : 8,
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{sub.label}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{sub.domLabel}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {sub.topCapabilities.slice(0, 2).map(cap => (
                              <span key={cap.capId} style={{
                                fontSize: 9, padding: '2px 6px', borderRadius: 3,
                                background: cap.fit >= 0.7 ? 'rgba(52,211,153,0.12)' : 'var(--surface3)',
                                color: cap.fit >= 0.7 ? 'var(--green)' : 'var(--text-muted)',
                                fontWeight: 600,
                              }}>
                                {cap.catLabel}
                              </span>
                            ))}
                          </div>
                          <span style={{
                            fontSize: 12, fontWeight: 700, textAlign: 'center', padding: '2px 8px',
                            borderRadius: 4,
                            color: sub.score >= 50 ? 'var(--green)' : sub.score >= 30 ? 'var(--amber)' : 'var(--text-muted)',
                            background: sub.score >= 50 ? 'rgba(52,211,153,0.12)' : sub.score >= 30 ? 'rgba(245,158,11,0.12)' : 'var(--surface3)',
                          }}>
                            {sub.score}
                          </span>
                        </div>
                        {expanded === `ai-sub-${i}` && (
                          <div style={{
                            border: '1px solid var(--border-subtle)', borderTop: 'none',
                            borderRadius: '0 0 8px 8px', overflow: 'hidden',
                          }}>
                            {sub.topCapabilities.map((cap, ci) => (
                              <div key={cap.capId} style={{
                                padding: '10px 14px',
                                borderBottom: ci < sub.topCapabilities.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                background: ci % 2 === 0 ? 'var(--surface2)' : 'transparent',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{cap.label}</span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{cap.catLabel}</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{
                                      fontSize: 9, padding: '1px 6px', borderRadius: 3,
                                      background: 'var(--surface3)', color: 'var(--text-muted)', fontWeight: 600,
                                    }}>
                                      {cap.specificity} specificity
                                    </span>
                                    <span style={{
                                      fontSize: 11, fontWeight: 700,
                                      color: cap.fit >= 0.7 ? 'var(--green)' : cap.fit >= 0.5 ? 'var(--amber)' : 'var(--text-muted)',
                                    }}>
                                      {(cap.fit * 100).toFixed(0)}% fit
                                    </span>
                                  </div>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                  {cap.reasoning}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Pain Points */}
                {topProblems.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                      Top Scored Pain Points
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                        highest opportunity scores for {companyName}
                      </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {topProblems.map((p, i) => (
                        <div key={i} style={{
                          display: 'grid', gridTemplateColumns: '1fr 140px 50px', gap: 8,
                          alignItems: 'center', padding: '7px 12px',
                          background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{p.label}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.domain}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '1px 6px',
                            borderRadius: 4,
                            color: p.score >= 50 ? 'var(--green)' : p.score >= 30 ? 'var(--amber)' : 'var(--text-muted)',
                            background: p.score >= 50 ? 'rgba(52,211,153,0.12)' : p.score >= 30 ? 'rgba(245,158,11,0.12)' : 'var(--surface3)',
                          }}>
                            {p.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Product Ideas */}
                {relevantIdeas.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                      AI Product Ideas
                      <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                        concrete solutions targeting {companyName}'s pain points
                      </span>
                    </h3>
                    <div className="spotlight-grid">
                      {relevantIdeas.map((idea, i) => (
                        <div key={i}
                          className="spotlight-card"
                          onClick={() => setExpanded(expanded === `idea-${i}` ? null : `idea-${i}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                              color: idea.tier === 'tier1' ? 'var(--green)' : idea.tier === 'tier2' ? 'var(--amber)' : 'var(--text-muted)',
                              background: idea.tier === 'tier1' ? 'rgba(52,211,153,0.12)' : idea.tier === 'tier2' ? 'rgba(245,158,11,0.12)' : 'var(--surface3)',
                            }}>
                              {idea.tier === 'tier1' ? 'High Priority' : idea.tier === 'tier2' ? 'Medium' : 'Exploratory'} · {idea.total_score}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{idea.ai_technique}</span>
                          </div>
                          <h3>{idea.name}</h3>
                          <div className="sketch">{idea.one_liner}</div>
                          {expanded === `idea-${i}` && (
                            <div style={{ marginTop: 8, fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                              <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Problem: </span>
                                {idea.problem}
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>How it works: </span>
                                {idea.how_it_works}
                              </div>
                              <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Why now: </span>
                                {idea.why_now}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Buyer: </span>
                                  {idea.buyer}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>User: </span>
                                  {idea.user}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Moat: </span>
                                  {idea.moat}
                                </div>
                                <div>
                                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Build: </span>
                                  {idea.build_complexity}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cross-archetype top opportunities */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    Cross-Archetype Opportunity Map
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      {crossAnalysis.summary.total_opportunity_nodes} opportunity nodes across all orgs
                    </span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Pain domains where AI capability fit is strongest across all 8 organizations. Higher scores = more orgs affected + better AI fit.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {crossAnalysis.top_opportunities.slice(0, 15).map((opp, i) => (
                      <div key={opp.subId}>
                        <div
                          onClick={() => setExpanded(expanded === `opp-${i}` ? null : `opp-${i}`)}
                          style={{
                            display: 'grid', gridTemplateColumns: '1fr 120px 80px 60px 50px', gap: 8,
                            alignItems: 'center', padding: '7px 12px', cursor: 'pointer',
                            background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                          }}
                        >
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{opp.label}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{opp.domLabel}</span>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {opp.hotCompanies}/8 orgs affected
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            Heat: {opp.problemHeat}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            Fit: {opp.bestCapFit}%
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, textAlign: 'center', padding: '1px 6px',
                            borderRadius: 4,
                            color: opp.opportunityScore >= 40 ? 'var(--green)' : opp.opportunityScore >= 25 ? 'var(--amber)' : 'var(--text-muted)',
                            background: opp.opportunityScore >= 40 ? 'rgba(52,211,153,0.12)' : opp.opportunityScore >= 25 ? 'rgba(245,158,11,0.12)' : 'var(--surface3)',
                          }}>
                            {opp.opportunityScore}
                          </span>
                        </div>
                        {expanded === `opp-${i}` && (
                          <div style={{
                            padding: '10px 14px', background: 'var(--surface2)', borderRadius: 6,
                            marginBottom: 4, borderLeft: '3px solid var(--green)',
                          }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                              Top AI Capabilities for this domain:
                            </div>
                            {opp.topCapabilities.slice(0, 3).map(cap => (
                              <div key={cap.capId} style={{ marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
                                    {cap.label}
                                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6, fontSize: 10 }}>{cap.catLabel}</span>
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: cap.fit >= 0.7 ? 'var(--green)' : 'var(--amber)' }}>
                                    {(cap.fit * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{cap.reasoning}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* PEER GROUP TAB */}
          {tab === 'peer-group' && lookalikes && selected && lookalikes[selected] && (() => {
            const lk = lookalikes[selected]
            return (
              <div>
                {/* Sub-archetype header */}
                <div style={{
                  padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
                  borderLeft: '4px solid var(--accent)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Sub-Archetype
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: 'var(--accent-bright)' }}>{lk.sub_archetype}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{lk.sub_archetype_detail}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {lk.defining_traits.map((t, i) => (
                      <span key={i} style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: 'var(--surface3)', color: 'var(--text-secondary)',
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lookalikes */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    Peer Organizations
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      10 lookalikes in the same sub-archetype
                    </span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Organizations facing similar structural challenges, operating in the same model, competing for similar resources.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {lk.lookalikes.map((la, i) => (
                      <div key={i}>
                        <div
                          onClick={() => setExpanded(expanded === `la-${i}` ? null : `la-${i}`)}
                          style={{
                            display: 'grid', gridTemplateColumns: '200px 130px 1fr', gap: 12,
                            padding: '8px 12px', alignItems: 'baseline', cursor: 'pointer',
                            background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{la.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{la.hq}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {expanded === `la-${i}` ? '' : la.detail.slice(0, 80) + (la.detail.length > 80 ? '...' : '')}
                          </span>
                        </div>
                        {expanded === `la-${i}` && (
                          <div style={{
                            padding: '8px 12px', fontSize: 11, color: 'var(--text-secondary)',
                            lineHeight: 1.7, background: 'var(--surface2)', borderRadius: 4,
                            marginBottom: 2, borderLeft: '3px solid var(--accent-dim)',
                          }}>
                            {la.detail}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common pain points */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    Common Pain Points
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                      shared across this sub-archetype
                    </span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                    The structural challenges that every organization in this peer group faces — not unique to {lk.name}.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {lk.common_pain_points.map((pp, i) => (
                      <div key={i}
                        onClick={() => setExpanded(expanded === `pp-${i}` ? null : `pp-${i}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div style={{
                          padding: '10px 14px', background: 'var(--surface)', borderRadius: 8,
                          borderLeft: `3px solid ${pp.prevalence === 'Universal' ? 'var(--red)' : pp.prevalence === 'Very common' ? 'var(--amber)' : 'var(--text-muted)'}`,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{pp.pain}</span>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                              color: pp.prevalence === 'Universal' ? 'var(--red)' : pp.prevalence === 'Very common' ? 'var(--amber)' : 'var(--text-muted)',
                              background: pp.prevalence === 'Universal' ? 'var(--red-dim)' : pp.prevalence === 'Very common' ? 'var(--amber-dim)' : 'var(--surface3)',
                            }}>
                              {pp.prevalence}
                            </span>
                          </div>
                          {expanded === `pp-${i}` && (
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.7 }}>
                              {pp.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* COMPETITIVE LANDSCAPE TAB */}
          {tab === 'landscape' && landscape && selected && landscape[selected] && (() => {
            const l = landscape[selected]
            return (
              <div>
                {/* Market header */}
                <div style={{
                  padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
                  borderLeft: '4px solid var(--accent)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    Market
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{l.market}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{l.market_size}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: l.position === 'Market leader' ? 'var(--green-dim)' : 'var(--accent-dim)',
                      color: l.position === 'Market leader' ? 'var(--green)' : 'var(--accent)',
                    }}>
                      {l.position}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.position_detail}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Key Metrics</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {l.metrics.map((m, i) => (
                      <div key={i} style={{
                        padding: '10px 14px', background: 'var(--surface)', borderRadius: 8,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {m.label}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.context}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advantages vs Disadvantages */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                      <span style={{ color: 'var(--green)' }}>Advantages</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {l.advantages.map((a, i) => (
                        <div key={i}
                          onClick={() => setExpanded(expanded === `adv-${i}` ? null : `adv-${i}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{
                            padding: '8px 12px', background: 'var(--surface)', borderRadius: 6,
                            borderLeft: '3px solid var(--green)',
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</div>
                            {expanded === `adv-${i}` && (
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                                {a.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                      <span style={{ color: 'var(--red)' }}>Disadvantages</span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {l.disadvantages.map((d, i) => (
                        <div key={i}
                          onClick={() => setExpanded(expanded === `dis-${i}` ? null : `dis-${i}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{
                            padding: '8px 12px', background: 'var(--surface)', borderRadius: 6,
                            borderLeft: '3px solid var(--red)',
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{d.label}</div>
                            {expanded === `dis-${i}` && (
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                                {d.detail}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Landscape players */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Landscape Players</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {l.competitors.map((c, i) => {
                      const relColors: Record<string, string> = {
                        'direct competitor': 'var(--red)',
                        'resource competitor': 'var(--amber)',
                        'structural peer': 'var(--accent)',
                        'adjacent player': 'var(--text-muted)',
                      }
                      const relColor = relColors[c.relationship] || 'var(--text-muted)'
                      return (
                        <div
                          key={i}
                          onClick={() => setExpanded(expanded === `comp-${i}` ? null : `comp-${i}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div style={{
                            display: 'grid', gridTemplateColumns: '160px 120px 1fr', gap: 12,
                            padding: '8px 12px', alignItems: 'baseline',
                            background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                              color: relColor,
                            }}>
                              {c.relationship}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.positioning}</span>
                          </div>
                          {expanded === `comp-${i}` && (
                            <div style={{
                              padding: '6px 12px 10px', fontSize: 11, color: 'var(--text-secondary)',
                              lineHeight: 1.7, background: 'var(--surface2)', borderRadius: 4,
                              marginBottom: 2, borderLeft: `3px solid ${relColor}`,
                            }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>vs {l.name}: </span>
                              {c.differentiation}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* INDICATORS TAB */}
          {tab === 'indicators' && indicators && selected && indicators[selected] && (() => {
            const ind = indicators[selected]
            return (
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 650 }}>
                  External benchmarks, market data, and measurable signals that contextualize this organization beyond internal process pain.
                  These are the numbers and trends a leadership team watches.
                </p>

                <div style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: 'var(--accent)' }}>External Indicators</span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Market sizing, benchmarks, regulatory pressure, competitive dynamics, funding environment
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {ind.external_indicators.map((item, i) => (
                      <IndicatorRow
                        key={`ext-${i}`}
                        ind={item}
                        even={i % 2 === 0}
                        isExpanded={expanded === `ext-${i}`}
                        onToggle={() => setExpanded(expanded === `ext-${i}` ? null : `ext-${i}`)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: 'var(--amber)' }}>Internal Indicators</span>
                  </h3>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                    Financial metrics, talent signals, leadership changes, technology readiness
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {ind.internal_indicators.map((item, i) => (
                      <IndicatorRow
                        key={`int-${i}`}
                        ind={item}
                        even={i % 2 === 0}
                        isExpanded={expanded === `int-${i}`}
                        onToggle={() => setExpanded(expanded === `int-${i}` ? null : `int-${i}`)}
                      />
                    ))}
                  </div>
                </div>

                {/* Signal summary */}
                <div style={{ marginTop: 24, padding: 14, background: 'var(--surface)', borderRadius: 8, display: 'flex', gap: 24 }}>
                  {(['positive', 'negative', 'watch', 'neutral'] as const).map(sig => {
                    const all = [...ind.external_indicators, ...ind.internal_indicators]
                    const count = all.filter(x => x.signal === sig).length
                    const s = SIGNAL_STYLES[sig]
                    return (
                      <div key={sig} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{count}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* RISKS TAB */}
          {tab === 'risks' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: 'var(--red)' }}>External Risks</span>
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Market, regulatory, competitive, and partnership risks
                </p>
                <RiskTable risks={co.external_risks} expanded={expanded} setExpanded={setExpanded} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: 'var(--amber)' }}>Internal Risks</span>
                </h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Operational, financial, talent, and governance risks
                </p>
                <RiskTable risks={co.internal_risks} expanded={expanded} setExpanded={setExpanded} />
              </div>
            </div>
          )}

          {/* ECONOMIC FORCES TAB */}
          {tab === 'economic' && (
            <div>
              {/* Key forces grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, marginBottom: 24 }}>
                <ForceCard label="Growth Phase" field={co.economic.growth_phase} />
                <ForceCard label="Market Position" field={co.economic.market_position} />
                <ForceCard label="Revenue Model" field={co.economic.revenue_model} />
                <ForceCard label="Macro Sensitivity" field={co.economic.macro_sensitivity} />
                <ForceCard label="Regulatory Burden" field={co.regulatory} />
                <ForceCard label="Geographic Scope" field={co.geo_scope} />
              </div>

              {/* Key dependencies */}
              {co.economic.key_dependencies.value && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Key Dependencies</h3>
                  <div style={{
                    padding: 14, background: 'var(--surface)', borderRadius: 8, fontSize: 12,
                    color: 'var(--text-secondary)', lineHeight: 1.7,
                    borderLeft: '3px solid var(--red)',
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{co.economic.key_dependencies.value}</div>
                    {co.economic.key_dependencies.evidence}
                  </div>
                </div>
              )}

              {/* Industry dynamics */}
              {co.economic.industry && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Industry Dynamics</h3>
                  <div style={{
                    padding: 14, background: 'var(--surface)', borderRadius: 8,
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  }}>
                    {co.economic.industry}
                  </div>
                </div>
              )}

              {/* Financial signals */}
              {co.economic.financial && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Financial Signals</h3>
                  <div style={{
                    padding: 14, background: 'var(--surface)', borderRadius: 8,
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  }}>
                    {co.economic.financial}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTEXT TAB */}
          {tab === 'context' && (
            <div>
              {/* Technology readiness */}
              {co.tech_maturity && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Technology & AI Readiness</h3>
                  <div style={{
                    padding: 14, background: 'var(--surface)', borderRadius: 8,
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                  }}>
                    {co.tech_maturity}
                  </div>
                </div>
              )}

              {/* Recent news */}
              {co.news_items.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Recent Signals</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {co.news_items.map((n, i) => (
                      <div key={i} style={{
                        padding: 12, background: 'var(--surface)', borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{n.headline}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>{n.date}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
