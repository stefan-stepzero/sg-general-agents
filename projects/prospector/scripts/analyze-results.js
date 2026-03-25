const fs = require('fs');
const path = require('path');
const base = path.join(__dirname, '..', 'outputs', 'v3-capability-fit-scored');
const areas = fs.readdirSync(base).filter(d => fs.statSync(path.join(base,d)).isDirectory());
let capScores = {};

for (const area of areas) {
  const files = fs.readdirSync(path.join(base, area)).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(base, area, f), 'utf8'));
    for (const m of (data.matches || [])) {
      if (!capScores[m.capability_id]) capScores[m.capability_id] = [];
      capScores[m.capability_id].push(m.composite_score);
    }
  }
}

console.log('=== CAPABILITY AVG SCORE (sorted) ===');
const sorted = Object.entries(capScores).map(([id, scores]) => ({
  id, count: scores.length,
  avg: scores.reduce((a,b) => a+b, 0) / scores.length,
  max: Math.max(...scores)
})).sort((a,b) => b.avg - a.avg);

sorted.forEach(c => console.log(`  ${c.id}: avg=${c.avg.toFixed(1)} max=${c.max} count=${c.count}`));

// Score distribution
const allScores = Object.values(capScores).flat();
const buckets = [0,0,0,0,0];
allScores.forEach(s => {
  if (s < 20) buckets[0]++;
  else if (s < 40) buckets[1]++;
  else if (s < 60) buckets[2]++;
  else if (s < 80) buckets[3]++;
  else buckets[4]++;
});

console.log('\n=== SCORE DISTRIBUTION ===');
console.log(`  0-20: ${buckets[0]}  |  20-40: ${buckets[1]}  |  40-60: ${buckets[2]}  |  60-80: ${buckets[3]}  |  80+: ${buckets[4]}`);

// Per-area stats
console.log('\n=== PER-AREA STATS ===');
for (const area of areas.sort()) {
  const files = fs.readdirSync(path.join(base, area)).filter(f => f.endsWith('.json'));
  let matches = 0, scores = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(base, area, f), 'utf8'));
    const m = data.matches || [];
    matches += m.length;
    m.forEach(x => scores.push(x.composite_score));
  }
  const avg = scores.length ? (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : '0';
  console.log(`  ${area}: ${files.length} PPs, ${matches} matches, avg=${avg}`);
}
