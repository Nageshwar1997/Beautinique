# SECURITY REQUIREMENTS: Beautinique

> **Status:** v1.1.1 (2026-11-17). Security ke niyam, module-wise. Cheezein ek-ek karke judti hain.

## 0. Kaise likhein

- Har niyam: **Id**, **Niyam**, **Kis module pe**, **Kahan se** (OWASP ASVS, OWASP Top 10 ya OWASP API Security Top 10 ka hissa), **Test kaise**.
- Pehle poore system ke niyam (auth, sessions, API, data, secrets, logs), phir har module ke.
- **Number:** SR-001, SR-002 ... kram se. Ek baar diya number kabhi badalta nahi aur dobara use nahi hota.

## 1. Niyam

| Id     | Niyam                                                                                                                                                                                                            | Kis module pe | Kahan se                          | Test kaise                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------- | ----------------------------------------------------------------------------------------- |
| SR-001 | Customer app ka `Permissions-Policy` header camera aur location band rakhe. Try-on (camera) aur address pin (location) bante waqt inhe sirf apni site (`self`) ke liye khole, kisi bahar ke origin ke liye nahi. | Customer app  | OWASP ASVS: HTTP security headers | Har route ke response me header ki jaanch; bahar ke iframe se camera ya location na mile. |

## Change log

| Version | Date       | Badlav                                                                                           |
| ------- | ---------- | ------------------------------------------------------------------------------------------------ |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                |
| v1.1.1  | 2026-11-17 | §0 aur §1 bane; pehla niyam SR-001 (customer app me camera aur location sirf apni site ke liye). |
