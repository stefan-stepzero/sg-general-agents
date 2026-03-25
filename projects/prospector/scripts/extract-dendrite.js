/**
 * Extracts scored pain points from dendrite tree.json files
 * and produces report-data.json for each archetype.
 *
 * Usage: node extract-dendrite.js
 * Output: ../site/public/data/archetypes/{id}/report-data.json
 */

const fs = require('fs')
const path = require('path')

const DENDRITE_BASE = 'P:/Projects2/sg-dendrite/trees'
const OUT_BASE = path.join(__dirname, '..', 'site', 'public', 'data', 'archetypes')

const ARCHETYPES = [
  {
    id: 'edu-operator',
    treePath: path.join(DENDRITE_BASE, 'edu-operator-processes', 'tree.json'),
    label: 'Multi-site Education Operator',
    description: 'Runs schools/campuses directly, 500+ staff, tuition/government funded',
    examples: ['CSPD', 'PHINMA', 'iPeople', 'Rising', 'School for Life'],
  },
  {
    id: 'saas-vendor',
    treePath: path.join(DENDRITE_BASE, 'edu-saas-vendor', 'tree.json'),
    label: 'Education SaaS Vendor',
    description: 'Sells software to education operators — SIS, LMS, assessment platforms',
    examples: ['Kinetic'],
  },
  {
    id: 'advisory',
    treePath: path.join(DENDRITE_BASE, 'upstream-advisory', 'tree.json'),
    label: 'Upstream Advisory / Convening',
    description: 'Advises, funds, or convenes education operators — foundations, networks, consultancies',
    examples: ['Acasus', 'WISE'],
  },
]

// Canonical flag keys (for normalizing long-text flags to short keys)
const FLAG_CANON = {
  pain_salience: [
    { key: 'revenue-loss', pattern: /revenue loss|churn|failed deals|lost revenue|cost.*billable/i },
    { key: 'cross-functional-friction', pattern: /friction.*beyond|teams beyond|cross-function|beyond the owning/i },
    { key: 'felt-weekly', pattern: /weekly|felt weekly|every sprint|daily|frequent/i },
    { key: 'board-visible', pattern: /board report|investor|due diligence|board.*metric|capacity planning/i },
  ],
  adoption_likelihood: [
    { key: 'structured-data-inputs', pattern: /structured|digital|data inputs/i },
    { key: 'augments-workflow', pattern: /augment|existing workflow|does not replace/i },
    { key: 'no-regulatory-barrier', pattern: /no regulatory|no.*barrier.*student|no.*barrier.*minor/i },
    { key: 'no-adequate-solution', pattern: /no adequate|greenfield|nothing.*exists/i },
  ],
  build_complexity_inv: [
    { key: 'single-system', pattern: /single system|no integration|single workflow/i },
    { key: 'standard-llm-pattern', pattern: /standard llm|standard.*pattern|not custom model/i },
    { key: 'fast-feedback', pattern: /< 2 weeks|fast feedback|demonstrable.*quick|demonstrable.*days|demonstrable.*week/i },
    { key: 'no-change-mgmt', pattern: /no change management|beyond the direct user/i },
  ],
}

function normalizeFlags(dimension, flags) {
  if (!flags || !Array.isArray(flags)) return []
  // If already short keys, return as-is
  if (flags.every(f => f.length < 40 && !f.includes(' — '))) return flags
  // Map long text to canonical keys
  const canon = FLAG_CANON[dimension] || []
  const result = []
  for (const flag of flags) {
    let matched = false
    for (const c of canon) {
      if (c.pattern.test(flag)) {
        if (!result.includes(c.key)) result.push(c.key)
        matched = true
        break
      }
    }
    if (!matched) result.push(flag) // keep original if no match
  }
  return result
}

function normalizeComposite(pain, adoption, build) {
  return Math.round((pain * adoption * build) / 1.25)
}

function extractTerminals(node, depth, areaId) {
  const results = []
  const isTerminal = node.status === 'terminal' || !node.children || node.children.length === 0

  if (isTerminal && node.scoring) {
    const s = node.scoring
    const pain = s.pain_salience?.score || 1
    const adoption = s.adoption_likelihood?.score || 1
    const build = s.build_complexity_inv?.score || 1
    const composite = normalizeComposite(pain, adoption, build)

    results.push({
      area: areaId,
      id: node.id,
      label: node.label,
      description: node.description || '',
      market: {
        pain,
        adoption,
        build,
        composite,
        flags: {
          pain_salience: normalizeFlags('pain_salience', s.pain_salience?.flags),
          adoption_likelihood: normalizeFlags('adoption_likelihood', s.adoption_likelihood?.flags),
          build_complexity_inv: normalizeFlags('build_complexity_inv', s.build_complexity_inv?.flags),
        },
      },
      rationale: s.rationale || '',
      // Placeholders for AI capability matching (Layer 2)
      matchCount: 0,
      maxSalience: pain,
      topScore: composite,
      matches: [],
    })
    return results
  }

  if (node.children) {
    for (const child of node.children) {
      const childArea = depth === 0 ? child.id : areaId
      results.push(...extractTerminals(child, depth + 1, childArea))
    }
  }
  return results
}

// Process each archetype
for (const arch of ARCHETYPES) {
  console.log(`\nProcessing ${arch.id}...`)

  if (!fs.existsSync(arch.treePath)) {
    console.log(`  SKIP: ${arch.treePath} not found`)
    continue
  }

  const tree = JSON.parse(fs.readFileSync(arch.treePath, 'utf8'))
  const painPoints = extractTerminals(tree, 0, '')

  // Build area summaries
  const areaMap = {}
  for (const pp of painPoints) {
    if (!areaMap[pp.area]) {
      areaMap[pp.area] = { pps: [], label: '' }
    }
    areaMap[pp.area].pps.push(pp)
  }

  // Get area labels from tree children
  for (const child of (tree.children || [])) {
    if (areaMap[child.id]) {
      areaMap[child.id].label = child.label
    }
  }

  const areas = Object.entries(areaMap).map(([id, data]) => {
    const pps = data.pps
    const avgSalience = Math.round((pps.reduce((a, p) => a + p.market.pain, 0) / pps.length) * 10) / 10
    const avgTopScore = Math.round((pps.reduce((a, p) => a + p.topScore, 0) / pps.length) * 10) / 10
    return {
      id,
      label: data.label || id,
      ppCount: pps.length,
      totalMatches: 0, // No AI matches yet
      avgSalience,
      avgTopScore,
    }
  }).sort((a, b) => b.avgSalience - a.avgSalience || b.avgTopScore - a.avgTopScore)

  // Global summary
  const allComposites = painPoints.map(p => p.topScore)
  const output = {
    archetype: {
      id: arch.id,
      label: arch.label,
      description: arch.description,
      examples: arch.examples,
    },
    scoring: {
      formula: '(pain_salience × adoption_likelihood × build_complexity_inv) / 1.25',
      type: 'binary-checklist',
      dimensions: {
        pain_salience: {
          min: 1, max: 5,
          flags: [
            'Directly causes revenue loss, churn, or failed deals',
            'Creates friction for teams beyond the owning function',
            'Felt weekly or more (not quarterly/annual)',
            'Would surface in a board report or investor due diligence',
          ],
        },
        adoption_likelihood: {
          min: 1, max: 5,
          flags: [
            'Data inputs are structured/digital (not tacit knowledge)',
            'Augments existing workflow (doesn\'t require behavior change)',
            'No regulatory barrier specific to student/minor data',
            'No adequate solution exists today (greenfield)',
          ],
        },
        build_complexity_inv: {
          min: 1, max: 5,
          flags: [
            'Single system / no integration required',
            'Standard LLM/ML pattern (not custom model)',
            'Value demonstrable in < 2 weeks (fast feedback loop)',
            'No change management beyond the direct user',
          ],
        },
      },
    },
    generated: new Date().toISOString(),
    summary: {
      totalPainPoints: painPoints.length,
      totalMatches: 0,
      avgMatchesPerPP: 0,
      avgScore: Math.round((allComposites.reduce((a, b) => a + b, 0) / allComposites.length) * 10) / 10,
      highScoreOpps: painPoints.filter(p => p.topScore >= 60).length,
      highSaliencePains: painPoints.filter(p => p.market.pain >= 4).length,
      scoreDistribution: {
        '0-20': allComposites.filter(s => s < 20).length,
        '20-40': allComposites.filter(s => s >= 20 && s < 40).length,
        '40-60': allComposites.filter(s => s >= 40 && s < 60).length,
        '60-80': allComposites.filter(s => s >= 60 && s < 80).length,
        '80+': allComposites.filter(s => s >= 80).length,
      },
    },
    areas,
    painPoints,
    capabilities: {},
  }

  // Write output
  const outDir = path.join(OUT_BASE, arch.id)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'report-data.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2))

  console.log(`  ${painPoints.length} pain points, ${areas.length} areas`)
  console.log(`  avg composite: ${output.summary.avgScore}, high-salience: ${output.summary.highSaliencePains}`)
  console.log(`  score dist: ${JSON.stringify(output.summary.scoreDistribution)}`)
  console.log(`  → ${outPath}`)
}

console.log('\nDone.')
