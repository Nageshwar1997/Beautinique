# TASKS: Beautinique

> **Status:** v1.0.4 (2026-11-22). Har module ka apna folder; modules ki list [../PROJECT_PLAN.md](../PROJECT_PLAN.md) §3 me. Abhi ek `TASK.md`: [28-packages](28-packages/TASK.md). Cheezein ek-ek karke judti hain.

## Dhaancha

```
tasks/
└── NN-<module>/
    ├── TASK.md      ← module ka spec aur subtasks ki list (status ke saath)
    └── subtasks/    ← sirf bade kaam ki alag file (lagbhag ek PR jitna)
```

- **`TASK.md` me:** objective, scope, functional requirements, business rules, data model, API (endpoints ki list aur niyam), security, dependencies, acceptance criteria ki link ([../ACCEPTANCE.md](../ACCEPTANCE.md) ka us module ka hissa, copy nahi; D-388), roles ke manuals aur apps ki testing files ki links ([../manuals/](../manuals/README.md), [../testing/](../testing/COMMON.md); D-440), subtasks ki list.
- **API ka asli spec** contracts (route ki definitions, code me) se bani `openapi.json` hogi; `TASK.md` use dobara nahi likhta.
- **Subtask ki alag file** sirf tab jab kaam bada ho; chhota kaam `TASK.md` ki list me hi.
- **`NN` sirf pehchaan hai, order nahi.** Banane ka order [../PROJECT_PLAN.md](../PROJECT_PLAN.md) ke releases me.

## Change log

| Version          | Date                     | Badlav                                                                                                        |
| ---------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.4 | 2026-11-17 se 2026-11-22 | Modules ke folder ka dhaancha, aur pehli `TASK.md` (28-packages); har badlav ka poora itihaas git me (D-442). |
