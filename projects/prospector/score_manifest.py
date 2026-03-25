#!/usr/bin/env python3
"""
Score company profile properties against taxonomy definitions.
"""
import json
from collections import defaultdict

# Confidence multipliers
CONFIDENCE_MULTIPLIERS = {
    "high": 1.0,
    "medium-high": 0.9,
    "medium": 0.85,
    "low-medium": 0.7,
    "low": 0.55,
    "not stated": 0.7
}

# Coverage assessment rules
def assess_coverage(profile_fill):
    """Assess coverage on 0-1 scale based on value and evidence quality."""
    value = profile_fill.get("value")
    evidence = profile_fill.get("evidence", "")
    note = profile_fill.get("note")

    # Missing value = 0
    if not value or value.lower() == "not specified":
        return 0.0

    # Placeholder/minimal = 0.2
    if value.lower() in ["tbd", "unknown", "pending", "to be determined"]:
        return 0.2

    # No evidence = 0.4 (value exists but not well-supported)
    if not evidence or len(evidence.strip()) < 20:
        return 0.4

    # Short evidence (< 60 chars) = 0.6 (reasonable but generic)
    if len(evidence.strip()) < 60:
        return 0.6

    # Medium evidence (60-200 chars) with gaps noted = 0.8 (clear with some gaps)
    if len(evidence.strip()) < 200:
        if note and "unclear" in note.lower():
            return 0.8
        return 0.85  # Good evidence

    # Long evidence (200+ chars) = high quality
    # Check for specificity and concreteness
    specificity_markers = [
        "founded", "year", "revenue", "employees", "headquarters",
        "operates", "provides", "offers", "specializes", "primary",
        "website", "self-description", "listed", "described as",
        "clients", "customers", "partnership"
    ]

    has_specificity = any(marker in evidence.lower() for marker in specificity_markers)

    if has_specificity:
        return 1.0  # Precise match with evidence
    else:
        return 0.85  # Clear with good evidence

def main():
    # Read manifest
    with open("P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/ipeople-manifest.json") as f:
        manifest = json.load(f)

    company_id = manifest["company_id"]
    items = manifest["items"]

    # Track dimensions and scores
    dimensions = defaultdict(list)
    property_scores = []

    # Score each property
    for item in items:
        taxonomy = item["taxonomy_node"]
        profile = item["profile_fill"]

        tax_id = taxonomy["id"]
        tax_label = taxonomy["label"]
        parent_label = taxonomy.get("parent_label", "Unknown")

        # Assess coverage
        coverage = assess_coverage(profile)

        # Get confidence multiplier
        confidence_str = profile.get("confidence", "not stated").lower()
        multiplier = CONFIDENCE_MULTIPLIERS.get(confidence_str, 0.7)

        # Calculate final score
        final_score = coverage * multiplier

        # Build property score
        prop_score = {
            "taxonomy_id": tax_id,
            "taxonomy_label": tax_label,
            "dimension": parent_label,
            "profile_value": profile.get("value"),
            "coverage": round(coverage, 2),
            "confidence": confidence_str,
            "multiplier": multiplier,
            "final_score": round(final_score, 2)
        }
        property_scores.append(prop_score)

        # Track by dimension
        dimensions[parent_label].append(final_score)

    # Calculate dimension averages
    dimension_scores = {}
    for dim, scores in sorted(dimensions.items()):
        avg = sum(scores) / len(scores) if scores else 0.0
        dimension_scores[dim] = round(avg, 2)

    # Calculate overall average
    all_scores = [item["final_score"] for item in property_scores]
    overall_score = sum(all_scores) / len(all_scores) if all_scores else 0.0

    # Build output
    output = {
        "company_id": company_id,
        "property_scores": property_scores,
        "dimension_scores": dimension_scores,
        "overall_score": round(overall_score, 2),
        "total_properties": len(property_scores),
        "scoring_timestamp": "2026-03-11"
    }

    # Write to file
    output_path = "P:/Projects2/sg-general-agents/projects/prospector/outputs/scoring/ipeople-scores.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Scoring complete!")
    print(f"Company: {company_id}")
    print(f"Total properties scored: {len(property_scores)}")
    print(f"\nDimension Scores:")
    for dim, score in sorted(dimension_scores.items()):
        print(f"  {dim}: {score}")
    print(f"\nOverall Score: {overall_score:.2f}")
    print(f"\nOutput written to: {output_path}")

if __name__ == "__main__":
    main()
