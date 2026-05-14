# CSPD Data Pipeline

This pipeline builds a defensible intelligence profile for **Catholic Schools Parramatta Diocese (CSPD)** from public data.

## How to Run

You are the orchestrator. Use the `pipeline-orchestrator` agent pattern:
1. Check `status.json` — if it exists, resume from where you left off
2. Run phases sequentially, spawning sub-agents in parallel within each phase
3. Update `status.json` and append to `log.md` after each step

## Directory Structure

```
data-sources/cspd/
├── cspd-annual-report-2023.pdf          ← Downloaded, 29MB
├── csnsw-annual-report-2024.pdf         ← Downloaded, 19MB
├── school-profile-2025.xlsx             ← Downloaded, 2MB (ACARA)
├── enrolments-by-grade-2025.xlsx        ← Downloaded, 2MB (ACARA)
├── acara-school-profile-2008-2025.xlsx  ← Downloaded, 29MB (ACARA historical)
├── raw/                                 ← Phase 1 outputs
├── assembled/                           ← Phase 2-3 outputs
├── analysis/                            ← Phase 4-5 outputs
└── pipeline/
    ├── CLAUDE.md                        ← This file
    ├── status.json                      ← Pipeline state (create if missing)
    ├── log.md                           ← Human-readable progress log
    └── context/                         ← Agent briefs per task
```

## Python Tools

In `P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/`:
- `extract_pdf.py` — PDF text extraction with page ranges and keyword search
- `filter_acara.py` — XLSX filtering with school name matching and aggregation
- `acara_trends.py` — Historical enrolment trend extraction

Agents should call these via Bash to avoid loading large files into context.

## Phases

### Phase 1A: Annual Report Extraction (1 agent, must complete first)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-data-collector | `context/annual-report-brief.md` | `raw/annual-report-extract.json`, `raw/school-names.json` |

**This must complete before Phase 1B** because `raw/school-names.json` is a dependency for the ACARA agent.

### Phase 1B: ACARA Data + Web Research (2 agents in parallel)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-data-collector | `context/acara-brief.md` | `raw/acara-extract.json`, `raw/acara-trends.json` |
| pipeline-data-collector | `context/web-research-brief.md` | `raw/web-research.json` |

### Phase 1C: Deep Data Collection (1 agent, needs Phase 1A school names)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-data-collector | `context/deep-data-brief.md` | `raw/asr-financials.json`, `raw/funding-tables.json`, `raw/abs-demographics.json` |

Downloads and extracts per-school financials from 80 individual school annual reports, Commonwealth/State funding tables, and ABS Census demographics. Provides granular financial data that the system-level annual report doesn't break down.

### Phase 2: Profile & Benchmarks (2 agents in parallel)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-profile-builder | `context/profile-brief.md` | `assembled/profile.json`, `assembled/scorecard.json` |
| pipeline-profile-builder | `context/signals-brief.md` | `assembled/signals.json` |

### Phase 3: Peer Research (1 agent)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-peer-researcher | `context/peers-brief.md` | `assembled/lookalikes.json`, `assembled/competitors.json`, `assembled/market-solutions.json` |

### Phase 4: Pain Points (1 agent)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-pain-analyser | `context/pain-points-brief.md` | `analysis/pain-points.json` |

### Phase 5: Synthesis (1 agent)

| Agent | Brief | Output |
|-------|-------|--------|
| pipeline-synthesiser | `context/synthesis-brief.md` | `analysis/opportunities.json`, `analysis/summary.json` |

## Final Step: Deploy to Site

Use the merge tool for keyed JSON files, and copy for standalone files.

Tool: `python P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools/merge_json_key.py <target> <key> <source>`

```bash
TOOLS="P:/Projects2/sg-general-agents/projects/prospector/data-sources/tools"
SITE="P:/Projects2/sg-general-agents/projects/prospector/site/public/data"
CSPD="P:/Projects2/sg-general-agents/projects/prospector/data-sources/cspd"

# Keyed merges (insert/replace the "cspd" key in target files)
python $TOOLS/merge_json_key.py $SITE/companies/pain-points-v3.json cspd $CSPD/analysis/pain-points.json
python $TOOLS/merge_json_key.py $SITE/companies/opportunities.json cspd $CSPD/analysis/opportunities.json
python $TOOLS/merge_json_key.py $SITE/companies/market-solutions.json cspd $CSPD/assembled/market-solutions.json
python $TOOLS/merge_json_key.py $SITE/companies/indicators.json cspd $CSPD/assembled/signals.json

# Keyed merges for lookalikes and competitors
python $TOOLS/merge_json_key.py $SITE/companies/lookalikes.json cspd $CSPD/assembled/lookalikes.json
python $TOOLS/merge_json_key.py $SITE/companies/competitive-landscape.json cspd $CSPD/assembled/competitors.json

# Direct copies (standalone files per org)
cp $CSPD/assembled/profile.json $SITE/profiles/cspd.json
cp $CSPD/assembled/scorecard.json $SITE/profiles/cspd-scorecard.json
```

## Core Principle

**Extract, don't generate.** Every fact cites a document. Every inference states the chain. Every unknown is flagged. If you can't find something, write it as a gap — never fabricate.
