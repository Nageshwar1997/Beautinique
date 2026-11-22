# TESTING: Seller app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Seller app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Sellers ki team aur Unibelle ki team; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                                                     | Release | Halat     |
| -------------------- | ------------------------------------------------------------------------------ | ------- | --------- |
| [FL-15](../FLOWS.md) | Seller onboarding: brand ka saboot, dastavez, seller ka block, agreement, bank | R1      | Bana nahi |
| [FL-16](../FLOWS.md) | Listing se live: variants, shade, HSN, MRP aur daam, ingredients, claims       | R1      | Bana nahi |
| [FL-17](../FLOWS.md) | Maal warehouse me: maal bhejne ki suchna, receiving ka farak                   | R1      | Bana nahi |
| [FL-18](../FLOWS.md) | Payout: har line ki halat, statement aur CSV                                   | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Account Owner, Finance aur maal, daam ya bank ke haq wale users pe authenticator zaroori (D-184).
- Bank khaata badalne pe dobara code, aur naye khaate pe misaal 72 ghante payout nahi (D-190).
- Unibelle ka account bhi baaki sellers jaisa; uski listing ki jaanch Unibelle ka staff nahi karta (D-031, D-271).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
