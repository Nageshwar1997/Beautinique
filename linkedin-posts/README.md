# LinkedIn posts — Beautinique

> **Status:** v1.11 (2026-11-03). Project ke build-in-public LinkedIn posts: har post ka text, hashtags aur
> PDF carousel ki slides ka image prompt yahan date ke folder me rehte hain. Post insaan khud
> LinkedIn pe karta hai; koi API ya browser automation nahi.

## 1. Dhaancha

```
linkedin-posts/
  README.md       ye file: niyam aur process
  HISTORY.md      kya post hua, kahan tak cover hua, kya baaki hai
  IMAGES.md       images banane ke common steps (har post ke liye same)
  _template/      naye post ki khaali files
  D<N>-YYYY-MM-DD/  Day number + post ki date, jaise D1-2026-11-03 (owner, 2026-11-03)
    post.md       status + post ka text
    hashtags.md   3–5 hashtags
    carousel.md   PDF ka title aur saari slides ka ek image prompt
    slides/       images (1.jpg, 2.jpg ...) aur carousel.pdf — git me nahi (.gitignore)
```

## 2. Status

| Status      | Matlab                                                        |
| ----------- | ------------------------------------------------------------- |
| `draft`     | Claude ne text aur prompts likhe; insaan ka review baaki      |
| `ready`     | Text review ho gaya, images bani, `carousel.pdf` taiyar       |
| `scheduled` | LinkedIn pe schedule ho gaya (`posted_at` = schedule ka time) |
| `posted`    | Live; `link` bhara hua                                        |

## 3. Post ke niyam

- Pehli 2 lines hook (LinkedIn "...see more" se pehle itna hi dikhata hai).
- Hook ke baad hamesha `𝗔𝗯𝗼𝘂𝘁 𝘁𝗵𝗲 𝗽𝗿𝗼𝗷𝗲𝗰𝘁:` wali ek line, har post me same ([_template/post.md](_template/post.md);
  owner, 2026-11-03), taaki naya reader samjhe Beautinique kya hai. Facts PRD §1 se.
- 120–220 words; 3–4 bullets saadi bhasha me (user/developer ab kya kar sakta hai), din ki ek seekh,
  end me repo link: https://github.com/Nageshwar1997/Beautinique. Limit 3000 characters.
- Koi secret, email, internal URL, personal data ya hype words nahi. Facts sirf PRs/commits se; jo bana
  nahi, wo mat likho.
- Post ka text `post.md` me ` ```text ` block me (prettier nahi chhedta, copy aasaan). `hashtags.md` wali
  line post ke end me paste hoti hai.
- Carousel ke saath text me slides ka chhota saar bhi ho (PDF me alt text nahi jaata).
- **Alt text sirf akeli image wale post me** (owner, 2026-11-03): carousel (PDF) ke saath LinkedIn alt text nahi
  leta, isliye `carousel.md` me alt text nahi. Post me ek hi image ho to `post.md` me uska ek line alt text, jo
  LinkedIn pe image upload karte waqt "Alt text" me jaata hai.
- **Bold sirf section titles** (jaise `𝗪𝗵𝗮𝘁 𝗜 𝘀𝗵𝗶𝗽𝗽𝗲𝗱:`, `𝗟𝗲𝘀𝘀𝗼𝗻 𝗼𝗳 𝘁𝗵𝗲 𝗱𝗮𝘆:`; owner, 2026-11-03). LinkedIn me bold
  ka option nahi, isliye Claude `post.md` me Unicode sans-serif bold akshar likhta hai aur insaan waise hi copy
  karta hai. Keywords, hashtags, links aur poore vaakya bold nahi: screen reader inhe theek nahi padhte aur
  LinkedIn search me ye nahi milte.

## 4. Carousel (PDF)

- LinkedIn pe swipe carousel = PDF document post; har page ek slide. Upload pe PDF ka title maanga jaata hai.
- PDF ka har page **1920 × 1080 px (16:9 landscape)** (owner, 2026-11-03): LinkedIn mobile feed me document ke
  pages ek fixed height pe dikhte hain, to page jitna chauda utna screen bharta hai (4:5 page sirf ~45% leta
  tha; Day 1 4:5 me tha). 6–10 slides, is order me:
  1. Cover: hook + "Day N"
  2. Problem / kyun banaya
  3. 2–4 slides: kya bana (har slide ek baat)
  4. Din ki seekh
  5. Aakhri: repo link + follow
- **Prompt:** `carousel.md` me saari slides ka **ek hi** ` ```text ` block (copy button, ek click; owner, 2026-11-03):
  tool har slide ki alag image ek saath banata hai. Upar 5 common lines, saare posts me same
  ([_template/carousel.md](_template/carousel.md)): kitni images (har slide ki ek, variants nahi), size (landscape
  16:9), style line, layout niyam (text baayein, picture daayein, bada headline: phone pe page ~400 px ooncha
  dikhta hai) aur saari images ek set jaisi. Brand color rose `#D6336C` (`packages/frontend/styles`). Phir har
  slide ka `Slide N`, `Layout:` aur `Text:` (exact text; spelling check isi se).
- Images insaan doosre AI tool se banata hai. Slide pe text ho to prompt me exact text quotes me, kam words;
  image banne ke baad spelling check. Images banane ke common steps: [IMAGES.md](IMAGES.md) (har
  `carousel.md` me sirf uska link).
- Images `slides/1.jpg`, `2.jpg` ... (slide number = naam; jpg/jpeg/png/webp) me rakho. 16:9 image (Flow: 1376 × 768) PDF ke 1920 × 1080
  page me poori fit hoti hai. Portrait ya chaukor image nahi chalegi: left-right badi khaali jagah banti hai,
  dobara banao. Claude `/linkedin-post` se
  `slides/carousel.pdf` banata hai (repo ka Playwright, koi naya package nahi).

## 5. Process (`/linkedin-post` skill)

Naye Claude Code session me (worktree me, taaki chal rahi feature branch pe asar na pade) `/linkedin-post`:

1. Claude ye README aur [HISTORY.md](HISTORY.md) padhta hai.
2. "Kahan tak cover hua" commit ke baad ke merged PRs/commits dekhta hai (`linkedin-posts/` ke commits chhod ke).
   Pehli baar: purane PRs ki phase-wise catch-up list HISTORY ke "Baaki" me banti hai.
3. `_template/` se post ka folder banata hai, HISTORY me `draft` line jodta hai.
4. Insaan text review karta hai, images banata hai → Claude PDF banata hai (`ready`).
5. Insaan LinkedIn pe post/schedule karta hai → Claude ko batata hai → `scheduled` / `posted`, link, aur
   "kahan tak cover hua" aage.
6. Commit: post ki files seedha `prerelease` pe push (§6).

## 6. Commit ka faisla (owner, 2026-11-03)

- `linkedin-posts/` ki **saari** files (post, hashtags, carousel, HISTORY, README, `IMAGES.md`, `_template/`) aur
  `/linkedin-post` skill **seedha `prerelease` pe push**, bina branch/PR (owner, 2026-11-03: chhote badlav ke liye
  PR aur CI ka intezaar nahi). Pehle `git pull --rebase` aur `npm run format:check`; force push nahi, `slides/`
  kabhi nahi ([RULES §2](../docs/RULES.md)).

## Change log

| Version | Date       | Badlav                                                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| v1      | 2026-11-03 | Pehla version: dhaancha, post/carousel ke niyam, skill process.                                                     |
| v1.1    | 2026-11-03 | Status table, repo link, slide order, style line, PDF fit, folder naam, commit ka tareeka.                          |
| v1.2    | 2026-11-03 | §6: post ki files seedha `prerelease` pe push (owner ka faisla).                                                    |
| v1.3    | 2026-11-03 | §4: common + slide prompt blocks, ek prompt = ek image, images 3:4 (Flow), files `1.jpg` ...; steps `IMAGES.md` me. |
| v1.4    | 2026-11-03 | §4: carousel 16:9 (1920 × 1080), mobile feed me poori chaudai; layout niyam (owner ka faisla).                      |
| v1.5    | 2026-11-03 | §3: section titles Unicode bold me, baaki text normal (owner ka faisla).                                            |
| v1.6    | 2026-11-03 | §4: har slide ka prompt block poora (common + layout + text), ek click copy (owner ka faisla).                      |
| v1.7    | 2026-11-03 | §3: har post me hook ke baad "About the project" line (owner ka faisla).                                            |
| v1.8    | 2026-11-03 | §4: saari slides ek prompt block me, ek saath generate (owner ka faisla).                                           |
| v1.9    | 2026-11-03 | §6: README, IMAGES.md, template aur skill bhi seedha `prerelease` pe, PR nahi (owner ka faisla).                    |
| v1.10   | 2026-11-03 | §3: alt text sirf akeli image wale post me; carousel me nahi (owner ka faisla).                                     |
| v1.11   | 2026-11-03 | §1: post folder ka naam `D<N>-YYYY-MM-DD` (Day number + date; owner ka faisla).                                     |
