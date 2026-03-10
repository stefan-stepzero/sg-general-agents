# sg-general-agents

Reusable Claude Code agents and skills library. Framework-agnostic.

## Repo Structure

- `.claude/agents/` — Reusable agent definitions (the library)
- `.claude/skills/` — Reusable skill definitions (the library)
- `projects/<name>/` — Per-project artifacts, context, prompts, and work-in-progress agents/skills
- `docs/claude-code-reference.md` — CC primitives reference (skills, agents, hooks, settings)
- `docs/templates/` — Starter agent/skill templates for common patterns
- `docs/learnings/` — Extracted patterns and primitives from project work

## Core Directive

**Before writing code directly, always consider whether the task warrants a dedicated agent or skill.**

Read `docs/claude-code-reference.md` before creating any agent or skill. This is the canonical reference for CC primitives — frontmatter fields, tool restrictions, fork behavior, nesting patterns, and confirmed gotchas.

### When to Create an Agent

Create a project-specific agent in `projects/<name>/agents/` when:
- A task requires a specialized persona (researcher, reviewer, planner)
- A task benefits from isolated context (`context: fork`)
- A task needs tool restrictions (read-only research, no-edit analysis)
- A task should run in the background or with `maxTurns` budget
- Multiple steps share a common role that would benefit from persistent memory

### When to Create a Skill

Create a project-specific skill in `projects/<name>/skills/` when:
- A workflow will be repeated (research → synthesize → output)
- A task needs dynamic context injection (`` !`command` ``)
- A task requires structured output or specific format
- A human decision must be captured and persisted

## Agent Design Patterns

Always consider these patterns when designing agents for a project:

### Research Agent
- `model: sonnet` or `haiku` depending on depth needed
- `tools: Read, Grep, Glob, Bash, WebFetch, WebSearch`
- Use for gathering information from the internet, APIs, documentation
- Should output structured findings, not raw dumps

### Browser Automation Agent
- Tools: `mcp__claude-in-chrome__*` (navigate, read_page, get_page_text, javascript_tool, form_input, find)
- Use for scraping, form filling, testing, data extraction from web UIs
- Always call `tabs_context_mcp` first to understand current browser state
- Consider `mcp__claude-in-chrome__gif_creator` for recording multi-step flows

### Analysis Agent
- `tools: Read, Grep, Glob` (read-only)
- `disallowedTools: Write, Edit, Bash`
- Use for code review, pattern detection, auditing
- Safe to run with `permissionMode: dontAsk`

### Orchestrator Agent
- `model: sonnet` or `opus`
- `skills: <list of skills to dispatch>`
- Coordinates multi-step workflows by invoking skills via Skill tool
- Uses `maxTurns` to bound execution

### Writer/Generator Agent
- `tools: Read, Write, Edit, Glob, Grep`
- Produces artifacts (documents, code, configs)
- Use `isolation: worktree` when generating code that shouldn't affect main branch

## Conventions

- Agents/skills in `.claude/` are **reusable** — they must work across any project
- Project subfolders hold **project-specific** artifacts (prompts, context, drafts)
- When a project-specific agent/skill proves reusable, promote it to `.claude/`
- Document the extraction in `docs/learnings/`
- All agents/skills follow CC spec exactly
- No Shipkit dependency — everything here is vanilla Claude Code

## Project Workflow

1. **Start a project** — create `projects/<name>/` with a brief README describing the goal
2. **Design agents first** — before coding, identify what agents/skills the project needs
3. **Build iteratively** — create agents in `projects/<name>/agents/`, test, refine
4. **Extract reusables** — when an agent/skill works well and is project-agnostic, promote to `.claude/`
5. **Document learnings** — write up what worked, what didn't, patterns discovered in `docs/learnings/`
