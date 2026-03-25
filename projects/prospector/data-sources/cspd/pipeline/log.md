# CSPD Pipeline Log

## 2026-03-25

### Phase 1A: Annual Report Extraction
- **Started**: Phase 1A — extracting CSPD and CSNSW annual reports
- Agent: pipeline-data-collector
- Brief: `context/annual-report-brief.md`
- **Completed**: Extracted CSPD (48pp) + CSNSW (102pp). 44K students, 80 schools, $857M revenue. 18 school names from text — full list needs ACARA.
- Outputs: `raw/annual-report-extract.json`, `raw/school-names.json`

### Phase 1B: ACARA Data + Web Research (parallel)
- **Started**: Two agents in parallel — ACARA data extraction + web research
- **ACARA Completed**: 93 schools matched (vs 78 names — fuzzy match + postcode filtering). 51,167 total enrolments, ICSEA avg 1060, LBOTE 53.7%. 18-year trend data (2008-2025). Grade-level breakdowns included.
- **Web Research Completed**: 12 leadership entries (Patrick Ellis confirmed as EGM Learning Outcomes), Uplift framework launched Aug 2025, Sacred Heart Westmead opening T3 2026, Canvas LMS system-wide, 5-year strategic plan (Oct 2024), EA 2025 approved. No negative media.
- Outputs: `raw/acara-extract.json`, `raw/acara-trends.json`, `raw/web-research.json`

### Phase 2: Profile & Signals (parallel)
- **Started**: Two agents — profile/scorecard builder + signals builder
- **Profile Completed**: 49,577 students (ACARA), 10 EGMs named, $857M revenue, 6 gaps flagged. Scorecard: 28 metrics across 7 categories (10 strong, 12 on-track, 6 watch).
- **Signals Completed**: 13 external indicators, 8 internal indicators, 7 external risks, 5 internal risks, 8 news items. All 8 brief signal areas covered.
- Outputs: `assembled/profile.json`, `assembled/scorecard.json`, `assembled/signals.json`

### Phase 3: Peer Research
- **Started**: Researching lookalikes, competitors, and market solutions
- **Completed**: 5 lookalikes (CECG closest — Catalyst program is Uplift's ancestor; MACS Vision for Instruction 1yr ahead; BCE largest K-12 Copilot rollout globally; CEWA most mature data infra; SCS reputational competitor). 3 competitors (NSW DoE $3.6bn western Sydney build; independents growing 3.3%/yr vs CSPD 1.5%; SCS scale advantage). Market solutions: BCE AI saving 9.3hrs/wk per teacher, MACS SAP ERP transformation, CEWA predictive analytics. Gaps: LBOTE at CSPD scale, greenfield school establishment, operating deficit management, Catholic identity + AI.
- Outputs: `assembled/lookalikes.json`, `assembled/competitors.json`, `assembled/market-solutions.json`

### Phase 4: Pain Points Analysis
- **Started**: Deriving evidence-backed pain points from assembled data
- **Completed**: 22 pain points across 10 domains. 3 critical (Uplift rollout consistency, structural teacher shortage + RE accreditation barrier, operating deficit with locked salary escalation). 7 significant (analytics gap, funding concentration, infrastructure capacity, independent school erosion, back-office fragmentation, LBOTE support at scale, safeguarding demand). 6 moderate, 1 low (coverage check). Taxonomy coverage verified.
- Output: `analysis/pain-points.json`

### Phase 5: Synthesis
- **Started**: Generating opportunities and executive summary
- **Completed**: 8 opportunities (3 high, 4 medium, 1 low confidence). Top 3: Uplift resource library + external eval (buyer: Patrick Ellis), AI teacher workload reduction within domed policy (buyers: Frances Waterford + Daniel Lynch), principal analytics on Canvas + CSNSW Azure (buyers: Waterford + Ellis). 5-slide executive summary produced.
- Outputs: `analysis/opportunities.json`, `analysis/summary.json`

### Deploy to Site
- **Started**: Merging outputs into site data files
- **Completed**: 6 keyed merges (pain-points-v3, opportunities, market-solutions, indicators, lookalikes, competitive-landscape) + 2 direct copies (profile, scorecard) to `site/public/data/`

### Pipeline Complete
