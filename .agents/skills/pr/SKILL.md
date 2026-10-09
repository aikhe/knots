---
name: pr
description: File a concise pull request. Use when the user asks to file, open, or create a PR.
---

## Pull Request Workflow

### 1. Pre-flight

- Check whether a PR already exists: `gh pr view --json number,title,state`
  plus `gh pr list --head <branch>`. Edit it instead of opening a duplicate.
- Review the diff locally against `origin/main` (`git diff origin/main...HEAD --stat`
  plus full diff) to make sure its contents match the goal. Drop stray files,
  never stage `.env.local` or `.agents/`.
- Skim recent git history (`git log --oneline -15`) for title conventions.
- Rebase onto latest `main` before opening.

### 2. Title

PR titles usually become squash messages, so keep the repo's one-line
conventional format (`<type>(<scope>): <description>`, max 120 chars,
`&` for correlated details, `+` for distinct ones). Within that format,
explain why the change matters, not just what moved.

- BAD (what-only): `refactor(web): move tasks view into components folder`
- GOOD (why): `feat(web): cut task list into its own component so App stays composition-only`

### 3. Description

Open with a simple explanation of the problem based on the user's original
prompt, then briefly explain the solution. Do not lead with an
implementation inventory.

Then keep the rest compact. Draft the body to a temp `.md` file (avoids
shell escaping with backticks) and use asterisks for bullet lists.
MUST include:

- `### Summary`: problem plus outcome in 2-4 sentences.
- `### Changes`: compact table (`| File | Change |`) or short bullets,
  only what a reviewer needs.
- `### Verification`: validation steps and results (`bun run lint`,
  `bun run build`, plus manual checks).
- `### Harness`: model plus harness that filed the PR.
- `### Configuration`: only when the PR itself requires setup (new env vars,
  scripts, deps). Omit otherwise.

End the description with a blurb naming the model and harness making the changes.

### 4. File it

- Create: `gh pr create --title "<title>" --body-file <path/to/pr_body.md>`
- Edit: `gh pr edit <number> --body-file <path/to/pr_body.md>`
- Open a real PR rather than a draft.
