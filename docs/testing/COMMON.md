# TESTING: Common (saare apps)

> **Status:** v1.0.0 (2026-11-22). Owner ki haath ki testing ke saajhe niyam. Har app ki apni file isi folder me; feature bante hi Claude usi PR me us app ki file update karta hai (D-440).

## 1. Har app ki file

| App           | File                                 |
| ------------- | ------------------------------------ |
| Customer      | [CUSTOMER.md](CUSTOMER.md)           |
| Seller        | [SELLER.md](SELLER.md)               |
| Admin         | [ADMIN.md](ADMIN.md)                 |
| Super Admin   | [SUPER_ADMIN.md](SUPER_ADMIN.md)     |
| Master        | [MASTER.md](MASTER.md)               |
| Support Desk  | [SUPPORT_DESK.md](SUPPORT_DESK.md)   |
| Finance       | [FINANCE.md](FINANCE.md)             |
| Logistics Ops | [LOGISTICS_OPS.md](LOGISTICS_OPS.md) |
| Delivery      | [DELIVERY.md](DELIVERY.md)           |
| Growth Studio | [GROWTH_STUDIO.md](GROWTH_STUDIO.md) |
| Creator       | [CREATOR.md](CREATOR.md)             |

Har app ki file me: kya test karna hai (flows aur unki halat), us app ki khaas baatein, aur testing ka record.

## 2. Kab test karna hai

1. **Har release pe:** owner misaal 2 ghante; badle flows pe chhote round (ek flow, ek lakshya, misaal 30 minute) (D-377).
2. **Asli phone, har release se pehle:** Android pe Delivery app ke ek din ka kaam (FL-9, FL-10, return pickup) aur Customer app ka checkout (D-375).
3. **R1 se pehle ek baar:** iPhone pe Customer app ka checkout, home screen pe install aur push (D-375); allowlist ke 1 ya 2 testers ka ek round (D-377).
4. **Screen reader, har release se pehle:** NVDA (Windows) pe desktop apps, TalkBack (Android) pe Customer aur Delivery; R1 se pehle ek baar VoiceOver (iPhone) pe Customer (D-376).

Kis app ki file me kya "Test ke liye taiyar" hai, wahi is round me test hota hai.

## 3. Har screen pe kya dekhna hai

1. Light, dark, aur jahan hai wahan high contrast (Delivery, sign-in, checkout) ([DESIGN.md](../DESIGN.md) §3).
2. Mobile chaudai (320 aur 360 px) pe koi side-scroll nahi, aur desktop pe layout theek (DD-8).
3. Keyboard se poora kaam: Tab ka kram, dikhne wala focus, Enter aur Esc ([DESIGN.md](../DESIGN.md) DS-8.1).
4. Galti ke sandesh saaf, aur galat input pe kya karna hai wo dikhe.
5. Server soya ho to pehle "server jaag raha hai" ka parda, phir app (D-028); parda hatne se pehle kuch na dabayein.
6. Paisa aur tareekh `en-IN` roop me (misaal ₹1,229.00).

## 4. Test ka data

1. Sirf demo aur test data. Asli personal data kabhi nahi.
2. Payments sirf test mode me (D-026); UPI ke test me `success@razorpay` jaisa test id.
3. Sign-up aur sign-in sirf allowlist ke emails se (D-133); demo ki har cheez pe demo ka nishaan (D-145).
4. Har tester ka naam ya email record me nahi, sirf alias (misaal "Tester A"); asli pehchaan sirf allowlist ki setting me (D-377, D-436). Repo public hai.

## 5. Record kaise likhein

Har round ki ek line us app ki file ke "Record" me:

| Tareekh | Release ya commit | Tester | Device aur browser | Flow ya feature | Nateeja | Bug |
| ------- | ----------------- | ------ | ------------------ | --------------- | ------- | --- |

- **Nateeja:** `Pass`, `Fail`, ya `Adhoora` (kya bacha, wo saath me).
- "Verified" sirf isi record ya live smoke check se likha jaata hai (D-377 niyam 4); sirf automated test pass hona "verified" nahi.
- Owner bas Claude ko bataye kya dekha aur kya mila; Claude record ki line aur flow ki halat update karta hai.

## 6. Bug mile to

1. Claude ko batayein: kya kiya, kya hona tha, kya hua, device aur browser, aur ho sake to screenshot (bina personal data ke).
2. Security ki galti (jaise doosre ka data dikh gaya) ki detail public issue ya commit me nahi; Claude use private record me rakhta hai ([RULES.md](../RULES.md) RT-39, D-403).
3. Bug theek hone ke baad usi flow ka round dobara, aur record me nayi line.

## Change log

| Version | Date       | Badlav                                                                           |
| ------- | ---------- | -------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): apps ki list, kab test, har screen pe kya, data, record, bug. |
