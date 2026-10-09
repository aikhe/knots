---
name: webp
description: Converts PNG/JPG assets to webp, wires them into components, and deletes the unused sources. Use when adding or replacing image assets.
---

# Webp Skill

This skill covers the full lifecycle of image assets: convert sources to webp, reference them in components, verify, then delete the orphaned originals.

## When to use this skill

- Use this when `src/lib/assets/` has new PNG/JPG images.
- Use this when swapping an asset.
- Use this to clean up image files left orphaned by a swap.

## How to use it

### 1. Inspect the sources

- List the folder and record every image plus its dimensions.
- On Windows without imaging tools, read dimensions via `System.Drawing`:
  `Add-Type -AssemblyName System.Drawing` then `New-Object System.Drawing.Bitmap($path)`.

### 2. Convert to webp

- No converter is installed in the repo, so use `sharp-cli` ephemerally (no `package.json` changes):
  `bunx -p sharp-cli sharp --input "<src>" --output "<dir>" --format webp`
- Keep webp files next to the sources (same folder, same basename, `.webp` extension).
- Spot-check output sizes; webp should be clearly smaller than the PNG.

### 3. Wire into the component

- Import each webp where it renders:
  `import hero from "../../assets/hero.webp";`
- Do not reuse the old import variable name for new files.

### 4. Verify before deleting anything

- Run `bun run build` — it fails on missing/unresolved imports, proving the wiring is correct.

### 5. Delete the unused originals

- Only after the build passes, search for references with ripgrep:
  `rg -n "<name>\.(webp|png)" src public`
- Delete the source PNGs/JPGs and any orphaned webp with zero references.
- Re-run the build after deletion as a final safety net.

## Troubleshooting

- `sharp-cli` needs network access on first use (downloads `sharp`); subsequent runs use the cache.
- If `rg` matches look wrong, quote the pattern and always include the extension in the pattern.
