# @beautinique/shared-authz

Beautinique ka permission matcher (ARCHITECTURE §7.3), jo backend (`authorize`, `scopeFilter`) aur frontend (`<Can>`, nav, buttons) dono use karte hain, taaki dono jagah faisla ek hi niyam se ho.

## Install

```bash
npm install @beautinique/shared-authz zod
```

## Model

- **Grant:** `{ role, permissions, scope: { type, ids }, validFrom?, validTo? }`. Roles data hain, isliye grant me role ki permission keys pehle se bhari aati hain.
- **Scope types:** global, state, district, city, hub, warehouse, brand, category, sellerOrg, creatorAgency, self.
- **Containment:** global ⊇ state ⊇ district ⊇ city ⊇ hub. Baaki types sirf apne ids (aur global) se cover hote hain.
- **Resource scope:** resource kahan baitha hai, jaise `{ state: 'MH', district: 'PUNE', city: 'PUNE-CITY', hub: 'H1', sellerOrg: 'O1', self: 'U1' }`. Location ki **poori chain** deni hoti hai: hub ke saath uska city, district aur state bhi. Isi se state grant hub ko cover karta hai. Adhoori chain pe error aata hai, taaki chupke se deny na ho.

## Use

```ts
import { can, decide, scopeSpec } from '@beautinique/shared-authz';
import { permissionCatalogue } from '@beautinique/shared-contracts';

const permissions = permissionCatalogue(allPermissionDefinitions);

can(user.grants, 'orders.order.view', order, { permissions }); // true / false

decide(user.grants, 'orders.order.view', order, { permissions });
// { allowed: false, reason: 'out-of-scope' }  → audit log aur support ke liye

scopeSpec(user.grants, 'orders.order.view', { permissions });
// { global: false, ids: { hub: ['H1', 'H2'], district: ['PUNE'] } } → backend ise Mongo filter banata hai
```

Faisla aise hota hai, aur pehli rukawat hi `reason` banti hai:

| Check                                                      | Fail pe reason           |
| ---------------------------------------------------------- | ------------------------ |
| Kisi grant me ye permission hai?                           | `no-grant`               |
| Wo grant abhi active hai? (`validFrom` ≤ abhi < `validTo`) | `not-active`             |
| Permission is grant ke scope type ko allow karti hai?      | `scope-type-not-allowed` |
| Scope resource ko cover karta hai?                         | `out-of-scope`           |

- **Default deny.** Koi wildcard nahi (`*`, `orders.*` kuch nahi dete), isliye koi role, Master bhi, check bypass nahi karta.
- Permission ke allowed scope types ke bahar ka grant kabhi nahi ginta. Global grant bhi nahi, agar permission sirf state/district ki hai.
- Resource na do (menu, button dikhana) to permission wala koi bhi active grant kaafi hai.
- Undeclared permission key pe error aata hai: code me galat key bug hai, chupke se deny nahi.

## Baaki helpers

| Function                                 | Kaam                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `scopeCovers(scope, resource?)`          | Ek scope resource ko cover karta hai ya nahi                                |
| `isGrantActive(grant, now?)`             | Validity window ke andar hai ya nahi                                        |
| `reachesAnything(spec)`                  | `scopeSpec` kuch bhi tak pahunchta hai ya nahi (khaali = kuch nahi dikhana) |
| `isStepUpFresh(lastStepUpAt, now?, ms?)` | Step-up MFA haal hi ka hai ya nahi (default 5 minute; future time pe false) |

MFA, second signature aur separation of duties (maker ≠ checker) ki enforcement gateway aur modules karte hain. Permission ki definition (`mfa`, `secondSignature`) `shared-contracts` me hai.

## License

MIT © Nageshwar Pawar
