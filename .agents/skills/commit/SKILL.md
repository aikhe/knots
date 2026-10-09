---
name: commit
description: File a clean commit. Use when the user asks to commit or save work.
---

# Commit Changes

Stage and commit changes using the professional, structured Git commit message format.

## Commit Message Format

Follow the conventional commits standard with specific style guidelines:

- Format: `<type>(<scope>): <description 1> & <description 2> + <description 3>` (or similar compact structure using `&` and `+` to chain related changes)
- Wrap long messages immediately after a `+` or `&` (max 120 chars).
- Keep messages single-line.
- Never stage `.env.local` or `.agents/`. Verify with `git status` before committing.
- Examples:
  - `refactor(web): compact typography classes & shared button primitives + migrate shared text styles`
  - `feat(convex): scope tasks to owner via userId + by_user index`
  - `feat(web): task manager UI with add, toggle, delete`
