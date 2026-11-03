# Carousel images kaise banane hain

> **Status:** v1.2 (2026-11-03). Har post ke carousel ki images banane ke common steps. Prompts har post ke
> `carousel.md` me hain; niyam [README.md](README.md) §4.

1. Post ke `carousel.md` me upar ka **Common prompt** block copy karke image tool me paste karo, phir usi message
   me neeche us slide ka block (dono ke copy button). Common block me size, style aur "sirf ek image" hai.
2. **Ek prompt = ek image.** Tool me images/variants ki ginti ki setting ho to **1** rakho. Phir bhi 4 aayen
   to un me se ek chuno; har slide ki sirf ek final image rakho.
3. **Size: portrait 3:4** (lambi, chaudi nahi). Flow me aspect ratio **3:4** chuno: Flow me 4:5 nahi hai
   (sirf 1:1, 16:9, 9:16, 4:3, 3:4). 9:16 bahut lambi aur 1:1 chaukor hai, wo mat lo. PDF ka page 4:5
   (1080 × 1350) hai; 3:4 image usme bina kate fit hoti hai, bas left-right ~34 px patli jagah bachti hai.
   Landscape (16:9, jaise 1376 × 768) mat lo: PDF me wo beech me patli patti ban jaati hai aur text phone pe
   padhne layak nahi rehta. Landscape aaye to naye chat me dobara banao.
4. Landscape image ko reference bana ke portrait mat maango: tool aksar reference wala shape hi rakhta hai.
5. Image banne ke baad slide ke "Text on slide" se spelling milao (URL wali slide khaas dhyaan se). Galat ho
   to dobara banao.
6. Images `linkedin-posts/<post folder>/slides/` me slide number ke naam se rakho: `1.jpg`, `2.jpg` ... (jpg/jpeg; png/webp bhi chalega).
   Phir Claude (`/linkedin-post`) size check karke `carousel.pdf` banata hai.

## Change log

| Version | Date       | Badlav                                                     |
| ------- | ---------- | ---------------------------------------------------------- |
| v1      | 2026-11-03 | Steps har `carousel.md` se nikaal ke yahan ek jagah rakhe. |
| v1.1    | 2026-11-03 | Common prompt alag block me; size 3:4 (Flow me 4:5 nahi).  |
| v1.2    | 2026-11-03 | Slide files `1.jpg`, `2.jpg` ... (Flow jpg deta hai).      |
