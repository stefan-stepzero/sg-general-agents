---
paths:
  - "projects/**"
---

# Working in a Project

You are working inside a project subfolder. Before writing implementation code:

1. **Check for existing agents/skills** — does `projects/<name>/agents/` or `projects/<name>/skills/` already have relevant agents?
2. **Consider new agents** — would this task benefit from a specialized agent? Common patterns:
   - **Research**: WebFetch + WebSearch for internet research
   - **Browser**: mcp__claude-in-chrome__* for web scraping/automation
   - **Analysis**: Read-only agent for safe code/data analysis
   - **Writer**: Isolated agent for artifact generation
3. **Create before coding** — if an agent would help, create it in `projects/<name>/agents/` first, then use it
4. **Reference the spec** — read `docs/claude-code-reference.md` for correct frontmatter and patterns

When a task is complete, consider:
- Is this agent/skill reusable? → Promote to `.claude/agents/` or `.claude/skills/`
- What did you learn? → Note in `docs/learnings/`
