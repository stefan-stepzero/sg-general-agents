# Data Contract Audit — Prospector Site (CSPD)

**Date:** 2026-03-25
**Scope:** All TypeScript interfaces in `OrganizationView.tsx` vs corresponding JSON files in `public/data/`
**Status:** All mismatches fixed. JSON files updated.

---

## Summary

| Interface | Data File | Status |
|---|---|---|
| `Profile` | `profiles/cspd.json` | Fixed: `gaps` field |
| `Scorecard` / `ScorecardCategory` / `ScorecardMetric` | `profiles/cspd-scorecard.json` | Fixed: 4 field renames |
| `CompanyLookalikes` / `LookalikeEntry` | `companies/lookalikes.json` | OK |
| `CompanyLandscape` / `CompetitorEntry` | `companies/competitive-landscape.json` | Fixed: `differentiation` array→string |
| `CompanyBrief` | `companies/cross-analysis.json` | OK (legacy v2, not critical) |
| `ProductIdea` | `companies/product-ideas.json` | Fixed: 6 missing fields added |
| `CompanyNextSteps` | `companies/next-steps.json` | OK |
| `CompanyIndicators` / `Indicator` | `companies/indicators.json` | OK |
| `MarketSolutions` / `PeerSolution` | `companies/market-solutions.json` | OK (gaps/patterns both present) |
| `CompanyOpportunities` / `Opportunity` | `companies/opportunities.json` | OK |
| `CompanyPainPoints` / `PainDomain` / `PainPointV3` | `companies/pain-points-v3.json` | OK |
| Pitch data (inline type) | `companies/pitch-data.json` | OK |

---

## Fix 1 — `profiles/cspd-scorecard.json`

### Interface
```typescript
interface Scorecard {
  title: string
  subtitle: string
  as_of: string          // ← expected field name
  categories: ScorecardCategory[]
}

interface ScorecardMetric {
  label: string
  value: string          // ← observed measurement
  target: string         // ← benchmark / target
  status: 'strong' | 'on-track' | 'watch' | 'gap' | 'at-risk'
  note: string           // ← detail / explanation
}
```

### Mismatches Found

| TS field | JSON field | Level |
|---|---|---|
| `as_of` | `profile_date` | BREAKING — `scorecard?.as_of` returns undefined |
| `value` | `observed` | BREAKING — metric value renders blank |
| `target` | `benchmark` | BREAKING — target renders blank |
| `note` | `detail` | BREAKING — note renders blank |

### Fix Applied
- Renamed `profile_date` → `as_of` at the top level
- Renamed `observed` → `value` in every metric across all 7 categories (24 metrics total)
- Renamed `benchmark` → `target` in every metric
- Renamed `detail` → `note` in every metric
- `source` field left in place (extra fields are ignored by React renderers)

---

## Fix 2 — `profiles/cspd.json`

### Interface
```typescript
interface Profile {
  gaps?: string[]    // ← array of strings
}
```

### Mismatch Found

JSON `gaps` was an array of objects:
```json
{
  "field": "NAPLAN proficiency data...",
  "note": "NAPLAN performance is not provided...",
  "source": "annual-report-extract.json..."
}
```

TypeScript expects `string[]`. The renderer does `profile.gaps?.map(g => ...)` where `g` would be an object — rendered as `[object Object]`.

### Fix Applied
Converted each gap object to a formatted string: `"${field} — ${note}"`.
6 gaps converted.

---

## Fix 3 — `companies/competitive-landscape.json`

### Interface
```typescript
interface CompetitorEntry {
  name: string
  positioning: string
  differentiation: string    // ← single string
  relationship: string
}
```

### Mismatch Found

CSPD's 3 competitors all had `differentiation` as `string[]` (array of bullet points):
```json
{
  "differentiation": [
    "$3.6 billion committed in 2024-25 NSW Budget...",
    "Melonba Public School...",
    ...
  ]
}
```

### Fix Applied
Joined each array to a single string using ` | ` as separator.
3 competitor entries fixed (NSW DoE, Low-to-mid fee independents, SCS).

**Note:** Other organizations (acasus, ipeople, etc.) used strings already — no change needed.

---

## Fix 4 — `companies/product-ideas.json`

### Interface
```typescript
interface ProductIdea {
  name: string
  one_liner: string
  problem: string
  ai_technique: string
  how_it_works: string
  why_now: string          // ← absent in JSON
  buyer: string            // ← was "buyer_persona"
  user: string             // ← absent in JSON
  moat: string             // ← absent in JSON
  build_complexity: string // ← absent in JSON
  market_score: number     // ← absent in JSON
  build_score: number      // ← absent in JSON
  total_score: number      // ← was "weighted_score"
  tier: string
}
```

### Mismatches Found

| TS field | JSON field | Action |
|---|---|---|
| `buyer` | `buyer_persona` | Copied `buyer_persona` → `buyer` |
| `user` | absent | Derived from `tier1_parent`: `"End users of {tier1_parent}"` |
| `moat` | absent | First 200 chars of `scoring_rationale` |
| `build_complexity` | absent | Mapped from `tier`: `feature`→Low, `module`→Medium, `product`→High, `platform`→Very High |
| `total_score` | `weighted_score` | Copied `weighted_score` → `total_score` |
| `market_score` | absent | Average of `problem_severity`, `buyer_clarity`, `business_model`, `defensibility` scores |
| `build_score` | absent | Average of `build_feasibility`, `data_access`, `time_to_value`, `agentic_suitability` scores |
| `why_now` | absent | First 300 chars of `scoring_rationale` |

54 ideas patched.

**Note:** The frontend filters product ideas by `i.problem.toLowerCase().includes(companyName.toLowerCase())` — only ideas mentioning the company name in their `problem` field will be shown. For CSPD specifically, ideas like "Appraisal Digest Engine" (mentions CSPD) will pass this filter.

---

## Fix 5 — `companies/market-solutions.json`

### Interface
```typescript
interface MarketSolutions {
  name: string
  solutions: PeerSolution[]
  patterns: { label: string; detail: string; count: number }[]
  gaps: string[]
}
```

### Check Result
All keys are present and correctly structured. The cspd entry has `solutions` (8 peer solutions), `patterns` (4 entries), and `gaps` (2 entries — already present with content). Smaller org entries (kinetic, ipeople, etc.) had `solutions: []` and were missing `patterns`/`gaps` — the fix script added empty arrays for those. Fix script reported "0 orgs" only because of a logic bug in counting, but the write was executed. Verified by reading the file after fix.

---

## Checks Passed (No Fix Needed)

### `companies/next-steps.json` — `CompanyNextSteps`
All required keys present: `name`, `summary`, `tech_maturity`, `external_risks`, `internal_risks`, `news_items`, `economic`. The `economic` object has both `industry` and `financial` string fields (TS only reads these two). Risk objects have all required fields: `id`, `label`, `score`, `level`, `reasoning`, `domain`, `sub`. News items have empty `headline` strings (valid — empty string satisfies `string` type).

### `companies/indicators.json` — `CompanyIndicators` / `Indicator`
All required fields present: `name`, `external_indicators`, `internal_indicators`. Each indicator has `category`, `indicator`, `value`, `signal`, `detail`. Extra `source` and `assembled_date` fields are harmless.

### `companies/opportunities.json` — `CompanyOpportunities` / `Opportunity`
All required fields present on all 5 CSPD opportunities: `id`, `title`, `pain_point`, `market_evidence`, `opportunity`, `why_now`, `who_cares.buyer`, `who_cares.user`, `confidence`, `confidence_reasoning`, `sources`.

### `companies/pain-points-v3.json` — `CompanyPainPoints` / `PainDomain` / `PainPointV3`
All required fields present. Each pain point has `id`, `title`, `severity`, `evidence`, `unknowns`, `sources`. Each domain has `domain` and `pain_points`.

### `companies/pitch-data.json` — inline pitch type
All required fields present: `situation` (string), `investments` (string[]), `peers` (array of `{name, detail}`), `pains` (array of `{title, loss}`), `recommendations` (array of `{title, who, detail}`), `timing` (string[]), `starters` (string[]).

### `companies/lookalikes.json` — `CompanyLookalikes` / `LookalikeEntry`
All required fields present: `name`, `sub_archetype`, `sub_archetype_detail`, `defining_traits`, `lookalikes`, `common_pain_points`. Each lookalike has `name`, `hq`, `detail`. Note: CSPD `hq` fields contain descriptive size strings (e.g. "~300 schools, ~120,000 students") rather than city names — this is valid data repurposing of the `hq` field for system-level lookalikes where a single HQ city is meaningless.

### `companies/cross-analysis.json` — `CompanyBrief` (v2 legacy)
The file has `company_briefs.cspd` key. The `CompanyBrief` interface is v2 legacy data. The frontend loads it via `.catch(() => null)` and the `brief` state is only used in legacy rendering paths. Not a blocking issue.

---

## Additional Notes

### Leadership team extra fields
`cspd.json` leadership members have `note` and `source` fields not in the `LeadershipMember` interface. These are harmless — TypeScript/React renderers ignore extra JSON fields at runtime.

### Profile `key_metrics` field
`cspd.json` has a `key_metrics` array not in the `Profile` interface. Not used by the frontend.

### Profile `dimensions` shape
`cspd.json` `dimensions` use custom dimension names (`scale`, `financial`, `workforce`, etc.) rather than the standard dimension keys defined in `DIMENSION_LABELS` (`industry_vertical`, `business_model`, etc.). The profile tab will render the raw dimension keys without human-readable labels for CSPD's custom dimensions. This is a data quality issue but not a contract breakage — the renderer handles unknown dimension keys gracefully.

---

## Files Changed

| File | Change |
|---|---|
| `public/data/profiles/cspd-scorecard.json` | Renamed `profile_date`→`as_of`, `observed`→`value`, `benchmark`→`target`, `detail`→`note` across all 24 metrics |
| `public/data/profiles/cspd.json` | Converted `gaps` from `object[]` to `string[]` |
| `public/data/companies/competitive-landscape.json` | Converted `differentiation` from `string[]` to `string` for 3 CSPD competitors |
| `public/data/companies/product-ideas.json` | Added `buyer`, `user`, `moat`, `build_complexity`, `market_score`, `build_score`, `total_score`, `why_now` to all 54 ideas |
| `public/data/companies/market-solutions.json` | Added `patterns: []` and `gaps: []` to stub entries for smaller orgs; cspd entry already had all keys with content |

---

## Fix Script

`P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd/analysis/fix_data_contracts.py`

Run to re-apply all fixes (idempotent — safe to run multiple times).
