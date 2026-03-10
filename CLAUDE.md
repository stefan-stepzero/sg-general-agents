# sg-general-agents

Reusable Claude Code agents and skills library. Framework-agnostic.

## Repo Structure

- `.claude/agents/` — Reusable agent definitions (the library)
- `.claude/skills/` — Reusable skill definitions (the library)
- `projects/<name>/` — Per-project artifacts, context, prompts, and work-in-progress agents/skills
- `docs/claude-code-reference.md` — CC primitives reference (skills, agents, hooks, settings)
- `docs/learnings/` — Extracted patterns and primitives from project work

## Conventions

- Agents/skills in `.claude/` are **reusable** — they must work across any project
- Project subfolders hold **project-specific** artifacts (prompts, context, drafts)
- When a project-specific agent/skill proves reusable, promote it to `.claude/`
- Document the extraction in `docs/learnings/`
- All agents/skills follow CC spec exactly — read `docs/claude-code-reference.md` before authoring
- No Shipkit dependency — everything here is vanilla Claude Code
