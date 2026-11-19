# THREAT MODEL: Beautinique

> **Status:** v1.1.2 (2026-11-19). Security Architect ka kaam. Cheezein ek-ek karke judti hain.

## Is file me kya aayega

Har module ke liye:

- Attack surface: kaun, kahan se, kya chhoo sakta hai.
- STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.
- Abuse ke tareeke (jaise price, coupon, refund ya stock ke saath khel).
- Bachav, aur unka test.
- Jo jokhim phir bhi bacha.

Security ke faisle [../DECISIONS.md](../DECISIONS.md) me (tag `Security`), security ke risks [../RISKS.md](../RISKS.md) me (tag `Security`), aur niyam [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.

## 1. Poore system ke hisse

### 1.1 Edge aur hosting

- **Attack surface:** internet se koi bhi. 11 apps Vercel pe (D-048) apna `/api/*` Render ke gateway pe bhejte hain (D-052); gateway ka public URL seedha bhi bulaya ja sakta hai. Saara backend ek 512 MB process me (D-049, D-056). Install hone wale apps ka service worker (D-042).
- **Threats (STRIDE):**

  | Threat                                                                                                   | STRIDE                            | Bachav                 |
  | -------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------- |
  | Backend ka public URL seedha bula ke app ka raasta aur headers chhodna, ya jhootha client IP bhejna      | Spoofing, Tampering               | SR-002, SR-003         |
  | Galat client IP: sab users ek IP pe gine jaayein, rate limit sab ko roke, audit me galat IP              | DoS, Repudiation                  | SR-003, SR-008         |
  | CDN kisi signed-in ya personal jawab (Pro daam, cart, address) ko cache karke doosre user ko de de       | Information disclosure            | SR-004                 |
  | Headers ke bina XSS ka bada asar, ya sign-in aur bade buttons iframe me (clickjacking)                   | Tampering, Elevation              | SR-005                 |
  | Payment page pe bahar ki script badle to payment ke details chhin sakte hain                             | Information disclosure, Tampering | SR-006                 |
  | Ek process me saara backend: bada body, mehnga search, password hash ki baadh ya bada export se sab gire | DoS                               | SR-007, SR-008, SR-009 |
  | Service worker `/api/*` ya personal pages cache kare                                                     | Information disclosure, DoS       | SR-010                 |

- **Abuse:** sign-in, codes aur "place order" ki baadh se seemaayein khaana (SR-008).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** alag WAF ya DDoS ki suraksha nahi (R-015); payment page pe gateway ki script (R-016).

### 1.2 Sign-in

- **Attack surface:** customer app ke teen raaste (password, social, email code; D-021), staff ke 7 apps (password + authenticator, D-199), Seller app (D-184), Delivery app (manzoor phone, D-183), invites, recovery codes aur allowlist (D-133). Domain nahi (D-028).
- **Threats (STRIDE):**

  | Threat                                                                                                | STRIDE                           | Bachav                 |
  | ----------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------- |
  | Milte-julte naam ka nakli sign-in page: staff ka password aur authenticator code, ya customer ka code | Spoofing                         | SR-011, SR-012; R-017  |
  | Leak hue passwords se credential stuffing aur password spraying                                       | Spoofing                         | SR-013, SR-014, SR-008 |
  | Email code ka andaaza ya ek code ka dobara istemaal                                                   | Spoofing                         | SR-015                 |
  | Code ka phishing ("code bata do"), ya customer ka inbox hi hamlavar ke paas                           | Spoofing                         | SR-015, SR-016; R-018  |
  | Social sign-in se kabza: bina verified email ka jod, login CSRF, redirect URI se khel                 | Spoofing, Elevation              | SR-017                 |
  | Allowlist ka koi ek raasta khula reh jaaye                                                            | Elevation                        | SR-018                 |
  | Sign-up, sign-in ya reset ke jawab ya samay se pata chale kaunsa email registered hai                 | Information disclosure           | SR-019                 |
  | Code wale emails ki baadh: OTP ki din ki jagah khatam, ya kisi ke inbox pe emails ki baadh            | DoS                              | SR-020, SR-008         |
  | Sign-in ke baad bahar ki site pe redirect                                                             | Spoofing                         | SR-021                 |
  | Authenticator reset ya recovery ke raaste se kabza, ya owner phone khone pe bahar                     | Spoofing, DoS                    | SR-022                 |
  | Jaan-boojh ke galat password se owner ke staff accounts band karna                                    | DoS                              | SR-014                 |
  | Delivery partner ka phone kho jaaye: chalta session aur offline data                                  | Information disclosure, Spoofing | SR-023, SR-010         |
  | Seller ka bina authenticator wala user daam, maal ya payout badle                                     | Tampering, Elevation             | SR-024, SR-026         |
  | Invite link kisi aur ke haath, default account, ya pehla Master banane ka khula raasta                | Spoofing, Elevation              | SR-025                 |
  | Khula chhoda session ya chori hui cookie se bade kaam                                                 | Elevation                        | SR-026                 |

- **Abuse:** codes maang-maang ke emails ki chhat khaana (SR-020); per-customer seemaon ke liye kai accounts (D-203).
- **Bachav aur test:** har niyam ka test [SECURITY_REQUIREMENTS.md](SECURITY_REQUIREMENTS.md) me.
- **Bacha jokhim:** domain ke bina nakli sign-in pages (R-017); customer ka account inbox jitna surakshit (R-018).

## Change log

| Version | Date       | Badlav                                                               |
| ------- | ---------- | -------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                    |
| v1.1.1  | 2026-11-19 | §1 bana; pehla hissa 1.1 edge aur hosting (security batch 1, D-210). |
| v1.1.2  | 2026-11-19 | §1.2 sign-in (security batch 2, D-211).                              |
