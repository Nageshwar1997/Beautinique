# UX / Product Architect ki report

> **Status:** v1.0.0 (2026-11-21). UX / Product Architect ki report.

## 0. Kaise padhein

- Ye ek **report** hai, naya doc nahi. Isme koi faisla nahi: main session jaanch ke, owner ki haan se, cheezein `docs/DESIGN.md`, `docs/FLOWS.md`, `docs/RISKS.md` aur modules ki `TASK.md` me laata hai.
- §1 me jo pehle se tay hai aur UX ko shape deta hai. §2 me sirf owner ke asli chunaav (U-1 se U-12). §3 me DESIGN ke liye batches, §4 me FLOWS ke liye batches; dono ke niyam aise likhe hain ki seedhe naye doc me ja sakein (purane kaam ka koi zikr nahi). §5 har app ki screens, §6 risks, §7 tathya ki jaanch, §8 pehle ke kaam se lene layak, §9 tay faislon pe dhyaan, §10 aage ke agents.
- Niyamon ke id: DESIGN ke liye `DS-<batch>.<n>` (jaise `DS-2.4`), FLOWS ke liye `FL-<n>` (har flow ka ek id, steps uske andar). Ye sirf prastaav hain; main session apna numbering rakh sakta hai.
- "misaal" wale numbers settings ya tokens me rehte hain aur naap ke badal sakte hain. Contrast ke saare ratios is run me WCAG 2.x ke relative luminance formula se ginke likhe (Claude ki ginti, kisi tool ka audit nahi).
- Jahan niyam kisi U-x ke jawab pe tika hai, wahan batch me "(U-x pe tika)" likha hai, aur salah wala vikalp maan ke likha hai.

## 1. Ab tak tay

UX ko ye faisle sabse zyada shape dete hain (poore record [DECISIONS.md] me):

- **Apps aur platform:** 11 alag apps, har role parivaar ka ek (D-010); har app ka apna sign-in aur cookies, central sign-in nahi (D-186); har parivaar ka alag account, email wahi ho sakta hai (D-304). Saare apps fully responsive web, phone pe install ho sakein; Delivery mobile-first PWA aur offline; native apps nahi (D-042). R1 me saare apps SPA, server-side rendering nahi (D-290). Stack me React, React Router, TanStack Query, react-hook-form, react-aria-components, Vite aur Tailwind CSS (D-001).
- **Roles:** poori list design me, har role apne module ke saath chalu (D-017, D-054); Master ke doosre roles usi insaan ke alag staff accounts (D-047); Head of Operations ke neeche Support, Logistics aur Seller Ops (D-044); location ke switch: Master = State, Super Admin = District, Admin = Sub-District (D-015). R1 ke roles aur flows: [PROJECT_PLAN.md] §1 (D-055).
- **Sign-in aur session:** customer ke teen raaste: password, social (Google, LinkedIn, GitHub), email code (D-021); staff ke 7 apps me har sign-in pe authenticator (SR-011, D-199); Seller me jokhim wale users pe authenticator (D-184); bade kaamon pe dobara code, misaal 5 minute (D-185, SR-026); Delivery app me email + password aur Hub Manager ka manzoor ek phone (D-183). Sessions: customer 30 din aage, max 90; staff 12 ghante aur 30 minute bina kaam pe band; Seller 7/30 din; Creator 30/90 din (D-180, D-181). Live site pe sign-up, sign-in aur order sirf allowlist se, baaki ko "demo store" sandesh (D-133, SR-019).
- **Bina sign-in:** sirf dekhna, search, reviews padhna aur pincode check; guest cart aur wishlist nahi (D-020). Sign-up sirf 18+ (D-038, CL-102).
- **Server soya hota hai:** app khulte hi `/wake`, jawab tak "server jaag raha hai", jawab se pehle koi API call nahi (ARCHITECTURE §5 niyam 14, D-028); raat 22:00 se 09:00 IST server soya (D-322); cold start 90 second tak, rewrite 502/504 pe dobara wake ka parda (OPERATIONS §5 niyam 8). Performance targets sirf jaage server pe (D-053, ARCHITECTURE §9). Live halat polling se (misaal har 60 second, sirf jab tab dikhe; delivery pe UPI ke 10 minute me har 5 second), WebSocket ya SSE nahi (ARCHITECTURE §5 niyam 7). App purana ho to 426 aur saaf sandesh (niyam 5). Error ka ek roop `code`, `message`, `requestId` (niyam 8).
- **Khabrein:** order pe sirf zaroori emails (confirmation delivery code ke saath, invoice ka saar, refund), baaki in-app aur browser push; push band ho to delivery fail aur jawab maangne wali khabar email se (D-126, D-131, D-302, D-289). Marketing sirf opt-in (D-141, CL-101). Push me sirf order number aur haalat (D-195, SR-074). Mobile pe koi message nahi (CLAUDE.md).
- **Product page aur bharosa:** agle bhejne wale batch ka MRP aur exact expiry (mahina-saal) page, cart, checkout, order aur invoice pe (D-064, D-067, D-124); har kate MRP ya "% off" ke saath pichhle 30 din ka sabse kam daam (D-223); % neeche round (D-120); "Pack ki jaankari" ka hissa (CL-026, CL-030); ingredients text + label photo, INCI list, free-from filter aur allergen ki chetavni apni line ke saath (D-099, D-159, CL-043); shade pe naam, swatch photo aur hex (D-085); seller ka block (D-238, CL-060); return ki line aur kharcha (D-221, CL-061); claims sirf tay list se, test wale saboot ke saath (D-224); sirf sach aankde, jhoothi jaldi nahi (D-154, CL-070); stock khatam neeche (D-153); kisi seller ka boost nahi (D-139). Demo ki patti har app pe, product page aur checkout pe bhi (D-145, CL-079).
- **Checkout aur paisa:** client sirf variant aur quantity bheje, total server ka; total na mile to naya total dikhao (SR-044, CL-071); delivery fee alag line, "₹X se upar muft" pehle se (D-107); payment gateway ki script sirf payment wale page pe (SR-006); stock place order pe 15 minute (D-118); delivery pe UPI ki seema (D-109, D-204); "paisa kata, order nahi bana" ki screen (D-256). Cancel pack se pehle, fee nahi (D-110, CL-078). Refund original raaste, halat in-app aur email me (D-111).
- **Delivery ka saboot:** har parcel ka 6 ank ka code customer ke app aur confirmation email me, partner ke app ko code kabhi nahi (D-072, D-077, SR-054); code na mile to photo + location (D-072); code wali delivery sirf online (D-301); photo app ke camera se (SR-055); location sirf "delivered" aur "fail" ke pal pe (D-254). Daawa: code se 48 ghante, photo-location se misaal 7 din (D-148).
- **Consent aur data:** koi checkbox pehle se tick nahi, "Haan" aur "Nahi" barabar (CL-072); sign-up pe alag Data notice (D-255, CL-089); har consent ka "band karo"; profile sudhaar, marketing consent band aur account delete R1 me (D-151, SR-066). Browser storage me sirf theme jaisi pasand (SR-027); service worker `/api/*` cache nahi karta, sign-out pe caches saaf (SR-010).
- **Legal pages:** tay faislon se asli jaisa draft, badge "DUMMY: kisi licensed lawyer ne nahi dekha" aur version (D-150, D-264); platform ki jaankari, Grievance Officer aur nodal person ke contact asli (D-237, D-241, CL-059, CL-064).

[DECISIONS.md]: ../../docs/DECISIONS.md
[PROJECT_PLAN.md]: ../../docs/PROJECT_PLAN.md

## 2. Owner ke sawal

**Dependency:** U-2 U-1 pe tika hai (ek group: U-1 ka jawab pehle). Baaki saare sawal (U-1, U-3 se U-12) kisi khule sawal pe nahi tike: ek saath poochhe ja sakte hain.

### U-1. Brand ke rang ki disha

- **Sawal:** saare 11 apps ke brand rang kis disha me hon?
- **Kyun zaroori:** docs me brand ka koi rang tay nahi. Tokens, har jodi ka contrast, install icons, invoice aur label ke PDF, charts aur order status ke rang sab isi pe tike hain. Baad me badalna har screen ka visual test dobara karna hai.
- **Vikalp:**
  - **(a) Garam rose + gehra plum + champagne gold accent, garam neutrals (ivory se ink).** Misaal: brand rose `rgb(214, 51, 108)`, plum `rgb(92, 26, 70)`, gold `rgb(196, 154, 82)`, page ivory `rgb(253, 248, 245)`, ink `rgb(28, 22, 25)`. Ginti: rose pe safed text 4.62:1, ivory pe ink 16.91:1 (poori scale §3 Batch 2 me).
  - **(b) Neutral premium:** lagbhag kaala-safed UI aur ek hi accent (misaal gehra rose) sirf main buttons aur links pe; rang product photos se aata hai.
  - **(c) Halka pastel (blush, lilac, mint):** naram roop; par pastel pe text ke liye har rang ka alag gehra roop chahiye, aur contrast ka kaam sabse zyada.
- **Salah:** (a). Beauty category me garam rose aur plum pehchaan banate hain; garam neutrals product photos (skin tones) ke saath thande grey se kam takraate hain; aur 50 se 950 tak ki poori scale ke contrast pehle se gine ja sakte hain.
- **Trade-off:** (a) me rose button pe safed text 4.62:1 hai, AA (4.5) se thoda hi upar, to hover aur pressed roop gehre hi hon (kabhi halke nahi). (b) me pehchaan kam, site "aam" lagti hai. (c) me accessibility ka kaam aur galti ka mauka zyada.
- **R1 ya baad me:** R1 (pehli screen se pehle).
- **Kis par tika:** kisi khule sawal pe nahi.

### U-2. Fonts

- **Sawal:** apps ka text kis font me ho?
- **Kyun zaroori:** font page ke wazan (India se Singapore aur Vercel CDN, R-012), daam ke ankon ki line (tabular figures) aur ₹ ke nishaan pe asar karta hai. Docs chup hain.
- **Vikalp:**
  - **(a) Do self-hosted variable fonts (OFL license):** body aur UI ke liye Plus Jakarta Sans, Customer app ki headings ke liye Fraunces; daam aur tables hamesha body font me `tabular-nums` ke saath. Sirf Latin subset jisme ₹ (U+20B9) ho, woff2 me: misaal sans lagbhag 32 KB, display lagbhag 36 KB (italic alag, sirf zaroorat pe). Staff apps me sirf sans.
  - **(b) Ek hi sans font** (misaal Plus Jakarta Sans) saare apps me, headings bhi.
  - **(c) System font stack** (download 0 KB): har phone aur laptop pe alag roop.
- **Salah:** (a). Customer app ko brand ka roop milta hai, staff apps halke rehte hain; dono fonts apne app ke saath Vercel se aate hain (bahar ka font CDN nahi, SR-006 ki bhaavna), `font-display: swap` aur sirf ek preload.
- **Trade-off:** (a) me Customer app ki pehli load pe lagbhag 70 KB zyada; (b) me roop saada; (c) me ₹ aur ank har device pe alag dikh sakte hain aur brand ka roop nahi.
- **R1 ya baad me:** R1.
- **Kis par tika:** U-1 (rang aur font ka mood ek saath chuna jaata hai).

### U-3. Dark theme kab aur kahan

- **Sawal:** dark theme kis release me aur kin apps me ho?
- **Kyun zaroori:** tokens dono themes ke ek saath bante hain, par har screen ko do themes me test karna (visual aur contrast) kaam doguna karta hai. Docs chup hain.
- **Vikalp:**
  - **(a) R1 se saare apps me light aur dark:** default system ki setting, har app me toggle (Light, Dark, System); pasand sirf browser storage me (SR-027 isi ki ijazat deta hai). Print, PDF aur labels hamesha light.
  - **(b) R1 me sirf light; tokens dono ke bane, toggle R2 me.**
  - **(c) Customer app sirf light (product photos ke rang ke liye), staff aur partner apps dono.**
- **Salah:** (a). Tokens ek baar bante hain; extra kaam sirf har screen ka do theme me screenshot test hai, jo E2E ke saath chalta hai. Staff raat me (ops inbox, D-324) aur partners dhoop me (Delivery) kaam karte hain, dono ko apni pasand chahiye.
- **Trade-off:** (a) me visual tests doguna; (b) me R2 me har screen dobara dekhna; (c) me ek app ka alag niyam.
- **R1 ya baad me:** jawab pe nirbhar.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-4. Customer app ka phone pe navigation

- **Sawal:** Customer app me phone pe neeche ki bar (bottom navigation) me kaunse tabs hon?
- **Kyun zaroori:** delivery code (D-072) door pe customer ko turant dikhana padta hai; order ka page jitna paas, utni tez delivery. Search aur cart kahan hain, ye bhi isi se tay hota hai.
- **Vikalp:**
  - **(a) 5 tabs: Home, Categories, Orders, Cart, Account;** search har list aur Home ke header me hamesha khula; wishlist header ke dil (heart) ke icon se.
  - **(b) 5 tabs: Home, Categories, Search, Cart, Account;** Orders Account ke andar.
  - **(c) Neeche bar nahi;** header me menu (hamburger), search aur cart.
- **Salah:** (a). Door pe "Orders" ek tap me khulta hai aur wahi delivery code ka card sabse upar hota hai (§3 Batch 6); search header me pehle se hai to alag tab ki zaroorat nahi.
- **Trade-off:** (a) me wishlist ek tap door; (b) me delivery code do tap door; (c) me phone pe har cheez ek tap aur door, aur menu me cheezein chhupti hain.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-5. Search ke sujhaav (typeahead)

- **Sawal:** search box me likhte waqt sujhaav kaise aayein?
- **Kyun zaroori:** ₹0 pe server lagbhag 5 requests/second lagataar hi sambhaal sakta hai (ARCHITECTURE §9). Har akshar pe server call ek customer se hi 5 se 10 calls bana deti hai. Docs me sujhaav ka tareeka tay nahi.
- **Vikalp:**
  - **(a) Sujhaav nahi:** sirf Enter ya search button pe result.
  - **(b) Har akshar pe server se product sujhaav** (misaal 300 ms ruk ke, kam se kam 2 akshar).
  - **(c) Chhoti public list se sujhaav:** categories, brands aur concerns ki list ek public GET se, CDN pe cache (misaal 10 minute, SR-004 ki public cache list me), browser me hi filter; products ka search Enter pe.
- **Salah:** (c). Ek customer ki ek call, aur sujhaav turant (network ke bina). Zero result pe sujhaav waise bhi D-152 se aate hain.
- **Trade-off:** (c) me product ke naam ka sujhaav nahi; (b) me free tier pe bhaar aur der (India se Singapore); (a) me sabse saada par dhoondhna dheema.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-6. Checkout ke kadam

- **Sawal:** cart se order tak kitni screens hon?
- **Kyun zaroori:** payment gateway ki script sirf payment wale page pe aa sakti hai (SR-006), to payment alag route hi hoga. Kadam jitne kam, chhodne wale utne kam; par saari jaankari (batch ka MRP aur expiry, fee, delivery ki tareekh) order se pehle dikhni hai (D-067, D-107, CL-071).
- **Vikalp:**
  - **(a) Do screens:** "Checkout" (address, delivery ki tareekh ka vaada, payment ka tareeka, har item ka batch ka MRP aur expiry, poora breakup, "Place order") phir online payment ho to "Payment" screen jahan gateway khulta hai; delivery pe UPI ho to seedha order ki screen.
  - **(b) Chaar kadam ka wizard:** Address → Delivery → Payment ka tareeka → Review.
  - **(c) Ek hi screen** jisme gateway bhi khule; tab CSP me gateway ka host checkout route pe khulega.
- **Salah:** (a). Ek nazar me poora order, aur gateway ki script sirf Payment route pe. "Place order" pe hi stock rukta hai (D-118), to 15 minute ka timer Payment screen pe dikhta hai.
- **Trade-off:** (a) me checkout ki screen lambi (phone pe sections ke saath); (b) me kadam zyada aur har kadam pe server call; (c) me bina payment wale kaam (address badalna) bhi gateway ki script ke saath.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-7. Browser push ki permission kab maangein

- **Sawal:** Customer app browser notifications ki ijazat kab maange?
- **Kyun zaroori:** push band ho to delivery fail aur jawab maangne wali khabrein email se jaati hain (D-126, D-131), jo din ki chhat (D-142) khaati hain. Browser ka prompt ek baar "Block" ho jaaye to app dobara nahi maang sakta.
- **Vikalp:**
  - **(a) Pehle order ke baad:** order ki screen pe apna card ("Get delivery updates on this device?" jaisa) "Turn on" aur "Not now" barabar ke buttons ke saath; "Turn on" pe hi browser ka prompt. "Not now" ke baad misaal 30 din tak card nahi. Account → Notifications me hamesha.
  - **(b) Sign-up ke turant baad** browser ka prompt.
  - **(c) Kabhi apne aap nahi,** sirf Account → Notifications se.
- **Salah:** (a). Wajah saaf hoti hai to log zyada haan kehte hain, aur browser ka "Block" kam hota hai; pehle apna card isliye ki "Not now" ke baad bhi raasta khula rahe.
- **Trade-off:** (a) me pehle order se pehle push nahi (area khulne ki khabar, D-141, email se hi jaati hai jinke push band); (b) me "Block" zyada; (c) me push wale kam, emails zyada.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-8. Customer ke address ka pin

- **Sawal:** customer ke address ki location (pin) R1 me kaise bane?
- **Kyun zaroori:** delivery ke saboot me address ke pin se partner ki doori ka nishaan hai (SR-055, misaal 300 m), aur SR-001 location tabhi kholta hai jab address pin bane. Par pin kaise banega, kahin tay nahi. Bina pin ke doori ka check chalega hi nahi.
- **Vikalp:**
  - **(a) Address form me optional "Use my current location"** (browser ki location, ek hi baar, sirf jab customer usi pate pe ho), accuracy ke saath dikhe aur hataya ja sake; koi map nahi. Pin na ho to doori ka check "No pin" nishaan ke saath chhoot jaata hai.
  - **(b) Map pe khiskane wala pin,** browser ki location se shuru; free map tiles (misaal OpenStreetMap; unki usage policy aur attribution jaanchna baaki).
  - **(c) R1 me pin nahi;** doori ka check R2 se, tab tak sirf photo aur samay.
- **Salah:** (a). ₹0, koi teesra map provider nahi, location ek hi pal ki aur customer ke apne haath se. Partner ke liye raasta address ke text se.
- **Trade-off:** (a) me galat jagah se dabaya to galat pin (isliye accuracy aur "Remove pin"); (b) me tiles ki shartein, bhaari page aur ek naya processor (D-255 ki list); (c) me daawe ki jaanch kamzor (D-072 ka "sirf photo aur location" raasta).
- **R1 ya baad me:** R1 (delivery ka saboot R1 me hai).
- **Kis par tika:** kisi khule sawal pe nahi.

### U-9. R1 me Customer app ka Home

- **Sawal:** jab tak Growth Studio (R2) nahi, Home pe kya dikhe?
- **Kyun zaroori:** Home ka content Marketing Head ka kaam hai (D-047, Growth Studio), jo R1 me nahi. R1 ka Home khaali ya haath se bana nahi hona chahiye, aur sirf sach aankde (D-154) aur kisi seller ka boost nahi (D-139) laagu hain.
- **Vikalp:**
  - **(a) Sirf data se bane hisse:** pincode ka card (area live hai ya nahi, D-046), categories, "Bestseller" (D-154 ke niyam se), naye products, top rated; koi banner nahi.
  - **(b) (a) + 1 se 3 static banners** (image + link) Master ki setting se.
  - **(c) Growth Studio ka chhota banner editor R1 me** (R1 ka scope badhta hai).
- **Salah:** (a). Koi naya role ya upload ka raasta nahi, aur har hissa niyam se bana to bhed ka sawal nahi.
- **Trade-off:** (a) me Home kam sajaa; (b) me ek setting aur image upload, aur banners ka maalik role R1 me chahiye; (c) R1 me naya kaam.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-10. Server jaagne ke parde pe kya

- **Sawal:** app khulne pe jab server jaag raha ho (cold start 90 second tak), parde pe kya ho?
- **Kyun zaroori:** raat 22:00 se 09:00 IST aur din me bhi 15 minute khaali rehne pe server soya hota hai (D-322, OPERATIONS §5), to bahut se visits ki pehli cheez yahi parda hai. Jawab se pehle koi API call nahi (ARCHITECTURE §5 niyam 14) tay hai; parde ka roop tay nahi.
- **Vikalp:**
  - **(a) Saada parda:** pehle 1.5 second (misaal) sirf page ka rang aur patli progress bar (jaage server pe bas ek jhalak); phir logo, ek line "Starting up. This can take up to a minute on our free server." aur andaaze wali progress bar; 150 second (misaal) baad "Try again". Customer app me demo ki patti bhi.
  - **(b) (a) + bundle me rakhi static jaankari** (About aur contact) bina server ke.
  - **(c) Customer app me bundle ki images ka "lookbook"** jab tak server jaage.
- **Salah:** (a). Jaage server pe parda dikhta hi nahi; soye pe saaf sandesh. Static copies (b) purani ho sakti hain, kyunki legal pages aur contact settings se aate hain (D-150).
- **Trade-off:** (a) me intezaar me kuch padhne ko nahi; (b) me do jagah ki jaankari ka mel bigad sakta hai; (c) me bundle bhaari.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-11. Icons ka set

- **Sawal:** apps ke icons kis open set se liye jaayein?
- **Kyun zaroori:** icons ka license har copy pe laagu hota hai, aur license list (CL-125) me har asset ka license aur attribution chahiye. Ek set se roop ek jaisa rehta hai.
- **Vikalp:**
  - **(a) Lucide (ISC license):** 24 px grid, 2 px stroke; sirf istemaal hone wale SVG apne icons package me copy; license ka notice ek file me.
  - **(b) Solar (CC BY 4.0):** zyada style; har app me "Icon credits" page zaroori.
  - **(c) Phosphor (MIT):** kai weights; license notice ek file me.
- **Salah:** (a). Saada license, e-commerce ke saare aam icons, ek jaisa stroke; beauty ke khaas icons (lipstick, swatch) apne banaye, usi grid pe.
- **Trade-off:** (a) me beauty ke icons apne banane padte hain; (b) me credit page har app me; (c) me weights ka chunaav har jagah.
- **R1 ya baad me:** R1.
- **Kis par tika:** kisi khule sawal pe nahi.

### U-12. Phone ki location na mile to photo wali delivery

- **Sawal:** code na mile aur partner ke phone se location na mile (GPS band, ijazat mana, ya andar signal nahi), to kya photo wali delivery ho sakti hai?
- **Kyun zaroori:** D-072 niyam 2 ka saboot photo **aur** location hai. Location kabhi-kabhi milti hi nahi; tab app kya kare, tay nahi. Code wali delivery online hoti hai (D-301), par photo wala raasta usi pal ki location pe tika hai.
- **Vikalp:**
  - **(a) Location ke bina photo wali delivery band:** app wajah dikhaye ("Turn on location" ka raasta); na ho sake to "attempt fail" (D-108) ya Hub Manager se baat (D-301 jaisa).
  - **(b) Location ke bina bhi photo wali delivery,** "No location" ke nishaan ke saath; aisi har delivery Support ki jaanch ki list me, aur daawa aaye to D-072 niyam 3 ka "koi saboot nahi" jaisa maana jaaye.
  - **(c) (b), par partner ke liye mahine me tay seema** (misaal 3); seema ke baad (a).
- **Salah:** (c). Asli duniya me GPS kabhi-kabhi fail hota hai, aur har baar parcel lautana customer aur RTO dono ka nuksaan hai; seema se galat istemaal ruka rehta hai aur D-072 niyam 4 ka record bhi banta hai.
- **Trade-off:** (a) me saboot pakka par RTO aur fail koshishein badhti hain; (b) me saboot kamzor aur daawe pe nuksaan platform ka; (c) me ek aur setting aur ginti.
- **R1 ya baad me:** R1 (delivery ka saboot R1 me hai).
- **Kis par tika:** kisi khule sawal pe nahi.

## 3. DESIGN.md ke liye batches

Har batch ke niyam seedhe naye doc me ja sakte hain. Tokens ke naam code me waise hi (CSS custom properties, Tailwind theme). Rang `rgb(r, g, b)` me; ratios is run ki ginti.

### Batch 1. Design ke siddhaant

**Kis par:** D-010, D-012, D-042, D-139, D-145, D-154, CL-070 se CL-072. **R1.**

1. **DS-1.1 Bharosa pehle:** daam, batch ka MRP, expiry, shade, seller aur return ki shartein kharid se pehle saaf dikhein; koi zaroori jaankari tooltip ya chhote text me chhupi nahi.
2. **DS-1.2 Ek design system, 11 apps:** saare apps ek hi tokens, components aur icons se bante hain; layout app parivaar ke kaam se (Batch 5). Naya rang, size ya component pehle design system me, phir app me.
3. **DS-1.3 Kaam ke hisaab se device:** Customer aur Delivery phone pehle; Seller aur staff apps desktop pehle, par phone pe bhi poore chalte hain (D-042). Koi kaam sirf ek device pe band nahi.
4. **DS-1.4 Server ka sach:** screen sirf wahi dikhaye jo server ne kaha (total, stock, status); client apna andaaza "pakka" ki tarah nahi dikhata. Server se pehle jawab ki jhalak (optimistic UI) sirf wishlist aur filters jaise ulte ho sakne wale kaam pe.
5. **DS-1.5 Koi dark pattern nahi:** jhoothi jaldi, jhootha stock, chhupe charges, pehle se tick, "Nahi" ko chhota ya dhundhla karna, baar-baar poochhna, cancel ya delete ko order se mushkil banana: kuch nahi (CL-070 se CL-073).
6. **DS-1.6 Saaf halat:** har screen pe loading, khaali, error aur (jahan laagu) offline ki halat bani ho (Batch 6); har error ke saath aage ka raasta.
7. **DS-1.7 Sabke liye:** WCAG 2.2 AA har app me, light aur dark dono (Batch 8).
8. **DS-1.8 Halka aur tez:** ₹0 hosting aur India se Singapore ki der (R-012) maan ke: kam calls, chhote bundles, images sahi size me (Batch 10).
9. **DS-1.9 Demo saaf:** demo aur dummy ka nishaan har jagah jahan dhokha ho sake (D-145), design ka hissa, chhupane wala nahi.

### Batch 2. Rang ke tokens: palette aur light theme (U-1 pe tika)

**Kis par:** U-1 (salah (a)), D-001 (Tailwind). **R1.**

1. **DS-2.1 Sirf apne tokens:** Tailwind ke default rang aur shadows hatte hain; har rang ek token se. Raw palette `--<hue>-<step>-rgb` (sirf RGB channels, jaise `214, 51, 108`), taaki `rgb(var(--rose-600-rgb) / 0.12)` jaise halke roop ban sakein. Components sirf semantic tokens use karte hain, raw palette nahi.
2. **DS-2.2 Palette (11 steps, 50 se 950):**

   | Hue                  | 50          | 100         | 200         | 300         | 400         | 500         | 600         | 700        | 800       | 900      | 950      |
   | -------------------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ----------- | ---------- | --------- | -------- | -------- |
   | `rose` (brand)       | 255,243,245 | 255,229,234 | 255,203,213 | 255,167,186 | 255,120,156 | 240,77,129  | 214,51,108  | 177,27,84  | 143,6,64  | 112,0,48 | 77,0,31  |
   | `plum` (gehra brand) | 255,243,249 | 255,228,243 | 252,201,230 | 244,169,213 | 229,135,192 | 208,104,170 | 181,80,145  | 151,60,119 | 121,43,94 | 92,26,70 | 67,14,49 |
   | `gold` (accent)      | 252,246,236 | 248,235,215 | 238,215,180 | 224,191,137 | 196,154,82  | 184,137,49  | 159,113,12  | 130,91,0   | 102,70,0  | 78,53,0  | 53,35,0  |
   | `neutral` (garam)    | 253,248,245 | 243,235,229 | 240,225,215 | 202,194,189 | 177,169,164 | 152,144,139 | 128,121,116 | 105,98,93  | 82,76,71  | 64,57,53 | 28,22,25 |
   | `success`            | 238,251,239 | 218,245,222 | 184,234,192 | 141,217,155 | 93,196,117  | 22,163,74   | 0,147,63    | 0,120,50   | 0,94,37   | 0,72,27  | 0,48,15  |
   | `warning`            | 255,245,237 | 255,232,215 | 255,208,173 | 248,179,125 | 235,147,72  | 217,119,6   | 181,98,0    | 148,79,0   | 116,60,0  | 90,45,0  | 61,29,0  |
   | `error`              | 255,244,242 | 255,230,227 | 255,205,198 | 255,171,160 | 255,127,114 | 250,73,65   | 220,38,38   | 186,14,22  | 148,0,10  | 115,0,6  | 80,0,3   |
   | `info`               | 243,247,255 | 228,237,255 | 200,219,255 | 165,196,255 | 125,169,255 | 84,140,255  | 37,99,235   | 31,87,210  | 18,65,171 | 8,48,137 | 1,29,100 |

   Saath me `white` (255,255,255) aur `black` (0,0,0). Charts ke liye do aur hue, sirf charts aur category tags me (kabhi text ya status ka matlab nahi): `teal-600` 13,148,136, `teal-400` 96,190,178, `violet-600` 124,58,237, `violet-400` 175,151,255.
3. **DS-2.3 Light theme ke semantic tokens** (ratio saath ki jodi pe):

   | Token                                        | Value                            | Kaam                             | Ratio                                   |
   | -------------------------------------------- | -------------------------------- | -------------------------------- | --------------------------------------- |
   | `background`                                 | neutral-50                       | page                             |                                         |
   | `surface`                                    | white                            | card, dialog, input              |                                         |
   | `surface-muted`                              | neutral-100                      | section, table header            |                                         |
   | `surface-inverse`                            | neutral-950                      | footer, demo ki patti            |                                         |
   | `foreground`                                 | neutral-950                      | main text                        | 16.91 (background), 17.82 (surface)     |
   | `foreground-muted`                           | neutral-800                      | doosra text                      | 8.02 (background)                       |
   | `foreground-subtle`                          | neutral-700                      | hint, meta                       | 5.68 (background), 5.08 (surface-muted) |
   | `foreground-inverse`                         | neutral-50                       | ulti patti pe text               | 16.91                                   |
   | `border`                                     | neutral-200                      | sirf sajawat ki lines            | (seema nahi batata)                     |
   | `border-strong`                              | neutral-600                      | input, checkbox, radio ki seema  | 4.28 (surface)                          |
   | `brand` / `brand-hover`                      | rose-600 / rose-700              | main button                      | safed text 4.62 / 6.66                  |
   | `brand-foreground`                           | white                            | brand pe text                    |                                         |
   | `brand-subtle` / `brand-subtle-foreground`   | rose-50 / rose-800               | halka chip, selected row         | 8.55                                    |
   | `brand-text`                                 | rose-700                         | links, chalu nav                 | 6.32 (background), 6.66 (surface)       |
   | `secondary` / `secondary-hover`              | plum-800 / plum-900              | doosra bhara button              | safed text 9.05                         |
   | `accent` / `accent-foreground`               | gold-500 / neutral-950           | khaas badge (jaise "Bestseller") | 5.66                                    |
   | `success`, `info`, `error`                   | success-700, info-600, error-600 | status bhara                     | safed text 5.63, 5.17, 4.83             |
   | `warning` / `warning-foreground`             | warning-500 / neutral-950        | chetavni bhari                   | 5.59                                    |
   | `<tone>-subtle` / `<tone>-subtle-foreground` | 50 / 800                         | status ka halka roop             | success 7.49, warning 8.18, error 8.60  |
   | `price-discount`                             | success-700                      | "% off"                          | 5.63 (surface)                          |
   | `rating`                                     | gold-500                         | sirf star ka shape               | 3.15 (surface; non-text)                |
   | `focus-ring`                                 | rose-600                         | keyboard focus                   | 4.38 (background)                       |
   | `focus-ring-inverse` / `brand-text-inverse`  | rose-400 / rose-300              | ulti patti pe focus aur link     | 7.15 / 9.75 (neutral-950)               |
   | `shadow-color`                               | neutral-950                      | shadows                          |                                         |

4. **DS-2.4 Text sirf text wale tokens me:** padhne wala text sirf `foreground*`, `brand-text`, `price-discount`, `error` (inline error) ya kisi tone ke `-foreground` / `-subtle-foreground` me. `brand`, `accent`, `rating` aur `border*` text ke liye nahi.
5. **DS-2.5 Hover hamesha gehra:** light me hover ek step gehra (600 → 700); kabhi halka nahi, taaki rose button pe safed text 4.5:1 se neeche na jaaye.
6. **DS-2.6 Ulti patti:** footer aur demo ki patti `surface-inverse` pe, aur wahan focus ring `focus-ring-inverse` aur links `brand-text-inverse`.
7. **DS-2.7 Rang akela matlab nahi:** status, error, stock aur order ki halat hamesha shabd ya icon ke saath (WCAG 1.4.1).
8. **DS-2.8 Order status ke tone:** har app me ek hi map (misaal: Placed `info`, Packed `neutral`, Out for delivery `brand`, Delivered `success`, Delivery failed `warning`, Cancelled aur Returned `neutral`, Refund pending `warning`, Refunded `success`); map ek jagah code me, apps sirf status bhejte hain.
9. **DS-2.9 Charts:** series ka kram light me rose-600, info-600, teal-600, gold-600, violet-600, success-700 (white pe 4.62, 5.17, 3.74, 4.34, 5.70, 5.63: har ek kam se kam 3:1); label ya legend hamesha, sirf rang se series nahi.
10. **DS-2.10 Contrast ki jaanch CI me:** ek script har semantic jodi ka ratio har theme me jaanchta hai (text 4.5:1, bada text aur UI parts 3:1, high contrast me 7:1); fail pe CI laal. Naya token isi script se aata hai.

### Batch 3. Dark theme aur high contrast (U-3 pe tika)

**Kis par:** U-3 (salah (a)), SR-027. **R1.**

1. **DS-3.1 Theme ka chunaav:** `<html data-theme="light|dark">`; attribute na ho to system ki setting (`prefers-color-scheme`). Har app ke account ya settings menu me Light, Dark, System. Pasand sirf browser storage me (SR-027), server pe nahi. Pehle paint se pehle ek chhoti inline script theme lagaye, taaki safed jhalak na aaye (CSP me uska hash, SR-005).
2. **DS-3.2 Dark ke semantic tokens:**

   | Token                                         | Value                                   | Ratio                                          |
   | --------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
   | `background` / `surface` / `surface-muted`    | neutral-950 / neutral-900 / neutral-800 |                                                |
   | `surface-inverse`                             | neutral-50                              |                                                |
   | `foreground`                                  | neutral-50                              | 16.91 (background), 10.74 (surface)            |
   | `foreground-muted`                            | neutral-300                             | 6.45 (surface), 4.82 (surface-muted)           |
   | `foreground-subtle`                           | neutral-400                             | 4.90 (surface); `surface-muted` pe mana (3.66) |
   | `border` / `border-strong`                    | neutral-800 / neutral-500               | border-strong 3.61 (surface)                   |
   | `brand` / `brand-hover` / `brand-foreground`  | rose-400 / rose-300 / neutral-950       | 7.15                                           |
   | `brand-subtle` / `brand-subtle-foreground`    | rose-950 / rose-200                     | 11.05                                          |
   | `brand-text`                                  | rose-300                                | 6.19 (surface), 9.75 (background)              |
   | `secondary` / `secondary-foreground`          | plum-300 / neutral-950                  | 9.75                                           |
   | `accent` / `accent-foreground`                | gold-400 / neutral-950                  | 6.87                                           |
   | `success`, `warning`, `error`, `info` (bhare) | 400 steps, text neutral-950             | 8.16, 7.47, 7.24, 7.63                         |
   | `<tone>-subtle` / `-subtle-foreground`        | 950 / 200                               |                                                |
   | `price-discount`                              | success-300                             | 6.76 (surface)                                 |
   | `rating`                                      | gold-400                                | 4.36 (surface)                                 |
   | `focus-ring`                                  | rose-400                                | 4.54 (surface), 7.15 (background)              |
   | `focus-ring-inverse` / `brand-text-inverse`   | rose-700 / rose-700                     | 6.32 (neutral-50)                              |
   | `shadow-color`                                | black                                   |                                                |

3. **DS-3.3 Dark me hover ek step halka** (400 → 300), taaki gehre text ke saath contrast badhe.
4. **DS-3.4 Dark me charts:** rose-400, info-400, teal-400, gold-400, violet-400, success-400 (surface pe 4.54, 4.85, 5.13, 4.36, 4.69, 5.19).
5. **DS-3.5 Product images aur swatches kabhi invert ya filter nahi;** shade ka hex swatch dono themes me asli rang, ek patli `border-strong` seema ke saath taaki gehra shade dark background me na kho jaaye.
6. **DS-3.6 High contrast:** `prefers-contrast: more` ya app ki setting (`data-contrast="more"`): saara text kam se kam 7:1, focus ring 3 px, `border` = `border-strong`. Light me: `foreground-subtle` → neutral-800, `brand` aur `brand-text` → rose-800 (safed 9.26, background pe 8.78), status bhare 800 steps (success 7.99, error 9.28, info 8.86). Dark me: `foreground-muted` aur `foreground-subtle` → neutral-200 (surface pe 8.87), `brand-text` → rose-200 (7.96), status 300 steps (neutral-950 ke saath 9.83 se 10.64). Baaki jodiyan DS-2.10 ki script se 7:1 tak pakki.
7. **DS-3.7 Print hamesha light** (invoice, credit note, labels, manifest, run sheet), aur print me demo ka watermark (D-145 niyam 2) bhi.

### Batch 4. Typography, spacing, radius, shadow, layers aur motion (U-2 pe tika)

**Kis par:** U-2 (salah (a)), ARCHITECTURE §10.1 (integer paise), D-308. **R1.**

1. **DS-4.1 Fonts:** `--font-sans`: "Plus Jakarta Sans", system-ui, sans-serif; `--font-display` (sirf Customer app ki headings aur banners): "Fraunces", Georgia, serif; `--font-mono`: ui-monospace, Menlo, Consolas, monospace. Dono variable woff2, apne app ke saath served, Latin subset jisme ₹ (U+20B9) ho; `font-display: swap`; sirf body font ka preload. License (OFL) CL-125 ki list me.
2. **DS-4.2 Size scale** (size / line-height, px): `xs` 12/16, `sm` 14/20, `base` 16/24, `lg` 18/28, `xl` 20/28, `2xl` 24/32, `3xl` 30/36, `4xl` 36/40. Customer aur Delivery me body 16 se chhota nahi; staff ki dense tables me 14 tak; 12 sirf badge aur caption me. Inputs hamesha 16 (phone pe apne aap zoom na ho).
3. **DS-4.3 Weights:** 400 body, 500 labels aur nav, 600 headings aur buttons, 700 sirf daam aur bade aankde.
4. **DS-4.4 Ank:** daam, quantity, tables, order number aur codes `tabular-nums`. Daam hamesha `font-sans` me.
5. **DS-4.5 Paisa aur tareekh `en-IN` me** (`Intl` ke ek saajhe helper se): ₹1,299 aur ₹1,29,999; UI pe paise sirf tab jab shunya na hon (₹1,299.50), invoice, refund aur finance ki screens pe hamesha do decimal. Tareekh "21 Nov 2026", samay "2:30 pm" (IST); delivery ka vaada "Tomorrow, 22 Nov"; expiry sirf mahina-saal "Mar 2028" (D-067). Rakam server se integer paise me aati hai; app khud ginti nahi karta (SR-044).
6. **DS-4.6 Order number aur codes:** order number D-308 ke roop me (`4827-1930-56`), copy button ke saath. Delivery code bade ankon me (misaal 32 px, `font-mono`, 3+3 ke group "482 193"), taaki door pe bol ke bataya ja sake.
7. **DS-4.7 Spacing:** 4 px ka scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Page ka gutter phone 16, tablet 24, desktop 32.
8. **DS-4.8 Radius:** `xs` 4, `sm` 6, `md` 8 (button, input), `lg` 12 (card), `xl` 16 (dialog, sheet), `2xl` 24, `full` (chip, badge, avatar). Ek component ke andar ek hi radius family.
9. **DS-4.9 Shadows** (`shadow-color` se, dono themes me sahi):
   - `xs`: `0 1px 2px 0 rgb(var(--shadow-color-rgb) / 0.05)`
   - `sm`: `0 1px 3px 0 / 0.08, 0 1px 2px -1px / 0.08`
   - `md`: `0 4px 6px -1px / 0.08, 0 2px 4px -2px / 0.06`
   - `lg`: `0 10px 15px -3px / 0.10, 0 4px 6px -4px / 0.06`
   - `xl`: `0 20px 25px -5px / 0.12, 0 8px 10px -6px / 0.08`
   - `focus`: `0 0 0 3px rgb(var(--focus-ring-rgb) / 0.45)`
   (har line me rang `rgb(var(--shadow-color-rgb) / <alpha>)`).
10. **DS-4.10 Layers:** dropdown 1000, sticky 1100, header 1200, overlay 1300, modal 1400, popover 1500, toast 1600, tooltip 1700; koi aur z-index number code me nahi.
11. **DS-4.11 Motion:** `duration-fast` 120 ms, `duration-base` 200 ms, `duration-slow` 320 ms; easing `standard` cubic-bezier(0.2, 0, 0, 1), `enter` (0, 0, 0, 1), `exit` (0.4, 0, 1, 1), `spring` (0.34, 1.56, 0.64, 1) sirf chhoti cheezon pe (wishlist ka dil, count). Motion sirf matlab ke liye (kya khula, kahan gaya); koi parallax nahi, apne aap chalne wala carousel nahi.
12. **DS-4.12 Reduced motion:** `prefers-reduced-motion: reduce` pe teeno durations 0 ms, aur 5 second se lambi chalti cheez (misaal progress ka shimmer) ruki; skeleton bina shimmer ke.

### Batch 5. Breakpoints, layout aur app parivaar (U-4 pe tika)

**Kis par:** D-010, D-042, D-183, U-4 (salah (a)). **R1.**

1. **DS-5.1 Breakpoints** (min-width, px): `base` 450, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536. Har screen 320 (reflow, WCAG 1.4.10), 360, 768 aur 1280 pe test; 320 pe koi horizontal scroll nahi (tables ko chhod ke, jo cards ban jaati hain).
2. **DS-5.2 Shell ke size:** header 64 px; Customer ki neeche ki bar 64 px + safe area; Delivery ki action bar 72 px + safe area; sidebar 256 px (band 72 px); page max 1280 px; padhne wale pages (legal, policy) max 720 px; dialog 512 px; side sheet 448 px.
3. **DS-5.3 Media ratios:** product image 1:1; banner 3:1 (phone pe 16:9); portrait 4:5 (review photos ka grid). Image ki jagah pehle se reserve (layout shift nahi).
4. **DS-5.4 Customer app (storefront):** image-led; header me logo, search aur wishlist (desktop pe cart aur account bhi). Phone pe neeche 5 tabs: Home, Categories, Orders, Cart (count ke saath), Account (U-4). Product grid: 2 columns (640 se kam), 3 (`md`), 4 (`lg` se upar). Filters phone pe neeche se khulne wali sheet me, desktop pe baayein column me.
5. **DS-5.5 Partner dashboards (Seller, Creator):** sidebar + top bar; Home pe "kya karna baaki" ki checklist (onboarding, ruki listings, maal bhejna); cards aur tables; phone pe top bar + menu sheet.
6. **DS-5.6 Staff data-dense apps (Admin, Super Admin, Master, Support Desk, Finance, Growth Studio):** sidebar me sirf wahi sections jo user ki permissions kholti hain (faisla server ka); list = filters (URL me) + table (phone pe cards) + detail side sheet me; queue wali screens me "Next item" aur ginti. Keyboard: `/` search, `?` shortcuts ki list; koi shortcut akela akshar likhne wale field me nahi chalta.
7. **DS-5.7 Logistics Ops:** data-dense + scan pehle: scan wali screen pe scan ka input hamesha focus me, bade buttons (48 px), har scan ka nateeja bade shabd + rang + icon me ("Accepted", "Wrong bin", "Already scanned"), awaaz aur vibration jahan browser de (band karne ka switch). Tablet aur haath ke scanner dono pe. Map R1 me nahi.
8. **DS-5.8 Delivery app (PWA):** sirf phone ke liye design (desktop pe beech me phone jitni chaudai); ek haath se: main kaam neeche ki action bar me; upar patli status patti: online ya offline aur "N waiting to sync"; "Sunlight mode" (high contrast, DS-3.6) default chalu, header se band ho sake.
9. **DS-5.9 App ki pehchaan:** har app ke header me app ka naam (Customer me sirf logo); install icon ki tile parivaar ka rang batati hai: Customer ivory (neutral-50), staff apps ink (neutral-950), partner apps (Seller, Creator, Delivery) rose (rose-600). Home screen ka naam: Customer "Beautinique", baaki "BQ <App>" (jaise "BQ Seller", "BQ Delivery", "BQ Logistics"; 12 akshar tak). Maskable icon me mark 80% ke safe circle me.
10. **DS-5.10 Sign-in ki screen pe app ka host:** har app ki sign-in screen pe saaf likha ho ki ye kaunsa app hai aur iska tay URL (SR-012), taaki nakli page pehchanna aasaan ho (R-017).

### Batch 6. Components aur screen ki halatein

**Kis par:** D-001 (react-aria-components), ARCHITECTURE §5 niyam 5, 7, 8, 9, 11, 14, SR-009, D-181. **R1.**

1. **DS-6.1 Neev:** har interactive component react-aria-components pe (keyboard, focus aur screen reader ka vyavhaar usi se), styling sirf tokens se. Ek saajha components package aur ek commerce components package; har component ki apni playground aur test.
2. **DS-6.2 Bunyadi components:** Button (primary, secondary, outline, ghost, destructive; height 36, 44, 48; loading pe chaudai wahi aur label padha jaaye), IconButton (label zaroori), Link, Badge, Chip, Tooltip (sirf extra jaankari, zaroori nahi), Divider, Avatar; TextField, PasswordField (dikhao/chhupao, paste chale), CodeInput (6 ank ek hi field me, `inputmode="numeric"`, `autocomplete="one-time-code"`, poora paste), SearchField, QuantityStepper (min aur max server se, D-091), Select, ComboBox, Checkbox (kabhi pehle se tick nahi), RadioGroup, Switch, TextArea (ginti ke saath), DatePicker, FileUpload (type aur size pehle se likhe, SR-061), PincodeField (6 ank); Dialog, ConfirmDialog, Sheet (side aur neeche), Popover, Menu, Toast; DataTable (cursor se "Load more", filters URL me, phone pe cards, sticky header), DescriptionList, Tabs, Accordion, Stepper, Timeline; Skeleton, Spinner, ProgressBar, Alert.
3. **DS-6.3 Commerce components:** ProductCard, PriceBlock, ShadeSwatch aur ShadePicker, ExpiryLine, PackInfo, IngredientsPanel, ClaimBadges, SellerBlock, ReturnLine, DeliveryPromise, DeliveryFeeLine, StockLabel, RatingStars, ReviewCard, OrderStatusBadge, OrderTimeline, DeliveryCodeCard, RefundStatus, PaymentTimer, AddressCard; Delivery ke liye StopCard, UpiQrPanel, ProofCapture, SyncStatus; Logistics ke liye ScanInput aur ScanResult; har app ke liye DemoStrip, DummyBadge, StepUpDialog, IdleWarning, WakeScreen, UpdateBanner, PausedBanner, EmptyState, ErrorState, PermissionDenied, OfflineBanner. Kahan kya dikhta hai: Batch 9.
4. **DS-6.4 Loading:** list aur page pe Skeleton (shape jaisa); Spinner sirf button ya chhote kaam ke andar; pehli load ke baad poore page ka spinner nahi. Purana data dikhte hue taaza ho raha ho to chhota "Updating" ka nishaan.
5. **DS-6.5 Khaali halat:** kya hai, kyun khaali, aur ek kaam ka button. Misaal: cart khaali "Your cart is empty" + "Browse categories"; seller ki listings khaali "Add your first product"; Support ki queue khaali "No cases waiting".
6. **DS-6.6 Error ka map** (ARCHITECTURE §5 niyam 8, 9): server ka `message` dikhe aur `requestId` "Ref" ke roop me copy ho sake. 400 aur 422: field ke paas ya form ke upar; 401: sign-in pe, wapas usi page pe (SR-021); 403: PermissionDenied (kaunsi permission aur kisse maangein); 404: "Not found" (scope ke bahar bhi wahi, kuch zyada nahi); 409: "This changed. Showing the latest." aur taaza data; 413: file ya data bada; 426: UpdateBanner "A new version is available" + Reload; 429: `Retry-After` se ulti ginti, tab tak button band; 503: "Busy right now, trying again" ya kill switch ka sandesh. "Try again" sirf GET aur idempotency key wale kaam pe (niyam 11).
7. **DS-6.7 Rukawat ke sandesh (SR-009):** har kill switch ka apna saaf sandesh, misaal checkout band: "Checkout is paused right now. Your cart is saved."; sign-up band: "New sign-ups are paused."; uploads band: upload ke button pe wajah. Sandesh banner me, page band nahi.
8. **DS-6.8 Offline:** Delivery ke alawa apps offline me OfflineBanner ("You're offline") aur aakhri dikha data padhne ke liye; badalne wale buttons band, wajah ke saath; koi kaam line me nahi rukta. Delivery app ka offline Batch 5 niyam 8 aur FL-9 me.
9. **DS-6.9 Jaagne ka parda (U-10 pe tika):** app khulte hi pehle 1.5 second (misaal) sirf page ka rang aur patli progress bar; jawab na aaye to WakeScreen: logo, "Starting up. This can take up to a minute.", andaaze wali progress, aur 150 second (misaal) pe "Try again". Beech me rewrite 502 ya 504 de to wahi parda dobara (OPERATIONS §5 niyam 8). Parde pe koi API call nahi.
10. **DS-6.10 Staff ka bina kaam ka samay (D-181):** 30 minute bina kaam pe band hone se 2 minute pehle IdleWarning dialog, ulti ginti aur "Stay signed in" ke saath (WCAG 2.2.1); band hone ke baad sign-in pe wapas usi page pe. Bhara hua form khone se pehle bhi yahi chetavni.
11. **DS-6.11 Forms:** label hamesha dikhe (sirf placeholder nahi); jaanch blur aur submit pe; lambe form me upar errors ki list (har error field ki link); error pe bhara data kabhi saaf nahi; form ka schema wahi jo contract ka (zod), react-hook-form ke saath.
12. **DS-6.12 Pakka karne wale dialog:** cancel, delete, payout, refund jaise kaam pe ConfirmDialog cheez ka naam aur asar likhe ("Cancel 1 item: Lip Tint, Ruby. ₹499 will be refunded to your original payment method."); "Cancel" aur "Confirm" ek size ke; destructive button pe `error` tone.
13. **DS-6.13 Optimistic UI** sirf wishlist, filters aur sort pe; paisa, stock, order aur status ke kaam pe kabhi nahi.
14. **DS-6.14 Gol kone wale dibbe me scroll:** dibba khud scroll nahi karta; dibba `overflow: hidden` se kone kaat-ta hai aur andar ka hissa scroll karta hai, patle theme wale scrollbar ke saath (table, picker ki list, dialog), taaki scrollbar kone se bahar na dikhe.

### Batch 7. Icons, logo, images aur media (U-11 pe tika)

**Kis par:** U-11 (salah (a)), D-284, D-296, SR-005, SR-055, SR-061, CL-125. **R1.**

1. **DS-7.1 Apna icons package:** ek hi open set (U-11) se sirf istemaal hone wale SVG copy, har icon alag export (bundle me sirf wahi jo app use kare); 24 px grid, 2 px stroke, `currentColor`; size 16, 20, 24, 32. Icon font aur runtime pe icons laana nahi (PWA offline me bhi chale). Beauty ke khaas icons (lipstick, swatch, dropper) usi grid pe apne. License ka notice package me aur CL-125 ki list me.
2. **DS-7.2 Icon ki accessibility:** sajawati icon `aria-hidden`; akele icon wale button pe label zaroori (component bina label ke type error de).
3. **DS-7.3 Logo:** mark + naam; header me 640 px se chhote pe sirf mark; link ka label poora naam; favicon saada (rose tile pe "B"); ulti patti aur print pe ek rang ka roop.
4. **DS-7.4 Product images:** media provider ke transform se auto format aur quality, `srcset` widths 160, 320, 480, 640, 960, 1280 aur sahi `sizes`; fold ke neeche lazy; product page ki pehli image (LCP) lazy nahi aur `fetchpriority="high"`; 1:1, halke neutral background pe; product page pe zoom (phone pe pinch, desktop pe click), max 1600 px.
5. **DS-7.5 Alt text data se:** product image ka alt brand + product + shade + view ("front", "label"), apne aap bana; label photo "Ingredient label"; review photo "Customer photo 1 of 3". Seller ka free text alt nahi.
6. **DS-7.6 Shade:** swatch hex se bana gol (32 px, `border-strong` ki patli seema) + swatch photo; chuna shade check icon aur naam ke saath; stock khatam shade pe tirchhi line aur "Out of stock" text (sirf rang se nahi).
7. **DS-7.7 Private media** (delivery ki photo, daawe ki photos aur video, dastavez): sirf chhote signed URL se (D-296), service worker kabhi cache nahi, page pe `no-referrer` (SR-005); sirf haq wale ki screen pe (D-191, D-192).
8. **DS-7.8 Camera:** Delivery app me saboot ki photo app ke camera se (file input pe `capture`, SR-055); pehli baar se pehle app ki apni samjhane wali screen, phir browser ka prompt. Customer ke daawe ki photos (D-106) aam file picker se; EXIF server hataata hai (SR-061).
9. **DS-7.9 Video** sirf daawe me (optional, D-106), poster ke saath, apne aap nahi chalta.

### Batch 8. Accessibility (WCAG 2.2 AA)

**Kis par:** DS-1.7, D-206 (CAPTCHA nahi). **R1.**

1. **DS-8.1 Lakshya:** saare apps WCAG 2.2 AA, light, dark aur high contrast me. Component tests aur E2E me automated accessibility jaanch (misaal axe): serious ya critical ek bhi nahi to hi pass. Har release se pehle mukhya flows (sign-in, checkout, delivery code, return, listing, scan, delivery) pe keyboard aur screen reader ki haath ki checklist.
2. **DS-8.2 Contrast:** Batch 2 aur 3 ke tokens se; text 4.5:1, bada text aur UI parts (input ki seema, focus, icons) 3:1.
3. **DS-8.3 Focus:** hamesha dikhe: 2 px `focus-ring`, 2 px offset (high contrast me 3 px); sticky header ya neeche ki bar focus ko na dhake (WCAG 2.4.11): `scroll-padding-top` header jitna, `scroll-padding-bottom` bar jitna.
4. **DS-8.4 Keyboard:** har kaam keyboard se; koi trap nahi; dialog focus andar rakhe aur band hone pe kholne wale button pe lautaye; har page pe "Skip to content".
5. **DS-8.5 Touch targets:** har app me kam se kam 44 × 44 px, Delivery aur scan ki screens pe 48 × 48 px; paas ke targets me 8 px ka faasla (WCAG 2.5.8 ki 24 px se upar).
6. **DS-8.6 Dragging ka vikalp:** jo bhi khinch ke hota hai (jaise listing ki images ka kram), uska button wala raasta bhi ("Move left", "Move right") (WCAG 2.5.7).
7. **DS-8.7 Screen reader:** har page ka ek `h1`, headings kram se, landmarks (header, nav, main, footer); har route ka title "<Page> · <App>"; route badalne pe title padha jaaye aur focus `h1` pe; toast `polite`, error `assertive`; cart ki ginti ka badlav padha jaaye; payment ka timer sirf 5 minute aur 1 minute bache pe padha jaaye, har second nahi (WCAG 4.1.3).
8. **DS-8.8 Forms:** errors field se jude (`aria-describedby`), text + icon; `autocomplete` sahi (name, email, tel, street-address, postal-code, one-time-code, current-password, new-password) (WCAG 1.3.5); ek baar diya address dobara na maanga jaaye (WCAG 3.3.7); password aur code me paste aur password manager chalein, koi paheli nahi (WCAG 3.3.8).
9. **DS-8.9 Kai kadam wale forms:** naya kadam apne heading pe focus le; kadam ka sandesh ("We sent a code to ...") field se juda.
10. **DS-8.10 Madad ek jagah:** Help aur grievance ka raasta har app me ek hi jagah (Customer me footer aur Account; baaki apps me account menu) (WCAG 3.2.6).
11. **DS-8.11 Zoom aur reflow:** 200% text zoom aur 400% (320 px chaudai) pe koi jaankari ya kaam na khoye.
12. **DS-8.12 Charts aur aankde:** har chart ke saath uski table (dikhao ka button), sirf rang se series nahi.

### Batch 9. Kanooni aur bharose ki jaankari UI me kahan

**Kis par:** neeche har line ka faisla ya CL row. Yahan sirf **kahan dikhe**; kya dikhe wo apne faisle me tay hai. **R1** (jahan R2 likha, wahan baad me).

| Id      | Kya                                                                                                                                                                        | Kahan                                                                                                                                                                       | Kis par                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| DS-9.1  | MRP (sab taxes samet), daam, "% off" (neeche round), pichhle 30 din ka sabse kam daam                                                                                      | ProductCard (MRP, daam, % off), product page ka PriceBlock (+ 30 din wali line), cart, checkout                                                                             | D-064, D-120, D-223, CL-025, CL-074                 |
| DS-9.2  | Agle bhejne wale batch ki expiry (mahina-saal, "Use before" ya "Expiry" jo batch pe ho)                                                                                    | product page daam ke paas, cart aur checkout ki har line, order detail, invoice                                                                                             | D-067, D-124, D-232                                 |
| DS-9.3  | Cart me rakhne ke baad agla batch badla (MRP, daam ya expiry)                                                                                                              | cart aur checkout me line pe "Updated" ka nishaan, purana aur naya; order server ke total pe hi (DS-1.4)                                                                    | D-064, SR-044                                       |
| DS-9.4  | Pack ki jaankari: generic naam, net quantity, manufacturer, packer, marketer, importer aur country of origin (imported), customer care, licence ka type, pack ka dot, size | product page ka "Product details" hissa; net quantity aur country of origin daam ke paas bhi; desktop pe khula, phone pe heading ke saath accordion (heading hamesha dikhe) | CL-026, CL-029, CL-030, CL-037, D-127, D-128        |
| DS-9.5  | Ingredients: poori list, label photo, INCI list, allergen chetavni apni line ke saath ("Based on our allergen list. Check the ingredient list on the pack.")               | product page ka "Ingredients" hissa; allergen chetavni add-to-cart ke paas bhi                                                                                              | D-099, D-159, CL-043                                |
| DS-9.6  | Claims sirf tay list se; test wale saboot ke saath hi                                                                                                                      | product page title ke neeche ClaimBadges; filters me                                                                                                                        | D-100, D-224                                        |
| DS-9.7  | Seller ka block (naam, pata, customer care, seller ka grievance officer)                                                                                                   | product page "Sold by", order detail, invoice                                                                                                                               | D-238, CL-060                                       |
| DS-9.8  | Return ki line aur return ka kharcha (seal aata hai ya nahi ke hisaab se; muddatein settings se)                                                                           | product page add-to-cart ke paas, order detail, invoice, Returns policy page                                                                                                | D-079, D-114, D-221, CL-061                         |
| DS-9.9  | Delivery fee aur "₹X se upar muft"                                                                                                                                         | product page ka DeliveryPromise, cart, checkout ka breakup (alag line)                                                                                                      | D-107, CL-071                                       |
| DS-9.10 | Delivery ki tareekh ka vaada aur cut-off                                                                                                                                   | pincode ke baad product page pe, checkout, order detail; vaada toote to "Delayed"                                                                                           | D-117, D-222                                        |
| DS-9.11 | "Bestseller", "Only N left" sirf niyam se; "X ne kharida" nahi                                                                                                             | ProductCard, product page                                                                                                                                                   | D-154, CL-070                                       |
| DS-9.12 | Stock khatam                                                                                                                                                               | list me neeche, "Out of stock" ke saath; "Notify me" R2                                                                                                                     | D-153                                               |
| DS-9.13 | Kram kaise banta hai                                                                                                                                                       | search aur category pe sort ke paas "How results are ranked" ki link                                                                                                        | D-139, D-240, CL-066                                |
| DS-9.14 | Demo ki patti                                                                                                                                                              | har app ke upar, product page aur checkout pe bhi; band nahi ho sakti                                                                                                       | D-145, CL-079                                       |
| DS-9.15 | DUMMY badge                                                                                                                                                                | har dummy registration (GSTIN, licence, import registration, EPR) ke saath, jahan bhi dikhe; demo reviews pe "Demo review"; PDF pe watermark                                | D-145                                               |
| DS-9.16 | Legal pages: Terms, Privacy, Data notice, Returns, Shipping, Payments, How results are ranked, Grievance, About/Contact                                                    | Customer ka footer, sign-up, checkout ke paas links; har page pe "DUMMY: kisi licensed lawyer ne nahi dekha" badge, version aur tareekh                                     | D-150, D-240, D-255, D-264, CL-059, CL-080          |
| DS-9.17 | Platform ki jaankari, Grievance Officer (naam, designation, contact), nodal person, National Consumer Helpline ka field                                                    | About/Contact aur Grievance page; footer me Grievance ki link                                                                                                               | D-163, D-237, CL-059, CL-064                        |
| DS-9.18 | Sign-up pe: alag Data notice (consent se pehle), Terms aur Privacy, 18+ ki ghoshna, marketing opt-in alag                                                                  | sign-up ki screen; har tick khaali shuru; "Haan" aur "Nahi" barabar                                                                                                         | D-038, D-141, D-255, CL-072, CL-089, CL-101, CL-102 |
| DS-9.19 | Consent wapas lena                                                                                                                                                         | Account → Privacy: har consent ka "Turn off", kab diya aur notice ka version                                                                                                | D-151, CL-089                                       |
| DS-9.20 | Push ki ijazat marketing se alag                                                                                                                                           | Account → Notifications me do alag switches                                                                                                                                 | D-141, CL-101                                       |
| DS-9.21 | Review photo me chehre ki ijazat ka tick                                                                                                                                   | review form, photo jodne pe                                                                                                                                                 | D-155                                               |
| DS-9.22 | "Paisa kata, order nahi bana"                                                                                                                                              | payment ke baad ki screen aur email (bank ka samay)                                                                                                                         | D-256                                               |
| DS-9.23 | Cancel order jitna aasaan                                                                                                                                                  | order detail pe "Cancel" pack hone tak, har item ke saath                                                                                                                   | D-110, CL-078                                       |
| DS-9.24 | Account delete                                                                                                                                                             | Account → Privacy; dobara pehchaan, 7 din me wapas ka raasta, aur kya rehta hai (tax archive, review "Deleted customer")                                                    | D-151, D-225, D-305, SR-066                         |
| DS-9.25 | Partner ka data notice aur location ka consent                                                                                                                             | Delivery app ka pehla sign-in                                                                                                                                               | D-254, CL-114                                       |
| DS-9.26 | Seller agreement (version) aur undertaking                                                                                                                                 | Seller app ke onboarding me, accept ka record                                                                                                                               | D-150, D-240, CL-069, CL-128                        |
| DS-9.27 | "Not a medical consultation" (R2)                                                                                                                                          | Skin & Hair Expert ki har screen aur booking                                                                                                                                | D-252                                               |

### Batch 10. Security aur performance ke UI niyam

**Kis par:** SR-001, SR-004 se SR-006, SR-010, SR-012, SR-013, SR-015, SR-019 se SR-021, SR-023, SR-039, SR-040, SR-052, SR-054, D-053, D-185, D-195, D-254, ARCHITECTURE §5 niyam 2, 7. **R1.**

1. **DS-10.1 Browser ki ijazatein:** Customer app me camera aur location header se band (SR-001); location sirf U-8 ke button pe, tap ke baad aur pehle ek line ki wajah. Delivery app me camera aur location pehli baar se pehle app ki samjhane wali screen; mana ho to wapas chalu karne ka tareeka dikhe (U-12).
2. **DS-10.2 StepUpDialog (D-185):** kaam ka naam ("Approve payout batch PB-…"), 6 ank ka CodeInput, 5 minute ki khidki ka nishaan; code sahi to wahi kaam chale, page na badle.
3. **DS-10.3 Sign-in ke jawab:** anjaan aur registered email pe ek hi sandesh ("If an account exists, we've sent a code.") (SR-019); code ka 10 minute aur 3 baar dobara bhejna ulti ginti ke saath (SR-015); seema pe saaf sandesh (SR-020); `next` sirf apna relative path (SR-021).
4. **DS-10.4 Password:** 12 se 128 akshar, koi "capital aur number" ka niyam nahi; sandesh sirf "Too short" aur "This password has appeared in a data breach" (SR-013); dikhao/chhupao.
5. **DS-10.5 Staff ki lists me chhupi jaankari:** naam aur phone chhupe ("R••• K•••, 411001"); "Show details" pe wajah (list + text), phir dikhe aur audit me (SR-039, D-201). Seller ka bank sirf aakhri 4 ank (SR-052).
6. **DS-10.6 Push aur emails ka text:** push me sirf order number aur halat, delivery code kabhi nahi (D-195); email ki links sirf apne app ke host pe, staff emails me koi sign-in link nahi, "Open the <App> app" (SR-012).
7. **DS-10.7 User ka content:** reviews, description, ingredients ka text aur naam sirf text ki tarah (escape); rich text sirf bold aur list; links `rel="nofollow ugc noopener"` (SR-040).
8. **DS-10.8 PWA cache:** service worker sirf versioned static app shell aur assets rakhe, `/api/*` kabhi nahi; sign-out pe caches aur IndexedDB saaf (SR-010); Delivery ka offline data SR-023 ke hisaab se.
9. **DS-10.9 Bundle ke budget** (misaal, gzip, har route ki pehli load): Customer JS 170 KB, staff aur partner apps 250 KB, CSS 30 KB, fonts U-2 ke hisaab se; fold ke upar images 200 KB tak. Payment gateway ki script sirf Payment route pe (SR-006). Budget toote to CI laal.
10. **DS-10.10 Page ke targets** (misaal, jaage server pe, D-053; laptop pe mobile preset ke Lighthouse se, 5 mukhya pages: Home, list, product, cart, order): LCP 2.5 s, CLS 0.1, INP 200 ms. Server ke targets ARCHITECTURE §9 me hi.
11. **DS-10.11 Kam calls:** ek screen ke liye ek ya do calls (ARCHITECTURE §5 niyam 2); polling sirf dikhte tab pe (niyam 7); TanStack Query ka `staleTime` data ke hisaab se (misaal catalog 5 minute, order ki halat polling se); hover pe prefetch sirf product page ke liye.

## 4. FLOWS.md ke liye batches

FLOWS.md ke format me: har flow ka naam aur kaun shuru karta hai; steps, har step ka module (`identity`, `notify`, `payments`, `catalog`, `commerce`, `logistics`, `finance`, `support`, `audit`, `media`; ARCHITECTURE §2) aur app; phir "fail ho to". Module ki `TASK.md` ki link tab judegi jab task files banen. Har staff ka likhne wala kaam `audit` me jaata hai (SR-076); har flow me ye dobara nahi likha. "Khabar" ka matlab in-app + browser push, email sirf jahan faisla kehta hai (D-126, D-131, D-140, D-141).

### Batch F1. Account aur sign-in

**FL-1. Customer ka sign-up.** Shuru: customer (Customer app).

1. Email, password (ya social, ya email code) aur 18+ ki ghoshna; Data notice alag screen pe, consent se pehle; Terms aur Privacy; marketing opt-in alag aur khaali (identity; D-038, D-255, CL-072, CL-089).
2. Allowlist ki jaanch, har raaste pe ek hi function se (identity; D-133, SR-018).
3. Email pe code; jawab registered aur anjaan email pe ek jaisa (identity, notify; SR-015, SR-019).
4. Code sahi: account bana, har consent ka record (notice ka version, samay, raasta) (identity; CL-089).

**Fail ho to:** allowlist ke bahar: "demo store" ka sandesh (SR-019); code ki seema: saaf sandesh (SR-020); galat code 5 baar: naya code maango (SR-015); leak hua password: "This password has appeared in a data breach" (SR-013); social provider ka email verified nahi: maujooda tareeke se sign-in pehle (SR-017).

**FL-2. Customer ka sign-in.** Shuru: customer (Customer app).

1. Teen raaste: password, social (Google, LinkedIn, GitHub), ya email code (identity; D-021).
2. Account pe authenticator laga ho to uske baad authenticator ka code bhi (identity; D-021, SR-015).
3. Session 30 din aage, zyada se zyada 90 din; "My devices" me har session (identity; D-180).

**Fail ho to:** galat password ya code pe rok (D-182), rok ke dauraan bhi reset chalta (SR-014); server soya ho to pehle jaagne ka parda (DS-6.9); naya device: security event (SR-077).

**FL-3. Staff ka sign-in aur bada kaam.** Shuru: staff (7 staff apps).

1. Invite se account (ek baar ka, misaal 72 ghante), accept pe authenticator lagana aur 10 recovery codes (identity; SR-022, SR-025).
2. Har sign-in pe password + authenticator (identity; SR-011). Session 12 ghante, 30 minute bina kaam pe band, 2 minute pehle chetavni (identity; D-181, DS-6.10).
3. D-185 ki list ke kaam pe StepUpDialog, misaal 5 minute ki khidki (identity; SR-026).

**Fail ho to:** authenticator kho gaya: recovery code, phir Master se reset (D-200); Master ka reset recovery codes ya laptop ka break-glass command (D-200).

**FL-4. Delivery partner ka sign-in.** Shuru: partner (Delivery app).

1. Email aur password; pehli baar Data notice aur location ka consent (identity; D-183, D-254).
2. Phone ko Hub Manager manzoor kare (Logistics Ops app); session usi phone pe, misaal 14 din (identity; D-183).

**Fail ho to:** doosra phone: phir manzoori; phone kho gaya: Hub Manager ek click se session band kare (SR-023).

**FL-5. Customer ka account delete.** Shuru: customer (Customer app, Account → Privacy).

1. Dobara pehchaan (identity; SR-016); screen pe kya hatega aur kya rahega (tax archive, review "Deleted customer") (D-225, D-305).
2. Email aur in-app khabar; misaal 7 din me wapas le sakta hai (identity, notify; SR-066).
3. 7 din baad ek event se har service apni copy hataye ya pehchaan hataye; sessions, push subscriptions, waitlist bhi (saari services; SR-066, D-250).

**Fail ho to:** khula order ya return ho to delete ruka, wajah ke saath (jaanch §7 me); kisi service ka handler fail: retry aur dead letter (ARCHITECTURE §3), owner ke inbox me.

### Batch F2. Browse se order aur payment

**FL-6. Area, pincode aur waitlist.** Shuru: customer (Customer app) ya staff (Admin, Super Admin, Master).

1. Customer pincode daale; pincode se theek ek hub (logistics; D-016). Live ho to delivery ka vaada (D-117), na ho to "unavailable" aur notify-me waitlist (logistics; D-046).
2. Staff switch: Admin hub, Super Admin district, Master state; live tabhi jab sharten poori (logistics; D-015).
3. Area live hone pe waitlist walon ko khabar; email sirf push band walon ko, "baaki" ki chhat me (notify; D-141).

**Fail ho to:** area band ho raha ho: pehle checkout pe rok ka event, phir band; parcel banate waqt band area ka order ruke, cancel aur refund (commerce, logistics; D-300).

**FL-7. Cart se prepaid order.** Shuru: customer (Customer app).

1. Cart (sirf sign-in ke saath, D-020); cart me stock nahi rukta, sirf "kam stock" (commerce; D-118 niyam 3).
2. Checkout: address (pincode serviceable), delivery ka vaada, payment ka tareeka, har line ka batch ka MRP aur expiry, poora breakup alag lines me (commerce, catalog; D-067, D-107, U-6).
3. "Place order": client sirf variant aur quantity bheje; server daam, MRP, fee, tax, seema aur serviceability nikale; ek transaction me order aur batch ke level pe stock ka reservation (FEFO), idempotency key ke saath (commerce; SR-044, SR-045, ARCHITECTURE §10.5).
4. Payment screen: server gateway ka order exact rakam se banaye; 15 minute (misaal) ka timer (payments; SR-048, D-118).
5. "Paid" sirf signature ki jaanch ya webhook se; browser ka "success" sirf screen ke liye (payments; SR-048).
6. Order pakka: confirmation email delivery code ke saath (paise ki line), in-app khabar; push ki ijazat ka card (U-7) (notify; D-126, D-302).
7. Finance ko events har 15 minute ke batch me (finance; D-288).

**Fail ho to:** server ka total dikhe total se alag: order nahi, naya total dikhao (SR-044); stock nahi: us line pe "Out of stock" aur baaki ke saath aage badhne ka raasta (DS-6.6, 409/422); payment fail: Payment screen pe "Try again" (idempotent retry, ARCHITECTURE §5 niyam 10) ya doosra tareeka; 15 minute baad payment aaye aur stock ho to order pakka, warna apne aap poora refund aur khabar (D-118); paisa kata par order nahi bana: D-256 ki screen aur email, der se "captured" pe apne aap refund, sirf ek baar (D-111 jod); soya server pe webhook der se: gateway ki dobara koshish aur roz ka milaan (ARCHITECTURE §5 niyam 14); checkout ka kill switch: PausedBanner, cart bacha (SR-009).

**FL-8. Delivery pe UPI wala order.** Shuru: customer (Customer app).

1. Tareeka tabhi dikhe jab area me on ho, rakam seema me (misaal ₹3,000; naye customer ke pehle order pe ₹1,500) aur ek waqt me khule aise orders misaal 2 se kam (commerce; D-109, D-204, D-203).
2. "Place order" pe stock ruka rehta hai, payment delivery pe (commerce; D-118 niyam 4).
3. Confirmation email delivery code ke saath; code door pe payment ke baad hi chalta hai (notify, logistics; D-109 niyam 4).

**Fail ho to:** customer 2 baar (misaal) mana kare ya payment na kare: uske liye ye tareeka band, staff wajah ke saath khol sake (D-109 niyam 2); tareeka na dikhne ki wajah checkout pe ek line me ("Pay on delivery is not available for this order").

### Batch F3. Order se delivery

**FL-9. Pack se delivery tak.** Shuru: system (order pakka hone pe).

1. Warehouse me pick (FEFO batch, bin scan) aur pack, teen kadam me; pack ki photo; kai sellers ka maal normal ek parcel me, har seller ka invoice andar (commerce, Logistics Ops app; D-077, D-106, ARCHITECTURE §10.5). Pack pe invoice turant (finance; D-288); invoice ka email saar ke saath (notify; D-289).
2. Warehouse se hub ka trip: manifest aur seal number; hub pe receive scan, ginti ka farak apne aap nishaan (logistics; D-027, SR-057).
3. Hub Manager ya Hub Operations partner ko assign kare; partner ke phone pe us shift ke parcels ka kam data (logistics; SR-023).
4. "Out for delivery": customer ko khabar; order page pe DeliveryCodeCard sabse upar (notify, commerce; D-195, U-4).
5. Door pe: delivery pe UPI ho to server QR banaye exact rakam ka; "paid" sirf webhook se, customer ke app me "Payment received", partner ke app me "paid" karne ka koi button nahi (payments; SR-050).
6. Code wali delivery (online hi): partner customer ka 6 ank ka code daale; milaan server pe; usi pal partner ki location (logistics; D-072, D-254, D-301, SR-054).
7. Code na mile (customer ghar pe nahi, koi aur le raha): parcel ki photo app ke camera se aur location; server ka samay, accuracy, address ke pin se doori ka nishaan, photo ka hash (logistics, media; D-072 niyam 2, SR-055; U-8, U-12).
8. "Delivered": khabar; daawe ki khidki shuru (code se 48 ghante, photo wali pe misaal 7 din) (commerce, notify; D-148); finance ko delivered ka event (D-319).

**Fail ho to:** pick pe maal toota ya kam: barabar batch ho to badlo, warna customer se poochho (khabar; push band ho to email, D-131), jawab na aaye to line cancel aur refund (D-090); Neon band ya finance ruka: pack ruka, checkout ka kill switch (OPERATIONS §8 niyam 8); code 5 baar galat: code daalna band, Hub Manager khole (SR-054); network nahi: code wali delivery nahi, partner intezaar kare ya Hub Manager se baat (D-301); door pe UPI network se fail: 10 minute (misaal) tak QR dobara, phir "attempt fail" (D-109 niyam 3).

**FL-10. Delivery fail aur RTO.** Shuru: partner (Delivery app).

1. Fail ki wajah (ghar band, address galat, customer ne mana kiya) aur usi pal location (logistics; D-108, D-254).
2. Customer ko khabar aur agla din chunne ka option; push band ho to email (notify; D-108 niyam 1, D-126).
3. Do koshish (misaal); hub pe zyada se zyada 3 din (misaal); phir RTO; saaf mana pe seedha RTO (logistics; D-108).
4. RTO ka hub scan: prepaid ka poora refund shuru (payments; D-108 niyam 4, D-111). Customer ki galti wale RTO pe delivery fee wapas nahi (D-108 niyam 6).
5. Warehouse me receiving jaisi jaanch, phir stock (commerce; D-108 niyam 5).

**Fail ho to:** refund fail (jaise khaata band): staff ka haath ka raasta (Support Lead + Finance, D-188) aur customer ko khabar (D-111 niyam 3); hub pe 3 din ki ginti Logistics Ops ki list me laal.

### Batch F4. Cancel, return, daawa aur refund

**FL-11. Cancel.** Shuru: customer (Customer app, order detail).

1. Pack se pehle poora order, item ya quantity; ConfirmDialog me refund ki rakam (commerce; D-110).
2. Stock wapas, line ke hisaab se; koi cancel fee nahi; baad me delivery fee nahi lagti (commerce; D-110).
3. Prepaid ka refund turant original raaste; halat in-app aur email (payments, notify; D-111).

**Fail ho to:** pack ho chuka: "Cancel" ki jagah "Packed: you can refuse at the door" (D-110 niyam 1); pack aur cancel ek saath: server ki halat jeetti hai, 409 pe taaza halat (DS-6.6).

**FL-12. Return se refund.** Shuru: customer (Customer app, order detail; R1 me D-055 ka simple roop).

1. Wajah chune (D-079); muddat wajah se (misaal 30 din galti pe, 7 din man badla, 48 ghante saboot ka niyam dikhne wali galti pe) (commerce; D-221); man badla sirf seal wale band maal pe (D-079).
2. Toote, galat ya kam item pe photo zaroori (item, batch label, damage; kam item pe parcel aur packing), video optional (media; D-106).
3. Wajah aur saboot poore: apne aap manzoor; warna Support Agent tay kare, apni seema (misaal ₹2,000 ek maamla, ₹10,000 din) tak; upar Support Lead (support, Support Desk app; D-105, D-188).
4. Pickup partner kare: item ki photo, label ka batch order ke batch se milaye, man badla me seal dekhe (logistics, Delivery app; D-113).
5. Warehouse me jaanch (Returns QC, Logistics Ops app), nateeja wajah ke hisaab se stock ya nuksaan (commerce; D-112).
6. Refund jaanch ke baad, original raaste (payments; D-115, D-111): man badla pe return fee (misaal ₹49) kat ke aur delivery fee wapas nahi; hamari ya brand ki galti pe muft aur delivery fee wapas (D-114). R1 me sirf refund (D-122).
7. Seller ke statement me line ka asar; fees wajah ke hisaab se (finance; D-277).

**Fail ho to:** mel na khaye (batch alag, seal toota): pickup nahi, wajah ke saath khabar (D-113); muddat ke baad: support ka raasta, seedha mana nahi (D-221 niyam 5); reject: ek appeal (FL-14); "der se pahuncha": door pe mana to poora refund, baad me 7 din (misaal) bina kharche (D-222).

**FL-13. "Parcel nahi mila" ka daawa.** Shuru: customer (Customer app, order detail).

1. Order detail pe delivery ka saboot dikhe: "Delivered with your code at <samay>" ya "Delivered with photo"; photo sirf customer ko, D-191 ke hisaab se (logistics, media).
2. Code se delivered: daawa nahi maana jaata; screen pe ye saaf, aur grievance ka raasta (D-072 niyam 3, D-163).
3. Sirf photo aur location: misaal 7 din me daawa; Support jaanch kare (support; D-072, D-148).
4. Koi saboot nahi: refund (R1 me dobara maal nahi, D-122), aur partner ki jaanch D-068 ke hisaab se (support, logistics).
5. Baar-baar daawa karne wale aur baar-baar maamle wale partner ka record aur nishaan (support; D-072 niyam 4, SR-058).

**Fail ho to:** khidki ke baad: support ka raasta (D-221 niyam 5 jaisa) ya grievance; reject: FL-14.

**FL-14. Appeal.** Shuru: customer (reject ke baad, misaal 7 din me).

1. Ek appeal, ek baar (support; D-147).
2. Faisla Support Lead kare, jisne reject nahi kiya (support; D-147, D-084 niyam 3 jaisa).
3. Nateeja in-app aur email (refund ho to paise ki line) (notify).

**Fail ho to:** appeal ke baad bhi asehmat: Grievance page aur Grievance Officer (D-163; poora raasta R2).

### Batch F5. Seller: onboarding, listing, maal aur payout

**FL-15. Seller onboarding.** Shuru: seller (Seller app).

1. Sign-up allowlist se (identity; SR-018); Account Owner pe authenticator (identity; D-184).
2. Brand owner ya authorised distributor ka saboot, ek brand ek seller (catalog; D-032, D-075); dastavez (dummy KYC), warehouse state ka GSTIN (D-036); seller ka block (naam, pata, customer care, grievance officer) zaroori (D-238); seller agreement (version) aur undertaking accept (D-150, D-240).
3. Bank details dobara code ke saath, screen pe aakhri 4 ank (finance; SR-052).
4. Seller Ops ki ek team manzoor kare (Admin app; D-084 niyam 1) (jaanch §7).

**Fail ho to:** reject wajah ke saath, seller sudhaare; appeal us insaan se alag (D-084 niyam 3); seller ka block adhoora: seller live nahi (D-238); doosre state ka GSTIN: chetavni (D-239).

**FL-16. Listing se live.** Shuru: seller (Seller app).

1. Product aur variants (category ke hisaab se, zyada se zyada 2) (catalog; D-076); shade ka naam, swatch photo aur hex (D-085); HSN allowed list se (D-086); MRP aur daam ke niyam, bade badlav pe dobara confirm (D-061, D-087); ingredients text + label photo (D-099); claims tay list se, test wale saboot ke saath (D-224); licence ka type (D-128); imported ke fields (D-127); pack ki jaankari (CL-026).
2. Submit: listing ki team (category ke hisaab se) jaanche (Admin app; D-084 niyam 2); INCI list staff jaanche (D-099).
3. Live ke baad jokhim wale fields ka har badlav dobara jaanch, baaki turant live aur spot check; staff khud field nahi badalta (catalog; D-098).
4. Har review pe us waqt ka listing version (catalog; D-171).

**Fail ho to:** reject wajah ke saath field pe; galat declaration ki report pe listing jaanch tak ruki (CL-026); blocklist ka ingredient: submit hi nahi (D-128).

**FL-17. Maal warehouse me.** Shuru: seller (Seller app).

1. Shipment ki pehle se suchna (ASN): variants, batch, expiry, quantity (commerce; D-096).
2. Receiving: batch aur expiry ki jaanch (D-082, D-083), barcode na ho to platform ka label khaali jagah pe (D-097, D-230); farak photo ke saath seller ko (commerce, Logistics Ops app; D-096).
3. "Accept" scan: zimmedari aur storage fee shuru; stock dikhne laga (commerce; D-096, D-066).

**Fail ho to:** expiry seema se kam ya sirf PAO wala maal: wapas (D-083); farak: seller ko photo ke saath; dispute R2 (D-164).

**FL-18. Payout.** Shuru: system (hafte me ek baar, misaal Monday).

1. Line payable jab uski sabse lambi return khidki khatam ho aur koi return khula na ho (finance; D-081 niyam 1; khidki ka number §9 me).
2. Finance batch banaye: pehle udhaar aur fees katein, bharpai jude; kam se kam rakam (misaal ₹100) se kam to agle hafte (finance, Finance app; D-081).
3. Master ka doosra account dobara code ke saath manzoor kare; ek account dono kaam nahi (Master app; D-189).
4. R1 me "paid" haath se mark, asli bank transfer nahi (finance; PROJECT_PLAN §1).
5. Seller ko har line ki halat (kab payable, kis payout me), statement aur CSV (Seller app; D-081 niyam 5, D-143, D-144).

**Fail ho to:** bank badla: naye khaate pe misaal 72 ghante payout nahi (D-190); payout pe kill switch ki rok (SR-009); udhaar seema paar: alert aur aage ke kadam (D-071, D-103).

### Batch F6. Reviews

**FL-19. Review likhna.** Shuru: customer (Customer app, delivered order ya product page).

1. Haq: delivered item (lauta item bhi), cancel aur RTO nahi; ek customer, ek product, ek review; misaal 365 din; ₹0 line pe nahi; brand ka staff apne product pe nahi (commerce, catalog; D-135, D-156, D-158).
2. Star, text, misaal 3 photos tak, chehre pe ijazat ka tick (media; D-155).
3. Star turant; text apne aap ki jaanch se; photo aur atka review Review Moderator ki queue me (catalog, Admin app; D-136).
4. Review pe "Verified purchase" aur us waqt ka listing version (catalog; D-171).

**Fail ho to:** chhupane ki tay list ke bahar koi wajah se nahi chhupta (D-146); ilaaj ke kanoon wale daawe "kanoon ke khilaaf daawa" se chhupe (D-263); customer ko halat in-app me.

**FL-20. Review ki report.** Shuru: signed-in user (Customer app).

1. Report ki wajah; ek account din me misaal 10 (catalog; SR-060).
2. Queue: receipt 24 ghante; nagnata wali report pe turant chhupna aur 2 ghante; baaki 36 ghante; hal 7 din (catalog, Admin app; D-251).
3. Appeal doosra moderator tay kare (D-146).

**Fail ho to:** seema ke upar report mana (SR-060); "personal data" wali report 24 ghante me tay na ho to alert (SR-060).

## 5. Apps ki screens

Har app me saajhi screens: jaagne ka parda (DS-6.9), sign-in, notifications inbox, account ka menu (theme, security, My devices, sign-out), PermissionDenied, Not found, demo ki patti. Neeche sirf app ki apni screens. Release PROJECT_PLAN §1 ke hisaab se; jahan app ki zimmedari docs me saaf nahi, wahan "(jaanch §7)".

### 5.1 Customer (customer) — R1

**Navigation:** phone pe neeche Home, Categories, Orders, Cart, Account (U-4); header me search aur wishlist; desktop pe top nav. Footer me legal pages aur Grievance.

| Screen                                                                                                          | Mukhya cheezein                                                                                                                      | Khaas halatein                                            | Release     |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------- |
| Home                                                                                                            | pincode card, categories, Bestseller, naye, top rated (U-9)                                                                          | pincode unserved: waitlist                                | R1          |
| Categories, Search results                                                                                      | filters (D-138), sort, "How results are ranked", grid                                                                                | zero result: sujhaav (D-152); stock khatam neeche (D-153) | R1          |
| Product page                                                                                                    | images, PriceBlock, shades, expiry, DeliveryPromise, ReturnLine, ClaimBadges, Product details, Ingredients, Sold by, reviews ka saar | variant stock khatam; pincode unserved                    | R1          |
| Reviews                                                                                                         | star aur "with photos" ke filters, Verified purchase, listing version                                                                | khaali: "No reviews yet"                                  | R1          |
| Wishlist                                                                                                        | dil wale products                                                                                                                    | sign-in ke bina: sign-in ka sandesh (D-020)               | R1          |
| Cart                                                                                                            | lines, batch ka MRP aur expiry, DeliveryFeeLine                                                                                      | khaali; "Updated" (DS-9.3); checkout band (SR-009)        | R1          |
| Checkout                                                                                                        | address, vaada, payment ka tareeka, breakup, Place order (U-6)                                                                       | total badla (SR-044); UPI na dikhne ki wajah              | R1          |
| Payment                                                                                                         | gateway, 15 minute ka timer                                                                                                          | fail aur retry; "paisa kata, order nahi bana" (D-256)     | R1          |
| Order placed                                                                                                    | order number, delivery code, push ka card (U-7)                                                                                      |                                                           | R1          |
| Orders, Order detail                                                                                            | timeline, DeliveryCodeCard, cancel, return, daawa, invoice download, RefundStatus                                                    | pack ke baad cancel nahi; delivery fail pe agla din       | R1          |
| Return request, Daawa, Appeal                                                                                   | wajah, photos, muddat                                                                                                                | muddat ke baad: support ka raasta                         | R1          |
| Write review                                                                                                    | star, text, 3 photos, chehre ka tick                                                                                                 | haq nahi: wajah (D-135)                                   | R1          |
| Sign-up, Sign-in, Code, Password reset                                                                          | teen raaste, Data notice, 18+                                                                                                        | allowlist ke bahar: demo sandesh                          | R1          |
| Account: Profile, Addresses, Notifications, Privacy, Security, My devices                                       | consents ka "Turn off", account delete                                                                                               | delete ke 7 din                                           | R1          |
| Legal pages, About/Contact, Grievance                                                                           | DUMMY badge, version                                                                                                                 |                                                           | R1          |
| Notify me (stock), beauty profile, shade finder, try-on, consultation, Q&A, points, tickets, Beauty Pro ki arzi |                                                                                                                                      |                                                           | R2 aur baad |

### 5.2 Seller (seller) — R1

**Navigation:** sidebar: Home, Products, Stock & shipments, Orders, Returns, Reviews, Payouts, Reports, Business profile, Team; phone pe menu sheet.

| Screen                                                | Mukhya cheezein                                                                                                                                            | Release       |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Home                                                  | "kya karna baaki" checklist (onboarding, ruki listings, expiry alerts D-062, D-124, udhaar D-071)                                                          | R1            |
| Onboarding aur Business profile                       | dastavez, GSTIN, seller ka block (D-238), agreement aur undertaking                                                                                        | R1            |
| Products, Product editor                              | variants, shades, daam (bade badlav pe confirm D-087), HSN, ingredients, claims ka saboot, pack ki jaankari; listing ki halat aur reject ki wajah field pe | R1            |
| Stock & shipments                                     | batch ke hisaab se stock aur expiry; ASN banana; receiving ka farak photo ke saath                                                                         | R1            |
| Orders, Returns                                       | seller ka hissa, sirf order number, shehar, pincode (D-143)                                                                                                | R1            |
| Reviews                                               | apne products ke reviews dekhna (D-160)                                                                                                                    | R1 (jawab R2) |
| Payouts, Statements, Reports                          | har line kab payable (D-081 niyam 5), payout, CSV (dobara code), invoice ek-ek karke (SR-088)                                                              | R1            |
| Team, Security                                        | roles, authenticator (D-184), bank badalna (D-190)                                                                                                         | R1            |
| Pro daam, offers, disputes, recall ke kaam, clearance |                                                                                                                                                            | R2            |

### 5.3 Admin (staff) — R1

**Navigation:** sidebar sections sirf permissions se: Sellers, Listings, Ingredients, Reviews, Hubs.

| Screen                        | Kaam                                                                                 | Release |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------- |
| Seller approvals queue        | Seller Ops ki manzoori, GSTIN ki jaanch (D-084) (jaanch §7: Seller Ops ka app)       | R1      |
| Listing review queue          | category ke hisaab se, field ke saath reject ki wajah (D-084, D-098)                 | R1      |
| Ingredients                   | INCI ki jaanch, master list me naya naam, blocklist sirf senior catalog role (D-132) | R1      |
| Review moderation aur reports | queue ke samay (D-251), chhupane ki tay wajah (D-146)                                | R1      |
| Hub switch                    | Sub-District/hub live, sharten (D-015)                                               | R1      |
| Search synonyms               | (D-152) (jaanch §7: kis app me)                                                      | R1      |

### 5.4 Super Admin (staff) — R1

| Screen           | Kaam                                                    | Release |
| ---------------- | ------------------------------------------------------- | ------- |
| District switch  | district live, warehouse + hub tayyar ki sharat (D-015) | R1      |
| District ka saar | hubs, staff ki kami ki chetavni (D-022)                 | R1      |

### 5.5 Master (staff) — R1

**Navigation:** Settings, Areas, People & access, Approvals, Inboxes, Metrics, Audit.

| Screen                    | Kaam                                                                                                                                                 | Release |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| State switch              | (D-015)                                                                                                                                              | R1      |
| Settings                  | fees, policy ke numbers, emails ki chhat, area settings (jaanch §7: area settings kiske haath), HSN table; har badlav dobara code aur wajah (SR-043) | R1      |
| Kill switches, Allowlist  | dobara code, audit (SR-009, SR-018)                                                                                                                  | R1      |
| People & access           | invites, roles, grants, authenticator reset (D-200, SR-037)                                                                                          | R1      |
| Payout approval           | doosre account se manzoori (D-189)                                                                                                                   | R1      |
| Security inbox, Ops inbox | alerts (SR-078, D-286, D-324)                                                                                                                        | R1      |
| Metrics                   | owner ke aankde (D-149)                                                                                                                              | R1      |
| Apps ki list              | har app ka tay URL (SR-012)                                                                                                                          | R1      |

### 5.6 Support Desk (staff) — R1 ka patla hissa

| Screen                                                         | Kaam                                                                                                           | Release |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------- |
| Cases queue                                                    | returns jo apne aap manzoor nahi hue, daawe; fraud ke nishaan (SR-058)                                         | R1      |
| Case detail                                                    | order, saboot (private media), chhupi jaankari ke saath "Show details" (SR-039), faisla apni seema tak (D-188) | R1      |
| Appeals                                                        | Support Lead (D-147)                                                                                           | R1      |
| Failed refunds                                                 | Support Lead + Finance (D-188)                                                                                 | R1      |
| Tickets, SLA, grievance register, skin reaction, consultations |                                                                                                                | R2      |

### 5.7 Finance (staff) — R1

| Screen                                              | Kaam                                             | Release |
| --------------------------------------------------- | ------------------------------------------------ | ------- |
| Seller ledgers aur payables                         | ARCHITECTURE §1                                  | R1      |
| Payout batch                                        | banana; Master ki manzoori ka intezaar (D-189)   | R1      |
| Documents                                           | invoices, credit notes (PDF pe watermark, D-145) | R1      |
| Milaan                                              | roz ka milaan, farak (ARCHITECTURE §1.11)        | R1      |
| Poori reports, transporter ka bill, partner payouts |                                                  | R2      |

### 5.8 Logistics Ops (staff) — R1

**Navigation:** Warehouse (Inbound, Pick, Pack, Dispatch, Returns QC) aur Hub (Receive, Assign, RTO, Partners); scan wali screens pehle (DS-5.7).

| Screen              | Kaam                                                                       | Release |
| ------------------- | -------------------------------------------------------------------------- | ------- |
| Inbound / Receiving | ASN, batch aur expiry, label, farak ki photo, "Accept" scan (D-096, D-097) | R1      |
| Pick, Pack          | FEFO, bin scan, teen kadam, pack ki photo (D-106)                          | R1      |
| Dispatch            | trip, manifest, seal (D-027)                                               | R1      |
| Hub receive, Assign | ginti ka farak, partner ko parcels                                         | R1      |
| Partners            | phone ki manzoori, session band (D-183), code unlock (SR-054)              | R1      |
| RTO                 | hub pe din ki ginti (D-108)                                                | R1      |
| Returns QC          | nateeja wajah ke hisaab se (D-112)                                         | R1      |

### 5.9 Delivery (partner, PWA) — R1

**Navigation:** ek hi stack: Today → Stop → kaam; neeche action bar; upar SyncStatus.

| Screen        | Kaam                                                           | Khaas halatein                                                 | Release |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ------- |
| Pehla sign-in | Data notice, location consent, phone ki manzoori ka intezaar   | manzoori nahi: "Ask your Hub Manager"                          | R1      |
| Today         | stops ki list, kram, ginti                                     | offline: list dikhe, "N waiting to sync"                       | R1      |
| Stop          | address, customer ka phone (sirf contact), raasta (jaanch §10) |                                                                | R1      |
| Deliver       | UPI QR (agar), code, ya photo + location                       | offline: code band, wajah (D-301); 5 galat code: band (SR-054) | R1      |
| Fail attempt  | wajah, location                                                |                                                                | R1      |
| Return pickup | photo, batch ka mel, seal (D-113)                              | mel nahi: pickup nahi                                          | R1      |
| End shift     | sync, phir phone se data saaf (SR-023)                         | sync baaki: chetavni                                           | R1      |
| Earnings      | (D-104)                                                        |                                                                | R2      |

### 5.10 Growth Studio aur Creator — R2

Growth Studio: Home ke hisse, banners, offers, coupons, sponsored (label ke saath), routines (D-166). Creator: profile, content, endorsement ke label (CL-076). Dono R2 me; layout DS-5.6 aur DS-5.5 ke hisaab se.

## 6. Prastaavit risks (UX)

| Id   | Risk                                                                                                                              | Asar                                                                | Sambhavna | Bachav                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| U-R1 | Raat aur 15 minute khaali ke baad har pehli visit pe jaagne ka parda (cold start 90 second tak).                                  | Pehli nazar kharab, log chhod ke jaate hain (demo dekhne wale bhi). | Zyada     | DS-6.9 ka saaf parda; jaage server pe parda dikhta hi nahi; D-322 ki khidki.                                |
| U-R2 | Rose button pe safed text 4.62:1, AA ke bilkul paas.                                                                              | Rang ka chhota badlav AA tod sakta hai.                             | Madhyam   | DS-2.5 (hover gehra), DS-2.10 (CI me contrast).                                                             |
| U-R3 | 11 apps × light, dark × high contrast: visual tests aur bhatakne ka bojh ek insaan pe.                                            | Kuch screens bigad ke reh jaayein.                                  | Madhyam   | Ek components package; screenshot tests sirf mukhya screens (misaal 30) pe; U-3.                            |
| U-R4 | Khule tabs ki polling (misaal 60 second) ₹0 server pe lagataar bhaar.                                                             | Server ki ~5 requests/second ki seema pe der.                       | Madhyam   | Sirf dikhte tab pe; delivered ke baad polling band; chhupe tab pe ruk (DS-10.11).                           |
| U-R5 | Product page pe zaroori jaankari zyada; phone pe lamba page.                                                                      | Customer mukhya cheez (expiry, return, fee) chhod de.               | Madhyam   | DS-9.4: net quantity, country of origin, expiry, return aur fee daam ke paas; baaki heading wale hisson me. |
| U-R6 | Staff ka 30 minute idle logout lamba form (listing review, case ka faisla) kho de; browser storage me draft rakhna mana (SR-027). | Kaam dobara.                                                        | Madhyam   | DS-6.10 ki chetavni; lambe form chhote hisson me save.                                                      |
| U-R7 | Browser Delivery app ka offline data (IndexedDB) jagah kam hone pe ya lambe samay baad mita sakta hai (jaanchna baaki).           | Shift ke beech list gayab.                                          | Kam       | Shift shuru pe sync; `navigator.storage.persist()` maangna; list na mile to "Sync now".                     |
| U-R8 | iPhone pe browser push shayad sirf home screen pe install kiye app me (jaanchna baaki).                                           | Push band maane jaayein, emails badhein (D-142 ki chhat).           | Madhyam   | U-7 ke card me iPhone pe "Add to Home Screen" ka raasta; §7.                                                |

## 7. Sirf jaanch

Inme owner ka faisla nahi chahiye; tathya ya docs ki jaanch hai.

1. **iPhone pe web push:** Safari me web push sirf home screen pe jode web app me milta hai ya nahi, aur kis iOS version se (jaanchna baaki). U-7 ke card ka text isi pe.
2. **Font me ₹:** chune font ke Latin subset me U+20B9 hai ya nahi; build pe ek test.
3. **Kaunsa kaam kis app me:** Seller Ops ki manzoori (D-084), search synonyms (D-152), HSN table (D-086), ingredient master list (D-132), area settings (delivery fee D-107, cut-off D-117, UPI ki seema D-109) kis app aur role me, ye docs me saaf nahi mila. §5 me andaaza likha hai; docs me kahin likha ho to wahi, warna owner se chhota sawal.
4. **Sign-up ka pakka hona:** SR-019 ka "ek jaisa jawab" tabhi sach ho sakta hai jab password sign-up bhi email code se pura ho (FL-1 step 3). Identity ke niyamon me ye likha hai ya nahi.
5. **Khule order ke saath account delete:** khula order, return ya refund ho to delete ruke ya chale, SR-066 me saaf nahi.
6. **Desktop pe "Use my current location":** laptop pe location aksar IP se aati hai aur kai km galat; U-8 ke button ko accuracy (misaal 100 m se zyada) pe pin na rakhne ka niyam chahiye ya nahi.
7. **Payment install kiye app me:** payment gateway ka checkout installed PWA (standalone) me UPI app ke intent aur bank ke 3DS page ke baad wapas app me aata hai ya nahi, test mode me asli phone pe.
8. **Camera ka `capture`:** Android Chrome aur iOS Safari pe file input `capture` seedha camera kholta hai ya nahi (SR-055 ki seema pehle se maani).
9. **Accessibility ka tool:** automated tool WCAG 2.2 ke naye niyam (jaise 2.5.8 target size) kitne pakadta hai; baaki haath ki checklist me.
10. **Cookies ka banner:** apps me sirf zaroori cookies (session) aur theme ki pasand hai, bahar ki analytics nahi (D-157). COMPLIANCE me cookies ki koi alag row nahi mili; kanooni raay D-257 ke tareeke se hi aaye (main session dekhe ki CL-089 ya CL-072 me aata hai ya nayi row chahiye).
11. **Vercel Hobby ki bandwidth:** fonts aur bundles Vercel se; Hobby ki mahine ki bandwidth seema (jaanchna baaki) OPERATIONS §9 ki hafte ki jaanch me aati hai ya nahi.

## 8. Pehle ke kaam se lene layak

D-074 ki kasauti: (1) asli zaroorat, (2) kisi tay faisle se takraav nahi, (3) naye vakya me likha ja sake. Saare values §3 ki batches me poore likhe hain; naye docs me purane path ka zikr nahi.

| Kya                                                                                                                 | Kahan (purana path)                                          | Kyun achha                                       | Kasauti check                                         | Naye docs me kahan               |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------- | -------------------------------- |
| Rose, plum, gold aur garam neutral ki 11 step wali palette (RGB channels) aur status ke rang                        | `packages-old/frontend/styles/src/variables.css`             | Poori scale tayyar; ratios is run me dobara gine | Zaroorat: haan (U-1). Takraav: nahi. Naya vakya: haan | Batch 2 niyam 2                  |
| Light aur dark ke semantic tokens ka map                                                                            | wahi                                                         | Har jodi ka ratio AA se upar (ginti §3)          | Haan / nahi / haan                                    | Batch 2 niyam 3, Batch 3 niyam 2 |
| Har semantic jodi ka contrast CI me jaanchne wala script                                                            | `packages-old/frontend/styles/scripts/palette.mjs`           | Rang badalne pe AA tootna CI me pakda jaata hai  | Haan (U-R2) / nahi / haan                             | DS-2.10                          |
| Dark me `surface-muted` pe `foreground-subtle` mana (3.66:1)                                                        | `docs-old/DESIGN.md` §3.2                                    | Ek asli fail pehle se pakda hua                  | Haan / nahi / haan                                    | DS-3.2                           |
| Ulti patti pe focus ring aur link ka alag token                                                                     | `docs-old/DESIGN.md` §3.2                                    | Footer aur demo patti pe focus dikhe             | Haan (WCAG 2.4.7) / nahi / haan                       | DS-2.6                           |
| Radius, easing, durations, z-index, shell ke size, touch target 44/48, widths, media ratios                         | `packages-old/frontend/styles/src/variables.css`             | Tay, aazmaaye hue numbers                        | Haan / nahi / haan                                    | Batch 4, Batch 5                 |
| Shadow ka rang theme se (`shadow-color`)                                                                            | wahi                                                         | Dark me shadow sahi                              | Haan / nahi / haan                                    | DS-4.9                           |
| Reduced motion pe durations 0                                                                                       | wahi                                                         | Ek jagah se saari motion band                    | Haan (WCAG 2.3.3) / nahi / haan                       | DS-4.12                          |
| Plus Jakarta Sans + Fraunces ka Latin subset ₹ ke saath, `unicode-range`; daam sans me                              | `packages-old/frontend/styles/src/fonts.css`                 | Chhoti files (lagbhag 32 aur 36 KB), ₹ sahi      | Haan (U-2) / nahi / haan                              | DS-4.1                           |
| Breakpoints (450 ka `base` samet) aur 360, 768, 1280 pe test                                                        | `docs-old/DESIGN.md` §3.5                                    | Chhote phones ka khayal                          | Haan / nahi / haan (320 jodi)                         | DS-5.1                           |
| App parivaar ka roop, install tile ke rang aur home screen ke naam                                                  | `docs-old/DESIGN.md` §10, §11                                | 11 apps phone pe pehchaan me                     | Haan (D-042) / nahi / haan                            | DS-5.4 se DS-5.9                 |
| Logo: 640 se chhote pe sirf mark, link ka poora label                                                               | `docs-old/DESIGN.md` §11                                     | Chhote header me jagah                           | Haan / nahi / haan                                    | DS-7.3                           |
| Apna icons package: har icon alag export, ek base component, runtime pe kuch nahi                                   | `packages-old/frontend/icons/src`                            | Chhota bundle, offline safe                      | Haan / nahi / haan (set U-11 pe)                      | DS-7.1                           |
| Jaagne ka parda: pehle saada jhalak, phir parda, aakhir me "Try again"                                              | `docs-old/DESIGN.md` §6                                      | "Page dikha phir dhaka" nahi                     | Haan (D-028) / nahi / haan                            | DS-6.9, U-10                     |
| Kai kadam wale form me focus ke niyam                                                                               | `docs-old/DESIGN.md` §8                                      | Screen reader pe kadam saaf                      | Haan / nahi / haan                                    | DS-8.9                           |
| Gol kone wale dibbe me andar scroll aur patla scrollbar                                                             | `docs-old/DESIGN.md` §5.1                                    | Windows pe kone se bahar scrollbar nahi          | Haan / nahi / haan                                    | DS-6.14                          |
| Data-dense ka namuna: section sidebar, table jo phone pe cards bane, filters URL me, detail side sheet me           | `docs-old/DESIGN.md` §10, `packages-old/frontend/data-table` | Staff apps ek jaise                              | Haan / nahi / haan                                    | DS-5.6                           |
| react-aria-components pe bane components (button, checkbox, combo-box, date-picker, dialog, select, toast, tooltip) | `packages-old/frontend/components/src`                       | Code ka reference, D-001 ke stack pe             | Haan / nahi / sirf code ke waqt                       | DS-6.2 (code me)                 |
| Order status ka ek map aur charts ke rang ka niyam                                                                  | `docs-old/DESIGN.md` §3.3                                    | Har app me ek matlab                             | Haan / nahi / haan                                    | DS-2.8, DS-2.9                   |

**Nahi lene layak:**

| Kya                                                  | Kahan                         | Kyun nahi                                                                                                                                               |
| ---------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product card pe try-on ka button                     | `docs-old/DESIGN.md` §10      | Try-on R2 (D-169, D-055).                                                                                                                               |
| Apne brand pe platform ke naam ka badge              | `docs-old/DESIGN.md` §5.3, §7 | Apna brand "Unibelle", naam platform se alag (D-243, D-233); kisi seller ka boost nahi (D-139). Sirf D-271 ka "related brand" label, jahan wo laagu ho. |
| Pro price ka label aur sponsored label R1 ke card pe | `docs-old/DESIGN.md` §5.3     | Beauty Pro ke kaam aur sponsored R2 (D-065, D-139, PROJECT_PLAN §1). Design me jagah, R1 me nahi.                                                       |
| Logistics me network map aur partners ka live map    | `docs-old/DESIGN.md` §10      | Partner ki location sirf "delivered" aur "fail" ke pal pe, lagatar nahi (D-254); map provider ₹0 me tay nahi.                                           |
| Accessibility ka lakshya WCAG 2.1 AA                 | `docs-old/DESIGN.md` §8       | Naya lakshya 2.2 AA (DS-8.1), jisme target size aur focus ke naye niyam.                                                                                |
| Customer ki neeche ki bar me Search tab              | `docs-old/DESIGN.md` §10      | Takraav nahi, par U-4 ki salah me Orders (delivery code) ko jagah.                                                                                      |
| Icons ka mukhya set CC BY wala                       | `docs-old/DESIGN.md` §11      | Takraav nahi; U-11 ki salah ISC wala set (credit page ki zaroorat nahi). Owner chune.                                                                   |

## 9. Tay faislon pe dhyaan

1. **D-081 niyam 1 aur D-221:** line tab payable jab "sabse lambi return khidki" khatam ho (misaal 7 din, D-080). D-221 ne galti wali returns 30 din (misaal) ki, aur uske asar me likha hai "payout pe 30 din ka asar finance ki charcha me", par D-081 me koi jod nahi mila. Seller app ki "kab payable" (D-081 niyam 5) aur FL-18 step 1 iske bina pakke nahi likhe ja sakte: 7 din ke baad payable karke 30 din tak ki return ko udhaar (D-071) se katna, ya 30 din tak rokna, ye kahin likha ho to main session jode.
2. **SR-055 ka address pin:** doori ka nishaan address ke pin pe tika hai, par pin banane ka koi faisla nahi (U-8). Bina iske SR-055 ka ek hissa R1 me chalega hi nahi.
3. **D-072 niyam 2 ("photo aur location"):** location na mile to kya, tay nahi (U-12). D-301 sirf network ki baat karta hai, GPS ki nahi.
4. **D-126 aur D-131 ("push band ho to email"):** "push band" ka matlab system ke liye ek hi ho sakta hai: us customer ki koi chalu push subscription nahi. Agar iPhone pe push sirf installed app me mile (§7 niyam 1), to bahut se customers "push band" ginenge aur emails D-142 ki chhat ke paas jaayengi. Niyam waisa hi, par chhat ki nigrani me ye ginti dekhni chahiye.
5. **D-072 niyam 3 aur D-122:** "koi saboot nahi to refund ya dobara maal"; R1 me replacement nahi (D-122), to R1 me sirf refund. FLOWS me yahi likha (FL-13); D-072 ka padhne wala galat na samjhe.
6. **D-064, D-067 aur D-118 niyam 3:** cart me stock nahi rukta, to product page pe dikha agle batch ka MRP aur expiry place order tak badal sakta hai. Isliye DS-9.3 ka "Updated" nishaan MRP aur daam ke saath expiry ke badlav pe bhi rakha; warna customer ko order ke baad alag expiry dikhegi.
7. **D-042 ("offline sirf Delivery") aur warehouse:** Logistics Ops ki scan screens offline nahi chalti; warehouse ka Wi-Fi ruka to receiving, pick aur pack ruk jaate hain. Faisla waisa hi; RISKS me ek line ki salah.
8. **D-290 (SPA, SSR nahi):** product ki link share karne pe preview (title, image) nahi banta aur search engine ko pehle jaagne ka parda milta hai. D-290 asli business pe dobara dekhne ko kehta hai; abhi ke liye theek, par demo ki links share karne me ye dikhega.

## 10. Aage ke agents ke liye

**QA Architect:**

1. DS-2.10 ka contrast script CI me; har theme (light, dark, high contrast) me mukhya screens ke screenshot tests; component tests aur E2E me automated accessibility (DS-8.1); 320 px pe reflow; keyboard aur screen reader ki release checklist.
2. FL-1 se FL-20 ke har "Fail ho to" ka ek E2E test. Samay wale niyam fake clock se: 15 minute ka payment (D-118), 48 ghante aur 7 din ke daawe (D-148), hub ke 3 din (D-108), delete ke 7 din (SR-066), staff ka 30 minute idle (D-181), 5 minute ka step-up (D-185).
3. Dark patterns ke tests: koi checkbox pehle se tick nahi, "Haan" aur "Nahi" ek size ke, cancel order jitna aasaan (CL-072, CL-078, DS-1.5).
4. Jaagne ka parda: `/wake` ki der, beech me 502 ya 504, aur parde pe koi API call nahi (DS-6.9).
5. Delivery app: offline list, sync ki ginti, offline pe code band (D-301), delivered aur sign-out ke baad IndexedDB khaali (SR-023), 5 galat code (SR-054).
6. Bundle budget aur page targets (DS-10.9, DS-10.10) laptop pe; asli phones pe §7 niyam 1, 7, 8 ki jaanch.
7. Server ke total aur screen ke total ka farak (SR-044), aur agle batch ka MRP, daam ya expiry badalne pe "Updated" (DS-9.3, §9 niyam 6).

**Security Architect (run 2):**

1. Theme lagane wali inline script ka CSP hash (DS-3.1), aur `/wake` ka CSP apvaad (ARCHITECTURE §5 niyam 14).
2. Delivery app me "raasta dikhao": address ko bahar ke map app me URL se bhejna customer ka address teesre ko deta hai (processors ki list D-255, CL-104). Vikalp: sirf address copy karna, ya OS ka maps intent. Tay karna.
3. U-8 ka pin: Permissions-Policy `self`, consent ki line, pin ki precision (misaal 5 decimal) aur retention class.
4. Search me pichhli searches browser me na rakhna (SR-027); U-5 ki public list sirf public cache route pe (SR-004).
5. StepUpDialog, IdleWarning aur sign-in pe app ka host (DS-5.10) ka phishing (R-017) pe asar.
6. Private media ka `img` signed URL ke saath: `no-referrer`, service worker ka bahar rehna, URL ki umar (DS-7.7).
7. Staff ki "Show details" (wajah ke saath) ka UI aur audit (SR-039, DS-10.5).
8. U-7 ka push card: subscription session se bandhi (SR-074), sign-out pe hatna.

## Change log

| Version | Date       | Badlav                                           |
| ------- | ---------- | ------------------------------------------------ |
| v1.0.0  | 2026-11-21 | Pehla version: UX / Product Architect ki report. |
