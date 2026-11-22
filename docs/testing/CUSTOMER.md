# TESTING: Customer app

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing: Customer app me kya test karna hai, aur har round ka record. Saajhe niyam [COMMON.md](COMMON.md) me. Feature bante hi Claude usi PR me ye file update karta hai (D-440).

## 1. App

- **Kis ke liye:** Customers aur Beauty Pro Buyers; roles [PRODUCT.md](../PRODUCT.md) §3.2 me.
- **Kahan khulta hai:** pehle deploy ke baad yahan app ka URL aayega.
- **Manuals:** is app ke roles ke manuals [manuals/](../manuals/README.md) me.

## 2. Kya test karna hai

Halat: `Bana nahi`, `Test ke liye taiyar` (feature bana, round baaki), `Pass` (tareekh ke saath), ya `Fail` (bug ke saath).

| Flow                 | Kya dekhna                                                           | Release | Halat     |
| -------------------- | -------------------------------------------------------------------- | ------- | --------- |
| [FL-1](../FLOWS.md)  | Sign-up: allowlist, 18+ ki ghoshna, data notice, email code          | R1      | Bana nahi |
| [FL-2](../FLOWS.md)  | Sign-in ke teen raaste: password, social, email code                 | R1      | Bana nahi |
| [FL-6](../FLOWS.md)  | Pincode: live pe delivery ka vaada, warna "unavailable" aur waitlist | R1      | Bana nahi |
| [FL-7](../FLOWS.md)  | Cart se prepaid order: address, payment (test mode), confirmation    | R1      | Bana nahi |
| [FL-8](../FLOWS.md)  | Delivery pe UPI wala order                                           | R1      | Bana nahi |
| [FL-11](../FLOWS.md) | Cancel: pack se pehle poora order, item ya quantity                  | R1      | Bana nahi |
| [FL-12](../FLOWS.md) | Return se refund: wajah, photo, nateeja                              | R1      | Bana nahi |
| [FL-13](../FLOWS.md) | "Parcel nahi mila" ka daawa                                          | R1      | Bana nahi |
| [FL-14](../FLOWS.md) | Reject ke baad appeal                                                | R1      | Bana nahi |
| [FL-19](../FLOWS.md) | Review likhna: star, text, photo                                     | R1      | Bana nahi |
| [FL-20](../FLOWS.md) | Review ki report                                                     | R1      | Bana nahi |
| [FL-5](../FLOWS.md)  | Account delete: kya hatega, "Also delete my reviews", 7 din me wapas | R1      | Bana nahi |

Har flow ke "Fail ho to" wale raaste bhi [FLOWS.md](../FLOWS.md) me hain; har round me kam se kam ek galat raasta bhi dekhna.

## 3. Is app ki khaas baatein

- Checkout har release se pehle asli Android phone pe; R1 se pehle ek baar iPhone pe checkout, install aur push (D-375).
- Address screen: pehle form; Ola ka map sirf "Find on map" ya "Use my current location" dabane pe, Ola ki suchna ki line ke saath (D-437). Laptop pe kam accuracy wali location pe pin apne aap nahi lagta (D-423).
- Payment ka screen alag page hai; payment ke baad app me wapas aana dekhna (D-407).
- Screen reader: TalkBack har release se pehle; VoiceOver R1 se pehle ek baar (D-376).

## 4. Record

Record ka tareeka [COMMON.md](COMMON.md) §5 me.

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

## Change log

| Version | Date       | Badlav                                                             |
| ------- | ---------- | ------------------------------------------------------------------ |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): flows ki list, khaas baatein aur khaali record. |
