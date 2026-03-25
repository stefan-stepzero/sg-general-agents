#!/usr/bin/env python3
"""
Score company profile properties against taxonomy definitions.
Coverage (0–1): 1.0=precise match, 0.8=clear with gaps, 0.6=reasonable, 0.4=vague, 0.2=placeholder, 0.0=missing
Confidence Multiplier: high=1.0, medium-high=0.9, medium=0.85, low-medium=0.7, low=0.55, not stated=0.7
Final Score = Coverage × Confidence Multiplier
"""

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

# Coverage mapping function
def assess_coverage(profile_fill):
    """Assess coverage based on value, evidence quality, and completeness."""
    value = profile_fill.get('value')
    evidence = profile_fill.get('evidence', '')

    # Missing
    if not value or value == 'null' or value is None:
        return 0.0

    # Check value quality
    value_str = str(value).strip().lower()

    # Placeholder (e.g., "N/A", "Unknown", "TBD", "Not provided")
    if value_str in ['n/a', 'unknown', 'tbd', 'not provided', 'not stated', 'none', '']:
        return 0.2

    # Vague (e.g., single word, no supporting evidence)
    if len(value_str) < 5 and not evidence:
        return 0.4

    # Check evidence quality
    evidence_str = str(evidence).strip()
    has_evidence = len(evidence_str) > 30

    # Vague/weak (weak value, minimal evidence)
    if len(value_str) < 15 and not has_evidence:
        return 0.4

    # Reasonable but generic (value present, some evidence, but could be more specific)
    if has_evidence and len(evidence_str) < 100:
        return 0.6

    # Clear with some gaps (good evidence, reasonable specificity)
    if has_evidence and len(evidence_str) >= 100 and len(value_str) < 50:
        return 0.8

    # Precise match (strong value, detailed evidence)
    if has_evidence and len(evidence_str) >= 100 and len(value_str) >= 50:
        return 1.0

    # Clear with some gaps (default for moderate cases)
    if has_evidence:
        return 0.8

    return 0.6

# Score each property
property_scores = []
dimension_map = defaultdict(list)

for item in manifest['items']:
    taxonomy = item['taxonomy_node']
    profile = item['profile_fill']

    # Assess coverage
    coverage = assess_coverage(profile)

    # Get confidence multiplier
    confidence_level = profile.get('confidence', 'not stated')
    multiplier = confidence_multipliers.get(confidence_level, 0.7)

    # Calculate final score
    final_score = coverage * multiplier

    # Record score
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
for dimension, scores in dimension_map.items():
    dimension_scores[dimension] = round(sum(scores) / len(scores), 3)

# Calculate overall average
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

# Print summary
print(f"✓ Scored {len(property_scores)} properties")
print(f"\nDimension Scores:")
for dim, score in sorted(dimension_scores.items()):
    print(f"  {dim}: {score}")
print(f"\nOverall Score: {overall_score}")
print(f"\n✓ Written to: P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/wise-scores.json")
