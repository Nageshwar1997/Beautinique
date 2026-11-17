# DECISION LOG: discovery

> **Status:** v0.1 (2026-11-17), **draft**, discovery phase. Sirf wahi "Tay" hai jo owner ne khud kaha ho. Recommendation tab tak faisla nahi jab tak owner haan na kahe. Koi faisla badle to purani line mitti nahi: nayi line judti hai aur purani pe "badla" likha jaata hai.

## 1. Tay (owner ne kaha)

| Id | Faisla | Kab |
| ----- | ------ | ---------- |
| D-001 | Tech stack wahi rahega jo abhi hai. | 2026-11-17 |
| D-002 | Repo aur folders ka structure, tools aur conventions wahi rahenge. | 2026-11-17 |
| D-003 | Existing project (code aur docs) sirf reference hai; usme jo sawal uthane layak ho, uthaya jaye. | 2026-11-17 |
| D-004 | Abhi sirf discovery: sawal-jawab. Plan, task files aur code tab tak nahi jab tak owner agla stage na khole. | 2026-11-17 |
| D-005 | Agents ek ke baad ek, kabhi saath nahi. 5-hour limit ~80% pe ho to naya agent nahi; chalta hua agent poora hone do. | 2026-11-17 |
| D-006 | Tasks ek file me nahi: ek main plan file, har poore flow ki alag task file, uske andar subtasks. Exact dhaancha baad me tay hoga (Q queue B17). | 2026-11-17 |
| D-007 | Security Architect ek zaroori, alag role hai; security docs zaroorat ke saath bante jayenge. | 2026-11-17 |

## 2. Pending (jawab baaki)

[OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §1: Q-001 se Q-006.

## 3. Rejected approaches

Abhi koi nahi.

## 4. Assumptions (jab tak owner kuch aur na kahe)

| Id | Assumption |
| ----- | ---------- |
| A-001 | Root `CLAUDE.md` ke "Hamesha laagu niyam" waise hi laagu hain. |
| A-002 | Purane PRD aur ARCHITECTURE ke decisions sirf reference hain jab tak Q-002 ka jawab na aaye. |
| A-003 | Discovery ki files `docs/discovery/` me rehti hain; final dhaancha B17 me tay hoga. |

## 5. Risks

| Id | Risk |
| ----- | ---- |
| R-001 | Scope aur capacity ka mel nahi: neev gehri hai par commerce ka ek bhi feature nahi bana (analysis §3, §6 Q1). |
| R-002 | ₹0 hosting aur "production-grade" ek saath nahi chalte (analysis §6 Q4). |
| R-003 | Ek hi agent ne 5-hour limit ka ~59% liya: discovery kai sessions me chalegi. |
| R-004 | Kanooni baatein lawyer se verify nahi hain. |

## 6. Technical recommendations (abhi tay nahi)

[REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) §5 (reuse layak patterns) aur §6 (critique). Inme se har ek apne batch me sawal ban ke aayega.

## Change log

| Version | Date | Badlav |
| ------- | ---------- | ------ |
| v0.1 | 2026-11-17 | Pehla draft: D-001 se D-007, assumptions, risks. |
