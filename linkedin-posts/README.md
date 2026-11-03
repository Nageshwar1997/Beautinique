# LinkedIn posts — Beautinique

> **Status:** v1.1 (2026-11-03). Project ke build-in-public LinkedIn posts: har post ka text, hashtags aur
> PDF carousel ke slides (prompt + alt text) yahan date ke folder me rehte hain. Post insaan khud
> LinkedIn pe karta hai; koi API ya browser automation nahi.

## 1. Dhaancha

```
linkedin-posts/
  README.md       ye file: niyam aur process
  HISTORY.md      kya post hua, kahan tak cover hua, kya baaki hai
  _template/      naye post ki khaali files
  YYYY-MM-DD/     post ki date (usi din doosra post: YYYY-MM-DD-2)
    post.md       status + post ka text
    hashtags.md   3–5 hashtags
    carousel.md   PDF ka title, style, aur har slide: text, image prompt, alt text
    slides/       images (01.png, 02.png ...) aur carousel.pdf — git me nahi (.gitignore)
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
- 120–220 words; 3–4 bullets saadi bhasha me (user/developer ab kya kar sakta hai), din ki ek seekh,
  end me repo link: https://github.com/Nageshwar1997/Beautinique. Limit 3000 characters.
- Koi secret, email, internal URL, personal data ya hype words nahi. Facts sirf PRs/commits se; jo bana
  nahi, wo mat likho.
- Post ka text `post.md` me ` ```text ` block me (prettier nahi chhedta, copy aasaan). `hashtags.md` wali
  line post ke end me paste hoti hai.
- Carousel ke saath text me slides ka chhota saar bhi ho (PDF me alt text nahi jaata).

## 4. Carousel (PDF)

- LinkedIn pe swipe carousel = PDF document post; har page ek slide. Upload pe PDF ka title maanga jaata hai.
- Har slide **1080 × 1350 px (4:5 portrait)**. 6–10 slides, is order me:
  1. Cover: hook + "Day N"
  2. Problem / kyun banaya
  3. 2–4 slides: kya bana (har slide ek baat)
  4. Din ki seekh
  5. Aakhri: repo link + follow
- **Style line:** `carousel.md` ki ek style line har prompt ke saath jaati hai, taaki saari slides ek jaisi
  dikhen. Brand color rose `#D6336C` (`packages/frontend/styles`).
- Images insaan doosre AI tool se banata hai. Slide pe text ho to prompt me exact text quotes me, kam words;
  image banne ke baad spelling check.
- Images `slides/01.png`, `02.png` ... (png/jpg/webp) me rakho. Size thoda alag ho to bhi chalega: PDF me
  har image bina kate 1080 × 1350 page me fit hoti hai. Claude `/linkedin-post` se `slides/carousel.pdf`
  banata hai (repo ka Playwright, koi naya package nahi).

## 5. Process (`/linkedin-post` skill)

Naye Claude Code session me (worktree me, taaki chal rahi feature branch pe asar na pade) `/linkedin-post`:

1. Claude ye README aur [HISTORY.md](HISTORY.md) padhta hai.
2. "Kahan tak cover hua" commit ke baad ke merged PRs/commits dekhta hai (`linkedin-posts/` ke commits chhod ke).
   Pehli baar: purane PRs ki phase-wise catch-up list HISTORY ke "Baaki" me banti hai.
3. `_template/` se post ka folder banata hai, HISTORY me `draft` line jodta hai.
4. Insaan text review karta hai, images banata hai → Claude PDF banata hai (`ready`).
5. Insaan LinkedIn pe post/schedule karta hai → Claude ko batata hai → `scheduled` / `posted`, link, aur
   "kahan tak cover hua" aage.
6. Commit: `prerelease` se `feat/linkedin-<date>` branch → PR (§6 ka faisla hone tak).

## 6. Khula sawal (owner)

- Roz ki files kaise jaayengi: `prerelease` pe seedha push (1–10 files, format check ke baad; recommended)
  ya har post ki PR. Jab tak faisla nahi, har post ki PR.

## Change log

| Version | Date       | Badlav                                                                                     |
| ------- | ---------- | ------------------------------------------------------------------------------------------ |
| v1      | 2026-11-03 | Pehla version: dhaancha, post/carousel ke niyam, skill process.                            |
| v1.1    | 2026-11-03 | Status table, repo link, slide order, style line, PDF fit, folder naam, commit ka tareeka. |
