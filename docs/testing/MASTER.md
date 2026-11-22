# TESTING: Master app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Master app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Owner aur governance; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                   | Release | Halat     |
| -------------------- | -------------------------------------------- | ------- | --------- |
| [FL-3](../FLOWS.md)  | Staff ka sign-in aur bada kaam               | R1      | Bana nahi |
| [FL-6](../FLOWS.md)  | State ka switch aur live                     | R1      | Bana nahi |
| [FL-18](../FLOWS.md) | Payout batch ki manzoori (doosre account se) | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Kill switches (sign-up, sign-in, checkout, uploads, payouts, sab sessions band): har ek dobara code ke saath aur app me saaf sandesh (SR-009).
- Authenticator reset (D-200) aur grants ka har badlav dobara code ke saath.
- Master ke paas koi "decide" permission nahi; approvals ka koi bypass nahi dikhna chahiye (SR-037).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
