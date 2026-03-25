export interface ArchetypeInfo {
  id: string
  label: string
  description: string
  examples: string[]
}

export interface AreaSummary {
  id: string
  label: string
  ppCount: number
  totalMatches: number
  avgSalience: number
  avgTopScore: number
}

export interface Match {
  capId: string
  capLabel: string
  score: number
  pain: number
  adoption: number
  build: number
  rationale: string
  sketch: string
}

// Binary checklist flags for the market scoring layer
export interface MarketFlags {
  pain_salience: {
    revenue_loss: boolean
    cross_functional: boolean
    weekly_frequency: boolean
    board_visible: boolean
  }
  adoption_likelihood: {
    structured_data: boolean
    augments_workflow: boolean
    no_regulatory_barrier: boolean
    greenfield: boolean
  }
  build_complexity: {
    single_system: boolean
    standard_pattern: boolean
    fast_feedback: boolean
    no_change_mgmt: boolean
  }
}

export interface MarketScore {
  pain: number      // 1-5 (0 flags + 1 through 4 flags + 1)
  adoption: number  // 1-5
  build: number     // 1-5
  composite: number // (pain * adoption * build) / 1.25, 0-100
  flags?: MarketFlags
}

export interface PainPoint {
  area: string
  id: string
  label: string
  description?: string
  rationale?: string
  matchCount: number
  maxSalience: number
  topScore: number
  matches: Match[]
  // Layer 1: standalone market score (optional until rescoring lands)
  market?: MarketScore
}

export interface CapabilityStat {
  label: string
  count: number
  avgScore: number
  maxScore: number
}

export interface ReportData {
  archetype: ArchetypeInfo
  scoring: {
    formula: string
    dimensions: Record<string, { min: number; max: number; description: string }>
  }
  generated: string
  summary: {
    totalPainPoints: number
    totalMatches: number
    avgMatchesPerPP: number
    avgScore: number
    highScoreOpps: number
    highSaliencePains: number
    scoreDistribution: Record<string, number>
  }
  areas: AreaSummary[]
  painPoints: PainPoint[]
  capabilities: Record<string, CapabilityStat>
}

export interface Archetype {
  id: string
  label: string
  shortLabel: string
  description: string
  status: 'ready' | 'pending'
}

export const ARCHETYPES: Archetype[] = [
  {
    id: 'edu-operator',
    label: 'Multi-site Education Operator',
    shortLabel: 'Operator',
    description: 'Runs schools/campuses directly, 500+ staff, tuition/government funded',
    status: 'ready',
  },
  {
    id: 'saas-vendor',
    label: 'Education SaaS Vendor',
    shortLabel: 'SaaS Vendor',
    description: 'Sells software to education operators — SIS, LMS, assessment platforms',
    status: 'ready',
  },
  {
    id: 'advisory',
    label: 'Upstream Advisory / Convening',
    shortLabel: 'Advisory',
    description: 'Advises, funds, or convenes education operators — foundations, networks, consultancies',
    status: 'ready',
  },
]

export function scoreColor(s: number): string {
  if (s >= 60) return '#34d399'
  if (s >= 40) return '#f59e0b'
  if (s >= 20) return '#fb923c'
  return '#6b7194'
}

export function scoreBand(s: number): string {
  if (s >= 80) return 'Exceptional Fit'
  if (s >= 60) return 'Strong Fit'
  if (s >= 40) return 'Moderate Fit'
  if (s >= 20) return 'Weak Fit'
  return 'Poor Fit'
}

export function salienceLabel(s: number): string {
  if (s >= 5) return 'Board-level'
  if (s >= 4) return 'Executive'
  if (s >= 3) return 'Director'
  if (s >= 2) return 'Manager'
  return 'Back-office'
}

export function buildLabel(b: number): string {
  if (b >= 5) return 'API wrapper'
  if (b >= 4) return 'Straightforward'
  if (b >= 3) return 'Moderate'
  if (b >= 2) return 'Complex'
  return 'Deep integrations'
}

export function adoptionLabel(a: number): string {
  if (a >= 5) return 'Wide open'
  if (a >= 4) return 'Low barriers'
  if (a >= 3) return 'Some friction'
  if (a >= 2) return 'Significant barriers'
  return 'Incumbents dominate'
}

export function quadrant(pain: number, score: number): string {
  if (pain >= 4 && score >= 50) return 'Act Now'
  if (pain >= 4 && score < 50) return 'Strategic Bet'
  if (pain < 4 && score >= 50) return 'Quick Win'
  return 'Deprioritize'
}
