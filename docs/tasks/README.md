# TASKS: Beautinique

> **Status:** v0.1 (2026-11-17), **khaali**. Har module ka apna folder. Modules ki list discovery ke baad aayegi; cheezein ek-ek karke judengi.

## Dhaancha

```
tasks/
└── NN-<module>/
    ├── TASK.md      ← module ka spec aur subtasks ki list (status ke saath)
    └── subtasks/    ← sirf bade kaam ki alag file (lagbhag ek PR jitna)
```

- **`TASK.md` me:** objective, scope, functional requirements, business rules, data model, API (endpoints ki list aur niyam), security, dependencies, acceptance criteria, subtasks ki list.
- **API ka asli spec** contracts (route ki definitions, code me) se bani `openapi.json` hogi; `TASK.md` use dobara nahi likhta.
- **Subtask ki alag file** sirf tab jab kaam bada ho; chhota kaam `TASK.md` ki list me hi.
- **`NN` sirf pehchaan hai, order nahi.** Banane ka order [../PROJECT_PLAN.md](../PROJECT_PLAN.md) ke releases me.

## Change log

| Version | Date | Badlav |
| --- | --- | --- |
| v0.1 | 2026-11-17 | Khaali dhaancha bana. |
