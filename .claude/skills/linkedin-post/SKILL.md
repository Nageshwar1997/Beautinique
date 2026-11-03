---
name: linkedin-post
description: Draft the next Beautinique LinkedIn post (text, hashtags, PDF carousel prompts and alt text) in linkedin-posts/, turn slide images into carousel.pdf, or mark a post as scheduled/posted. Use when the user asks for a LinkedIn post or runs /linkedin-post.
---

# LinkedIn post

Rules, statuses and folder layout: `linkedin-posts/README.md`. History: `linkedin-posts/HISTORY.md`.
Read both first, nothing else unless needed (keep tokens low). Ask the user which step they want if unclear.

## Draft a new post

1. `git fetch origin prerelease`. Read the "Kahan tak cover hua" marker (`commit <sha> (PR #N)`) in HISTORY.md.
2. Find new work after the marker, excluding this folder:
   - `git log --oneline <sha>..origin/prerelease -- . ':!linkedin-posts' ':!.claude/skills/linkedin-post'`
   - `gh pr list --base prerelease --state merged --search "merged:>=<marker commit date>" --json number,title,body,mergedAt`
3. No marker yet (first run): build the phase-wise catch-up list in HISTORY "Baaki" from
   `gh pr list --base prerelease --state merged --limit 200 --json number,title,mergedAt` (titles only; group
   by phase, ~1 post per phase), then draft the first item. Later runs take the next "Baaki" item before new work.
4. If nothing worth showing, tell the user and stop.
5. Copy `_template/` to `linkedin-posts/<post date YYYY-MM-DD>/` (`-2` if it exists). Fill `post.md`,
   `hashtags.md`, `carousel.md` per README §3–4. Facts only from PR bodies/commits. Next day number from HISTORY.
   Brand colors: `packages/frontend/styles/src/variables.css` if more than the README's rose is needed.
6. Add a `draft` row to HISTORY.md (Kya cover hua = PR numbers), bump its status and change log.
7. `npx prettier --write linkedin-posts`, then show the user the post text and the slide list.

## Make the PDF

When images are in `<folder>/slides/` (01.png, 02.png ... png/jpg/webp), run from the repo root (uses the
repo's Playwright; module resolution needs the repo root as cwd):

```bash
node --input-type=module - linkedin-posts/<folder>/slides <<'EOF'
const { chromium } = await import('playwright');
const fs = await import('node:fs');
const path = await import('node:path');
const dir = process.argv.at(-1);
const files = fs.readdirSync(dir).filter((f) => /^\d+\.(png|jpe?g|webp)$/i.test(f)).sort();
if (files.length === 0) throw new Error(`No slides (01.png, 02.png ...) in ${dir}`);
const type = (f) => ({ jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' })[f.split('.').pop().toLowerCase()];
const pages = files.map((f) => `<div class="p"><img src="data:image/${type(f)};base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}"></div>`).join('');
const html = `<style>@page{size:1080px 1350px;margin:0}body{margin:0}.p{width:1080px;height:1350px;background:#fff;break-after:page}.p:last-child{break-after:auto}img{width:100%;height:100%;object-fit:contain;display:block}</style>${pages}`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: path.join(dir, 'carousel.pdf'), width: '1080px', height: '1350px', printBackground: true });
await browser.close();
console.log(`${files.length} slides -> ${path.join(dir, 'carousel.pdf')}`);
EOF
```

Check the printed slide count matches `carousel.md`, warn if any image is far from 4:5 (it is fitted, not
cropped, so it gets white bars). If Chromium is missing: `npx playwright install chromium`. Then set `status: ready`.

## Mark as scheduled / posted

When the user says it is scheduled (time) or posted (link): set `status`, `posted_at`, `link` in `post.md`,
update the HISTORY row, move the marker to the last covered `prerelease` commit + PR, add a change log line.

## Commit

Only when the user says so: branch `feat/linkedin-<date>` from `origin/prerelease` → PR to `prerelease`
(until the owner decides README §6). Never commit `slides/`.

## Never

Post to LinkedIn yourself or open LinkedIn in a browser.
