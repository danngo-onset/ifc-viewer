# Claude Code instructions

## Edit permissions

When the permission mode is "Ask before edits" (plan mode is active), do **not** apply any file edits. Return all proposed changes as fenced code snippets in the chat response only. The user will copy or approve them manually.

## Context and instructions location

All context, instructions, patterns, and rules must live inside the repository. Do **not** store them in local file systems, external memory stores, or user-profile directories. This ensures rules are version-controlled and available to any agent working on the repo.

- Claude Code rules → `CLAUDE.md`
- Cursor rules → `.cursor/rules/*.mdc`
- Architecture/pattern docs readable by both → `.cursor/rules/*.mdc` (Claude Code reads these via `AGENTS.md`)
