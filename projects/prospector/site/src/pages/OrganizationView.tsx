import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SlideDeck, { type Slide } from '../components/SlideDeck'

interface Dimension {
  value: string
  evidence: string
  confidence: string
  note?: string
}

interface DimensionGroup {
  [key: string]: Dimension | string
}

interface LeadershipMember {
  name: string
  title: string
  linkedin?: string
}

interface Profile {
  entity: string
  profile_date: string
  profile_last_enriched?: string
  known_contact?: { name: string; role: string }
  website?: string
  hq_address?: string
  phone?: string
  email?: string
  social?: Record<string, string>
  leadership_team?: LeadershipMember[]
  executive_summary?: string
  key_metrics?: { label: string; value: string; context?: string; source?: string }[]
  dimensions?: Record<string, DimensionGroup>
  gaps?: string[]
  data_quality_score?: {
    overall: number
    dimensions: Record<string, number>
  }
}

interface ScorecardMetric {
  label: string
  value: string
  target: string
  status: 'strong' | 'on-track' | 'watch' | 'gap' | 'at-risk'
  note: string
}

interface ScorecardCategory {
  id: string
  label: string
  icon: string
  metrics: ScorecardMetric[]
}

interface Scorecard {
  title: string
  subtitle: string
  as_of: string
  categories: ScorecardCategory[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  strong: { label: 'Strong', color: 'var(--green)', bg: 'rgba(52,211,153,0.12)' },
  'on-track': { label: 'On Track', color: 'var(--accent)', bg: 'rgba(96,165,250,0.12)' },
  watch: { label: 'Watch', color: 'var(--amber)', bg: 'rgba(245,158,11,0.12)' },
  gap: { label: 'Gap', color: 'var(--text-muted)', bg: 'var(--surface3)' },
  'at-risk': { label: 'At Risk', color: 'var(--red)', bg: 'rgba(239,68,68,0.12)' },
}

const ORGS = [
  { id: 'acasus', name: 'Acasus', archetype: 'Advisory' },
  { id: 'cspd', name: 'Catholic Schools Parramatta Diocese', archetype: 'Operator' },
  { id: 'ipeople', name: 'iPeople Inc', archetype: 'Operator' },
  { id: 'kinetic', name: 'Kinetic Software', archetype: 'SaaS Vendor' },
  { id: 'phinma', name: 'PHINMA Education', archetype: 'Operator' },
  { id: 'rising', name: 'Rising Academies', archetype: 'Operator' },
  { id: 'school-for-life', name: 'School for Life Foundation', archetype: 'Operator' },
  { id: 'wise', name: 'WISE', archetype: 'Advisory' },
]

const DIMENSION_LABELS: Record<string, string> = {
  industry_vertical: 'Industry & Vertical',
  business_model: 'Business Model',
  scale_resources: 'Scale & Resources',
  growth_phase: 'Growth Phase',
  market_position: 'Market Position',
  org_structure: 'Organization Structure',
  tech_maturity: 'Technology Maturity',
  operating_environment: 'Operating Environment',
  culture_brand: 'Culture & Brand',
  // Extended keys from CSPD pipeline
  scale: 'Scale',
  school_type_mix: 'School Type Mix',
  financial: 'Financial',
  student_demographics: 'Student Demographics',
  workforce: 'Workforce',
  technology: 'Technology',
  strategic_initiatives: 'Strategic Initiatives',
  compliance_and_governance: 'Compliance & Governance',
  catholic_mission: 'Catholic Mission',
  enrolment_trends: 'Enrolment Trends',
}

const FIELD_LABELS: Record<string, string> = {
  primary_sector: 'Primary Sector',
  vertical_niche: 'Vertical Niche',
  value_chain_position: 'Value Chain Position',
  industry_maturity: 'Industry Maturity',
  revenue_model: 'Revenue Model',
  delivery_model: 'Delivery Model',
  cost_structure: 'Cost Structure',
  moat_and_network_effects: 'Moat & Network Effects',
  key_operational_dependencies: 'Key Dependencies',
  headcount_band: 'Headcount',
  revenue_band: 'Revenue',
  capitalization: 'Capitalization',
  asset_intensity: 'Asset Intensity',
  financial_health: 'Financial Health',
  company_age: 'Company Age',
  customer_base_scale: 'Customer Base',
  target_customer_segment: 'Target Customer',
  competitive_stance: 'Competitive Stance',
  gtm_motion: 'GTM Motion',
  customer_concentration: 'Customer Concentration',
  pricing_position: 'Pricing Position',
  leadership_model: 'Leadership Model',
  org_shape: 'Org Shape',
  workforce_model: 'Workforce Model',
  talent_profile: 'Talent Profile',
  stack_generation: 'Tech Stack',
  engineering_practices: 'Engineering Practices',
  data_infrastructure: 'Data Infrastructure',
  security_posture: 'Security Posture',
  regulatory_burden: 'Regulatory Burden',
  geographic_scope: 'Geographic Scope',
  macro_sensitivity: 'Macro Sensitivity',
  governance_obligations: 'Governance',
  innovation_posture: 'Innovation Posture',
  brand_positioning: 'Brand Positioning',
  public_values: 'Public Values',
  employer_brand: 'Employer Brand',
}

function dqLabel(score: number): { text: string; color: string } {
  if (score >= 0.7) return { text: 'data: good', color: 'var(--text-muted)' }
  if (score >= 0.5) return { text: 'data: partial', color: 'var(--amber)' }
  return { text: 'data: poor', color: 'var(--red)' }
}

function confidenceColor(c: string): string {
  if (c.includes('high')) return 'var(--green)'
  if (c.includes('medium')) return 'var(--amber)'
  return 'var(--red)'
}


type OrgTab = 'summary' | 'profile' | 'scorecard' | 'lookalikes' | 'competitors' | 'pain-points' | 'market-solutions' | 'ai-opportunities' | 'signals'

// Market Solutions types
interface PeerSolution {
  org_name: string
  relationship: string // 'lookalike' | 'competitor'
  pain_addressed: string
  solution: string
  detail: string
  outcome: string // what happened — 'successful' | 'mixed' | 'unknown' | 'failed'
  source: string
  implication?: string // what this means for the target org — how we could help
}
interface MarketSolutions {
  name: string
  solutions: PeerSolution[]
  patterns: { label: string; detail: string; count: number }[]
  gaps: string[] // pains nobody has addressed
}

// Lookalike types
interface LookalikeEntry { name: string; hq: string; detail: string }
interface LookalikePainPoint { pain: string; prevalence: string; detail: string }
interface CompanyLookalikes {
  name: string; sub_archetype: string; sub_archetype_detail: string
  defining_traits: string[]; lookalikes: LookalikeEntry[]; common_pain_points: LookalikePainPoint[]
}

// Competitor types
interface CompetitorEntry { name: string; positioning: string; differentiation: string; relationship: string }
interface AdvDisadv { label: string; detail: string }
interface Metric { label: string; value: string; context: string }
interface CompanyLandscape {
  name: string; market: string; market_size: string; position: string; position_detail: string
  advantages: AdvDisadv[]; disadvantages: AdvDisadv[]; competitors: CompetitorEntry[]; metrics: Metric[]
}

// Pain points / AI types (v2 legacy)
interface TopCapability { capId: string; label: string; catLabel: string; fit: number; specificity: string; reasoning: string }
interface CompanyBrief {
  name: string; problemCount: number
  hotSubCategories: { subId: string; label: string; domLabel: string; score: number; topCapabilities: TopCapability[] }[]
  topProblems: { label: string; score: number; domain: string }[]
}

// Pain points v3
interface PainPointV3 {
  id: string
  title: string
  severity: 'critical' | 'significant' | 'moderate' | 'low'
  evidence: string
  unknowns: string
  sources: string[]
}
interface PainDomain {
  domain: string
  pain_points: PainPointV3[]
}
interface CompanyPainPoints {
  name: string
  domains: PainDomain[]
}
interface ProductIdea {
  name: string; one_liner: string; problem: string; ai_technique: string
  how_it_works: string; why_now: string; buyer: string; user: string; moat: string
  build_complexity: string; market_score: number; build_score: number; total_score: number; tier: string
}

// Opportunity types (v3)
interface OpportunityCapability {
  category: string    // top-level capability (e.g. "Generation")
  capability: string  // sub-capability (e.g. "Text Generation")
  application: string // one-line description of how it applies to this opportunity
}

interface Opportunity {
  id: string; title: string; pain_point: string; market_evidence: string
  opportunity: string; why_now: string
  who_cares: { buyer: string; user: string }
  confidence: 'high' | 'medium' | 'low'
  confidence_reasoning: string; sources: string[]
  ai_capabilities?: OpportunityCapability[]
}
interface CompanyOpportunities { name: string; opportunities: Opportunity[] }

// Signals types
interface Indicator { category: string; indicator: string; value: string; signal: 'positive' | 'negative' | 'neutral' | 'watch'; detail: string }
interface Risk { id: string; label: string; score: number; level: string; reasoning: string; domain: string; sub: string }
interface CompanyNextSteps {
  name: string; summary: string; tech_maturity: string
  external_risks: Risk[]; internal_risks: Risk[]
  news_items: { headline: string; date: string; summary: string }[]
  economic: { industry: string; financial: string }
}
interface CompanyIndicators { name: string; external_indicators: Indicator[]; internal_indicators: Indicator[] }

export default function OrganizationView() {
  const { orgId } = useParams<{ orgId: string }>()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [scorecard, setScorecard] = useState<Scorecard | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<OrgTab>('summary')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [expandedDims, setExpandedDims] = useState<Set<string>>(new Set())


  // Additional data (loaded lazily)
  const [lookalikes, setLookalikes] = useState<CompanyLookalikes | null>(null)
  const [landscape, setLandscape] = useState<CompanyLandscape | null>(null)
  const [brief, setBrief] = useState<CompanyBrief | null>(null)
  const [productIdeas, setProductIdeas] = useState<ProductIdea[]>([])
  const [nextSteps, setNextSteps] = useState<CompanyNextSteps | null>(null)
  const [indicators, setIndicators] = useState<CompanyIndicators | null>(null)
  const [marketSolutions, setMarketSolutions] = useState<MarketSolutions | null>(null)
  const [opportunities, setOpportunities] = useState<CompanyOpportunities | null>(null)
  const [painPointsV3, setPainPointsV3] = useState<CompanyPainPoints | null>(null)
  const [pitchData, setPitchData] = useState<{ situation: string; investments: string[]; peers: { name: string; detail: string }[]; pains: { title: string; loss: string }[]; recommendations: { title: string; who: string; detail: string }[]; capabilities_summary?: { category: string; count: number; examples: string[] }[]; timing: string[]; starters: string[] } | null>(null)

  const org = ORGS.find(o => o.id === orgId)

  useEffect(() => {
    setLoading(true)
    setTab('summary')
    setExpanded(null)
    setExpandedDims(new Set())
    setScorecard(null)

    // Load all data in parallel
    const id = orgId!
    Promise.all([
      fetch(`/data/profiles/${id}.json`).then(r => r.json()).catch(() => null),
      fetch(`/data/profiles/${id}-scorecard.json`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/companies/lookalikes.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/competitive-landscape.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/cross-analysis.json').then(r => r.json()).then(d => d.company_briefs?.[id] || null).catch(() => null),
      fetch('/data/companies/product-ideas.json').then(r => r.json()).catch(() => ({ ideas: [] })),
      fetch('/data/companies/next-steps.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/indicators.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/market-solutions.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/opportunities.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/pain-points-v3.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
      fetch('/data/companies/pitch-data.json').then(r => r.json()).then(d => d[id] || null).catch(() => null),
    ]).then(([prof, sc, look, land, br, ideas, ns, ind, ms, opps, ppv3, pitch]) => {
      setProfile(prof)
      setScorecard(sc)
      setLookalikes(look)
      setLandscape(land)
      setBrief(br)
      const companyName = prof?.entity || ''
      setProductIdeas((ideas?.ideas || []).filter((i: ProductIdea) =>
        i.problem.toLowerCase().includes(companyName.toLowerCase())
      ).sort((a: ProductIdea, b: ProductIdea) => b.total_score - a.total_score))
      setNextSteps(ns)
      setIndicators(ind)
      setMarketSolutions(ms)
      setOpportunities(opps)
      setPainPointsV3(ppv3)
      setPitchData(pitch)
      setLoading(false)
    })
  }, [orgId])

  if (!org) return <div className="placeholder-card"><h3>Organization not found</h3></div>
  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading profile...</div>
  if (!profile) return <div className="placeholder-card"><h3>Profile data not available</h3></div>

  const toggleDim = (key: string) => {
    setExpandedDims(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const dq = profile.data_quality_score

  return (
    <>
      <div className="breadcrumb">
        <Link to="/">Prospector</Link>
        <span className="sep">/</span>
        <Link to="/pain-points">Organizations</Link>
        <span className="sep">/</span>
        <span>{profile.entity}</span>
      </div>

      {/* Hero */}
      <div className="page-hero">
        <h1>{profile.entity}</h1>
        <div className="subtitle" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
            padding: '2px 10px', borderRadius: 4, background: 'var(--surface3)',
            color: org.archetype === 'Operator' ? 'var(--green)' : org.archetype === 'SaaS Vendor' ? 'var(--accent)' : 'var(--amber)',
          }}>
            {org.archetype}
          </span>
          {profile.website && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile.website}</span>}
          {profile.hq_address && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{profile.hq_address}</span>}
        </div>
        <div className="meta">
          Profiled {profile.profile_date}
          {profile.profile_last_enriched && ` · Enriched ${profile.profile_last_enriched}`}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 6, padding: 2, marginBottom: 24, width: 'fit-content' }}>
        {([
          ['summary', 'Summary'],
          ['profile', 'Profile'],
          ['scorecard', 'Scorecard'],
          ['signals', 'Signals'],
          ['lookalikes', 'Lookalikes'],
          ['competitors', 'Competitors'],
          ['pain-points', 'Pain Points'],
          ['market-solutions', 'Market Solutions'],
          ['ai-opportunities', 'Opportunities'],
        ] as [OrgTab, string][]).map(([t, label]) => (
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

      {/* ===== SUMMARY TAB ===== */}
      {tab === 'summary' && profile && (() => {
        const pd = pitchData
        const slides: Slide[] = [
          // Slide 1: The Situation
          {
            id: 'situation',
            label: 'The Situation',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Executive Summary
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 20 }}>
                  {profile.entity}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 580 }}>
                  {pd?.situation || profile.executive_summary}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                  {((landscape?.metrics?.length ? landscape.metrics : profile.key_metrics || []) as { label: string; value: string }[]).slice(0, 4).map((m, i) => (
                    <div key={i} style={{ padding: '10px 16px', background: 'var(--surface2)', borderRadius: 8 }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>{m.value}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
          // Slide 2: What They've Already Invested In
          ...(pd?.investments ? [{
            id: 'investments',
            label: 'Their Investments',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  What They've Already Built
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                  The foundation exists. The proposal is what completes it.
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Every recommendation builds on bets they've already made — not new ideas from outside.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pd.investments.map((inv, i) => (
                    <div key={i} style={{
                      padding: '10px 16px', background: 'var(--surface2)', borderRadius: 6,
                      borderLeft: '3px solid var(--green)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
                    }}>
                      {inv}
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 3: What Peers Are Doing
          ...(pd?.peers ? [{
            id: 'peers',
            label: 'Peer Evidence',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  What Their Peers Are Doing
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pd.peers.map((peer, i) => (
                    <div key={i} style={{
                      padding: '14px 18px', background: 'var(--surface2)', borderRadius: 8,
                      borderLeft: '3px solid var(--accent)',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{peer.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{peer.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 4: What Keeps Them Up at Night
          ...(pd?.pains ? [{
            id: 'pains',
            label: 'Pain Points',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  What Keeps Them Up at Night
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {pd.pains.map((pain, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{pain.title}</div>
                      <div style={{
                        padding: '12px 16px', borderRadius: 6,
                        background: 'rgba(248,113,113,0.06)', borderLeft: '3px solid var(--red)',
                        fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic',
                      }}>
                        {pain.loss}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 5: Where We Come In
          ...(pd?.recommendations ? [{
            id: 'recommendations',
            label: 'Recommendations',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Where We Come In
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pd.recommendations.map((rec, i) => (
                    <div key={i} style={{
                      padding: '16px 20px', background: 'var(--surface2)', borderRadius: 8,
                      borderLeft: '3px solid var(--green)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{rec.title}</span>
                        <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>{rec.who}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{rec.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 5b: AI Capabilities Summary
          ...(pd?.capabilities_summary ? [{
            id: 'capabilities',
            label: 'AI Capabilities',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  AI Capabilities Across Opportunities
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pd.capabilities_summary.map((cat, i) => (
                    <div key={i} style={{
                      padding: '14px 18px', background: 'var(--surface2)', borderRadius: 8,
                      borderLeft: '3px solid var(--accent)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{cat.category}</span>
                        <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>{cat.count} {cat.count === 1 ? 'opportunity' : 'opportunities'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {cat.examples.map((ex, j) => (
                          <span key={j} style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 3,
                            background: 'var(--surface3)', color: 'var(--text-secondary)',
                          }}>
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 6: Why Now
          ...(pd?.timing ? [{
            id: 'timing',
            label: 'Why Now',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Why This Conversation, Why Now
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pd.timing.map((t, i) => (
                    <div key={i} style={{
                      padding: '12px 16px', borderRadius: 6,
                      borderLeft: '3px solid var(--amber)', background: 'var(--surface2)',
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
                    }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
          // Slide 7: Conversation Starters
          ...(pd?.starters ? [{
            id: 'starters',
            label: 'Openers',
            content: (
              <div style={{ minHeight: 380 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                  Conversation Starters
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pd.starters.map((s, i) => (
                    <div key={i} style={{
                      padding: '14px 18px', background: 'var(--surface2)', borderRadius: 8,
                      fontSize: 13, color: 'var(--text)', lineHeight: 1.7, fontStyle: 'italic',
                    }}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ),
          }] as Slide[] : []),
        ]

        return <SlideDeck slides={slides} />
      })()}

      {/* ===== PROFILE TAB ===== */}
      {tab === 'profile' && (<>

      {/* Executive Summary */}
      {profile.executive_summary && (
        <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Executive Summary
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {profile.executive_summary}
          </div>
        </div>
      )}

      {/* Key Metrics from competitive landscape */}
      {landscape && landscape.metrics.length > 0 && (
        <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>
          Estimates — sourced from public data, not verified
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {landscape.metrics.map((m, i) => (
            <div key={i} style={{ padding: '10px 14px', background: 'var(--surface)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.context}</div>
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Quick facts row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {profile.known_contact && (
          <div className="stat-card" style={{ textAlign: 'left', flex: '1 1 200px' }}>
            <div className="stat-label">Key Contact</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{profile.known_contact.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile.known_contact.role}</div>
          </div>
        )}
        {profile.leadership_team && (
          <div className="stat-card" style={{ textAlign: 'left', flex: '1 1 200px' }}>
            <div className="stat-label">Leadership Team</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{profile.leadership_team.length} leaders</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {profile.leadership_team.slice(0, 3).map(l => l.name).join(', ')}
              {profile.leadership_team.length > 3 && ` +${profile.leadership_team.length - 3} more`}
            </div>
          </div>
        )}
        {profile.social && (
          <div className="stat-card" style={{ textAlign: 'left', flex: '1 1 200px' }}>
            <div className="stat-label">Social Channels</div>
            <div style={{ fontSize: 12, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(profile.social).map(([key]) => (
                <span key={key} style={{ color: 'var(--accent)', fontSize: 11 }}>
                  {key.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dimensions */}
      {profile.dimensions && (
        <div className="section">
          <h2 className="section-title">Profile Dimensions</h2>
          <div className="note">Data quality shown per dimension — expand for evidence and confidence.</div>

          {Object.entries(profile.dimensions).map(([dimKey, dimGroup]) => {
            const isExpanded = expandedDims.has(dimKey)
            const label = DIMENSION_LABELS[dimKey] || dimKey.replace(/_/g, ' ')
            const dqKey = dimKey.replace(/_/g, '-')
            const dqScore = dq?.dimensions?.[dqKey]
            const dq_ = dqScore !== undefined ? dqLabel(dqScore) : null

            // Normalize flat dimensions (like growth_phase) into grouped format
            let normalizedGroup = dimGroup as Record<string, Dimension>
            if (typeof dimGroup === 'string' || (dimGroup as Dimension).value !== undefined) {
              normalizedGroup = { [dimKey]: dimGroup as unknown as Dimension }
            }

            const fields = Object.entries(normalizedGroup)
            return (
              <div key={dimKey} style={{ marginBottom: 8 }}>
                <div
                  onClick={() => toggleDim(dimKey)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'var(--surface)',
                    border: '1px solid var(--border-subtle)', borderRadius: isExpanded ? '8px 8px 0 0' : 8,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                    {dq_ && <span style={{ fontSize: 9, fontWeight: 600, color: dq_.color, padding: '1px 6px', borderRadius: 3, background: 'var(--surface3)' }}>{dq_.text}</span>}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fields.length} properties</span>
                </div>
                {isExpanded && (
                  <div style={{
                    border: '1px solid var(--border-subtle)', borderTop: 'none',
                    borderRadius: '0 0 8px 8px', overflow: 'hidden',
                  }}>
                    {fields.map(([fieldKey, field]) => {
                      if (!field || typeof field !== 'object' || !field.value) return null
                      return (
                        <div key={fieldKey} style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: 'var(--surface2)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {FIELD_LABELS[fieldKey] || fieldKey.replace(/_/g, ' ')}
                            </span>
                            {field.confidence && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: confidenceColor(field.confidence), flexShrink: 0, marginLeft: 8 }}>
                                {field.confidence}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
                            {field.value}
                          </div>
                          {field.evidence && (
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                              {field.evidence}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Leadership Team */}
      {profile.leadership_team && profile.leadership_team.length > 0 && (
        <div className="section">
          <h2 className="section-title">Leadership Team</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 8,
          }}>
            {profile.leadership_team.map((leader, i) => (
              <div key={i} style={{
                padding: '12px 14px', background: 'var(--surface)',
                border: '1px solid var(--border-subtle)', borderRadius: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{leader.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{leader.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Research Opportunities */}
      {profile.gaps && profile.gaps.length > 0 && (
        <div className="section">
          <h2 className="section-title">Future Research Opportunities</h2>
          <div className="note">Areas worth investigating further to deepen this profile.</div>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 8, padding: 16,
          }}>
            {profile.gaps.map((gap, i) => (
              <div key={i} style={{
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
                padding: '6px 0', borderBottom: i < profile.gaps!.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                {gap}
              </div>
            ))}
          </div>
        </div>
      )}

      </>)}

      {/* ===== SCORECARD TAB ===== */}
      {tab === 'scorecard' && scorecard && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 600, lineHeight: 1.6 }}>
            Outside-in assessment using the factors this type of organisation typically tracks. Observed values are from public data; benchmarks are sector norms. Not sourced from internal data.
          </p>

          {/* Summary strip */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 32,
            background: 'var(--surface)', borderRadius: 10, overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}>
            {Object.entries(
              scorecard.categories.flatMap(c => c.metrics).reduce((acc, m) => {
                acc[m.status] = (acc[m.status] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([status, count], i, arr) => {
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.gap
              return (
                <div key={status} style={{
                  flex: 1, padding: '16px 0', textAlign: 'center',
                  borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 500, color: cfg.color, lineHeight: 1 }}>
                    {count}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                    {cfg.label}
                  </div>
                </div>
              )
            })}
          </div>

          {scorecard.categories.map(cat => {
            const catStatusCounts = cat.metrics.reduce((acc, m) => {
              acc[m.status] = (acc[m.status] || 0) + 1
              return acc
            }, {} as Record<string, number>)
            const catStatus = catStatusCounts['at-risk'] ? 'at-risk'
              : catStatusCounts['watch'] ? 'watch'
              : catStatusCounts['gap'] && catStatusCounts['gap'] >= 2 ? 'gap'
              : 'on-track'
            const catCfg = STATUS_CONFIG[catStatus]

            return (
              <div key={cat.id} style={{ marginBottom: 28 }}>
                {/* Category header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 8, paddingBottom: 8,
                  borderBottom: `2px solid ${catCfg.color}`,
                }}>
                  <span style={{ fontSize: 15 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>{cat.label}</span>
                </div>

                {/* Metric rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {cat.metrics.map((metric, mi) => {
                    const cfg = STATUS_CONFIG[metric.status] || STATUS_CONFIG.gap
                    return (
                      <div key={mi} style={{
                        display: 'grid', gridTemplateColumns: '6px 1fr 180px 180px 90px',
                        background: 'var(--surface)',
                        borderRadius: 6,
                        overflow: 'hidden',
                        alignItems: 'center',
                      }}>
                        {/* Status bar */}
                        <div style={{ background: cfg.color, alignSelf: 'stretch', borderRadius: '6px 0 0 6px' }} />

                        {/* Content */}
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                            {metric.label}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {metric.note}
                          </div>
                        </div>

                        {/* Observed */}
                        <div style={{ textAlign: 'right', padding: '14px 12px' }}>
                          <div style={{
                            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500,
                            color: 'var(--text)', letterSpacing: '-0.02em', wordBreak: 'break-word',
                          }}>
                            {metric.value}
                          </div>
                          <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                            Observed
                          </div>
                        </div>

                        {/* Benchmark */}
                        <div style={{ textAlign: 'right', padding: '14px 12px', opacity: metric.target && metric.target !== '—' ? 0.6 : 0 }}>
                          <div style={{
                            fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 400,
                            color: 'var(--text-secondary)', letterSpacing: '-0.02em', wordBreak: 'break-word',
                          }}>
                            {metric.target && metric.target !== '—' ? metric.target : ''}
                          </div>
                          <div style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                            {metric.target && metric.target !== '—' ? 'Benchmark' : ''}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div style={{ textAlign: 'center', padding: '14px 12px' }}>
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: '3px 10px',
                            borderRadius: 4, color: cfg.color, background: cfg.bg,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            whiteSpace: 'nowrap',
                          }}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'scorecard' && !scorecard && (
        <div className="placeholder-card"><h3>Scorecard not available</h3><p>No scorecard data for this organization.</p></div>
      )}

      {/* ===== LOOKALIKES TAB ===== */}
      {tab === 'lookalikes' && lookalikes && (
        <div>
          {/* Sub-archetype header */}
          <div style={{
            padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
            borderLeft: '4px solid var(--accent)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Sub-Archetype
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: 'var(--accent-bright)' }}>{lookalikes.sub_archetype}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{lookalikes.sub_archetype_detail}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {lookalikes.defining_traits.map((t, i) => (
                <span key={i} style={{
                  padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                  background: 'var(--surface3)', color: 'var(--text-secondary)',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{
            padding: 14, background: 'var(--surface)', borderRadius: 8, marginBottom: 20,
            fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
            border: '1px solid var(--border-subtle)',
          }}>
            <strong style={{ color: 'var(--text)' }}>Lookalikes are not competitors.</strong>{' '}
            These organizations share a similar operating model, scale, and constraints — they face the same structural problems.
            The value is learning: what pain points have they addressed, what solutions have they adopted, what worked?
          </div>

          {/* Peer organizations */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
              Peer Organizations
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                {lookalikes.lookalikes.length} in this sub-archetype
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {lookalikes.lookalikes.map((la, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: 'grid', gridTemplateColumns: '220px 130px 1fr', gap: 12,
                      padding: '8px 12px', alignItems: 'baseline',
                      background: i % 2 === 0 ? 'var(--surface)' : 'transparent', borderRadius: 4,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{la.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{la.hq}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{la.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
      {tab === 'lookalikes' && !lookalikes && (
        <div className="placeholder-card"><h3>Lookalike data not available</h3><p>Run the lookalike agent to identify peer organizations.</p></div>
      )}

      {/* ===== COMPETITORS TAB ===== */}
      {tab === 'competitors' && landscape && (
        <div>
          {/* Market header */}
          <div style={{
            padding: 16, background: 'var(--surface)', borderRadius: 10, marginBottom: 20,
            borderLeft: '4px solid var(--red)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              Competitive Market
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{landscape.market}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{landscape.market_size}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                background: landscape.position === 'Market leader' ? 'var(--green-dim)' : 'var(--accent-dim)',
                color: landscape.position === 'Market leader' ? 'var(--green)' : 'var(--accent)',
              }}>
                {landscape.position}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{landscape.position_detail}</span>
            </div>
          </div>

          {/* Advantages vs Disadvantages */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}><span style={{ color: 'var(--green)' }}>Advantages</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {landscape.advantages.map((a, i) => (
                  <div key={i}>
                    <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 6, borderLeft: '3px solid var(--green)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>{a.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}><span style={{ color: 'var(--red)' }}>Disadvantages</span></h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {landscape.disadvantages.map((d, i) => (
                  <div key={i}>
                    <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 6, borderLeft: '3px solid var(--red)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>{d.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Competitors grouped by relationship */}
          {(() => {
            const relConfig: Record<string, { label: string; color: string; description: string }> = {
              'direct competitor': { label: 'Direct Competitors', color: 'var(--red)', description: 'Competing for the same students, funding, or market share' },
              'resource competitor': { label: 'Resource Competitors', color: 'var(--amber)', description: 'Competing for the same talent, funding pools, or attention' },
              'structural peer': { label: 'Structural Peers', color: 'var(--accent)', description: 'Similar structure and mission — learn from, not compete with' },
              'adjacent player': { label: 'Adjacent Players', color: 'var(--text-muted)', description: 'Operating in overlapping space but different model' },
            }
            const grouped = landscape.competitors.reduce((acc, c) => {
              if (!acc[c.relationship]) acc[c.relationship] = []
              acc[c.relationship].push(c)
              return acc
            }, {} as Record<string, CompetitorEntry[]>)

            // Sort: direct first, then resource, structural, adjacent
            const order = ['direct competitor', 'resource competitor', 'adjacent player']
            const sortedGroups = order.filter(r => grouped[r])

            return sortedGroups.map(rel => {
              const cfg = relConfig[rel] || { label: rel, color: 'var(--text-muted)', description: '' }
              const comps = grouped[rel]
              return (
                <div key={rel} style={{ marginBottom: 24 }}>
                  <div style={{
                    marginBottom: 8, paddingBottom: 8,
                    borderBottom: `2px solid ${cfg.color}`,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{cfg.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>{cfg.description}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {comps.map((c, i) => (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '6px 1fr',
                        background: 'var(--surface)', borderRadius: 6, overflow: 'hidden',
                      }}>
                        <div style={{ background: cfg.color, borderRadius: '6px 0 0 6px' }} />
                        <div style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                            <span style={{ fontSize: 15, fontWeight: 700 }}>{c.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.positioning}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            {c.differentiation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      )}
      {tab === 'competitors' && !landscape && (
        <div className="placeholder-card"><h3>Competitive landscape not available</h3><p>Run the competitor agent to map the competitive set.</p></div>
      )}

      {/* ===== PAIN POINTS TAB ===== */}
      {tab === 'pain-points' && painPointsV3 && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 600, lineHeight: 1.6 }}>
            Pain points derived from public data, annual reports, and sector analysis — grouped by the process areas this organisation operates in. Each pain point cites its evidence and flags what we don't yet know.
          </p>

          {/* Severity summary */}
          {(() => {
            const counts = painPointsV3.domains.flatMap(d => d.pain_points).reduce((acc, pp) => {
              acc[pp.severity] = (acc[pp.severity] || 0) + 1; return acc
            }, {} as Record<string, number>)
            const sevConfig: Record<string, { color: string; label: string }> = {
              critical: { color: 'var(--red)', label: 'Critical' },
              significant: { color: 'var(--amber)', label: 'Significant' },
              moderate: { color: 'var(--text-secondary)', label: 'Moderate' },
              low: { color: 'var(--text-muted)', label: 'Low' },
            }
            const order = ['critical', 'significant', 'moderate', 'low']
            return (
              <div style={{
                display: 'flex', gap: 0, marginBottom: 28,
                background: 'var(--surface)', borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}>
                {order.filter(s => counts[s]).map((sev, i, arr) => {
                  const cfg = sevConfig[sev]
                  return (
                    <div key={sev} style={{
                      flex: 1, padding: '16px 0', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 500, color: cfg.color, lineHeight: 1 }}>
                        {counts[sev]}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                        {cfg.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {painPointsV3.domains.map(domain => {
            const sevColors: Record<string, string> = {
              critical: 'var(--red)', significant: 'var(--amber)', moderate: 'var(--text-secondary)', low: 'var(--text-muted)',
            }
            // Domain header color based on worst severity
            const worstSev = domain.pain_points.reduce((worst, pp) => {
              const order = ['critical', 'significant', 'moderate', 'low']
              return order.indexOf(pp.severity) < order.indexOf(worst) ? pp.severity : worst
            }, 'low' as string)

            return (
              <div key={domain.domain} style={{ marginBottom: 24 }}>
                <div style={{
                  marginBottom: 8, paddingBottom: 8,
                  borderBottom: `2px solid ${sevColors[worstSev] || 'var(--text-muted)'}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{domain.domain}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>
                    {domain.pain_points.length} pain point{domain.pain_points.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {domain.pain_points.map(pp => {
                    const sevColor = sevColors[pp.severity] || 'var(--text-muted)'
                    return (
                      <div key={pp.id} style={{
                        display: 'grid', gridTemplateColumns: '6px 1fr',
                        background: 'var(--surface)', borderRadius: 6, overflow: 'hidden',
                      }}>
                        <div style={{ background: sevColor, borderRadius: '6px 0 0 6px' }} />
                        <div style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{pp.title}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
                              color: sevColor, textTransform: 'uppercase', letterSpacing: '0.05em',
                              background: pp.severity === 'critical' ? 'var(--red-dim)' : pp.severity === 'significant' ? 'var(--amber-dim)' : 'var(--surface3)',
                            }}>
                              {pp.severity}
                            </span>
                          </div>

                          <div style={{ marginBottom: 8 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Evidence</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{pp.evidence}</div>
                          </div>

                          {pp.unknowns && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>What we don't know</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>{pp.unknowns}</div>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {pp.sources.map((s, si) => (
                              <span key={si} style={{
                                fontSize: 9, padding: '2px 8px', borderRadius: 3,
                                background: 'var(--surface3)', color: 'var(--text-muted)',
                              }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'pain-points' && !painPointsV3 && (
        <div className="placeholder-card"><h3>Pain point data not available</h3><p>Run the data-driven pain point pipeline to identify evidence-backed pain points.</p></div>
      )}

      {/* ===== MARKET SOLUTIONS TAB ===== */}
      {tab === 'market-solutions' && marketSolutions && (
        <div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 600, lineHeight: 1.6 }}>
            What lookalikes and competitors have done to address similar pain points. Validated approaches signal opportunity; unaddressed gaps signal whitespace.
          </p>

          {/* Patterns — what multiple orgs have converged on */}
          {marketSolutions.patterns.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Emerging Patterns</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {marketSolutions.patterns.map((p, i) => (
                  <div key={i} style={{
                    padding: '12px 16px', background: 'var(--surface)', borderRadius: 8,
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: 'var(--accent)' }}>
                        {p.count} orgs
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual solutions */}
          {marketSolutions.solutions.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Peer & Competitor Responses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {marketSolutions.solutions.map((s, i) => {
                  const outcomeColors: Record<string, string> = {
                    successful: 'var(--green)', mixed: 'var(--amber)', failed: 'var(--red)', unknown: 'var(--text-muted)',
                  }
                  return (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '6px 1fr',
                      background: 'var(--surface)', borderRadius: 6, overflow: 'hidden',
                    }}>
                      <div style={{
                        background: s.relationship === 'lookalike' ? 'var(--accent)' : 'var(--amber)',
                        borderRadius: '6px 0 0 6px',
                      }} />
                      <div style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{s.org_name}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                              color: s.relationship === 'lookalike' ? 'var(--accent)' : 'var(--amber)',
                            }}>
                              {s.relationship}
                            </span>
                          </div>
                          <span style={{
                            fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                            color: outcomeColors[s.outcome] || 'var(--text-muted)',
                            background: 'var(--surface3)', textTransform: 'uppercase',
                          }}>
                            {s.outcome}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                          Addressing: <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{s.pain_addressed}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{s.solution}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.detail}</div>
                        {s.implication && (
                          <div style={{
                            fontSize: 11, color: 'var(--green)', lineHeight: 1.6, marginTop: 8,
                            padding: '8px 12px', background: 'rgba(52,211,153,0.06)', borderRadius: 4,
                          }}>
                            {s.implication}
                          </div>
                        )}
                        {s.source && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>Source: {s.source}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Unaddressed gaps */}
          {marketSolutions.gaps.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                Unaddressed Gaps
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
                  pain points no peer or competitor has tackled
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {marketSolutions.gaps.map((g, i) => (
                  <div key={i} style={{
                    padding: '10px 16px', background: 'var(--surface)', borderRadius: 6,
                    borderLeft: '3px solid var(--text-muted)', fontSize: 12, color: 'var(--text-secondary)',
                  }}>
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === 'market-solutions' && !marketSolutions && (
        <div className="placeholder-card">
          <h3>Market solutions data not available</h3>
          <p>Run the market solutions agent to research what peers and competitors have done to address similar pain points.</p>
        </div>
      )}

      {/* ===== OPPORTUNITIES TAB ===== */}
      {tab === 'ai-opportunities' && (
        <div>
          {opportunities && opportunities.opportunities.length > 0 ? (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 600, lineHeight: 1.6 }}>
                Opportunities derived from observed pain points and validated by what peers and competitors have tried. Each links a real problem to a concrete action.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {opportunities.opportunities.map((opp) => {
                  const confColor = opp.confidence === 'high' ? 'var(--green)' : opp.confidence === 'medium' ? 'var(--amber)' : 'var(--text-muted)'
                  return (
                    <div key={opp.id} style={{
                      background: 'var(--surface)', borderRadius: 10,
                      border: '1px solid var(--border-subtle)', overflow: 'hidden',
                    }}>
                      {/* Header */}
                      <div style={{
                        padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{opp.title}</h3>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 4,
                          color: confColor, background: opp.confidence === 'high' ? 'rgba(52,211,153,0.12)' : opp.confidence === 'medium' ? 'rgba(245,158,11,0.12)' : 'var(--surface3)',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {opp.confidence} confidence
                        </span>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '16px 20px' }}>
                        {/* Pain → Evidence → Opportunity flow */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Pain Point</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{opp.pain_point}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Market Evidence</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{opp.market_evidence}</div>
                          </div>
                          <div style={{
                            padding: '12px 16px', borderRadius: 6,
                            background: 'rgba(52,211,153,0.06)', borderLeft: '3px solid var(--green)',
                          }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Opportunity</div>
                            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>{opp.opportunity}</div>
                          </div>
                        </div>

                        {/* Why now */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Why Now</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{opp.why_now}</div>
                        </div>

                        {/* Footer: who cares + confidence + sources */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                          padding: '12px 0', borderTop: '1px solid var(--border-subtle)',
                        }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Buyer</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{opp.who_cares.buyer}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>User</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{opp.who_cares.user}</div>
                          </div>
                        </div>

                        {/* Confidence reasoning */}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8 }}>
                          {opp.confidence_reasoning}
                        </div>

                        {/* Sources */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                          {opp.sources.map((s, si) => (
                            <span key={si} style={{
                              fontSize: 9, padding: '2px 8px', borderRadius: 3,
                              background: 'var(--surface3)', color: 'var(--text-muted)',
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* AI Capabilities */}
                        {opp.ai_capabilities && opp.ai_capabilities.length > 0 && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>AI Capabilities</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              {opp.ai_capabilities.map((cap, ci) => (
                                <div key={ci} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 11 }}>
                                  <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{cap.capability}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>{cap.application}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="placeholder-card"><h3>No opportunities identified yet</h3><p>Run the opportunity pipeline to generate data-driven opportunities from pain points and market evidence.</p></div>
          )}
        </div>
      )}

      {/* ===== SIGNALS TAB ===== */}
      {tab === 'signals' && (
        <div>
          {/* Summary strip */}
          {indicators && (() => {
            const all = [...indicators.external_indicators, ...indicators.internal_indicators]
            const counts = all.reduce((acc, ind) => { acc[ind.signal] = (acc[ind.signal] || 0) + 1; return acc }, {} as Record<string, number>)
            const sigLabels: Record<string, { label: string; color: string }> = {
              positive: { label: 'Tailwind', color: 'var(--green)' },
              negative: { label: 'Headwind', color: 'var(--red)' },
              watch: { label: 'Watch', color: 'var(--amber)' },
              neutral: { label: 'Neutral', color: 'var(--text-muted)' },
            }
            return (
              <div style={{
                display: 'flex', gap: 0, marginBottom: 28,
                background: 'var(--surface)', borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}>
                {Object.entries(counts).map(([signal, count], i, arr) => {
                  const sl = sigLabels[signal] || sigLabels.neutral
                  return (
                    <div key={signal} style={{
                      flex: 1, padding: '16px 0', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 500, color: sl.color, lineHeight: 1 }}>
                        {count}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 6 }}>
                        {sl.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Indicators */}
          {indicators && (() => {
            const sigStyles: Record<string, { color: string; label: string }> = {
              positive: { color: 'var(--green)', label: 'Tailwind' },
              negative: { color: 'var(--red)', label: 'Headwind' },
              watch: { color: 'var(--amber)', label: 'Watch' },
              neutral: { color: 'var(--text-muted)', label: 'Neutral' },
            }
            // Group by category
            const all = [...indicators.external_indicators, ...indicators.internal_indicators]
            const grouped = all.reduce((acc, ind) => {
              if (!acc[ind.category]) acc[ind.category] = []
              acc[ind.category].push(ind)
              return acc
            }, {} as Record<string, Indicator[]>)

            return (
              <div style={{ marginBottom: 28 }}>
                {Object.entries(grouped).map(([category, inds]) => {
                  // Determine category-level signal
                  const hasNeg = inds.some(i => i.signal === 'negative')
                  const hasWatch = inds.some(i => i.signal === 'watch')
                  const catColor = hasNeg ? 'var(--red)' : hasWatch ? 'var(--amber)' : 'var(--green)'

                  return (
                    <div key={category} style={{ marginBottom: 20 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 8, paddingBottom: 8,
                        borderBottom: `2px solid ${catColor}`,
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {inds.map((ind, i) => {
                          const s = sigStyles[ind.signal] || sigStyles.neutral
                          return (
                            <div key={i} style={{
                              display: 'grid', gridTemplateColumns: '6px 1fr 180px 90px',
                              background: 'var(--surface)', borderRadius: 6, overflow: 'hidden',
                              alignItems: 'center',
                            }}>
                              <div style={{ background: s.color, alignSelf: 'stretch', borderRadius: '6px 0 0 6px' }} />
                              <div style={{ padding: '12px 16px' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{ind.indicator}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{ind.detail}</div>
                              </div>
                              <div style={{ textAlign: 'right', padding: '12px' }}>
                                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, color: 'var(--text)', wordBreak: 'break-word' }}>{ind.value}</div>
                              </div>
                              <div style={{ textAlign: 'center', padding: '12px' }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
                                  color: s.color, background: ind.signal === 'positive' ? 'var(--green-dim)' : ind.signal === 'negative' ? 'var(--red-dim)' : ind.signal === 'watch' ? 'var(--amber-dim)' : 'var(--surface3)',
                                  textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                  {s.label}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Risks */}
          {nextSteps && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 8, paddingBottom: 8,
                  borderBottom: '2px solid var(--red)',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>External Risks</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {nextSteps.external_risks.slice(0, 10).map((r, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '6px 1fr 40px',
                      background: 'var(--surface)', borderRadius: 6, overflow: 'hidden', alignItems: 'center',
                    }}>
                      <div style={{
                        background: r.score >= 0.7 ? 'var(--red)' : r.score >= 0.5 ? 'var(--amber)' : 'var(--text-muted)',
                        alignSelf: 'stretch', borderRadius: '6px 0 0 6px',
                      }} />
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.reasoning}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px 8px' }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
                          color: r.score >= 0.7 ? 'var(--red)' : r.score >= 0.5 ? 'var(--amber)' : 'var(--text-muted)',
                        }}>{(r.score * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 8, paddingBottom: 8,
                  borderBottom: '2px solid var(--amber)',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Internal Risks</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {nextSteps.internal_risks.slice(0, 10).map((r, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '6px 1fr 40px',
                      background: 'var(--surface)', borderRadius: 6, overflow: 'hidden', alignItems: 'center',
                    }}>
                      <div style={{
                        background: r.score >= 0.7 ? 'var(--red)' : r.score >= 0.5 ? 'var(--amber)' : 'var(--text-muted)',
                        alignSelf: 'stretch', borderRadius: '6px 0 0 6px',
                      }} />
                      <div style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.reasoning}</div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px 8px' }}>
                        <span style={{
                          fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
                          color: r.score >= 0.7 ? 'var(--red)' : r.score >= 0.5 ? 'var(--amber)' : 'var(--text-muted)',
                        }}>{(r.score * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* News */}
          {nextSteps?.news_items && nextSteps.news_items.length > 0 && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 8, paddingBottom: 8,
                borderBottom: '2px solid var(--accent)',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Recent Signals</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {nextSteps.news_items.map((n, i) => (
                  <div key={i} style={{
                    padding: '12px 16px', background: 'var(--surface)', borderRadius: 6,
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{n.headline}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>{n.date}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{n.summary}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!indicators && !nextSteps && (
            <div className="placeholder-card"><h3>Signal data not available</h3></div>
          )}
        </div>
      )}
    </>
  )
}
