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
  agents/     # Reusable agent definitions
  skills/     # Reusable skill definitions
docs/         # Usage guides and patterns
```

## Installation

Copy any agent or skill file into your project's `.claude/agents/` or `.claude/skills/` directory.
