const fs = require('fs');
const dir = 'P:/Projects2/sg-general-agents/projects/prospector/outputs/profiles/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
const profiles = files.map(f => JSON.parse(fs.readFileSync(dir + f, 'utf8')));

const composite = {
  company_count: profiles.length,
  companies: profiles.map(p => ({ name: p.company_name, website: p.website })),
};

// Collect dimension values
const dimCollector = {};
profiles.forEach(p => {
  const dims = p.dimensions || p.profile || {};
  for (const [groupKey, group] of Object.entries(dims)) {
    if (!dimCollector[groupKey]) dimCollector[groupKey] = {};
    if (typeof group === 'string') {
      if (!dimCollector[groupKey]._flat) dimCollector[groupKey]._flat = [];
      dimCollector[groupKey]._flat.push(group);
    } else if (group && typeof group === 'object') {
      if (group.value !== undefined) {
        if (!dimCollector[groupKey]._flat) dimCollector[groupKey]._flat = [];
        dimCollector[groupKey]._flat.push(group.value);
      } else {
        for (const [propKey, prop] of Object.entries(group)) {
          if (!dimCollector[groupKey][propKey]) dimCollector[groupKey][propKey] = [];
          const val = typeof prop === 'string' ? prop : (prop && prop.value ? prop.value : null);
          if (val) dimCollector[groupKey][propKey].push(val);
        }
      }
    }
  }
});

// Summarize dimensions
const summary = {};
for (const [groupKey, group] of Object.entries(dimCollector)) {
  summary[groupKey] = {};
  for (const [propKey, values] of Object.entries(group)) {
    const freq = {};
    values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    summary[groupKey][propKey] = sorted.slice(0, 3).map(([v, c]) => v + ' (' + c + '/8)').join('; ');
  }
}

// Problem domain heat averages
const hmDir = 'P:/Projects2/sg-general-agents/projects/prospector/outputs/problem-heatmap/';
const hmFiles = fs.readdirSync(hmDir).filter(f => f.endsWith('.json'));
const domAvgs = {};
hmFiles.forEach(f => {
  const hm = JSON.parse(fs.readFileSync(hmDir + f, 'utf8'));
  for (const [domId, dom] of Object.entries(hm.domains)) {
    if (!domAvgs[domId]) domAvgs[domId] = { label: dom.domain_label, scores: [] };
    domAvgs[domId].scores.push(dom.domain_avg);
  }
});

const hotDomains = {};
for (const [domId, data] of Object.entries(domAvgs)) {
  const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
  hotDomains[domId] = { label: data.label, cross_company_avg: Math.round(avg * 100) };
}

composite.dimension_summary = summary;
composite.problem_heat_by_domain = hotDomains;

const out = JSON.stringify(composite, null, 2);
fs.writeFileSync('P:/Projects2/sg-general-agents/projects/prospector/outputs/composite-profile.json', out);
console.log(out);
