/**
 * Generates a self-contained HTML report from v3 capability matching results.
 *
 * Structure:
 *   1. Executive summary (aggregate stats)
 *   2. Pain point landscape by process area (ranked by pain salience)
 *   3. Top pain points with brief solution sketches
 *   4. Capability frequency analysis
 *   5. Placeholder sections for archetypes 2 & 3
 *
 * Usage: node generate-report.js > ../outputs/v3-pain-landscape.html
 */

const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'outputs', 'v3-capability-fit-scored');
const taxPath = path.join(__dirname, '..', 'taxonomies', 'edu-operator-processes.json');
const taxonomy = JSON.parse(fs.readFileSync(taxPath, 'utf8'));

// Build area label lookup from taxonomy
const areaLabels = {};
taxonomy.children.forEach(c => { areaLabels[c.id] = c.label; });

const areas = fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory());

// Collect all pain points
const painPoints = [];
const capStats = {};
let totalMatches = 0;

for (const area of areas) {
  const files = fs.readdirSync(path.join(base, area)).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(base, area, f), 'utf8'));
    const matches = data.matches || [];
    totalMatches += matches.length;

    // Compute pain point level stats
    const maxSalience = matches.length ? Math.max(...matches.map(m => m.pain_salience)) : 0;
    const avgSalience = matches.length ? matches.reduce((a, m) => a + m.pain_salience, 0) / matches.length : 0;
    const topScore = matches.length ? Math.max(...matches.map(m => m.composite_score)) : 0;
    const topMatch = matches.length ? matches.reduce((best, m) => m.composite_score > best.composite_score ? m : best) : null;

    painPoints.push({
      area,
      areaLabel: areaLabels[area] || area,
      id: data.pain_point_id,
      label: data.pain_point_label,
      matchCount: matches.length,
      maxSalience,
      avgSalience,
      topScore,
      topMatch,
      matches: matches.sort((a, b) => b.composite_score - a.composite_score)
    });

    for (const m of matches) {
      if (!capStats[m.capability_id]) {
        capStats[m.capability_id] = { id: m.capability_id, label: m.capability_label, count: 0, scores: [], saliences: [] };
      }
      capStats[m.capability_id].count++;
      capStats[m.capability_id].scores.push(m.composite_score);
      capStats[m.capability_id].saliences.push(m.pain_salience);
    }
  }
}

// Sort pain points by max salience desc, then top score desc
painPoints.sort((a, b) => b.maxSalience - a.maxSalience || b.topScore - a.topScore);

// Group by area for the area view
const byArea = {};
for (const pp of painPoints) {
  if (!byArea[pp.area]) byArea[pp.area] = [];
  byArea[pp.area].push(pp);
}

// Sort areas by avg top score
const areaSummaries = Object.entries(byArea).map(([area, pps]) => {
  const avgTop = pps.reduce((a, p) => a + p.topScore, 0) / pps.length;
  const avgSalience = pps.reduce((a, p) => a + p.maxSalience, 0) / pps.length;
  const totalMatches = pps.reduce((a, p) => a + p.matchCount, 0);
  return { area, label: areaLabels[area] || area, count: pps.length, avgTop, avgSalience, totalMatches, pps };
}).sort((a, b) => b.avgSalience - a.avgSalience || b.avgTop - a.avgTop);

// Capability ranking
const capRanked = Object.values(capStats).map(c => ({
  ...c,
  avg: c.scores.reduce((a, b) => a + b, 0) / c.scores.length,
  max: Math.max(...c.scores)
})).sort((a, b) => b.avg - a.avg);

// Score color
function scoreColor(s) {
  if (s >= 60) return '#34d399';
  if (s >= 40) return '#f59e0b';
  if (s >= 20) return '#fb923c';
  return '#6b7194';
}

function salienceBar(s) {
  const pct = (s / 5) * 100;
  const color = s >= 4 ? '#f87171' : s >= 3 ? '#f59e0b' : '#6b7194';
  return `<div style="display:flex;align-items:center;gap:6px;"><div style="width:60px;height:6px;background:#1e2230;border-radius:3px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${color};border-radius:3px;"></div></div><span style="font-size:11px;color:${color};font-weight:600;">${s}</span></div>`;
}

function scoreChip(s) {
  return `<span style="display:inline-block;padding:1px 8px;border-radius:4px;font-size:12px;font-weight:600;background:${scoreColor(s)}22;color:${scoreColor(s)};">${s}</span>`;
}

// Top 50 pain points for the detail section
const top50 = painPoints.slice(0, 50);

// --- HTML Generation ---

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<title>Pain Point Landscape &amp; AI Opportunity Map</title>
<style>
:root {
  --bg: #0a0c10;
  --surface: #13161e;
  --surface2: #1b1f2b;
  --surface3: #232838;
  --border: #262b3a;
  --border-subtle: #1e2230;
  --text: #e8eaf0;
  --text-secondary: #b0b4c4;
  --text-muted: #6b7194;
  --accent: #7b93ff;
  --accent-bright: #94a8ff;
  --green: #34d399;
  --amber: #f59e0b;
  --red: #f87171;
  --radius: 10px;
  --radius-sm: 6px;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.container { max-width: 1100px; margin: 0 auto; padding: 40px 32px; }
h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 4px; }
h2 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; color: var(--text); }
h3 { font-size: 15px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 8px; }
.subtitle { font-size: 14px; color: var(--text-muted); margin-bottom: 32px; }
.section { margin-bottom: 48px; }
.card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  padding: 20px 24px;
  margin-bottom: 12px;
}
.card-compact {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin-bottom: 8px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius);
  padding: 16px 20px;
  text-align: center;
}
.stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }
.stat-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
.area-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.area-header:hover { opacity: 0.85; }
.pp-row {
  display: grid;
  grid-template-columns: 1fr 60px 80px 200px;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 13px;
}
.pp-row:last-child { border-bottom: none; }
.pp-label { color: var(--text); }
.match-pills { display: flex; flex-wrap: wrap; gap: 4px; }
.match-pill {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.tab-bar {
  display: flex;
  gap: 2px;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 3px;
  margin-bottom: 24px;
  border: 1px solid var(--border-subtle);
}
.tab {
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.15s;
}
.tab:hover { color: var(--text-secondary); }
.tab.active { background: var(--surface3); color: var(--text); }
.archetype-placeholder {
  background: var(--surface);
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}
.cap-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}
.cap-bar-label { width: 180px; text-align: right; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cap-bar { height: 14px; border-radius: 3px; min-width: 2px; }
.cap-bar-value { color: var(--text-muted); font-size: 11px; width: 60px; }
.detail-card { margin-bottom: 16px; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.detail-matches { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
.detail-match {
  display: grid;
  grid-template-columns: 180px 50px 1fr;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-subtle);
}
.detail-match:last-child { border-bottom: none; }
.area-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--accent)15;
  color: var(--accent);
}
</style>
</head>
<body>
<div class="container">

  <!-- Header -->
  <div style="margin-bottom:8px;">
    <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);margin-bottom:6px;">Prospector v3</div>
    <h1>Pain Point Landscape &amp; AI Opportunity Map</h1>
    <p class="subtitle">Multi-site Education Operator Archetype &mdash; 300 pain points &times; 34 AI capabilities</p>
  </div>

  <!-- Archetype Tabs -->
  <div class="tab-bar">
    <div class="tab active">Multi-site Education Operator</div>
    <div class="tab" style="opacity:0.5;">Education SaaS Vendor</div>
    <div class="tab" style="opacity:0.5;">Upstream Advisory / Convening</div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value" style="color:var(--accent);">${painPoints.length}</div>
        <div class="stat-label">Pain Points</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--green);">${totalMatches.toLocaleString()}</div>
        <div class="stat-label">AI Matches</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--amber);">${painPoints.filter(p => p.topScore >= 60).length}</div>
        <div class="stat-label">High-Score Opps (&ge;60)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color:var(--red);">${painPoints.filter(p => p.maxSalience >= 4).length}</div>
        <div class="stat-label">High-Salience Pains (&ge;4)</div>
      </div>
    </div>
  </div>

  <!-- Pain Landscape by Area -->
  <div class="section">
    <h2>Pain Landscape by Process Area</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">
      Pain points ranked by leadership salience (1=back-office annoyance, 5=CEO/board discusses it).
      Top composite score shown for the best AI capability match.
    </p>

    ${areaSummaries.map(as => `
    <div class="card" style="margin-bottom:16px;">
      <div class="area-header" onclick="this.parentElement.querySelector('.area-body').classList.toggle('collapsed')">
        <div>
          <h3 style="margin-bottom:2px;">${as.label}</h3>
          <span style="font-size:12px;color:var(--text-muted);">${as.count} pain points &middot; ${as.totalMatches} matches &middot; avg salience ${as.avgSalience.toFixed(1)}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:12px;color:var(--text-muted);">avg top score</span>
          <div style="font-size:18px;font-weight:700;color:${scoreColor(as.avgTop)};">${as.avgTop.toFixed(0)}</div>
        </div>
      </div>
      <div class="area-body" style="margin-top:14px;">
        ${as.pps.map(pp => `
        <div class="pp-row">
          <div class="pp-label">${pp.label}</div>
          <div>${salienceBar(pp.maxSalience)}</div>
          <div style="text-align:right;">${scoreChip(pp.topScore)}</div>
          <div class="match-pills">
            ${pp.matches.slice(0, 3).map(m => `<span class="match-pill" style="background:${scoreColor(m.composite_score)}15;color:${scoreColor(m.composite_score)};" title="${m.capability_label}: ${m.composite_score}">${m.capability_label.split(' ')[0]} ${m.composite_score}</span>`).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>

  <!-- Top 50 Pain Points Detail -->
  <div class="section">
    <h2>Top 50 Pain Points — Detail View</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">
      Ranked by pain salience, then top composite score. Shows matching AI capabilities with brief solution sketches.
    </p>

    ${top50.map((pp, i) => `
    <div class="card detail-card">
      <div class="detail-header">
        <div>
          <span class="area-badge">${pp.areaLabel}</span>
          <h3 style="margin-top:6px;margin-bottom:2px;">${i + 1}. ${pp.label}</h3>
          <span style="font-size:12px;color:var(--text-muted);">Salience: ${pp.maxSalience}/5 &middot; ${pp.matchCount} AI matches</span>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--text-muted);">Top Score</div>
          <div style="font-size:20px;font-weight:700;color:${scoreColor(pp.topScore)};">${pp.topScore}</div>
        </div>
      </div>
      <div class="detail-matches">
        ${pp.matches.slice(0, 4).map(m => `
        <div class="detail-match">
          <div style="font-weight:500;color:var(--text-secondary);">${m.capability_label}</div>
          <div>${scoreChip(m.composite_score)}</div>
          <div style="color:var(--text-muted);">${m.opportunity_sketch || ''}</div>
        </div>`).join('')}
      </div>
    </div>`).join('')}
  </div>

  <!-- Capability Frequency -->
  <div class="section">
    <h2>AI Capability Signal Strength</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">
      How often each capability matches, and its average composite score. Width = match count. Color = avg score.
    </p>

    ${capRanked.slice(0, 20).map(c => {
      const maxWidth = capRanked[0].count;
      const barPct = (c.count / maxWidth) * 100;
      return `
    <div class="cap-bar-wrap">
      <div class="cap-bar-label">${c.label}</div>
      <div style="flex:1;position:relative;">
        <div class="cap-bar" style="width:${barPct}%;background:${scoreColor(c.avg)};opacity:0.7;"></div>
      </div>
      <div class="cap-bar-value">${c.count} @ ${c.avg.toFixed(0)}</div>
    </div>`;
    }).join('')}
  </div>

  <!-- Archetype 2 Placeholder -->
  <div class="section">
    <h2>Archetype 2: Education SaaS Vendor</h2>
    <div class="archetype-placeholder">
      <div style="font-size:24px;margin-bottom:8px;">&#128204;</div>
      <div style="font-weight:600;margin-bottom:4px;">Pending</div>
      <div>Process taxonomy and capability matching not yet completed for this archetype.</div>
      <div style="margin-top:8px;font-size:12px;">Example companies: Kinetic</div>
    </div>
  </div>

  <!-- Archetype 3 Placeholder -->
  <div class="section">
    <h2>Archetype 3: Upstream Advisory / Convening</h2>
    <div class="archetype-placeholder">
      <div style="font-size:24px;margin-bottom:8px;">&#128204;</div>
      <div style="font-weight:600;margin-bottom:4px;">Pending</div>
      <div>Process taxonomy and capability matching not yet completed for this archetype.</div>
      <div style="margin-top:8px;font-size:12px;">Example companies: Acasus, WISE</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:32px 0;border-top:1px solid var(--border-subtle);margin-top:32px;">
    <div style="font-size:11px;color:var(--text-muted);">
      Generated ${new Date().toISOString().split('T')[0]} &middot; Prospector v3 &middot; ${painPoints.length} pain points &times; ${Object.keys(capStats).length} capabilities &middot; ${totalMatches.toLocaleString()} matches
    </div>
  </div>

</div>
</body>
</html>`;

process.stdout.write(html);
