# MANUALS: Beautinique

> **Status:** v1.0.1 (2026-11-22). Har role ka apna manual: us role ke bane features ko kaise use karein. Feature bante hi Claude usi PR me manual banata ya badalta hai (D-440).

## Niyam

1. **Ek role, ek file:** `manuals/<app>/<ROLE_NAME>.md` (misaal `manuals/customer/CUSTOMER.md`, `manuals/seller/SELLER_ACCOUNT_OWNER.md`). Roles ki list aur har role ka kaam [PRODUCT.md](../PRODUCT.md) §3 me; yahan dobara nahi.
2. **Saajhe features [COMMON.md](COMMON.md) me:** jo feature kai apps me bilkul ek jaisa hai (misaal sign-in, authenticator, theme), uska manual ek hi baar COMMON me, saath me kis-kis app me hai. Role ki file me us feature ki sirf ek line aur COMMON ki link; jis app me thoda farak hai, wo farak us role ki file me.
3. **File kab banti hai:** us role ka pehla feature jis PR me ban jaaye, usi PR me. Jis role ka koi feature abhi bana nahi, uski file nahi hoti (khaali file se koi kaam nahi seekhta).
4. **Kab badalti hai:** jis PR me us role ka koi feature jude, badle ya hate, usi PR me ([RULES.md](../RULES.md) DD-13).
5. **Sirf bana hua:** manual me sirf wahi jo code me bana aur chalta hai; aage ka kaam nahi.
6. **Bhasha:** manual Hinglish me; screen pe dikhne wale button aur sandesh hubahu, jaise app me hain.
7. **Koi secret ya personal data nahi:** misaal ke liye sirf demo ka data aur `example` domain ke emails.

## Har manual ka dhaancha

```markdown
# MANUAL: <Role> (<App> app)

> **Status:** vX.Y.Z (date). Is role ke bane features ko kaise use karein.

## Role
Ek line, aur PRODUCT §3 ki link.

## Shuru kaise karein
App kahan khulta hai, sign-in kaise (aur authenticator ho to wo bhi).

## Features
### <Feature ka naam>
- **Kab kaam aata hai:** ...
- **Kadam:** 1. ... 2. ...
- **Dhyaan rahe:** seemaayein, galti pe kya dikhta hai aur kya karein.
- **Niyam:** faisle aur acceptance criteria ki links (D-xxx, AC-xxx).

## Change log
```

## Manuals ki list

Saajhe features ki list [COMMON.md](COMMON.md) me. Roles ki files ki list yahan; jaise-jaise files banti hain, ek line judti hai.

| App | Role | File | Pehla feature |
| --- | ---- | ---- | ------------- |

## Change log

| Version | Date       | Badlav                                                   |
| ------- | ---------- | -------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Nayi file (D-440): niyam, dhaancha aur khaali list.      |
| v1.0.1  | 2026-11-22 | Niyam 2: saajhe features ka manual COMMON.md me (D-440). |
