import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'

// ── Types ──────────────────────────────────────────────
interface LookalikeEntry { name: string; hq: string; detail: string }
interface LookalikePainPoint { pain: string; prevalence: string; detail: string }
interface OrgLookalikes {
  name: string; sub_archetype: string; sub_archetype_detail: string
  defining_traits: string[]; lookalikes: LookalikeEntry[]; common_pain_points: LookalikePainPoint[]
}
interface CompetitorEntry { name: string; positioning: string; differentiation: string; relationship: string }
interface AdvDisadv { label: string; detail: string }
interface MetricItem { label: string; value: string; context: string }
interface OrgLandscape {
  name: string; market: string; market_size: string; position: string; position_detail: string
  advantages: AdvDisadv[]; disadvantages: AdvDisadv[]; competitors: CompetitorEntry[]; metrics: MetricItem[]
}
interface TopCap { capId: string; label: string; catLabel: string; fit: number; specificity: string; reasoning: string }
interface OrgBrief {
  name: string; problemCount: number
  hotSubCategories: { subId: string; label: string; domLabel: string; score: number; topCapabilities: TopCap[] }[]
  topProblems: { label: string; score: number; domain: string }[]
}
interface OrgProfile {
  entity: string; executive_summary?: string; website?: string; hq_address?: string
  known_contact?: { name: string; role: string }
  dimensions?: Record<string, Record<string, { value: string; confidence: string }> | { value: string; evidence: string; confidence: string }>
  leadership_team?: { name: string; title: string }[]
}
interface Indicator { category: string; indicator: string; value: string; signal: string; detail: string }
interface Risk { id: string; label: string; score: number; reasoning: string; domain: string }
interface OrgNextSteps {
  name: string; summary: string; tech_maturity: string
  external_risks: Risk[]; internal_risks: Risk[]
  news_items: { headline: string; date: string; summary: string }[]
}
interface OrgIndicators { external_indicators: Indicator[]; internal_indicators: Indicator[] }

// ── Constants ──────────────────────────────────────────
const ORGS = [
  { id: 'cspd', name: 'CSPD', full: 'Catholic Schools Parramatta Diocese', archetype: 'Operator' },
  { id: 'acasus', name: 'Acasus', full: 'Acasus', archetype: 'Advisory' },
  { id: 'ipeople', name: 'iPeople', full: 'iPeople Inc', archetype: 'Operator' },
  { id: 'kinetic', name: 'Kinetic', full: 'Kinetic Software', archetype: 'SaaS Vendor' },
  { id: 'phinma', name: 'PHINMA', full: 'PHINMA Education', archetype: 'Operator' },
  { id: 'rising', name: 'Rising', full: 'Rising Academies', archetype: 'Operator' },
  { id: 'school-for-life', name: 'School for Life', full: 'School for Life Foundation', archetype: 'Operator' },
  { id: 'wise', name: 'WISE', full: 'WISE', archetype: 'Advisory' },
]

const PROCESS_AREAS = [
  { id: 'enrollment-admissions', label: 'Enrollment & Admissions', icon: '🎓' },
  { id: 'teaching-learning', label: 'Teaching & Learning', icon: '📚' },
  { id: 'student-support', label: 'Student Support', icon: '🤝' },
  { id: 'workforce-management', label: 'Workforce', icon: '👥' },
  { id: 'site-facilities', label: 'Facilities', icon: '🏫' },
  { id: 'finance-revenue', label: 'Finance', icon: '💰' },
  { id: 'compliance-qa', label: 'Compliance', icon: '🛡️' },
  { id: 'data-mis', label: 'Data & Systems', icon: '💻' },
  { id: 'external-relations', label: 'External Relations', icon: '🌐' },
  { id: 'network-coordination', label: 'Governance', icon: '🏛️' },
]

type Section = 'overview' | 'lookalikes' | 'competitors' | 'pain-points' | 'signals'
const SECTIONS: { id: Section; label: string; color: string }[] = [
  { id: 'overview', label: 'Overview', color: 'var(--indigo)' },
  { id: 'lookalikes', label: 'Lookalikes', color: 'var(--emerald)' },
  { id: 'competitors', label: 'Competitors', color: 'var(--red)' },
  { id: 'pain-points', label: 'Pain Points', color: 'var(--amber)' },
  { id: 'signals', label: 'Signals', color: 'var(--blue)' },
]

const ARC_PILL: Record<string, string> = { Operator: 'pill-emerald', 'SaaS Vendor': 'pill-blue', Advisory: 'pill-amber' }

async function fetchJson<T>(path: string): Promise<T | null> {
  try { const r = await fetch(`/data/${path}`); return r.ok ? r.json() : null } catch { return null }
}

// ── Primitives ─────────────────────────────────────────

const fadeIn = { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } }

function ScorePill({ score, max = 1 }: { score: number; max?: number }) {
  const pct = max <= 1 ? score * 100 : score
  const cls = pct >= 70 ? 'pill-red' : pct >= 50 ? 'pill-amber' : pct >= 30 ? 'pill-emerald' : 'pill-neutral'
  return <span className={`score-pill ${cls}`}>{pct.toFixed(0)}</span>
}

function Placeholder({ text }: { text: string }) {
  return <div className="callout" style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>{text}</div>
}

function Expandable({ children, detail, isOpen, onToggle, even }: {
  children: React.ReactNode; detail: React.ReactNode; isOpen: boolean; onToggle: () => void; even?: boolean
}) {
  return (
    <>
      <div onClick={onToggle} className={`row-item ${even ? 'even' : ''}`}>{children}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
            {detail}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Overview ───────────────────────────────────────────

function OverviewSection({ profile, brief }: { profile: OrgProfile | null; brief: OrgBrief | null }) {
  if (!profile) return <Placeholder text="Loading profile..." />

  // Extract quick facts from dimensions
  const d = profile.dimensions || {}
  const getFact = (group: string, key: string) => {
    const g = d[group] as Record<string, { value: string }> | undefined
    return g?.[key]?.value
  }
  const getFlat = (group: string) => {
    const g = d[group] as { value: string } | undefined
    return g?.value
  }

  const facts = [
    { label: 'Headcount', value: getFact('scale_resources', 'headcount_band') },
    { label: 'Revenue', value: getFact('scale_resources', 'revenue_band') },
    { label: 'Growth Phase', value: getFlat('growth_phase') },
    { label: 'Market Position', value: getFact('market_position', 'competitive_stance') },
  ].filter(f => f.value) as { label: string; value: string }[]

  return (
    <motion.div {...fadeIn} className="stack stack-xl">
      {/* Summary */}
      {profile.executive_summary && (
        <div className="section-block">
          <div className="card-accent" style={{ borderLeftColor: 'var(--indigo)' }}>
            <p className="body-text">{profile.executive_summary}</p>
          </div>
        </div>
      )}

      {/* Quick facts */}
      {facts.length > 0 && (
        <div className="section-block">
          <div className={`grid-${Math.min(facts.length, 4)}`}>
            {facts.map((f, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{f.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact + Team */}
      <div className="section-block">
        <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
          {profile.known_contact && (
            <div className="card card-sm">
              <div className="label" style={{ marginBottom: 12 }}>Key Contact</div>
              <div className="row gap-md">
                <div className="avatar avatar-lg" style={{ background: 'var(--indigo-muted)', color: 'var(--indigo)' }}>
                  {profile.known_contact.name.split(' ').map(w => w[0]).join('')}
                </div>
                <div>
                  <div className="heading-sm">{profile.known_contact.name}</div>
                  <div className="caption">{profile.known_contact.role}</div>
                </div>
              </div>
            </div>
          )}
          {profile.leadership_team && profile.leadership_team.length > 0 && (
            <div className="card card-sm">
              <div className="label" style={{ marginBottom: 12 }}>Leadership ({profile.leadership_team.length})</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {profile.leadership_team.slice(0, 9).map((l, i) => (
                  <div key={i} className="row gap-sm">
                    <div className="avatar avatar-sm" style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}>
                      {l.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pain landscape */}
      {brief && (
        <div className="section-block">
          <div className="section-title">Pain Landscape</div>
          <div className="grid-5">
            {brief.hotSubCategories.slice(0, 5).map(sub => (
              <div key={sub.subId} className="card card-sm">
                <div className="row row-between" style={{ marginBottom: 8 }}>
                  <span className="label" style={{ marginBottom: 0, fontSize: 9 }}>{sub.domLabel}</span>
                  <ScorePill score={sub.score} max={100} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{sub.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Lookalikes ─────────────────────────────────────────

function LookalikesSection({ data }: { data: OrgLookalikes | null }) {
  const [exp, setExp] = useState<string | null>(null)
  if (!data) return <Placeholder text="No lookalike data available" />

  return (
    <motion.div {...fadeIn} className="stack stack-xl">
      <div className="card-accent" style={{ borderLeftColor: 'var(--emerald)' }}>
        <div className="label" style={{ color: 'var(--emerald)', marginBottom: 8 }}>Sub-Archetype</div>
        <div className="heading-lg" style={{ marginBottom: 8 }}>{data.sub_archetype}</div>
        <p className="body-text" style={{ marginBottom: 16 }}>{data.sub_archetype_detail}</p>
        <div className="row gap-sm" style={{ flexWrap: 'wrap' }}>
          {data.defining_traits.map((t, i) => <span key={i} className="trait-tag">{t}</span>)}
        </div>
      </div>

      <div className="callout">
        <strong>Not competitors.</strong> Same operating model — what they've solved is what you can learn from.
      </div>

      <div className="section-block">
        <div className="section-title">Peer Organizations ({data.lookalikes.length})</div>
        <div className="card-flush">
          {data.lookalikes.map((la, i) => (
            <Expandable key={i} even={i % 2 === 0} isOpen={exp === `la-${i}`}
              onToggle={() => setExp(exp === `la-${i}` ? null : `la-${i}`)}
              detail={<div className="row-detail" style={{ borderColor: 'var(--emerald)' }}>{la.detail}</div>}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{la.name}</span>
              <span className="caption" style={{ flexShrink: 0 }}>{la.hq}</span>
              <span className="pill pill-emerald">Peer</span>
            </Expandable>
          ))}
        </div>
      </div>

      {data.common_pain_points.length > 0 && (
        <div className="section-block">
          <div className="section-title">Shared Pain Points</div>
          <div className="stack stack-sm">
            {data.common_pain_points.map((pp, i) => {
              const pcls = pp.prevalence === 'Universal' ? 'pill-red' : pp.prevalence === 'Very common' ? 'pill-amber' : 'pill-neutral'
              const bcolor = pp.prevalence === 'Universal' ? 'var(--red)' : pp.prevalence === 'Very common' ? 'var(--amber)' : 'var(--text-muted)'
              return (
                <div key={i} onClick={() => setExp(exp === `pp-${i}` ? null : `pp-${i}`)}
                  className="card-accent" style={{ borderLeftColor: bcolor, cursor: 'pointer' }}>
                  <div className="row row-between">
                    <span className="heading-sm">{pp.pain}</span>
                    <span className={`pill ${pcls}`}>{pp.prevalence}</span>
                  </div>
                  {exp === `pp-${i}` && <p className="body-text" style={{ marginTop: 12 }}>{pp.detail}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── Competitors ────────────────────────────────────────

function CompetitorsSection({ data }: { data: OrgLandscape | null }) {
  const [exp, setExp] = useState<string | null>(null)
  if (!data) return <Placeholder text="No competitive landscape data available" />

  const relPill: Record<string, string> = {
    'direct competitor': 'pill-red', 'resource competitor': 'pill-amber',
    'structural peer': 'pill-blue', 'adjacent player': 'pill-neutral',
  }

  return (
    <motion.div {...fadeIn} className="stack stack-xl">
      <div className="card-accent" style={{ borderLeftColor: 'var(--red)' }}>
        <div className="label" style={{ color: 'var(--red)', marginBottom: 8 }}>Competitive Market</div>
        <div className="heading-lg" style={{ marginBottom: 4 }}>{data.market}</div>
        <p className="caption" style={{ marginBottom: 12 }}>{data.market_size}</p>
        <span className={`pill ${data.position === 'Market leader' ? 'pill-emerald' : 'pill-blue'}`}>{data.position}</span>
      </div>

      {data.metrics.length > 0 && (
        <div className="section-block">
          <div className="grid-4">
            {data.metrics.slice(0, 4).map((m, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{m.label}</div>
                <div className="stat-value" style={{ fontSize: 18 }}>{m.value}</div>
                <div className="stat-sub">{m.context}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-block">
        <div className="grid-2">
          {[
            { title: 'Advantages', items: data.advantages, color: 'var(--emerald)', prefix: 'a' },
            { title: 'Disadvantages', items: data.disadvantages, color: 'var(--red)', prefix: 'd' },
          ].map(g => (
            <div key={g.prefix}>
              <div className="section-title" style={{ color: g.color }}>{g.title}</div>
              <div className="stack stack-sm">
                {g.items.map((item, i) => (
                  <div key={i} onClick={() => setExp(exp === `${g.prefix}-${i}` ? null : `${g.prefix}-${i}`)}
                    className="card-accent" style={{ borderLeftColor: g.color, cursor: 'pointer', padding: 'var(--space-lg)' }}>
                    <div className="heading-sm" style={{ fontSize: 12 }}>{item.label}</div>
                    {exp === `${g.prefix}-${i}` && <p className="caption" style={{ marginTop: 8 }}>{item.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="section-title">Landscape Players</div>
        <div className="card-flush">
          {data.competitors.map((c, i) => (
            <Expandable key={i} even={i % 2 === 0} isOpen={exp === `c-${i}`}
              onToggle={() => setExp(exp === `c-${i}` ? null : `c-${i}`)}
              detail={<div className="row-detail" style={{ borderColor: 'var(--red)' }}><span style={{ color: 'var(--text-muted)' }}>{c.positioning}</span><br />{c.differentiation}</div>}
            >
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              <span className={`pill ${relPill[c.relationship] || 'pill-neutral'}`}>{c.relationship}</span>
            </Expandable>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Pain Points ────────────────────────────────────────

function PainPointsSection({ brief }: { brief: OrgBrief | null }) {
  const [expArea, setExpArea] = useState<string | null>(null)
  if (!brief) return <Placeholder text="No pain point data available" />

  return (
    <motion.div {...fadeIn} className="stack stack-xl">
      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-label">Pain Points</div>
          <div className="stat-value">{brief.problemCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hot Domains</div>
          <div className="stat-value">{brief.hotSubCategories.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top Score</div>
          <div className="stat-value" style={{ color: 'var(--emerald)' }}>{brief.hotSubCategories[0]?.score || '—'}</div>
          <div className="stat-sub">{brief.hotSubCategories[0]?.label}</div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-title">Highest-Scoring Pain Points</div>
        <div className="card-flush">
          {brief.topProblems.slice(0, 8).map((p, i) => (
            <div key={i} className={`row-item ${i % 2 === 0 ? 'even' : ''}`} style={{ cursor: 'default' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.label}</span>
              <span className="caption" style={{ flexShrink: 0, width: 140 }}>{p.domain}</span>
              <ScorePill score={p.score} />
            </div>
          ))}
        </div>
      </div>

      <div className="section-block">
        <div className="section-title">By Process Area</div>
        <div className="stack stack-sm">
          {PROCESS_AREAS.map(area => {
            const sub = brief.hotSubCategories.find(s => s.subId.includes(area.id.split('-')[0]))
            const isOpen = expArea === area.id
            return (
              <div key={area.id}>
                <div onClick={() => setExpArea(isOpen ? null : area.id)}
                  className="card row gap-lg" style={{ cursor: 'pointer', padding: 'var(--space-lg) var(--space-xl)' }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{area.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{area.label}</span>
                  {sub && <ScorePill score={sub.score} max={100} />}
                  <span style={{ fontSize: 10, color: 'var(--text-faint)', width: 12 }}>{isOpen ? '▼' : '▶'}</span>
                </div>
                <AnimatePresence>
                  {isOpen && sub && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginLeft: 28, borderLeft: '2px solid var(--indigo-muted)', padding: '16px 24px', background: 'var(--surface-1)', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
                        <div className="stack stack-lg">
                          {sub.topCapabilities.slice(0, 3).map(cap => (
                            <div key={cap.capId}>
                              <div className="row row-between" style={{ marginBottom: 4 }}>
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{cap.label}</span>
                                  <span className="caption" style={{ marginLeft: 8 }}>{cap.catLabel}</span>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: cap.fit >= 0.7 ? 'var(--emerald)' : 'var(--amber)' }}>
                                  {(cap.fit * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="caption">{cap.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ── Signals ────────────────────────────────────────────

function SignalsSection({ nextSteps, indicators }: { nextSteps: OrgNextSteps | null; indicators: OrgIndicators | null }) {
  const [exp, setExp] = useState<string | null>(null)
  if (!nextSteps && !indicators) return <Placeholder text="No signal data available" />

  const sigPill: Record<string, string> = { positive: 'pill-emerald', negative: 'pill-red', watch: 'pill-amber', neutral: 'pill-neutral' }
  const sigLabel: Record<string, string> = { positive: 'Tailwind', negative: 'Headwind', watch: 'Watch', neutral: 'Neutral' }

  return (
    <motion.div {...fadeIn} className="stack stack-xl">
      {indicators && (
        <div className="section-block">
          <div className="section-title">Key Indicators</div>
          <div className="card-flush">
            {[...indicators.external_indicators, ...indicators.internal_indicators].slice(0, 12).map((ind, i) => (
              <Expandable key={i} even={i % 2 === 0} isOpen={exp === `i-${i}`}
                onToggle={() => setExp(exp === `i-${i}` ? null : `i-${i}`)}
                detail={<div className="row-detail" style={{ borderColor: 'var(--blue)' }}>{ind.detail}</div>}
              >
                <span className="label" style={{ width: 80, flexShrink: 0, marginBottom: 0 }}>{ind.category}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{ind.indicator}</span>
                <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{ind.value}</span>
                <span className={`pill ${sigPill[ind.signal] || 'pill-neutral'}`}>{sigLabel[ind.signal] || 'Neutral'}</span>
              </Expandable>
            ))}
          </div>
        </div>
      )}

      {nextSteps && (
        <div className="section-block">
          <div className="grid-2">
            {([
              { key: 'external_risks' as const, title: 'External Risks', color: 'var(--red)' },
              { key: 'internal_risks' as const, title: 'Internal Risks', color: 'var(--amber)' },
            ]).map(({ key, title, color }) => (
              <div key={key}>
                <div className="section-title" style={{ color }}>{title}</div>
                <div className="stack stack-sm">
                  {nextSteps[key].slice(0, 6).map((r, i) => (
                    <div key={i} onClick={() => setExp(exp === `${key}-${i}` ? null : `${key}-${i}`)}
                      className="card-accent" style={{ borderLeftColor: color, cursor: 'pointer', padding: 'var(--space-lg)' }}>
                      <div className="row row-between">
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{r.label}</span>
                        <ScorePill score={r.score} />
                      </div>
                      {exp === `${key}-${i}` && <p className="caption" style={{ marginTop: 8 }}>{r.reasoning}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nextSteps?.news_items && nextSteps.news_items.length > 0 && (
        <div className="section-block">
          <div className="section-title">Recent Signals</div>
          <div className="stack stack-sm">
            {nextSteps.news_items.slice(0, 5).map((n, i) => (
              <div key={i} className="card card-sm">
                <div className="row row-between" style={{ marginBottom: 6 }}>
                  <span className="heading-sm" style={{ fontSize: 12 }}>{n.headline}</span>
                  <span className="mono caption" style={{ flexShrink: 0, marginLeft: 16 }}>{n.date}</span>
                </div>
                <p className="caption">{n.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ── App Shell ──────────────────────────────────────────

export default function App() {
  const [orgId, setOrgId] = useState('cspd')
  const [section, setSection] = useState<Section>('overview')
  const [profile, setProfile] = useState<OrgProfile | null>(null)
  const [lookalikes, setLookalikes] = useState<OrgLookalikes | null>(null)
  const [landscape, setLandscape] = useState<OrgLandscape | null>(null)
  const [brief, setBrief] = useState<OrgBrief | null>(null)
  const [nextSteps, setNextSteps] = useState<OrgNextSteps | null>(null)
  const [indicators, setIndicators] = useState<OrgIndicators | null>(null)

  const org = ORGS.find(o => o.id === orgId)!

  useEffect(() => {
    setSection('overview')
    Promise.all([
      fetchJson<OrgProfile>(`profiles/${orgId}.json`),
      fetchJson<Record<string, OrgLookalikes>>('companies/lookalikes.json').then(d => d?.[orgId] || null),
      fetchJson<Record<string, OrgLandscape>>('companies/competitive-landscape.json').then(d => d?.[orgId] || null),
      fetchJson<{ company_briefs: Record<string, OrgBrief> }>('companies/cross-analysis.json').then(d => d?.company_briefs?.[orgId] || null),
      fetchJson<Record<string, OrgNextSteps>>('companies/next-steps.json').then(d => d?.[orgId] || null),
      fetchJson<Record<string, OrgIndicators>>('companies/indicators.json').then(d => d?.[orgId] || null),
    ]).then(([p, l, la, b, n, i]) => {
      setProfile(p); setLookalikes(l); setLandscape(la); setBrief(b); setNextSteps(n); setIndicators(i)
    })
  }, [orgId])

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <h1>Prospector</h1>
          <div className="sub">Opportunity Report</div>
        </div>

        <div className="sidebar-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="sidebar-label">Organizations</div>
          {ORGS.map(o => (
            <button key={o.id} onClick={() => setOrgId(o.id)}
              className={`sidebar-item ${orgId === o.id ? 'active' : ''}`}>
              <span>{o.name}</span>
              <span className="badge" style={{ color: ARC_PILL[o.archetype] === 'pill-emerald' ? 'var(--emerald)' : ARC_PILL[o.archetype] === 'pill-blue' ? 'var(--blue)' : 'var(--amber)' }}>
                {o.archetype === 'Operator' ? 'OP' : o.archetype === 'SaaS Vendor' ? 'SV' : 'AD'}
              </span>
            </button>
          ))}
        </div>

        <div className="sidebar-section-nav">
          <div className="sidebar-label">Sections</div>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`sidebar-item ${section === s.id ? 'active' : ''}`}>
              <div className="row gap-sm">
                <span className="section-dot" style={{ background: section === s.id ? s.color : 'transparent' }} />
                <span>{s.label}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main area */}
      <div className="app-main">
        <header className="app-header">
          <div className="row gap-lg">
            <h1 className="heading-xl">{org.full}</h1>
            <span className={`pill ${ARC_PILL[org.archetype]}`}>{org.archetype}</span>
          </div>
          <div className="row gap-sm">
            <span className="section-dot" style={{ background: SECTIONS.find(s => s.id === section)?.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {SECTIONS.find(s => s.id === section)?.label}
            </span>
          </div>
        </header>

        <main className="app-content">
          <div className="content-max">
            <AnimatePresence mode="wait">
              <motion.div key={`${orgId}-${section}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {section === 'overview' && <OverviewSection profile={profile} brief={brief} />}
                {section === 'lookalikes' && <LookalikesSection data={lookalikes} />}
                {section === 'competitors' && <CompetitorsSection data={landscape} />}
                {section === 'pain-points' && <PainPointsSection brief={brief} />}
                {section === 'signals' && <SignalsSection nextSteps={nextSteps} indicators={indicators} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
