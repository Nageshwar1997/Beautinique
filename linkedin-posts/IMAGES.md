# Carousel images kaise banane hain

> **Status:** v1.3 (2026-11-03). Har post ke carousel ki images banane ke common steps. Prompts har post ke
> `carousel.md` me hain; niyam [README.md](README.md) §4.

1. Post ke `carousel.md` me upar ka **Common prompt** block copy karke image tool me paste karo, phir usi message
   me neeche us slide ka block (dono ke copy button). Common block me size, style aur "sirf ek image" hai.
2. **Ek prompt = ek image.** Tool me images/variants ki ginti ki setting ho to **1** rakho. Phir bhi 4 aayen
   to un me se ek chuno; har slide ki sirf ek final image rakho.
3. **Size: landscape 16:9** (chaudi). Flow me aspect ratio **16:9** chuno. Kyun: LinkedIn mobile feed me
   document ke pages ek fixed height pe dikhte hain, to page jitna chauda utna screen bharta hai. Portrait
   (3:4, 9:16) ya 1:1 mat lo: PDF ke 1920 × 1080 page me left-right badi khaali jagah banti hai. Galat shape
   aaye to naye chat me dobara banao.
4. Galat shape wali image ko reference bana ke 16:9 mat maango: tool aksar reference wala shape hi rakhta hai.
5. Image banne ke baad slide ke "Text on slide" se spelling milao (URL wali slide khaas dhyaan se). Phone pe
   page sirf ~400 px ooncha dikhta hai, to sabse chhota text bhi aaram se padha jaye. Galat ho to dobara banao.
6. Images `linkedin-posts/<post folder>/slides/` me slide number ke naam se rakho: `1.jpg`, `2.jpg` ... (jpg/jpeg; png/webp bhi chalega).
   Phir Claude (`/linkedin-post`) size check karke `carousel.pdf` banata hai.

## Change log

| Version | Date       | Badlav                                                     |
| ------- | ---------- | ---------------------------------------------------------- |
| v1      | 2026-11-03 | Steps har `carousel.md` se nikaal ke yahan ek jagah rakhe. |
| v1.1    | 2026-11-03 | Common prompt alag block me; size 3:4 (Flow me 4:5 nahi).  |
| v1.2    | 2026-11-03 | Slide files `1.jpg`, `2.jpg` ... (Flow jpg deta hai).      |
| v1.3    | 2026-11-03 | Size 16:9 (mobile feed me poori chaudai), text size check. |
