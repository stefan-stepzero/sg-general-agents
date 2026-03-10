---
name: create
description: "Creates a new agent or skill following CC best practices. Updates the manifest. Use when: 'create agent', 'new skill', 'add an agent for X'."
argument-hint: "[agent|skill] [name] [--project <name>]"
---

# Create Agent or Skill

Creates a new agent or skill following Claude Code best practices, registers it in the manifest, and ensures CLAUDE.md stays current.

## Input

Parse `$ARGUMENTS` for:
- **Type**: `agent` or `skill` (required — ask if missing)
- **Name**: kebab-case identifier (required — ask if missing)
- **Location flag**: `--project <name>` puts it in `projects/<name>/`, otherwise it goes in `.claude/`

## Process

### Step 1: Gather Requirements

Ask 2-3 questions:

1. **What does this agent/skill do?** — one sentence purpose
2. **What tools does it need?** — suggest based on the description:
   - Internet research → `WebFetch, WebSearch`
   - Browser automation → `mcp__claude-in-chrome__*` tools
   - Code analysis → `Read, Grep, Glob` (read-only)
   - Code generation → `Read, Write, Edit, Glob, Grep`
   - Shell operations → `Bash`
   - Orchestration → `Skill` tool for dispatch
3. **Any constraints?** — model preference, maxTurns, isolation, permission mode

### Step 2: Read Reference

Before writing anything, read the relevant section of `docs/claude-code-reference.md`:
- For agents: Part 2 (frontmatter fields, tool restrictions, fork behavior)
- For skills: Part 1 (frontmatter fields, string substitutions, context injection)

Also check `docs/templates/` for a matching starter template.

### Step 3: Determine Location

| Flag | Agent path | Skill path |
|------|-----------|------------|
| `--project foo` | `projects/foo/agents/<name>.md` | `projects/foo/skills/<name>/SKILL.md` |
| (none) | `.claude/agents/<name>.md` | `.claude/skills/<name>/SKILL.md` |

Create parent directories if they don't exist.

### Step 4: Write the File

**For agents** — write a `.md` file with:
```yaml
---
name: <name>
description: <one-line description>
tools: <CSV of tools>
model: <model>
maxTurns: <number>
---

System prompt here.
```

**For skills** — write a `SKILL.md` with:
```yaml
---
name: <name>
description: <one-line description>
allowed-tools: <CSV of tools>
---

Skill instructions here.
```

Apply these quality checks:
- [ ] Description explains WHEN to use it, not just what it does
- [ ] Tools are minimal — only what's needed, not everything
- [ ] maxTurns is set for agents (prevents runaway execution)
- [ ] model is explicit (don't rely on inherit unless intentional)
- [ ] System prompt/instructions are clear and actionable

### Step 5: Update Manifest

Read `manifest.json` from the repo root. Add an entry for the new component:

```json
{
  "name": "<name>",
  "type": "agent|skill",
  "location": "<relative path>",
  "description": "<description from frontmatter>",
  "tools": ["<tool1>", "<tool2>"],
  "project": "<project-name>|null",
  "createdAt": "<YYYY-MM-DD>"
}
```

Recompute `summary` counts and write back.

### Step 6: Confirm

Output:
```
Created <type>: <name>
Location: <path>
Tools: <tool list>
Manifest updated (X agents, Y skills)
```

## Manifest Schema

See `references/manifest-schema.md` for full schema.
