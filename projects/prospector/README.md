# Prospector

Multi-team agentic pipeline for business development intelligence.

Given a list of target companies (where we know senior leadership), Prospector:
1. **Recon** — Builds deep company profiles via browser automation
2. **Discovery** — Identifies AI/product opportunity gaps per company
3. **Pitch** — Generates tailored pitch books per opportunity

## Design Principle

Agents are **reusable** (live in `.claude/agents/`). Project-specific artifacts — frameworks, templates, output schemas, company lists — live here in `projects/prospector/`.
