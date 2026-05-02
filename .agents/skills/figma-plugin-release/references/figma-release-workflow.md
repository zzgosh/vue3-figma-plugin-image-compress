# Figma Release Workflow Reference

Read this reference only when a repository is missing release automation, when the user asks to create or review it, or when the existing workflow behavior is unclear.

## Expected Behavior

- Trigger on `figma-v*` tags.
- Install dependencies from the lockfile.
- Run the repository build command.
- Require `figma-plugin-changelog/releases/${TAG}.md` to exist in the tagged commit.
- Package `dist/` into a versioned zip asset.
- Create or update a draft GitHub Release with `--notes-file`.

## Template

Adjust `node-version`, package manager commands, asset prefix, and action SHAs for the target repository. Keep GitHub Actions pinned by full commit SHA when committing the workflow.

```yaml
name: Figma Plugin Release

on:
  push:
    tags:
      - 'figma-v*'

permissions:
  contents: write

concurrency:
  group: figma-release-${{ github.ref_name }}
  cancel-in-progress: false

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@<full-commit-sha>
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@<full-commit-sha>
        with:
          node-version: <node-version>
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build plugin
        run: npm run build

      - name: Read release metadata
        id: release
        run: |
          set -euo pipefail

          TAG="${GITHUB_REF_NAME}"
          VERSION="${TAG#figma-v}"
          NOTES_FILE="figma-plugin-changelog/releases/${TAG}.md"
          ASSET_NAME="<asset-prefix>-${TAG}.zip"

          if [ "$TAG" = "$VERSION" ] || [ -z "$VERSION" ]; then
            echo "Tag must use the figma-vN format, for example figma-v9."
            exit 1
          fi

          if [ ! -s "$NOTES_FILE" ]; then
            echo "Missing release notes: $NOTES_FILE"
            exit 1
          fi

          echo "tag=${TAG}" >> "$GITHUB_OUTPUT"
          echo "version=${VERSION}" >> "$GITHUB_OUTPUT"
          echo "notes_file=${NOTES_FILE}" >> "$GITHUB_OUTPUT"
          echo "asset_name=${ASSET_NAME}" >> "$GITHUB_OUTPUT"

      - name: Package dist
        run: |
          set -euo pipefail
          cd dist
          zip -r "../${{ steps.release.outputs.asset_name }}" .

      - name: Create or update draft GitHub Release
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail

          TAG="${{ steps.release.outputs.tag }}"
          TITLE="Version ${{ steps.release.outputs.version }}"
          NOTES_FILE="${{ steps.release.outputs.notes_file }}"
          ASSET_NAME="${{ steps.release.outputs.asset_name }}"
          ASSET_LABEL="Figma plugin dist (${TAG})"

          if gh release view "$TAG" >/dev/null 2>&1; then
            gh release edit "$TAG" \
              --title "$TITLE" \
              --notes-file "$NOTES_FILE" \
              --draft
            gh release upload "$TAG" "${ASSET_NAME}#${ASSET_LABEL}" --clobber
          else
            gh release create "$TAG" "${ASSET_NAME}#${ASSET_LABEL}" \
              --verify-tag \
              --draft \
              --title "$TITLE" \
              --notes-file "$NOTES_FILE"
          fi
```
