#!/usr/bin/env node
/**
 * score-profiles.js — Extract taxonomy nodes and profile fills for scoring
 *
 * Reads the company-profile-taxonomy and each company profile,
 * then outputs a scoring manifest that pairs each terminal taxonomy node
 * with the corresponding profile fill for agent-based evaluation.
 *
 * Usage: node projects/prospector/tools/score-profiles.js [company-id]
 *        If no company-id, processes all profiles.
 *
 * Output: projects/prospector/outputs/scoring/<company-id>-manifest.json
 */

const fs = require('fs');
const path = require('path');

const TAXONOMY_PATH = path.resolve(__dirname, '../taxonomies/company-profile-taxonomy.json');
const PROFILES_DIR = path.resolve(__dirname, '../outputs/profiles');
const SCORING_DIR = path.resolve(__dirname, '../outputs/scoring');

// Map taxonomy dimension IDs to profile JSON keys
const DIM_KEY_MAP = {
  'industry-vertical': 'industry_vertical',
  'business-model': 'business_model',
  'scale-resources': 'scale_resources',
  'growth-phase': 'growth_phase',
  'market-position': 'market_position',
  'org-structure': 'org_structure',
  'tech-maturity': 'tech_maturity',
  'operating-environment': 'operating_environment',
  'culture-brand': 'culture_brand',
};

// Map taxonomy terminal node IDs to profile property keys
const PROP_KEY_MAP = {
  'industry-vertical-primary-sector': 'primary_sector',
  'industry-vertical-niche': 'vertical_niche',
  'industry-vertical-value-chain-position': 'value_chain_position',
  'industry-vertical-market-maturity': 'industry_maturity',
  'business-model-revenue-model': 'revenue_model',
  'business-model-delivery-model': 'delivery_model',
  'business-model-cost-structure': 'cost_structure',
  'business-model-network-effects': 'moat_and_network_effects',
  'business-model-key-dependencies': 'key_operational_dependencies',
  'scale-resources-headcount': 'headcount_band',
  'scale-resources-revenue-band': 'revenue_band',
  'scale-resources-capitalization': 'capitalization',
  'scale-resources-asset-intensity': 'asset_intensity',
  'scale-resources-financial-health': 'financial_health',
  'scale-resources-company-age': 'company_age',
  'scale-resources-customer-base-scale': 'customer_base_scale',
  'growth-phase-pre-pmf': null, // growth_phase is flat, not nested
  'growth-phase-scaling': null,
  'growth-phase-optimization': null,
  'growth-phase-turnaround': null,
  'growth-phase-exit': null,
  'market-position-customer-segment': 'target_customer_segment',
  'market-position-competitive-stance': 'competitive_stance',
  'market-position-gtm-motion': 'gtm_motion',
  'market-position-customer-concentration': 'customer_concentration',
  'market-position-pricing-position': 'pricing_position',
  'org-structure-leadership': 'leadership_model',
  'org-structure-shape': 'org_shape',
  'org-structure-workforce-model': 'workforce_model',
  'org-structure-talent-profile': 'talent_profile',
  'tech-maturity-stack-generation': 'stack_generation',
  'tech-maturity-engineering-practices': 'engineering_practices',
  'tech-maturity-data-infrastructure': 'data_infrastructure',
  'tech-maturity-security-posture': 'security_posture',
  'operating-environment-regulatory-burden': 'regulatory_burden',
  'operating-environment-geographic-scope': 'geographic_scope',
  'operating-environment-macro-sensitivity': 'macro_sensitivity',
  'operating-environment-governance-obligations': 'governance_obligations',
  'culture-brand-innovation-posture': 'innovation_posture',
  'culture-brand-brand-positioning': 'brand_positioning',
  'culture-brand-public-values': 'public_values',
  'culture-brand-employer-brand': 'employer_brand',
};

function getTerminalNodes(node, parent = null) {
  const terminals = [];
  if (node.status === 'terminal') {
    terminals.push({
      id: node.id,
      label: node.label,
      description: node.description,
      parent_id: parent?.id || null,
      parent_label: parent?.label || null,
    });
  }
  if (node.children) {
    for (const child of node.children) {
      terminals.push(...getTerminalNodes(child, node));
    }
  }
  return terminals;
}

function getProfileFill(profile, terminalNode) {
  const dims = profile.dimensions || profile.profile || {};
  const parentKey = DIM_KEY_MAP[terminalNode.parent_id];

  // Special case: growth_phase is flat (not nested properties)
  if (terminalNode.parent_id === 'growth-phase') {
    const gp = dims.growth_phase;
    if (!gp) return null;
    // The growth_phase dimension has a single value that maps to one of the terminal nodes
    const val = typeof gp === 'object' ? gp : { value: gp };
    return {
      value: val.value || null,
      evidence: val.evidence || null,
      confidence: val.confidence || null,
      note: val.note || null,
    };
  }

  if (!parentKey || !dims[parentKey]) return null;

  const propKey = PROP_KEY_MAP[terminalNode.id];
  if (!propKey) return null;

  const prop = dims[parentKey][propKey];
  if (!prop) return null;

  if (typeof prop === 'string') {
    return { value: prop, evidence: null, confidence: null };
  }

  return {
    value: prop.value || null,
    evidence: prop.evidence || null,
    confidence: prop.confidence || null,
    note: prop.note || null,
  };
}

function buildManifest(companyId, profile, terminals) {
  const items = [];

  for (const node of terminals) {
    // Growth-phase is a single-value dimension, not multiple sub-properties.
    // Score it once using the first terminal node as a stand-in.
    if (node.parent_id === 'growth-phase') {
      if (node.id === 'growth-phase-scaling') {
        // Use this terminal as the single representative for the whole dimension
        const gp = (profile.dimensions || profile.profile)?.growth_phase;
        const fill = gp ? {
          value: typeof gp === 'object' ? gp.value : gp,
          evidence: typeof gp === 'object' ? gp.evidence : null,
          confidence: typeof gp === 'object' ? gp.confidence : null,
        } : null;
        items.push({
          taxonomy_node: { ...node, label: 'Growth Phase', description: node.description },
          profile_fill: fill,
          is_growth_phase_single: true,
        });
      }
      continue;
    }

    const fill = getProfileFill(profile, node);
    items.push({
      taxonomy_node: node,
      profile_fill: fill,
    });
  }

  return {
    company_id: companyId,
    company_name: profile.entity || profile.company_name || companyId,
    total_properties: items.length,
    items,
  };
}

function run() {
  const targetId = process.argv[2];
  const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf-8'));
  const terminals = getTerminalNodes(taxonomy);

  console.log(`Taxonomy: ${terminals.length} terminal properties`);

  if (!fs.existsSync(SCORING_DIR)) fs.mkdirSync(SCORING_DIR, { recursive: true });

  const profileFiles = targetId
    ? [`${targetId}.json`]
    : fs.readdirSync(PROFILES_DIR).filter(f => f.endsWith('.json'));

  for (const file of profileFiles) {
    const id = file.replace('.json', '');
    const profilePath = path.join(PROFILES_DIR, file);
    if (!fs.existsSync(profilePath)) {
      console.log(`  Skip: ${id} (no profile)`);
      continue;
    }

    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    const manifest = buildManifest(id, profile, terminals);

    const outPath = path.join(SCORING_DIR, `${id}-manifest.json`);
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

    const filled = manifest.items.filter(i => i.profile_fill?.value).length;
    console.log(`  ${id}: ${filled}/${manifest.total_properties} properties filled`);
  }

  console.log('Done. Manifests written to outputs/scoring/');
}

run();
