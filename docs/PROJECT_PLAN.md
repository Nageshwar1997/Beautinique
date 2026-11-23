# PROJECT PLAN: Beautinique

> **Status:** v1.5.15 (2026-11-23). Project ki kendriya file. Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## 0. Is file me kya aayega

- Project ek nazar me (lakshya, ek paragraph).
- Modules ki list: har module ki ek line aur uske `tasks/<nn-module>/TASK.md` ki link.
- Modules ki dependencies: kaunsa module kis pe tika hai.
- Releases (R1, R2 ...): kis release me kya (§1).
- Progress % aur uska hisaab.
- Zaroori faislon ki links ([DECISIONS.md](DECISIONS.md)); faisle yahan dobara nahi likhe jaate.

## 1. Releases

Design poore ecosystem ka, banana releases me; koi feature kata nahi (D-008). Jo R1 me nahi, wo R2 aur aage aata hai.

### R1: pehla poora order (D-055)

**Lakshya:** ek customer ka order shuru se aakhir tak, asli jaisa chale: area khulna → seller → product → maal warehouse me → order → payment → delivery → return aur refund → review → seller ka hisaab. Har hissa chhote roop me, par poora chalta hua.

**Andar:**

1. **Area:** poore India ka location data import; Maharashtra → Pune → warehouse wala sub-district live, 1 warehouse + 1 hub (D-014, D-015, D-016, D-022). Unserved pincode pe "unavailable" aur notify-me waitlist me judna (D-046). Area khulne ki khabar in-app aur push se (D-141).
2. **Staff aur roles:** sirf in flows ke roles chalu (D-017, D-054), owner ke alag accounts ke saath; staff ke kaam audit log me. Return, daawe aur refund ki manzoori ke liye Support Desk app ka patla hissa, Support Agent role ke saath (D-105); customer ki appeal ke liye Support Lead (D-147). Reviews ke liye Review Moderator (D-136). Grievance Officer aur Nodal Officer apne staff roles, unki asli jaankari site ke page pe (D-237, D-241); Grievance Officer hi personal data ke sawalon ka sampark, aur CERT-In ke liye "Security Contact" role owner ke paas (D-253).
3. **Sellers:** 2 sellers: apna brand (alag dummy company, D-031) aur ek dummy brand. Onboarding dummy KYC aur Maharashtra GSTIN ke saath (D-036); staff ki approval.
4. **Catalog:** seller products daale (shade aur size jaise variants, MRP, price, HSN aur GST rate, images); staff ki jaanch ke baad live. Customer ke liye list, product page, basic search aur filter. Ingredients text + label photo se, INCI structured list, free-from filters aur allergen ki chetavni (D-099, D-159). Skin type, concern aur active % ke fields (D-137); filters, sort aur kram (D-138, D-139); zero result pe madad (D-152); stock khatam product neeche dikhe (D-153); sirf sach aankde (D-154). Test wale claims saboot ke saath hi (D-224); har kate MRP ya "% off" ke saath pichhle 30 din ka sabse kam daam (D-223).
5. **Maal warehouse me:** seller maal bheje; receiving pe batch aur expiry ki jaanch (D-014); stock dikhe.
6. **Customer:** sign-up sirf 18+ (D-038), sign-in ke teen raaste (D-021); pincode check; cart aur wishlist sign-in ke saath (D-020); address. Live site pe account sirf allowlist se (D-133); legal pages aur sign-up ka consent (D-150); profile sudhaar, marketing consent band aur account delete (D-151); delete pe jaari invoice alag tax archive me (D-225); delete pe data app se turant hat-ta hai, phir kanooni rok me, aur request logs aur security events apne store me kam se kam 180 din (D-250).
7. **Checkout aur payment:** Razorpay test mode (prepaid) aur delivery pe UPI QR (D-034); stock reservation; ek order me dono sellers ke items ho sakein, invoice har seller ke GSTIN se (D-030, D-041).
8. **Fulfilment:** warehouse me pick aur pack; hub tak trip ka record (D-027); hub pe receive; delivery partner ko assign; Delivery app (PWA, D-042) se delivery aur proof. Order ka status customer ko in-app aur email se.
9. **Return aur refund:** customer return maange (abhi simple niyam: sirf band ya kharab maal; cosmetics ke poore niyam domain charcha ke baad), delivery partner pickup kare (D-014), warehouse me jaanch, refund (Razorpay test mode). Muddatein invoice aur pages pe likhi (D-221); "der se pahuncha" bhi return ki wajah (D-222).
10. **Review:** delivery ke baad verified purchase review (D-039): ek customer, ek product, ek review (D-135); moderation (D-136, D-146); photo ke saath (D-155); nakli review ke niyam 1 aur 5 (D-156); inaam nahi (D-158). Har review pe us waqt ka listing version (D-171); seller apne products ke reviews seller app me dekhe (D-160).
11. **Paisa:** finance service (PostgreSQL, D-001) me har seller ka hisaab: order value, commission, GST TCS, income-tax TDS. Payout haath se "paid" mark hota hai, asli bank transfer nahi. Seller ki reports aur settlement CSV (D-143, D-144).
12. **Chalana:** backup command (D-013) aur free tier ki zaroori handling (D-028); emails ki line aur chhat (D-140, D-142); owner ke aankde (D-149) business events se (D-157); demo aur dummy ka nishaan (D-145); kanooni areas ki gehrai (D-134).

**Bahar (R2 aur aage):**

- Promotions, coupons aur bundles; loyalty points aur referral (D-173 se D-176); dobara kharid ki yaad (D-178). Store credit nahi (D-177); gift cards aur subscriptions kanooni jaanch ke baad (D-178, D-179).
- Virtual try-on, shade finder, beauty profile aur recommendations (D-165, D-166, D-168, D-169); Beauty Advisor aur consultation (D-025, D-172).
- Support desk ke tickets, SLA, grievance aur disputes (D-161 se D-164; R1 me sirf patla hissa, D-105).
- Reviews ke R2 hisse: brand ka jawab, reviewer ki skin jaankari, Q&A, formula badla label (D-160, D-167, D-170, D-171).
- Growth Studio aur Creator ke kaam; Beauty Pro buyers ke kaam.
- Zyada sellers, zyada hubs, naye districts aur states (setting se, D-037).
- Transporter ke bill ki finance entry aur finance ki poori reports.

**Note:** har module ki detail (screens, fields, niyam) domain charcha ke baad us module ki `TASK.md` me aayegi. Usme R1 ke liye kuch aur zaroori nikla to R1 owner ki haan se badlega.

## 2. Progress % ka hisaab (D-433)

1. **Size:** har subtask ka size planning me tay hota hai: misaal S = 1, M = 2, L = 4 point. Subtask lagbhag ek PR jitna ([tasks/README.md](tasks/README.md)); L se bada kaam chhote subtasks me toota jaata hai.
2. **Kab ginta hai:** point tabhi gina jaata hai jab subtask [RULES.md](RULES.md) §1 ki Definition of Done poori kare. Adhoora kaam 0 point.
3. **Do number:**
   - **R1 ka %** = R1 ke poore subtasks ke points ÷ R1 ke saare subtasks ke points.
   - **Ecosystem ka %** = saare modules ke liye wahi hisaab.
   - Dono poore number tak round.
4. **Kab badalta hai:** jis PR me koi subtask poora ho, ya subtask jude, hate ya uska size badle, usi PR me is file ki table aur [HANDOFF.md](HANDOFF.md) §1 ki "Progress" line.
5. **Table:** module, release, kul points, poore points aur % ki table §4 me. Jis module ki `TASK.md` nahi bani, uske points "—".

## 3. Modules (D-444)

Har module ka folder `tasks/NN-<module>/` aur uski `TASK.md` ([tasks/README.md](tasks/README.md)); `TASK.md` us module ki planning ke saath judti hai. "Tika hai" me sirf wo modules jinke bina ye module poora nahi chalta (sync call, zaroori event ya package). `02-platform`, `08-identity` aur `09-gateway` pe har business service aur har app tiki hai, isliye wo table me baar-baar nahi likhe.

| Module                 | Kya                                                                                                                                                                                                                                           | Release        | Tika hai                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------- |
| `01-foundation`        | Naya root setup: workspace, tools (D-001), `configs/`, CI ke jobs, dev ke containers; purane code ka hatna (D-073) ([TASK.md](tasks/01-foundation/TASK.md))                                                                                   | R1             | Kuch nahi                              |
| `02-platform`          | Shared aur backend ke saajhe packages (ARCHITECTURE §12): contracts, validators, money, clock, server-kit, config, mongo, postgres, events, media ke ports, logger ([TASK.md](tasks/02-platform/TASK.md))                                     | R1             | 01, 28                                 |
| `03-frontend-kit`      | Frontend ke saajhe packages (ARCHITECTURE §12, [DESIGN.md](DESIGN.md)): styles, icons, components, api-client, authz, app-shell, auth-ui, forms, data-table, maps, pwa ([TASK.md](tasks/03-frontend-kit/TASK.md))                             | R1             | 01, 02, 28                             |
| `04-logs`              | Request logs ke chunks (D-285) ([TASK.md](tasks/04-logs/TASK.md))                                                                                                                                                                             | R1             | 02                                     |
| `05-audit`             | Audit entries hash chain ke saath, aur security events (D-194) ([TASK.md](tasks/05-audit/TASK.md))                                                                                                                                            | R1             | 02                                     |
| `06-media`             | Har file ka record, upload ke signed URL, private files aur unka lock (D-284, D-439) ([TASK.md](tasks/06-media/TASK.md))                                                                                                                      | R1             | 02                                     |
| `07-notify`            | Templates, in-app inbox, browser push, emails ki line aur chhat (D-140, D-142) ([TASK.md](tasks/07-notify/TASK.md))                                                                                                                           | R1             | 02                                     |
| `08-identity`          | Accounts, sign-in ke teen raaste, authenticator, sessions, roles aur grants, allowlist, consents aur 18+ ([TASK.md](tasks/08-identity/TASK.md))                                                                                               | R1             | 02, 07                                 |
| `09-gateway`           | Session ki jaanch, rate limit, CSRF, route manifest, `/wake` ([TASK.md](tasks/09-gateway/TASK.md))                                                                                                                                            | R1             | 02, 04, 08                             |
| `10-logistics`         | Location master aur areas, hub aur warehouse, trips, partners, delivery, return pickup, waitlist ([TASK.md](tasks/10-logistics/TASK.md))                                                                                                      | R1             | 06; delivery pe UPI ke liye 12         |
| `11-catalog`           | Sellers aur KYC, brands, products aur variants, listing ki jaanch, daam, ingredients, search, reviews ([TASK.md](tasks/11-catalog/TASK.md))                                                                                                   | R1             | 06                                     |
| `12-payments`          | Razorpay test mode, webhook, refunds, delivery pe UPI QR, settlement reports ([TASK.md](tasks/12-payments/TASK.md))                                                                                                                           | R1             | Koi aur nahi                           |
| `13-commerce`          | Cart, wishlist, address, order, stock aur reservation, maal aana, pick aur pack, cancel, return ([TASK.md](tasks/13-commerce/TASK.md))                                                                                                        | R1             | 10, 11, 12, 14                         |
| `14-finance`           | Journal, invoice aur credit note, seller ka hisaab, TCS aur TDS, payout, milaan (PostgreSQL) ([TASK.md](tasks/14-finance/TASK.md))                                                                                                            | R1             | 12                                     |
| `15-support`           | Return aur daawe ke faisle, appeals, staff ki rakam ki seema, fraud ke signals; R2 me tickets aur SLA ([TASK.md](tasks/15-support/TASK.md))                                                                                                   | R1 (patla), R2 | 06, 13                                 |
| `16-app-customer`      | Customers: browse, search, product page, cart, checkout, orders, return, review, account ([TASK.md](tasks/16-app-customer/TASK.md))                                                                                                           | R1             | 03, 07, 10, 11, 12, 13                 |
| `17-app-seller`        | Seller ki team: onboarding, products, maal bhejna, orders, reviews, reports ([TASK.md](tasks/17-app-seller/TASK.md))                                                                                                                          | R1             | 03, 11, 13, 14                         |
| `18-app-admin`         | Marketplace ki teams aur sub-district ke Admins: seller aur listing ki jaanch, review ki moderation ([TASK.md](tasks/18-app-admin/TASK.md))                                                                                                   | R1             | 03, 11                                 |
| `19-app-super-admin`   | State Admins aur district ke Super Admins: area ke switches aur staff ([TASK.md](tasks/19-app-super-admin/TASK.md))                                                                                                                           | R1             | 03, 10                                 |
| `20-app-master`        | Owner aur governance: roles, settings, kill switches, aankde ([TASK.md](tasks/20-app-master/TASK.md))                                                                                                                                         | R1             | 03, 05, aur saari services ki settings |
| `21-app-support-desk`  | Support Agent aur Support Lead: return, daawe aur appeal ke faisle ([TASK.md](tasks/21-app-support-desk/TASK.md))                                                                                                                             | R1 (patla), R2 | 03, 15                                 |
| `22-app-finance`       | Finance ki team: seller ka hisaab, payout ko "paid" mark karna, reports ([TASK.md](tasks/22-app-finance/TASK.md))                                                                                                                             | R1             | 03, 14                                 |
| `23-app-logistics-ops` | Warehouse aur hub ki team: receiving, pick aur pack, trips, assign, returns ki jaanch ([TASK.md](tasks/23-app-logistics-ops/TASK.md))                                                                                                         | R1             | 03, 10, 13                             |
| `24-app-delivery`      | Delivery partners ka PWA (offline): delivery, saboot, UPI QR, return pickup ([TASK.md](tasks/24-app-delivery/TASK.md))                                                                                                                        | R1             | 03, 10, 12                             |
| `25-app-growth-studio` | Marketing aur growth ki team ([TASK.md](tasks/25-app-growth-studio/TASK.md), draft)                                                                                                                                                           | R2             | 03, aur R2 ke features                 |
| `26-app-creator`       | Creators aur affiliates ([TASK.md](tasks/26-app-creator/TASK.md), draft)                                                                                                                                                                      | R2             | 03, aur R2 ke features                 |
| `27-operations`        | Deploy (Render, Vercel), backup aur restore (D-013), jagane ke pings aur nigrani (D-028), R1 ka release gate ([RULES.md](RULES.md) §2.1) ([TASK.md](tasks/27-operations/TASK.md))                                                             | R1             | 01, 09                                 |
| `28-packages`          | Packages ka flow (D-445): CLI ke `create`, `build`, `verify`, `status`, `republish`, `publish` aur `update-deps`, aur GitHub ka publish workflow; saare packages public npm pe, tests me fake registry ([TASK.md](tasks/28-packages/TASK.md)) | R1             | 01                                     |

- `NN` sirf pehchaan hai, banane ka order nahi; banane ka kram §5 me.
- R2 ke features (promotions, points, try-on, tickets ...) apne maalik service ke module me R2 ke subtasks banenge. Jinka maalik service abhi tay nahi (misaal promotions aur points), unka module R2 ki planning me.

## 4. Progress (D-433)

§2 ke hisaab se. "—" ka matlab: us module ki `TASK.md` abhi nahi bani, to points tay nahi.

- **R1:** 14 / 549 points = 3%. R1 ke saare 26 modules ke points tay hain; R2 ke `25` aur `26` ki `TASK.md` draft hai (D-454); baaki modules ke R2 subtasks R2 ki planning me judenge.
- **Ecosystem:** 14 / 587 points = 2%; R2 me abhi sirf `25` (23) aur `26` (15) ke draft points.

| Module                 | Release        | Kul points | Poore | %   |
| ---------------------- | -------------- | ---------- | ----- | --- |
| `01-foundation`        | R1             | 16         | 14    | 88% |
| `02-platform`          | R1             | 31         | 0     | 0%  |
| `03-frontend-kit`      | R1             | 41         | 0     | 0%  |
| `04-logs`              | R1             | 9          | 0     | 0%  |
| `05-audit`             | R1             | 9          | 0     | 0%  |
| `06-media`             | R1             | 14         | 0     | 0%  |
| `07-notify`            | R1             | 15         | 0     | 0%  |
| `08-identity`          | R1             | 32         | 0     | 0%  |
| `09-gateway`           | R1             | 13         | 0     | 0%  |
| `10-logistics`         | R1             | 29         | 0     | 0%  |
| `11-catalog`           | R1             | 27         | 0     | 0%  |
| `12-payments`          | R1             | 17         | 0     | 0%  |
| `13-commerce`          | R1             | 30         | 0     | 0%  |
| `14-finance`           | R1             | 33         | 0     | 0%  |
| `15-support`           | R1 (patla), R2 | 13         | 0     | 0%  |
| `16-app-customer`      | R1             | 35         | 0     | 0%  |
| `17-app-seller`        | R1             | 25         | 0     | 0%  |
| `18-app-admin`         | R1             | 22         | 0     | 0%  |
| `19-app-super-admin`   | R1             | 11         | 0     | 0%  |
| `20-app-master`        | R1             | 26         | 0     | 0%  |
| `21-app-support-desk`  | R1 (patla), R2 | 15         | 0     | 0%  |
| `22-app-finance`       | R1             | 12         | 0     | 0%  |
| `23-app-logistics-ops` | R1             | 21         | 0     | 0%  |
| `24-app-delivery`      | R1             | 15         | 0     | 0%  |
| `25-app-growth-studio` | R2             | 23         | 0     | 0%  |
| `26-app-creator`       | R2             | 15         | 0     | 0%  |
| `27-operations`        | R1             | 20         | 0     | 0%  |
| `28-packages`          | R1             | 18         | 0     | 0%  |

## 5. Banane ka kram (D-446)

Modules charan wise bante hain. Har charan me us hisse ke liye zaroori service aur app ke subtasks, aur charan ke ant me wo flow shuru se aakhir tak chalta hai. Charan 2 se 13 §1 ke R1 ke hisson ke kram se.

| Charan | Kya                                                                                          | Modules                                                                                          | Ant me kya chalta hai                                 |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 0      | Neev: root setup, packages ka flow, saajhe packages                                          | `01`, `28`, `02`, `03`                                                                           | Packages bante, jaanche jaate aur npm pe chhapte hain |
| 1      | Chalta dhaancha: logs, audit, media, notify, identity, gateway; pehla deploy (`/wake` samet) | `04` se `09`, `27` (deploy), `20` (sirf dhaancha aur sign-in)                                    | Owner live pe Master app me sign-in kar sake          |
| 2      | Area (§1 hissa 1)                                                                            | `10`, `19`, `18` (dhaancha aur area ki screens, D-451), `20`, `16` (pincode ki jaanch)           | Pune ka area live; unserved pincode pe waitlist       |
| 3      | Staff aur roles (hissa 2)                                                                    | `08`, `20`, `18`, `21` (dhaancha)                                                                | Staff ka invite, roles aur audit                      |
| 4      | Sellers (hissa 3)                                                                            | `11`, `06`, `17`, `18`                                                                           | Dono sellers onboard aur approved                     |
| 5      | Catalog (hissa 4)                                                                            | `11`, `17`, `18`, `16`                                                                           | Product live aur customer ko dikhe; search aur filter |
| 6      | Maal warehouse me (hissa 5)                                                                  | `13`, `23`, `17`                                                                                 | Maal receive, batch aur expiry, stock dikhe           |
| 7      | Customer (hissa 6)                                                                           | `08`, `13`, `16`                                                                                 | 18+ sign-up, cart, wishlist, address                  |
| 8      | Checkout aur payment (hissa 7)                                                               | `13`, `12`, `14`, `16`                                                                           | Order aur payment (test mode), invoice                |
| 9      | Fulfilment (hissa 8)                                                                         | `13`, `10`, `23`, `24`, `07`                                                                     | Pick, pack, hub, delivery aur saboot                  |
| 10     | Return aur refund (hissa 9)                                                                  | `13`, `15`, `10`, `12`, `14`, `21`, `22` (dhaancha aur fail refund ka raasta, D-453), `16`, `24` | Return ki maang se refund tak                         |
| 11     | Review (hissa 10)                                                                            | `11`, `16`, `18`, `17`                                                                           | Verified review aur moderation                        |
| 12     | Paisa (hissa 11)                                                                             | `14`, `22`, `17`                                                                                 | Seller ka hisaab, payout "paid", reports              |
| 13     | Chalana aur release (hissa 12)                                                               | `27`, `20`                                                                                       | Backup, nigrani, aankde aur R1 ka release gate        |
| R2     | Growth Studio, Creator aur R2 ke features                                                    | `25`, `26`, aur baaki modules ke R2 subtasks                                                     | R2 ki planning me                                     |

- **Charan 0 ke andar:** pehle `01`, phir `28`, phir `02` aur `03` (dependencies, §3).
- Har module ki `TASK.md` us charan se pehle likhi jaati hai jisme wo pehli baar aata hai, aur har subtask ke saath uska charan likha hota hai.
- Kisi charan me dependency ki wajah se kram badalna pade, to owner ki haan se.

## Change log

| Version            | Date                     | Badlav                                                                                                                                                                                          |
| ------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.5.13  | 2026-11-17 se 2026-11-22 | R1 ka scope (§1), progress % ka hisaab (§2) modules ki list (§3, D-444, D-445) progress ki table (§4) aur banane ka kram (§5, D-446, D-451, D-453); har badlav ka poora itihaas git me (D-442). |
| v1.5.14 se v1.5.15 | 2026-11-23               | `01-foundation` ke 7 subtasks poore (14 / 14), phir ST-8 juda (D-462): 14 / 16, R1 3%, ecosystem 2% (§4).                                                                                       |
