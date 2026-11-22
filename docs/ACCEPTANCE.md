# ACCEPTANCE: Beautinique

> **Status:** v1.0.5 (2026-11-22). R1 ke har service aur app ke acceptance criteria (D-388 se D-395). Cheezein ek-ek karke, owner ki haan ke baad judti hain.

## Is file me kya aayega

- R1 ki har service (§1) aur har app (§2) ke acceptance criteria: har criterion ek line me **Given / When / Then**, saath me uska faisla, SR, CL, DS ya flow.
- Id `AC-<MODULE>-<n>`; ek baar diya id kabhi badalta nahi aur dobara use nahi hota.
- Har criterion ka kam se kam ek automated test, jiske naam me criterion ka id ho ([RULES.md](RULES.md) RT-24 aur DD-1).
- Criteria yahin rehte hain; planning stage me har module ki `TASK.md` apne hisse ki link deti hai, copy nahi karti (D-388).
- Jahan file ka naam nahi likha, wahan § [ARCHITECTURE.md](ARCHITECTURE.md) ka hai. "Misaal" wale numbers settings se badal sakte hain.
- R1 ke apps: Customer, Seller, Admin, Super Admin, Master, Support Desk, Finance, Logistics Ops aur Delivery. Growth Studio aur Creator R2 me ([PROJECT_PLAN.md](PROJECT_PLAN.md) §1); R2 ka sirf chhota khaka (§4), poore criteria R2 ki planning me.
- Criteria QA Architect agent ke prastaav se aaye. Unme diye saare ids naye docs me maujood hain (main session ne milaaye); har criterion ke matlab ka milaan us module ki planning me.

## 1. Services (R1)

### 1.1 PLATFORM (saajhe packages)

1. **AC-PLATFORM-1** (D-311; ARCHITECTURE §10.2 niyam 1): **Given** commit pe transient error (failpoint se), **When** kaam chale, **Then** poora kaam ek baar dobara chale aur asar sirf ek; commit ka nateeja anjaana ho to sirf commit dobara; kul misaal 10 second ke baad 503.
2. **AC-PLATFORM-2** (D-292; §3 niyam 1): **Given** producer ka badlav aur uska event, **When** transaction rollback ho, **Then** na badlav bache na outbox me event; HTTP jawab sirf commit ke baad.
3. **AC-PLATFORM-3** (D-292; §3 niyam 4): **Given** wahi event ek subscriber ko 3 baar mile, **When** handler chale, **Then** asar ek hi baar aur `processed_events` me ek hi row.
4. **AC-PLATFORM-4** (§3 niyam 5; §10.2 niyam 10): **Given** ek order ke do events aur pehle ka handler fail, **When** dispatcher chale, **Then** doosra event us subscriber ko tab tak nahi jaata jab tak pehla na ho jaaye, aur baaki orders ke events chalte rahein.
5. **AC-PLATFORM-5** (§3 niyam 6; §10.2 niyam 11): **Given** handler ki apni galti, **When** misaal 8 koshish poori hon, **Then** dead letter aur ops alert; **Given** subscriber ka database band (jaise finance ruka), **Then** koshish ki ginti nahi badhti.
6. **AC-PLATFORM-6** (D-293, D-322; §4 niyam 1, 4, 6): **Given** do instances ek saath (deploy), **When** ticker chale, **Then** har due timer ek hi baar; **Given** process 11 ghante band, **When** boot ho, **Then** saare due timers pakde jaayein aur roz ke kaam har chhoota din kram se banayein.
7. **AC-PLATFORM-7** (R-010; §4 niyam 2): **Given** Valkey khaali ho gaya, **When** ticker chale, **Then** "pending par queue me nahi" wale kaam dobara queue me aayein aur koi kaam do baar na chale (job id = record id).
8. **AC-PLATFORM-8** (SR-045; §5 niyam 10): **Given** idempotency key wala route, **When** wahi key wahi body ke saath aaye, **Then** pehla jawab; alag body pe 422; pehla abhi chal raha ho to 409; 5xx yaad nahi rakha jaata; record misaal 48 ghante.
9. **AC-PLATFORM-9** (SR-047; ARCHITECTURE §1.8, §10.1 niyam 5): **Given** random daam, rates aur quantity (property test), **When** tax nikle, **Then** taxable + CGST + SGST = daam bilkul, ₹49 pe 5% = ₹46.66 + ₹1.17 + ₹1.17, chhoot ka bantwara jod me barabar, aur kahin float nahi.
10. **AC-PLATFORM-10** (SR-063; §10.3 niyam 5): **Given** record A ka encrypted field, **When** use record B ya doosre field me copy karke kholein, **Then** khulna fail; database me plaintext ka pattern kahin nahi.
11. **AC-PLATFORM-11** (R-040, D-250, D-321; §10.3 niyam 1, 3, 4): **Given** nayi collection bina retention class ya delete handler ke, **When** CI chale, **Then** fail; **Given** personal data ka erase, **Then** field hatna, rok ki copy aur event ek transaction me, aur `tech` class ke records rok me nahi.
12. **AC-PLATFORM-12** (D-329, D-441; OPERATIONS §1 niyam 9, §4 niyam 4, 5): **Given** config me anjaan ya kam key, **When** boot ho, **Then** process key ke naam ke saath (value ke bina) ruke; payments test mode me hon aur key live wali ho to process na uthe; har config key `.env.example` me aur `.env.example` me koi anjaan key nahi.

### 1.2 GATEWAY

1. **AC-GATEWAY-1** (SR-002): **Given** `/api/*` request, **When** secret header na ho ya galat ho, **Then** 403; webhook bina signature 401; `/health` aur `/wake` bina secret chalein; secret badalte waqt purani aur nayi dono values maani jaayein.
2. **AC-GATEWAY-2** (SR-003): **Given** jhootha `X-Forwarded-For` bina secret header ke, **When** request aaye, **Then** connection ka IP hi gina jaaye; IPv6 ek /64 ke andar ek gina jaaye.
3. **AC-GATEWAY-3** (SR-008): **Given** har seema, **When** seema se ek upar request ho, **Then** 429 aur `Retry-After`; **Given** Valkey band, **Then** sign-in, codes, payment shuru, review, report aur daawa 503, aur product page 200.
4. **AC-GATEWAY-4** (SR-029): **Given** session band kiya gaya aur phir Valkey khaali, **When** agli request aaye, **Then** 401 (sach database se); role khatam hone ke baad agli call 403.
5. **AC-GATEWAY-5** (SR-030): **Given** badalne wala route, **When** doosre origin se ya custom header ke bina POST aaye, **Then** 403; social sign-in ke start aur callback sirf GET aur bina doosre asar ke.
6. **AC-GATEWAY-6** (SR-032, SR-035): **Given** contract ke bahar ka path, **When** bulaya jaaye, **Then** pahunch se bahar; "public" na ho to bina session 401; Customer app ke token se staff ka route 403.
7. **AC-GATEWAY-7** (SR-007): **Given** JSON body misaal 100 KB se bada, **When** aaye, **Then** 413; request misaal 30 second pe kat-ti hai; `/health` ka jawab sirf "ok", na version na database.
8. **AC-GATEWAY-8** (D-294; §5 niyam 5): **Given** `X-App-Version` app ke kam se kam version se purana, **When** request aaye, **Then** 426; Delivery ka sync route pichhla version bhi maane.
9. **AC-GATEWAY-9** (SR-077; §5 niyam 8, §8 niyam 1): **Given** koi bhi error, **When** jawab jaaye, **Then** ek hi roop `{"error": {"code", "message", "details", "requestId"}}`, 500 pe stack nahi, aur wahi request id logs, facade calls, events (`correlationId`) aur audit me.
10. **AC-GATEWAY-10** (SR-089): **Given** `/wake`, **When** kisi app ke origin se `GET` aaye, **Then** 204 bina body aur cookie, database tak call nahi; anjaan origin pe CORS header nahi; har app ki CSP me Render ka sirf `/wake` ka exact URL.

### 1.3 IDENTITY

1. **AC-IDENTITY-1** (D-133, SR-018): **Given** allowlist ke bahar ka email, **When** koi bhi raasta try ho (password sign-up aur sign-in, social ka pehla sign-in, email code, invite accept, seller aur partner sign-up, waitlist), **Then** account nahi aur "demo store" ka sandesh; allowlist se email hate to uske saare sessions band aur agli call 401.
2. **AC-IDENTITY-2** (SR-019): **Given** ek registered aur ek anjaan email, **When** sign-in, sign-up, reset ya code maangein, **Then** jawab ka body ek jaisa aur kam se kam tay samay (misaal 400 ms) ke baad; anjaan email pe koi email nahi.
3. **AC-IDENTITY-3** (SR-015; §10.7 niyam 2): **Given** customer ka email code, **When** 6th galat koshish, 11 minute baad, ya doosre browser se daala jaaye, **Then** mana; ek code ek hi baar; do sahi submit ek saath pe sirf ek session.
4. **AC-IDENTITY-4** (D-182, SR-014): **Given** ek IP se 10 galat koshish, **When** agli koshish, **Then** us IP ki 1 ghante rok, par doosre IP se sahi password chale; sab IPs se 50 galat pe account 15 minute ruke; rok me bhi password reset chale; owner ko alert.
5. **AC-IDENTITY-5** (SR-013): **Given** naya password, **When** 11 akshar, 129 akshar ya leak hua ho, **Then** mana; 12 aur 128 chalein; leak ki API band ho to password maana jaaye, account pe nishaan, aur agle sign-in pe dobara jaanch.
6. **AC-IDENTITY-6** (SR-028, D-180, D-181, D-183): **Given** refresh token badal chuka, **When** purana token doosre device se aaye, **Then** poori family band aur security email; usi device se misaal 60 second ke andar aaye to chori nahi maana jaata; session ki umar aur bina kaam ka band hona har app parivaar ke niyam se (ghadi ke saath test).
7. **AC-IDENTITY-7** (SR-031, D-186): **Given** `alg:none`, HS256 ka khel, doosre app ka `aud` ya expired token, **When** kisi app pe aaye, **Then** 401; signing keys na milein to 503, 401 nahi.
8. **AC-IDENTITY-8** (D-021, SR-017): **Given** social sign-in, **When** `state` badla ho, PKCE na ho, ya provider ka email verified na ho, **Then** sign-in ya maujooda account se jod nahi; band account pe social sign-in bhi band; aakhri sign-in tareeka hatana mana.
9. **AC-IDENTITY-9** (D-199, D-185, SR-011, SR-026): **Given** staff app, **When** bina authenticator code ya wahi code dobara se sign-in ho, **Then** mana; D-185 ki list ka kaam bina taaza code ke 403, aur misaal 5 minute ki khidki ke baad naya code.
10. **AC-IDENTITY-10** (SR-022, SR-025, D-200): **Given** invite, **When** dobara, misaal 72 ghante ke baad, ya doosre email se use ho, **Then** mana; recovery code ek hi baar; authenticator reset pe saare sessions band, security email aur owner ko alert; D-200 ke bahar ka role reset kare to 403.
11. **AC-IDENTITY-11** (D-038, D-255, CL-089, CL-101, CL-102): **Given** sign-up, **When** account bane, **Then** har consent ka record (notice ka version, samay, raasta) sirf jodne wala, marketing opt-in alag aur khaali shuru, aur 18+ ki ghoshna ka record.
12. **AC-IDENTITY-12** (D-151, D-304, SR-016, SR-066): **Given** account delete, **When** dobara pehchaan ke baad maanga jaaye, **Then** misaal 7 din me wapsi ho sake, aur 7 din baad `identity.account.erased` har service ke handler (ARCHITECTURE §10.3 ki table) tak pahunche; wahi email doosre app parivaar me alag account ho sake.
13. **AC-IDENTITY-13** (SR-092, D-017, D-133, D-405): **Given** owner ke base email ke 10 `+` aliases, **When** sign-up ke codes maange jaayein, **Then** mailbox key ki seema pe rukein; tester ki `exact` entry ke email ka alias "demo store" paaye; bade akshar ya domain ke peeche jude text wala email allowlist se bahar.

### 1.4 NOTIFY

1. **AC-NOTIFY-1** (D-126, D-289, D-302): **Given** ek seedha prepaid order jo delivered ho aur phir return ke baad refund ho, **When** poora safar chale, **Then** customer ko emails sirf confirmation (delivery code ke saath, paise ki line), invoice (sirf saar, PDF aur link nahi) aur refund; baaki halat in-app aur push.
2. **AC-NOTIFY-2** (D-131): **Given** customer ka push band, **When** delivery fail ho ya pick pe kami ka sawal aaye, **Then** email bhi jaaye.
3. **AC-NOTIFY-3** (D-142; §10.7 niyam 3): **Given** "baaki" line ki din ki chhat bhar chuki, **When** OTP maanga jaaye, **Then** OTP jaaye (misaal 60 pakke); chhat paar wale emails agle din ki line me; 80% pe chetavni; ek saath bheje emails pe counter chhat se upar na jaaye.
4. **AC-NOTIFY-4** (SR-015; §2.3, §10.7 niyam 3): **Given** identity se code ka email, **When** bheja jaaye, **Then** code notify ke database, outbox aur logs me kahin nahi.
5. **AC-NOTIFY-5** (SR-012, SR-073): **Given** har template, **When** bane, **Then** links sirf apne app ke host pe, staff ke emails me koi link nahi, naam me `<script>` escape ho, aur CRLF se header na jude.
6. **AC-NOTIFY-6** (D-195, SR-072, SR-074): **Given** push, **When** bheja jaaye, **Then** payload me sirf order number aur halat; sign-out pe us browser ki subscription hate; 404 ya 410 pe subscription delete; anjaan host wali subscription save nahi.
7. **AC-NOTIFY-7** (D-140): **Given** seller aur staff ki kaam rokne wali khabrein, **When** din chale, **Then** din ka ek saar (misaal 09:00 IST ke baad pehli jaag pe), aur account aur paise ki emails turant.
8. **AC-NOTIFY-8** (§5 niyam 12; §10.7 niyam 3): **Given** email provider 429 ya 5xx de, **When** job chale, **Then** dobara koshish sirf queue se (request ke andar nahi), aur job id = record id ki wajah se ek email ke do record nahi bante.

### 1.5 PAYMENTS

1. **AC-PAYMENTS-1** (SR-048): **Given** checkout, **When** payment shuru ho, **Then** gateway ka order server banaye exact rakam aur currency ke saath; sirf browser ka "success" aane pe order unpaid rahe.
2. **AC-PAYMENTS-2** (SR-049; §10.7 niyam 4): **Given** webhook, **When** body badli ho, **Then** 401; **When** wahi event id 3 baar aaye, **Then** ek hi asar (event id `_id` pe, asar ke transaction me).
3. **AC-PAYMENTS-3** (SR-049; §10.7 niyam 4): **Given** events ulte kram me (jaise "failed" "captured" ke baad), **When** sab pahunchein, **Then** aakhri halat sahi aur halat sirf aage badhe.
4. **AC-PAYMENTS-4** (D-118, D-256, CL-109; §10.5 niyam 7): **Given** reservation khatam hone ke baad payment captured, **When** usi MRP aur kam se kam utni expiry ka stock ho, **Then** order pakka; warna theek ek refund (`late:<paymentId>`), webhook dobara aaye to bhi; "paisa kata, order nahi bana" ki screen aur email.
5. **AC-PAYMENTS-5** (SR-048): **Given** captured rakam order se kam ya currency alag, **When** webhook aaye, **Then** payment order se na jude aur alert bane.
6. **AC-PAYMENTS-6** (SR-047, D-111; §10.7 niyam 4): **Given** ek order pe cancel, return aur appeal ke refund ek saath, **When** sab chalein, **Then** refunds ka jod captured se kabhi zyada nahi, aur ek refund request ka ek hi refund.
7. **AC-PAYMENTS-7** (D-111, D-188): **Given** refund fail (jaise khaata band), **When** nateeja aaye, **Then** customer ko khabar aur staff ka raasta sirf Support Lead aur Finance ki manzoori se.
8. **AC-PAYMENTS-8** (SR-050, D-109, D-418): **Given** delivery pe UPI, **When** QR maanga jaaye, **Then** QR server se, us parcel ki exact rakam ka, ek parcel pe ek hi khula QR; "paid" sirf webhook se, partner ke liye "paid" ka koi API nahi; test mode me QR me Payment page ka link, jiska token doosre parcel pe ya samay ke baad nahi chalta.
9. **AC-PAYMENTS-9** (SR-008; §5 niyam 12): **Given** provider misaal 10 second tak jawab na de, **When** payment shuru ho, **Then** request jaldi saaf error ke saath lautaye, request ke andar retry nahi; Valkey band ho to payment shuru 503.
10. **AC-PAYMENTS-10** (D-093, D-269; ARCHITECTURE §1.11 M1): **Given** gateway ki settlement report, **When** roz ka milaan chale, **Then** har payment id ki rakam aur halat ledger se mile, aur farak suspense me jaaye aur alert bane.

### 1.6 CATALOG

1. **AC-CATALOG-1** (D-075; §10.7 niyam 5): **Given** ek brand pe ek seller, **When** doosra seller wahi brand ya wahi barcode daale (ek saath bhi), **Then** sirf ek safal.
2. **AC-CATALOG-2** (D-098, SR-041): **Given** jaanch me listing ka version, **When** beech me naya badlav aaye, **Then** purani manzoori naya version live nahi karti; live version badla nahi ja sakta; jokhim ke bina wala field turant live aur spot check ki queue me.
3. **AC-CATALOG-3** (D-076, D-085): **Given** category ki variant seema, **When** teesra variant axis, ya bina naam, swatch photo aur hex ka shade aaye, **Then** mana.
4. **AC-CATALOG-4** (D-061, D-087, D-120, D-223, SR-042, CL-025, CL-031, CL-074): **Given** daam ka badlav, **When** daam 0, batch ke MRP se upar, ya bada badlav bina dobara confirm ho, **Then** mana; har badlav itihaas ke saath ek transaction me; har discount ke saath pichhle 30 din ka sabse kam daam aur "% off" neeche round.
5. **AC-CATALOG-5** (D-065, SR-042; §10.7 niyam 7): **Given** Pro daam, **When** bina sign-in, normal customer ya search ka jawab bane, **Then** Pro daam usme kabhi nahi.
6. **AC-CATALOG-6** (D-086, D-127, D-128, D-236, CL-026, CL-029, CL-030, CL-036): **Given** listing submit, **When** licence ka type, imported ke fields, pack ki jaankari, allowed HSN, ya 10 g ya 10 ml tak ke pack pe chhapa MRP na ho, **Then** submit nahi; HSN ka rate badle to alert.
7. **AC-CATALOG-7** (D-099, D-128, D-132, CL-043, CL-048): **Given** ingredients, **When** blocklist ka ingredient ho, **Then** submit hi nahi; INCI list staff ki jaanch ke baad; blocklist sirf senior catalog role badle, wajah ke saath, audit me.
8. **AC-CATALOG-8** (D-238, D-084, SR-038, CL-060): **Given** seller ka block adhoora, **When** listing live karne ki koshish ho, **Then** mana; jisne reject kiya wo appeal tay kare to 403.
9. **AC-CATALOG-9** (D-224): **Given** test wala claim (SPF, PA, dermatologically tested ...), **When** bina saboot ki file ke chuna jaaye, **Then** mana; claims sirf tay list se.
10. **AC-CATALOG-10** (D-139, D-153, D-154, CL-066): **Given** search ka kram, **When** nateeje aayein, **Then** text, phir rating (misaal 5 reviews se), phir 30 din ki bikri aur stock; stock khatam sabse neeche; kisi seller ke boost ka field hi nahi; "Bestseller" aur "kam stock" sirf niyam se; yahi tests dono search adapters pe (§6 niyam 7; Atlas Search wala hissa laptop aur CI pe tabhi jab uska local image chale, jaanchna baaki).
11. **AC-CATALOG-11** (D-135, D-156, D-158, SR-059): **Given** review, **When** cancel ya RTO line, ₹0 line, wahi product doosri baar, ya brand ke seller app ka user likhe, **Then** naya review nahi (dobara kharid pe purana edit); lauta item chale; din me misaal 5; rating ka jod review ke transaction me aur raat ki jaanch.
12. **AC-CATALOG-12** (D-136, D-146, D-251, D-263, SR-060, CL-105): **Given** review aur report, **When** star, text aur photo aayein, **Then** star turant, text apne aap ki jaanch, photo queue me; nagnata wali report pe review turant chhupe aur misaal 2 ghante ki ghadi; receipt 24 ghante, baaki 36 ghante, hal 7 din; chhupana sirf tay list se; appeal doosra moderator tay kare.

### 1.7 COMMERCE

1. **AC-COMMERCE-1** (SR-045, D-118): **Given** variant ki aakhri unit, **When** 50 customers ek saath place order karein, **Then** sirf ek order, baaki 409 (`COMMERCE_STOCK_UNAVAILABLE` jaisa code), aur `available` kabhi 0 se neeche nahi.
2. **AC-COMMERCE-2** (D-314; §10.5 niyam 3): **Given** order ki koi line fail (serviceability, seema ya stock), **When** place order ho, **Then** poora ulta: na order, na reservation, na outbox event.
3. **AC-COMMERCE-3** (SR-044): **Given** client daam, fee ya tax bheje, **When** order bane, **Then** wo nazarandaaz; server ka total dikhe total se alag ho to order nahi aur naya total.
4. **AC-COMMERCE-4** (D-064, D-067, D-124, CL-032; §10.5 niyam 4, 5): **Given** customer ko jo MRP aur expiry dikhi, **When** order bane, **Then** usi batch se reservation (FEFO: bikne layak me sabse pehle expire hone wala); beech me agla batch badla to order nahi aur naya total; daam se kam MRP wala batch ruka.
5. **AC-COMMERCE-5** (D-118; §10.5 niyam 6): **Given** prepaid order bina payment ke, **When** misaal 15 minute poore hon, **Then** reservation wapas aur order `paymentExpired`, dono ek transaction me.
6. **AC-COMMERCE-6** (D-091, D-109, D-203, D-204, SR-046): **Given** seemaayein, **When** ek variant ki misaal 10 se zyada quantity, pehle order pe ₹1,500 se upar ya kisi bhi order pe ₹3,000 se upar delivery pe UPI, ya teesra khula UPI order ho, **Then** mana ya tareeka na dikhe; `+` alias wale accounts address, device ya payment ke jod se ek gine jaayein; ek saath requests me bhi counter seema paar na kare.
7. **AC-COMMERCE-7** (D-016, D-300): **Given** unserved pincode, **When** order ho, **Then** mana; area band hone pe pehle checkout pe rok ka event, aur parcel banate waqt band area ke order cancel aur refund.
8. **AC-COMMERCE-8** (D-319; §10.5 niyam 9): **Given** pack ke teen kadam, **When** finance ki call ke baad aur "packed" se pehle process gire, **Then** dobara chalne pe wahi invoice (`packSeq` ki key) aur koi doosra nahi; dobara pack pe `commerce.parcel.packVoided` aur naya `packSeq`; finance band ho to pack ruka, order khota nahi.
9. **AC-COMMERCE-9** (D-110, CL-078): **Given** pack se pehle ka order, **When** poora, ek item ya quantity cancel ho, **Then** koi fee nahi, baad me delivery fee nahi, prepaid refund turant; pack ke baad cancel 409; pack aur cancel ek saath pe sirf ek jeete.
10. **AC-COMMERCE-10** (D-090; §10.5 niyam 8): **Given** pick pe maal toota ya kam, **When** barabar batch (wahi variant, wahi MRP, expiry kam se kam utni) ho, **Then** badal do; warna customer se sawal, aur timer tak jawab na aaye to line cancel aur refund.
11. **AC-COMMERCE-11** (D-079, D-106, D-112, D-114, D-221; §10.5 niyam 12): **Given** return, **When** muddat wajah ke hisaab se (misaal 30 din galti, 7 din man badla) aur saboot (photos) poore hon, **Then** maanga ja sake; man badla sirf seal wale maal pe; jaanch ke baad band aur bikne layak maal usi batch me aur storage ki ghadi nahi badalti; man badla pe refund se return fee (misaal ₹49), hamari ya brand ki galti pe delivery fee bhi wapas.
12. **AC-COMMERCE-12** (D-096, D-082, D-083, D-097, D-066; §10.5 niyam 2, 11): **Given** receiving, **When** ASN ke bina, expiry seema se kam, ya sirf PAO wala maal aaye, **Then** mana ya wapas, farak photo ke saath seller ko; "accept" scan se stock aur storage ki ghadi; stock movements sirf jodte, aur raat ki jaanch `reserved` = khule reservations aur `onHand` = bins + raaste me, farak pe alert.

### 1.8 LOGISTICS

1. **AC-LOGISTICS-1** (D-016): **Given** pincode, **When** hub dhoondha jaaye, **Then** theek ek hub; do states wale pincode pe customer state chune aur wo state live ho tabhi order; import pe ek pincode ek record.
2. **AC-LOGISTICS-2** (D-015, D-037): **Given** level ka switch, **When** live ki sharten adhoori hon, **Then** live nahi; naya sub-district ya district kholna sirf setting se, bina deploy, aur uske baad wahan ka order chale.
3. **AC-LOGISTICS-3** (SR-054; §10.7 niyam 8): **Given** delivery code, **When** parcel "out for delivery" na ho, doosra partner ho, ya 5 galat koshish ho chuki hon, **Then** mana; 6th koshish band jab tak Hub Manager na khole (audit me); partner ke app ko code kabhi nahi; do sahi submit ek saath pe ek hi delivered.
4. **AC-LOGISTICS-4** (D-301): **Given** offline sync me code wali delivery, **When** sync ho, **Then** wo kaam mana; offline line me sirf list, scans aur photo.
5. **AC-LOGISTICS-5** (SR-055, D-347, D-351): **Given** code ke bina photo wali delivery, **When** location address ke pin se misaal 300 m door ho, pin na ho, ya wahi photo hash dobara ho, **Then** nishaan; location na mile to "No location" ke saath, partner pe mahine me misaal 3 tak, phir band.
6. **AC-LOGISTICS-6** (D-294, SR-055; §5 niyam 6): **Given** Delivery ka sync batch (misaal 50 kaam), **When** wahi batch dobara aaye, **Then** koi kaam do baar nahi (client ka UUIDv7 key), har kaam ka alag nateeja, `deviceAt` aur `serverAt` dono save.
7. **AC-LOGISTICS-7** (D-108): **Given** delivery fail, **When** wajah aur usi pal location ke saath darj ho, **Then** do koshish (misaal), hub pe misaal 3 din, phir RTO; saaf mana pe seedha RTO; RTO ke hub scan pe prepaid refund ka event ek hi baar.
8. **AC-LOGISTICS-8** (SR-023, SR-035, SR-039): **Given** partner, **When** doosre partner ka parcel ya delivered parcel ki jaankari maange, **Then** 404 ya chhupi; hub staff doosre hub ki cheez pe 404; Hub Manager partner ka session band kare to agla sync 401.
9. **AC-LOGISTICS-9** (SR-056, D-191, D-254): **Given** delivery ka kaam, **When** partner chal raha ho, **Then** location sirf delivered, fail aur pickup ke pal pe; roz ka job photo aur location apne samay pe mitaye.
10. **AC-LOGISTICS-10** (SR-057, D-027): **Given** trip, **When** hub pe receive scan me ginti kam ho, **Then** apne aap nishaan aur audit; har scan me kaun, kis device se aur kab; manifest aur seal number.
11. **AC-LOGISTICS-11** (D-113): **Given** return pickup, **When** label ka batch order ke batch se na mile ya man badla me seal toota ho, **Then** pickup nahi, wajah ke saath khabar; pickup pe item ki photo.
12. **AC-LOGISTICS-12** (D-117, D-222, D-109): **Given** cut-off, Sunday aur chhuttiyan area setting me, **When** order ho, **Then** sahi vaade ki tareekh; vaada toote to "Delayed" aur khabar; door pe UPI fail ho to misaal 10 minute tak QR, phir "attempt fail".

### 1.9 FINANCE

1. **AC-FINANCE-1** (D-282, D-315; §1.1 niyam 1, §10.6 niyam 2): **Given** journal, **When** debit aur credit ka jod alag ho, sirf ek line ho, ya ek line me debit aur credit dono hon, **Then** commit fail.
2. **AC-FINANCE-2** (SR-053, CL-131; §1.1 niyam 3, 7, §10.6 niyam 4, 5): **Given** app ka database role, **When** books ki table pe UPDATE ya DELETE, ya band mahine me journal ho, **Then** mana; sudhaar sirf ulti entry aur nayi entry se, asli ke hawale ke saath.
3. **AC-FINANCE-3** (CL-003; §1.7, §10.6 niyam 6, 7): **Given** ek series pe 50 invoices ek saath, **When** jaari hon, **Then** numbers lagataar, koi duplicate nahi; rollback hua transaction number nahi khata; 1 April (IST) pe nayi series; `doc_no` 16 characters tak aur sirf A-Z, 0-9, `/`, `-`; cancel alag table me, number kabhi dobara nahi.
4. **AC-FINANCE-4** (§1.1 niyam 4, §10.6 niyam 3): **Given** wahi source (gateway event, invoice, payout) do baar, **When** post ho, **Then** ek hi journal.
5. **AC-FINANCE-5** (D-077, D-239, CL-019, CL-084; §1.9, §10.6 niyam 8): **Given** do sellers ka ek parcel, **When** pack ki call `(parcel, seller, packSeq)` dobara aaye, **Then** har seller ka ek hi invoice; seller ka naam sabse upar aur §1.9 ke saare fields; `packVoided` pe dispatch se pehle invoice cancel.
6. **AC-FINANCE-6** (CL-005; §1.8 niyam 5, §10.6 niyam 7): **Given** return, RTO ya pack ke baad ki kami, **When** credit note bane, **Then** asli invoice aur line ka hawala, quantity asli se zyada nahi, aur rakam asli line se (dobara hisaab nahi).
7. **AC-FINANCE-7** (CL-012, CL-129; §1.6): **Given** delivery fee aur return fee, **When** capture (prepaid), delivery (UPI) ya return ki manzoori ho, **Then** platform ka sahi document usi pal; fee wapas ho to platform ka credit note.
8. **AC-FINANCE-8** (D-275; §1.4): **Given** §1.4 ki misaal, **When** capture se sweep tak chale, **Then** entries bilkul wahi (capture ₹1,229.00, fees invoice ₹146.20, payout ₹1,027.80, sweep ₹152.20) aur settlement khaata us order pe zero.
9. **AC-FINANCE-9** (D-081, D-369, D-071): **Given** seller ki line, **When** man badle wali return muddat (misaal 7 din) poori aur koi return khula na ho, **Then** payable; hafte ke batch me udhaar aur fees katein, bharpai jude; misaal ₹100 se kam agle hafte; ek cycle me seller ka ek payout, sirf `due` lines.
10. **AC-FINANCE-10** (D-189, D-190, SR-052, SR-009): **Given** payout batch, **When** banane wala hi manzoor kare, **Then** mana (CHECK aur 403); naye bank khaate pe misaal 72 ghante payout nahi; payouts ka kill switch chalu ho to batch na chale; manzoori pe step-up.
11. **AC-FINANCE-11** (D-225, D-226, D-320, SR-088, CL-020): **Given** invoice, **When** rakam ₹50,000 se kam ho, **Then** sirf state, shehar aur pincode; ₹50,000 ya upar pe naam aur pata sirf `archive.tax_copies` me; account delete pe documents na badlein; seller copy ek-ek karke le, har download audit me.
12. **AC-FINANCE-12** (D-057, D-145, D-288, SR-053; §1.11): **Given** finance, **When** din chale, **Then** events ka batch misaal 15 minute pe sirf pending hone pe; `/health`, `/ready` aur `/wake` finance tak nahi; M1 me farak suspense me aur alert; M3 toote to payouts rukein; har PDF pe SPECIMEN.

### 1.10 SUPPORT

1. **AC-SUPPORT-1** (D-105): **Given** return ki wajah aur saboot poore, **When** maanga jaaye, **Then** apne aap manzoor; warna queue me.
2. **AC-SUPPORT-2** (D-188, SR-051; §10.7 niyam 10): **Given** Support Agent, **When** ek maamla misaal ₹2,000 se upar ya din ka jod ₹10,000 se upar jaaye (ek saath manzooriyan bhi), **Then** faisla Support Lead ke liye pending; counter kaam ke transaction me.
3. **AC-SUPPORT-3** (D-147, SR-038): **Given** reject hua return ya daawa, **When** customer misaal 7 din me appeal kare, **Then** ek hi appeal; faisla Support Lead ka, aur wahi account kare jisne reject kiya tha to 403.
4. **AC-SUPPORT-4** (D-072, D-122, D-148): **Given** "parcel nahi mila", **When** code se delivered ho, **Then** daawa misaal 48 ghante me darj ho par maana na jaaye aur grievance ka raasta dikhe; sirf photo wali delivery pe misaal 7 din aur staff ki jaanch; koi saboot na ho to refund (R1 me dobara maal nahi) aur partner ki jaanch ka record.
5. **AC-SUPPORT-5** (D-106, D-192): **Given** toote, galat ya kam item ka daawa, **When** zaroori photos na hon, **Then** submit nahi; video optional; saboot sirf us maamle ka staff dekhe.
6. **AC-SUPPORT-6** (D-201, D-202, SR-039): **Given** staff ki list, **When** customer dikhe, **Then** naam aur phone chhupe; poori jaankari sirf wajah ke saath aur audit me; "customer ki nazar se" ka koi route contract me nahi.
7. **AC-SUPPORT-7** (SR-058; D-072 niyam 4): **Given** daawe, photo hash ka dobara aana, partner ke daawon ka hissa aur UPI pe mana, **When** maamla khule, **Then** signals dikhein; apne aap rok sirf D-109 aur D-203 ke niyam se.
8. **AC-SUPPORT-8** (§5 niyam 10): **Given** refund ya daawe ka faisla, **When** do baar submit ho (double click, network retry), **Then** ek hi faisla aur ek hi refund request.

### 1.11 AUDIT

1. **AC-AUDIT-1** (SR-076; §3 niyam 10): **Given** staff ka likhne wala kaam, **When** `audit.recorded` likhna fail ho, **Then** poora badlav ulta: "badlav hua par audit nahi" namumkin.
2. **AC-AUDIT-2** (SR-076): **Given** mana hua kaam (403), **When** ho, **Then** wo bhi audit me.
3. **AC-AUDIT-3** (D-317; §10.8 niyam 1): **Given** audit ka app user, **When** update ya delete kare, **Then** mana (sirf `insert` aur `find`).
4. **AC-AUDIT-4** (SR-076, SR-078): **Given** din ki chain, **When** ek entry badli jaaye, **Then** roz ki jaanch fail aur gambhirta 1 ka alert.
5. **AC-AUDIT-5** (R-042; §10.8 niyam 2, 6): **Given** purane din ka chunk, **When** job chale, **Then** pehle chunk likha, hash jaancha, phir entries mitein; chunk misaal 7 din peeche ho to alert; TTL chunk ki umar ke misaal 15 din baad hi.
6. **AC-AUDIT-6** (SR-076, D-047, D-194): **Given** har entry, **When** likhi jaaye, **Then** account, insaan ka jod, role, app, session, kaam, cheez, scope, pehle aur baad (chhupa), wajah, nateeja, IP, browser, request id aur samay; security events 1 saal.

### 1.12 MEDIA

1. **AC-MEDIA-1** (SR-061): **Given** upload, **When** SVG, `.png` naam wala HTML, ya seema se bada file ho, **Then** mana; signed URL exact type aur size se bandha, misaal 10 minute.
2. **AC-MEDIA-2** (SR-061): **Given** EXIF aur location wali photo, **When** `ready` ho, **Then** rakhe roop me EXIF nahi.
3. **AC-MEDIA-3** (SR-062; §7 niyam 1, 2): **Given** `assetId`, **When** client doosre maalik ka asset jodna chahe ya asset `ready` na ho, **Then** mana.
4. **AC-MEDIA-4** (SR-062, DS-7.7): **Given** private file, **When** authorization ke bina, ya misaal 6 minute purane URL se maangi jaaye, **Then** mana; PDF `attachment` ke saath; app ke origin se kabhi nahi; service worker cache nahi kare.
5. **AC-MEDIA-5** (D-191, D-192, D-193, D-227, D-262; §7 niyam 5): **Given** maqsad ka samay aur maamla band, **When** samay poora ho, **Then** roz ka job file mitaye; rok ka samay setting se.
6. **AC-MEDIA-6** (§7 niyam 9, 10): **Given** bina judi upload misaal 24 ghante se purani, ya file badli gayi, **When** roz ka job chale, **Then** mit jaaye (jis purani file ki record ko zaroorat hai wo apne samay tak); hafte ke milaan me provider ki anjaan file pakdi jaaye.
7. **AC-MEDIA-7** (D-284, SR-071): **Given** codebase, **When** lint chale, **Then** provider ki chaabi sirf media ke namespace me; business data me sirf `assetId`.

### 1.13 LOGS

1. **AC-LOGS-1** (SR-077; §8 niyam 3): **Given** request me password, code, token, cookie, `Authorization`, email, phone, address ya PAN ho, **When** log bane, **Then** inme se kuch nahi; route ka template, raw URL aur query nahi.
2. **AC-LOGS-2** (D-250, D-285, CL-106; §8 niyam 2, 10): **Given** request logs, **When** likhe jaayein, **Then** misaal har 60 second ya 1,000 lines pe ek gzip chunk, samay UTC, aur TTL setting se (abhi 180 din).
3. **AC-LOGS-3** (D-286; §8 niyam 5): **Given** server ki error, **When** ho, **Then** fingerprint ke saath; apps ki errors rate-limited route se, size ki seema aur bina personal data; nayi error ki khabar ops inbox me; error ka text Master me sirf text (HTML nahi chalta); URL me sirf route ka template; error objects ke log me headers, keys ya email nahi (SR-098, SR-099).
4. **AC-LOGS-4** (D-297; §8 niyam 6, 8): **Given** ops snapshot ke number (RSS, outbox ki umar, dead letters, Redis memory), **When** seema paar hon, **Then** sahi gambhirta ka alert, ek fingerprint ka misaal ek ghante me ek, theek hone pe "theek" ki khabar.
5. **AC-LOGS-5** (D-332; OPERATIONS §7 niyam 1): **Given** Redis ya ek cluster band, **When** Render ka health check `/health` bulaye, **Then** 200 (process zinda); `/ready` me wo band hissa dikhe, aur finance `/ready` me nahi.

## 2. Apps (R1)

### 2.1 CUSTOMER app

1. **AC-CUSTOMER-1** (D-349, DS-6.9): **Given** soya server, **When** app khule, **Then** misaal 1.5 second sirf rang aur progress bar, phir WakeScreen; `/wake` ke jawab se pehle koi API call nahi; misaal 150 second pe "Try again"; beech me rewrite 502 ya 504 de to wahi parda; jaagne ke baad ki ping pe koi nishaan nahi.
2. **AC-CUSTOMER-2** (DS-1.4, DS-9.3, SR-044): **Given** cart me rakhne ke baad agla batch (MRP, daam ya expiry) badla, **When** cart ya checkout khule, **Then** line pe "Updated" purane aur naye ke saath, aur order server ke total pe hi.
3. **AC-CUSTOMER-3** (D-067, D-223, D-232, DS-9.1, DS-9.2): **Given** discount wala product, **When** card, product page, cart aur checkout dikhein, **Then** kata MRP, daam, neeche round "% off", 30 din ka sabse kam daam, aur agle batch ki expiry mahina-saal "Use before" ya "Expiry" ke roop me.
4. **AC-CUSTOMER-4** (D-221, D-238, DS-9.7, DS-9.8, CL-061): **Given** product page aur order detail, **When** khulein, **Then** seller ka block aur return ki line add-to-cart ke paas aur order pe.
5. **AC-CUSTOMER-5** (DS-1.5, DS-9.9, DS-9.18, CL-070 se CL-072): **Given** sign-up aur checkout, **When** dikhein, **Then** koi tick pehle se nahi, marketing alag, delivery fee alag line aur "₹X se upar muft" pehle se, countdown sirf asli offer pe.
6. **AC-CUSTOMER-6** (D-345, SR-006, SR-090, DS-8.7): **Given** checkout, **When** "Place order" ke baad Payment screen khule, **Then** Payment alag HTML document; gateway ki script aur host sirf us document ki CSP me; Payment me aana aur jaana poore page ka load; payment ka timer sirf 5 aur 1 minute bache pe padha jaaye.
7. **AC-CUSTOMER-7** (D-343, D-195): **Given** out for delivery parcel, **When** Orders khule, **Then** DeliveryCodeCard sabse upar; push me code kabhi nahi.
8. **AC-CUSTOMER-8** (D-145, D-264, DS-9.14, DS-9.16, CL-079, CL-080): **Given** koi bhi page, **When** khule, **Then** demo ki patti jo band nahi hoti; legal pages pe DUMMY badge, version aur tareekh.
9. **AC-CUSTOMER-9** (SR-005, SR-010, SR-021, SR-027, D-359): **Given** har route, **When** khule, **Then** security headers aur CSP; browser storage me user ka data nahi; service worker `/api/*` cache nahi kare aur sign-out pe Cache Storage aur IndexedDB khaali; `next` me `//evil.example` aur encoded dot-segments home pe; axe me serious ya critical 0, light aur dark, 320 se 1280.
10. **AC-CUSTOMER-10** (D-346): **Given** pehla order pakka, **When** confirmation screen aaye, **Then** push ki ijazat ka card; "Not now" ke baad misaal 30 din card nahi; Account me hamesha.

### 2.2 SELLER app

1. **AC-SELLER-1** (D-184, SR-024): **Given** seller ke users, **When** listing wala user daam badle, ya bina authenticator ke bank badla jaaye, **Then** 403 ya mana; seller staff ke roles sirf Account Owner de.
2. **AC-SELLER-2** (D-190, SR-052): **Given** bank badalna, **When** dobara code ke saath ho, **Then** purane email aur in-app pe khabar, screen pe sirf aakhri 4 ank.
3. **AC-SELLER-3** (D-143, D-144, SR-034, SR-036, SR-075, SR-088): **Given** reports aur CSV, **When** bane, **Then** sirf apne rows; customer ka naam, phone, email aur address ke fields hi nahi; `=`, `+`, `-`, `@` se shuru cell ke aage `'`; invoice ki copy export me nahi.
4. **AC-SELLER-4** (D-087, DS-6.11): **Given** daam ka bada badlav, **When** save ho, **Then** dobara confirm ka dialog; MRP se upar ki galti field ke paas, bhara data saaf nahi.
5. **AC-SELLER-5** (D-081, D-369): **Given** bikri ki line, **When** seller dekhe, **Then** kab payable hogi aur kis payout me gayi.
6. **AC-SELLER-6** (D-160): **Given** apne products ke reviews, **When** seller dekhe, **Then** padh sake, reviewer ka contact kahin nahi, aur R1 me jawab ka raasta nahi.

### 2.3 ADMIN app

1. **AC-ADMIN-1** (SR-041, D-084): **Given** listing ki jaanch, **When** staff manzoor kare aur beech me naya version aa chuka ho, **Then** "This changed" aur sirf jaancha hua version manzoor.
2. **AC-ADMIN-2** (D-084): **Given** seller ya listing reject, **When** appeal aaye, **Then** reject karne wala account appeal pe faisla nahi kar sakta.
3. **AC-ADMIN-3** (D-136, D-251, SR-060): **Given** moderation ki queue, **When** khule, **Then** nagnata aur personal data wali reports sabse upar, har cheez ki ghadi dikhe, "Next item" aur ginti.
4. **AC-ADMIN-4** (D-201, SR-039, DS-10.5): **Given** customer ki jaankari wali list, **When** dikhe, **Then** chhupi; "Show details" pe wajah, phir dikhe aur audit me.
5. **AC-ADMIN-5** (D-015, D-152, SR-043): **Given** hub ka switch, synonyms ya HSN table, **When** badle, **Then** sirf haq wala badle, audit me purani aur nayi value aur wajah, aur asar bina deploy.
6. **AC-ADMIN-6** (D-181, DS-5.6, DS-6.10): **Given** staff session, **When** misaal 28 minute bina kaam, **Then** IdleWarning ulti ginti ke saath; 30 pe band aur sign-in ke baad usi page pe; sidebar me na dikhne wale section ka URL seedha khole to PermissionDenied (faisla server ka).

### 2.4 SUPER ADMIN app

1. **AC-SUPERADMIN-1** (D-015, D-037): **Given** district ka switch, **When** live ki sharten poori hon, **Then** live, bina deploy; adhoori hon to kaunsi shart baaki hai wo dikhe.
2. **AC-SUPERADMIN-2** (SR-035): **Given** ek district ka Super Admin, **When** doosre district ki cheez badle, **Then** 404.
3. **AC-SUPERADMIN-3** (D-185, SR-026, DS-10.2): **Given** D-185 ki list ka kaam, **When** kiya jaaye, **Then** StepUpDialog; code sahi to wahi kaam chale, page na badle.
4. **AC-SUPERADMIN-4** (D-300): **Given** area band karna, **When** shuru ho, **Then** pehle checkout pe rok, phir band, aur khule orders pe asar ki saaf jaankari.
5. **AC-SUPERADMIN-5** (SR-039, SR-076): **Given** har likhne wala kaam, **When** ho, **Then** audit me, aur lists me customer ki jaankari chhupi.

### 2.5 MASTER app

1. **AC-MASTER-1** (SR-009, DS-6.7): **Given** kill switch, **When** dobara code ke saath chale, **Then** us flow pe saaf sandesh ka banner (jaise checkout band pe cart bacha); "sab sessions band" ke baad har session 401.
2. **AC-MASTER-2** (D-133, SR-018): **Given** allowlist, **When** badle, **Then** dobara code, audit, aur hataye gaye email ke sessions band.
3. **AC-MASTER-3** (D-189): **Given** Finance ka bana payout batch, **When** Master ka doosra account dobara code se manzoor kare, **Then** chale; banane wala hi account ho to mana.
4. **AC-MASTER-4** (D-022, SR-043): **Given** location data ka import, **When** chale, **Then** pehle "dry run" aur schema ki jaanch; galat file ka koi asar nahi; audit me ginti.
5. **AC-MASTER-5** (D-297; OPERATIONS §7 niyam 6; ARCHITECTURE §3 niyam 6): **Given** ops page, **When** khule, **Then** aakhri jaag, aakhri sweep, har roz ke kaam ka aakhri poora din, aakhri backup ki tareekh aur khule alerts; dead letter dobara chalana sirf permission ke saath.
6. **AC-MASTER-6** (D-047, SR-037): **Given** Master ka account, **When** listing manzoor kare ya aisa sub-role banaye jisme grants dena ya payout manzoori ho, **Then** 403 ya mana; koi role khud ko appoint nahi kar sakta.
7. **AC-MASTER-7** (SR-101, D-324, D-401): **Given** owner ka Master session khatam, **When** gambhirta 1 ka alert bane, **Then** us device pe push aaye bina detail ke; subscription 410 de to gambhir email.

### 2.6 SUPPORT DESK app

1. **AC-SUPPORTDESK-1** (D-105, D-188): **Given** maamle ki queue, **When** khule, **Then** apne aap manzoor aur pending alag; seema se upar wala maamla Support Lead ki queue me.
2. **AC-SUPPORTDESK-2** (D-147): **Given** appeal, **When** reject karne wala khole, **Then** faisle ke buttons band aur wajah likhi.
3. **AC-SUPPORTDESK-3** (SR-062, DS-7.7): **Given** saboot ki photo ya video, **When** dekhi jaaye, **Then** chhote signed URL se, `no-referrer`, cache nahi.
4. **AC-SUPPORTDESK-4** (DS-6.12; ARCHITECTURE §5 niyam 10): **Given** refund ka faisla, **When** ConfirmDialog me rakam aur asar ke saath pakka ho, **Then** double click pe bhi ek faisla.
5. **AC-SUPPORTDESK-5** (D-202): **Given** customer ka maamla, **When** staff kaam kare, **Then** customer ke naam se ya uski nazar se koi kaam nahi, sirf support ki apni screens.

### 2.7 FINANCE app

1. **AC-FINANCEAPP-1** (D-081, D-189): **Given** hafte ka batch, **When** Finance banaye, **Then** har seller ki lines, set-off, bharpai aur net dikhe, aur manzoori ka button usi account ke liye band.
2. **AC-FINANCEAPP-2** (D-188, D-111): **Given** fail refund, **When** haath ka raasta chuna jaaye, **Then** Support Lead aur Finance dono ki manzoori ke bina aage nahi.
3. **AC-FINANCEAPP-3** (SR-053; ARCHITECTURE §1.11): **Given** milaan ke nateeje, **When** farak ho, **Then** M1 se M5 ka farak dikhe, aur M3 toote to "payouts ruke" ka banner.
4. **AC-FINANCEAPP-4** (D-144, SR-075): **Given** export, **When** maanga jaaye, **Then** dobara code, misaal 50,000 rows ki seema, chhota ek baar ka link, aur audit me filters aur ginti.
5. **AC-FINANCEAPP-5** (R-028; OPERATIONS §8 niyam 8): **Given** finance ka database band (CU-ghante khatam), **When** app khule, **Then** saaf sandesh, aur checkout ke kill switch ki salah.

### 2.8 LOGISTICS OPS app

1. **AC-LOGISTICSOPS-1** (DS-5.7): **Given** scan screen, **When** scan ho, **Then** input hamesha focus me, nateeja bade shabd + rang + icon ("Accepted", "Wrong bin", "Already scanned"); wahi scan dobara pe koi doosra asar nahi.
2. **AC-LOGISTICSOPS-2** (D-096, D-097, D-230): **Given** receiving, **When** barcode na ho, **Then** platform ka label sirf khaali jagah pe aur uski photo; farak photo ke saath seller ko.
3. **AC-LOGISTICSOPS-3** (D-106, D-314): **Given** pick aur pack, **When** galat bin scan ho, **Then** mana; pack ki photo zaroori; pack ke beech network ruke to dobara chalane pe ek hi invoice.
4. **AC-LOGISTICSOPS-4** (D-027, SR-057): **Given** trip, **When** hub pe receive ho, **Then** manifest aur seal ka milaan aur kam bag ka nishaan.
5. **AC-LOGISTICSOPS-5** (D-183, SR-023): **Given** partner ka naya phone, **When** Hub Manager manzoor kare, **Then** session usi phone pe; Hub Manager ek click se session band kar sake.
6. **AC-LOGISTICSOPS-6** (D-108, D-112): **Given** hub pe ruke parcels aur lauta maal, **When** list khule, **Then** misaal 3 din wale laal; Returns QC ka nateeja wajah ke hisaab se darj.

### 2.9 DELIVERY app

1. **AC-DELIVERY-1** (D-042, DS-5.8; ARCHITECTURE §5 niyam 6): **Given** network nahi, **When** partner list, scans aur photo kare, **Then** line me rukein, upar "N waiting to sync", aur network aate hi ek baar sync.
2. **AC-DELIVERY-2** (D-301): **Given** offline, **When** code wali delivery try ho, **Then** button band, wajah ke saath (intezaar ya Hub Manager).
3. **AC-DELIVERY-3** (SR-054): **Given** code, **When** 5 galat, **Then** code daalna band jab tak Hub Manager na khole; app ke data me code kabhi nahi.
4. **AC-DELIVERY-4** (SR-050, D-109, D-418): **Given** delivery pe UPI, **When** QR dikhe, **Then** server ka QR exact rakam ka (test mode me Payment page ka link); "Payment received" sirf webhook ke baad; "paid" ka koi button nahi; fail pe misaal 10 minute tak QR, phir "attempt fail".
5. **AC-DELIVERY-5** (SR-055, D-351, DS-7.8, DS-10.1): **Given** pehli photo ya location, **When** maangi jaaye, **Then** pehle app ki samjhane wali screen, phir browser ka prompt; mana ho to wapas chalu karne ka tareeka aur "No location" ka raasta; file input pe `capture`.
6. **AC-DELIVERY-6** (SR-010, SR-023): **Given** parcel delivered ya cancel, **When** ho, **Then** uska data IndexedDB se hate; shift khatam ya sign-out pe sab saaf.
7. **AC-DELIVERY-7** (D-183): **Given** manzoor phone pe session, **When** misaal 14 din poore hon ya Hub Manager band kare, **Then** agla sync 401.
8. **AC-DELIVERY-8** (DS-3.6, DS-5.8, DS-8.5): **Given** app, **When** khule, **Then** Sunlight mode default chalu (7:1), touch targets 48 px, aur axe me serious ya critical 0.
9. **AC-DELIVERY-9** (R-034; ARCHITECTURE §5 niyam 5): **Given** app ka version kam se kam se purana, **When** API bulaye, **Then** UpdateBanner; purane version me line me ruke kaam sync me phir bhi maane jaayein.
10. **AC-DELIVERY-10** (D-113): **Given** return pickup, **When** batch label na mile ya seal toota ho, **Then** pickup nahi aur wajah chuni jaaye; item ki photo zaroori.

## 3. Ginti

| Module    | Ginti   | App           | Ginti  |
| --------- | ------- | ------------- | ------ |
| PLATFORM  | 12      | CUSTOMER      | 10     |
| GATEWAY   | 10      | SELLER        | 6      |
| IDENTITY  | 13      | ADMIN         | 6      |
| NOTIFY    | 8       | SUPER ADMIN   | 5      |
| PAYMENTS  | 10      | MASTER        | 7      |
| CATALOG   | 12      | SUPPORT DESK  | 5      |
| COMMERCE  | 12      | FINANCE       | 5      |
| LOGISTICS | 12      | LOGISTICS OPS | 6      |
| FINANCE   | 12      | DELIVERY      | 10     |
| SUPPORT   | 8       |               |        |
| AUDIT     | 6       |               |        |
| MEDIA     | 7       |               |        |
| LOGS      | 5       |               |        |
| **Kul**   | **127** | **Kul**       | **60** |

Kul 187 criteria (R1).


## 4. R2 ka chhota khaka

- **Growth Studio aur Creator apps:** R1 ke apps jaise saajhe criteria (wake ka parda, headers, sessions ke D-181 ke Creator niyam, axe, error ka map); kaam ke criteria unke modules ke saath.
- **Coupons, points, gift cards (D-173 se D-176, D-249, SR-085):** 10 redemption ek saath pe ek hi safal; GSTIN wale order pe platform ke offers aur points nahi (D-279); ledger ki entries ARCHITECTURE §1.3 se.
- **Tickets, SLA, grievance, disputes (D-161 se D-164):** SLA ki ghadi kaam ke ghanton me aur jawab ke intezaar me ruke (fake clock ke saath); grievance ke samay (D-251).
- **Sehat ka data aur consultation (D-165, D-207, D-208, D-252, SR-067, SR-086):** bina consent field save nahi; galat role 403; Meet link ke nakli hosts mana; "Not a medical consultation" har screen pe.
- **Recall aur skin reaction (D-129, D-130):** `stock_batch_sales` se customers ki list; ek batch pe misaal 3 shikayaton pe bikri ruke.
- **Reviews ke R2 hisse (D-160, D-167, D-170, D-171):** brand ka jawab moderation se; formula badle to label aur do roop ki rating.
- **Try-on (D-169):** E2E me network ki jaanch ki koi photo upload na ho.
- **Partner ki kamaai aur payout (D-104, D-254):** TDS, kaat ki seema (D-103), payout statement, M10 ka milaan.
- **Baaki:** bina sign-in forms (SR-087), data download (D-151), replacement ka challan (D-122, CL-006), combo (D-088), short expiry (D-089), "Notify me" (D-153), transporter ka bill.

## Change log

| Version | Date       | Badlav                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| v1.0.0  | 2026-11-21 | Pehla version: R1 ke 184 acceptance criteria (13 services, 9 apps), ginti aur R2 ka khaka; D-388 se D-395.         |
| v1.0.1  | 2026-11-21 | AC-CUSTOMER-6 me Payment ka alag document; naya AC-GATEWAY-10 (`/wake`); kul 185 (security review batch 1, D-408). |
| v1.0.2  | 2026-11-22 | Naya AC-IDENTITY-13 (aliases aur allowlist); kul 186 (security review batch 2, D-409).                             |
| v1.0.3  | 2026-11-22 | AC-LOGS-3 me jod; naya AC-MASTER-7; kul 187 (security review batch 6, D-413).                                      |
| v1.0.4  | 2026-11-22 | AC-PAYMENTS-8 aur AC-DELIVERY-4 me test mode ka QR (D-418).                                                        |
| v1.0.5  | 2026-11-22 | AC-PLATFORM-12 me D-441 (env ki chaar files).                                                                      |
