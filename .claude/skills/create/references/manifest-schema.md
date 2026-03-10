# Manifest Schema

The manifest at `manifest.json` (repo root) is the single source of truth for all agents and skills in this repository.

## Schema

```json
{
  "version": "1.0",
  "lastUpdated": "YYYY-MM-DD",
  "summary": {
    "totalAgents": 0,
    "totalSkills": 0,
    "reusable": 0,
    "projectSpecific": 0,
    "byProject": {}
  },
  "components": [
    {
      "name": "component-name",
      "type": "agent | skill",
      "location": "relative/path/to/file",
      "description": "When to use this component",
      "tools": ["Tool1", "Tool2"],
      "model": "sonnet | opus | haiku | inherit",
      "project": "project-name | null",
      "tags": ["research", "browser", "analysis", "orchestrator", "writer"],
      "createdAt": "YYYY-MM-DD",
      "promotedFrom": "projects/<name> | null"
    }
  ]
}
```

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Kebab-case identifier matching frontmatter name |
| `type` | enum | yes | `"agent"` or `"skill"` |
| `location` | string | yes | Relative path from repo root to the file |
| `description` | string | yes | Same as frontmatter description |
| `tools` | string[] | no | Tools this component uses |
| `model` | string | no | Model specified in frontmatter |
| `project` | string/null | yes | Project name if in `projects/`, `null` if reusable |
| `tags` | string[] | no | Categories for filtering (research, browser, analysis, orchestrator, writer, etc.) |
| `createdAt` | string | yes | ISO date |
| `promotedFrom` | string/null | no | Original project location if promoted to reusable |

## Summary Object

Recompute every time manifest is updated:
- `totalAgents` — count of type "agent"
- `totalSkills` — count of type "skill"
- `reusable` — count where project is null
- `projectSpecific` — count where project is not null
- `byProject` — `{ "project-name": count }` for each project

## Rules

- **Always update on create** — the `/create` skill writes to manifest after every creation
- **Always update on promote** — when moving from project to reusable, update `location` and set `project: null`, record `promotedFrom`
- **Never stale** — if manifest disagrees with filesystem, filesystem wins. Rebuild if needed.
