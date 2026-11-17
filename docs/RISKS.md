# RISKS: Beautinique

> **Status:** v1.1.1 (2026-11-17). Saare risks ek jagah, security wale bhi. Cheezein ek-ek karke judti hain.

## 0. Kaise likhein

- Har risk: **Id**, **Risk**, **Tag** (`Business`, `Architecture`, `Security`, `Operations`), **Asar**, **Kam karne ka tareeka**, **Status** (`Khula`, `Maana` = owner ne jaan ke maana, `Band`).
- **Number:** R-001, R-002 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Risks

| Id    | Risk                                                                                                                                                | Tag          | Asar                                                                                 | Kam karne ka tareeka                                                                                                                 | Status |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| R-001 | Scope aur capacity ka mel nahi: poora ecosystem (11 apps, kai services) ek insaan ke 30 ghante/hafta pe.                                            | Business     | Pehla poora order flow der se chalega; business ki soch der se parkhi jayegi.        | Banana releases me, R1 = patla par poora order flow (D-008); capacity D-009. R1 me exactly kya, ye abhi tay nahi.                    | Khula  |
| R-002 | ₹0 hosting aur production-grade ek saath: free tier pe server sota hai, CPU aur RAM kam.                                                            | Architecture | Chalne ki quality ₹0 tak hi: pehli request pe ~1 minute, raat me timers late.        | Owner ne maana (D-028); server baar-baar jagana, free tier ki seemaon ki handling, performance targets sirf jaage server pe (D-053). | Maana  |
| R-003 | Usage ki seemaayein (5 ghante aur hafte ki): ek agent ne 5-hour seema ka ~59% liya.                                                                 | Operations   | Discovery aur kaam kai sessions aur accounts me batata hai.                          | Agents ek ke baad ek (D-005); 2 accounts (D-009); [HANDOFF.md](HANDOFF.md) se agla account wahin se shuru kare.                      | Khula  |
| R-004 | Kanooni baatein kisi lawyer se jaanchi nahi.                                                                                                        | Business     | Asli business pe jaane se pehle galti nikal sakti hai.                               | Sab registrations aur details dummy (D-026); [COMPLIANCE.md](COMPLIANCE.md) me har row pe "jaancha ya nahi".                         | Khula  |
| R-005 | Domain nahi, isliye OTP aur baaki emails spam me ja sakte hain.                                                                                     | Operations   | Sign-in ya OTP der se ya na pahunche.                                                | Owner ne maana (D-028).                                                                                                              | Maana  |
| R-006 | Atlas free tier: ek project me ek free cluster, aur data-transfer ki seema.                                                                         | Architecture | Har service ka apna cluster (D-011) aur backup command (D-013) seemit ho sakte hain. | Atlas ke niyam jaanchne hain; zaroorat pade to D-011 dobara khulega.                                                                 | Khula  |
| R-007 | Ek 512 MB Render process me saari backend services (bundle mode, D-049).                                                                            | Architecture | Memory khatam hone pe service gir sakti hai.                                         | Memory naapni hai; zaroorat pade to D-011 aur D-049 dobara khulenge.                                                                 | Khula  |
| R-008 | Render free ke mahine ke ghante, aur baar-baar jagana (D-028) uske niyamon me theek hai ya nahi.                                                    | Operations   | Service band ho sakti hai ya account pe rok lag sakti hai.                           | Render ke niyam jaanchne hain.                                                                                                       | Khula  |
| R-009 | Finance ke liye PostgreSQL naya kaam: transaction, events, release steps aur idempotency ka PostgreSQL roop; free provider abhi nahi chuna (D-001). | Architecture | Finance service ka kaam bada aur der se.                                             | Provider chunna aur iska kaam finance ki charcha me tay karna.                                                                       | Khula  |

## Change log

| Version | Date       | Badlav                                                            |
| ------- | ---------- | ----------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                 |
| v1.1.1  | 2026-11-17 | §0 likhne ka tareeka aur §1 bane; pehle 9 risks (R-001 se R-009). |
