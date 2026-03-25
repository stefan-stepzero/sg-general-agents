/**
 * Generates capability-matching prompts for each pain point.
 * Used to feed individual agent calls.
 *
 * Usage: node run-capability-match.js [--area <area-id>] [pain-point-index]
 *   - No args: lists all process areas
 *   - --area <id>: select process area (default: all)
 *   - --area <id> with no index: lists pain points in that area
 *   - --area <id> <index>: prints the full prompt for that pain point
 *   - --all: lists all 300 pain points across all areas
 */

const fs = require('fs');
const path = require('path');

const taxonomyPath = path.join(__dirname, '..', 'taxonomies', 'edu-operator-processes.json');
const capabilitiesPath = path.join(__dirname, '..', 'taxonomies', 'ai-capabilities.json');

const tree = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const capabilities = JSON.parse(fs.readFileSync(capabilitiesPath, 'utf8'));

// Parse args
const args = process.argv.slice(2);
let areaId = null;
let showAll = false;
let indexArg = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--area' && args[i+1]) { areaId = args[++i]; }
  else if (args[i] === '--all') { showAll = true; }
  else if (!isNaN(parseInt(args[i]))) { indexArg = parseInt(args[i]); }
}

// Collect terminal pain points from a node
function collectTerminals(node, out = []) {
  if (node.status === 'terminal') out.push({ id: node.id, label: node.label, description: node.description });
  if (node.children) node.children.forEach(c => collectTerminals(c, out));
  return out;
}

// If no area specified and no --all, list areas
if (!areaId && !showAll && indexArg === null) {
  console.log('Process areas:\n');
  tree.children.forEach(c => {
    const count = collectTerminals(c).length;
    console.log(`  ${c.id} — ${c.label} (${count} pain points)`);
  });
  console.log('\nUsage: node run-capability-match.js --area <area-id> [index]');
  process.exit(0);
}

// Collect pain points for selected area(s)
const painPoints = [];
if (areaId) {
  const area = tree.children.find(c => c.id === areaId);
  if (!area) { console.error(`Unknown area: ${areaId}. Run without args to see available areas.`); process.exit(1); }
  collectTerminals(area, painPoints);
} else {
  tree.children.forEach(c => collectTerminals(c, painPoints));
}

// Extract terminal capabilities
const caps = [];
function collectCaps(node) {
  if (node.status === 'terminal') caps.push({ id: node.id, label: node.label, description: node.description });
  if (node.children) node.children.forEach(collectCaps);
}
capabilities.children.forEach(collectCaps);

const index = indexArg;

if (index === null || index === undefined) {
  painPoints.forEach((p, i) => console.log(`${i}: ${p.id} — ${p.label}`));
  console.log(`\nTotal: ${painPoints.length} pain points, ${caps.length} capabilities`);
  process.exit(0);
}

const pp = painPoints[index];
if (!pp) {
  console.error(`Invalid index ${index}. Range: 0-${painPoints.length - 1}`);
  process.exit(1);
}

// Build the capability list as compact text
const capList = caps.map(c => `- **${c.id}** (${c.label}): ${c.description}`).join('\n');

// Resolve process area label from pain point ID
const areaNode = tree.children.find(c => {
  const terminals = collectTerminals(c);
  return terminals.some(t => t.id === pp.id);
});
const areaLabel = areaNode ? areaNode.label : 'Unknown';

const prompt = `You are an AI opportunity analyst. Your task is to evaluate ONE specific business pain point against ALL AI capabilities and identify valid matches.

## Context
- **Archetype:** Multi-site education operator (runs schools/campuses directly, 500+ staff, tuition/government funded)
- **Process Area:** ${areaLabel}

## Pain Point to Evaluate

**ID:** ${pp.id}
**Label:** ${pp.label}
**Description:** ${pp.description}

## AI Capabilities to Test Against

${capList}

## Instructions

For EACH of the ${caps.length} capabilities above, evaluate whether it could meaningfully address this pain point. Be specific to the multi-site education operator context.

**A match is VALID when:**
- The capability directly addresses the pain mechanism (not tangentially related)
- The solution is technically feasible for a 500+ staff education operator
- The organization could realistically adopt it within 6-12 months

**A match is INVALID when:**
- The connection is too abstract or generic
- It requires data/infrastructure the org is unlikely to have
- The problem is primarily people/culture where AI is a band-aid
- The capability's EXCLUDES rules disqualify the match

## Scoring Model

Score each valid match on three dimensions (1-5 each):

1. **Pain Salience** (1-5): How acutely does leadership feel this problem?
   - 1 = back-office annoyance, nobody talks about it
   - 3 = department heads raise it quarterly
   - 5 = CEO/board discusses it, affects strategic decisions

2. **Adoption Likelihood** (1-5): Would they actually adopt an AI solution for this?
   - 1 = high regulatory/trust barriers, OR existing tools already solve this well (e.g. commodity OCR, basic ERP features)
   - 3 = would adopt with human-in-the-loop supervision, existing tools are partial/inadequate
   - 5 = low risk, easy to trust, nothing adequate exists today (e.g. AI-generated board narratives, semantic document matching)

3. **Build Complexity** (1-5, inverted — 5 = easiest to build):
   - 1 = needs deep integrations, custom models, complex go-to-market, heavy change management
   - 3 = moderate integration, standard ML/LLM patterns, clear pricing model
   - 5 = API wrapper or config-driven, obvious value prop, easy onboarding

**Composite** = (Pain × Adoption × Build) / 1.25 — normalized to 0-100 scale.

The multiplication means a low score in ANY dimension kills the opportunity. A technically easy solution nobody trusts scores poorly. A painful problem that's impossible to build scores poorly.

## Output Format

Return ONLY valid JSON (no markdown fences, no commentary before/after):

{
  "pain_point_id": "${pp.id}",
  "pain_point_label": "${pp.label}",
  "matches": [
    {
      "capability_id": "...",
      "capability_label": "...",
      "match_rationale": "2-3 sentences: WHY this capability addresses this pain point, specific to education operators",
      "opportunity_sketch": "1-2 sentences: what this would look like as a concrete solution",
      "pain_salience": 1-5,
      "adoption_likelihood": 1-5,
      "build_complexity": 1-5,
      "composite_score": round((pain_salience * adoption_likelihood * build_complexity) / 1.25, 1)
    }
  ],
  "no_match_capabilities": ["list of capability IDs that were evaluated but don't match"],
  "total_evaluated": ${caps.length},
  "total_matched": <number>
}

Be disciplined: quality over quantity. 2-4 strong matches are better than 8 weak ones. Say NO to capabilities that don't fit. Every match must have a specific, grounded rationale — not generic "AI could help."`;

console.log(prompt);
