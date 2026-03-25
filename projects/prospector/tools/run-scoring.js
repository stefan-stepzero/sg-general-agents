#!/usr/bin/env node
/**
 * run-scoring.js — Dispatches Haiku scoring agents for each profile property
 *
 * Reads scoring manifests and prints prompts for agent dispatch.
 * In practice, the orchestrator (Claude Code) reads each manifest item
 * and sends it to the profile-scorer agent.
 *
 * Usage: node projects/prospector/tools/run-scoring.js <company-id>
 *
 * Output: Prints each scoring task as a self-contained prompt
 */

const fs = require('fs');
const path = require('path');

const SCORING_DIR = path.resolve(__dirname, '../outputs/scoring');
const companyId = process.argv[2];

if (!companyId) {
  console.error('Usage: run-scoring.js <company-id>');
  process.exit(1);
}

const manifestPath = path.join(SCORING_DIR, `${companyId}-manifest.json`);
if (!fs.existsSync(manifestPath)) {
  console.error(`No manifest found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

console.log(`Company: ${manifest.company_name} (${manifest.company_id})`);
console.log(`Properties to score: ${manifest.total_properties}`);
console.log('---');

for (const item of manifest.items) {
  const node = item.taxonomy_node;
  const fill = item.profile_fill;

  const prompt = `Score this company profile property:

COMPANY: ${manifest.company_name}

TAXONOMY NODE:
- ID: ${node.id}
- Label: ${node.label}
- Parent: ${node.parent_label} (${node.parent_id})
- Definition: ${node.description}

PROFILE FILL:
${fill ? JSON.stringify(fill, null, 2) : '(MISSING - no value provided)'}

Apply the scoring rubric and return ONLY a JSON object with property_id, coverage, confidence_multiplier, final_score, and justification.`;

  console.log(`\n=== ${node.parent_label} > ${node.label} ===`);
  console.log(prompt);
  console.log('---');
}
