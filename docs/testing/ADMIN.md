# TESTING: Admin app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Admin app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Marketplace ki teams aur sub-district ke Admins; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                                         | Release | Halat     |
| -------------------- | ------------------------------------------------------------------ | ------- | --------- |
| [FL-3](../FLOWS.md)  | Staff ka sign-in, authenticator, bada kaam pe dobara code          | R1      | Bana nahi |
| [FL-6](../FLOWS.md)  | Hub ka switch aur live, sharten adhoori hon to kaunsi baaki        | R1      | Bana nahi |
| [FL-15](../FLOWS.md) | Seller ki manzoori (Seller Ops), reject aur appeal alag account se | R1      | Bana nahi |
| [FL-16](../FLOWS.md) | Listing ki jaanch (category ke hisaab se), INCI list               | R1      | Bana nahi |
| [FL-20](../FLOWS.md) | Review ki moderation ki queue: report, chhupana, wapas dikhana     | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Staff session 30 minute bina kaam pe band; 28 minute pe chetavni (D-181, AC-ADMIN-6).
- Customer ki jaankari chhupi; "Show details" pe wajah aur audit (AC-ADMIN-4).
- Synonyms, HSN table aur hub ka switch sirf haq wala badle, bina deploy (AC-ADMIN-5).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
