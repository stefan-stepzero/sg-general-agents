#!/usr/bin/env python3
"""
Data contract fix script for Prospector site.
Fixes mismatches between TypeScript interfaces and JSON data files.

Run from any directory:
  python fix_data_contracts.py
"""

import json
import os

BASE = "P:/Projects2/sg-general-agents/projects/prospector/site/public/data"

def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  WRITTEN: {path}")


# ============================================================
# FIX 1: cspd-scorecard.json
# Problem: TypeScript Scorecard expects "as_of" but JSON has "profile_date"
# Problem: TypeScript ScorecardMetric expects "value", "target", "note"
#          but JSON has "observed", "benchmark", "detail" (and "source")
# Fix: rename fields to match the interface
# ============================================================
def fix_scorecard():
    path = f"{BASE}/profiles/cspd-scorecard.json"
    data = read(path)

    # Fix top-level: rename profile_date -> as_of
    if "profile_date" in data and "as_of" not in data:
        data["as_of"] = data.pop("profile_date")
        print("  scorecard: profile_date -> as_of")

    # Fix each metric: observed -> value, benchmark -> target, detail -> note
    for cat in data.get("categories", []):
        for metric in cat.get("metrics", []):
            if "observed" in metric and "value" not in metric:
                metric["value"] = metric.pop("observed")
            if "benchmark" in metric and "target" not in metric:
                metric["target"] = metric.pop("benchmark")
            if "detail" in metric and "note" not in metric:
                metric["note"] = metric.pop("detail")
            # "source" is extra — leave it, won't break TS (extra fields ignored)

    write(path, data)


# ============================================================
# FIX 2: profiles/cspd.json
# Problem: TypeScript Profile expects "gaps: string[]"
#          but JSON has "gaps: {field, note, source}[]"
# Fix: convert each gap object to a formatted string
# ============================================================
def fix_profile_gaps():
    path = f"{BASE}/profiles/cspd.json"
    data = read(path)

    gaps = data.get("gaps", [])
    if gaps and isinstance(gaps[0], dict):
        string_gaps = []
        for g in gaps:
            parts = []
            if "field" in g:
                parts.append(g["field"])
            if "note" in g:
                parts.append(g["note"])
            string_gaps.append(" — ".join(parts) if parts else str(g))
        data["gaps"] = string_gaps
        print(f"  profile: converted {len(string_gaps)} gap objects to strings")

    write(path, data)


# ============================================================
# FIX 3: companies/competitive-landscape.json
# Problem: TypeScript CompetitorEntry expects "differentiation: string"
#          but cspd competitors have "differentiation: string[]"
# Fix: join array to a single string for affected companies
# ============================================================
def fix_competitive_landscape():
    path = f"{BASE}/companies/competitive-landscape.json"
    data = read(path)

    fixed = 0
    for org_id, org_data in data.items():
        for competitor in org_data.get("competitors", []):
            if isinstance(competitor.get("differentiation"), list):
                competitor["differentiation"] = " | ".join(competitor["differentiation"])
                fixed += 1

    print(f"  competitive-landscape: fixed {fixed} differentiation arrays -> strings")
    write(path, data)


# ============================================================
# FIX 4: companies/product-ideas.json
# Problem: TypeScript ProductIdea expects:
#   name, one_liner, problem, ai_technique, how_it_works, why_now,
#   buyer, user, moat, build_complexity, market_score, build_score,
#   total_score, tier
# JSON has:
#   - "buyer_persona" instead of "buyer" / "user"
#   - "weighted_score" instead of "market_score"/"build_score"/"total_score"
#   - "how_it_works" present (good)
#   - "why_now" absent
#   - "moat" absent
#   - "build_complexity" absent
#   - "tier" present but values are "feature"/"module" not the scored tier
# Fix: map fields so TS can render something reasonable
# ============================================================
def fix_product_ideas():
    path = f"{BASE}/companies/product-ideas.json"
    data = read(path)

    fixed = 0
    for idea in data.get("ideas", []):
        # buyer: use buyer_persona if buyer absent
        if "buyer" not in idea and "buyer_persona" in idea:
            idea["buyer"] = idea["buyer_persona"]
        # user: synthesize from tier1_parent if user absent
        if "user" not in idea:
            parent = idea.get("tier1_parent", "")
            idea["user"] = f"End users of {parent}" if parent else "Education administrators"
        # moat: absent — provide a placeholder
        if "moat" not in idea:
            idea["moat"] = idea.get("scoring_rationale", "")[:200] if "scoring_rationale" in idea else ""
        # build_complexity: map from tier
        if "build_complexity" not in idea:
            tier = idea.get("tier", "")
            complexity_map = {"feature": "Low", "module": "Medium", "product": "High", "platform": "Very High"}
            idea["build_complexity"] = complexity_map.get(tier, "Medium")
        # scores: map weighted_score to total_score; derive market/build from sub-scores
        scores = idea.get("scores", {})
        if "total_score" not in idea:
            idea["total_score"] = idea.get("weighted_score", 0)
        if "market_score" not in idea:
            market_keys = ["problem_severity", "buyer_clarity", "business_model", "defensibility"]
            vals = [scores.get(k, 0) for k in market_keys if k in scores]
            idea["market_score"] = round(sum(vals) / len(vals), 1) if vals else 0
        if "build_score" not in idea:
            build_keys = ["build_feasibility", "data_access", "time_to_value", "agentic_suitability"]
            vals = [scores.get(k, 0) for k in build_keys if k in scores]
            idea["build_score"] = round(sum(vals) / len(vals), 1) if vals else 0
        # why_now: absent — derive from scoring_rationale
        if "why_now" not in idea:
            idea["why_now"] = idea.get("scoring_rationale", "")[:300] if "scoring_rationale" in idea else ""
        fixed += 1

    print(f"  product-ideas: patched {fixed} ideas with missing fields")
    write(path, data)


# ============================================================
# FIX 5: companies/market-solutions.json
# Problem: TypeScript MarketSolutions expects top-level keys:
#   name, solutions, patterns, gaps
# JSON cspd entry has: name, solutions, patterns — but no "gaps"
# Fix: add "gaps: []" where missing
# ============================================================
def fix_market_solutions():
    path = f"{BASE}/companies/market-solutions.json"
    data = read(path)

    fixed = 0
    for org_id, org_data in data.items():
        if "gaps" not in org_data:
            org_data["gaps"] = []
            fixed += 1
        if "patterns" not in org_data:
            org_data["patterns"] = []
            fixed += 1

    print(f"  market-solutions: added missing 'gaps'/'patterns' keys to {fixed} orgs")
    write(path, data)


# ============================================================
# FIX 6: companies/next-steps.json
# Problem: TypeScript CompanyNextSteps expects:
#   name, summary, tech_maturity, external_risks: Risk[], internal_risks: Risk[],
#   news_items: {headline, date, summary}[], economic: {industry: string, financial: string}
# JSON cspd has all of these at top level but "economic" is an object
# with sub-keys (market_position, growth_phase, etc.) in addition to
# industry and financial strings. The industry and financial fields exist
# as truncated strings. No issue — TS only reads .industry and .financial.
#
# news_items has entries with empty headline "". TS expects headline: string.
# That's technically fine (empty string is a string). No fix needed.
#
# The Risk interface expects: id, label, score, level, reasoning, domain, sub
# JSON risks have all of these. No fix needed.
# ============================================================
def check_next_steps():
    path = f"{BASE}/companies/next-steps.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    required_keys = ["name", "summary", "tech_maturity", "external_risks",
                     "internal_risks", "news_items", "economic"]
    for k in required_keys:
        if k not in cspd:
            issues.append(f"  next-steps cspd: MISSING key '{k}'")

    econ = cspd.get("economic", {})
    if "industry" not in econ:
        issues.append("  next-steps cspd.economic: MISSING 'industry'")
    if "financial" not in econ:
        issues.append("  next-steps cspd.economic: MISSING 'financial'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  next-steps cspd: all required keys present — no fix needed")


# ============================================================
# FIX 7: companies/indicators.json
# TypeScript CompanyIndicators expects:
#   name, external_indicators: Indicator[], internal_indicators: Indicator[]
# Indicator expects: category, indicator, value, signal, detail
# cspd entry has "assembled_date" extra (fine) and indicators match shape.
# ============================================================
def check_indicators():
    path = f"{BASE}/companies/indicators.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    for key in ["name", "external_indicators", "internal_indicators"]:
        if key not in cspd:
            issues.append(f"  indicators cspd: MISSING key '{key}'")

    for kind in ["external_indicators", "internal_indicators"]:
        for i, ind in enumerate(cspd.get(kind, [])):
            for field in ["category", "indicator", "value", "signal", "detail"]:
                if field not in ind:
                    issues.append(f"  indicators cspd.{kind}[{i}]: MISSING '{field}'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  indicators cspd: all required fields present — no fix needed")


# ============================================================
# FIX 8: companies/opportunities.json
# TypeScript Opportunity expects:
#   id, title, pain_point, market_evidence, opportunity, why_now,
#   who_cares: {buyer, user}, confidence, confidence_reasoning, sources
# CompanyOpportunities expects: name, opportunities
# ============================================================
def check_opportunities():
    path = f"{BASE}/companies/opportunities.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    for i, opp in enumerate(cspd.get("opportunities", [])):
        for field in ["id", "title", "pain_point", "market_evidence",
                      "opportunity", "why_now", "confidence",
                      "confidence_reasoning", "sources"]:
            if field not in opp:
                issues.append(f"  opportunities cspd[{i}]: MISSING '{field}'")
        who = opp.get("who_cares", {})
        if "buyer" not in who:
            issues.append(f"  opportunities cspd[{i}].who_cares: MISSING 'buyer'")
        if "user" not in who:
            issues.append(f"  opportunities cspd[{i}].who_cares: MISSING 'user'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  opportunities cspd: all required fields present — no fix needed")


# ============================================================
# FIX 9: companies/pain-points-v3.json
# TypeScript PainPointV3 expects:
#   id, title, severity, evidence, unknowns, sources: string[]
# PainDomain expects: domain, pain_points
# CompanyPainPoints expects: name, domains
# ============================================================
def check_pain_points():
    path = f"{BASE}/companies/pain-points-v3.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    for d_idx, domain in enumerate(cspd.get("domains", [])):
        if "domain" not in domain:
            issues.append(f"  pain-points cspd.domains[{d_idx}]: MISSING 'domain'")
        for p_idx, pp in enumerate(domain.get("pain_points", [])):
            for field in ["id", "title", "severity", "evidence", "unknowns", "sources"]:
                if field not in pp:
                    issues.append(f"  pain-points cspd.domains[{d_idx}].pain_points[{p_idx}]: MISSING '{field}'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  pain-points-v3 cspd: all required fields present — no fix needed")


# ============================================================
# FIX 10: companies/pitch-data.json
# Inline TS type: situation, investments, peers, pains, recommendations, timing, starters
# ============================================================
def check_pitch_data():
    path = f"{BASE}/companies/pitch-data.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    for field in ["situation", "investments", "peers", "pains",
                  "recommendations", "timing", "starters"]:
        if field not in cspd:
            issues.append(f"  pitch-data cspd: MISSING '{field}'")

    for i, peer in enumerate(cspd.get("peers", [])):
        for f in ["name", "detail"]:
            if f not in peer:
                issues.append(f"  pitch-data cspd.peers[{i}]: MISSING '{f}'")

    for i, pain in enumerate(cspd.get("pains", [])):
        for f in ["title", "loss"]:
            if f not in pain:
                issues.append(f"  pitch-data cspd.pains[{i}]: MISSING '{f}'")

    for i, rec in enumerate(cspd.get("recommendations", [])):
        for f in ["title", "who", "detail"]:
            if f not in rec:
                issues.append(f"  pitch-data cspd.recommendations[{i}]: MISSING '{f}'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  pitch-data cspd: all required fields present — no fix needed")


# ============================================================
# FIX 11: companies/lookalikes.json
# TypeScript LookalikeEntry expects: name, hq, detail
# CSPD lookalikes have name, hq (repurposed as size string), detail — matches
# LookalikePainPoint expects: pain, prevalence, detail
# CSPD has "common_pain_points: []" — empty array, technically fine
# CompanyLookalikes expects: name, sub_archetype, sub_archetype_detail,
#   defining_traits, lookalikes, common_pain_points
# ============================================================
def check_lookalikes():
    path = f"{BASE}/companies/lookalikes.json"
    data = read(path)
    cspd = data.get("cspd", {})

    issues = []
    for field in ["name", "sub_archetype", "sub_archetype_detail",
                  "defining_traits", "lookalikes", "common_pain_points"]:
        if field not in cspd:
            issues.append(f"  lookalikes cspd: MISSING '{field}'")

    for i, la in enumerate(cspd.get("lookalikes", [])):
        for f in ["name", "hq", "detail"]:
            if f not in la:
                issues.append(f"  lookalikes cspd.lookalikes[{i}]: MISSING '{f}'")

    if issues:
        for i in issues:
            print(i)
    else:
        print("  lookalikes cspd: all required fields present — no fix needed")


# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    print("\n=== APPLYING FIXES ===\n")

    print("[FIX 1] Scorecard: rename profile_date->as_of, observed->value, benchmark->target, detail->note")
    fix_scorecard()

    print("\n[FIX 2] Profile: convert gaps objects to strings")
    fix_profile_gaps()

    print("\n[FIX 3] Competitive landscape: join differentiation arrays to strings")
    fix_competitive_landscape()

    print("\n[FIX 4] Product ideas: add missing buyer, user, moat, build_complexity, *_score, why_now fields")
    fix_product_ideas()

    print("\n[FIX 5] Market solutions: add missing gaps/patterns keys")
    fix_market_solutions()

    print("\n[CHECK 6] Next steps structure")
    check_next_steps()

    print("\n[CHECK 7] Indicators structure")
    check_indicators()

    print("\n[CHECK 8] Opportunities structure")
    check_opportunities()

    print("\n[CHECK 9] Pain points v3 structure")
    check_pain_points()

    print("\n[CHECK 10] Pitch data structure")
    check_pitch_data()

    print("\n[CHECK 11] Lookalikes structure")
    check_lookalikes()

    print("\n=== DONE ===\n")
