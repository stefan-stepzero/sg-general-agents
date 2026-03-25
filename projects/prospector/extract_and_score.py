#!/usr/bin/env python3
"""
Extract WISE manifest and score all properties.
Confidence → Multiplier: high=1.0, medium-high=0.9, medium=0.85, low-medium=0.7, low=0.55
Coverage → 0.0 to 1.0 scale
Final = Coverage × Multiplier
"""

import json
import re
from collections import defaultdict

manifest_path = 'P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/wise-manifest.json'

# Read the full JSON file
with open(manifest_path, 'r', encoding='utf-8') as f:
    manifest = json.load(f)

# Confidence multipliers
confidence_to_multiplier = {
    'high': 1.0,
    'medium-high': 0.9,
    'medium': 0.85,
    'low-medium': 0.7,
    'low': 0.55,
    'not stated': 0.7
}

def score_coverage(value, evidence):
    """
    Score coverage 0-1:
    1.0 = precise match with strong evidence
    0.8 = clear with some gaps
    0.6 = reasonable but generic
    0.4 = vague/weak
    0.2 = placeholder
    0.0 = missing
    """
    # Missing
    if not value or value is None:
        return 0.0

    value_str = str(value).strip().lower()

    # Check for placeholders
    placeholders = ['n/a', 'unknown', 'tbd', 'not provided', 'not stated', 'none', '']
    if value_str in placeholders:
        return 0.2

    # Assess evidence quality
    evidence_str = str(evidence).strip() if evidence else ''
    evidence_length = len(evidence_str)
    value_length = len(str(value).strip())

    # Vague/weak: minimal value and no evidence
    if value_length < 15 and evidence_length < 30:
        return 0.4

    # Reasonable but generic: moderate evidence, moderate specificity
    if evidence_length >= 30 and evidence_length < 80:
        return 0.6

    # Clear with some gaps: good evidence but not highly specific
    if evidence_length >= 80 and evidence_length < 150 and value_length < 60:
        return 0.8

    # Precise match: detailed evidence and good specificity
    if evidence_length >= 80:
        if value_length >= 60 or evidence_length >= 150:
            return 1.0
        else:
            return 0.8

    # Default for weak evidence
    if evidence_length >= 30:
        return 0.6

    return 0.4

# Process each item
property_scores = []
dimension_scores_list = defaultdict(list)

for item in manifest['items']:
    taxonomy = item['taxonomy_node']
    profile = item['profile_fill']

    prop_id = taxonomy['id']
    prop_label = taxonomy['label']
    dimension = taxonomy['parent_label']
    value = profile.get('value')
    evidence = profile.get('evidence', '')
    confidence = profile.get('confidence', 'not stated')

    # Score
    coverage = score_coverage(value, evidence)
    multiplier = confidence_to_multiplier.get(confidence, 0.7)
    final_score = round(coverage * multiplier, 3)

    # Record
    property_scores.append({
        'property_id': prop_id,
        'property_label': prop_label,
        'dimension': dimension,
        'value': value,
        'confidence': confidence,
        'coverage': round(coverage, 2),
        'multiplier': multiplier,
        'final_score': final_score
    })

    # Track for dimension averaging
    dimension_scores_list[dimension].append(final_score)

# Calculate dimension averages
dimension_scores = {}
for dimension in sorted(dimension_scores_list.keys()):
    scores = dimension_scores_list[dimension]
    avg = round(sum(scores) / len(scores), 3)
    dimension_scores[dimension] = avg

# Overall average
all_final_scores = [p['final_score'] for p in property_scores]
overall_score = round(sum(all_final_scores) / len(all_final_scores), 3)

# Build output JSON
output = {
    'company_id': manifest['company_id'],
    'company_name': manifest['company_name'],
    'total_properties': len(property_scores),
    'property_scores': property_scores,
    'dimension_scores': dimension_scores,
    'overall_score': overall_score
}

# Write to file
output_path = 'P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/wise-scores.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print('✓ Scoring complete!')
print(f'✓ Properties scored: {len(property_scores)}')
print(f'✓ Overall score: {overall_score}')
print(f'✓ Output: {output_path}')
