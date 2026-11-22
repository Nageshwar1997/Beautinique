# OPEN QUESTIONS: Beautinique

> **Status:** v1.8.21 (2026-11-22). Khule sawal, aage ke topics aur jaanchna baaki. Cheezein ek-ek karke judengi.

## Is file me kya aayega

- Har sawal: **Sawal**, **Kyun zaroori**, **Vikalp**, **Salah**, **Trade-off**.
- **Status:** `Khula` (jawab baaki), `Charcha` (baat chal rahi), `Tay` ([DECISIONS.md](DECISIONS.md) me gaya), `Roka` (baad me).
- Owner ka jawab sawal ke neeche: sirf chuna hua vikalp aur DECISIONS ki link. Jawab badle to purani line hata ke nayi.
- Jo sawal kisi khule sawal pe tike nahi, wo ek saath aate hain; jo kisi khule sawal pe tika ho, wo us sawal ke jawab ke baad (owner, 2026-11-18).
- Sawal me agle sawal ka zikr nahi hota.
- Jo sawal aapas me ek doosre pe tike hain, wo ek group (G1, G2 ...) me saath aate hain; group Status ki line me likha hota hai, aur group ke sawalon ka jawab saath diya jaata hai.

## Numbering

Q-001, Q-002 ... kram se. Topics B1, B2 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Aage ke topics

Topic sirf sawalon ki grouping hai. Har topic ke sawal us topic ki charcha (aur agent, jahan likha hai) ke baad likhe jayenge.

| Topic | Kya                                                                                     | Kaun gehrai me jayega                | Ab tak (2026-11-22)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | --------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1    | Fulfilment aur logistics: apna warehouse aur delivery partners, courier, launch ka area | Domain expert                        | Zyadatar tay: D-014, D-015, D-016, D-022, D-027, D-033; maal aana (D-096, D-097), RTO (D-108), partner ki kamaai (D-104), delivery ka vaada (D-117), staff list (D-123). Baaki: asli pincodes ka data (§2, owner ka download).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B2    | Apps aur roles: kitne apps, launch pe kaunse roles asli                                 | Architect                            | Tay: D-010, D-017, D-044, D-047, D-054.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| B3    | Catalog: variant, shade, size, ingredients, batch aur expiry, content ka maalik         | Domain expert                        | Tay: sirf beauty aur personal care (D-029), drug items kabhi nahi (D-043); batch aur expiry (D-062, D-064, D-067, D-082, D-083); catalog (D-075, D-076, D-084, D-085, D-086, D-098 se D-100, D-127, D-128); agla batch (D-124), recall (D-129); skin type aur concern ke fields (D-137), allergen chetavni (D-159).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| B4    | Pricing, promotions, bundles aur kits                                                   | Domain expert                        | Promotions, coupons aur bundles R2 se (D-055). Tay: daam (D-061, D-065, D-087), kits (D-088), kam expiry ka label (D-089), offers (D-101, D-102), delivery fee (D-107), discount dikhana (D-120), samples (D-121).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| B5    | Cart, checkout, order model (split, partial cancel aur return, exchange)                | Domain expert + Architect            | Guest cart nahi (D-020); payment ke raaste (D-034); ek order me kai sellers, invoice har seller ke GSTIN se (D-030, D-041); parcel (D-077), pick pe kami (D-090), quantity seema (D-091), GSTIN invoice (D-092), delivery pe UPI (D-109), cancel (D-110), stock aur payment ka samay (D-118), order ke baad badlav (D-119).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| B6    | Payments, refunds, settlement, ledger                                                   | Domain expert + Architect + Security | **Kuch baaki nahi.** Finance ka database PostgreSQL (D-001), Neon pe (D-057). Tay: fees (D-078, D-094), payable aur payout (D-081), gateway khaata (D-093), chargeback (D-095), udhaar aur kaat (D-103), refund (D-111), bharpai ka daam (D-125). Finance ka design bhi tay: ledger aur documents (D-282), PostgreSQL ka data (D-315), events (D-292), backup (D-323, D-331).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| B7    | Returns aur replacement: cosmetics ke hygiene niyam                                     | Domain expert                        | Tay: wajahein (D-079), samay-seema (D-080), saboot (D-106), lauta maal (D-112), pickup pe jaanch (D-113), kharcha (D-114), refund kab (D-115), baar-baar return (D-116), refund ya replacement (D-122), skin reaction (D-130).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| B8    | Reviews, ratings, UGC, moderation                                                       | Domain expert                        | Reviews R1 me (D-039); padhna bina sign-in, likhna sign-in se (D-020). Tay: review ka haq (D-135), moderation (D-136, D-146), photo (D-155), nakli review (D-156), inaam nahi (D-158); brand ka jawab (D-160), reviewer ki skin jaankari (D-167), Q&A (D-170), formula badla (D-171).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| B9    | Search, recommendations, virtual try-on                                                 | Domain expert + Architect            | Try-on aur recommendations R2 se (D-055); try-on ke saath camera permission (SR-001). Tay: R1 ke filters aur sort (D-138), kram (D-139), zero result (D-152), stock khatam (D-153), sach aankde (D-154); beauty profile (D-165), sujhaav (D-166), shade finder (D-168), try-on (D-169).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| B10   | Loyalty, gift cards, store credit, subscriptions                                        | Domain expert                        | R2 se (D-055). Tay: loyalty points (D-173, D-174, D-175), referral (D-176), store credit nahi (D-177), dobara kharid (D-178), gift cards ka design abhi aur banana kanooni jaanch ke baad (D-179). RBI ke prepaid (PPI) niyam lag sakte hain, jaancha nahi (R-004).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| B11   | Support, disputes, notifications                                                        | Domain expert                        | Consultation flow aur Beauty Advisor ka message thread tay (D-025); support desk R2 se (D-055), R1 me patla hissa (D-105); order ke emails (D-126); sellers aur staff ke emails (D-140), baaki khabrein (D-141), emails ki chhat (D-142), appeal (D-147), "parcel nahi mila" ka samay (D-148); tickets (D-161), SLA (D-162), grievance (D-163), seller aur partner ke dispute (D-164), consultation (D-172).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| B12   | Analytics aur reporting                                                                 | Architect                            | Finance ki poori reports R2 se (D-055). Tay: seller ki reports (D-143), export (D-144), R1 ke aankde (D-149), behaviour ka data (D-157).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| B13   | Compliance ki gehrai: kya dummy, kya asli                                               | Domain expert                        | Registrations aur kanooni details dummy (D-026); telemedicine ki dummy row (D-025); kanooni jaanch baad me ek agent se (R-004). Tay: live site pe allowlist (D-133), har area ki gehrai (D-134), demo ka nishaan (D-145), legal pages (D-150), data ke haq (D-151).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| B14   | Security: auth, authorization, payments, uploads, abuse, privacy                        | Security Architect                   | Security Architect ka pehla run ho gaya. Tay: sessions (D-180, D-181), rok (D-182), sign-in aur authenticator (D-183 se D-186, D-199, D-200), codes ki seema (D-187), paise ke kaam (D-188 se D-190), data ka samay aur pahunch (D-191 se D-195, D-201, D-202), backup aur secrets (D-196, D-197), data leak (D-198), kai accounts (D-203, D-204); R2 me goodwill coupon (D-205), forms pe bots (D-206), sehat ka data (D-207, D-208). Report docs me area ke batches me (D-209). Batch 1 edge aur hosting (D-210), batch 2 sign-in (D-211), batch 3 sessions (D-212), batch 4 authorization (D-213), batch 5 checkout aur paisa (D-214), batch 6 delivery, daawe aur reviews (D-215), batch 7 files aur personal data (D-216), batch 8 data stores aur services (D-217), batch 9 export, audit, logs aur DevOps (D-218), batch 10 R2 ke hisse (D-219); saari batches poori: niyam SR-001 se SR-088. Doosra security run bhi poora (D-399 se D-417), tathya ki jaanch (D-418 se D-425). Baaki: kanooni jaanch (R-004) aur §2 ke bache tathya. |
| B15   | Technical: service boundaries, hosting, observability, backup, scale targets            | Architect                            | **Kuch baaki nahi.** Tay: services aur databases (D-011, D-050), backup (D-013), hosting (D-028, D-048, D-049, D-051, D-052, D-056 se D-058), performance targets (D-053). Observability (D-297), scale (D-298), 512 MB ka naap (OPERATIONS §10) aur saajhe packages (D-428) bhi tay.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| B16   | Docs aur task files ka dhaancha (PROJECT_PLAN, `tasks/NN-<module>/TASK.md`, subtasks)   | Owner ke saath                       | Planning khula (D-443); modules tay (D-444); packages ka poora flow R1 se pehle (D-445); module `28-packages`, saare packages public (D-445); packages ke 12 acceptance criteria (D-445); banane ka kram charan wise (D-446). Tay: dhaancha (D-006), tareeka aur CI me docs ke paths ka check (D-019), progress % ka niyam ([PROJECT_PLAN.md](PROJECT_PLAN.md) §2, D-433), aur manuals aur testing ki files (D-440).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 2. Jaanchna baaki

Claude ka kaam: owner ka faisla nahi chahiye, sirf saboot. Nateeja saboot ke saath sahi file me jaata hai (jaise [RISKS.md](RISKS.md) §2).

| Kya                                                                                                                                                                                                                                                                                                                                                                                                                | Kis faisle se                            | Kyun                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------------------- |
| Asli location data me main city ke pincodes kis hub pe, aur kitne pincodes do sub-districts, districts ya states me phaile hain. Local Government Directory ki "Pincode to Village Mapping" file captcha ke peeche hai: owner download kare, phir Claude ginti kare ([RISKS.md](RISKS.md) §2.12)                                                                                                                   | D-015, D-016                             | Pincode → hub mapping; D-016 asli data dekh ke dobara khul sakta hai |
| CosIng ka apna license aur bulk download: Commission ki site ka aam niyam CC BY 4.0, par CosIng pe laagu hai ya nahi, saaf nahi ([RISKS.md](RISKS.md) §2.12)                                                                                                                                                                                                                                                       | D-132                                    | Ingredient master list ka import (products badhne pe)                |
| Render tak Vercel ka `x-forwarded-for` kaise pahunchta hai (Render beech me apna hop jodta hai ya nahi): pehle deploy pe test                                                                                                                                                                                                                                                                                      | D-052, Q-151                             | Rate limit ke liye asli IP                                           |
| Render Key Value ke andar wale URL pe TLS (`rediss://`) hai ya nahi, aur default maxmemory policy kya hai: Key Value banate waqt dekhna                                                                                                                                                                                                                                                                            | D-051, SR-070, SR-008                    | Redis ka raasta aur vyavhaar                                         |
| Razorpay: dispute ka jawab dene ke kitne din, aur jawab na dene ka nateeja                                                                                                                                                                                                                                                                                                                                         | D-095, D-191                             | Delivery ka saboot kitne din rakhein                                 |
| Brevo: API key ke scopes (sirf transactional bhejna) milte hain ya nahi; aur pehle bhejne pe From address aur anonymous click tracking ka asli roop (help center ke pages khud nahi khule, [RISKS.md](RISKS.md) §2.9)                                                                                                                                                                                              | D-287, D-419, SR-012, SR-073             | Key ke haq; email ka From aur links                                  |
| Web Push: Firefox aur Edge ke push service hosts                                                                                                                                                                                                                                                                                                                                                                   | SR-072, SR-074                           | Push ki allowlist                                                    |
| Owner ka laptop: disk encryption chalu hai ya nahi (owner Settings me dekhe, [RISKS.md](RISKS.md) §2.8); Desktop folder kisi cloud sync me nahi (jaancha 2026-11-22)                                                                                                                                                                                                                                               | D-013, D-196, R-023                      | Backups ki suraksha                                                  |
| Gift card: Pine Labs ya kisi aur RBI-authorised PPI issuer ka test API ya sandbox milta hai ya nahi: issuer se poochhna                                                                                                                                                                                                                                                                                            | D-249                                    | Gift card ka raasta                                                  |
| Cloudinary free account pe ek test (ab sirf public aur review images, D-420): rakhi copy me EXIF, strict transformations, bina signature wale presets band karna, aur API keys ke roles                                                                                                                                                                                                                            | D-284, D-420, SR-096                     | Public media ki settings                                             |
| Object storage (D-420): account banate waqt card maangta hai ya nahi (R2 ke product page pe "no credit card", par R2 chalu karne ka checkout ka kadam hai; B2 pe saaf nahi); presigned PUT me size ki rok signature me aati hai ya nahi; kanooni rok wali files ke liye lock (misaal R2 ka bucket lock) free plan pe milta hai ya nahi (D-439); phir R2 ya B2 ka chunav owner ke saath ([RISKS.md](RISKS.md) §2.9) | D-420, D-028                             | Private files ki jagah                                               |
| Atlas free cluster pe ek test: fuzzy aur autocomplete, search index 0.5 GB me ginta hai ya nahi, driver se `createSearchIndex`, `$out` aur `$merge`, multi-document transactions, validators aur partial indexes, aur TTL ke deletes 100 ops/second me gine jaate hain ya nahi                                                                                                                                     | D-295, D-311, D-313, D-314, R-006, R-032 | Search, transactions aur release step                                |
| Atlas free cluster pe audit ke sirf `insert` aur `find` wale custom role ka asli test (custom roles free pe bante hain, [RISKS.md](RISKS.md) §2.7)                                                                                                                                                                                                                                                                 | D-313, D-317, D-400                      | Audit ka pehra                                                       |
| Neon: khula par khaali connection compute ko jagaye rakhta hai ya nahi: test                                                                                                                                                                                                                                                                                                                                       | D-288, D-309                             | CU-ghante                                                            |
| Node ke MongoDB driver me saade integer `int32` me jaate hain ya `double` me: test                                                                                                                                                                                                                                                                                                                                 | D-310                                    | Paise ka money codec (`long`)                                        |
| GitHub: public repo pe repo ka push protection muft chalu hota hai ya nahi (repo ki settings me dekhna)                                                                                                                                                                                                                                                                                                            | SR-080, D-327, D-338                     | CI ka secret scan asli pehra hai; repo ka pehra mile to ek aur parat |
| Installed app (PWA) me payment: gateway UPI app ke intent aur bank ke 3DS page ke baad wapas app me aata hai ya nahi (test mode, asli phone pe)                                                                                                                                                                                                                                                                    | D-345, SR-048                            | Payment ka flow                                                      |
| Camera ka `capture`: Android Chrome aur iOS Safari pe file input seedha camera kholta hai aur gallery rukti hai ya nahi (spec me guarantee nahi; asli phone pe)                                                                                                                                                                                                                                                    | SR-055, D-072                            | Delivery ka saboot                                                   |
| Ola Maps: geocoding ke nateeje (lat/lng) apne database me rakhna: terms me caching ka niyam nahi mila; vyakhya Lawyer (AI) se                                                                                                                                                                                                                                                                                      | D-347                                    | Address ka data rakhna                                               |
| Ola Web SDK: bundle ka size, MapLibre pe hai ya nahi, npm se bundle hoke bina CDN ki script chalta hai ya nahi, style ke sprites aur glyphs ke hosts; key ki whitelist exact host pe ya wildcard pe, aur har API ki alag rok (npm install aur Ola ke Console pe)                                                                                                                                                   | D-347, SR-005, SR-091, DS-10.9, R-082    | Bundle ka budget, CSP aur key                                        |
| Load test ka tool: k6 ya autocannon (dono uplabdh, [RISKS.md](RISKS.md) §2.11): planning me                                                                                                                                                                                                                                                                                                                        | D-379, RT-32                             | Load test                                                            |
| Playwright me nakli camera (Chromium ke fake device flags)                                                                                                                                                                                                                                                                                                                                                         | AC-DELIVERY-5                            | Delivery ki E2E                                                      |
| iPhone pe laptop ka app: local HTTPS ka tareeka (Android pe USB ka port forwarding chalta hai, [RISKS.md](RISKS.md) §2.11)                                                                                                                                                                                                                                                                                         | D-375                                    | Asli phone wala round                                                |
| ZAP baseline ke single page apps pe jhoothe nateeje: pehle nightly run pe dekhna                                                                                                                                                                                                                                                                                                                                   | RT-36                                    | Nightly DAST                                                         |
| Scheduled workflow (default branch se) me `prerelease` ka checkout, `permissions: {}` aur job ke `contents: read` ke saath: pehle run pe test                                                                                                                                                                                                                                                                      | D-381, RT-8                              | Nightly ka branch                                                    |
| StrykerJS: sandbox repo ke bahar (docs andar rakhne ki salah dete hain) aur npm workspaces me ek package ka run: pehle mutation run pe test                                                                                                                                                                                                                                                                        | D-372, RT-21                             | Mutation job                                                         |
| Laptop ki memory me ek saath kya chal sakta hai: saare databases, fakes, 9 apps ki static copy, Playwright, mutation ke containers (local Atlas container ko kam se kam 2 GB khaali RAM aur 2 cores)                                                                                                                                                                                                               | R-070                                    | Laptop pe tests ka bojh                                              |
| Render pe rejected (misaal 403) jawab bandwidth me gine jaate hain ya nahi: dashboard ke usage se naap                                                                                                                                                                                                                                                                                                             | SR-105, R-077                            | Baadh se bandwidth ka khatra kitna asli                              |
| GitHub: public repo ke Actions artifacts bina sign-in ke download hote hain ya nahi                                                                                                                                                                                                                                                                                                                                | D-403, SR-103                            | Scan ki report private rahe                                          |
| Web Push: push service ke 404 aur 410 ka matlab (FCM, Mozilla aur Apple ke apne docs)                                                                                                                                                                                                                                                                                                                              | SR-101, D-401, R-081                     | Raat ke alerts ka raasta chupke se band na ho                        |
| Vercel ke pehle deploy pe test: `/pay/` jaise folder ka `index.html` SPA ke fallback rewrite se pehle milta hai ya nahi, aur `/.well-known/security.txt` static file serve hoti hai ya nahi                                                                                                                                                                                                                        | SR-090, D-407, SR-103                    | Payment ka alag document aur `security.txt`                          |
| Razorpay Payment Links test mode me chalte hain ya nahi, aur kaunse webhooks aate hain                                                                                                                                                                                                                                                                                                                             | D-407                                    | Hosted page ka raasta (delivery pe UPI ab D-418 se)                  |
| UptimeRobot free: HTTP monitor ka timeout, aur email alert free plan pe pakka                                                                                                                                                                                                                                                                                                                                      | D-330, D-332, SR-078                     | Server down ka alert                                                 |
| Vercel Hobby ki non-commercial shart: Vercel ke Terms of Service me (Hobby aur fair use ke docs pages pe nahi mili)                                                                                                                                                                                                                                                                                                | D-048, R-011                             | Apps ki hosting                                                      |

## 3. Sawal

### Q-001. Warehouse me rakhe maal ka maalik kaun?

- **Status:** `Tay`. Topic: B3 (batch aur expiry), B6 (settlement).
- **Sawal:** brands ka jo maal hamare warehouse me rakha hai (D-014), bikne tak uska maalik kaun: brand khud, ya Beautinique?
- **Kyun zaroori:**
  - Isi se tay hota hai ki stock ke record me har batch ka maalik kaun hai, warehouse me toot-foot ya chori ka nuksaan kiska hai, seller ko apne stock ki kaunsi report milti hai, maal wapas maangne ka haq kiska hai, aur finance me stock kiski kitaab me hai.
  - D-030 kehta hai customer ka invoice seller ke GSTIN se banega. Jo maal ka maalik nahi, wo uska invoice nahi kaat sakta. D-036 (warehouse wale state ka GSTIN brand ke paas) bhi isi liye zaroori hai ki brand ka apna maal hamare warehouse me rehta hai.
- **Vikalp:**
  - **(a) Brand maalik:** maal bikne tak brand ka. Hum sirf rakhte, pack karte aur pahunchate hain, aur iske liye fees lete hain.
  - **(b) Beautinique khareed leta hai:** maal warehouse me aate hi hamara. Tab customer ka invoice Beautinique ka banega, jo D-030 se takrata hai.
  - **(c) Dono:** kuch brands ka maal (a) jaisa, kuch ka khareeda hua (Beautinique ke ek alag retail seller ke naam se).
- **Salah:** **(a)**. D-030 aur D-036 isi pe tike hain, aur har cheez ka ek hi raasta rehta hai: har batch pe uske seller ka record, har bikri ka invoice usi seller ka. Apna brand bhi isi tarah chalega, kyunki wo bhi alag company ka seller hai (D-031).
- **Trade-off:**
  - (a) me warehouse me hamare haath se hua nuksaan (toot-foot, chori, galat dispatch) hamari zimmedari hai, to uski bharpai ka niyam chahiye; aur seller ko apne maal ki ginti dikhani padti hai.
  - (b) me ye sab saral hai, par marketplace ka model hi badal jaata hai, aur expire ya na bika maal hamara nuksaan ban jaata hai.
  - (c) me dono ke niyam aur dono ka hisaab: R1 ke liye bhaari.
- **Kanooni detail jaanchi nahi** (R-004).
- **Owner ka jawab (2026-11-18):** **(a)**, bikne tak maal ka maalik brand. Record: [DECISIONS.md](DECISIONS.md) D-060.

### Q-002. Customer ko dikhne wala price kaun tay kare?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** product ka selling price (jo customer deta hai) kaun tay kare: brand (seller), ya Beautinique?
- **Kyun zaroori:**
  - Maal brand ka hai (D-060) aur customer ka invoice bhi brand ke GSTIN se banta hai (D-030). Invoice pe likha daam jo tay kare, wahi bechne wala hai: isliye ye marketplace model ki seedhi baat hai.
  - Isi se tay hota hai ki seller app me price ka form kaisa ho, price badalne ka itihaas aur jaanch kaun rakhe, hamara commission kis daam pe lage, aur aage ke discounts (R2, D-055) seller ka price badlenge ya alag se dikhenge.
  - Kanoon ki ek pakki seema: pack pe chhapa MRP (saare tax samet) se zyada daam pe bechna mana hai.
- **Vikalp:**
  - **(a) Brand poori tarah azaad:** brand jo chahe daam rakhe, bas MRP se zyada nahi. Hum koi aur jaanch nahi karte.
  - **(b) Beautinique tay kare:** hum daam rakhte hain, brand ko apna hissa milta hai.
  - **(c) Brand tay kare, platform ke niyam ke saath:** brand daam rakhe, par platform ye niyam laagu kare:
    1. Daam MRP se zyada nahi, aur 0 se zyada.
    2. Har badlav ka itihaas: kisne, kab, purana daam, naya daam.
    3. Ek baar me bada badlav (jaise 50% se zyada upar ya neeche; number pricing ki charcha me) pe seller se dobara confirm, taaki ₹1,999 ki jagah ₹199 jaisi galti pakdi jaye.
    4. Platform seller ka daam kabhi nahi badalta. Platform ka diya discount (R2) alag dikhta hai.
- **Salah:** **(c)**. Daam bechne wale ka hi rehta hai (D-030, D-060 ke saath seedha mel), aur niyam 1 se 3 customer aur seller dono ko galti se bachate hain. Ye kaam chhota hai: ek check, ek itihaas ki table, ek confirm step.
- **Trade-off:**
  - (a) sabse saral, par galat daam (typo) seedha live ho jata hai aur koi itihaas nahi rehta.
  - (b) me marketplace ka model toot-ta hai: invoice brand ka, par daam hamara. Brand ke liye judna mushkil, aur platform ke daam tay karne pe kanoon ke sawal uth sakte hain (jaancha nahi).
  - (c) me seller ko bade badlav pe ek extra click.
- **Kanooni detail jaanchi nahi** (R-004).
- **Owner ka jawab (2026-11-18):** **(c)**, brand tay kare, platform ke 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-061.

### Q-003. Expire hone wala ya na bika maal: nuksaan kiska, aur kya hota hai?

- **Status:** `Tay`. Topic: B3 (batch aur expiry), B6 (settlement).
- **Sawal:** hamare warehouse me brand ka jo maal expire hone wala hai, expire ho gaya, ya bahut der se nahi bik raha, uska nuksaan kiska hai, aur us maal ka kya hota hai?
- **Kyun zaroori:**
  - Cosmetics me expiry asli jokhim hai: har batch ki expiry date hoti hai, aur expire ya expire hone ke kareeb maal customer ko nahi jaana chahiye.
  - Maal brand ka hai (D-060), isliye nuksaan bhi seedha brand ka banta hai. Par asli sawal ye hai ki warehouse me pada aisa maal kaun, kab aur kaise hataye. Koi niyam na ho to expired maal warehouse ki jagah gherta hai, galti se pack ho sakta hai, aur kisi ki zimmedari nahi rehti.
  - Isi se tay hota hai: receiving pe kitni bachi expiry chahiye (D-014 me jaanch tay hai, seema nahi), bikri kab band ho, brand ko kab khabar mile, maal wapas ya nasht kaise ho, aur iski fee seller ke hisaab (B6) me kaise kate.
- **Vikalp:**
  - **(a) Brand ka nuksaan, brand khud sambhale:** platform sirf report dikhata hai; brand jab chahe maal wapas maange. Platform ke apne koi niyam nahi.
  - **(b) Brand ka nuksaan, platform ke niyam ke saath:**
    1. **Receiving pe:** batch ki bachi expiry ek kam se kam seema se kam ho to maal wapas (jaise 6 mahine; number B3 ki charcha me, category ke hisaab se alag ho sakta hai).
    2. **Bikri band:** bachi expiry ek seema se kam hote hi wo batch bikna band (jaise 3 mahine), taaki customer ko kam se kam itni expiry mile. Pick karte waqt sabse pehle expire hone wala batch pehle jaata hai.
    3. **Khabar:** brand ko bikri band hone se pehle alert, aur band hone pe dobara.
    4. **Brand ka chunaav:** bikri band hone ke baad brand tay din me chune (jaise 15 din): maal apne kharche pe wapas le jaaye, ya hum nasht karein aur disposal fee lein. Tay din me jawab na aaye to hum nasht karte hain aur fee lagti hai.
    5. **Na bika maal (expire nahi):** brand kabhi bhi apne kharche pe wapas maang sakta hai.
    6. **Record:** har wapsi aur har disposal ka record (batch, ginti, tareekh, kisne kiya); disposal kanoon ke hisaab se (dummy).
  - **(c) Nuksaan baant lo:** platform expire hone ke kareeb maal ka kuch hissa khud uthaye ya khareed le. Ye D-060 (maal brand ka) se takrata hai aur hamara kharcha badhata hai.
- **Salah:** **(b)**. Nuksaan brand ka rehta hai (D-060 ke saath seedha), aur niyam warehouse ko saaf aur customer ko surakshit rakhte hain. Brand chahe to bikri band hone se pehle khud daam ghata sakta hai (D-061 ke niyam ke andar).
- **Trade-off:**
  - (a) sabse kam kaam, par expired maal warehouse me padha reh sakta hai aur galti se customer tak jaane ka khatra rehta hai.
  - (b) me kaam zyada: expiry ke alert, brand ka chunaav aur uski samay-seema, disposal ka record aur fee. Saare numbers (6 mahine, 3 mahine, 15 din) abhi sirf misaal hain.
  - (c) brands ke liye achha, par hamara nuksaan aur model se takrav.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke label pe expiry ke niyam, aur cosmetics nasht karne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, nuksaan brand ka, platform ke 6 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-062.

### Q-004. Hamare haath se hue nuksaan ki bharpai kis daam pe?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (warehouse).
- **Sawal:** brand ka maal hamari zimmedari me (warehouse, warehouse se hub ka safar, hub, delivery partner) toot jaaye, kho jaaye ya chori ho, to brand ko kis daam pe bharpai milegi?
- **Kyun zaroori:**
  - D-060 ke baad ye hamari zimmedari hai, par daam tay nahi. Isi se tay hota hai ki seller ke hisaab (B6) me kitna credit jaaye, aur hamara kitna nuksaan ho.
  - Zimmedari kab shuru aur kab khatam: receiving pe maal accept hone se, customer ko delivery (ya brand ko wapsi) tak. Receiving se pehle ka nuksaan (brand ki apni gaadi me) brand ka; expiry ka nuksaan brand ka (D-062).
- **Vikalp:**
  - **(a) MRP pe:** pack pe chhapa daam.
  - **(b) Jo brand ko bikne pe milta:** nuksaan ke din ka selling price (D-061 ke itihaas se), usme se hamara commission aur fees ghata ke.
  - **(c) Brand ka bataya cost:** receiving pe brand har batch ka cost bataye, bharpai usi pe.
- **Salah:** **(b)**, in niyam ke saath:
  1. **Daam:** nuksaan ke din ka selling price aur pichhle 30 din ka sabse kam selling price, dono me jo kam ho; usme se commission aur fees ghata ke. Isse brand ki haalat waisi hi rehti hai jaisi bikne pe hoti, aur nuksaan se theek pehle daam badha ke zyada bharpai lena kaam nahi karta.
  2. **Record:** har nuksaan ka record: kab, kahan (warehouse, safar, hub, delivery), kisne pakda, batch, ginti. Seller ko apne panel me dikhe.
  3. **Bharpai:** seller ke hisaab me credit, record banne ke baad agle payout me. Toota maal nasht (D-062 ke record ke saath).
  4. **Baad me mil gaya:** gum hua maal baad me mile aur bikne layak ho, to bharpai wapas kat-ti hai aur maal phir stock me.
  5. **Seller ka daawa:** seller ki ginti hamari ginti se na mile to wo daawa kar sake (support se, B11).
- **Trade-off:**
  - (a) me brand ko bikne se bhi zyada milta hai (uska margin aur tax samet): hamara nuksaan bada.
  - (b) me brand ke liye barabar, aur zaroori data pehle se hai (D-061). Par niyam 1 ka hisaab thoda zyada kaam.
  - (c) asli nuksaan ke sabse kareeb, par brand ka bataya cost jaanchna mushkil, aur har batch pe ek aur field.
- **Kanooni detail jaanchi nahi** (R-004): bharpai pe GST kaise lagta hai, aur brand ke liye kho gaye maal ka tax ka hisaab.
- **Owner ka jawab (2026-11-18):** **(b)**, jitna brand ko bikne pe milta, 5 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-063.

### Q-005. Ek product ke alag batches ka MRP alag ho to customer ko kaunsa MRP dikhe?

- **Status:** `Tay`. Topic: B3 (batch), B5 (cart aur checkout).
- **Sawal:** ek hi product (jaise ek lipstick ka ek shade) ke warehouse me do batch hain, aur dono ke pack pe alag MRP chhapa hai (jaise purana ₹499, naya ₹549). Customer ko site pe kaunsa MRP dikhe, aur daam ki seema kis MRP se tay ho?
- **Kyun zaroori:**
  - Cosmetics me aisa aksar hota hai: brand naye batch pe MRP badhata ya ghatata hai, aur purana batch abhi bik raha hota hai.
  - Kanoon do baatein maangta hai: pack ke MRP se zyada daam nahi (D-061 niyam 1), aur online bechne wala site pe pack ki jaankari (MRP samet) dikhaye. Site ka MRP aur customer ko aaya pack ka MRP alag hon to ye jaankari galat ho jaati hai.
  - D-061 kehta hai platform seller ka daam kabhi nahi badalta, aur D-062 kehta hai sabse pehle expire hone wala batch pehle jaata hai. Ye jawab dono ke saath milna chahiye.
- **Vikalp:**
  - **(a) Ek MRP, sabse kam wala:** saare bikne layak batches me sabse kam MRP site pe dikhe, aur daam usse zyada nahi. Batch koi bhi jaaye.
  - **(b) Batch ke hisaab se:** site pe wahi MRP dikhe jo agle bhejne wale batch ka hai (D-062 ka kram), aur order usi batch se reserve ho. Niyam:
    1. Seller ka ek hi daam (D-061), jo kisi bhi bikne layak batch ke MRP se zyada nahi ho sakta.
    2. Naya batch aaye aur uska MRP seller ke daam se kam ho, to wo batch tab tak nahi bikta jab tak seller daam na ghataye; seller ko alert. Platform daam khud nahi badalta.
    3. Customer ne jo MRP dekha, wahi batch jaata hai.
    4. Ek line ki quantity do batches me bate aur MRP alag ho, to checkout pe line do hisson me dikhe, har hissa apne MRP ke saath (daam wahi).
    5. Invoice me har line ka batch aur MRP.
  - **(c) Har MRP ki alag listing:** ek hi product do baar dikhe, alag MRP ke saath, aur customer khud chune.
- **Salah:** **(b)**. Site pe dikha MRP aur customer ke haath me aaya pack hamesha same, jo kanoon ki maang hai; aur batch ka record (D-062) pehle se ban raha hai, to reservation ko batch tak le jaana chhota kaam hai.
- **Trade-off:**
  - (a) sabse saral, aur customer kabhi pack ke MRP se zyada nahi deta. Par kabhi pack pe site se zyada MRP chhapa aata hai: site ki jaankari aur pack alag.
  - (b) me batch badalte hi site ka MRP badalta hai, checkout me line kabhi do hisson me bat-ti hai, aur niyam 2 ki wajah se naya batch seller ke daam ghatane tak ruk sakta hai.
  - (c) customer ke liye confusing (ek hi cheez do baar), aur search aur reviews do jagah bat jaate hain.
- **Kanooni detail jaanchi nahi** (R-004): online pe pack ki jaankari dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, batch ke hisaab se, 5 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-064.

### Q-006. Beauty Pro buyers ke liye alag daam ho ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** Beauty Pro buyers (salon, clinic, spa, freelancer jaise professional, D-032) ko normal customer wala hi daam mile, ya unke liye alag (kam) daam ho sake?
- **Kyun zaroori:**
  - Professional kharidaar zyada maal aur baar-baar lete hain, aur aksar brand ka "trade price" hota hai. Agar platform pe wahi daam mile jo har customer ko, to unke liye Beauty Pro banne ki wajah sirf GST wala invoice reh jaati hai.
  - Isi se tay hota hai: ek product pe ek daam ya do (D-061 ke niyam dono pe), cart me daam kharidaar ke hisaab se badle ya nahi, aur kam daam pe khareed ke aage bechne ka khatra kaise roka jaye.
  - Beauty Pro ke kaam R2 se hain (D-055), par daam ka dhaancha abhi tay ho to catalog aur cart ka design ek baar me sahi banta hai.
- **Vikalp:**
  - **(a) Sabke liye ek daam:** Beauty Pro ko alag daam nahi; farak sirf unke GSTIN wala invoice (taaki wo tax credit le sakein).
  - **(b) Seller chahe to Pro daam rakhe:** seller kisi product pe ek alag Pro daam rakh sakta hai, jo sirf jaanche hue (verified) Beauty Pro buyers ko dikhe. Niyam:
    1. Pro daam normal daam se zyada nahi, aur D-061 ke saare niyam (MRP ki seema, itihaas, bade badlav pe confirm) is pe bhi.
    2. D-064 ka batch wala MRP niyam is pe bhi.
    3. Seller Pro daam na rakhe to Pro buyer ko normal daam.
    4. Pro buyer ko GSTIN wala invoice.
  - **(c) Platform ka Pro discount:** sab products pe Beauty Pro ko ek tay % chhoot, jiska paisa platform deta hai.
- **Salah:** **(b)**. Daam bechne wale ka hi rehta hai (D-061), platform pe koi kharcha nahi, aur seller apne trade price ke hisaab se khud tay karta hai.
- **Trade-off:**
  - (a) sabse saral, par Pro buyers ke liye platform pe aane ki wajah kam.
  - (b) me ek product ke do daam: cart aur product page pe daam kharidaar ke hisaab se, aur kam daam pe khareed ke aage bechne ka khatra (iske liye Pro ki jaanch aur quantity ki seema chahiye).
  - (c) me platform ka seedha kharcha, aur saare sellers ke liye ek jaisi chhoot jo har brand ke hisaab se sahi nahi.
- **Kanooni detail jaanchi nahi** (R-004): kharidaar ke hisaab se alag daam ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, seller chahe to Pro daam rakhe, 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-065.

### Q-007. Lambe samay se pade na bike maal pe storage fee ho ya nahi?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (warehouse).
- **Sawal:** brand ka jo maal (expire nahi hua) warehouse me bahut der se pada hai aur nahi bik raha, us pe hum storage fee lein ya nahi, aur kab se?
- **Kyun zaroori:**
  - Warehouse ki jagah ka kharcha hai. D-062 kehta hai na bika maal brand kabhi bhi wapas maang sakta hai, par koi wajah na ho to brand zaroorat se zyada maal bhej ke chhod deta hai, aur warehouse bharta jaata hai.
  - Isi se tay hota hai: har batch kitne din se pada hai uska hisaab, brand ko alert, aur fee seller ke hisaab (B6) me kaise kate.
- **Vikalp:**
  - **(a) Koi storage fee nahi:** fees sirf bikne pe (commission aur fulfilment fee).
  - **(b) Har maal pe har mahine fee:** jitna maal pada hai, utni fee, pehle din se.
  - **(c) Kuch din muft, phir fee:** har batch receiving ke baad tay din tak muft (jaise 90 din). Uske baad har mahine fee, jo jitna purana utni zyada ho sakti hai. Niyam:
    1. Fee shuru hone se pehle brand ko alert, taaki wo chahe to maal wapas le jaaye (D-062 niyam 5).
    2. D-062 me bikri band hua batch (expiry ki wajah se) pe ye fee nahi; us pe D-062 ke niyam.
    3. Fee seller ke hisaab me kat-ti hai (B6), har batch ke hisaab ke saath.
    4. Din aur fee ki rakam settlement ki charcha (B6) me.
- **Salah:** **(c)**. Theek se bikne wale maal pe koi kharcha nahi, aur dead stock pe wajah banti hai ki brand utna hi bheje jitna bikta hai.
- **Trade-off:**
  - (a) sabse saral, par warehouse dead stock se bhar sakta hai, aur iska kharcha hamara.
  - (b) har brand pe kharcha, theek se bikne wale maal pe bhi: chhote brands ke liye bhaari.
  - (c) me har batch ki umar ka hisaab, mahine ki fee ka calculation aur alerts.
- **Owner ka jawab (2026-11-18):** **(c)**, kuch din muft, phir fee, 4 niyam ke saath. Record: [DECISIONS.md](DECISIONS.md) D-066.

### Q-008. Customer ko product page pe expiry dikhe ya nahi?

- **Status:** `Tay`. Topic: B3 (batch aur expiry).
- **Sawal:** customer ko kharidne se pehle pata chale ya nahi ki use jo pack milega uski expiry kab hai, aur kaise?
- **Kyun zaroori:**
  - Cosmetics kharidne wale expiry ke baare me poochhte hain; na dikhe to bharosa kam aur support ke sawal zyada.
  - D-064 ke baad order usi batch se reserve hota hai jiska MRP site pe dikha. Isliye us batch ki expiry bhi pakki pata hai, aur dikhana mumkin hai.
  - D-062 me bikri band ki seema hai (misaal 3 mahine), yaani customer ko kam se kam itni expiry milti hi hai.
- **Vikalp:**
  - **(a) Exact expiry nahi:** sirf ek pakka vaada dikhe: "kam se kam X mahine ki expiry" (D-062 ki seema).
  - **(b) Agle bhejne wale batch ki expiry:** product page, cart aur checkout pe us batch ki expiry (mahina aur saal, jaise pack pe hota hai). Niyam:
    1. D-064 ki tarah: batch badle to dikhi expiry bhi badle.
    2. Ek line do batches me bate to har hissa apni expiry ke saath (D-064 niyam 4 jaisa).
    3. Order ki detail aur invoice me har line ka batch aur expiry.
  - **(c) Dono:** product page pe "kam se kam X mahine" ka vaada, aur cart, checkout aur order me exact expiry.
- **Salah:** **(b)**. Customer ko wahi dikhe jo use milega, aur ye D-064 (MRP batch ke hisaab se) ke saath seedha milta hai: data wahi, sirf ek aur field.
- **Trade-off:**
  - (a) saral, par customer ko asli expiry tab pata chalti hai jab pack haath me aata hai.
  - (b) me jis batch ki expiry kareeb hai (seema ke upar par kam), use customer chhod sakte hain, to wo dheere bikta hai aur brand ke liye D-062 ka wapsi ya disposal badh sakta hai. Brand chahe to aise batch pe daam ghata sakta hai (D-061).
  - (c) me screen pe do tarah ki jaankari: thoda zyada UI aur text.
- **Kanooni detail jaanchi nahi** (R-004): online pe expiry dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, agle bhejne wale batch ki exact expiry. Record: [DECISIONS.md](DECISIONS.md) D-067.

### Q-009. Transporter ya delivery partner ke haath se hua nuksaan: vasooli ho ya nahi?

- **Status:** `Tay`. Topic: B1 (logistics), B6 (settlement).
- **Sawal:** maal warehouse aur hub ke beech transporter (D-027) ke paas, ya customer tak jaate waqt delivery partner (D-033) ke paas toota, kho gaya ya chori hua. Brand ko bharpai hum dete hain (D-063). Kya hum ye paisa transporter ya delivery partner se vasool karein, aur kaise?
- **Kyun zaroori:**
  - Vasooli na ho to har nuksaan seedha hamara kharcha, aur laaparwahi ya dhokhe (parcel "gum" bata dena) ko rokne ki koi wajah nahi.
  - Par delivery partner gig partner hain (D-033), apni gaadi ke saath. Unki kamaai se kaat-na bharose aur unke bane rehne pe asar daalta hai, aur galat kaat galat insaan pe padti hai.
  - D-027 me har trip ka record (seal number, manifest, dispatch aur receive scan) pehle se hai, yaani transporter ke maamle me saboot hota hai.
- **Vikalp:**
  - **(a) Koi vasooli nahi:** saara nuksaan platform ka kharcha.
  - **(b) Saboot ke saath, alag-alag niyam:**
    1. **Transporter:** seal toota ho, ya hub pe manifest se kam maal mile, to nuksaan transporter ke bill se kat-ta hai (contract ka niyam).
    2. **Delivery partner:** kaat sirf jaanch ke baad, jab saboot ho ki galti unki hai (jaise parcel unhe scan karke diya gaya, aur na delivery ka saboot, na wapsi). Ek baar me aur mahine me kaat ki seema. Partner ko apna paksh rakhne ka mauka, aur faisla staff ka, apne aap nahi.
    3. Baar-baar aisa ho to kaat badhane ki jagah partner ka account rokna (staff ke faisle se).
    4. Har maamle ka record: kya hua, saboot, faisla, kisne kiya.
  - **(c) Hamesha poori vasooli:** jiske paas maal tha, usse poora paisa.
- **Salah:** **(b)**. Transporter ek business hai aur saboot pehle se hai; delivery partner ke saath sakhti sirf saboot pe, seema ke andar, aur unki baat sun ke.
- **Trade-off:**
  - (a) sabse saral aur partners ke liye achha, par nuksaan aur dhokha dono hamare sir.
  - (b) me jaanch ka kaam: staff ka samay, saboot dekhna, partner ki baat sunna, aur seema ka hisaab.
  - (c) seedha, par galat kaat ka khatra, aur partners chhod ke ja sakte hain.
- **Kanooni detail jaanchi nahi** (R-004): gig partners ki kamaai se kaat ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, vasooli sirf saboot ke saath, 4 niyam. Record: [DECISIONS.md](DECISIONS.md) D-068.

### Q-010. Beauty Pro buyer ki jaanch kaise ho?

- **Status:** `Tay`. Topic: B2 (roles), B4 (pricing).
- **Sawal:** koi customer kahe ki wo professional hai (salon, clinic, spa, freelancer, home-based, D-032), to use Beauty Pro (jise Pro daam dikhta hai, D-065) kaise aur kis saboot pe banaya jaye?
- **Kyun zaroori:**
  - Pro daam sirf jaanche hue Pro buyers ko dikhta hai (D-065). Jaanch kamzor ho to koi bhi Pro ban ke kam daam pe khareede aur aage beche: sellers ka nuksaan.
  - D-032 me freelancer aur home-based bhi Beauty Pro ban sakte hain, aur aksar unke paas GSTIN nahi hota. Isliye "sirf GSTIN" wala raasta unhe bahar kar deta hai.
  - Dastavez (documents) personal data hain: unhe kahan aur kaise rakhein, kaun dekhe, ye security ka sawal bhi hai (B14).
- **Vikalp:**
  - **(a) Sirf GSTIN:** sahi GSTIN do, Pro ban jao (GSTIN ki jaanch dummy, D-026).
  - **(b) Saboot + staff ki jaanch:** customer ek saboot de, staff jaanch ke Pro banaye. Niyam:
    1. **Saboot (koi ek):** GSTIN, ya business ka registration (jaise Udyam, dukaan ka licence), ya freelancer ke liye beauty course ka certificate. Sab dummy (D-026).
    2. **GSTIN alag:** GSTIN ho to GSTIN wala invoice (D-065 niyam 4); na ho to Pro daam milta hai par normal invoice.
    3. **Muddat:** Pro darja ek tay muddat (jaise 1 saal) ke liye; phir dobara saboot.
    4. **Staff hata sake:** galat istemaal (jaise bahut zyada maal le ke aage bechna) pe staff Pro darja hata sake, wajah ke record ke saath.
    5. **Dastavez private:** saboot sirf jaanch karne wale staff ko dikhe, public link se nahi.
  - **(c) Koi jaanch nahi:** customer khud bata de ki wo Pro hai.
- **Salah:** **(b)**. D-032 ke saare professional (GSTIN ke bina wale bhi) aa sakte hain, aur jaanch staff ke haath me rehti hai, to Pro daam ka galat istemaal kam hota hai.
- **Trade-off:**
  - (a) apne aap aur saral, par freelancer aur home-based bahar, aur kisi bhi business ka GSTIN chal jaata hai (beauty business ho ya na ho).
  - (b) me staff ka samay, dastavez rakhne ka surakshit intezaam, aur har saal dobara jaanch ka flow.
  - (c) me koi kaam nahi, par Pro daam sabke liye khul jaata hai, aur D-065 ka matlab hi khatam.
- **Kanooni detail jaanchi nahi** (R-004): dastavez rakhne aur personal data ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, ek saboot + staff ki jaanch, 5 niyam. Record: [DECISIONS.md](DECISIONS.md) D-069.

### Q-011. Beauty Pro buyer pe Pro daam ki quantity ki seema ho ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing), B5 (cart).
- **Sawal:** ek jaancha hua Beauty Pro buyer Pro daam (D-065) pe ek product kitna bhi khareed sake, ya ek seema ho?
- **Kyun zaroori:**
  - Pro daam kam hota hai. Seema na ho to koi Pro buyer bahut saara maal le ke aage normal customers ko beche, aur seller ki normal bikri ko nuksaan ho.
  - D-069 me staff galat istemaal pe Pro darja hata sakta hai, par ye tab hota hai jab nuksaan ho chuka. Seema pehle se roke.
  - Har product ki zaroorat alag: salon ek shampoo ke kai bade pack leta hai, par ek lipstick shade ke itne nahi.
- **Vikalp:**
  - **(a) Koi seema nahi:** sirf staff ki nazar aur D-069 niyam 4.
  - **(b) Seller tay kare:** seller kisi product pe Pro daam ki seema rakh sakta hai (ek order me, aur mahine me, har Pro buyer ke liye). Niyam:
    1. Seema seller ki marzi: na rakhe to koi seema nahi.
    2. Seema se upar ki quantity normal daam pe milti hai (rokte nahi). Cart me line do hisson me dikhti hai: Pro daam wala hissa aur normal daam wala (D-064 ke batch wale hisson jaisa).
    3. Staff ko report: har Pro buyer ka mahine ka total, product ke hisaab se, taaki D-069 niyam 4 ke liye saboot rahe.
  - **(c) Platform ki ek seema:** saare products pe ek hi seema (jaise ek order me 10).
- **Salah:** **(b)**. Seller apne product aur trade ki zaroorat jaanta hai, aur seema se upar rok ki jagah normal daam se kharidaar ka kaam bhi nahi rukta.
- **Trade-off:**
  - (a) sabse saral, par aage bechna tab pakda jaata hai jab nuksaan ho chuka.
  - (b) me cart me daam ka hisaab do tarah (Pro aur normal), batch wale hisson (D-064) ke saath milke thoda pecheeda; aur seller ko seema ka form.
  - (c) saare products pe ek number: kahin bahut kam, kahin bahut zyada.
- **Owner ka jawab (2026-11-18):** **(b)**, seller tay kare, 3 niyam. Record: [DECISIONS.md](DECISIONS.md) D-070.

### Q-012. Seller ka payout fees se kam pade to bachi fee ka kya ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** kisi seller ki fees (commission, storage fee D-066, disposal fee D-062, wapsi ka kharcha) uski bikri se zyada ho jaayein, jaise bikri hi na ho, to jo fee bachi (seller pe udhaar) uska kya ho?
- **Kyun zaroori:**
  - D-066 ki storage fee bikri na hone pe bhi lagti hai, to kam bikne wale seller pe udhaar banna aam baat hai.
  - Koi niyam na ho to udhaar badhta rehta hai aur aakhir me hamara nuksaan. Bahut sakht niyam ho to chhote brands judte hi nahi.
  - Isi se tay hota hai ki seller ke hisaab me "minus" balance kaise chale, aur seller ko kab kya notice jaaye.
- **Vikalp:**
  - **(a) Udhaar aage chale:** agle payouts se kat-ta rahe, aur kuch nahi.
  - **(b) Udhaar aage chale, seema ke baad kadam:**
    1. Udhaar agle payout se pehle kat-ta hai.
    2. Udhaar tay rakam ya tay din (misaal ₹5,000 ya 60 din; number B6 ki charcha me) se zyada ho to seller ko alert, aur payment link se chukane ka mauka (test mode, D-026).
    3. Phir bhi na chukaye to notice ke baad naya maal bhejna band aur seller ki listings ruk jaati hain.
    4. Lambe samay tak na chukaye to account band, aur maal brand ke kharche pe wapas (D-062 jaisa); wapsi ka kharcha bhi udhaar me.
    5. Har kadam ka record aur seller ko notice.
  - **(c) Security deposit:** seller judte waqt deposit de, udhaar usse kate.
- **Salah:** **(b)**. Chhote brand pe pehle din se bojh nahi (deposit nahi), aur udhaar ek seema se aage nahi badhta.
- **Trade-off:**
  - (a) sabse saral, par udhaar badhta reh sakta hai, aur hamara nuksaan.
  - (b) me kadam ka flow: alert, payment link, listings rokna, account band.
  - (c) brands ke liye judne me rukawat, aur deposit ka paisa sambhalna aur wapas karna.
- **Kanooni detail jaanchi nahi** (R-004): seller pe udhaar ki vasooli ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, udhaar aage chale, seema ke baad kadam (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-071.

### Q-013. Customer kahe parcel nahi mila, par delivery partner ne "delivered" kiya: kaun sahi?

- **Status:** `Tay`. Topic: B11 (support aur disputes), B1 (delivery).
- **Sawal:** order app me "delivered" dikhta hai, par customer kehta hai use parcel mila hi nahi. Kaun sahi hai, aur ye kaise tay ho?
- **Kyun zaroori:**
  - Dono taraf dhokha ho sakta hai: customer jhooth bol ke dobara maal ya refund le, ya delivery partner parcel rakh le aur "delivered" kar de. D-068 me partner se vasooli sirf saboot pe hai, to saboot delivery ke waqt hi ikattha hona chahiye.
  - R1 me Delivery app se delivery ka saboot pehle se tay hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); ye sawal tay karta hai ki saboot kya ho aur jhagde me uska kya istemaal.
- **Vikalp:**
  - **(a) Partner ka "delivered" hi sach:** customer support se shikayat kare, staff apne hisaab se dekhe; koi pakka saboot nahi.
  - **(b) Delivery pe saboot, phir saboot se faisla:**
    1. **Delivery code:** har order ka ek code customer ke app aur email me. Delivery pe partner wo code Delivery app me daalta hai; sahi code = delivery pakki.
    2. **Code na mile** (customer ghar pe nahi, koi aur le raha): parcel ki photo aur delivery ke waqt partner ki location ka record.
    3. **Daawa:** customer tay samay me (misaal 48 ghante) daawa kare. Code se delivered: daawa nahi maana jaata. Sirf photo aur location: staff jaanch karta hai. Koi saboot nahi: customer ko refund ya dobara maal, aur D-068 ke hisaab se partner ki jaanch.
    4. **Record:** baar-baar daawa karne wale customer aur baar-baar aise maamle wale partner, dono ka record aur staff ko report.
  - **(c) Customer hamesha sahi:** daawa aate hi refund.
- **Salah:** **(b)**. Saboot delivery ke waqt hi ban jaata hai, to jhagde me faisla andaaze se nahi, saboot se hota hai, aur D-068 ki vasooli bhi saboot pe tik paati hai.
- **Trade-off:**
  - (a) saral, par faisla andaaze pe: kabhi customer ke saath, kabhi partner ke saath na-insaafi.
  - (b) me delivery pe ek kadam (code), photo aur location ka record (personal data, Security Architect ke saath, B14), aur daawe ki jaanch ka flow.
  - (c) customer ke liye achha, par jhooth bol ke refund lena aasaan.
- **Kanooni detail jaanchi nahi** (R-004): photo aur location jaise personal data rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, delivery pe saboot, phir saboot se faisla (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-072.

### Q-014. Pehle ka kaam (purana code aur purane docs) kab aur kaise hatega?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha), B15 (technical).
- **Sawal:** D-003 kehta hai pehle ka kaam sirf reference hai aur aage hat jayega. Wo repo se kab hate, aur kaise?
- **Kyun zaroori:**
  - Jab tak pada hai, repo bhaari hai aur galti se purane ko sach maan lene ka khatra rehta hai (D-003 ki wajah yahi thi).
  - Abhi koi npm command nahi chalta aur pull request pe CI fail hota hai (D-003 ka asar), kyunki root setup purane hisse pe tika hai. Ye naye root setup se hi theek hoga.
  - Par abhi iski zaroorat bhi hai: Agent 2 (domain expert) aur Security Architect purane analysis aur audit se gaps dekh sakte hain.
  - Hatana working tree se hota hai; git history me sab rehta hai, to zaroorat pe wapas dekha ja sakta hai.
- **Vikalp:**
  - **(a) Abhi hatao:** ek commit me sab purana hatao; reference chahiye to git history se.
  - **(b) Do kadam me, zaroorat khatam hone pe:**
    1. Hatane se pehle ek git tag, taaki pura purana kaam ek command se mil sake.
    2. Purane docs: discovery khatam hone pe (Agent 2 aur Security Architect ke baad, planning stage shuru hone se pehle).
    3. Purana code: naya root setup (`package.json`, lint, CI) banne ke saath, implementation stage ka pehla kaam.
    4. Dono baar hatana owner ki haan se (destructive kaam), aur naye docs me iska koi zikr nahi (D-003).
  - **(c) Kabhi na hatao:** reference ke liye hamesha repo me rahe.
- **Salah:** **(b)**. Har hissa tab hatta hai jab uski zaroorat khatam hoti hai: purane docs discovery tak kaam aate hain, aur purana code naye root setup tak hi rukawat hai. Tag se kuch khota nahi.
- **Trade-off:**
  - (a) repo turant saaf, par agents ko purana analysis git history se nikaalna padega; aur npm aur CI tab bhi naye root setup tak nahi chalenge.
  - (b) me do baar ka kaam, aur tab tak repo me purana aur naya dono.
  - (c) me hamesha confusion ka khatra aur bhaari repo: D-003 ke khilaaf.
- **Owner ka jawab (2026-11-18):** **(b)**, do kadam me (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-073.

### Q-015. Pehle ke kaam se kya naye me aaye, aur uski list kab aur kaise bane?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha), B15 (technical).
- **Sawal:** pehle ke kaam ki kaunsi cheezein (jaise achhe patterns, design ke tokens) naye me laani hain, aur uski list kab aur kaise bane?
- **Kyun zaroori:**
  - D-003 kehta hai pehle ke kaam me jo theek tha wo owner ki haan se naye me aata hai, par ye tay nahi ki kaunsi cheez kis kasauti pe, kab aur kaise.
  - D-073 ke hisaab se purane docs discovery ke aakhir me aur purana code naye root setup ke saath hatenge. Jo lena hai wo usse pehle naye docs me aa jana chahiye, warna git tag se khodna padega.
  - Repo analysis (pehla agent) me lagbhag 15 cheezon ki shuruaati list pehle se hai: jaise route contracts, transactions, idempotency, session model, audit, India ke helpers (GSTIN, PAN, paise ka hisaab), design system ki neev, test ke niyam. Bina tareeke ke ya to cheezein bina parkhe aa jayengi (D-003 ke khilaaf) ya achhi cheezein chhoot jayengi.
  - Naye docs me purane kaam ka zikr nahi hota (D-003), to lene ka tareeka aisa ho ki har naya doc khud me poora rahe.
- **Vikalp:**
  - **(a) Koi list nahi:** agents aur Claude pehla kaam padh ke jo achha lage wo seedha apne sawal ya salah me laayen; kya dekha aur kya chhoda, iska koi record nahi.
  - **(b) Chalti list, discovery ke saath:**
    1. **Shuruaat:** repo analysis ki shuruaati list.
    2. **Har agent (2 se 10):** apni report me ek hissa: apne area me pehle ke kaam se kya lene layak, kyun, aur naye docs me kahan jayega.
    3. **Kasauti:** cheez kisi pakki zaroorat ko hal kare, kisi tay faisle (D-xxx) se na takraye, aur naye doc me naye vakya me likhi ja sake.
    4. **Owner ki haan:** har cheez apne area ke sawalon ke saath, ek-ek karke. Haan ho to sahi naye doc me naye vakya me (zaroorat ho to D-xxx), bina purane kaam ke zikr ke; design tokens jaise values bhi poori naye doc me. Naya code naye doc se banta hai, purane code se copy nahi.
    5. **Aakhri jaanch:** discovery ke aakhir me, purane docs hatne se pehle (D-073 niyam 2), Claude dekhe ki list ki har cheez ya to naye doc me hai ya chhodi gayi; kuch bacha ho to owner se.
  - **(c) Alag agent, abhi:** Agent 2 se pehle ek agent poore pehle ke kaam ko dekh ke poori list ek baar me de; owner ek baar me faisla kare.
  - **(d) Planning stage me:** owner ke saath planning me ek baar list.
- **Salah:** **(b)**. Har cheez tab parkhi jaati hai jab uska area tay ho raha ho (jaise transactions Database Architect ke saath, tokens UX ke saath), alag agent ka kharcha nahi, aur discovery ke aakhir ki jaanch se kuch chhootta nahi.
- **Trade-off:**
  - (a) saral, par koi record nahi: achhi cheez chhoot sakti hai, ya bina kasauti ke aa sakti hai.
  - (b) me har agent ki report thodi lambi, aur discovery ke aakhir me ek jaanch ka kaam.
  - (c) poori list jaldi aur ek jagah, par ek aur agent run (lagbhag ek 5-hour window, R-003), aur kai cheezein (jaise events aur transactions) architecture aur database ke faislon se pehle parkhi jayengi, to dobara dekhni padengi.
  - (d) me abhi koi kaam nahi, par tab tak purane docs hat chuke honge (D-073) aur architecture aur design ke docs ban chuke honge: cheezein der se aur git tag se aayengi.
- **Kanooni detail jaanchi nahi** (R-004): pehle ke kaam ka koi bahar ka asset (font, icon, image) naye me aaye to uska license.
- **Owner ka jawab (2026-11-18):** **(b)**, chalti list discovery ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-074.

### Q-016. Ek brand ka maal ek se zyada sellers bechna chahein to kaun beche?

- **Status:** `Tay`. Topic: B3 (catalog), B2 (seller ki jaanch).
- **Sawal:** D-030 me har product ka ek hi seller hai, aur D-032 me brand owner aur authorised distributor dono seller ban sakte hain. Agar ek brand ka maal brand khud bhi bechna chahe aur uska distributor bhi, ya do distributors, to kaun bechega?
- **Kyun zaroori:**
  - Ye seller onboarding aur catalog ki neev hai: staff ki jaanch me "ye seller is brand ka maal bech sakta hai ya nahi" ka niyam isi se banta hai.
  - Ek product ki do listings hon to search, reviews aur stock bat jaate hain, aur customer confuse hota hai. D-030 product ke star pe ek seller kehta hai, par brand ke star pe koi niyam nahi.
  - R1 me sirf 2 sellers hain, alag brands ke ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), to takrav nahi hoga; par niyam aur jaanch ka design pehle din se chahiye (production-grade).
- **Vikalp:**
  - **(a) Ek brand, ek seller (brand ko pehla haq):**
    1. Poore platform pe ek brand ka ek hi seller: brand khud, ya brand ka ek authorised distributor.
    2. Distributor ke liye brand ka authorisation letter (dummy, D-026) aur staff ki jaanch.
    3. Brand khud aana chahe aur distributor pehle se ho: distributor ko notice, aur tay din (misaal 30 din) baad brand seller ban jaata hai. Product page aur reviews wahi rehte hain, sirf seller badalta hai. Distributor ka bacha maal uske kharche pe wapas (D-062 niyam 5 jaisa).
    4. Jaanch pe barcode se duplicate check: wahi barcode kisi aur seller ke paas ho to nayi listing rukti hai.
    5. Apna brand (D-031) bhi isi niyam me.
  - **(b) Ek product, ek seller, pehle aane wala:** har product (barcode) ka ek seller, jo pehle manzoor hua. Ek brand ke alag products alag sellers ke paas ho sakte hain.
  - **(c) Ek product, ek seller, brand tay kare:** brand tay kare ki uske kaunse products kis authorised seller ke paas hon; har product ka phir bhi ek hi seller.
- **Salah:** **(a)**. Brand ki authorisation ek hi baar jaanchni padti hai, brand ka saara maal aur reviews ek seller ke paas rehte hain, aur "kis seller ka kaunsa maal" ka jhagda nahi hota. Pehla haq brand ko, kyunki maal aur naam brand ka hai.
- **Trade-off:**
  - (a) me distributor chhod de to brand ke products naya seller aane tak band rehte hain. Naya state khulne pe (D-037) brand ka wahan ka distributor alag ho to wo nahi aa sakta; tab ye niyam D-030 ke saath dobara dekhna padega.
  - (b) me ek brand ke products alag sellers me bat sakte hain: brand ka control kam, aur "pehle aaya" se galat seller ko haq mil sakta hai.
  - (c) me har product pe brand ki marzi ki jaanch se staff ka kaam zyada; aur brand khud platform pe na ho to ye kaun tay kare, ye saaf nahi.
- **Kanooni detail jaanchi nahi** (R-004): brand authorisation aur trademark ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, ek brand ka ek seller, brand ko pehla haq (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-075.

### Q-017. Ek product ke variants kin cheezon se banen, aur ye kaun tay kare?

- **Status:** `Tay`. Topic: B3 (catalog).
- **Sawal:** ek product ke variants kin cheezon se banen (shade, size, scent ...), aur ye kaun tay kare: platform ya seller?
- **Kyun zaroori:**
  - R1 ke catalog me shade aur size jaise variants hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Har variant ka apna MRP, batch, stock aur expiry hota hai (D-064, D-067); search, filters aur reviews bhi isi pe tikte hain.
  - Galat dhaancha baad me badalna mehenga hai: stock, orders aur reviews ka data bhi badalna padta hai.
  - Cosmetics me ek naam ke product me do tarah ka farak hota hai: sirf rang ya maatra (variant), ya formula hi alag (jaise SPF 30 aur SPF 50), jiske ingredients aur claims alag hote hain.
- **Vikalp:**
  - **(a) Do tay cheezein, sab products pe:** shade aur size.
  - **(b) Category ke hisaab se, platform tay kare:**
    1. Har category ki variant wali cheezein platform tay kare (misaal: makeup me shade aur size; skincare me size; fragrance me size; hair colour me shade; bath & body me scent aur size).
    2. Seller sirf us category ki di hui cheezein chune; ek product pe zyada se zyada 2.
    3. Nayi cheez staff setting se jode, bina code change ya deploy.
    4. Jo farak formula badalta hai (jaise matte ya dewy finish, SPF 30 ya SPF 50, EDT ya EDP) wo alag product hai, variant nahi.
    5. Rating aur reviews product pe (saare variants ke saath), par har review pe uska variant (jaise shade) dikhe.
    6. "Pack of 2" jaisa variant nahi: wo bundle (promotions ki charcha, B4) ya brand ka alag product.
  - **(c) Seller apni marzi ki cheezein banaye.**
- **Salah:** **(b)**. Har category ke products sahi dhang se fit hote hain, filters aur search ek jaise naam se chalte hain, aur formula ka farak alag product banne se ingredients aur claims sahi product pe rehte hain.
- **Trade-off:**
  - (a) saral, par bath & body (scent) aur tools jaise products fit nahi hote.
  - (b) me har category ki list sambhalna staff ka kaam hai, aur kabhi seller ki zaroorat list me na ho to staff ko jodna padta hai.
  - (c) seller ke liye aasaan, par ek hi cheez ke alag naam se filters aur search bigadte hain, aur staff ki jaanch mushkil hoti hai.
- **Owner ka jawab (2026-11-18):** **(b)**, category ke hisaab se platform tay kare (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-076.

### Q-018. Ek order me kai sellers ka maal: ek parcel ya alag-alag, aur order ka dhaancha kya ho?

- **Status:** `Tay`. Topic: B5 (order model), B1 (delivery).
- **Sawal:** ek order me do ya zyada sellers ke items hon (D-030), to customer ko ek parcel mile ya har seller ka alag? Aur order ke andar invoice aur parcel kaise judein?
- **Kyun zaroori:**
  - Invoice har seller ke GSTIN se banta hai (D-030), to ek order ke andar "seller ka hissa" pehle se hai. Parcel kitne hon, isse delivery ka kharcha, delivery code (D-072), wapsi aur return tay hote hain.
  - Saara maal ek hi warehouse me hai (D-014), to alag sellers ka maal ek saath pack ho sakta hai; parcel seller ke hisaab se baantna zaroori nahi.
  - R1 me ek order me dono sellers ke items ho sakte hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), to ye R1 ka sawal hai.
- **Vikalp:**
  - **(a) Ek order, hamesha ek parcel:** andar har seller ka alag invoice; ek delivery code (D-072 jaisa).
  - **(b) Har seller ka alag parcel:** har parcel ka alag delivery code aur alag tracking.
  - **(c) Normal ek parcel, majboori me alag:**
    1. Customer ko ek order number. Order ke andar do alag cheezein: seller ke hisse (invoice ke liye) aur parcel (delivery ke liye); dono ek doosre se bandhe nahi.
    2. Normal: poora order ek parcel me, andar har seller ka invoice.
    3. Alag parcel sirf majboori me: size ya wazan ki seema (misaal 5 kg) paar ho, ya koi item baaki ke saath tayyar na ho, taaki baaki maal na ruke.
    4. Har parcel ka apna delivery code (D-072 niyam 1 me jod: alag parcel ho to code parcel ka).
    5. Customer ko order page pe dikhe: kitne parcel, aur kaunsa item kis parcel me.
- **Salah:** **(c)**. Customer ko aam taur pe ek hi delivery milti hai, delivery ka kharcha kam rehta hai, aur bhaari ya adhoora order bhi sambhal jaata hai. Invoice aur parcel alag rakhne se ek ki wajah se doosra nahi badalna padta.
- **Trade-off:**
  - (a) sabse saral aur sasta, par bada ya bhaari order ek parcel me nahi samata, aur ek item ruke to poora order rukta hai.
  - (b) me delivery ka kharcha aur partners ka kaam sellers ki ginti se badhta hai, aur customer ko kai baar ghar pe rehna padta hai.
  - (c) me order ka dhaancha thoda zyada (hisse aur parcel alag), aur D-072 ke code me ek line ka jod.
- **Kanooni detail jaanchi nahi** (R-004): ek parcel me kai sellers ke invoices bhejne ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, normal ek parcel, majboori me alag (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-077.

### Q-019. Seller se kaunsi fees li jaayen, aur commission kis rakam pe lage?

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** platform seller se kaunsi fees le, aur commission item ke daam (GST samet) pe lage ya taxable value (GST ke bina) pe? Yahan sirf fees ki kisme aur aadhaar, rakam nahi.
- **Kyun zaroori:**
  - Hum maal nahi khareedte; rakhne, pack karne aur pahunchane ke liye fees lete hain (D-060). R1 me har seller ka hisaab hai: order value, commission, GST TCS aur income-tax TDS ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
  - Pehle ke faisle fees ki list pe tike hain: storage fee (D-066), disposal fee (D-062), bharpai me commission aur fees ghatana (D-063), aur bachi fee ka udhaar (D-071).
  - Commission ka aadhaar seller ki kamaai aur platform ka GST hisaab, dono badalta hai.
- **Vikalp:**
  - **(a) Sirf commission:** category ke hisaab se %; rakhna, pack aur delivery usi me. Storage (D-066) aur disposal (D-062) alag.
  - **(b) Commission + fulfilment fee:**
    1. Category ke hisaab se % commission.
    2. Har unit pe tay fulfilment fee (misaal ₹25): rakhne, pack aur delivery ka kharcha.
    3. Saath me storage fee (D-066), disposal fee (D-062) aur wapsi ka kharcha, jaise pehle tay.
    4. Aage ki fees (jaise labelling ya return handling) ka dhaancha bane, par shuru me ₹0.
  - **(c) (b) + shuru se aur fees:** labelling fee, return handling fee, aur maal bhejne ki suchna se farak pe penalty.
  - **Commission ka aadhaar** (har vikalp ke saath): **(i)** item ka daam GST samet, ya **(ii)** taxable value (GST ke bina).
- **Salah:** **(b)** aur aadhaar **(ii)**. Fulfilment fee asli kaam ka kharcha dikhati hai (sasta product bhi utna hi pack hota hai), aur GST ke bina aadhaar seller ke liye seedha hai: GST rate badle to commission nahi badalta. Platform ki fees pe platform ka GST alag line me.
- **Trade-off:**
  - (a) sabse saral, par sasta product platform ke liye nuksaan ka, kyunki pack aur delivery ka kharcha utna hi hai.
  - (b) me do tarah ki fees samjhani padti hain, aur seller ka hisaab thoda lamba.
  - (c) chhote brand ke liye shuru me ulajhan aur bojh.
  - Aadhaar (i) seller ko saral dikhta hai, par GST pe bhi commission lagta hai (seller ke liye mehenga), aur GST rate badle to commission bhi badal jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): commission aur fees pe GST, aur platform ka seller ko fees ka invoice.
- **Owner ka jawab (2026-11-18):** **(b)** aur aadhaar **(ii)**: commission + fulfilment fee, commission GST ke bina wali rakam pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-078.

### Q-020. Customer kin wajahon se return kar sake, aur "band" maal ka matlab kya ho?

- **Status:** `Tay`. Topic: B7 (returns).
- **Sawal:** kin wajahon pe return maana jaaye? Kya "man badla" bhi chale, aur chale to kis shart pe? R1 ka niyam "sirf band ya kharab maal" hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), par "band" ka matlab tay nahi.
- **Kyun zaroori:**
  - Khula cosmetic dobara nahi bik sakta (hygiene), to galat niyam se ya to customer ke saath na-insaafi hoti hai, ya khula maal nasht hota hai.
  - R1 ka return flow isi list pe chalta hai; return ki samay-seema, return ka kharcha aur lauta maal kahan jaaye, ye bhi isi pe tikte hain.
  - Kuch products pe factory seal aata hi nahi (jaise kai compacts aur lip balms); unke liye niyam alag chahiye.
- **Vikalp:**
  - **(a) Sirf hamari ya brand ki galti:** transit me toota ya leak, pighla, galat item ya galat shade ya size, item kam, dikhayi gayi se pehle ki expiry (D-067), kharab (jaise pump nahi chalta), ya nakli hone ka shak (staff jaanch). "Man badla" bilkul nahi.
  - **(b) (a) + man badla, sirf band maal pe:**
    1. (a) ki saari wajahein.
    2. "Band" = factory seal ya shrink wrap salamat, aur maal istemaal nahi hua.
    3. Listing pe seller batata hai ki product pe aisa seal aata hai ya nahi; staff listing ki jaanch me ise dekhta hai.
    4. Jis product pe seal aata hi nahi, us pe "man badla" return nahi (hygiene); galti wali wajahein phir bhi chalti hain.
    5. Khula maal jisme koi galti nahi: return nahi. Skin reaction ki shikayat ka raasta alag sawal hai.
  - **(c) (b) + kuch khula maal bhi:** jaise foundation ka shade galat laga to thoda istemaal kiya maal bhi wapas ("shade guarantee").
- **Salah:** **(b)**. R1 ka "band ya kharab" isi ka saaf roop hai, aur listing ka seal wala field ek hi baar me hygiene ka sawal hal karta hai.
- **Trade-off:**
  - (a) customer ke liye kadi: jo maal khola hi nahi, wo bhi wapas nahi hota.
  - (b) me pickup aur warehouse pe seal ki jaanch, aur listing me ek naya field.
  - (c) customer ke liye sabse achha, par khula maal nasht hota hai: nuksaan bada, aur galat istemaal aasaan.
- **Kanooni detail jaanchi nahi** (R-004): return policy dikhane ke niyam, aur khule cosmetics pe "no return" ki shartein.
- **Owner ka jawab (2026-11-18):** **(b)**, galti wali saari wajahein, aur "man badla" sirf band maal pe (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-079.

### Q-021. Return kitne din tak maanga ja sake?

- **Status:** `Tay`. Topic: B7 (returns), B6 (settlement).
- **Sawal:** delivery ke kitne din tak customer return maang sake? Sab wajahon pe ek hi samay, ya wajah ke hisaab se alag (D-079 ki wajahein)?
- **Kyun zaroori:**
  - Transit me toota ya item kam ka daawa jitna jaldi aaye, saboot utna sach hota hai; der se aaye daawe me ye pata karna mushkil hai ki nuksaan kahan hua.
  - Return ki samay-seema seller ke payable pe asar daalti hai: jitni lambi seema, utni der seller ka paisa ruk sakta hai.
  - "Parcel nahi mila" ke daawe ka samay pehle se misaal 48 ghante hai (D-072); baaki wajahon ka samay tay nahi.
- **Vikalp:**
  - **(a) Sab wajahon pe ek hi samay:** 7 din.
  - **(b) Wajah ke hisaab se:**
    1. Dikhne wali galti (toota, leak, pighla, item kam, galat item ya shade ya size): delivery ke 48 ghante tak (misaal), D-072 ke daawe jaisa.
    2. Kharab maal (jaise pump nahi chalta) aur dikhayi gayi se pehle ki expiry: 7 din tak (misaal).
    3. Man badla (sirf band maal, D-079): 7 din tak (misaal).
    4. Nakli hone ka shak: 7 din tak (misaal), staff ki jaanch ke saath.
    5. Samay-seema ke baad kisi batch me dikkat nikle to recall ka raasta (alag sawal).
  - **(c) Sab wajahon pe 15 din.**
- **Salah:** **(b)**. Dikhne wali galti jaldi pakdi jaati hai, to saboot sach rehta hai; baaki wajahon me customer ko poora mauka milta hai, aur seller ka paisa bahut der nahi rukta.
- **Trade-off:**
  - (a) saral, par transit ki galti ka daawa 7 din baad tak aa sakta hai, jab saboot kamzor hota hai.
  - (b) me alag-alag samay customer ko samjhane padte hain; product page aur order page pe saaf dikhna chahiye.
  - (c) customer ke liye achha, par seller ka paisa der tak rukta hai aur daawe ka saboot kamzor hota hai.
- **Kanooni detail jaanchi nahi** (R-004): return ki kam se kam samay-seema ke niyam (agar koi ho), aur kharab maal pe customer ke haq.
- **Owner ka jawab (2026-11-18):** **(b)**, wajah ke hisaab se alag samay (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-080.

### Q-022. Seller ka paisa kab payable ho, aur payout kitni baar ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** bikri ka paisa seller ke liye kab "payable" (dene layak) ho, aur payout kitni baar ho? R1 me payout haath se "paid" mark hota hai, asli bank transfer nahi ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Kyun zaroori:**
  - Delivery ke baad return aa sakte hain (D-080). Paisa pehle de diya aur return aaya, to wo rakam seller pe udhaar banti hai (D-071).
  - Bharpai (D-063 niyam 3) aur bachi fee ka kaatna (D-071 niyam 1) "agle payout" pe tike hain, aur D-063 ne payout ka cycle settlement ki charcha pe chhoda tha.
  - Chhote brand ke liye paisa kitni jaldi aata hai, ye judne ki ek badi wajah hai.
- **Vikalp:**
  - **(a) Delivery ke din se payable, har hafte payout:** baad ke returns agle payouts se kat-te hain.
  - **(b) Return ki samay-seema ke baad payable, har hafte payout:**
    1. Ek line tab payable hoti hai jab uski sabse lambi return samay-seema (D-080, misaal 7 din) khatam ho aur us pe koi return khula na ho.
    2. Payout hafte me ek baar (misaal har Monday), pichhle hafte tak jo payable hua.
    3. Payout me se pehle udhaar (D-071) aur fees (D-078) kat-ti hain, aur bharpai (D-063) judti hai.
    4. Kam se kam payout rakam (misaal ₹100); usse kam ho to agle hafte me judti hai.
    5. Seller ko har line ki halat dikhe: kab payable hogi, aur kis payout me gayi.
  - **(c) (b) jaisa, par mahine me do baar payout.**
- **Salah:** **(b)**. Return ka khatra khatam hone ke baad hi paisa jaata hai, to returns se udhaar kam banta hai, aur hafte ka payout chhote brand ke liye bahut lamba intezaar nahi.
- **Trade-off:**
  - (a) seller ko paisa sabse jaldi, par har return pe udhaar ka khatra, aur D-071 ke kadam zyada baar.
  - (b) me paisa delivery ke lagbhag 1 se 2 hafte baad aata hai.
  - (c) me payout ka kaam kam, par chhote brand ke liye lamba intezaar.
- **Kanooni detail jaanchi nahi** (R-004): marketplace pe seller ko payment ki samay-seema ke niyam (agar koi ho), aur payout pe GST TCS aur income-tax TDS kaatne ka samay.
- **Owner ka jawab (2026-11-18):** **(b)**, return ki samay-seema ke baad payable, hafte me ek payout (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-081.

### Q-023. Expiry ki seemaon ke number kya hon, aur sab products pe ek jaise ya category ke hisaab se?

- **Status:** `Tay`. Topic: B3 (catalog: batch aur expiry).
- **Sawal:** D-062 ki seemaon ke number kya hon: (1) receiving pe batch ki kam se kam bachi expiry, (2) bikri band hone ki seema, aur (3) bikri band ke baad brand ke jawab ke din? Aur ye sab products pe ek jaise hon ya category ke hisaab se?
- **Kyun zaroori:**
  - D-062 ne niyam tay kiye, par number nahi. R1 me receiving pe batch aur expiry ki jaanch (D-014) aur product page ki expiry (D-067) inhi numbers pe chalti hai.
  - Customer ke paas product khatam karne ka samay hona chahiye: serum aksar 2 se 3 mahine me, aur foundation 6 se 12 mahine me khatam hota hai.
  - Kuch products ki kul shelf life hi chhoti hoti hai (jaise kuch natural products, misaal 12 mahine); sab pe ek kadi seema unhe platform se bahar kar sakti hai.
- **Vikalp:**
  - **(a) Sab pe ek:** receiving pe kam se kam 6 mahine bachi (misaal), bikri band jab 3 mahine se kam (misaal), aur brand ka jawab 15 din (misaal).
  - **(b) Ek default + category ka override:**
    1. Default: receiving pe kam se kam 6 mahine bachi, aur bikri band jab 3 mahine se kam (misaal).
    2. Category ka override setting se, bina code change ya deploy (misaal: sunscreen aur actives jaise vitamin C serum 9 / 4 mahine; chhoti shelf life wale natural products 4 / 2 mahine).
    3. Brand ke jawab ke din sab pe ek (misaal 15 din).
    4. R1 me sirf default bhi chal sakta hai, par override ki setting pehle din se.
  - **(c) Shelf life ke % se:** receiving pe kul shelf life ka kam se kam 50% bacha (misaal), bikri band jab 15% se kam (misaal), saath me kam se kam 3 mahine.
- **Salah:** **(b)**. Samajhna aasaan hai, aur categories ka farak sambhal jaata hai.
- **Trade-off:**
  - (a) saral, par chhoti shelf life wale products ke liye kadi seema.
  - (b) me category ki values staff ko sambhalni padti hain.
  - (c) har product pe sahi baithta hai, par har batch pe kul shelf life (bani hone ki tareekh se expiry tak) chahiye, jo pack pe hamesha saaf nahi hoti.
- **Kanooni detail jaanchi nahi** (R-004): expiry ke kareeb ya expired cosmetics bechne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, ek default + category ka override (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-082.

### Q-024. Pack pe expiry date na ho to us maal ka kya ho?

- **Status:** `Tay`. Topic: B3 (catalog: batch aur expiry).
- **Sawal:** kuch packs pe expiry date nahi hoti: sirf bani hone ki tareekh (mfg date) aur "itne mahine me istemaal karein" likha hota hai, ya sirf PAO nishaan (khulne ke baad kitne mahine chale, jaise "12M"). Aise maal ka kya ho?
- **Kyun zaroori:**
  - Expiry pe kai faisle tike hain: bikri band ki seema (D-062, D-082), sabse pehle expire hone wala pehle (D-062 niyam 2), batch ka MRP (D-064), aur product page pe expiry (D-067). Expiry na ho to ye sab toot-te hain.
  - Receiving pe staff ko pata hona chahiye ki aisa maal le ya lautaye (D-014).
- **Vikalp:**
  - **(a) Sirf chhapi expiry:** jis pack pe expiry (ya "use before") date nahi, wo receiving pe wapas.
  - **(b) Expiry, ya mfg date + shelf life:**
    1. Pack pe expiry ho to wahi.
    2. Expiry na ho par mfg date aur shelf life (mahine) chhapi ho, to system expiry nikale (mfg date + shelf life); staff receiving pe pack se jaanche.
    3. Sirf PAO wala (na expiry, na shelf life): receiving pe wapas.
    4. PAO ek alag field: product page pe customer ki jaankari ke liye, par expiry ka badal nahi.
  - **(c) Sirf PAO bhi chale:** expiry = mfg date + tay mahine (misaal 30 mahine) maan ke.
- **Salah:** **(b)**. Expiry hamesha pack ki chhapi jaankari se aati hai, andaaze se nahi; aur sahi products (mfg date + shelf life wale) bahar nahi hote.
- **Trade-off:**
  - (a) saral, par kuch sahi products bhi bahar ho jaate hain.
  - (b) me staff ko pack dhyaan se padhna padta hai, aur nikali hui expiry ki jaanch karni padti hai.
  - (c) me andaaze ki expiry customer ko "exact" dikhegi, jo D-067 ke khilaaf hai.
- **Kanooni detail jaanchi nahi** (R-004): label pe expiry ya "use before" date ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, expiry ya mfg date + shelf life; sirf PAO wala maal wapas (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-083.

### Q-025. Seller aur listing ki jaanch kis daayre ka staff kare?

- **Status:** `Tay`. Topic: B2 (roles), B3 (catalog).
- **Sawal:** seller ki manzoori (dummy KYC aur warehouse wale state ka GSTIN, D-036) aur product listing ki jaanch kaun kare: poore desh ki ek team, ya state ke hisaab se alag staff?
- **Kyun zaroori:**
  - Products poore India me dikhte hain (D-035), aur seller ka state uske warehouse wale GSTIN se tay hota hai (D-036). Isi se staff ki permissions ka daayra, kaam ki queue aur appeal ka niyam banta hai.
  - R1 me seller aur catalog dono ki staff approval hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Vikalp:**
  - **(a) Dono poore desh ke:**
    1. Seller Ops (D-044) ki ek team saare sellers manzoor kare; har naye warehouse state ke GSTIN ki jaanch usi queue me alag kaam.
    2. Listing ki jaanch bhi ek team, kaam category ke hisaab se bata hua.
    3. Appeal: jisne reject kiya, wo us appeal ka faisla nahi karta.
  - **(b) Seller state ke hisaab se, listing poore desh ki:** seller ki manzoori warehouse wale state ka staff kare, listing ki jaanch ek team.
  - **(c) Dono state ke hisaab se.**
- **Salah:** **(a)**. Abhi ek hi warehouse state hai, aur ek product ek hi baar jaanchna chahiye, chahe wo kitne bhi states me bike.
- **Trade-off:**
  - (a) me states badhne pe ek team pe bojh badhta hai.
  - (b) me seller ko ek state ka staff aur doosre state ka GSTIN alag log jaanchte hain.
  - (c) me ek product kai baar jaanchna padta hai.
- **Owner ka jawab (2026-11-18):** **(a)**, dono jaanch poore desh ki team kare (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-084.

### Q-026. Shade wale variant pe seller kitni jaankari de?

- **Status:** `Tay`. Topic: B3 (catalog: shade).
- **Sawal:** shade wale variant (D-076) ke saath seller ko kya dena zaroori ho: sirf naam aur swatch photo, ya hex colour, undertone aur depth bhi?
- **Kyun zaroori:**
  - Online cosmetics me galat shade return ki sabse badi wajahon me se hai (D-079 me galat shade ek wajah hai).
  - R1 ka basic filter (shade family), aur aage shade finder aur try-on (R2, D-055) isi data pe tikte hain. Hazaron shades pe ye data baad me bharna mushkil hai.
- **Vikalp:**
  - **(a) Kam:** shade ka naam + swatch photo.
  - **(b) Beech ka:**
    1. Har shade pe naam + swatch photo + hex colour.
    2. Complexion products (foundation, concealer, compact, tinted moisturiser) pe undertone (warm, cool, neutral, olive) aur depth (misaal 6 star: fair, light, medium, tan, deep, very deep) bhi zaroori.
    3. Lip aur eye products pe shade family (jaise nude, pink, red, berry, brown).
    4. Finish, coverage aur alag skin tones pe photo optional.
    5. Staff jaanch me swatch aur hex ka mel moota-moota dekhe.
  - **(c) Poora:** (b) + finish, coverage aur har shade ki alag skin tones pe photo zaroori.
- **Salah:** **(b)**. Filter aur aage ka shade finder sahi data pe chalte hain, aur chhote brand pe bojh bahut zyada nahi.
- **Trade-off:**
  - (a) me filter aur shade finder kamzor rehte hain.
  - (b) me seller ka thoda zyada kaam.
  - (c) chhote brands ke liye rukawat.
- **Owner ka jawab (2026-11-18):** **(b)**, beech ka: naam, swatch aur hex; complexion pe undertone aur depth (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-085.

### Q-027. Product ka HSN code aur GST rate kaun tay kare?

- **Status:** `Tay`. Topic: B3 (catalog), B6 (tax).
- **Sawal:** har product ka HSN code aur GST rate seller bhare, ya platform tay kare?
- **Kyun zaroori:**
  - R1 catalog me HSN aur GST rate hain ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Invoice seller ke GSTIN se banta hai (D-030), yaani supplier seller hai.
  - MRP aur daam tax samet hain (D-061), to rate se hi GST ke bina wali rakam nikalti hai, jis pe commission lagta hai (D-078).
  - Sarkar rate kabhi bhi badal sakti hai (kisi tareekh se).
- **Vikalp:**
  - **(a) Seller dono bhare,** staff jaanche.
  - **(b) Platform ki HSN → rate table:**
    1. Table me har HSN ka rate tareekh ke saath (kis din se kaunsa rate).
    2. Seller category ke allowed HSN me se chune; rate table se aaye; staff jaanche.
    3. Rate badle to table me nayi line nayi tareekh se; us din se naye invoices naye rate pe.
    4. Rate badalne pe sellers ko alert ki apna daam dekh lein (daam platform nahi badalta, D-061).
    5. Sahi HSN ki zimmedari seller ki, kyunki supplier wahi hai.
  - **(c) Platform category se HSN khud lagaye;** seller na badal sake.
- **Salah:** **(b)**. Typo se galat tax nahi lagta, rate badalne ka ek hi jagah hisaab rehta hai, aur zimmedari sahi jagah (seller) rehti hai.
- **Trade-off:**
  - (a) me typo se galat tax aur galat invoice.
  - (b) me ek table sambhalni padti hai.
  - (c) me jis product ka HSN category se alag ho, wo atak jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke HSN aur rates, aur rate badalne pe MRP aur purane stock ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, platform ki HSN → rate table tareekh ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-086.

### Q-028. Daam ka kitna bada badlav ho to seller se dobara confirm maanga jaaye?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** D-061 niyam 3 me bade badlav pe seller se dobara confirm hai (misaal 50%). Asli seema kya ho?
- **Kyun zaroori:**
  - Daam neeche ki galti (₹1,999 ki jagah ₹199) me stock minton me bik jaata hai, aur nuksaan seller ka hota hai.
  - D-061 ne ye number pricing ki charcha pe chhoda tha.
- **Vikalp:**
  - **(a) 50% dono taraf.**
  - **(b) Alag-alag:** neeche 30% se zyada, ya upar 50% se zyada (misaal).
  - **(c) (b) + MRP ka check:**
    1. (b) ki dono seemaayein.
    2. Naya daam MRP ke 20% (misaal) se kam ho to hamesha confirm, chahe pichhla daam kuch bhi ho.
    3. Pro daam (D-065) pe bhi yahi niyam.
- **Salah:** **(c)**. Neeche ki galti zyada nuksaan wali hai, aur MRP wala check tab bhi pakadta hai jab pichhla daam bhi galat tha.
- **Trade-off:**
  - (a) sabse saral.
  - (b) me neeche ki galti jaldi pakdi jaati hai.
  - (c) me ek aur check; sach me bahut saste product pe seller ko har baar confirm karna padta hai.
- **Owner ka jawab (2026-11-18):** **(c)**, alag-alag seema + MRP ka check (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-087.

### Q-029. Kits aur combos kis roop me bikein?

- **Status:** `Tay`. Topic: B4 (bundles aur kits).
- **Sawal:** gift sets aur routine kits (jaise cleanser + toner + moisturiser) kis roop me bikein?
- **Kyun zaroori:**
  - Cosmetics me kits aur combos aam hain. Har cheez ka apna batch aur expiry hota hai (D-064, D-067), aur GST rate alag ho sakta hai.
  - D-076 me "pack of 2" variant nahi hai: wo bundle ya brand ka alag product hai.
- **Vikalp:**
  - **(a) Sirf brand ka pack kiya kit:** ek barcode, ek MRP, normal product jaisa. Kit ki expiry = sabse pehle expire hone wali cheez ki; kit ki cheezon ki list product page pe.
  - **(b) (a) + usi seller ka combo:**
    1. (a) wala kit R1 se hi, normal product ki tarah.
    2. Combo: "A + B saath me ₹X", sirf ek hi seller ke products ka.
    3. Stock har cheez se ghatta hai; combo ka daam cheezon me baanta jaata hai, aur invoice me har cheez ki line apne batch aur expiry ke saath.
    4. Combo poora lautta hai; ek cheez kharab nikle to sirf usi ka badla ya refund.
    5. Combo R2 se (promotions ke saath, D-055).
  - **(c) (b) + alag sellers ke products ka combo.**
- **Salah:** **(b)**. Brand ka kit R1 me bina naye kaam ke chal jaata hai, aur combo ek hi seller tak rehne se ek daam do invoices me nahi baantna padta.
- **Trade-off:**
  - (a) me combo ke liye seller ko naya barcode banana padta hai.
  - (b) me daam baantne aur stock ka hisaab.
  - (c) bahut bhaari: ek daam do invoices pe, aur return pe jhagda.
- **Kanooni detail jaanchi nahi** (R-004): kai cheezon ke set pe GST (mixed ya composite supply).
- **Owner ka jawab (2026-11-18):** **(b)**, brand ka kit + usi seller ka combo (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-088.

### Q-030. Kam expiry wale batch ke liye "short expiry" label ya alag section ho?

- **Status:** `Tay`. Topic: B4 (pricing), B3 (expiry).
- **Sawal:** jis batch ki expiry kareeb hai (bikri band se pehle, misaal 3 se 6 mahine bachi), uske liye "short expiry" label ya alag section ho?
- **Kyun zaroori:**
  - Product page pe exact expiry dikhti hai (D-067), to customer kareeb expiry wala batch chhod deta hai, aur brand ka nuksaan (D-062 ki wapsi ya nasht) badhta hai.
  - Platform daam nahi badalta (D-061 niyam 4), to koi bhi kadam brand ki marzi se hi ho sakta hai.
- **Vikalp:**
  - **(a) Kuch nahi:** brand chahe to khud daam ghataye.
  - **(b) Label + section:**
    1. Bachi expiry ek seema (misaal 6 mahine) se kam ho to apne aap "short expiry" label.
    2. Brand chahe to apne ghataye daam ke saath use "clearance" section me daale.
    3. Ek waqt me ek hi batch dikhta hai (D-064), to label tabhi aata hai jab wahi batch agla bhejne wala ho.
    4. R2 se (promotions ke saath, D-055).
  - **(c) Platform apne aap discount de:** D-061 niyam 4 se takrata hai.
- **Salah:** **(b)**. Customer ko saaf pata rehta hai, brand ko maal nikaalne ka raasta milta hai, aur daam phir bhi brand ka hi rehta hai.
- **Trade-off:**
  - (a) me nuksaan brand ka, aur disposal zyada.
  - (b) me label ka niyam aur ek naya section.
  - (c) tay faisle (D-061) se takrav.
- **Owner ka jawab (2026-11-18):** **(b)**, "short expiry" label + clearance section (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-089.

### Q-031. Pick pe reserved maal toota ya kam nikle to customer ka kya ho?

- **Status:** `Tay`. Topic: B5 (order), B1 (warehouse).
- **Sawal:** order ke baad warehouse me reserved batch ka unit toota nikle ya ginti kam ho, to customer ke order ka kya ho?
- **Kyun zaroori:**
  - Customer ko jo MRP (D-064 niyam 3) aur expiry (D-067) dikhi, wahi milni chahiye.
  - Warehouse me hua nuksaan hamara hai, aur uski bharpai seller ko D-063 se hoti hai.
- **Vikalp:**
  - **(a) Line cancel:** refund aur customer ko khabar.
  - **(b) Barabar ho to badal do, warna poochho:**
    1. Usi variant ka doosra batch ho jiska MRP wahi ho aur expiry dikhayi gayi se barabar ya baad ki, to bina pooche badal do.
    2. Warna customer se poochho (in-app, email aur browser push), jawab ke liye tay samay (misaal 12 ghante).
    3. Jawab na aaye to wo line cancel aur refund.
    4. Toote maal ki bharpai seller ko D-063 se apne aap.
  - **(c) Hamesha poochho.**
- **Salah:** **(b)**. Customer ka order bina zaroorat nahi toot-ta, aur jo use dikha tha usse kam kabhi nahi milta.
- **Trade-off:**
  - (a) me customer ka order bina zaroorat toot-ta hai.
  - (b) me ek "poochho" ka kadam aur uska samay.
  - (c) me har baar der.
- **Owner ka jawab (2026-11-18):** **(b)**, barabar ho to badal do, warna poochho (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-090.

### Q-032. Normal customer ek order me ek variant ki kitni quantity le sake?

- **Status:** `Tay`. Topic: B5 (cart aur checkout).
- **Sawal:** normal customer (Beauty Pro nahi) ek order me ek variant ki kitni quantity le sake?
- **Kyun zaroori:**
  - Sasta khareed ke aage bechna, aur ek customer ka poora stock le jaana, dono rokne hain. Pro buyer ke liye seema D-070 me hai, normal customer ke liye nahi.
- **Vikalp:**
  - **(a) Koi seema nahi.**
  - **(b) Platform ki default seema:** misaal 10 per variant per order; seller chahe to usse kam rakhe.
  - **(c) Seller tay kare,** platform ki koi default nahi.
- **Salah:** **(b)**. Har product pe ek seema rehti hai, aur seller apne product ke hisaab se use kam kar sakta hai.
- **Trade-off:**
  - (a) me ek order se stock khatam ho sakta hai.
  - (b) me bada kharidaar Beauty Pro (D-069) ki taraf jaata hai.
  - (c) me zyada products pe koi seema nahi rehti.
- **Owner ka jawab (2026-11-18):** **(b)**, platform ki default seema, seller usse kam rakh sake. Record: [DECISIONS.md](DECISIONS.md) D-091.

### Q-033. Normal customer bina Beauty Pro bane GSTIN wala invoice le sake?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (invoice).
- **Sawal:** koi normal customer (Pro nahi) checkout pe apna GSTIN daal ke business invoice le sake?
- **Kyun zaroori:**
  - Pro buyer ko GSTIN wala invoice milta hai (D-065, D-069). Companies gifting ke liye bhi kharidti hain, aur unhe Pro daam nahi, sirf sahi invoice chahiye.
- **Vikalp:**
  - **(a) Nahi,** sirf Pro buyer ko.
  - **(b) Haan:** GSTIN ka format check aur naam; Pro daam nahi; har seller ka invoice customer ke GSTIN ke saath. R2 se (Beauty Pro ke kaam bhi R2, D-055).
  - **(c) Haan, staff ki jaanch ke baad.**
- **Salah:** **(b)**. Business customer bina Pro bane sahi invoice le paata hai, aur format check se galat GSTIN ka jokhim kam rehta hai.
- **Trade-off:**
  - (a) me business customers bahar.
  - (b) me galat GSTIN ka thoda jokhim.
  - (c) me staff ka kaam aur der.
- **Kanooni detail jaanchi nahi** (R-004): B2B invoice aur us pe tax credit ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, haan, format check ke saath, R2 se. Record: [DECISIONS.md](DECISIONS.md) D-092.

### Q-034. Customer ka paisa kis khaate me aaye, aur sellers tak kaise pahunche?

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** customer ka payment (prepaid aur delivery pe UPI, D-034) kis khaate me aaye, aur sellers tak kaise pahunche?
- **Kyun zaroori:**
  - Isse ledger ka dhaancha, hisaab ka milaan aur payout ka tareeka tay hota hai. Payout ka samay D-081 me tay hai; ye sawal raasta tay karta hai.
- **Vikalp:**
  - **(a) Platform ka ek payment gateway account:** sab paisa platform ke Razorpay account me; finance me har seller ka hisaab; payout platform kare (R1 me haath se "paid", D-055). Design aisa ki baad me (b) pe jaane me sirf payout ka tareeka badle, hisaab nahi.
  - **(b) Payment pe hi baantna:** payment pakka hote hi har seller ke linked account me transfer, return ki samay-seema tak rok ke.
  - **(c) Har seller ka apna gateway:** ek checkout me sambhav nahi.
- **Salah:** **(a)**. R1 ke liye saral, aur baad me raasta badalna pade to hisaab wahi rehta hai.
- **Trade-off:**
  - (a) me platform ke paas sellers ka paisa rehta hai (zimmedari).
  - (b) me gateway ke linked accounts ka setup aur har seller ke bank ki jaanch.
  - (c) me customer ko ek order ke liye kai payment.
- **Kanooni detail jaanchi nahi** (R-004): marketplace ke liye payment aggregator aur sellers ka paisa rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, platform ka ek payment gateway account. Record: [DECISIONS.md](DECISIONS.md) D-093.

### Q-035. Seller ki fees ki shuruaati rakam (dummy) kya ho?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** D-078 ki fees (commission, fulfilment fee) aur D-066, D-062 ki fees ki shuruaati rakam kya ho? Business dummy hai, aur rakam baad me setting se badal sakti hai.
- **Kyun zaroori:**
  - R1 ke seller hisaab me asli jaise numbers chahiye. Storage fee ki rakam aur muft din (D-066) aur disposal fee (D-062) ab tak tay nahi.
- **Vikalp:**
  - **(a) Shuru se category ke hisaab se alag:** commission makeup 15%, skincare 12%, hair 10%, fragrance 8% (misaal); fulfilment fee ₹25 per unit; storage: receiving ke 90 din muft, phir ₹2 per unit per mahina, 180 din ke baad ₹4; disposal fee ₹10 per unit; wapsi ka kharcha asli.
  - **(b) Shuru me sab categories pe ek commission:** commission ka dhaancha category ka hi (D-078), par shuru me sab pe ek rakam (misaal 10%); baaki (a) jaisa. Category ki alag rakam baad me setting se.
  - **(c) Owner apni rakam de.**
- **Salah:** **(b)**. R1 me setup saral, aur category ki alag rakam baad me bina code change ke. Storage fee per unit (cosmetics chhote hote hain); volume ke hisaab se baad me.
- **Trade-off:**
  - (a) asli jaisa, par R1 me zyada setup.
  - (b) saral, par shuru me har category ka asli farak nahi dikhta.
  - (c) me owner ka samay lagta hai.
- **Owner ka jawab (2026-11-18):** **(b)**, shuru me sab categories pe ek commission (misaal rakam). Record: [DECISIONS.md](DECISIONS.md) D-094.

### Q-036. Customer ka chargeback jeete to nuksaan kiska?

- **Status:** `Tay`. Topic: B6 (payments).
- **Sawal:** customer bank se payment ka dispute (chargeback) jeete, to nuksaan kiska: platform ka ya seller ka?
- **Kyun zaroori:**
  - Asli payments me chargebacks aate hain; bina niyam ke har maamla jhagda banta hai. Test mode me chargebacks nahi aate, to ye R2 se (D-055).
- **Vikalp:**
  - **(a) Hamesha platform.**
  - **(b) Hamesha seller.**
  - **(c) Wajah ke hisaab se:**
    1. Product ki shikayat (galat ya kharab maal, brand ki galti): seller.
    2. Delivery ya fraud ka maamla: platform.
    3. Delivery ka saboot mazboot ho (D-072 ka code), to platform dispute lade.
- **Salah:** **(c)**. Nuksaan usi pe jiski galti, aur delivery ke saboot se jhoothe dispute ka mukabla ho sakta hai.
- **Trade-off:**
  - (a) me platform ka nuksaan, chahe galti brand ki ho.
  - (b) me seller ke saath anyay, jab galti delivery ki ho.
  - (c) me har maamle ki jaanch.
- **Owner ka jawab (2026-11-18):** **(c)**, wajah ke hisaab se (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-095.

### Q-037. Brand maal bheje to pehle se suchna zaroori ho, aur receiving pe farak nikle to kya?

- **Status:** `Tay`. Topic: B1 (warehouse), B3 (batch). Group G1.
- **Sawal:** brand maal bheje to kya pehle seller app me shipment ki suchna zaroori ho (variant, batch, expiry ya mfg date + shelf life, har batch ka MRP, ginti)? Aur receiving pe ginti ya batch me farak nikle to kya ho?
- **Kyun zaroori:**
  - Receiving pe kai faisle tike hain: batch aur expiry ki jaanch (D-014, D-083), receiving ki expiry seema (D-062, D-082), batch ka MRP (D-064), hamari zimmedari "accept" se (D-063), aur storage fee ki ghadi (D-066, D-094). In sabke liye "accept" ka matlab saaf chahiye.
  - R1 me maal warehouse me aata hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
- **Vikalp:**
  - **(a) Bina suchna:** maal aaye, staff jo gine wahi record, seller ko report.
  - **(b) Suchna zaroori:**
    1. Receiving pe suchna se milan. Farak (kam, zyada, galat batch, toota aaya) seller ko photo ke saath report; seller tay din (misaal 7) me aitraaz kar sake.
    2. Jo maal accept nahi hua (toota aaya, expiry seema se kam) wo brand ke kharche pe wapas, ya brand kahe to nasht aur fee (D-062 jaisa).
    3. Bina suchna aaya maal alag rakha jaata hai (hold), seller ko alert; tay din me suchna na bane to wapas.
    4. "Accept" = ginti aur jaanch poori hokar staff ka accept scan; zimmedari (D-063) aur storage fee ki ghadi (D-066) isi pal se.
    5. Suchna me har batch ka MRP pehle se ho, to D-064 ka alert maal pahunchne se pehle hi seller ko mil jaata hai.
  - **(c) (b) + aane ka slot:** warehouse ki capacity ke hisaab se brand slot book kare.
- **Salah:** **(b)**; slot tab jab sellers badhein. Farak pe jhagda nahi hota, aur har zimmedari ka shuruaati pal ek hi hai.
- **Trade-off:**
  - (a) me farak pe jhagda (kiski ginti sahi).
  - (b) me seller ka ek extra form.
  - (c) me scheduling ka kaam.
- **Owner ka jawab (2026-11-18):** **(b)**, suchna zaroori (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-096.

### Q-038. Har variant pe brand ka barcode zaroori ho, ya platform apna label lagaye?

- **Status:** `Tay`. Topic: B3 (catalog), B1 (warehouse). Group G1.
- **Sawal:** har variant pe brand ka barcode (EAN) zaroori ho, ya na ho to platform apna label lagaye?
- **Kyun zaroori:**
  - Warehouse me scan karke pick karne se galat shade ya size nahi jaata. Duplicate listing ki jaanch barcode se hoti hai (D-075 niyam 4).
  - Chhote brands ke paas aksar barcode nahi hota.
  - Barcode batch nahi batata, jabki customer ko wahi batch jaana chahiye jiska MRP aur expiry usne dekhi (D-064, D-067).
- **Vikalp:**
  - **(a) Barcode zaroori:** bina barcode product list nahi.
  - **(b) Barcode ho to wahi, na ho to platform ka label:**
    1. Barcode na ho to receiving pe har unit pe platform ka barcode label (labelling fee, D-078 niyam 4: shuru me ₹0).
    2. Warehouse me ek bin me ek variant ka ek hi batch, taaki pick pe sahi batch jaaye.
  - **(c) Har unit pe platform ka label** (barcode ho ya na ho), jisme variant aur batch dono; batch scan se pakka.
- **Salah:** **(b)**. Ek warehouse aur kam sellers ke saath "ek bin, ek batch" sasta hai, aur chhote brands bhi aa paate hain.
- **Trade-off:**
  - (a) chhote brands ke liye rukawat.
  - (b) me labelling ka kaam aur bin ka anushaasan.
  - (c) sabse pakka, par har unit pe mehnat.
- **Owner ka jawab (2026-11-18):** **(b)**, barcode ho to wahi, na ho to platform ka label (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-097.

### Q-039. Listing ka content kaun likhe, aur badlav pe dobara jaanch kab ho?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** listing ka content (naam, description, images, ingredients, claims, declarations, net quantity) kaun likhe, staff kya kar sake, aur seller ke har badlav pe dobara jaanch ho ya nahi?
- **Kyun zaroori:**
  - R1 me listing staff ki jaanch ke baad live hoti hai (D-084). Daam ki tarah (D-061 niyam 4) content pe bhi saaf niyam chahiye.
  - Galat ingredients ya claim allergy wale customer ke liye jokhim hai.
- **Vikalp:**
  - **(a) Har badlav pe jaanch:** seller likhe, staff sirf manzoor ya reject kare (tay wajah ke saath). Har badlav naya version; jaanch tak purana version live.
  - **(b) Sirf jokhim wale fields pe jaanch:**
    1. Ingredients, claims, declarations, net quantity, category, images aur shade swatch pe dobara jaanch; tab tak purana version live.
    2. Baaki (description ke shabd, istemaal ka tareeka) turant live, baad me staff ka spot check.
    3. Staff khud koi field nahi badalta, sirf "ye badlo" wajah ke saath bhejta hai.
    4. Har version ka record: kisne, kab, kya badla.
  - **(c) Platform ki content team:** seller sirf data de, platform content likhe aur sudhaare.
- **Salah:** **(b)**. Jokhim wale fields hamesha jaanch se guzarte hain, aur chhote badlav pe staff ka bojh nahi banta.
- **Trade-off:**
  - (a) sabse surakshit, par staff pe bojh aur seller ka intezaar.
  - (b) me fields ki do list sambhalni padti hain.
  - (c) me content hamara ho jaata hai, aur galti ki zimmedari bhi.
- **Kanooni detail jaanchi nahi** (R-004): listing ke galat claim ya jaankari ki zimmedari (seller ya platform).
- **Owner ka jawab (2026-11-18):** **(b)**, sirf jokhim wale fields pe dobara jaanch (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-098.

### Q-040. Ingredients aur allergens kis roop me lein aur dikhayein?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** product ke ingredients (INCI list) aur allergens seller se kis roop me lein, aur customer ko kaise dikhayein?
- **Kyun zaroori:**
  - Allergy wale customer ke liye ye sabse zaroori jaankari hai.
  - "Free-from" filters (jaise paraben-free, fragrance-free) aur allergen ki chetavni isi data se banti hai.
- **Vikalp:**
  - **(a) Text + label photo:** seller pack jaisi poori ingredients list text me de, aur pack ke label ki photo zaroori; staff photo se milaye.
  - **(b) Structured list:** platform ki ingredient master list (INCI naam) se seller har ingredient chune.
  - **(c) Dono, kram se:**
    1. R1 me (a): text + label photo; product page pe poori list, chhupi hui nahi.
    2. R2 me text se structured list semi-auto bane, staff jaanche.
    3. Uske baad free-from filters aur allergen ki chetavni.
- **Salah:** **(c)**. Label ki photo se ek saath ingredients, declarations aur batch ka format jaanch hota hai, aur R1 pe bhaari master data ka kaam nahi aata.
- **Trade-off:**
  - (a) akela filters nahi deta.
  - (b) R1 me bhaari: master data ek insaan ke liye bada kaam.
  - (c) me R2 me ek baar data badalna padta hai.
- **Kanooni detail jaanchi nahi** (R-004): label aur online page pe ingredients aur allergens dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, par teeno kadam (text + label photo, structured list, free-from filters aur allergen ki chetavni) R1 me. Record: [DECISIONS.md](DECISIONS.md) D-099.

### Q-041. Product claims (vegan, SPF jaise) seller kaise kare, aur platform kya jaanche?

- **Status:** `Tay`. Topic: B3 (catalog). Group G2.
- **Sawal:** "vegan", "cruelty-free", "paraben-free", "dermatologically tested", "organic", "non-comedogenic", "SPF 50 PA++++" jaise claims seller kaise kare, aur platform kya jaanche?
- **Kyun zaroori:**
  - Customer claims dekh ke kharidta aur filter karta hai.
  - Galat claim se customer ko nuksaan ho sakta hai (sunscreen ka SPF galat ho to sehat), aur platform pe bharosa kam hota hai.
- **Vikalp:**
  - **(a) Free text,** koi jaanch nahi.
  - **(b) Platform ki tay claim list:** seller tick kare (khud ki ghoshna), koi saboot nahi.
  - **(c) Tay list + kuch pe saboot:**
    1. Claims sirf platform ki tay list se; filters bhi sirf isi list se.
    2. SPF aur PA pe test report, organic pe certificate, cruelty-free pe certification, dermatologically tested pe test report (sab dummy, D-026); baaki claims khud ki ghoshna.
    3. Staff saboot jaanche; saboot ki expiry ho to reminder.
    4. Description ke free text me claim jaise shabd staff ki jaanch me.
    5. R1 me tay list + ghoshna, aur saboot sirf SPF ke liye; baaki saboot R2 se.
- **Salah:** **(c)**. Filters sach pe chalte hain, aur sehat se jude claim (SPF) pe R1 se hi saboot.
- **Trade-off:**
  - (a) me galat claims.
  - (b) me list hai, par sach ki jaanch nahi.
  - (c) me seller aur staff ka kaam, aur dastavez rakhne ki zimmedari (Security Architect ke saath, B14).
- **Kanooni detail jaanchi nahi** (R-004): cosmetics claims aur galat vigyapan ke niyam.
- **Owner ka jawab (2026-11-18):** **(c)**, tay list + kuch pe saboot (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-100.

### Q-042. Offers aur coupons ka paisa kaun de: brand, platform ya dono?

- **Status:** `Tay`. Topic: B4 (promotions). Group G3.
- **Sawal:** R2 ke offers aur coupons (D-055) ka paisa kaun deta hai: brand, platform, ya dono?
- **Kyun zaroori:**
  - Invoice ka daam, commission ki rakam (D-078), D-063 ki bharpai ka daam, aur D-061 niyam 4 (platform ka discount alag dikhe) isi pe tike hain.
  - Offers R2 se hain, par R1 ki order line me iske khane pehle se chahiye, chahe khaali rahein.
- **Vikalp:**
  - **(a) Sirf brand:** seller ka coupon ya ghataya daam; invoice discount ke baad ke daam pe; commission usi pe.
  - **(b) Brand ya platform:** platform ke coupon me seller ko poora daam milta hai, farak platform deta hai.
  - **(c) (b) + baanta hua:**
    1. Har offer pe brand aur platform ka hissa (%) tay.
    2. Offer ka budget; budget khatam hote hi offer apne aap band.
    3. R2 ki shuruaat (a) aur (b) se; baanta hua offer uske baad.
    4. R1 ki order line me "discount, kisne diya" ke khane.
- **Salah:** **(c)** ka design. Brand aur platform dono apne offer chala sakte hain, aur hisaab har line pe saaf rehta hai.
- **Trade-off:**
  - (a) saral, par platform apni marzi ka offer nahi chala sakta.
  - (b) me platform ka kharcha aur hisaab.
  - (c) me har offer ka hissa aur budget sambhalna.
- **Kanooni detail jaanchi nahi** (R-004): discount pe GST (bikri se pehle ya baad ka), aur platform ke diye discount ka invoice pe asar.
- **Owner ka jawab (2026-11-18):** **(c)**, brand, platform ya baanta hua offer (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-101.

### Q-043. Ek item pe kai offers ek saath lag sakein?

- **Status:** `Tay`. Topic: B4 (promotions). Group G3.
- **Sawal:** ek item pe kai fayde ek saath lag sakte hain? Jaise sale daam + coupon, do coupons, ya Pro daam + coupon. (R2 se, D-055.)
- **Kyun zaroori:**
  - Bina niyam ke offers ka kharcha behisaab badh sakta hai.
  - Pro daam (D-065) ke saath coupon aage bechne ka lalach badhata hai.
- **Vikalp:**
  - **(a) Saaf default:** ek order pe ek coupon; sale daam + coupon chale; Pro daam pe coupon nahi.
  - **(b) Koi mel nahi:** sirf sabse achha ek fayda.
  - **(c) Har offer pe setting:** "kis ke saath chale".
- **Salah:** **(a)** default, aur (c) ka raasta baad me.
- **Trade-off:**
  - (a) me kuch customers ko kam fayda.
  - (b) me sale ke dino me coupon bekaar.
  - (c) me staff ko har offer pe sochna padta hai.
- **Owner ka jawab (2026-11-18):** **(a)**, saaf default. Record: [DECISIONS.md](DECISIONS.md) D-102.

### Q-044. Seller ke udhaar aur delivery partner se kaat ki seemaon ke number kya hon?

- **Status:** `Tay`. Topic: B6 (settlement). Group G4.
- **Sawal:** D-071 ke udhaar ki seema (rakam, din, aur "lambe samay") aur D-068 me delivery partner se kaat ki seema kya ho?
- **Kyun zaroori:**
  - Dono faislon ne numbers settlement ki charcha pe chhode the. Seller ka udhaar R1 ke seller hisaab me hai; partner ki kaat partner ki kamaai pe tiki hai.
- **Vikalp:**
  - **(a) Beech ka:**
    1. Udhaar ₹5,000 ya 60 din paar: alert + payment link.
    2. Uske 30 din baad (notice ke saath): naya maal aur listings band.
    3. Uske 90 din baad: account band.
    4. Delivery partner: ek maamle me zyada se zyada ₹500, mahine me ₹1,500, ya mahine ki kamaai ka 10%, jo kam ho.
    5. Saare number misaal; setting se badal sakein.
  - **(b) Kadi:** ₹2,000 ya 30 din; phir 15 din; phir 45 din.
  - **(c) Narm:** ₹10,000 ya 90 din; phir 60 din; phir 180 din.
- **Salah:** **(a)**. Chhote brand pe shuru me bojh nahi, aur udhaar ek seema se aage nahi badhta.
- **Trade-off:**
  - (a) beech ka raasta.
  - (b) chhote brand ke liye bhaari.
  - (c) me udhaar bada hota jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): gig partner ki kamaai se kaat ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, beech ka (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-103.

### Q-045. Delivery partner ki kamaai kaise bane?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (delivery). Group G4.
- **Sawal:** gig delivery partner (D-033) ki kamaai kaise bane?
- **Kyun zaroori:**
  - D-068 ki kaat isi kamaai se hoti hai, aur partners ka payout finance me hai.
- **Vikalp:**
  - **(a) Har kaam pe:**
    1. Har delivered parcel pe tay rakam (misaal ₹30), har return pickup pe (misaal ₹25), fail koshish pe kam (misaal ₹10).
    2. Hafte me ek payout.
    3. R2 se; R1 me sirf record: kaunsa parcel kis partner ne, taaki baad me hisaab ban sake.
  - **(b) (a) + doori:** km ke hisaab se extra.
  - **(c) Ghante (shift) ke hisaab se.**
- **Salah:** **(a)**; doori wala hissa baad me, jab hubs ka ilaaka bada ho.
- **Trade-off:**
  - (a) saral, par door ke pincode pe partner ka nuksaan.
  - (b) me doori ka hisaab.
  - (c) payroll jaisa, jo D-033 (gig partners) ke khilaaf jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): gig partners ke niyam, unke payout pe TDS, aur aggregator ka contribution.
- **Owner ka jawab (2026-11-18):** **(a)**, har kaam pe (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-104.

### Q-046. R1 me return, daawe aur refund ki manzoori kaun sa staff kare?

- **Status:** `Tay`. Topic: B2 (roles), B11 (support). Group G5.
- **Sawal:** R1 me return ki manzoori, "parcel nahi mila" ka daawa (D-072) aur refund ki manzoori kaunsa staff role kare, aur kis app me, jabki support desk R2 se hai (D-055)?
- **Kyun zaroori:**
  - R1 me return aur refund hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), aur D-072 me staff ki jaanch hai. Bina role ke R1 ka order flow adhoora hai.
- **Vikalp:**
  - **(a) Support Desk app ka patla hissa R1 me:**
    1. Ek role (misaal "Support Agent") sirf order dekhe, return manzoor ya reject kare, daawe ka faisla kare, aur refund shuru kare.
    2. Return request apne aap manzoor, jab wajah aur saboot poore hon; aakhri faisla warehouse ki jaanch pe.
    3. Tickets, SLA aur baaki support desk R2 me.
    4. R1 ke scope me ye chhota jod owner ki haan se (D-055).
  - **(b) Logistics Ops app me:** returns ki jaanch aur hub manager hi ye kaam karein.
  - **(c) Kam se kam staff:** return apne aap manzoor (jaise (a) niyam 2); daawe me sirf "bina code" wale maamle hub manager dekhe.
- **Salah:** **(a)**. Kaam shuru se sahi app me hota hai (D-010), aur R2 me usi app me tickets judte hain; apne aap manzoori se staff ka kaam kam.
- **Trade-off:**
  - (a) me R1 me ek app ka chhota hissa badhta hai.
  - (b) me kaam galat app me, jo baad me hatana padta hai.
  - (c) akela ho to galat daawe pe rok kam.
- **Owner ka jawab (2026-11-18):** **(a)**, Support Desk app ka patla hissa R1 me (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-105.

### Q-047. Toote, galat ya kam item ke daawe me customer se kya saboot lein?

- **Status:** `Tay`. Topic: B7 (returns). Group G5.
- **Sawal:** toota, galat ya kam item ke daawe (D-079) me customer se kya saboot lein?
- **Kyun zaroori:**
  - Cosmetics me "galat shade aaya" ya "khaali box aaya" jaise daawe aam hain. D-072 ki tarah faisla saboot se hona chahiye, andaaze se nahi.
- **Vikalp:**
  - **(a) Koi saboot nahi.**
  - **(b) Photo zaroori:**
    1. Item ki, label pe batch number ki, aur damage ki photo.
    2. "Item kam" pe parcel aur packing ki photo.
    3. Unboxing video optional; staff maang sake.
    4. Hamari taraf ka saboot: warehouse pe pack ki photo.
  - **(c) (b) + unboxing video zaroori:** ek rakam (misaal ₹1,500) se upar.
- **Salah:** **(b)**. Saboot ka ek aasaan kadam, aur hamari pack ki photo se dono taraf ka saboot rehta hai.
- **Trade-off:**
  - (a) me jhooth aasaan.
  - (b) me customer ka ek kadam.
  - (c) me video banana sabko nahi aata, aur video me privacy ka sawal.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo aur video (ghar ya chehra aa sakta hai) rakhne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, photo zaroori (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-106.

### Q-048. Customer se delivery fee lein ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing), B5 (checkout). Group G6.
- **Sawal:** customer se delivery fee lein ya nahi; lein to kitni, aur kaise dikhe?
- **Kyun zaroori:**
  - Checkout ka total, invoice (delivery platform ki seva hai, to shayad platform ka alag invoice), aur cancel, RTO aur return ke niyam isi pe tike hain.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Seema ke neeche fee:**
    1. Order ki rakam ek seema se kam ho to tay fee (misaal ₹499 se kam pe ₹49), area setting se; 0 bhi rakhi ja sake.
    2. Kai sellers ya kai parcel wale order (D-077) pe bhi ek hi fee, order pe.
    3. Product page aur cart pe pehle se "₹X se upar muft delivery" dikhe.
    4. Koi "platform fee" ya "packing fee" nahi.
  - **(c) Doori ya wazan ke hisaab se.**
- **Salah:** **(b)**. Asli jaisa (D-026), aur cancel, RTO aur return ke niyam isi pe saaf bante hain; seema 0 rakh ke muft bhi chala sakte hain.
- **Trade-off:**
  - (a) saral, par kharcha poora hamara, aur niyam baad me jodne padte hain.
  - (b) me platform ka invoice aur fee ke niyam.
  - (c) customer ke liye samajhna mushkil.
- **Kanooni detail jaanchi nahi** (R-004): delivery fee pe GST aur kiska invoice.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke neeche fee (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-107.

### Q-049. Delivery na ho paaye to kitni koshish, aur phir kya (RTO)?

- **Status:** `Tay`. Topic: B1 (delivery). Group G6.
- **Sawal:** customer na mile, address na mile, ya customer parcel lene se mana kare, to kitni baar koshish ho, aur phir kya? (Parcel wapas warehouse jaana = RTO.)
- **Kyun zaroori:**
  - Prepaid order pe refund ka samay, delivery pe UPI wale order (D-034) pe stock wapas, aur har koshish ka kharcha isi se tay hota hai.
  - D-072 ka niyam "delivered" ke liye hai, "delivery nahi hui" ke liye nahi.
- **Vikalp:**
  - **(a) Ek koshish:** fail hote hi RTO; prepaid ka refund.
  - **(b) Do koshish (misaal):**
    1. Har fail pe wajah (ghar band, address galat, customer ne mana kiya), aur customer ko in-app, email aur browser push se khabar, agla din chunne ka option.
    2. Parcel hub pe zyada se zyada 3 din (misaal), phir RTO.
    3. Customer ne saaf mana kiya to doosri koshish nahi, seedha RTO.
    4. Prepaid ka poora refund RTO ka hub pe scan hote hi shuru (parcel tab bhi hamari zimmedari me, D-063).
    5. RTO maal warehouse me receiving jaisi jaanch ke baad stock me.
    6. Delivery fee (agar Q-048 me lage) customer ki galti wale RTO pe wapas nahi.
  - **(c) Teen koshish,** aur customer kabhi bhi agla din badal sake.
- **Salah:** **(b)**. Customer ko doosra mauka milta hai, aur refund warehouse pahunchne tak nahi rukta, kyunki parcel hamari zimmedari me hai.
- **Trade-off:**
  - (a) me chhoti galti pe order khatam.
  - (b) me hub pe parcel rakhne ki jagah aur din ki ginti.
  - (c) me kharcha aur hub ka bojh zyada.
- **Owner ka jawab (2026-11-18):** **(b)**, do koshish (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-108.

### Q-050. Delivery pe UPI kise mile, kitni rakam tak, aur mana karne pe kya?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments). Group G6.
- **Sawal:** delivery pe UPI QR (D-034) kise mile, kitni rakam tak ke order pe, aur customer payment se mana kare to kya ho?
- **Kyun zaroori:**
  - Bina advance paise ke order me customer mana kare to delivery aur wapsi ka kharcha hamara, aur stock itne din ruka rehta hai. R1 me ye raasta hai.
- **Vikalp:**
  - **(a) Sab customers,** koi seema nahi.
  - **(b) Seema ke saath:**
    1. Order ki zyada se zyada rakam (misaal ₹3,000); naye customer ke pehle order pe kam (misaal ₹1,500); area setting se on ya off.
    2. Jo customer aise order pe 2 baar (misaal) mana kare ya payment na kare, uske liye delivery pe UPI band; staff wajah ke saath khol sake.
    3. Door pe payment fail ho (network) to partner 10 minute (misaal) tak QR dobara dikhaye, phir "koshish fail" (Q-049).
    4. Delivery code (D-072) payment ke baad hi.
  - **(c) Sirf purane customers:** kam se kam ek prepaid order delivered ho chuka ho.
- **Salah:** **(b)**. Naye customer ko bhi raasta milta hai, aur mana karne ka nuksaan ek seema me rehta hai.
- **Trade-off:**
  - (a) me mana karne ka nuksaan.
  - (b) me kuch customers ko prepaid karna padta hai.
  - (c) naye customer ke liye rukawat.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-109.

### Q-051. Customer order kab tak cancel kar sake, aur poora ya ek-ek item?

- **Status:** `Tay`. Topic: B5 (order). Group G6.
- **Sawal:** customer order kab tak cancel kar sake, aur poora hi ya ek-ek item bhi?
- **Kyun zaroori:**
  - Refund, stock wapas, aur delivery fee ke niyam isi pe tike hain. Ek item cancel hone ke baad order muft delivery ki seema se neeche aaye, to bhi niyam chahiye.
- **Vikalp:**
  - **(a) Sirf poora order,** pack hone se pehle.
  - **(b) Ek-ek item ya quantity, pack hone se pehle:**
    1. Pack ke baad cancel nahi, sirf door pe mana (RTO, Q-049).
    2. Koi cancel fee nahi.
    3. Cancel ke baad order seema se neeche aaye to bhi baad me delivery fee nahi lagti.
    4. Prepaid ka refund turant; delivery pe UPI wale order me paisa liya hi nahi.
  - **(c) Ek-ek item, warehouse se nikalne tak.**
- **Salah:** **(b)**. Customer ko poora order nahi todna padta, aur niyam saral aur saaf rehte hain.
- **Trade-off:**
  - (a) me customer ko poora order todna padta hai.
  - (b) me line ke hisaab se refund aur stock.
  - (c) me pack hua parcel kholna (galti ka mauka).
- **Owner ka jawab (2026-11-18):** **(b)**, ek-ek item ya quantity, pack hone se pehle (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-110.

### Q-052. Refund kis raaste jaaye, aur kab shuru ho?

- **Status:** `Tay`. Topic: B6 (payments). Group G6.
- **Sawal:** refund kis raaste jaaye, aur kab shuru ho?
- **Kyun zaroori:**
  - R1 me Razorpay test mode me refund hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1), aur saara paisa platform ke ek gateway account me aata hai (D-093). Delivery pe UPI wale order ka refund bhi chahiye (return pe).
- **Vikalp:**
  - **(a) Hamesha original raaste:**
    1. Razorpay refund; delivery pe UPI QR wala payment bhi usi raaste.
    2. Shuru hone ka samay: cancel pe turant (Q-051), RTO pe hub scan pe (Q-049), return pe warehouse jaanch ke baad (Q-056).
    3. Refund fail ho (jaise account band) to staff ka haath ka raasta, aur customer ko khabar.
    4. Customer ko refund ki halat in-app aur email me dikhe.
  - **(b) Original ya bank account:** customer chahe to bank account me (bank details lena padta, jo sensitive data hai).
  - **(c) Default store credit:** gift card aur store credit ke sawal (B10, D-055 me R2) ka hissa; prepaid instruments ke niyam ka jokhim.
- **Salah:** **(a)**. Customer ka paisa usi raaste wapas jaata hai jisse aaya, aur bank details rakhne ka jokhim nahi.
- **Trade-off:**
  - (a) me kuch maamle haath se.
  - (b) me bank details ki suraksha.
  - (c) me customer ka paisa platform pe atka rehta hai.
- **Kanooni detail jaanchi nahi** (R-004): refund ka samay (RBI ke niyam) aur store credit ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, hamesha original raaste (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-111.

### Q-053. Lauta maal kahan jaaye, aur nuksaan kiska?

- **Status:** `Tay`. Topic: B7 (returns). Group G6.
- **Sawal:** warehouse ki jaanch ke baad lauta maal kahan jaaye (dobara stock, brand ko, ya nasht), aur kharcha ya nuksaan kiska?
- **Kyun zaroori:**
  - Maal brand ka hai (D-060); hamari galti ka nuksaan hamara (D-063); band maal dobara bike to brand ka fayda. R1 ki warehouse jaanch ka nateeja isi se banta hai.
  - D-063 me zimmedari "receiving se customer tak" hai; return pickup ke baad, warehouse pahunchne se pehle maal kho jaaye ya toote, to kiska, ye saaf nahi.
- **Vikalp:**
  - **(a) Kabhi dobara stock nahi:** har lauta maal brand ko wapas ya nasht.
  - **(b) Wajah ke hisaab se:**
    1. Band, seal salamat (D-079), batch wahi jo bheja tha, aur expiry bikri band ki seema (D-082) se upar: wapas bikne layak stock, usi batch me.
    2. Transit me toota ya leak (hamari zimmedari): nasht (D-062 ka record), brand ko D-063 se bharpai, customer ko refund.
    3. Galat item bheja (hamari pick ki galti): hamari zimmedari; lauta item jaanch ke baad stock me.
    4. Brand ki galti (defect, galat batch label, nakli ka shak sahi nikla): refund ka paisa seller ke hisaab se, saath me wapsi ka kharcha; maal brand ko wapas, ya brand ke kharche pe nasht (D-062 jaisa).
    5. Customer ki baat jaanch me galat (khula maal "band" bata ke, ya batch alag): refund nahi; maal customer ko wapas (misaal ek baar hamare kharche pe).
    6. Return pickup ke scan se warehouse receiving tak maal hamari zimmedari (D-063 me jod).
    7. Seller ke panel me har return ka nateeja aur wajah; seller ko aitraaz ka raasta.
  - **(c) (b) jaisa, par dobara stock sirf brand ki haan se.**
- **Salah:** **(b)**. Har maamle me nuksaan usi ka jiski galti, band maal bekaar nasht nahi hota, aur return ke raaste me bhi zimmedari saaf rehti hai.
- **Trade-off:**
  - (a) me brand ka nuksaan bada, aur galti hamari ho to jhagda.
  - (b) me jaanch ka anushaasan.
  - (c) me brand ke jawab tak maal ruka rehta hai.
- **Kanooni detail jaanchi nahi** (R-004): lautaye band cosmetics ko dobara bechne ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, wajah ke hisaab se (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-112.

### Q-054. Return pickup ke waqt delivery partner kya jaanche?

- **Status:** `Tay`. Topic: B7 (returns), B1 (delivery). Group G6.
- **Sawal:** return pickup ke waqt delivery partner kya jaanche?
- **Kyun zaroori:**
  - Fraud ki sabse sasti rok yahi hai: hamare paas har line ka batch hai (D-064), to galat ya purana maal lautane wala door pe hi pakda jaata hai.
- **Vikalp:**
  - **(a) Kuch nahi,** sab warehouse me.
  - **(b) Photo + batch + seal:**
    1. Partner item ki photo le, aur label pe batch number ko order wale batch se milaye.
    2. "Man badla" wale return me seal dekhe (D-079).
    3. Mel na khaye to pickup na le (wajah + photo), aur customer ko in-app, email aur browser push se khabar.
  - **(c) (b) + partner hi refund manzoor kare.**
- **Salah:** **(b)**. Galat maal warehouse tak nahi aata, aur Delivery app me photo ka kadam pehle se hai (D-072).
- **Trade-off:**
  - (a) me galat maal warehouse tak aata hai, aur ek aur trip ka kharcha.
  - (b) me partner ka ek-do minute aur.
  - (c) me partner pe paise ka faisla (jokhim).
- **Owner ka jawab (2026-11-18):** **(b)**, photo + batch + seal (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-113.

### Q-055. Return pickup ka kharcha customer se kate ya nahi?

- **Status:** `Tay`. Topic: B7 (returns). Group G6.
- **Sawal:** return pickup ka kharcha customer se kate ya nahi?
- **Kyun zaroori:**
  - "Man badla" wale return (D-079) me galti kisi ki nahi; muft ho to galat istemaal, mehenga ho to customer naraz.
- **Vikalp:**
  - **(a) Hamesha muft.**
  - **(b) Galti ke hisaab se:**
    1. Hamari ya brand ki galti: return muft, aur delivery fee (agar Q-048 me lage) bhi wapas.
    2. Man badla: refund me se return fee kat-ti hai (misaal ₹49), aur delivery fee wapas nahi.
  - **(c) Man badla ka kharcha seller pe.**
- **Salah:** **(b)**. Galti wale customer ka koi kharcha nahi, aur man badla wale return ka galat istemaal kam hota hai.
- **Trade-off:**
  - (a) me kharcha hamara, aur galat istemaal.
  - (b) me ek fee ka niyam.
  - (c) seller ke saath anyay, kyunki galti uski nahi.
- **Owner ka jawab (2026-11-18):** **(b)**, galti ke hisaab se (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-114.

### Q-056. Return ka refund kab ho: warehouse jaanch ke baad, ya kuch maamlon me pickup pe hi?

- **Status:** `Tay`. Topic: B7 (returns), B6 (payments). Group G6.
- **Sawal:** R1 me return ka refund warehouse jaanch ke baad hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1). Aage (R2 se) bhi aisa hi rahe, ya kuch maamlon me pickup pe hi?
- **Kyun zaroori:**
  - Warehouse jaanch me 3 se 5 din (misaal) lagte hain; customer ka paisa itne din atka rehta hai.
- **Vikalp:**
  - **(a) Hamesha warehouse jaanch ke baad.**
  - **(b) Chhoti rakam pe pickup pe:**
    1. Misaal ₹1,000 tak, aur pickup ki jaanch (Q-054) paas ho, to pickup scan pe refund; baaki warehouse ke baad.
    2. Baar-baar galat return karne wale customer (Q-057) ko ye suvidha nahi.
    3. R2 se; R1 me (a).
  - **(c) Request pe turant.**
- **Salah:** **(b)**. Zyadatar customers ka paisa jaldi wapas aata hai, aur jokhim chhoti rakam tak simit rehta hai.
- **Trade-off:**
  - (a) me customer ka intezaar.
  - (b) me thoda jokhim (pickup ke baad maal galat nikle).
  - (c) me fraud aasaan.
- **Owner ka jawab (2026-11-18):** **(b)**, chhoti rakam pe pickup pe (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-115.

### Q-057. Baar-baar return ya daawa karne wale customer pe kya ho?

- **Status:** `Tay`. Topic: B7 (returns), B11 (disputes). Group G6.
- **Sawal:** jo customer bahut return ya daawe kare, us pe kya ho?
- **Kyun zaroori:**
  - D-072 niyam 4 me sirf record aur report hai; return ke liye bhi niyam chahiye, warna pickup ka kharcha aur nuksaan badhta hai.
- **Vikalp:**
  - **(a) Sirf record** aur staff ko report.
  - **(b) Seema ke baad suvidhayein band:**
    1. Seema misaal: 90 din me 5 returns, ya delivered orders ka 40% se zyada.
    2. Seema paar: man badla wala return band, delivery pe UPI band (Q-050), aur pickup pe refund (Q-056) band.
    3. Staff wajah ke saath khol sake; customer ko wajah dikhe.
    4. R2 se; record R1 se.
  - **(c) Account band.**
- **Salah:** **(b)**. Nuksaan rukta hai, aur galti se pakde gaye sahi customer ke liye staff ka raasta khula rehta hai.
- **Trade-off:**
  - (a) me nuksaan chalta rehta hai.
  - (b) me ek seema, aur kuch sahi customer bhi pakde ja sakte hain (isliye staff khol sake).
  - (c) bahut kada, galat faisle ka jokhim.
- **Owner ka jawab (2026-11-18):** **(b)**, seema ke baad suvidhayein band (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-116.

### Q-058. Customer ko delivery ka vaada kaise dikhe, aur warehouse ka cut-off kya ho?

- **Status:** `Tay`. Topic: B1 (delivery), B5 (checkout).
- **Sawal:** customer ko delivery ka vaada kis roop me dikhe (product page ke pincode check, cart aur checkout pe), aur warehouse ka roz ka cut-off kya ho?
- **Kyun zaroori:**
  - Pincode check bina sign-in bhi hota hai (D-020), aur wahan delivery ka vaada dikhta hai. Warehouse se hub ke trips (D-027) ka samay isi vaade se banta hai.
  - Galat vaada sabse aam shikayat hai.
- **Vikalp:**
  - **(a) Din ki range:** "2 se 4 din me", har sub-district ki ek setting.
  - **(b) Tareekh, cut-off ke saath:**
    1. "Aaj 2 baje (misaal) tak order to kal delivery."
    2. Warehouse se hub ka roz ek trip (misaal shaam 4 baje).
    3. Sunday aur chhuttiyan area setting me.
    4. Vaada toote to order pe "der" ki haalat aur customer ko khabar; R1 me koi muavza nahi.
  - **(c) Time slot:** customer delivery ka slot chune; har hub ki capacity ka hisaab chahiye.
- **Salah:** **(b)**, slot nahi. Ek warehouse aur ek hub ke saath tareekh ka vaada sach rakha ja sakta hai, aur customer ko range se zyada bharosa milta hai.
- **Trade-off:**
  - (a) saral, par kam bharosa.
  - (b) me cut-off, chhuttiyon aur trip ke samay ki settings.
  - (c) me capacity ka hisaab, ek insaan ke liye bhaari.
- **Owner ka jawab (2026-11-18):** **(b)**, tareekh, cut-off ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-117.

### Q-059. Stock kab ruke, aur online payment ke liye kitna samay mile?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments).
- **Sawal:** stock kab roka jaaye, aur online payment ke liye customer ko kitna samay mile?
- **Kyun zaroori:**
  - Order batch se reserve hota hai (D-064), aur R1 me stock reservation hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1).
  - Bina samay-seema ke adhure payments stock ko rok ke rakhte hain, aur der se aaye payment pe customer ka paisa atak sakta hai.
- **Vikalp:**
  - **(a) Cart me daalte hi rokna.**
  - **(b) "Place order" pe rokna, 15 minute (misaal):**
    1. Prepaid me itne samay me payment.
    2. Der se payment aaye aur stock ho to order pakka; warna apne aap poora refund (original raaste, D-111) aur customer ko khabar.
    3. Cart me stock nahi rukta; cart sirf "kam stock" dikhata hai, aur checkout pe dobara jaanch.
    4. Delivery pe UPI wale order (D-034) me stock order pe ruka rehta hai, kyunki payment delivery pe hai.
  - **(c) (b), par 30 minute.**
- **Salah:** **(b)**. Stock sirf asli kharidari pe rukta hai, aur der se aaye payment ka paisa apne aap wapas jaata hai.
- **Trade-off:**
  - (a) me stock bina kharidari ke ruka rehta hai.
  - (b) me UPI app me der karne wale ko kabhi refund ka intezaar.
  - (c) me stock zyada der ruka.
- **Owner ka jawab (2026-11-18):** **(b)**, "place order" pe rokna, 15 minute (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-118.

### Q-060. Order ke baad customer address ya item badal sake?

- **Status:** `Tay`. Topic: B5 (order).
- **Sawal:** order ke baad customer address ya quantity badal sake, ya item jod sake?
- **Kyun zaroori:**
  - Pincode → hub (D-016), GST ka state aur invoice order pe tike hain; badlav se ye sab dobara banta hai.
  - Ek-ek item cancel (D-110) pehle se hai.
- **Vikalp:**
  - **(a) Koi badlav nahi:** quantity ghatani ho to item cancel (D-110), aur kuch jodna ho to naya order.
  - **(b) (a) + address badle:** pack se pehle, agar naya pincode usi hub aur usi state ka ho. R1 me (a), ye badlav R2 se.
  - **(c) (b) + item jodna.**
- **Salah:** **(b)**; item jodna nahi. Address badalna aam zaroorat hai, aur shart se hub aur invoice nahi badalte.
- **Trade-off:**
  - (a) me customer ke liye kam suvidha.
  - (b) me hub aur state ki jaanch.
  - (c) me invoice aur reservation dobara.
- **Owner ka jawab (2026-11-18):** **(b)**, R1 me koi badlav nahi, R2 se usi hub aur state me address badle; item jodna nahi. Record: [DECISIONS.md](DECISIONS.md) D-119.

### Q-061. MRP aur daam ka farak (discount) kaise dikhe?

- **Status:** `Tay`. Topic: B4 (pricing).
- **Sawal:** product page, cart aur checkout pe MRP aur daam ka farak kaise dikhe?
- **Kyun zaroori:**
  - R1 me product page pe batch ka MRP (D-064) aur daam dono hain.
  - Galat ya badha-chadha discount customer ko gumraah karta hai.
- **Vikalp:**
  - **(a) Kata hua MRP + daam + "% off"** (MRP se), hamesha.
  - **(b) (a) + niyam:**
    1. % hamesha neeche round ho, kabhi badha ke nahi.
    2. Batch badle aur MRP badle to % bhi badle.
    3. "Sale" ya "deal" jaisa label lage tab "pichhle 30 din ka sabse kam daam" bhi dikhe (D-061 ka itihaas pehle se hai); ye hissa sale labels ke saath R2 se.
  - **(c) Sirf MRP aur daam,** koi % nahi.
- **Salah:** **(b)**. Customer ko sach dikhta hai, aur "sale" ka daawa itihaas se jaancha ja sakta hai.
- **Trade-off:**
  - (a) aam tareeka, par "sale" ka sach nahi dikhata.
  - (b) me ek aur hisaab.
  - (c) me customer ko farak khud nikalna padta hai.
- **Kanooni detail jaanchi nahi** (R-004): discount aur "pehle ka daam" dikhane ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, kata MRP, daam aur % off, saath me 3 niyam. Record: [DECISIONS.md](DECISIONS.md) D-120.

### Q-062. Free samples aur gifts kaise chalein?

- **Status:** `Tay`. Topic: B4 (promotions).
- **Sawal:** free samples (sachet, mini) aur "₹X ki kharidari pe gift" kaise chalein? (R2 se, D-055.)
- **Kyun zaroori:**
  - Beauty me samples se bikri badhti hai, par maal brand ka hai (D-060). Stock, invoice aur return sab pe asar.
- **Vikalp:**
  - **(a) Nahi.**
  - **(b) Sirf brand ke:**
    1. Brand apne products ke saath apne samples de; stock brand ka.
    2. Invoice pe ₹0 ki line, "not for sale" nishaan.
    3. Samples pe bhi batch aur expiry (D-062).
    4. Return pe gift lautana zaroori nahi; jis offer se gift mila uski shart return ke baad toote, to bhi gift ka paisa nahi kat-ta.
  - **(c) (b) + platform ke gifts:** platform ka diya gift, aur customer har order pe samples chune (misaal 2).
- **Salah:** **(b)**. Beauty ka aam tareeka milta hai, kharcha brand ka rehta hai, aur return ke niyam saral rehte hain.
- **Trade-off:**
  - (a) me beauty ka aam tareeka chhoot-ta hai.
  - (b) me ₹0 lines aur samples ka stock.
  - (c) me platform ka kharcha aur gifts ka stock.
- **Kanooni detail jaanchi nahi** (R-004): free maal pe GST aur sample ke label ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, sirf brand ke (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-121.

### Q-063. Return pe customer ko kya mile: refund, wahi item, ya doosra shade?

- **Status:** `Tay`. Topic: B7 (returns).
- **Sawal:** return pe customer ko kya mile: sirf refund, wahi item dobara (replacement), ya doosra shade ya size (exchange)?
- **Kyun zaroori:**
  - Toote ya galat item pe customer aksar wahi item chahta hai.
  - Exchange cosmetics me shade ke liye maanga jaata hai, par batch ka MRP (D-064) aur daam ka farak ise ulajhata hai.
- **Vikalp:**
  - **(a) Sirf refund** (D-111).
  - **(b) Refund ya wahi variant dobara:**
    1. Replacement sirf hamari ya brand ki galti wale maamlon me, stock ho to.
    2. Naya parcel aur purana pickup ek hi trip me.
    3. R1 me (a); replacement R2 se.
  - **(c) (b) + exchange:** band maal pe usi product ka doosra shade ya size, daam ka farak le ya de.
- **Salah:** **(b)**. Galti wale customer ko do kadam nahi lene padte. Exchange ki jagah customer refund le ke naya order kare: wahi kaam, saaf hisaab.
- **Trade-off:**
  - (a) me customer ke do kadam.
  - (b) me replacement ka stock, aur ek trip me do kaam.
  - (c) me invoice, credit note aur daam ka farak.
- **Kanooni detail jaanchi nahi** (R-004): replacement pe invoice aur credit note ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, refund ya wahi variant dobara (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-122.

### Q-064. Hub aur warehouse live karne ke liye shuruaati staff list kya ho?

- **Status:** `Tay`. Topic: B1 (warehouse, delivery), B2 (roles).
- **Sawal:** D-015 ki shart "staff ki list poori" ke liye shuru me kaunse roles kitne hon?
- **Kyun zaroori:**
  - List data me hai aur sirf Master badalta hai (D-022), par shuruaati list chahiye; R1 me hub live karna isi pe tika hai.
- **Vikalp:**
  - **(a) Kam se kam:**
    1. Hub: 1 Hub Manager, 1 Hub Operations (scan aur sort), 2 Delivery Partners.
    2. Warehouse: 1 Warehouse Manager, 1 Receiving, 1 Pick-Pack, 1 Returns QC.
  - **(b) Backup ke saath:** har kaam ke 2, hub me 5 Delivery Partners.
  - **(c) Bahut kam:** 1 Hub Manager + 1 Delivery Partner.
- **Salah:** **(a)**. Owner ke alag accounts (D-017) se poori ho jaati hai, aur ek insaan kai roles rakh sakta hai (D-054). Asli launch pe (b) sirf setting badal ke.
- **Trade-off:**
  - (a) me ek role ka account band ho to list adhoori ho jaati hai.
  - (b) me R1 ke liye zyada accounts.
  - (c) me "list poori" ka matlab kamzor.
- **Owner ka jawab (2026-11-18):** **(a)**, kam se kam. Record: [DECISIONS.md](DECISIONS.md) D-123.

### Q-065. "Agla bhejne wala batch" sirf bikne layak batches me se ho?

- **Status:** `Tay`. Topic: B3 (batch), B1 (warehouse).
- **Sawal:** D-064 me "agla bhejne wala batch" (sabse pehle expire hone wala pehle, D-062) ka matlab: sirf **bikne layak** batches me sabse pehle expire hone wala, ya koi bhi batch?
- **Kyun zaroori:**
  - D-064 niyam 2 me naya batch tab tak nahi bikta jab tak seller daam na ghataye. Wo ruka batch sabse pehle expire hone wala ho, to "pehle expire wala pehle" toot-ta hai.
  - Tab saaf nahi ki site pe kaunsa MRP aur expiry dikhe, aur ruka batch bikri band ki seema (D-082) ki taraf jaata hai, jo brand ka nuksaan hai (D-062).
- **Vikalp:**
  - **(a) Bikne layak batches me sabse pehle expire hone wala:**
    1. Ruka batch (D-064 niyam 2, ya kisi aur wajah se hold) ginti me nahi; site pe agle bikne layak batch ka MRP aur expiry.
    2. Ruka batch bikri band ki seema ke paas aaye to seller ko alert (D-062 niyam 3 jaisa), saath me "daam ghatao to ye batch bikega".
    3. Ye spashtikaran D-064 me ek jod ke roop me.
  - **(b) Hamesha sabse pehle expire hone wala, chahe ruka ho:** tab tak product hi nahi bikta jab tak seller daam na ghataye.
  - **(c) Koi jod nahi,** jaisa likha hai.
- **Salah:** **(a)**. Product bikta rehta hai, customer ko wahi dikhta hai jo jaayega, aur ruke batch ka jokhim seller ko pehle se pata hota hai.
- **Trade-off:**
  - (a) me ruka batch expiry ki taraf ja sakta hai (seller ke alert se rok).
  - (b) me poora product ruk jaata hai.
  - (c) me code me dono matlab ban sakte hain.
- **Owner ka jawab (2026-11-18):** **(a)**, bikne layak batches me sabse pehle expire hone wala (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-124.

### Q-066. Bharpai ka daam normal daam se ho, Pro daam se nahi?

- **Status:** `Tay`. Topic: B6 (settlement).
- **Sawal:** D-063 niyam 1 ki bharpai me "selling price" ka matlab kya ho, jabki Pro daam (D-065) bhi ek selling price hai?
- **Kyun zaroori:**
  - "Pichhle 30 din ka sabse kam daam" me Pro daam gina gaya, to bharpai bina wajah kam hogi.
  - Nuksaan hua unit kis daam pe bikta, ye aksar pehle se pata nahi hota.
- **Vikalp:**
  - **(a) Sirf normal daam ka itihaas:** Pro daam ginti me nahi. Ye ek line D-063 me jod.
  - **(b) Unit kisi order ke liye reserved tha to usi order ka daam** (Pro order ho to Pro daam); baaki maamlon me normal daam.
  - **(c) Pro aur normal dono itihaas me.**
- **Salah:** **(a)**. Hisaab saral rehta hai, aur brand ko utna milta hai jitna normal bikri pe milta.
- **Trade-off:**
  - (a) me Pro order ke reserved unit pe brand ko thoda zyada.
  - (b) sabse sahi, par do raaste.
  - (c) me bharpai bina wajah kam.
- **Owner ka jawab (2026-11-18):** **(a)**, sirf normal daam ka itihaas. Record: [DECISIONS.md](DECISIONS.md) D-125.

### Q-067. Din ke 300 emails ki seema me har order pe kaunse emails jaayein?

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** din ke 300 emails ki seema (D-028, R-013) me har order pe kaunse emails jaayein?
- **Kyun zaroori:**
  - Tay faislon se har order pe kai emails ban sakte hain: confirmation, delivery code (D-072), dispatch, delivery fail (D-108), delivered, invoice, refund (D-111).
  - Har order pe 5 emails hon to din ke ~60 orders me seema khatam, aur OTP (jo sirf email se jaata hai) bhi ruk sakta hai. R-013 me OTP line me sabse pehle hai.
- **Vikalp:**
  - **(a) Har haalat pe email** (jaise abhi), OTP line me sabse pehle.
  - **(b) Sirf zaroori emails:**
    1. Order confirmation, aur usi me delivery code (D-072).
    2. Invoice aur refund ka email (paise ka record).
    3. Baaki haalat (dispatch, der, delivery fail, delivered) in-app aur browser push se. Customer ne browser push band rakha ho to inme se sirf delivery fail ka email.
    4. Din ki seema ke paas emails ki line: pehle OTP, phir paise ke emails, phir baaki.
    5. D-108 aur doosre faislon me "email se khabar" isi niyam ke andar.
  - **(c) Customer khud chune** kaunse emails chahiye (OTP aur paise ke emails hamesha).
- **Salah:** **(b)**. OTP kabhi nahi rukta, paise ka record email me rehta hai, aur baaki khabar muft raaston se jaati hai.
- **Trade-off:**
  - (a) me bhaari din pe emails ruk sakte hain.
  - (b) me browser push band rakhne wale customer ko kam khabar.
  - (c) me settings ka kaam, aur zyada emails ka jokhim.
- **Owner ka jawab (2026-11-18):** **(b)**, sirf zaroori emails (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-126.

### Q-068. Imported cosmetics bik sakein?

- **Status:** `Tay`. Topic: B3 (catalog). Group G7.
- **Sawal:** videshi brands ke products (India me importer ya distributor ke through) platform pe bik sakein?
- **Kyun zaroori:**
  - D-032 authorised distributors ko bechne deta hai, aur bahut se beauty brands imported hain.
  - Listing pe importer ki details, country of origin aur import registration ke fields isi pe tike hain.
- **Vikalp:**
  - **(a) Sirf India me bane products.**
  - **(b) Imported bhi:**
    1. Listing pe importer ka naam-pata, country of origin aur import registration number (dummy, D-026) zaroori; staff jaanche.
    2. Fields R1 se; bikri jab aisa seller aaye. R1 ke dono sellers India ke.
  - **(c) Imported sirf brand ki apni Indian company se.**
- **Salah:** **(b)**. Market ka bada hissa andar aata hai, aur fields pehle din se hone se baad me data nahi badalna padta.
- **Trade-off:**
  - (a) me market ka bada hissa bahar.
  - (b) me kuch fields aur jaanch zyada.
  - (c) me distributors (D-032) ke saath mel kam.
- **Kanooni detail jaanchi nahi** (R-004): imported cosmetics ka registration aur label ke niyam.
- **Owner ka jawab (2026-11-18):** **(b)**, imported bhi (2 niyam). Record: [DECISIONS.md](DECISIONS.md) D-127.

### Q-069. Drug ya Ayurvedic drug licence wale products listing pe kaise rokein?

- **Status:** `Tay`. Topic: B3 (catalog), B13 (compliance). Group G7.
- **Sawal:** drug items kabhi nahi (D-043); listing pe ise kaise pakka karein, aur herbal ya Ayurvedic beauty products ka kya?
- **Kyun zaroori:**
  - Bahut se herbal ya Ayurvedic beauty products cosmetic nahi, Ayurvedic (AYUSH) drug licence pe bante hain.
  - Kuch aam dikhne wale skin care bhi drug hain (jaise ketoconazole wala anti-dandruff shampoo, benzoyl peroxide ya adapalene wali acne cream, hydroquinone, minoxidil).
  - Bina rok ke D-043 sirf kaagaz pe rehta hai.
- **Vikalp:**
  - **(a) Sirf seller ki ghoshna** ("ye drug nahi"), aur staff ka andaaza.
  - **(b) Licence ka type + rok:**
    1. Listing pe licence ka type zaroori: cosmetic manufacturing, cosmetic import registration (Q-068 ke hisaab se), drug, ya AYUSH drug; number dummy (D-026).
    2. Drug aur AYUSH drug type wale product list hi nahi hote.
    3. Ingredients ki blocklist (jaise upar ke drug ingredients): D-099 ki structured list me aisa ingredient mile to listing ruk ke staff ke paas.
    4. Herbal ya Ayurvedic naam wale products jo cosmetic licence pe bane hain, bik sakte hain.
  - **(c) Herbal ya Ayurvedic naam wale saare products bahar.**
- **Salah:** **(b)**. D-043 listing pe hi pakka hota hai, aur cosmetic licence wale herbal products bahar nahi hote.
- **Trade-off:**
  - (a) me galti se drug bik sakta hai.
  - (b) me ek field aur blocklist sambhalni padti hai.
  - (c) me bada hissa bahar, jabki wo cosmetic hain.
- **Kanooni detail jaanchi nahi** (R-004): cosmetic aur drug (AYUSH samet) ki seema, aur kaunse ingredients cosmetic me mana hain.
- **Owner ka jawab (2026-11-18):** **(b)**, licence ka type + rok (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-128.

### Q-070. Batch recall pe platform kya kare?

- **Status:** `Tay`. Topic: B3 (batch), B7 (returns). Group G8.
- **Sawal:** brand ya regulator kisi batch ko wapas bulaye (recall), to platform kya kare, aur customer ko kya mile?
- **Kyun zaroori:**
  - Cosmetics ka batch kharab nikal sakta hai (contamination, galat formula).
  - Har order line ka batch hamare paas hai (D-064, D-067), to kis customer ko kaunsa batch gaya, pata hai. Return ki samay-seema ke baad batch ki dikkat recall ke raaste (D-080).
- **Vikalp:**
  - **(a) Sirf bikri band;** customers ko kuch nahi.
  - **(b) Poora recall:**
    1. Bikri band, aur warehouse me batch alag (quarantine).
    2. Us batch ke customers ko khabar; customer chahe to refund (pickup se wapsi, ya bina wapsi).
    3. Saara kharcha (refund, pickup, nasht) brand ka, seller ke hisaab se; kam pade to D-071 ka udhaar.
    4. Recall brand (seller app se) ya staff shuru kare; har recall ka record (batch, kitne customers, kitne lautaye).
  - **(c) (b) + platform ka rok:** platform khud bhi batch rok sake (jaise Q-071 ki shikayatein) jab tak jaanch ho; rokne ki wajah ka record.
- **Salah:** **(c)**. Customer ki sehat pehle, aur platform jaanch tak batch rok sakta hai. Data R1 me pehle se (har line ka batch); recall ka flow R2 se.
- **Trade-off:**
  - (a) me customer ki sehat ka jokhim.
  - (b) me ek poora flow.
  - (c) me platform ke rokne pe brand se jhagda ho sakta hai, isliye wajah ka record.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics recall ki zimmedari aur regulator ko suchna.
- **Owner ka jawab (2026-11-18):** **(c)**, poora recall + platform ka rok. Record: [DECISIONS.md](DECISIONS.md) D-129.

### Q-071. Skin reaction (allergy) ki shikayat pe kya ho?

- **Status:** `Tay`. Topic: B7 (returns), B11 (support). Group G8.
- **Sawal:** customer kahe product lagane se reaction (allergy) hua (khula maal), to platform kya kare?
- **Kyun zaroori:**
  - Ye cosmetics ka khaas jokhim hai. Khula maal pe reaction D-079 ki kisi return wajah me nahi aata, par customer ki sehat ka maamla hai.
  - Ek batch pe kai shikayatein batch me dikkat ka ishaara hain.
- **Vikalp:**
  - **(a) Normal shikayat:** koi refund nahi; brand ko khabar.
  - **(b) Case record:**
    1. Product, batch, kya hua, aur photo (customer ki consent ke saath).
    2. Brand ko khabar.
    3. Staff ke faisle se bina wapsi refund (goodwill, ek seema tak).
    4. Skin & Hair Expert (D-025) se salah ka offer.
  - **(c) (b) + batch pe nazar:** ek batch pe tay ginti (misaal 3) shikayatein hon to batch ki bikri ruke aur staff jaanch kare (Q-070).
- **Salah:** **(c)**. Batch me dikkat sabit ho to refund ka kharcha brand ka; warna platform ka goodwill, seema ke saath. R2 se, support desk ke saath (D-055); R1 ke Support Desk hisse (D-105) me nahi.
- **Trade-off:**
  - (a) me customer ka bharosa toot-ta hai, aur batch ki dikkat chhup jaati hai.
  - (b) me sehat ka data (Security Architect ke saath, B14).
  - (c) me ek galat shikayat se bhi batch ruk sakta hai, isliye staff ki jaanch.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke side-effect (adverse event) ki report ke niyam, aur sehat ke data ki consent.
- **Owner ka jawab (2026-11-18):** **(c)**, case record + batch pe nazar. Record: [DECISIONS.md](DECISIONS.md) D-130.

### Q-072. Browser push band ho to kin khabaron ka email jaaye?

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** D-126 me browser push band rakhne wale customer ko sirf delivery fail ka email jaata hai. D-090 ke sawal (pick pe kami, tay samay me jawab) aur recall ki khabar (D-129) ka email jaaye ya nahi?
- **Kyun zaroori:**
  - D-090 me jawab na aaye to wo line cancel ho jaati hai. Push band customer tak sawal hi na pahunche, to uska item bina jaane kat jaata hai.
  - Recall (D-129) sehat ka maamla hai; khabar na pahunche to customer kharab batch istemaal karta rehta hai.
  - Dono maamle kam hote hain, to 300 emails ki seema (D-126) pe bojh kam padta hai.
- **Vikalp:**
  - **(a) Jawab aur sehat wali khabar ka email:**
    1. Jis khabar pe customer ka jawab chahiye, aur jawab na aane pe order badalta hai (abhi D-090), push band ho to uska email.
    2. Recall ki khabar (D-129) har customer ko email se bhi, push ho ya na ho.
    3. Ye D-126 niyam 3 me jod; emails ki line me inki jagah OTP ke baad, paise ke emails ke saath.
  - **(b) Sirf D-090 ka sawal:** push band ho to email; recall ki khabar D-126 ke niyam se hi.
  - **(c) Koi jod nahi:** D-126 jaisa; push band customer ko sirf in-app.
- **Salah:** **(a)**. Customer ka item bina jaane cancel nahi hota, sehat ki khabar har customer tak pahunchti hai, aur emails bahut kam badhte hain.
- **Trade-off:**
  - (a) me email ke do aur niyam.
  - (b) me recall ki khabar push band customer tak nahi pahunchti.
  - (c) me push band customer ka item chupchaap cancel ho sakta hai.
- **Kanooni detail jaanchi nahi** (R-004): recall pe customer ko suchna dene ke niyam.
- **Owner ka jawab (2026-11-18):** **(a)**, jawab aur sehat wali khabar ka email (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-131.

### Q-073. Ingredient master list aur blocklist ka data kahan se aaye, aur kaun sambhale?

- **Status:** `Tay`. Topic: B3 (catalog), B2 (roles).
- **Sawal:** D-099 ki INCI master list aur D-128 ki blocklist ka shuruaati data kahan se aaye, aur unme badlav kaunsa staff role kare?
- **Kyun zaroori:**
  - Dono R1 me hain. Master list ke bina seller ke text se structured list semi-auto nahi banti (D-099); blocklist ke bina drug ingredient wala product pakda nahi jaata (D-128).
  - Blocklist ki galti ka asar bada hai: galat naam hata to drug bik sakta hai, galat naam juda to sahi products ruk jaate hain.
  - Kharcha ₹0 hai (D-028), to paid data provider nahi.
- **Vikalp:**
  - **(a) Badhti list, ek hi team:**
    1. Master list R1 ke products ke ingredients se shuru. Seller ke text me anjaana naam staff ki jaanch me "naya ingredient" ban ke aaye, aur staff use jode.
    2. Blocklist ek chhoti tay list se shuru (D-128 ke naam, misaal).
    3. Dono me badlav catalog ki jaanch wali team (D-084) kare.
  - **(b) Public database se import:** EU ke CosIng jaise public ingredient database se shuru se hazaron INCI naam; license aur format pehle jaanchna; ek alag data role sambhale.
  - **(c) (a) se shuru, (b) baad me, do level ki pahunch:**
    1. R1 me (a) jaisi badhti list.
    2. Public database ka import tab, jab Claude uska license aur format jaanch le aur products badhein.
    3. Master list me naya naam jaanch team (D-084) jode.
    4. Blocklist sirf ek senior catalog role badle, wajah ke saath; har badlav audit log me.
- **Salah:** **(c)**. R1 ke 2 sellers ke kam products ke liye badhti list kaafi hai, aur blocklist pe jokhim zyada hai, isliye uska badlav senior role ke haath me rehta hai.
- **Trade-off:**
  - (a) me blocklist ka badlav bhi aam jaanch team ke haath me.
  - (b) me R1 me import, data ki safai aur license ka kaam.
  - (c) me shuru me staff ko naye naam haath se jodne padte hain.
- **Kanooni detail jaanchi nahi** (R-004): kaunse ingredients cosmetic me mana hain, aur public database ke data ka license.
- **Owner ka jawab (2026-11-18):** **(c)**, badhti list se shuru, public database baad me, do level ki pahunch (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-132.

### Q-074. Live site pe anjaan log sign-up aur order kar sakein ya nahi?

- **Status:** `Tay`. Topic: B13 (compliance), B5 (checkout).
- **Sawal:** live site pe koi bhi anjaan insaan sign-up karke order de sake, ya sign-up aur order sirf chune hue emails (allowlist) tak hon?
- **Kyun zaroori:**
  - Payments test mode me hain (D-026) aur delivery asli nahi hoti. Anjaan insaan order de to use lagega ye asli dukaan hai.
  - Uska personal data (naam, address, phone) hamare paas aata hai, aur uske sign-up ke codes din ke 300 emails (D-028) khaate hain.
  - Owner ke apne accounts `+` alias se bante hain (D-017), to allowlist se owner ka kaam nahi rukta.
- **Vikalp:**
  - **(a) Sab ke liye khula,** site pe demo ki patti ke saath.
  - **(b) Dekhna sab ke liye, account sirf allowlist se:**
    1. Dekhna, search, reviews padhna aur pincode check (D-020) sab ke liye.
    2. Sign-up aur sign-in (teeno raaste, D-021) sirf allowlist ke emails se: owner ke base emails aur unke `+` alias, aur jinhe owner jode (testers).
    3. Allowlist ek setting me, bina deploy.
    4. Baaki ko saaf sandesh: "Ye demo store hai."
    5. Seller, delivery partner aur Creator ke sign-up bhi isi niyam se; waitlist (D-046) me judna bhi account se, to wo bhi allowlist tak.
    6. Asli business pe jaane pe (D-026) allowlist ek setting se band.
  - **(c) Sign-up khula, checkout sirf allowlist ke liye.**
- **Salah:** **(b)**, R1 se. Code waisa hi production-grade rehta hai (D-012), par anjaan logon ka data aur emails ka bojh nahi aata, aur koi dhokha nahi khaata.
- **Trade-off:**
  - (a) me anjaan ka data, emails ka bojh aur dhokhe ka jokhim.
  - (b) me portfolio dekhne wala sign-up nahi kar sakta (owner chahe to use allowlist me jode).
  - (c) me anjaan ka data aur sign-up ke codes phir bhi.
- **Kanooni detail jaanchi nahi** (R-004): test mode me bikri dikhane wali site, aur anjaan logon ka personal data.
- **Owner ka jawab (2026-11-19):** **(b)**, dekhna sab ke liye, account sirf allowlist se (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-133.

### Q-075. Har kanooni area me system kitna banaye?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** D-026 me design asli aur registrations dummy hain. Har kanooni area me system kitna banaye: sirf field, workflow me rok, ya poora register aur report?
- **Kyun zaroori:**
  - Ek insaan (D-009) har area me poora register nahi bana sakta, aur har area ki zaroorat alag hai.
  - [COMPLIANCE.md](COMPLIANCE.md) ka "System me kya chahiye" khana isi se bharega.
- **Teen level:** **L1** = field, dummy value aur dikhana. **L2** = L1 + workflow me rok ya jaanch (iske bina aage nahi). **L3** = L2 + register, report, export aur yaad (filing jaisa nateeja; asli filing nahi).
- **Vikalp:**
  - **(a) Sab L1.**
  - **(b) Area ke hisaab se:**

    | Area                                                                                                                  | Level                                           | Kab                               |
    | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------- |
    | GST invoice, credit note, bina gap ka invoice number (D-041)                                                          | L3                                              | R1 invoice; registers R2          |
    | Seller pe GST TCS aur income-tax TDS                                                                                  | L3                                              | R1 hisaab; register aur export R2 |
    | HSN aur GST rate ki table (D-086)                                                                                     | L2                                              | R1                                |
    | Seller KYC aur warehouse state ka GSTIN (D-036)                                                                       | L2                                              | R1                                |
    | Licence ka type, import registration (D-127, D-128)                                                                   | L2                                              | R1                                |
    | Product page ki declarations (net quantity, MRP, mfg aur expiry, maker ya importer, country of origin, customer care) | L2 (inke bina listing live nahi)                | R1                                |
    | Claims ke saboot (D-100)                                                                                              | L2; saboot ki expiry ki yaad L3                 | SPF R1; baaki R2                  |
    | Reviews jaise user content: report aur chhupana                                                                       | L2; register L3                                 | R1; register R2                   |
    | Grievance Officer aur shikayatein                                                                                     | L3                                              | R2 (page R1)                      |
    | Privacy aur data ke haq                                                                                               | L2                                              | R1 kuch, R2 baaki                 |
    | Dark patterns se bachav                                                                                               | L2 (UX aur code ke niyam)                       | R1                                |
    | E-way bill (warehouse aur hub ka trip, D-027)                                                                         | L1 (trip pe dummy number)                       | R2                                |
    | Plastic EPR (D-045)                                                                                                   | L1 (registration); packaging ka data L3 baad me | R1 field                          |
    | Gig delivery partners ka registration                                                                                 | L1                                              | R2                                |
    | Site ke registrations (Shops & Establishments, jalne wale maal ke liye fire NOC)                                      | L1 (field aur expiry ki yaad)                   | R2                                |
    | Telemedicine (D-025)                                                                                                  | L1                                              | R2                                |

  - **(c) Sab L3.**
- **Salah:** **(b)**. Jo paise, tax aur customer ki suraksha se juda hai wo gehra; baaki sirf field, taaki asli business pe jaane pe jagah ho.
- **Trade-off:**
  - (a) me design asli nahi rehta (D-026 ke khilaaf).
  - (b) me har area ka level yaad rakhna (COMPLIANCE.md me).
  - (c) ek insaan ke liye bahut bada kaam.
- **Kanooni detail jaanchi nahi** (R-004): table ki har row. Ye sirf "system kya banaye" ki baat hai; kanoon kya maangta hai, ye kanooni jaanch batayegi.
- **Owner ka jawab (2026-11-19):** **(b)**, area ke hisaab se level (table). Record: [DECISIONS.md](DECISIONS.md) D-134.

### Q-076. Review ka haq: kin order lines pe, kab tak, aur kitni baar?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** delivery ke baad verified purchase review (D-055) ka haq kin order lines pe ho, kitne din tak, aur ek customer ek product pe kitne review likh sake?
- **Kyun zaroori:**
  - Lauta hua item, RTO (D-108) ya cancel (D-110) line, Pro daam wali line (D-065) aur ek product ke kai orders: inse review ka data model aur rating ki ginti banti hai.
  - Review pe variant dikhana (D-076 niyam 5) bhi order line se hi aata hai.
- **Vikalp:**
  - **(a) Har line, har baar:** har delivered order line pe ek review; ek product ke kai orders = kai reviews; window delivery se misaal 180 din.
  - **(b) Ek customer, ek product, ek review:**
    1. Haq kisi bhi delivered line se, lauta hua item bhi (return ke baad bhi raay de sake). Cancel aur RTO line pe nahi.
    2. Pro daam wali line (D-065) pe bhi review.
    3. Review pe us line ka variant aur "Verified purchase" ka nishaan. Dobara kharid pe naya review nahi: purana review edit ho (variant nayi line ka chun sake), aur "kai baar kharida" ka nishaan.
    4. Window delivery se misaal 365 din.
    5. Customer kabhi bhi edit ya delete kare; edit dobara moderation se; har version ka record.
  - **(c) Har line pe review, rating me aakhri:** har order pe naya review dikhe, par rating me har customer ka sirf aakhri review gina jaaye.
- **Salah:** **(b)**, R1 se. Ek insaan ki ek awaaz: baar-baar kharidne wala rating ko jhuka nahi sakta, aur dobara kharid pe customer apni raay taaza kar sakta hai. Lautaye item pe review rokna negative raay dabane jaisa lagta.
- **Trade-off:**
  - (a) me zyada kharidne wale ka asar zyada.
  - (b) me edit ka itihaas rakhna, aur lautaye item ke negative reviews aayenge (jo sach hain).
  - (c) me do tarah ki ginti samjhana mushkil.
- **Kanooni detail jaanchi nahi** (R-004): verified review aur negative review na dabane ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, ek customer, ek product, ek review (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-135.

### Q-077. Review ki moderation: kab jaanch aur kaun?

- **Status:** `Tay`. Topic: B8 (moderation), B2 (roles).
- **Sawal:** review live hone se pehle staff jaanche, ya pehle live ho aur baad me jaanch ho; aur ye kaam kis staff role ke paas ho?
- **Kyun zaroori:**
  - Reviews R1 me hain (D-039) aur staff ka saara kaam ek insaan karta hai (D-009). Har review haath se jaanchna bhaari hai.
  - Par gaali, kisi ka phone ya address, ya nakli review live rehna jokhim hai.
  - Roles ki list (D-017) me role aur uska app (D-010) chahiye.
- **Vikalp:**
  - **(a) Sab pehle jaanch:** har review staff ke "approve" ke baad live; faisla misaal 2 kaam ke din me.
  - **(b) Mila-jula:**
    1. Sirf star rating (bina text) turant live.
    2. Text wala review apne aap ki jaanch se guzre (gaali ke shabdon ki list; phone, email ya link jaisa pattern; lambai): paas to turant live, atka to staff ki queue.
    3. Photo wala review hamesha queue me.
    4. Report hua review live rahe jab tak faisla na ho; sirf personal data ya intimate content ki report pe faisle tak chhupe, aur aisi report queue me sabse pehle.
    5. Queue ka faisla misaal 2 kaam ke din me.
    6. Har chhupana aur wapas dikhana wajah ke saath, audit me, aur wapas ho sake.
    7. Role "Review Moderator": poore desh ki ek team (D-084 jaisa), Admin app me.
  - **(c) Sab turant live:** jaanch sirf report hone pe.
- **Salah:** **(b)**, R1 se. Zyadatar reviews bina staff ke live, aur jokhim wale (photo, atke, report hue) hi staff tak. Ek insaan ka bojh kam rehta hai.
- **Trade-off:**
  - (a) me ek insaan pe bojh aur customer ka intezaar.
  - (b) me shabdon ki list aur jaanch ka kaam, aur kuch galat review thodi der live.
  - (c) me galat content der tak live.
- **Kanooni detail jaanchi nahi** (R-004): reviews jaise user content pe platform ki zimmedari aur hatane ke samay.
- **Owner ka jawab (2026-11-19):** **(b)**, mila-jula moderation, Review Moderator role ke saath (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-136.

### Q-078. Skin type, concern aur active ingredient ka data kis roop me?

- **Status:** `Tay`. Topic: B9 (search), B3 (catalog). Group G9.
- **Sawal:** product pe "kis skin type ke liye", "kis concern ke liye" aur active ingredient ka % jaisi jaankari kis roop me aaye, taaki filter aur search usse chal sakein?
- **Kyun zaroori:**
  - Skincare aur haircare me customer "oily skin", "acne-prone skin", "pigmentation", "dandruff", "10% niacinamide" se dhoondhta hai.
  - Variants (D-076), shade (D-085), ingredients (D-099) aur claims (D-100) me ye fields nahi. Baad me saari listings dobara bharna mehnga.
  - Concern ke shabd drug ke daawe tak ja sakte hain ("acne-prone skin ke liye" se "acne ka ilaaj"; D-128).
- **Vikalp:**
  - **(a) Claims ki list me hi:** "oily skin ke liye", "acne-prone skin ke liye" jaise claims D-100 ki tay list me jud jaayein; filter claims se.
  - **(b) Alag fields, platform ki list se:**
    1. Category ke hisaab se fields (D-076 jaisa): skin type (kai chune ja sakein), concern, hair type.
    2. Seller platform ki list se chune; ye jokhim wale fields me (D-098 niyam 1), badlav pe jaanch.
    3. Concern ki list me sirf cosmetic shabd ("acne-prone skin", "dull skin"); "treat", "cure" jaise shabd list me nahi.
    4. Active ingredient ka % alag field, sirf tab jab pack pe chhapa ho; staff label ki photo (D-099 niyam 1) se milaye.
    5. Filters inhi fields se.
  - **(c) R1 me kuch nahi.**
- **Salah:** **(b)**, R1 me chhota jod. Skin type aur concern lagbhag har skincare product pe hote hain; claims ki list saboot wale daawon ke liye hai, unme milane se list bhaari aur filters ulajhte hain.
- **Trade-off:**
  - (a) me claims ki list lambi, aur saboot ke niyam (D-100) inpe bhi lagne ka sawal.
  - (b) me seller aur staff ka thoda aur kaam.
  - (c) me R1 ka filter kamzor, aur baad me sab listings dobara.
- **Kanooni detail jaanchi nahi** (R-004): cosmetic aur drug ke daawe ke shabd.
- **Owner ka jawab (2026-11-19):** **(b)**, alag fields, platform ki list se (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-137.

### Q-079. R1 me kaunse filters aur sort?

- **Status:** `Tay`. Topic: B9 (search). Group G9.
- **Sawal:** R1 ke basic search aur filter ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1) me kaunse filters aur kaunse sort hon?
- **Kyun zaroori:**
  - R1 me basic search aur filter tay hai, par list nahi.
  - Har filter ka data catalog me pehle din se chahiye (D-085, D-099, D-100, D-127, aur Q-078 ka data).
- **Vikalp:**
  - **(a) Kam:** category, brand, daam ki range, shade family, free-from. Sort: relevance, daam (kam se zyada, zyada se kam), naya.
  - **(b) Poore:** (a) + skin type aur concern (Q-078), claims (D-100), rating, discount %, country of origin (D-127), size. Sort me rating aur discount bhi.
  - **(c) (b) + Pro daam se sort,** Pro buyer ke liye (D-065).
- **Salah:** **(b)**, R1 se. Data R1 me ban hi raha hai; filter usi ka seedha fayda hai. Pro daam ka sort baad me.
- **Trade-off:**
  - (a) me data hote hue bhi filter nahi.
  - (b) me filter ki screen aur search index ka kaam.
  - (c) me har dekhne wale ke liye alag daam ka sort.
- **Kanooni detail jaanchi nahi** (R-004): imported products ke liye country of origin ka filter zaroori hai ya nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, poore filters aur sort. Record: [DECISIONS.md](DECISIONS.md) D-138.

### Q-080. Search aur listing me products kis kram me aayein?

- **Status:** `Tay`. Topic: B9 (search).
- **Sawal:** search aur category page pe products kis kram me aayein, aur kya apne brand ya paid "sponsored" ko upar jagah mil sake?
- **Kyun zaroori:**
  - Kram se bikri tay hoti hai.
  - Apna brand platform ka hi hai (D-031: koi shortcut nahi); use upar rakhna doosre sellers ke saath anyay hai.
  - Ranking ki technique Architect ka kaam hai; yahan sirf niti.
- **Vikalp:**
  - **(a) Sirf relevance:** shabd ka mel, phir naya.
  - **(b) Relevance + gun, bina seller ke boost:**
    1. Relevance ke baad: rating (kam se kam misaal 5 reviews pe), pichhle 30 din ki bikri, stock me hona.
    2. Out-of-stock (agar dikhein) sabse neeche.
    3. Apne brand ko koi boost nahi; code me kisi seller ke hisaab se boost ka raasta hi nahi.
    4. Sponsored sirf R2 ke baad, hamesha "Sponsored" label ke saath, aur ginti ki seema (misaal har 10 me 2 tak).
    5. Kram ke mukhya gun customer ke liye ek page pe likhe.
  - **(c) (b) + apne brand ko boost.**
- **Salah:** **(b)**: R1 me sponsored ke bina; sponsored R2 ke baad. Customer ko kaam ka kram, aur sab sellers ke saath ek niyam.
- **Trade-off:**
  - (a) me achhe aur bikne wale products neeche reh sakte.
  - (b) me rating aur bikri ki ginti ka kaam.
  - (c) me sellers ka bharosa aur kanooni jokhim.
- **Kanooni detail jaanchi nahi** (R-004): kram ke gun batana, apne brand ko aage rakhna, sponsored ka label.
- **Owner ka jawab (2026-11-19):** **(b)**, relevance + gun, bina seller ke boost (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-139.

### Q-081. Sellers aur staff ko kin baaton ka email jaaye?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** din ke 300 emails ki seema me sellers aur staff ko kin baaton ka email jaaye, aur baaki khabar kaise?
- **Kyun zaroori:**
  - D-126 sirf customer ke order emails ka hai.
  - Sellers ko bhi bahut khabrein jaati hain: listing ka "ye badlo" (D-098), receiving ka farak (D-096), expiry ke alert (D-062, D-124), udhaar ka alert aur payment link (D-071, D-103), payout (D-081), recall (D-129), staff invite aur password reset. Sab usi 300 me (D-028).
- **Vikalp:**
  - **(a) Har khabar ka email.**
  - **(b) Sirf zaroori, aur din ka ek saar:**
    1. Account aur security (invite, password reset, sign-in code): OTP wali line me.
    2. Paisa (payout statement, udhaar ka alert aur payment link, fee ka invoice): paise wali line me.
    3. Jinpe seller ka kaam ruke ya tay samay me jawab chahiye (receiving ka farak, listing "ye badlo", recall, batch rokna): din ka ek saar wala email (misaal subah 9 baje), har khabar alag nahi.
    4. Baaki (listing manzoor, stock ki ginti, reviews) sirf in-app aur push.
    5. Staff ko sirf account aur security ke emails; kaam ki khabar app ki queue me.
  - **(c) Seller khud chune** kaunse emails chahiye.
- **Salah:** **(b)**, R1 se. Ek seller ko din me 1 se 2 emails, aur zaroori baat chhootti nahi.
- **Trade-off:**
  - (a) me sellers badhte hi seema khatam.
  - (b) me saar wale email ka kaam, aur khabar thodi der se.
  - (c) me settings ka kaam aur zyada emails ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, sirf zaroori, aur din ka ek saar (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-140.

### Q-082. Order ke alawa customer ki khabrein kis raaste se?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** order ke alawa customer ki khabrein (area khulne ki khabar, review likhne ki yaad, offers aur sale, points ki expiry, cart me chhoda item) kis raaste se aur kis consent se jaayein?
- **Kyun zaroori:**
  - Waitlist R1 me hai (D-046). Area khulte hi waitlist ke sab logon ko email jaaye aur log 300 se zyada hon, to us din ki seema khatam aur OTP bhi ruk sakta.
  - Marketing ke liye consent chahiye.
  - Cart ki yaad zyada ho to pareshan karne wali (dark pattern jaisi) ban sakti.
- **Vikalp:**
  - **(a) Sab email se.**
  - **(b) Muft raaste pehle, email seemit:**
    1. Offers aur marketing sirf in-app aur push, sirf alag opt-in se (sign-up pe pehle se tick nahi), kabhi bhi band.
    2. Review ki yaad, points ki expiry aur cart ki yaad: in-app aur push; cart ki yaad ek baar (misaal 24 ghante baad), opt-in se.
    3. Area khulne ki khabar: in-app aur push; email sirf unhe jinke paas push nahi, "baaki" line ki din ki chhat (Q-083) ke andar, baaki agle dinon me.
    4. Har khabar me "ye kyun mila" aur band karne ka raasta.
    5. Ek customer ko hafte me misaal 3 marketing push tak.
  - **(c) Koi marketing khabar nahi.**
- **Salah:** **(b)**: area khulne ki khabar R1 me, baaki R2 se. OTP kabhi nahi rukta, aur khabrein consent ke andar.
- **Trade-off:**
  - (a) me bade din pe OTP ruk sakta, aur consent ka jokhim.
  - (b) me push band wale customer tak kam pahunch, aur area khulne ki khabar kuch logon ko der se.
  - (c) me growth ka raasta band.
- **Kanooni detail jaanchi nahi** (R-004): marketing khabron ki consent aur band karne ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, muft raaste pehle, email seemit (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-141.

### Q-083. Emails ki har line ki din ki chhat ho ya nahi?

- **Status:** `Tay`. Topic: B11 (notifications). Group G10.
- **Sawal:** din ke 300 emails me har line (OTP, paisa, baaki; D-126 niyam 4) ki apni din ki chhat ho, taaki OTP ke liye hamesha jagah bache?
- **Kyun zaroori:**
  - D-126 niyam 4 ka kram sirf tab kaam karta hai jab emails ek saath khade hon. Subah waitlist ki khabar (D-046) ya bade recall (D-131: har customer ko email) me 300 nikal gaye, to shaam ke OTP ke liye jagah nahi bachti, chahe OTP line me sabse pehle ho.
  - Har OTP sirf email se jaata hai, to OTP ruka matlab sign-in ruka.
- **Vikalp:**
  - **(a) Koi chhat nahi:** sirf D-126 ka kram.
  - **(b) Har line ki chhat, OTP ke liye pakki jagah:**
    1. Din ke 300 me se misaal 60 sirf OTP ke liye; baaki lines milake 240 tak.
    2. "Baaki" line misaal 120 tak; paise ke emails aur D-131 wali khabar bachi jagah me.
    3. OTP apni 60 ke baad bhi koi bhi bachi jagah le sake.
    4. Chhat paar ho to wo email agle din ki line me; in-app aur push usi din.
    5. Bade burst (area khulna, recall) apne aap kai dinon me bant-te hain, chhat ke andar.
    6. Din ka 80% (misaal 240) hone pe Master aur Head of Operations ko in-app chetavni.
  - **(c) Sirf OTP ki pakki jagah:** misaal 60 OTP ke liye; baaki lines me alag chhat nahi.
- **Salah:** **(b)**, R1 se. OTP kabhi nahi rukta, aur paise ke emails "baaki" ke burst me nahi dabte.
- **Trade-off:**
  - (a) me bade din pe OTP aur sign-in ruk sakta.
  - (b) me bade recall ke emails kuch dinon me bant-te (in-app aur push usi din), aur chhat ki ginti ka kaam.
  - (c) me "baaki" ka burst paise ke emails ko agle din dhakel sakta.
- **Kanooni detail jaanchi nahi** (R-004): recall pe customer ko suchna dene ke samay ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, har line ki chhat, OTP ke liye pakki jagah (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-142.

### Q-084. Seller ko kaunsi reports milein, aur customer ki kitni jaankari dikhe?

- **Status:** `Tay`. Topic: B12 (reporting), B6 (settlement). Group G11.
- **Sawal:** seller app me seller ko apni bikri ki kaunsi reports milein, aur customer ki kitni jaankari dikhe?
- **Kyun zaroori:**
  - Fulfilment platform karta hai (D-014), to seller ko customer ke address ya phone ki zaroorat nahi.
  - Par invoice seller ke naam se banta hai (D-030), aur brands demand ka data maangte hain (kis shehar me bikta).
  - Seller ka hisaab R1 me hai (D-055).
- **Vikalp:**
  - **(a) Sab:** naam, phone, address samet.
  - **(b) Kaam ki reports, customer ki pehchaan ke bina:**
    1. Orders aur lines (variant, batch, daam, "discount kisne diya", D-101), returns wajah ke saath (D-079) aur jaanch ka nateeja (D-112), stock batch ke hisaab se umar aur expiry (D-062, D-066), settlement statement (D-081), reviews ka saar.
    2. Customer ki pehchaan: sirf order number, shehar ya district, aur pincode; naam, phone, email, address nahi.
    3. Invoice ki copy me sirf wo jo invoice pe zaroori hai.
    4. Customer ki koi list nahi; seller customer se seedha sampark nahi kar sakta.
  - **(c) Sirf jod:** order ke level ki jaankari bhi nahi.
- **Salah:** **(b)**, R1 se (reviews ka saar R2 se). Brand ko kaam ka data, aur customer ka personal data kam haathon me.
- **Trade-off:**
  - (a) me personal data bahut haathon me, aur customer se bahar sampark ka jokhim.
  - (b) me invoice ki copy ke niyam ki jaanch.
  - (c) me brand apne returns aur stock samajh nahi pata.
- **Kanooni detail jaanchi nahi** (R-004): seller ko customer ka data dena, aur invoice pe customer ki zaroori jaankari.
- **Owner ka jawab (2026-11-19):** **(b)**, kaam ki reports, customer ki pehchaan ke bina (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-143.

### Q-085. Kaun apna data file (CSV) me nikaal sake?

- **Status:** `Tay`. Topic: B12 (reporting). Group G11.
- **Sawal:** kaun apna data file (CSV) me nikaal sake, aur kis roop me?
- **Kyun zaroori:**
  - Seller apne orders aur settlement apne accounting me daalte hain, aur finance ko books chahiye.
  - Par har export personal data bahar jaane ka raasta hai.
- **Vikalp:**
  - **(a) Koi export nahi:** sirf screen pe.
  - **(b) Seemit export:**
    1. Seller: apne orders, settlement aur stock ka CSV, utni hi jaankari jitni seller ki reports me (Q-084); customer ki pehchaan nahi.
    2. Finance staff: ledger aur tax registers (R2; accounting software ka format baad me).
    3. Baaki staff: sirf apne kaam ki list, personal data chhupa ke.
    4. Har export audit me; ek export me misaal 50,000 rows tak, zyada pe saaf mana (aadhi kati file nahi).
  - **(c) Sab ko sab.**
- **Salah:** **(b)**: seller ka settlement CSV R1 me, baaki R2 se.
- **Trade-off:**
  - (a) me seller aur finance ka haath ka kaam.
  - (b) me export ke niyam aur audit.
  - (c) me data ke leak ka bada raasta.
- **Owner ka jawab (2026-11-19):** **(b)**, seemit export (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-144.

### Q-086. Demo aur dummy ka nishaan kahan dikhe?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** kin jagahon pe "demo" ya "dummy" ka nishaan dikhe?
- **Kyun zaroori:**
  - D-026: registrations aur kanooni details dummy, data ya config me.
  - Asli jaise dikhne wale invoice (GSTIN ke saath), licence number aur officers ke naam bahar galat istemaal ho sakte (nakli invoice). Dummy number kisi asli company ke number se mil sakta hai.
  - Owner ke accounts ke reviews asli customer ke reviews jaise dikhte hain, khaas kar apne brand (D-031) pe.
- **Vikalp:**
  - **(a) Kahin nahi.**
  - **(b) Har jagah jahan dhokha ho sake:**
    1. Har app ke upar patli patti: "Demo store: koi asli bikri, payment ya delivery nahi."
    2. Invoice, credit note aur payout statement ke PDF pe "SPECIMEN / DEMO: not a tax document" watermark.
    3. Har dummy registration number (GSTIN, licence, import registration, EPR) ke saath "DUMMY" badge, jahan bhi dikhe.
    4. Grievance Officer jaise officers ke liye sirf role ka naam aur `example` domain ka email; kisi insaan ka banawati naam nahi.
    5. Dummy numbers aise ki kisi asli company ke number se na milein.
    6. Demo ke reviews pe "Demo review" ka nishaan.
    7. Saare dummy values ek jagah (data ya config) ki list me (D-026).
  - **(c) Sirf site ki patti.**
- **Salah:** **(b)**, R1 se. Koi bhi page ya file bahar jaaye to bhi asli na lage.
- **Trade-off:**
  - (a) me nakli invoice aur dhokhe ka jokhim.
  - (b) me har PDF aur number ke saath kaam.
  - (c) me download hui file asli lagti.
- **Kanooni detail jaanchi nahi** (R-004): demo site pe dummy registration numbers aur invoice jaise documents.
- **Owner ka jawab (2026-11-19):** **(b)**, har jagah jahan dhokha ho sake (7 niyam). Record: [DECISIONS.md](DECISIONS.md) D-145.

### Q-087. Review me kya chhupaya ja sake, aur kya kabhi nahi?

- **Status:** `Tay`. Topic: B8 (moderation).
- **Sawal:** moderation ke niyam kya hon: kis wajah se review chhupaya ja sake, aur kis wajah se kabhi nahi?
- **Kyun zaroori:**
  - Negative review chhupana customer ke saath dhokha hai; galat content rakhna bhi jokhim hai.
  - Cosmetics ke teen khaas maamle: review me skin reaction ki baat (D-130); ilaaj jaisa daawa ("is cream se meri acne theek ho gayi", jo product ko dawa jaisa dikhata hai, D-043, D-128); aur delivery ya packaging ki shikayat (delivery hamari hai, D-014, par rating brand ki girti hai).
- **Vikalp:**
  - **(a) Tay list, negative raay kabhi wajah nahi:**
    1. Chhupane ki wajahein sirf: gaali, nafrat ya dhamki; kisi ka personal data (phone, email, address, order number); spam, link ya doosre product ya site ka prachaar; product se bilkul alag baat; nakli ya khel wala review; intimate ya kisi aur ki photo; kanooni order.
    2. Kabhi wajah nahi: kam rating, kadwi raay, brand ki aalochna, "mujhe reaction hua".
    3. Skin reaction wala review rahe, aur customer ko support ka raasta dikhe (D-130).
    4. Ilaaj jaise daawe wale review rahein; saare reviews ke upar ek tay note: "Reviews customers ki apni raay hain, ilaaj ka daawa nahi."
    5. Delivery ya packaging ki shikayat review me rahe (customer ka asli anubhav).
    6. Customer ko chhupane ki wajah dikhe; wo badal ke dobara bhej sake; ek appeal, jiska faisla doosra moderator kare (D-084 niyam 3 jaisa).
  - **(b) (a), par delivery ki shikayat bahar:** delivery ya packaging ki shikayat wale review product ki rating se bahar, aur customer ko delivery feedback me bheja jaaye.
  - **(c) Staff ki samajh:** koi tay list nahi.
- **Salah:** **(a)**, R1 se. Ek jaisa faisla, aur negative raay ki suraksha saaf. Delivery ki shikayat se brand ki rating thodi girti dikhegi, par review ko hatana ya doosri jagah bhejna customer ki raay se chhed jaisa hai.
- **Trade-off:**
  - (a) me brand ki rating pe hamari delivery ka asar.
  - (b) me customer ka review uski marzi ke bina doosri jagah.
  - (c) me har moderator ka alag faisla.
- **Kanooni detail jaanchi nahi** (R-004): negative review chhupane ke niyam, review me ilaaj ke daawe, aur user content hatane ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, tay list, negative raay kabhi wajah nahi (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-146.

### Q-088. Return ya daawa reject ho to customer appeal kar sake ya nahi?

- **Status:** `Tay`. Topic: B11 (disputes), B7 (returns).
- **Sawal:** R1 me Support Agent ne return ya daawa reject kiya (D-105), to customer dobara jaanch (appeal) maang sake ya nahi?
- **Kyun zaroori:**
  - R1 me reject ke faisle hain (D-105 niyam 1), par uske baad ka raasta nahi.
  - D-084 ka niyam (jisne reject kiya wo appeal tay nahi karta) sirf seller aur listing ke liye hai.
  - Owner kai accounts se kaam karta hai (D-017), to "doosra insaan" ka matlab doosra role aur account.
- **Vikalp:**
  - **(a) R1 me appeal nahi:** reject aakhri, wajah ke saath.
  - **(b) Ek appeal:** reject ke misaal 7 din me, naye saboot ke saath; faisla Support Lead role kare (wo account jisne reject nahi kiya); faisla misaal 3 kaam ke din me; uske baad aakhri.
  - **(c) Kitni bhi appeals.**
- **Salah:** **(b)**, R1 me chhota jod. Galat reject ka sudhaar, aur bojh seemit. R1 me Support Lead role chalu karna chhota kaam hai (D-054).
- **Trade-off:**
  - (a) me galat reject ka koi raasta nahi.
  - (b) me R1 me ek aur role.
  - (c) me ek hi maamla baar-baar.
- **Owner ka jawab (2026-11-19):** **(b)**, ek appeal, Support Lead ke faisle se. Record: [DECISIONS.md](DECISIONS.md) D-147.

### Q-089. "Parcel nahi mila" ke daawe ki samay-seema kitni?

- **Status:** `Tay`. Topic: B11 (disputes), B1 (delivery).
- **Sawal:** "parcel nahi mila" ke daawe (D-072) ki samay-seema kitni ho, aur kab se gini jaaye?
- **Kyun zaroori:**
  - D-072 niyam 3 me samay sirf misaal (48 ghante) hai, aur number support ki charcha ko diya gaya tha. R1 me daawa hai (D-105).
  - Code se pakki delivery pe daawa maana nahi jaata (D-072). To samay asal me un deliveries ke liye hai jahan code nahi mila (photo aur location, D-072 niyam 2): wahan kisi aur ne parcel liya ho sakta hai, aur customer ko der se pata chalta hai.
- **Vikalp:**
  - **(a) Sab pe 48 ghante,** "delivered" scan se.
  - **(b) Saboot ke hisaab se:** code se delivered pe 48 ghante (daawa darj hota hai, par D-072 ke niyam se maana nahi jaata); sirf photo aur location wali delivery pe misaal 7 din; dono "delivered" scan se.
  - **(c) Sab pe 7 din.**
- **Salah:** **(b)**, R1 se. Jahan saboot kamzor hai wahan customer ko poora samay, aur code wali delivery pe lambe samay ka koi fayda nahi.
- **Trade-off:**
  - (a) me ghar se bahar gaya customer chhoot sakta.
  - (b) me do samay-seemaayein.
  - (c) me code wali delivery pe bhi lamba khula maamla.
- **Owner ka jawab (2026-11-19):** **(b)**, saboot ke hisaab se samay-seema. Record: [DECISIONS.md](DECISIONS.md) D-148.

### Q-090. R1 me owner ko kaunse aankde dikhein?

- **Status:** `Tay`. Topic: B12 (analytics).
- **Sawal:** R1 me owner ko (Master aur Head of Operations ke accounts pe) kaunse aankde dikhein?
- **Kyun zaroori:**
  - R1 ka lakshya poora flow parkhna hai (D-055); bina aankdon ke pata nahi chalta flow kahan tootta hai.
  - Har aankde ka data R1 ke events me pehle din se chahiye; baad me jodna mushkil.
- **Vikalp:**
  - **(a) Kuch nahi:** sirf orders ki list.
  - **(b) Chhota set** (din, hafta, mahina):
    1. Orders, GMV (MRP aur diya hua daam dono), average order value.
    2. Cancel % (wajah se), RTO % (D-108), pehli koshish me delivery %, vaade pe delivery % (D-117).
    3. Return % (wajah aur category se, D-079), refund ka samay (D-111), daawon ki ginti (D-072).
    4. Stock: bikne layak, ruka hua aur near-expiry ki rakam (D-062, D-089); storage fee wala maal (D-066).
    5. Waitlist ki ginti district se (D-046); zero result wali searches.
  - **(c) (b) + target aur alert:** har aankde ka target, tootne pe in-app alert.
- **Salah:** **(b)** R1 me; (c) ka target aur alert R2 se.
- **Trade-off:**
  - (a) me flow ki kamzori chhupi rehti hai.
  - (b) me events aur roz ke jod ka kaam.
  - (c) me targets ki setting aur alerts ka kaam.
- **Owner ka jawab (2026-11-19):** **(b)**, chhota set; target aur alert R2 se. Record: [DECISIONS.md](DECISIONS.md) D-149.

### Q-091. Legal pages me kya likha ho?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** Terms, Privacy, Return, Shipping, Grievance aur Seller agreement jaise pages me kya likha ho?
- **Kyun zaroori:**
  - Sign-up pe customer inhe maanta hai (consent ka record, version ke saath), aur seller agreement seller ke judne pe.
  - Return, refund, cancel aur delivery fee ke niyam ab tay hain (D-079, D-080, D-107, D-108, D-110, D-111, D-114), to pages unse mel khane chahiye.
- **Vikalp:**
  - **(a) Placeholder:** "ye demo text hai", koi niyam nahi.
  - **(b) Tay faislon se asli jaisa draft:**
    1. Claude tay faislon se pages likhe.
    2. Har page pe "DUMMY: lawyer se jaancha nahi" badge aur version.
    3. Terms ya Privacy ka bada badlav ho to agle sign-in pe naya consent.
    4. Return aur Shipping pages ke number policy ki settings se aayein (ek baat ek jagah).
  - **(c) Kisi template site se copy.**
- **Salah:** **(b)**, R1 se (sign-up ka consent R1 me). Customer ko site ke asli niyam dikhte hain, aur design asli rehta hai (D-026).
- **Trade-off:**
  - (a) me consent ka koi matlab nahi, aur niyam kahin likhe nahi.
  - (b) me pages likhne aur version rakhne ka kaam.
  - (c) me copyright aur galat niyam ka jokhim.
- **Kanooni detail jaanchi nahi** (R-004): in pages ke zaroori hisse.
- **Owner ka jawab (2026-11-19):** **(b)**, tay faislon se asli jaisa draft (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-150.

### Q-092. Customer apne data ke kaunse haq app me khud chala sake?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** customer apne data ke kaunse haq app me khud chala sake, aur kab se?
- **Kyun zaroori:**
  - Live site pe asli personal data hai (owner aur testers ka): profile sudhaarna, marketing ki consent band karna, account delete karna, apna data download karna.
  - Kuch records kanoon se rakhne padte hain (invoice, ledger, tax), to delete pe unme se pehchaan hatani padti hai.
- **Vikalp:**
  - **(a) Koi self-service nahi:** sab support se (R2).
  - **(b) Zaroori R1 me, baaki R2:**
    1. R1: profile sudhaar; marketing consent band; account delete (chalte orders, returns aur refunds ke baad; misaal 7 din ka wapas lene ka samay; invoice aur ledger me naam, pata aur email hata ke ek code).
    2. R2: poore data ka download (file, app se; email attachment nahi), consent ka itihaas, data request ka ticket aur tay samay.
  - **(c) Sab R1 me.**
- **Salah:** **(b)**. Asli data pe zaroori haq pehle din se, aur bada kaam support desk ke saath.
- **Trade-off:**
  - (a) me R1 me asli data pe koi haq nahi.
  - (b) me delete ke saath pehchaan hatane ka kaam R1 me.
  - (c) me R1 bhaari.
- **Kanooni detail jaanchi nahi** (R-004): data ke haq, jawab ka samay, aur records rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(b)**, zaroori haq R1 me, baaki R2 se. Record: [DECISIONS.md](DECISIONS.md) D-151.

### Q-093. Search me kuch na mile to kya ho, aur synonyms kaun sambhale?

- **Status:** `Tay`. Topic: B9 (search).
- **Sawal:** search me kuch na mile to customer ko kya dikhe, aur ek cheez ke kai naam (synonyms) ki list aur na mile shabdon ki report kaun sambhale?
- **Kyun zaroori:**
  - Beauty me ek cheez ke kai naam aur spelling aam hain (sunscreen aur sunblock, moisturiser aur moisturizer, eyeliner aur kohl).
  - Zero result pe customer chala jaata hai, aur na mile shabd batate hain ki kaunsa brand ya product laana chahiye.
- **Vikalp:**
  - **(a) Saada:** "kuch nahi mila" aur categories ki list.
  - **(b) Madad aur report:**
    1. Spelling ki galti pe "kya aapka matlab ..." ka sujhaav, milte-julte products, popular categories.
    2. Synonyms ki list staff setting se, bina deploy (D-037 ki soch).
    3. Zero result wale shabd har hafte ki report me.
    4. R1 me ye kaam catalog ki jaanch wali team (D-084, Admin app) kare; Growth Studio (D-010) bane to wahan.
    5. Customer "ye brand ya product chahiye" ki request de sake (sign-in se): R2.
  - **(c) (b) + apne aap seekhne wale synonyms.**
- **Salah:** **(b)**: niyam 1 se 4 R1 me, niyam 5 R2 se. Kam kaam me customer rukta hai, aur demand ka data milta hai.
- **Trade-off:**
  - (a) me customer khota.
  - (b) me synonyms ki list ka haath ka kaam.
  - (c) me technique ka bojh aur galat synonyms ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, madad aur report (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-152.

### Q-094. Stock khatam product dikhe ya chhupe?

- **Status:** `Tay`. Topic: B9 (search), B11 (notifications).
- **Sawal:** stock khatam variant ya product search aur listing me dikhe ya chhupe, aur customer "stock aane pe batao" chun sake ya nahi?
- **Kyun zaroori:**
  - Maal ek warehouse (D-014) me hai, to stock khatam matlab har jagah khatam.
  - Chhupane se customer wapas nahi aata; dikhane se kram aur khabar ka sawal uthta hai.
  - D-046 sirf area ka waitlist hai, stock ka nahi. Khabar ka raasta 300 emails (D-028) me.
- **Vikalp:**
  - **(a) Chhupe:** stock khatam product search aur listing me nahi.
  - **(b) Dikhe, khabar ke saath:**
    1. "Out of stock" ke saath dikhe, kram me neeche.
    2. Product page pe "stock aane pe batao" (sign-in se).
    3. Khabar sirf in-app aur browser push se, email nahi.
    4. Request misaal 90 din me khatam.
    5. Seller ko "kitne log ruke hain" ki ginti.
  - **(c) Dikhe, bina khabar.**
- **Salah:** **(b)**: dikhana R1 me, khabar R2 se. Customer ka intent nahi khota, seller ko maal bhejne ka signal milta hai, aur email ka bojh nahi.
- **Trade-off:**
  - (a) me customer aur demand ka signal dono khote.
  - (b) me khabar ka kaam.
  - (c) me customer ko baar-baar dekhna padta.
- **Owner ka jawab (2026-11-19):** **(b)**, dikhe, khabar ke saath (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-153.

### Q-095. Customer ko "Bestseller" ya "kam stock" jaise aankde dikhein ya nahi?

- **Status:** `Tay`. Topic: B12 (analytics), B9 (listing).
- **Sawal:** product page aur listing pe "Bestseller", "is hafte 100+ ne kharida", "sirf 3 bache" jaise aankde dikhein ya nahi?
- **Kyun zaroori:**
  - Ye bikri badhate hain, par galat ya bana hua aankda jhoothi jaldi (dark pattern) hai.
  - Apne brand (D-031) pe bhi wahi niyam.
- **Vikalp:**
  - **(a) Koi aisa aankda nahi.**
  - **(b) Sirf sach, tay niyam se:**
    1. "Bestseller": category me pichhle 30 din ki bikri ke top 10 me (misaal).
    2. "Kam stock": sirf jab bikne layak stock misaal 5 se kam ho, asli ginti ke saath.
    3. "X ne kharida" nahi (chhoti ginti pe gumraah karta hai).
    4. Countdown timer sirf jab offer ka asli khatam hone ka samay ho (offers R2 se).
    5. Har niyam ek policy page pe.
  - **(c) Marketing ki marzi se.**
- **Salah:** **(b)**: "Bestseller" aur "kam stock" R1 me, countdown R2 se. Sach aankde customer ke kaam ke hain, aur niyam se bana aankda jhooth nahi ban sakta.
- **Trade-off:**
  - (a) me sach aankdon ka fayda bhi nahi.
  - (b) me niyam ki ginti aur policy page ka kaam.
  - (c) me dark pattern ka seedha jokhim.
- **Kanooni detail jaanchi nahi** (R-004): jhoothi jaldi aur kam stock dikhane ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, sirf sach aankde, tay niyam se (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-154.

### Q-096. Review me customer photo jod sake ya nahi?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** review me customer photo jod sake ya nahi, aur kab se?
- **Kyun zaroori:**
  - Skin pe lagaye shade ki asli photo cosmetics me sabse kaam ki jaankari hai, aur khareedne se pehle shade ka darr kam karti hai.
  - Par photo me chehra, ghar, address label ya twacha ki bimari aa sakti hai; har photo jaanchni padegi.
  - Photo upload ka raasta R1 me daawe ke liye pehle se ban raha hai (D-106).
- **Vikalp:**
  - **(a) R2 se:** R1 me sirf text aur star; photo R2 me, har photo staff ki jaanch ke baad.
  - **(b) R1 se, har photo jaanch ke baad:** ek review me zyada se zyada misaal 3 photos; har photo staff ki jaanch ke baad live; chehra dikhe to customer ka "ye meri photo hai aur dikhane ki ijazat hai" tick zaroori; address label, doosre insaan ya intimate photo pe reject; video nahi.
  - **(c) Photo aur video R1 se.**
- **Salah:** **(b)**, R1 me chhota jod. Upload ka kaam R1 me pehle se hai, har photo jaanch se guzarti hai to jokhim kam, aur R1 me do sellers ke saath photos kam hongi. Video nahi: jagah, data aur jaanch ka bojh.
- **Trade-off:**
  - (a) me R1 ke reviews kam kaam ke.
  - (b) me har photo ek insaan ki queue me.
  - (c) me video ki jagah aur jaanch ₹0 (D-028) pe bhaari.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo (chehra) rakhne aur dikhane ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, R1 se, har photo jaanch ke baad. Record: [DECISIONS.md](DECISIONS.md) D-155.

### Q-097. Nakli review pakda jaaye to kya karwai ho?

- **Status:** `Tay`. Topic: B8 (moderation), B14 (abuse).
- **Sawal:** nakli review ya rating ke saath khel (brand ke log khud order karke review, paid reviews, ek insaan ke kai accounts) pakda jaaye to kis pe kya karwai ho?
- **Kyun zaroori:**
  - Verified purchase se bhi khel ho sakta hai: brand khud kam daam ke orders karke review likhe. Apna brand (D-031) bhi isi niyam me.
  - Ek insaan ke kai email (`+` alias, D-017) se kai accounts banana aasaan hai.
- **Vikalp:**
  - **(a) Sirf review hatao.**
  - **(b) Seedhi karwai:**
    1. Review hatao, wajah ke record ke saath.
    2. Customer: pehli baar chetavni; dobara to review likhna band (misaal 6 mahine); staff wajah ke saath khol sake.
    3. Seller: brand ke staff ya brand ke kahe pe review sabit ho to chetavni; dobara to us brand ki listings rokna, aur aage account band, Trust & Safety ke faisle se (D-047).
    4. Kisi product ke bahut reviews hatein to uski rating dobara gini jaaye, aur seller ko wajah dikhe.
    5. Seller app ke users (brand ka staff) apne brand ke product pe review nahi likh sakte (system ki rok).
  - **(c) Account turant band.**
- **Salah:** **(b)**: niyam 1 aur 5 R1 me, baaki R2 se (Trust & Safety ke saath). Saza galti ke hisaab se, galat pakde gaye ke liye raasta khula, aur brand ke apne staff pe system ki rok.
- **Trade-off:**
  - (a) me khel karne wale pe koi rok nahi.
  - (b) me record, seedhi aur appeal ka kaam.
  - (c) me galat faisle ka bada jokhim.
- **Kanooni detail jaanchi nahi** (R-004): nakli reviews pe platform ki zimmedari.
- **Owner ka jawab (2026-11-19):** **(b)**, seedhi karwai (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-156.

### Q-098. Customer ke behaviour ka data lein ya nahi?

- **Status:** `Tay`. Topic: B12 (analytics).
- **Sawal:** customer site pe kya dekhta, khojta aur cart me daalta hai, iska data lein ya nahi, aur kya ye bahar ki kisi analytics service ko jaaye?
- **Kyun zaroori:**
  - Funnel (dekha, cart, order) ke bina pata nahi chalta customer kahan rukta hai.
  - Par bahar ki service ko data jaana matlab cookie aur consent ka kaam aur privacy ka jokhim; apne database me rakhna Atlas ki 0.5 GB (R-006) ki jagah khaata hai.
- **Vikalp:**
  - **(a) Sirf business events:** server ke events (order, cancel, return, search ke shabdon ki ginti); koi page-level tracking nahi.
  - **(b) (a) + apna halka page data:** bina personal pehchaan ke din ki ginti (kis product ka page kitni baar khula, kitne cart me gaye); kachcha data misaal 30 din, phir sirf din ka jod; bahar koi service nahi.
  - **(c) Bahar ki free analytics service,** cookie consent ke saath.
- **Salah:** **(b)**: R1 me sirf (a) ke business events, page ka halka data R2 se. Funnel ka moota roop milta hai, data bahar nahi jaata, aur jagah seemit rehti hai.
- **Trade-off:**
  - (a) me funnel nahi.
  - (b) me apna halka tracking aur jod ka kaam.
  - (c) me consent ka banner, data bahar, aur page pe bahar ki script.
- **Kanooni detail jaanchi nahi** (R-004): tracking aur cookies ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, R1 me business events, halka page data R2 se. Record: [DECISIONS.md](DECISIONS.md) D-157.

### Q-099. Muft mile product ya inaam wale review ka niyam kya ho?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** jis customer ko product muft mila (brand ka sample ya gift, creator ko brand ka bheja product), ya jise review ke badle kuch mile, uske review ka niyam kya ho?
- **Kyun zaroori:**
  - Muft ya inaam wale reviews rating ko upar jhukate hain, aur chhupa inaam customer ke saath dhokha hai.
  - Samples aur gifts (D-121) R2 me aate hain, creators ka kaam Creator app (D-010) me hai, aur loyalty me "review pe points" aam tareeka hai.
- **Vikalp:**
  - **(a) Koi inaam nahi:** ₹0 wali line (sample ya gift, D-121) pe review ka haq nahi; review ke badle koi points, coupon ya inaam nahi (na platform, na brand); brand customer se review ke liye seedha sampark nahi kar sakta.
  - **(b) Label ke saath:**
    1. ₹0 wali line ya brand ke bheje product pe review ho sake, "Muft mila product" label ke saath.
    2. Inaam sirf review likhne pe, rating dekh ke kabhi nahi; label "Inaam mila".
    3. Label wale reviews rating me nahi gine jaate, alag dikhte hain.
    4. Brand khud inaam nahi de sakta, sirf platform ke program se.
  - **(c) Inaam, bina label.**
- **Salah:** **(a)**: niyam R1 se (R1 me ₹0 line nahi aati, par rok code me). Sabse saaf aur sabse zyada bharosa. Baad me review ke badle inaam chahiye ho to (b) ka label wala raasta khula hai.
- **Trade-off:**
  - (a) me reviews kam aate hain.
  - (b) me label, alag ginti aur inaam ke niyam.
  - (c) me bharosa aur kanoon dono ka jokhim.
- **Kanooni detail jaanchi nahi** (R-004): inaam ya muft product wale review aur endorsement ke label ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, koi inaam nahi. Record: [DECISIONS.md](DECISIONS.md) D-158.

### Q-100. Allergen ki chetavni sabke liye ek jaisi ho ya customer ke hisaab se?

- **Status:** `Tay`. Topic: B3 (catalog), B9 (search).
- **Sawal:** D-099 ki allergen ki chetavni sab customers ko ek jaisi ho (product me jaane-maane allergens), ya customer ki apni allergy ke hisaab se?
- **Kyun zaroori:**
  - D-099 ki chetavni R1 me hai, par ye saaf nahi ki kis tarah ki.
  - Customer ke hisaab se chetavni ke liye uski allergy ka data chahiye, jo sehat ke paas ka data hai (consent aur suraksha, Security Architect ke saath, B14). R1 me ye data kahin tay nahi.
- **Vikalp:**
  - **(a) Hamesha sabke liye ek jaisi:** product page pe jaane-maane allergens (jaise fragrance ke allergens) ki chetavni, structured list (D-099 niyam 2) se; customer ka koi data nahi.
  - **(b) Customer ke hisaab se, R1 se:** customer profile me apni allergy ke ingredients chune (consent ke saath); un ingredients wale product pe use chetavni.
  - **(c) R1 me sabke liye ek jaisi; customer ke hisaab se baad me,** jab customer ki allergy ka data aur uski consent tay ho.
- **Salah:** **(c)**. R1 me koi sehat ka data nahi chahiye, chetavni har customer ko dikhti hai, aur personal chetavni ka raasta khula rehta hai.
- **Trade-off:**
  - (a) me customer ko apni allergy ke hisaab se madad kabhi nahi.
  - (b) me R1 me sehat ke data ka kaam aur consent.
  - (c) me personal chetavni ka intezaar.
- **Kanooni detail jaanchi nahi** (R-004): allergens dikhane ke niyam, aur sehat ke data ki consent.
- **Owner ka jawab (2026-11-19):** **(c)**, R1 me sabke liye ek jaisi, customer ke hisaab se baad me. Record: [DECISIONS.md](DECISIONS.md) D-159.

### Q-101. Brand review ka jawab de sake ya nahi?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** brand (seller) kisi review ka public jawab de sake ya nahi, aur kisi review ko galat maane to kya kar sake?
- **Kyun zaroori:**
  - Brand ka jawab ("is shade ke liye ye try karein", "batch dekh rahe hain") customer ka bharosa badhata hai.
  - Par brand reviewer pe review hatane ka dabaav daal sakta hai, ya apne khilaaf review hatwane ki koshish kar sakta hai. Apna brand (D-031) bhi isi niyam me.
- **Vikalp:**
  - **(a) Jawab nahi:** seller sirf apne products ke reviews dekhe aur report kare.
  - **(b) Ek public jawab, niyam ke saath:**
    1. Har review pe ek jawab (edit ho sake), reviews wale moderation niyam (D-136, D-146) se.
    2. Seller ko reviewer ka sirf chhota naam dikhe, koi contact detail kabhi nahi (D-143).
    3. Seller report kare (wajah ke saath), faisla moderator ka; seller review hata ya badal nahi sakta.
    4. Jawab me coupon, offer ya bahar sampark ka raasta nahi.
  - **(c) Jawab bina moderation.**
- **Salah:** **(b)**: reviews dekhna R1 me (seller app), jawab aur report R2 se. Brand ki baat aur customer ki suraksha dono.
- **Trade-off:**
  - (a) me brand ki baat customer tak nahi pahunchti.
  - (b) me jawab bhi moderation ki queue me.
  - (c) me brand ka jawab bina jaanch live.
- **Owner ka jawab (2026-11-19):** **(b)**, ek public jawab, niyam ke saath (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-160.

### Q-102. Support ticket kaun bana sake, kis raaste se, aur kin categories me?

- **Status:** `Tay`. Topic: B11 (support). Group G12.
- **Sawal:** support ticket kaun bana sake, kis raaste se, aur kin categories me?
- **Kyun zaroori:**
  - Tickets R2 me hain (D-105 niyam 3). Domain nahi (D-028), to support ke email pe aaya sawal apne aap ticket nahi ban sakta; live chat bhi nahi (D-025).
  - Har category ka sahi team tak pahunchna aur order se judna jaanch ka samay bachata hai.
- **Vikalp:**
  - **(a) Sirf signed-in customer,** app ke form se, order se juda.
  - **(b) Kai log, tay categories:**
    1. Signed-in customer aur seller apne app se (order, parcel ya line chun ke); bina sign-in "Contact us" form (email zaroori; jab tak D-133 ki allowlist hai, sirf allowlist ke emails se); delivery partner Delivery app se apne maamle (kamaai, kaat).
    2. Categories platform ki list se, har ek ka tay raasta: order ki haalat; cancel, return, refund; parcel nahi mila (D-072); toota ya galat item (D-106); payment kata par order nahi; account aur sign-in; product ya shade ka sawal (Beauty Advisor, D-025); skin reaction (D-130); review ya content ki shikayat; privacy ya data ki request (D-151); delivery partner ka vyavhaar; seller ke maamle.
    3. Ticket ki baat-cheet in-app; jawab aane pe push; push band ho to email sirf tab jab customer ka jawab chahiye (D-131 jaisa), emails ki chhat (D-142) ke andar.
    4. Band hone pe ek sawal ka chhota survey (in-app).
  - **(c) (b) + live chat.**
- **Salah:** **(b)**, R2 se. Sab paksh ek hi desk pe, aur email ki seema pe bojh nahi.
- **Trade-off:**
  - (a) me seller, partner aur bina sign-in wale ke liye raasta nahi.
  - (b) me categories aur raaston ki setting.
  - (c) me ek insaan ko screen pe baithe rehna padta, aur server so jaata hai (D-028).
- **Owner ka jawab (2026-11-19):** **(b)**, kai log, tay categories (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-161.

### Q-103. Ticket ka SLA aur support ke kaam ke ghante kya hon?

- **Status:** `Tay`. Topic: B11 (support). Group G12.
- **Sawal:** har category (Q-102) ke ticket ka pehla jawab aur hal kitne samay me ho, aur support ke kaam ke ghante kya hon?
- **Kyun zaroori:**
  - Ek insaan (D-009) 24 ghante support nahi de sakta; SLA kaam ke ghanton me gina jaaye to vaada sach rehta hai.
  - Paise wale maamle aur skin reaction jaldi chahiye.
- **Vikalp:**
  - **(a) Ek SLA sab pe:** pehla jawab 24 kaam ke ghante, hal 3 kaam ke din.
  - **(b) Category ke hisaab se:**
    1. Paisa (kata par order nahi, refund nahi aaya) aur skin reaction: pehla jawab 4 kaam ke ghante, hal 1 kaam ka din (misaal).
    2. Baaki: 24 kaam ke ghante aur 3 kaam ke din; Beauty Advisor ka sawal 1 kaam ka din (misaal).
    3. Kaam ke ghante misaal Monday se Saturday 10:00 se 18:00 IST; chhuttiyan setting me (D-117 jaisa).
    4. Customer ke jawab ke intezaar me timer ruke; misaal 7 din jawab na aaye to ticket band (dobara khul sake).
    5. SLA tootne pe Support Lead ko in-app alert.
  - **(c) Koi SLA nahi.**
- **Salah:** **(b)**, R2 se. Zaroori maamle pehle, aur ek insaan ke liye sach vaada.
- **Trade-off:**
  - (a) me paise wala maamla bhi dheema.
  - (b) me timers aur calendar ka kaam.
  - (c) me customer ko koi umeed nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, category ke hisaab se SLA (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-162.

### Q-104. Support ke faisle se santusht na ho to aage ka raasta, aur Grievance Officer?

- **Status:** `Tay`. Topic: B11 (support), B13 (compliance).
- **Sawal:** customer support ke faisle se santusht na ho to aage ka raasta kya ho, aur Grievance Officer ka kaam kaise chale?
- **Kyun zaroori:**
  - E-commerce ke consumer niyam grievance officer, shikayat ki receipt aur tay samay me hal maang sakte hain; reviews jaise user content ki shikayat ke alag samay ho sakte hain.
  - D-134 me Grievance Officer aur shikayatein L3 hain: page R1 me, raasta R2 me. Officer ki jaankari dummy hai (D-145 niyam 4).
- **Vikalp:**
  - **(a) Alag raasta nahi:** sab ek hi queue me.
  - **(b) Seedhi aur register:**
    1. Support Agent, phir Support Lead (appeal, D-147), phir Grievance Officer.
    2. "Grievance" ka alag form (bina sign-in bhi), ticket number turant.
    3. Receipt aur hal ke timers (misaal 48 ghante aur 30 din); review ya content ki shikayat ka chhota timer (misaal 24 ghante me receipt).
    4. Grievance register: har shikayat, faisla aur samay; mahine ki report Head of Operations ko (D-044).
    5. Grievance Officer ka role alag account pe (D-017).
  - **(c) (b), bina register.**
- **Salah:** **(b)**: site pe Grievance Officer ka saada page R1 se (D-134), poora raasta R2 se.
- **Trade-off:**
  - (a) me gambhir shikayat aam queue me dab jaati hai.
  - (b) me register aur timers ka kaam.
  - (c) me shikayaton ka record nahi.
- **Kanooni detail jaanchi nahi** (R-004): grievance officer, receipt aur hal ke samay, aur user content ki shikayat ke samay.
- **Owner ka jawab (2026-11-19):** **(b)**, seedhi aur register (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-163.

### Q-105. Seller ya delivery partner platform ke faisle se asehmat ho to?

- **Status:** `Tay`. Topic: B11 (disputes), B6 (settlement).
- **Sawal:** seller ya delivery partner platform ke kisi faisle (receiving ka farak, return pe "brand ki galti", bharpai, kaat, payout) se asehmat ho to raasta kya ho?
- **Kyun zaroori:**
  - D-096 (receiving ka farak), D-112 (brand ki galti ka kharcha seller ka), D-063 (bharpai), D-068 aur D-103 (partner ki kaat, "unki baat sun ke") aur D-081 (payout): har jagah faisla platform ka, par asehmati ka raasta tay nahi.
  - D-084 niyam 3 sirf listing ke liye hai.
- **Vikalp:**
  - **(a) Ticket:** seller ya partner ticket bheje, staff dekhe, koi tay samay nahi.
  - **(b) "Dispute" ek alag kaam:**
    1. Faisle ke misaal 7 din (seller) ya 3 din (partner) me, saboot ke saath.
    2. Faisla us team ka senior kare jo pehle faisle me nahi tha (D-084 niyam 3 jaisa).
    3. Faisla misaal 5 kaam ke din me.
    4. Dispute chalte us rakam pe rok (payout ki hold, ya kaat ruki).
    5. Har dispute ka record; seller ke payout statement me dispute ki line.
  - **(c) Sirf Finance tay kare.**
- **Salah:** **(b)**, R2 se. Saaf samay, nishpaksh faisla, aur jhagde ki rakam ka hisaab saaf.
- **Trade-off:**
  - (a) me maamle latakte hain.
  - (b) me dispute ka naya kaam aur rakam ki hold.
  - (c) me operations ke maamle Finance ke paas.
- **Owner ka jawab (2026-11-19):** **(b)**, dispute ek alag kaam (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-164.

### Q-106. Customer apni beauty profile save kar sake ya nahi?

- **Status:** `Tay`. Topic: B9 (personalisation), B14 (privacy). Group G13.
- **Sawal:** customer apni beauty profile (skin type, depth aur undertone, concerns, aur jinse allergy hai wo ingredients) save kar sake ya nahi, aur uska istemaal kahan ho?
- **Kyun zaroori:**
  - Shade finder, sujhaav aur "meri skin ke liye" filter isi pe tikte hain.
  - D-159 me customer ki apni allergy ke hisaab se chetavni baad ke liye rakhi gayi, jab allergy ka data aur consent tay ho; ye sawal wahi tay karta hai.
  - Allergy aur skin concerns sehat ke paas ka data hain.
- **Vikalp:**
  - **(a) Profile nahi:** chetavni sabke liye ek jaisi hi (D-159).
  - **(b) Optional profile, allergens samet:**
    1. Fields: skin type, depth aur undertone (D-085 ki list), concerns (D-137 ki list), allergy wale ingredients (ingredient master list, D-132, se chune).
    2. Istemaal: product page aur cart pe personal allergen chetavni, search me "meri skin ke liye" ka switch, shade finder.
    3. Chetavni ke saath hamesha "pack ki list se mila ke dekhein" (master list se milan galat ho sakta hai).
    4. Alag consent ("is jaankari se mujhe salah do"); customer kabhi bhi badle ya mitaye.
    5. Seller ko kabhi nahi; staff sirf tab jab customer khud support me bataye.
  - **(c) (b), bina allergens.**
- **Salah:** **(b)**, R2 se. Cosmetics me personal allergen chetavni sabse bada suraksha fayda hai.
- **Trade-off:**
  - (a) me personal suraksha nahi.
  - (b) me sehat ke paas ka data, consent, aur kam log hi dekhein.
  - (c) me suraksha wala hissa chhoot jaata hai.
- **Kanooni detail jaanchi nahi** (R-004): sehat ke paas ke data ki consent aur rakhna.
- **Owner ka jawab (2026-11-19):** **(b)**, optional profile, allergens samet (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-165.

### Q-107. Product sujhaav (recommendations) kis tarah ke hon?

- **Status:** `Tay`. Topic: B9 (recommendations). Group G13.
- **Sawal:** product sujhaav kis tarah ke hon, aur customer ki kharid ya profile (Q-106) ka istemaal ho ya nahi?
- **Kyun zaroori:**
  - "Is ke saath" aur routine (cleanser, serum, moisturiser, sunscreen) cosmetics me bikri badhate hain.
  - Personal data se sujhaav ke liye consent chahiye.
  - Apne brand (D-031) ko sujhaav me aage rakhna wahi anyay ka sawal hai jo search me (D-139).
- **Vikalp:**
  - **(a) Sirf product data se:** "milte-julte" (category, concern, daam), "isi brand ke aur"; koi personal data nahi.
  - **(b) (a) + kharid aur profile se:**
    1. Sab customers ki kharid ke jod se "saath me kharide gaye" (kisi ek customer ki baat nahi).
    2. Staff ki banayi routine templates se "routine poora karo".
    3. Sign-in customer ko uski profile aur pichhli kharid se, sirf consent ho to.
    4. Kram ki wahi niti jo search me: kisi seller ko boost nahi (D-139 niyam 3).
  - **(c) Bahar ki recommendation service.**
- **Salah:** **(b)**, R2 se. Kaam ke sujhaav, consent ke andar, aur sab sellers ke saath ek niyam.
- **Trade-off:**
  - (a) me personal madad nahi.
  - (b) me routine templates ka staff kaam aur consent ka hisaab.
  - (c) ₹0 me nahi, aur data bahar.
- **Kanooni detail jaanchi nahi** (R-004): personal data se sujhaav ki consent, aur apne brand ke prachaar me customer data.
- **Owner ka jawab (2026-11-19):** **(b)**, product data + kharid aur profile se (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-166.

### Q-108. Review ke saath reviewer apni skin ki jaankari bata sake?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** review ke saath customer apni skin type, depth aur undertone, aur umar ka group (sab optional) bata sake, aur product page pe reviews inse filter ho sakein?
- **Kyun zaroori:**
  - Cosmetics me "meri jaisi skin wale ko kaisa laga" sabse aam sawal hai. Review pe variant (shade) pehle se tay hai (D-076 niyam 5), par oily ya sensitive skin, ya undertone ka filter nahi.
  - Ye personal data hai; skin ki bimari (acne, eczema) sehat ke paas ka data hai. D-038 me sirf 18+ ki ghoshna hai, umar ka group naya data hoga.
- **Vikalp:**
  - **(a) Sirf variant:** review pe variant dikhe aur usi ka filter.
  - **(b) Optional fields, platform ki list se:** skin type (oily, dry, combination, normal, sensitive), depth aur undertone (D-085 ki list), umar ka group (misaal 18 se 24, 25 se 34, 35 se 44, 45+); review pe dikhe aur inse filter; skin ki bimari ka koi field nahi.
  - **(c) (b) + concerns** (acne, pigmentation jaise) bhi.
- **Salah:** **(b)**, R2 se (R1 me sirf variant). Sabse kaam ka filter, aur sehat wala data bahar.
- **Trade-off:**
  - (a) me shade ke alawa koi madad nahi.
  - (b) me thoda aur personal data aur uski consent.
  - (c) me sehat ke paas ka data public review pe.
- **Kanooni detail jaanchi nahi** (R-004): review ke saath dikhne wala personal data.
- **Owner ka jawab (2026-11-19):** **(b)**, optional fields, platform ki list se. Record: [DECISIONS.md](DECISIONS.md) D-167.

### Q-109. Shade finder kis tareeke se shade sujhaye?

- **Status:** `Tay`. Topic: B9 (shade finder).
- **Sawal:** shade finder (R2, D-085) kis tareeke se shade sujhaye?
- **Kyun zaroori:**
  - Foundation aur concealer me galat shade sabse aam pareshani hai, aur khula product man badla pe nahi lautta (D-079).
  - D-085 ka data (depth, undertone, shade family) isi ke liye hai.
- **Vikalp:**
  - **(a) Sawal-jawab:** depth, undertone (aasaan pehchaan: nas ka rang, sone ya chandi ka gehna kis pe achha lagta), finish aur coverage ki pasand; D-085 ke data se har brand ke milte shades.
  - **(b) (a) + "jo shade abhi lagate ho":** customer platform pe listed kisi bhi brand ka apna abhi ka product aur shade chune; usi ki depth aur undertone se doosre brands ke milte shades. Data sirf listed products ka.
  - **(c) Camera se skin tone padhna.**
- **Salah:** **(b)**, R2 se. Customer ka asli anubhav (jo shade use pehle se jachta hai) sabse achha aadhaar hai. (c) abhi nahi: roshni aur camera ke hisaab se galat nateeje, aur chehre ki photo ka jokhim.
- **Trade-off:**
  - (a) me customer ki apni pehchaan galat ho sakti hai.
  - (b) me brands ke beech mel sirf D-085 ke moote data se.
  - (c) me galat nateeje aur privacy ka jokhim.
- **Owner ka jawab (2026-11-19):** **(b)**, sawal-jawab + abhi ka shade. Record: [DECISIONS.md](DECISIONS.md) D-168.

### Q-110. Virtual try-on kis roop me ho?

- **Status:** `Tay`. Topic: B9 (try-on).
- **Sawal:** virtual try-on kis roop me ho, kin products pe, aur customer ki photo ya video ka kya ho?
- **Kyun zaroori:**
  - Try-on R2 se hai (D-055), aur camera sirf apni site ke liye (SR-001). ₹0 (D-028) me paid try-on services nahi.
  - Lip aur eye ka try-on browser me ho sakta hai; foundation ka sahi try-on roshni ki wajah se mushkil hai.
  - Chehra personal data hai.
- **Vikalp:**
  - **(a) Try-on nahi:** uski jagah har shade ki alag skin tones pe photos (D-085 niyam 4).
  - **(b) Browser me, device pe hi:**
    1. Camera live (ya ek photo jo device se bahar na jaaye).
    2. Sirf lipstick, lip gloss, blush, eyeshadow aur eyeliner; baaki baad me.
    3. Rang D-085 ke hex se; screen pe note "rang asli se alag dikh sakta hai".
    4. Koi photo ya video server pe nahi jaata, save nahi hota.
    5. Pehli baar camera se pehle saaf consent.
    6. Shade ke rang (hex) ki jaanch ek staff role kare (misaal "Shade Specialist", D-085 niyam 5 ke saath).
  - **(c) (b) + foundation, aur photo server pe.**
- **Salah:** **(b)**, R2 se. ₹0 me ho sakta hai, chehre ka data device se bahar nahi jaata, aur sabse zyada fayde wali categories me hai.
- **Trade-off:**
  - (a) me try-on ka fayda nahi.
  - (b) me shade ke hex ki sahi jaanch zaroori, aur purane phones pe dheema.
  - (c) me galat nateeje aur chehre ka data server pe.
- **Kanooni detail jaanchi nahi** (R-004): chehre ki photo ya video ki consent.
- **Owner ka jawab (2026-11-19):** **(b)**, browser me, device pe hi (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-169.

### Q-111. Product pe public sawal-jawab (Q&A) ho ya nahi?

- **Status:** `Tay`. Topic: B8 (UGC).
- **Sawal:** product page pe customer public sawal pooch sake ("kya ye oily skin pe chalega?"), aur jawab kaun de?
- **Kyun zaroori:**
  - Kharidne se pehle ka sawal aam hai. Beauty Advisor ka message thread (D-025) private hai: ek customer ka sawal, ek ka jawab.
  - Public Q&A ka ek jawab sabke kaam aata hai, par moderation ka bojh aur sehat ki galat salah ka jokhim hai.
- **Vikalp:**
  - **(a) Public Q&A nahi:** sawal Beauty Advisor ke thread (D-025) se.
  - **(b) Public Q&A:** sawal sign-in se; jawab brand (seller) aur us product ke verified buyers de sakein; brand ke jawab pe "Brand" label; har sawal aur jawab reviews wale moderation niyam (D-136, D-146) se; ilaaj ya dawa jaise sawal pe tay jawab "Skin & Hair Expert se salah lein" (D-025).
  - **(c) Sirf brand jawab de.**
- **Salah:** **(b)**, R2 se. Ek jawab bahut logon ke kaam aata hai, aur Advisor pe bojh kam hota hai.
- **Trade-off:**
  - (a) me har customer ko alag poochhna padta.
  - (b) me moderation ka aur kaam.
  - (c) me brand ke jawab ki der aur ek-tarfa jaankari.
- **Owner ka jawab (2026-11-19):** **(b)**, public Q&A. Record: [DECISIONS.md](DECISIONS.md) D-170.

### Q-112. Brand formula badle to purane reviews ka kya ho?

- **Status:** `Tay`. Topic: B8 (reviews), B3 (catalog).
- **Sawal:** brand usi product ka formula badle (ingredients badle, D-098 ki jaanch ke baad), to purane reviews ka kya ho?
- **Kyun zaroori:**
  - Cosmetics me formula badalna aam hai (paraben hatana, fragrance badalna). Purane formula ke reviews (jaise kisi ingredient se reaction) naye formula pe galat tasveer dete hain.
  - D-076 niyam 4 variants ke farak ke liye hai; samay ke saath formula badalne ka niyam nahi.
- **Vikalp:**
  - **(a) Kuch nahi:** reviews waise hi.
  - **(b) Purane formula ka label:** listing ki jaanch (D-098) me staff ingredients ke bade badlav ko "formula badla" mark kare; us tareekh se pehle ke reviews pe "pehle ke formula pe" label; rating do roop me dikhe (misaal "naya formula: 4.2 (12)", "kul: 4.0 (340)").
  - **(c) Naya product:** formula badle to naya product, reviews zero se.
- **Salah:** **(b)**, R2 se; R1 me har review pe us waqt ka listing version save ho (data). Purani jaankari khoti nahi, aur naya customer naye formula ki asli tasveer dekhta hai.
- **Trade-off:**
  - (a) me galat tasveer.
  - (b) me "bada badlav" kya hai, ye staff ki samajh (misaal: naya ya hata hua ingredient upar ke 10 me).
  - (c) me brand ke saalon ke reviews khatam.
- **Owner ka jawab (2026-11-19):** **(b)**, purane formula ka label. Record: [DECISIONS.md](DECISIONS.md) D-171.

### Q-113. Consultation muft ho ya paid, aur kitni baar?

- **Status:** `Tay`. Topic: B11 (support).
- **Sawal:** Beauty Advisor aur Skin & Hair Expert ki consultation (D-025) muft ho ya paid, aur ek customer kitni le sake?
- **Kyun zaroori:**
  - D-025 me flow tay hai (request, time aur link, consult, resolve; cancel aur no-show), par daam aur seema nahi.
  - Paid ho to payment, no-show pe refund aur seva ke invoice ka kaam judta hai. Expert ke notes sehat ka data hain (D-025).
- **Vikalp:**
  - **(a) Muft, seema ke saath:** ek customer mahine me misaal 2 booking; 2 baar no-show to 30 din booking band; Advisor ka message thread muft (din me misaal 5 sawal).
  - **(b) Advisor muft, Expert paid:** misaal ₹299 (Razorpay test mode); 24 ghante pehle cancel pe poora refund, no-show pe nahi; seva ka invoice platform ka.
  - **(c) Dono muft, bina seema.**
- **Salah:** **(a)**, R2 se. Payment aur seva ke invoice ka naya kaam nahi, aur seema se bojh seemit.
- **Trade-off:**
  - (a) me Expert ke samay ki keemat nahi.
  - (b) me payment, refund aur invoice ka kaam.
  - (c) me ek insaan ke samay pe koi rok nahi.
- **Kanooni detail jaanchi nahi** (R-004): dermatologist jaise expert ki online consultation ke niyam (D-025 ki dummy row), aur seva pe GST.
- **Owner ka jawab (2026-11-19):** **(a)**, muft, seema ke saath. Record: [DECISIONS.md](DECISIONS.md) D-172.

### Q-114. Customer loyalty program ho ya nahi, aur kis roop me?

- **Status:** `Tay`. Topic: B10 (loyalty). Group G14.
- **Sawal:** customer loyalty program ho ya nahi, aur ho to kis roop me?
- **Kyun zaroori:**
  - Beauty me dobara kharid business ki jaan hai.
  - Par diye hue points platform pe rakam ki zimmedari (liability) hain, aur maal brands ka hai (D-060). R2 se (D-055).
- **Vikalp:**
  - **(a) Loyalty nahi:** sirf offers aur coupons (D-101).
  - **(b) Points:** har delivered order pe points (misaal har ₹100 pe 1 point, 1 point = ₹1 ki chhoot); points sirf platform pe kharch, cash ya bank me nahi badalte, transfer nahi; program ek staff role sambhale (misaal "Loyalty Manager", Growth Studio me).
  - **(c) Tiers + points:** saal ki kharid se tier (misaal Silver, Gold); tier pe zyada points, muft delivery (D-107) ya sale me pehle pahunch.
- **Salah:** **(b)**, R2 se; tiers baad me (data me jagah rahe).
- **Trade-off:**
  - (a) me dobara kharid ka koi khaas karan nahi.
  - (b) me points ka khaata aur liability.
  - (c) me tiers ke niyam, aur delivery fee ka hisaab.
- **Kanooni detail jaanchi nahi** (R-004): points prepaid instrument bante hain ya nahi, aur points pe GST.
- **Owner ka jawab (2026-11-19):** **(b)**, points; tiers baad me. Record: [DECISIONS.md](DECISIONS.md) D-173.

### Q-115. Points kis rakam pe milein, kab pakke hon, kab expire hon?

- **Status:** `Tay`. Topic: B10 (loyalty). Group G14.
- **Sawal:** Q-114 me points chune jaayein to points kis rakam pe milein, kab pakke hon, kab expire hon, aur kaise kharch hon?
- **Kyun zaroori:**
  - Return aur cancel (D-110, D-114) pe points wapas hone chahiye; seller ka paisa bhi return window ke baad payable hota hai (D-081).
  - Expiry ke bina liability badhti rehti hai. Pro daam pe coupon nahi (D-102), to points ka bhi sawal.
- **Vikalp:**
  - **(a) Saada:** delivery pe pakke, expiry nahi, poore order pe kharch.
  - **(b) Niyam ke saath:**
    1. Aadhaar: customer ne jo paisa diya, delivery fee aur Pro daam wali lines ke bina.
    2. Points "pending" jab tak return window (D-080) na nikle; phir pakke. Return ya cancel pe us line ke pending points hatein.
    3. Expiry misaal 12 mahine (har point apni tareekh se); expiry se 30 din pehle in-app aur push se yaad.
    4. Kharch: ek order pe zyada se zyada misaal 20% rakam tak; ek coupon (D-102) ke saath chal sake.
    5. Points se kharida item return ho to points wapas (agar expire nahi hue); paise wala hissa original raaste (D-111).
    6. Review ke badle points nahi (D-158).
  - **(c) Points se poora order.**
- **Salah:** **(b)**, R2 se. Liability seemit, khel ke raaste band, aur hisaab return ke niyam se mel khata hai.
- **Trade-off:**
  - (a) me liability behisaab aur return pe khel.
  - (b) me pending aur expiry ka hisaab.
  - (c) me poora order "muft", platform ka kharcha bada.
- **Kanooni detail jaanchi nahi** (R-004): points ki expiry aur suchna ke niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, niyam ke saath (6 niyam). Record: [DECISIONS.md](DECISIONS.md) D-174.

### Q-116. Points ki chhoot ka paisa kaun de?

- **Status:** `Tay`. Topic: B10 (loyalty), B6 (settlement). Group G14.
- **Sawal:** points se mili chhoot ka paisa kaun de: platform, brand, ya dono?
- **Kyun zaroori:**
  - D-101 me offers ka niyam hai; points bhi chhoot hain.
  - Platform de to seller ko poora daam milta hai (D-101 niyam 1 jaisa) aur liability platform ki. Brand chahe to apne product pe zyada points dekar bikri badha sake.
- **Vikalp:**
  - **(a) Sirf platform:** har points chhoot platform ka discount; seller ko poora daam; finance me points ki liability ka khaata.
  - **(b) Platform + brand ke bonus points:** base points platform ke; brand apne products pe bonus points de sake (brand ka kharcha, budget ke saath, D-101 niyam 2 jaisa).
  - **(c) Brand ka % har order pe.**
- **Salah:** **(a)** shuru me, **(b)** baad me; R2 se. Seller ka hisaab saaf rehta hai.
- **Trade-off:**
  - (a) me saara kharcha platform ka.
  - (b) me brand ke budget ka hisaab.
  - (c) me sellers pe bina poochhe kharcha.
- **Kanooni detail jaanchi nahi** (R-004): points ki chhoot ka invoice aur GST pe asar.
- **Owner ka jawab (2026-11-19):** **(a)**, shuru me sirf platform; brand ke bonus points baad me. Record: [DECISIONS.md](DECISIONS.md) D-175.

### Q-117. "Dost ko bulao" (referral) ka program ho ya nahi?

- **Status:** `Tay`. Topic: B10 (loyalty), B14 (abuse). Group G14.
- **Sawal:** "dost ko bulao" (referral) ka program ho ya nahi?
- **Kyun zaroori:**
  - Naye customer laane ka sasta raasta hai, par fraud ka bhi.
  - Ek insaan ke kai email (jaise `+` alias, jo D-017 me jaan-boojh ke normalise nahi hota) se khud ko refer karna aasaan hai.
- **Vikalp:**
  - **(a) Referral nahi.**
  - **(b) Referral, rok ke saath:**
    1. Dono ko inaam (Q-114 me points chune jaayein to points, warna coupon), sirf jab naye customer ka pehla order deliver ho aur return window (D-080) paar ho.
    2. Ek customer ke saal me misaal 10 referrals tak.
    3. Ek hi address, device ya payment wale referral pe inaam nahi.
  - **(c) Sirf bulaane wale ko inaam.**
- **Salah:** **(b)**, R2 ke baad, fraud ke niyam ke saath.
- **Trade-off:**
  - (a) me growth ka ek raasta kam.
  - (b) me fraud ki jaanch ka kaam.
  - (c) me naye customer ko koi khaas karan nahi.
- **Owner ka jawab (2026-11-19):** **(b)**, referral, rok ke saath (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-176.

### Q-118. Store credit ho ya nahi?

- **Status:** `Tay`. Topic: B10 (store credit).
- **Sawal:** store credit (platform pe kharch hone wala balance) ho ya nahi, aur kis kaam ke liye?
- **Kyun zaroori:**
  - D-111 me refund hamesha original raaste, to store credit refund ka raasta nahi.
  - Phir bhi goodwill (der ya galat item ki takleef) me "₹100 ka credit" support ka aam tareeka hai. Balance paise jaisa dikhe to prepaid ka sawal uthta hai.
- **Vikalp:**
  - **(a) Store credit nahi:** goodwill sirf ek customer ke liye ek baar ke coupon (platform ka offer, D-101) se.
  - **(b) Promo credit:**
    1. Sirf platform de (goodwill ya promotion); customer paisa daal ke kabhi nahi khareedta.
    2. Cash ya bank me nahi badalta, transfer nahi; expiry misaal 90 din.
    3. Kabhi refund ka raasta nahi (D-111).
    4. Support role ki rakam seema (misaal ₹200 ek maamle me).
  - **(c) Wallet:** customer paisa daal ke balance rakhe.
- **Salah:** **(a)**, R2 se. Naya balance aur khaata nahi chahiye; coupon ka raasta R2 me ban hi raha hai.
- **Trade-off:**
  - (a) me goodwill coupon ke saath customer ka us order pe doosra coupon nahi chalta (D-102).
  - (b) me naya balance, khaata aur expiry.
  - (c) me prepaid ke niyam ka seedha jokhim.
- **Kanooni detail jaanchi nahi** (R-004): promo credit ya wallet ka prepaid instrument ke niyam me aana.
- **Owner ka jawab (2026-11-19):** **(a)**, store credit nahi. Record: [DECISIONS.md](DECISIONS.md) D-177.

### Q-119. Rozana khatam hone wale products ki "dobara kharid" kis roop me?

- **Status:** `Tay`. Topic: B10 (subscriptions).
- **Sawal:** rozana khatam hone wale products (face wash, shampoo, sunscreen) ke liye "dobara kharid" ki suvidha kis roop me ho?
- **Kyun zaroori:**
  - Consumables ka chakkar tay hota hai, aur ye dobara kharid ka sabse aasaan mauka hai.
  - Subscription me har baar naya batch (D-064 ka MRP, D-067 ki expiry), daam badal sakta hai (D-061, D-087), stock na ho sakta hai, aur recurring payment ke niyam lagte hain. Delivery pe UPI (D-034) subscription me nahi chalta.
- **Vikalp:**
  - **(a) Sirf "dobara order" button:** pichhle order se cart.
  - **(b) (a) + yaad:**
    1. Size aur category se andaaza (misaal 100 ml face wash lagbhag 60 din; staff setting).
    2. Customer chahe to yaad chalu kare; yaad in-app aur push se, email nahi (D-141).
    3. Ek tap pe cart me, us din ke daam aur expiry ke saath; koi pehle se payment nahi.
  - **(c) Subscription:** har X din pe apne aap order aur payment (recurring mandate); daam badle to pehle khabar aur customer ki haan; stock na ho to wo baar skip; "subscribe karo, bachao" ki chhoot (D-101).
- **Salah:** **(b)** R2 se; **(c)** baad me, kanooni aur payment ki jaanch ke baad.
- **Trade-off:**
  - (a) me customer ko khud yaad rakhna padta.
  - (b) me andaaze ki setting.
  - (c) me mandate, daam ki haan aur stock ke niyam ka bada kaam.
- **Kanooni detail jaanchi nahi** (R-004): recurring payment mandate ke RBI niyam.
- **Owner ka jawab (2026-11-19):** **(b)**, dobara order + yaad; subscription baad me. Record: [DECISIONS.md](DECISIONS.md) D-178.

### Q-120. Gift cards ho ya nahi, aur kab?

- **Status:** `Tay`. Topic: B10 (gift cards).
- **Sawal:** gift card (koi customer doosre ko platform pe kharch ke liye rakam de) ho ya nahi, aur kab?
- **Kyun zaroori:**
  - Tyohar aur gifting me beauty gift cards aam hain.
  - Par gift card me customer ka paisa pehle aata hai (D-093), bina kharch ka balance platform ki liability hai, expiry ke niyam lagte hain, aur platform pe doosre sellers ka maal bhi bikta hai, isliye prepaid ke niyam alag ho sakte hain.
  - Gift card ka code email se jaata hai (300 ki seema, D-028, D-142).
- **Vikalp:**
  - **(a) Gift cards nahi.**
  - **(b) Design abhi, banana kanooni jaanch ke baad:** data aur finance ke khaate design me; banana tab jab kanooni jaanch (R-004) ho jaaye. Niyam (misaal): tay rakam (₹500, ₹1,000, ₹2,000); code paane wale ke email pe; thoda-thoda kharch; balance dikhe; cash me nahi; gift card se kharida item return ho to rakam gift card me wapas (D-111 ka "original raasta"); khareeda gift card sirf bina istemaal ke cancel.
  - **(c) R2 me test mode me, dummy kanooni details ke saath (D-026).**
- **Salah:** **(b)**: R2 ke baad, kanooni jaanch pe. Design asli rahe, par paise jaisi cheez kanoon dekhe bina na bane.
- **Trade-off:**
  - (a) me gifting ka raasta nahi.
  - (b) me feature der se.
  - (c) me galat design ka jokhim jo baad me badalna pade.
- **Kanooni detail jaanchi nahi** (R-004): prepaid instrument (closed ya semi-closed) ke niyam, gift card ki kam se kam muddat aur KYC, gift voucher pe GST, aur bina kharch ke balance ka hisaab. Is sawal ka jawab kanooni jaanch ke baad badal sakta hai.
- **Owner ka jawab (2026-11-19):** **(b)**, design abhi, banana kanooni jaanch ke baad. Record: [DECISIONS.md](DECISIONS.md) D-179.

### Q-121. Customer app me ek sign-in kitne din chale?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** customer app me ek baar sign-in kitne din tak chale, phir dobara sign-in?
- **Kyun zaroori:**
  - Guest cart nahi (D-020), to cart aur wishlist ke liye sign-in chahiye. Har naya sign-in email code (D-021) se hai, jo emails ki din ki chhat (D-142) khaata hai.
  - Lamba session chori ho jaaye to lamba chalta hai, aur shared phone ya laptop pe agla insaan account me hota hai.
- **Vikalp:**
  - **(a)** Har istemaal pe 30 din aage badhe, zyada se zyada 90 din; phir dobara sign-in.
  - **(b)** Har istemaal pe 7 din aage, zyada se zyada 30 din.
  - **(c)** Har istemaal pe 90 din aage, zyada se zyada 1 saal.
- **Salah:** **(a)**, saath me account ki security badalne pe dobara pehchaan, aur "My devices" se kisi bhi session ko band karne ka raasta. Isse lambe session ka jokhim kam rehta hai.
- **Trade-off:**
  - (a) me chori hua session 90 din tak chal sakta hai, jab tak customer use band na kare.
  - (b) me har hafte sign-in: zyada codes, zyada rukawat.
  - (c) sabse aasaan, par chori ka asar sabse lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, har istemaal pe 30 din aage, zyada se zyada 90 din. Record: [DECISIONS.md](DECISIONS.md) D-180.

### Q-122. Staff aur seller apps me sign-in kitni der chale?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** staff ke 7 apps (Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops, Growth Studio), Seller app aur Creator app me session kitni der chale, aur bina kaam ke kitni der me band ho?
- **Kyun zaroori:**
  - Staff ke accounts sabse taaqatwar hain; khula chhoda laptop ya chori hua session bada nuksaan kar sakta hai.
  - Owner ke ~80 accounts (D-017) pe roz sign-in ka bojh isi number se tay hota hai.
- **Vikalp:**
  - **(a) Ek kaam ka din:** staff apps 12 ghante, 30 minute bina kaam pe band; Seller har istemaal pe 7 din aage, zyada se zyada 30 din; Creator (R2) 30 din aage, zyada se zyada 90 din.
  - **(b) Kada:** staff apps 8 ghante, 15 minute bina kaam pe band; Seller 1 din aage, zyada se zyada 7 din; Creator 7 din aage, zyada se zyada 30 din.
  - **(c) Dheela:** staff apps 24 ghante, 2 ghante bina kaam pe band; Seller aur Creator 30 din aage, zyada se zyada 90 din.
- **Salah:** **(a)**: staff ke liye ek kaam ka din, seller ke liye hafte me ek sign-in, Creator customer jaisa. (b) owner ke accounts ke saath bahut bhaari hai.
- **Trade-off:**
  - (a) me staff ka chori hua session ek din tak chal sakta hai.
  - (b) zyada surakshit, par bahut sign-in.
  - (c) aasaan, par chori ka asar lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, ek kaam ka din (staff 12 ghante, seller hafte me ek sign-in). Record: [DECISIONS.md](DECISIONS.md) D-181.

### Q-123. Baar-baar galat password ya code pe rok kaisi ho?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** baar-baar galat password ya code daalne pe account kaise roka jaaye?
- **Kyun zaroori:**
  - Rok na ho to password ka andaaza lagta rehta hai.
  - Par poore account ki rok ho to koi bhi jaan-boojh ke galat password daal ke owner ke staff accounts band kar sakta hai.
- **Vikalp:**
  - **(a) IP aur account mila ke:**
    1. Ek IP se 15 minute me 10 galat koshish: us IP se us account pe 1 ghante ki rok.
    2. Saare IPs mila ke 15 minute me 50 galat: poore account pe 15 minute ki rok.
    3. Rok ke dauraan "password bhool gaye" chalta rahe, aur rok ke dauraan ki koshishein gini na jaayein.
  - **(b) Sirf account:** 15 minute me 10 galat koshish pe poora account 1 ghante band, har IP se.
  - **(c) Account pe rok nahi:** sirf IP ki rate limit aur leak hue passwords ki jaanch.
- **Salah:** **(a)**. Hamlavar ka andaaza rukta hai, aur asli user doosri jagah se sign-in kar sakta hai. Numbers misaal hain.
- **Trade-off:**
  - (a) me do ginti ka kaam; bahut IPs wala hamlavar 15 minute ki poori rok tak pahunch sakta hai.
  - (b) seedha, par rok khud hamle ka hathiyar ban jaati hai.
  - (c) me andaaze pe kam rok.
- **Owner ka jawab (2026-11-19):** **(a)**, rok IP aur account mila ke. Record: [DECISIONS.md](DECISIONS.md) D-182.

### Q-124. Delivery app me sign-in kaise ho, aur kya session ek phone se bandha ho?

- **Status:** `Tay`. Topic: B14 (security), B1 (delivery).
- **Sawal:** delivery partner Delivery app me kaise sign-in kare, aur kya session ek manzoor phone se bandha ho?
- **Kyun zaroori:**
  - Partner ka phone hi kaam ka auzaar hai, app offline bhi chalta hai (D-042), aur phone pe customers ke naam, address aur phone hote hain.
  - Partners gig partners hain (D-033): har shift pe authenticator ka bojh kaam rokta hai.
- **Vikalp:**
  - **(a) Manzoor phone:** email aur password; partner ka ek manzoor phone (Hub Manager manzoor kare; naya phone = nayi manzoori); session usi phone pe misaal 14 din; authenticator optional; Hub Manager kabhi bhi session band kar sake.
  - **(b) Har shift authenticator:** email, password aur authenticator, misaal har 12 ghante.
  - **(c) Bina bandish:** email aur password, session 30 din, phone ki koi bandish nahi.
- **Salah:** **(a)**. Offline ke saath chalta hai, phone khone pe Hub Manager turant band kar sakta hai, aur partner pe roz ka bojh nahi.
- **Trade-off:**
  - (a) me Hub Manager ka kaam (naya phone manzoor karna); phone ki pehchaan browser me rakhi key se hoti hai, to browser ka data saaf hone pe dobara manzoori.
  - (b) zyada surakshit, par authenticator usi phone pe ho to phone chori = dono gaye.
  - (c) aasaan, par chori ka asar lamba.
- **Owner ka jawab (2026-11-19):** **(a)**, manzoor phone ke saath sign-in. Record: [DECISIONS.md](DECISIONS.md) D-183.

### Q-125. Seller app me authenticator kin users pe zaroori ho?

- **Status:** `Tay`. Topic: B14 (security), B2 (roles).
- **Sawal:** seller ke kaunse users ke liye authenticator zaroori ho?
- **Kyun zaroori:** D-017 me misaal Account Owner aur Seller Finance hai. Par daam badalna (₹1,999 ki jagah ₹199), maal bhejna aur seller ke staff jodna bhi bade asar wale kaam hain; inka account chori ho to seller ka seedha nuksaan.
- **Vikalp:**
  - **(a) Jokhim ke hisaab se:** Account Owner, Finance, aur jis bhi user ko daam, payout ya bank, seller ke staff, ya maal bhejne ka haq ho; sirf listing content ya reports wale users bina authenticator.
  - **(b)** Sirf Account Owner aur Finance.
  - **(c)** Saare seller users.
- **Salah:** **(a)**: jahan nuksaan ho sakta hai wahan doosra factor, aur content likhne walon pe bojh nahi.
- **Trade-off:**
  - (a) me seller ke kai users pe authenticator.
  - (b) me daam aur maal bhejna bina doosre factor ke.
  - (c) sabse surakshit, par chhote brand ke content wale bhi authenticator chalayein.
- **Owner ka jawab (2026-11-19):** **(a)**, authenticator jokhim ke hisaab se. Record: [DECISIONS.md](DECISIONS.md) D-184.

### Q-126. Kin kaamon se pehle dobara authenticator maanga jaaye?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** sign-in ke baad bhi kin kaamon se theek pehle dobara authenticator code maanga jaaye?
- **Kyun zaroori:** khula chhoda session ya chori hui cookie se sabse bade kaam na ho sakein. Par har kaam pe code maangna kaam rok deta hai.
- **Vikalp:**
  - **(a) Tay list, misaal 5 minute ki khidki:** role ya grant dena aur hatana; authenticator reset; allowlist badalna (D-133); area ke switches aur live karna; fees, policy ke numbers, HSN table, blocklist aur emails ki chhat badalna; payout "paid"; seema se upar refund ya daawe ki manzoori; data export; seller ka bank badalna; kill switches. Authenticator band karna aur naye recovery codes banana har baar apna alag code maangein.
  - **(b)** Staff ke har likhne wale kaam pe.
  - **(c)** Sirf Master ke kaamon pe.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me naye kaam aane pe list badhani padegi.
  - (b) me staff ka kaam bahut dheema.
  - (c) me Finance aur Admin ke bade kaam bina dobara code ke.
- **Owner ka jawab (2026-11-19):** **(a)**, bade kaamon ki tay list pe dobara code. Record: [DECISIONS.md](DECISIONS.md) D-185.

### Q-127. Kai apps me sign-in: har app alag, ya ek jagah sign-in se sab apps?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** jis insaan ke roles kai apps me hon, wo har app me alag sign-in kare, ya ek jagah sign-in karke sab apps khulein?
- **Kyun zaroori:** 11 apps alag hosts pe hain (D-010, D-048, domain nahi D-028), aur cookies har host ki alag hoti hain.
- **Vikalp:**
  - **(a) Har app alag:** har app ka apna sign-in aur apni cookies; password manager se aasaan.
  - **(b) Ek central sign-in app:** baaki apps redirect se ek baar ka code le ke apna session banayein.
  - **(c)** Abhi (a), aur asli business pe (b), jab asli staff ke roles kai apps me hon.
- **Salah:** **(a)**. Owner ke har role ka alag account hai (D-017), to zyadatar ek account ek hi app me jaata hai. Central sign-in se owner ka bojh kam nahi hota, aur redirect aur code se hamle ke naye raaste khulte hain.
- **Trade-off:**
  - (a) me asli business pe kai roles wale staff ko kai sign-in.
  - (b) me ek jagah chori = saare apps, aur banane ka kaam bada.
  - (c) me baad me badlav ka kaam.
- **Owner ka jawab (2026-11-19):** **(a)**, har app ka apna sign-in. Record: [DECISIONS.md](DECISIONS.md) D-186.

### Q-128. Sign-in, sign-up aur password reset ke code wale emails ki seema kya ho?

- **Status:** `Tay`. Topic: B14 (security), B11 (notifications).
- **Sawal:** bina sign-in maange jaane wale code ke emails (sign-in, sign-up, password reset) kitne bheje ja sakein?
- **Kyun zaroori:**
  - Code maangna bina sign-in ke hota hai, aur din ke 300 emails me OTP ki 60 pakki jagah hai (D-142).
  - Seema na ho to koi bhi codes maang-maang ke din ki jagah kha sakta hai, ya kisi ke inbox pe emails ki baadh la sakta hai. Allowlist (D-133) abhi isse bachati hai, par asli business pe allowlist band hogi.
- **Vikalp:**
  - **(a)** Ek email ko ghante me 5 code (ek IP se unme 3 tak); saare emails mila ke ghante me 30; sign-up ke codes din me 20. Allowlist band karte waqt numbers dobara dekhna.
  - **(b) Kada:** ek email ko ghante me 3, sab mila ke 15, sign-up din me 10.
  - **(c) Dheela:** ek email ko ghante me 10, sab mila ke 60, sign-up din me 60.
- **Salah:** **(a)**: sign-up ki baadh me bhi password reset, invite aur security codes ke liye jagah bachti hai.
- **Trade-off:**
  - (a) me bhaari ghante me asli user ko "thodi der baad koshish karein" ka sandesh.
  - (b) aur kada.
  - (c) me ek ghante me OTP ki poori din ki jagah khatam ho sakti hai.
- **Owner ka jawab (2026-11-19):** **(a)**, code wale emails ki salah wali seema. Record: [DECISIONS.md](DECISIONS.md) D-187.

### Q-129. Support Agent kitni rakam tak refund ya daawa khud manzoor kare?

- **Status:** `Tay`. Topic: B14 (security), B11 (support), B6 (refunds).
- **Sawal:** Support Agent ek maamle me aur din me kitni rakam tak refund ya daawa khud manzoor kare, aur kab doosre account ki haan chahiye?
- **Kyun zaroori:**
  - Zyadatar refund niyam se apne aap shuru hote hain (D-111), par daawe ka faisla aur fail hue refund ka staff wala raasta insaan karta hai (D-105, D-111).
  - Chori hua account ya mili-bhagat yahin nuksaan karti hai.
- **Vikalp:**
  - **(a) Seema:** Support Agent ek maamle me misaal ₹2,000 tak aur din me kul misaal ₹10,000 tak; usse upar Support Lead (doosra account). Fail hue refund ka staff wala raasta hamesha Support Lead aur Finance ki manzoori se.
  - **(b) Koi seema nahi:** sirf audit.
  - **(c)** Har insaani faisle pe doosre account ki haan.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me bade maamle thodi der se.
  - (b) me ek account se bada nuksaan.
  - (c) me har chhote maamle pe do accounts (owner ke do accounts) ka bojh.
- **Owner ka jawab (2026-11-19):** **(a)**, Support Agent ki seema, upar Support Lead. Record: [DECISIONS.md](DECISIONS.md) D-188.

### Q-130. Seller ka payout "paid" mark karne ke liye ek account kaafi ho ya do?

- **Status:** `Tay`. Topic: B14 (security), B6 (settlement).
- **Sawal:** seller ke payout ko "paid" mark karne ke liye ek account kaafi ho, ya do?
- **Kyun zaroori:**
  - R1 me payout haath se "paid" mark hota hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); asli business pe yahi asli bank transfer banega.
  - Ek hi account payout bana bhi sake aur mark bhi kare, to chori hua account seller ka paisa "paid" dikha sakta hai.
- **Vikalp:**
  - **(a) Do haath:** Finance role payout batch banaye; Master ka doosra account (D-047) manzoor kare; ek account dono kaam nahi kar sakta.
  - **(b)** Finance role akela bana ke mark kare.
  - **(c)** Sirf Master mark kare.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har hafte do accounts se kaam (owner ke liye do sign-in).
  - (b) me ek account ka jokhim.
  - (c) me Master ke paas roz ke kaam ka haq aa jaata hai, jo D-047 ki soch ke khilaaf hai.
- **Owner ka jawab (2026-11-19):** **(a)**, do haath: Finance banaye, Master manzoor kare. Record: [DECISIONS.md](DECISIONS.md) D-189.

### Q-131. Seller apna bank khaata badle to naye khaate pe payout kab?

- **Status:** `Tay`. Topic: B14 (security), B6 (settlement).
- **Sawal:** seller apna bank ya payout ka khaata badle to naye khaate pe payout turant ho, ya kuch rok ke baad?
- **Kyun zaroori:** sellers ka paisa platform ke paas rehta hai (D-093). Seller ka account chori karke bank badalna aur agla payout apne khaate me lena sabse seedha nuksaan hai.
- **Vikalp:**
  - **(a) Rok ke saath:** bank badalne pe dobara authenticator code, purane email aur in-app pe khabar, aur naye khaate pe misaal 72 ghante tak payout nahi; us dauraan Account Owner "ye maine nahi kiya" daba ke badlav rok sake.
  - **(b) Staff ki jaanch:** naye khaate pe pehla payout Seller Ops ki jaanch ke baad.
  - **(c) Koi rok nahi:** sirf khabar.
- **Salah:** **(a)**; asli business pe (b) bhi saath me.
- **Trade-off:**
  - (a) me bank badalne ke baad payout 3 din der se.
  - (b) me staff ka kaam.
  - (c) me chori ka seedha raasta.
- **Owner ka jawab (2026-11-19):** **(a)**, rok ke saath; asli business pe staff ki jaanch bhi. Record: [DECISIONS.md](DECISIONS.md) D-190.

### Q-132. Delivery ke saboot (photo aur location) kitne din rakhein, aur kaun dekhe?

- **Status:** `Tay`. Topic: B14 (security, privacy), B1 (delivery).
- **Sawal:** delivery ke waqt li gayi photo aur partner ki location (D-072) kitne din rakhein, aur kaun dekh sake?
- **Kyun zaroori:**
  - Photo me ghar ka darwaza ya koi insaan aa sakta hai, aur location se customer ka ghar pata chalta hai.
  - Saboot daawe (D-148), partner ke dispute (D-164, R2) aur chargeback (D-095, R2) ke liye bhi chahiye.
- **Vikalp:**
  - **(a)** Delivered se misaal 180 din, ya khula daawa, dispute ya chargeback band hone tak (jo baad me ho). Dekhe: daawe pe Support Agent aur Support Lead, aur apne hub ka Hub Manager; partner submit ke baad nahi; customer apni delivery ki photo dekh sake.
  - **(b)** 30 din (daawe ki seema ke baad delete).
  - **(c)** 1 saal.
- **Salah:** **(a)**. Chargeback ki asli samay-seema payment gateway ke niyam se pakki karni hai.
- **Trade-off:**
  - (a) me storage aur delete ka kaam.
  - (b) me baad ka chargeback ya dispute bina saboot.
  - (c) me zyada data zyada der.
- **Kanooni detail jaanchi nahi** (R-004): photo aur location jaise personal data rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, misaal 180 din ya maamla band hone tak, kam haathon me. Record: [DECISIONS.md](DECISIONS.md) D-191.

### Q-133. Daawe, return pickup aur pack ki photos aur video kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (security, privacy), B7 (returns).
- **Sawal:** customer ke daawe ki photos aur video (D-106), return pickup ki photo (D-113) aur warehouse pe pack ki photo (D-106) kitne din rakhein, aur kaun dekhe?
- **Kyun zaroori:** inme ghar, chehra ya personal cheezein aa sakti hain; par baad ke jhagde aur seller ke dispute ke liye saboot chahiye.
- **Vikalp:**
  - **(a) Alag samay:** daawe ki photos maamla band hone ke misaal 180 din baad delete, video misaal 90 din; pack ki photo delivered ke misaal 90 din, ya daawa ho to daawe ke saath. Dekhe: us maamle ka Support staff aur warehouse ka jaanch wala staff.
  - **(b)** Sab 90 din.
  - **(c)** Sab 1 saal.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me alag-alag samay ka kaam.
  - (b) me lamba jhagda bina saboot.
  - (c) me zyada storage aur zyada personal data.
- **Kanooni detail jaanchi nahi** (R-004): customer ki photo aur video rakhne ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, alag-alag samay, sirf us maamle ka staff. Record: [DECISIONS.md](DECISIONS.md) D-192.

### Q-134. Seller aur Beauty Pro ke dastavez kitne din rakhein, aur kaun dekhe?

- **Status:** `Tay`. Topic: B14 (security, privacy), B3 (seller).
- **Sawal:** seller ke KYC dastavez (PAN, GSTIN ka certificate, brand authorisation), claims ke saboot (D-100) aur Beauty Pro ke dastavez (D-069) kitne din rakhein, aur kaun dekhe?
- **Kyun zaroori:** ye pehchaan ke dastavez hain; leak ho to pehchaan ki chori. Par jaanch, dobara jaanch aur jhagde ke liye chahiye.
- **Vikalp:**
  - **(a) Kaam tak, phir tay samay:**
    1. Reject hui application ke dastavez 30 din baad delete; sirf faisla aur wajah rahe.
    2. Manzoor seller ke dastavez account chalne tak, aur band hone ke misaal 3 saal baad (kanooni jaanch ke baad number badal sakta hai).
    3. Claims ke saboot unki expiry ke misaal 1 saal baad; Pro ke dastavez darje ki muddat ke misaal 1 saal baad.
    4. Dekhe: sirf jaanch wali team (Seller Ops, catalog ki jaanch, Pro ki jaanch) aur Trust & Safety; seller apne dastavez.
  - **(b)** Sab hamesha.
  - **(c)** Jaanch ke baad turant delete; sirf nateeja, chhupa number aur file ka hash rahe.
- **Salah:** **(a)**. Seller ke liye R1 se, Beauty Pro ke liye R2 se (D-055).
- **Trade-off:**
  - (a) me samay ki settings aur delete ka kaam.
  - (b) me leak ka bada bhandaar.
  - (c) me jhagde ya dobara jaanch pe dastavez nahi.
- **Kanooni detail jaanchi nahi** (R-004): KYC aur tax ke records kitne din rakhne zaroori hain.
- **Owner ka jawab (2026-11-19):** **(a)**, kaam tak, phir tay samay. Record: [DECISIONS.md](DECISIONS.md) D-193.

### Q-135. Audit log, sign-in events aur delete hue account ke records kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (security), B12 (reporting).
- **Sawal:** audit log, sign-in aur security events, aur delete hue account ke bina pehchaan records kitne din rakhein?
- **Kyun zaroori:**
  - Audit hi batata hai kisne kya kiya; jaldi mita to jaanch nahi ho sakti.
  - Par audit ke cluster me bhi jagah 0.5 GB hi hai (R-006), aur IP aur browser ki jaankari bhi personal data hai. D-151 ne records ka samay yahin chhoda hai.
- **Vikalp:**
  - **(a) Alag samay:** audit log misaal 2 saal (paise ke kaamon ka audit kanooni jaanch ke baad lamba ho sakta hai); sign-in aur security events misaal 1 saal; delete hue account ke bina pehchaan records (invoice, ledger) kanooni samay tak; backups me purana data backup ki umar tak.
  - **(b)** Audit aur sign-in events sab 400 din.
  - **(c)** Audit hamesha.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me do alag samay.
  - (b) me saal bhar baad ki jaanch me kami.
  - (c) me jagah aur personal data badhte rehte hain.
- **Kanooni detail jaanchi nahi** (R-004): logs rakhne ka samay (CERT-In ke niyam), aur tax records ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, audit misaal 2 saal, sign-in events 1 saal. Record: [DECISIONS.md](DECISIONS.md) D-194.

### Q-136. Browser push aur emails me order ki kitni jaankari ho?

- **Status:** `Tay`. Topic: B14 (security, privacy), B11 (notifications).
- **Sawal:** browser push aur emails me order ki kitni jaankari likhi jaaye?
- **Kyun zaroori:**
  - Push lock screen pe koi bhi dekh sakta hai, aur beauty aur personal care ke kuch products niji hote hain.
  - Delivery code (D-072) saboot hai; wo kahin aur leak na ho.
- **Vikalp:**
  - **(a)** Push me sirf order number aur haalat (misaal "Order 1234: out for delivery"); product ka naam, rakam, address aur delivery code push me kabhi nahi. Email me order ki detail (D-126), par poora address sirf invoice me.
  - **(b)** Push me product ka naam bhi.
  - **(c)** Push aur email me poori detail.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me detail ke liye customer ko app kholna padta hai.
  - (b) me niji product lock screen pe.
  - (c) me sabse zyada leak.
- **Owner ka jawab (2026-11-19):** **(a)**, push me sirf order number aur haalat. Record: [DECISIONS.md](DECISIONS.md) D-195.

### Q-137. Backup ki files laptop pe encrypted rahein?

- **Status:** `Tay`. Topic: B14 (security), B15 (backup).
- **Sawal:** backup command (D-013) ki files laptop pe encrypted rahein?
- **Kyun zaroori:** backup me saara data hai (customers, sellers, paisa). D-013 ke 4 pehre git se bachate hain, par laptop chori, malware ya Desktop ke cloud sync se nahi.
- **Vikalp:**
  - **(a) Encrypted:** backup command apni files ek key se encrypt kare (key password manager me, repo me kabhi nahi); restore command key maange; laptop pe misaal sirf aakhri 3 backups, purane apne aap delete.
  - **(b) Bina encryption:** sirf laptop ka disk encryption aur D-013 ke 4 pehre.
  - **(c)** (a), aur ek encrypted copy alag device pe (jaise pen drive).
- **Salah:** **(a)**; (c) agar owner chahe, kyunki laptop kharab ho to backup bhi jaata hai.
- **Trade-off:**
  - (a) aur (c) me key kho jaaye to backup bekaar.
  - (b) me laptop pe khula data.
- **Owner ka jawab (2026-11-19):** **(a)**, backup files encrypted. Record: [DECISIONS.md](DECISIONS.md) D-196.

### Q-138. Secrets (passwords aur keys) kab badle jaayein?

- **Status:** `Tay`. Topic: B14 (security), B15 (operations).
- **Sawal:** secrets (databases ke passwords, payment gateway ki keys, apps se backend ka secret, email ki key, sign-in providers ke secrets, encryption keys) kab badle jaayein?
- **Kyun zaroori:** leak hua secret badalna hi ilaaj hai; par ek insaan ke liye ~20 secrets (11 Vercel projects samet) baar-baar badalna galti ka mauka bhi hai.
- **Vikalp:**
  - **(a)** Shak ya incident pe turant, tay kram se; baaki saal me ek baar sab; token sign karne wali keys apne aap (misaal har 30 din); asli business pe kisi staff ke jaane pe turant.
  - **(b)** Har 90 din sab.
  - **(c)** Sirf incident pe.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me secret saal bhar purana reh sakta hai.
  - (b) me bahut kaam aur galti ka mauka.
  - (c) me chupchaap leak kabhi theek nahi hota.
- **Owner ka jawab (2026-11-19):** **(a)**, shak pe turant, baaki saal me ek baar. Record: [DECISIONS.md](DECISIONS.md) D-197.

### Q-139. Personal data ka leak ho to users ko kab aur kaise bataya jaaye?

- **Status:** `Tay`. Topic: B14 (security, incident response).
- **Sawal:** personal data ka leak pakka ho to users ko kab aur kaise bataya jaaye?
- **Kyun zaroori:** registrations dummy hain, par system me asli personal data (owner aur testers ka) hai, aur design asli business jaisa (D-026).
- **Vikalp:**
  - **(a)** Leak pakka hone pe asar wale users ko email aur in-app, misaal 72 ghante ke andar: kya hua, kaunsa data, unhe kya karna hai; site pe ek patti; aur jo sarkari report kanooni jaanch bataye.
  - **(b)** Sirf gambhir leak (password, paisa, dastavez) pe khabar.
  - **(c)** Koi khabar nahi (demo hai).
- **Salah:** **(a)**; R1 me iska likha hua kram (runbook).
- **Trade-off:**
  - (a) me emails ki chhat (D-142) me jagah chahiye.
  - (b) me chhota leak chhup jaata hai.
  - (c) asli business ke liye galat aadat.
- **Kanooni detail jaanchi nahi** (R-004): data leak pe users aur sarkari sanstha ko suchna ka samay aur tareeka.
- **Owner ka jawab (2026-11-19):** **(a)**, users ko email aur in-app, R1 me likha hua kram. Record: [DECISIONS.md](DECISIONS.md) D-198.

### Q-140. Staff accounts pe password ke saath doosra factor kaunsa ho?

- **Status:** `Tay`. Topic: B14 (security). Group G15.
- **Sawal:** staff accounts (staff ke 7 apps) pe password ke saath doosra factor kaunsa ho?
- **Kyun zaroori:**
  - Owner ke ~80 accounts (D-017) me se zyadatar pe doosra factor lagega.
  - Domain nahi (D-028), to milte-julte naam ka nakli sign-in page banana aasaan hai. Authenticator ka code nakli page pe bhi daala ja sakta hai; passkey sirf asli site pe chalti hai.
- **Vikalp:**
  - **(a)** R1 me authenticator app (6 digit code) har staff account pe; passkey R2 me ek aur raasta.
  - **(b)** R1 se passkey (phone ya laptop ka fingerprint ya PIN, ya password manager) pehla raasta, authenticator backup.
  - **(c)** Hamesha sirf authenticator.
- **Salah:** **(a)**: R1 me kaam kam, R2 me passkey. Asli business pe Master aur Finance pe passkey zaroori karna owner tab tay kare.
- **Trade-off:**
  - (a) me authenticator app me 50 se zyada entries, aur phishing ka jokhim. Authenticator ke secrets usi password manager me hon jisme passwords, to dono factor ek jaise ho jaate hain.
  - (b) phishing se bachav, par har app ka alag host hai (D-048), to har account ki passkey uske app ke host pe banti hai: banane ka kaam zyada.
  - (c) me phishing ka jokhim hamesha.
- **Owner ka jawab (2026-11-19):** **(a)**, R1 me authenticator, passkey R2 me. Record: [DECISIONS.md](DECISIONS.md) D-199.

### Q-141. Staff ka authenticator kho jaaye to account kaise wapas mile?

- **Status:** `Tay`. Topic: B14 (security). Group G15.
- **Sawal:** staff ka (aur Master ka) authenticator kho jaaye to reset ka raasta kya ho?
- **Kyun zaroori:**
  - Owner akela hai; phone kho jaaye to bahut se accounts ek saath band ho jaate hain.
  - Reset ka raasta hi account par kabze ka sabse aasaan raasta hota hai.
- **Vikalp:**
  - **(a) Recovery codes, phir Master, phir laptop:**
    1. Pehle recovery codes (10, har code ek baar).
    2. Staff account ka reset Master account kare: dobara authenticator code, audit, us account ke saare sessions band, aur user ko email.
    3. Master ka apna reset sirf recovery codes se; wo bhi na hon to owner ke laptop se ek "break-glass" command jo seedha database pe reset kare aur audit me likhe.
  - **(b)** Ek alag security role kisi ka bhi reset kare, Master ka bhi.
  - **(c)** Email code se reset.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me recovery codes sambhalne padte hain, aur break-glass command ke liye production database ki pahunch laptop pe chahiye (backup command ke liye pehle se, D-013).
  - (b) me ek role ke paas sabki chaabi.
  - (c) me inbox hi authenticator ban jaata hai: doosre factor ka matlab khatam.
- **Owner ka jawab (2026-11-19):** **(a)**, recovery codes, phir Master, phir laptop. Record: [DECISIONS.md](DECISIONS.md) D-200.

### Q-142. Staff ko customer ka naam, email, phone aur address kitna dikhe?

- **Status:** `Tay`. Topic: B14 (privacy), B2 (roles). Group G16.
- **Sawal:** Support, warehouse, hub aur delivery partner ko customer ka naam, email, phone aur address kitna dikhe?
- **Kyun zaroori:** sellers ke liye D-143 tay hai, par staff ke liye nahi. Staff ki lists se customers ka data bahar jaana sabse aasaan raasta hai.
- **Vikalp:**
  - **(a) Lists me chhupa:**
    1. Lists me naam ka pehla hissa aur shehar, aadha email, phone ke aakhri 4 ank.
    2. Poori jaankari sirf maamla kholne pe, wajah chun ke; har baar dekhna audit me.
    3. Delivery partner ko sirf apne active parcel ka naam, address aur phone; delivered ke misaal 24 ghante baad chhupa.
    4. Warehouse aur hub ko sirf order number aur label.
  - **(b)** Support ko hamesha poori; baaki ko chhupi.
  - **(c)** Jise kaam ho use poori.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me support ko ek click zyada, aur audit ka kaam.
  - (b) me support ki list se poora data bahar ja sakta hai.
  - (c) sabse aasaan, par sabse zyada leak.
- **Kanooni detail jaanchi nahi** (R-004): staff ke paas personal data ki pahunch ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, lists me chhupa, poori sirf maamla kholne pe. Record: [DECISIONS.md](DECISIONS.md) D-201.

### Q-143. Support customer ka account usi ki nazar se dekh sake?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (support). Group G16.
- **Sawal:** support staff customer ka account usi ki nazar se dekh sake, ya uske naam se kaam kar sake?
- **Kyun zaroori:** shikayat samajhne ke liye ye aasaan lagta hai, par isse staff ke haq aur chhupi jaankari (Q-142) dono ka bypass ho jaata hai.
- **Vikalp:**
  - **(a) Kabhi nahi:** support ki apni screens (order, return aur refund ki haalat) jo customer jaisa dikhayein.
  - **(b) Sirf dekhna:** "customer ki nazar" mode, wajah ke saath, audit me, aur customer ko khabar.
  - **(c)** Customer ban ke poora kaam.
- **Salah:** **(a)**, Support Desk ke R1 wale patle hisse (D-105) me.
- **Trade-off:**
  - (a) me support ki screens banane ka kaam.
  - (b) me sirf dekhne me bhi poora data.
  - (c) sabse bada jokhim.
- **Owner ka jawab (2026-11-19):** **(a)**, kabhi nahi, support ki apni screens. Record: [DECISIONS.md](DECISIONS.md) D-202.

### Q-144. Ek insaan ke kai accounts per-customer seemaayein reset na karein, iske liye kya gina jaaye?

- **Status:** `Tay`. Topic: B14 (abuse), B5 (checkout). Group G17.
- **Sawal:** per-customer seemaayein (naye customer ke pehle order ki delivery pe UPI ki seema D-109, baar-baar return D-116, reviews D-156, referral D-176) ek insaan ke kai accounts se reset na hon, iske liye kya gina jaaye?
- **Kyun zaroori:** email ka `+` alias alag account maana jaata hai (D-017; owner ke accounts isi pe hain). Isse ek insaan naye alias se naya account bana ke har per-customer seema dobara shuru kar sakta hai.
- **Vikalp:**
  - **(a) Account alag, seemaon ke liye jod:**
    1. Account alag hi rahein (D-017).
    2. Seemaon ki ginti me ek "jod" bhi: wahi address (ek roop me karke), wahi payment ki pehchaan (gateway de to), aur wahi browser ki device cookie.
    3. Email ka bina `+` wala roop sirf ek ishara, faisla nahi.
    4. Jod pe apne aap rok sirf tay seemaon (jaise D-109) pe; baaki staff ki review queue me.
  - **(b) Email ka ek roop:** seemaon ki ginti ke liye email ka bina `+` (aur Gmail me bina dots) wala roop ek insaan; account phir bhi alag.
  - **(c) Koi jod nahi:** har account alag.
- **Salah:** **(a)**: R1 me D-109 wala jod, baaki seemaon ke saath R2 se.
- **Trade-off:**
  - (a) me jod ka kaam, aur jod ka data bhi personal data hai. Owner ke apne customer aliases ek hi address pe hon to unki "pehle order" wali seema saath lagegi: testing me dhyaan.
  - (b) me owner ke saare customer aliases ek insaan gine jaayenge.
  - (c) me har per-customer seema bekaar.
- **Kanooni detail jaanchi nahi** (R-004): device ki pehchaan aur accounts ka jod rakhne ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, account alag, seemaon ke liye jod. Record: [DECISIONS.md](DECISIONS.md) D-203.

### Q-145. Ek customer ke ek waqt me kitne delivery-pe-UPI orders khule ho sakein?

- **Status:** `Tay`. Topic: B14 (abuse), B5 (checkout). Group G17.
- **Sawal:** ek customer ke ek waqt me kitne aise orders khule ho sakte hain jinka payment delivery pe hai?
- **Kyun zaroori:** delivery pe UPI wale order me stock delivery tak ruka rehta hai (D-118). Bina payment kai orders se stock roka ja sakta hai; D-109 sirf rakam aur mana karne ki ginti dekhta hai.
- **Vikalp:**
  - **(a)** Ek customer ke (Q-144 ke "ek customer" ke hisaab se) ek waqt me misaal 2 khule orders, aur unki kul rakam D-109 ki seema tak.
  - **(b)** Ek waqt me 1 khula order.
  - **(c)** Koi alag seema nahi.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me kabhi asli customer ka teesra order prepaid hi.
  - (b) aur kada.
  - (c) me stock rokne ka raasta khula.
- **Owner ka jawab (2026-11-19):** **(a)**, ek waqt me misaal 2 khule orders. Record: [DECISIONS.md](DECISIONS.md) D-204.

### Q-146. Support goodwill coupon kitni rakam tak aur kitni baar de sake?

- **Status:** `Tay`. Topic: B14 (security), B11 (support), B4 (promotions).
- **Sawal:** support goodwill ka coupon (D-177, R2 se) kitni rakam tak aur ek customer ko kitni baar de sake?
- **Kyun zaroori:** coupon paise jaisa hai; bina seema ke chori hua account ya mili-bhagat yahin nuksaan karti hai. Refund aur daawe ki seema D-188 me tay hai; coupon ki nahi.
- **Vikalp:**
  - **(a) Seedhi ke saath seema (numbers misaal):** Support Agent ek coupon ₹200 tak, ek customer ko saal me 2 tak; Support Lead ₹1,000 tak; usse upar Head of Operations (D-044); platform ka mahine ka kul goodwill budget ₹10,000.
  - **(b) Koi seema nahi:** sirf audit.
  - **(c)** Sirf Support Lead de.
- **Salah:** **(a)**, D-188 jaisa dhaancha.
- **Trade-off:**
  - (a) me seema aur budget ki settings ka kaam.
  - (b) me bada nuksaan ho sakta hai.
  - (c) me chhote goodwill pe bhi Support Lead.
- **Owner ka jawab (2026-11-19):** **(a)**, seedhi ke saath seema aur mahine ka budget. Record: [DECISIONS.md](DECISIONS.md) D-205.

### Q-147. Bina sign-in wale forms pe bots aur spam kaise rokein?

- **Status:** `Tay`. Topic: B14 (abuse), B11 (support).
- **Sawal:** "Contact us" (D-161) aur grievance (D-163) jaise bina sign-in wale forms pe bots aur spam kaise roke jaayein?
- **Kyun zaroori:**
  - Har form email kha sakta hai (D-142).
  - Form me koi bhi kisi aur ka (allowlist wala) email likh sakta hai.
- **Vikalp:**
  - **(a) Bina CAPTCHA:** pehle form me diye email pe code se pakka karna, ek chhupa "honeypot" field, aur IP aur email pe rate limit.
  - **(b) CAPTCHA:** ek free CAPTCHA service; bahar ki script sirf in forms pe.
  - **(c)** Dono.
- **Salah:** **(a)** jab tak allowlist (D-133) hai; asli business pe dobara dekhna. R2 se (grievance ka page R1 me sirf jaankari, D-163).
- **Trade-off:**
  - (a) me code ka email budget lagta hai.
  - (b) me bahar ki script aur visitors ka data bahar jaata hai (D-157 ki soch se alag).
  - (c) me dono ka kaam.
- **Owner ka jawab (2026-11-19):** **(a)**, bina CAPTCHA: email code, honeypot aur rate limit. Record: [DECISIONS.md](DECISIONS.md) D-206.

### Q-148. Sehat se jude data ko kaun dekh sake?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (consultation). Group G18.
- **Sawal:** consultation notes (D-025), skin reaction ka case (D-130) aur allergy wali beauty profile (D-165) kaun dekh sake?
- **Kyun zaroori:** ye sehat ke paas ka data hai: privacy ka sabse gambhir hissa. Consultation notes "sirf zaroori roles" dekhein, par kaunse, ye tay nahi.
- **Vikalp:**
  - **(a) Maamle ke hisaab se:**
    1. Consultation notes: sirf wo Skin & Hair Expert jisne consult kiya ya jise maamla diya gaya; Support Lead sirf maamla khulne pe, wajah ke saath, audit me; customer apne notes dekhe.
    2. Skin reaction case: Support Lead aur Skin & Hair Expert; brand ko sirf batch aur bina pehchaan ka saar (D-130).
    3. Allergy profile: sirf customer (D-165); staff tabhi jab customer khud support me bataye.
  - **(b)** Saare Experts aur saare Support roles.
  - **(c)** Sirf Expert; Support kabhi nahi.
- **Salah:** **(a)**. R2 se (D-055).
- **Trade-off:**
  - (a) me maamle ke hisaab se pahunch ka kaam.
  - (b) me bahut haathon me sehat ka data.
  - (c) me customer ki shikayat pe Support kuch dekh nahi sakta.
- **Kanooni detail jaanchi nahi** (R-004): sehat ke data ki consent aur pahunch ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, maamle ke hisaab se pahunch. Record: [DECISIONS.md](DECISIONS.md) D-207.

### Q-149. Sehat se jude data kitne din rakhein?

- **Status:** `Tay`. Topic: B14 (privacy), B11 (consultation). Group G18.
- **Sawal:** consultation notes, skin reaction ke case aur allergy profile kitne din rakhein?
- **Kyun zaroori:** jitna lamba, utna bada jokhim; par batch ki dikkat aur recall (D-129) ka itihaas bhi chahiye.
- **Vikalp:**
  - **(a) Alag samay (numbers misaal):** consultation notes aakhri consult ke 2 saal baad delete; skin reaction case band hone ke 3 saal baad (batch aur recall ka itihaas); allergy profile jab tak customer na mitaye, aur account delete pe turant.
  - **(b)** Sab 1 saal.
  - **(c)** Sab account delete tak.
- **Salah:** **(a)**. R2 se.
- **Trade-off:**
  - (a) me alag-alag samay ka kaam.
  - (b) me batch ka itihaas kho sakta hai.
  - (c) me bina zaroorat lamba data.
- **Kanooni detail jaanchi nahi** (R-004): cosmetics ke side-effect ke records aur sehat ke data rakhne ka samay.
- **Owner ka jawab (2026-11-19):** **(a)**, alag-alag samay. Record: [DECISIONS.md](DECISIONS.md) D-208.

### Q-150. Security report ke niyam, threats aur risks naye docs me kis tareeke se aayein?

- **Status:** `Tay`. Topic: B14 (security), B16 (docs).
- **Sawal:** Security Architect ki report me 86 prastaavit niyam, 89 threats, 14 risks aur tay faislon pe 26 dhyaan ke points hain. Ye [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md), [security/THREAT_MODEL.md](security/THREAT_MODEL.md) aur [RISKS.md](RISKS.md) me, owner ki haan se, kis tareeke se aayein?
- **Kyun zaroori:**
  - Naye docs me cheez sirf owner ki haan se aati hai; par 86 niyam ek-ek karke poochhna bahut lamba hai.
  - Kai niyam ab D-180 se D-208 se badalte ya judte hain; report ke numbers (misaal) faislon se milaane hain.
  - Architecture, database, DevOps aur QA ke kaam ko security ka ek tay aadhaar chahiye; QA ke tests inhi niyamon se bante hain.
- **Vikalp:**
  - **(a) Area ke hisaab se batches:**
    1. Claude har area (edge aur hosting, sign-in, sessions, authorization aur sellers ki deewar, checkout aur paisa, files aur personal data, data stores aur services, export, audit, logs aur DevOps, R2 ke hisse) ke niyam tay faislon se mila ke SR-002 se aage, us area ke threats aur risks ke saath, ek sawal me rakhe.
    2. Owner har batch pe haan ya badlav de; haan ke baad hi docs me.
    3. Tay faislon pe dhyaan ke points apne area ke batch me; jo pehle se kisi faisle me sambhal gaye, unka sirf hawala.
    4. Report ki "sirf jaanch" wali technical cheezein Claude khud saboot ke saath jaanche ([RISKS.md](RISKS.md) §2 jaisa); kanooni wali kanooni jaanch (R-004) ke liye.
  - **(b) Ek badi batch:** saare niyam, threats aur risks ek saath; owner ek baar me haan ya badlav.
  - **(c) Ek-ek karke:** har niyam ek alag sawal.
  - **(d) Pehle se haan:** Claude tay faislon se mila ke sab seedha docs me likhe; owner baad me padh ke badlav bataye.
- **Salah:** **(a)**: lagbhag 9 batches, har ek itni chhoti ki padhi ja sake, aur har niyam faislon se mila hua.
- **Trade-off:**
  - (a) me lagbhag 9 baar ka kaam.
  - (b) me bahut lambi list: padhna mushkil, galti chhoot sakti hai.
  - (c) bahut lamba.
  - (d) tez, par owner ki haan pehle na hone se galat niyam docs me aa sakta hai, aur padhne ka bojh baad me.
- **Owner ka jawab (2026-11-19):** **(a)**, area ke hisaab se batches. Record: [DECISIONS.md](DECISIONS.md) D-209.

### Q-151. Security batch 1: edge aur hosting ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (hosting).
- **Sawal:** apps se backend tak ka raasta (Vercel apps, Render ka gateway), headers, cache, resource ki seemaayein, rate limits, kill switches aur install hone wale apps ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Saare apps `/api/*` ko Render ke gateway pe bhejte hain (D-052), aur backend ka URL public hai. Saara backend ek 512 MB process me hai (D-049, D-056), aur domain nahi (D-028). Har request ka pehla pehra yahi hai.
  - Sign-in ki rok (D-182), codes ki seema (D-187) aur dobara code (D-185) asli client IP, rate limit aur kill switch pe hi tikte hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-002, backend ka seedha raasta band:** gateway `/api/*` ki request tabhi maane jab usme app ke raaste se juda secret header ho (constant-time milaan; badalte waqt purani aur nayi dono values chalein); bina header 403. Sirf tay routes (payment webhook, health, jagane wala) bina secret ke, apni jaanch ke saath (jaise webhook signature). Saare 11 apps ki rewrite aur headers ki config ek hi template se. Kahan se: ASVS Configuration. Test: bina ya galat header 403; webhook bina signature 401; har app ke host se 200; ek test har app ki config jaanche.
  2. **SR-003, asli client IP ek helper se:** forwarded headers sirf tab maane jab secret header sahi ho, warna connection ka IP; IPv6 /64 ke hisaab se gina jaaye. Rate limits, sessions aur audit sab isi helper se. Kahan se: ASVS Business Logic, Logging. Test: jhootha `X-Forwarded-For` bhejne se IP na badle.
  3. **SR-004, personal jawab cache nahi:** har signed-in ya personal jawab pe `Cache-Control: private, no-store`. Public cache sirf tay public GET routes pe, aur unpe kabhi `Set-Cookie` nahi. Personal hisse (Pro daam, wishlist ka nishaan) alag private endpoint se. Kahan se: ASVS Data Protection. Test: har non-public route ka header (contract test); public route pe cookie bhejne se jawab na badle.
  4. **SR-005, security headers har app ke har route pe:** CSP (`default-src 'self'`, scripts sirf apni aur hash ya nonce se, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (private media wale pages pe `no-referrer`), HSTS, aur `Permissions-Policy` jo SR-001 ki cheezon ke alawa sab band rakhe. Kahan se: ASVS Configuration. Test: E2E me har app ke headers; page iframe me na khule; inline script na chale.
  5. **SR-006, bahar ki script nahi:** kisi page pe bahar ki koi script nahi; sirf payment wale page pe payment gateway ki checkout script, aur sirf usi page ki CSP me uska host. Kahan se: ASVS Configuration, Malicious Code. Test: checkout ke alawa har page ki CSP me gateway ka host nahi.
  6. **SR-007, resource ki seemaayein:** JSON body 100 KB (files seedha storage pe, backend se nahi); list ka page 100 tak; har MongoDB query pe 2 second ki time limit aur PostgreSQL pe statement timeout; search ka text 100 characters; password hash ek waqt me 2, baaki line me (line bhari to 503); request 30 second. Health aur jagane wale endpoints na version batayein, na database tak jaayein. Kahan se: ASVS Business Logic, API. Test: bada body 413; dheemi query time-out; 20 sign-in ek saath pe memory theek; health ka jawab sirf "ok".
  7. **SR-008, rate limits IP aur account dono pe:** sign-in, codes, payment shuru, review, report aur daawa "fail-closed" (Redis na mile to 503); padhne wale routes "fail-open" (process ki apni chhoti seema ke saath); 429 pe `Retry-After` aur saaf sandesh. Seemaayein (misaal): password se sign-in ek IP se 10 minute me 20 (account ki rok D-182); code maangna D-187 aur ek IP se 10 minute me 5; ek code pe 5 koshish; bina payment "place order" ek account ghante me 5; review din me 5, report din me 10; daawa ya return din me 3; uploads din me 30 files ya 100 MB; bina sign-in search ek IP minute me 60; baaki likhne wale kaam ek account minute me 60; delivery code ek parcel pe 5 galat; export ghante me 5. Kahan se: ASVS Business Logic. Test: har seema ke ek upar 429; Redis band pe sign-in 503, product page 200.
  8. **SR-009, kill switches bina deploy:** naye sign-up band; customer sign-in band; checkout band; uploads band; payouts pe rok; "sab sessions band". Har switch sirf Master ka, dobara code (D-185) ke saath, audit me, aur app me saaf sandesh. Kahan se: ASVS Architecture. Test: har switch se flow band; "sab sessions band" ke baad har session 401.
  9. **SR-010, install hone wale apps ka cache:** har install hone wale app (D-042) ka service worker `/api/*` ko kabhi cache na kare aur `index.html` se jawab na de; signed-in pages aur API ke jawab cache me nahi; sirf Delivery app ka offline hissa tay data rakhe; sign-out pe app ke caches aur offline data saaf. Kahan se: ASVS Data Protection. Test: service worker ke baad `/api` network se; sign-out ke baad Cache Storage aur IndexedDB khaali.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Edge aur hosting" ka hissa):
  1. Backend ka public URL seedha bula ke app ka raasta aur headers chhodna, ya jhootha client IP bhejna (Spoofing, Tampering): SR-002, SR-003.
  2. Galat client IP: sab users ek IP pe gine jaayein, rate limit sab ko roke, audit me galat IP (DoS, Repudiation): SR-003, SR-008.
  3. CDN kisi signed-in ya personal jawab (Pro daam, cart, address) ko cache karke doosre user ko de de (Information disclosure): SR-004.
  4. Headers ke bina XSS ka bada asar, ya sign-in aur bade buttons iframe me (clickjacking) (Tampering, Elevation): SR-005.
  5. Payment page pe bahar ki script badle to payment ke details chhin sakte hain (Information disclosure, Tampering): SR-006.
  6. Ek process me saara backend: bada body, mehnga search, password hash ki baadh ya bada export se sab gire (DoS): SR-007, SR-008, SR-009.
  7. Service worker `/api/*` ya personal pages cache kare (Information disclosure, DoS): SR-010.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-015:** koi alag WAF ya DDoS ki suraksha nahi; ek process gire to sab band (R-002, R-007 se juda). Kam karne ka tareeka: SR-007, SR-008, SR-009, aur providers ki apni suraksha.
  2. **R-016:** payment page pe gateway ki bahar ki script; uski suraksha hamare haath me nahi. Kam karne ka tareeka: SR-006.
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Vercel ke rewrite se backend tak secret header kaise jude, aur Vercel aur Render asli client IP kis header me dete hain. SR-002 aur SR-003 ka tareeka isi pe tika hai.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-015 aur R-016 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me kuch numbers baad me asli naap ke baad badlenge (settings me hain, to bina deploy).
  - (b) me har badlav ki ek line.
  - (c) me aage ka design bina edge ke pehre ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-015 aur R-016 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-210.

### Q-152. Security batch 2: sign-in ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** customer, staff, seller aur delivery partner ke sign-in (password, email code, social, authenticator, recovery, invites, allowlist) ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Sign-in ke faisle tay hain (D-021, D-133, D-182 se D-187, D-199, D-200); ye niyam unhe jaanchne layak roop dete hain. D-021 ka "authenticator laga ho to email code ke baad bhi" yahin pakka hota hai (SR-015).
  - Domain nahi (D-028), to nakli sign-in page sabse aasaan hamla hai.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-011, staff ka doosra factor:** staff ke 7 apps me har sign-in pe authenticator code (D-199); ek code ek hi baar chale, aur chhoti samay-khidki (misaal ek step aage ya peeche). Kahan se: ASVS Authentication. Test: bina code sign-in mana; wahi code dobara mana; galat codes pe rate limit.
  2. **SR-012, apps ke asli pate aur emails ke links:** har app ka ek tay URL ek jagah likha ho (operations ke doc aur Master app me). Staff ke emails me sign-in ka koi link nahi, sirf "app kholein". Customer aur seller ke emails me link sirf apne app ke host pe; email provider ki link tracking band. Kahan se: ASVS Authentication. Test: templates ka test: links sirf apne hosts pe; staff templates me link nahi.
  3. **SR-013, password:** kam se kam 12, zyada se zyada 128 characters, koi "ek capital, ek number" jaisa niyam nahi. Leak hue passwords ki jaanch ek free k-anonymity wali API se; API na mile to password maan lo par account pe nishaan, aur agle sign-in pe dobara jaanch. Hash argon2id se (misaal m=19 MiB, t=2, p=1). Kahan se: ASVS Authentication. Test: 11 characters mana; leak wala password mana; API band pe nishaan aur agle sign-in pe jaanch.
  4. **SR-014, rok aur alert:** galat password ya code pe rok D-182 ke hisaab se. Ek IP se kai accounts pe fail, ya ek account pe kai IPs se fail, to owner ko security alert. Kahan se: ASVS Authentication. Test: seema ke upar rok; doosre IP se sahi password chale; alert bane.
  5. **SR-015, customer ka email code:** 6 ank, cryptographically secure random se; sirf hash rakha jaaye; misaal 10 minute; ek code pe 5 koshish; 3 baar dobara bhejna; ek baar istemaal; us sign-in koshish aur us app se bandha. Account pe authenticator ho to code ke baad bhi authenticator (D-021). Email code se sign-in sirf customer app me. Email me maangne ka samay aur browser, aur "ye code kisi ko mat batao". Kahan se: ASVS Authentication. Test: 6th galat koshish pe code band; 11 minute baad mana; doosre browser me mana; authenticator wale account pe code ke baad bhi authenticator; staff apps me ye raasta hi nahi.
  6. **SR-016, security badlav pe dobara pehchaan:** password badalna, email badalna, authenticator band karna, naye recovery codes, account delete: inse pehle dobara pehchaan (password ya code, aur authenticator ho to wo bhi). Email badle to naye email pe code aur purane pe khabar. Password reset ke baad baaki saare sessions band. Kahan se: ASVS Authentication, Session Management. Test: bina dobara pehchaan badlav mana; purane email pe khabar; reset ke baad doosra device 401.
  7. **SR-017, social sign-in (Google, LinkedIn, GitHub, D-021):** `state` aur PKCE (S256); jahan provider OIDC de wahan `nonce`; har app ka exact redirect URI; sirf provider ka verified email maana jaaye (GitHub jaise provider pe verified email uski API se). Maujooda account se jodna tabhi jab email allowlist pe ho aur provider use verified kahe; warna pehle maujooda tareeke se sign-in. Band account pe social sign-in bhi band. Aakhri sign-in tareeka hatana mana. Kahan se: ASVS Authentication, Session Management. Test: badla `state` aur bina PKCE mana; unverified email pe jod nahi; allowlist ke bahar sign-up nahi.
  8. **SR-018, allowlist ek hi jaanch se (D-133):** identity me ek hi function, har raaste pe: password sign-up aur sign-in, social ka pehla sign-in, email code, invite accept, seller, partner aur creator sign-up, waitlist, bina sign-in forms. Allowlist se email hate to uske saare sessions band. Allowlist badalna sirf Master, dobara code (D-185) ke saath, audit me. Kahan se: ASVS Access Control. Test: har raaste ka test allowlist ke bahar wale email se; hatane ke baad agli call 401.
  9. **SR-019, kaunsa email registered hai, pata na chale:** sign-in, sign-up, password reset aur code maangne ka jawab registered aur anjaan email pe ek jaisa, aur kam se kam ek tay samay (misaal 400 ms) ke baad. Anjaan email pe koi email nahi. D-133 ka "demo store" sandesh sirf allowlist ke bahar walon ko. Kahan se: ASVS Authentication. Test: do emails pe jawab ka body aur samay milao.
  10. **SR-020, code wale emails ki seema (D-187):** D-142 ki OTP line ke andar; seema pe app turant saaf sandesh de (code chupchaap na ruke); sign-up ke codes ki seema khatam ho to bhi password reset aur security ke codes jaayein. Kahan se: ASVS Business Logic. Test: seema ke upar sandesh; sign-up ki seema ke baad bhi reset ka code jaaye.
  11. **SR-021, sign-in ke baad redirect:** `next` jaisa parameter sirf apne app ka relative path ho (`/` se shuru, `//` ya `\` se nahi; normalise karke dobara jaancha); warna home page. Kahan se: ASVS Validation. Test: `//evil.example`, `/\evil.example` aur encoded dot-segments sab home pe.
  12. **SR-022, recovery codes aur reset (D-200):** authenticator lagate waqt 10 recovery codes (hash, har code ek baar). Reset ya naye codes pe us account ke saare sessions band, security email, aur owner ko alert. Kahan se: ASVS Authentication. Test: recovery code dobara mana; reset ke baad sessions 401; D-200 ke bahar wala role reset kare to 403.
  13. **SR-023, Delivery app (D-183):** offline me sirf us shift ke assigned parcels ka kam se kam data (naam, address, phone, kaam). Delivered ya cancel hote hi us parcel ka data phone se hate; shift khatam ya sign-out pe sab saaf. Hub Manager ek click se partner ka session band kare. Kahan se: ASVS Data Protection, Session Management. Test: delivered ke baad IndexedDB me parcel nahi; Hub Manager ke band karne ke baad agla sync 401.
  14. **SR-024, seller ke andar haq (D-184):** seller ke andar alag permissions: daam, listing content, maal bhejna, stock dekhna, payout aur bank, seller ke staff manage karna. Seller staff ke roles sirf Account Owner de. Kahan se: ASVS Access Control. Test: listing wale user se daam badlana 403; bina authenticator ke bank badlana mana.
  15. **SR-025, invites aur pehla account:** invite ek baar ka, misaal 72 ghante, us email aur us app se bandha, allowlist ke andar; sirf appoint karne ke haq wala bheje; staff ko accept pe authenticator lagana zaroori. Koi default account ya password nahi; pehla Master sirf owner ke machine se ek baar ki command se, audit me. Kahan se: ASVS Authentication, Access Control. Test: invite dobara, expiry ke baad ya doosre email se: sab mana; naye install me bina command koi staff sign-in nahi.
  16. **SR-026, bade kaamon pe dobara code (D-185):** D-185 ki list ke har kaam pe misaal 5 minute ke andar ka authenticator code; authenticator band karna aur naye recovery codes har baar apna alag code maangein. Kahan se: ASVS Authentication, Access Control. Test: list ke har kaam pe bina code 403; khidki ke baad dobara code.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Sign-in" ka hissa):
  1. Milte-julte naam ka nakli sign-in page: staff ka password aur authenticator code, ya customer ka code (Spoofing): SR-011, SR-012; R-017.
  2. Leak hue passwords se credential stuffing aur password spraying (Spoofing): SR-013, SR-014, SR-008.
  3. Email code ka andaaza ya ek code ka dobara istemaal (Spoofing): SR-015.
  4. Code ka phishing ("code bata do"), ya customer ka inbox hi hamlavar ke paas (Spoofing): SR-015, SR-016; R-018.
  5. Social sign-in se kabza: bina verified email ka jod, login CSRF, redirect URI se khel (Spoofing, Elevation): SR-017.
  6. Allowlist ka koi ek raasta khula reh jaaye (Elevation): SR-018.
  7. Sign-up, sign-in ya reset ke jawab ya samay se pata chale kaunsa email registered hai (Information disclosure): SR-019.
  8. Code wale emails ki baadh: OTP ki din ki jagah khatam, ya kisi ke inbox pe emails ki baadh (DoS): SR-020, SR-008.
  9. Sign-in ke baad bahar ki site pe redirect (Spoofing): SR-021.
  10. Authenticator reset ya recovery ke raaste se kabza, ya owner phone khone pe bahar (Spoofing, DoS): SR-022.
  11. Jaan-boojh ke galat password se owner ke staff accounts band karna (DoS): SR-014.
  12. Delivery partner ka phone kho jaaye: chalta session aur offline data (Information disclosure, Spoofing): SR-023, SR-010.
  13. Seller ka bina authenticator wala user daam, maal ya payout badle (Tampering, Elevation): SR-024, SR-026.
  14. Invite link kisi aur ke haath, default account, ya pehla Master banane ka khula raasta (Spoofing, Elevation): SR-025.
  15. Khula chhoda session ya chori hui cookie se bade kaam (Elevation): SR-026.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-017:** domain nahi (D-028): milte-julte naam ke nakli sign-in pages aur hamare naam se nakli emails; staff aur customer pehchaan nahi paate. Kam karne ka tareeka: SR-011, SR-012, R2 me passkey (D-199), aur emails me "hum kabhi password ya code nahi maangte".
  2. **R-018:** customer ka account utna hi surakshit jitna uska email inbox (email code, D-021). Kam karne ka tareeka: SR-015, SR-016, aur optional authenticator.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-017 aur R-018 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me sign-in ke kaam ka hissa bada (invites, recovery, social ke niyam), par sab R1 ke tay faislon ke andar.
  - (b) me har badlav ki ek line.
  - (c) me sign-in ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-017 aur R-018 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-211.

### Q-153. Security batch 3: sessions aur tokens ke niyam, threats aur risk ka jod maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** sign-in ke baad ke session (cookies, tokens, unki umar, band karna, CSRF, signing keys) ke neeche ke niyam, threats aur R-010 me jod naye docs me aayein?
- **Kyun zaroori:**
  - Sessions ki umar tay hai (D-180, D-181), aur har app ki apni cookies (D-186). Ye niyam batate hain ki session kaise bane, badle aur band ho.
  - Apps `*.vercel.app` jaise saajhe hosts pe hain (D-048, domain nahi), to cookies sirf apne host ki honi chahiye.
  - Redis restart pe data jaata hai (R-010); band hua session phir chal na pade.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-027, cookies:** session ki cookies sirf apne host ki (koi `Domain` attribute nahi), `HttpOnly`, `Secure`. Access cookie `__Host-` prefix aur `SameSite=Lax` ke saath. Refresh cookie `__Secure-` prefix, `SameSite=Strict`, aur sirf sign-in wale API path pe (`__Host-` me path `/` hi ho sakta hai, isliye refresh pe `__Secure-`). Koi token ya user ka data browser storage me nahi; wahan sirf theme jaisi pasand. Kahan se: ASVS Session Management. Test: Set-Cookie ke flags; localStorage aur sessionStorage me user ka data nahi.
  2. **SR-028, token ki umar aur badalna:** access token chhota (misaal 10 minute). Refresh token har istemaal pe badle; ek "family" ke saath purane token ka dobara istemaal pakda jaaye: aisa ho to poori family band aur security email. Usi device aur network se pichhla token misaal 60 second ke andar aaye to use khoya jawab maana jaaye, chori nahi. Sessions ki umar aur bina kaam ke band hona D-180 aur D-181 ke hisaab se. "My devices" me har session dikhe aur band ho sake. Kahan se: ASVS Session Management. Test: purana token doosre device se: family band; khidki me usi device se: chori nahi; umar aur bina kaam wale band hone ke tests.
  3. **SR-029, session ka sach database me:** session aur uske band hone ka record database me; Redis sirf tez cache. Redis khaali ho to gateway database se jaanche. Sign-out, role khatam aur allowlist se hatna agli request pe asar kare. Kahan se: ASVS Session Management. Test: Redis khaali karne ke baad band session 401; role khatam ke baad agli call 403.
  4. **SR-030, CSRF:** badalne wale har route pe `Origin` (ya `Host`) ki allowlist, ek custom header jo sirf apna app bhejta hai, aur SameSite. Jo routes browser khud kholta hai (social sign-in ka start aur callback) unki alag list: sirf GET, bina doosre asar ke. Kahan se: ASVS Access Control, Session Management. Test: doosre origin se POST 403; custom header ke bina 403.
  5. **SR-031, tokens ka signature:** tokens asymmetric signature se (misaal ES256), algorithm pakka; `iss`, `aud` (= app), `exp`, `nbf` jaanche jaayein, taaki ek app ka token doosre app pe na chale. Signing keys apne aap badlein (D-197, misaal 30 din) aur private key encrypted rahe. Keys na mil payein to 503, 401 nahi. Kahan se: ASVS Session Management, Cryptography. Test: `alg:none`, HS256 key ka khel, galat `aud`, expired: sab 401; key ki dikkat pe 503.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Sessions aur tokens" ka hissa):
  1. XSS ya malware se session token ki chori; lamba session chori ke baad bhi chale (Spoofing, Information disclosure): SR-027, SR-028, SR-005.
  2. Refresh token ki copy chupchaap chale; ya ulta, khoya jawab "chori" maan ke sahi user baar-baar bahar ho (Spoofing, DoS): SR-028.
  3. Redis restart pe band sessions ke nishaan ud jaayein aur purana session phir chale (Elevation): SR-029.
  4. Cookie wale sessions pe CSRF (doosri site se badalne wali request) (Tampering): SR-030.
  5. Token jaali banana (algorithm ka khel), signing key ka leak, ya ek app ka token doosre app pe chalna (Spoofing, Elevation): SR-031.
  6. Allowlist se hata tester, ya role khatam hua staff, chalte session se kaam karta rahe (Elevation): SR-018, SR-029.
- **Risk me jod** ([RISKS.md](RISKS.md)): R-010 (Key Value ka data restart pe jaata hai) ke "Kam karne ka tareeka" me: sessions aur unke band hone ka sach database me (SR-029); rate limits ki ginti restart ke baad thodi der shuru se, ye maana. Status `Khula` hi rahe.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-010 me jod.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har request pe session ki jaanch Redis se, aur Redis khaali ho to database se: thoda dheema us waqt.
  - (b) me har badlav ki ek line.
  - (c) me sessions ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-010 me jod. Record: [DECISIONS.md](DECISIONS.md) D-212.

### Q-154. Security batch 4: authorization aur sellers ki deewar ke niyam aur threats maanein?

- **Status:** `Tay`. Topic: B14 (security), B2 (roles).
- **Sawal:** kaun kya dekh aur badal sake (default deny, customer aur seller ka apna data, staff ka area, roles aur grants, kaam ka bantwara, staff ko customer ki jaankari) ke neeche ke niyam aur threats naye security docs me aayein?
- **Kyun zaroori:**
  - Kisi aur ki id daal ke uska order ya invoice dekhna (BOLA) e-commerce ka sabse aam hamla hai.
  - Ek platform pe kai sellers hain; seller A ko seller B ka data kabhi na dikhe. Sellers ke liye D-143, D-144, aur staff ke liye D-201, D-202 tay hain.
  - Kaam ke bantwara ke faisle (D-084, D-146, D-147, D-188, D-189) code me pakke pehre chahte hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me):
  1. **SR-032, default deny:** jo route "public" mark nahi, wo bina session 401. Har handler me `authorize(actor, permission, resource)`, ek bina I/O ka pure function (mutation tests ke saath). Permission na ho to 403; cheez scope ke bahar ho to 404. Har route aur har actor ka matrix test contracts se bane; gateway ka route manifest bhi contracts se, aur jo route contract me nahi wo gateway se pahunch hi nahi sakta. Kahan se: ASVS Access Control. Test: matrix test CI me; bina permission ka naya route test me fail.
  2. **SR-033, customer ka data sirf uska:** customer ki har cheez (order, parcel, invoice, address, return, daawa, review, media) ki query repository level pe owner ke filter ke saath; id kitni bhi lambi ho, uspe bharosa nahi. Kahan se: ASVS Access Control. Test: har resource type pe doosre customer ki id: 404.
  3. **SR-034, sellers ke beech deewar:** seller ka har data `sellerId` ke filter ke saath repository level pe; reports, exports aur media sirf apne (D-143, D-144). Jahan staff ka scope ho (jaise hub ya area), wahan bhi isi tarah filter. Kahan se: ASVS Access Control. Test: seller B ki har id pe seller A ko 404; export me sirf apne rows.
  4. **SR-035, app aur area ki seema:** route manifest me har route ke allowed apps aur permissions; customer ke token se staff ka route 403 (token ka `aud`, SR-031). Delivery partner sirf apne assigned parcels; staff apne area (hub, warehouse, sub-district, district, state; D-015) tak. Kahan se: ASVS Access Control. Test: customer token se admin route; partner se doosre ka parcel; hub staff se doosra hub: 403 ya 404.
  5. **SR-036, strict schema aur audience ka jawab:** har request ka schema strict: anjaane fields pe 400; role, status, daam, seller id jaise fields client se kabhi nahi. Har audience ka apna jawab: seller ke jawab me customer ke naam, phone, email aur address ke fields hi nahi (D-143). Kahan se: ASVS Validation, API. Test: extra field pe 400; seller ke jawab ke schema me customer ki personal jaankari nahi.
  6. **SR-037, roles aur grants:** kuch permissions kabhi sub-role me nahi (grants dena, authenticator reset, allowlist, payout manzoori, kill switches); koi role khud ko appoint nahi kar sakta; har grant ka scope aur umar; Master ke paas koi "decide" permission nahi (D-047); role aur grant ka har badlav dobara code (D-185) aur audit ke saath. Kahan se: ASVS Access Control. Test: aisi permission wala sub-role mana; khud ko appoint mana; Master se listing manzoor 403.
  7. **SR-038, kaam ka bantwara:** pure checks: appeal tay karne wala account reject karne wala nahi (D-084, D-146, D-147); seema se upar refund (D-188), payout (D-189), fees aur policy publish me banane aur manzoor karne wale alag accounts; apne brand (D-031) ka staff apni listing manzoor nahi; brand ka staff apne product pe review nahi (D-156). Kahan se: ASVS Business Logic, Access Control. Test: har niyam ka unit aur API test: wahi account 403.
  8. **SR-039, staff ko customer ki jaankari (D-201, D-202):** list API me chhupi jaankari; poori sirf maamla kholne pe wajah ke saath, aur har "poori dekhi" audit me; delivery partner ko sirf apne active parcel ki, delivered ke baad chhupi; "customer ki nazar se" ka koi raasta nahi. Kahan se: ASVS Data Protection. Test: list API me chhupa; poori dekhne pe audit entry; partner ko delivered ke baad chhupi.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Authorization aur sellers ki deewar" ka hissa):
  1. Customer id badal ke doosre ka order, invoice, address, return ya daawe ki photo dekhe ya badle (BOLA) (Information disclosure, Tampering): SR-032, SR-033.
  2. Seller A, seller B ke orders, stock, settlement, listings ya dastavez dekhe ya badle; ya report aur export me scope ke bahar ka data (Information disclosure, Tampering): SR-034.
  3. Customer ya seller ke token se staff ke routes; partner doosre hub ya doosre partner ke parcels (Elevation): SR-032, SR-035.
  4. Request me zyada fields (role, daam, status, "approved", seller id), ya seller ke jawab me customer ka phone (Tampering, Information disclosure): SR-036.
  5. Roles se upar chadhna: khatarnak permission wala sub-role, khud ko appoint karna, grant ke scope se bahar (Elevation): SR-037.
  6. Kaam ka bantwara toote: wahi account appeal tay kare, refund banaye aur manzoor kare, ya apni listing manzoor kare (Elevation, Repudiation): SR-038.
  7. Staff zaroorat se zyada customer ki jaankari dekhe ya list bana ke le jaaye (Information disclosure): SR-039.
- **Risks:** is batch me naya risk nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har route pe matrix test aur repository ke filter ka kaam; par BOLA aur sellers ki deewar ka pehra pehle din se.
  - (b) me har badlav ki ek line.
  - (c) me authorization ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-213.

### Q-155. Security batch 5: catalog, checkout aur paise ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B5 (checkout), B6 (payments).
- **Sawal:** seller aur user ka content, listing ke versions, daam, settings, checkout, stock, payment aur webhooks, delivery pe UPI, paise wale staff faisle, seller ka bank aur ledger ke neeche ke niyam, threats aur risks naye security docs me aayein?
- **Kyun zaroori:**
  - Client se daam ya fee badal ke bhejna, nakli payment webhook, aur wahi event do baar aana: e-commerce me paise ka seedha nuksaan yahin se hota hai.
  - Daam (D-061, D-087), quantity (D-091), stock (D-118), delivery pe UPI (D-109, D-204), refund (D-111), seema (D-188, D-189, D-205) aur bank badlav (D-190) ke faisle tay hain; ye niyam unhe code ke pehre dete hain.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-040, content me script nahi:** user aur seller ka content (review, brand ka jawab, Q&A, description, ingredients ka text, naam) text ki tarah rakha jaaye aur customer aur staff dono apps me escape karke dikhe. Rich text sirf chhoti allowlist (bold, list), server pe sanitize. Links band ya `rel="nofollow ugc noopener"`. Phone, email aur link ke pattern D-136 ki jaanch me. Kahan se: ASVS Validation. Test: XSS payloads ki list har field me; customer aur Admin app me kuch na chale.
  2. **SR-041, listing ke versions (D-098):** listing ka har jokhim wala badlav ek naya version, ek hi raaste se. Staff ki manzoori ek version id pe; beech me naya badlav aaya to wo manzoori naya version live nahi karti. Live version badla nahi ja sakta. Kahan se: ASVS Business Logic. Test: jaanch ke beech badlav: purani manzoori naya version live na kare.
  3. **SR-042, daam ke niyam server pe (D-061, D-087):** daam 0 se zyada, batch ke MRP se upar nahi, bade badlav pe dobara confirm. Pro daam sirf jaanche hue Pro (D-069) ke session pe aur private endpoint se (SR-004). Kahan se: ASVS Business Logic. Test: MRP se upar mana; bina confirm bada badlav mana; bina sign-in jawab me Pro daam nahi.
  4. **SR-043, settings aur imports:** allowlist, switches, fees, policy ke numbers, HSN table, blocklist, emails ki chhat, search ke synonyms, location data: har ek ki apni permission; paise aur security wali settings pe dobara code (D-185); har badlav audit me purani aur nayi value aur wajah ke saath; import pehle "dry run" aur schema ki jaanch; blocklist sirf senior catalog role (D-132). Kahan se: ASVS Access Control, Logging. Test: bina haq 403; audit me pehle aur baad; galat import file ka koi asar nahi.
  5. **SR-044, checkout ka hisaab server pe:** client sirf variant id aur quantity bheje. Daam, batch ka MRP, discount, delivery fee, tax, quantity ki seema (D-091) aur serviceability (D-016 niyam 9) server order banate waqt nikale. Customer ka dekha total aur server ka total na mile to order nahi; naya total dikhao. Kahan se: ASVS Business Logic. Test: request me daam ya fee bhejne ka koi asar nahi; unserved pincode pe order mana.
  6. **SR-045, stock aur dobara click:** stock ki reservation atomic (conditional update ya transaction). "Place order" pe idempotency key: wahi body pe wahi jawab, alag body pe 422, chalte hue pe 409. Kahan se: ASVS Business Logic. Test: aakhri unit pe 50 order ek saath: ek hi safal; dobara click: ek hi order.
  7. **SR-046, stock rokne ki seema:** ek customer ke khule delivery-pe-UPI orders D-204 ke hisaab se; bina payment "place order" ki seema (SR-008); quantity ki seema D-091. Kahan se: ASVS Business Logic. Test: seema ke upar order mana, saaf sandesh ke saath.
  8. **SR-047, paise ka hisaab:** paisa hamesha integer paise me; baantne ka ek function jiska bacha paisa tay niyam se jaaye. Har refund line ke hisaab se (D-110, D-114), aur kabhi "liya gaya paisa minus pehle ke refund" se zyada nahi. Kahan se: ASVS Business Logic. Test: random carts pe property tests: refunds ka jod payment se kabhi zyada nahi.
  9. **SR-048, payment pakka sirf server se:** payment gateway ka order server banaye (exact rakam aur currency, apne order se juda). Order tabhi "paid" jab server signature jaanche ya webhook aaye aur rakam, currency aur order id milein. Browser ka "success" sirf screen ke liye. Kahan se: ASVS Business Logic. Test: nakli success callback pe order unpaid; kam rakam ka payment juda nahi.
  10. **SR-049, webhooks:** signature raw body pe, constant-time milaan. Har event id ek hi baar (inbox table), taaki dobara aaye to dobara asar nahi. Ulte kram me aaye events sambhale. Der se aaya payment D-118 ke hisaab se apne aap refund, ek hi baar. Kahan se: ASVS API, Business Logic. Test: wahi event 3 baar: ek asar; badli body: 401; ulta kram: sahi aakhri haalat.
  11. **SR-050, delivery pe UPI (D-109):** QR sirf system banaye, us parcel ki exact rakam ka, server se partner ke app me. "Paid" sirf gateway ke webhook se. Customer ke app me usi waqt "payment mila" dikhe. Partner ke app me "paid" mark karne ka koi raasta nahi. Delivery code payment ke baad hi. Kahan se: ASVS Business Logic. Test: partner ke liye "paid" ka koi API nahi; webhook ke bina code daalna band.
  12. **SR-051, paise wale staff faisle:** refund aur daawe (D-188), payout (D-189), goodwill coupon (D-205, R2): role ke hisaab se rakam ki seema, din ki kul seema, seema se upar doosre account ki manzoori; har ek audit me; refund hamesha original raaste (D-111). Kahan se: ASVS Business Logic, Access Control. Test: seema se upar Support Agent ka faisla pending; banane aur manzoor karne wala ek account: mana.
  13. **SR-052, seller ka bank (D-190):** bank ya payout details ka badlav dobara code ke saath; purane email aur in-app pe khabar; naye khaate pe rok ke dauraan payout batch me nahi; details encrypted, screen pe sirf aakhri 4 ank. Kahan se: ASVS Business Logic, Data Protection. Test: bina code mana; khabar jaaye; rok ke dauraan payout batch me nahi.
  14. **SR-053, ledger:** ledger sirf jodta hai (app ke database user ko update aur delete ka haq nahi); har entry double entry se balance; sudhaar sirf ulti entry se, wajah ke saath; payment gateway ki report se milaan (R1 me basic, roz ya hafte); farak pe alert. Kahan se: ASVS Business Logic, Logging. Test: app ke user se UPDATE mana; milaan ka test.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Catalog, checkout aur paisa" ka hissa):
  1. Seller ke content ya review me stored XSS, jo customer app ya staff ke app me chale (Tampering, Elevation): SR-040, SR-005.
  2. Jokhim wala field doosre raaste se badal ke jaanch se bachna, ya jaanch ke beech version badalna (Tampering): SR-041.
  3. Daam MRP se upar, 0, ya bada badlav bina confirm; Pro daam sab ko dikhna (Tampering, Information disclosure): SR-042, SR-004.
  4. Settings (allowlist, switches, fees, HSN, blocklist, emails ki chhat) kam haq ya chori ke account se badalna (Tampering, Elevation): SR-043, SR-026.
  5. Client se daam, discount, delivery fee, quantity ya pincode badal ke bhejna; Pro daam bina Pro darje (Tampering): SR-044, SR-042.
  6. Stock ki race: ek saath orders se zyada bikna; reservation aur payment ke beech (Tampering): SR-045.
  7. Delivery-pe-UPI ya bina payment ke orders se stock rokna (DoS): SR-046.
  8. Aadhe cancel ya return pe refund ki galat ginti se zyada paisa wapas (Tampering): SR-047.
  9. Nakli webhook ya sirf browser ke "success" se order pakka, ya kam rakam ka payment jodna (Spoofing, Tampering): SR-048, SR-049.
  10. Wahi webhook do baar ya purana dobara: do refund ya do ledger entry (Tampering): SR-049.
  11. Delivery pe partner apna QR dikhaye ya khud "paid" kare; customer purana screenshot dikhaye (Spoofing, Tampering): SR-050.
  12. Chori hua staff account refund seema se upar ya baar-baar chalaye (Elevation, Tampering): SR-051, SR-038.
  13. Seller account chori karke bank badal ke agla payout apne khaate me (Tampering, Spoofing): SR-052, SR-026.
  14. Ledger me seedha badlav, ya finance aur gateway ka milaan na hona (Tampering, Repudiation): SR-053.
- **Risks:** is batch me naya risk nahi (payment page ki script R-016 me pehle se).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me).
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me checkout aur finance ke kaam me tests ka hissa bada (race, property tests, webhook ke tests); par paise ka seedha nuksaan yahin rukta hai.
  - (b) me har badlav ki ek line.
  - (c) me checkout aur finance ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-214.

### Q-156. Security batch 6: delivery, daawe aur reviews ke niyam, threats aur risk maanein?

- **Status:** `Tay`. Topic: B14 (security), B1 (delivery), B7 (returns), B8 (reviews).
- **Sawal:** delivery code, delivery aur pickup ka saboot, partner ki location, trips aur scans, fraud ke signals, reviews aur reports ke neeche ke niyam, threats aur risk naye docs me aayein?
- **Kyun zaroori:**
  - "Parcel nahi mila" ka faisla saboot se hota hai (D-072, D-148), to saboot jaali na ho sake.
  - Jhoothe daawe, nakli reviews aur jhoothi reports se paise aur bharose ka nuksaan hota hai (D-116, D-135, D-136, D-156).
  - Delivery code confirmation email me jaata hai (D-126), to wo sirf sahi waqt aur sahi partner pe chale.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-054, delivery code:** har parcel ka cryptographically secure random se 6 ank ka code. Partner ke app ko code kabhi nahi milta; milaan server pe. Ek parcel pe 5 galat koshish ke baad code daalna band (Hub Manager khole, audit me). Code tabhi chale jab parcel "out for delivery" ho aur usi partner ko assigned ho. Code push (D-195), logs aur aankdon me kabhi nahi. Kahan se: ASVS Business Logic. Test: 6th koshish mana; doosre partner se mana; logs me code nahi.
  2. **SR-055, delivery aur pickup ka saboot:** photo app ke camera se (file input pe `capture`; browser me gallery ko poori tarah rokna pakka nahi, ye seema maani); server ka samay; location aur uski accuracy; address ke pin se doori (misaal 300 m se zyada to nishaan); photo ka hash (wahi photo dobara aaye to nishaan). Kahan se: ASVS Business Logic. Test: purani photo ka hash dobara: nishaan; door ki location: nishaan.
  3. **SR-056, partner ki location:** location sirf events pe (delivered, koshish fail, pickup); lagatar tracking nahi. Kitne din aur kaun dekhe, D-191 ke hisaab se. Kahan se: ASVS Data Protection. Test: delivery ke beech location ki koi call nahi; delete job ka test.
  4. **SR-057, trips aur scans:** har scan pe kaun, kis device se aur kab; manifest aur seal number (D-027); hub pe ginti ka farak apne aap nishaan aur audit me. Kahan se: ASVS Logging. Test: kam bag pe nishaan; har scan ka actor.
  5. **SR-058, fraud ke signals ka record R1 se:** customer ke daawe, photo hash ka dobara aana, partner ke daawon ka hissa, delivery pe UPI pe mana (D-072 niyam 4, D-116). Support ki screen pe nishaan; apne aap rok sirf tay faislon se (D-109, D-203; D-116 R2 me). Kahan se: ASVS Business Logic. Test: signals ka record aur nishaan dikhe.
  6. **SR-059, reviews:** review sirf delivered line se (D-135); ek account din me 5 (SR-008). Seller app ke users (wahi user ya wahi email) apne brand pe review nahi likh sakte (D-156). Kai accounts ke signals D-203 ke hisaab se (R2 se). Kahan se: ASVS Business Logic. Test: bina delivered line review 403; seller ke user ka review 403.
  7. **SR-060, reports:** report sirf signed-in, ek account din me 10 (SR-008). "Personal data" ya "intimate" wali report (D-136 niyam 4) queue me sabse upar, aur misaal 24 ghante me faisla na ho to alert. Jhoothi reports ki ginti rakhi jaaye; baar-baar jhoothi report wale ki report queue me neeche. Seller ki report (R2) kabhi apne aap review nahi chhupati. Kahan se: ASVS Business Logic. Test: seema ke upar report mana; 24 ghante ka alert; jhoothi report ki ginti.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Delivery, daawe aur reviews" ka hissa):
  1. Partner delivery code ka andaaza lagaye, ya code kisi aur raaste (push, logs) leak ho (Spoofing): SR-054.
  2. Nakli saboot: gallery ki purani photo, ya GPS badal ke "delivered" (Spoofing, Repudiation): SR-055.
  3. Delivery ki photo aur location ka galat istemaal ya zyada der rakhna; partner ki lagatar tracking (Information disclosure): SR-056, D-191.
  4. Trip ka manifest ya scan badal ke warehouse, hub ya raaste me maal gayab (Tampering, Repudiation): SR-057.
  5. Return pickup pe doosra batch ya nakli maal, partner ki mili-bhagat ke saath (Tampering): SR-055, SR-058.
  6. Jhoothe daawe: internet ki photo, ek photo kai daawon me, baar-baar "parcel nahi mila" (Spoofing, Repudiation): SR-058, SR-055.
  7. Support Agent aur customer ki mili-bhagat (jaan-pehchaan wale ka refund ya daawa manzoor) (Elevation): SR-051, SR-038.
  8. Kai accounts se nakli reviews, ya brand ka staff apne product pe review (Spoofing): SR-059, D-203.
  9. "Personal data" ki jhoothi report se negative review faisle tak chhupwana (DoS, Tampering): SR-060.
- **Risk** ([RISKS.md](RISKS.md) me, tag `Security`): **R-019:** delivery partner ke phone pe offline customer data (naam, address, phone); phone kho jaaye. Kam karne ka tareeka: kam se kam data aur delivered pe hatana (SR-023), cache ke niyam (SR-010), manzoor phone aur Hub Manager se band (D-183). Status `Khula` (bachav ke saath).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-019 `Khula`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me Delivery app aur support me saboot aur signals ka kaam; browser me gallery ki photo poori tarah nahi rukti, isliye hash aur location ke nishaan.
  - (b) me har badlav ki ek line.
  - (c) me delivery aur daawon ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-019 `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-215.

### Q-157. Security batch 7: files aur personal data ke niyam, threats aur risk maanein?

- **Status:** `Tay`. Topic: B14 (security, privacy).
- **Sawal:** uploads, private media, field encryption, kam data lena, data ke samay ka delete job, account delete aur sehat ke data (R2) ke neeche ke niyam, threats aur risk naye docs me aayein?
- **Kyun zaroori:**
  - Saara backend ek process me hai (D-049): ek bura file (jaise image parser ka bug) poore backend tak pahunch sakta hai.
  - KYC, daawe ki photos aur delivery ki photo jaise private media ka URL leak ho to pehchaan aur ghar ka pata bahar.
  - Data ke samay (D-191 se D-194, D-208) aur account delete (D-151) tay hain; unhe chalane wala job aur encryption ke niyam chahiye.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-061, uploads:** file ka type uske andar ke bytes se jaancha jaaye (images JPEG, PNG, WebP; dastavez PDF sirf jahan zaroori; video sirf daawe me, D-106). Size (misaal): image 5 MB, PDF 10 MB, video 30 MB. SVG, HTML aur baaki types kabhi nahi. Har image dobara encode ho aur EXIF (location samet) hate. File ka naam kabhi istemaal nahi. Upload seedha storage pe, chhote signed URL se (misaal 10 minute, exact type aur size). Account ki din ki seema (SR-008). Kahan se: ASVS Files and Resources. Test: SVG aur `.png` naam wala HTML mana; EXIF wali photo ka live roop bina EXIF; bada file mana.
  2. **SR-062, private media:** KYC, Pro ke dastavez, claims ke saboot, daawe aur pickup ki photos, aur delivery ki photo alag private jagah me; sirf authorization ke baad chhota signed URL (misaal 5 minute); PDF `Content-Disposition: attachment` ke saath; app ke origin se kabhi nahi. Har file ka record (maalik, maqsad, public ya private); data me provider ka URL nahi, sirf file ka id. Kahan se: ASVS Files and Resources, Data Protection. Test: private URL 6 minute baad mana; bina haq signed URL nahi banta.
  3. **SR-063, field encryption:** AES-256-GCM, record aur field ka context saath me (associated data), key id ke saath taaki key badal sake: seller ka PAN, bank account, authenticator ke secrets, partner ke ID numbers, aur R2 me consultation notes aur sehat ke fields. Dhoondhne ke liye HMAC blind index; dikhane ke liye chhupi copy. Recovery codes aur baaki codes sirf hash. Kahan se: ASVS Cryptography, Data Protection. Test: database me plaintext nahi (pattern test); ek record ka encrypted value doosre record me copy karke nahi khulta.
  4. **SR-064, kam data lena:** Aadhaar ka number nahi lena (kisi KYC me zaroori ho to chhupa); customer ka UPI ID nahi rakhna; proprietor ka GSTIN personal data maana jaaye (andar PAN hai); delivery partner aur transporter ke driver ka sirf kaam ka data. Kahan se: ASVS Data Protection. Test: schema me aise fields nahi (review checklist).
  5. **SR-065, data ke samay ka job:** har data class ke samay (D-191 se D-194, D-208) ka roz ka job: delete ya pehchaan hatana; job ka log (kitne hate) bina data ke; backups me purana data backup ki umar tak (D-196). Kahan se: ASVS Data Protection. Test: samay se purana record nahi bachta; job ka test.
  6. **SR-066, account delete (D-151):** pehle dobara pehchaan (SR-016); email aur in-app khabar; misaal 7 din me wapas le sake. Ek event se har service apni copy hataye ya pehchaan hataye (invoice aur ledger me naam, pata aur email ki jagah code). Sessions, push subscriptions aur waitlist bhi. Kahan se: ASVS Data Protection. Test: delete ke baad har service me naam aur email nahi; invoice me code.
  7. **SR-067, sehat ka data (R2 se):** alag consent (D-165); encrypted (SR-063); sirf D-207 ke roles dekhein, har dekhna audit me; D-208 ka samay; seller ko kabhi nahi (D-165); business events aur aankdon (D-157) me kabhi nahi. Kahan se: ASVS Data Protection. Test: bina consent field save nahi; galat role 403; events me ye fields nahi.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Files aur personal data" ka hissa):
  1. Bura file: SVG ya HTML se XSS, ek file jo do type ki ho, bahut bada file, ya image parser ke bug se process pe kabza (Tampering, Elevation, DoS): SR-061.
  2. Private media ka URL andaaze se, public jagah se, lambe signed URL se ya Referer se leak (Information disclosure): SR-062, SR-005.
  3. Uploads ki baadh se free storage khatam (DoS): SR-061, SR-008.
  4. Review ki photo me EXIF ki location, ya review text me phone ya email (Information disclosure): SR-061, SR-040.
  5. Database ya backup leak hone pe PAN, bank account aur authenticator ke secrets khule (Information disclosure): SR-063, D-196.
  6. Zaroorat se zyada data lena ya zyada der rakhna (Information disclosure): SR-064, SR-065.
  7. Account delete ke baad bhi kisi service me naam aur email bacha (Information disclosure): SR-066.
  8. Sehat ka data galat haathon me ya aankdon me (R2) (Information disclosure): SR-067.
- **Risk** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`): **R-020:** uploads ki malware jaanch nahi (₹0, 512 MB me antivirus nahi chal sakta). Kam karne ka tareeka: sirf tay types, bytes se jaanch aur images ka dobara encode (SR-061); PDF attachment ke roop me, app ke origin se nahi (SR-062).
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-020 `Maana`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me images ka dobara encode aur encryption ka kaam (CPU aur memory, R-007), par bura file aur leak ka asar chhota.
  - (b) me har badlav ki ek line.
  - (c) me uploads aur data ka design bina pakke niyam ke.
- **Kanooni detail jaanchi nahi** (R-004): KYC me Aadhaar ya doosre ID ke niyam, aur personal data ke delete ke niyam.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-020 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-216.

### Q-158. Security batch 8: data stores, services aur khabron ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** databases ke users, injection, Redis, ek process me services ki deewar, server ke bahar ke calls, emails aur browser push ke neeche ke niyam, threats aur risks naye docs me aayein?
- **Kyun zaroori:**
  - Har service ka apna database aur user hai (D-011, D-050), par Render pe saari services ek process me chalti hain (D-049, D-056): process ki koi deewar nahi, to deewar code me chahiye.
  - Free tier pe databases ka network sabke liye khula ho sakta hai; tab suraksha sirf password aur TLS pe.
  - Emails aur push me naam aur address jaate hain (D-126, D-195), aur push subscription ka URL browser deta hai.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal):
  1. **SR-068, database users:** har service ka database user sirf apne database pe (D-050): MongoDB me apne database pe `readWrite`; finance me app role sirf data ke kaam (DML), migration ka role alag. TLS zaroori. Har password random (misaal 32 se zyada characters). Provider network allowlist de to wahi. Laptop, tests aur CI kabhi production databases se nahi judte; sirf backup command (D-013) aur break-glass command (D-200). Kahan se: ASVS Architecture, Communication, Configuration. Test: service A ke user se B ka database mana; bina TLS connection mana.
  2. **SR-069, injection:** MongoDB filters sirf typed builders se; user input me `$` ya `.` se shuru keys mana; finance me sirf parameterized queries; search text ka regex escape aur lambai ki seema (SR-007). Kahan se: ASVS Validation. Test: `{"$ne": null}` jaise inputs pe 400; SQL injection strings ka asar nahi.
  3. **SR-070, Redis:** sirf internal URL se (D-051), provider de to password ke saath; har service ka key prefix; cache me sirf wo jo database se dobara ban sake; queue ke job ka payload worker me schema se jaancha jaaye. Kahan se: ASVS Architecture, Validation. Test: galat job payload reject; Redis khaali karne ke baad cache sahi bane.
  4. **SR-071, ek process me bhi service ki deewar:** services ek doosre ka database client ya andar ka code import nahi karti (lint aur dependency rule); andar ki calls bhi typed facade aur actor ke context se authorize; har service sirf apne config namespace ke secrets padhe (lint); events schema se jaanche jaayein aur bhejne wali service ke naam ke saath; split mode me andar ki calls signed. Image aur PDF ka kaam jahan ho sake provider pe, ya chhoti aur taaza libraries se. Kahan se: ASVS Architecture, Configuration. Test: lint me doosri service ka import fail; galat service ka event reject.
  5. **SR-072, server ke bahar ke calls:** server sirf tay hosts ko bulaye (payment, email, social sign-in, leak hue passwords ki API, push services ki allowlist). Push subscription ka endpoint sirf `https` aur jaane-maane push hosts. Redirect follow nahi. User ka diya URL kabhi fetch nahi (Meet link bhi nahi). Kahan se: ASVS Files and Resources. Test: anjaan ya andar ke host wali subscription save nahi.
  6. **SR-073, emails:** templates auto-escape; header injection (CRLF) mana; kam se kam personal data (poora address sirf invoice me, D-195); OTP aur codes kabhi logs me nahi; seller ke udhaar wale email (D-071) me payment link ki jagah "Seller app me dekhein" (link ho to sirf seller app ke host ka, SR-012). Kahan se: ASVS Validation, Data Protection. Test: naam me `<script>` aur CRLF wala test; templates ke links ka test.
  7. **SR-074, browser push:** push subscription user aur session se bandhi; sign-out aur account badalne pe us browser ki subscription server se hate. Payload D-195 ki seema me, code ya rakam kabhi nahi. Push ki private key (VAPID) secret. 404 ya 410 pe subscription delete. Kahan se: ASVS Data Protection. Test: sign-out ke baad us browser pe push nahi; payload ka test.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Data stores, services aur khabrein" ka hissa):
  1. Database ke credentials leak aur network sabke liye khula: poora database padhna, badalna ya mitana (Information disclosure, Tampering, DoS): SR-068, R-022.
  2. NoSQL operator injection (`$ne`, `$gt`), finance me SQL injection, ya search me regex se CPU (Tampering, Information disclosure, Elevation): SR-069.
  3. Redis me galat cache (daam, serviceability), nakli queue job, ya rate limits ki ginti mitna (Tampering, DoS): SR-070, SR-029.
  4. Ek process me ek module ki kamzori se doosri services ke database credentials aur data tak pahunch (Elevation, Information disclosure): SR-071, R-021.
  5. Nakli ya badla event; ek service doosri ke naam se event bheje (Spoofing, Tampering): SR-071.
  6. SSRF: nakli push subscription se server andar ke URL ko bulaye (Spoofing, Information disclosure): SR-072.
  7. Email me HTML ya header injection, zyada personal data, ya email provider ke dashboard me codes ki copy (Information disclosure, Tampering): SR-073.
  8. Push galat insaan ko (shared browser pe purane account ki subscription), ya lock screen pe personal baat (Information disclosure): SR-074, D-195.
  9. Seller ko payment link wala email: bina domain ke links pe click karna sikhata hai (Spoofing): SR-073, SR-012.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`; haan ka matlab owner ne `Maana`):
  1. **R-021:** Render pe saari services ek process me (D-049, D-056): process ki deewar nahi, to ek module ki kamzori se saari services ke secrets aur data. Kam karne ka tareeka: SR-071, SR-061, kam parsers.
  2. **R-022:** free tier pe databases ka network sabke liye khula ho sakta hai: suraksha sirf password aur TLS pe. Kam karne ka tareeka: SR-068, lambe random passwords, kam haq wale users. Provider ki allowlist ki jaanch ke baad dobara dekhna.
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Atlas ke free cluster, Neon ke free plan aur Render Key Value me network allowlist ya IP access list milti hai ya nahi, aur Render ki free web service ke bahar jaane wale IPs tay hain ya nahi. R-022 isi pe tika hai.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; R-021 aur R-022 `Maana`.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me lint aur dependency rules ka kaam (service ki deewar), par ek process me bhi kamzori ka asar chhota.
  - (b) me har badlav ki ek line.
  - (c) me services aur khabron ka design bina pakke niyam ke.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-021 aur R-022 `Maana`. Record: [DECISIONS.md](DECISIONS.md) D-217.

### Q-159. Security batch 9: export, audit, logs aur DevOps ke niyam, threats aur risks maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (operations).
- **Sawal:** export, audit log, logs, owner ko security alerts, secrets, repo ke pehre, providers ke accounts, supply chain, backups aur incident ke kram ke neeche ke niyam, threats aur risks naye docs me aayein?
- **Kyun zaroori:**
  - Ek insaan aur free tier pe hamla der se pakda ja sakta hai; audit, alerts aur ek likha hua kram (D-198) hi bachav hain.
  - Repo public hai: galti se commit hua secret sabke saamne.
  - Owner ka laptop aur providers ke accounts poore system ki chaabi hain.
  - D-144 me ek export me 50,000 rows tak ho sakti hain; bada export bina khabar ke na ho.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me; numbers misaal, settings me):
  1. **SR-075, export (D-144):** jo cell `=`, `+`, `-`, `@`, tab ya CR se shuru ho, uske aage `'`. Scope wahi jo report ka. Dobara code (D-185). Audit me filters aur rows ki ginti. 50,000 ki seema (D-144), aur misaal 5,000 se zyada rows pe owner ko alert. Download link chhota aur ek baar ka. Kahan se: ASVS Validation, Access Control. Test: `=HYPERLINK(...)` wala naam export me text hi rahe; doosre seller ka row nahi.
  2. **SR-076, audit log:** sirf jodta hai; roz ki hash chain aur uski jaanch ka job (finance ki jaanch hafte me ek, Neon ke ghante dekh ke, R-014); database user ko update aur delete ka haq nahi; mana hue kaam bhi likhe jaayein. Audit me: staff ka har likhne wala kaam, paise ke kaam, settings aur imports, exports, personal data dekhna, security events, seller ke daam ke badlav aur listing versions. Har entry me: account, insaan (owner ke saare accounts ek insaan se jude, D-017, D-047), role, app, session, kaam, cheez, scope, pehle aur baad (chhupa), wajah, nateeja, IP, browser, request id, samay. Samay D-194 ke hisaab se. Kahan se: ASVS Logging. Test: ek entry badli to jaanch fail; mana hua kaam audit me dikhe.
  3. **SR-077, logs:** logs structured. Har request pe: request id, route, status, samay, account id (email nahi), app, client IP (SR-003), browser ka chhota roop, error code. Security events: sign-in safal aur fail (staff ke sab; customer ke sirf fail aur naya device), rok, code maangna aur galat code, refresh ka dobara istemaal, authenticator lagana, hatana aur reset, recovery code, grants aur roles, allowlist, kill switch, webhook signature fail, export, "poori jaankari dekhi", mana hue kaam. Kabhi log nahi: passwords, koi bhi code, tokens, cookies, `Authorization` header, recovery codes, encrypted values, poora email, phone, address, PAN, bank, dastavez, sehat ka data, push ki keys, webhook ki raw body, koi bhi secret. Request aur response body ka log default band; client ko sirf saaf error aur request id, stack trace kabhi nahi. Kahan se: ASVS Logging. Test: log capture test me redaction; 500 pe stack nahi.
  4. **SR-078, owner ko security alerts:** Master app me in-app "security inbox" aur push; sirf gambhir wale email se (OTP ke baad wali line me, din me misaal 5 tak, D-142). Events: refresh ka dobara istemaal, authenticator reset, naya staff grant, allowlist badla, ek IP se bahut fail, webhook signature fail, bada export, kill switch, audit chain toota, milaan ka farak. Server down ke alert UptimeRobot (D-028) ke apne emails se. Roz ka audit verify aur security ka saar usi schedule ke saath jo server jagata hai (D-028). Kahan se: ASVS Logging. Test: har event pe alert bane.
  5. **SR-079, secrets:** secrets sirf providers ke env me (Render, Vercel ka Sensitive env); kabhi repo, client bundle ya logs me nahi. Test aur live keys alag aur naam se pehchaan me aayein. Har secret do values ke saath badal sake (bina downtime). Secrets ki list aur badalne ka kram operations ke doc me (D-197). Kahan se: ASVS Cryptography, Configuration. Test: build me client bundle ki jaanch (secret ke naam); badalne ka abhyaas.
  6. **SR-080, repo ke pehre:** GitHub secret scanning aur push protection chalu; CI me secret scan; `.env` aur backup folder `.gitignore` me aur CI ka pehra (D-013). Kahan se: ASVS Configuration. Test: jaali secret wala commit CI me fail.
  7. **SR-081, providers ke accounts:** GitHub, Vercel, Render, Atlas, Neon, payment gateway, email provider aur social sign-in apps wale account pe MFA (passkey ya authenticator), recovery codes offline; tokens kam haq aur kam umar wale; deploy sirf `release` branch se; branch protection; production dashboards ke liye alag browser profile. Kahan se: ASVS Configuration. Test: operations ki checklist; har account pe MFA.
  8. **SR-082, supply chain:** lockfile aur `npm ci`; GitHub Actions SHA pe pinned; fork PRs ko secrets nahi, aur `pull_request_target` me PR ka code checkout nahi; dependency alerts; har naye dependency pe review. Kahan se: ASVS Configuration, Malicious Code. Test: workflow lint: har action SHA pe.
  9. **SR-083, backups (D-013, D-196):** encrypted; key repo me nahi; restore pehle local ya alag test database me, jaanch ke baad hi production me; har restore audit me; kabhi CI artifact ya cloud sync folder me nahi; encrypted fields backup me bhi encrypted (keys backup me nahi). Account delete (D-151) ke baad purane backup se restore ho to delete hua data wapas aata hai: isliye delete hue accounts ke ids ki chhoti list (bina personal data), aur restore ke baad wo deletes dobara. Kahan se: ASVS Data Protection. Test: bina key backup na khule; restore test; restore ke baad delete hua account wapas na aaye.
  10. **SR-084, incident ka kram:** operations ke doc me likha kram (D-198): (1) tayyari: secrets ki list, kill switches (SR-009), recovery codes offline, restore ka abhyaas; (2) pehchaan aur gambhirta (1: paisa, dastavez, staff ya provider account; 2: customer account ya personal data; 3: bug, data nahi gaya); (3) rokna: sahi kill switch, "sab sessions band", tokens band, shak wale secrets kram se (gambhirta 1 pe misaal 1 ghante me, 2 pe 1 din); (4) jaanch: audit, Render logs ki copy turant, git ka itihaas; (5) theek aur wapsi: fix normal flow se, restore pehle local pe; (6) khabar D-198 ke hisaab se; (7) seekh: [LESSONS.md](LESSONS.md) me ek line, naya test, threat model me badlav. Saal me ek baar abhyaas. Kahan se: ASVS Architecture. Test: abhyaas ka record.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "Export, audit, logs aur DevOps" ka hissa):
  1. Export se leak: CSV me formula wale cell, scope ke bahar ka data, ya bada export (Information disclosure, Tampering): SR-075.
  2. Staff apne kaam se mukar jaaye; audit log badla ya mitaya jaaye (Repudiation, Tampering): SR-076.
  3. Logs me passwords, codes, tokens, address ya PAN (Information disclosure): SR-077.
  4. Free tier pe alerts kam aur logs thode din: hamla der se pakda jaaye (Repudiation): SR-078, SR-084; R-024.
  5. Public repo me galti se secret commit, ya payment gateway ki key logs ya app ke bundle me (Information disclosure, Spoofing): SR-079, SR-080.
  6. Provider account (GitHub, Vercel, Render, Atlas, Neon, payment, email) pe kabza: code, infra aur data sab (Spoofing, Elevation): SR-081; R-023.
  7. Supply chain: npm package ya GitHub Action me malware; fork PR se CI ke secrets (Tampering, Elevation): SR-082; R-026.
  8. Owner ka laptop chori ya malware: backups, env, browser ke sessions (Information disclosure, Elevation): SR-081, SR-083, D-196; R-023.
  9. Backup files ka leak, ya restore me purana ya badla data, ya delete hua account wapas (Information disclosure, Tampering): SR-083.
  10. Account par kabze ke baad account delete karna; ya delete ke baad bhi data services aur backups me (DoS, Information disclosure): SR-066, SR-016, SR-083.
- **Risks** ([RISKS.md](RISKS.md) me, tag `Security`):
  1. **R-023:** owner ka laptop aur providers ke accounts ek jagah: ek kabza = code, deploy, data aur backups sab. Kam karne ka tareeka: SR-081, SR-083, D-196, production ke liye alag browser profile. `Maana`.
  2. **R-024:** free tier pe logs aur alerts seemit: hamla der se pakda jaaye. Kam karne ka tareeka: SR-076, SR-078, UptimeRobot ke alerts. `Maana`.
  3. **R-025:** security ki jaanch sirf owner aur Claude; bahar ki koi jaanch (pentest) nahi. Kam karne ka tareeka: QA ke security tests, doosra security run, asli business se pehle bahar ki jaanch. `Maana`.
  4. **R-026:** supply chain (npm packages, GitHub Actions). Kam karne ka tareeka: SR-082. `Khula` (bachav ke saath).
  5. **R-027:** public repo: design aur code sabke saamne, aur galti se secret commit ka jokhim. Kam karne ka tareeka: SR-079, SR-080. `Khula` (bachav ke saath).
- **Tathya ki jaanch (Claude, owner ka faisla nahi; §2):** Render ki free web service ke logs kitne din rehte hain, aur public repo pe GitHub secret scanning aur push protection muft chalu hote hain ya nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein; numbers misaal rahein (settings me); R-023, R-024, R-025 `Maana`, R-026 aur R-027 `Khula`.
  - **(b)** Maanein, par owner jo niyam ya number badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me operations ka kaam (secrets ki list, abhyaas, MFA ki checklist) owner pe, par incident me kram pehle se tay.
  - (b) me har badlav ki ek line.
  - (c) me operations aur incident ka design bina pakke niyam ke.
- **Kanooni detail jaanchi nahi** (R-004): logs rakhne aur incident ki report ke niyam (jaise CERT-In), aur privacy page me backups ka zikr.
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani; R-023, R-024, R-025 `Maana`, R-026 aur R-027 `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-218.

### Q-160. Security batch 10: R2 ke hisse, aur seller ko invoice ki copy ka niyam maanein?

- **Status:** `Tay`. Topic: B14 (security), B10 (loyalty), B11 (consultation, support).
- **Sawal:** R2 me aane wale points, coupons, gift cards, consultation ka Meet link aur bina sign-in forms ke neeche ke niyam aur threats, aur pehle chhoota ek R1 ka niyam (seller ko invoice ki copy), naye docs me aayein?
- **Kyun zaroori:**
  - Points (D-174), coupons (D-102), referral (D-176) aur gift cards (D-179) paise jaise hain: ek saath do baar kharch ya kai accounts se khel seedha nuksaan hai.
  - Meet link (D-025) ka sirf shuruaat milana dhokha kha sakta hai (`meet.google.com.example.com`).
  - Bina sign-in forms me koi bhi kisi aur ka email likh sakta hai (D-206).
  - Seller ko order number, shehar aur pincode milte hain (D-143), par invoice ki copy me customer ka naam aur address ho sakta hai; ye report ke dhyaan ke points me tha aur kisi batch me nahi aaya.
- **Prastaavit niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) me):
  1. **SR-085, points, coupons aur gift cards (R2 se):** hisaab finance ke ledger me; har redemption idempotent aur unique constraint se; ek saath kharch ke tests; per-customer seemaayein D-203 ke jod pe. Kahan se: ASVS Business Logic. Test: 10 redemption ek saath: ek hi safal.
  2. **SR-086, Meet link aur Advisor ke links (R2 se):** Meet link ka URL parse karke `https`, host theek `meet.google.com`, aur path ka pattern. Beauty Advisor ke jawab me links sirf apne customer app ke products pe; baaki sirf text. Kahan se: ASVS Validation. Test: `https://meet.google.com.evil.example` aur `https://meet.google.com@evil.example` mana.
  3. **SR-087, bina sign-in forms (D-206, R2 se):** pehle email ka pakka hona code se (OTP line ki seema me), tabhi allowlist ki jaanch aur ticket. Honeypot field; IP aur email pe rate limit. Kahan se: ASVS Business Logic. Test: bina code ticket nahi; seema ke upar mana.
  4. **SR-088, seller ko invoice ki copy (R1):** seller ko invoice ki copy sirf ek-ek karke download, har download audit me; bulk export me kabhi nahi (SR-075). Kahan se: ASVS Data Protection, Access Control. Test: export me invoice ki copy nahi; har download audit me.
- **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) me "R2 ke hisse" ka hissa, aur invoice wala "Export, audit, logs aur DevOps" me):
  1. Coupon, points ya gift card ek saath do baar kharch; returns se points ka khel; kai accounts se referral (Tampering, Spoofing): SR-085, D-203.
  2. Meet link field me nakli link, ya Advisor thread me bahar ke links (Spoofing): SR-086.
  3. Bina sign-in forms pe spam, emails ki baadh, ya kisi aur ke email ka bahana (DoS, Spoofing): SR-087, SR-020.
  4. Beauty Pro ke nakli dastavez, ya Pro daam ka leak (Spoofing, Information disclosure): SR-062, SR-042.
  5. Seller ke paas invoice ki copiyon se customers ke naam aur address ki list (Information disclosure): SR-088.
- **Risks:** is batch me naya risk nahi.
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo niyam badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me seller ko invoice ek-ek karke hi milti hai (bulk nahi).
  - (b) me har badlav ki ek line.
  - (c) me R2 ke design ke liye niyam baad me.
- **Kanooni detail jaanchi nahi** (R-004): invoice ki copy pe customer ka naam aur address zaroori hai ya nahi; points aur gift cards ke prepaid niyam (D-179).
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-219.

### Q-161. Kanooni jaanch (pehla run) ke nateeje naye docs me kis tareeke se aayein?

- **Status:** `Tay`. Topic: B13 (compliance), B16 (docs).
- **Sawal:** kanooni jaanch ke pehle run (tax, Legal Metrology, cosmetics kanoon, e-commerce aur consumer kanoon) me 87 points hain (52 jaancha, 34 aadha jaancha, 1 jaancha nahi), aur tay faislon pe 29 asar ke points (jaise D-080, D-088, D-117, D-120, D-151). Ye [COMPLIANCE.md](COMPLIANCE.md), [DECISIONS.md](DECISIONS.md) aur [RISKS.md](RISKS.md) me, owner ki haan se, kis tareeke se aayein?
- **Kyun zaroori:**
  - Naye docs me cheez sirf owner ki haan se aati hai; par 87 points ek-ek karke poochhna bahut lamba hai.
  - 29 asar ke points business ke faisle hain (jaise return ki muddat, kit ka GST, account delete pe invoice ka data): inhe owner ka saaf jawab chahiye, sirf "haan" nahi.
  - [COMPLIANCE.md](COMPLIANCE.md) abhi khaali hai; architecture, database, UX aur QA ke kaam ko kanooni zarooraton ka ek tay aadhaar chahiye.
  - DECISIONS me lagbhag 86 jagah "Kanooni detail jaanchi nahi" likha hai. Lawyer se ab bhi kuch nahi jaancha, par kai points public source se mila liye gaye hain; padhne wale ko pata hona chahiye ki ye milaan kahan hai.
- **Vikalp:**
  - **(a) Pehle asar ke sawal, phir area ke hisaab se batches:**
    1. **Asar ke sawal:** 29 asar ke points owner ke sawal ban ke aate hain, vikalp aur salah ke saath, discovery ke niyam se: jo kisi khule sawal pe tike nahi wo ek saath, jude hue ek group me. Jawab se naya D-xxx, aur jahan faisla badle wahan "badla" line (D-018).
    2. **Area batches:** baaki nateeje [COMPLIANCE.md](COMPLIANCE.md) me 4 batches me (tax; Legal Metrology; cosmetics kanoon; e-commerce aur consumer kanoon). Har batch ek sawal (maano, badlav ke saath maano, ya roko), D-209 jaisa. Har row naya number (CL-001 se) aur naye vakya me, COMPLIANCE ke format me (kanoon ya niyam, kis pe laagu, kis module me, system me kya chahiye, dummy kya hai, jaancha ya nahi), saath me source aur uski tareekh.
    3. **Aadha jaancha:** ye points isi status ke saath COMPLIANCE me aate hain. Jab primary source khule, Claude khud jaanch ke status badle (§2 jaisa).
    4. **DECISIONS ki "jaanchi nahi" lines:** jaisi hain waisi rahein, kyunki lawyer se ab bhi nahi jaancha (R-004). DECISIONS §0 me ek line: public source se milaan [COMPLIANCE.md](COMPLIANCE.md) me hai.
    5. Report ke IDs naye docs me nahi jaate; har cheez naye number aur naye vakya me (D-209 jaisa).
  - **(b) Ek badi batch:** saare nateeje aur 29 asar ke points ek saath; owner ek baar me haan ya badlav.
  - **(c) Pehle se haan:** Claude nateeje seedha COMPLIANCE me likhe aur owner baad me padhe; sirf 29 asar ke points sawal bane.
- **Salah:** **(a)**. Pehle faisle saaf hote hain, phir COMPLIANCE unhi faislon ke hisaab se likha jaata hai, to dobara badalna nahi padta. Har batch itni chhoti ki padhi ja sake.
- **Trade-off:**
  - (a) me 29 asar ke points (kai chhote, ek sawal me jud sakte) aur 4 batches: kuch baar ka kaam.
  - (b) me bahut lambi list: padhna mushkil, galti chhoot sakti hai, aur faisle aur COMPLIANCE ek saath ulajh sakte hain.
  - (c) tez, par owner ki haan pehle na hone se galat ya adhoori kanooni baat docs me aa sakti hai.
- **Kanooni detail:** is report ka koi nateeja lawyer se jaancha nahi (R-004). "Jaancha" ka matlab sirf public source se milaan hai, aur kai sarkari sites nahi khuli, isliye kuch points "aadha jaancha" hain.
- **Owner ka jawab (2026-11-19):** **(a)**, pehle asar ke sawal, phir area ke hisaab se batches (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-220.

### Q-162. Return ki muddatein (D-080) kanoon ke saath kaise tikein?

- **Status:** `Tay`. Topic: B7 (returns), B13 (compliance).
- **Sawal:** D-080 me dikhne wali galti pe 48 ghante aur kharab ya nakli maal pe 7 din (misaal) hain. Kanooni jaanch ke hisaab se ye muddatein waise hi nahi tik-tin. Kya badle?
- **Kyun zaroori:**
  - E-commerce rules ka rule 6(3): kharab, nakli ya "jaisa dikhaya waisa nahi" maal pe seller return ya refund se mana nahi kar sakta, aur wahan koi muddat nahi likhi.
  - Consumer Protection Act ki s.2(47)(viii): aise maal ko wapas lene se mana karna unfair trade practice hai, agar bill pe likhi muddat ke andar ho; bill pe muddat na ho to 30 din.
  - Matlab 48 ghante aur 7 din invoice pe likhe na hon to 30 din maane ja sakte hain; aur 7 din kharab maal ke liye kam pad sakte hain. Man badla (band maal) pe kanoon koi din nahi deta, to D-080 niyam 3 theek hai.
- **Vikalp:**
  - **(a) Muddat likhi ho, aur kharab maal pe lambi:**
    1. Har muddat invoice, order page aur return policy page pe likhi ho.
    2. Kharab maal, nakli ka shak, aur galat item, shade ya size: 30 din (misaal) tak return.
    3. Dikhne wali galti (toota, leak, pighla, item kam): 48 ghante saboot ka niyam rahe. 48 ghante ke andar daawa photo se seedha; baad ka daawa bhi liya jaata hai, par staff ki zyada jaanch ke saath, seedha mana nahi.
    4. Man badla: 7 din (misaal), jaisa hai.
    5. Muddat ke baad bhi support ka raasta: jaanch, seedha mana nahi; batch ki dikkat pe recall (D-129) jaisa hai.
  - **(b) Sirf likh do:** numbers waise hi (48 ghante, 7 din), bas invoice, order page aur policy page pe likhe.
  - **(c) Sab wajahon pe 30 din.**
- **Salah:** **(a)**. Kanoon ka 30 din ka default aur rule 6(3) dono sambhal jaate hain, aur 48 ghante ka niyam saboot ke liye bana rehta hai.
- **Trade-off:**
  - (a) me kharab maal ke der wale daawe aate hain: staff ki jaanch badhti hai, aur seller ke payout (D-081) pe asar dekhna hoga.
  - (b) saral, par rule 6(3) ka "koi muddat nahi" aur kam din ka jokhim bacha rehta hai.
  - (c) man badle pe bhi 30 din: hygiene aur seller ka paisa dono pe bojh.
- **Kanooni detail:** rule 6(3) aur s.2(47)(viii) public source se mila ke dekhe gaye (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, muddatein likhi hon aur kharab maal pe 30 din (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-221.

### Q-163. Der se delivery pe return ya refund ka haq?

- **Status:** `Tay`. Topic: B1 (delivery), B7 (returns), B13 (compliance).
- **Sawal:** D-117 niyam 4 me vaada toote to sirf "der" ki haalat aur khabar hai, R1 me koi muavza nahi. Kanoon der se aaye maal pe customer ko kya haq deta hai, aur hum kya karein?
- **Kyun zaroori:**
  - E-commerce rules ka rule 6(3): tay delivery schedule se der ho to seller return ya refund se mana nahi kar sakta (force majeure chhod ke).
  - Return ki wajahon (D-079) me "der se aaya" nahi hai, to customer ke paas ye raasta hi nahi.
  - Delivery hamari apni hai (D-014), to der ki zimmedari seller ki nahi, hamari hai.
- **Vikalp:**
  - **(a) "Der se pahuncha" ek wajah:**
    1. "Der" = dikhaye vaade ki tareekh (D-117) ke baad.
    2. Door pe lene se mana: poora refund, delivery fee samet.
    3. Lene ke baad: 7 din (misaal) me return, customer pe return ka koi kharcha nahi; band maal ki shart (D-079) wahi.
    4. Force majeure (baadh, band, hadtaal): staff flag lagaye, wajah ke saath; customer ko wajah dikhe, tab ye haq nahi.
    5. Der ka kharcha (wapsi, fee) platform ka, seller ka nahi.
  - **(b) Sirf door pe mana:** der se aaya parcel lene se mana kare to poora refund; lene ke baad normal niyam.
  - **(c) Jaisa hai:** R1 me sirf "der" ki khabar.
- **Salah:** **(a)**. Kanoon ka haq poora milta hai, aur kharcha usi pe jiski der hai.
- **Trade-off:**
  - (a) me der ka kharcha platform pe, aur force majeure ke flag ki jaanch.
  - (b) aadha haq: lene ke baad customer ke paas raasta nahi.
  - (c) me rule 6(3) se takrav ka jokhim.
- **Kanooni detail:** rule 6(3) public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, "der se pahuncha" return ki ek wajah (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-222.

### Q-164. "Pichhle 30 din ka sabse kam daam" R1 se dikhe ya nahi?

- **Status:** `Tay`. Topic: B4 (pricing), B13 (compliance).
- **Sawal:** D-120 me "pichhle 30 din ka sabse kam daam" sirf "sale" ya "deal" label ke saath, R2 se. R1 me har jagah kata MRP aur "% off" dikhta hai. Kya ye daam R1 se hi har discount ke saath dikhe?
- **Kyun zaroori:**
  - Kanooni jaanch ke hisaab se E-commerce rules ke 2026 ke badlav (1 Jan 2027 se) me har "price reduction" ke daawe ke saath pehle ka daam (pichhle 30 din ka sabse kam) zaroori hai.
  - Ye sirf secondary source se mila ("aadha jaancha"); primary gazette nahi khula.
  - Daam ka itihaas D-061 me pehle se hai, to data ki kami nahi.
- **Vikalp:**
  - **(a) R1 se, har discount ke saath:** jahan bhi kata MRP ya "% off" dikhe, saath me "pichhle 30 din ka sabse kam daam". Itihaas 30 din se kam ho (naya product) to jitne din ka hai, utne din ka likh ke.
  - **(b) Jaisa hai, 2027 se pehle badlav:** R1 me sirf kata MRP aur "% off"; 1 Jan 2027 se pehle (R2 ke saath) naya niyam.
  - **(c) "% off" hatao:** sirf MRP aur daam, koi discount ka daawa nahi.
- **Salah:** **(a)**. Data hai, ek hi display ka niyam banta hai, aur 2027 ke niyam se pehle badlav ka kaam nahi bachta.
- **Trade-off:**
  - (a) me product page aur cart pe ek line aur, aur itihaas ki query har jagah.
  - (b) me baad me design aur tests dobara.
  - (c) saaf, par customer ko bachat nahi dikhti.
- **Kanooni detail:** sirf secondary source se ("aadha jaancha"); kata MRP bhi "price reduction" ka daawa hai ya nahi, ye pakka nahi; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, R1 se har discount ke saath pichhle 30 din ka sabse kam daam. Record: [DECISIONS.md](DECISIONS.md) D-223.

### Q-165. Test ya asar wale claims ka saboot R1 me?

- **Status:** `Tay`. Topic: B3 (catalog), B13 (compliance).
- **Sawal:** D-100 niyam 5 me R1 me saboot sirf SPF ke liye; baaki claims seller ki ghoshna. "Dermatologically tested", "clinically proven", "non-comedogenic" jaise claims ka kya ho?
- **Kyun zaroori:**
  - Consumer Protection Act ki s.2(47)(i)(g): kisi product ke asar ya performance ka daawa theek test pe tika na ho to unfair trade practice; saboot ka bojh daawa karne wale pe.
  - Ye claims filters me bhi aate hain (D-138), to platform pe galat daawa customer ke faisle pe seedha asar karta hai.
- **Vikalp:**
  - **(a) Claims do hisson me:**
    1. Ghoshna wale (jaise vegan, fragrance-free): seller ki ghoshna, jaisa hai.
    2. Test wale (dermatologically tested, clinically proven, non-comedogenic, hypoallergenic, SPF aur PA): R1 se hi saboot (test report, dummy, D-026) ke saath; bina saboot wo claim chuna nahi ja sakta.
    3. Saboot ki jaanch SPF wale raaste se hi (D-100 niyam 3).
  - **(b) Test wale R1 me bahar:** R1 me ye claims list me hi nahi; R2 me saboot ke saath.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. SPF ka saboot wala raasta R1 me ban hi raha hai, to baaki test wale claims bhi usi se; galat daawa filters tak nahi pahunchta.
- **Trade-off:**
  - (a) me staff ki jaanch thodi zyada.
  - (b) me R1 me kam claims aur kam filters.
  - (c) me unfair trade practice ka jokhim.
- **Kanooni detail:** s.2(47)(i)(g) public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, claims do hisson me, test wale R1 se saboot ke saath (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-224.

### Q-166. Account delete pe jaari invoice ka kya?

- **Status:** `Tay`. Topic: B14 (privacy), B6 (finance), B13 (compliance). Group G19.
- **Sawal:** D-151 niyam 1 me account delete pe invoice aur ledger me naam, pata aur email hata ke ek code. Tax ke kanoon ke saath ye kaise ho?
- **Kyun zaroori:**
  - CGST Act ki s.36: tax records 72 mahine (kanooni jaanch me 2021 ki sarkari copy, baad ke badlav secondary se). Jaari invoice badalna tax record badalna hai.
  - CGST rules ka rule 46: ₹50,000 ya zyada ke B2C invoice, aur B2B invoice, pe naam aur pata zaroori.
- **Vikalp:**
  - **(a) Alag tax archive:**
    1. Jaari invoice aur credit note ki asli copy (naam aur pata samet) ek alag, kam pahunch wale tax archive me, 72 mahine (misaal) tak, aur koi jhagda chale to uske khatam hone tak, bina badlav.
    2. Archive sirf finance ka role dekhe, har dekhna audit me.
    3. App ki baaki jagah (profile, orders ki list, reports, ledger ke views) se pehchaan hat jaaye, jaisa D-151 me.
    4. Samay poora hone pe archive se bhi delete.
  - **(b) Invoice me naam hi kam:** ₹50,000 se kam ke B2C invoice pe naam aur pata na chhaapo (state chhaapo), to delete pe un invoices me kuch badalna nahi; baaki ke liye archive.
  - **(c) Jaisa hai:** invoice me bhi naam aur pata hata do.
- **Salah:** **(a)**. Tax record nahi badalta, aur personal data sirf ek band jagah pe, tay samay tak.
- **Trade-off:**
  - (a) me ek alag archive aur uski pahunch ka niyam.
  - (b) me do tarah ke invoice ka niyam; archive phir bhi chahiye.
  - (c) me tax record badalne ka jokhim.
- **Kanooni detail:** s.36 aur rule 46 public source se mila ke dekhe gaye (kuch hissa secondary se, kanooni jaanch, pehla run); personal data (DPDP) wala hissa doosre run me; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, alag tax archive (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-225.

### Q-167. ₹50,000 ya zyada ke invoice pe customer ka naam aur pata

- **Status:** `Tay`. Topic: B6 (finance), B14 (privacy), B13 (compliance). Group G19.
- **Sawal:** D-143 me seller ko customer ka naam aur pata nahi milta; invoice ki copy me sirf wo jo invoice pe zaroori ho. Kis invoice pe customer ka naam aur pata chhape?
- **Kyun zaroori:**
  - CGST rules ka rule 46: ₹50,000 ya zyada ke B2C invoice pe naam, pata aur state zaroori; kam ke invoice pe state.
  - Invoice seller ke GSTIN se hai (D-030), to us invoice ki copy (SR-088) me naam aur pata seller tak bhi jaayega.
- **Vikalp:**
  - **(a) Rakam ke hisaab se:**
    1. ₹50,000 se kam: invoice pe customer ka state (aur shehar ya pincode); naam aur pata sirf customer chahe to.
    2. ₹50,000 ya zyada: naam aur pata invoice pe, aur seller ki copy me bhi.
    3. Seller ki copy ka niyam (SR-088: ek-ek karke download, audit) waisa hi.
  - **(b) Har invoice pe naam aur pata:** saral, par har customer ka pata seller tak.
  - **(c) R1 me ₹50,000 se kam ki seema:** ek seller ke invoice ki rakam ₹50,000 se upar na jaaye (cart ki seema).
- **Salah:** **(a)**. Kanoon jitna maangta hai utna hi, aur D-143 ka "kam personal data" bana rehta hai.
- **Trade-off:**
  - (a) me invoice ka do roop.
  - (b) me personal data zyada haathon me.
  - (c) me bade orders (jaise Beauty Pro ke) ruk sakte hain.
- **Kanooni detail:** rule 46 public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, rakam ke hisaab se (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-226.

### Q-168. Seller ke tax wale dastavez kitne din rahein?

- **Status:** `Tay`. Topic: B14 (privacy), B6 (finance), B13 (compliance). Group G19.
- **Sawal:** D-193 niyam 2 me manzoor seller ke KYC dastavez account band hone ke 3 saal baad delete. Jo dastavez tax records ka hissa hain, unka kya?
- **Kyun zaroori:**
  - CGST Act ki s.36: tax records 72 mahine. GSTIN ka certificate aur TCS ke statements tax records ka hissa ho sakte hain.
- **Vikalp:**
  - **(a) Dastavez ke kism se:** tax records ka hissa (GSTIN certificate, TCS ke statements, invoices) 72 mahine (misaal); baaki KYC (PAN ki copy, brand authorisation) 3 saal, jaisa hai. Pakka number personal data ki kanooni jaanch (doosra run) ke baad.
  - **(b) Sab 72 mahine.**
  - **(c) Jaisa hai:** sab 3 saal.
- **Salah:** **(a)**. Tax ke dastavez kanoon jitna rehte hain, baaki jaldi hatte hain.
- **Trade-off:**
  - (a) me dastavez ke kism ki ek setting.
  - (b) me zyada personal data zyada der tak.
  - (c) me tax records jaldi hatne ka jokhim.
- **Kanooni detail:** s.36 public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, dastavez ke kism se: tax wale 72 mahine, baaki KYC 3 saal. Record: [DECISIONS.md](DECISIONS.md) D-227.

### Q-169. Kit aur combo pe GST kis rate se?

- **Status:** `Tay`. Topic: B4 (bundles), B6 (finance), B13 (compliance).
- **Sawal:** D-088 niyam 3 me combo ka daam cheezon me baant ke har cheez apne rate pe. Kanooni jaanch ke hisaab se ek daam wala combo "mixed supply" ho sakta hai. Kit aur combo pe GST kaise lage?
- **Kyun zaroori:**
  - CGST Act ki s.8(b): alag cheezein ek daam pe (mixed supply) bikein to poore pe sabse zyada rate wali cheez ka rate.
  - Misaal: 5% wala soap aur 18% wala face wash ek daam pe = poora 18%. Brand ka kit (R1, ek barcode, ek MRP) bhi isi me aa sakta hai.
  - Galat rate se invoice aur TCS ka hisaab dono galat.
- **Vikalp:**
  - **(a) Kit pe sabse zyada rate, combo CA ki salah ke baad:**
    1. Brand ka kit (R1): listing pe kit ki cheezon ke rates me se sabse zyada wala default; seller badle to wajah ke saath, staff jaanche.
    2. Combo (R2): shuru hone se pehle CA se tay ho ki ek daam = mixed supply (sabse zyada rate), ya har cheez ka daam alag dikha ke alag supplies. Tab tak D-088 niyam 3 ka "daam baantna" sirf design me, laagu nahi.
  - **(b) Combo me har cheez ka daam alag:** combo = alag supplies, har line apne rate pe, customer ko har cheez ka daam dikhe; ek daam wala combo nahi.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. R1 ka kit kanoon ke saath seedha chalta hai, aur combo R2 me hai, to CA ki salah ke liye samay hai.
- **Trade-off:**
  - (a) me kit ka poora tax sabse zyada rate pe.
  - (b) me "ek daam" wale combo ka aakarshan nahi.
  - (c) me galat tax ka jokhim.
- **Kanooni detail:** s.8(b) public source se mila ke dekha gaya (kanooni jaanch, pehla run); CA aur lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, kit pe sabse zyada rate, combo ka tax CA ki salah ke baad. Record: [DECISIONS.md](DECISIONS.md) D-228.

### Q-170. Kharid ki shart wala free gift

- **Status:** `Tay`. Topic: B4 (promotions), B6 (finance), B13 (compliance).
- **Sawal:** D-121 (R2) me brand ke samples aur gifts invoice pe ₹0 ki line ke saath. Kanooni jaanch ke hisaab se kharid ki shart wala gift asal me "free" nahi maana ja sakta. Kya badle?
- **Kyun zaroori:**
  - CBIC ke ek circular (92/11/2019) ke hisaab se bina shart ka free sample supply nahi, par "X kharido to Y free" me Y ki keemat X ke daam me hi shaamil maani ja sakti hai. Tab invoice pe ₹0 ki taxable line sahi nahi.
  - Ye sirf secondary source se mila ("aadha jaancha").
- **Vikalp:**
  - **(a) Do tarah:**
    1. Bina shart ka sample (brand ki marzi se, kisi kharid ki shart ke bina): tax invoice ke bahar, packing slip pe "free sample, not for sale".
    2. Shart wala gift ("X kharido to Y free"): R2 me tab tak nahi jab tak CA se invoice ka tareeka tay na ho.
  - **(b) Shart wala gift bhi:** invoice me gift ki line, kharid ke daam ka hissa gift ko baant ke (bundle jaisa), bina CA ki salah ke.
  - **(c) Jaisa hai:** ₹0 ki line.
- **Salah:** **(a)**. Sample ka aam tareeka chalta rehta hai, aur shart wala gift tabhi jab tax ka tareeka pakka ho.
- **Trade-off:**
  - (a) me "gift with purchase" offer R2 me bhi der se.
  - (b) bina CA ke galat ho sakta hai.
  - (c) me galat invoice ka jokhim.
- **Kanooni detail:** circular sirf secondary source se ("aadha jaancha"); CA aur lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, bina shart ka sample invoice ke bahar; shart wala gift CA ki salah tak nahi. Record: [DECISIONS.md](DECISIONS.md) D-229.

### Q-171. Platform ka barcode label pack pe kahan lage?

- **Status:** `Tay`. Topic: B1 (warehouse), B3 (catalog), B13 (compliance).
- **Sawal:** D-097 niyam 1 me barcode na ho to receiving pe har unit pe platform ka barcode label. Label pack pe kahan lage, ye tay nahi.
- **Kyun zaroori:**
  - Cosmetics Rules ka rule 35: manufacturer ke label ki likhawat ko badalna, mitana ya dhakna mana.
  - Label batch, expiry, MRP ya ingredients pe lage to kanoon toot-ta hai, aur customer wahi jaankari padh nahi pata.
- **Vikalp:**
  - **(a) Sirf khaali jagah ya bahar ka polybag:**
    1. Label pack ki khaali jagah pe, ya pack ke bahar ke polybag ya sleeve pe; khaali jagah na ho to polybag.
    2. Kabhi batch, expiry, MRP, ingredients ya kisi bhi likhawat ke upar nahi.
    3. Receiving pe label lagne ke baad photo; Warehouse app me jaanch ka kadam.
  - **(b) Hamesha polybag:** har bina barcode unit ek polybag me, label polybag pe.
  - **(c) Sirf bin pe label:** unit pe kuch nahi; scan bin se (D-097 niyam 2: ek bin, ek batch).
- **Salah:** **(a)**. Pack ki koi likhawat nahi dhakti, aur photo se saboot rehta hai.
- **Trade-off:**
  - (a) me receiving pe ek photo ka kadam.
  - (b) me har unit pe polybag ka kharcha aur plastic (EPR, D-045).
  - (c) me pack aur dispatch pe unit ka scan nahi, galat item jaane ka jokhim.
- **Kanooni detail:** rule 35 public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, label sirf khaali jagah ya bahar ke polybag pe. Record: [DECISIONS.md](DECISIONS.md) D-230.

### Q-172. Tax ghatne pe naya (kam) MRP

- **Status:** `Tay`. Topic: B4 (pricing), B3 (batch), B13 (compliance).
- **Sawal:** D-061 niyam 1 aur D-064 sirf pack pe chhapa MRP maante hain. Tax ghatne pe manufacturer purane packs ka naya, kam MRP bata de, to site kaunsa MRP maane?
- **Kyun zaroori:**
  - Legal Metrology (Packaged Commodities) Rules ka rule 18(3): tax ghatne pe manufacturer ka bataya naya kam MRP purane packs pe bhi laagu.
  - Tab daam ki seema (D-061 niyam 1), "% off" (D-120) aur pichhle 30 din ka daam (D-223) sab purane MRP ke galat aadhaar pe chalenge.
- **Vikalp:**
  - **(a) Batch pe "revised MRP":**
    1. Batch pe optional "revised MRP (tax badlav)", saboot ke saath (manufacturer ki suchna ya naya sticker); staff jaanche.
    2. Revised MRP ho to site ka MRP, daam ki seema, "% off" aur invoice usi se.
    3. Seller ka daam revised MRP se upar ho to us batch ki bikri ruke aur seller ko alert (D-064 niyam 2 jaisa).
  - **(b) Naya batch:** revised MRP wale packs naya batch maan ke dobara receiving (sticker ke saath).
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. Ek field se kanoon ka niyam sambhal jaata hai, aur daam ke baaki niyam usi pe chalte hain.
- **Trade-off:**
  - (a) me ek field aur staff ki jaanch.
  - (b) me dobara receiving, aur stock ki ginti me ulajh.
  - (c) me naye MRP se zyada daam ka jokhim.
- **Kanooni detail:** rule 18(3) public source se mila ke dekha gaya (kanooni jaanch, pehla run); 2025 ki MRP sticker wali chhoot sirf secondary source se; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, batch pe revised MRP (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-231.

### Q-173. "Use before" aur "expiry" ka din

- **Status:** `Tay`. Topic: B3 (batch aur expiry), B13 (compliance).
- **Sawal:** D-062, D-067 aur D-082 expiry ko ek hi tarah ki tareekh (mahina aur saal) maante hain. Kanooni jaanch ke hisaab se "use before" aur "expiry" ka din alag ho sakta hai. Kya karein?
- **Kyun zaroori:**
  - Cosmetics Rules ke 2025 ke badlav ke hisaab se "use before" = us mahine ka pehla din, aur "expiry" = us mahine ka aakhri din. Ye sirf secondary source se mila ("aadha jaancha").
  - Bikri band (D-062 niyam 2) aur receiving ki seema (D-082) ek mahine tak galat gin sakte hain.
- **Vikalp:**
  - **(a) Batch pe expiry ka roop:**
    1. Receiving pe batch pe roop: "Use before" ya "Expiry", pack jaisa.
    2. System ka "aakhri din" usi se: use before = mahine ka pehla din; expiry = mahine ka aakhri din.
    3. Seemaayein (D-062, D-082) isi aakhri din se ginein.
    4. Customer ko pack jaisa text dikhe (D-067).
  - **(b) Hamesha mahine ka pehla din:** roop ka field nahi; sab pe sabse surakshit din.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. Har pack ka sahi din, aur customer ko wahi jo pack pe hai.
- **Trade-off:**
  - (a) me receiving pe ek field.
  - (b) me "expiry" wale packs ki bikri ek mahina pehle band: brand ka thoda nuksaan.
  - (c) me ek mahine ka galat hisaab ho sakta hai.
- **Kanooni detail:** 2025 ka badlav sirf secondary source se ("aadha jaancha"); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, batch pe expiry ka roop (4 niyam). Record: [DECISIONS.md](DECISIONS.md) D-232.

### Q-174. Platform ke naam jaisa apna brand aur customer ka data

- **Status:** `Tay`. Topic: B9 (sujhaav), B14 (privacy), B13 (compliance).
- **Sawal:** D-166 me sujhaav consent ke saath, aur kisi seller ko boost nahi. Apna brand (D-031) platform ke naam jaisa ho, to customer ke data se uske sujhaav aur promotion ka kya?
- **Kyun zaroori:**
  - E-commerce rules ke 2026 ke badlav (1 Jan 2027 se) ka rule 5(6): platform ke naam se milte naam wale seller ko bechne ya promote karne me customer ka data sirf saaf (express) consent se.
  - Ye sirf secondary source se mila ("aadha jaancha").
- **Vikalp:**
  - **(a) Brand ka naam platform se alag:** apne brand aur uski dummy company ka naam "Beautinique" se na mile; tab ye niyam laagu hi nahi, aur D-166 jaisa hai waisa.
  - **(b) Alag opt-in:** naam platform jaisa rahe, par sujhaav aur promotion me apna brand sirf un customers ko jo iske liye alag consent dein.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. Apna brand pehle se alag company hai (D-031); alag naam se ek alag consent ka kaam nahi bachta.
- **Trade-off:**
  - (a) me platform ke naam ka branding fayda apne brand ko nahi.
  - (b) me ek aur consent aur uska hisaab har sujhaav me.
  - (c) me 2027 se takrav ka jokhim.
- **Kanooni detail:** sirf secondary source se ("aadha jaancha"); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, apne brand ka naam platform se alag: brand "Unibelle" aur seller company "Unibelle Cosmetics Pvt Ltd"; storefront "Beautinique" aur platform company "Beautinique Pvt Ltd". Record: [DECISIONS.md](DECISIONS.md) D-243 (aur D-242).

### Q-175. Chhote packs pe batch number na ho to?

- **Status:** `Tay`. Topic: B3 (batch), B7 (returns), B13 (compliance). Group G20.
- **Sawal:** D-064, D-106 aur D-113 maante hain ki har pack pe batch number hai (batch ka MRP, daawe ki photo, pickup pe milaan). Jin packs pe kanoon batch nahi maangta, unka kya?
- **Kyun zaroori:**
  - Cosmetics Rules ka rule 34(2)(a): 10 g ya 25 ml tak ke packs pe batch number zaroori nahi; soap pe batch ki jagah banne ka mahina.
  - Aise packs pe photo se batch ka milaan ho hi nahi sakta, to daawe aur pickup atak jaate.
- **Vikalp:**
  - **(a) Platform ka batch id:**
    1. Listing pe "pack pe batch nahi" sirf in do maamlon me (chhota pack, ya soap); staff jaanche.
    2. Receiving pe platform ka batch id: receiving lot + banne ka mahina ya expiry.
    3. Daawe (D-106) aur pickup (D-113) me batch ki photo ki jagah pack aur label ki photo.
  - **(b) Batch zaroori:** jin packs pe batch na ho, wo list hi na hon.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. Minis aur soap jaise products bhi aa paate hain, aur batch ka record platform ke id se bana rehta hai.
- **Trade-off:**
  - (a) me receiving pe ek id ka kadam, aur pickup pe milaan thoda kamzor.
  - (b) me minis, samples aur soap bahar.
  - (c) me aise packs pe daawe aur pickup atak jaate.
- **Kanooni detail:** rule 34(2)(a) public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, platform ka batch id (3 niyam). Record: [DECISIONS.md](DECISIONS.md) D-234.

### Q-176. Chhote packs ke label pe ingredients na hon to?

- **Status:** `Tay`. Topic: B3 (catalog), B13 (compliance). Group G20.
- **Sawal:** D-099 niyam 1 me seller ingredients ka text aur pack ke label ki photo deta hai, aur staff photo se milata hai. Jin chhote packs ke label pe ingredients nahi hote, unka kya?
- **Kyun zaroori:**
  - Cosmetics Rules ka rule 34(7): 60 ml ya 30 g tak ke packs ke label pe ingredients zaroori nahi (bahar ke carton ya leaflet pe ho sakte).
  - Tab label ki photo se milaan nahi hota, aur allergen ki chetavni (D-099, D-159) galat list pe chal sakti hai.
- **Vikalp:**
  - **(a) Carton ya brand ki specification:** label pe na ho to bahar ke carton ki photo, ya brand ki product specification (dummy, D-026); staff usi se milaye. Product page pe poori list waise hi.
  - **(b) Sirf seller ki ghoshna:** chhote packs pe photo ka milaan nahi.
  - **(c) Jaisa hai:** label ki photo zaroori; aise packs list nahi ho paate.
- **Salah:** **(a)**. Ingredients ka saboot bana rehta hai, aur chhote packs bhi aa paate hain.
- **Trade-off:**
  - (a) me seller se ek aur dastavez.
  - (b) me galat ingredients aur galat allergen chetavni ka jokhim.
  - (c) me chhote packs bahar.
- **Kanooni detail:** rule 34(7) public source se mila ke dekha gaya (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, carton ki photo ya brand ki specification. Record: [DECISIONS.md](DECISIONS.md) D-235.

### Q-177. Bahut chhote packs pe MRP na ho to?

- **Status:** `Tay`. Topic: B4 (pricing), B3 (catalog), B13 (compliance). Group G20.
- **Sawal:** D-061 niyam 1 maanta hai ki har pack pe MRP chhapa hai (daam MRP se zyada nahi). 10 g ya 10 ml tak ke packs pe Legal Metrology ka MRP zaroori nahi. Inka kya?
- **Kyun zaroori:**
  - Legal Metrology (Packaged Commodities) Rules me 10 g ya 10 ml tak ke packs ko zyada-tar declarations (MRP samet) ki chhoot hai.
  - Bina MRP ke daam ki seema (D-061), "% off" (D-120) aur pichhle 30 din ka daam (D-223) ka aadhaar nahi rehta.
- **Vikalp:**
  - **(a) MRP chhapa ho tabhi list:** aise chhote packs tabhi list hon jab pack pe MRP chhapa ho; baaki niyam jaise hain.
  - **(b) "Reference price" ka field:** seller ek reference daam de, staff jaanche; aise packs pe kata daam aur "% off" nahi.
  - **(c) R1 me aise sab packs bahar:** 10 g ya 10 ml tak ke packs R1 me list nahi; R2 me dobara dekhein.
- **Salah:** **(a)**. Ek saral niyam, aur MRP wale minis aa paate hain.
- **Trade-off:**
  - (a) me bina MRP wale minis bahar.
  - (b) me naya field aur jaanch, aur MRP ke bina daam ki seema kamzor.
  - (c) me koi chhota pack nahi, MRP wala bhi nahi.
- **Kanooni detail:** chhoot public source se mila ke dekhi gayi (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, MRP chhapa ho tabhi list. Record: [DECISIONS.md](DECISIONS.md) D-236.

### Q-178. Grievance Officer aur nodal person ka naam

- **Status:** `Tay`. Topic: B11 (support), B13 (compliance). Group G21.
- **Sawal:** D-145 niyam 4 me Grievance Officer jaise officers ke liye sirf role ka naam aur `example` domain ka email; kisi insaan ka banawati naam nahi. Kanoon naam maangta hai. Kya karein?
- **Kyun zaroori:**
  - E-commerce rules ka rule 4(4): Grievance Officer ka naam, contact aur designation dikhana zaroori.
  - Rule 4(1): ek nodal person bhi chahiye; D-134 ki table me iska row nahi.
- **Vikalp:**
  - **(a) Naam ka field, demo me saaf dummy:**
    1. Grievance Officer aur nodal person ke naam, designation aur contact ke fields data me (D-145 niyam 7 ki dummy list me).
    2. Demo me naam "Dummy Grievance Officer" aur "Dummy Nodal Officer", "DUMMY" badge ke saath; insaan jaisa naam nahi.
    3. Asli business pe asli naam, sirf data badal ke, code nahi.
  - **(b) Jaisa hai:** sirf role ka naam, aur note ki asli business pe naam aayega.
  - **(c) Insaan jaisa banawati naam,** "DUMMY" badge ke saath.
- **Salah:** **(a)**. Kanoon ka field pehle din se, aur kisi asli insaan se naam milne ka dhokha nahi.
- **Trade-off:**
  - (a) me do officers ke fields.
  - (b) me page pe kanoon ka field hi nahi.
  - (c) me naam kisi asli insaan se mil sakta hai.
- **Kanooni detail:** rule 4(1) aur 4(4) public source se mila ke dekhe gaye (kanooni jaanch, pehla run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** koi vikalp nahi chuna. Grievance Officer aur nodal person apne staff ke roles hain, sarkari log nahi; unki jaankari dummy nahi, role wale staff ki asli jaankari. Saath me aam niyam: jahan bhi kaam apna role karta hai, wahan dummy naam nahi, us kaam ka role banta hai. Record: [DECISIONS.md](DECISIONS.md) D-237, D-241.

### Q-179. Seller ki jaankari, seller pe shikayat, aur shikayat ki copy

- **Status:** `Tay`. Topic: B11 (support), B2 (sellers), B13 (compliance). Group G21.
- **Sawal:** product page pe seller ki kitni jaankari dikhe, seller ke products ki shikayat kaise chale, aur shikayat ki receipt me kya ho?
- **Kyun zaroori:**
  - E-commerce rules ke rule 5(3)(a), 6(4) aur 6(5): marketplace pe seller ka naam, pata, customer care aur seller ke grievance officer ki jaankari, aur seller ka shikayat pe jawab. D-134 ki table me iska row nahi.
  - 2026 ke badlav (1 Jan 2027 se, sirf secondary source se): grievance ki receipt ke saath shikayat ki copy. D-163 niyam 3 me receipt hai, copy nahi.
- **Vikalp:**
  - **(a) Seller ka block aur ek hi seedhi:**
    1. Product page pe "Sold by" ke saath seller ka business naam, pata, customer care contact aur seller ka grievance officer (dummy, "DUMMY" badge). Ye L2: iske bina seller live nahi (D-134 me naya row).
    2. Seller ke products ki shikayat bhi platform ki usi seedhi (D-163) me; seller ko ticket dikhe aur wo jawab de, timers wahi.
    3. Receipt (email aur in-app) me shikayat ka poora text.
  - **(b) Kam:** sirf seller ka naam aur pata; shikayat sirf platform sambhale, seller ka grievance officer nahi.
  - **(c) Jaisa hai.**
- **Salah:** **(a)**. Customer ko pata rehta hai ki maal kisne becha, aur har shikayat ek hi jagah, ek hi timers se.
- **Trade-off:**
  - (a) me seller onboarding me kuch fields aur, aur seller app me ticket ka raasta.
  - (b) me kanoon ka seller wala hissa adhoora.
  - (c) me takrav ka jokhim.
- **Kanooni detail:** rules 5(3)(a), 6(4), 6(5) public source se mila ke dekhe gaye; receipt me copy wala niyam sirf secondary source se ("aadha jaancha"); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, seller ka block aur ek hi seedhi (3 niyam); jahan kaam apna role karta hai, wahan dummy nahi (D-241). Record: [DECISIONS.md](DECISIONS.md) D-238.

### Q-180. Tax ke chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B6 (finance), B13 (compliance).
- **Sawal:** kanooni jaanch me tax ke kuch chhote sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **HSN aur rate (D-086):** table ki row = HSN + description ki shart + rate + tareekh, kyunki ek HSN me alag products ke alag rate ho sakte hain (misaal: 3304 me talcum 5% par make-up 18%; 3401 me soap bar 5% par face wash 18%). Seller row chune, staff jaanche. (Jaancha.)
  2. **Invoice kab bane (D-041):** invoice pack ya dispatch ke scan pe; pack se pehle cancel ho to invoice nahi; baad me cancel ya return pe credit note. CGST Act ki s.31: invoice maal nikalne se pehle ya us waqt. (Jaancha; credit note wala hissa aadha jaancha.)
  3. **Delivery fee ka GST (D-107):** fee ka SAC aur rate CA se tay; rate table me tareekh ke saath. 1 Nov 2026 se delivery seva pe naya niyam (5% bina ITC, e-commerce operator pe zimmedari) sirf secondary source se mila. (Aadha jaancha.)
  4. **TDS ka pal (D-081):** income-tax TDS seller ke ledger me pehle credit pe (ya payment pe, jo pehle ho), "payable" ke din nahi. Return pe ulat ka niyam CA se. (Aadha jaancha.)
  5. **Doosre state ka GSTIN (D-092, R2):** invoice delivery wale state ke hisaab se tax lagata hai; customer ka GSTIN doosre state ka ho to us invoice ka tax credit wo shayad na le paaye. Checkout pe state code ka milaan aur saaf chetavni. (Aadha jaancha.)
  6. **D-134 ki table me do rows:** e-invoice ka field (L1; seema seller ke turnover pe, sirf secondary source se) aur har warehouse state me TCS registration ka field (L1). (Aadha jaancha aur jaancha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me finance aur catalog me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me galat tax ke jokhim bache rehte hain.
- **Kanooni detail:** har sudhaar ke saath uska status likha hai; CA aur lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-239.

### Q-181. Listing, pages aur compliance ke chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B3 (catalog), B9 (search), B11 (khabrein), B13 (compliance).
- **Sawal:** kanooni jaanch me listing, legal pages aur compliance ki table ke kuch chhote sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **Country of origin (D-138):** filter ke saath sort me bhi country of origin, aur search me country ka naam. Legal Metrology rules ka rule 6(10A) (1 Jul 2026 se): country of origin ka filter searchable aur sortable ho. (Jaancha.)
  2. **Blocklist (D-132):** do hisse: drug ingredients (D-128) aur "cosmetic me mana" ingredients (Cosmetics Rules ka rule 39; IS 4707 Part 2 ki list); har entry pe source. (Niyam jaancha; IS ki list khud nahi khuli.)
  3. **Seller ka undertaking (D-098):** seller agreement me content sahi hone ka undertaking (E-commerce rules ka rule 5(2)), aur har listing submit pe checkbox, pehle se tick nahi. (Jaancha.)
  4. **Legal pages (D-150):** "Payments" (payment ke tareeke, fees, charge-back) aur "Kram kaise" (search aur sujhaav ke mukhya gun, saral shabdon me) pages list me (rule 5(3)). (Jaancha.)
  5. **Recall ke emails (D-142):** recall ki email line OTP ke baad sabse pehle, paise ke emails se bhi pehle; chhat paar ho to in-app aur push usi din. Kanoon ki koi seema nahi mili; sehat ka maamla hai. (Claude ki salah.)
  6. **Dark patterns (D-134):** 2027 se saal ka self-audit aur certificate (sirf secondary source se): D-134 me iska record (audit ki checklist aur dummy certificate) L3 jaisa, 2027 se pehle. (Aadha jaancha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me catalog, search aur pages me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me kanoon ke chhote hisse adhoore.
- **Kanooni detail:** har sudhaar ke saath uska status likha hai; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-240.

### Q-182. COMPLIANCE batch 1: tax (GST, TCS, TDS) ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B6 (finance).
- **Sawal:** kanooni jaanch ke tax hisse ki ye 24 rows [COMPLIANCE.md](COMPLIANCE.md) me aayein? Har row COMPLIANCE ke format me jaayegi (kanoon ya niyam, kis pe laagu, kis module me, system me kya chahiye, dummy kya hai, jaancha ya nahi), source ke link aur tareekh ke saath.
- **Kyun zaroori:**
  - Finance aur catalog ke design ko tax ka ek tay aadhaar chahiye; QA ke tests bhi inhi se banenge.
  - Jahan kisi row se tay faisla badalta tha, wo pehle hi sawal ban ke tay ho gaya (D-221 se D-241); yahan sirf unka hawala hai.
- **Prastaavit rows** (sources 2026-11-19 ko khole gaye):
  1. **CL-001, GST rates:** 22 Sep 2025 se (Notification 9/2025-CT(Rate)) beauty aur personal care pe 5%, 18% aur Nil, HSN + description ke hisaab se. Catalog aur finance: rate table (D-086, D-239). Rates asli (public data). Jaancha (GST Council ki press release, 3 Sep 2025; CBIC ka ready reckoner, copy secondary site pe).
  2. **CL-002, rate badalne ka pal (CGST s.14):** invoice ke pal ka rate; seller ko alert (D-086). Aadha jaancha (anti-profiteering s.171 nahi khola).
  3. **CL-003, invoice ka samay aur number (s.31, rule 46):** dispatch ke scan pe (D-239); har seller GSTIN aur financial year ki apni series, lagataar number, cancel hua number bhi record me. Dummy GSTIN ke saath "SPECIMEN" (D-145). Jaancha.
  4. **CL-004, e-invoice (rule 48(4)):** ₹5 crore se zyada turnover wale seller ke B2B invoice pe IRN aur QR ke fields (D-239); dummy me "DUMMY IRN". Aadha jaancha.
  5. **CL-005, credit note (s.34):** return aur RTO pe seller ke GSTIN se, asli invoice ke reference ke saath, apni series; financial year ke baad 30 November ki seema ke baad finance ko alert. Aadha jaancha.
  6. **CL-006, replacement (R2):** credit note + naya invoice, ya bina keemat ka replacement: CA se tay, data dono sambhale. Aadha jaancha.
  7. **CL-007, discount (s.15(3)):** brand ka discount invoice pe line; platform ke discount (R2) ka ilaaj CA se; data me "customer ne diya" aur "platform ne diya" alag. Aadha jaancha.
  8. **CL-008, points ki chhoot (R2):** CL-007 ke saath CA se; points ki liability ka khaata GST se alag. Aadha jaancha.
  9. **CL-009, free samples (s.17(5)(h)):** D-229; brand ko bheje gaye samples ki report (apna ITC ulatne ke liye). Aadha jaancha.
  10. **CL-010, kit aur combo (s.2(30), s.2(74), s.8):** D-228. Jaancha.
  11. **CL-011, platform ki fees ka invoice (s.31(2)):** platform ke GSTIN se seller ko fees ka tax invoice (har payout ya mahine), SAC aur rate table se; payout statement alag document; apne brand pe bhi wahi rate card. Aadha jaancha.
  12. **CL-012, delivery fee:** platform ka alag B2C invoice; SAC aur rate CA se (D-239); 1 Nov 2026 ka naya niyam sirf secondary source se. Aadha jaancha.
  13. **CL-013, GST TCS (s.52):** 0.25% CGST + 0.25% SGST (IGST 0.5%), mahine ki net value pe (taxable supplies minus usi mahine ke credit notes); jama aur mahine ka statement 10 din me, saal ka statement 31 December tak; har warehouse state me TCS registration (D-239). Dummy registration "DUMMY". Jaancha (Notification 15/2024-CT, 10 Jul 2024 se).
  14. **CL-014, income-tax TDS (Income-tax Act 2025 s.393, pehle s.194-O):** 0.1% gross bikri pe, ledger ke pehle credit pe (D-239); individual seller ki ₹5 lakh tak ki chhoot; GST shaamil ho ya nahi aur bina PAN ki rate CA se. Aadha jaancha (sirf secondary).
  15. **CL-015, apna brand:** TCS, TDS aur fees invoice baaki sellers jaise; seller record pe "related party" ka field. Jaancha (TCS); TDS secondary.
  16. **CL-016, seller ka GST registration (s.24(ix)):** onboarding me saboot ki warehouse ka pata seller ke registration me "additional place of business" hai; staff jaanch. Aadha jaancha.
  17. **CL-017, kho gaya ya nasht maal (s.17(5)(h)):** seller ko har mahine aise units ki report batch ke saath; bharpai (D-063) payout me alag "compensation" line, GST ka ilaaj CA se. Aadha jaancha.
  18. **CL-018, B2B invoice aur tax credit (rule 46, s.16):** invoice pe GSTIN, naam aur pata; doosre state ke GSTIN pe chetavni (D-239). Aadha jaancha.
  19. **CL-019, ek parcel me kai invoices (s.31):** har seller ke invoice ki copy parcel ke saath (print ya QR), parcel label pe kis invoice ke items. Aadha jaancha.
  20. **CL-020, invoice pe customer ka naam (rule 46(e)):** D-226. Aadha jaancha.
  21. **CL-021, tax records (s.36):** 72 mahine, jhagda chale to uske baad 1 saal tak (D-225, D-227). Jaancha (GST); income-tax ke records ka samay jaancha nahi.
  22. **CL-022, gift voucher (R2, Circular 243/37/2024):** voucher bechne pe GST nahi, istemaal pe normal invoice; bina istemaal wale balance pe GST nahi. Jaancha (GST); prepaid niyam doosre run me.
  23. **CL-023, consultation (s.7):** muft hai to GST nahi (D-172); paid ho to SAC aur rate CA se. Aadha jaancha.
  24. **CL-024, demo ke documents (s.122):** bina supply ke invoice jaari karna saza wala kaam; dummy GSTIN ka check digit jaan-boojh ke galat (asli GSTIN kabhi na bane), PDF ke metadata me bhi "SPECIMEN" (D-145). Aadha jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me CA ke liye kuch sawal khule rehte hain (CL-006, CL-007, CL-008, CL-012, CL-014, CL-017, CL-023), jo design me option ki tarah rahenge.
  - (b) me har badlav ki ek line.
  - (c) me finance ke design ka tax aadhaar baad me.
- **Kanooni detail:** har row ke saath uska status likha hai. Kai sarkari sites (CBIC, India Code, incometaxindia) nahi khuli, isliye kuch rows "aadha jaancha" hain. CA aur lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-244.

### Q-183. COMPLIANCE batch 2: Legal Metrology ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B3 (catalog), B4 (pricing).
- **Sawal:** kanooni jaanch ke Legal Metrology hisse ki ye 14 rows [COMPLIANCE.md](COMPLIANCE.md) me aayein (CL-025 se CL-038), COMPLIANCE ke format me, source ke link aur tareekh ke saath?
- **Kyun zaroori:**
  - Listing ke zaroori fields, product page ka "pack ki jaankari" hissa aur MRP ke niyam isi se bante hain; catalog aur QA ka aadhaar.
  - Kuch rows nayi cheezein laati hain (galat declaration pe listing rokna, unit sale price, veg ya non-veg dot ka field, "not for retail sale" packs ki rok); baaki tay faislon (D-064, D-127, D-138, D-231, D-236, D-240) se mel ka hawala.
- **Prastaavit rows** (Legal Metrology (Packaged Commodities) Rules 2011, 13 Feb 2026 tak ke badlav ke saath; sources 2026-11-19 ko khole):
  1. **CL-025, MRP saare tax samet (rule 6(1)(e), 18(2), 18(5)):** koi MRP se upar nahi bech sakta, MRP chhupaya ya badla nahi ja sakta. Server pe daam ≤ MRP ki jaanch (D-061, SR-042). Jaancha.
  2. **CL-026, online declarations (rule 6(10)):** rule 6(1) ki saari declarations (mfg mahina-saal chhod ke) platform pe. Listing ke zaroori fields: generic naam, net quantity, MRP, manufacturer, packer, marketer, importer aur country of origin (imported), size jahan laagu, kit me har cheez. Product page pe "Pack ki jaankari" ka hissa. Galat declaration ki report pe staff listing ko "jaanch tak rok" sake, wajah ke record ke saath (platform ki marketplace wali suraksha ke liye). Jaancha.
  3. **CL-027, unit sale price (rule 6(11)):** pack pe zaroori; online ka saaf niyam nahi mila. Product page aur cart pe system se nikla unit sale price (MRP / net quantity), bina seller ke kaam ke; kits pe nahi. Jaancha.
  4. **CL-028, country of origin (rule 6(1)(aa), 6(10A), 1 Jul 2026 se):** imported pe country of origin, aur searchable aur sortable filter (D-127, D-138, D-240). Jaancha.
  5. **CL-029, manufacturer, packer, marketer, importer (rule 6(1)(a)):** chaaron alag fields; label pe brand owner marketer ho to wahi zimmedar; staff label ki photo se milaye. Jaancha.
  6. **CL-030, customer care (rule 6(2)):** pack wala customer care (naam, pata, email, phone) listing ka field aur "Pack ki jaankari" me; phone sirf contact. Bahar ke brand pe dummy; jahan kaam apna role karta hai, wahan asli (D-241). Jaancha.
  7. **CL-031, batch ka MRP aur revised MRP (rule 18(2-A), 18(3), 6(3)):** alag batches pe alag MRP theek (pack se aata hai); tax ghatne pe revised kam MRP purane packs pe bhi (D-064, D-231). Customer ko "pack pe MRP ₹X; revised MRP ₹Y". Jaancha (2025 ki sticker wali chhoot sirf secondary).
  8. **CL-032, online mfg date aur expiry (rule 6(1)(d), 6(1)(da), 6(10)):** Legal Metrology online mfg date nahi maangta; cosmetics ka niyam alag. D-067 isse zyada deta hai. Jaancha.
  9. **CL-033, net quantity (rule 6(1)(c)):** number + unit (g, ml ya ginti) ki tay list se; unit sale price isi se. Jaancha.
  10. **CL-034, free samples ke pack (rule 26(a)):** 10 g ya 10 ml tak pe ye rules laagu nahi; sample listing pe net quantity zaroori, aur bade sample pe CL-026 ke fields. Aadha jaancha.
  11. **CL-035, kit (rule 6(1)(b), 6(5)):** kit me har cheez ka naam aur net quantity, product page pe (D-088). Jaancha.
  12. **CL-036, 10 g ya 10 ml tak ke packs (rule 26(a)):** D-236. Jaancha.
  13. **CL-037, veg ya non-veg dot (rule 6(8)):** cosmetics aur toiletries ke pack pe hara ya laal-bhura dot; online ka saaf niyam nahi. Listing pe "pack pe dot" ka field label photo se; staff "vegan" claim aur laal dot ka takrav pakde. Jaancha.
  14. **CL-038, Pro buyers aur MRP (rule 2(bc), 3(c)):** chhoot sirf "not for retail sale" packs pe; Pro kharid bhi retail packs ki, MRP ki seema sab pe (D-065). "Not for retail sale" wale packs list nahi hote. Jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me catalog me kuch fields aur jaanch ke kadam (dot, chaar naam, customer care, listing rokna).
  - (b) me har badlav ki ek line.
  - (c) me listing ke fields ka aadhaar baad me.
- **Kanooni detail:** rules ka text ek law firm ki site pe rakhi consolidated copy se, aur 2026 ka badlav (G.S.R. 128(E)) bhi doosri site pe rakhi gazette copy se; 2025 ki MRP sticker wali chhoot sirf secondary source se. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-245.

### Q-184. COMPLIANCE batch 3: cosmetics kanoon ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B3 (catalog), B7 (returns).
- **Sawal:** kanooni jaanch ke cosmetics kanoon (Drugs and Cosmetics Act 1940, Cosmetics Rules 2020) wale hisse ki ye 20 rows [COMPLIANCE.md](COMPLIANCE.md) me aayein (CL-039 se CL-058), COMPLIANCE ke format me, source ke link aur tareekh ke saath?
- **Kyun zaroori:**
  - Listing ki jaanch ki checklist, batch aur expiry ke niyam, recall aur returns ka aadhaar isi se banta hai.
  - Kuch rows nayi cheezein laati hain (label ki checklist, imported ke RC ke fields, "mana shabdon" ki list, "certified cruelty-free" ka naam, recall pe regulator ki suchna ka field, returns me storage ki jaanch, dispatch pe expiry ki rok, khaas products ki checklist); baaki tay faislon (D-099, D-128, D-159, D-230, D-232, D-234, D-235, D-240) se mel ka hawala.
- **Prastaavit rows** (sources 2026-11-19 ko khole; Cosmetics Rules ka sarkari text 2020 ka, 2025 ka badlav sirf secondary se):
  1. **CL-039, label ke zaroori fields (rule 33, 34):** naam, manufacturer ka naam aur pata, batch, M.L. number (ya imported pe RC number aur importer), net contents, expiry ki jaankari, ingredients, chetavni. Listing ki jaanch me label ki photo se inki checklist, category ke hisaab se. Jaancha.
  2. **CL-040, expiry ki jaankari zaroori (rule 34(1)(c), 3(w), 18(2)):** use before, expiry date, ya mfg date + "XX mahine tak"; sirf PAO kaafi nahi (D-083). Receiving pe expiry ka roop (D-232); imported batch pe import ki tareekh se kam se kam 6 mahine ki expiry ki chetavni staff ko. Jaancha.
  3. **CL-041, "use before" aur "expiry" ka din (2025 ka badlav):** D-232. Aadha jaancha.
  4. **CL-042, batch number kab nahi (rule 34(2)(a)):** D-234. Jaancha.
  5. **CL-043, ingredients aur allergens (rule 34(7)):** 1% se zyada wale ghatte kram me; 60 ml ya 30 g tak ke packs pe label pe zaroori nahi (D-235). Online ka alag niyam nahi; allergen ka koi niyam nahi mila, D-099 aur D-159 kanoon se zyada. Allergen chetavni ke saath line: "ye platform ki list se hai; pack ki ingredients list dekhein". Jaancha.
  6. **CL-044, imported cosmetics (rule 12, 14, 18, 34(5), 34(9)):** CDSCO ka registration zaroori, har 5 saal se pehle retention fee; imported listing pe RC number, RC holder ka naam, product RC me listed hone ki seller ki ghoshna, aur retention ki agli tareekh ki staff ko yaad (D-127). Jaancha.
  7. **CL-045, licence ka type aur M.L. number (rule 23 se 30, 26(f), 34(2)(b)):** licence ya loan licence; M.L. number label ki photo se staff jaanche; contract manufacturer se bane apne brand pe us manufacturer ka M.L. number (D-128). Jaancha.
  8. **CL-046, cosmetic aur drug ki seema (Act s.3(aaa), rule 36):** drug claim wala product cosmetic nahi. "Mana shabdon" ki list (jaise treat, cure, heal, bimari se bachav) description ke free text me bhi staff ki queue me bheje; list ka badlav senior role ke haath me, D-132 jaisa (D-043, D-128, D-137). Jaancha.
  9. **CL-047, Ayurvedic aur AYUSH (Act):** darja licence aur daawe se, naam se nahi. Label pe "Ayurvedic medicine" ya AYUSH licence number dikhe to staff use drug type maane (D-128). Aadha jaancha (AYUSH ke niyam doosre run me).
  10. **CL-048, cosmetic me mana ingredients (rule 39):** IS 4707 Part 2 Annex A, rang ki seemaayein, hexachlorophene, mercury (D-240). Jaancha (rule); IS ki list khud nahi khuli.
  11. **CL-049, animals pe testing (rule 39(7), 18(4)):** India me cosmetics ki animal testing mana, aur 12 Nov 2014 ke baad animals pe test hua cosmetic import nahi ho sakta. Isliye claim ka naam "certified cruelty-free (certifier ka naam)", sirf certificate ke saath; filter ka naam bhi yahi (D-100). Jaancha.
  12. **CL-050, recall (rule 65, 47; Consumer Protection Act s.20):** manufacturer turant recall shuru kare aur regulator ko bataye; "stock mat becho" order ke baad bikri mana. Seller app me recall pe "regulator ko suchna di: haan ya nahi, tareekh, reference" ka field; recall emails pehle (D-129, D-131, D-240). Jaancha.
  13. **CL-051, skin reaction ki report (rule 65(2)):** marketplace pe report ka saaf niyam nahi; brand ko case ki khabar bina customer ki pehchaan ke (product, batch, kya hua, ginti), aur brand ka jawab case me (D-130). Jaancha.
  14. **CL-052, lautaye band cosmetics dobara bechna (rule 35, 3(w); Consumer Protection Act s.86):** saaf rok nahi mili. Returns ki jaanch me ek aur check: label pe storage ki shart wala product aur parcel kitne din customer ke paas raha; shak ho to stock me nahi, brand ko (D-112). Aadha jaancha.
  15. **CL-053, expired cosmetics (rule 3(w), 18(2)):** expired batch kabhi reserve ya dispatch nahi; pick aur dispatch scan pe bhi expiry ki jaanch (D-232 ke aakhri din se) (D-062, D-082). Aadha jaancha.
  16. **CL-054, bechne ka licence (Cosmetics Rules ka dhaancha, rule 33):** cosmetics ki bikri ya storage ka alag licence nahi; licence sirf banane aur import ke liye. Jaancha.
  17. **CL-055, label na badalna (rule 35):** D-230. Jaancha.
  18. **CL-056, khaas products (rule 34(4), 37, 38):** hair dye, fluoride toothpaste aur khatre wale products ki listing checklist me unke khaas fields (chetavni ka text label ki photo se). Jaancha.
  19. **CL-057, samples ka label (rule 34, 64):** samples ki alag chhoot nahi mili; sample bhi label ki photo se jaanch, chhote pack ki chhooton ke saath (D-234, D-235). Aadha jaancha.
  20. **CL-058, reviews aur seller ke content me ilaaj jaise daawe (rule 36):** customer ki raay ka saaf niyam nahi (D-146); brand ka jawab (D-160) aur seller ka content "mana shabdon" ki list (CL-046) se moderation me. Aadha jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me catalog ki jaanch, warehouse aur returns me kuch kadam aur (checklist, RC ki yaad, storage ki jaanch, dispatch pe expiry).
  - (b) me har badlav ki ek line.
  - (c) me listing aur returns ke niyamon ka kanooni aadhaar baad me.
- **Kanooni detail:** Cosmetics Rules ka sarkari text 2020 ka hai; 2025 ka badlav sirf secondary source se. IS 4707 ki list aur AYUSH ke niyam nahi khule. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-246.

### Q-185. COMPLIANCE batch 4: e-commerce aur consumer kanoon ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B11 (support), B5 (checkout).
- **Sawal:** kanooni jaanch ke e-commerce aur consumer kanoon (Consumer Protection (E-Commerce) Rules 2020, Consumer Protection Act 2019, dark patterns aur misleading ads ki guidelines) wale hisse ki ye 29 rows [COMPLIANCE.md](COMPLIANCE.md) me aayein (CL-059 se CL-087), COMPLIANCE ke format me, source ke link aur tareekh ke saath? Ye kanooni jaanch ke pehle run ki aakhri batch hai.
- **Kyun zaroori:**
  - Legal pages, product page ki jaankari, checkout, shikayat aur reviews ke niyam isi se bante hain; UX aur QA ka aadhaar.
  - Kuch rows nayi cheezein laati hain (About ya Contact page, return ki line product page pe, refund ka vaada, kram ke gun ka kram, Creator ke content ka label, "kam stock" ka log, listing hatane ki wajah ke code, imported pe asli hone ki guarantee, invoice pe seller ka naam); baaki tay faislon se mel ka hawala.
- **Prastaavit rows** (sources 2026-11-19 ko khole; E-commerce Rules ka text 2020 ka, 2026 ka badlav (1 Jan 2027 se) aur guidelines sirf secondary se):
  1. **CL-059, platform ki jaankari aur nodal person (rule 4(1), 4(2), 4(6), 4(7)):** About ya Contact page pe legal naam, pata, website, customer care aur grievance officer ke contact; nodal person. Company ka naam aur pata dummy; customer care, grievance officer aur nodal person apne roles ki asli jaankari (D-237, D-241). National Consumer Helpline ka field (2027 se zaroori). Jaancha (2027 wala hissa secondary).
  2. **CL-060, seller ki jaankari aur seller ka grievance officer (rule 5(3)(a), 6(4), 6(5)):** D-238; seller profile me legal naam, pata, customer care, grievance officer, GSTIN (aur MSME number agar ho), website; seller agreement likhit contract, version ke saath (D-150). Jaancha.
  3. **CL-061, return policy dikhana (rule 5(3)(c), 6(5)(g)):** product page pe return ki line ("seal aata hai: man badla 7 din" ya "seal nahi: sirf galti pe") aur return ka kharcha; numbers settings se (D-079, D-114, D-150, D-221). Jaancha.
  4. **CL-062, kharab maal pe haq aur muddat (rule 6(3); Act s.2(47)(viii), s.69):** D-221. Jaancha.
  5. **CL-063, refund ka samay (rule 4(10); Act s.2(47)(viii)):** return ke refund ka tay vaada ("pickup se X kaam ke din me", setting), order page pe (D-111, D-115); RBI ke samay ke niyam doosre run me. Jaancha.
  6. **CL-064, grievance officer, receipt aur hal (rule 4(4), 4(5), 5(3)(b), 6(4)(b)):** naam, contact, designation; 48 ghante me receipt, ek mahine me hal; ticket number (D-163, D-237, D-238). Jaancha (receipt me copy wala hissa secondary).
  7. **CL-065, daam ka khel aur customers me bhed (rule 4(11)):** Pro buyers jaanchi hui class hain, manmani nahi (D-065, D-069); Pro ki shartein public page pe, aur "suvidha band" ke niyam (D-109, D-116) policy page pe. Jaancha.
  8. **CL-066, kram aur sponsored (rule 5(3), 5(4); 2027 se 4(11)(c), 4(12)):** kram ke page pe mukhya gun mahatva ke kram me; seller agreement me "koi differentiated treatment nahi, apna brand bhi isi niyam me"; sponsored (R2) ka label har jagah (D-139). Jaancha (2027 wale hisse secondary).
  9. **CL-067, platform ke naam jaisa seller aur customer data (2027 se rule 5(6)):** apne brand ka naam alag hai (D-243), to laagu nahi; seller record pe "related party" ka field (CL-015). Aadha jaancha.
  10. **CL-068, product liability (Act s.2(17), s.2(37), s.84 se s.87):** platform maal rakhta, jaanchta aur label lagata hai, to "reasonable care" ka jokhim. Warehouse ke niyam likhit (storage ki shart, pehle expire wala pehle, quarantine, returns ki jaanch) aur har kadam ka record; chetavni wale products ki chetavni product page pe (CL-056). Jaancha.
  11. **CL-069, seller ka undertaking (rule 5(2), 6(4)(c)):** D-240. Jaancha.
  12. **CL-070, jhoothi jaldi (dark patterns, false urgency):** D-154; "kam stock" ka number aur niyam audit ke liye log me. Aadha jaancha.
  13. **CL-071, chhupe charges aur basket sneaking (dark patterns; rule 6(5)(b)):** D-107; cart aur checkout pe delivery fee alag line me; server ka total aur dikha total na mile to order nahi (SR-044). Aadha jaancha.
  14. **CL-072, saaf consent (rule 4(9); dark patterns):** koi checkbox pehle se tick nahi; "Haan" aur "Nahi" barabar dikhen; QA ka test (D-141, D-150, D-155). Jaancha.
  15. **CL-073, dark patterns ka saal ka audit (2027 se):** D-240. Aadha jaancha.
  16. **CL-074, discount aur pehle ka daam (Act s.2(47)(i)(i); 2027 se prior price):** D-223. Aadha jaancha.
  17. **CL-075, claims aur gumraah karne wale vigyapan (Act s.2(28), s.2(47)(i)(g), s.21):** D-224. Jaancha (Act); 2022 ki guidelines secondary.
  18. **CL-076, endorsement aur influencers (2022 ki guidelines):** D-158; Creator (R2) ke har content pe "Ad / Sponsored / Collab" ka label system se, jo hataya na ja sake. Aadha jaancha.
  19. **CL-077, nakli reviews (rule 6(2), 4(3)):** D-146, D-156; reviews ka BIS standard (IS 19000, voluntary) baad me. Aadha jaancha.
  20. **CL-078, cancel pe charge (rule 4(8)):** customer pe charge tabhi jab platform bhi apne cancel pe waisa uthaye; D-110 me koi cancel fee nahi. Jaancha.
  21. **CL-079, demo store (Act s.2(47)(ii); bait and switch):** D-133, D-145; product page aur checkout pe bhi demo ki patti. Aadha jaancha.
  22. **CL-080, legal pages (rules 4, 5, 6):** D-150, D-240, aur About ya Contact (CL-059). Jaancha.
  23. **CL-081, points ki expiry aur suchna:** source nahi khula; prepaid niyamon ke saath doosre run me (D-174). Jaancha nahi.
  24. **CL-082, recall pe customers ko suchna (Act s.20; Cosmetics Rules rule 65):** D-129, D-131, D-240. Jaancha.
  25. **CL-083, der se delivery (rule 6(3)):** D-222. Jaancha.
  26. **CL-084, invoice pe seller ka naam (2027 se):** invoice template me seller ka naam sabse upar, platform ka naam usse bada nahi. Aadha jaancha.
  27. **CL-085, baar-baar ullanghan wale sellers (rule 5(5)):** listing hatane ki wajahon me "trademark, copyright ya IT Act ki shikayat" ka alag code, aur seller pe ginti. Jaancha.
  28. **CL-086, asambandhit sevaon ki bundled fee (2027 se):** koi platform ya packing fee nahi (D-107), points pe fee nahi (D-173). Aadha jaancha.
  29. **CL-087, imported: importer aur asli hone ki guarantee (rule 4(6), 6(5)(f)):** imported listing pe seller ki "authenticity guarantee" ki ghoshna (text + checkbox, pehle se tick nahi), product page pe, brand authorisation (D-075) se judi. Jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me pages, product page, checkout, seller app aur reviews me kuch chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me e-commerce ke kanooni niyam baad me, aur kanooni jaanch ka pehla run adhoora.
- **Kanooni detail:** E-commerce Rules aur Consumer Protection Act ke text doosri sites pe rakhi copies se; 2026 ka badlav, dark patterns aur misleading ads ki guidelines sirf secondary source se; points ki expiry ka source nahi khula. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-19):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-247.

### Q-186. Data leak pe khabar ka samay (D-198) kanoon ke saath kaise tike?

- **Status:** `Tay`. Topic: B14 (security), B13 (compliance).
- **Sawal:** D-198 me data leak pakka hone pe asar wale users ko "misaal 72 ghante ke andar" khabar hai. Kanoon me alag-alag logon ke liye alag samay hain. Kya badle?
- **Kyun zaroori:**
  - DPDP Rules 2025 ka rule 7(1): asar wale users ko **bina der** khabar. 72 ghante sirf Data Protection Board ko poori report ki seema hai (rule 7(2)(b)); Board ko shuruaati suchna bhi bina der.
  - CERT-In ke directions (28 April 2022): cyber incident ki report 6 ghante me. Ye ghadi abhi kisi runbook me nahi.
  - "72 ghante tak" likhne se users ke liye wahi seema ban jaati hai, jo kanoon ke "bina der" se lambi pad sakti hai.
- **Vikalp:**
  - **(a) Teen ghadiyaan runbook me:**
    1. CERT-In: incident pata chalne ke 6 ghante me report (dummy, D-026).
    2. Board: bina der shuruaati suchna, aur 72 ghante me poori report.
    3. Users: leak pakka hote hi, bina der, email aur in-app. Email me rule 7(1) ke hisse: kya hua, kab, kya asar, humne kya kiya, unhe kya karna hai, aur sampark.
    4. Leak ke emails din ki chhat (D-142) me OTP aur recall ke saath sabse aage; chhat paar ho to in-app aur push usi din.
  - **(b) Users ke liye tay seema:** 24 ghante (misaal), baaki (a) jaisa.
  - **(c) Jaisa hai:** 72 ghante, sirf CERT-In ki 6 ghante wali line jodo.
- **Salah:** **(a)**. Kanoon "bina der" kehta hai, koi tay ghanta nahi; teeno ghadiyaan alag likhne se runbook me koi chhootta nahi.
- **Trade-off:**
  - (a) me "leak pakka" kab maana jaaye, ye runbook me saaf likhna padega.
  - (b) me ek saaf number, par kuch maamlon me kanoon se lamba.
  - (c) me users ki khabar me der ka jokhim bacha rehta hai.
- **Kanooni detail:** rule 7 aur CERT-In ke directions public source se milaaye gaye (kanooni jaanch, doosra run); lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, teen ghadiyaan runbook me (CERT-In ko 6 ghante, Board ko bina der aur 72 ghante me poori report, users ko pakka hote hi bina der). Record: [DECISIONS.md](DECISIONS.md) D-248.

### Q-187. Gift card (D-179) kis raaste se bane?

- **Status:** `Tay`. Topic: B10 (gift cards), B6 (payments), B13 (compliance).
- **Sawal:** D-179 me gift card ka design abhi hai, aur banana kanooni jaanch ke baad. Jaanch me pata chala ki hamara gift card RBI ke prepaid (PPI) niyamon me aata hai. Gift card kis raaste se bane?
- **Kyun zaroori:**
  - RBI ke PPI niyam: "closed system" PPI sirf issuer ke apne maal ya seva ke liye hota hai, aur use RBI ki ijazat nahi chahiye. Hamara gift card kisi bhi seller ka maal khareedta hai, aur platform company khud maal nahi bechti (D-030, D-031), to ye closed system nahi lagta (RBI ke FAQ ke hisaab se).
  - Aisa gift card khud issue karne ke liye RBI authorisation chahiye, jo ek chhote business ke liye practical nahi.
  - Gift PPI ke niyam: validity kam se kam 1 saal, expiry issue pe dikhe, aur rakam ki seema (misaal ₹10,000).
- **Vikalp:**
  - **(a) RBI-authorised issuer ke zariye:**
    1. Gift card kisi RBI-authorised PPI issuer (jaise payment gateway ya gift card company) ka product ho, aur checkout pe payment ke ek tareeke ki tarah chale.
    2. D-179 ke design niyam (tay rakam, paane wale ke email pe code, thoda-thoda kharch, balance dikhe, cash me nahi) issuer ke niyamon ke andar.
    3. Validity kam se kam 1 saal, expiry issue pe dikhe, rakam ki seema issuer ke niyam se.
    4. Banana R2 ke baad, test mode me (D-026), jaisa D-179 me hai.
  - **(b) Gift card roko:** gift card ka feature abhi nahi banega; owner baad me khole.
  - **(c) Apna gift card, sirf test mode me:** demo ke liye apna gift card, aur "asli business se pehle issuer pe jaana" ki yaad COMPLIANCE me.
- **Salah:** **(a)**. Design asli kanoon ke hisaab se rehta hai, gift card ka paisa hamare khaate me nahi rukta, aur KYC aur RBI ka bojh issuer pe.
- **Trade-off:**
  - (a) me issuer ki API pe nirbharta; test mode me aisa issuer milta hai ya nahi, ye tathya ki jaanch.
  - (b) me gift card ka feature rukta hai.
  - (c) jaldi banta hai, par design kanoon ke khilaaf, aur asli business ke liye dobara banana.
- **Kanooni detail:** gift card pe niyam RBI ke FAQ se mila; Master Direction ka abhi ka version nahi khula, aur marketplace pe lagna vyakhya ka sawal: aadha jaancha. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, gift card RBI-authorised issuer ke zariye. Record: [DECISIONS.md](DECISIONS.md) D-249.

### Q-188. Personal data aur logs kitne din rahein: "kanooni rok"?

- **Status:** `Tay`. Topic: B14 (security), B13 (compliance).
- **Sawal:** kai faislon me personal data tay samay pe mitta hai: account delete (D-151), delivery ki photo aur location 180 din (D-191), daawe aur pickup ki photos (D-192), sehat ka data (D-208), aur logs (D-194). Kanoon me kam se kam rakhne ke samay mile. Kya badle?
- **Kyun zaroori:**
  - DPDP Rules 2025 ka rule 8(3) (lagbhag 13 May 2027 se): har processing ka personal data, uska traffic data aur logs kam se kam 1 saal rakhne hain, account delete ke baad bhi, sarkari jaanch jaise maqsadon ke liye. Ye hamari photos aur profile pe kitna lagta hai, vyakhya ka sawal hai.
  - IT Rules ka rule 3(1)(h): user ka registration data account band hone ke 180 din baad tak.
  - CERT-In ke directions: saare systems ke logs 180 din. Render free plan pe logs kitne din rehte hain, pakka nahi (R-024), to request logs (SR-077) aur security events apne store me chahiye.
- **Vikalp:**
  - **(a) "Kanooni rok" ki class, poori files ke saath:**
    1. Delete ya samay poora hone pe data app se turant hat jaaye; kisi staff screen pe na dikhe.
    2. Phir ek band, encrypted store me rahe: 13 May 2027 tak registration data 180 din, uske baad sab 1 saal. Sirf kanooni maang pe khule; har pahunch audit me.
    3. Samay ke baad apne aap erase.
    4. Request logs aur security events apne store me kam se kam 180 din abhi se, 13 May 2027 se 1 saal.
    5. Photos aur video bhi poori file ke roop me rok me.
  - **(b) (a) jaisa, par photos aur video ka sirf record:** file apne samay pe mite; rok me sirf uska record (kab, kisne, kis maamle me, file ka hash).
  - **(c) Abhi sirf logs:** CERT-In ke 180 din ke logs abhi; baaki rule 8(3) ke laagu hone se pehle tay.
- **Salah:** **(b)**. Jaanch ke liye zaroori baat (kaun, kab, kya) record se mil jaati hai, aur ghar ki photos aur videos saal bhar rakhna privacy ka bada jokhim aur free tier pe jagah ka bojh (R-006). Lawyer files maange to (a) pe jaana aasaan.
- **Trade-off:**
  - (a) kanoon ke sabse kareeb, par ghar aur logon ki photos 1 saal tak, aur jagah zyada.
  - (b) me jokhim aur jagah kam, par agar kanoon poori file maange to kami.
  - (c) me abhi kaam kam, par 2027 ke paas design badalna padega.
- **Kanooni detail:** rule 8(3) ka text primary se jaancha; laagu hone ki tareekh aur hamare data pe lagna aadha jaancha. CERT-In ke 180 din jaancha. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(b)**, kanooni rok ki class, aur photos aur video ka sirf record. Record: [DECISIONS.md](DECISIONS.md) D-250.

### Q-189. Reviews aur content ki shikayat ke samay (D-136, D-163) kitne hon?

- **Status:** `Tay`. Topic: B8 (reviews), B11 (support), B13 (compliance).
- **Sawal:** D-136 niyam 5 me moderation queue ka faisla misaal 2 kaam ke din me hai, aur D-163 niyam 3 me shikayat ka hal misaal 30 din me. IT Rules ke 2026 ke badlav inse chhote samay maangte hain. Kya badle?
- **Kyun zaroori:**
  - Reviews, photos aur sawal-jawab user content hain, to platform pe IT Rules 2021 laagu.
  - 2026 ke badlav ke samay (sirf secondary source se mile): content ki shikayat ka hal 7 din; rule 3(1)(b) wale content (jaise doosre ki niji jaankari ya gumraah karne wala) pe 36 ghante; nagnata ya kisi aur ban ke dikhane wale content pe 2 ghante; court ya sarkari order pe 3 ghante.
  - "2 kaam ke din" aur "30 din" in sab se lambe hain.
- **Vikalp:**
  - **(a) Naye samay abhi se (calendar ghante):**
    1. Shikayat ki receipt 24 ghante me.
    2. Nagnata ya kisi aur ban ke dikhane wale content ki report pe content turant apne aap chhupe (D-136 niyam 4 jaisa), faisla 2 ghante me.
    3. Baaki content ki report pe faisla 36 ghante me.
    4. Shikayat (grievance) ka hal 7 din me.
    5. Court ya sarkari order ka alag raasta: 3 ghante, Master ko alert.
  - **(b) Primary source tak ruko:** gazette khulne tak purane samay; khulte hi badlo.
  - **(c) Sirf grievance:** shikayat ka hal 7 din, baaki jaisa.
- **Salah:** **(a)**. Chhote samay maanne me kanooni jokhim nahi, chahe secondary galat nikle; ulta hua to ullanghan. Akele owner ke liye 2 ghante bhaari hain, isliye content apne aap chhupta hai.
- **Trade-off:**
  - (a) me tez jawab ka bojh, aur alert aur queue ka kaam.
  - (b) me kaam kam, par secondary sahi nikla to takrav.
  - (c) beech ka raasta; content wale samay bache rehte hain.
- **Kanooni detail:** 2026 ke saare samay sirf secondary source se (gazette nahi khula): aadha jaancha. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, naye samay abhi se (5 niyam). Record: [DECISIONS.md](DECISIONS.md) D-251.

### Q-190. Skin & Hair Expert: doctor ki seva ya beauty salah?

- **Status:** `Tay`. Topic: B11 (consultation), B13 (compliance).
- **Sawal:** D-025 me Skin & Hair Expert ek staff role hai jo Google Meet pe consultation deta hai. Ye doctor ki seva hai ya beauty salah, tay nahi. Kya ho?
- **Kyun zaroori:**
  - Telemedicine Practice Guidelines 2020 sirf registered medical practitioner (RMP) pe laagu hain: platform RMP ka registration jaanche aur dikhaye, aur dawa ke niyam maane.
  - "Expert" naam aur skin reaction ke maamle (D-130) me salah se customer ise doctor ki seva maan sakta hai.
  - Ilaaj jaise daawon pe claims ke niyam aur Drugs and Magic Remedies Act sakht hain.
- **Vikalp:**
  - **(a) Beauty aur skincare salah, medical nahi:**
    1. Koi nidaan ya dawa nahi.
    2. Booking, Meet ke email aur notes pe "Ye medical consultation nahi hai" ki line.
    3. Ilaaj ya dawa ke sawal pe "doctor se milein".
    4. Profile pe "doctor" ya "dermatologist" jaise shabd nahi; role ka naam jaisa hai.
  - **(b) Doctor (RMP) ki seva:** registration number ka field aur staff ki jaanch; profile pe naam aur registration; customer ki pehchaan aur consent; dawa ke niyam (Telemedicine guidelines); registration dummy (D-026).
- **Salah:** **(a)**. Doctor ki seva me licence, records aur zimmedari ka bada bojh hai, aur dummy registration pe doctor ki seva dikhana gumraah kar sakta hai. Sahi product aur routine ki salah (a) se poori hoti hai.
- **Trade-off:**
  - (a) me skin reaction jaise maamlon me salah seemit; customer ko doctor ke paas bhejna padta hai.
  - (b) asli medical seva, par telemedicine ke niyam, records aur zimmedari, aur dummy registration ka sawal.
- **Kanooni detail:** Telemedicine guidelines ka saar dekha, mool PDF nahi khula: aadha jaancha. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, beauty aur skincare salah, medical consultation nahi. Record: [DECISIONS.md](DECISIONS.md) D-252.

### Q-191. Privacy ka sampark aur CERT-In ka Point of Contact kaun?

- **Status:** `Tay`. Topic: B14 (security), B2 (roles), B13 (compliance).
- **Sawal:** DPDP aur CERT-In dono ek sampark wala insaan maangte hain. Ye kis role ke paas ho?
- **Kyun zaroori:**
  - DPDP Rules ka rule 9: personal data ke sawalon ka jawab dene wale insaan ka contact website pe, aur data ke haq ke har jawab me. (Significant Data Fiduciary na hon to Data Protection Officer zaroori nahi.)
  - CERT-In ke directions: har entity ka ek Point of Contact, jiska naam CERT-In ko diya jaata hai.
  - Dono abhi kisi role pe nahi. D-241: jo kaam apna role karta hai, uska role banta hai, aur jaankari us role wale staff account se aati hai.
- **Vikalp:**
  - **(a)** Privacy ka sampark = Grievance Officer ka role (D-237); CERT-In ka Point of Contact = ek naya "Security Contact" role, owner ke paas.
  - **(b)** Do naye role: "Privacy Contact" aur "Security Contact".
  - **(c)** Ek naya role dono ke liye: "Privacy & Security Contact".
- **Salah:** **(a)**. Customer ke liye shikayat aur privacy ka ek hi darwaza; CERT-In ka kaam technical hai, to security ke alerts usi role ke paas.
- **Trade-off:**
  - (a) me Grievance Officer pe privacy ke sawal bhi.
  - (b) me zyada roles aur owner ke zyada accounts (D-017).
  - (c) me privacy aur security ek role pe, par grievance alag reh jaata hai: customer ke do darwaze.
- **Kanooni detail:** rule 9 aur CERT-In ka Point of Contact public source se milaaye gaye; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, personal data ka sampark Grievance Officer, aur CERT-In ka Point of Contact naya Security Contact role. Record: [DECISIONS.md](DECISIONS.md) D-253.

### Q-192. Delivery partners ke kanooni sudhaar maanein?

- **Status:** `Tay`. Topic: B1 (delivery), B6 (payouts), B13 (compliance).
- **Sawal:** kanooni jaanch me delivery partners ke kuch sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **Social Security Code (D-033, D-104, D-134):** hum aggregator ki do shreniyon me aate hain ("Logistic services" aur "e-Market place"). D-134 ki table me "Gig workers" ki row; har partner pe portal ka number (dummy); roz ke kaam ka export (DUMMY); saal ke kaam ke din ki ginti; contribution ki provision ka hisaab, dar setting me, shuru hone ki tareekh notify hone tak band. (Code ka text jaancha; laagu hone ki tareekh, Rules 2026 aur state ke niyam sirf secondary: aadha jaancha.)
  2. **Partner payouts pe TDS (D-104):** partner ka PAN (encrypted), saal ka jod, seema paar hone pe kaat ka niyam settings me (CA se pakka), payout statement me TDS. (Aadha jaancha.)
  3. **Partner ka data (D-072, D-191):** Delivery app me partner ke liye data notice aur consent; location sirf "delivered" aur "fail" ke pal pe; lagatar tracking nahi, aur kabhi chahiye to alag consent. (Jaancha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me Delivery app aur payouts me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me partners ke kanooni kaam adhoore.
- **Kanooni detail:** har sudhaar ke saath uska status likha hai; CA aur lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-254.

### Q-193. Personal data ke chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B14 (security), B13 (compliance).
- **Sawal:** kanooni jaanch me personal data ke kuch chhote sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **Data notice (D-150):** sign-up pe alag "Data notice" (Privacy page se alag): har maqsad, kaunsa data, consent wapas lene ka link, data ke haq, aur Board ke paas shikayat ka raasta (DPDP rule 3). (Jaancha.)
  2. **Privacy page (D-150):** data kis desh me rehta hai (Singapore, D-058), processors ki shreniyan, aur data rakhne ka samay. (Jaancha.)
  3. **Terms (D-150):** rule 3(1)(b) ke mana content ki list; har 3 mahine in-app suchna ki niyam todne pe kya hota hai; shikayat ke jawab me Grievance Appellate Committee ka raasta. (Sirf secondary source: aadha jaancha.)
  4. **Data ke haq (D-151, R2):** nomination ka form aur record (DPDP s.14); data ke saar me kin ke saath data baanta: sellers (order ke hisaab se) aur processors ki shreniyan (s.11(1)(b)). (Jaancha.)
  5. **Ek insaan ke kai accounts (D-203):** notice aur Terms me "per-customer seemaayein aur galat istemaal ki rok" ek maqsad ki tarah; device cookie sirf isi kaam ke liye. (Aadha jaancha.)
  6. **Umar (D-038):** 18+ ki ghoshna ka tick consent record me; bachcha pata chale to account band aur data erase; lawyer se pakka. (Aadha jaancha.)
  7. **Aadhaar (D-216):** upload form pe "Aadhaar ki copy mat bhejein"; galti se aayi copy reject aur turant delete (Aadhaar Regulations ka reg. 6(5), 2025). (Jaancha.)
  8. **Processors (D-011, D-056 se D-058):** operations doc me processors ki list: kaun, kaunsa data, region, data terms ki link, delete ka tareeka; har ek ke saath contract (DPDP s.8(2)). (Jaancha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me pages, sign-up aur operations doc me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me DPDP ke chhote hisse adhoore.
- **Kanooni detail:** har sudhaar ke saath uska status likha hai; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-255.

### Q-194. Seller, warehouse aur payment ke chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B3 (catalog), B6 (payments), B1 (warehouse), B13 (compliance).
- **Sawal:** kanooni jaanch me seller, warehouse aur payment ke kuch chhote sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **Plastic EPR (D-045, D-134):** seller onboarding pe seller ka plastic EPR number, ya micro/small enterprise hone ki ghoshna (EPR guidelines ka clause 6.3: registered brand owner unregistered se len-den nahi karta); packaging ka master (shreni I se IV, wazan) aur har dispatch ka record; saal ka return (dummy). (Jaancha.)
  2. **Mana shabd (D-246):** Drugs and Magic Remedies Act ki Schedule ki haalatein (jaise breast ki banawat, motapa, lambai badhana, leucoderma, yaun kshamata) "mana shabdon" me alag hissa, har shabd ke saath Schedule ka number; seller content, description, Creator aur sponsored content sab pe. (Jaancha.)
  3. **Payment data ki jagah (D-058):** card aur UPI ka data sirf gateway ke paas; hamare paas sirf ids, rakam aur status; gateway se likhit pakka ki payment data India me rehta hai; asli business se pehle region dobara dekhne ki yaad COMPLIANCE me. D-058 nahi khulta. (Aadha jaancha.)
  4. **Sellers ka paisa (D-093):** ledger me sellers ka paisa liability ki tarah alag dikhe; seller agreement me payout ke din; lawyer se pakka. (Aadha jaancha.)
  5. **"Paisa kata, order nahi bana" (D-111):** us haalat ki screen aur email (bank ka samay, jaise UPI pe T+5); der se "captured" aaye to apne aap refund, sirf ek baar (idempotent). (Jaancha.)
  6. **Nasht karna (D-062):** expired ya toota maal sirf authorised handler se nasht; certificate of destruction batch ke record me; jalne wala maal alag. (Aadha jaancha.)
  7. **D-134 ki table me rows:** Fire Safety (provisional, final, renewal aur saal ka certificate), Shops and Establishments (seema state ke hisaab se), aur e-way bill ka number (sab dummy). (Aadha jaancha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me seller onboarding, catalog, finance aur warehouse me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me kanoon ke chhote hisse adhoore.
- **Kanooni detail:** har sudhaar ke saath uska status likha hai; lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-256.

### Q-195. COMPLIANCE batch 5: personal data ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B14 (security).
- **Sawal:** kanooni jaanch ke personal data wale hisse ki ye 17 rows [COMPLIANCE.md](COMPLIANCE.md) me ek naye hisse "Personal data" me aayein? Har row COMPLIANCE ke format me jaayegi (kanoon ya niyam, kis pe laagu, kis module me, system me kya chahiye, dummy kya hai, jaancha ya nahi), source ke link aur tareekh ke saath.
- **Kyun zaroori:**
  - Sign-up, account, support, logs aur backups ke design ko personal data ka ek tay kanooni aadhaar chahiye; QA ke tests bhi inhi se banenge.
  - Jahan kisi row se tay faisla badalta tha, wo pehle hi sawal ban ke tay ho gaya (D-248 se D-256); yahan sirf unka hawala hai.
- **Sources** (sab 2026-11-20 ko khole): P1 DPDP Act 2023 (sarkari site pe copy); P2 DPDP Rules 2025 (gazette ka text, doosri site pe copy); P3 PIB ka saar (17 Nov 2025); P4 Act ke laagu hone ki tareekhein (sirf secondary); P5 SPDI Rules 2011 (doosri site pe copy); P6 Aadhaar (Sharing of Information) Regulations (UIDAI).
- **Prastaavit rows:**
  1. **CL-088, abhi ka kanoon aur DPDP kab se:** DPDP Rules ka rule 4 (Consent Manager) 13 Nov 2026 se; baaki zyadatar rules aur Act ke s.3 se 17 lagbhag 13 May 2027 se. Tab tak IT Act s.43A aur SPDI Rules: sensitive data (password, financial jaankari, sehat) pe likhit consent, privacy policy, Grievance Officer aur ek mahine me hal, likha hua security program. Design shuru se DPDP ke hisaab se. Aadha jaancha (Act ki tareekhein sirf secondary).
  2. **CL-089, notice aur consent (s.5, s.6, rule 3):** har maqsad pe saaf consent, sirf zaroori data; alag Data notice (D-255); har consent ka record (notice ka version, samay, raasta, waapsi); waapsi utni hi aasaan jitna consent; data model baad me Consent Manager se jud sake. Notice ka text "DUMMY: lawyer se jaancha nahi" ke saath. Jaancha.
  3. **CL-090, sehat ka data (SPDI rule 3 aur 5, DPDP rule 6):** consultation notes, skin reaction case aur allergy profile; alag consent (D-165), encryption aur audit (D-207, D-208); marketing ya sujhaav me bina alag consent nahi. Jaancha.
  4. **CL-091, data ke haq (s.11 se s.14, rule 14):** D-151 ke haq; data ke saar me sellers aur processors ki shreniyan; nomination R2 (D-255); jawab 90 din ke andar. Jaancha.
  5. **CL-092, privacy ka sampark (s.8(9), rule 9):** Grievance Officer (D-253); contact privacy page pe aur haq ke har jawab me apne aap; jaankari role wale staff account se (D-241). Jaancha.
  6. **CL-093, data ka samay aur kanooni rok (s.8(7), rule 8(3), rule 6(1)(e)):** har data class ka samay (D-191 se D-194, D-208) aur kanooni rok (D-250): app se turant hatna, band encrypted store, sirf kanooni maang pe khulna, phir erase; photos aur video ka sirf record. Rule 8(1) ka 3 saal wala niyam sirf 2 crore se zyada users wale e-commerce pe. Tax records CL-021 me. Aadha jaancha (hamare data pe lagna vyakhya ka sawal).
  7. **CL-094, data leak ki suchna (rule 7):** D-248 ki teen ghadiyaan; user email aur in-app ka template; leak ka register; saal me ek abhyaas nakli event se, kisi sanstha ko asli ya nakli report nahi. Jaancha.
  8. **CL-095, Aadhaar (Aadhaar Regulations ka reg. 6):** Aadhaar nahi lena (SR-064); upload form pe saaf line, aur galti se aayi copy reject aur turant delete (D-255). Jaancha.
  9. **CL-096, staff ki pahunch (rule 6(1)(b), (c)):** pahunch pe control, logs aur review (D-201, SR-076); "poori jaankari dekhi" wale audit ki mahine ki review. Jaancha.
  10. **CL-097, device aur accounts ka jod:** DPDP me "legitimate interest" nahi; ye maqsad notice aur Terms me (D-255); device cookie sirf isi kaam ke liye; cookies pe alag kanoon nahi mila. Aadha jaancha.
  11. **CL-098, seller aur reviews ke saath data (s.8(3)(b), s.11(1)(b), s.6(1)):** sellers ko sirf zaroori data (D-143, D-226); review form pe "ye jaankari sabko dikhegi". Jaancha.
  12. **CL-099, demo site (s.3):** testers ka data asli maana jaata hai; unpe bhi wahi notice aur haq (D-133). Jaancha.
  13. **CL-100, privacy page (SPDI rule 4; DPDP rule 3, 9, 14):** kaunsa data, kyun, kab tak (kanooni rok samet), kis ke saath, kahan (Singapore), security ka saar, haq, sampark, Board, aur backups ki umar (D-150, D-255); "DUMMY: lawyer se jaancha nahi". Jaancha.
  14. **CL-101, marketing consent (s.6(1), s.6(4)):** D-141; opt-in aur opt-out ka record; push ki permission aur marketing consent alag. Jaancha.
  15. **CL-102, bachche aur 18+ (s.2(f), s.9, rule 10):** ghoshna ka tick, pehle se tick nahi, record me (D-038, D-255); bachcha pata chale to account band aur data erase; umar ke hisaab se ads nahi. Aadha jaancha (sirf ghoshna kaafi hai ya nahi, saaf nahi).
  16. **CL-103, Significant Data Fiduciary (s.10, rule 13):** sirf sarkar ki notification se; tab India me DPO, auditor aur saal ka audit. Abhi laagu nahi; COMPLIANCE ki nazar me. Aadha jaancha (notification na hona sirf search se).
  17. **CL-104, data processors (s.8(1), s.8(2), rule 6(1)(f), s.8(7)(b)):** processors ki list (D-255); naya provider is list ke bina nahi; processor se bhi erase. Jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me vyakhya ke kuch sawal (CL-093, CL-097, CL-102) lawyer ke liye khule rehte hain, jo design me option ki tarah rahenge.
  - (b) me har badlav ki ek line.
  - (c) me personal data ke design ka kanooni aadhaar baad me.
- **Kanooni detail:** har row ke saath uska status likha hai. Kuch sarkari sites (MeitY, India Code, eGazette) nahi khuli, isliye kuch sources doosri sites ki copies hain. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-258.

### Q-196. COMPLIANCE batch 6: IT Rules, CERT-In aur payments ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B14 (security), B6 (payments).
- **Sawal:** kanooni jaanch ke IT Rules, CERT-In aur payments wale hisse ki ye 7 rows [COMPLIANCE.md](COMPLIANCE.md) me teen naye hisson me aayein? Har row COMPLIANCE ke format me jaayegi, source ke link aur tareekh ke saath.
- **Kyun zaroori:**
  - Reviews ki moderation, logs, incident, checkout aur finance ke design ko ek tay kanooni aadhaar chahiye; QA ke tests bhi inhi se banenge.
  - Jahan kisi row se tay faisla badalta tha, wo pehle hi sawal ban ke tay ho gaya (D-248 se D-256); yahan sirf unka hawala hai.
- **Sources** (sab 2026-11-20 ko khole): U1 IT Rules 2021 ka consolidated text, 2023 tak (doosri site pe); U2 aur U3 IT Rules ke 2026 ke badlav pe lekh (secondary); C1 CERT-In ke directions (28 Apr 2022); C2 CERT-In ke FAQ (May 2022); C3 RBI ke payment data storage ke FAQ (2019); C4 RBI ki Payment Aggregators Master Direction (15 Sep 2025, 11 Nov 2026 tak ke badlav); R1 RBI ka TAT circular (20 Sep 2019); R2 RBI ke PPI FAQ (22 Nov 2022 tak); R3 RBI ka e-mandate framework (21 Apr 2026).
- **Prastaavit rows:**
  1. **CL-105, user content: niyam aur shikayat ke samay (IT Rules ka rule 3 aur 3A; IT Act s.79):** marketplace ko s.79 ki chhoot tabhi jab intermediary niyam maane. Terms me mana content ki list; har 3 mahine in-app suchna; D-251 ke samay; hataya content 180 din tak rakha jaaye (rule 3(1)(g)); registration data band hone ke 180 din baad tak (rule 3(1)(h), D-250); sarkari maang pe 72 ghante (rule 3(1)(j)); shikayat ke jawab me Grievance Appellate Committee ka raasta (30 din me appeal). Aadha jaancha (2026 ke samay sirf secondary).
  2. **CL-106, CERT-In (28 Apr 2022 ke directions):** ghadi NIC ya NPL se traceable NTP se (cloud ki time service chal sakti hai); data leak, unauthorised access aur e-commerce app pe hamle jaise incidents 6 ghante me CERT-In ko (D-248); Point of Contact = Security Contact role (D-253); saare systems ke logs 180 din (D-250); saare timestamps UTC. CERT-In ko koi test report nahi. Jaancha.
  3. **CL-107, data ki jagah (RBI ka payment data niyam, DPDP s.16, SPDI rule 7):** payment ka kam se kam data (ids, rakam, status, samay); card ya UPI ki jaankari kabhi hamare paas nahi; gateway se likhit pakka (D-256); privacy page pe data ki jagah (Singapore, D-058); India ke bahar data pe sarkar ki koi rok abhi nahi mili, nazar me. Aadha jaancha (RBI niyam ka merchant pe lagna vyakhya ka sawal).
  4. **CL-108, payment aggregator aur sellers ka paisa (RBI ki PA Master Direction):** marketplace payment aggregator (Razorpay) ka merchant hai; aggregator dekhe ki marketplace sirf onboarded sellers ke liye paisa le; refund usi raaste. Ledger me sellers ka paisa liability, seller agreement me payout ke din (D-081, D-256); baad me linked account (D-093). Aadha jaancha (marketplace ka khud aggregator na hona text ki padhai se).
  5. **CL-109, failed transaction, refund aur chargeback (RBI ka TAT circular, PA Direction):** paisa kata par merchant ko pakki suchna nahi to card aur UPI pe T+5 din me wapas, phir bank pe roz ₹100 ka harjana; "paisa kata, order nahi bana" ki screen aur email, der se "captured" pe apne aap refund (D-256); chargeback ka case aur saboot (D-072, D-191). Jaancha.
  6. **CL-110, gift card, points aur store credit (RBI ke PPI FAQ):** closed system PPI teesre ke liye payment nahi kar sakta; gift PPI ₹10,000 tak, reload aur cash-out nahi, validity kam se kam 1 saal, expiry issue pe. Gift card sirf RBI-authorised issuer se (D-249); points paise se khareede nahi jaate, cash ya transfer nahi (D-173); store credit aur wallet nahi (D-177). Aadha jaancha (marketplace pe lagna aur points ka darja vyakhya ka sawal).
  7. **CL-111, e-mandate (RBI ka 2026 ka e-mandate framework):** recurring payment abhi nahi (D-178), to abhi kuch nahi banta. Subscription kabhi aaye to: ₹15,000 tak bina extra authentication, 24 ghante pehle suchna, customer kabhi bhi band kare. Jaancha.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me vyakhya ke kuch sawal (CL-107, CL-108, CL-110) Lawyer agent ke liye khule rehte hain (D-257).
  - (b) me har badlav ki ek line.
  - (c) me logs, incident aur payments ke design ka kanooni aadhaar baad me.
- **Kanooni detail:** har row ke saath uska status likha hai. eGazette aur kuch sarkari sites nahi khuli, isliye IT Rules ke 2026 ke samay sirf secondary source se. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-259.

### Q-197. COMPLIANCE batch 7: gig partners, warehouse aur environment ki rows maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B1 (delivery aur warehouse), B6 (payouts).
- **Sawal:** kanooni jaanch ke gig delivery partners, warehouse, transport aur environment wale hisse ki ye 9 rows [COMPLIANCE.md](COMPLIANCE.md) me do naye hisson me aayein? Har row COMPLIANCE ke format me jaayegi, source ke link aur tareekh ke saath.
- **Kyun zaroori:**
  - Delivery app, partner payouts, warehouse, trips aur seller onboarding ke design ko ek tay kanooni aadhaar chahiye; QA ke tests bhi inhi se banenge.
  - Jahan kisi row se tay faisla badalta tha, wo pehle hi sawal ban ke tay ho gaya (D-254, D-256); yahan sirf unka hawala hai.
- **Sources** (sab 2026-11-20 ko khole): G1 Code on Social Security 2020 (doosri site pe copy); G2 PIB ka saar (22 Nov 2025); G3 Social Security (Central) Rules 2026 ka saar (secondary); G4 Maharashtra ke gig workers bill 2026 ka saar (secondary); G5 contractor ke TDS pe search (secondary); W1 Maharashtra Fire Act ka 2023 ka badlav; W2 Maharashtra Shops and Establishments ka 2025 ka bill (doosri site pe copy); W3 aur W4 Plastic Waste Management Rules ke 2022 (EPR guidelines) aur 2024 ke badlav; W5 e-way bill pe search (secondary); W6 Solid Waste Management Rules 2026 pe search (secondary); W7 Gas Cylinders Rules ki paribhasha pe search (secondary).
- **Prastaavit rows:**
  1. **CL-112, Social Security Code: aggregator (s.2(2), Seventh Schedule, s.113, s.114):** hum "Logistic services" aur "e-Market place" dono shreniyon me; workers ka registration; contribution saal ke turnover ka 1% se 2% (dar notify hona baaki), workers ko diye paise ke 5% se zyada nahi; shuru ki tareekh notify hogi. Rules 2026 (secondary): maujooda partners ki details 45 din me portal pe, naye roz; scheme ke liye 90 din (ek aggregator) ya 120 din (kai). System: D-254 ke kaam; partner ki kamaai se kaat ka likhit kaaran aur appeal (Maharashtra ke bill se, secondary); har state ki row. Portal pe kabhi upload nahi. Aadha jaancha.
  2. **CL-113, partner payouts pe TDS (Income-tax Act 2025 s.393(1), pehle s.194C):** individual ya HUF pe 1%, baaki pe 2%; seema ek payment ₹30,000 ya saal me ₹1,00,000. System: D-254. Dummy PAN, koi challan nahi. Aadha jaancha (sirf secondary; CA agent se pakka, D-257).
  3. **CL-114, partner ka data (DPDP):** notice aur consent partner pe bhi; employment wala "legitimate use" sirf employee ke liye, aur Code gig worker ko employee nahi maanta. System: D-254 (notice aur consent, location sirf "delivered" aur "fail" ke pal pe); photo sirf parcel ki; samay D-191 aur D-250. Jaancha.
  4. **CL-115, fire safety aur jalne wala maal (Maharashtra Fire Act, 2023 ka badlav):** storage buildings ki shreni; Provisional, Final aur Renewal Fire Safety Approval; saal me do baar (January aur July) licensed agency ka certificate (secondary). Aerosol: Gas Cylinders Rules ka "gas cylinder" 500 ml se bada dhaatu ka container (secondary), to aam chhote cans bahar dikhte hain. Petroleum Rules aur transport ke niyam nahi jaanche. System: warehouse aur hub ke record me approvals aur certificate ki tareekhein aur yaad (D-256); catalog me "flammable" flag; warehouse me alag rack; delivery bag me aise items ki ginti ki seema. Tareekhein aur numbers DUMMY. Aadha jaancha.
  5. **CL-116, Shops and Establishments (Maharashtra S&E Act 2017):** workers ki ginti se registration (s.6) ya intimation (s.7); 2025 ke Ordinance aur bill me seema 10 se 20 (bill pass hua ya nahi, pakka nahi). System: workers ki ginti; registration ya intimation ka number aur tareekh; seema setting me (D-256). Number DUMMY. Aadha jaancha.
  6. **CL-117, e-way bill:** inter-state ₹50,000 se zyada ki consignment; Maharashtra ke andar ₹1,00,000; ek e-way bill ek invoice ka; ek gaadi ke liye consolidated e-way bill (secondary). System: warehouse se hub ke trip (D-027) ke manifest me har invoice ki rakam; seema paar ho to e-way bill number ke bina dispatch nahi; trip pe consolidated number (D-256). Number DUMMY. Aadha jaancha (CA agent se pakka).
  7. **CL-118, plastic EPR (Plastic Waste Management Rules, 2022 aur 2024 ke badlav):** obligated entities me online platforms aur marketplaces samet brand owners, micro aur small enterprise chhod ke (clause 4(iii)); packaging ki shreniyan I se IV; CPCB portal pe registration; bina registration business nahi; unregistered se len-den nahi (clause 6.3); targets aur saal ka return. System: D-045 aur D-256 (seller ka EPR number ya micro/small ki ghoshna, iske bina seller live nahi; packaging master; har dispatch ka record; saal ka return). EPR numbers DUMMY. Jaancha.
  8. **CL-119, expired ya toote maal ko nasht karna (Solid Waste Management Rules 2026, 1 Apr 2026 se):** kachra chaar hisson me alag; "special care" waste; bulk waste generator ki alag zimmedari (secondary). System: D-062 aur D-256 (authorised handler, certificate of destruction batch ke record me, jalne wala alag). Handler aur certificate dummy. Aadha jaancha.
  9. **CL-120, e-waste (E-Waste (Management) Rules 2022):** EPR producer pe; laagu sirf agar kabhi beauty appliances (jaise hair dryer) bikein. System: catalog me "electrical appliance" ka flag; aisa product aane se pehle jaanch. Jaancha nahi.
- **Vikalp:**
  - **(a)** Rows jaisi hain waisi maanein.
  - **(b)** Maanein, par owner jo row badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me kai rows aadha jaancha (secondary sources); CA aur Lawyer agents ke liye kuch sawal khule (CL-113, CL-117, CL-112 ki tareekhein).
  - (b) me har badlav ki ek line.
  - (c) me Delivery app, warehouse aur seller onboarding ke kanooni hisse baad me.
- **Kanooni detail:** har row ke saath uska status likha hai. labour.gov.in, PESO aur eGazette jaisi sarkari sites nahi khuli, isliye kai rows secondary source pe. Lawyer aur CA se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, rows jaisi hain waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-260.

### Q-198. COMPLIANCE batch 8 (aakhri): sehat, AYUSH, IP aur contracts ki rows, aur chhote badlav maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B11 (consultation), B3 (catalog).
- **Sawal:** kanooni jaanch ke sehat, AYUSH, IP aur contracts wale hisse ki ye 8 rows [COMPLIANCE.md](COMPLIANCE.md) me do naye hisson me aayein, aur saath me COMPLIANCE ke teen chhote badlav? Har row COMPLIANCE ke format me jaayegi, source ke link aur tareekh ke saath.
- **Kyun zaroori:**
  - Consultation, catalog ki jaanch, seller agreement, Terms aur assets ke design ko ek tay kanooni aadhaar chahiye.
  - Isse kanooni jaanch ke doosre run ke saare nateeje docs me aa jaate hain (D-220 ka tareeka); jahan faisla badalna tha wo pehle hi tay ho gaya (D-248 se D-256).
- **Sources** (sab 2026-11-20 ko khole): H1 Drugs and Magic Remedies Act 1954 (sarkari site); H2 Telemedicine Practice Guidelines 2020 ka saar; H3 Drugs and Cosmetics Act aur Rules (CDSCO, 2016 tak ka text); H4 rule 170 pe khabrein (secondary); L1 Trade Marks Act 1999 ki s.30(3) (doosri site pe text); L2 IT Act ki s.10A pe search (secondary); L3 EU documents ke reuse ke niyam pe search (secondary); R2 RBI ke PPI FAQ (batch 6 ka source).
- **Prastaavit rows:**
  1. **CL-121, online consultation (Telemedicine Practice Guidelines 2020):** telemedicine sirf registered doctor (RMP) kar sakta hai; naam, qualification aur registration dikhana, patient ki pehchaan, consent, record, dawa sirf tay lists se; AI se salah ya dawa nahi. Hamari consultation beauty salah hai, medical nahi (D-252), isliye guidelines laagu nahi; "Ye medical consultation nahi hai" ki line aur ilaaj pe "doctor se milein". Aadha jaancha (saar dekha, mool PDF nahi khula).
  2. **CL-122, AYUSH drug ki pehchaan (Drugs and Cosmetics Rules ke rule 153 se 157 aur 161(3)):** AYUSH drug ka licence Form 25-D pe, aur label pe "Ayurvedic/Siddha/Unani medicine" aur "Mfg. Lic. No.". AYUSH drug listing pe nahi (D-128): label checklist me aise ishare pe listing reject. Rule 170 hata aur Supreme Court ka stay 11 Aug 2025 ko hata (secondary). Aadha jaancha (Rules ka text 2016 tak).
  3. **CL-123, Drugs and Magic Remedies Act (s.3, s.4, s.2(d)):** drug ke vigyapan me garbh, yaun kshamata, mahwari aur Schedule ki bimariyon (beauty se jude: breast ki banawat, leucoderma, motapa, lambai) ke ilaaj ka sujhaav mana; jhootha ya gumraah karne wala vigyapan mana; chhapne me hissa lena bhi. System: D-256 (mana shabdon ka alag hissa, Schedule ke number ke saath). Jaancha.
  4. **CL-124, trademark aur asli maal (Trade Marks Act s.30(3); IT Rules 3(1)(b)):** jaayaz tareeke se kharida maal aage bechna sirf isliye infringement nahi; nakli maal infringement hai; user agreement me IP todne wala content mana. System: brand authorisation (D-075); seller agreement me asli maal aur photos ke haq ki ghoshna; brand owner ke liye IP shikayat ki category. Authorisation letter dummy. Aadha jaancha.
  5. **CL-125, data aur assets ka license:** EU ke documents ka reuse aam taur pe ijazat ke saath, teesre ke IP ko chhod ke (secondary); CosIng ki apni shartein aur BIS standards ki shartein nahi jaanchi. System: license list (asset, license, link, attribution) ingredient master, blocklist, fonts, icons aur images ke liye; IS ki list ka text copy nahi, sirf hawala. Aadha jaancha.
  6. **CL-126, seller ka udhaar:** koi khaas kanoon nahi mila; ye seller agreement ki baat hai. System: D-071; seller agreement me kaat ka haq, notice, listings rokna, aur jhagde ka raasta. Jaancha nahi.
  7. **CL-127, apne brand ka trademark:** search nahi hui (bahar ki search me project ka naam nahi daala gaya). Kis pe: apne brand ki company (D-243). System: asli business se pehle trademark search (class 3) aur application, aur company naam ki uplabdhta; ye search owner kare, ya owner ki haan se. Jaancha nahi.
  8. **CL-128, electronic contract (IT Act s.10A):** electronic tareeke se bana contract sirf isliye unenforceable nahi; dono paksh baalig hon. Stamp duty nahi jaanchi. System: Terms aur seller agreement ka har version badla na ja sake; kisne, kab, kaunsa version maana, iska record; "maanta hoon" bina pehle tick ke (D-150). Aadha jaancha.
- **Chhote badlav:**
  1. **CL-081 (points ki expiry):** kanoon wala hissa bharna: RBI ke PPI niyam khareedi hui value pe hain; jo points paise se khareede na jaayein aur cash ya transfer na hon (D-173), wo inke bahar lagte hain (vyakhya, pakka nahi) [R2]. Expiry ka koi tay number kanoon me nahi; saaf jaankari ka niyam consumer kanoon se. Status "Aadha jaancha".
  2. **Naya hissa "Nazar":** cheezein jin pe nazar rakhni hai, tareekh aur row ke saath: DPDP Rules ki tareekhein (13 Nov 2026 aur lagbhag 13 May 2027); Significant Data Fiduciary ki notification; India ke bahar data pe koi rok (DPDP s.16); IT Rules ke 2026 ke badlav ka primary text; Social Security Code ki tareekh aur Maharashtra ka gig bill; Maharashtra Shops and Establishments ka bill; asli business se pehle hosting region (D-058, D-256); gift card ka issuer (D-249).
  3. **"Is file me kya aayega":** hisson ki list §1 se §12 aur "Nazar" ke saath poori.
- **Vikalp:**
  - **(a)** Rows aur chhote badlav jaise hain waise maanein.
  - **(b)** Maanein, par owner jo row ya badlav badle, wo badal ke.
  - **(c)** Ye batch abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me teen rows "jaancha nahi" rehti hain (CL-126, CL-127, aur e-waste wali CL-120), jo Lawyer agent ke liye khuli (D-257).
  - (b) me har badlav ki ek line.
  - (c) me kanooni jaanch ka doosra run docs me adhoora.
- **Kanooni detail:** har row ke saath uska status likha hai. Telemedicine guidelines aur Trade Marks Act ka PDF nahi khula, isliye kuch rows saar ya doosri site ke text pe. Lawyer se nahi jaancha (R-004).
- **Owner ka jawab (2026-11-20):** **(a)**, rows aur chhote badlav jaise the waise maane. Record: [DECISIONS.md](DECISIONS.md) D-261.

### Q-199. Delivery aur daawon ki photos aur video bhi "kanooni rok" me 1 saal?

- **Status:** `Tay`. Topic: B14 (security aur data), B13 (compliance), B1 (delivery).
- **Sawal:** D-250 niyam 4 me photos aur video apne samay pe mitte hain (D-191, D-192), aur kanooni rok me sirf unka record rehta hai. Project ke Lawyer (AI) ki raay: DPDP Rules ka rule 8(3) (lagbhag 13 May 2027 se) har processing ka personal data, sirf logs nahi, processing ke din se kam se kam 1 saal rakhne ko kehta hai. Kya ho?
- **Kyun zaroori:**
  - D-250 khud Lawyer ki raay pe dobara khulta hai.
  - Photos aur video sabse bhaari data hain, aur delivery photo me ghar aur log dikhte hain: jagah (R-006) aur privacy dono ka sawal.
- **Vikalp:**
  - **(a) 13 May 2027 (lagbhag) se photos aur video bhi rok me:** app se apne samay pe hi hatein (D-191, D-192 waise hi), par file encrypted band store me capture ke din se 1 saal; sirf kanooni maang pe khule (har pahunch audit me); phir apne aap erase. Jagah ka hisaab architecture me.
  - **(b) D-250 jaisa:** rok me sirf record; 2027 se kanoon se takrav ka jokhim maana.
  - **(c) (a) abhi se,** 2027 ka intezaar nahi.
- **Salah:** **(a)**. Kanoon ki tareekh se laagu, staff ko dikhne ka samay waisa hi chhota, aur file sirf kanooni maang pe khulti hai.
- **Trade-off:**
  - (a) me 2027 se media ki jagah ka kharcha badhta hai.
  - (b) me jagah bachti hai, par rule 8(3) ke text se mel nahi.
  - (c) me bina kanooni zaroorat ke abhi se jagah ka bojh.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay; rule 8(3) ka text saaf hai, par hamari photos aur video pe laagu hona vyakhya hai (Sambhav). "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, lagbhag 13 May 2027 se photos aur video bhi kanooni rok me, capture se 1 saal. Record: [DECISIONS.md](DECISIONS.md) D-262.

### Q-200. Kanoon ke khilaaf ilaaj ke daawe wale reviews

- **Status:** `Tay`. Topic: B8 (reviews), B13 (compliance).
- **Sawal:** D-146 niyam 4 me ilaaj jaise daawe wale reviews rehte hain, sabke upar ek note ke saath. Lawyer (AI) ki raay: Drugs and Magic Remedies Act ki Schedule ki haalaton (jaise leucoderma, motapa, breast ki banawat, lambai, yaun kshamata) ke ilaaj ka daawa karne wala review product page pe dikhana kanooni jokhim hai. Kya ho?
- **Kyun zaroori:**
  - DMR Act s.3 aise daawon ka prachaar mana karta hai, aur IT Rules ka rule 3(1)(b) kanoon ke khilaaf content na dikhane ko kehta hai.
  - Seller content pe ye shabd pehle se mana hain (D-256 niyam 2); review pe abhi nahi.
- **Vikalp:**
  - **(a) Sirf Schedule wale daawe chhupein:** aise review chhupein, wajah "kanoon ke khilaaf daawa" (D-146 niyam 1 ki list me nayi wajah), customer badal ke dobara bhej sake (D-146 niyam 6); baaki ilaaj jaise anubhav note ke saath rahein; aise review kabhi "top" ya prachaar me nahi.
  - **(b) D-146 jaisa:** sab reviews note ke saath rahein.
  - **(c) Har ilaaj jaisa daawa chhupe.**
- **Salah:** **(a)**. Sirf kanoon wala hissa chhupta hai; kadwi ya imaandaar raay nahi dabti (D-146 niyam 2).
- **Trade-off:**
  - (a) me mana shabdon ki jaanch review pe bhi, aur staff ki queue me thoda kaam.
  - (b) me kanooni jokhim.
  - (c) me bahut reviews chhupte, aur reviews dabane ka shak.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay (Sambhav). "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, sirf Schedule wale ilaaj ke daawe wale reviews chhupein, baaki note ke saath. Record: [DECISIONS.md](DECISIONS.md) D-263.

### Q-201. Legal pages ke badge pe kya likha ho?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** D-150 niyam 2 me har legal page pe "DUMMY: lawyer se jaancha nahi" badge hai. D-257 ke baad docs me AI Lawyer ka "Lawyer ne jaancha" aayega. Public site ke badge pe kya likha ho?
- **Kyun zaroori:** site padhne wala "lawyer" ko licensed lawyer samjhega; AI ke dekhne ke baad "lawyer ne jaancha" jaisa kuch likhna gumraah kar sakta hai (CPA s.2(28)).
- **Vikalp:**
  - **(a) Badge hamesha "DUMMY: kisi licensed lawyer ne nahi dekha":** AI Lawyer ka nishaan sirf docs me (COMPLIANCE jaisa), site pe nahi.
  - **(b) Badge "DUMMY: AI Lawyer ne dekha, licensed lawyer ne nahi".**
  - **(c) D-150 jaisa,** aur AI Lawyer ke dekhne ke baad badge hatao.
- **Salah:** **(a)**. Saaf aur gumraah nahi karta; padhne wale ko AI aur licensed ka farak samjhana nahi padta.
- **Trade-off:**
  - (a) me AI Lawyer ka kaam site pe nahi dikhta.
  - (b) me zyada jaankari, par phir bhi "dekha gaya" jaisa bharosa ban sakta hai.
  - (c) me gumraah karne ka jokhim.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay. "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, badge hamesha "DUMMY: kisi licensed lawyer ne nahi dekha", AI Lawyer ka nishaan sirf docs me. Record: [DECISIONS.md](DECISIONS.md) D-264.

### Q-202. Skin & Hair Expert aur Beauty Advisor ki qualification

- **Status:** `Tay`. Topic: B11 (consultation), B2 (roles).
- **Sawal:** in roles (D-025, D-252) ke liye koi qualification ki shart ho, aur wo profile pe dikhe?
- **Kyun zaroori:**
  - "Expert" kehna ek daawa hai; bina aadhaar ke ho to gumraah karne wala (CPA s.2(28)).
  - Ye apne staff roles hain, to galat salah ki zimmedari platform ki.
  - Beauty salah ke liye koi kanooni qualification nahi mili.
- **Vikalp:**
  - **(a) Koi shart nahi:** sirf "beauty salah, medical nahi" ki line (D-252).
  - **(b) Beauty ya cosmetology ka certificate zaroori:** staff jaanche, profile pe dikhe (dummy, D-026).
  - **(c) (b) + saal me ek training ka record.**
- **Salah:** **(b)**. "Expert" ka daawa sach aur jaanchne layak banta hai, aur kaam bas ek field aur ek jaanch ka.
- **Trade-off:**
  - (a) sabse aasaan, par "Expert" shabd kamzor.
  - (b) me ek field aur staff ki jaanch.
  - (c) me zyada record, akele owner pe bojh.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay; NMC Act ka hissa sirf secondary source se. "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(b)**, beauty ya cosmetology ka certificate zaroori, staff jaanche, profile pe dikhe. Record: [DECISIONS.md](DECISIONS.md) D-265.

### Q-203. Delivery partner ki azaadi aur exclusivity

- **Status:** `Tay`. Topic: B1 (delivery), B2 (roles).
- **Sawal:** delivery partner kaam ki offer chhod sake (bina saza), aur doosre platforms pe bhi kaam kar sake?
- **Kyun zaroori:** partner contractor hain (D-033). Lawyer (AI) ki raay: contractor bane rehna sabse zyada isi pe tika hai; control zyada ho to employee maane jaane ka jokhim (kasauti tathyon pe, Anishchit). Ye abhi kisi faisle me nahi.
- **Vikalp:**
  - **(a) Dono ki azaadi:** Delivery app me "offer maano ya chhodo"; chhodne pe saza nahi (sirf baar-baar maan ke chhodne pe); availability partner khud chune, koi fixed shift nahi; doosre platforms pe kaam ki rok nahi.
  - **(b) Offer chhodne ki azaadi, par hamare saath kaam ke ghanton me exclusivity.**
  - **(c) Tay shifts aur exclusivity.**
- **Salah:** **(a)**. Contractor ka rishta sabse mazboot, aur D-033, D-068, D-104 ke saath mel.
- **Trade-off:**
  - (a) me din ki planning kam pakki (partner mana kar sakte).
  - (b) beech ka raasta, par exclusivity control ka ishara.
  - (c) planning aasaan, par employment ka jokhim aur labour codes ka bojh.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay (Anishchit: tathyon pe tika). "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, offer chhodne aur doosre platforms pe kaam, dono ki azaadi. Record: [DECISIONS.md](DECISIONS.md) D-266.

### Q-204. Delivery partner ki gaadi aur insurance

- **Status:** `Tay`. Topic: B1 (delivery).
- **Sawal:** partner apni gaadi chalate hain (D-033). Delivery ke istemaal ka insurance kiski zimmedari ho?
- **Kyun zaroori:** private gaadi ki policy delivery ka claim mana kar sakti hai, aur private two-wheeler se commercial delivery ki kanooni halat saaf nahi (Lawyer (AI): Anishchit).
- **Vikalp:**
  - **(a) Partner ki zimmedari:** valid licence, RC aur aisa insurance jo delivery ka istemaal cover kare; onboarding pe number aur expiry (dummy); expiry pe kaam band.
  - **(b) (a) + platform ka group accident cover** (asli business pe kharcha).
  - **(c) Sirf cycle ya kam speed wale electric vahan.**
- **Salah:** **(a)** abhi (dummy, ₹0, D-028); asli business pe **(b)**.
- **Trade-off:**
  - (a) ₹0, par partner pe bojh.
  - (b) kharcha, par partner ki suraksha aur bharosa.
  - (c) kam jokhim, par door ke pincodes me dheema.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay; vahan ke niyam sirf secondary source se (Anishchit). "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, abhi partner ki zimmedari (dummy); asli business pe (b), platform ka group accident cover bhi. Record: [DECISIONS.md](DECISIONS.md) D-267.

### Q-205. Seller aur partner ke saath jhagde ka aakhri raasta

- **Status:** `Tay`. Topic: B11 (disputes), B6 (settlement).
- **Sawal:** platform ke andar ka dispute (D-164) na sulje, to aage kya? Ye seller agreement aur partner agreement ka clause hai.
- **Kyun zaroori:** bina tay raaste ke har jhagda court ke alag-alag raaste pe ja sakta hai; agreement me ek saaf clause chahiye.
- **Vikalp:**
  - **(a) Dono ke liye court:** `[CITY: DUMMY]` ke court.
  - **(b) Dono ke liye pehle mediation, phir arbitration:** ek arbitrator, seat `[CITY: DUMMY]`.
  - **(c) Sellers ke liye (b), partners ke liye (a).**
- **Salah:** **(c)**. Sellers ke bade jhagde mediation me jaldi sulajhte hain; partners ke chhote daawon pe arbitration ka kharcha bhaari hai.
- **Trade-off:**
  - (a) dheema, par sasta aur saaf.
  - (b) tez, par chhote daawon pe kharcha.
  - (c) do alag clauses.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay. "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(c)**, sellers ke liye pehle mediation phir arbitration, partners ke liye court. Record: [DECISIONS.md](DECISIONS.md) D-268.

### Q-206. Asli business pe sellers ke paise ka alag bank account

- **Status:** `Tay`. Topic: B6 (payments aur settlement).
- **Sawal:** asli business pe sellers ka paisa platform ke apne kharche wale account se alag bank account me rahe?
- **Kyun zaroori:** Lawyer (AI) ki raay: platform payment aggregator ka merchant hai, khud aggregator nahi; ledger me sellers ka paisa liability hai (D-256 niyam 4), par wo sirf hisaab hai. Platform doobe to sellers aam lenadaar ban jaate hain. Alag account se milaan aur bharosa saaf.
- **Vikalp:**
  - **(a) Ek hi current account,** ledger me alag (aaj jaisa).
  - **(b) Gateway ka settlement alag "seller settlement" account me,** payout usi se; design me ye khaata abhi se (test mode me dummy).
  - **(c) (b) + seller agreement me us account ka paisa sellers ke liye rakha hua maanne ka clause.**
- **Salah:** **(b)**. Roz ka milaan saaf, aur design me ek khaata abhi se ho to asli business pe badlav nahi.
- **Trade-off:**
  - (a) saral, par sellers ki suraksha kam.
  - (b) ek aur khaata aur roz ka milaan.
  - (c) sellers ki sabse zyada suraksha, par platform pe kanooni bandish.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay (Sambhav: RBI ka text ye seedhe nahi kehta). "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(b)**, alag "seller settlement" khaata, design me abhi se. Record: [DECISIONS.md](DECISIONS.md) D-269.

### Q-207. Seller agreement me platform ki zimmedari ki chhat

- **Status:** `Tay`. Topic: B6 (settlement), B13 (compliance).
- **Sawal:** seller ke saamne platform ki zimmedari ki koi chhat ho?
- **Kyun zaroori:** bina chhat ke ek bada daawa (jaise IP ya recall ka) platform ki kul fees se kai guna ho sakta hai. Customer ke kanooni haq pe koi chhat nahi lag sakti.
- **Vikalp:**
  - **(a) Koi chhat nahi.**
  - **(b) Pichhle 12 mahine me us seller se mili fees jitni:** D-063 ki bharpai, dhokha aur kanooni zimmedari is chhat ke bahar.
  - **(c) Ek tay rakam** (misaal).
- **Salah:** **(b)**. Santulit: seller ki bharpai (D-063) bachi rehti hai, aur platform ka jokhim uski kamaai se juda rehta hai.
- **Trade-off:**
  - (a) sellers ka bharosa, par platform pe bada jokhim.
  - (b) santulit, par chhat ka hisaab rakhna.
  - (c) saral, par chhote aur bade sellers pe barabar nahi baithti.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay. "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(b)**, pichhle 12 mahine me us seller se mili fees jitni chhat. Record: [DECISIONS.md](DECISIONS.md) D-270.

### Q-208. Lawyer (AI) ki report ke chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B3 (catalog), B6 (payments), B7 (returns), B10 (gift cards), B11 (consultation), B13 (compliance).
- **Sawal:** Lawyer (AI) ki report me kuch chhote sudhaar nikle. Inhe maanein?
- **Prastaavit sudhaar:**
  1. **Expert ki salah me related brand (D-025, D-252):** Skin & Hair Expert ya Beauty Advisor Unibelle ya kisi related seller ka product sujhaye, to uske saath ek tay label "related brand"; kisi brand ki taraf jhukav nahi (D-139 jaisa). (Sambhav.)
  2. **Appliances ka E-waste EPR (D-128 ki listing ki jaanch):** hair dryer, electric shaver jaise "electrical appliance" category pe seller ka E-waste EPR number (dummy), iske bina listing nahi; aisi listing se pehle BIS ke niyam bhi jaanchne hain. (Pakka.)
  3. **Apna brand (D-031):** Own-Brand Manager Unibelle ka har kaam sirf Unibelle ke seller account se, seller ke haq ke saath; platform ke haq se Unibelle ka content nahi badalta, aur doosre sellers ka data nahi dekhta. (Sambhav.)
  4. **Sellers ki list gateway ke liye (D-093):** sellers ki list aur KYC ka export (dummy), kyunki gateway marketplace ke sellers ki list maang sakta hai; gateway ki marketplace shartein asli business se pehle tathya ki tarah jaanchni hain. (Sambhav.)
  5. **Seller agreement me paisa (D-081, D-093):** platform seller ka "limited payment collection agent"; fees, kaat aur udhaar (D-071) ka set-off saaf likha. (Sambhav.)
  6. **Returns ki jaanch (D-112 niyam 1):** storage shart wale maal (jaise sunscreen, perfume) pe customer ke paas rehne ka check; shak ho to wapas bikne wala stock nahi. (Sambhav.)
  7. **Gift card ki expiry (D-249):** platform pe balance aur expiry dikhe; issuer chahe to expiry se 45 din pehle ki yaad hamari in-app aur email se (D-142 ki chhat me). (Pakka.)
  8. **FDI ki nazar (D-040, D-031, D-243):** COMPLIANCE §13 "Nazar" me ek row: foreign investment (D-040) khule to FDI ki e-commerce shartein dekhni hain (Unibelle me platform ya uski group company ki equity, sab sellers ko barabar fees, platform ke discount D-101, auditor ki saal ki report); seller record me "platform ya group ki equity %" ka field (dummy). (Pakka; Unibelle ka "group company" hona Anishchit.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo sudhaar badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me catalog, consultation, finance, returns aur seller agreement me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me kanoon ke chhote hisse adhoore.
- **Kanooni detail:** har sudhaar ke saath Lawyer (AI, D-257) ka bharosa likha hai. "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-271.

### Q-209. COMPLIANCE ki 18 rows pe Lawyer (AI) ki raay aur nishaan maanein?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** Lawyer (AI) ne [COMPLIANCE.md](COMPLIANCE.md) ki 18 rows dekhin (vyakhya wale, "jaancha nahi" aur design badalne wale points). Inki raay aur nishaan rows me aayein?
- **Prastaavit nishaan:**
  1. **Lawyer ne jaancha (2026-11-20), 4 rows:** CL-068 (product liability: platform product seller aur service provider), CL-093 (data ka samay; D-262), CL-108 (sellers ka paisa: platform gateway ka merchant), CL-120 (E-waste; D-271 niyam 2).
  2. **Lawyer ne aadha jaancha (2026-11-20), 11 rows,** har row me baaki hissa likha: CL-052 (lautaye cosmetics; storage check D-271), CL-058 (reviews me ilaaj ke daawe; D-263; Anishchit), CL-081 (points PPI nahi, jab tak paise se na bikein), CL-097 (device aur accounts ka jod), CL-102 (18+ ki ghoshna), CL-107 (data India me; region asli business se pehle), CL-110 (gift card issuer ke zariye; points CL-081 jaisa), CL-112 (Social Security Code; Rules aur state bill secondary), CL-121 (consultation; guidelines ka sirf saar), CL-124 (trademark aur asli maal), CL-126 (seller ka udhaar: contract ka maamla).
  3. **Lawyer ne nahi jaancha, 3 hisse:** CL-127 (apne brand ka trademark search owner kare), CL-021 ka income-tax hissa (CA agent ke liye), CL-048 ki IS ki list (standard ka text nahi khula; design pe asar nahi).
  4. Har row me Lawyer (AI) ki ek line ki raay; jahan D-262 se D-271 ne row badli, wahan "System me kya chahiye" us faisle ke hisaab se. COMPLIANCE ke "Is file me kya aayega" me "Lawyer ne aadha jaancha" ka matlab.
- **Vikalp:**
  - **(a)** Prastaav jaisa maanein.
  - **(b)** Sirf 4 "jaancha" wali rows pe nishaan; baaki rows waisi hi.
  - **(c)** Abhi roko.
- **Salah:** **(a)**. Har row me saaf dikhta hai kya pakka hua aur kya baaki, aur CA agent ko apna hissa milta hai.
- **Trade-off:**
  - (a) me 18 rows me chhote badlav.
  - (b) me "aadha" wali rows ki raay docs me nahi aati.
  - (c) me Lawyer ka kaam docs me adhoora.
- **Kanooni detail:** project ke Lawyer (AI, D-257) ki raay; owner ki haan ke baad hi rows me nishaan (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, prastaav jaisa maana: 4 rows "Lawyer ne jaancha", 11 "Lawyer ne aadha jaancha", 3 hisse "Lawyer ne nahi jaancha". Record: [DECISIONS.md](DECISIONS.md) D-272.

### Q-210. Lawyer (AI) ka documents ka dhaancha docs me kahan aaye?

- **Status:** `Tay`. Topic: B13 (compliance), B16 (docs aur dhaancha).
- **Sawal:** Lawyer (AI) ne 6 documents ka dhaancha diya: customer Terms of Use, Privacy Notice, Seller Agreement, Delivery Partner Agreement, Return aur Refund page, aur Grievance page. Har ek me clauses ki list, unka maqsad, aur wo kis D-xxx ya CL-xxx ko laagu karte hain, dummy placeholders ke saath (poore drafts nahi). Ye docs me kahan aur kaise aaye?
- **Kyun zaroori:**
  - D-150 me legal pages tay faislon se likhe jaate hain; dhaancha ek jagah ho to pages likhte waqt koi faisla chhootta nahi.
  - Seller aur partner agreement ke kuch clauses (jaise D-268, D-270, D-271 niyam 5) abhi kisi doc me ek jagah nahi.
  - Discovery khatam hone pe agents ki reports hat jaati hain (D-073), to dhaancha usse pehle naye docs me aana chahiye.
- **Vikalp:**
  - **(a) COMPLIANCE me naya §14 "Documents ka dhaancha":** har document ke clauses ki ek table (clause, maqsad, D-xxx ya CL-xxx), ek batch me owner ki haan se.
  - **(b) Naya doc `docs/LEGAL_DOCS.md`,** docs ke index me.
  - **(c) Abhi nahi:** pages likhte waqt (implementation) banana.
- **Salah:** **(a)**. Kanooni cheezein ek jagah, naye doc aur index ka kaam nahi, aur reports hatne se pehle dhaancha docs me.
- **Trade-off:**
  - (a) me COMPLIANCE lambi hoti hai.
  - (b) me ek aur doc aur index ka kaam.
  - (c) me dhaancha khone ka jokhim, aur pages likhte waqt dobara mehnat.
- **Kanooni detail:** dhaancha project ke Lawyer (AI, D-257) ka; sirf clauses, poore drafts nahi.
- **Owner ka jawab (2026-11-20):** **(a)**, COMPLIANCE me naya §14 "Documents ka dhaancha", ek batch me. Record: [DECISIONS.md](DECISIONS.md) D-273.

### Q-211. COMPLIANCE batch 9: documents ka dhaancha maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B16 (docs aur dhaancha).
- **Sawal:** Lawyer (AI) ka 6 documents ka dhaancha (kul 108 clauses) [COMPLIANCE.md](COMPLIANCE.md) ke naye §14 me jaisa prastaavit hai waisa aaye?
- **Prastaavit rows (har document ki ek table: clause, maqsad, D-xxx ya CL-xxx):**
  1. **Customer Terms of Use (25 clauses):** platform marketplace hai, maal seller ka (D-060); account aur sign-in; order, daam aur payment; delivery aur der se delivery (D-222); return, refund aur points; reviews aur mana content; jhagde aur shikayat ka raasta.
  2. **Privacy Notice (16 clauses):** har maqsad aur data; consent aur wapas lena; data ke haq; rakhne ka samay aur kanooni rok (D-250, D-262); processors aur data ka desh; data leak pe khabar (D-248); Privacy ka sampark.
  3. **Seller Agreement (26 clauses):** onboarding ke dastavez (EPR, licence, brand authorisation); asli maal aur photos ke haq; fees aur payout; "limited payment collection agent" aur set-off (D-271); alag "seller settlement" khaata (D-269); zimmedari ki chhat (D-270); Unibelle sirf apne seller account se (D-271); jhagde: pehle mediation, phir arbitration (D-268).
  4. **Delivery Partner Agreement (15 clauses):** contractor ka rishta; offer chhodne aur doosre platforms ki azaadi (D-266); licence, RC aur insurance (D-267); kamaai, kaat aur appeal (D-068, D-103); location aur photo ka data; jhagde ke liye court (D-268).
  5. **Return aur Refund page (14 clauses):** wajahein aur muddatein (D-079, D-221); band ka matlab; der se delivery (D-222); refund ka raasta aur samay; return ka kharcha.
  6. **Grievance page (12 clauses):** Grievance Officer aur nodal person (D-237); receipt aur hal ka samay; content ki shikayat (D-251); Grievance Appellate Committee ka raasta.
  7. Har document pe badge "DUMMY: kisi licensed lawyer ne nahi dekha" (D-264), version, laagu hone ki tareekh aur bade badlav pe naya consent (D-150). Placeholders dummy (D-026); apne roles ki jaankari role wale staff account se (D-241).
  8. Lawyer ka dhaancha D-262 se D-272 se pehle bana tha; uske clauses in faislon ke hisaab se sudhar ke aate hain (jaise D-266 se D-271 ke hawale).
- **Vikalp:**
  - **(a)** Rows jaisi prastaavit hain waisi maanein.
  - **(b)** Maanein, par owner jo clause badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**. Saare tay faisle ek dhaanche me, aur pages (D-150) isi se likhe jaate hain.
- **Trade-off:**
  - (a) me COMPLIANCE me 108 clauses ki 6 tables.
  - (b) me har badlav ki ek line.
  - (c) me dhaancha agents ki report me hi, jo discovery ke baad hat jayegi (D-073).
- **Kanooni detail:** dhaancha project ke Lawyer (AI, D-257) ka; "Lawyer ne jaancha" ka nishaan owner ki haan ke baad (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, 6 documents ka dhaancha jaisa prastaavit tha waisa maana. Record: [DECISIONS.md](DECISIONS.md) D-274.

### Q-212. Fulfilment fee: ek line ya do hisse?

- **Status:** `Tay`. Topic: B6 (payments, settlement aur ledger).
- **Sawal:** D-078 ki fulfilment fee me rakhna, pack aur delivery teeno hain. Seller ke fees invoice pe ye ek line rahe ya do hisse?
- **Kyun zaroori:** 1 Nov 2026 se e-commerce operator ke zariye bike maal ki delivery seva pe 5% GST hai, bina input tax credit (ITC). Ek line me poori fee ka rate tay karna mushkil hai, aur delivery ke kharchon ka ITC rukta hai.
- **Vikalp:**
  - **(a)** Do lines: "handling (pick aur pack)" 18% aur "delivery" 5% bina ITC, dono per unit; jod wahi (misaal ₹25).
  - **(b)** Ek line, poori fee 18%, delivery ko handling ka hissa maan ke.
  - **(c)** Ek line, poori fee 5% bina ITC, delivery ko mukhya maan ke.
- **Salah:** **(a)**. Har hissa apne sahi rate pe, aur jhagde ka jokhim kam.
- **Trade-off:**
  - (a) me rate table me do rows aur seller ke invoice pe do lines.
  - (b) saral, par delivery ka hissa galat rate pe hone ka jokhim.
  - (c) saral, par warehouse aur packing ke kharchon ka ITC bhi ruk sakta hai.
- **Tax detail:** CA (AI, D-257) ki raay; delivery seva ka rate notification ki doosri site pe rakhi copy se padha.
- **Owner ka jawab (2026-11-20):** **(a)**, fee do lines me (handling 18%, delivery 5% bina ITC). Record: [DECISIONS.md](DECISIONS.md) D-275.

### Q-213. Hamare haath se hue nuksaan ki bharpai: GST ke bina value pe ya GST samet?

- **Status:** `Tay`. Topic: B6 (settlement), B1 (warehouse).
- **Sawal:** D-063 me bharpai "bikne wale daam" pe hai, aur wo daam GST samet hai. Bharpai GST ke bina wali value pe ho ya GST samet?
- **Kyun zaroori:** bikne pe seller ko GST ke bina wali value bachti hai (GST sarkar ko jaata hai). Kho gaye maal pe seller ka GST nahi lagta, to GST samet bharpai seller ko bikri se zyada deti hai.
- **Vikalp:**
  - **(a)** GST ke bina wali value, commission aur fees ghata ke.
  - **(b)** GST samet daam, commission aur fees ghata ke.
  - **(c)** (a), aur upar se seller ke ITC ulatne ka andaaza (jaise value ka tay %).
- **Salah:** **(a)**, saath me ek niyam: bharpai seller ke statement me ek net line, uspe fees ka alag invoice nahi.
- **Trade-off:**
  - (a) "bikne jitna" ke sabse kareeb aur hamara kharcha kam; seller ka apna ITC ulatna uska nuksaan rehta hai.
  - (b) seller ke liye achha, par 18% wale item pe bikri se lagbhag 18% zyada.
  - (c) sabse barabar, par andaaza aur uski jaanch ka kaam.
- **Tax detail:** CA (AI, D-257) ki raay: bharpai pe GST, TCS aur TDS nahi; CA ne aadha jaancha.
- **Owner ka jawab (2026-11-20):** **(a)**, GST ke bina wali value pe, fees ghata ke, ek net line. Record: [DECISIONS.md](DECISIONS.md) D-276.

### Q-214. Return pe platform ki fees seller ko wapas ho ya nahi?

- **Status:** `Tay`. Topic: B6 (settlement), B7 (returns).
- **Sawal:** lauti line pe platform ka commission aur fulfilment fee seller ko wapas ho ya nahi?
- **Kyun zaroori:** D-078 me ye tay nahi. Fees ka invoice, credit note aur seller ka statement isi pe tike hain.
- **Vikalp:**
  - **(a)** Commission wapas, fulfilment fee nahi (kaam ho chuka).
  - **(b)** Dono wapas.
  - **(c)** Koi wapas nahi.
  - **(d)** Return ki wajah (D-079) ke hisaab se, D-112 jaisa: hamari galti pe dono wapas; brand ki galti pe koi nahi; customer ka man badla to commission wapas, fulfilment fee nahi.
- **Salah:** **(d)**, ek sudhaar ke saath: der se delivery hamari apni delivery ki wajah se hoti hai, to use hamari galti me gina jaaye (dono wapas). Nuksaan usi pe jiski galti, aur wajah pehle se record hoti hai.
- **Trade-off:**
  - (d) me niyam ke teen raaste.
  - (a) saral, par hamari galti pe bhi seller fulfilment ka paisa deta hai.
  - (b) platform ka kharcha zyada.
  - (c) bina bikri ke commission, seller ke liye kadwa.
- **Tax detail:** wapas hui fees pe platform ka credit note (CA, D-257).
- **Owner ka jawab (2026-11-20):** **(d)**, wajah ke hisaab se, der se delivery hamari galti me. Record: [DECISIONS.md](DECISIONS.md) D-277.

### Q-215. Combo aur shart wale gift ka invoice kaise bane?

- **Status:** `Tay`. Topic: B4 (bundles aur kits), B6.
- **Sawal:** combo (alag cheezein ek daam pe) aur shart wala gift ("X kharido to Y free") ka invoice kaise bane?
- **Kyun zaroori:** D-228 aur D-229 ne ise R2 se pehle CA aur owner pe chhoda. Farak tab padta hai jab cheezon ke GST rate alag hon (jaise 5% wala shampoo aur 18% wala conditioner).
- **Vikalp:**
  - **(a)** Ek daam = mixed supply: poore combo pe sabse zyada rate.
  - **(b)** Har cheez apne daam pe (jo site pe alag se bhi bikti ho), combo ki chhoot har line pe anupaat me, har line apne rate pe.
- **Salah:** **(b)**, is shart ke saath ki har cheez site pe alag se bhi bikti ho aur invoice pe har line ka daam aur chhoot dikhe; jo cheez alag se nahi bikti, us combo pe (a).
- **Trade-off:**
  - (a) saral aur sabse kam jhagda, par kam rate wali cheez pe zyada tax.
  - (b) kam tax aur D-088 ke return niyam (ek cheez ka refund) se mel, par "ek daam" ka tark tax vibhag uthaye to farak ka jokhim.
- **Tax detail:** kit ka sabse zyada rate wala niyam CA ne jaancha; shart wale gift ka tareeka CA ne aadha jaancha (D-257).
- **Owner ka jawab (2026-11-20):** **(b)**, shart ke saath. Record: [DECISIONS.md](DECISIONS.md) D-278.

### Q-216. GSTIN wale orders pe platform ke offers aur points chalein?

- **Status:** `Tay`. Topic: B4 (promotions), B6.
- **Sawal:** business customer (GSTIN wala invoice) ke order pe platform ke offers aur points lagein ya nahi?
- **Kyun zaroori:** platform ka diya hissa seller ki bikri ki value me judta hai, to business customer ke invoice pe poore daam ka GST aata hai jabki usne kam diya; uske ITC pe sawal uth sakta hai.
- **Vikalp:**
  - **(a)** GSTIN wale orders pe platform ke offers aur points nahi; sirf brand ke offers.
  - **(b)** Chalein, invoice pe "Platform offer" ki saaf line ke saath.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) business customers ko platform ke offers nahi milte.
  - (b) offers sab ko, par business customer ke ITC pe jhagde ka jokhim.
- **Tax detail:** CA (AI, D-257) ki raay; CA ne aadha jaancha.
- **Owner ka jawab (2026-11-20):** **(a)**, GSTIN wale orders pe sirf brand ke offers. Record: [DECISIONS.md](DECISIONS.md) D-279.

### Q-217. CA (AI) ke jod tay faislon me maanein?

- **Status:** `Tay`. Topic: B6 (payments aur ledger), B1 (warehouse), B13 (compliance).
- **Sawal:** CA (AI) ki report me tay faislon ke liye kuch jod nikle; koi faisla palat-ta nahi. Inhe maanein?
- **Prastaavit jod:**
  1. **Delivery fee (D-107):** platform ka apna B2C invoice, SAC 996813, 1 Nov 2026 se 5% bina ITC; delivery ke kharchon ka ITC ulatna; prepaid order pe fee ka invoice payment capture ke pal. (CA ne jaancha; capture ka pal aadha.)
  2. **Sellers ka TDS (D-081):** GST ke bina rakam pe, pehle credit (invoice) ke pal; return pe usi seller ki usi financial year ki agli bikri me adjust, saal badle to nahi; replacement pe nahi. (Aadha: naye Income-tax Act ke section aur forms secondary source se.)
  3. **Replacement (D-122):** bina keemat ka replacement, delivery challan ke saath. (Aadha.)
  4. **Records ka samay (D-225, D-227):** do classes: platform ke apne books 8 financial years (Companies Act), sellers ke tax documents 72 mahine (misaal). (Aadha.)
  5. **Books ka backup India me (D-256):** asli business se pehle region dobara dekhte waqt company ke electronic books ka roz backup India ke server pe aur audit trail bhi; dummy books pe abhi asar nahi. (Aadha.)
  6. **Chargeback (D-095):** seller ki galti wale chargeback pe seller ka credit note; platform wale (fraud, delivery) pe credit note nahi, nuksaan platform ka kharcha; gateway ki kati rakam usi din Operating khaate se top-up.
  7. **Seller settlement khaata (D-269):** gateway fees aur platform offer ka top-up Operating khaate se; platform ke kharche kabhi Settlement khaate se nahi; roz ka milaan. (CA ne jaancha.)
  8. **Doosre state se stock (D-096):** ASN me seller ka IGST invoice ya delivery challan aur e-way bill ka number; receiving pe ye document. (Aadha.)
  9. **Partners ka TDS (D-254):** sahi entry (1% ya 2%), saal ki seema paar hone pe poore saal ka catch-up, TDS kaat se pehle ki kamaai pe; nuksaan ki vasooli pe GST nahi. (Aadha.)
- **Vikalp:**
  - **(a)** List jaisi hai waisi maanein.
  - **(b)** Maanein, par owner jo jod badle, wo badal ke.
  - **(c)** Abhi roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me finance, invoice aur warehouse me chhote kaam.
  - (b) me har badlav ki ek line.
  - (c) me tax ke chhote hisse adhoore.
- **Tax detail:** har jod ke saath CA (AI, D-257) ka bharosa likha hai.
- **Owner ka jawab (2026-11-20):** **(a)**, list jaisi hai waisi maani. Record: [DECISIONS.md](DECISIONS.md) D-280.

### Q-218. CA (AI) ki raay aur badlav COMPLIANCE me maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B6 (payments aur ledger).
- **Sawal:** CA (AI) ne [COMPLIANCE.md](COMPLIANCE.md) ki 32 rows dekhin, 20 rows me badlav aur 8 nayi rows prastaavit kin. Ye COMPLIANCE me aayein?
- **Prastaav:**
  1. **CA ke nishaan, 32 rows** (har row me ek line ki raay): `CA ne jaancha` 8 (CL-003, CL-010, CL-012, CL-013, CL-019, CL-022, CL-023, CL-024); `CA ne aadha jaancha` 22 (CL-001, CL-002, CL-004 se CL-009, CL-011, CL-014 se CL-018, CL-020, CL-021, CL-108, CL-109, CL-110, CL-113, CL-117, CL-126); `CA ne nahi jaancha` 2 (CL-112, CL-128).
  2. **20 rows me badlav,** D-275 se D-280 ke hisaab se: CL-005, CL-006, CL-007, CL-008, CL-011, CL-012, CL-013, CL-014, CL-015, CL-016, CL-017, CL-019, CL-021, CL-022, CL-108, CL-109, CL-110, CL-113, CL-117, CL-126.
  3. **Nayi rows CL-129 se CL-136** (§1.1): return fee ka invoice aur delivery fee ki wapsi, Nil maal ka bill of supply, company ke books (8 saal, audit trail, India me backup), delivery seva pe ITC ki rok, seller ka inbound maal (invoice, challan, e-way bill), hamari fees pe seller ka TDS, transporter ka GTA aur RCM, platform ke tax returns aur statements.
  4. **Baaki:** §13 "Nazar" me 4 rows (books ka India me backup, s.9(5) ka aage ka badlav, CBDT ke naye circulars, stamp duty); §14 me Seller Agreement clause 10 aur 13 aur Partner Agreement clause 9 ke tax hisse; §1.0 me naye sources T11 se T27.
- **Vikalp:**
  - **(a)** Prastaav jaisa maanein.
  - **(b)** Sirf nishaan; badlav aur nayi rows baad me.
  - **(c)** Abhi roko.
- **Salah:** **(a)**. Tax rows me saaf dikhta hai kya pakka hua aur kya baaki, aur D-275 se D-280 ke faisle rows tak pahunchte hain.
- **Trade-off:**
  - (a) me COMPLIANCE ki kai rows me badlav.
  - (b) me rows tay faislon se peeche.
  - (c) me CA ka kaam docs me adhoora.
- **Tax detail:** project ke CA (AI, D-257) ki raay; nishaan owner ki haan ke baad hi (D-257).
- **Owner ka jawab (2026-11-20):** **(a)**, prastaav jaisa maana. Record: [DECISIONS.md](DECISIONS.md) D-281.

### Q-219. CA (AI) ke ledger, invoice aur statements ke niyam docs me kahan aayein?

- **Status:** `Tay`. Topic: B6 (payments, settlement aur ledger), B15 (technical).
- **Sawal:** CA (AI) ne platform ke books ke niyam diye: double-entry ledger, chart of accounts, har ghatna ki entry, seller settlement khaate ke niyam, kaun kya document jaari kare, numbering, rounding, statements aur milaan. Ye docs me kahan aayein?
- **Kyun zaroori:** ye niyam kai services ko chhoote hain (orders invoice banate, payments capture karte, warehouse dispatch karta), aur Database Architect inhi pe finance ka data model banayega. Agent ki report discovery ke baad hat jaati hai (D-073), to niyam naye docs me hone chahiye.
- **Vikalp:**
  - **(a)** [ARCHITECTURE.md](ARCHITECTURE.md) me naya hissa "Finance ke accounting niyam".
  - **(b)** [COMPLIANCE.md](COMPLIANCE.md) me naya hissa.
  - **(c)** Planning stage me finance module ki `TASK.md` tak report me hi rakhna.
- **Salah:** **(a)**. Ye poore system ke finance ka dhaancha hai, kanoon ki row nahi; aur aage ke architecture aur database ke agents isi file pe kaam karte hain.
- **Trade-off:**
  - (a) me ARCHITECTURE ka pehla hissa finance ka, baaki system ke hisse baad me.
  - (b) COMPLIANCE kanoon ki rows ka matrix hai; ledger ka dhaancha wahan fit nahi hota.
  - (c) me niyam naye docs ke bahar, aur report hatne ka jokhim.
- **Tax detail:** CA (AI, D-257) ki raay; D-275 se D-281 ke saath milaa ke (jaise fulfilment fee ke do hisse, misaal me bhi).
- **Owner ka jawab (2026-11-20):** **(a)**, ARCHITECTURE me naya hissa. Record: [DECISIONS.md](DECISIONS.md) D-282.

### Q-220. Design ka scale target kitna maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** code, indexes, pagination, data ka archive aur load tests kis scale ke liye banein: kitne customers, din me kitne orders, kitne sellers aur variants?
- **Kyun zaroori:**
  - Design asli users maan ke hai (D-012), par "kitne users" kahin likha nahi. Isi se tay hota hai ki kaunse indexes, archive, pagination aur load tests chahiye.
  - ₹0 pe asli seema isse kaafi kam hai (din ke 300 emails se lagbhag 100 orders, D-028). Target sirf code aur tests ke liye hai, hosting ke liye nahi.
- **Vikalp:**
  - **(a) Chhota:** 10,000 customers, 100 orders/din (sale ke din 3 guna), 50 sellers, 5,000 variants, 20 staff.
  - **(b) Madhyam:** 1 lakh customers, 1,000 orders/din (sale ke din 5 guna), 500 sellers, 50,000 variants, 100 staff, 50 delivery partners.
  - **(c) Bada:** 10 lakh customers, 10,000 orders/din, 5,000 sellers, 5 lakh variants.
- **Salah:** **(b)**. Asli marketplace ki shuruaat jaisa. MongoDB aur PostgreSQL ke ek-ek server pe aaram se fit hota hai, to code me sharding ya alag search cluster jaisa bojh nahi, aur laptop pe Docker me load test ho sakta hai.
- **Trade-off:**
  - (a) me code jaldi, par "asli jaisa" kamzor: bade din pe kya toote, pata nahi chalta.
  - (b) me har list ka pagination, har query ka index, data ka archive aur 5 guna peak ka load test.
  - (c) me sharding, alag search aur queue ka dhaancha: ek insaan ki capacity (D-009) pe bahut bhaari.
- **Owner ka jawab (2026-11-20):** **(b)**, madhyam: 1 lakh customers, 1,000 orders/din (sale ke din 5 guna), 500 sellers, 50,000 variants, 100 staff, 50 delivery partners. Record: [DECISIONS.md](DECISIONS.md) D-283.

### Q-221. Photos, dastavez aur video kahan rakhein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security). Group G22.
- **Sawal:** product images, review aur daawe ki photos, delivery ka saboot, KYC dastavez, PDFs aur exports kis provider pe hon?
- **Kyun zaroori:**
  - Files database me nahi rakhte (D-155, R-006).
  - Har image ko dobara encode karna aur EXIF hatana zaroori hai (SR-061). Ye server pe ho to 512 MB me memory bahut kam bachti hai (R-007), aur free server ke kam CPU pe ek photo kai second leti hai.
  - Private files ko chhote samay wala signed URL chahiye (SR-062).
- **Vikalp:**
  - **(a) Managed media service (misaal Cloudinary ka free plan):** upload seedha provider pe; dobara encode aur EXIF hatana provider pe; public images CDN se; private files chhote samay wale URL se; video bhi.
  - **(b) S3 jaisa object storage (misaal Backblaze B2 ya Cloudflare R2 ka free hissa):** upload seedha; dobara encode server pe, ek-ek karke; delivery apne signed URL se.
  - **(c) Dono:** public aur review images (a) pe; private dastavez, kanooni rok wali files aur logs ki files (b) pe.
- **Salah:** **(a)**, is shart ke saath ki free plan pe private file ka samay wala URL chale, rakhi hui copy me EXIF na rahe, aur file type aur size ki rok lage (jaanch §2 me). Jaanch fail ho to **(c)**.
- **Trade-off:**
  - (a) me ek processor aur ek account, aur server pe image ka koi kaam nahi; par free credits (storage, bandwidth aur transformations saath me) khatam ho sakte hain, aur data shayad India ke bahar.
  - (b) me storage zyada muft, par server pe CPU aur memory ka bojh (R-007), dobara encode hui photo ka upload Render ki mahine ki bandwidth me ginta hai, aur provider card maang sakta hai (jaancha nahi).
  - (c) me dono ke faayde, par do accounts, do keys aur do processors.
- **Kanooni detail:** provider naya data processor hai (CL-104), aur data ki jagah privacy page pe aati hai (CL-107). Data India ke bahar ho to uska asar Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-20):** **(a)**, managed media service, upar ki shart ke saath; shart ki jaanch fail ho to (c). Record: [DECISIONS.md](DECISIONS.md) D-284.

### Q-222. 180 din ke request logs kahan rakhein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security). Group G22.
- **Sawal:** CERT-In ke 180 din ke request logs (aur 2027 se 1 saal; D-250 niyam 5, CL-106) kis store me hon?
- **Kyun zaroori:**
  - Render ki free service ke apne logs kitne din rehte hain, ye pakka nahi (jaanch §2 me).
  - Owner akela bhi din me hazaaron requests banata hai (apps ki polling, server jagane ke pings).
  - Log ki ek line lagbhag 350 bytes hai. Bina dabaaye 0.5 GB me 180 din ke liye sirf lagbhag 5,000 requests/din aate hain; gzip ke chunks me ek line lagbhag 40 bytes.
- **Vikalp:**
  - **(a) Audit ke cluster me** gzip chunks (misaal har minute ek document): naya kuch nahi, par audit ke 2 saal (D-194) aur security events ke saath 0.5 GB baantna. Logs ko misaal 150 MB, yaani 1 saal ke liye lagbhag 10,000 requests/din.
  - **(b) Alag chhoti "logs" service, apne Atlas cluster ke saath**, wahi gzip chunks: 0.5 GB sirf logs ke liye, yaani 180 din ke liye lagbhag 60,000 requests/din, 1 saal ke liye lagbhag 30,000.
  - **(c) Media provider (D-284) ki private files me** roz ki gzip files: sabse zyada jagah, par provider ke credits aur Render ki bandwidth me ginti, aur incident me file download karke dekhna.
- **Salah:** **(b)**. ₹0, naya processor nahi (Atlas pehle se), audit se alag (logs me IP jaisa personal data hai, audit ki chain alag), aur jhagde ya incident me samay ke hisaab se seedhi query.
- **Trade-off:**
  - (a) sabse kam kaam, par audit aur logs ek doosre ki jagah khaate hain.
  - (b) me ek aur Atlas project aur DB user (D-011 jaisa), aur process me ek aur DB client.
  - (c) me jagah zyada, par query mushkil aur media provider pe nirbhar.
- **Owner ka jawab (2026-11-20):** **(b)**, alag chhoti logs service, apne Atlas cluster me gzip chunks. Record: [DECISIONS.md](DECISIONS.md) D-285.

### Q-223. Errors ka pata kaise chale?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** server aur 11 apps ki errors owner tak kaise pahunchein?
- **Kyun zaroori:**
  - Free tier pe logs aur alerts seemit hain (R-024).
  - Apps ki errors browser me hoti hain; bina intezaam ke wo kabhi nahi dikhtin.
  - Bahar ki service naya processor hai (CL-104), data bahar jaata hai, aur page pe bahar ki script ki rok hai (SR-006).
- **Vikalp:**
  - **(a) Apna chhota intezaam:** server ki errors logs me fingerprint ke saath; apps ki errors ek rate-limited route pe (bina personal data, size ki seema ke saath); Master app ke ops inbox me nayi error pe khabar aur roz ka saar.
  - **(b) Bahar ki error service ka free plan (misaal Sentry):** stack, source maps aur grouping tayyar; scrubbing ka config; CSP me uska host.
  - **(c) Sirf logs:** koi khabar nahi; owner khud logs dekhe.
- **Salah:** **(a)**. D-157 aur SR-006 ki soch se mel (data bahar nahi, page pe bahar ka kuch nahi), naya account nahi, aur logs ka store (D-285) pehle se ban raha hai.
- **Trade-off:**
  - (a) me thoda apna code, aur grouping ki suvidha kam.
  - (b) me tayyar tool, par free quota poore organization ka saajha, data bahar, ek aur processor, aur privacy page pe ek aur naam.
  - (c) me koi kaam nahi, par toota flow kai din tak chhupa reh sakta hai.
- **Owner ka jawab (2026-11-20):** **(a)**, apna chhota intezaam: logs me fingerprint, apps ki errors ek rate-limited route pe, aur Master ke ops inbox me khabar aur roz ka saar. Record: [DECISIONS.md](DECISIONS.md) D-286.

### Q-224. Emails kis provider se jaayein?

- **Status:** `Tay`. Topic: B15 (technical), B11 (notifications).
- **Sawal:** OTP aur baaki emails kis email provider ke HTTPS API se jaayein?
- **Kyun zaroori:**
  - Din ke 300 emails (D-028) aur domain na hone (R-005) ka niyam provider pe tika hai.
  - Render ke docs ke hisaab se free service pe SMTP ke ports band hain (2026-11-20), to sirf HTTPS API.
  - Provider data processor hai (CL-104), aur bheje emails ki copy uske dashboard me reh sakti hai (§2).
- **Vikalp:**
  - **(a) Brevo free:** din ke 300, bina domain ek verified sender, HTTPS API.
  - **(b) Mailjet free:** din ki seema kam (misaal 200; jaanchi nahi), bina domain sender.
  - **(c) Owner ke Gmail account ka API:** personal account ke niyam aur seema ka jokhim; account band hua to emails band.
- **Salah:** **(a)**. D-028 ka 300 aur D-142 ki chhat isi number pe bani hain. Bina domain bhejna chalta hai ya nahi, ye jaanchna baaki (§2).
- **Trade-off:**
  - (a) me spam ka jokhim waisa hi (R-005).
  - (b) me din ki chhat kam, aur D-142 ke numbers badalne padenge.
  - (c) me personal account ka jokhim, aur seema saaf nahi.
- **Owner ka jawab (2026-11-20):** **(a)**, Brevo ka free plan, HTTPS API se. Record: [DECISIONS.md](DECISIONS.md) D-287.

### Q-225. Seller ke hisaab me nayi bikri kitni der me dikhe?

- **Status:** `Tay`. Topic: B6 (settlement aur ledger), B15 (technical).
- **Sawal:** payment, return aur refund ke events finance ke database (Neon) me kitni der me pahunchein?
- **Kyun zaroori:**
  - Neon ke free plan me mahine ke 100 CU-ghante hain (R-014), aur compute har query ke baad kuch minute jaaga rehta hai.
  - Har event pe turant likhein to andazan din ke 12 ghante compute jaaga, yaani lagbhag 90 CU-ghante mahine me, aur mahine ke ant me finance band ho sakta hai. Tab pack pe invoice bhi nahi ban paata.
  - Pack pe invoice har haal me turant (sync) jaari hota hai; ye sawal baaki events ka hai.
- **Vikalp:**
  - **(a) Har 15 minute (misaal) ka batch**, sirf jab kuch pending ho: lagbhag 30 se 45 CU-ghante mahine me.
  - **(b) Turant, har event pe:** lagbhag 90 CU-ghante, seema ke bahut paas.
  - **(c) Har ghante ka batch:** lagbhag 10 CU-ghante, par seller ka statement ghante bhar purana.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me seller aur Finance app me nayi bikri 15 minute tak der se dikhti hai.
  - (b) sabse taaza, par mahine ke beech finance (aur pack pe invoice) band hone ka asli jokhim.
  - (c) sabse kam kharch, par der zyada.
- **Owner ka jawab (2026-11-20):** **(a)**, har 15 minute ka batch, sirf jab kuch pending ho; pack pe invoice turant. Record: [DECISIONS.md](DECISIONS.md) D-288.

### Q-226. Invoice ke email me PDF attach ho ya nahi?

- **Status:** `Tay`. Topic: B6 (invoice), B11 (notifications).
- **Sawal:** customer ko invoice ke email (D-126 niyam 2) me PDF file jaaye, ya sirf invoice ka saar aur "app me dekhein"?
- **Kyun zaroori:**
  - D-126 ne invoice ka email "paise ka record" maana, par attachment tay nahi.
  - Har PDF server pe banta hai (CPU aur memory), aur Render ki mahine ki bandwidth me ginta hai (300 emails × lagbhag 50 KB = lagbhag 15 MB din).
  - Email provider ke dashboard me copy reh sakti hai (₹50,000 se upar ke invoice pe naam aur pata, D-226). Asli invoice parcel ke andar hai (D-077).
- **Vikalp:**
  - **(a) PDF attach:** inbox me poora record.
  - **(b) Saar:** invoice number, tareekh, seller ka naam aur GSTIN, rakam; "Customer app me Orders me download karein", bina link.
  - **(c) Saar + customer app ka link** (sirf apne host ka, SR-012).
- **Salah:** **(b)**. Record (number, tareekh, rakam) email me rehta hai, personal data provider ke paas kam, aur emails me link pe click ki aadat nahi banti (R-017, SR-073 ki soch).
- **Trade-off:**
  - (a) customer ke liye sabse aasaan, par CPU, bandwidth aur privacy ka bojh.
  - (b) me PDF ke liye app kholna padta hai.
  - (c) aasaan, par emails me link (R-017).
- **Kanooni detail:** customer ko invoice ki copy kis roop me deni hai (CL-003, CL-020): Lawyer (ya CA) se nahi jaancha.
- **Owner ka jawab (2026-11-20):** **(b)**, email me sirf invoice ka saar (number, tareekh, seller ka naam aur GSTIN, rakam) aur app me download ki baat, bina PDF aur bina link. Record: [DECISIONS.md](DECISIONS.md) D-289.

### Q-227. Customer app ke public pages server pe ban ke aayein?

- **Status:** `Tay`. Topic: B15 (technical), B9 (search).
- **Sawal:** product aur category pages search engines ke liye server pe render hon (SSR), ya R1 me saare apps saade SPA rahein?
- **Kyun zaroori:**
  - D-058 ne customer app ke server-side hisse ka Vercel region technical charcha pe chhoda tha.
  - SSR ke liye Vercel functions, unka region, cache, aur backend tak ek aur raasta chahiye; SPA me ye sab nahi.
  - Abhi account sirf allowlist se banta hai (D-133), par pages dekhna sabke liye khula hai.
- **Vikalp:**
  - **(a) R1 me sirf SPA:** koi server-side rendering nahi.
  - **(b) Public product aur category pages SSR se**, Vercel functions pe (region Singapore, backend ke paas).
  - **(c) Build pe static pages:** catalog badalne pe dobara build.
- **Salah:** **(a)**. Search engine ki koi tay zaroorat nahi; sabse kam hisse, aur ₹0 me sabse surakshit. Asli business ke waqt dobara dekhein.
- **Trade-off:**
  - (a) me search engines me kam dikhna, aur pehla page thoda der se.
  - (b) me SEO aur tez pehla page, par functions ka kharcha aur limits, logs aur secrets ki ek aur jagah, aur CSP ka kaam.
  - (c) me catalog ka har badlav deploy maangta hai (D-037 ki soch se ulta), aur Render ki build minutes.
- **Owner ka jawab (2026-11-20):** **(a)**, R1 me saare apps SPA, koi server-side rendering nahi; SSR asli business ke waqt dobara. Record: [DECISIONS.md](DECISIONS.md) D-290.

### Q-228. ARCHITECTURE batch 1: services aur data ki seema maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** Principal Software Architect ke services aur data ki seema ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §2 me aayein: 12 hisse (gateway aur 11 data wali services), har data ka ek maalik, sync calls ki tay list, aur 11 niyam?
- **Kyun zaroori:** D-011 ne services ka sirf pehla draft diya tha, aur "data sirf events se" ka matlab saaf nahi tha. Kuch kaam (checkout pe payment order, pack pe invoice, darwaze pe UPI QR, OTP) usi pal jawab maangte hain. Database Architect aur baaki agents isi seema pe kaam karenge.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**. Har data ka ek maalik; copy sirf events se, aur turant jawab wale kaam sirf ek chhoti tay list se; stock aur order ek transaction me, serviceability aur daam ki copy commerce me (D-016 niyam 9, SR-044).
- **Trade-off:**
  - (a) me do nayi services (media, logs) aur commerce me logistics aur catalog ki copy, jo kuch second peeche reh sakti hai.
  - (b) me owner ka samay.
  - (c) me Database Architect bina seema ke.
- **Owner ka jawab (2026-11-20):** **(a)**, services aur data ki seema jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-291.

### Q-229. ARCHITECTURE batch 2: events aur messaging maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** events ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §3 me aayein: outbox se seedhi delivery, inbox se dedupe, aggregate ke hisaab se kram, retry aur dead letter, envelope, event me kya kabhi nahi, versioning, outbox se audit (11 niyam)?
- **Kyun zaroori:** Redis kabhi sach nahi (R-010), aur Redis ki free memory chhoti hai. Event khona nahi chahiye, aur ek order ke events ulte kram me nahi pahunchne chahiye.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**. Event ka sach outbox me, to Redis ke restart se event nahi khota; delivery kam se kam ek baar, asar ek baar.
- **Trade-off:**
  - (a) me har producer ka dispatcher aur har consumer ki `processed_events` collection.
  - (b) me owner ka samay.
  - (c) me services ke beech baat ka dhaancha baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, events ke 11 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-292.

### Q-230. ARCHITECTURE batch 3: background jobs aur samay maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** jobs ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §4 me aayein: samay wale kaam DB me due date ke saath, ticker aur lease, BullMQ sirf kaam chalane ke liye, queues ki seema, IST ka din, chhoote din ka catch-up, finance ka batch, turant wale kaam job nahi, aur R1 ki jobs ki table (9 niyam)?
- **Kyun zaroori:** server raat ko soya rehta hai (R-002) aur Redis khaali ho sakta hai (R-010); kaam late ho sakta hai, khona nahi chahiye. Chhote kanooni samay (D-248, D-251) soye server pe job se poore nahi hote.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me har service me `timers` aur lease ka kaam.
  - (b) me owner ka samay.
  - (c) me jobs ka dhaancha baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, jobs ke 9 niyam aur R1 ki jobs ki table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-293.

### Q-231. ARCHITECTURE batch 4: API aur apps se baat maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** API ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §5 me aayein: REST aur ek contract, ek screen ek ya do calls, pagination, versioning, app ka version, Delivery app ka sync, polling, error ka roop aur status codes, idempotency, retries aur timeouts, apps ka raasta, `/wake`, aur SPA (15 niyam)?
- **Kyun zaroori:** 11 apps ek hi backend se baat karte hain (D-010), India se Singapore ki der hai (R-012), aur Delivery app offline bhi chalta hai (D-042). Ek contract se validation, manifest aur typed client ek saath bante hain.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me WebSocket nahi, to live halat polling se (thodi der).
  - (b) me owner ka samay.
  - (c) me apps aur backend ka contract baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, API ke 15 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-294.

### Q-232. ARCHITECTURE batch 5: search aur caching maanein?

- **Status:** `Tay`. Topic: B15 (technical), B9 (search).
- **Sawal:** search aur cache ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §6 me aayein: catalog ke cluster pe Atlas Search, 3 indexes, kram, synonyms bina deploy, zero result ki ginti, CDN pe sirf public cache, personal jawab kabhi cache nahi, aur Redis me koi data cache nahi (11 niyam)?
- **Kyun zaroori:** D-138 ke filters aur D-139 ka kram ek index se chahiye; Render ki mahine ki bandwidth chhoti hai (5 GB), to public browsing CDN se bachni chahiye.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**. ₹0, data bahar nahi (D-157 ki soch), aur synonyms bina deploy (D-037 ki soch).
- **Trade-off:**
  - (a) me laptop aur CI ke liye ek alag search adapter, aur CDN pe daam 30 second tak purana (sirf dikhne me, bill me nahi).
  - (b) me owner ka samay.
  - (c) me search aur bandwidth ka bachaav baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, search aur caching ke 11 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-295.

### Q-233. ARCHITECTURE batch 6: media aur files maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** files ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §7 me aayein: upload seedha provider pe, har file ka record media me, dobara encode provider pe, private file ka chhota URL, retention, ek file ek maalik, PDF aur export, aur cleanup (9 niyam)?
- **Kyun zaroori:** media provider D-284 se tay hai; ab upload, private files, retention aur PDFs ka ek tareeka chahiye (SR-061, SR-062, D-191 se D-193, D-262).
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**. Backend ke raaste file kabhi nahi, to memory (R-007) aur bandwidth dono bachte hain.
- **Trade-off:**
  - (a) me media service ka registry aur provider se milaan ka kaam.
  - (b) me owner ka samay.
  - (c) me uploads ka dhaancha baaki.
- **Kanooni detail:** jaari document ka PDF tax archive ki "asli copy" maana jaaye ya nahi: Lawyer (ya CA) se nahi jaancha (CL-021).
- **Owner ka jawab (2026-11-20):** **(a)**, media aur files ke 9 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-296.

### Q-234. ARCHITECTURE batch 7: observability maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** logs aur alerts ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §8 me aayein: structured logs aur request id, 180 din ke logs, kya kabhi log nahi, audit ke compressed chunks, errors, ops snapshot, health aur ready, alerts ke misaal thresholds, hafte ka dekhna, aur server ki ghadi (10 niyam)?
- **Kyun zaroori:** free tier pe logs aur alerts seemit hain (R-024); CERT-In ke logs (CL-106) aur audit ke 2 saal (D-194) Atlas ke 0.5 GB me fit hone chahiye.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me audit ke purane din compressed chunks me (padhne me ek kadam zyada), aur metrics ke liye Grafana jaisa tool nahi, sirf snapshot.
  - (b) me owner ka samay.
  - (c) me logs aur alerts ka dhaancha baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, observability ke 10 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-297.

### Q-235. ARCHITECTURE batch 8: scale aur capacity maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** capacity ke niyam [ARCHITECTURE.md](ARCHITECTURE.md) §9 me aayein: ₹0 ki seema ki table, ek order ka data, memory budget, performance targets, aur 8 niyam (memory ke pehre, jagah ka naap, R1 se pehle 512 MB pe naap, hafte ka dekhna)?
- **Kyun zaroori:** design target (D-283) aur ₹0 pe asli seema alag hain. 512 MB me saari services ek process me hain (D-049, R-007), aur Render ki bandwidth khatam ho to free services mahine ke ant tak band ho sakti hain.
- **Vikalp:**
  - **(a)** Jaise hain waise maanein.
  - **(b)** Badlav ke saath maanein (owner bataye).
  - **(c)** Batch roko.
- **Salah:** **(a)**. Numbers saaf likhe hain aur naap ke badlenge; D-049 dobara kholne ka gate bhi saaf.
- **Trade-off:**
  - (a) me R1 se pehle naap ka kaam.
  - (b) me owner ka samay.
  - (c) me capacity ke number baaki.
- **Owner ka jawab (2026-11-20):** **(a)**, scale aur capacity ke niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-298.

### Q-236. Principal Software Architect ke 8 naye risks aur 5 risks me jod maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** architecture se nikle 8 naye risks ([RISKS.md](RISKS.md) R-028 se R-035) aur R-002, R-007, R-010, R-014, R-024 me jod RISKS me aayein?
- **Kyun zaroori:** ₹0 ki seemaayein (Neon ke ghante, Render ki bandwidth aur CPU, Atlas ki jagah aur Search, cluster ka ruk jaana, media ke credits) asli khatre hain. Inka bachav ARCHITECTURE §2 se §9 me hai, par khatra RISKS me saaf dikhna chahiye.
- **Naye risks (saar):**
  1. **R-028:** finance (Neon) band ho to pack pe invoice nahi, yaani dispatch ruke.
  2. **R-029:** Render ki 5 GB mahine ki bandwidth khatam ho aur payment method na ho to saari free services mahine ke ant tak band.
  3. **R-030:** Render free ka kam CPU: bade pal me sab dheema, asli load ₹0 pe nahi.
  4. **R-031:** Atlas ke 0.5 GB me audit sabse pehle bharta hai.
  5. **R-032:** Atlas Search ke free cluster ki seemaayein jaanchi nahi.
  6. **R-033:** Atlas free cluster lambe samay bina connection ke ruk jaata hai.
  7. **R-034:** install hue apps ka purana version (Delivery ka offline data) naye API se na mile.
  8. **R-035:** media provider ke free credits khatam.
- **Vikalp:**
  - **(a)** Sab risks bachav ke saath: R-030 `Maana` (₹0 ki seema), baaki `Khula`; aur 5 risks me jod.
  - **(b)** Sab `Khula`, koi `Maana` nahi.
  - **(c)** Risks roko.
- **Salah:** **(a)**. Kam CPU ₹0 ka hi hissa hai (D-028 ki tarah jaan ke maana); baaki ka bachav likha hai par khatra bacha hai.
- **Trade-off:**
  - (a) me R-030 pe aage kaam nahi, sirf seema saaf likhi.
  - (b) me R-030 hamesha khula dikhta, jabki ₹0 pe uska hal nahi.
  - (c) me ₹0 ke khatre chhupe rehte.
- **Owner ka jawab (2026-11-20):** **(a)**, 8 naye risks (R-030 `Maana`, baaki `Khula`) aur 5 risks me jod. Record: [DECISIONS.md](DECISIONS.md) D-299.

### Q-237. Area band karne pe commerce ki copy ki der ka kya karein?

- **Status:** `Tay`. Topic: B1 (logistics), B15 (technical).
- **Sawal:** serviceability ki jaanch order ke transaction me commerce ki apni copy pe hoti hai (D-016 niyam 9, D-291), jo logistics ke badlav se kuch second peeche reh sakti hai. Area band karte hi aaye ek-do orders ka kya ho?
- **Kyun zaroori:** area band karne ke turant baad copy ki der me order aa sakta hai, jise deliver nahi kiya ja sakta.
- **Vikalp:**
  - **(a) Do kadam aur pakki rok:** area band karne ka kram: pehle checkout pe us area ki rok ka event, phir band. Parcel banate waqt logistics band area wale order ko rokta hai, aur wo order cancel aur refund (D-111).
  - **(b) Band karte waqt commerce ko sync call:** copy turant badle, par sync calls ki list (ARCHITECTURE §2.3) me ek aur call.
  - **(c) Kuch nahi:** aise orders staff haath se cancel kare.
- **Salah:** **(a)**. Copy ki der ka asar sirf ek-do order, aur wo bhi parcel se pehle pakda jaata hai; sync list chhoti rehti hai.
- **Trade-off:**
  - (a) me area band karne ke kram me ek kadam zyada, aur kabhi ek order ka cancel aur refund.
  - (b) me sync calls ka graph bada.
  - (c) me order chhoot sakta hai aur customer ko der se pata chalta.
- **Owner ka jawab (2026-11-20):** **(a)**, pehle checkout pe rok ka event, phir band; parcel banate waqt logistics band area ka order roke, cancel aur refund. Record: [DECISIONS.md](DECISIONS.md) D-300.

### Q-238. Bina network ke darwaze pe delivery code ka kya ho?

- **Status:** `Tay`. Topic: B1 (delivery), B14 (security).
- **Sawal:** delivery code ka milaan sirf online hota hai (code partner ke phone pe kabhi nahi, SR-054; D-294), par Delivery app offline bhi chalta hai (D-042). Darwaze pe network na ho to kya ho?
- **Kyun zaroori:** D-072 me photo aur location ka raasta "code na mile" ke liye hai, "network nahi" ke liye nahi. Bina niyam ke partner photo wala raasta har baar le sakta hai, aur code ka saboot kamzor ho jaata hai.
- **Vikalp:**
  - **(a) Code wali delivery sirf online:** offline me list, scans aur photo line me rehte hain; network na ho to partner thoda intezaar kare ya Hub Manager se baat kare.
  - **(b) Network na ho to photo aur location ka raasta:** D-072 ke code na milne jaisa.
  - **(c) Code ka hash partner ke phone pe, offline jaanch:** SR-054 ke khilaaf.
- **Salah:** **(a)**. Code ka saboot pakka rehta hai (D-072, D-068), aur SR-054 nahi toot-ta.
- **Trade-off:**
  - (a) me kamzor network wale ilaake me delivery me der.
  - (b) me "network nahi" bol ke code se bachna aasaan, aur daawe badhte.
  - (c) me code chori ho sakta hai.
- **Owner ka jawab (2026-11-20):** **(a)**, code wali delivery sirf online; offline me list, scans aur photo line me; network na ho to partner intezaar kare ya Hub Manager se baat kare. Record: [DECISIONS.md](DECISIONS.md) D-301.

### Q-239. Order confirmation ka email emails ki kaunsi line me?

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** din ki seema ke paas emails ki line hai: pehle OTP, phir paise ke emails, phir baaki (D-126 niyam 4, D-142). Order confirmation (jisme delivery code hai) kis line me ho?
- **Kyun zaroori:** line tay nahi hai. Chhat paar ho to confirmation agle din khisak sakta hai.
- **Vikalp:**
  - **(a) Paise ki line:** confirmation order ka record hai.
  - **(b) Baaki ki line:** code customer app me bhi hai (D-072).
  - **(c) OTP ki line:** sabse pakka, par OTP ki pakki jagah kam.
- **Salah:** **(a)**. Confirmation order ka record hai aur usme delivery code hai; OTP ki pakki jagah nahi ghat-ti.
- **Trade-off:**
  - (a) me bhaari din pe invoice aur refund ke emails ke saath jagah baant-ni.
  - (b) me bhaari din pe confirmation agle din tak, halaanki delivery nahi rukti (code app me).
  - (c) me OTP ruk sakte, jo sign-in rokta hai.
- **Owner ka jawab (2026-11-20):** **(a)**, order confirmation paise ki line me. Record: [DECISIONS.md](DECISIONS.md) D-302.

### Q-240. Media provider ki files ka backup ho ya nahi?

- **Status:** `Tay`. Topic: B15 (technical), B13 (compliance).
- **Sawal:** D-013 ka backup saare databases ka hai, par media provider (D-284) ki files databases me nahi. Unka backup ho ya nahi?
- **Kyun zaroori:** provider pe file kho jaaye to product image, review photo ya daawe ka saboot gaya. Free tier pe har file ki doosri copy ka matlab dugni jagah aur bandwidth.
- **Vikalp:**
  - **(a) Backup nahi:** product images seller se dobara li jaayein; daawe aur saboot ki files apne samay pe waise bhi mitti hain. OPERATIONS me ye ek line (DevOps / SRE ke saath).
  - **(b) Hafte ka backup owner ke laptop pe:** Render aur provider ki bandwidth, aur laptop pe personal data (D-196, R-023).
  - **(c) Do providers me copy:** dugna kaam, do processors.
- **Salah:** **(a)**. ₹0 pe sabse saral; product images seller ke paas hain; aur laptop pe personal data ki copy nahi badhti.
- **Trade-off:**
  - (a) me provider pe file kho jaaye to daawe ya kanooni rok (D-262) wali photo ka saboot nahi bachta.
  - (b) me bandwidth (R-029) aur laptop ki suraksha ka bojh.
  - (c) me dugna kaam aur ek aur processor.
- **Kanooni detail:** kanooni rok wali files (D-262) ki ek hi copy kaafi hai ya nahi: Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-20):** **(a)**, media provider ki files ka backup nahi; OPERATIONS me ek line. Record: [DECISIONS.md](DECISIONS.md) D-303.

### Q-241. Ek email se kai app parivaar: ek account ya alag?

- **Status:** `Tay`. Topic: B2 (apps aur roles), B14 (security).
- **Sawal:** ek insaan ek hi email se customer bhi ho aur seller (ya delivery partner, ya Creator) ka user bhi, to system me uska ek account ho ya har parivaar ka alag?
- **Kyun zaroori:** identity ka unique key, sessions, authenticator ke niyam aur account delete isi pe tike hain (D-021, D-184, D-186, D-151). Staff ke accounts pehle se alag hain (D-017).
- **Vikalp:**
  - **(a) Ek email, ek account:** customer hona default; seller, partner aur Creator ka kaam grants se; delete poore account ka.
  - **(b) Har parivaar ka alag account:** customer, seller, partner, Creator aur staff ke alag accounts; email wahi ho sakta hai, unique (email, parivaar); password, authenticator aur sessions alag; customer ka delete seller ke account ko nahi chhoota.
  - **(c) Ek email sirf ek parivaar me:** doosre ke liye `+` alias ya doosra email.
- **Salah:** **(b)**. Customer ka email code wala sign-in (D-021) aur seller ke paise ke kaam ek credential pe nahi rehte, aur customer ka delete seller ka business account nahi le jaata.
- **Trade-off:**
  - (a) me customer ka delete seller ka business account bhi le jaata, aur ek credential pe sab kaam.
  - (b) me ek insaan ke do passwords; brand ke staff ka apne product pe review roko (D-156) email ke mel se hota hai (SR-059).
  - (c) asli sellers ke liye bojh.
- **Owner ka jawab (2026-11-21):** **(b)**, har parivaar ka alag account; unique (email, parivaar). Record: [DECISIONS.md](DECISIONS.md) D-304.

### Q-242. Account delete pe customer ke reviews ka kya ho?

- **Status:** `Tay`. Topic: B8 (reviews), B13 (compliance).
- **Sawal:** customer apna account delete kare to uske chhape hue reviews ka kya ho?
- **Kyun zaroori:** delete pe "records me pehchaan hata ke" tay hai (D-151, SR-066), par reviews ka zikr nahi. Rating ka jod (D-139, D-154) aur review ki photos (D-155, chehra) pe asar.
- **Vikalp:**
  - **(a)** Star aur text rahein, naam ki jagah "Deleted customer", "Verified purchase" ka nishaan rahe; photos hatein.
  - **(b)** Review poora hate (star, text, photos); rating dobara gini jaaye.
  - **(c)** Sab rahe (photos bhi), sirf naam hate.
- **Salah:** **(a)**. Rating sach rehti hai, aur chehre wali photo account ke saath chali jaati hai.
- **Trade-off:**
  - (a) me text me customer ne khud apni pehchaan likhi ho to wo rehti hai (report ya staff se hat sakti).
  - (b) me brand ki rating achanak badalti.
  - (c) me chehre wali photo bina account ke rehti.
- **Kanooni detail:** erase ka haq aur maqsad poora hone pe erase (CL-091, CL-093) reviews pe kaise laagu: Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(a)**, star aur text rahein, naam "Deleted customer", "Verified purchase" rahe, photos hatein. Record: [DECISIONS.md](DECISIONS.md) D-305.

### Q-243. Purane orders ki poori detail kitne samay turant dikhe?

- **Status:** `Tay`. Topic: B5 (orders), B15 (technical).
- **Sawal:** customer, seller aur staff ko purane orders ki poori detail kitne samay tak turant dikhe?
- **Kyun zaroori:** ek order ka commerce data lagbhag 6 KB hai ([ARCHITECTURE.md](ARCHITECTURE.md) §9), to ₹0 pe 100 orders/din pe commerce ka 0.5 GB lagbhag 1.7 saal me bharta hai. Purana order review (D-135, 365 din), return (D-221), recall (D-129) aur support ke liye chahiye; invoice finance me alag rehta hai (CL-021).
- **Vikalp:**
  - **(a)** Har order hamesha poori detail ke saath live; jagah bharne pe paid plan.
  - **(b)** Band order (delivered, return ki khidki aur khule maamle khatam) ki poori detail misaal 13 mahine live; uske baad mahine ke compressed archive me. List me saar (number, tareekh, rakam, items ke naam); detail kholne pe archive se (misaal 1 se 2 second); invoice hamesha finance se.
  - **(c)** 13 mahine ke baad sirf saar aur invoice; poori detail nahi.
- **Salah:** **(b)**.
- **Trade-off:**
  - (a) ₹0 pe lagbhag 1.7 saal me ruk.
  - (b) me ek archive job aur padhne ka ek aur raasta.
  - (c) me purane order pe support aur R2 ka "dobara order" (D-178) kamzor.
- **Owner ka jawab (2026-11-21):** **(b)**, band order 13 mahine (misaal) live, phir mahine ka compressed archive; list me saar, invoice hamesha finance se. Design R1 me, archive ka job jab commerce 50% bhare. Record: [DECISIONS.md](DECISIONS.md) D-306.

### Q-244. Jin cheezon ka rakhne ka samay abhi tay nahi, unka samay kya ho?

- **Status:** `Tay`. Topic: B13 (compliance), B15 (technical).
- **Sawal:** neeche ki cheezon ke rakhne ka samay kya ho?

  | Cheez                                  | Prastaav (misaal)                                  | Wajah                                       |
  | -------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
  | In-app inbox ki khabar                 | 180 din                                            | Order ke saath purani khabar kaam ki nahi   |
  | Bheje emails ka record (bina code)     | 90 din                                             | Delivery ki jaanch aur din ki ginti (D-142) |
  | Cart                                   | Bina chhue 90 din                                  | Cart me stock nahi rukta (D-118)            |
  | Wishlist                               | Account tak, 200 items tak                         | Customer ki apni list                       |
  | Waitlist (D-046)                       | Area khulne ki khabar ke 30 din baad, warna 1 saal | Kholne ke sujhaav ki ginti                  |
  | Band sessions ka record ("My devices") | Khatam hone ke 30 din baad                         | Security events alag 1 saal (D-194)         |
  | Daam ka itihaas (D-061)                | 400 din live; purana audit me 2 saal (SR-076)      | D-063 aur D-223 ko pichhla daam chahiye     |
  | Zero result ke shabd (D-152)           | 90 din                                             | Hafte ki report; bina user id               |
  | Fraud ke signals (SR-058)              | 2 saal                                             | Baar-baar ke pattern dekhne ke liye         |
  | Owner ke aankde (D-149)                | 3 saal                                             | Bina personal data                          |

- **Kyun zaroori:** D-191 se D-194 aur D-250 kuch classes tay karte hain; ye cheezein unme nahi. Inka TTL index aur jagah isi se tay hoti hai.
- **Vikalp:**
  - **(a)** Table ke numbers (sab settings me).
  - **(b)** Personal data wali sab cheezein 1 saal, aankde 3 saal.
  - **(c)** Sab 90 din (kam se kam data).
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me alag-alag numbers yaad rakhne.
  - (b) me jagah zyada (D-283 ke target pe notify aur commerce bharte).
  - (c) me waitlist aur fraud ke pattern kho jaate.
- **Kanooni detail:** lagbhag 13 May 2027 se kanooni rok (D-250) in cheezon pe bhi laagu ho sakti hai: uski seema Lawyer se nahi jaanchi.
- **Owner ka jawab (2026-11-21):** **(a)**, table ke numbers, sab settings me. Record: [DECISIONS.md](DECISIONS.md) D-307.

### Q-245. Customer ko dikhne wala order number kis roop ka ho?

- **Status:** `Tay`. Topic: B5 (orders).
- **Sawal:** customer ko dikhne wala order number kis roop ka ho?
- **Kyun zaroori:** number invoice, emails, push (D-195), seller ki report (D-143) aur support me jaata hai. Roop se din ke orders ki ginti bahar dikh sakti hai. Wahi roop return aur daawe ke numbers pe bhi (apne prefix ke saath).
- **Vikalp:**
  - **(a) Tareekh + din ki ginti:** jaise `BQ261120-0042` (padhna aasaan; din ki bikri ka andaza bahar).
  - **(b) 10 ank ka random jaisa number, aakhri ank check digit:** jaise `4827-1930-56` (ginti nahi dikhti; galat type pakda jaata).
  - **(c) Lagataar ginti:** jaise `1000123` (sabse chhota; kul orders saaf dikhte).
- **Salah:** **(b)**.
- **Trade-off:**
  - (a) me din ki bikri ka andaza bahar.
  - (b) yaad rakhna thoda mushkil; takrav unique index aur dobara number se (bahut kam).
  - (c) me kul orders sabko dikhte.
- **Owner ka jawab (2026-11-21):** **(b)**, 10 ank ka random jaisa number, aakhri ank check digit. Record: [DECISIONS.md](DECISIONS.md) D-308.

### Q-246. Finance ke band financial years ka data ₹0 pe kahan rahe?

- **Status:** `Tay`. Topic: B6 (ledger), B15 (technical).
- **Sawal:** finance ka database (Neon free) bharne lage to band financial years ka data kahan rahe?
- **Kyun zaroori:** books 8 FY (ARCHITECTURE §1.1, CL-131) aur sellers ke tax documents 72 mahine (CL-021) rakhne hain. Finance lagbhag 8 KB har order hai ([ARCHITECTURE.md](ARCHITECTURE.md) §9), to ₹0 pe 100 orders/din pe Neon lagbhag 1.4 se 2.8 saal me bharta hai (Neon ki asli jagah ki jaanch §2 me).
- **Vikalp:**
  - **(a)** Sab Neon me; bharne pe paid plan, warna finance (aur pack, R-028) ruk.
  - **(b)** Jis FY ka annual return aur sudhaar ki khidki band ho gayi, uske journals, documents aur lines ek encrypted, hash se band export file (har FY ek) me, private file storage (D-284) pe. Neon me us FY ke closing balances, documents ki list (number, tareekh, rakam, hash) aur file ka hash. Purani detail ke liye file ko ek alag database me restore. File backup command (D-013) me bhi.
  - **(c)** Band FY Neon me hi, par lines mahine ke saar me milana (detail hatana).
- **Salah:** **(b)**.
- **Trade-off:**
  - (a) me paid plan ya finance aur pack ka rukna.
  - (b) me purane saal ki detail turant nahi (restore chahiye), aur ek file ki suraksha.
  - (c) me books ki detail badalti, audit trail (CL-131) ke khilaaf.
- **Kanooni detail:** export file books ka "electronic roop" maani jaaye ya nahi, aur asli business pe India me roz ka backup (CL-131): CA (aur Lawyer) se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(b)**, band FY ka encrypted, hash se band export file private storage pe; Neon me closing balances, documents ki list aur hash. Design ab, kaam pehla FY band hone ke baad. Record: [DECISIONS.md](DECISIONS.md) D-309.

### Q-247. ARCHITECTURE data batch 1: ids, numbers, paisa aur samay maanein?

- **Status:** `Tay`. Topic: B15 (technical), B6 (paisa).
- **Sawal:** Database Architect ke ids, numbers, paisa aur samay ke 10 niyam aur numbers ki table [ARCHITECTURE.md](ARCHITECTURE.md) §10.1 me aayein (seller code 3 characters, §1.7 ki misaal bhi)?
- **Kyun zaroori:** rakam integer paise me na ho to rounding ki galti (§1.8); ids aur numbers ka ek roop saari services me chahiye; seller code ki misaal `S01` 500 sellers ke liye chhoti thi.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me saajha money codec aur package har service me; (b) me owner ka samay; (c) me data ka bunyadi roop baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 10 niyam aur table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-310.

### Q-248. ARCHITECTURE data batch 2: transactions, concurrency aur platform collections maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** transaction helper, versions, conditional updates, unique indexes, copies ka `srcVersion`, dispatcher ke niyam aur har service ki platform collections (13 niyam aur table) [ARCHITECTURE.md](ARCHITECTURE.md) §10.2 me aayein?
- **Kyun zaroori:** do scans, do staff ya dobara aaya event ek kaam do baar na kare; finance ka database band ho to events dead letter me na jaayein.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har service me 9 platform collections; (b) me owner ka samay; (c) me concurrency ke niyam baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 13 niyam aur table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-311.

### Q-249. ARCHITECTURE data batch 3: personal data, retention aur kanooni rok maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B14 (security).
- **Sawal:** retention classes, erase ka tareeka, rok ki copy (`sealed_records`), field encryption aur blind index, codes ka hash aur delivery code encrypted, tax archive, aur account delete pe har service ka kaam (11 niyam aur table) [ARCHITECTURE.md](ARCHITECTURE.md) §10.3 me aayein?
- **Kyun zaroori:** delete (D-151, SR-066), kanooni rok (D-250, D-262) aur tax archive (D-225) ek saath chalne chahiye, bina ek doosre ko tode.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Delivery code customer ko dikhana zaroori hai, isliye wo hash nahi, encrypted; baaki codes sirf hash.
- **Trade-off:** (a) me SR-063 ke "baaki codes sirf hash" se delivery code ka apvaad (Security Architect ke doosre run me pakka); (b) me owner ka samay; (c) me delete aur rok ka tareeka baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 11 niyam aur table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-312.

### Q-250. ARCHITECTURE data batch 4: migrations, release steps, seeds aur M0 ki aadatein maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** release step, index ke naam, expand aur contract, data migrations, release user, finance ki SQL migrations, validators, cursor wali lists, seeds aur backup ka roop (10 niyam) [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 me aayein?
- **Kyun zaroori:** deploy ke waqt do instance saath chalte hain, aur M0 pe 100 ops/second ki seema hai; badlav bina downtime ke aur dobara chalne layak hone chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har badlav do releases me; (b) me owner ka samay; (c) me migrations ka tareeka baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 10 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-313.

### Q-251. ARCHITECTURE data batch 5: commerce ke orders, stock aur reservation maanein?

- **Status:** `Tay`. Topic: B5 (orders), B3 (batch aur expiry).
- **Sawal:** order ka dhaancha, batch ke level pe stock, place order ka ek transaction, FEFO, dikha hua batch hi, reservation ka timer, der se payment, pack ke teen kadam, cancel, raat ki jaanch, storage fee, recall ki list aur archive (14 niyam) [ARCHITECTURE.md](ARCHITECTURE.md) §10.5 me aayein?
- **Kyun zaroori:** stock kabhi minus na ho (SR-045), customer ko dikhe batch ka MRP aur expiry hi mile (D-064, D-067), aur pack pe invoice dobara na bane.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me pack teen kadam me (thoda zyada kaam); (b) me owner ka samay; (c) me commerce ka data baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 14 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-314.

### Q-252. ARCHITECTURE data batch 6: finance ka PostgreSQL maanein?

- **Status:** `Tay`. Topic: B6 (ledger), B15 (technical).
- **Sawal:** schemas, journal ka barabar hona, ek ghatna ek journal, sirf insert, band mahina, bina gap number, cancel aur credit note, pack ki idempotency, tax archive, payout ke do haath, TDS aur TCS, `sys` tables, Neon ko na jagaana aur query builder (15 niyam aur table) [ARCHITECTURE.md](ARCHITECTURE.md) §10.6 me aayein?
- **Kyun zaroori:** books ke niyam (§1) database ke constraints se pakke hone chahiye, aur Neon ke CU-ghante bachne chahiye (R-014).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me ORM nahi, to queries thodi zyada likhni; (b) me owner ka samay; (c) me finance ka data baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 15 niyam aur table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-315.

### Q-253. ARCHITECTURE data batch 7: baaki services ke data niyam maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** identity, notify, payments, catalog, logistics aur support ke data niyam (10 niyam) [ARCHITECTURE.md](ARCHITECTURE.md) §10.7 me aayein?
- **Kyun zaroori:** har service ke "ek hi" wale niyam (ek review, ek refund, ek brand ek seller) aur personal data ki jagah (logistics me address save nahi) data ke level pe pakke hone chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me logistics ko address maalik se lena padta; (b) me owner ka samay; (c) me baaki services ke niyam baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 10 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-316.

### Q-254. ARCHITECTURE data batch 8: audit, media, logs aur jagah maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** audit ka sirf insert user aur chunks, media ka record, logs ke chunks, band records ka archive, jagah ka roz ka naap, aur clusters kab bharte hain ki table (7 niyam aur table) [ARCHITECTURE.md](ARCHITECTURE.md) §10.8 me aayein?
- **Kyun zaroori:** Atlas ke 0.5 GB (R-031) me audit sabse pehle bharta hai; design target (D-283) aur ₹0 ki seema alag likhi honi chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me audit padhne me chunks ka ek kadam; (b) me owner ka samay; (c) me jagah ka plan baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 7 niyam aur table jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-317.

### Q-255. Database Architect ke 7 naye risks maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** data se nikle 7 naye risks ([RISKS.md](RISKS.md) R-036 se R-042) RISKS me aayein?
- **Naye risks (saar):**
  1. **R-036:** Neon ki jagah me books ke 8 FY ₹0 pe nahi samaate; finance sabse pehle bharta hai.
  2. **R-037:** sale ke din hot documents (batch ka balance, din ke counter) pe transactions takraate hain.
  3. **R-038:** events se bani copies (daam, area, stock) peeche ya galat reh jaayein.
  4. **R-039:** field encryption ki key kho jaaye ya galat badle.
  5. **R-040:** nayi collection bina delete handler ya retention class ke aa jaaye.
  6. **R-041:** deploy ke waqt ek hi release me field ya index jodna aur hatana.
  7. **R-042:** audit ka chunk job ruke aur TTL taaza entries mita de.
- **Kyun zaroori:** inka bachav ARCHITECTURE §10 me hai, par khatra RISKS me saaf dikhna chahiye.
- **Vikalp:** **(a)** saare bachav ke saath `Khula`; **(b)** kuch `Maana` (owner bataye); **(c)** risks roko.
- **Salah:** **(a)**. Har ek ka bachav likha hai, par ₹0 aur ek insaan ke kaam me khatra bacha hai.
- **Trade-off:** (a) me 7 aur khule risks; (b) me owner ka samay; (c) me khatre chhupe rehte.
- **Owner ka jawab (2026-11-21):** **(a)**, 7 naye risks bachav ke saath `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-318.

### Q-256. Data ke 5 chhote sudhaar ARCHITECTURE aur security docs me maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** tay faislon me 5 chhoti kamiyaan mili hain. Inke sudhaar maanein?
  1. **Logistics ko address ka raasta:** events me poora address nahi jaata (§3), par partner ko darwaze ka pata chahiye. [ARCHITECTURE.md](ARCHITECTURE.md) §2.3 me ek sync row: logistics → commerce, assign aur Delivery sync ke waqt parcel ka naam, address aur phone (resolver); logistics me copy nahi.
  2. **Finance ko delivered ka event:** return window ke baad payable (D-081) aur delivery pe UPI wale order ka delivery fee invoice (§1.6) delivered ke pal pe tike hain. §2.2 me finance `commerce.orderLine.delivered` bhi leta hai.
  3. **Pack ka chhootna:** pack adhoora rahe ya dobara ho (D-090), to invoice cancel ka raasta nahi. Commerce ka naya event `commerce.parcel.packVoided` (parcel, seller, `packSeq`); finance dispatch se pehle us invoice ko cancel karta hai; naya pack naye `packSeq` se.
  4. **Delivery code ka apvaad:** [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) SR-063 me line: delivery code encrypted, kyunki customer ko dikhana zaroori hai; milaan server pe; baaki codes sirf hash.
  5. **Neon ki jagah:** §9 ki ₹0 table me Neon ki jagah ki line (0.5 GB ya 1 GB, jaanch §2; ₹0 pe 100 orders/din pe lagbhag 1.4 se 2.8 saal).
- **Kyun zaroori:** inke bina partner ko pata nahi milta, seller ka payable aur delivery fee ka invoice nahi banta, aur pack dobara hone pe galat invoice reh jaata hai.
- **Vikalp:** **(a)** paanchon sudhaar; **(b)** kuch hi (owner bataye); **(c)** roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me sync list me ek call aur ek naya event; (b) me owner ka samay; (c) me upar ki kamiyaan bani rehti.
- **Owner ka jawab (2026-11-21):** **(a)**, paanchon sudhaar. Record: [DECISIONS.md](DECISIONS.md) D-319.

### Q-257. Account delete ke baad ₹50,000 se upar ke invoice ki seller copy kaise mile?

- **Status:** `Tay`. Topic: B6 (invoice), B13 (compliance).
- **Sawal:** ₹50,000 ya zyada ke invoice ki seller ki copy me customer ka naam aur pata hota hai (D-226), par account delete ke baad naam aur pata sirf finance ke tax archive me rehta hai (§10.3 niyam 9). Seller ko apne records 72 mahine rakhne hain (CL-021). Delete ke baad seller ko ye copy kaise mile?
- **Vikalp:**
  - **(a) Archive se, finance ke raaste:** delete ke baad bhi seller apne invoice ki copy ek-ek karke download kar sake, finance ke tax archive se, har download audit me.
  - **(b) Copy sirf jaari hote waqt:** seller ko copy invoice jaari hote hi milti hai; delete ke baad naam aur pata wali copy nahi.
  - **(c) Delete pe seller ko suchna:** delete se pehle seller ko apni copies le lene ki khabar.
- **Salah:** **(a)**. Seller ka 72 mahine ka record poora rehta hai, aur naam aur pata sirf ek band jagah se, audit ke saath, nikalta hai.
- **Trade-off:**
  - (a) me tax archive ka ek padhne ka raasta seller ke liye (SR-088 ke saath).
  - (b) me seller apni copy kho de to wapas nahi.
  - (c) me har delete pe sellers ko khabar, aur customer ke delete ki baat bahar.
- **Kanooni detail:** delete ke baad seller ko customer ka naam aur pata dena (CL-020, CL-021): Lawyer (ya CA) se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(a)**, delete ke baad bhi seller archive se, finance ke raaste, ek-ek copy le sake, har download audit me. Record: [DECISIONS.md](DECISIONS.md) D-320.

### Q-258. Kanooni rok me chhote samay wale technical records bhi aayein ya nahi?

- **Status:** `Tay`. Topic: B13 (compliance), B15 (technical).
- **Sawal:** lagbhag 13 May 2027 se "sab data 1 saal" ki rok (D-250 niyam 2) hai. OTP ke hash, idempotency ke jawab, sessions, outbox aur inbox jaise chhote TTL wale records ki har deletion pe bhi rok ki copy bane?
- **Kyun zaroori:** in records ki ginti bahut zyada hai; har deletion pe rok ki copy har cluster ki jagah kha jaati (R-031).
- **Vikalp:**
  - **(a) `tech` class rok me nahi:** retention class `tech` (§10.3 niyam 1) ke records rok me nahi aate, kyunki unka personal data (IP, samay) request logs me pehle se 1 saal rehta hai (D-285).
  - **(b) Sab rok me:** har deletion pe rok ki copy.
  - **(c) Sirf personal data wale technical records rok me:** har collection ki alag jaanch.
- **Salah:** **(a)**.
- **Trade-off:**
  - (a) me ek class pe niyam saaf, par Lawyer ki jaanch baaki.
  - (b) me jagah bhaari, clusters jaldi bharte.
  - (c) me har collection pe alag faisla aur kaam.
- **Kanooni detail:** `tech` class ko rok se bahar rakhna D-250 ki seema me aata hai ya nahi (CL-093): Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(a)**, `tech` class ke records kanooni rok me nahi. Record: [DECISIONS.md](DECISIONS.md) D-321.

### Q-259. Server ko din me kab aur kitni baar jagaayein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** koi app na khule tab bhi roz ke kaam (samay wale kaam, sellers ka din ka saar, audit ki jaanch, alerts) chalein, iske liye bahar ka pinger live server ko din me kis samay aur kitni baar jagaaye?
- **Kyun zaroori:**
  - D-028 kehta hai server baar-baar jagaya jayega, par samay aur kitni baar, ye tay nahi.
  - Render ki free web service ke mahine ke 750 ghante (R-008) isi se khatam hote ya bachte hain. [ARCHITECTURE.md](ARCHITECTURE.md) §9 me "raat ko server soya" hai, aur D-056 kehta hai 24 ghante jaagi rahe to bhi fit: dono ek hi niyam se saaf hone chahiye.
  - Jo kaam user karta hai wo server ko waise bhi jagata hai, aur jaagte hi sweep pichhla kaam pakad leta hai ([ARCHITECTURE.md](ARCHITECTURE.md) §4 niyam 1). Pinger sirf bina user wale kaamon ke liye hai.
- **Vikalp:**
  - **(a) Ghante me ek baar, 09:00 se 22:00 IST (din me 14 baar):** har jaag lagbhag 16 minute (15 minute khaali rehne pe server so jaata hai). Mahine me lagbhag 115 ghante, upar se asli use. Din me samay wale kaam zyada se zyada lagbhag 1 ghanta late, raat ke kaam subah.
  - **(b) Din me lagataar jaaga, 09:00 se 23:00 IST** (har 10 minute ping): mahine me lagbhag 435 ghante; din me kaam lagbhag 1 minute late.
  - **(c) 24 ghante jaaga:** mahine me lagbhag 744 ghante; 750 me lagbhag koi jagah nahi, aur ghante khatam to mahine ke baaki din saara backend band.
- **Salah:** **(a)**. Bina user ke sirf roz ke kaam aur saar bachte hain, unke liye ghante ki jaag kaafi hai, aur ghanton me sabse zyada jagah bachti hai. Lagataar jagaaye rakhne pe Render ka koi likhit niyam nahi mila, to kam se kam jagaana sabse surakshit.
- **Trade-off:**
  - (a) me raat ke kaam subah tak, aur din me lagbhag 1 ghante tak ki der.
  - (b) me ghanton ki aadhi jagah chali jaati hai, aur lagataar jagaane pe provider ki policy ka jokhim zyada.
  - (c) me ek galti (lamba deploy, zyada use) pe mahine ke baaki din backend band.
- **Tathya:** 750 ghante aur 15 minute ki neend DevOps / SRE agent ne provider ke docs se 2026-11-21 ko jaanche; main session ne source dobara nahi khola.
- **Owner ka jawab (2026-11-21):** **(a)**, pinger ghante me ek baar, 09:00 se 22:00 IST; raat ko server soya rehta hai. Record: [DECISIONS.md](DECISIONS.md) D-322.

### Q-260. Databases ka backup kitni baar ho?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** backup command (D-013) production me jaane se pehle ke alawa kitni baar chale?
- **Kyun zaroori:**
  - Atlas ke free cluster pe provider ka backup nahi milta, aur Neon free me sirf 6 ghante tak ka restore aur ek snapshot hai (DevOps / SRE agent ne provider ke docs se 2026-11-21 ko jaancha; main session ne source dobara nahi khola). Isliye aakhri backup ke baad ka data kisi galti ya provider ki ghatna me kho sakta hai: backup kitni baar hota hai, wahi data kho jaane ki seema hai.
  - Media provider ki files ka backup nahi hota (D-303); ye sawal sirf databases ka hai.
- **Vikalp:**
  - **(a) Sirf har release se pehle:** release mahine me ek ho to mahine bhar ka data jokhim me.
  - **(b) Har release se pehle aur hafte me ek baar** (misaal Sunday): aakhri backup 8 din se purana ho to hafte ki jaanch me laal nishaan. Data jokhim lagbhag 7 din.
  - **(c) Har release se pehle aur roz:** data jokhim lagbhag 1 din; owner ka roz lagbhag 10 minute, laptop pe personal data ki copy roz badalti, aur providers ke transfer (jaise Neon ka 5 GB/mahina) ka zyada hissa.
- **Salah:** **(b)**. R1 me asli data kam hai, aur hafte ka ek kaam owner ke hafte ke 30 ghante (D-009) me fit hai.
- **Trade-off:** zyada baar = kam data jokhim, par owner ka zyada samay aur laptop pe data ki zyada copies (R-023).
- **Kanooni detail:** asli business pe company ke books ka India me backup (CL-131) kitni baar zaroori: Lawyer ya CA se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(b)**, har release se pehle aur hafte me ek baar; aakhri backup 8 din se purana ho to hafte ki jaanch me laal nishaan. Record: [DECISIONS.md](DECISIONS.md) D-323.

### Q-261. Gambhir alerts owner kab tak dekhe, khaas kar raat me?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical), B13 (compliance).
- **Sawal:** system alert bhejta hai, par kaam ek hi insaan (owner) karta hai. Ops inbox ke alerts owner kab dekhe, aur raat me kaunse alerts use jagaayein?
- **Kyun zaroori:**
  - Kai ghadiyaan chhoti hain: CERT-In ko 6 ghante (D-248), court ya sarkari order pe content 3 ghante, aur nagnata wali report pe faisla 2 ghante (D-251).
  - Incident ke kram (SR-084) me likhna hoga ki alert kab dekha jaata hai; bina iske ye ghadiyaan sirf kaagaz pe hain.
- **Vikalp:**
  - **(a) Sirf din me:** ops inbox din me tay samay pe (misaal 09:00, 14:00, 20:00 IST); raat ke alerts subah.
  - **(b) Din ke tay samay, aur gambhirta 1 pe 24 ghante:** gambhirta 1 (paisa, dastavez, staff ya provider account, data leak ka shak, sarkari order) ka browser push owner ke browser pe raat me bhi; gambhirta 2 aur 3 subah.
  - **(c) Har alert pe 24 ghante browser push.**
- **Salah:** **(b)**. Raat ko server soya rehta hai (D-322), to gambhirta 1 ke alerts tabhi bante hain jab koi request aaye: raat me ye kam aayenge, par jo aayein wo chhootein nahi.
- **Trade-off:**
  - (a) me raat ki ghatna pe kanooni ghadi chhoot sakti hai.
  - (b) me kabhi-kabhi raat ko neend tootegi.
  - (c) me har chhote alert pe neend aur thakaan.
- **Kanooni detail:** CERT-In ki 6 ghante ki ghadi incident pata chalne se ginti hai (D-248); 2 ya 3 ghante wali ghadiyaan ek insaan ke system pe kaise poori hon: Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(b)**, ops inbox din ke tay samay pe, aur gambhirta 1 ka browser push raat me bhi; gambhirta 2 aur 3 subah. Record: [DECISIONS.md](DECISIONS.md) D-324.

### Q-262. Saajhe packages npm pe publish honge ya nahi?

- **Status:** `Tay`. Topic: B15 (technical), B16 (dhaancha).
- **Sawal:** `packages/` ke saajhe packages kabhi public npm pe publish honge, aur kab?
- **Kyun zaroori:**
  - D-023 kehta hai packages ke CLI pe naya kaam tabhi jab publish ka plan bane.
  - Plan hone ya na hone se R1 ke CI, release workflow, versions aur changelog ka kaam badalta hai. npm pe publish har baar sirf owner ke haath se hota hai.
- **Vikalp:**
  - **(a) Abhi koi publish nahi:** har package `private: true`, aur CI ye pakka kare; R1 ke baad dobara dekhna.
  - **(b) R1 ke baad chune hue packages** (misaal utils, India ke validation helpers, UI components) public npm pe, trusted publishing aur provenance ke saath, har publish owner ke haath se.
  - **(c) Har package har release pe publish.**
- **Salah:** **(a)**. Publish har package ke version, changelog aur supply chain (R-026) ka bojh laata hai, jo R1 ke order flow me madad nahi karta.
- **Trade-off:**
  - (a) me portfolio me packages npm pe nahi dikhte.
  - (b) me R1 ke baad versions, changelog aur supply chain ka kaam.
  - (c) me har release pe sabse zyada bojh aur jokhim.
- **Owner ka jawab (2026-11-21):** **(a)**, abhi koi publish nahi; har package `private: true` aur CI me iska pehra; R1 ke baad owner dobara dekhe. Record: [DECISIONS.md](DECISIONS.md) D-325.

### Q-263. OPERATIONS batch 1: environments aur laptop ka setup maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 10 niyam (teen jagah (laptop, CI, live), koi staging nahi, laptop ka infra aur version ka mel, sirf zaroori containers, `.env.example` ke teen hisse, ek command ka setup) [OPERATIONS.md](OPERATIONS.md) §1 me aayein?
- **Kyun zaroori:** laptop aur live ka farak (version, Redis ki memory) bugs chhupata hai, aur laptop, tests aur CI kabhi live data ko na chhooein.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har image aur version pinned rakhne ka kaam; (b) me owner ka samay; (c) me laptop ka setup baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 10 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-326.

### Q-264. OPERATIONS batch 2: CI aur branch ke pehre maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 12 niyam (ek `check` job, `guard` (secret scan, branch flow, `npm audit`), static checks, asli containers pe tests aur repo ke pehre, supply chain, CI me koi production secret nahi, rulesets) [OPERATIONS.md](OPERATIONS.md) §2 me aayein?
- **Kyun zaroori:** Render aur Vercel sirf green `check` pe deploy karein, aur public repo me secrets aur supply chain ka pehra ho (SR-082).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me CI ka chalne ka samay aur workflows sambhalna; (b) me owner ka samay; (c) me deploy aur branches ka pehra baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-327.

### Q-265. OPERATIONS batch 3: release, deploy, migrations aur rollback maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 12 niyam (release ka kram, Render aur Vercel ki settings, SIGTERM pe band hona, release step, expand aur contract, sirf ek release peeche rollback, smoke check, hotfix, release ka note) [OPERATIONS.md](OPERATIONS.md) §3 me aayein?
- **Kyun zaroori:** Render sirf pichhle 2 deploys tak wapas ja sakta hai, aur expand aur contract ke bina rollback data tod sakta hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har release pe kram aur smoke check ka samay; (b) me owner ka samay; (c) me release ka kram baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-328.

### Q-266. OPERATIONS batch 4: secrets aur config maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 10 niyam (secrets ki table (value kabhi nahi), kaunsa secret kahan, test aur live keys alag, config ka schema, do values ke saath badlav, kab badalna, providers pe MFA, settings DB me) [OPERATIONS.md](OPERATIONS.md) §4 me aayein?
- **Kyun zaroori:** repo public hai; secret kahan rahe, kaise badle aur test ya live key ka farak pehle se tay ho.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me saal me ek baar secrets badalne ka kaam; (b) me owner ka samay; (c) me secrets ka kram baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 10 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-329.

### Q-267. OPERATIONS batch 5: soya server, jagana aur samay wale kaam maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 12 niyam (jagane ke raaste, pinger sirf `/wake` ya `/health`, jagane ki khidki (D-322), do call aur UptimeRobot ka samay, jaag pe sweep, cold start 90 second, ghanton ka hisaab, Key Value khaali hone pe, lamba break aur Atlas resume) [OPERATIONS.md](OPERATIONS.md) §5 me aayein?
- **Kyun zaroori:** free server 15 minute me so jaata hai; D-322 ka niyam lagu karna hai, aur GitHub ke schedule ki kamiyaan sambhalni hain.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me do bahar ke pinger aur unki jaanch; (b) me owner ka samay; (c) me jagane ka kram baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-330.

### Q-268. OPERATIONS batch 6: backup aur restore maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 12 niyam (backup me kya aur kya nahi, providers ke backup pe bharosa nahi, kab (D-323), kahan, manifest, transfer ki seema, pehle laptop pe restore, production restore ka kram, har 3 mahine abhyaas, RPO aur RTO) [OPERATIONS.md](OPERATIONS.md) §6 me aayein?
- **Kyun zaroori:** free tier pe providers ka backup nahi milta, aur restore ke abhyaas ke bina backup pe bharosa nahi.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me hafte ka backup aur har 3 mahine ka abhyaas; (b) me owner ka samay; (c) me backup ka bharosa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-331.

### Q-269. OPERATIONS batch 7: monitoring, health aur alerts maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 9 niyam (`/health`, `/ready` aur `/wake`, alerts ke teen raaste, gambhirta ke teen level, alerts ki ginti ki seema, bahar ke free alerts, ops page, logs ki umar, "dead man" check) [OPERATIONS.md](OPERATIONS.md) §7 me aayein?
- **Kyun zaroori:** soye server pe hamare apne alerts nahi bante, isliye bahar ke free alerts bhi chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me bahar ke alerts set karna aur sambhalna; (b) me owner ka samay; (c) me alerts ka dhaancha baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 9 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-332.

### Q-270. OPERATIONS batch 8: incident ke runbooks maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 12 niyam (ek dhaancha, jawab ka samay (D-324), data leak (D-248), secret leak, provider account pe kabza, laptop kho jaaye, OOM, free tier khatam, sarkari order, chhote kram, seekh aur saal ka abhyaas) [OPERATIONS.md](OPERATIONS.md) §8 me aayein?
- **Kyun zaroori:** kanooni ghadiyaan chhoti hain (D-248, D-251), aur sab ek hi insaan sambhalta hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me runbooks ke drafts aur saal ka abhyaas; (b) me owner ka samay; (c) me incident ka kram baaki.
- **Kanooni detail:** data leak me "pakka" ki paribhasha aur users ko khabar ka samay: Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-333.

### Q-271. OPERATIONS batch 9: capacity aur free tier ki nigrani maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 7 niyam (hafte ki jaanch, numbers ki table git ke bahar, 70% pe kaam, ₹0 ki table har 6 mahine dobara, ek hi Render service, Vercel ke deploys, repo personal account me) [OPERATIONS.md](OPERATIONS.md) §9 me aayein?
- **Kyun zaroori:** free sharten bina khabar badal sakti hain, aur 70% pe pehle se kaam ho to service band nahi hoti.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me hafte ke 15 minute; (b) me owner ka samay; (c) me nigrani baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 7 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-334.

### Q-272. OPERATIONS batch 10: 512 MB pe memory ka naap maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 7 niyam (Docker me 512 MB aur kam CPU pe naap, chaar halat, kya naapna, nateeja aur D-049 kab khule, dobara naap, live se milaan, script sirf laptop pe) [OPERATIONS.md](OPERATIONS.md) §10 me aayein?
- **Kyun zaroori:** R-007: bundle mode 512 MB me chalega ya nahi, ye R1 se pehle naap se pata chalna chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me R1 se pehle aur har 3 mahine naap ka kaam; (b) me owner ka samay; (c) me memory ka jokhim bina naap ke.
- **Owner ka jawab (2026-11-21):** **(a)**, 7 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-335.

### Q-273. OPERATIONS batch 11: dependencies aur packages ka publish maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** DevOps / SRE ke 8 niyam (mahine ke dependency PRs, naye dependency ka review, Node ka version pinned, Atlas ka version, merge owner kare, `private: true` ka pehra (D-325), publish ka plan bane to uske niyam, fake registry) [OPERATIONS.md](OPERATIONS.md) §11 me aayein?
- **Kyun zaroori:** supply chain ka jokhim (R-026) aur D-325 ka pehra CI me chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me mahine ke dependency PRs ka review; (b) me owner ka samay; (c) me dependencies ka kram baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, 8 niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-336.

### Q-274. DevOps / SRE ke 12 naye risks maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** operations se nikle 12 naye risks ([RISKS.md](RISKS.md) R-043 se R-054) RISKS me aayein?
- **Naye risks (saar):**
  1. **R-043:** GitHub ke scheduled runs late ya chhoot jaate hain, aur 60 din bina activity ke band.
  2. **R-044:** Render keep-alive ko apne niyam ke khilaaf maane.
  3. **R-045:** Render ka rollback sirf pichhle do deploys tak.
  4. **R-046:** providers ka backup nahi, apna backup sirf laptop pe.
  5. **R-047:** Neon ka 5 GB/mahina transfer khatam ho to finance band.
  6. **R-048:** Vercel ke logs 1 ghanta, Render ke logs ki umar pata nahi.
  7. **R-049:** cold start aur Vercel ke 120 second ke beech kam jagah.
  8. **R-050:** saare alerts ek insaan pe, kanooni ghadiyaan chhoot sakti hain.
  9. **R-051:** lagbhag 20 secrets ka haath se badlav, galti se outage.
  10. **R-052:** providers ki free sharten bina khabar badalti hain.
  11. **R-053:** Atlas MongoDB ka version khud badhata hai.
  12. **R-054:** public repo me fix se pehle kamzori ki detail dikh jaaye.
- **Kyun zaroori:** inka bachav [OPERATIONS.md](OPERATIONS.md) me hai, par khatra RISKS me saaf dikhna chahiye.
- **Vikalp:** **(a)** saare bachav ke saath `Khula`; **(b)** kuch `Maana` (owner bataye); **(c)** risks roko.
- **Salah:** **(a)**. Har ek ka bachav likha hai, par ₹0 aur ek insaan ke kaam me khatra bacha hai.
- **Trade-off:** (a) me 12 aur khule risks; (b) me owner ka samay; (c) me khatre chhupe rehte.
- **Kanooni detail:** R-050 me kanooni ghadiyaan chhootne ka asar: Lawyer se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 naye risks bachav ke saath `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-337.

### Q-275. Operations ke 6 chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** tay faislon aur docs me 6 chhoti kamiyaan mili hain. Inke sudhaar maanein?
  1. **Release step ka samay:** [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 1 me jod: schema wala hissa listen se pehle, lambi data migration listen ke baad background me, lease ke saath. Warna naya instance cold start aur Vercel ke 120 second ki seema me nahi uthta.
  2. **UptimeRobot ka samay:** SR-078 me jod: check jaage server pe pade, jagane wale pinger ke kuch minute baad, warna cold start pe har baar jhootha "down" aur asli down shor me kho jaata hai.
  3. **Secret scan ka asli pehra:** SR-080 me jod: CI ka secret scan hi asli pehra; GitHub ka users wala push protection bypass ho sakta hai, aur repo ka push protection muft milta hai ya nahi, ye jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2 me.
  4. **Seekh kab likhein:** SR-084 me jod: LESSONS ki line fix live hone ke baad hi, bina personal data aur bina hamle ke tareeke ki detail, kyunki repo public hai.
  5. **Default branch aur schedule:** D-024 ke kram me jod: default branch badalne se pehle scheduled workflows (jaise server jagane wala) nayi default branch pe hon, kyunki GitHub ka schedule sirf default branch pe chalta hai.
  6. **Atlas projects ki ginti:** [RISKS.md](RISKS.md) §2.1 me: media aur logs judne se ab MongoDB ki 10 services = 10 projects aur clusters, 250 ki seema ke andar.
- **Kyun zaroori:** ye chhoti baatein chhoot jaayein to deploy ka health check fail, jhoothe alerts, ya chupchaap band jagana ho sakta hai.
- **Vikalp:** **(a)** chhaho sudhaar; **(b)** kuch sudhaar (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me chaar docs me chhote jod; (b) me owner ka samay; (c) me kamiyaan bachi rehti.
- **Owner ka jawab (2026-11-21):** **(a)**, chhaho sudhaar. Record: [DECISIONS.md](DECISIONS.md) D-338.
### Q-276. Brand ke rang ki disha

- **Status:** `Tay`. Topic: B2 (apps). Group G23.
- **Sawal:** saare 11 apps ke brand rang kis disha me hon?
- **Kyun zaroori:** docs me brand ka koi rang tay nahi. Tokens, har jodi ka contrast, install icons, invoice aur label ke PDF, charts aur order status ke rang sab isi pe tike hain. Baad me badalna matlab har screen ka visual test dobara.
- **Vikalp:**
  - **(a) Garam rose + gehra plum + champagne gold accent, garam neutrals (ivory se ink).** Misaal: brand rose `rgb(214, 51, 108)`, plum `rgb(92, 26, 70)`, gold `rgb(196, 154, 82)`, page ivory `rgb(253, 248, 245)`, ink `rgb(28, 22, 25)`. Ginti: rose pe safed text 4.62:1, ivory pe ink 16.91:1 (UX / Product Architect agent ne WCAG ke formula se gina, kisi audit tool se nahi).
  - **(b) Neutral premium:** lagbhag kaala-safed UI aur ek hi accent (misaal gehra rose) sirf main buttons aur links pe; rang product photos se aata hai.
  - **(c) Halka pastel (blush, lilac, mint):** naram roop; par pastel pe text ke liye har rang ka alag gehra roop chahiye, aur contrast ka kaam sabse zyada.
- **Salah:** **(a)**. Beauty category me garam rose aur plum pehchaan banate hain; garam neutrals product photos (skin tones) ke saath thande grey se kam takraate hain; aur 50 se 950 tak ki poori scale ke contrast pehle se gine ja sakte hain.
- **Trade-off:** (a) me rose button pe safed text 4.62:1 hai, AA (4.5) se thoda hi upar, to hover aur pressed roop gehre hi hon, kabhi halke nahi. (b) me pehchaan kam, site "aam" lagti hai. (c) me accessibility ka kaam aur galti ka mauka zyada.
- **R1 ya baad me:** R1 (pehli screen se pehle).
- **Owner ka jawab (2026-11-21):** **(a)**, garam rose, gehra plum aur champagne gold accent, garam neutrals ke saath; hover aur pressed roop hamesha gehre. Record: [DECISIONS.md](DECISIONS.md) D-340.

### Q-277. Fonts

- **Status:** `Tay`. Topic: B2 (apps). Group G23.
- **Sawal:** apps ka text kis font me ho?
- **Kyun zaroori:** font page ke wazan (India se Singapore aur Vercel CDN, R-012), daam ke ankon ki line (tabular figures) aur ₹ ke nishaan pe asar karta hai. Rang aur font ka mood ek saath chuna jaata hai. Docs chup hain.
- **Vikalp:**
  - **(a) Do self-hosted variable fonts (OFL license):** body aur UI ke liye Plus Jakarta Sans, Customer app ki headings ke liye Fraunces; daam aur tables hamesha body font me `tabular-nums` ke saath. Sirf Latin subset jisme ₹ (U+20B9) ho, woff2 me: misaal sans lagbhag 32 KB, display lagbhag 36 KB (italic alag, sirf zaroorat pe). Staff apps me sirf sans.
  - **(b) Ek hi sans font** (misaal Plus Jakarta Sans) saare apps me, headings bhi.
  - **(c) System font stack** (download 0 KB): har phone aur laptop pe alag roop.
- **Salah:** **(a)**. Customer app ko brand ka roop milta hai, staff apps halke rehte hain; dono fonts apne app ke saath Vercel se aate hain (bahar ka font CDN nahi, SR-006 ki bhaavna), `font-display: swap` aur sirf ek preload.
- **Trade-off:** (a) me Customer app ki pehli load pe lagbhag 70 KB zyada; (b) me roop saada; (c) me ₹ aur ank har device pe alag dikh sakte hain aur brand ka roop nahi.
- **Kanooni detail:** fonts ka license (OFL) license ki list (CL-125) me; Lawyer ya CA se nahi jaancha.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, Plus Jakarta Sans (body aur UI) aur Fraunces (Customer app ki headings), dono self-hosted; daam aur tables me `tabular-nums`; staff apps me sirf sans. Record: [DECISIONS.md](DECISIONS.md) D-341.

### Q-278. Dark theme kab aur kahan

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** dark theme kis release me aur kin apps me ho?
- **Kyun zaroori:** tokens dono themes ke ek saath bante hain, par har screen ko do themes me test karna (visual aur contrast) kaam doguna karta hai. Docs chup hain.
- **Vikalp:**
  - **(a) R1 se saare apps me light aur dark:** default system ki setting, har app me toggle (Light, Dark, System); pasand sirf browser storage me (SR-027 isi ki ijazat deta hai). Print, PDF aur labels hamesha light.
  - **(b) R1 me sirf light;** tokens dono ke bane, toggle R2 me.
  - **(c) Customer app sirf light** (product photos ke rang ke liye), staff aur partner apps dono.
- **Salah:** **(a)**. Tokens ek baar bante hain; extra kaam sirf har screen ka do theme me screenshot test hai, jo E2E ke saath chalta hai. Staff raat me (ops inbox, D-324) aur partners dhoop me (Delivery) kaam karte hain; dono ko apni pasand chahiye.
- **Trade-off:** (a) me visual tests doguna; (b) me R2 me har screen dobara dekhna; (c) me ek app ka alag niyam.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, R1 se saare apps me light aur dark, default system ki setting aur har app me toggle; print, PDF aur labels hamesha light. Record: [DECISIONS.md](DECISIONS.md) D-342.

### Q-279. Customer app ka phone pe navigation

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** Customer app me phone pe neeche ki bar (bottom navigation) me kaunse tabs hon?
- **Kyun zaroori:** delivery code (D-072) door pe customer ko turant dikhana padta hai; order ka page jitna paas, utni tez delivery. Search aur cart kahan hain, ye bhi isi se tay hota hai.
- **Vikalp:**
  - **(a) 5 tabs: Home, Categories, Orders, Cart, Account;** search har list aur Home ke header me hamesha khula; wishlist header ke dil (heart) ke icon se.
  - **(b) 5 tabs: Home, Categories, Search, Cart, Account;** Orders Account ke andar.
  - **(c) Neeche bar nahi;** header me menu (hamburger), search aur cart.
- **Salah:** **(a)**. Door pe "Orders" ek tap me khulta hai aur wahan delivery code ka card sabse upar hota hai; search header me pehle se hai, to alag tab ki zaroorat nahi.
- **Trade-off:** (a) me wishlist ek tap door; (b) me delivery code do tap door; (c) me phone pe har cheez ek tap aur door, aur menu me cheezein chhupti hain.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, neeche 5 tabs: Home, Categories, Orders, Cart, Account; search header me, wishlist header ke icon se, aur Orders me delivery code ka card sabse upar. Record: [DECISIONS.md](DECISIONS.md) D-343.

### Q-280. Search ke sujhaav (typeahead)

- **Status:** `Tay`. Topic: B9 (search).
- **Sawal:** search box me likhte waqt sujhaav kaise aayein?
- **Kyun zaroori:** ₹0 pe server lagbhag 5 requests/second lagataar hi sambhaal sakta hai ([ARCHITECTURE.md](ARCHITECTURE.md) §9). Har akshar pe server call ek customer se hi 5 se 10 calls bana deti hai. Docs me sujhaav ka tareeka tay nahi.
- **Vikalp:**
  - **(a) Sujhaav nahi:** sirf Enter ya search button pe result.
  - **(b) Har akshar pe server se product sujhaav** (misaal 300 ms ruk ke, kam se kam 2 akshar).
  - **(c) Chhoti public list se sujhaav:** categories, brands aur concerns ki list ek public GET se, CDN pe cache (misaal 10 minute, SR-004 ki public cache list me), browser me hi filter; products ka search Enter pe.
- **Salah:** **(c)**. Ek customer ki ek call, aur sujhaav turant (network ke bina). Zero result pe sujhaav waise bhi D-152 se aate hain.
- **Trade-off:** (c) me product ke naam ka sujhaav nahi; (b) me free tier pe bhaar aur der (India se Singapore); (a) me sabse saada, par dhoondhna dheema.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(c)**, categories, brands aur concerns ki chhoti public list se browser me hi sujhaav; products ka search Enter pe. Record: [DECISIONS.md](DECISIONS.md) D-344.

### Q-281. Checkout ke kadam

- **Status:** `Tay`. Topic: B5 (checkout).
- **Sawal:** cart se order tak kitni screens hon?
- **Kyun zaroori:** payment gateway ki script sirf payment wale page pe aa sakti hai (SR-006), to payment alag route hi hoga. Kadam jitne kam, chhodne wale utne kam; par saari jaankari (batch ka MRP aur expiry, fee, delivery ki tareekh) order se pehle dikhni hai (D-067, D-107, CL-071).
- **Vikalp:**
  - **(a) Do screens:** "Checkout" (address, delivery ki tareekh ka vaada, payment ka tareeka, har item ka batch ka MRP aur expiry, poora breakup, "Place order"), phir online payment ho to "Payment" screen jahan gateway khulta hai; delivery pe UPI ho to seedha order ki screen.
  - **(b) Chaar kadam ka wizard:** Address → Delivery → Payment ka tareeka → Review.
  - **(c) Ek hi screen** jisme gateway bhi khule; tab CSP me gateway ka host checkout route pe khulega.
- **Salah:** **(a)**. Ek nazar me poora order, aur gateway ki script sirf Payment route pe. "Place order" pe hi stock rukta hai (D-118), to 15 minute ka timer Payment screen pe dikhta hai.
- **Trade-off:** (a) me checkout ki screen lambi (phone pe sections ke saath); (b) me kadam zyada aur har kadam pe server call; (c) me bina payment wale kaam (address badalna) bhi gateway ki script ke saath.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, do screens: "Checkout" pe poora order aur "Place order", phir online payment ho to alag "Payment" screen; delivery pe UPI ho to seedha order ki screen. Record: [DECISIONS.md](DECISIONS.md) D-345.

### Q-282. Browser push ki permission kab maangein

- **Status:** `Tay`. Topic: B11 (notifications).
- **Sawal:** Customer app browser notifications ki ijazat kab maange?
- **Kyun zaroori:** push band ho to delivery fail aur jawab maangne wali khabrein email se jaati hain (D-126, D-131), jo din ki chhat (D-142) khaati hain. Browser ka prompt ek baar "Block" ho jaaye to app dobara nahi maang sakta.
- **Vikalp:**
  - **(a) Pehle order ke baad:** order ki screen pe apna card ("Get delivery updates on this device?" jaisa) "Turn on" aur "Not now" barabar ke buttons ke saath; "Turn on" pe hi browser ka prompt. "Not now" ke baad misaal 30 din tak card nahi. Account → Notifications me hamesha.
  - **(b) Sign-up ke turant baad** browser ka prompt.
  - **(c) Kabhi apne aap nahi,** sirf Account → Notifications se.
- **Salah:** **(a)**. Wajah saaf ho to log zyada haan kehte hain, aur browser ka "Block" kam hota hai; pehle apna card isliye ki "Not now" ke baad bhi raasta khula rahe.
- **Trade-off:** (a) me pehle order se pehle push nahi (area khulne ki khabar, D-141, jinke push band unhe email se hi); (b) me "Block" zyada; (c) me push wale kam, emails zyada.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, pehle order ke baad order ki screen pe apna card ("Turn on" aur "Not now"), "Turn on" pe hi browser ka prompt; "Not now" ke baad misaal 30 din tak card nahi; Account → Notifications me hamesha. Record: [DECISIONS.md](DECISIONS.md) D-346.

### Q-283. Customer ke address ka pin

- **Status:** `Tay`. Topic: B1 (delivery), B14 (security).
- **Sawal:** customer ke address ki location (pin) R1 me kaise bane?
- **Kyun zaroori:** delivery ke saboot me address ke pin se partner ki doori ka nishaan hai (SR-055, misaal 300 m), aur SR-001 location tabhi kholta hai jab address pin bane. India ke address aksar adhoore hote hain; sahi pin se partner sahi ghar tak pahunchta hai. Bina pin ke doori ka check chalega hi nahi.
- **Vikalp:**
  - **(a) Sirf "Use my current location"** (browser ki location, ek hi baar, accuracy ke saath, hataya ja sake); koi map nahi.
  - **(b) Form aur Ola Maps dono:** form khud bhare, ya map pe search kare to form aur lat/lng apne aap bhar jaayein; map pe pin khud chune; aur "Use my current location" bhi. Free seema abhi har API lagbhag 100,000 calls har mahina ([RISKS.md](RISKS.md) §2.6).
  - **(c) OpenStreetMap ke free tiles** pe khiskane wala pin (unki usage policy aur attribution jaanchna baaki).
  - **(d) R1 me pin nahi;** doori ka check R2 se.
- **Salah:** **(a)**, ₹0 aur koi naya processor nahi. Par jaanch ke hisaab se Ola ki free seema demo ke liye kaafi hai, to (b) bhi ₹0 me chal sakta hai, bina map wale raaste ke saath.
- **Trade-off:** (a) me galat jagah se dabaya to galat pin, aur adhoore address me madad nahi; (b) me naya processor (Ola), browser me API key (domain ki whitelist), attribution, aur free seema ya sharten badal sakti hain (R-064); (c) me tiles ki shartein aur bhaari page; (d) me daawe ki jaanch kamzor.
- **Kanooni detail:** address aur location personal data hain, aur (b) me Ola tak jaate hain; Ola ki terms ke hisaab se Ola ke End User Terms aur Privacy Policy users ko dikhani hai. Lawyer se nahi jaancha.
- **R1 ya baad me:** R1 (delivery ka saboot R1 me hai).
- **Owner ka jawab (2026-11-21):** **(b)**, owner ne khud chuna: form aur Ola Maps dono; map pe search kare to form apne aap bhare aur lat/lng bhi save ho; map pe pin khud chune; "Use my current location" bhi; Ola ki limit (lagbhag 100,000) ki chinta nahi. Record: [DECISIONS.md](DECISIONS.md) D-347.

### Q-284. R1 me Customer app ka Home

- **Status:** `Tay`. Topic: B2 (apps), B4 (promotions).
- **Sawal:** jab tak Growth Studio (R2) nahi, Home pe kya dikhe?
- **Kyun zaroori:** Home ka content Marketing Head ka kaam hai (D-047, Growth Studio), jo R1 me nahi. R1 ka Home khaali ya haath se bana nahi hona chahiye, aur sirf sach aankde (D-154) aur kisi seller ka boost nahi (D-139) laagu hain.
- **Vikalp:**
  - **(a) Sirf data se bane hisse:** pincode ka card (area live hai ya nahi, D-046), categories, "Bestseller" (D-154 ke niyam se), naye products, top rated; koi banner nahi.
  - **(b) (a) + 1 se 3 static banners** (image + link) Master ki setting se.
  - **(c) Growth Studio ka chhota banner editor R1 me** (R1 ka scope badhta hai).
- **Salah:** **(a)**. Koi naya role ya upload ka raasta nahi, aur har hissa niyam se bana to bhed ka sawal nahi.
- **Trade-off:** (a) me Home kam sajaa; (b) me ek setting aur image upload, aur banners ka maalik role R1 me chahiye; (c) R1 me naya kaam.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, R1 ka Home sirf data se bane hisson se: pincode ka card, categories, Bestseller, naye products aur top rated; koi banner nahi. Record: [DECISIONS.md](DECISIONS.md) D-348.

### Q-285. Server jaagne ke parde pe kya

- **Status:** `Tay`. Topic: B15 (technical), B2 (apps).
- **Sawal:** app khulne pe jab server jaag raha ho (cold start 90 second tak), parde pe kya ho?
- **Kyun zaroori:** raat 22:00 se 09:00 IST aur din me bhi 15 minute khaali rehne pe server soya hota hai (D-322, [OPERATIONS.md](OPERATIONS.md) §5), to bahut se visits ki pehli cheez yahi parda hai. Jawab se pehle koi API call nahi ([ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 14) tay hai; parde ka roop tay nahi.
- **Vikalp:**
  - **(a) Saada parda:** pehle misaal 1.5 second sirf page ka rang aur patli progress bar (jaage server pe bas ek jhalak); phir logo, ek line "Starting up. This can take up to a minute on our free server." aur andaaze wali progress bar; misaal 150 second baad "Try again". Customer app me demo ki patti bhi.
  - **(b) (a) + bundle me rakhi static jaankari** (About aur contact) bina server ke.
  - **(c) Customer app me bundle ki images ka "lookbook"** jab tak server jaage.
  - **(d) (a) ka parda sirf pehli jaag pe, aur jaagne ke baad background ping:** jab tak server na jaage app ka access nahi; jaagne ke baad app, jab tak use ho raha ho, har kuch minute server ko background me ping kare taaki wo jaaga rahe; ping pe koi loading screen nahi.
- **Salah:** **(a)**. Jaage server pe parda dikhta hi nahi; soye pe saaf sandesh. Static copies (b) purani ho sakti hain, kyunki legal pages aur contact settings se aate hain (D-150).
- **Trade-off:** (a) me intezaar me kuch padhne ko nahi; (b) me do jagah ki jaankari ka mel bigad sakta hai; (c) me bundle bhaari.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(d)**, owner ne khud chuna: pehli jaag pe wahi parda jo bana hai, aur jab tak server na jaage app ka access nahi; jaagne ke baad app use hote tak har kuch minute background me ping, bina loading screen ke. Record: [DECISIONS.md](DECISIONS.md) D-349.

### Q-286. Icons ka set

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** apps ke icons kis open set se liye jaayein?
- **Kyun zaroori:** icons ka license har copy pe laagu hota hai, aur license ki list (CL-125) me har asset ka license aur attribution chahiye. Ek set se roop ek jaisa rehta hai.
- **Vikalp:**
  - **(a) Lucide (ISC license):** 24 px grid, 2 px stroke; sirf istemaal hone wale SVG apne icons package me copy; license ka notice ek file me.
  - **(b) Solar (CC BY 4.0):** zyada style; har app me "Icon credits" page zaroori.
  - **(c) Phosphor (MIT):** kai weights; license notice ek file me.
  - **(d) icones.js.org (Iconify ke open sets) se copy, apna icons package:** sirf istemaal hone wale icons ek baar copy, runtime pe koi bahar ki library ya API nahi; mukhya set Solar, doosra Lucide, uske baad baaki; sab apps me ek saajha Credits page, jisme har package ka credit component.
- **Salah:** **(a)**. Saada license, e-commerce ke saare aam icons, ek jaisa stroke; beauty ke khaas icons (lipstick, swatch) apne banaye, usi grid pe.
- **Trade-off:** (a) me beauty ke icons apne banane padte hain; (b) me credit page har app me; (c) me weights ka chunaav har jagah.
- **Kanooni detail:** icons ka license CL-125 ki list me; Lawyer ya CA se nahi jaancha.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(d)**, owner ne khud chuna: icons icones.js.org se copy karke apna icons package; mukhya set Solar (CC BY 4.0), doosra Lucide (ISC), uske baad baaki sets; icons ka alag page nahi: sab apps me ek hi saajha Credits page, jisme har package (icons, aage charts, Ola Maps) apna credit component deta hai aur har app wahi jodta hai jo wo use karta hai. Record: [DECISIONS.md](DECISIONS.md) D-350.

### Q-287. Phone ki location na mile to photo wali delivery

- **Status:** `Tay`. Topic: B1 (delivery), B11 (disputes).
- **Sawal:** code na mile aur partner ke phone se location na mile (GPS band, ijazat mana, ya andar signal nahi), to kya photo wali delivery ho sakti hai?
- **Kyun zaroori:** D-072 niyam 2 ka saboot photo **aur** location hai. Location kabhi-kabhi milti hi nahi; tab app kya kare, tay nahi. Code wali delivery online hoti hai (D-301), par photo wala raasta usi pal ki location pe tika hai.
- **Vikalp:**
  - **(a) Location ke bina photo wali delivery band:** app wajah dikhaye ("Turn on location" ka raasta); na ho sake to "attempt fail" (D-108) ya Hub Manager se baat (D-301 jaisa).
  - **(b) Location ke bina bhi photo wali delivery,** "No location" ke nishaan ke saath; aisi har delivery Support ki jaanch ki list me, aur daawa aaye to D-072 niyam 3 ka "koi saboot nahi" jaisa maana jaaye.
  - **(c) (b), par partner ke liye mahine me tay seema** (misaal 3); seema ke baad (a).
- **Salah:** **(c)**. Asli duniya me GPS kabhi-kabhi fail hota hai, aur har baar parcel ka RTO (Return to Origin: parcel wapas warehouse, [GLOSSARY.md](GLOSSARY.md)) customer ke liye nuksaan hai (saamaan nahi mila) aur hamare liye kharcha (wapas laana, jaanch, dobara stock); seema se galat istemaal ruka rehta hai aur D-072 niyam 4 ka record bhi banta hai.
- **Trade-off:** (a) me saboot pakka, par RTO aur fail koshishein badhti hain; (b) me saboot kamzor aur daawe pe nuksaan platform ka; (c) me ek aur setting aur ginti.
- **R1 ya baad me:** R1 (delivery ka saboot R1 me hai).
- **Owner ka jawab (2026-11-21):** **(c)**, location ke bina bhi photo wali delivery "No location" ke nishaan ke saath, Support ki jaanch ki list me, daawa aaye to "koi saboot nahi" jaisa; har partner ke liye mahine me tay seema (misaal 3), uske baad location ke bina band. Record: [DECISIONS.md](DECISIONS.md) D-351.

### Q-288. DESIGN batch 1: design ke siddhaant maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 9 niyam (bharosa pehle, ek design system, kaam ke hisaab se device, server ka sach, koi dark pattern nahi, saaf halat, sabke liye, halka aur tez, demo saaf) [DESIGN.md](DESIGN.md) §1 me aayein?
- **Kyun zaroori:** har screen ka faisla inhi siddhaanton se, aur dark patterns ki rok (CL-070 se CL-073) design me hi.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har naye component pe in niyamon ki jaanch. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-352.

### Q-289. DESIGN batch 2: rang ke tokens aur light theme maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 10 niyam (sirf apne tokens, 11 step ki palette, light ke semantic tokens ratios ke saath, text sirf text wale tokens me, hover gehra, ulti patti, rang akela matlab nahi, order status ke tone, charts, CI me contrast ki jaanch) [DESIGN.md](DESIGN.md) §2 me aayein?
- **Kyun zaroori:** D-340 ke rang ko asli tokens aur har jodi ke contrast me badalna, taaki koi screen AA se neeche na jaaye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me CI ka contrast script banana aur Tailwind ke default rang hatana. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-353.

### Q-290. DESIGN batch 3: dark theme aur high contrast maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 7 niyam (theme ka chunaav, dark ke semantic tokens, dark me hover halka, dark me charts, images aur swatches kabhi invert nahi, high contrast 7:1, print hamesha light) [DESIGN.md](DESIGN.md) §3 me aayein?
- **Kyun zaroori:** D-342 ki dark theme ke tokens aur high contrast (Delivery ka Sunlight mode) ek saath tay hon.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har screen ka teen roop me test. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-354.

### Q-291. DESIGN batch 4: typography, spacing, radius, shadow, layers aur motion maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 12 niyam (D-341 ke fonts, size scale, weights, ank, paisa aur tareekh en-IN me, order number aur codes, spacing, radius, shadows, layers, motion, reduced motion) [DESIGN.md](DESIGN.md) §4 me aayein?
- **Kyun zaroori:** saare apps ek hi scale pe, aur paisa, tareekh aur codes har jagah ek roop me.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me ek saajha formatting helper aur tokens ka package. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-355.

### Q-292. DESIGN batch 5: breakpoints, layout aur app parivaar maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 10 niyam (breakpoints, shell ke size, media ratios, Customer app, partner dashboards, staff data-dense apps, Logistics Ops, Delivery PWA, app ki pehchaan, sign-in pe app ka host) [DESIGN.md](DESIGN.md) §5 me aayein?
- **Kyun zaroori:** 11 apps ke layout kaam ke hisaab se, aur nakli sign-in page pehchanna aasaan (R-017).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har app parivaar ka apna shell. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-356.

### Q-293. DESIGN batch 6: components aur screen ki halatein maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 14 niyam (react-aria-components ki neev, bunyadi aur commerce components, loading, khaali halat, error ka map, rukawat ke sandesh, offline, jaagne ka parda, idle warning, forms, pakka karne wale dialog, optimistic UI ki seema, gol kone ke dibbe me scroll) [DESIGN.md](DESIGN.md) §6 me aayein?
- **Kyun zaroori:** har error aur halat ka ek roop har app me, ARCHITECTURE §5 aur SR-009 ke saath.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me components ki lambi list, har ek ki playground aur test. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-357.

### Q-294. DESIGN batch 7: icons, logo, images aur media maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 9 niyam (apna icons package, icon ki accessibility, logo, product images, alt text data se, shade, private media, camera, video) [DESIGN.md](DESIGN.md) §7 me aayein?
- **Kyun zaroori:** images ka wazan aur private media ki suraksha (D-296, SR-005) design ka hissa bane.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me apne beauty icons banana aur alt text ka generator. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-358.

### Q-295. DESIGN batch 8: accessibility (WCAG 2.2 AA) maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** UX / Product Architect ke 12 niyam (lakshya aur automated jaanch, contrast, focus, keyboard, touch targets, dragging ka vikalp, screen reader, forms, kai kadam wale forms, madad ek jagah, zoom aur reflow, charts ki table) [DESIGN.md](DESIGN.md) §8 me aayein?
- **Kyun zaroori:** asli users me har tarah ke log; CAPTCHA nahi (D-206) to sign-in bhi sabke liye khula rahe.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har release se pehle haath ki checklist ka samay. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-359.

### Q-296. DESIGN batch 9: kanooni aur bharose ki jaankari UI me kahan maanein?

- **Status:** `Tay`. Topic: B13 (compliance), B2 (apps).
- **Sawal:** UX / Product Architect ke 27 rows (MRP aur daam, expiry, batch badla, pack ki jaankari, ingredients aur allergen, claims, seller, return, delivery fee aur vaada, Bestseller, stock, kram, demo aur DUMMY, legal pages, grievance, sign-up ke consent, consent wapas, push, review photo, payment fail, cancel, account delete, partner ka notice, seller agreement, R2 ki medical line) [DESIGN.md](DESIGN.md) §9 me aayein?
- **Kyun zaroori:** har tay jaankari ki UI me ek pakki jagah, taaki koi zaroori baat chhoot na jaaye. Kya dikhe wo apne faisle me tay hai; yahan sirf kahan.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me product page lamba (phone pe accordion). (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-360.

### Q-297. DESIGN batch 10: security aur performance ke UI niyam maanein?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** UX / Product Architect ke 11 niyam (browser ki ijazatein, StepUpDialog, sign-in ke jawab, password, staff ki lists me chhupi jaankari, push aur emails ka text, user ka content, PWA cache, bundle ke budget, page ke targets, kam calls) [DESIGN.md](DESIGN.md) §10 me aayein?
- **Kyun zaroori:** security niyamon (SR-001 se SR-054) ka UI wala hissa aur ₹0 hosting pe tez pages (D-053).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me bundle aur page ke budget CI me. (b) me owner ka samay; (c) me design ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-361.

### Q-298. FLOWS batch 1: account aur sign-in maanein?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps).
- **Sawal:** UX / Product Architect ke 5 flows (FL-1 se FL-5: customer ka sign-up, customer ka sign-in, staff ka sign-in aur bada kaam, delivery partner ka sign-in, customer ka account delete) [FLOWS.md](FLOWS.md) §1 me aayein?
- **Kyun zaroori:** sign-in ke saare raaste aur unke fail hone ke tareeke ek jagah, security niyamon (SR-011 se SR-026) ke saath.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-362.

### Q-299. FLOWS batch 2: browse se order aur payment maanein?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments).
- **Sawal:** UX / Product Architect ke 3 flows (FL-6 se FL-8: area, pincode aur waitlist; cart se prepaid order; delivery pe UPI wala order) [FLOWS.md](FLOWS.md) §2 me aayein?
- **Kyun zaroori:** order ka paisa aur stock kai modules se guzarta hai; har kadam aur har fail ka raasta tay ho, taaki paisa kata par order nahi bana jaisi halat sambhli rahe.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-363.

### Q-300. FLOWS batch 3: order se delivery maanein?

- **Status:** `Tay`. Topic: B1 (delivery).
- **Sawal:** UX / Product Architect ke 2 flows (FL-9 pack se delivery tak, FL-10 delivery fail aur RTO) [FLOWS.md](FLOWS.md) §3 me aayein?
- **Kyun zaroori:** pick, pack, hub, partner aur door ka saboot ek kram me, D-072 aur D-351 ke saath.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-364.

### Q-301. FLOWS batch 4: cancel, return, daawa aur refund maanein?

- **Status:** `Tay`. Topic: B7 (returns), B11 (disputes).
- **Sawal:** UX / Product Architect ke 4 flows (FL-11 se FL-14: cancel, return se refund, parcel nahi mila ka daawa, appeal) [FLOWS.md](FLOWS.md) §4 me aayein?
- **Kyun zaroori:** customer ke paise wapas aane ke saare raaste aur unki seemaayein ek jagah.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-365.

### Q-302. FLOWS batch 5: seller: onboarding, listing, maal aur payout maanein?

- **Status:** `Tay`. Topic: B3 (catalog), B6 (settlement).
- **Sawal:** UX / Product Architect ke 4 flows (FL-15 se FL-18: seller onboarding, listing se live, maal warehouse me, payout) [FLOWS.md](FLOWS.md) §5 me aayein?
- **Kyun zaroori:** seller ke judne se paisa milne tak ka poora raasta, jaanch aur manzoori ke saath.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-366.

### Q-303. FLOWS batch 6: reviews maanein?

- **Status:** `Tay`. Topic: B8 (reviews).
- **Sawal:** UX / Product Architect ke 2 flows (FL-19 review likhna, FL-20 review ki report) [FLOWS.md](FLOWS.md) §6 me aayein?
- **Kyun zaroori:** reviews ka haq, moderation aur report ke samay ek jagah.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Har kadam tay faislon (D, SR, CL) se hai; koi naya niyam nahi.
- **Trade-off:** (a) me module ki TASK.md banne pe links jodna; (b) me owner ka samay; (c) me flows ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, flows jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-367.

### Q-304. UX / Product Architect ke 9 naye risks maanein?

- **Status:** `Tay`. Topic: B2 (apps), B15 (technical).
- **Sawal:** UX se nikle 9 naye risks ([RISKS.md](RISKS.md) R-055 se R-063) RISKS me aayein?
- **Naye risks (saar):**
  1. **R-055:** har pehli visit pe server jaagne ka parda.
  2. **R-056:** rose button pe safed text AA ke bilkul paas.
  3. **R-057:** 11 apps × teen roop ke visual tests ka bojh.
  4. **R-058:** khule tabs ki polling ka bhaar.
  5. **R-059:** phone pe lamba product page.
  6. **R-060:** idle logout me lamba form khona.
  7. **R-061:** Delivery app ka offline data mitna.
  8. **R-062:** iPhone pe push sirf installed app me (jaanchna baaki).
  9. **R-063:** warehouse ka network ruka to scan band.
- **Kyun zaroori:** inka bachav [DESIGN.md](DESIGN.md) aur baaki docs me hai, par khatra RISKS me saaf dikhna chahiye.
- **Vikalp:** **(a)** saare bachav ke saath `Khula`; **(b)** kuch `Maana` (owner bataye); **(c)** risks roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me 9 aur khule risks; (b) me owner ka samay; (c) me khatre chhupe rehte.
- **Owner ka jawab (2026-11-21):** **(a)**, 9 naye risks bachav ke saath `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-368.

### Q-305. Seller ka paisa kab payable, jab kharab maal ki return muddat lambi hai?

- **Status:** `Tay`. Topic: B6 (settlement), B7 (returns).
- **Sawal:** D-081 kehta hai line "sabse lambi return samay-seema" ke baad payable hoti hai, aur D-221 ne kharab maal ki muddat misaal 30 din kar di. To payable 7 din (man badla) ke baad ho ya 30 din ke baad?
- **Kyun zaroori:** D-221 ke asar me ye "finance ki charcha me" likha tha, par D-081 me jod nahi aaya. Seller app ki "kab payable" (D-081 niyam 5) aur payout ka flow (FLOWS FL-18) iske bina pakke nahi.
- **Vikalp:**
  - **(a) 30 din tak rokna:** har line sabse lambi muddat ke baad payable; udhaar kam, par chhote brand ka paisa lamba ruka.
  - **(b) Man badle wali muddat ke baad payable:** misaal 7 din ke baad payable; lambi muddat me baad ki kharab maal wali return D-071 ke udhaar ke raaste (D-081 ke asar me ye raasta pehle se).
  - **(c) (b) + rok ka hissa:** 7 din ke baad payable, par har line ka ek hissa (misaal 10%) 30 din tak ruka.
- **Salah:** **(b)**. Kharab maal wali returns kam hoti hain, brand ka paisa 30 din nahi rukta, aur udhaar ki seemaayein (D-071, D-103) khatra rokti hain.
- **Trade-off:** (a) seller ke liye dheema; (b) me kuch maamlon me udhaar; (c) me hisaab ka naya bojh.
- **Kanooni detail:** marketplace pe seller ko payment ki samay-seema: Lawyer ya CA se nahi jaancha.
- **Owner ka jawab (2026-11-21):** **(b)**, man badle wali return muddat (misaal 7 din) ke baad payable; baad ki kharab maal wali return D-071 ke udhaar se. Record: [DECISIONS.md](DECISIONS.md) D-369.

### Q-306. UX ke 2 chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B1 (delivery), B14 (security).
- **Sawal:** (1) D-072 me jod: niyam 2 me location na mile to D-351, aur niyam 3 ka "refund ya dobara maal" R1 me sirf refund (D-122). (2) SR-055 me jod: address ka pin D-347 se, pin na ho to "No pin", location na mile to D-351. Ye dono jod aayein?
- **Kyun zaroori:** D-072 aur SR-055 akele padhne wala R1 me galat samajh sakta hai; naye faisle (D-347, D-351) aur D-122 ka link wahin dikhna chahiye.
- **Vikalp:** **(a)** dono jod; **(b)** sirf ek (owner bataye); **(c)** koi jod nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me do faislon me ek-ek line; (c) me niyam aapas me bina link ke.
- **Owner ka jawab (2026-11-21):** **(a)**, dono jod. Record: [DECISIONS.md](DECISIONS.md) D-370.

### Q-307. Coverage ki seema ka gate kitna sakht ho?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** tests code ka kitna hissa chalate hain (coverage), iski seema se neeche aane pe kya ho: PR ruke, ya sirf report bane?
- **Kyun zaroori:**
  - Seema ka matlab tabhi hai jab uska asar ho. Par ek insaan ke kaam me (D-009) har PR pe sakht gate rukawat bhi ban sakta hai.
  - Paisa, stock aur permissions ki galti sabse mehngi hai; UI ki chhoti galti sasti.
- **Vikalp:**
  - **(a) Har area me sakht:** seema se neeche koi PR merge nahi.
  - **(b) Sirf mehngi jagahon pe sakht:** kernel packages (saajhe bunyadi packages, jaise paisa aur tax ka hisaab, authorization ke checks, transactions, outbox, idempotency) aur paisa, stock aur permissions ke code me seema se neeche PR rukta hai. Baaki areas me PR pe sirf report, aur release se pehle jaanch. Misaal seema: kernel 90% branch, paisa, stock aur permissions 85% branch, baaki 70% lines.
  - **(c) Kahin na roke:** sirf report.
- **Salah:** **(b)**. Jahan galti sabse mehngi hai wahan pakka pehra, aur baaki jagah rukawat nahi, par release se pehle nazar.
- **Trade-off:**
  - (a) me UI ke chhote badlav pe bhi bina zaroorat tests.
  - (b) me do tarah ke areas ki list sambhalni padti hai.
  - (c) me coverage dheere-dheere girta hai aur pata nahi chalta.
  - Coverage sirf batata hai ki line chali, ye nahi ki test sahi jaanchta hai; uske liye mutation testing hai.
- **R1 ya baad me:** R1 (pehle code se).
- **Owner ka jawab (2026-11-21):** **(b)**, kernel packages aur paisa, stock aur permissions ke code me coverage ki seema se neeche PR rukta hai; baaki areas me PR pe sirf report aur release se pehle jaanch. Seema ke number testing ke niyamon ke saath tay honge. Record: [DECISIONS.md](DECISIONS.md) D-371.

### Q-308. Mutation testing ka gate kahan chale?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** mutation testing (code me jaan-boojh ke chhoti galti daal ke dekhna ki koi test use pakadta hai ya nahi) me jo galti kisi test ne na pakdi ho (bacha mutant), wo PR rok de, ya sirf laptop pe kaam "done" hone ka hissa ho?
- **Kyun zaroori:**
  - CLAUDE.md batata hai ki mutation sirf teen jagah ho aur copy me ho, asli files me nahi. Par ye nahi batata ki bacha mutant merge roke ya nahi, aur run kahan ho.
  - CI ka checkout khud ek alag copy hai; laptop pe dev server chalta hai, jo file badalte hi reload hota hai.
- **Vikalp:**
  - **(a) CI me PR pe alag job:** sirf badli lines, sirf kernel packages aur paisa, stock aur permissions ke code me. Bina likhi wajah ka bacha mutant PR ka check laal karta hai. Kernel packages ka pehla poora run laptop pe background me, copy me.
  - **(b) Sirf laptop pe:** kaam ke Definition of Done ka hissa; CI me nahi.
  - **(c) Sirf release se pehle.**
- **Salah:** **(a)**. Pehra apne aap chalta hai aur bhoolne ka mauka nahi; CI ki copy asli files se alag hai; pehla poora run CLAUDE.md jaisa laptop pe background me.
- **Trade-off:**
  - (a) me un PRs ka samay aur CI ke minutes badhte hain jo in jagahon ko chhoote hain.
  - (b) me laptop pe bojh aur bhoolne ka mauka.
  - (c) me kamzor test der se pakde jaate hain, tab tak kai PR us pe tik chuke hote hain.
- **R1 ya baad me:** R1 (pehle code se).
- **Owner ka jawab (2026-11-21):** **(a)**, CI me PR pe alag job sirf badli lines pe (kernel packages aur paisa, stock aur permissions ka code); bina likhi wajah ka bacha mutant PR rokta hai; kernel packages ka pehla poora run laptop pe background me, copy me. Record: [DECISIONS.md](DECISIONS.md) D-372.

### Q-309. Flaky test pe retry ki chhoot ho?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** jo test bina code badle kabhi pass aur kabhi fail ho (flaky), use dobara chalane (retry) ki chhoot ho?
- **Kyun zaroori:** browser wale tests kabhi-kabhi bina bug ke fail hote hain. Retry na ho to PR rukte hain; retry ho to asli race (do kaam ek saath chalne se hui galti) chhup sakti hai.
- **Vikalp:**
  - **(a) Koi retry nahi:** ek fail matlab laal.
  - **(b) Sirf E2E (browser) tests pe ek retry:** retry se pass ho tab bhi summary me "flaky" dikhe aur uska issue bane. Unit aur integration tests, aur paisa, stock, permissions, idempotency aur events ke tests pe kabhi retry nahi.
  - **(c) Har test pe 2 retry.**
- **Salah:** **(b)**. Browser ki chhoti hichki se kaam nahi rukta, aur jahan race asli galti ho sakti hai wahan koi chhoot nahi.
- **Trade-off:**
  - (a) me chhoti hichki pe kaam rukta hai.
  - (b) me flaky tests ke issues ki list sambhalni padti hai.
  - (c) me race aur timing ke bug green ke peeche chhupte hain.
- **R1 ya baad me:** R1 (pehle code se).
- **Owner ka jawab (2026-11-21):** **(b)**, sirf E2E tests pe ek retry; retry se pass hone pe bhi "flaky" ka nishaan aur issue; baaki tests, aur paisa, stock, permissions, idempotency aur events ke tests pe retry nahi. Record: [DECISIONS.md](DECISIONS.md) D-373.

### Q-310. Chromium ke alawa browsers pe E2E kab chale?

- **Status:** `Tay`. Topic: B15 (technical), B2 (apps).
- **Sawal:** CI ki E2E Chromium pe tay hai ([OPERATIONS.md](OPERATIONS.md) §2 niyam 6). Doosre browser engines pe E2E kab chale?
- **Kyun zaroori:** iPhone pe har browser Safari ka engine (WebKit) chalata hai, aur push, install aur kuch CSS wahan alag chalte hain.
- **Vikalp:**
  - **(a) Nightly me WebKit aur Firefox, saare flows.**
  - **(b) Nightly me sirf WebKit, Customer app ke mukhya flows:** sign-up (FL-1), sign-in (FL-2), prepaid order (FL-7), cancel (FL-11), return se refund (FL-12) aur review (FL-19).
  - **(c) Sirf release se pehle laptop pe WebKit, mukhya flows.**
  - **(d) Sirf Chromium.**
- **Salah:** **(b)**. iPhone wale customers ka raasta har raat jaancha jaata hai, nightly chhota rehta hai, aur staff apps desktop Chromium pe hi chalte hain.
- **Trade-off:**
  - Linux ka WebKit asli iPhone ka Safari nahi, to (a) aur (b) bhi asli phone ki jagah nahi lete.
  - (a) me nightly lamba.
  - (d) me Safari ki dikkat live pe hi dikhegi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, nightly me WebKit pe Customer app ke mukhya flows (FL-1, FL-2, FL-7, FL-11, FL-12, FL-19); PR pe E2E Chromium pe hi. Record: [DECISIONS.md](DECISIONS.md) D-374.

### Q-311. Asli phone pe testing: kaunse phones aur kab?

- **Status:** `Tay`. Topic: B2 (apps), B1 (delivery). Group G24.
- **Sawal:** asli phone pe haath se testing kis phone pe, kitni baar aur kin flows pe ho?
- **Kyun zaroori:** camera se photo, location, Delivery app ka offline data (R-061), dhoop me padhna, UPI app ya bank ke page ke baad app me wapsi, aur iPhone ka push (R-062) desktop browser me pakke nahi hote.
- **Vikalp:**
  - **(a) Owner ka Android phone, har release se pehle:** Delivery app ke ek din ka kaam (pack se delivery FL-9, delivery fail aur RTO FL-10, return pickup) aur Customer app ka checkout.
  - **(b) (a) ke saath ek iPhone (apna ya udhaar), sirf R1 se pehle ek baar:** Customer app ka checkout, home screen pe install aur push.
  - **(c) Sirf R1 se pehle ek baar, Android pe.**
  - **(d) Asli phone nahi.**
- **Salah:** **(b)**. Delivery app ka asli jokhim phone pe hi dikhta hai, aur iPhone pe push aur install ek baar asli phone pe dekhe bina R-062 khula rehta hai.
- **Trade-off:**
  - (a) aur (b) me har release pe lagbhag ek ghanta.
  - (b) me iPhone ka intezaam; na mile to R-062 khula rehta hai.
  - (d) me Delivery app ki dikkat live pe hi dikhegi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, har release se pehle owner ke Android phone pe Delivery app ke ek din ka kaam aur Customer app ka checkout; R1 se pehle ek baar iPhone (apna ya udhaar) pe Customer app ka checkout, install aur push. Record: [DECISIONS.md](DECISIONS.md) D-375.

### Q-312. Screen reader ki haath ki jaanch kis par ho?

- **Status:** `Tay`. Topic: B2 (apps). Group G24.
- **Sawal:** release se pehle screen reader ki haath ki checklist ([DESIGN.md](DESIGN.md) DS-8.1) kaunse screen readers pe ho?
- **Kyun zaroori:** DS-8.1 checklist tay karta hai, par screen reader nahi; har screen reader ka vyavhaar alag hota hai. Q-311 (D-375) ke hisaab se iPhone R1 se pehle ek baar milta hai.
- **Vikalp:**
  - **(a) Har release:** NVDA (Windows laptop pe muft) desktop apps pe, aur TalkBack (Android) Customer aur Delivery apps pe.
  - **(b) (a) ke saath VoiceOver (iPhone) Customer app pe:** R1 se pehle ek baar, usi iPhone wale round me.
  - **(c) Sirf NVDA.**
- **Salah:** **(b)**. Customers aur delivery partners phone pe hain; iPhone ka round pehle se tay hai, to VoiceOver bhi usi me ho jaata hai.
- **Trade-off:**
  - Har screen reader seekhne aur chalane ka samay.
  - (c) me phone pe padhne ki dikkatein chhoot-ti hain.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, har release se pehle NVDA desktop apps pe aur TalkBack Customer aur Delivery apps pe; R1 se pehle ek baar VoiceOver pe Customer app, iPhone wale round me. Record: [DECISIONS.md](DECISIONS.md) D-376.

### Q-313. Har release pe owner kitna khoj wala (haath ka) testing kare?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** likhe hue tests ke alawa, owner khud app chala ke anjaani dikkatein dhoondhe (khoj wala testing): kitna aur kab?
- **Kyun zaroori:** automated tests likhe hue niyam jaanchte hain; ulajhne wala sandesh ya bahut lamba page insaan hi pakadta hai. Owner ke paas hafte ke 30 ghante hain (D-009).
- **Vikalp:**
  - **(a) Har release pe misaal 2 ghante:** badle flows pe chhote round (ek flow, ek lakshya, misaal 30 minute).
  - **(b) Sirf R1 se pehle ek bada round** (misaal 1 din), baad me sirf smoke check.
  - **(c) (a) ke saath, R1 se pehle allowlist (D-133) ke 1 ya 2 bharose ke testers ka ek round.**
  - **(d) Koi khoj wala testing nahi.**
- **Salah:** **(c)**. Har release pe chhota aur seemit samay, aur R1 se pehle nayi aankhon se ek round, kyunki banane wala apni galtiyan kam dekhta hai.
- **Trade-off:**
  - (c) me testers ke emails live pe personal data hain, aur unke sawalon ka samay lagta hai.
  - (d) me chhoti par chubhne wali galtiyan reh jaati hain.
- **Kanooni detail:** testers ka personal data privacy ke niyamon ([COMPLIANCE.md](COMPLIANCE.md) §5) ke andar; Lawyer ya CA se nahi jaancha.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(c)**, har release pe owner misaal 2 ghante badle flows pe chhote round, aur R1 se pehle allowlist ke 1 ya 2 bharose ke testers ka ek round; har haath ke check ka chhota record. Record: [DECISIONS.md](DECISIONS.md) D-377.

### Q-314. Kis gambhirta ka khula bug release roke?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** release ke waqt khule bugs me se kaunse release rokein?
- **Kyun zaroori:** release ke faisle ko saaf paimana chahiye, warna har release pe naye sire se behas hoti hai.
- **Gambhirta ka paimana:** **P0** paisa galat, data leak, security bypass ya data khona; **P1** koi flow ruka aur doosra raasta nahi; **P2** flow doosre raaste se chalta hai, ya paise ke bina koi galat jaankari; **P3** sirf dikhawat.
- **Vikalp:**
  - **(a) P0 aur P1 release rokein;** P2 release note me likh ke release chale.
  - **(b) Sirf P0 roke.**
  - **(c) P0, P1 aur P2 sab rokein.**
- **Salah:** **(a)**. Paisa, data aur koi bhi ruka hua flow live nahi jaata, aur chhoti galti release ko nahi rokti.
- **Trade-off:**
  - (a) me P2 ki list release notes me sambhalni padti hai.
  - (b) me koi flow toota hua live ja sakta hai.
  - (c) me chhoti galtiyon pe release der se.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, P0 se P3 ke paimane ke saath; khula P0 ya P1 release rokta hai, P2 release note me likh ke release chalta hai. Record: [DECISIONS.md](DECISIONS.md) D-378.

### Q-315. Design target ka load test kitni baar ho?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** design ke target ([ARCHITECTURE.md](ARCHITECTURE.md) §9, D-283) pe load test kitni baar ho?
- **Kyun zaroori:**
  - Load test laptop ke kuch ghante leta hai (setup, run, baad me data ki jaanch), aur owner ka samay seemit hai.
  - Laptop ke containers live ki free tier seemaayein poori nahi dikhate, to load test akela saboot nahi.
- **Vikalp:**
  - **(a) Har release se pehle.**
  - **(b) R1 se pehle ek baar, phir sirf us release me** jo order place, pack, delivery scan ya payout ka raasta badle, ya nayi service jode.
  - **(c) Sirf R1 se pehle.**
- **Salah:** **(b)**. Bina badlav ke dobara chalane se kuch naya nahi milta, aur load wale raaste badalte hi test dobara.
- **Trade-off:**
  - (a) me har release pe ghante.
  - (b) me har release pe tay karna padta hai ki load wala raasta badla ya nahi.
  - (c) me baad ke badlav ka load pe asar anjaana.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, R1 se pehle ek baar, phir sirf us release me jo order place, pack, delivery scan ya payout ka raasta badle ya nayi service jode. Record: [DECISIONS.md](DECISIONS.md) D-379.

### Q-316. Release ke live smoke order ka kya ho?

- **Status:** `Tay`. Topic: B15 (technical), B12 (analytics).
- **Sawal:** har release ke baad live smoke check ([OPERATIONS.md](OPERATIONS.md) §3 niyam 9) ek test-mode order payment tak banata hai. Us order ka aage kya ho?
- **Kyun zaroori:** order se stock rukta hai, emails din ki chhat (D-028) me gine jaate hain, aur "Bestseller" (D-154), search ke kram me bikri (D-139) aur owner ke aankde (D-149) badalte hain. Har release pe ek jhootha order customer ko dikhne wale aankde bigaadta hai.
- **Vikalp:**
  - **(a) Turant cancel aur "smoke" ka nishaan:** payment ke baad pack se pehle cancel; nishaan wala order bikri, Bestseller, search ke kram aur owner ke aankdon ki ginti se bahar.
  - **(b) Turant cancel,** baaki orders jaisa gina jaaye.
  - **(c) Poora delivery tak chalaya jaaye** (owner ke warehouse, hub aur partner ke accounts se).
- **Salah:** **(a)**, in niyam ke saath: nishaan sirf setting se tay ek allowlist account ke orders pe lagta hai, koi customer khud nahi laga sakta; finance ki entries aur audit me order waisa hi rehta hai (kuch mitta nahi), sirf ginti aur aankdon se bahar.
- **Trade-off:**
  - (a) me ek naya nishaan, uska test aur uski seema.
  - (b) me har release pe customer ko dikhne wale aankdon me thoda jhooth.
  - (c) me har release pe ghante.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, smoke order payment ke baad pack se pehle cancel hota hai, aur "smoke" nishaan (sirf setting se tay allowlist account pe) use bikri, Bestseller, search ke kram aur owner ke aankdon se bahar rakhta hai; finance aur audit me kuch nahi mitta. Record: [DECISIONS.md](DECISIONS.md) D-380.

### Q-317. QA batch 1: siddhaant, levels aur kab kya chalta hai maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** QA Architect ke testing ke 6 siddhaant, test levels ki table, "kab kya chalta hai" ki table, ₹0 CI me fit ke 5 niyam, contract tests ke 3 niyam aur 8 niyam (RT-1 se RT-8: har PR pe saare levels, asli engines ke containers, har test worker ka alag data, live jaisa bundle, facade aur events ke contract, har flow ki E2E, nightly pe gate nahi) [RULES.md](RULES.md) §4.1 me aayein?
- **Kyun zaroori:** testing ka dhaancha D-371 se D-380 ke faislon ko ek jagah jodta hai, aur har PR pe kya chalta hai ye pehle code se tay rehna chahiye.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har PR pe CI ka samay zyada (saare levels aur 20 flows), par galti PR pe hi pakdi jaati hai. (b) me owner ka samay; (c) me testing ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-381.

### Q-318. QA batch 2: test data, fakes aur ghadi maanein?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** test data aur seeds ke 6 niyam, bahar ki 9 services ke fakes ki table, ghadi ke 5 niyam aur 8 niyam (RT-9 se RT-16: asli personal data kabhi nahi, artifacts me sirf fake data, production me koi test raasta nahi, network bahar nahi, injected clock, fake aur asli test mode ka milaan, npm ka fake registry, edge proxy live jaisa) [RULES.md](RULES.md) §4.2 me aayein?
- **Kyun zaroori:** repo public hai, aur tests kabhi asli provider, asli paisa, asli inbox ya asli npm registry tak nahi pahunchne chahiye (CLAUDE.md).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har bahar ki service ka fake aur uska apna test banana, aur R1 se pehle asli test mode se ek milaan. (b) me owner ka samay; (c) me testing ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-382.

### Q-319. QA batch 3: paisa, stock aur permissions ke tests maanein?

- **Status:** `Tay`. Topic: B6 (paisa), B15 (technical).
- **Sawal:** integration ki gehrai ke 5 niyam (MongoDB, PostgreSQL, Valkey, ek saath requests, database operations ki ginti) aur 4 niyam (RT-17 se RT-20: ek saath N requests, paise pe property tests, har flow ka database operations ka budget, har mana hone wale raaste ka test) [RULES.md](RULES.md) §4.3 me aayein?
- **Kyun zaroori:** paisa, stock aur permissions ki galti sabse mehngi hai, aur asli users ek saath aate hain. Free cluster ki operations ki seema container me nahi dikhti, to uska pehra ginti se.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me concurrency aur property tests likhne ka samay, aur har flow ke budget ko sambhalna. (b) me owner ka samay; (c) me testing ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-383.

### Q-320. QA batch 4: mutation, coverage, flaky aur ginti maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** 6 niyam (RT-21 se RT-26: mutation ki teen jagah aur kernel packages ki list, bacha mutant, coverage ki seema area ke hisaab se, test ke naam me niyam ka id aur R1 ki ginti, flaky tests, `.only` aur `.skip`) [RULES.md](RULES.md) §4.4 me aayein?
- **Kyun zaroori:** D-371, D-372 aur D-373 ke faisle tabhi laagu hote hain jab kernel packages ki list, seema ke number aur ginti ka tareeka likha ho; naye docs me kernel packages ki list abhi kahin nahi thi.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me kernel packages ki list code ke saath sambhalni, aur mutation tool ki kuch baatein jaanchna baaki. (b) me owner ka samay; (c) me D-371 se D-373 adhoore.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-384.

### Q-321. QA batch 5: E2E, accessibility, visual aur performance maanein?

- **Status:** `Tay`. Topic: B2 (apps), B15 (technical).
- **Sawal:** 20 flows ki E2E table aur "poora R1" spec, accessibility aur visual ke 5 niyam, performance ki table, haath ki jaanch, aur 7 niyam (RT-27 se RT-33: asli browser me axe, 4 widths, screenshot sirf mukhya screens, haath ka record, p95 ka naap tay CPU seema pe, load test ke baad data ki sachchai, role aur label se elements) [RULES.md](RULES.md) §4.5 me aayein?
- **Kyun zaroori:** flows hi product hain; WCAG 2.2 AA (DESIGN) aur performance ke targets (D-053, DS-10.9, DS-10.10) ka pakka saboot yahi tests hain.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**. Saath me ek chhota sudhaar: D-342 ke "Asar" me "har screen ka visual test" tha; screenshot tests sirf mukhya screens pe (R-057), aur har screen ka contrast aur accessibility axe se dono themes me.
- **Trade-off:** (a) me CI ka samay aur screenshot baselines sambhalna; p95 ki CPU seema pehle naap ke saath likhni. (b) me owner ka samay; (c) me testing ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain, aur D-342 ke Asar me sudhaar. Record: [DECISIONS.md](DECISIONS.md) D-385.

### Q-322. QA batch 6: security, migrations, backup aur bugs maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** SR niyamon ke tests ki table, migration aur rollback ke 6 niyam, backup ke 3 niyam, COMPLIANCE rows ke automated checks ki table, aur 9 niyam (RT-34 se RT-42: har R1 SR ka test ya record, route × actor matrix, passive DAST, release step ke tests, backup ka round trip, security bug ki detail private, bug ka roop, gambhirta D-378 se, PR me "kaise jaancha") [RULES.md](RULES.md) §4.6 me aayein?
- **Kyun zaroori:** bahar ki security jaanch (pentest) nahi hai, to tests hi pehra hain; aur deploy, migration aur restore ki galti sabse mushkil ghadi me dikhti hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har R1 SR niyam ka test ya record, aur DAST ke findings sambhalna. (b) me owner ka samay; (c) me testing ka ye hissa baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-386.

### Q-323. QA batch 7: Definition of Done aur R1 ka release gate maanein?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha), B15 (technical).
- **Sawal:** Definition of Done ke 12 hisse (DD-1 se DD-12) [RULES.md](RULES.md) §1 me, aur R1 ke release gate ki 14 sharten (RG-1 se RG-14) RULES §2.1 me aayein?
- **Kyun zaroori:** "ho gaya" aur "release ho sakta hai" dono ka saaf paimana chahiye; inke bina D-019 ka "bana hai" aur CLAUDE.md ka "verified" andaaze pe rehte hain.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har subtask aur R1 pe poori list ki jaanch; R1 se pehle haath ke kaam (phone, screen reader, khoj wala testing, providers ka milaan). (b) me owner ka samay; (c) me "done" aur release ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, niyam jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-387.

### Q-324. Acceptance criteria kahan rahein?

- **Status:** `Tay`. Topic: B16 (docs aur dhaancha).
- **Sawal:** R1 ke 184 acceptance criteria abhi maane ja rahe hain, par `TASK.md` files planning stage me hi banti hain (D-004). Tab tak, aur uske baad, criteria kis file me rahein?
- **Kyun zaroori:**
  - [tasks/README.md](tasks/README.md) ke hisaab se criteria `TASK.md` me jaate, par wo files abhi nahi ban sakti.
  - Har baat sirf ek jagah honi chahiye ([README.md](README.md)); tests criteria ke id se jude hain ([RULES.md](RULES.md) RT-24), to ids ek hi jagah se aane chahiye.
- **Vikalp:**
  - **(a) Naya doc [ACCEPTANCE.md](ACCEPTANCE.md), hamesha ke liye:** saare criteria yahin; planning me har module ki `TASK.md` apne hisse ki link deti hai, copy nahi karti.
  - **(b) ACCEPTANCE.md sirf planning tak:** planning me criteria har `TASK.md` me chale jaayein aur file hat jaaye.
  - **(c) [PROJECT_PLAN.md](PROJECT_PLAN.md) me ek hissa.**
- **Salah:** **(a)**. Criteria ek doosre ke saath padhe jaate hain (service aur app dono ke), requirement ki ginti ki script ek hi file padhti hai, aur ids kabhi nahi badalte.
- **Trade-off:**
  - (a) me ek nayi file, aur `TASK.md` padhne wale ko ek link khol ke criteria dekhne padte hain.
  - (b) me planning me 184 criteria ka move aur links badalna.
  - (c) me PROJECT_PLAN bhaari aur uska kaam (modules, releases, progress) dhundhla.
- **R1 ya baad me:** abhi (discovery).
- **Owner ka jawab (2026-11-21):** **(a)**, naya doc [ACCEPTANCE.md](ACCEPTANCE.md) hamesha ke liye; `TASK.md` uske hisse ki link deti hai. Record: [DECISIONS.md](DECISIONS.md) D-388.

### Q-325. QA batch 8: PLATFORM, GATEWAY, AUDIT aur LOGS ke criteria maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** 32 criteria (AC-PLATFORM-1 se 12, AC-GATEWAY-1 se 9, AC-AUDIT-1 se 6, AC-LOGS-1 se 5: transactions ka retry, outbox aur events, timers, idempotency, tax ka hisaab, encryption, retention, config; edge ka secret, IP, seemaayein, errors ka roop; audit ki chain; logs ki redaction aur alerts) [ACCEPTANCE.md](ACCEPTANCE.md) §1.1, §1.2, §1.11 aur §1.13 me aayein?
- **Kyun zaroori:** baaki saari services inhi saajhe hisson pe tiki hain; inki galti har jagah dikhti hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har criterion ka test pehle code se. (b) me owner ka samay; (c) me in modules ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-389.

### Q-326. QA batch 9: IDENTITY, NOTIFY aur MEDIA ke criteria maanein?

- **Status:** `Tay`. Topic: B14 (security), B11 (khabrein).
- **Sawal:** 27 criteria (AC-IDENTITY-1 se 12, AC-NOTIFY-1 se 8, AC-MEDIA-1 se 7: allowlist, ek jaisa jawab, email code, rok, password, tokens, social sign-in, staff ka authenticator, invite, consent, delete; emails ki line aur chhat, push; upload ki rok, EXIF, private files, mitana) [ACCEPTANCE.md](ACCEPTANCE.md) §1.3, §1.4 aur §1.12 me aayein?
- **Kyun zaroori:** sign-in, khabrein aur files personal data aur security ke sabse bade darwaze hain (SR-011 se SR-031, SR-061, SR-062).
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me ghadi ke saath kai tests (session ki umar, code ki umar, invite). (b) me owner ka samay; (c) me in modules ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-390.

### Q-327. QA batch 10: CATALOG aur COMMERCE ke criteria maanein?

- **Status:** `Tay`. Topic: B3 (catalog), B5 (order).
- **Sawal:** 24 criteria (AC-CATALOG-1 se 12, AC-COMMERCE-1 se 12: ek brand ek seller, listing ke version, variants, daam aur MRP, Pro daam, zaroori fields, ingredients, claims, search ka kram, reviews; aakhri unit pe takraav, poora ulta, server ka total, batch aur FEFO, reservation, seemaayein, area, pack, cancel, pick ki kami, return, receiving) [ACCEPTANCE.md](ACCEPTANCE.md) §1.6 aur §1.7 me aayein?
- **Kyun zaroori:** stock aur daam ki galti seedhe customer aur seller ke paise pe padti hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me search ke kram ke tests ka Atlas Search wala hissa laptop aur CI pe tabhi jab uska local image chale (jaanchna baaki). (b) me owner ka samay; (c) me in modules ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-391.

### Q-328. QA batch 11: PAYMENTS aur FINANCE ke criteria maanein?

- **Status:** `Tay`. Topic: B6 (paisa).
- **Sawal:** 22 criteria (AC-PAYMENTS-1 se 10, AC-FINANCE-1 se 12: server ka gateway order, webhooks, ulta kram, der se payment, refunds ka jod, delivery pe UPI ka QR, milaan; journal barabar, books sirf jodte, bina gap invoice number, ek source ek journal, har seller ka invoice, credit note, fees ke documents, ARCHITECTURE §1.4 ki misaal, payable aur payout, do haath, ₹50,000 ka niyam, finance ka din) [ACCEPTANCE.md](ACCEPTANCE.md) §1.5 aur §1.9 me aayein?
- **Kyun zaroori:** paise ki har galti P0 hai (D-378), aur books ke niyam (D-282) tests se hi pakke hote hain.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har criterion pe concurrency aur property tests. (b) me owner ka samay; (c) me paise ke modules ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-392.

### Q-329. QA batch 12: LOGISTICS aur SUPPORT ke criteria maanein?

- **Status:** `Tay`. Topic: B1 (delivery), B11 (support).
- **Sawal:** 20 criteria (AC-LOGISTICS-1 se 12, AC-SUPPORT-1 se 8: pincode se ek hub, area kholna, delivery code, offline sync, photo wali delivery, delivery fail aur RTO, partner ki deewar, location sirf kaam ke pal pe, trip ki ginti, return pickup, vaade ki tareekh; apne aap manzoori, Support Agent ki seema, appeal, "parcel nahi mila", saboot, chhupi jaankari, signals, ek faisla) [ACCEPTANCE.md](ACCEPTANCE.md) §1.8 aur §1.10 me aayein?
- **Kyun zaroori:** delivery aur daawe dono taraf ke dhokhe ka raasta hain (D-072), aur inka saboot inhi niyamon se banta hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me offline aur location ke kuch hisse sirf asli phone pe pakke (D-375). (b) me owner ka samay; (c) me in modules ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-393.

### Q-330. QA batch 13: Customer, Seller aur Delivery apps ke criteria maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** 26 criteria (AC-CUSTOMER-1 se 10, AC-SELLER-1 se 6, AC-DELIVERY-1 se 10: jaagne ka parda, "Updated" line, daam aur expiry ka roop, seller ka block, koi pehle se tick nahi, payment ki CSP, delivery code card, demo ki patti, headers aur storage, push ka card; seller ke roles, bank, reports, daam ka dialog, payable, reviews; offline line, code ki rok, UPI QR, permission ki screen, data ki safai, session, Sunlight mode, update banner, return pickup) [ACCEPTANCE.md](ACCEPTANCE.md) §2.1, §2.2 aur §2.9 me aayein?
- **Kyun zaroori:** ye teen apps bahar ke users (customers, sellers, delivery partners) ke hain, aur unka bharosa inhi screens pe banta hai.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har criterion ki E2E jaanch, aur Delivery ke kuch hisse asli phone pe. (b) me owner ka samay; (c) me in apps ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-394.

### Q-331. QA batch 14: staff apps ke criteria maanein?

- **Status:** `Tay`. Topic: B2 (apps).
- **Sawal:** 33 criteria (AC-ADMIN-1 se 6, AC-SUPERADMIN-1 se 5, AC-MASTER-1 se 6, AC-SUPPORTDESK-1 se 5, AC-FINANCEAPP-1 se 5, AC-LOGISTICSOPS-1 se 6: listing ki jaanch aur appeal, moderation ki queue, chhupi jaankari, settings ka audit, idle warning; district ka switch aur deewar, step-up, area band; kill switch, allowlist, payout ki doosri manzoori, location import, ops page, Master ki seema; support ki queue aur ek faisla; payout batch, milaan, export, finance band; scan screen, receiving, pack, trip, partner ka phone, ruke parcels) [ACCEPTANCE.md](ACCEPTANCE.md) §2.3 se §2.8 me aayein?
- **Kyun zaroori:** staff ke haath me sabse bade kaam hain (paisa, manzoori, personal data), aur "do haath" aur audit ke niyam inhi screens pe dikhte hain.
- **Vikalp:** **(a)** jaise hain waise; **(b)** badlav ke saath (owner bataye); **(c)** batch roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har staff app ki E2E aur permission ke tests. (b) me owner ka samay; (c) me staff apps ka "done" ka paimana baaki.
- **Owner ka jawab (2026-11-21):** **(a)**, criteria jaise hain. Record: [DECISIONS.md](DECISIONS.md) D-395.

### Q-332. QA Architect ke 12 naye risks maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** testing se nikle 12 naye risks ([RISKS.md](RISKS.md) R-065 se R-076) RISKS me aayein?
- **Naye risks (saar):**
  1. **R-065:** fakes asli providers se alag chalein.
  2. **R-066:** containers aur free clusters ka farak (roles, seemaayein, Atlas Search, Neon ka pooler).
  3. **R-067:** poora CI run lamba.
  4. **R-068:** E2E me timing se flaky tests.
  5. **R-069:** samay wale niyamon me galti.
  6. **R-070:** mutation aur load test laptop pe bhaari.
  7. **R-071:** screenshots ki baseline baar-baar badle.
  8. **R-072:** asli personal data fixtures ya artifacts me.
  9. **R-073:** ek hi insaan tester.
  10. **R-074:** code aur test ek hi haath se.
  11. **R-075:** live smoke check free tier khaata hai.
  12. **R-076:** single-member replica set me majority write aur takraav poore nahi dikhte.
- **Kyun zaroori:** inka bachav [RULES.md](RULES.md) §4 aur D-371 se D-380 me hai, par tests green hone ke baad bhi jo khatra bachta hai wo RISKS me saaf dikhna chahiye.
- **Vikalp:** **(a)** saare bachav ke saath `Khula`; **(b)** kuch `Maana` (owner bataye); **(c)** risks roko.
- **Salah:** **(a)**.
- **Trade-off:** (a) me 12 aur khule risks; (b) me owner ka samay; (c) me khatre chhupe rehte.
- **Owner ka jawab (2026-11-21):** **(a)**, 12 naye risks bachav ke saath `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-396.

### Q-333. QA ke 5 chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** tay faislon pe QA Architect ke dhyaan ke points se 5 sudhaar aayein?
  1. [RULES.md](RULES.md) RT-31: server ke p95 ka pass ya fail [OPERATIONS.md](OPERATIONS.md) §10 niyam 1 ki live jaisi CPU seema (misaal `--cpus=0.1`) pe; 0.5 wala naap sirf tulna ke liye.
  2. RULES §4.6 me SR-019 ka niyam: CI me sirf body ki barabari aur kam se kam samay; samay ke farak ka naap laptop pe kai baar, ek seema ke saath.
  3. RULES RT-19: har flow ke database operations ka budget us module ki planning (`TASK.md`) me tay.
  4. OPERATIONS §2 niyam 6 me nightly WebKit (D-374) aur RULES ki link; §3 niyam 9 me smoke order ka niyam (D-380).
  5. [DESIGN.md](DESIGN.md) DS-8.1 me screen readers ke naam (D-376).
- **Kyun zaroori:**
  - CPU seema ke bina p95 ka nateeja 0.1 aur 0.5 pe kai guna alag hota, aur "pass" ka matlab tay nahi tha.
  - Samay ka chhota farak CI ke shor me pakka nahi naapa ja sakta.
  - D-374, D-376 aur D-380 ke niyam un docs me bhi dikhne chahiye jinhe log padhte hain.
- **Vikalp:** **(a)** paanchon; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me 0.1 CPU pe kuch targets (jaise password hashing aur PDF) fail ho sakte hain, tab ARCHITECTURE §9 ke targets dobara dekhne padenge. (c) me niyam aapas me bina link ke.
- **Owner ka jawab (2026-11-21):** **(a)**, paanchon sudhaar. Record: [DECISIONS.md](DECISIONS.md) D-397.

### Q-334. QA ke 5 lene layak niyam maanein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** pehle ke kaam se lene layak (D-074) 5 testing niyam [RULES.md](RULES.md) ke naye §4.7 me aayein (RT-43 se RT-47: collection scan ki chhoot sirf likhi wajah se, ids ka pehra, CI ki config ka apna test, release ka test report, aur 4 regression tests)?
- **Kyun zaroori:** ye pehre aur galtiyan pehle asli me kaam aaye ya ho chuke hain; baaki lene layak cheezein RULES §4.1 se §4.6 me pehle hi aa chuki hain.
- **Vikalp:** **(a)** paanchon; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me 5 aur pehre aur tests banane; (c) me jani-pehchani galtiyan dobara aa sakti hain.
- **Owner ka jawab (2026-11-21):** **(a)**, paanchon niyam. Record: [DECISIONS.md](DECISIONS.md) D-398.

### Q-335. Kanooni rok aur band FY ki file ki chaabi kahan rahe?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** kanooni rok me rakha data (delete ke baad ka, D-250), rok wali photos aur video (D-262) aur band FY ki export file (D-309): inhe kholne wali chaabi live server ke paas ho, ya sirf owner ke laptop ke raaste (offline)?
- **Kyun zaroori:**
  - D-250 kehta hai ye data sirf kanooni maang pe khule. Abhi har service ki `hold` key live server ke env me hai ([ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 4).
  - To server ki chaabiyon ka ek leak, aur database ya media provider ki pahunch, dono milke sab khol dete hain, delete hua personal data bhi.
- **Vikalp:**
  - **(a) Abhi jaisa:** har service ki apni chaabi live env me; kholna break-glass facade se.
  - **(b) Server pe sirf band karne wali (public) chaabi:** kholne wali (private) chaabi password manager me aur ek doosri offline copy me; kholna sirf laptop ke break-glass command se.
  - **(c) Sirf band FY ki file ke liye (b), baaki (a).**
- **Salah:** **(b)**. Ye data roz kabhi nahi khulta, to server ko kholne ki zaroorat hi nahi; server leak hone pe bhi band data band rehta hai.
- **Trade-off:**
  - (b) me kanooni maang pe kholna sirf owner ke laptop se. Chaabi kho jaaye to band data aur purane FY ki books hamesha ke liye band, isliye do offline copies aur saal me ek baar kholne ka abhyaas zaroori.
  - (a) me server ke ek leak pe sab khula.
  - (c) beech ka.
- **Kanooni detail:** Lawyer (AI) ne nahi jaancha: kanooni maang pe data kitni der me dena hota hai, aur laptop wala raasta us samay me chalega ya nahi.
- **R1 ya baad me:** R1 (rok ki copy R1 me banti hai).
- **Owner ka jawab (2026-11-21):** **(b)**, server pe sirf band karne wali (public) chaabi; kholne wali (private) chaabi password manager me aur ek doosri offline copy me, aur kholna sirf laptop ke break-glass command se. Record: [DECISIONS.md](DECISIONS.md) D-399.

### Q-336. Audit aur logs ke database ka dhaancha (indexes, TTL, validators) kaun badle?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** audit aur logs ke clusters me indexes, TTL aur validators ka badlav har boot pe live server ke release step se ho (baaki services jaisa), ya sirf owner ke laptop ke release command se?
- **Kyun zaroori:**
  - Boot ka release step ek alag release user se chalta hai jise TTL aur validators badalne ka haq hai ([ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 5), aur wo user live server ke env me rehta hai.
  - Hamlavar us user se audit ya logs ka TTL bahut chhota karke sab mita sakta hai, "sirf insert" wale user (D-317) ke bawajood. Audit hi staff ke kaam ka saboot hai.
- **Vikalp:**
  - **(a) Abhi jaisa:** boot pe, release user live env me; bachav sirf audit chain ka hash bahar likhna (mitana pakda jaata hai, rukta nahi).
  - **(b) Audit aur logs ke liye sirf laptop:** boot pe in dono me sirf jaanch (dhaanche ka fingerprint na mile to alert, badlav nahi); badlav laptop ke command se, alag credentials se. Baaki services boot pe hi.
- **Salah:** **(b)**, saath me audit chain ka hash bahar likhna bhi. Audit aur logs ka dhaancha kam badalta hai, to haath ka kadam kabhi-kabhi hi aata hai.
- **Trade-off:**
  - (b) me audit ya logs ke dhaanche wale release me owner ka ek haath ka kadam; bhoolne pe alert aane tak purana dhaancha.
  - (a) me koi haath ka kaam nahi, par mitana sambhav, aur pata baad me chalta hai.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, audit aur logs ke clusters ka dhaancha sirf laptop ke release command se, alag credentials se; boot pe in dono me sirf fingerprint ki jaanch aur alert; saath me audit chain ka hash bahar likhna. Record: [DECISIONS.md](DECISIONS.md) D-400.

### Q-337. Raat ke alerts ki push subscription kab tak rahe?

- **Status:** `Tay`. Topic: B14 (security), B11 (notifications).
- **Sawal:** Master app me owner ke alerts ki browser push subscription session ke saath khatam ho (baaki khabron jaisa), ya device ke saath rahe jab tak owner khud na hataye?
- **Kyun zaroori:**
  - Gambhirta 1 ke alerts raat me bhi push se aate hain (D-324).
  - SR-074 subscription ko session se baandhta hai, aur staff ka session 12 ghante ka hai (D-181). To agle din se raat ke alerts chupchaap band ho sakte hain.
- **Vikalp:**
  - **(a) Session ke saath** (abhi jaisa): session khatam, push band.
  - **(b) Device ke saath, sirf owner ke alerts:** session khatam hone pe bhi rehti hai; sirf "is device pe alerts band", device hatane ya account band hone pe hat-ti hai; payload me koi detail nahi.
- **Salah:** **(b)**, saath me subscription khatam hone pe gambhir email, aur roz ek test push.
- **Trade-off:**
  - (b) me band session wale device pe bhi "alert hai" ki khabar dikhti hai (bina detail); device chori ho to devices ki list se hatana padta hai.
  - (a) me raat ke alert ka bharosa nahi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, owner ke alerts ki subscription device ke saath, jab tak owner "is device pe alerts band" na kare, device na hataye ya account band na ho; payload me koi detail nahi; subscription khatam hone pe gambhir email, aur roz ek test push. Record: [DECISIONS.md](DECISIONS.md) D-401.

### Q-338. Request logs kaun aur kaise padhe?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** logs service ke request logs (IP, account id, route, samay; D-250 ke hisaab se 180 din, 2027 se 1 saal) kaun padh sakta hai?
- **Kyun zaroori:**
  - Logs me har user ka IP aur har kaam ka samay hai: ye personal data hai, aur incident ya kanooni maang pe yahi saboot hai.
  - Padhne ka haq tay nahi. Bina niyam ke ye staff ke liye "sab ki jaankari" ka sabse bada raasta ban sakta hai.
- **Vikalp:**
  - **(a) Sirf laptop ka command:** owner, alag credentials se.
  - **(b) Master app me sirf owner:** `logs.read` permission, dobara code, wajah, ek samay-khidki ya request id se khojna, har padhna audit me; bulk export nahi.
  - **(c) (b) ke saath Support Lead:** sirf apne maamle ke request id se.
- **Salah:** **(b)**. Incident me tez, aur har padhne ka record.
- **Trade-off:**
  - (a) me har jaanch laptop pe aur dheemi.
  - (b) me Master app ki ek screen ka kaam.
  - (c) me zyada log, zyada jokhim.
- **Kanooni detail:** Lawyer (AI) ne nahi jaancha: logs me IP ka personal data hona, aur CERT-In ya kisi kanooni maang pe logs dene ka samay.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, request logs sirf owner Master app me padhe: `logs.read` permission, dobara code aur wajah ke saath, samay-khidki ya request id se khoj, har padhna audit me, aur bulk export nahi. Record: [DECISIONS.md](DECISIONS.md) D-402.

### Q-339. Security bug ka private record kahan rahe?

- **Status:** `Tay`. Topic: B14 (security). Group G25.
- **Sawal:** security bug aur scan ki findings ki detail, fix live hone tak, kahan likhi jaaye?
- **Kyun zaroori:** repo public hai. Detail issue, PR ya commit me aayi to fix se pehle hamle ka tareeka sabke saamne. Niyam hai ki record private jagah me ho ([RULES.md](RULES.md) RT-39), par jagah tay nahi.
- **Vikalp:**
  - **(a) GitHub ki private security advisory (draft):** repo ke saath, sirf admin ko dikhti hai.
  - **(b) Ek alag private GitHub repo:** sirf records ke liye.
  - **(c) Password manager ke secure notes.**
  - **(d) Laptop ki git-ignored file.**
- **Salah:** **(a)** agar public repo pe muft chale, warna **(b)**.
- **Trade-off:**
  - (a) code ke paas, par muft hai ya nahi, aur uske private fork me CI chalti hai ya nahi, ye jaanchna baaki.
  - (b) muft aur saaf, par ek aur repo.
  - (c) surakshit, par dhoondhna mushkil.
  - (d) laptop kho jaaye to record bhi gaya, aur doosre account se nahi dikhta.
- **Tathya ki jaanch pe tika:** §2 ki "GitHub ki private security advisory" wali row.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, GitHub ki private security advisory (draft), agar public repo pe muft chale; warna **(b)**, ek alag private GitHub repo. Record: [DECISIONS.md](DECISIONS.md) D-403.

### Q-340. Record wale security niyamon ka saboot kahan likha jaaye?

- **Status:** `Tay`. Topic: B14 (security). Group G25 (Q-339 pe tika, kyunki kami ki detail wahi jaati hai).
- **Sawal:** jin security niyamon ka saboot test nahi, record hai (jaise providers pe MFA, live headers, restore ka abhyaas), unki table kahan rahe?
- **Kyun zaroori:** release gate ([RULES.md](RULES.md) RG-2) aur niyamon ki ginti ki script record ko tabhi gin sakti hai jab wo repo me ek tay jagah ho.
- **Vikalp:**
  - **(a) [OPERATIONS.md](OPERATIONS.md) me naya hissa "Security ke record":** public table, sirf `Pass` ya `Baaki`, tareekh aur release; kami ki detail sirf private record (Q-339) me.
  - **(b) Har release ke test report (PR ke description) me:** repo ki file me nahi.
  - **(c) Laptop ki git-ignored file.**
- **Salah:** **(a)**, aur release ke test report me uski link.
- **Trade-off:**
  - (a) me public ko dikhta hai ki kaunse check hue, detail nahi.
  - (b) me ginti ki script ko PR padhne padte.
  - (c) me doosra account ya CI nahi dekh paata.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, OPERATIONS me naya hissa "Security ke record": public table me sirf `Pass` ya `Baaki`, tareekh aur release; kami ki detail sirf private record me; release ke test report me us table ki link. Record: [DECISIONS.md](DECISIONS.md) D-404.

### Q-341. Testers ki allowlist entries pe `+` alias chale?

- **Status:** `Tay`. Topic: B14 (security), B2 (apps aur roles).
- **Sawal:** owner jinhe allowlist (D-133) me jodta hai (testers), unke email ke `+` alias se bhi accounts ban sakein, ya sirf wahi exact email?
- **Kyun zaroori:** owner ke apne emails pe alias jaan-boojh ke chalte hain, par testers ke liye niyam likha nahi. Alias chale to ek tester kai customer accounts bana sakta hai, aur uske inbox pe aliases se codes ki baadh ho sakti hai.
- **Vikalp:**
  - **(a) Sirf exact email.**
  - **(b) Alias bhi.**
  - **(c) Har entry pe owner chune.**
- **Salah:** **(a)**. Tester ko doosra account chahiye to owner doosra email jode.
- **Trade-off:**
  - (a) me tester ke har naye account ke liye owner ka chhota kaam.
  - (b) me per-customer seemaon ki testing aasaan, par baadh ka raasta.
  - (c) lachila, par ek aur setting.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, testers ki allowlist entry sirf usi exact email se mel khaye, `+` alias se nahi; doosre account ke liye owner doosra email jode. Record: [DECISIONS.md](DECISIONS.md) D-405.

### Q-342. Kam jaankari wale requests ki har log line ya sirf ginti?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** Render ke host pe aaye rejected requests (bina secret ke `/api`, jinka jawab 403) aur `/wake` ki pings: har request ki log line bane, ya baadh ke dauraan per IP har minute ki ek ginti?
- **Kyun zaroori:** Render ka host sabke liye khula hai. Koi bhi sasti requests ki baadh bhej ke logs ki 0.5 GB jagah aur mahine ki 5 GB bandwidth khaa sakta hai; har khule tab ki ping bhi har 10 minute ek line banati hai.
- **Vikalp:**
  - **(a) Har request ki line** (abhi jaisa).
  - **(b) Aam din har line; ek IP se seema (misaal 100 requests/minute) ke upar sirf ginti:** pehla aur aakhri samay, ginti, route.
  - **(c) In dono qism ki hamesha sirf ginti.**
- **Salah:** **(b)**.
- **Trade-off:**
  - (a) me poora record, par baadh pe logs ki jagah khatam.
  - (b) me baadh ke dauraan har request alag nahi dikhti.
  - (c) me sabse kam jagah, par sabse kam detail.
- **Kanooni detail:** Lawyer (AI) ne nahi jaancha: CERT-In ke logs ke niyam me ginti wala record chalta hai ya har request ki line chahiye.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(b)**, aam din har request ki line; ek IP se seema (misaal 100 requests/minute) ke upar sirf ginti, pehle aur aakhri samay aur route ke saath. Record: [DECISIONS.md](DECISIONS.md) D-406.

### Q-343. Payment screen pe gateway ki script baaki app se kaise alag rahe?

- **Status:** `Tay`. Topic: B14 (security), B6 (payments).
- **Sawal:** Customer app SPA hai (D-290), yaani ek HTML document. Payment gateway ki checkout script ko baaki app se kaise alag rakhein?
- **Kyun zaroori:** browser ki CSP poore document ki hoti hai, route ki nahi. Ek baar load hui gateway ki script baaki screens (cart, address, orders) ke saath rehti hai, aur uske hosts poore app ki CSP me jaate hain. SR-006 ka "sirf payment wale page ki CSP me" SPA me poora nahi ho sakta.
- **Vikalp:**
  - **(a) Payment screen alag HTML document:** wahan aana-jaana poore page ka load; CSP aur gateway ki script sirf wahan.
  - **(b) Gateway ka apna hosted payment page (redirect):** hamare kisi page pe gateway ki script nahi.
  - **(c) Poore Customer app ki CSP me gateway ke hosts,** jokhim maan ke.
- **Salah:** **(a)**. Checkout ka roop (D-345) waisa hi rehta hai, aur bahar ki script sirf ek chhote document tak.
- **Trade-off:**
  - (a) me Payment pe aate-jaate ek poora page load, aur app ki state wahan nahi (sirf order ka id).
  - (b) me sabse kam jokhim, par customer app se bahar jaata hai, aur test mode me ye raasta jaanchna baaki.
  - (c) sabse aasaan, par bahar ki script ka asar poore app pe (R-016).
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, Payment screen ek alag HTML document; gateway ki script aur uski CSP sirf wahan, aur checkout ka roop (D-345) waisa hi. Record: [DECISIONS.md](DECISIONS.md) D-407.

### Q-344. Security review batch 1: edge aur hosting ke niyam, threats aur docs ke badlav maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (hosting).
- **Sawal:** Security Architect ke doosre run ke edge aur hosting wale hisse naye docs me aayein?
  1. **Naye niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): **SR-089** `/wake` ka alag route (sirf `GET`, 204 bina body aur cookie, koi database nahi, redirect nahi, CORS sirf apne apps ke origins bina credentials, CSP me sirf exact URL, IP ki chhoti seema); **SR-090** Payment screen alag HTML document (D-407); **SR-105** Render ke public host pe tay routes ke bahar sabse chhota jawab, bandwidth ki raftaar pe alert, aur baadh me log line ki jagah ginti (D-406).
  2. **Badle niyam:** SR-005 (CSP har document ki apni, `connect-src` me sirf `/wake`, media ka CDN, `font-src 'self'`, inline script sirf hash se; release ke baad live headers ki jaanch) aur SR-006 (gateway ki script sirf Payment ke alag document pe).
  3. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.1): 4 naye (`/wake` ka bada apvaad, SPA me gateway ki script, Render host pe baadh, edge ke tests ka live config na chalana), aur DAST ki line.
  4. **Doosre docs:** [RULES.md](RULES.md) RT-14 (edge ka milaan) aur RT-36 (release se pehle bhi, findings private); [OPERATIONS.md](OPERATIONS.md) §3 niyam 9 (live smoke me security ki jaanch); [ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 14 aur 15; [DESIGN.md](DESIGN.md) DS-10.9; [FLOWS.md](FLOWS.md) FL-7 kadam 4; [ACCEPTANCE.md](ACCEPTANCE.md) AC-CUSTOMER-6 aur naya AC-GATEWAY-10; [RISKS.md](RISKS.md) R-016 ka bachav.
- **Kyun zaroori:**
  - SPA (D-290) me CSP poore document ki hoti hai, to SR-006 ka purana roop poora nahi ho sakta tha.
  - `/wake` aur Render ka host sabke liye khule hain; apvaad chhota na ho to bandwidth (5 GB/mahina) aur logs ki jagah koi bhi kha sakta hai.
  - Laptop ke tests Vercel ki asli config nahi chalate, to live headers ki jaanch release ke baad hi pakki hoti hai.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me Payment pe aate-jaate poora page load, aur har release ke smoke check me kuch minute zyada. (c) me SPA me payment ki script ka asar poore app pe, aur Render ke host pe baadh ka khula raasta.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-21):** **(a)**, saare hisse: SR-089, SR-090, SR-105, SR-005 aur SR-006 ke badlav, §1.1 ke 4 threats, aur doosre docs ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-408.

### Q-345. Security review batch 2: sign-in aur sessions ke niyam, threats aur docs ke badlav maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** Security Architect ke doosre run ke sign-in aur sessions wale hisse naye docs me aayein?
  1. **Naye niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): **SR-092** email ka ek roop (`emailNorm`), allowlist ki entry `exact` ya `aliases` (testers hamesha `exact`, D-405), aur codes ki seema mailbox key pe bhi; **SR-093** seemaon ka jod (address, payment ki pehchaan aur device cookie, sirf HMAC; R1 me D-109 ka jod); **SR-094** polling, ping aur refresh session ka "kaam" nahi; **SR-095** apps ke stores aur query cache: devtools sirf development me, sign-out pe reset, `persist` sirf allowlist ki keys.
  2. **Badle niyam:** SR-012 (har email me app ka naam, link tracking band ka record) aur SR-020 (seema mailbox key pe bhi).
  3. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md)): §1.2 me 3 (aliases se codes ki baadh, email ke dhile milaan se allowlist ke bahar wala andar, kai app parivaaron me kis app ka email) aur §1.3 me 2 (background requests se session kabhi band nahi, sign-out ke baad store me pichhle user ka data).
  4. **Doosre docs:** [ARCHITECTURE.md](ARCHITECTURE.md) §5 niyam 7 aur §10.7 niyam 1; [DESIGN.md](DESIGN.md) DS-6.10; [ACCEPTANCE.md](ACCEPTANCE.md) naya AC-IDENTITY-13.
- **Kyun zaroori:**
  - Allowlist hi R1 ka darwaza hai (D-133); email ka roop tay na ho to case, Unicode ya domain ke khel se bahar wala andar aa sakta hai.
  - Owner ke emails pe aliases jaan-boojh ke chalte hain, to ek inbox pe codes ki baadh aur sign-up ki din ki chhat ka khatam hona rokna zaroori.
  - Polling har 60 second chalti hai; use "kaam" gina to staff ka 30 minute wala bina kaam ka niyam (D-181) kabhi laagu nahi hota.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me email ke roop ki ek saajhi library aur seemaon ka ek aur hisaab. (c) me allowlist ka dhila milaan aur khula chhoda staff ka tab kabhi band nahi.
- **R1 ya baad me:** R1 (SR-093 me D-109 ka jod R1, baaki seemaon ke saath R2).
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-092 se SR-095, SR-012 aur SR-020 ke badlav, §1.2 aur §1.3 ke 5 threats, aur doosre docs ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-409.

### Q-346. Security review batch 3: authorization aur paisa ke niyamon ke badlav aur threats maanein?

- **Status:** `Tay`. Topic: B14 (security), B6 (payments).
- **Sawal:** Security Architect ke doosre run ke authorization aur paisa wale hisse naye docs me aayein?
  1. **Badle niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): SR-032 (matrix ke aayam: route, role, app `aud` aur scope, jisme hub, warehouse, area aur partner bhi); SR-033 (order, return, daawa aur parcel ke number (D-308) bhi id jaise: secure random, khoj sirf owner ya scope ke filter aur rate limit ke saath, "nahi hai" aur "aapka nahi" dono 404); SR-043 (bank statement aur settlement report ke imports: Finance ka haq, dobara code, file ka hash audit me, dry run); SR-059 (seller ke user ka `emailNorm` aur mailbox key bhi); SR-075 (export ki file pehle download ke baad ya misaal 24 ghante me mite; PAN aur bank ke columns sirf zaroori exports aur roles me).
  2. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md)): §1.4 me 3 (matrix me scope chhootna, number ko secret maanna, alias se apne brand pe review) aur §1.5 me 2 (milaan ke import se farak chhupana, exports me PAN lambe samay).
  3. **Doosre docs:** [RULES.md](RULES.md) RT-35 me matrix ke aayam; [ARCHITECTURE.md](ARCHITECTURE.md) §7 niyam 8 me export ki file ka mitna.
- **Kyun zaroori:**
  - Staff ke scope (hub, warehouse, area) aur partner ke assignment ka bug sirf doosre customer ki id wale test se nahi pakda jaata.
  - Settlement ka milaan sellers ke paise ka pehra hai; uska import badla to farak chhup sakta hai.
  - Ek export file me saare sellers aur partners ke PAN hote hain; file jitni der rahe, jokhim utna.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me matrix test bada hota hai aur export dobara chahiye to dobara banana padta hai. (c) me scope ke bug aur PAN wali files ka khula raasta.
- **R1 ya baad me:** R1 (SR-059 ka D-203 wala hissa R2).
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-032, SR-033, SR-043, SR-059 aur SR-075 ke badlav, §1.4 aur §1.5 ke 5 threats, aur RT-35 aur ARCHITECTURE §7 niyam 8 ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-410.

### Q-347. Security review batch 4: delivery, reviews aur content ki ghadiyon ke badlav aur threats maanein?

- **Status:** `Tay`. Topic: B14 (security), B8 (reviews), B11 (support).
- **Sawal:** Security Architect ke doosre run ke delivery, reviews aur content ki ghadiyon wale hisse naye docs me aayein?
  1. **Badle niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): SR-060 (nagnata ya kisi aur ban ke dikhane wale content ki report pe content turant chhupe, faisla 2 ghante me, na ho to gambhirta 1 ka alert raat me bhi; baaki reports pe 36 ghante (D-251); jis account ki misaal 3 reports jhoothi niklein, uski aisi reports apne aap content nahi chhupatin, sirf queue me upar jaati hain); SR-078 (har event ki gambhirta 1, 2 ya 3, jisme nagnata wali report, court ya sarkari order aur owner ke alerts ki push subscription khatam hona gambhirta 1 me).
  2. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.6): 3 naye (email provider ke paas delivery code aur OTP, content ki kanooni ghadi niyam aur alerts me na hona, jhoothi report se content chhupwana).
  3. **Doosre docs:** [OPERATIONS.md](OPERATIONS.md) §7 niyam 3 me gambhirta ki poori list.
- **Kyun zaroori:**
  - SR-060 ab bhi 24 ghante kehta tha, jabki D-251 me nagnata wali report pe turant chhupna aur 2 ghante hain; aur raat ka alert D-324 ki gambhirta 1 me na ho to report subah tak padi rehti.
  - D-251 niyam 2 content apne aap chhupata hai, to jhoothi reports se kisi ka bhi content chhupwaya ja sakta hai.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me raat me bhi gambhirta 1 ke alerts zyada, aur baar-baar jhoothi report karne wale ki report pe content tab tak dikhta hai jab tak staff na dekhe. (c) me kanooni ghadi chhootne ka jokhim aur jhoothi report ka khula raasta.
- **Kanooni detail:** Lawyer (AI) ne nahi jaancha: jhoothi report karne wale ki report pe content apne aap na chhupana D-251 niyam 2 ke saath chalega ya nahi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-060 aur SR-078 ke badlav, §1.6 ke 3 threats, aur OPERATIONS §7 niyam 3 ki gambhirta ki list. Record: [DECISIONS.md](DECISIONS.md) D-411.

### Q-348. Security review batch 5: files, media, map aur band data ke niyam, threats aur docs ke badlav maanein?

- **Status:** `Tay`. Topic: B14 (security), B3 (catalog aur media).
- **Sawal:** Security Architect ke doosre run ke files, media, map aur band data wale hisse naye docs me aayein?
  1. **Naye niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): **SR-091** map ka SDK hamare bundle me, Ola ke hosts sirf `connect-src` aur `img-src` me, key ki whitelist sirf apne exact hosts, Ola ko koi personal pehchaan nahi; **SR-096** media provider pe sirf signed upload, server ke tay params, metadata hatana, sirf tay transformations; **SR-097** band data (rok ki copy, rok wali photos aur video, band FY ki file) public key se band, private key offline (D-399), hash audit chain aur backup manifest me, saal ka abhyaas.
  2. **Badle niyam:** SR-006 (map ka SDK bundle me), SR-062 (private media ki list me certificates, band FY ki file, exports aur rok wali photos), SR-065 (naye samay ke references), SR-066 (delete pe band orders ka archive bhi).
  3. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md)): §1.7 me 5 (media provider ki galat setting, band data ki chaabi live server pe, band FY ki file ka hash ek hi jagah, map ki key aur bahar ki script, delete ke baad archive me naam) aur §1.10 me 1 (certificates private media me nahi).
  4. **Doosre docs:** [OPERATIONS.md](OPERATIONS.md) §4 niyam 2 aur 3 (secrets ki list aur band data ki private key), §6 niyam 10 (saal ka abhyaas); [ARCHITECTURE.md](ARCHITECTURE.md) §10.3 niyam 4, §10.3 ki commerce row aur §10.6 niyam 15; [DESIGN.md](DESIGN.md) DS-7.10; [RULES.md](RULES.md) RT-14 me map ki key ki whitelist.
- **Kyun zaroori:**
  - KYC, daawe aur delivery ki photos media provider pe hain; uski ek galat setting se doosre ki file badalna ya free credits khatam karna aasaan.
  - D-399 ne band data ki chaabi offline rakhna tay kiya; niyam aur docs me wahi roop chahiye.
  - Delete (D-151) ka vaada tabhi poora hai jab band orders ke archive se bhi naam aur phone hatein.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me band data kholna sirf laptop se, private key ki do offline copies sambhalni, aur delete pe archive ke chunks dobara likhne ka kaam. (c) me band data ka ek leak se khulna aur media provider ki galat setting ka khula raasta.
- **R1 ya baad me:** R1 (SR-062 me certificates R2; band FY ki file pehla FY band hone pe).
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-091, SR-096, SR-097, SR-006, SR-062, SR-065 aur SR-066 ke badlav, §1.7 ke 5 aur §1.10 ka 1 threat, aur doosre docs ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-412.

### Q-349. Security review batch 6: logs, audit, errors aur alerts ke niyam, threats aur docs ke badlav maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (observability).
- **Sawal:** Security Architect ke doosre run ke logs, audit, errors aur alerts wale hisse naye docs me aayein?
  1. **Naye niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): **SR-098** saajha logger: error ka serializer allowlist se, redaction, production me pretty transport nahi; **SR-099** apps ki errors ka route bahar ka input: schema, size, rate limit, safai, Master me sirf text; **SR-100** audit aur logs ki suraksha: chain ka hash bahar bhi, baadh wale events ki ginti, logs padhna sirf owner (D-402), likhna fail to alert, aur dhaancha sirf laptop se (D-400); **SR-101** owner ke alerts ki push device ke saath (D-401).
  2. **Badle niyam:** SR-005 (CSP ki violation reports errors ke route pe), SR-072 (media provider aur map ki API bhi allowlist me), SR-074 (owner ke alerts ki subscription SR-101 se).
  3. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.8): 7 naye (logs padhne ka haq, release user se TTL badal ke mitana, audit ki baadh, errors ka route, logger me secrets, raat ka push band, events ki gambhirta).
  4. **Doosre docs:** [ARCHITECTURE.md](ARCHITECTURE.md) §8 niyam 3 aur 5, §10.4 niyam 5, §10.8 niyam 1 aur 5; [OPERATIONS.md](OPERATIONS.md) §7 niyam 9 (roz ka test push); [ACCEPTANCE.md](ACCEPTANCE.md) AC-LOGS-3 aur naya AC-MASTER-7.
- **Kyun zaroori:**
  - Audit hi staff ke kaam ka saboot hai; release user ke rehte use mitaya ja sakta tha, aur bots ki baadh se uski 0.5 GB jagah bhar sakti thi.
  - Apps ki errors ka route bahar se likha ja sakta hai, aur uska text Master app me dikhta hai, jo sabse bade haq wala app hai.
  - Logger ka default serializer provider ki keys aur emails logs me likh sakta tha.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me logger ki config aur errors ke route ki seemaayein sambhalni, aur audit aur logs ke dhaanche ka badlav haath se. (c) me audit ka mitna, Master me XSS aur logs me secrets ka khula raasta.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-098 se SR-101, SR-005, SR-072 aur SR-074 ke badlav, §1.8 ke 7 threats, aur doosre docs ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-413.

### Q-350. Security review batch 7: DevOps, testing aur security bugs ke niyam, threats aur docs ke badlav maanein?

- **Status:** `Tay`. Topic: B14 (security), B15 (DevOps).
- **Sawal:** Security Architect ke doosre run ke DevOps, testing aur security bugs wale hisse naye docs me aayein?
  1. **Naye niyam** ([security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md)): **SR-102** production config me test ka koi hissa mile to boot ruke; **SR-103** security bug ka raasta: har app pe `security.txt`, private record (D-403), pehle kill switch, phir ek hi baithak me hotfix; **SR-104** icons ka package sirf allowlist ke SVG elements se.
  2. **Badle niyam:** SR-081 (media provider, Ola Maps, cron-job.org, UptimeRobot aur password manager pe bhi MFA) aur SR-084 (khabar D-248 se; security bug ka fix SR-103 ke kram se).
  3. **Threats** ([security/THREAT_MODEL.md](security/THREAT_MODEL.md) §1.9): 6 naye (test ka raasta live me, security fix ka pehle public merge, private report ka raasta nahi, DAST ki finding public, icons ki script, naye providers bina MFA), aur "Bachav aur test" aur "Bacha jokhim" ki lines.
  4. **Doosre docs:** [RULES.md](RULES.md) §4.1 (release se pehle DAST), §4.6 ki table, RT-39 (jagah D-403) aur naya RT-48 (record ki table); [OPERATIONS.md](OPERATIONS.md) §3 niyam 9 aur 10, aur naya §12 "Security ke record" (D-404); [COMPLIANCE.md](COMPLIANCE.md) §14.6 row 12; [RISKS.md](RISKS.md) R-054 ka bachav.
- **Kyun zaroori:**
  - Repo public hai: security fix pehle `prerelease` pe merge ho to live hone se pehle hi hamle ka tareeka dikh jaata hai.
  - Fake payment adapter ya test seed live me chal jaaye to bina paise "paid" aur jaane-maane passwords.
  - Release gate tabhi record gin sakta hai jab record ki ek tay jagah ho (D-404).
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me har release pe record ki table bharni, aur security fix ek hi baithak me poora karna. (c) me test ka raasta live me aur fix se pehle kamzori public hone ka khatra.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: SR-102 se SR-104, SR-081 aur SR-084 ke badlav, §1.9 ke 6 threats, aur doosre docs ke badlav. Record: [DECISIONS.md](DECISIONS.md) D-414.

### Q-351. Security review batch 8: 7 naye security risks maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** Security Architect ke doosre run ke 7 naye risks [RISKS.md](RISKS.md) me aayein (tag `Security`, har ek bachav ke saath)?
  1. **R-077:** Render ke public host pe sasti requests ki baadh (bandwidth, logs ki jagah, raat ke ghante).
  2. **R-078:** band data ki offline private chaabi kho jaana (D-399).
  3. **R-079:** OTP aur delivery code email provider ke paas; provider account ke kabze se live codes.
  4. **R-080:** audit aur logs ke dhaanche ka badlav galat haathon me, ya laptop ka kadam bhoolna (D-400).
  5. **R-081:** owner ke raat ke alerts ka raasta chupke se band (D-401).
  6. **R-082:** map ki browser key se free seema khaana.
  7. **R-083:** bahar se likhne wale raaston ki baadh se ops inbox me asli errors chhupna.
- **Kyun zaroori:** in sabka bachav security ke niyamon (SR-089, SR-091, SR-097, SR-099 se SR-101, SR-105) aur D-399 se D-406 me likha hai, par ₹0 aur akele owner ke saath khatra phir bhi bacha hai; risk ki list me rahe to har release pe dekha jaata hai.
- **Vikalp:** **(a)** saaton, bachav ke saath `Khula`; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me risks ki list lambi, par har ek ka bachav likha hai. (c) me ye khatre kahin likhe nahi rehte.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saaton risks R-077 se R-083 bachav ke saath `Khula`. Record: [DECISIONS.md](DECISIONS.md) D-415.

### Q-352. Security review batch 9: SR doc ka dhaancha aur OWASP ke naye versions maanein?

- **Status:** `Tay`. Topic: B14 (security), B16 (docs ka dhaancha).
- **Sawal:** [security/SECURITY_REQUIREMENTS.md](security/SECURITY_REQUIREMENTS.md) ka dhaancha badle?
  1. Har niyam ke saath naya **`Release`** column: `R1`, `R2`, ya `R1; R2 me: ...` (abhi 4 niyam poore R2: SR-067, SR-085, SR-086, SR-087; 7 me R2 ka hissa: SR-051, SR-058, SR-059, SR-060, SR-062, SR-063, SR-093).
  2. Saare 105 niyamon ka **"Kahan se"** ASVS 5.0.0 ke chapter ke naam pe (jaise "Configuration" ki jagah "V13 Configuration").
  3. Naya **§2 OWASP ka naksha:** OWASP Top 10:2025 aur OWASP API Security Top 10 2023 ki har category ke saamne jude niyam.
  4. [RULES.md](RULES.md) RG-2: requirement ki ginti `Release` column se R1 wale niyam (aur mile-jule niyam ka R1 hissa) gine.
- **Kyun zaroori:**
  - Release gate (RG-2) ki ginti ki script ko pata hona chahiye kaunsa niyam ya hissa R1 ka hai; bina column ke ye text padh ke andaaza hota.
  - Pehle run ki mapping OWASP ke purane versions (Top 10 2021, ASVS 4.0.3) pe thi; naye versions ab aa chuke hain.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me ASVS 5.0.0 ka naksha sirf chapter ke naam se hai, requirement IDs aur levels (L1 se L3) nahi jaanche; aage ki review me. (c) me ginti ki script R1 ke niyam nahi pehchan paati, aur mapping purane versions pe rehti.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: `Release` column, ASVS 5.0.0 ke chapter ke naam, naya §2 OWASP ka naksha, aur RULES RG-2 ka badlav. Record: [DECISIONS.md](DECISIONS.md) D-416.

### Q-353. Security review ke baaki hisse: 11 jaanch, 2 lene layak aur ek dhyaan ka point maanein?

- **Status:** `Tay`. Topic: B14 (security).
- **Sawal:** Security Architect ke doosre run ke bache hisse naye docs me aayein?
  1. **11 sirf jaanch wali cheezein** §2 me nayi rows: CSP me path wala source, Render pe 403 aur jaagna, media provider ki settings, Ola ki key aur SDK, GitHub advisory ka fork aur artifacts, logger aur MongoDB ki errors, Web Push ki umar, Vercel ke har path ke headers, Zustand ka devtools, `security.txt`, aur Razorpay ka hosted page.
  2. **§2 ki 4 maujooda rows ab zyada zaroori:** owner ke laptop ka Desktop folder (sync mile to backups ka folder Desktop ke bahar, D-013), email provider ke dashboard me copy, Atlas M0 ka custom role aur `collMod`, aur Razorpay ki sthir pehchaan.
  3. **Pehle ke kaam se lene layak (D-074):** SR-002 ke test me Vercel ki apni routing library se config ki jaanch; aur §2 ki Vercel ke secret header wali row me ishara ki request header sirf route ke `transforms` se judta hai. Baaki lene layak cheezein (CSP ka hash, logger ke redact paths, errors ki page load ki seema) pichhli batches me SR-005, SR-098 aur SR-099 me aa chuki hain.
  4. **Tay faislon pe dhyaan ke 17 points:** 15 pichhli batches ke niyamon me sambhal liye gaye (D-399 se D-416); D-322 wala point R-077 me hai; aur backups ke folder wala point upar ki row me.
- **Kyun zaroori:** jaanch ke bina kai niyam (jaise `/wake` ka exact URL, Payment ka alag document, raat ka push) kaagaz pe hi pakke hain; aur repo ke saath backups ka folder kisi cloud sync me ho to band data bahar ja sakta hai.
- **Vikalp:** **(a)** saare hisse; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me §2 ki jaanch ki list lambi hoti hai; (c) me niyamon ke tathya bina jaanche rehte.
- **R1 ya baad me:** R1 se pehle jaanch.
- **Owner ka jawab (2026-11-22):** **(a)**, saare hisse: 11 nayi jaanch, 4 rows zyada zaroori, 2 lene layak cheezein, aur dhyaan ke points ka hisaab. Record: [DECISIONS.md](DECISIONS.md) D-417.

### Q-354. Delivery pe UPI test mode me kaise chale?

- **Status:** `Tay`. Topic: B5 (checkout), B6 (payments).
- **Sawal:** Razorpay ke test mode me bana QR "will disappear after two seconds", aur scan sirf live mode ke QR hote hain ([RISKS.md](RISKS.md) §2.9). D-109 aur SR-050 ka "server se, us parcel ki exact rakam ka QR" test mode me kaise chale?
- **Kyun zaroori:**
  - D-026 se saare payments test mode me hain, aur delivery pe UPI R1 me hai (AC-PAYMENTS-8, AC-DELIVERY-4). Razorpay ke QR se ye flow test mode me chal hi nahi sakta.
  - SR-050 ke niyam (exact rakam, ek parcel pe ek khula QR, "paid" sirf webhook se) har raaste me bache rehne chahiye.
- **Vikalp:**
  - **(a) QR me hamare Payment page ka link:** partner ke app me QR server banaye, jisme us parcel ke Razorpay order ka hamara Payment page (D-407) ka link ho. Customer phone ke camera se scan karke page khole aur test mode ke checkout se UPI (misaal `success@razorpay`) se bhare. "Paid" waise hi webhook se. Live mode me baad me isi jagah Razorpay ka asli QR.
  - **(b) Razorpay Payment Link:** server parcel ka Payment Link banaye aur QR me wahi link. Payment Links test mode me chalte hain ya nahi, abhi jaancha nahi (§2).
  - **(c) Delivery pe UPI R2 me:** R1 me door pe payment nahi, sirf pehle se payment.
- **Salah:** **(a)**. SR-050 ke saare niyam bache rehte hain, sirf QR me Razorpay ki jagah apna link aata hai, aur test mode me poora flow chalta hai.
- **Trade-off:** (a) me customer ko phone pe page kholna padta hai (ek kadam zyada), aur uska phone online hona chahiye. (b) test mode me chalega ya nahi, pata nahi. (c) me door pe payment ka flow R1 me test hi nahi hota.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, QR me hamare Payment page ka link: partner ke app ka QR server banaye, usme us parcel ke Razorpay order ka Payment page (D-407); customer test mode ke checkout se UPI se bhare, "paid" sirf webhook se; live mode me isi jagah Razorpay ka QR. Record: [DECISIONS.md](DECISIONS.md) D-418.

### Q-355. Brevo bina apne domain ke: From badla hua aur tracking band nahi

- **Status:** `Tay`. Topic: B11 (notifications), B14 (security).
- **Sawal:** Brevo Gmail jaise free email ka domain authenticate nahi kar sakta, to From address badal ke apna domain (transactional me `t-sender-sib.com` jaisa) laga deta hai. Click tracking bhi free pe poori band nahi hoti, sirf anonymous; jabki SR-012 kehta hai link tracking band ho. D-287 isi haalat pe dobara khulta hai. Kya karein?
- **Kyun zaroori:**
  - OTP aur saare emails isi raaste se jaate hain (D-287). Anjaana From spam ka jokhim badhata hai (R-005), aur tracking wale links me hamara URL Brevo ke redirect ke peeche chala jaata hai.
  - Ye baatein Brevo ke help center ke search ke saar se hain; wo pages khud nahi khule ([RISKS.md](RISKS.md) §2.9). Pehle bhejne pe From aur links ek baar dekh lene honge.
- **Vikalp:**
  - **(a) Brevo hi, emails me link nahi:** From badla hua maan ke chalein. Saare emails me sign-in ya action ka koi link nahi, sirf code aur "app kholein" (SR-012 ka staff wala niyam sab emails pe). Tracking anonymous, aur iska record (D-404).
  - **(b) Apna domain:** D-028 ka "domain nahi" badle; Brevo pe domain authenticate, From apna. Tracking wali baat phir bhi bachti hai.
  - **(c) Doosra email provider:** free email ka domain koi provider authenticate nahi karta, to wahi dikkat; aur D-142 ke numbers badalte.
- **Salah:** **(a)**. D-028 ka ₹0 bachta hai, aur emails me link hi na hon to tracking se koi khatra nahi; codes email me waise hi jaate hain.
- **Trade-off:** (a) me From anjaana dikhta hai (spam me jaane ka khatra, R-005), aur customer ko link ki jagah app kholna padta hai. (b) me D-028 (owner ka faisla) badalta hai aur mahine ka chhota kharcha. (c) me wahi dikkat aur naye numbers.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, Brevo hi: From badla hua maan ke chalein; kisi email me sign-in ya action ka link nahi, sirf code aur "app kholein"; tracking anonymous, aur uska record. Record: [DECISIONS.md](DECISIONS.md) D-419.

### Q-356. Media ki shart (D-284) ka nateeja: private files kahan?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** D-284 ki shart thi: free plan pe private file ka samay wala URL chale, rakhi copy me EXIF na rahe, aur file type aur size ki rok lage. Jaanch ([RISKS.md](RISKS.md) §2.9): samay wale token URL sirf Advanced (paid) plan pe; signed URL expire nahi hota; size ki rok preset me nahi (sirf plan ki 10 MB image seema); EXIF ka niyam page pe nahi; aur data US me. Ab private files kahan rahein?
- **Kyun zaroori:** KYC dastavez, daawe ki photos aur delivery ka saboot private hain (SR-062). Bina samay wala URL leak ho jaaye to hamesha chalta hai.
- **Vikalp:**
  - **(a) D-284 ka doosra raasta, abhi:** public aur review images Cloudinary pe. Private dastavez, daawe aur delivery ki photos, kanooni rok wali files aur logs ki files S3 jaise object storage pe (misaal Cloudflare R2 ya Backblaze B2 ka free hissa), chhote samay ke presigned URL se. Object storage chunne se pehle uski apni shart (samay wala URL, size ki rok, region) jaanchni hogi.
  - **(b) Pehle Cloudinary pe test:** free account pe `private_download_url` (samay wala download link, `expires_at`) aur EXIF ka test (§2), phir faisla.
  - **(c) Sab Cloudinary pe:** private files signed URL se, bina samay ke.
- **Salah:** **(a)**. Teen me se do shartein free pe kamzor nikli, aur KYC dastavez US me rakhne ki baat bhi hat jaati hai.
- **Trade-off:** (a) me do providers, do chaabiyaan (SR-071) aur upload ke do raaste. (b) me faisla der se, aur US wali baat bani rehti hai. (c) me leak hua private URL hamesha chalta hai (SR-062 ke khilaaf).
- **Kanooni detail:** KYC dastavez India ke bahar rakhne ka asar (CL-107) Lawyer (AI) ne nahi dekha.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, D-284 ka doosra raasta abhi: public aur review images Cloudinary pe; private dastavez, daawe aur delivery ki photos, kanooni rok wali files aur logs ki files S3 jaise object storage pe, chhote samay ke presigned URL se; object storage chunne se pehle uski apni shart ki jaanch. Record: [DECISIONS.md](DECISIONS.md) D-420.

### Q-357. Databases ka network: Atlas ki IP list me kya ho?

- **Status:** `Tay`. Topic: B14 (security), B15 (technical).
- **Sawal:** Atlas ke free cluster pe IP access list hai (project me 200 entries tak). Neon ke Free plan pe IP Allow nahi (sirf Scale plan pe), aur Render ke outbound IPs region ke saare customers ke saajhe ranges hain ([RISKS.md](RISKS.md) §2.7). Atlas ki list me kya rakhein?
- **Kyun zaroori:** R-022 (databases ka network sabke liye khula) isi jaanch ke baad dobara dekhna tha.
- **Vikalp:**
  - **(a) Render ke ranges aur kaam ke waqt laptop:** Atlas me Render Singapore ke outbound ranges. Laptop ke kaam (backup, release command) ke waqt laptop ka IP thodi der ke liye jode, kaam ke baad hataye. Neon pe password, TLS `verify-full` aur `channel_binding=require`.
  - **(b) Sab khula (`0.0.0.0/0`):** sirf password aur TLS pe suraksha.
- **Salah:** **(a)**. Ranges saajhe hain, par duniya bhar ke scanners database tak nahi pahunchte, aur R-022 ka khatra kam hota hai.
- **Trade-off:** (a) me Render ke ranges badlein to connection toot sakta hai (dashboard dekhna padta hai), aur laptop ka IP har baar jodna aur hatana. (b) aasaan, par R-022 jaisa tha waisa hi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, Atlas ki list me Render Singapore ke outbound ranges, aur laptop ka IP sirf backup ya release ke kaam ke waqt; Neon pe password, TLS `verify-full` aur `channel_binding=require`. Record: [DECISIONS.md](DECISIONS.md) D-421.

### Q-358. Search ke tests: local Atlas container se?

- **Status:** `Tay`. Topic: B9 (search), B15 (technical).
- **Sawal:** [ARCHITECTURE.md](ARCHITECTURE.md) §6 niyam 7 kehta hai laptop aur CI pe Atlas Search nahi milta, to ek adapter MongoDB text index se chalta hai aur ranking ke tests dono pe. Par MongoDB ke local Atlas container (`mongodb/mongodb-atlas-local`) me search chalta hai; use kam se kam 2 GB khaali RAM aur 2 CPU cores chahiye ([RISKS.md](RISKS.md) §2.7). Kya karein?
- **Kyun zaroori:** text index aur Atlas Search ka kram alag hota hai (R-066), to adapter pe pass hue tests live search ki sachchai nahi batate.
- **Vikalp:**
  - **(a) Search ke tests local Atlas container pe:** laptop aur CI (Linux runner pe 16 GB RAM) dono pe asli search; text index wala adapter hata do.
  - **(b) Jaisa hai:** dono adapters, ranking ke tests dono pe.
- **Salah:** **(a)**. Search ke niyam (fuzzy, synonyms, kram) usi engine pe parkhe jaate hain jo live pe hai, aur ek adapter ka code kam hota hai.
- **Trade-off:** (a) me laptop pe 2 GB RAM aur lagti hai (R-070), aur local container me ek saath kai search nahi chalte. (b) me do adapters ka code, aur adapter ke tests live ka kram nahi parakhte.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, search ke tests laptop aur CI dono pe local Atlas container me; text index wala adapter nahi. Record: [DECISIONS.md](DECISIONS.md) D-422.

### Q-359. Desktop pe "Use my current location": kam accuracy pe pin?

- **Status:** `Tay`. Topic: B5 (checkout ka address).
- **Sawal:** browser ki location ke saath `accuracy` aati hai (meters me, 68% bharose ke saath, [RISKS.md](RISKS.md) §2.11). Laptop pe location aksar kai km galat hoti hai. Kitni accuracy se upar pin apne aap nahi rakhna?
- **Kyun zaroori:** galat pin se galat doori aur galat hub (D-016), aur SR-055 ka 300 m wala niyam galat jagah pe tikta hai.
- **Vikalp:**
  - **(a) Seema ke saath:** accuracy misaal 100 m se zyada ho to pin nahi rakhte; map us jagah ke paas khulta hai aur sandesh "Move the pin to your door".
  - **(b) Koi rok nahi:** pin jahan aaye wahan; customer khud sudhaare.
  - **(c) Desktop pe button nahi:** sirf phone pe.
- **Salah:** **(a)**. Phone pe button waise hi kaam karta hai, aur laptop pe galat pin chupchaap nahi lagta.
- **Trade-off:** (a) me ek chhota niyam aur sandesh. (b) me galat pin ka khatra. (c) me desktop pe aasani kam.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, accuracy misaal 100 m se zyada ho to pin apne aap nahi; map us jagah ke paas khule aur sandesh "Move the pin to your door". Record: [DECISIONS.md](DECISIONS.md) D-423.

### Q-360. Server jagane wala pinger: cron-job.org ka 30 second timeout

- **Status:** `Tay`. Topic: B15 (operations).
- **Sawal:** cron-job.org request 30 second me poori na ho to fail maanta hai, aur lagataar 25 se zyada fail pe job apne aap band kar deta hai ([RISKS.md](RISKS.md) §2.9). Soya Render server jaagne me lagbhag 1 minute leta hai (RISKS §2.2). To D-322 ka har ghante ka ping fail dikhega, aur din ke 14 ping ke hisaab se lagbhag 2 din me job band ho jaayega. Kya karein?
- **Kyun zaroori:** request Render tak pahunchti hai, to server jaagta hai; par job band hua to raat ke baad ke roz ke kaam aur saar chupchaap ruk jaate hain.
- **Vikalp:**
  - **(a) Har jaag pe do ping:** pehla jagaaye (fail ho sakta hai), doosra misaal 2 minute baad (jaage server pe safal), taaki lagataar fail ki ginti tootti rahe.
  - **(b) UptimeRobot se jagana:** uska timeout abhi jaancha nahi (§2).
  - **(c) GitHub Actions ka schedule:** late ho sakta hai ya chhoot sakta hai (RISKS §2.5).
- **Salah:** **(a)**. cron-job.org hi rehta hai, aur bas ek aur job judta hai.
- **Trade-off:** (a) me din ke 28 requests (14 ki jagah); doosra ping jaage server pe hota hai, to ghanton pe asar na ke barabar. (b) ka timeout pata nahi. (c) me samay pakka nahi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, har jaag pe do ping: pehla jagaaye, doosra kuch minute baad jaage server pe. Record: [DECISIONS.md](DECISIONS.md) D-424.

### Q-361. Jaanch se nikle chhote sudhaar maanein?

- **Status:** `Tay`. Topic: B15 (technical), B16 (docs).
- **Sawal:** jaanch ke tathyon ([RISKS.md](RISKS.md) §2.7 se §2.11) se ye chhote badlav docs me aayein?
  1. [ARCHITECTURE.md](ARCHITECTURE.md) §10.4 niyam 6: finance ki migrations aur `pg_dump` Neon ke seedhe connection se, pooler se nahi (pooler pe session wala advisory lock nahi chalta). App ka pool pooler se, bina SQL `PREPARE`, `SET` aur session wale locks.
  2. ARCHITECTURE §10.4 niyam 5: release user ko `collMod` ke liye `dbAdmin` ya `collMod` wala custom role; app ke user ka `readWrite` (usme `collMod` nahi).
  3. ARCHITECTURE §9 ki Redis wali row: free Key Value 25 MB aur 50 connections, aur maxmemory policy `noeviction` (BullMQ ki shart). [OPERATIONS.md](OPERATIONS.md) §1 niyam 3 me laptop ka Valkey bhi `noeviction`.
  4. OPERATIONS §1 niyam 3 aur [RULES.md](RULES.md) RT-2: MongoDB ka container patch version tak pin, 8.0.30 ya upar. Linux kernel 6.19 se 7.0.13 pe purane 8.0 crash karte ya band hote hain; laptop ka WSL kernel abhi 6.18.58.
  5. OPERATIONS §3 niyam 8: Render dashboard se rollback auto-deploy band kar deta hai; git revert merge hone ke baad auto-deploy wapas chalu (ya rollback Render ki API se).
  6. D-341 ke fonts: Google Fonts ka `latin` subset ₹ nahi rakhta; self-host ke liye `latin` aur U+20B9 ka apna subset (build ka test waisa hi).
  7. [DESIGN.md](DESIGN.md) DS-8.1 aur RULES ka accessibility test: axe me WCAG 2.2 ke rules (jaise `target-size`) default band hain, to `wcag22aa` tag chalu.
  8. RULES RT-14: laptop pe Razorpay ke webhooks `zrok` se (Razorpay `ngrok` aur `loca.lt` ko block karta hai), ya fake se.
  9. D-374 ka nightly WebKit: Playwright me service workers sirf Chromium pe chalte hain, to service worker aur push ke tests Chromium aur asli phone pe; WebKit pe baaki.
  10. DESIGN DS-10.10: Lighthouse har page pe 5 baar, aur median.
  11. OPERATIONS §12 (security ke record, D-403): advisory ke temporary private fork me CI nahi chalta, to security fix ke tests laptop pe, merge se pehle.
  12. RULES §4.6 ke finance tests: PostgreSQL ke saath PgBouncer (transaction mode) ka container, taaki pooler ki rok tests me dikhe.
  13. [COMPLIANCE.md](COMPLIANCE.md) §14 ke Privacy page me Ola ke paas jaane wale location data ka zikr, kyunki Ola ki policy me uska istemaal ads aur research ke liye bhi likha hai (D-255, CL-104).
- **Kyun zaroori:** ye niyam jin tathyon pe tike the, unme se kai ab pakke ya alag nikle; bina badlav ke implementation me galti, crash ya jhootha test.
- **Vikalp:** **(a)** saare; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me docs me 13 chhote badlav. (c) me niyam galat ya adhoore tathyon pe tike rehte hain.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, saare 13 sudhaar. Record: [DECISIONS.md](DECISIONS.md) D-425.

### Q-362. PRODUCT.md me kya aaye, aur roles ki poori list kaisi ho?

- **Status:** `Tay`. Topic: B2 (apps aur roles), B16 (docs).
- **Sawal:** [PRODUCT.md](PRODUCT.md) khaali hai, jabki D-017 aur kam se kam 8 faisle "roles ki list (D-017) me" kehte hain, aur wo list kahin likhi nahi. PRODUCT me kya aaye?
- **Kyun zaroori:** har module ki `TASK.md` ki screens aur permissions roles pe tiki hain; aur product ka saar, business model aur scope abhi sirf faislon me bikhre hain.
- **Vikalp:**
  - **(a) Poora PRODUCT.md:** product ka saar, business model, har app ke roles (kaam, kab chalu, faisla), kaun kise report kare, bina login wale kaam, jo roles nahi chahiye, apps, launch aur scope; sab faislon ki links ke saath. Roles naye faislon se: State Admin ki jagah poore desh ki Seller Ops team (D-084), Admin sub-district aur Super Admin district (D-015, SR-035), city ka level nahi (D-015), listing ka content staff nahi badalta (D-098).
  - **(b) Sirf roles ki list:** baaki hisse baad me.
  - **(c) Abhi nahi:** planning me modules ke saath.
- **Salah:** **(a)**. Ek jagah poori tasveer, aur faislon ki khuli links band hoti hain.
- **Trade-off:** (a) me ek lambi file, aur jo roles faislon me nahi the unke kaam Claude ki salah hain. (c) me TASK.md ke permissions bina list ke bante.
- **R1 ya baad me:** R1 se pehle (planning ki neev).
- **Owner ka jawab (2026-11-22):** **(a)**, poora PRODUCT.md: product ka saar, business model, 11 apps ke roles naye faislon ke hisaab se, reporting, bina login wale kaam, jo roles nahi chahiye, apps, launch aur scope. Record: [DECISIONS.md](DECISIONS.md) D-426.

### Q-363. Roles aur permissions ka model kahan aur kaisa?

- **Status:** `Tay`. Topic: B2 (roles), B14 (security).
- **Sawal:** permission ke naam ka dhaancha, scope ke type, grant, kaun kise appoint kare aur kaam ka bantwara abhi sirf SR-032 aur SR-037 me thoda hai. [ARCHITECTURE.md](ARCHITECTURE.md) me naya hissa aaye?
- **Kyun zaroori:** identity aur har service ka `authorize` isi model pe banta hai; scope nayi seedhi (D-015) pe hona chahiye.
- **Vikalp:**
  - **(a) ARCHITECTURE §11:** permission ka naam `<service>.<resource>.<action>`; role data me; grant umar ke saath; scope `self`, `seller`, `state`, `district`, `subDistrict`, `hub`, `warehouse`, `national`, `global`; appointment ki table; kaam ke bantwara ke 6 niyam, har ek ka test.
  - **(b) Planning me identity ke TASK.md me.**
- **Salah:** **(a)**. Ye poore system ka niyam hai, kisi ek module ka nahi.
- **Trade-off:** (a) me appointment ki table aur "fees aur policies me do account" Claude ki salah hain. (b) me har module apna andaaza lagata.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, ARCHITECTURE §11 me roles aur permissions ka model. Record: [DECISIONS.md](DECISIONS.md) D-427.

### Q-364. Saajhe packages ka naksha?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** saajhe packages (contracts, typed client, app-shell, components, auth ka UI, tables, maps waghera) ki list kahin nahi. Kahan aaye?
- **Kyun zaroori:** modules ki dependencies inhi pe tiki hain, aur 11 apps ek jaise tabhi bante hain jab saajha kaam ek jagah ho.
- **Vikalp:**
  - **(a) ARCHITECTURE §12:** category, misaal naam aur kaam ki table; pakki list PROJECT_PLAN ke modules ke saath.
  - **(b) Seedha PROJECT_PLAN me:** abhi planning khuli nahi.
- **Salah:** **(a)**. Naksha architecture ka hai; pakki list planning me.
- **Trade-off:** (a) me naam misaal hain aur planning me badal sakte. (b) planning stage ke bina nahi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, ARCHITECTURE §12 me saajhe packages ki table, naam misaal. Record: [DECISIONS.md](DECISIONS.md) D-428.

### Q-365. Code ke niyam aur testing ke jaal RULES me?

- **Status:** `Tay`. Topic: B15 (technical), B16 (docs).
- **Sawal:** D-002 kehta hai conventions RULES me ek-ek karke aayenge, par [RULES.md](RULES.md) §3 (Code) khaali hai, aur Conventional Commits kisi doc me nahi. Kya aaye?
- **Kyun zaroori:** code shuru hone se pehle naming, validation, config, hard-coding ki rok, role ke naam se faisla na karna aur frontend ke niyam tay hon; aur pehle ke kaam ke jaane-pehchaane jaal tests me dobara na hon.
- **Vikalp:**
  - **(a) RULES §3 (CR-1 se CR-36) aur §4.8 (RT-49 se RT-55):** sabke liye, backend, frontend aur packages ke niyam (lint ke pehron ke saath), aur testing ke 7 jaal.
  - **(b) Sirf §3:** jaal baad me.
  - **(c) Code ke saath:** implementation me.
- **Salah:** **(a)**. Niyam pehle se likhe hon to pehla code hi sahi bane.
- **Trade-off:** (a) me lint ke kai pehre banane padte (har ek ke "galat" misaal wale test ke saath). (c) me shuru ka code baad me badalna padta.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, RULES §3 me code ke 36 niyam aur §4.8 me testing ke 7 jaal. Record: [DECISIONS.md](DECISIONS.md) D-429.

### Q-366. RULES ke khaali §5, §6 aur §7?

- **Status:** `Tay`. Topic: B16 (docs).
- **Sawal:** [RULES.md](RULES.md) ki list me §5 (security aur privacy), §6 (docs) aur §7 (AI ke saath kaam) hain, par likhe nahi gaye. Inme kya aaye?
- **Kyun zaroori:** RULES padhne wale ko sab niyam ek jagah se mil jaayein; zyadatar niyam CLAUDE.md aur SR me pehle se hain.
- **Vikalp:**
  - **(a) Links aur jo bacha:** har section me sahi doc ki links, aur bache niyam: nayi env key tabhi jab code padhe ([OPERATIONS.md](OPERATIONS.md) §4 niyam 11), har UI badlav asli browser me, aur har daawa source se.
  - **(b) Section hata do:** list chhoti.
- **Salah:** **(a)**. Har baat ek jagah rehti hai, aur RULES se raasta milta hai.
- **Trade-off:** (a) me thodi dohraav jaisi links. (b) me RULES se kuch niyam chhoot jaate.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, §5 se §7 me links aur bache niyam, aur OPERATIONS §4 me env key ka niyam. Record: [DECISIONS.md](DECISIONS.md) D-430.

### Q-367. GLOSSARY ke shabd?

- **Status:** `Tay`. Topic: B16 (docs).
- **Sawal:** [GLOSSARY.md](GLOSSARY.md) me sirf RTO hai, jabki docs bundle mode, outbox, grant, scope, switch aur live, FEFO, payable, payout jaise shabd baar-baar use karte hain. Kaunse shabd aayein?
- **Kyun zaroori:** docs aur code ek bhasha bolein; naye session ya agent ko har shabd ka ek matlab mile.
- **Vikalp:**
  - **(a) Docs me baar-baar aane wale 51 shabd:** matlab aur faisle ki link ke saath, A se Z ke kram me.
  - **(b) Shabd tab jab koi poochhe.**
- **Salah:** **(a)**.
- **Trade-off:** (a) me shabd badle to GLOSSARY bhi badalna. (b) me ek shabd ke kai matlab ban sakte.
- **R1 ya baad me:** R1 se pehle.
- **Owner ka jawab (2026-11-22):** **(a)**, 51 shabd matlab aur link ke saath. Record: [DECISIONS.md](DECISIONS.md) D-431.

### Q-368. GIT_SKILLS ka manual?

- **Status:** `Tay`. Topic: B16 (docs).
- **Sawal:** [GIT_SKILLS.md](GIT_SKILLS.md) khaali hai, jabki skills ke saajhe niyam kehte hain ki insaan ka manual wahi hai. Kya aaye?
- **Kyun zaroori:** implementation me roz ka flow (branch, commit, push, PR, sync, release) owner ke saamne ek jagah ho.
- **Vikalp:**
  - **(a) Poora manual:** ek nazar me, hamesha laagu niyam, branch ka flow, roz ka kaam, release, commit message, checks, aur skill rukne pe kya.
  - **(b) Sirf commands ki table.**
- **Salah:** **(a)**.
- **Trade-off:** (a) me skills badlein to manual bhi badalna. (b) me rukne pe kya karna, ye nahi milta.
- **R1 ya baad me:** R1 se pehle.
- **Owner ka jawab (2026-11-22):** **(a)**, poora manual. Record: [DECISIONS.md](DECISIONS.md) D-432.

### Q-369. State Admin ka kaam kya ho?

- **Status:** `Tay`. Topic: B2 (apps aur roles).
- **Sawal:** owner chahte hain ki roles me State Admin rahe (2026-11-22). [PRODUCT.md](PRODUCT.md) §3 me abhi State Admin nahi hai, kyunki do faislon ke baad uska purana kaam kisi aur ke paas hai: state ka switch aur live Master ke paas (D-015), aur sellers ki manzoori poore desh ki ek team ke paas (D-084). State Admin kya kare, aur kis app me?
- **Kyun zaroori:** har state ke liye ek zimmedar milta hai jo uske districts, Super Admins aur state ke kanooni kaam sambhale; par uska kaam D-015 aur D-084 se takraana nahi chahiye, warna do roles ek hi kaam ka faisla karte.
- **Vikalp:**
  - **(a) State ka area aur operations ka head:** Super Admin app me, scope `state`. Kaam: apne state ke districts aur Super Admins ki nigrani aur unki appointment (Master → State Admin → Super Admin → Admin); naye district kholne ki tayyari; state ke kanooni kaam ki checklist (state ka GST aur TCS registration, warehouse ke licence, state ke gig-worker niyam; sab dummy); state ki escalations. State ka switch Master ke paas hi (D-015 jaisa), aur sellers ki manzoori poore desh ki team ke paas hi (D-084 jaisa).
  - **(b) (a) ke saath state ka switch bhi:** state ka switch aur live State Admin kare; Master upar se kar sake, audit ke saath. D-015 ka "Master = State" badalta hai.
  - **(c) (a) ke saath apne state ke sellers ki manzoori bhi:** jis state ke warehouse me maal aata hai, wahan ke sellers aur unke GSTIN ki jaanch us state ka State Admin kare; listing ki jaanch poore desh ki team hi kare. D-084 niyam 1 badalta hai.
- **Salah:** **(a)**. State ka ek zimmedar milta hai, aur D-015 aur D-084 jaise hain: state jaisa bada switch owner ke paas rehta hai, aur poore India ke sellers (D-036) ek hi tarah jaanche jaate hain.
- **Trade-off:** (a) me ek role aur ek account zyada, aur state ka switch abhi bhi Master ka kaam. (b) me Master ka kaam kam, par state live karne jaisa bada kaam ek level neeche. (c) me har naye state ke saath seller ki nayi team, niyam state-state me alag hone ka khatra, aur kai warehouse states wala seller kai State Admins ke paas.
- **R1 ya baad me:** R1 (area ka module R1 me).
- **Owner ka jawab (2026-11-22):** **(a)**, State Admin state ka area aur operations ka head: Super Admin app me, scope `state`; apne state ke districts aur Super Admins ki nigrani aur appointment, naye district kholne ki tayyari, state ke kanooni kaam ki checklist aur escalations. State ka switch Master ke paas aur sellers ki jaanch poore desh ki team ke paas, jaisa tha. Record: [DECISIONS.md](DECISIONS.md) D-426.

### Q-370. Progress % ka niyam kya ho?

- **Status:** `Tay`. Topic: B16 (docs aur task files).
- **Sawal:** [PROJECT_PLAN.md](PROJECT_PLAN.md) me "Progress % aur uska hisaab" aana hai, aur [CLAUDE.md](../CLAUDE.md) kehta hai ye niyam naye PROJECT_PLAN ke saath tay hoga. Progress kaise gini jaaye?
- **Kyun zaroori:** owner aur dono Claude accounts ek hi number dekh ke jaanein kitna bacha hai; aur niyam pehle se tay ho to har PR me ek hi tareeke se badle.
- **Vikalp:**
  - **(a) Size ke points aur Definition of Done:** har subtask ka size planning me (misaal S = 1, M = 2, L = 4 point; subtask lagbhag ek PR jitna, [tasks/README.md](tasks/README.md)). Point tabhi gine jab subtask RULES §1 ki Definition of Done poori kare; adhoora 0. Do number: R1 ka % (sirf R1 ke subtasks) aur poore ecosystem ka %. Jis PR me subtask poora ho, usi me PROJECT_PLAN ki table aur HANDOFF ki line.
  - **(b) Sirf subtasks ki ginti:** poore hue ÷ kul.
  - **(c) Hafton ka andaaza:** har module ke hafte ke andaaze se wazan.
- **Salah:** **(a)**. Bada kaam bada ginta hai, adhoora kaam number nahi badhata, aur R1 ka number alag dikhta hai jo abhi ka lakshya hai.
- **Trade-off:** (a) me har subtask ka size planning me tay karna padta. (b) me chhota aur bada kaam barabar ginte hain, to shuru me number zyada dikhta hai. (c) me hafton ka andaaza aksar galat hota hai.
- **R1 ya baad me:** R1 se pehle (planning ke saath).
- **Owner ka jawab (2026-11-22):** **(a)**, size ke points (misaal S = 1, M = 2, L = 4) aur Definition of Done poori hone pe hi point; R1 ka % aur poore ecosystem ka % alag; jis PR me subtask poora ho usi me table aur HANDOFF ki line. Record: [DECISIONS.md](DECISIONS.md) D-433.

### Q-371. Discovery ke baad purane docs kab hatein?

- **Status:** `Tay`. Topic: B16 (docs).
- **Sawal:** D-073 niyam 2 kehta hai purane docs discovery khatam hone pe, planning shuru hone se pehle, git tag ke saath hatenge, owner ki haan se. Discovery ka saara kaam ab naye docs me hai (D-074 ki aakhri jaanch bhi). Ab kya karein?
- **Kyun zaroori:** purane docs repo me rahein to naye session ya agent galti se unhe sach maan sakte hain (D-003); aur tag ke saath kuch khota nahi.
- **Vikalp:**
  - **(a) Abhi, ek alag commit me:** pehle abhi ke uncommitted docs ka commit (owner ke kehne pe), phir ek git tag (misaal `discovery-old-docs`) jisse purane docs ek command se mil sakein, phir purane docs ka folder aur purani CLAUDE file hatana, ek alag commit me. Tag aur commit ka push owner ke kehne pe. Purana code D-073 niyam 3 ke hisaab se naye root setup ke saath hatega.
  - **(b) Planning ke baad:** planning me purane docs dekhne ki zaroorat pade to.
  - **(c) Lawyer (AI) ki jaanch (Q-372) ke baad:** agar wo run hona hai.
- **Salah:** **(a)**. Naye docs me pehle ke kaam se lene layak sab aa chuka hai, aur tag se purana kaam kabhi bhi mil sakta hai.
- **Trade-off:** (a) me purani cheez dekhni ho to tag se nikaalni padti hai. (b) aur (c) me planning ke dauraan galti se purana doc padhne ka khatra rehta hai.
- **R1 ya baad me:** planning se pehle.
- **Owner ka jawab (2026-11-22):** **(a)**, abhi, alag commit me: pehle abhi ke docs ka commit, phir git tag, phir purane docs ka folder aur purani CLAUDE file hatana; commit, hatana aur push owner ke kehne pe. Record: [DECISIONS.md](DECISIONS.md) D-434.

### Q-372. Lawyer (AI) ka chhota doosra run?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** Lawyer (AI) ka run 2026-11-20 ko hua. Uske baad aaye kai faislon me "Lawyer se nahi jaancha" likha hai: data India ke bahar (media aur private files, CL-107; D-284, D-420), Ola ke paas location data aur uska ads aur research me istemaal (CL-104; D-347, D-425), fonts aur credits ke license (D-341, D-350), aur D-289, D-303, D-305, D-309, D-320, D-321, D-323, D-324, D-333, D-337, D-369, D-377. Kya inki ek chhoti jaanch ho?
- **Kyun zaroori:** D-257 ke hisaab se AI Lawyer hi project ka lawyer hai; uske baad ke faislon pe uski raay nahi, to Privacy page aur COMPLIANCE ki kuch rows bina jaanch ke hain.
- **Vikalp:**
  - **(a) Ek chhota run, sirf in 18 faislon pe:** Lawyer (AI) agent apni report alag file me likhe (seedha naye docs me nahi), main session jaanche, aur nateeje sawalon ke roop me aapke saamne. Run ek waqt me ek, usage ke niyam ke saath (5-hour abhi lagbhag 45%; pichhle runs ne 17% se 41% liya).
  - **(b) Nahi:** R-004 ke saath jaisa hai.
  - **(c) Planning ke baad:** module ke saath jahan zaroorat ho.
- **Salah:** **(a)**. Run chhota hai, aur Privacy page (COMPLIANCE §14.2) jaise asli user ke saamne aane wale hisse bina jaanch ke nahi rehte.
- **Trade-off:** (a) me ek agent ka kharcha aur uske nateejon ke sawal. (b) me in faislon ki kanooni detail jaanchi hi nahi jaati. (c) me jaanch bikhri hui aur der se.
- **R1 ya baad me:** R1 se pehle.
- **Owner ka jawab (2026-11-22):** **(a)**, sirf in 18 faislon pe ek chhota run; report alag file me, main session jaanche, nateeje sawalon ke roop me. Record: [DECISIONS.md](DECISIONS.md) D-435.

### Q-373. Lawyer (AI) ke chhote run ke sudhaar maanein?

- **Status:** `Tay`. Topic: B13 (compliance).
- **Sawal:** Lawyer (AI) ke chhote run (D-435, 2026-11-22) me 18 me se 4 faisle theek nikle (D-284, D-320, D-323, D-369), aur 14 me chhote badlav chahiye. Ye badlav docs me aayein?
  1. **Data India ke bahar (D-420, CL-107):** COMPLIANCE §14.2 row 7 me saaf likha jaaye kaunsa data kahan hai: product aur review images Cloudinary (US) pe, private files chune gaye object storage pe (desh chunav ke baad likha jaaye). Har provider ka likhit DPA (security ki shart ke saath). Sehat ki consent (D-165) me line ho ki ye data India ke bahar storage provider ke paas reh sakta hai (SPDI rules ka rule 7, lagbhag 13 May 2027 tak). CL-107 me Lawyer ki jaanch ka nishaan.
  2. **Ola ki bhoomika (D-347, D-255):** Ola apni Privacy Policy me khud ko data fiduciary kehta hai, aur map ke liye bheji location location wale ads ke liye bhi le sakta hai. Isliye address form pe map ke paas ek line ho: "Map search and pin use Ola Maps. What you type and the pin go to Ola under its Privacy Policy." Saath me Ola ki policy ki link. D-255 niyam 8 ki processors list me Ola ko "processor, aur apne kaam (ads, research) ke liye alag data fiduciary" likha jaaye.
  3. **Privacy page pe Ola (D-425 niyam 13):** COMPLIANCE §14.2 row 6 ka Ola wala vakya ye bataye ki kab kya jaata hai: search, pin ya "Use my current location" pe text, pin aur IP. Ye bhi bataye ki Ola is data ka khud data fiduciary hai, aur map ke bina form se address dena hamesha mumkin hai.
  4. **Fonts (D-341):**
     - Subset me font ki copyright aur license ki metadata (name table ID 0, 13, 14) bani rahe, aur build ka test ise jaanche.
     - Har font ka OFL.txt font files ke saath rahe.
     - Credits page pe font ka naam, copyright aur OFL 1.1 ho.
     - CL-125 me likha jaaye ki Reserved Font Name nahi hai.
  5. **Icons aur logos (D-350):** Credits page pe har set ka poora license notice ho (MIT, ISC, aur Apache-2.0 ka NOTICE ho to wo bhi). Sign-in ke buttons (Google, LinkedIn, GitHub) un companies ke apne branding niyamon aur official logos se bane. Credits page pe line: "Brand names and logos are trademarks of their owners."
  6. **Invoice ka email (D-289):** email me line "This is not a tax invoice. Your invoice is in the parcel and in Orders." Demo pe SPECIMEN aur DUMMY ka nishaan (D-145).
  7. **Media ka backup (D-303, OPERATIONS §6):** private files (KYC, daawe, saboot, kanooni rok) ka kho jaana personal data breach maana jaata hai (DPDP s.2(u)). Bachav ka tareeka Q-376 me hai.
  8. **Delete ke baad review (D-305, ARCHITECTURE §10.3, COMPLIANCE §14.2 row 8):** delete pe review se account aur order ka link hatta hai, aur "Verified purchase" sirf ek flag rehta hai. Customer review hatane ki maang kare to review hatta hai. Delete screen ka roop Q-375 me hai.
  9. **Band FY ki export (D-309, CL-131):** asli business pe export file ki ek copy India ke backup me ho. Provider India ke bahar ho to Registrar ko provider ki jaankari jaaye, aur export ki key ki do alag jagah copies hon.
  10. **`tech` class (D-321, ARCHITECTURE §10.3 niyam 4):** chhoot tabhi hai jab session ka shuru aur band hona, OTP ka bhejna aur jaanch (bina code), aur har outbox event ka asal kaam kam se kam 1 saal security events, audit ya logs me rahe. Iska ek test bhi ho.
  11. **CERT-In ki ghadi (D-324, OPERATIONS §8 niyam 2):** 6 ghante us alert ke samay se gine jaate hain jisne incident pakda. 6 ghante me jitni jaankari ho utni report jaaye, baaki baad me (CERT-In FAQ Q30). COMPLIANCE §13 me nazar ki row: 2 aur 3 ghante wali ghadiyon ke liye asli business se pehle doosra on-call insaan.
  12. **Data leak ki paribhasha (D-333, OPERATIONS §8 niyam 3):** "pakka" ki jagah DPDP s.2(u) ka breach: bina haq istemaal, khulna, badalna, mitna, ya pahunch kho jaana jo restore se wapas na aaye. Ghadi tab chalti hai jab alert, log ya report se itna bharosa ho ki breach hua hai; poori jaanch ka intezaar nahi. Board aur users ko pehle jitna pata ho utni suchna, baad me update (rule 7).
  13. **Logs ka 180 din (D-337, R-048):** CERT-In ke 180 din (CL-106) me Vercel ke apne logs nahi aate. API requests apne logs service me hain; static files ki requests ka log nahi rehta.
  14. **Testers (D-377):** haath ke check ke record me tester ka naam ya email nahi, sirf alias (misaal "Tester A"). Public repo hai.
  - In 18 faislon me "Lawyer se nahi jaancha" ki jagah "Lawyer (AI) ne jaancha (2026-11-22)" aur raay ka saar aaye.
- **Kyun zaroori:** ye wo hisse hain jo user ke saamne aate hain (Privacy page, address form, Credits, emails), ya jinme kanoon ki ghadi chalti hai (breach, CERT-In); inke bina kanooni chook ka khatra hai.
- **Vikalp:** **(a)** saare; **(b)** kuch (owner bataye); **(c)** koi nahi.
- **Salah:** **(a)**.
- **Trade-off:** (a) me docs me 14 chhote badlav, aur emails aur form pe kuch line zyada. (c) me Privacy page aur breach ke niyam kanoon se kam rehte hain.
- **Kanooni detail:** Lawyer (AI) ne kuch kanoon sirf secondary sources se dekhe: Companies (Accounts) Rules rule 3, CGST rule 48 aur 57, Consumer Protection Act s.2(47), MSMED s.15, aur IT Rules ke 2026 ke badlav. Providers ke DPA aur Ola ki End User Terms usne padhi nahi.
- **R1 ya baad me:** R1 (row 9 aur row 11 ka doosra insaan: asli business se pehle).
- **Owner ka jawab (2026-11-22):** **(a)**, saare 14 sudhaar, aur in 18 faislon me Lawyer (AI) ki raay ki line. Record: [DECISIONS.md](DECISIONS.md) D-436.

### Q-374. Address screen pe Ola ka map kab khule?

- **Status:** `Tay`. Topic: B5 (checkout ka address), B13 (compliance).
- **Sawal:** map ke tiles load hote hi customer ka IP aur ilaaka Ola ke paas jaata hai, aur Ola us data pe apni policy chalata hai, jisme location wale ads bhi hain. DPDP me consent tab "free" aur "specific" hota hai (s.6(1)) jab data customer ki apni pehal pe jaaye. D-347 ke features (form, search, pin, "Use my current location") waise hi rahein; sawal sirf ye hai ki map kab khule.
- **Kyun zaroori:** address screen har naye customer ke checkout pe aati hai; bina pehal data jaane se consent kamzor hota hai.
- **Vikalp:**
  - **(a) Pehle form, map pehal pe:** screen pe pehle form dikhe. Map sirf "Find on map" ya "Use my current location" dabane pe khule, Ola wali ek line ki suchna ke saath (Q-373 row 2).
  - **(b) Screen khulte hi map:** suchna ke saath.
  - **(c) (a) ke saath server ke raaste:** autocomplete aur geocoding server ke raaste chalein, taaki Ola ko customer ka IP na jaaye.
- **Salah:** **(a)**. Data sirf customer ki pehal pe jaata hai, aur D-347 ke saare raaste bache rehte hain.
- **Trade-off:**
  - (a) me ek tap zyada.
  - (b) aasaan hai, par bina pehal data jaata hai.
  - (c) IP bachata hai, par server pe bojh badhta hai (512 MB, R-007), aur Ola ki terms me proxy ki ijazat jaanchni padegi.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, pehle form; Ola ka map aur search sirf "Find on map" ya "Use my current location" dabane pe, Ola wali suchna ke saath. Record: [DECISIONS.md](DECISIONS.md) D-437.

### Q-375. Account delete pe reviews ka vikalp?

- **Status:** `Tay`. Topic: B8 (reviews), B13 (compliance).
- **Sawal:** D-305 ke hisaab se delete ke baad review bina naam ke rehte hain. Lawyer (AI) ki raay hai ki review ka text kanoon ke hisaab se rakha ja sakta hai (DPDP s.3(c)(ii), kyunki customer ne khud public kiya). Par customer ki seedhi maang pe use hatana surakshit hai (s.12(3)). Delete screen pe ye choice ho?
- **Kyun zaroori:** delete ka flow (FL-5) R1 me hai, aur reviews ki sachchai (D-305 ki wajah) aur customer ka control dono ka mel chahiye.
- **Vikalp:**
  - **(a) Choice ke saath:** default me reviews bina naam rahein, aur delete screen pe "Also delete my reviews" ka vikalp ho, pehle se tick nahi.
  - **(b) Jaisa tay hai:** reviews hamesha rahein; sirf notice, aur maang pe support se hatana.
  - **(c) Sab hatein:** delete pe saare reviews hat jaayein.
- **Salah:** **(a)**. Rating zyadatar sach rehti hai, aur customer ke haath me control bhi.
- **Trade-off:**
  - (a) me delete screen pe ek checkbox aur uska test.
  - (b) me maang ka raasta sirf support se chalta hai.
  - (c) me brand ki rating achanak badal sakti hai.
- **R1 ya baad me:** R1.
- **Owner ka jawab (2026-11-22):** **(a)**, default me reviews bina naam ke, aur delete screen pe "Also delete my reviews" ka vikalp, pehle se tick nahi. Record: [DECISIONS.md](DECISIONS.md) D-438.

### Q-376. Private files ko mitne se kaise bachayein?

- **Status:** `Tay`. Topic: B14 (security), B13 (compliance).
- **Sawal:** private files (KYC, daawe, saboot, kanooni rok wali files) ki abhi ek hi copy hai (D-303). Inka kho jaana personal data breach hai (DPDP s.2(u)), aur rok wali file 1 saal rakhni hoti hai (rule 8(3), lagbhag 13 May 2027 se). Kya karein?
- **Kyun zaroori:** code ki ek galti ya provider ki ek dikkat se file mit jaaye, to breach ki suchna aur kanooni rok ki chook dono ek saath hoti hain.
- **Vikalp:**
  - **(a) Rok wali files pe lock:** kanooni rok wali files ke folder (prefix) pe object storage ka lock (misaal R2 ka bucket lock), rok ki muddat jitna, lagbhag 13 May 2027 se.
  - **(b) Hafte ki doosri copy:** private files ki doosri copy laptop pe ya doosre provider pe.
  - **(c) Jaisa tay hai.**
- **Salah:** **(a)**. Ye ₹0 ho sakta hai, aur galti se bhi file nahi mitti. Lock free plan pe milta hai ya nahi, ye object storage ki jaanch me dekhna hoga (OPEN_QUESTIONS §2).
- **Trade-off:**
  - (a) me galat muddat ka lock file ko samay pe mitne nahi deta, to muddat retention ke niyam se hi tay ho.
  - (b) me personal data ki ek aur copy, aur owner ka hafte ka kaam.
  - (c) me kho jaane pe breach ki suchna aur rule 8(3) ki chook.
- **R1 ya baad me:** lagbhag 13 May 2027 se pehle; R1 me sirf design.
- **Owner ka jawab (2026-11-22):** **(a)**, kanooni rok wali files ke folder pe object storage ka lock, rok ki muddat jitna, lagbhag 13 May 2027 se. Record: [DECISIONS.md](DECISIONS.md) D-439.

### Q-377. Env files: har environment ki apni file, aur `.env.production` kahan?

- **Status:** `Tay`. Topic: B15 (technical), B14 (security).
- **Sawal:** owner ka niyam (2026-11-22): development me kuch bhi optional nahi; jo env laptop pe chalane ya testing ke liye chahiye, wo saaf aur required ho. Development ki values development ki env file se, testing ki values testing ki alag file se, aur production ki values `.env.production` se aayein. `.env.example` me teeno ki saari keys dummy values ke saath hon. Niyam ki detail kaise ho, aur `.env.production` kahan rahe?
- **Kyun zaroori:** pehle ka niyam (OPERATIONS §1 niyam 9) LOCAL, OPTIONAL aur PRODUCTION ke teen hisse aur default wali settings maanta tha; owner ka niyam usse alag hai. Repo public hai, to production ki values wali file kahan rahe, ye security ka sawal hai.
- **Vikalp:**
  - **(a) Chaar files, `.env.production` repo ke bahar:**
    - `.env.development` aur `.env.test` har deployable ke folder me, git se bahar.
    - `.env.production` owner ke private env folder me, repo ke bahar. Render aur Vercel me wahi values isi se jaati hain.
    - `.env.example` me DEVELOPMENT, TEST aur PRODUCTION ke teen hisse. TEST me tests ki nakli values hi, taaki CI `.env.test` usi se bana sake.
    - Har key required, code me koi default nahi, aur CI ka test RT-57.
  - **(b) Chaaron files deployable ke folder me:** `.env.production` bhi repo ke folder me, sirf `.gitignore` ke bharose.
  - **(c) Production ki file nahi:** production ki values sirf Render aur Vercel ke dashboards me (pehle jaisa).
- **Salah:** **(a)**. Owner ka niyam poora hota hai. Production ke secrets repo ke folder me kabhi nahi aate, to galti se commit ya kisi tool ke padhne ka khatra nahi rehta. Aur CI ko test ki values ke liye koi secret nahi chahiye.
- **Trade-off:**
  - (a) me production ki values do jagah hain (file aur platform), to har badlav dono me karna padta hai (OPERATIONS §4 niyam 6). File laptop pe hai, to disk encryption (OWNER_TASKS OT-2) aur zaroori ho jaata hai.
  - (b) me ek `.gitignore` ki galti se production ke secrets public repo me ja sakte hain.
  - (c) me owner ke niyam wali production file hi nahi banti.
- **R1 ya baad me:** R1 (naye root setup se).
- **Owner ka jawab (2026-11-22):**
  - **Owner ka niyam:** development me koi optional env nahi; development, testing aur production ki values apni-apni env file se; `.env.example` me teeno ki saari keys dummy values ke saath.
  - **Detail (a):**
    - `.env.development` aur `.env.test` deployable ke folder me, git se bahar.
    - `.env.production` repo ke bahar, owner ke private env folder me.
    - Har key required, aur code me koi default nahi.
  - **Record:** [DECISIONS.md](DECISIONS.md) D-441.

### Q-378. Modules kis hisaab se banein, aur unki list kya ho?

- **Status:** `Tay`. Topic: B16 (docs aur task files).
- **Sawal:** planning ka pehla kaam [PROJECT_PLAN.md](PROJECT_PLAN.md) me modules ki list aur unki dependencies hai (D-443). Har module ka ek folder `tasks/NN-<module>/` aur ek `TASK.md` hoga. Modules kis hisaab se kaatein?
- **Kyun zaroori:**
  - Module hi `TASK.md`, subtasks, progress ke points (D-433) aur acceptance criteria ki link ki ikaai hai. Baad me kaatna badla to saari task files dobara banti hain.
  - [ACCEPTANCE.md](ACCEPTANCE.md) ke ids `AC-<MODULE>-<n>` pehle se services aur apps ke naam pe hain (PLATFORM, 12 services, 9 R1 apps), aur [ARCHITECTURE.md](ARCHITECTURE.md) §2.2 me har data ka ek maalik service hai.
  - D-010 kehta hai: jaise-jaise module bane, uski screens apne app me judti jaayengi.
- **Vikalp:**
  - **(a) Service aur app ke modules (27):** har backend service ka ek module, har app ka ek module, aur saajhe kaam ke 4 module. App ke module me us app ka dhaancha aur saari screens; screen ka subtask us service ke subtask pe tika hota hai jiska data wo dikhata hai. List neeche.
  - **(b) Feature ke modules:** saajhe kaam ke 4 module, phir [PROJECT_PLAN.md](PROJECT_PLAN.md) §1 ke R1 ke hisse jaise modules (area, staff aur roles, sellers, catalog, maal aana, customer, checkout, fulfilment, return, review, paisa), aur R2 ke features alag modules. Har module me apni services aur apps ke saare hisse.
  - **(c) Service ke modules, screens bhi wahin (16):** saajhe kaam ke 4 aur 12 services ke modules; har screen us service ke module me jiska data wo dikhata hai. Apps ke alag module nahi; har app ka dhaancha frontend-kit me.
- **(a) ki list aur dependencies:** ab [PROJECT_PLAN.md](PROJECT_PLAN.md) §3 me (D-444).
- **Salah:** **(a)**.
  - ACCEPTANCE ke ids, ARCHITECTURE ka "har data ka ek maalik" aur testing ki files ([testing/](testing/COMMON.md), har app ki ek) teeno ek-ek module se milte hain, to koi criterion ya file do modules me nahi bat-ti.
  - Ek service ka data model, API aur security ek hi `TASK.md` me rehte hain.
  - D-010 ki baat bhi poori hoti hai: service ka subtask bane to uski screen ka subtask app ke module me juda hota hai.
- **Trade-off:**
  - (a) me R1 ka ek hissa (jaise return) kai modules me phaila hota hai, to "R1 ka flow kitna chala" dekhne ke liye PROJECT_PLAN §1 ke hisson se subtasks ka rishta alag se rakhna padta hai. 27 folders.
  - (b) me R1 ka har hissa seedha dikhta hai, par ek service ka data model kai `TASK.md` me bikharta hai, ACCEPTANCE ke ids modules se nahi milte, aur ek PR aksar kai services ko chhoota hai.
  - (c) me folders kam hain, par Customer app ki screens kai service modules me bikhrti hain, aur app ke criteria (`AC-CUSTOMER-*`) aur testing ki file ka koi ek module nahi.
- **R1 ya baad me:** abhi (planning ka pehla kaam).
- **Owner ka jawab (2026-11-22):** **(a)**, har backend service aur har app ka apna module, aur saajhe kaam ke 4 module: kul 27, draft wali list ke saath ([PROJECT_PLAN.md](PROJECT_PLAN.md) §3). Record: [DECISIONS.md](DECISIONS.md) D-444.

### Q-379. Packages ka flow (banana, publish, republish) kab aur kitna?

- **Status:** `Tay`. Topic: B15 (technical), B16 (task files).
- **Sawal:** owner ka khayal (2026-11-22): code shuru hote hi sabse pehle packages ka kaam lagega, isliye packages ka poora flow (naya package banana, publish aur republish) sabse pehle plan ho aur repo me aaye. Abhi D-325 kehta hai ki koi package npm pe publish nahi hoga (R1 ke baad owner dobara dekhe). D-023 kehta hai ki packages ke CLI (create, publish, republish, verify, update-deps) pe naya kaam publish ka plan banne pe hi hoga. Kya karein?
- **Kyun zaroori:**
  - Owner ki baat sahi hai ki pehla code packages ka hai: har service aur app `02-platform` aur `03-frontend-kit` pe tiki hai ([PROJECT_PLAN.md](PROJECT_PLAN.md) §3). Package kaise banta hai, kaise build hota hai (tsdown, [RULES.md](RULES.md) CR-34) aur apps use kaise jodte hain, ye pehle din se chahiye.
  - Par monorepo me apps aur services packages ko workspace se seedha jodte hain. R1 chalane ke liye npm pe publish ki zaroorat nahi.
  - Publish se D-325 khulta hai, aur saath me uska bojh aata hai: har package ka version aur changelog, supply chain ka khatra (R-026), npm account aur trusted publishing ki setting (owner ka kaam), aur fake registry wale tests.
- **Vikalp:**
  - **(a) Pehle banana aur jodna, publish baad me:**
    - Packages ke CLI ka `create` aur `verify` sabse pehle, `01-foundation` ke hisse ke roop me. `create` sahi dhaancha wala naya package banata hai: README, frontend me playground, `private: true`, tsdown build aur tests. `verify` package ke niyam (CR-33 se CR-36) jaanchta hai.
    - Har package shuru se publish ke layak banta hai: ESM, exports, types aur README.
    - `publish`, `republish` aur `update-deps` ka plan abhi likha jaata hai ([OPERATIONS.md](OPERATIONS.md) §11 niyam 7 ke hisaab se). Unka code aur npm pe pehla publish R1 ke baad, D-325 jaisa.
  - **(b) Poora flow abhi:**
    - `create`, `verify`, `publish`, `republish` aur `update-deps` sab R1 se pehle.
    - Chune hue packages public npm pe jaate hain, trusted publishing (OIDC) aur provenance ke saath, aur workflow sirf `release` se chalta hai. D-325 badalta hai.
  - **(c) Jaisa tay hai:** packages ka koi alag flow nahi. Packages `02-platform` aur `03-frontend-kit` ke kaam ke saath haath se bante hain, aur CLI aur publish dono R1 ke baad.
- **Salah:** **(a)**.
  - Owner ki baat ka zaroori hissa isse poora hota hai: package banana aur jodna sabse pehle, aur pehle din se har package ek jaisa banta hai.
  - Publish se R1 ke order flow me koi madad nahi milti, aur uske bojh se pehla chalta order der se aata hai.
  - Plan abhi likha hone se baad me publish ke liye sirf workflow aur owner ke account ka kaam bachta hai. Koi feature kata nahi.
  - Agar packages ko abhi doosre projects me use karna ho ya public dikhana lakshya ho, to (b) ka fayda hai. Warna (a).
- **Trade-off:**
  - (a) me publish ki asli jaanch (npm pe pehla publish, provenance) R1 ke baad hogi. Tab kuch packages ke naam ya exports badalne pad sakte hain.
  - (b) me R1 se pehle ek alag bada kaam judta hai: har package ka version aur changelog, npm account aur MFA, trusted publishing, `release` se workflow, aur har publish pe supply chain ki jaanch. Pehla chalta order kai PR der se aata hai.
  - (c) me har package haath se banta hai, to dhaancha alag-alag ho sakta hai (README, playground ya Tailwind import jaise niyam chhoot sakte hain, CR-33). CLI ka fayda R1 me nahi milta.
- **R1 ya baad me:** (a) me `create` aur `verify` R1 me, publish R1 ke baad. (b) me sab R1 me.
- **Owner ka jawab (2026-11-22):** **(b)**, packages ka poora flow abhi, R1 se pehle: `create`, `verify`, `publish`, `republish` aur `update-deps`. Owner ne baad me saaf kiya ki saare packages public npm pe jaayenge aur publish owner karega; tests me fake registry hi. Record: [DECISIONS.md](DECISIONS.md) D-445.

### Q-380. Packages ke flow ka plan maanein?

- **Status:** `Tay`. Topic: B15 (technical), B16 (task files).
- **Sawal:** D-445 ke hisaab se packages ka poora flow R1 se pehle banta hai, aur code shuru hone pe pehla kaam yahi hai. Neeche plan ka draft hai. Haan ho to ye ek module ki `TASK.md` banta hai, poori detail ke saath. Plan maanein?
- **Kyun zaroori:**
  - Har package isi flow se banega, jaanchega aur publish hoga, to iski kami har package me jaati hai.
  - npm pe chhapa version wapas lena mushkil hai, aur wahi version number dobara kabhi use nahi hota. Galat file, secret ya galat version ek baar public hua to wahin rehta hai.
- **Plan (draft):**
  1. **Module:** naya module `28-packages` (packages ka flow), R1, `01-foundation` pe tika. `02-platform` aur `03-frontend-kit` ke packages iske `create` se bante hain, to wo is pe tike.
  2. **Commands** (repo ke root se `npm run <naam>`):

     | Command       | Kya karta hai                                                                                                                                                                                                                                                                                                                             | Kaun chalata hai                  |
     | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
     | `create`      | Naya package sahi jagah aur dhaanche me: `packages/<category>/<name>`, naam `@beautinique/<category>-<name>`, ESM, exports aur types, tsdown build, tests, README, CHANGELOG, frontend me playground aur `tailwind.css` (CR-33, CR-34). README me "Visibility" ka hissa (asal me private ya public); naam npm pe pehle se ho to ruk jaana | Claude ya owner                   |
     | `build`       | Saare packages, andar ki dependencies pehle                                                                                                                                                                                                                                                                                               | Koi bhi                           |
     | `verify`      | Publish wali saari jaanch, bina publish: build, typecheck, lint, tests, package me kya jaayega (sirf build, README, CHANGELOG aur LICENSE; secret ka koi pattern nahi), exports aur types sahi, CR-33 se CR-36                                                                                                                            | Koi bhi; CI har PR pe             |
     | `status`      | Har package ka repo wala aur npm wala version, aur kya publish hona baaki                                                                                                                                                                                                                                                                 | Koi bhi                           |
     | `republish`   | Badle hue public packages ka naya version (patch, minor ya major), aur jo packages unpe tike hain unka bhi jahan zaroorat ho. Har package ka CHANGELOG uske commits se. Sab ek branch pe commit, phir PR se `prerelease` aur `release`                                                                                                    | Claude, owner ke kehne pe         |
     | `publish`     | Jo version npm pe nahi, wo publish. Naya package pehli baar owner ke laptop se; uske baad GitHub ka workflow                                                                                                                                                                                                                              | Owner (pehli baar), phir workflow |
     | `update-deps` | Bahar ki dependencies ke naye versions dikhana, poochh ke likhna aur install karna; galti ho to sab pehle jaisa                                                                                                                                                                                                                           | Claude, owner ke kehne pe         |

  3. **Publish ka workflow** ([OPERATIONS.md](OPERATIONS.md) §11 niyam 7): sirf `release` se, haath se chalaya. Pehla job bina haq ke build, test aur pack karta hai; doosra sirf bane tarballs utaar ke trusted publishing (OIDC) aur provenance se publish karta hai. npm ka koi token repo ya CI me nahi. Publish ke baad har package-version ka git tag, sandesh me `release` branch ka naam, aur back-merge `release` → `prerelease` (D-023).
  4. **Hifazat:**
     - Pehle dry run, phir poochh ke hi publish; working tree saaf ho.
     - Package me sirf `files` ki allowlist wali cheezein.
     - `npm login`, `npm logout` aur `npm trust` sirf owner chalata hai; owner ke npm account pe MFA (SR-081).
     - Har naya dependency review ke baad ([OPERATIONS.md](OPERATIONS.md) §11 niyam 2).
  5. **Tests:** CLI ke tests fake npm registry pe ([RULES.md](RULES.md) §4.2), asli npm kabhi nahi; publish fail aur session khatam jaise haalat bhi. Tests ke liye local infra ki baat docs me (D-023).
  6. **Docs:** [OPERATIONS.md](OPERATIONS.md) me publish ka manual (kab kya chalana), aur [OWNER_TASKS.md](OWNER_TASKS.md) me owner ke npm wale kaam.
  7. **Subtasks (andaaza, D-433 ke points):**

     | Subtask                                             | Size   |
     | --------------------------------------------------- | ------ |
     | CLI ka dhaancha aur `build`                         | M (2)  |
     | Fake npm registry aur CLI ke tests ka dhaancha      | M (2)  |
     | `create`                                            | M (2)  |
     | `verify`                                            | M (2)  |
     | `status` aur laptop se `publish`                    | M (2)  |
     | `republish`: versions, tike packages aur CHANGELOG  | L (4)  |
     | GitHub ka publish workflow (OIDC, provenance, tags) | M (2)  |
     | `update-deps`                                       | M (2)  |
     | **Kul**                                             | **18** |

- **Vikalp:**
  - **(a) Draft jaisa, naya module `28-packages`.**
  - **(b) Draft jaisa, par `01-foundation` ke andar:** alag module nahi.
  - **(c) Badlav ke saath:** owner bataye kya badle.
- **Salah:** **(a)**. Ye flow apne aap me bada kaam hai (lagbhag 18 points), apne CI workflow aur apne tests ke saath. Alag module me iska progress aur `TASK.md` saaf rehte hain, aur `01-foundation` sirf root setup ka rehta hai.
- **Trade-off:**
  - (a) me 28 modules ho jaate hain.
  - (b) me `01-foundation` bada ho jaata hai, aur root setup aur packages ka progress ek number me mil jaata hai.
  - Dono me ye kaam pehle chalte order ko lagbhag 18 points der se laata hai. Mahine ke dependency PRs ([OPERATIONS.md](OPERATIONS.md) §11 niyam 1) aur `update-deps` ka kaam milta-julta hai; `update-deps` sirf haath ke turant update ke liye.
- **R1 ya baad me:** R1 se pehle (code ka pehla kaam).
- **Owner ka jawab (2026-11-22):** **(a)**, draft jaisa plan, aur naya module `28-packages`. Record: [DECISIONS.md](DECISIONS.md) D-445.

### Q-381. Kaunse packages public npm pe jaayein?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** D-445 kehta hai ki chune hue packages public npm pe jaayenge. Kaunse packages?
- **Kyun zaroori:**
  - Public package ka har version hamesha npm pe rehta hai. Todne wala (breaking) badlav naya major version maangta hai, aur har version ka CHANGELOG bahar ke logon ke liye hota hai.
  - Har public package supply chain ka hissa hai (R-026).
  - R1 ke dauraan packages tezi se badlenge, to public packages jitne zyada, versions ka kaam utna zyada.
- **Vikalp:**
  - **(a) Saare packages public:** [ARCHITECTURE.md](ARCHITECTURE.md) §12 ki poori list.
  - **(b) Sirf aam kaam ke packages public:** jo Beautinique ke data ya API se bandhe nahi (misaal `shared-validators`, `shared-money`, `shared-clock`, `backend-logger`, `backend-events`, `frontend-components`, `frontend-forms`, `frontend-data-table`). Beautinique se bandhe packages (misaal `shared-contracts`, `frontend-api-client`, `frontend-authz`, `frontend-app-shell`, `frontend-auth-ui`, `frontend-styles`) private.
  - **(c) Shuru me 2 se 3 tike hue packages public:** misaal `shared-validators`, `shared-money` aur `shared-clock`; baaki private. Aage koi package public karna ho to owner ki haan se.
- **Salah:** **(c)**. Poora flow (`create` se `publish` tak) asli npm pe chalta aur jaancha jaata hai, par shuru me bojh kam rehta hai: kam versions, kam major badlav, aur supply chain ka kam hissa. Jo package tik jaaye, use public karna sirf `private` hatana aur owner ka pehla publish hai.
- **Trade-off:**
  - (a) me R1 ke dauraan har badlav pe kai packages ke naye versions aur majors. Beautinique ke API wale packages ka bahar koi kaam nahi.
  - (b) me (c) se zyada versions ka kaam, par aam packages turant doosre projects me kaam aate hain.
  - (c) me baaki packages ke publish ka asli test baad me hota hai, aur shuru ki public list chhoti hai.
- **R1 ya baad me:** R1 se pehle (packages ke flow ke saath).
- **Owner ka jawab (2026-11-22):** **(a)**, saare packages public, kyunki npm free plan pe private packages publish nahi karne deta. Har package ke README me note ki security ke hisaab se wo asal me private hona chahiye ya public. Record: [DECISIONS.md](DECISIONS.md) D-445.

### Q-382. Asli publish ke bina packages ka flow kaise poora ho?

- **Status:** `Tay`. Topic: B15 (technical).
- **Sawal:** owner ne kaha (2026-11-22) ki koi package asli npm pe publish nahi hoga, par flow poora chahiye (D-445). Bina asli npm ke flow kaise chale aur kaise jaancha jaaye?
- **Kyun zaroori:**
  - Jis package pe `private: true` ho, use npm khud kisi bhi registry pe publish nahi karta. Saare packages private rahein to `publish` aur `republish` asli packages pe kabhi nahi chalte, sirf tests ke packages pe.
  - Package private na ho to galti se asli npm pe jaane ka raasta khulta hai, aur use alag se rokna padta hai.
  - GitHub workflow ka aakhri kadam (trusted publishing se npm pe upload) asli npm ke bina kabhi chala ke jaancha nahi ja sakta.
- **Vikalp:**
  - **(a) Saare packages `private: true`, flow tests me:** CLI ka poora flow (`create` se `publish` aur `republish` tak) tests ke packages ke saath fake npm registry pe chalta aur jaancha jaata hai. GitHub workflow `release` pe sirf dry run karta hai (build, test, pack aur `npm publish --dry-run`). Asli packages ke version aur CHANGELOG ka kaam nahi.
  - **(b) Laptop pe local registry:** packages `private: true` nahi. Har package ka `publishConfig.registry` laptop ka local npm registry hai (misaal Verdaccio, Docker me), to `npm publish` bhi wahin jaata hai. CI pakka karta hai ki koi package asli npm ki taraf na ho. Owner apne asli packages ke saath poora flow (`create`, `verify`, `republish`, `publish`, aur local registry se install) laptop pe chala ke dekh sakta hai. GitHub workflow sirf dry run.
  - **(c) Badlav ke saath:** owner bataye.
- **Salah:** **(b)**. Owner ko poora flow chahiye, aur (b) me wo asli packages ke saath sach me chalta dikhta hai, sirf tests me nahi. Asli npm ka raasta do jagah band rehta hai (`publishConfig.registry` aur CI ka pehra), aur npm ka login sirf owner ke paas hai.
- **Trade-off:**
  - (a) sabse surakshit aur sabse kam kaam hai, par asli packages pe flow kabhi nahi chalta; saboot sirf tests.
  - (b) me laptop ke infra me ek local registry ka container judta hai, aur R1 ke dauraan asli packages ke versions, CHANGELOG aur tags ka kaam bhi. `private: true` ka pehra hat-ta hai, aur uski jagah `publishConfig.registry` aur CI ka pehra aata hai.
  - Dono me workflow ka npm upload wala kadam kabhi asli chala ke nahi jaancha jaata.
- **R1 ya baad me:** R1 se pehle (packages ke flow ke saath).
- **Owner ka jawab (2026-11-22):** ye sawal ab laagu nahi: owner asli npm pe publish karega (Q-381). Tests me fake npm registry hi. Record: [DECISIONS.md](DECISIONS.md) D-445.

### Q-383. Packages ke flow ke acceptance criteria maanein?

- **Status:** `Tay`. Topic: B15 (technical), B16 (task files).
- **Sawal:** module `28-packages` ([tasks/28-packages/TASK.md](tasks/28-packages/TASK.md)) ke liye neeche ke 12 criteria [ACCEPTANCE.md](ACCEPTANCE.md) me `PACKAGES` ke naam se jod dein?
- **Kyun zaroori:** Definition of Done ([RULES.md](RULES.md) DD-1) kehta hai ki har criterion ka kam se kam ek automated test ho. [ACCEPTANCE.md](ACCEPTANCE.md) me abhi sirf services aur apps ke criteria hain, packages ke flow ke nahi. Criteria ke bina is module ka koi subtask "ho gaya" nahi ho sakta.
- **Criteria:** ab [ACCEPTANCE.md](ACCEPTANCE.md) §1.14 me (`AC-PACKAGES-1` se `AC-PACKAGES-12`).
- **Vikalp:**
  - **(a) Draft jaisa:** 12 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.14 `PACKAGES` me.
  - **(b) Badlav ke saath:** owner bataye.
- **Salah:** **(a)**. Har command ka khushi wala raasta aur uska mana hone wala raasta, dono jaanche jaate hain. Sabse bade khatre (galat file ya secret ka publish, aadha publish, galat branch se publish, asli npm ko chhoone wale tests) ka apna criterion hai.
- **Trade-off:** (a) me har criterion ka kam se kam ek test chahiye, to module ka test ka kaam badhta hai. (b) me der, par owner apni koi zaroori baat jod sakta hai.
- **R1 ya baad me:** R1 se pehle (packages ke flow ke saath).
- **Owner ka jawab (2026-11-22):** **(a)**, draft jaise 12 criteria [ACCEPTANCE.md](ACCEPTANCE.md) §1.14 `PACKAGES` me. Record: [DECISIONS.md](DECISIONS.md) D-445.

### Q-384. Modules kis kram me banein?

- **Status:** `Tay`. Topic: B16 (docs aur task files).
- **Sawal:** 28 modules ([PROJECT_PLAN.md](PROJECT_PLAN.md) §3) kis kram me banein? `NN` sirf pehchaan hai, isliye banane ka kram alag se tay karna hai.
- **Kyun zaroori:**
  - Kram se tay hota hai ki pehla chalta hissa kab dikhega, aur kaunsi `TASK.md` pehle likhi jaaye.
  - R1 ka ek hissa (jaise return) kai modules me phaila hai (D-444), to kram modules ka ho ya R1 ke hisson ka, ye chunna padta hai.
- **Vikalp:**
  - **(a) Neev, phir chalta dhaancha, phir R1 ke hisse ek-ek karke:** har charan me us hisse ke liye zaroori service aur app ke subtasks. Charan poora hone pe wo flow shuru se aakhir tak chalta hai. Kram neeche.
  - **(b) Parat-dar-parat:** pehle saajhe 4 module (`01`, `28`, `02`, `03`), phir saari services dependency ke kram me (`04` se `15`), phir saare apps (`16` se `24`), aakhir me `27`. Har module ek baar me poora.
  - **(c) Badlav ke saath:** owner bataye.
- **(a) ka kram:** ab [PROJECT_PLAN.md](PROJECT_PLAN.md) §5 me (D-446).
- **Salah:** **(a)**.
  - Har charan ke ant me ek asli flow chalta dikhta hai, to galti aur design ki dikkat jaldi pakdi jaati hai.
  - Live pe pehla deploy charan 1 me hota hai, to hosting ki dikkatein (free tier, `/wake`) shuru me hi saamne aati hain.
  - Services aur apps ka jod har charan me jaancha jaata hai, aakhir me ek saath nahi.
- **Trade-off:**
  - (a) me ek module kai charanon me thoda-thoda banta hai, to module ka "poora" hona der se hota hai, aur kaam ek module se doosre pe jaata rehta hai.
  - (b) me har module ek baar me poora aur seedha banta hai, par pehli screen aur pehla chalta flow bahut der se aata hai (saari services ke baad), aur services aur apps ke jod ki galtiyan aakhir me ek saath nikalti hain.
- **R1 ya baad me:** abhi (planning).
- **Owner ka jawab (2026-11-22):** **(a)**, charan wise: neev, phir chalta dhaancha aur pehla deploy, phir R1 ke hisse ek-ek karke, draft wale kram se. Record: [DECISIONS.md](DECISIONS.md) D-446.

## Change log

| Version           | Date                     | Badlav                                                                                                               |
| ----------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.8.21 | 2026-11-17 se 2026-11-22 | Topics B1 se B16, jaanchna baaki (§2) aur sawal Q-001 se Q-384, sab Tay; har badlav ka poora itihaas git me (D-442). |
