---
name: linkedin-post
description: Draft the next Beautinique LinkedIn post (text, hashtags, PDF carousel prompts and alt text) in linkedin-posts/, turn slide images into a PDF, or mark a post as posted. Use when the user asks for a LinkedIn post or runs /linkedin-post.
---

# LinkedIn post

Rules and folder layout: `linkedin-posts/README.md`. History: `linkedin-posts/HISTORY.md`. Read both first,
nothing else unless needed (keep tokens low).

## Draft a new post

1. Read the "Kahan tak cover hua" marker in HISTORY.md.
2. Find new work after it, excluding this folder:
   `git log --oneline <marker>..origin/prerelease -- . ':!linkedin-posts'` (fetch first) and
   `gh pr list --base prerelease --state merged --limit 20 --json number,title,body,mergedAt`.
   With no marker, use the "Baaki" backlog: pick the next phase of old work.
3. If nothing worth showing, tell the user and stop.
4. Copy `_template/` to `linkedin-posts/<today YYYY-MM-DD>/` and fill `post.md`, `hashtags.md`,
   `carousel.md` per the README rules. Facts only from PRs/commits. Next day number from HISTORY.
5. Add a `draft` row to HISTORY.md (Kya cover hua = PR numbers), bump its status/change log.
6. Run `npx prettier --write linkedin-posts` and show the user the post text and slide list.

## Make the PDF

When images are in `<date>/slides/` (01.png, 02.png ...), combine them in order into
`<date>/slides/carousel.pdf` (one 1080×1350 page per image), e.g. with a small Python/Pillow or
pdf-lib script run from the scratchpad. Check page count and size.

## Mark as posted

When the user gives the LinkedIn link: set `status: posted`, `posted_at`, `link` in `post.md`, update the
HISTORY row, move the marker to the last covered PR/commit, add a change log line.

## Never

Post to LinkedIn yourself, open LinkedIn in a browser, or commit `slides/`. Commit/push only when the
user says so (git flow and open question in README §5).
