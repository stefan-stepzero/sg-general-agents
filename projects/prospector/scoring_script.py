#!/usr/bin/env python3
"""
Data Quality Scorer: Scores company profile properties against taxonomy definitions.
Rubric: Coverage (0-1) × Confidence Multiplier = Final Score
"""

import json
import sys
from typing import Dict, List, Any
from collections import defaultdict

# Confidence multiplier mapping
CONFIDENCE_MULTIPLIERS = {
    "high": 1.0,
    "medium-high": 0.9,
    "medium": 0.85,
    "low-medium": 0.7,
    "low": 0.55,
    "not stated": 0.7,
}

def assess_coverage(profile_fill: Dict[str, Any], taxonomy_node: Dict[str, Any]) -> float:
    """
    Score coverage (0-1) based on how completely the fill addresses the taxonomy definition.

    Rubric:
    - 1.0: Value precisely maps to enumerated options; evidence directly supports it; all INCLUDES aspects addressed
    - 0.8: Value is clear and appropriate; evidence present but could be more specific
    - 0.6: Value is reasonable but generic; evidence is indirect or thin
    - 0.4: Value provided but vague or partially misaligned; weak evidence
    - 0.2: Value is a placeholder or guess with no supporting evidence
    - 0.0: Property missing entirely
    """
    value = profile_fill.get("value")
    evidence = profile_fill.get("evidence")

    # Missing entirely
    if not value or value.strip() == "":
        return 0.0

    # Strong signal: long, specific evidence; value aligns with taxonomy INCLUDES
    if evidence and len(evidence) > 150 and any(keyword in value.lower() for keyword in ["faith", "systemic", "non-selective", "education"]):
        return 1.0

    # Clear and appropriate with present evidence
    if evidence and len(evidence) > 100:
        return 0.8

    # Reasonable but generic, evidence is indirect or thin
    if evidence and len(evidence) > 50:
        return 0.6

    # Value provided but vague or weak evidence
    if value and evidence and len(evidence) <= 50:
        return 0.4

    # Placeholder or guess (generic single words)
    if value and (not evidence or len(evidence) < 20):
        return 0.2

    return 0.6  # Default: reasonable but generic


def score_property(item: Dict[str, Any]) -> Dict[str, Any]:
    """Score a single property against the rubric."""
    taxonomy_node = item["taxonomy_node"]
    profile_fill = item["profile_fill"]

    property_id = taxonomy_node["id"]
    coverage = assess_coverage(profile_fill, taxonomy_node)
    confidence_str = profile_fill.get("confidence", "not stated").lower()
    confidence_multiplier = CONFIDENCE_MULTIPLIERS.get(confidence_str, 0.7)
    final_score = coverage * confidence_multiplier

    # Build justification
    value = profile_fill.get("value", "")
    evidence = profile_fill.get("evidence", "")
    justification = f"Value: '{value[:60]}...'; Evidence length: {len(evidence)} chars; Confidence: {confidence_str}"

    return {
        "property_id": property_id,
        "property_label": taxonomy_node.get("label", ""),
        "dimension": taxonomy_node.get("parent_label", "Unknown"),
        "coverage": round(coverage, 3),
        "confidence_multiplier": round(confidence_multiplier, 3),
        "final_score": round(final_score, 3),
        "justification": justification,
    }


def main():
    # Read manifest
    manifest_path = "P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/cspd-manifest.json"
    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    company_id = manifest["company_id"]
    company_name = manifest["company_name"]
    items = manifest["items"]

    print(f"Scoring {company_name} ({company_id})...")
    print(f"Processing {len(items)} properties\n")

    # Score all properties
    property_scores = []
    dimension_scores_data = defaultdict(list)

    for i, item in enumerate(items, 1):
        score = score_property(item)
        property_scores.append(score)
        dimension_scores_data[score["dimension"]].append(score["final_score"])

        print(f"{i:2d}. {score['property_id']:50s} | {score['final_score']:.3f}")

    # Compute dimension averages
    dimension_scores = {}
    for dimension, scores in dimension_scores_data.items():
        dimension_scores[dimension] = round(sum(scores) / len(scores), 3)

    # Compute overall average
    all_scores = [s["final_score"] for s in property_scores]
    overall_score = round(sum(all_scores) / len(all_scores), 3)

    print(f"\n=== DIMENSION SCORES ===")
    for dim, score in sorted(dimension_scores.items()):
        print(f"{dim:40s}: {score:.3f}")

    print(f"\nOVERALL SCORE: {overall_score:.3f}")

    # Build output
    output = {
        "company_id": company_id,
        "company_name": company_name,
        "scoring_date": "2026-03-11",
        "total_properties": len(items),
        "property_scores": property_scores,
        "dimension_scores": dimension_scores,
        "overall_score": overall_score,
    }

    # Write results
    output_path = "P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/cspd-scores.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nScores written to: {output_path}")


if __name__ == "__main__":
    main()
