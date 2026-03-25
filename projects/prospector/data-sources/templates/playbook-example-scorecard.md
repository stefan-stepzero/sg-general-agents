# Playbook Example: Scorecard Tab — CSPD

## What the tab needs
Observed metrics vs sector benchmarks, grouped by category. Each metric needs a real value, a benchmark, and enough context to justify a status (on-track / watch / gap).

---

## Metric: Total Enrolments

**Why it matters:** Core health indicator. Declining = existential risk. Growing = capacity pressure.

### Signal Path A: ACARA Data (high confidence)
- Source: School Profile XLSX (free download)
- Method: `filter_acara.py` → sum Total Enrolments for matched schools
- Benchmark: NSW Catholic sector average from same dataset
- Confidence: **High** — authoritative government data, updated annually
- Limitation: ~6 month lag (2025 data reflects 2024 census)

### Signal Path B: Annual Report (medium confidence)
- Source: CSPD Annual Report PDF
- Method: `extract_pdf.py --search "enrolment"` → find stated figure
- Benchmark: Compare to prior year figure from same report
- Confidence: **Medium** — self-reported, may use different counting method
- Limitation: May round, may include ELC differently

### Signal Path C: Individual School ASRs (high confidence, high effort)
- Source: 80 individual school annual reports at `ceo-web.parra.catholic.edu.au/asr/ASR-{School}-{Suburb}.pdf`
- Method: Download all → extract enrolment per school → sum
- Benchmark: Per-school ACARA data for validation
- Confidence: **High** — granular, per-school, but enormous effort
- Limitation: URL pattern may not be consistent, some may be missing

### Fallback: MySchool website scraping (medium confidence, last resort)
- Source: myschool.edu.au (per-school pages)
- Method: Browser automation per school (behind Cloudflare)
- Confidence: **Medium** — same underlying ACARA data but harder to access
- Limitation: Cloudflare protection, rate limiting, no bulk access

---

## Metric: Student-Teacher Ratio

**Why it matters:** Proxy for resourcing quality. Low ratio = better outcomes but higher cost.

### Signal Path A: ACARA Data (high confidence)
- Source: School Profile XLSX → FTE Teaching Staff + Total Enrolments
- Method: Compute ratio per school and system-wide
- Benchmark: National Catholic average (~15:1), NSW state average
- Confidence: **High**

### Signal Path B: CSNSW Sector Report (medium confidence)
- Source: CSNSW Annual Report
- Method: `extract_pdf.py --search "staff"` → find sector-wide figure
- Benchmark: Directly provides Catholic sector benchmark
- Confidence: **Medium** — sector aggregate, may not break down by diocese

### Signal Path C: Job postings as proxy (low confidence, supplementary)
- Source: SEEK, LinkedIn, CSPD careers page
- Method: Count open teaching positions → infer vacancy pressure
- Benchmark: Compare volume to other dioceses' postings
- Confidence: **Low** — indirect signal, point-in-time snapshot
- Value: Even low confidence adds colour: "CSPD has 23 open teaching positions vs SCS's 45"

---

## Metric: NAPLAN Trajectory

**Why it matters:** The public quality signal parents use to compare schools.

### Signal Path A: ACARA Data Access Application (high confidence, gated)
- Source: ACARA Data Request Portal (requires formal application)
- Method: Submit application → receive school-level NAPLAN dataset
- Benchmark: Matched ICSEA schools nationally
- Confidence: **High** if approved
- Limitation: Application required, unknown turnaround, may be denied

### Signal Path B: Annual Report narrative (low confidence)
- Source: CSPD Annual Report
- Method: `extract_pdf.py --search "NAPLAN"` → extract qualitative statements
- Benchmark: None — just "rising" or "above average" without specifics
- Confidence: **Low** — directional only, no numbers
- Value: At minimum confirms whether they think NAPLAN is a strength or concern

### Signal Path C: MySchool per-school lookup (medium confidence, high effort)
- Source: myschool.edu.au per school
- Method: Browser automation → navigate to each school → extract NAPLAN scores
- Benchmark: Site shows "similar schools" comparison automatically
- Confidence: **Medium** — real data but enormous effort (80 schools × multiple year levels)

### Signal Path D: Media/parent forums (low confidence, supplementary)
- Source: Google News, Whirlpool forums, local newspapers
- Method: `"Catholic Schools Parramatta" NAPLAN` search
- Benchmark: None
- Confidence: **Low** — anecdotal, biased, but reveals perception
- Value: If parents are talking about NAPLAN at CSPD schools, that's a signal regardless of accuracy

---

## Metric: Funding Certainty

**Why it matters:** 75% government-funded. Policy change = existential risk.

### Signal Path A: CSNSW Funding Submission (high confidence)
- Source: CSNSW submission to Commonwealth funding review (public PDF on education.gov.au)
- Method: Download and extract funding details
- Benchmark: Compares Catholic to government school funding
- Confidence: **High** — official submission with real numbers

### Signal Path B: Commonwealth Funding Tables (high confidence)
- Source: education.gov.au per-school funding tables (2022 latest confirmed)
- Method: Download XLSX → filter to CSPD schools → sum
- Benchmark: Compare to NSW public school per-student funding
- Confidence: **High** — government data, but may be 2-3 years old

### Signal Path C: Annual Report (medium confidence)
- Source: CSPD and CSNSW annual reports
- Method: Extract any funding figures mentioned
- Benchmark: Compare to prior year
- Confidence: **Medium** — may not break down funding sources

### Signal Path D: Political signal monitoring (low confidence, contextual)
- Source: Hansard, education minister statements, policy announcements
- Method: Web search for "Catholic school funding Australia 2025"
- Benchmark: None
- Confidence: **Low** — but critical context for risk assessment
- Value: "Education minister reaffirmed funding commitment in March 2026" vs "Opposition announced funding review" changes the risk picture entirely

---

## Pattern: How playbooks should work

Each metric follows the same structure:

1. **Why it matters** — one sentence, connects to business impact
2. **Signal paths ranked by confidence** — A (highest) through D (lowest)
3. **Each path has:**
   - Source (specific document/dataset/website)
   - Method (tool or technique, as specific as possible)
   - Benchmark (what to compare against)
   - Confidence level (High/Medium/Low with reasoning)
   - Limitation (what this path can't tell you)
4. **Fallback logic:** Try A first. If A fails or is insufficient, try B. Always run C/D as supplementary regardless — even low-confidence signals add colour.

The agent running the playbook should:
- Attempt paths in order A → B → C → D
- Record which paths succeeded and which failed
- Combine signals from multiple paths where possible
- Note the overall confidence in the final metric based on which paths produced data
