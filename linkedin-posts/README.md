# LinkedIn posts — Beautinique

> **Status:** v1 (2026-11-03). Project ke build-in-public LinkedIn posts: har post ka text, hashtags aur
> PDF carousel ke slides (prompt + alt text) yahan date ke folder me rehte hain. Post insaan khud
> LinkedIn pe karta hai; koi API ya browser automation nahi.

## 1. Dhaancha

```
linkedin-posts/
  README.md       ye file: niyam aur process
  HISTORY.md      kya post hua, kahan tak cover hua, kya baaki hai
  _template/      naye din ki khaali files (copy karo)
  YYYY-MM-DD/
    post.md       status + post ka text
    hashtags.md   3–5 hashtags
    carousel.md   PDF ka title + har slide: text, image prompt, alt text
    slides/       images (01.png, 02.png ...) aur final PDF — git me nahi (.gitignore)
```

## 2. Post ke niyam

- Pehli 2 lines hook (LinkedIn "...see more" se pehle itna hi dikhata hai).
- 120–220 words; 3–4 bullets saadi bhasha me (user/developer ab kya kar sakta hai), din ki ek seekh,
  end me repo link. Limit 3000 characters.
- Koi secret, email, internal URL, personal data ya hype words nahi. Facts sirf PRs/commits se; jo bana
  nahi, wo mat likho.
- Post ka text `post.md` me ` ```text ` block me (prettier nahi chhedta, copy aasaan).

## 3. Carousel (PDF)

- LinkedIn pe swipe carousel = PDF document post; har page ek slide.
- Har slide **1080 × 1350 px (4:5 portrait)**, saari ek size ki. 6–10 slides: pehli hook/cover,
  aakhri repo link / follow.
- Images insaan doosre AI tool se banata hai; `carousel.md` me har prompt me size likha hota hai. Slide pe
  text ho to prompt me exact text quotes me; image banne ke baad spelling check.
- PDF me per-slide alt text ka option nahi milta, isliye alt text `carousel.md` me rehta hai aur slides
  ka chhota saar post text me bhi jaata hai.
- Images `slides/01.png`, `02.png` ... me rakho; Claude unka PDF bana deta hai (`slides/carousel.pdf`).

## 4. Process (`/linkedin-post` skill)

Naye Claude Code session me (worktree me, taaki chal rahi feature branch pe asar na pade) `/linkedin-post`:

1. Claude ye README aur [HISTORY.md](HISTORY.md) padhta hai.
2. "Kahan tak cover hua" ke baad ke merged PRs/commits dekhta hai (`linkedin-posts/` ke commits chhod ke).
3. `_template/` se aaj ka folder banata hai, `HISTORY.md` me `draft` line jodta hai.
4. Insaan images banata hai → Claude PDF banata hai → insaan LinkedIn pe post/schedule karta hai.
5. Insaan link batata hai → Claude status `posted`, link, aur "kahan tak cover hua" aage badhata hai.

## 5. Khula sawal (owner)

- Roz ki files kaise jaayengi: `prerelease` pe seedha push (1–10 files, format check ke baad; recommended)
  ya har post ki PR. Jab tak faisla nahi, har post ki PR.

## Change log

| Version | Date       | Badlav                                                          |
| ------- | ---------- | --------------------------------------------------------------- |
| v1      | 2026-11-03 | Pehla version: dhaancha, post/carousel ke niyam, skill process. |
