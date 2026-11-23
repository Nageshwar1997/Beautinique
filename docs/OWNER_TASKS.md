# OWNER TASKS: Beautinique

> **Status:** v1.0.12 (2026-11-23). Owner ke bahar ke kaam: wo kaam jo sirf owner kar sakta hai (account banana, env key daalna, download, provider ki setting, kisi se poochhna). Claude naya kaam yahan jodta hai, aur owner "ho gaya" kahe to yahin update karta hai (D-440).

## Kaise padhein

- **Khule kaam** (§1) kram se: sabse upar wala sabse pehle chahiye. "Kab tak" batata hai kis kaam se pehle ye chahiye.
- Kaam ho jaaye to Claude ko batayein ("OT-1 ho gaya", saath me jo nateeja ho). Claude jahan ho sake khud jaanch ke kaam ko §2 me le jaata hai, tareekh ke saath, aur jahan zaroori ho doosre docs bhi update karta hai.
- Yahan kabhi koi secret, password, key ya personal data nahi likha jaata: sirf kaam ka naam, kahan karna hai, aur "ho gaya". Secret ki value sirf provider ke dashboard ya password manager me rehti hai.
- **Aage ke kaam** (§3) abhi nahi karne: jab us module ka kaam shuru hoga, Claude wo kaam §1 me laayega. Koi account pehle se bana ho to bas batayein.

## 1. Khule kaam

| #    | Kaam                                                                                                                                                                                                                                                                                                                                                          | Kyun                                                                     | Kab tak                                     | Faisla              |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------- | ------------------- |
| OT-2 | **Laptop ka disk encryption:** Settings → Privacy & security → Device encryption (ya BitLocker) me dekhein ki chalu hai ya nahi, aur Claude ko batayein. Band ho aur option mile to chalu karein.                                                                                                                                                             | Backups aur repo laptop pe hain; laptop kho jaaye to data surakshit rahe | Pehle backup se pehle                       | D-013, D-196, R-023 |
| OT-3 | **Object storage ka account:** Cloudflare R2 (pehli pasand) ya Backblaze B2 pe account banate waqt dekhein ki card maangta hai ya nahi, aur free plan pe bucket lock milta hai ya nahi. Abhi sirf dekhna; banana Claude ke saath.                                                                                                                             | Private files ki jagah aur kanooni rok wali files ka lock                | Media ke module se pehle                    | D-420, D-439        |
| OT-4 | **Gift card issuer se poochhna:** Pine Labs ya kisi aur RBI-authorised PPI issuer se poochhein ki test API ya sandbox milta hai ya nahi.                                                                                                                                                                                                                      | Gift card ka raasta                                                      | R2 ke gift card module se pehle (abhi nahi) | D-179, D-249        |

## 2. Ho gaye

| #    | Kaam                                     | Kab hua    | Nateeja                                                                                                                                                                                                                                                              |
| ---- | ---------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OT-1 | Location data: LGD ki 6 reports download | 2026-11-22 | Files Html me (Xls ka raasta khaali page deta tha), repo ke bahar `LGD-data/2026-11-22/` me; Claude ne ginti ki ([RISKS.md](RISKS.md) §2)                                                                                                                            |
| OT-6 | GitHub ki security settings              | 2026-11-23 | Owner ne vulnerability reporting chalu ki, Actions me SHA pinning lagaya aur `release` ke ruleset se admin ka bypass hataya; 2FA chalu. Claude ne baaki settings aur rulesets jaanch ke sahi paaye. Non-provider patterns aur validity checks is plan pe nahi milte. |
| OT-5 | npm account aur `@beautinique` scope     | 2026-11-23 | Owner ne bataya: account aur `@beautinique` scope owner ne khud register kiye hain, aur jaanch ho gayi. Trusted publishing ki setting har package ke pehle publish ke baad, Claude ke saath (D-445).                                                                 |

## 3. Aage ke kaam (jab us module ka kaam shuru ho)

Har provider pe account owner ka hota hai, MFA aur recovery codes ke saath (SR-081). Env keys tabhi daali jaati hain jab code unhe padhta ho ([OPERATIONS.md](OPERATIONS.md) §4 niyam 11); us waqt Claude key ka naam aur value kahan se aayegi yahan likhega.

| Kaam                                                                                                                        | Kab                                         | Faisla              |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------- |
| Render: ek free web service aur ek Key Value, Singapore region                                                              | Pehle live deploy se pehle                  | D-048, D-056, D-058 |
| Vercel: 11 apps ke projects (Hobby), personal account se                                                                    | Har app ke pehle deploy se pehle            | D-048, D-010        |
| MongoDB Atlas: har service ka alag project aur free cluster (audit aur logs ke bhi), AWS Singapore                          | Us service ke pehle live deploy se pehle    | D-011, D-058, D-421 |
| Neon: finance ka project, Singapore                                                                                         | Finance ke module se pehle                  | D-057, D-058        |
| Razorpay: test mode ki keys aur webhook                                                                                     | Payments ke module se pehle                 | D-034, D-418        |
| Brevo: account aur API key                                                                                                  | Emails ke module se pehle                   | D-287, D-419        |
| Cloudinary: account (public aur review images)                                                                              | Media ke module se pehle                    | D-284, D-420        |
| Ola Maps: key aur apne apps ke hosts ki whitelist                                                                           | Address ke module se pehle                  | D-347, SR-091       |
| Google, LinkedIn aur GitHub ke sign-in apps                                                                                 | Social sign-in ke module se pehle           | D-021               |
| cron-job.org aur UptimeRobot: server jagane aur nigrani ke jobs                                                             | Pehle live deploy ke baad                   | D-322, D-424, D-332 |
| Har deployable ki `.env.production` apne private env folder me (repo ke bahar), aur Render aur Vercel ke env me wahi values | Us deployable ke pehle live deploy se pehle | D-441               |
| `.env.development` me development ke secrets (sirf jab kisi provider ka asli test mode chahiye)                             | Us kaam ke din                              | D-441               |
| Har naye live deploy ki env keys (naam aur value ka source yahan aayega)                                                    | Us PR ke merge se pehle                     | D-430               |

## Change log

| Version           | Date       | Badlav                                                                               |
| ----------------- | ---------- | ------------------------------------------------------------------------------------ |
| v1.0.0 se v1.0.7  | 2026-11-22 | Owner ke khule aur aage ke kaam; har badlav ka poora itihaas git me (D-442).         |
| v1.0.8 se v1.0.12 | 2026-11-23 | OT-6 (GitHub ki security settings) juda aur ho gaya, aur OT-5 (npm) ho gaya (D-455). |
