---
name: figma-plugin-release
description: Release workflow for Figma plugin repositories that use GitHub PRs, protected main branches, figma-vN tags, release notes files, GitHub Actions-built dist archives, and draft GitHub Releases. Use when the user asks to release, publish, tag, create a Figma plugin version, prepare Figma release notes, or manage GitHub Releases for a Figma plugin.
---

# Figma Plugin Release

## Core Model

Use a `figma-vN` tag for Figma plugin Version N. The tag must point to a commit on `main` that already contains the matching release notes file.

Release notes live at:

```text
figma-plugin-changelog/releases/figma-vN.md
```

That file is the shared source for GitHub Release notes and Figma plugin release notes. It must enter the release PR and be merged to `main` before the tag is created; the tag-triggered workflow may read this exact file as the release notes input.

Honor repo-specific release rules in `AGENTS.md`. If a repo has additional release-notes instructions, follow them too.

## Plugin Listing Copy

`figma-plugin-changelog/ABOUT.md` is the reusable source for the Figma Community plugin description/about copy. It is not a release workflow dependency, but it should be reviewed when preparing an initial release, a major version, a plugin rename/repositioning, or a release that changes core features, pricing, privacy, compatibility, or user-facing claims.

If `ABOUT.md` exists, read it before editing and match its structure, tone, language style, and level of detail. If it is missing during an initial release, create it. For repos that use bilingual Figma copy, keep English and Simplified Chinese sections aligned.

## Release Automation

Before tagging, inspect the repo's release automation if present. This project family usually uses `.github/workflows/figma-release.yml` to run the build, package `dist/`, and create or update a draft GitHub Release when a `figma-v*` tag is pushed.

If the workflow is missing or the user asks to set up release automation, read `references/figma-release-workflow.md`.

## Release Workflow

1. Inspect the current branch and worktree:

```bash
git status --short --branch
git log --oneline --decorate --max-count=20
git tag --list 'figma-v*'
```

2. Determine the next Figma version from existing `figma-v*` tags and release history. Confirm only if the version is ambiguous.

3. Ensure all intended code/docs changes are committed on a release branch. If staged or unstaged changes exist, include them only when they belong to the release.

4. Create or update `figma-plugin-changelog/releases/figma-vN.md` if missing. Keep it bilingual, concise, and directly reusable in the Figma plugin release form. Avoid repeating the GitHub Release title inside the body; do not add headings like `# Version N`, `English`, or `中文` unless the repo explicitly wants them. This file must be committed in the release PR and merged to `main` before tagging.

5. Review `figma-plugin-changelog/ABOUT.md` when the release scope calls for plugin listing copy changes. Create or update it in the same release PR when needed; do not treat it as a tag-triggered workflow dependency.

6. Run the repo's required validation. For this project family, run:

```bash
npm run build
```

7. Commit release notes and remaining release-prep files.

8. Push the branch and create a PR to `main`:

```bash
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<title>" --body-file <body-file>
```

9. Inspect PR state, then merge using the repository's allowed method. If `merge` is allowed, prefer:

```bash
gh pr merge <number> --merge --delete-branch
```

If rulesets reject merge commits, use an allowed method and say so.

10. Sync local `main`:

```bash
git switch main
git pull --ff-only
```

11. Create and push the annotated tag on `main`. Use the actual plugin name in the tag message; the command below is a placeholder pattern, not a hard-coded message:

```bash
git tag -a figma-vN -m "<Plugin Name> Version N"
git push origin figma-vN
```

For example, this project used `git tag -a figma-v9 -m "Small Image Compressor Version 9"`.

12. Wait for the tag-triggered release workflow and inspect the draft release:

```bash
gh run list --workflow "Figma Plugin Release" --limit 5
gh run watch <run-id> --exit-status
gh release view figma-vN --json name,tagName,isDraft,url,assets,body
```

13. After any post-release notes edits, update both the draft release and the source notes file. Do not direct-push to protected `main`; use a PR.

14. Before final handoff, sync local `main`, rebuild local `dist`, and report these facts:

```bash
git switch main
git pull --ff-only
npm run build
git status --short --branch
```

## Handoff Checklist

In the final summary, include:

- PR URL and merge commit
- Tag name and tagged commit
- GitHub Actions run URL and status
- Draft or public release URL
- Release asset name and checksum if available
- Whether `figma-plugin-changelog/ABOUT.md` was reviewed or updated when relevant
- Whether local `main` is synced
- Whether local `dist` was rebuilt with `npm run build`
- Working tree status

## Guardrails

- Never tag a feature branch or unmerged PR.
- Never create/push the tag before the release notes file exists in the tagged commit.
- Do not assume GitHub Actions produced the local `dist`; rebuild locally after syncing `main` when the user will update Figma from local files.
- Draft GitHub Releases may show an `untagged-*` URL while still having `tagName: figma-vN`; verify with `gh release view`.
