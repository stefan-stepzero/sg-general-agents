/**
 * Aggregates all v3 capability matching results into a single report-data.json
 * for consumption by the D3 interactive browser.
 *
 * Usage: node aggregate-results.js
 * Output: ../outputs/report-data.json
 */

const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'outputs', 'v3-capability-fit-scored');
const taxPath = path.join(__dirname, '..', 'taxonomies', 'edu-operator-processes.json');
const taxonomy = JSON.parse(fs.readFileSync(taxPath, 'utf8'));

// Build area metadata from taxonomy
const areaMeta = {};
taxonomy.children.forEach(c => {
  areaMeta[c.id] = { label: c.label, description: c.description };
});

const areas = fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory());

const output = {
  archetype: {
    id: 'multi-site-edu-operator',
    label: 'Multi-site Education Operator',
    description: 'Runs schools/campuses directly, 500+ staff, tuition/government funded',
    examples: ['CSPD', 'PHINMA', 'iPeople', 'Rising', 'School for Life']
  },
  scoring: {
    formula: '(pain_salience × adoption_likelihood × build_complexity) / 1.25',
    dimensions: {
      pain_salience: { min: 1, max: 5, description: '1=back-office annoyance, 5=CEO/board discusses it' },
      adoption_likelihood: { min: 1, max: 5, description: '1=high barriers or incumbents solve it, 5=low risk, nothing adequate exists' },
      build_complexity: { min: 1, max: 5, description: '1=deep integrations, 5=API wrapper' }
    }
  },
  generated: new Date().toISOString(),
  summary: {},
  areas: [],
  painPoints: [],
  capabilities: {}
};

// Collect everything
for (const area of areas) {
  const files = fs.readdirSync(path.join(base, area)).filter(f => f.endsWith('.json'));
  const areaPPs = [];

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(base, area, f), 'utf8'));
    const matches = (data.matches || []).sort((a, b) => b.composite_score - a.composite_score);

    const maxSalience = matches.length ? Math.max(...matches.map(m => m.pain_salience)) : 0;
    const topScore = matches.length ? matches[0].composite_score : 0;

    const pp = {
      area,
      id: data.pain_point_id,
      label: data.pain_point_label,
      matchCount: matches.length,
      maxSalience,
      topScore,
      matches: matches.map(m => ({
        capId: m.capability_id,
        capLabel: m.capability_label,
        score: m.composite_score,
        pain: m.pain_salience,
        adoption: m.adoption_likelihood,
        build: m.build_complexity,
        rationale: m.match_rationale,
        sketch: m.opportunity_sketch
      }))
    };

    areaPPs.push(pp);
    output.painPoints.push(pp);

    // Track capability stats
    for (const m of matches) {
      if (!output.capabilities[m.capability_id]) {
        output.capabilities[m.capability_id] = { label: m.capability_label, count: 0, scores: [], avgScore: 0 };
      }
      output.capabilities[m.capability_id].count++;
      output.capabilities[m.capability_id].scores.push(m.composite_score);
    }
  }

  // Area summary
  const areaAvgSalience = areaPPs.reduce((a, p) => a + p.maxSalience, 0) / areaPPs.length;
  const areaAvgTopScore = areaPPs.reduce((a, p) => a + p.topScore, 0) / areaPPs.length;
  const areaTotalMatches = areaPPs.reduce((a, p) => a + p.matchCount, 0);

  output.areas.push({
    id: area,
    label: (areaMeta[area] || {}).label || area,
    ppCount: areaPPs.length,
    totalMatches: areaTotalMatches,
    avgSalience: Math.round(areaAvgSalience * 10) / 10,
    avgTopScore: Math.round(areaAvgTopScore * 10) / 10
  });
}

// Finalize capability stats
for (const [id, c] of Object.entries(output.capabilities)) {
  c.avgScore = Math.round((c.scores.reduce((a, b) => a + b, 0) / c.scores.length) * 10) / 10;
  c.maxScore = Math.max(...c.scores);
  delete c.scores; // Don't need raw scores in output
}

// Sort areas by avg salience desc
output.areas.sort((a, b) => b.avgSalience - a.avgSalience || b.avgTopScore - a.avgTopScore);

// Global summary
const allScores = output.painPoints.flatMap(pp => pp.matches.map(m => m.score));
output.summary = {
  totalPainPoints: output.painPoints.length,
  totalMatches: allScores.length,
  avgMatchesPerPP: Math.round((allScores.length / output.painPoints.length) * 10) / 10,
  avgScore: Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10,
  highScoreOpps: output.painPoints.filter(p => p.topScore >= 60).length,
  highSaliencePains: output.painPoints.filter(p => p.maxSalience >= 4).length,
  scoreDistribution: {
    '0-20': allScores.filter(s => s < 20).length,
    '20-40': allScores.filter(s => s >= 20 && s < 40).length,
    '40-60': allScores.filter(s => s >= 40 && s < 60).length,
    '60-80': allScores.filter(s => s >= 60 && s < 80).length,
    '80+': allScores.filter(s => s >= 80).length
  }
};

const outPath = path.join(__dirname, '..', 'outputs', 'report-data.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Written ${outPath}`);
console.log(`${output.summary.totalPainPoints} pain points, ${output.summary.totalMatches} matches, ${Object.keys(output.capabilities).length} capabilities`);
