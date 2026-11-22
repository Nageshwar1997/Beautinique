# TASKS: Beautinique

> **Status:** v1.0.16 (2026-11-22). Har module ka apna folder; modules ki list [../PROJECT_PLAN.md](../PROJECT_PLAN.md) §3 me. Abhi saare 28 modules ki `TASK.md` (R2 ke `25` aur `26` draft, D-454): [01](01-foundation/TASK.md), [02](02-platform/TASK.md), [03](03-frontend-kit/TASK.md), [04](04-logs/TASK.md), [05](05-audit/TASK.md), [06](06-media/TASK.md), [07](07-notify/TASK.md), [08](08-identity/TASK.md), [09](09-gateway/TASK.md), [10](10-logistics/TASK.md), [11](11-catalog/TASK.md), [12](12-payments/TASK.md), [13](13-commerce/TASK.md), [14](14-finance/TASK.md), [15](15-support/TASK.md), [16](16-app-customer/TASK.md), [17](17-app-seller/TASK.md), [18](18-app-admin/TASK.md), [19](19-app-super-admin/TASK.md), [20](20-app-master/TASK.md), [21](21-app-support-desk/TASK.md), [22](22-app-finance/TASK.md), [23](23-app-logistics-ops/TASK.md), [24](24-app-delivery/TASK.md), [25](25-app-growth-studio/TASK.md), [26](26-app-creator/TASK.md), [27](27-operations/TASK.md) aur [28](28-packages/TASK.md). Cheezein ek-ek karke judti hain.

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
- **`NN` sirf pehchaan hai, order nahi.** Banane ka kram [../PROJECT_PLAN.md](../PROJECT_PLAN.md) §5 me (D-446).

## Change log

| Version           | Date                     | Badlav                                                                                                                          |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.16 | 2026-11-17 se 2026-11-22 | Modules ke folder ka dhaancha, aur pehli `TASK.md` (saare 28 modules; R2 ke draft); har badlav ka poora itihaas git me (D-442). |
