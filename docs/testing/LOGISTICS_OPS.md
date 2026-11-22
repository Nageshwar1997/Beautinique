# TESTING: Logistics Ops app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Logistics Ops app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Warehouse, hub aur logistics ki team; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                                                  | Release | Halat     |
| -------------------- | --------------------------------------------------------------------------- | ------- | --------- |
| [FL-3](../FLOWS.md)  | Staff ka sign-in aur bada kaam                                              | R1      | Bana nahi |
| [FL-4](../FLOWS.md)  | Delivery partner ke phone ki manzoori (Hub Manager)                         | R1      | Bana nahi |
| [FL-17](../FLOWS.md) | Receiving: batch aur expiry ki jaanch, label, farak ki photo, "accept" scan | R1      | Bana nahi |
| [FL-9](../FLOWS.md)  | Pick, pack, warehouse se hub ka trip, hub pe receive, partner ko assign     | R1      | Bana nahi |
| [FL-10](../FLOWS.md) | RTO ka hub scan aur warehouse me wapsi                                      | R1      | Bana nahi |
| [FL-12](../FLOWS.md) | Lauta maal ki jaanch (Returns QC)                                           | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Scan wale kaam laptop ke camera ya scanner se; ginti ka farak apne aap nishaan (SR-057).
- Area settings (delivery fee, cut-off, chhuttiyan, delivery pe UPI ki seema) Logistics Head ke paas (D-426).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
