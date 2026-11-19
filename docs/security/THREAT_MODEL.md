# THREAT MODEL: Beautinique

> **Status:** v1.1.10 (2026-11-19). Security Architect ka kaam. Cheezein ek-ek karke judti hain.

## Is file me kya aayega

Har module ke liye:

- Attack surface: kaun, kahan se, kya chhoo sakta hai.
- STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
- Abuse ke tareeke (jaise price, coupon, refund ya stock ke saath khel).
- Bachav, aur unka test.
- Jo jokhim phir bhi bacha.

Security ke faisle [../DECISIONS.md](../DECISIONS.md) me (tag `Security`), security ke risks [../RISKS.md](../RISKS.md) me (tag `Security`), aur niyam [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.

## 1. Poore system ke hisse

### 1.1 Edge aur hosting

- **Attack surface:** internet se koi bhi. 11 apps Vercel pe (D-048) apna `/api/*` Render ke gateway pe bhejte hain (D-052); gateway ka public URL seedha bhi bulaya ja sakta hai. Saara backend ek 512 MB process me (D-049, D-056). Install hone wale apps ka service worker (D-042).
- **Threats (STRIDE):**

  | Threat                                                                                                   | STRIDE                            | Bachav                 |
  | -------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------- |
  | Backend ka public URL seedha bula ke app ka raasta aur headers chhodna, ya jhootha client IP bhejna      | Spoofing, Tampering               | SR-002, SR-003         |
  | Galat client IP: sab users ek IP pe gine jaayein, rate limit sab ko roke, audit me galat IP              | DoS, Repudiation                  | SR-003, SR-008         |
  | CDN kisi signed-in ya personal jawab (Pro daam, cart, address) ko cache karke doosre user ko de de       | Information disclosure            | SR-004                 |
  | Headers ke bina XSS ka bada asar, ya sign-in aur bade buttons iframe me (clickjacking)                   | Tampering, Elevation              | SR-005                 |
  | Payment page pe bahar ki script badle to payment ke details chhin sakte hain                             | Information disclosure, Tampering | SR-006                 |
  | Ek process me saara backend: bada body, mehnga search, password hash ki baadh ya bada export se sab gire | DoS                               | SR-007, SR-008, SR-009 |
  | Service worker `/api/*` ya personal pages cache kare                                                     | Information disclosure, DoS       | SR-010                 |

- **Abuse:** sign-in, codes aur "place order" ki baadh se seemaayein khaana (SR-008).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** alag WAF ya DDoS ki suraksha nahi (R-015); payment page pe gateway ki script (R-016).

### 1.2 Sign-in

- **Attack surface:** customer app ke teen raaste (password, social, email code; D-021), staff ke 7 apps (password + authenticator, D-199), Seller app (D-184), Delivery app (manzoor phone, D-183), invites, recovery codes aur allowlist (D-133). Domain nahi (D-028).
- **Threats (STRIDE):**

  | Threat                                                                                                | STRIDE                           | Bachav                 |
  | ----------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------- |
  | Milte-julte naam ka nakli sign-in page: staff ka password aur authenticator code, ya customer ka code | Spoofing                         | SR-011, SR-012; R-017  |
  | Leak hue passwords se credential stuffing aur password spraying                                       | Spoofing                         | SR-013, SR-014, SR-008 |
  | Email code ka andaaza ya ek code ka dobara istemaal                                                   | Spoofing                         | SR-015                 |
  | Code ka phishing ("code bata do"), ya customer ka inbox hi hamlavar ke paas                           | Spoofing                         | SR-015, SR-016; R-018  |
  | Social sign-in se kabza: bina verified email ka jod, login CSRF, redirect URI se khel                 | Spoofing, Elevation              | SR-017                 |
  | Allowlist ka koi ek raasta khula reh jaaye                                                            | Elevation                        | SR-018                 |
  | Sign-up, sign-in ya reset ke jawab ya samay se pata chale kaunsa email registered hai                 | Information disclosure           | SR-019                 |
  | Code wale emails ki baadh: OTP ki din ki jagah khatam, ya kisi ke inbox pe emails ki baadh            | DoS                              | SR-020, SR-008         |
  | Sign-in ke baad bahar ki site pe redirect                                                             | Spoofing                         | SR-021                 |
  | Authenticator reset ya recovery ke raaste se kabza, ya owner phone khone pe bahar                     | Spoofing, DoS                    | SR-022                 |
  | Jaan-boojh ke galat password se owner ke staff accounts band karna                                    | DoS                              | SR-014                 |
  | Delivery partner ka phone kho jaaye: chalta session aur offline data                                  | Information disclosure, Spoofing | SR-023, SR-010         |
  | Seller ka bina authenticator wala user daam, maal ya payout badle                                     | Tampering, Elevation             | SR-024, SR-026         |
  | Invite link kisi aur ke haath, default account, ya pehla Master banane ka khula raasta                | Spoofing, Elevation              | SR-025                 |
  | Khula chhoda session ya chori hui cookie se bade kaam                                                 | Elevation                        | SR-026                 |

- **Abuse:** codes maang-maang ke emails ki chhat khaana (SR-020); per-customer seemaon ke liye kai accounts (D-203).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** domain ke bina nakli sign-in pages (R-017); customer ka account inbox jitna surakshit (R-018).

### 1.3 Sessions aur tokens

- **Attack surface:** har app ki apni cookies (D-186) saajhe hosts pe (D-048, domain nahi); access aur refresh tokens; sessions ka cache Redis me (R-010); "My devices".
- **Threats (STRIDE):**

  | Threat                                                                                                   | STRIDE                           | Bachav                 |
  | -------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------- |
  | XSS ya malware se session token ki chori; lamba session chori ke baad bhi chale                          | Spoofing, Information disclosure | SR-027, SR-028, SR-005 |
  | Refresh token ki copy chupchaap chale; ya ulta, khoya jawab "chori" maan ke sahi user baar-baar bahar ho | Spoofing, DoS                    | SR-028                 |
  | Redis restart pe band sessions ke nishaan ud jaayein aur purana session phir chale                       | Elevation                        | SR-029                 |
  | Cookie wale sessions pe CSRF (doosri site se badalne wali request)                                       | Tampering                        | SR-030                 |
  | Token jaali banana (algorithm ka khel), signing key ka leak, ya ek app ka token doosre app pe chalna     | Spoofing, Elevation              | SR-031                 |
  | Allowlist se hata tester, ya role khatam hua staff, chalte session se kaam karta rahe                    | Elevation                        | SR-018, SR-029         |

- **Abuse:** chori hui cookie se "My devices" chhupana ya naye sessions banana (SR-016, SR-028).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** chori hua session apni umar (D-180, D-181) tak chal sakta hai jab tak band na kiya jaaye; Redis restart pe rate limits ki ginti shuru se (R-010).

### 1.4 Authorization aur sellers ki deewar

- **Attack surface:** har signed-in user (customer, seller ke users, staff, delivery partner) har API route ko apni ya kisi aur ki id ke saath bula sakta hai; ek platform pe kai sellers; Master ke sub-roles aur grants (D-017, D-047).
- **Threats (STRIDE):**

  | Threat                                                                                                                               | STRIDE                            | Bachav         |
  | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | -------------- |
  | Customer id badal ke doosre ka order, invoice, address, return ya daawe ki photo dekhe ya badle (BOLA)                               | Information disclosure, Tampering | SR-032, SR-033 |
  | Seller A, seller B ke orders, stock, settlement, listings ya dastavez dekhe ya badle; ya report aur export me scope ke bahar ka data | Information disclosure, Tampering | SR-034         |
  | Customer ya seller ke token se staff ke routes; partner doosre hub ya doosre partner ke parcels                                      | Elevation                         | SR-032, SR-035 |
  | Request me zyada fields (role, daam, status, "approved", seller id), ya seller ke jawab me customer ka phone                         | Tampering, Information disclosure | SR-036         |
  | Roles se upar chadhna: khatarnak permission wala sub-role, khud ko appoint karna, grant ke scope se bahar                            | Elevation                         | SR-037         |
  | Kaam ka bantwara toote: wahi account appeal tay kare, refund banaye aur manzoor kare, ya apni listing manzoor kare                   | Elevation, Repudiation            | SR-038         |
  | Staff zaroorat se zyada customer ki jaankari dekhe ya list bana ke le jaaye                                                          | Information disclosure            | SR-039         |

- **Abuse:** ids ka andaaza laga ke ek-ek karke doosron ka data nikalna (SR-033, SR-008).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me; har route aur actor ka matrix test (SR-032).
- **Bacha jokhim:** owner ke saare accounts ek hi insaan ke (D-017, D-047); kaam ka bantwara sirf ek account ki chori se bachata hai, andar ke galat kaam se nahi.

### 1.5 Catalog, checkout aur paisa

- **Attack surface:** seller ka content aur daam, settings aur imports, checkout ki request, stock, payment gateway ke webhooks, delivery pe UPI, staff ke paise wale faisle, seller ka bank, ledger.
- **Threats (STRIDE):**

  | Threat                                                                                               | STRIDE                            | Bachav         |
  | ---------------------------------------------------------------------------------------------------- | --------------------------------- | -------------- |
  | Seller ke content ya review me stored XSS, jo customer app ya staff ke app me chale                  | Tampering, Elevation              | SR-040, SR-005 |
  | Jokhim wala field doosre raaste se badal ke jaanch se bachna, ya jaanch ke beech version badalna     | Tampering                         | SR-041         |
  | Daam MRP se upar, 0, ya bada badlav bina confirm; Pro daam sab ko dikhna                             | Tampering, Information disclosure | SR-042, SR-004 |
  | Settings kam haq ya chori ke account se badalna                                                      | Tampering, Elevation              | SR-043, SR-026 |
  | Client se daam, discount, delivery fee, quantity ya pincode badal ke bhejna; Pro daam bina Pro darje | Tampering                         | SR-044, SR-042 |
  | Stock ki race: ek saath orders se zyada bikna; reservation aur payment ke beech                      | Tampering                         | SR-045         |
  | Delivery-pe-UPI ya bina payment ke orders se stock rokna                                             | DoS                               | SR-046         |
  | Aadhe cancel ya return pe refund ki galat ginti se zyada paisa wapas                                 | Tampering                         | SR-047         |
  | Nakli webhook ya sirf browser ke "success" se order pakka, ya kam rakam ka payment jodna             | Spoofing, Tampering               | SR-048, SR-049 |
  | Wahi webhook do baar ya purana dobara: do refund ya do ledger entry                                  | Tampering                         | SR-049         |
  | Delivery pe partner apna QR dikhaye ya khud "paid" kare; customer purana screenshot dikhaye          | Spoofing, Tampering               | SR-050         |
  | Chori hua staff account refund seema se upar ya baar-baar chalaye                                    | Elevation, Tampering              | SR-051, SR-038 |
  | Seller account chori karke bank badal ke agla payout apne khaate me                                  | Tampering, Spoofing               | SR-052, SR-026 |
  | Ledger me seedha badlav, ya finance aur gateway ka milaan na hona                                    | Tampering, Repudiation            | SR-053         |

- **Abuse:** price, coupon, refund aur stock ke saath khel (SR-044 se SR-047, SR-051).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me; race, property aur webhook ke tests.
- **Bacha jokhim:** payment page pe gateway ki script (R-016).

### 1.6 Delivery, daawe aur reviews

- **Attack surface:** Delivery app (code, photo, location, scans), return pickup, customer ke daawe, support ki manzoori, reviews aur reports.
- **Threats (STRIDE):**

  | Threat                                                                                            | STRIDE                 | Bachav         |
  | ------------------------------------------------------------------------------------------------- | ---------------------- | -------------- |
  | Partner delivery code ka andaaza lagaye, ya code kisi aur raaste (push, logs) leak ho             | Spoofing               | SR-054         |
  | Nakli saboot: gallery ki purani photo, ya GPS badal ke "delivered"                                | Spoofing, Repudiation  | SR-055         |
  | Delivery ki photo aur location ka galat istemaal ya zyada der rakhna; partner ki lagatar tracking | Information disclosure | SR-056, D-191  |
  | Trip ka manifest ya scan badal ke warehouse, hub ya raaste me maal gayab                          | Tampering, Repudiation | SR-057         |
  | Return pickup pe doosra batch ya nakli maal, partner ki mili-bhagat ke saath                      | Tampering              | SR-055, SR-058 |
  | Jhoothe daawe: internet ki photo, ek photo kai daawon me, baar-baar "parcel nahi mila"            | Spoofing, Repudiation  | SR-058, SR-055 |
  | Support Agent aur customer ki mili-bhagat (jaan-pehchaan wale ka refund ya daawa manzoor)         | Elevation              | SR-051, SR-038 |
  | Kai accounts se nakli reviews, ya brand ka staff apne product pe review                           | Spoofing               | SR-059, D-203  |
  | "Personal data" ki jhoothi report se negative review faisle tak chhupwana                         | DoS, Tampering         | SR-060         |

- **Abuse:** refund ke liye jhoothe daawe; rating badhane ke liye nakli reviews (SR-058, SR-059).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** browser me gallery ki photo poori tarah nahi rukti (hash aur location ke nishaan se kam); partner ke phone pe offline data (R-019).

### 1.7 Files aur personal data

- **Attack surface:** har upload (product images, review ki photos, daawe ki photos aur video, KYC aur Pro ke dastavez, delivery ki photo), private media ke URLs, databases aur backups me personal data, account delete, sehat ka data (R2).
- **Threats (STRIDE):**

  | Threat                                                                                                               | STRIDE                    | Bachav         |
  | -------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------- |
  | Bura file: SVG ya HTML se XSS, ek file jo do type ki ho, bahut bada file, ya image parser ke bug se process pe kabza | Tampering, Elevation, DoS | SR-061         |
  | Private media ka URL andaaze se, public jagah se, lambe signed URL se ya Referer se leak                             | Information disclosure    | SR-062, SR-005 |
  | Uploads ki baadh se free storage khatam                                                                              | DoS                       | SR-061, SR-008 |
  | Review ki photo me EXIF ki location, ya review text me phone ya email                                                | Information disclosure    | SR-061, SR-040 |
  | Database ya backup leak hone pe PAN, bank account aur authenticator ke secrets khule                                 | Information disclosure    | SR-063, D-196  |
  | Zaroorat se zyada data lena ya zyada der rakhna                                                                      | Information disclosure    | SR-064, SR-065 |
  | Account delete ke baad bhi kisi service me naam aur email bacha                                                      | Information disclosure    | SR-066         |
  | Sehat ka data galat haathon me ya aankdon me (R2)                                                                    | Information disclosure    | SR-067         |

- **Abuse:** uploads se storage bharna (SR-061, SR-008).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** uploads ki malware jaanch nahi (R-020).

### 1.8 Data stores, services aur khabrein

- **Attack surface:** har service ka apna MongoDB aur finance ka PostgreSQL (D-011, D-050, D-057), Redis (D-051), ek process me saari services (D-049, D-056), events aur queue, server ke bahar ke calls, emails aur browser push.
- **Threats (STRIDE):**

  | Threat                                                                                                   | STRIDE                                       | Bachav         |
  | -------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------- |
  | Database ke credentials leak aur network sabke liye khula: poora database padhna, badalna ya mitana      | Information disclosure, Tampering, DoS       | SR-068; R-022  |
  | NoSQL operator injection, finance me SQL injection, ya search me regex se CPU                            | Tampering, Information disclosure, Elevation | SR-069         |
  | Redis me galat cache, nakli queue job, ya rate limits ki ginti mitna                                     | Tampering, DoS                               | SR-070, SR-029 |
  | Ek process me ek module ki kamzori se doosri services ke database credentials aur data tak pahunch       | Elevation, Information disclosure            | SR-071; R-021  |
  | Nakli ya badla event; ek service doosri ke naam se event bheje                                           | Spoofing, Tampering                          | SR-071         |
  | SSRF: nakli push subscription se server andar ke URL ko bulaye                                           | Spoofing, Information disclosure             | SR-072         |
  | Email me HTML ya header injection, zyada personal data, ya email provider ke dashboard me codes ki copy  | Information disclosure, Tampering            | SR-073         |
  | Push galat insaan ko (shared browser pe purane account ki subscription), ya lock screen pe personal baat | Information disclosure                       | SR-074, D-195  |
  | Seller ko payment link wala email: bina domain ke links pe click karna sikhata hai                       | Spoofing                                     | SR-073, SR-012 |

- **Abuse:** push subscription ke URL se server ko andar ke pate bulwana (SR-072).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me; lint aur dependency rules (SR-071).
- **Bacha jokhim:** ek process me process ki deewar nahi (R-021); databases ka network khula ho sakta hai (R-022).

### 1.9 Export, audit, logs aur DevOps

- **Attack surface:** exports aur reports, audit log, app logs, owner ke alerts, secrets (providers ke env), public repo aur CI, providers ke accounts, owner ka laptop aur backups (D-013, D-196).
- **Threats (STRIDE):**

  | Threat                                                                                             | STRIDE                            | Bachav                       |
  | -------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------- |
  | Export se leak: CSV me formula wale cell, scope ke bahar ka data, ya bada export                   | Information disclosure, Tampering | SR-075                       |
  | Staff apne kaam se mukar jaaye; audit log badla ya mitaya jaaye                                    | Repudiation, Tampering            | SR-076                       |
  | Logs me passwords, codes, tokens, address ya PAN                                                   | Information disclosure            | SR-077                       |
  | Free tier pe alerts kam aur logs thode din: hamla der se pakda jaaye                               | Repudiation                       | SR-078, SR-084; R-024        |
  | Public repo me galti se secret commit, ya payment gateway ki key logs ya app ke bundle me          | Information disclosure, Spoofing  | SR-079, SR-080; R-027        |
  | Provider account pe kabza: code, infra aur data sab                                                | Spoofing, Elevation               | SR-081; R-023                |
  | Supply chain: npm package ya GitHub Action me malware; fork PR se CI ke secrets                    | Tampering, Elevation              | SR-082; R-026                |
  | Owner ka laptop chori ya malware: backups, env, browser ke sessions                                | Information disclosure, Elevation | SR-081, SR-083, D-196; R-023 |
  | Backup files ka leak, ya restore me purana ya badla data, ya delete hua account wapas              | Information disclosure, Tampering | SR-083                       |
  | Account par kabze ke baad account delete karna; ya delete ke baad bhi data services aur backups me | DoS, Information disclosure       | SR-066, SR-016, SR-083       |
  | Seller ke paas invoice ki copiyon se customers ke naam aur address ki list                         | Information disclosure            | SR-088                       |

- **Abuse:** bade export se ek baar me data nikalna (SR-075).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me; incident ka abhyaas saal me ek baar (SR-084).
- **Bacha jokhim:** laptop aur providers ke accounts ek jagah (R-023); seemit logs aur alerts (R-024); bahar ki jaanch nahi (R-025); supply chain (R-026); public repo (R-027).

### 1.10 R2 ke hisse

- **Attack surface:** points, coupons, referral aur gift cards (D-102, D-174, D-176, D-179), consultation ka Meet link aur Beauty Advisor ka thread (D-025), bina sign-in forms (D-161, D-163), Beauty Pro (D-069), sehat ka data (D-165, D-207).
- **Threats (STRIDE):**

  | Threat                                                                                                   | STRIDE                           | Bachav         |
  | -------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------- |
  | Coupon, points ya gift card ek saath do baar kharch; returns se points ka khel; kai accounts se referral | Tampering, Spoofing              | SR-085, D-203  |
  | Meet link field me nakli link, ya Advisor thread me bahar ke links                                       | Spoofing                         | SR-086         |
  | Bina sign-in forms pe spam, emails ki baadh, ya kisi aur ke email ka bahana                              | DoS, Spoofing                    | SR-087, SR-020 |
  | Beauty Pro ke nakli dastavez, ya Pro daam ka leak                                                        | Spoofing, Information disclosure | SR-062, SR-042 |
  | Sehat ka data galat haathon me ya aankdon me                                                             | Information disclosure           | SR-067         |

- **Abuse:** points aur coupons ke saath khel (SR-085).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** gift cards aur points ke prepaid niyam kanooni jaanch tak khule (D-179, R-004).

## Change log

| Version | Date       | Badlav                                                                 |
| ------- | ---------- | ---------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                      |
| v1.1.1  | 2026-11-19 | §1 bana; pehla hissa 1.1 edge aur hosting (security batch 1, D-210).   |
| v1.1.2  | 2026-11-19 | §1.2 sign-in (security batch 2, D-211).                                |
| v1.1.3  | 2026-11-19 | §1.3 sessions aur tokens (security batch 3, D-212).                    |
| v1.1.4  | 2026-11-19 | §1.4 authorization aur sellers ki deewar (security batch 4, D-213).    |
| v1.1.5  | 2026-11-19 | §1.5 catalog, checkout aur paisa (security batch 5, D-214).            |
| v1.1.6  | 2026-11-19 | §1.6 delivery, daawe aur reviews (security batch 6, D-215).            |
| v1.1.7  | 2026-11-19 | §1.7 files aur personal data (security batch 7, D-216).                |
| v1.1.8  | 2026-11-19 | §1.8 data stores, services aur khabrein (security batch 8, D-217).     |
| v1.1.9  | 2026-11-19 | §1.9 export, audit, logs aur DevOps (security batch 9, D-218).         |
| v1.1.10 | 2026-11-19 | §1.9 me invoice ki copy; §1.10 R2 ke hisse (security batch 10, D-219). |
