# sg-general-agents

Reusable Claude Code agents and skills for any project. Not tied to Shipkit or any specific framework.

## Purpose

A library of general-purpose Claude Code agents that solve common development tasks — code review, refactoring, testing, documentation, debugging, and more. Drop them into any project's `.claude/agents/` or `.claude/skills/` directory.

## Design Principles

- **Framework-agnostic** — works with any tech stack, no Shipkit dependency
- **Self-contained** — each agent/skill is a single markdown file with no external deps
- **Composable** — agents can be used standalone or combined
- **CC-native** — follows Claude Code spec exactly (frontmatter, tools, context)

## Structure

```
.claude/
  agents/          # Reusable agent definitions (the library)
  skills/          # Reusable skill definitions (the library)
projects/
  babyneeds/       # Project-specific artifacts, context, prompts
  <project-name>/  # One subfolder per project
docs/
  claude-code-reference.md  # CC primitives reference
  learnings/                # Extracted patterns & primitives from projects
```

### Workflow

1. Build agents/skills while working on a project — artifacts go in `projects/<name>/`
2. When patterns emerge, extract reusable agents/skills into `.claude/agents/` or `.claude/skills/`
3. Document learnings in `docs/learnings/`

## Installation

Copy any agent or skill file from `.claude/agents/` or `.claude/skills/` into your target project's `.claude/` directory.
