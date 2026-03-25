#!/usr/bin/env node
/**
 * merge-scores.js — Merges semantic quality scores back into profile JSONs
 * and generates research questions for weak dimensions (<0.7)
 *
 * Usage: node projects/prospector/tools/merge-scores.js
 */

const fs = require('fs');
const path = require('path');

const PROFILES_DIR = path.resolve(__dirname, '../outputs/profiles');
const SCORING_DIR = path.resolve(__dirname, '../outputs/scoring');
const PASSING = 0.7;

// Normalize dimension keys — agents used inconsistent naming
const DIM_KEY_NORMALIZE = {
  'industry & vertical': 'industry-vertical',
  'industry_vertical': 'industry-vertical',
  'business model': 'business-model',
  'business_model': 'business-model',
  'scale & resources': 'scale-resources',
  'scale_resources': 'scale-resources',
  'growth phase': 'growth-phase',
  'growth_phase': 'growth-phase',
  'market position': 'market-position',
  'market_position': 'market-position',
  'organizational structure': 'org-structure',
  'org-structure': 'org-structure',
  'org_structure': 'org-structure',
  'technical maturity': 'tech-maturity',
  'tech-maturity': 'tech-maturity',
  'tech_maturity': 'tech-maturity',
  'operating environment': 'operating-environment',
  'operating_environment': 'operating-environment',
  'culture & brand signals': 'culture-brand',
  'culture & brand': 'culture-brand',
  'culture-brand': 'culture-brand',
  'culture_brand': 'culture-brand',
};

const DIM_LABELS = {
  'industry-vertical': 'Industry & Vertical',
  'business-model': 'Business Model',
  'scale-resources': 'Scale & Resources',
  'growth-phase': 'Growth Phase',
  'market-position': 'Market Position',
  'org-structure': 'Org Structure',
  'tech-maturity': 'Tech Maturity',
  'operating-environment': 'Operating Environment',
  'culture-brand': 'Culture & Brand',
};

// Question templates keyed by dimension + common weak property patterns
const QUESTION_BANK = {
  'industry-vertical': [
    'What specific sub-segments within {vertical} does {company} compete in, and how are those segments evolving?',
    'Where does {company} sit in the industry value chain — are they moving upstream or downstream?',
    'Is the {vertical} market growing, consolidating, or fragmenting in the regions {company} operates?',
  ],
  'business-model': [
    'What is {company}\'s revenue mix — is it project-based, retainer, subscription, or blended?',
    'What structural moats or switching costs does {company} have beyond brand/relationships?',
    'What are {company}\'s critical operational dependencies — platform, talent pipeline, regulatory, or funding?',
  ],
  'scale-resources': [
    'What is {company}\'s current headcount and how has it changed in the last 12 months?',
    'What is {company}\'s approximate annual revenue or budget, and is it growing or flat?',
    'What is {company}\'s financial health — profitable, break-even, grant-dependent, or burning runway?',
  ],
  'growth-phase': [
    'Is {company} actively scaling (new markets, hiring) or optimizing (margins, retention, efficiency)?',
    'What growth milestones has {company} hit in the last 2 years — new geographies, products, partnerships?',
    'Is {company} preparing for any ownership transition (acquisition, IPO, leadership succession)?',
  ],
  'market-position': [
    'Who are {company}\'s target buyers and what does their buying process look like?',
    'How concentrated is {company}\'s revenue — top 5 clients as % of total?',
    'Where does {company} sit on the price-value spectrum vs. alternatives?',
  ],
  'org-structure': [
    'How is {company} organized — by function, geography, product line, or matrix?',
    'What is the workforce model — centralized, distributed, outsourced, hybrid?',
    'What is the dominant talent profile — domain experts, engineers, generalists, sales-heavy?',
  ],
  'tech-maturity': [
    'What core technology does {company} use internally — custom-built, off-the-shelf, or minimal?',
    'Does {company} have engineering/product teams, or is tech outsourced/minimal?',
    'What data infrastructure exists — spreadsheets, BI dashboards, data warehouse, or ML-ready pipelines?',
  ],
  'operating-environment': [
    'What regulatory or compliance burden does {company} face in its operating markets?',
    'How exposed is {company} to macroeconomic cycles, aid budgets, or government spending shifts?',
    'What governance obligations constrain {company} — board, donors, public reporting, mission lock?',
  ],
  'culture-brand': [
    'How does {company} position itself on innovation — bleeding edge, fast follower, pragmatic, or conservative?',
    'What is {company}\'s employer brand reputation — is it easy or hard for them to attract talent?',
    'Does {company} have publicly stated values that meaningfully constrain commercial decisions?',
  ],
};

function normalizeDimKey(key) {
  const lower = key.toLowerCase().replace(/_/g, '-');
  return DIM_KEY_NORMALIZE[lower] || DIM_KEY_NORMALIZE[key.toLowerCase()] || lower;
}

function getWeakProperties(scores, dimKey) {
  if (!scores.property_scores) return [];
  return scores.property_scores
    .filter(p => {
      const parentId = p.parent_id || p.property_id?.split('-').slice(0, -1).join('-');
      // Try to match parent dimension
      const normalized = normalizeDimKey(parentId || '');
      return normalized === dimKey && p.final_score < PASSING;
    })
    .sort((a, b) => a.final_score - b.final_score);
}

function generateQuestions(companyName, dimKey, weakProps) {
  const templates = QUESTION_BANK[dimKey] || [];
  const vertical = 'their sector'; // placeholder

  return templates.slice(0, 3).map(t =>
    t.replace(/\{company\}/g, companyName).replace(/\{vertical\}/g, vertical)
  );
}

function run() {
  const profileFiles = fs.readdirSync(PROFILES_DIR).filter(f => f.endsWith('.json'));

  for (const file of profileFiles) {
    const id = file.replace('.json', '');
    const profilePath = path.join(PROFILES_DIR, file);
    const scorePath = path.join(SCORING_DIR, `${id}-scores.json`);

    if (!fs.existsSync(scorePath)) {
      console.log(`  Skip ${id}: no scores`);
      continue;
    }

    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const scores = JSON.parse(fs.readFileSync(scorePath, 'utf-8'));

    // Normalize dimension scores
    const normalizedDims = {};
    if (scores.dimension_scores) {
      for (const [key, val] of Object.entries(scores.dimension_scores)) {
        const normKey = normalizeDimKey(key);
        // Handle case where value is an object with 'average' property
        const score = typeof val === 'object' ? (val.average || 0) : val;
        normalizedDims[normKey] = Math.round(score * 1000) / 1000;
      }
    }

    // Build quality assessment with questions for weak areas
    const weakDimensions = {};
    const strongDimensions = {};

    for (const [dimKey, score] of Object.entries(normalizedDims)) {
      const label = DIM_LABELS[dimKey] || dimKey;
      if (score < PASSING) {
        const questions = generateQuestions(
          profile.entity || profile.company_name || id,
          dimKey,
          getWeakProperties(scores, dimKey)
        );
        weakDimensions[dimKey] = {
          label,
          score,
          research_questions: questions,
        };
      } else {
        strongDimensions[dimKey] = { label, score };
      }
    }

    // Update profile
    profile.data_quality_score = {
      overall: scores.overall_score,
      passing_threshold: PASSING,
      method: 'semantic-rubric-haiku',
      dimensions: normalizedDims,
      strong_dimensions: strongDimensions,
      weak_dimensions: weakDimensions,
      total_properties_scored: scores.property_scores?.length || 0,
    };

    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));

    const weakCount = Object.keys(weakDimensions).length;
    const strongCount = Object.keys(strongDimensions).length;
    console.log(`  ${id}: ${scores.overall_score.toFixed(3)} — ${strongCount} strong, ${weakCount} weak`);
    if (weakCount > 0) {
      for (const [k, v] of Object.entries(weakDimensions)) {
        console.log(`    ↓ ${v.label}: ${v.score.toFixed(3)}`);
      }
    }
  }

  console.log('\nDone. Profiles updated with semantic scores and research questions.');
}

run();
