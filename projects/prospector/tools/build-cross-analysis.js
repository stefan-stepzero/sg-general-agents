/**
 * Cross problem heatmap × capability fit to find opportunity intersections.
 * Outputs: outputs/cross-analysis.json
 */
const fs = require('fs');
const path = require('path');

const HM_DIR = path.resolve(__dirname, '../outputs/problem-heatmap');
const CAP_DIR = path.resolve(__dirname, '../outputs/capability-fit');
const OUT = path.resolve(__dirname, '../outputs/cross-analysis.json');

const DOMAIN_ORDER = [
  'growth-market', 'operations-delivery', 'product-service', 'talent-people',
  'risk-compliance', 'financial', 'strategy-direction', 'governance-leadership'
];

const SALIENCE = {
  'growth-market': 1.0, 'financial': 1.0, 'talent-people': 1.0,
  'strategy-direction': 0.7, 'governance-leadership': 0.7,
  'operations-delivery': 0.5, 'risk-compliance': 0.5, 'product-service': 0.5,
};

const CAP_CATS = ['generation', 'extraction', 'classification', 'prediction', 'search-retrieval', 'optimization', 'agents'];

// Load heatmaps
const hmFiles = fs.readdirSync(HM_DIR).filter(f => f.endsWith('.json'));
const heatmaps = {};
hmFiles.forEach(f => {
  const id = f.replace('.json', '');
  heatmaps[id] = JSON.parse(fs.readFileSync(path.join(HM_DIR, f), 'utf8'));
});
const companyIds = Object.keys(heatmaps);

// Load capability fits
const capFit = {};
CAP_CATS.forEach(c => {
  capFit[c] = JSON.parse(fs.readFileSync(path.join(CAP_DIR, c + '.json'), 'utf8'));
});

// Flatten all capabilities
const allCaps = [];
CAP_CATS.forEach(catId => {
  const cat = capFit[catId];
  for (const [capId, cap] of Object.entries(cat.capabilities)) {
    allCaps.push({ capId, label: cap.label, catLabel: cat.category_label, domains: cap.domains });
  }
});

// ── Cross-company sub-category heat ──
const subCatHeat = {};
DOMAIN_ORDER.forEach(domId => {
  const firstHm = heatmaps[companyIds[0]];
  const dom = firstHm.domains[domId];
  if (!dom || !dom.sub_categories) return;
  for (const [subId, sub] of Object.entries(dom.sub_categories)) {
    const scores = companyIds.map(id => heatmaps[id].domains[domId]?.sub_categories?.[subId]?.sub_avg || 0);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const hotCount = scores.filter(s => s >= 0.5).length;
    subCatHeat[subId] = {
      label: sub.label, domId, domLabel: dom.domain_label,
      avg, hotCount, perCompany: {},
    };
    companyIds.forEach((id, i) => { subCatHeat[subId].perCompany[id] = scores[i]; });
  }
});

// ── Cross: for each domain, find best capability fits ──
const domainCapFits = {};
DOMAIN_ORDER.forEach(domId => {
  const fits = allCaps
    .map(cap => ({
      capId: cap.capId, label: cap.label, catLabel: cap.catLabel,
      fit: cap.domains[domId]?.fit || 0,
      specificity: cap.domains[domId]?.specificity || 'low',
      reasoning: cap.domains[domId]?.reasoning || '',
    }))
    .filter(c => c.fit >= 0.5 && c.specificity !== 'low')
    .sort((a, b) => {
      const specOrder = { high: 0, mid: 1 };
      return (specOrder[a.specificity] || 2) - (specOrder[b.specificity] || 2) || b.fit - a.fit;
    });
  domainCapFits[domId] = fits;
});

// ── Opportunity nodes: sub-categories × best capabilities ──
const opportunities = [];
for (const [subId, sub] of Object.entries(subCatHeat)) {
  const salience = SALIENCE[sub.domId] || 0.5;
  const caps = domainCapFits[sub.domId] || [];
  const topCaps = caps.slice(0, 5);
  const bestCapFit = topCaps.length > 0 ? topCaps[0].fit : 0;
  const opportunityScore = sub.avg * salience * bestCapFit;

  opportunities.push({
    subId, label: sub.label, domId: sub.domId, domLabel: sub.domLabel,
    problemHeat: Math.round(sub.avg * 100),
    hotCompanies: sub.hotCount,
    salience,
    bestCapFit: Math.round(bestCapFit * 100),
    opportunityScore: Math.round(opportunityScore * 100),
    topCapabilities: topCaps,
    perCompany: sub.perCompany,
  });
}
opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);

// ── Per-company opportunity briefs ──
const companyBriefs = {};
companyIds.forEach(id => {
  const hm = heatmaps[id];
  const hotSubs = [];
  for (const domId of DOMAIN_ORDER) {
    const dom = hm.domains[domId];
    if (!dom || !dom.sub_categories) continue;
    for (const [subId, sub] of Object.entries(dom.sub_categories)) {
      if (sub.sub_avg >= 0.5) {
        const caps = (domainCapFits[domId] || []).slice(0, 3);
        hotSubs.push({
          subId, label: sub.label, domLabel: dom.domain_label,
          score: Math.round(sub.sub_avg * 100),
          topCapabilities: caps,
        });
      }
    }
  }
  hotSubs.sort((a, b) => b.score - a.score);

  // Top problems
  const topProbs = [];
  for (const domId of DOMAIN_ORDER) {
    const dom = hm.domains[domId];
    if (!dom || !dom.sub_categories) continue;
    for (const sub of Object.values(dom.sub_categories)) {
      for (const [pid, prob] of Object.entries(sub.problems || {})) {
        if (prob.score >= 0.6) {
          topProbs.push({
            id: pid, label: prob.label, score: prob.score,
            rubric_level: prob.rubric_level, reasoning: prob.reasoning,
            subLabel: sub.label, domLabel: dom.domain_label,
          });
        }
      }
    }
  }
  topProbs.sort((a, b) => b.score - a.score);

  companyBriefs[id] = {
    name: hm.company_name || id,
    hotSubCategories: hotSubs,
    topProblems: topProbs.slice(0, 10),
    problemCount: topProbs.length,
  };
});

// ── Product opportunity clusters ──
// Group top opportunities by capability
const productClusters = {};
opportunities.filter(o => o.opportunityScore >= 15).forEach(opp => {
  opp.topCapabilities.forEach(cap => {
    if (!productClusters[cap.capId]) {
      productClusters[cap.capId] = {
        capLabel: cap.label, catLabel: cap.catLabel,
        specificity: cap.specificity,
        problemAreas: [], companies: new Set(),
      };
    }
    productClusters[cap.capId].problemAreas.push({
      subLabel: opp.label, domLabel: opp.domLabel,
      heat: opp.problemHeat, score: opp.opportunityScore,
    });
    companyIds.forEach(id => {
      if (opp.perCompany[id] >= 0.5) productClusters[cap.capId].companies.add(id);
    });
  });
});

// Convert sets and sort
const productOpps = Object.entries(productClusters)
  .map(([capId, cluster]) => ({
    capId, ...cluster,
    companies: [...cluster.companies],
    companyCount: cluster.companies.size,
    avgHeat: Math.round(cluster.problemAreas.reduce((s, p) => s + p.heat, 0) / cluster.problemAreas.length),
  }))
  .filter(c => c.companyCount >= 3)
  .sort((a, b) => b.companyCount - a.companyCount || b.avgHeat - a.avgHeat);

const result = {
  generated: new Date().toISOString(),
  top_opportunities: opportunities.slice(0, 20),
  product_clusters: productOpps,
  company_briefs: companyBriefs,
  summary: {
    total_opportunity_nodes: opportunities.length,
    nodes_above_threshold: opportunities.filter(o => o.opportunityScore >= 15).length,
    product_cluster_count: productOpps.length,
  },
};

fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log('Cross-analysis written to', OUT);
console.log('Top 10 opportunity nodes:');
opportunities.slice(0, 10).forEach((o, i) => {
  console.log(`  ${i + 1}. ${o.domLabel} > ${o.label} — opp=${o.opportunityScore} (heat=${o.problemHeat}, sal=${o.salience}, cap=${o.bestCapFit})`);
});
console.log(`\nProduct clusters: ${productOpps.length}`);
productOpps.slice(0, 5).forEach(c => {
  console.log(`  ${c.capLabel} (${c.catLabel}) — ${c.companyCount} companies, ${c.problemAreas.length} problem areas`);
});
