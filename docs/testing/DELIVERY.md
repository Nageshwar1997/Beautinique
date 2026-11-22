# TESTING: Delivery app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Delivery app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Delivery partners; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                                     | Release | Halat     |
| -------------------- | -------------------------------------------------------------- | ------- | --------- |
| [FL-4](../FLOWS.md)  | Partner ka sign-in, manzoor phone pe                           | R1      | Bana nahi |
| [FL-9](../FLOWS.md)  | Delivery: code se, ya photo aur location se; door pe UPI ka QR | R1      | Bana nahi |
| [FL-10](../FLOWS.md) | Delivery fail: wajah, location, RTO                            | R1      | Bana nahi |
| [FL-12](../FLOWS.md) | Return pickup: item ki photo, batch aur seal ki jaanch         | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Har release se pehle asli Android phone pe ek din ka kaam (D-375): offline, camera, location aur dhoop me padhna.
- Code ki 5 galat koshish ke baad band; Hub Manager khole (AC-LOGISTICS-3).
- Offline me sirf list, scans aur photo; code wali delivery sirf online (AC-LOGISTICS-4).
- High contrast aur ek haath se kaam (DS-5.8); TalkBack har release se pehle (D-376).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
