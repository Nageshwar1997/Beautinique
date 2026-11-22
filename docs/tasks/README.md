# TASKS: Beautinique

> **Status:** v1.0.2 (2026-11-22), **khaali**. Har module ka apna folder. Modules ki list discovery ke baad aayegi; cheezein ek-ek karke judengi.

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

| Version | Date       | Badlav                                                                   |
| ------- | ---------- | ------------------------------------------------------------------------ |
| v1.0.0  | 2026-11-17 | Khaali dhaancha bana.                                                    |
| v1.0.1  | 2026-11-21 | `TASK.md` me acceptance criteria ki jagah ACCEPTANCE.md ki link (D-388). |
| v1.0.2  | 2026-11-22 | `TASK.md` me manuals aur testing files ki links (D-440).                 |
