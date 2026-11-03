# LinkedIn posts — Beautinique

> **Status:** v1.3 (2026-11-03). Project ke build-in-public LinkedIn posts: har post ka text, hashtags aur
> PDF carousel ke slides (prompt + alt text) yahan date ke folder me rehte hain. Post insaan khud
> LinkedIn pe karta hai; koi API ya browser automation nahi.

## 1. Dhaancha

```
linkedin-posts/
  README.md       ye file: niyam aur process
  HISTORY.md      kya post hua, kahan tak cover hua, kya baaki hai
  IMAGES.md       images banane ke common steps (har post ke liye same)
  _template/      naye post ki khaali files
  YYYY-MM-DD/     post ki date (usi din doosra post: YYYY-MM-DD-2)
    post.md       status + post ka text
    hashtags.md   3–5 hashtags
    carousel.md   PDF ka title, style, aur har slide: text, image prompt, alt text
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
- 120–220 words; 3–4 bullets saadi bhasha me (user/developer ab kya kar sakta hai), din ki ek seekh,
  end me repo link: https://github.com/Nageshwar1997/Beautinique. Limit 3000 characters.
- Koi secret, email, internal URL, personal data ya hype words nahi. Facts sirf PRs/commits se; jo bana
  nahi, wo mat likho.
- Post ka text `post.md` me ` ```text ` block me (prettier nahi chhedta, copy aasaan). `hashtags.md` wali
  line post ke end me paste hoti hai.
- Carousel ke saath text me slides ka chhota saar bhi ho (PDF me alt text nahi jaata).

## 4. Carousel (PDF)

- LinkedIn pe swipe carousel = PDF document post; har page ek slide. Upload pe PDF ka title maanga jaata hai.
- PDF ka har page **1080 × 1350 px (4:5 portrait)**; images 3:4 me banti hain (neeche). 6–10 slides, is
  order me:
  1. Cover: hook + "Day N"
  2. Problem / kyun banaya
  3. 2–4 slides: kya bana (har slide ek baat)
  4. Din ki seekh
  5. Aakhri: repo link + follow
- **Prompt blocks:** `carousel.md` me ` ```text ` blocks (copy button). Upar ek **Common prompt** block, saare
  posts me same ([\_template/carousel.md](_template/carousel.md)): "Create exactly ONE image" (ek prompt = ek
  image, 4 variants nahi), size (vertical portrait 3:4, kyunki Flow me 4:5 nahi), aur style line, taaki saari
  slides aur saare posts ek jaise dikhen. Brand color rose `#D6336C` (`packages/frontend/styles`). Har slide
  ke block me sirf layout aur exact text; image tool me pehle common block, phir slide ka block.
- Images insaan doosre AI tool se banata hai. Slide pe text ho to prompt me exact text quotes me, kam words;
  image banne ke baad spelling check. Images banane ke common steps: [IMAGES.md](IMAGES.md) (har
  `carousel.md` me sirf uska link).
- Images `slides/1.jpg`, `2.jpg` ... (slide number = naam; jpg/jpeg/png/webp) me rakho. 3:4 image PDF ke 1080 × 1350 page me bina
  kate fit hoti hai (left-right ~34 px patli jagah). Landscape (16:9) nahi chalega: beech me patli patti
  banti hai aur text phone pe padhne layak nahi rehta, dobara banao. Claude `/linkedin-post` se
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

- Post ki files (`linkedin-posts/` ke andar: post, hashtags, carousel, HISTORY) **seedha `prerelease` pe push**, bina
  branch/PR. Pehle `git pull --rebase` aur `npm run format:check`. README ya skill ka badlav normal PR se
  ([RULES §2](../docs/RULES.md)).

## Change log

| Version | Date       | Badlav                                                                                                              |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| v1      | 2026-11-03 | Pehla version: dhaancha, post/carousel ke niyam, skill process.                                                     |
| v1.1    | 2026-11-03 | Status table, repo link, slide order, style line, PDF fit, folder naam, commit ka tareeka.                          |
| v1.2    | 2026-11-03 | §6: post ki files seedha `prerelease` pe push (owner ka faisla).                                                    |
| v1.3    | 2026-11-03 | §4: common + slide prompt blocks, ek prompt = ek image, images 3:4 (Flow), files `1.jpg` ...; steps `IMAGES.md` me. |
