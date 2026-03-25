#!/usr/bin/env python3
"""Score WISE company profile against taxonomy definitions."""

import json
from collections import defaultdict

# Read manifest
with open('P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/wise-manifest.json', 'r') as f:
    manifest = json.load(f)

# Confidence multiplier mapping
confidence_multipliers = {
    'high': 1.0,
    'medium-high': 0.9,
    'medium': 0.85,
    'low-medium': 0.7,
    'low': 0.55,
    'not stated': 0.7
}

def assess_coverage(profile_fill):
    """
    Assess coverage (0-1):
    1.0 = precise match with evidence
    0.8 = clear with some gaps
    0.6 = reasonable but generic
    0.4 = vague/weak
    0.2 = placeholder
    0.0 = missing
    """
    value = profile_fill.get('value')
    evidence = profile_fill.get('evidence', '')

    # Missing
    if not value or value == 'null' or value is None:
        return 0.0

    value_str = str(value).strip().lower()

    # Placeholder
    if value_str in ['n/a', 'unknown', 'tbd', 'not provided', 'not stated', 'none', '']:
        return 0.2

    evidence_str = str(evidence).strip()
    has_strong_evidence = len(evidence_str) > 100
    has_some_evidence = len(evidence_str) > 30
    is_specific = len(value_str) > 20

    # Vague/weak
    if not has_some_evidence and len(value_str) < 15:
        return 0.4

    # Reasonable but generic
    if has_some_evidence and not has_strong_evidence:
        return 0.6

    # Clear with some gaps
    if has_strong_evidence and not is_specific:
        return 0.8

    # Precise match
    if has_strong_evidence and is_specific:
        return 1.0

    return 0.6

# Score each property
property_scores = []
dimension_map = defaultdict(list)

for item in manifest['items']:
    taxonomy = item['taxonomy_node']
    profile = item['profile_fill']

    coverage = assess_coverage(profile)
    confidence_level = profile.get('confidence', 'not stated')
    multiplier = confidence_multipliers.get(confidence_level, 0.7)
    final_score = coverage * multiplier

    property_score = {
        'property_id': taxonomy['id'],
        'property_label': taxonomy['label'],
        'dimension': taxonomy['parent_label'],
        'value': profile.get('value'),
        'confidence': confidence_level,
        'coverage': round(coverage, 2),
        'multiplier': multiplier,
        'final_score': round(final_score, 3)
    }

    property_scores.append(property_score)
    dimension_map[taxonomy['parent_label']].append(final_score)

# Calculate dimension averages
dimension_scores = {}
for dimension, scores in sorted(dimension_map.items()):
    dimension_scores[dimension] = round(sum(scores) / len(scores), 3)

# Overall average
all_scores = [p['final_score'] for p in property_scores]
overall_score = round(sum(all_scores) / len(all_scores), 3)

# Build output
output = {
    'company_id': manifest['company_id'],
    'company_name': manifest['company_name'],
    'total_properties': len(property_scores),
    'property_scores': property_scores,
    'dimension_scores': dimension_scores,
    'overall_score': overall_score
}

# Write output
with open('P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/wise-scores.json', 'w') as f:
    json.dump(output, f, indent=2)

# Print results
print(f"✓ Scored {len(property_scores)} properties for {manifest['company_name']}")
print(f"\n=== DIMENSION SCORES ===")
for dim in sorted(dimension_scores.keys()):
    print(f"  {dim}: {dimension_scores[dim]}")

print(f"\n=== OVERALL SCORE: {overall_score} ===")
print(f"\n✓ Output written to: wise-scores.json")
