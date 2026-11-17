# T4 Location plan — BQ

> **Status:** v1.2 (2026-11-17, **owner ne §1 ki saari "Meri salah" maani**; L20 ka order aur thresholds PR 2 me asli REPORT numbers dekh ke pakka hote hain). Ye doc M4 ke teen jude hue kaam ka poora plan hai: **T4.2 Location** (LGD + India Post data, poora India pehle din se), **T4.1 PR E Area settings** (har jagah ke niyam: cut-off, holidays, UPI) aur **T4.3 Network** (warehouse, hubs, serviceability API, Pune seed). Order: T4.2 → T4.1 PR E → T4.3. §0–§2 owner ke liye hain (kahani, faisle, haath ke kaam); §3 se aage developer ki detail. Owner ke jawab aane ke baad faisle [TASKS.md](../TASKS.md) ki "Plan (owner ne maana, <date>)" lines, [ARCHITECTURE.md](../ARCHITECTURE.md) aur [MEMORY.md](../MEMORY.md) me jaate hain, aur is doc ka version badhta hai.

**Kaise padhein.** §0 ek PIN code ki kahani aur teen chhote examples hain. §1 me aapke saare faisle hain; agar aap kahein "saari salah theek", to neeche exactly "Meri salah" column wala hi banega. §2 me aapke haath ke kaam (downloads aur live runs) hain. Baaki doc developer ke liye hai.

---

## 0. Ek nazar me

### 0.1 Teen kaam, teen sawal

| Kaam | Kis sawal ka jawab deta hai | Example jawab |
|---|---|---|
| T4.2 Location | "Ye PIN code kahan hai?" | 411038 → Kothrud (post office) → Pune district → Maharashtra (`MH`) |
| T4.1 PR E Area settings | "Is jagah ke niyam kya hain?" | 411038 ka cut-off: "13:00, Pune district se, version 1" |
| T4.3 Network | "Kya deliver kar sakte hain, aur kab tak?" | "1:00 pm se pehle order kiya to Tue, 17 Nov" |

Saare examples dummy ya illustrative hain; asli details sarkari files se aayengi.

### 0.2 Ek PIN code ki kahani

Riya storefront me **411038** likhti hai.

1. **T4.2 Location batata hai "411038 kahan hai?"**
   - Location master ka jawab: Maharashtra (`MH`) › Pune district › sub-district khaali › post offices jaise "Kothrud" › delivery: haan. Sub-district khaali isliye hai ki shehar ke beech wale PIN me LGD ke gaon aksar nahi hote.
   - Gaon wale PIN 410501 (Chakan) ka jawab: Maharashtra › Pune › **Khed** sub-district.
   - Shehar ke kinare wale PIN me dono milte hain. 411057 (Hinjawadi + Wakad) me Mulshi taluka ke gaon bhi hain aur shehar ke post office bhi. Isliye hub chunte waqt sirf sub-district nahi dekhte (N9).
   - **Data kahan se aata hai.**
     - Sirf sarkari downloads se: LGD (states, districts, sub-districts), India Post (PIN codes), aur LGD "Villages with PIN Codes" (kaunsa PIN kis sub-district me hai).
     - Aap quarter me ek baar ye files haath se download karte hain.
     - Laptop ki script unse repo me ek saaf file banati hai, aur import us file ko MongoDB me likhta hai.
   - **Ek PIN do districts me ho to.**
     - District kaun tay kare (India Post ke delivery offices ya LGD ke gaon), ye aapka faisla hai (L20).
     - Do sources alag **state** bataayein aur gaon ka saboot pakka ho, to import ruk jaata hai, kyunki state se GST tay hota hai.
     - Ek bhatka hua gaon import nahi rokta; us PIN pe sirf flag lagta hai.
   - **Shak wale PIN.**
     - Unpe "review flag" lagta hai.
     - Planner ya to **confirm** karta hai ("sarkari district sahi hai"), ya **override** karta hai ("doosra district"). Dono audit me jaate hain.
     - Confirm kiya hua PIN review me tabhi wapas aata hai jab sarkari **district** badle. Agar sirf sub-district badle (jaise kinare ke PIN me gaon ki ginti thodi badli), to confirm bana rehta hai.
   - **Override ke baad sarkari data badle to.**
     - Override bana rehta hai.
     - Par PIN "sarkari data badla" flag ke saath review list me wapas aa jaata hai, taaki koi dobara dekh le.
     - Ye flag agle import me bhi bana rehta hai; sirf koi insaan hi use hata sakta hai.
2. **T4.1 PR E Area settings batata hai "yahan ke niyam kya hain?"**
   - Global cut-off 14:00 hai, aur maan lijiye Pune district ne 13:00 rakha hai. To 411038 ka jawab: "13:00, Pune district se, version 1".
   - Nashik ke PIN ka jawab: "14:00, global se".
   - Master MH ke orders rok de, to MH ke saare PIN ruk jaate hain. Koi district khud ko wapas chalu nahi kar sakta.
3. **T4.3 Network batata hai "deliver kar sakte hain, aur kab tak?"**
   - 411038 → Kothrud–Warje hub → Chakan warehouse se lane (0 din) → cut-off 13:00 (upar wala Pune ka niyam; warehouse ka dispatch cut-off 16:00 baad me aata hai, to 13:00 hi lagta hai).
   - Jawab: "1:00 pm se pehle order kiya to Tue, 17 Nov; baad me kiya to Wed, 18 Nov".
   - Ye tabhi chalta hai jab state, district aur PIN teeno LIVE hon. LIVE sirf T4.4 ke `goLive` se hota hai.
   - Master app ke Staff page me ab hub ka naam chun ke grant diya ja sakta hai: "Priya → Hub Manager → Kothrud–Warje" (N16). Table me bhi hub ka naam dikhta hai, "1 hub" nahi. Aaj wahan ye option band hai.

### 0.3 Area settings: delivery promise ka example

Settings chaar levels pe save ho sakti hain: global → state → district → PIN code. Jawab hamesha "value + kahan se aayi" hota hai.

| Level | Cut-off | Last-mile | Holidays |
|---|---|---|---|
| Global | 14:00 | 1 din | 26 Jan, 15 Aug, 2 Oct |
| State `MH` | (kuch nahi) | (kuch nahi) | 1 May |
| District Pune | 13:00 | (kuch nahi) | Ganesh Visarjan; "1 May open" |

411038 (Pune) ke liye resolver ka jawab:
- cut-off: **13:00, Pune district se** (sabse paas wala level jeetta hai);
- last-mile: **1 din, global se**;
- holidays: 26 Jan, 15 Aug, 2 Oct aur Visarjan band; **1 May khula** (Pune ka "open" MH ke "band" ko us date pe harata hai).

Promise pe asar (Mon 16 Nov 2026, Chakan se city hub tak lane 0 din, warehouse dispatch cut-off 16:00, to asli cut-off = 13:00 aur 16:00 me jo pehle = 13:00):
- 12:30 pm pe order → dispatch Mon → hub Mon → last-mile 1 → **Tue, 17 Nov**.
- 1:30 pm pe order (cut-off ke baad) → dispatch Tue → **Wed, 18 Nov**.
- Agar Tue 17 Nov Pune ki holiday hoti (aur cut-off 14:00 hota), to Mon 1:30 pm ka order → dispatch Mon → Tue skip → **Wed, 18 Nov**.

Switch ka example: Master `MH` pe `orders.paused` lagata hai → Pune samet MH ke saare PIN PAUSED. Pune "false" bhej ke khud ko chalu nahi kar sakta (400); MH ka switch hatana padta hai.

### 0.4 Serviceability ka jawab: example

Riya 411038 check karti hai (Pune LIVE hone ke baad). Public API ka jawab (values illustrative; asli shape contract me banegi):

```json
{
  "pincode": "411038",
  "state": { "code": "MH", "name": "Maharashtra" },
  "district": { "id": "<ObjectId hex>", "name": "Pune" },
  "status": "SERVED",
  "promise": { "orderBy": "<aaj 13:00 IST>", "ifOrderedBefore": "<Tue 17 Nov>", "ifOrderedAfter": "<Wed 18 Nov>" },
  "upiOnDelivery": { "allowed": true, "maxOrderPaise": 500000 },
  "notifyMe": false,
  "checkedAt": "<abhi>"
}
```

Customer ko dikhta hai: "Delivery by Tue, 17 Nov if you order in the next 2 h 30 min". Hub ka naam public jawab me nahi aata (N6); checkout order banate waqt Mongo se dobara check karta hai.

Doosre jawab:

| Jawab | Kab | Example |
|---|---|---|
| `SERVED` | state, district aur PIN teeno LIVE; hub, lane aur warehouse ACTIVE | 411038 go-live ke baad |
| `COMING_SOON` | koi level READYING | Pune, Door B ke baad aur go-live se pehle |
| `NOT_SERVED` | koi level CLOSED/PLANNED, ya PIN ka area doc hi nahi | Nashik ka PIN aaj |
| `PAUSED` | koi level PAUSED, ya kisi bhi level pe `orders.paused` | MH pause, ya Bhor hub baadh me band |
| `NOT_DELIVERABLE` | PIN me sirf non-delivery offices (L5) | `deliverable=false` wala PIN |
| 404 `PINCODE_NOT_FOUND` | India Post me ye PIN hai hi nahi | 999999 |
| 400 | galat format | '41104', 'abcdef' → "Enter a valid 6-digit PIN code" |
| 503 `SERVICE_BUSY` | is route ka Mongo read budget khatam (N17) | bot ki bheed → "Please try again in a moment" |

### 0.5 Kaam ka order

- **Step 0:** aap §1 ke faisle dete hain aur §2 ke downloads karte hain.
- **T4.2 Location:** 6 PR (PR 1–6) + aapka live import.
- **T4.1 PR E:** 1 PR (PR 7).
- **T4.3 Network:** 7 PR (PR 8, 9, 10, 10b, 11, 12, 13) + aapka live seed.
- Pura PR breakdown §8 me.

---

## 1. Owner ke faisle (kuch bhi chupchaap tay nahi hota)

Har row me ek salah (recommendation) hai. Har table ke upar likha hai ki jawab kis PR se pehle chahiye.

### 1.1 T4.2 Location

Jawab kab chahiye:
- T4.2 PR 1 se pehle: L13, L15, L20 aur L22 ko chhod ke baaki sab.
- PR 5 se pehle: L13, L15 aur L22.
- PR 2 me: L20 ka pakka jawab, asli numbers dekh ke.

| # | Sawal | Options | Meri salah | Kyun |
|---|---|---|---|---|
| L1 | States, districts aur sub-districts ki list kahan se aaye? | (a) LGD portal (captcha, XLS) (b) data.gov.in ka LGD mirror (CSV) | (a). Mirror sirf **pehli** import ke liye, aur sirf tab jab portal band ho; report me "source: mirror" likha jaata hai. Re-import pe mirror kabhi nahi; portal ka intezaar | Mirror peeche hai: 785 vs 790 districts, rows 2024-10-07 ki. Re-import pe wo 2024 ke baad bane districts ko "retired" kar deta, aur hataye gaye districts (jaise "Jaipur (Gramin)") ko wapas le aata |
| L2 | LGD "Villages with PIN Codes" use karein? (har state ki ek file; sirf laptop pe, gaon DB me nahi jaate) | (a) saare 36 states (b) abhi sirf MH (c) nahi | (a) | Isme LGD codes hain, to naam se andaaza nahi lagana padta. PIN → sub-district ka sarkari link sirf yahi hai, aur 13 taluka hubs ko yahi chahiye. (b) baaki states ko kamzor chhodta hai; ye "baad me" jaisa hai, isliye iske liye aapki saaf OK chahiye |
| L3 | DB me kaunse levels jayein? | (a) district, sub-district aur PIN (+ offices, centre point); states `INDIAN_STATES` me hi rahein (b) gaon aur blocks bhi | (a) | Gaon ≈ 115 MB, yaani M0 ka ~22%, aur abhi unka koi kaam nahi |
| L4 | Post office ke naam DB me rakhein? | (a) haan (~9.6 MB) (b) nahi | (a) | Address form PIN ke neeche "Kothrud, Erandwane …" dikhata hai, taaki customer jagah pehchaan le |
| L5 | Jis PIN me sirf non-delivery offices hon? | (a) `deliverable=false` ke saath import (b) chhod do | (a) | Customer ko "is PIN pe delivery nahi hoti" dikhega, "anjaan PIN" nahi |
| L6 | Army Postal Service ke PIN (9xxxxx)? | (a) chhodo, aur ginti report me (b) non-deliverable ki tarah import | (a) | Ye jagahein nahi hain; koi hub inhe serve nahi kar sakta |
| L7 | PIN do states me ho (jaise 396230: Gujarat + DH), to checkout kaunsa state le? (T7.2 me banega, uski line me likha jayega) | (a) primary state pehle se bhara; customer sirf us PIN ke record wale doosre state pe badal sake; serviceability aur GST chuna hua state lein (b) sirf primary (c) aisa PIN kabhi serve nahi | (a) | GST place of supply asli state ka hona chahiye; allowed list input ko safe rakhti hai |
| L8 | Raw downloads kahan rahein? | (a) repo ke bahar, ek **private shared folder** me jo dono developers khol sakein (public repo me kabhi nahi); manifest me har file ka sha256 aur dates; `prepare` hash milata hai (b) repo me commit (~70 MB har baar) | (a) | Saaf data aur hash review ke liye kaafi hain. Shared folder se doosra developer bhi alias theek karke `prepare` dobara chala sakta hai (baari-baari kaam) |
| L9 | Seeds aur tests jagahon ko kaise naam dein (laptop, CI, live)? | (a) LGD code / PIN code se; ObjectId har DB me dhoondha jaaye (b) pehle se tay ObjectIds | (a) | "Naam ek alag unique field me" wala niyam |
| L10 | Velhe → Rajgad | (a) jo naam LGD de wahi dikhao; purana naam `formerNames` me search ke liye; PRD §7.5 me "Rajgad (formerly Velhe)" (b) "Velhe" hi rakho | (a) | Sarkari naam Aug 2025 me badla hai |
| L11 | Shehar ke PIN ka sub-district | (a) khaali, jab tak koi set na kare (b) LGD ki urban mappings bhi download karo | (a) | Shehar ke hub doori se chune jaate hain, aur kinare wale PIN aap khud dekhte hain (N9). Sub-district ka abhi koi business kaam nahi |
| L12 | Re-import kisi PIN ka district badal de | (a) Neeche "L12 (a) detail" dekhein (b) har move aapki approval ke liye ruke | (a) | Ruke hue moves ko koi nahi dekhta aur wo pade-pade sadte hain. LIVE guard served areas ko bachata hai |
| L13 | PIN ka district kaun confirm ya override kare, aur step-up kab? | (a) Logistics Head (global) aur Network Planner (state ya global); state planner sirf apne state ke andar (target district bhi); Master nahi. **Confirm** ("sarkari district sahi hai") bina step-up; **override** (doosra district) har baar step-up (authenticator) (b) dono pe step-up (c) kisi pe step-up nahi; ya + Master bhi | (a) | PRD ke hisaab se PIN master planner sambhalta hai. Override PIN ka state, yaani GST bhi, badal sakta hai (RULES §7.1: sensitive). Confirm kuch nahi badalta. Step-up route pe lagta hai (route.stepUp = permission.mfa), isliye do routes |
| L14 | Do tarah ke sudhaar | (a) naam ke facts (purane naam, split naam, PIN facts) repo ki `aliases.json` me, PR me review hokar; business choices DB me, audited API se (b) sab kuch DB me | (a) | Facts har re-import me bache rehte hain aur public hain; business choices audited rehti hain |
| L15 | Screens kab banein, aur logistics app ka sign-in kab? | (a) logistics app ka sign-in + account ek alag chhote PR me, T4.2 ke PIN-review PR se **pehle** (T6.5 ka hissa aage khincha); PIN review/override page usi PR ke saath, area settings page PR E ke saath, network pages T4.3 me (b) APIs abhi, saare pages T4.3 ke aakhri PR me; tab tak T4.2 aur T4.1 `[~]` rahenge | (a) | Override, cut-off aur UPI cap ke routes sirf logistics app se chalte hain. Bina sign-in koi bhi inhe asli user flow se check nahi kar sakta (RULES §1.5, §6.4), to `[x]` nahi ho sakta. Saath me T4.3 ka aakhri PR chhota ho jaata hai |
| L16 | Import ki safety limits | (a) Neeche "L16 (a) detail" dekhein (b) doosre numbers | (a) | Naapi hui zaroorat ~20–22 MB hai. 512 MB poore cluster ki seema hai (audit, identity, outbox sab milake). Import wala bq-core user baaki databases ka size nahi padh sakta (`bq_audit` me uske paas sirf insert, find, createIndex, listIndexes hain), isliye Atlas ka number aap se liya jaata hai. Retire guard kati hui download pakad leta hai |
| L17 | Re-import kitni baar ho? | (a) quarter me ek baar, aur jab kisi live area ke paas rename ya split ho (b) har mahine | (a) | India Post ki "monthly" file aakhri baar 10/08/2026 ko update hui thi. Har run me ~40 captcha downloads lagte hain |
| L18 | ARCHITECTURE §6.1 me `collections-budget` CI check likha hai, par code me hai nahi | (a) T4.2 PR 3 me banao (saare DBs me 400 se zyada collections hon to test fail) (b) doc theek karo | (a) | T4.2 + PR E + T4.3 milke 13 collections jodte hain (12 core + 1 identity). Doc wo guard na bataye jo hai hi nahi |
| L19 | Data attribution (licence iski maang karte hain) | (a) `SOURCE.md` + customer credits page pe "Data sources" section (b) sirf SOURCE.md | (a) | GODL attribution maangta hai; LGD publish karne pe prominent acknowledgement maangta hai. Text saaf kehta hai ki kuch PIN ka district hamare staff ne haath se set kiya hai (§3.2) |
| L20 | Kisi PIN ka district kaun tay kare? | (a) **Delivery offices** (detail neeche "L20 (a) detail" me) (b) **Gaon pehle** (LGD codes), phir delivery offices (pichhla draft) | (a). PR 1 dono order banata hai (`rules.json` me ek switch). REPORT state-wise do cheezein ginta hai: kitne PIN dono order me alag district paate hain, aur kitne PIN alag-alag thresholds (1/3/5 gaon; 25/50/75%) pe import rokte. Asli numbers dekh ke aap PR 2 me order aur threshold pakka karein | Neeche "L20 kyun" dekhein |
| L21 | Import ka audit kitna? | (a) Neeche "L21 (a) detail" dekhein (b) har batch ki ek entry (~550 entries per import) | (a) | Audit 400 din ka security log hai, aur ek import ek hi kaam hai. Detail change rows me rehti hai. Guard todna baad me bhi saabit ho sake. Jawab MEMORY aur RULES §4.3 me likha jayega |
| L22 | Go-live checklist ke "saare PIN mapped" ka matlab (ARCHITECTURE §8.7) | (a) Neeche "L22 (a) detail" dekhein (b) flags go-live nahi rokte (c) confirm = usi district ka override (hamesha ke liye jama) | (a) | Shak wala PIN tabhi live ho jab kisi insaan ne use dekha ho. Sirf sub-district badalne se GST, hub ya scope nahi badalta, isliye confirm nahi tootta. (c) aage aane wale sarkari sudhaar ko hamesha ke liye rok deta |

**L12 (a) detail.**
- Sarkari data lagu hota hai, jab tak kisi insaan ne override ya confirm na kiya ho. Chalane wala pehle dry run padhta hai.
- "Move" ka matlab hai **asli (effective) district ka badalna**.
- Override wale PIN ka sirf sarkari district badle, to override rehta hai. Report me `sourceMoved` aata hai aur PIN pe `OFFICIAL_MOVED` flag lagta hai, par import nahi rukta. Ye flag agle imports me bhi rehta hai, jab tak koi insaan confirm ya override na kare.
- Override wala district LGD me retired ho jaaye, to override hat jaata hai aur PIN dobara review list me aata hai (`OVERRIDE_DROPPED`).
- Confirm kiya hua sarkari **district** badle, to confirm khatam ho jaata hai. Sirf sub-district badle, to confirm rehta hai aur uska sub-district naya ho jaata hai.
- Network banne ke baad kuch badlav import rok dete hain, jab tak `--accept-live-changes` aur `--note` na diye jaayein. Ye wo badlav hain jo kisi non-CLOSED area ko chhoote hain: move, retire, non-deliverable, state badla, override hata.

**L16 (a) detail.**
- Location collections ≤ 40 MB (import yahan rukta hai). CI ka full-data test pehle hi 30 MB pe fail hota hai, taaki badhat jaldi dikhe.
- Live pe aap Atlas page ka "Logical Size" type karein. Wo + import ki badhat ≤ 400 MB ho (Atlas alert wali seema), warna stop.
- Ye retire ho rahe hon to stop: 1% se zyada PIN, 2 se zyada districts, ya poora state. Aage badhne ke liye `--allow-retire <n>` aur `--note` chahiye. Mirror source pe ye flag kabhi nahi chalta.

**L20 (a) detail.**
- **District:** jis district me PIN ke zyada delivery offices hon, wahi. Is district ko "office winner" kehte hain. Jis PIN me ek bhi delivery office nahi (L5), wahan saare offices gine jaate hain.
- **LGD ke gaon** teen kaam karte hain:
  - us district ke andar sub-district chunte hain;
  - barabari todte hain;
  - tab faisla karte hain jab India Post ka district naam split ke baad do-arthi ho (jaise "Mumbai", "East Godavari").
- **Dono sources alag state bataayein, aur gaon ka saboot pakka ho**, to prepare ruk jaata hai, jab tak `aliases.json` me us PIN ka fact na likha jaaye.
  - Pakka saboot = us state me PIN ke kam se kam 3 gaon, **aur** PIN ke aadhe se zyada gaon. Dono numbers `rules.json` me hain.
- **Saboot kamzor ho** (jaise 1 bhatka hua gaon):
  - office winner wala state rehta hai;
  - PIN pe `MULTI_STATE` + `SOURCES_DISAGREE` flag lagta hai, jo go-live se pehle kisi insaan ko dikhega (L22);
  - (b) wale order me bhi district usi state ke districts me se dobara chuna jaata hai.

**L20 kyun.**
- Gaon aur post office alag cheezein ginte hain. Shehar ke kinare ka ek PIN lijiye (example): 5 delivery offices Thane me, aur 6 gaon Palghar me. (b) Palghar chunega, jabki delivery Thane se hoti hai.
- State se GST tay hota hai, isliye state ka pakka jhagda kabhi chupchaap nahi suljhta.
- Par ek galat mapped gaon poori import na roke. 396230 me 26 offices DH me hain; agar LGD me 1 gaon Valsad ka ho, to state DH rahega aur sirf flag lagega.

**L21 (a) detail.**
- Har import ki **ek** System entry. Fail ho to ek "failed" entry.
- Usme likha jaata hai:
  - source aur counts;
  - agar koi guard toda gaya (`--allow-retire`, `--accept-live-changes`), to wo flags;
  - kitne live areas chhoote (pehle 100 PIN ke saath).
- Guard toda gaya ho to `--note` zaroori hai.
- Har record ka badlav `location_import_changes` me hamesha ke liye rehta hai, usi batch ke transaction me.

**L22 (a) detail.**
- PIN tab mapped hai jab teeno baatein sach hon:
  1. wo deliverable hai aur retired nahi;
  2. wo apne district ke kisi hub pe assigned hai;
  3. ya to us pe koi review flag nahi, ya kisi insaan ne confirm/override kiya hai.
- Non-deliverable PIN ginti me nahi aate.
- Confirm ke baad sarkari **district** badle, to confirm khatam ho jaata hai. Sirf sub-district badle, to confirm rehta hai.

### 1.2 T4.1 PR E Area settings (jawab PR 7 se pehle; S9 PR 11 se pehle)

| # | Sawal | Options | Meri salah | Kyun |
|---|---|---|---|---|
| S1 | Code kahan rahe? | (a) naya core `network` module, PR E me sirf area settings ke saath; pure merge logic contracts me; `authorizeArea` helper platform authz me (b) platform kernel sab rakhe, location lookup inject karke | (a), aur ARCHITECTURE §4 ki rows update hon | ARCHITECTURE §4 pehle se "area settings" network ko deta hai. Network `location/index.ts` seedha import kar sakta hai; kernel ko dependency inversion karna padta. T4.3 isi module ko aage badhata hai |
| S2 | Levels kaise milte hain? | (a) Neeche "S2 (a) detail" dekhein (b) sab me paas wala jeete | (a) | (b) me district ki purani "paused=false" row Master ke state-level pause ko hara deti, aur har district ko poori national holiday list copy karni padti |
| S3 | PR E me kaunse keys aayein? | (a) Neeche "S3 (a) detail" dekhein (b) saare ~15 abhi | (a) | Key ki shakal uske asli use ke saath banti hai; har padhne wala task pehle se list me hai, to kuch "baad me" nahi chhoot-ta |
| S4 | Code ke defaults | (a) Neeche "S4 (a) detail" dekhein (b) doosre numbers | (a) | PRD sensible defaults maangta hai, numbers nahi deta; har area inhe badal sakta hai |
| S5 | Permissions | (a) Neeche "S5 (a) detail" dekhein (b) doosra bantwara: aap batayein kaunsa role kya badle | (a) | PRD lines 148/149/352: planner promise set karta hai, Logistics Head payment-on-delivery ke niyam, aur Master ke paas emergency switches |
| S6 | `orders.paused` (setting) vs area ka status PAUSED | (a) dono rahein: PAUSED area ko service se bahar karta hai, aur wapas aane ke liye goLive lagta hai; `orders.paused` naye orders ka jaldi wala emergency stop hai, area LIVE hi rehta hai (b) sirf ek | (a) | ARCHITECTURE me dono hain, par dono ka matlab nahi likha |
| S7 | PR E me UI? | (a) logistics app ka "Area settings" page PR E me hi (effective value, kahan se aaya, history, badlav); Master ke emergency switches ka page T10.4 me (us line me likha jayega) (b) koi page nahi | (a), agar L15 = (a) | Cut-off aur UPI cap ko asli user flow se isi page se check kar sakte hain. L15 (b) chuna to page T4.3 me jayega aur T4.1 `[~]` rahega |
| S8 | Near-expiry days (ARCHITECTURE §6.4: category-wise) | (a) area setting nahi; T8.2 me catalog/inventory setting (b) sirf global wali area setting, category map ke saath | (a) | Category-wise value area levels me fit nahi hoti |
| S9 | National holidays ki list kaun bharta hai, aur har saal kaun aage badhata hai? | (a) Neeche "S9 (a) detail" dekhein (b) har saal developer ek data PR banaye (c) koi global list nahi, har district khud bhare | (a) | Global list ke bina har promise national holidays bhool jaata, jaise hi Pune ke alawa koi district live hota. Page se jodna audited hai aur developer nahi chahiye; alert bhoolne nahi deta. Festival dates (jaise Visarjan) har saal badalti hain, isliye wo area level pe rehti hain |
| S10 | Area settings ki safety limits, aur purani history ka kya ho? | (a) Neeche "S10 (a) detail" dekhein (b) history kabhi na hatao; 150,000 pe sirf switches chalein, aur tab aap faisla karein (c) doosre numbers | (a) | Neeche "S10 kyun" dekhein |

**S2 (a) detail.** Teen tarah ke keys:
- *value:* sabse paas wala level jeetta hai.
- *switch* (`orders.paused`, `upi_on_delivery.blocked`): sirf "on" save hota hai, aur upar ka "on" neeche sab pe lagta hai.
- *dates* (holidays): date-wise milte hain, aur har date pe paas wala level jeetta hai.

**S3 (a) detail.**
- PR E me wo 8 keys jo T4.3/T7 padhte hain (§5.2).
- Baaki har key us task ke saath aati hai jo use padhta hai: go-live minimums aur waitlist weights T4.4 me, review SLA T4.5 me, max reattempts T8.4 me, near-expiry T8.2 me, gig/tax T9.3 me.
- Ye sab in task lines me PR 1 me likha jayega.

**S4 (a) detail.**
- Cut-off 14:00 IST, last-mile 1 din.
- Code me koi holiday nahi; national list data file se aati hai (S9).
- Weekly off koi nahi (7 din delivery).
- UPI on delivery chalu, cap ₹5,000; switches off.
- Poore system me max 20,000 saved values. Uske upar naya value 409 deta hai, M0 bachane ke liye.

**S5 (a) detail.**
- `network.area_setting.read`: Logistics Head, Planner, Master.
- `.manage` (cut-off, last-mile, holidays, weekly off): Logistics Head, Planner; bina step-up.
- `network.payment_rule.manage` (UPI on/cap): Logistics Head; step-up.
- `network.area_switch.set` (pause, UPI block): Logistics Head, Master; step-up.
- Har badlav pe reason chahiye (5–500 chars).

**S9 (a) detail.**
- T4.3 PR 11 ek data file (`backend/core/data/network/holidays-india.json`) se global level pe 2026 aur 2027 ke 3 national holidays bharta hai: 26 Jan, 15 Aug, 2 Oct (dummy policy).
- Ye write service se hota hai, yaani version, history, audit aur event ke saath.
- Har saal 1 December tak Logistics Head Area settings page se agle saal ki dates jodta hai.
- 1 December se ek daily check alert deta hai agar global list me agle saal ki ek bhi date nahi.

**S10 (a) detail.**
1. **Din ki seema:** ek setting (jaise Pune ka cut-off) din me max 20 baar badle. 21vi baar ye dikhta hai: "This setting was changed many times today. Try again tomorrow." Switches (pause, UPI block) pe ye seema nahi.
2. **History ki seema:** 60,000 rows pe alert. 150,000 pe cut-off, last-mile, holidays, weekly off aur UPI ke badlav ruk jaate hain; switches chalte rehte hain.
3. **History ki safai, abhi se tay:**
   - 60,000 rows ke upar daily task chalta hai.
   - Wo har setting ke **aakhri 50 versions** aur **pichhle 400 din** ke saare versions rakhta hai, aur baaki hatata hai.
   - Har safai ki ek System audit entry banti hai.
   - Ye PR E me hi banta hai.
4. **Holiday list:**
   - Save karte waqt 30 din se purani dates apne aap hat jaati hain. History me wo bachi rehti hain.
   - 60 dates ki seema bachi hui dates pe lagti hai.
   - Page pe ye likha hota hai.

**S10 kyun.**
- Pune ~5 badlav/din pe 60,000 rows ~33 saal me aati hain; poora India ~50/din pe ~3 saal me.
- Safai ka niyam abhi tay hai, to alert aane ke baad koi faisla baaki nahi.
- 400 din audit ki umar ke barabar hai, to "3 March ko kya tha" ka jawab audit window ke andar hamesha milta hai.
- Holiday example: Pune har saal ~15 dates jode, to bina safai 4 saal me 60 dates bhar jaati hain, aur uske baad har save fail hota.
- 20/din ki seema kisi script ki galti se M0 bharne nahi deti.

### 1.3 T4.3 Network

Jawab kab chahiye:
- PR 8 se pehle: N1–N3, N5–N14 aur N16.
- T4.4 se pehle: N4.
- PR 9 se pehle: N17.
- PR 11 se pehle: N9.
- PR 12 se pehle: N15.

| # | Sawal | Options | Meri salah | Kyun |
|---|---|---|---|---|
| N1 | Har hub ki ek city honi chahiye (shared-authz bina city ke hub mana karta hai). Taluka hubs ki "city" kya ho? | (a) Pune district me 2 records: "Pune" (8 city hubs) aur "Pune Rural" (13 taluka hubs) (b) ek city (c) 14 cities | (a) | 14 ki jagah 2 City Logistics Manager sign-off; city scope wale roles taluka hubs ko bhi cover karte hain |
| N2 | Identity grants me hub, city, warehouse aur district ids kaise jaanche? | (a) core chhote "place changed" events bhejta hai aur identity apni copy rakhta hai (b) identity core ko call kare (c) identity core ka DB padhe (d) koi bhi ObjectId maan lo | (a) | (b) aur (c) ARCHITECTURE §5.1/§6.1 todte hain; (d) me typo se bekaar grants bante. Identity ke pehle event subscription ka kaam lagta hai |
| N3 | Pune seed cheezein kis halat me chhode? | (a) hubs aur warehouse PLANNED, areas CLOSED; Master T4.4 me Door B se kholta hai (b) areas READYING | (a) | Seed koi business faisla nahi leta, aur M4 demo asli "do darwaze, ek gate" flow dikhata hai |
| N4 | Riders (T8.5), GST/TCS (T9.3) aur support coverage (T9.5) abhi nahi hain. M4 me Pune go-live checklist kaise pass kare? | (a) jab tak asli modules na aayein, audited manual-attestation items; T8.5, T9.3 aur T9.5 ki lines me likha jayega ki wo attestation ko asli check se badlein (b) Pune M8/M9 tak "Coming soon" (c) minimums 0 | (a) | Attestation pehle se predicate type ki list me hai; koi force-live nahi |
| N5 | T4.3 ka UI kitna? | (a) Neeche "N5 (a) detail" dekhein (b) sirf customer check | (a) | Go-live se pehle planner ko mapping dekhni aur theek karni hai |
| N6 | Public jawab me hub dikhayein? | (a) nahi (b) haan | (a) | Customer ko sirf served/date/UPI chahiye; network ka naksha private rehta hai |
| N7 | Public jawab CDN pe kitna taaza? | (a) `s-maxage 120`, `stale-while-revalidate 60`, tag purge nahi (b) 300 s + Vercel tag purge | (a) | Pause ~3 min me dikh jaata hai aur checkout Mongo dobara dekhta hai; purge ke liye naya secret chahiye aur Hobby pe check nahi hua |
| N8 | Ek hub kaunse PIN serve kare? | (a) sirf apne district ke; padosi district apne hub se khulta hai (b) koi bhi | (a) | "Saare PIN mapped" har district ki apni jaanch rehti hai |
| N9 | Pune ke PIN hubs ko kaise baante jayein? | (a) Suggestion script (detail neeche "N9 (a) detail" me) (b) sirf sub-district ka niyam (pichhla draft) (c) sirf nazdeeki hub | (a) | 411057 (Hinjawadi + Wakad) me Mulshi ke gaon hain, to (b) use Mulshi/Paud taluka hub de deta, jabki uska hub "Hinjewadi–Wakad" hai. 6/12 km sirf shuruaati numbers hain |
| N10 | Pune ke dummy values | (a) city hubs tak lane 0 din, taluka hubs tak 1 din; warehouse dispatch cut-off 16:00; area cut-off 14:00; last-mile 1; dummy Pune holiday list; UPI cap ₹5,000 (b) doosre | (a) | Test karna aur samjhana aasaan |
| N11 | ARCHITECTURE §8.6 "READY" likhta hai, jo **areas** ka koi status nahi | (a) area ke liye READY = checklist ka nateeja (saare PASS), save nahi hota; wording theek karo. Hubs aur warehouses ka READY alag hai: wo ek saved status hai (City Logistics Manager attest karta hai, §6.2) (b) areas ka naya status | (a) | Kam states, matlab wahi |
| N12 | PAUSED → LIVE | (a) sirf naye `goLive` check se (b) seedha resume button | (a) | Pause → badlav → resume checklist ko skip na kare |
| N13 | Area cut-off warehouse dispatch se late ho (area 18:00, warehouse 16:00) | (a) asli cut-off = dono me jo pehle (b) area wala jeete | (a) | Jo warehouse bhej hi nahi sakta, wo promise mat karo |
| N14 | Network kaun badle? | (a) Neeche "N14 (a) detail" dekhein (b) doosra bantwara: aap batayein kaunsa role kya badle | (a) | PRD ke roles se milta hai; role-name check nahi, sirf permissions |
| N15 | Guest ka PIN browser me yaad rakhein? | (a) nahi: sirf us visit ke liye memory me; sign-in customer ka PIN baad me uske address se (T7.2 ki line me likha jayega) (b) "aakhri check kiya PIN" ko UI preference maan ke `localStorage` me, aur ye chhoot RULES §5.9 me likhein | (a) | RULES §5.9: user data browser storage me nahi; localStorage sirf UI preferences ke liye. PIN jagah ka data hai. Keemat: har visit pe ek baar PIN likhna. Jawab aane tak kuch save nahi hoga |
| N16 | Logistics staff (Hub Manager, Warehouse Manager, City Logistics Manager …) ke grants kahan se diye jayein? Aaj Master Staff page pe district/city/hub/warehouse band hain ("Comes with the location master", T3.7 faisla 3) | (a) Neeche "N16 (a) detail" dekhein (b) Logistics Head ka Staff page bhi isi T4.3 me (Master ke staff components ek shared package me nikaal ke) (c) hamesha sirf Master | (a) | roles.ts me Hub Manager, Warehouse Manager aur City Manager ko Master aur Logistics Head dono de sakte hain, to M4 demo Master se chal jaata hai. T3.7 ka faisla 3 kehta hai ki ye pickers location master ke saath khulenge. Bina picker koi asli user grant check nahi kar sakta (RULES §6.4). (b) T4.3 ko aur bada karta hai |
| N17 | Public PIN check pe bheed (bot) aaye, to M0 ko kaise bachayein? | (a) Neeche "N17 (a) detail" dekhein (b) koi global seema nahi, sirf per-IP 120/min (c) requests gino (pichhla draft: 5 misses/s) | (a) | Neeche "N17 kyun" dekhein |

**N5 (a) detail.**
- T4.3 me banta hai:
  - customer PIN check;
  - network pages: areas, hubs aur unke PIN, PIN lookup, reassign, pause;
  - Master Staff place pickers (N16).
- PIN override aur area settings pages pehle hi aa chuke honge (L15, S7).
- Checklist screens T4.4 me aur zone editor T8.4 me (dono lines me likha jayega).

**N9 (a) detail.**
- PIN ka centre kisi city hub se ≤ 6 km ho, to use nazdeeki city hub milta hai, chahe sub-district kuch bhi kahe. Agar usme gaon bhi hon to `VILLAGES_IN_URBAN_PIN` flag lagta hai.
- Baaki PIN apne sub-district ke taluka hub pe jaate hain.
- In par flag lagta hai:
  - 6–12 km wale "kinare" ke PIN;
  - sub-district ki barabari;
  - bina centre point;
  - district ke bahar centre;
  - hub se > 25 km.
- Aap sirf flagged rows dekhte hain. Kinare ki list jaise 411057, 412207, 411028, 411048, asli file se.
- Nateeja seed file me likha jaata hai; seeding dobara andaaza nahi lagati.

**N14 (a) detail.**
- Hubs, cities, warehouses aur PIN assignment: Logistics Head + Planner (state).
- Lanes: upar wale + Line-haul.
- Pause: Logistics Head + Planner (state), step-up ke saath.
- Close: Logistics Head (global) aur Master, step-up ke saath.
- Padhna: upar wale + Hub/City/Warehouse managers aur Control Tower.

**N16 (a) detail.**
- T4.3 PR 10b me Master Staff page pe ye chaaron scopes khulte hain, naam se dhoondh ke chunne wale picker ke saath (identity ki copy se).
- People, Invitations aur audit ke table me jagah ka naam dikhta hai, aur band jagah "(closed)" ke saath.
- M4 me ye grants Master deta hai.
- Logistics Head ka apna Staff page logistics app me banega; ye T6.5 ki logistics line me likha jaata hai (M6, baaki logistics app ke kaam ke saath).

**N17 (a) detail.**
- Is route ke liye Mongo reads ka global budget: har second max 30 reads.
- Ek jawab me kitne reads lagte hain:
  - Redis me mila PIN: 0;
  - anjaan PIN: 1;
  - jahan service nahi: 2;
  - served PIN jo Redis me nahi: 6.
- Budget khatam ho to jawab hota hai "Please try again in a moment" (503), aur 5 second baad dobara try.
- Redis me pade PIN aur checkout pe koi asar nahi.

**N17 kyun.**
- (c) me sasti requests (anjaan PIN, 1 read) bhi gini jaati thi. 3 IPs ka bot sirf 6 reads/s me sabko "busy" dikha deta.
- *Example:*
  - Ek bot har second 20 anjaan PIN bhejta hai, yaani 20 reads.
  - Riya ka 411038 Redis me nahi hai, to use 6 reads chahiye. 20 + 6 ≤ 30, isliye Riya ko jawab milta hai.
  - Bot 30 reads/s tak pahunche (~15 IPs), to Riya ko "Please try again in a moment" dikhega. Checkout phir bhi chalta rahega.
- M0 pe is route ka bojh 30 reads/s se upar kabhi nahi jaata.
- (b) me bada bot M0 ke 100 ops/s tak pahunch ke checkout bhi dheema kar sakta hai.

---

## 2. Aapke haath ke kaam

Claude ye files kabhi download nahi karta aur in sites ke forms nahi bharta. Har download pe captcha hai, aur data.gov.in downloader ka apna naam aur email maangta hai.

**Kab:** T4.2 PR 1 se **pehle** ek baar, taaki PR 1 ka parser asli files ke headers se bane. Phir har quarter. Pehli baar ~1–1.5 ghanta lagega.

**Folder:** repo ke **bahar**, apne private shared folder me (L8), jaise `location-raw/2026-11-20/`. Har file **bina badle** save karein. (PR 1 repo me `raw/` ko gitignore bhi karega, safety ke liye.)

### 2.1 Downloads

**A. LGD ki lists (3 files):** https://lgdirectory.gov.in/downloadDirectory.do
1. "Download Directory (one entity at a time)" chunein.
2. Entity "All States of India", format "Xls Report". Captcha bharein (ya Audio Captcha), phir "Generate Report". `lgd-states.<jo extension aaye>` naam se save karein.
3. Yahi "All Districts of India" ke liye (`lgd-districts.*`) aur "All Sub-Districts of India" ke liye (`lgd-subdistricts.*`) karein.
4. **Sirf re-import pe:** districts aur sub-districts ke liye "Download Only Modifications" chunein, from-date = pichhli import, to-date = aaj. `lgd-mods-districts.*` aur `lgd-mods-subdistricts.*` naam se save karein.
5. **Har LGD file ko CSV banayein:**
   - LibreOffice Calc (ya Excel) me kholein.
   - Save As "Text CSV (UTF-8, comma)" chunein (Excel me: "CSV UTF-8 (Comma delimited)").
   - Original ke paas, usi naam + `.csv` se save karein. Original waisa hi rahe.
   - Ye ek step dono haalat me chalta hai, chahe ".xls" asli spreadsheet ho ya HTML table.

**B. India Post (1 file):** https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month
1. Page ki "Updated On" date likh lein.
2. CSV download pe click karein.
   - "Please login" aaye to sign-up aapki apni marzi hai.
   - "Download Purpose" me apna naam aur email bharein, aur non-commercial/education option chunein.
   - Mobile khaali chhodein, aur captcha bharein.
3. `indiapost-pincodes.csv` naam se save karein.

**C. LGD Villages with PIN codes (36 files, agar L2 = saare states):** https://www.data.gov.in/resource/local-government-directory-lgd-villages-pin-codes
- "Updated On" date aur resource ka **"Total records"** number likh lein. Is number se pata chalta hai ki koi file kati hui to nahi aayi.
- Har state ke liye: State Name chunein → "Preview & Download" → wahi dialog → `lgd-villages-pin/<state ka naam>.csv` naam se save.
- Jis state me gaon nahi, uski file khaali aa sakti hai. Wo theek hai.
- Saari files ek hi baithak me download karein, taaki sab ek hi version ki hon. Checker kul ginti ko "Total records" ke 99.9% se milata hai.

**D. Jaanch (DB ki zaroorat nahi):**
- **PR 1 se pehle:** folder developer ko dein. Claude sirf headers aur kuch rows padh ke PR 1 ke fixtures aur column lists banata hai.
- **PR 1 ke baad:** `npm run db:locations -- prepare --raw <folder>` chalayein.
  - Ye dates aur total records poochhta hai, aur har file ka hash banata hai.
  - Phir ya to saaf dataset aur `REPORT.md` likhta hai, ya ek saaf sudhaar wala message de ke ruk jaata hai.
- Dated folder ka zip shared folder me rakhein.

### 2.2 Kuch gadbad ho to

Checker file ke pehle bytes dekhta hai, naam nahi.

| Kya aaya | Checker kya karta hai |
|---|---|
| ".xls" jo asal me HTML hai (shuru me `<`), asli XLS/XLSX/ODS (`D0 CF 11 E0` / `PK`), PDF ya ODT | Rukta hai aur kehta hai "LibreOffice me kholo → Save As Text CSV (UTF-8, comma) → same naam + .csv → dobara chalao". PDF ke liye kehta hai "Xls Report me dobara download karo" |
| Header ke upar title rows, neeche footer rows, 2 row ka header | Pehli 20 rows me jaane-pehchane column naam se header dhoondhta hai, 2 row wale header jodta hai, aur jis row ka code poora number nahi wahan rukta hai |
| Columns ke naam ya order badle (portal vs mirror), extra columns | `rules.json` ki band list se milata hai; extra columns chhod deta hai; zaroori column na ho to rukta hai aur mile hue vs chahiye columns dikhata hai |
| UTF-8 BOM ke saath, UTF-16 (BOM `FF FE`), CRLF, `;` ya tab separator | Apne aap pehchaanta hai |
| Windows-1252 ya tooti UTF-8 (U+FFFD) | Line number aur "Save As CSV UTF-8" wala sudhaar bata ke rukta hai |
| Zip | Rukta hai: "usi folder me unzip karo" |
| Error ya captcha ka page save ho gaya | Zaroori columns wali table nahi milti: "ye error page hai, dobara download karo" |
| Kati hui download (India Post ya koi village file) | Ye checks rokte hain: count bounds, village checks (kul ginti ≥ 99.9%; har state ke sub-districts me gaon milne chahiye; gol ginti jaise 10,000 pe shak) aur retire guard. Kuch nahi likha jaata. Ye checks pehli import pe bhi chalte hain |
| LGD portal band ya captcha tootta hua | **Sirf pehli import pe:** data.gov.in ke LGD mirror CSVs; report me "source: mirror (may be behind)". Re-import pe intezaar karein |
| data.gov.in band | Intezaar karke dobara try. **Koi unofficial mirror kabhi nahi** |
| Kuch village files nahi mili | Missing states ki list ke saath warning; un states me India Post ke naam use hote hain |
| Aap data.gov.in account nahi banana chahte aur download login maangta hai | T4.2 ruk jaata hai, kyunki India Post ka koi doosra sarkari source nahi. Claude bata ke ruk jaata hai |

### 2.3 Live pe aapke kaam (detail §3.9 aur §8 me)

- **T4.2 live import** (PR 1–6 merge, release aur deploy ke baad): Atlas Network Access me temporary IP entry, Atlas ka "Logical Size" note karna, `diff --env live` padhna, `apply --env live --note "<sources aur dates>"`, Logical Size aur `live` type karna, raat ko (IST) chalana (~10–11 min), checks, IP entry hatana.
- **T4.2 live checks:** logistics app me ek asli confirm aur ek asli override (step-up ke saath).
- **PR E live check:** logistics app me cut-off badalna, UPI cap badalna (step-up), aur Logistics Head se ek switch (step-up).
- **T4.3 live:** `db:seed-network --env live --file pune`, phir `--file holidays-india`; customer check T4.4 tak `NOT_SERVED` dikhaye (seed PIN areas CLOSED chhodta hai, N3; "Coming soon" Door B ke baad, T4.4 me); logistics network pages asli sign-in se; Master app me picker se asli hub grant.
- **Har quarter:** downloads + re-import (L17). Kisi live area ke paas rename ya split ho to bhi.
- **Har saal 1 December tak:** agle saal ki national holidays Area settings page se (S9; ye Logistics Head ka kaam hai).
- **Sirf identity DB reset ke baad:** `npm run db:resend-places --env live`.

---

## 3. T4.2 Location: design

### 3.0 Kya milega (lakshya)

- Pehle din poora India:
  - 36 states/UTs, jo `INDIAN_STATES` me hi rehte hain aur unme `lgdCode` judta hai;
  - lagbhag 790 LGD districts aur 7,112 LGD sub-districts;
  - lagbhag 19.6k India Post PIN codes, har ek ke post offices, delivery haan/nahi aur ek centre point ke saath.
- Har record ka stable ObjectId aur ek natural key (LGD code, ya 6-digit PIN code).
- Har PIN code theek ek district ki taraf point karta hai, owner ke chune vote order se (L20). Shak wale case review flags ke saath import hote hain, kabhi chupchaap nahi.
- Re-import:
  - pehle dry-run diff dikhata hai;
  - kabhi delete nahi karta;
  - ids nahi badalta;
  - sirf badla hua likhta hai;
  - crash ke baad khud theek ho jaata hai, kyunki derived fields hamesha data se dobara nikaale jaate hain;
  - wo review flags bachata hai jo sirf insaan hata sakta hai.
- Koi insaan PIN ka district audited APIs aur logistics page se confirm ya override kar sakta hai (L13, L15, L22).
- *Example (illustrative):* 412213 ke offices Bhor aur Rajgad me hain, dono Pune district me, to district dono taraf se Pune hi. Gaon: Bhor 30, Rajgad 12, to sub-district Bhor aur Rajgad `alsoIn` me. Flag nahi, kyunki runner-up ke paas 29% hai, 40% se kam. 30 vs 25 hota to PIN pe `SUBDISTRICT_CLOSE_VOTE` lagta aur wo insaan ke paas jaata.

### 3.1 Levels

- **State:** `INDIAN_STATES` me hi rehta hai (contracts `states.ts`, 36 rows, codes jaise `MH`) aur isme `lgdCode` field judti hai, jo LGD file se copy hoti hai, haath se kabhi type nahi. States ka koi collection nahi.
- **District:** lagbhag 790 rows.
- **Sub-district** (taluka/tehsil/mandal; LGD sabko "Sub-district" kehta hai): lagbhag 7,112 rows.
- **PIN code:** lagbhag 19.6k rows, embedded offices aur ek centre point ke saath.
- **Save nahi hote:** gaon, blocks, panchayats, local bodies.

### 3.2 Repo me files (`backend/core/data/location/`, committed)

| File | Kya |
|---|---|
| `SOURCE.md` | Hinglish doc, status header (version + date) aur change log ke saath (har snapshot ki ek line). Isme: sources aur licences; attribution text (verbatim, neeche); download steps (§2) aur refresh steps; dekhe gaye file formats. Naamon ka varnan waisa hi jaisa ARCHITECTURE:321 me hai; columns ke baare me koi extra note nahi |
| `manifest.json` | Snapshot date. Har raw file ke liye: role, URL, site ka "Updated On", download ki date, sha256, rows aur source (`portal`/`mirror`). Village resource ka "Total records". Har output file ke liye: sha256 aur rows |
| `districts.ndjson` | Har LGD district ki ek line, code se sorted: `{"lgd":<int>,"state":"MH","name":"Pune","formerNames":[]}` |
| `subdistricts.ndjson` | `{"lgd":<int>,"district":<int>,"name":"Haveli","formerNames":[]}` |
| `pincodes.ndjson` | `{"pin":"411038","district":<int>,"subDistrict":null,"evidence":"postOffices","alsoIn":[],"review":[],"deliverable":true,"at":[73.81,18.50],"offices":[["Kothrud","SO",true],…]}` |
| `aliases.json` | Naam ke facts; har entry me `note` aur `source`. Neeche "aliases.json ke hisse" dekhein |
| `rules.json` | Har tunable number aur list. Neeche "rules.json me kya" dekhein |
| `REPORT.md` | `prepare` banata hai; header me snapshot ka version aur date, aur likha hota hai ki ye generated hai. Neeche "REPORT.md me kya" dekhein. Har baar overwrite hota hai; history git rakhta hai, aur SOURCE.md ka change log har snapshot ki ek line rakhta hai |

**aliases.json ke hisse:**
- `states`: purana state naam key → INDIAN_STATES id.
- `districts`: us state se keyed jo India Post batata hai. Examples: `MH.ahmednagar → <LGD code>`; list ka matlab split, jaise `MH.mumbai → [Mumbai, Mumbai Suburban]`. Target doosre state me bhi ho sakte hain, jaise `JK.leh → [<Ladakh codes>]`.
- `pincodes`: public PIN → district facts, split names aur cross-state jhagdon ke liye.
- `replacements`: purana LGD code → naya, sirf tab jab LGD kabhi re-code kare.
- Sources:
  - PIN fact ka `source` snapshot ki apni files ka naam leta hai (`"India Post directory <Updated On> + LGD villages <Updated On>"`), aur uska `note` un offices aur village codes ka naam leta hai jinhone faisla kiya;
  - name aliases gazette ya news URL dete hain.

**rules.json me kya:**
- count bounds; India box; coordinate radius rule; close-vote ratio; skip prefixes (`9`);
- `districtVote` (`"deliveryOffices"` ya `"villages"`, L20 ke hisaab se) aur `crossStateStop {minVillages: 3, minShare: 0.5}` (L20);
- delivery variants ("Delivery"/"Non Delivery"/"Non-Delivery");
- office-type variants: HO/H.O/G.P.O → HO; SO/S.O/**PO** → SO; BO/B.O/"Branch Office directly a/w Head Office" → BO;
- har file ke column names, har ek asli file ke exact header text se mapped (`name` bhi);
- `villageChecks {totalShare: 0.999, subDistrictCoverage: 0.9, coverageExceptions: [{state, note}], roundCounts: [10000, 20000, 50000, 100000], roundCountOk: [{state, rows, note}], previousShare: 0.98}`;
- mirror rule.

**REPORT.md me kya:**
- counts; delivery aur office-type ki alag-alag values, counts ke saath;
- har district ke coordinate nulls;
- har state ki village coverage, aur har state ki wo village rows jinka district column portal parent se alag hai ya jinka sub-district code retired hai;
- har state ka vote-order comparison (L20);
- 1/3/5 gaon aur 25/50/75% pe cross-state stop ki ginti;
- warnings; review list; pichhle snapshot se diff.

Commit nahi hota: `raw/` (`.gitignore` me, safety net ke liye; raw files shared folder me rehti hain, L8). Generated NDJSON/JSON files `.prettierignore` me jaati hain.

Ye data files `src/` ke bahar hain, isliye `bq/no-hardcoded-geo` inpe nahi lagta, aur koi jagah ka naam kabhi TypeScript me nahi jaata. Har parsed row `@beautinique/shared-zod` ke zod schema se guzarti hai, PIN codes ke liye `pincodeZod` (RULES §3).

**Attribution text** (SOURCE.md aur credits page; dates §2 se aati hain), verbatim:
- "Department of Posts, 2026, All India Pincode Directory till last month, Open Government Data Platform India, <dd/mm>, https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month. Published under Government Open Data License - India: https://www.data.gov.in/Godl."
- "Ministry of Panchayati Raj, 2026, Local Government Directory (LGD) - Villages with PIN Codes, Open Government Data Platform India, <dd/mm>, https://www.data.gov.in/resource/local-government-directory-lgd-villages-pin-codes. Published under Government Open Data License - India: https://www.data.gov.in/Godl."
- "States, districts and sub-districts: Local Government Directory (LGD), https://lgdirectory.gov.in/ (downloaded <date>), reproduced under https://lgdirectory.gov.in/copyRightPolicy.do."
- "Beautinique is not endorsed by the Department of Posts or the Ministry of Panchayati Raj. Our name corrections are listed in aliases.json; for some PIN codes our staff have also set the district by hand."

LGD ke naam exactly waise save hote hain jaise file ka name column deta hai. Sirf itni safai: NFKC normalisation, trim aur double spaces ek, aur zero-width characters hatana. Isse "reproduced accurately" wali shart poori rehti hai.

### 3.3 Prepare (laptop, bina database; same input se byte-identical output)

`npm run db:locations -- prepare --raw <folder>`. Logic `backend/core/src/modules/location/prepare.ts` me hai: ek pure function, bina DB.

**Kisi bhi naam ki matching key:** NFKC, lower case, `&` → `and`, shuru ka `the ` hatao, sirf `a-z0-9` rakho. Isse "AHMED NAGAR", "Ahmed Nagar" aur "Ahmednagar" teeno `ahmednagar` bante hain. **Koi automatic fuzzy matching nahi**; paas wale match report me sirf *suggest* hote hain.

**Steps:**

1. **Format aur parse.**
   - Bytes sniff karo (§2.2 ki table).
   - Repo ka apna RFC 4180 CSV reader, koi nayi dependency nahi. npm ka `xlsx` package kabhi nahi: 0.18.5 me CVE-2023-30533 aur CVE-2024-22363 hain.
   - Header aur footer dhoondho, phir har row zod se check karo.
2. **States.**
   - Exactly 36 rows, key ya `aliases.states` se `INDIAN_STATES` se ek-ek karke match. LGD "The Dadra And Nagar Haveli And Daman And Diu" likhta hai.
   - Pehli run: `states.ts` ke liye 36 LGD codes print karo. Baad ki runs: codes `states.ts` ke `lgdCode` ke barabar hone chahiye.
   - Kuch aur ho to run ruk jaati hai. Dhyan rahe: LGD code GST code nahi hai (AP: LGD 28, GST 37).
3. **Districts aur sub-districts.** Codes unique hon aur parent jaana-pehchana ho; naam ≤ 80 chars.
   - **Stop** agar ek state ke do live codes (ya ek district ke do sub-districts) ki matching key same ho.
   - Pichhle committed snapshot se tulna:
     - same code, naya naam → `RENAMED` (purana naam `formerNames` me; record kabhi dobara nahi banta);
     - same code wala sub-district naye district ke neeche → `REPARENTED`;
     - same code wala district naye state me → `STATE_CHANGED`;
     - code gayab → `RETIRED`;
     - code wapas aaya → `RESTORED`.
   - LGD modifications files hon to renames unse cross-check hote hain.
4. **Village evidence (L2).**
   - Har row ek PIN code, ek district code aur ek sub-district code deti hai. **District hamesha is snapshot ki portal sub-district file me us sub-district code ka parent hota hai, row ka district column kabhi nahi.** Village resource ki apni "Updated On" date hai. To agar village file export hone ke baad LGD ne koi sub-district naye district me daala, to uske gaon phir bhi naye district ko vote dete hain.
   - Har (PIN, district, sub-district) ke gaon gino.
   - Kharab PIN code, ya anjaan ya retired sub-district code wali rows skip aur gini jaati hain.
   - REPORT har state ke liye gin ke batata hai: kitni rows ka district column portal parent se alag tha, aur kitni rows retired code ki wajah se skip hui.
   - Aisi row wale har PIN pe prepare flag `VILLAGE_CODES_STALE` lagta hai, taaki go-live se pehle koi insaan use dekhe (L22).
     - *Example:* Ladakh ka ek sub-district April 2026 me Leh se ek naye district me gaya, par village file ab bhi Leh kehti hai. Uske gaon naye district ko vote dete hain, aur un PIN codes pe flag lagta hai.
   - **Truncation checks** (thresholds `rules.json` ke `villageChecks` me; har fail hone wala state ek hi stop me list hota hai):
     - har file poori row pe khatam ho;
     - kul rows manifest ke "Total records" ka ≥ 99.9% hon (saari files ek baithak me, §2.1 C);
     - **coverage, jise pichhle snapshot ki zaroorat nahi:**
       - har state me uske live LGD sub-districts me se kam se kam 90% ke paas ek ya zyada village rows hon;
       - capped export apne aakhri sub-districts poore kho deta hai, to ye check pehli import pe bhi cap pakad leta hai;
       - jin zyada-shehri states ka asli share kam hai (jaise Delhi ya Chandigarh), wo note ke saath `coverageExceptions` me jaate hain; ye pehli run ke REPORT me asli numbers dekh ke ek baar set hota hai;
     - jis state ki row count kisi jaane-pehchane export cap ke barabar ho (`roundCounts`, jaise 10,000 ya 50,000), wo run rokta hai, jab tak `roundCountOk` me wo state aur count note ke saath na ho;
     - sirf re-import: jis state ki rows pichhle snapshot ke < 98% hon, wo run rokta hai.
5. **India Post rows.**
   - Exact duplicates hatao (gine jaate hain) aur 9xxxxx skip karo (gine jaate hain). Har PIN code `pincodeZod` pass kare; 0.5% se zyada kharab rows run rok deti hain.
   - **Offices:** type ka suffix `kind` me nikaalo ("Kothimir B.O" → "Kothimir", `BO`). Office type aur delivery dono `rules.json` ke jaane-pehchane variant hon; **koi aur value run rok deti hai**, kyunki iska matlab format badla. REPORT alag-alag values counts ke saath dikhata hai.
   - **State names:** India Post ka state naam pehle key se, phir `aliases.states` se resolve hota hai. Anjaan state naam run rokta hai, kyunki GST state pe chalta hai.
   - **District names:** district naam **usi state ke andar** resolve hota hai, key se, phir `aliases.districts` se (ek code ya split list). Koi bhi unresolved (state, district-name) jodi run rokti hai aur har jodi suggestions ke saath list hoti hai.
   - **Alias targets:** jo alias anjaan ya retired code ki taraf point kare, wo run rokta hai, aur alias apne note aur source ke saath list hota hai.
6. **Har office ke coordinates.**
   - Sirf seedhe decimal values parse hote hain. "NA", khaali, 0, DMS, comma decimals aur N/E suffixes null bante hain aur pattern-wise gine jaate hain.
   - India box (lat 6.0–37.6, lng 68.0–97.5) ke bahar: lat aur lng swap karne se theek ho to swap + warning; warna null.
   - District ke offices ke median se `max(100 km, 1.5 × district ki p95 doori)` se door → null, warning ke saath. REPORT har district ke nulls dikhata hai.
7. **PIN code se group karo**, is order me:
   1. `deliverable` = kam se kam ek delivery office.
   2. **District**, `rules.json` ke `districtVote` se (L20).
      - **Office winner** wo district hai jisme sabse zyada delivery offices hon. Jis PIN me koi delivery office nahi (L5), wahan kisi bhi tarah ke sabse zyada offices wala district. Har PIN code ki kam se kam ek office row hoti hai, to office winner hamesha milta hai.
      - **`deliveryOffices` (salah wala):**
        1. repo fact (`aliases.pincodes`);
        2. office winner. Jab kisi office ka naam split alias ho, to wo vote split group ko jaata hai aur group ke andar gaon chunte hain;
        3. barabari pe sabse zyada gaon;
        4. phir kisi bhi tarah ke sabse zyada offices;
        5. phir sabse chhota LGD code.
      - **`villages`:** fact, sabse zyada gaon, sabse zyada delivery offices, sabse zyada offices, sabse chhota code. Jis PIN ki koi village row nahi, wo office wale order pe chala jaata hai.
      - Split naam jiska na koi gaon ho na fact → pehla listed candidate + `SPLIT_GUESS`.
      - **Cross-state rule (dono order me):** village winner ka state office winner ke state se milao. Jis PIN ki koi village row nahi, uske paas milane ko kuch nahi.
        - **Pakka saboot:** dono alag hain, **aur** village winner ke state me PIN ke kam se kam `crossStateStop.minVillages` (3) gaon hain, **aur** unme se `minShare` (50%) se zyada. Run rukti hai aur wo PIN codes list karti hai; pehle ek PIN fact likhna padta hai.
        - **Kamzor saboot:** dono alag hain, par village saboot us line se neeche hai.
          - Office winner ka state rehta hai.
          - `deliveryOffices` mode me district waise bhi office winner hi hai. `villages` mode me vote dobara chalta hai, sirf us state ke districts pe, usi order me.
          - PIN pe `MULTI_STATE` + `SOURCES_DISAGREE` lagta hai. Ye flags go-live rokte hain jab tak koi insaan confirm ya override na kare (L22).
        - REPORT har state ke liye ginta hai ki 1/3/5 gaon aur 25/50/75% pe kitne PIN rukte, taaki owner PR 2 me asli numbers se thresholds tay kare.
   3. **Sub-district:** chune hue district ke andar sabse zyada gaon wala, warna null. Runner-up ke paas ≥ 40% votes hon to `SUBDISTRICT_CLOSE_VOTE`.
   4. **State hamesha chune hue district se aata hai.** India Post ka state column sirf naam ki khoj chhoti karta hai. Isse "Jammu & Kashmir" label wali Leh rows aur purane Dadra & Nagar Haveli / Daman & Diu naam theek ho jaate hain.
   5. `alsoIn` me baaki har dekha gaya district, uske gaon aur offices ki ginti ke saath.
   6. **Centre point:** valid delivery-office points ka median (warna saare valid points ka). Usse 25 km se door ke points hatao, dobara median lo aur 4 decimals tak round karo (lagbhag 11 m). Kuch na bache to null.
   7. **Prepare ke review flags:**
      - `SPLIT_GUESS`;
      - `MULTI_STATE`;
      - `CLOSE_VOTE` (runner-up district ≥ 40%);
      - `SUBDISTRICT_CLOSE_VOTE`;
      - `SOURCES_DISAGREE` (village winner ≠ office winner);
      - `NO_COORDINATES`;
      - `VILLAGE_CODES_STALE` (step 4).
      - Import apne flags baad me jodta hai (§3.4), kyunki overrides sirf database jaanta hai.
   8. **Vote-order comparison:** REPORT har state ke liye ginta hai ki doosra order kitne PIN codes ko alag district me daalta.
8. **Bounds aur guards** (`rules.json`):
   - states = 36; districts 760–830; sub-districts 6,800–7,500; India Post rows 150k–185k; PIN codes 18k–21k.
   - Pichhle snapshot ke muqable: 1% se zyada PIN, 2 se zyada districts ya poora state retire ho raha ho to run rukti hai, jab tak `--allow-retire <n>` na ho.
   - **Mirror rule:** `source: mirror` sirf tab maana jaata hai jab koi pichhla snapshot na ho, aur mirror source pe `--allow-retire` mana hai.
9. **Likho:** fixed key order ke saath sorted NDJSON, phir `manifest.json` aur `REPORT.md`.

**Worked examples** (illustrative; api.postalpincode.in wale examples third-party mirror se hain, asli dry run tay karega):
- **410501 Chakan:** saare offices "Pune" district me aur gaon Khed me → MH / Pune / Khed, koi flag nahi.
- **411057 Hinjawadi + Wakad:** shehar ke delivery offices + Mulshi ke gaon → Pune district. Sub-district gaon se aata hai, par hub doori se chuna jaata hai (N9) aur PIN owner ki kinare wali list me jaata hai.
- **414001:** India Post "Ahmed Nagar" kehta hai aur LGD Ahilyanagar. Prepare rukta hai aur "Ahilyanagar?" suggest karta hai. Ek alias line `MH.ahmednagar → <code>` aage ki har import ke liye theek kar deti hai.
- **400050 Bandra West:** "Mumbai" split alias hai, to isko pehla candidate + `SPLIT_GUESS` milta hai. Mumbai Suburban live hone se pehle repo PIN fact ya planner override se theek hota hai.
- **East Godavari → Kakinada (2022):** India Post ab bhi "East Godavari" kehta hai. Report warning deta hai "LGD district Kakinada has 0 PIN codes" aur `SOURCES_DISAGREE` dikhata hai. Ek split alias `AP.eastgodavari → [East Godavari, Kakinada, …]` (fact, PR-reviewed) gaon ko faisla karne deta hai.
- **194101 Leh:**
  - India Post state "Jammu & Kashmir" aur district "Leh" kehta hai. District naam claimed state ke andar resolve hote hain, isliye alias usi se keyed hai: `JK.leh → [Leh, 2026 me Leh se kaate gaye har district, LGD code se]`.
  - Ye **split alias** hai jiske targets Ladakh ke districts hain. Office votes group ko jaate hain, group ke andar gaon chunte hain, aur state chune hue district se aata hai (`LA`).
  - Village rows apne sub-district ke portal parent se vote karti hain (step 4), to naye districts me REPARENTED hue sub-districts un districts ko vote dete hain, chahe village file me ab bhi purana code ho.
  - Jis PIN ka group me koi gaon nahi, use pehla candidate + `SPLIT_GUESS` milta hai.
  - Split alias ke bina ye PIN codes Leh me hi rehte, sirf `SOURCES_DISAGREE` ke saath.
- **396230 Silvassa:** 26 offices DH me aur 2 Gujarat/Valsad me → primary DH, `alsoIn` Valsad, `MULTI_STATE`.
  - Agar sirf 1 gaon Gujarat ki taraf hota, to DH rehta aur `SOURCES_DISAGREE` judta.
  - Run PIN fact ke liye tabhi rukti jab ≥ 3 gaon, aur PIN ke aadhe se zyada gaon, Gujarat ki taraf hote.

### 3.4 Collections (bq_core, prefix `location_`, +5 collections)

Har reference ObjectId hai. State fields ka naam `stateCode` hai, kyunki ObjectId guard har us `…Id`, `…Ids` ya `…By` field ko, ya `by` naam ki field ko, fail karta hai jisme string ho (object-ids.ts:11).

**`location_districts`**
- Fields: `_id`, `lgdCode` (int, unique), `stateCode` ('MH'), `name`, `formerNames[]`, `retiredAt|null`, `importId` (aakhri import jisne ise badla), `updatedAt`.
- Indexes: `lgdCode_unique {lgdCode:1}` unique; `stateCode_name {stateCode:1,name:1}`.

**`location_subdistricts`**
- Fields: `_id`, `lgdCode` (unique), `districtId`, `stateCode`, `name`, `formerNames[]`, `retiredAt`, `importId`, `updatedAt`.
- Indexes: `lgdCode_unique`; `districtId_name {districtId:1,name:1}`.

**`location_pincodes`**

| field | note |
|---|---|
| `_id` | hamesha ke liye stable |
| `code` | '411038', unique |
| `stateCode`, `districtId`, `subDistrictId` | **effective** values. Override ho to: override ka district aur sub-district, aur override district ka state. Na ho to: official values aur official district ka state. Kabhi mix nahi |
| `sourceDistrictId`, `sourceSubDistrictId` | official values; import inhe likhta hai aur inse nikalne wali har cheez dobara nikaalta hai |
| `evidence` | 'fact' \| 'villages' \| 'postOffices' (`by` nahi: guard `by` ko reference samajhta hai) |
| `alsoIn` | `[{districtId, subDistrictId, villages, offices}]` |
| `review` | Flag codes; saaf ho to `[]`. Isme prepare ke flags (§3.3 step 7.7) aur import ke apne flags: `OVERRIDE_DROPPED`, `OVERRIDE_SUBDISTRICT_DROPPED`, `OFFICIAL_MOVED`. **Koi import import ke apne flags kabhi nahi hatata.** Sirf confirmation ya override save karna, ya override hatana, inhe hatata hai (§3.6) |
| `deliverable` | bool |
| `offices` | `[{name, kind:'HO'\|'SO'\|'BO'\|'OTHER', delivery}]` |
| `location` | GeoJSON Point \| null |
| `override` | null \| `{stateCode, districtId, subDistrictId\|null (null = koi nahi), reason, by:ObjectId, at}`. `stateCode` override district ke state ki derived copy hai, har import ise refresh karta hai (§3.5); ye kabhi insaan ka choice nahi |
| `confirmed` | null \| `{districtId, subDistrictId\|null, reason, by, at}`. Likhte waqt ye official values ke barabar hota hai. **Official district badle to import ise hata deta hai.** Sirf official sub-district badle to import `confirmed.subDistrictId` naya kar deta hai aur `confirmationUpdated` change row likhta hai; confirmation bani rehti hai |
| `retiredAt`, `importId`, `updatedAt` | `importId` = aakhri import jisne ye record badla |

Indexes:
- `code_unique {code:1}`;
- `districtId_code {districtId:1, code:1}` (district ki list, upar se review filter);
- `override_at {'override.at':-1}` with `partialFilterExpression {'override.at': {$type: 'date'}}`.
  - Overrides list hamesha `{'override.at': {$type: 'date'}}` + sort ke saath query karti hai (MEMORY lesson 33).
  - Ek explain test ise cover karta hai, state `scopeFilter` ke neeche bhi.
- Koi 2dsphere index nahi: kisi query ko nahi chahiye.

**`location_imports`**
- Fields: `datasetVersion`, `datasetHash`, `source` (portal/mirror), `state` (running/done/failed/abandoned), `phase`, `cursor`, `pass` (1–3, §3.5), `startedAt`, `heartbeatAt`, `finishedAt`, `counts`, `flags {allowRetire, acceptLiveChanges}`, `note`, `error`.
- Indexes: `startedAt {startedAt:-1}`; `datasetHash_state`.

**`location_import_changes`** (sirf kaam ke badlav; additions sirf gine jaate hain)
- Fields: `importId`, `level`, `kind`, `recordId`, `code` (dikhane ka text), `before`, `after`.
- `kind` values:
  - `moved`: **effective** district badla. Ye LIVE guard aur subscribers ko jaata hai;
  - `sourceMoved`: override ke neeche official district badla, jabki effective nahi badla. Ye REPORT, diff report aur review page pe jaata hai (flag `OFFICIAL_MOVED`), LIVE guard pe kabhi nahi;
  - record ke badlav: `renamed`, `reparented`, `stateChanged` (district, ya PIN jiska effective state badla), `retired`, `restored`, `replaced`, `deliverabilityChanged`;
  - override aur confirmation ke badlav: `overrideDropped`, `overrideSubDistrictDropped`, `confirmationLapsed`, `confirmationUpdated`.
- Indexes: `importId_kind_id {importId:1,kind:1,_id:1}`; `recordId_id {recordId:1,_id:-1}`.

**Lease:** server-queue ka lease `platform_locks` me, naam `location.import`.

### 3.5 Import (`npm run db:locations -- diff | apply [--env live]`)

**Code ka layout:**
- Module `backend/core/src/modules/location/`: `dataset.ts`, `prepare.ts`, `diff.ts` aur `pacing.ts` (pure), `importer.ts`, `store.ts`, `routes.ts`, `index.ts`. `core/src/service.ts` se export.
- `backend/bundle` me ek patli CLI (`locations-cli.ts`) jo release CLI ke `readEnvFile`/`hostOf` dobara use karti hai.
- Root script `"db:locations": "npm run locations --workspace bundle --"`. Mongo appName `core-location-import`.
- Location kabhi network module import nahi karta. Network wala behaviour importer tak sirf un hooks se pahunchta hai jo composition root (`modules/index.ts`) inject karta hai (neeche LIVE guard).

**Steps:**

1. **Load.** Dataset padho, manifest ke sha256 milao, aur har line aur cross-references zod se check karo.
2. **Connect.** `core: bq_core on <host>` print karo, user ya password kabhi nahi.
   - **Live:** mana karo jab tak `platform_release.fingerprint === releaseFingerprint(...)` is checkout ka na ho; phir operator `live` type karta hai.
     - `releaseFingerprint` sirf migration ids, index shapes aur release-step fingerprints hash karta hai (release.ts:111-125). Isliye PR 3 ek no-op core release step `event-catalogue` jodta hai. Uska fingerprint hash karta hai:
       - core ka relay map (har event type jo core bhejta hai, uske subscribers ke saath);
       - ek `LOCATION_SCHEMA_VERSION` constant, jo har baar badhta hai jab location document ki shakal badle.
     - Iske saath, barabar fingerprint ka sach me matlab hai ki deployed core har wo event type aur document shape jaanta hai jo ye checkout likhta hai.
     - Is guard ke bina risk deri aur mismatched code ka hai, data khone ka nahi: LIVE-006 ke neeche anjaan type ki outbox row pending rehti hai aur tab jaati hai jab use jaanne wali release live ho (ARCHITECTURE.md:116).
   - **Laptop:** pehle core ke release steps chalao.
3. **`diff`** (read-only, bina lease).
   - Sorted dataset ko index-ordered cursors se merge-join karo: `batchSize 500`, unique key pe `hint`, `comment: 'full read: the location import compares every record with the dataset'`. Naye district aur sub-district maps (790 + 7,112 rows) dataset se memory me rakhe jaate hain.
   - **Change kinds nahi, expected stored fields.** Har record ke liye diff nikaalta hai ki stored document me kya hona chahiye. Inputs: dataset, naye parent maps, aur PIN codes ke liye stored override, confirmation aur review flags.
     - Districts aur sub-districts: data fields (name, parent, state, `formerNames`, `retiredAt`).
     - PIN codes, official aur effective values:
       - `sourceDistrictId`, `sourceSubDistrictId`;
       - effective `{stateCode, districtId, subDistrictId}`;
       - `override.stateCode`, aur kya override ka sub-district ab bhi uske district ke andar hai aur retired nahi.
     - PIN codes, `confirmed`: official district badla to hatao; sirf official sub-district badla to `subDistrictId` naya karo.
     - PIN codes, baaki fields: `deliverable`, `offices`, `location`, `alsoIn`.
     - PIN codes, `review` = is snapshot ke prepare flags ∪ **stored** import-owned flags ∪ is run ke jode gaye import flags. Diff kabhi import-owned flag nahi giraata.
     - Koi bhi farak ek write hai. Bookkeeping fields (`importId`, `updatedAt`) kabhi nahi gine jaate.
   - Kyunki kuch bhi pichhli run me dekhe gaye change kind pe nirbhar nahi, **resume ya dobara chalayi run khud theek ho jaati hai**.
     - *Example:* ek apply us import ke district batches ke baad crash hota hai jisme district X doosre state me gaya.
     - Rerun pe X barabar dikhta hai. Par X ke neeche har PIN code, aur X *me* override kiya har PIN code, ab bhi purana `stateCode` rakhta hai.
     - Diff unhe dhoondh ke likhta hai, har ek ki ek `stateChanged` change row ke saath.
   - **Report kya dikhata hai:**
     - har level pe: added, changed, moved, sourceMoved, reparented, state-changed, retired aur restored records;
     - har moved PIN code (`412xxx: district A → B`), aur renames;
     - wo overrides aur confirmations jo ab official data se alag hain;
     - projected space aur andaazan minutes.
   - Report `--report <file>` me jaata hai (default temp). Ye kabhi commit nahi hota, kyunki isme live host ka naam hota hai.
4. **Guards** (dono modes):
   - retire guard aur mirror rule (L16, L1);
   - **space:**
     - **40 MB cap:** location collections + delta ≤ 40 MB rahe.
       - Stats **sirf bq_core** ke padhe jaate hain, best-effort: `$collStats`, phir `collStats`/`dbStats`.
       - M0 ya user ke rights mana karein to CLI "not readable with bq-core" print karke aage badhti hai, kyunki agla check asli guard hai.
     - **Sirf live, 400 MB cap:** CLI projected badhat print karti hai aur operator se Atlas page ka cluster "Logical Size" type karwati hai. Wo number + badhat 400 MB (Atlas alert threshold) se upar ho to mana.
     - **bq_audit:** CLI ise kabhi nahi padhti. Wahan bq-core ke paas sirf insert, find, createIndex aur listIndexes hain (ARCHITECTURE.md:139; audit/index.ts:126-128), aur owner se kabhi ye role badhane ko nahi kaha jaata.
   - **LIVE guard:** composition root (`modules/index.ts`) ki inject ki hui hook list, T4.2 me khaali. T4.3 network ka check register karta hai, jo run rok deta hai jab tak `--accept-live-changes` aur `--note` na hon, aur har case list karta hai. Ye in pe chalta hai:
     - wo PIN codes jo `moved` (effective), retired, deliverability-changed, effective-state-changed ya override-dropped hain, aur jinka PIN area doc CLOSED nahi (unique area key pe ek `$in` query);
     - reparented sub-districts ya state-changed districts jinme koi hub ya warehouse hai jo CLOSED nahi (hubs aur warehouses naye `subDistrictId` aur maujooda `districtId` indexes se milte hain, §6.1).
     - `sourceMoved`, `confirmationUpdated` aur sirf-sub-district badlav ise kabhi nahi chalate: inse na wo district badalta hai jise hubs serve karte hain (N8), na wo state jo GST use karta hai.
5. **`apply`:**
   - **Lease aur resume:**
     - `location.import` lease lo (TTL 60 s, har 20 s renew; lease gayi to run rukti hai).
     - Same `datasetHash` wala `running` record resume karo. Doosre hash wala `--abandon <id>` tak mana.
   - **Likhne ka order:** districts → sub-districts → PIN codes (add, change, move, restore) → PIN codes retire → sub-districts retire → districts retire, taaki parents hamesha pehle maujood hon.
   - **Har batch ek chhota `withTransaction`**, queries ek ke baad ek, `Promise.all` kabhi nahi:
     1. ≤ 50 upserts ka ek `bulkWrite`;
     2. us batch ki change rows ka `insertMany`;
     3. import record ki progress ka update (`phase`, `cursor`, `pass`, `counts`, `heartbeatAt`).
     Crash me ya poora batch jaata hai ya kuch nahi, isliye har committed move ki theek ek change row hoti hai.
   - Sirf wo records likhe jaate hain jinhe diff alag batata hai, aur sirf unhe `importId` aur `updatedAt` milte hain.
   - Har write natural key pe upsert hai `$setOnInsert: {_id}` ke saath, isliye ids stable rehti hain aur renamed district apna ObjectId rakhta hai.
   - **PIN codes ek update pipeline use karte hain** jo stored override, confirmation aur review **likhte waqt** padhti hai, taaki import ke dauran hua save kabhi na khoye:
     - **Official values:** `sourceDistrictId` aur `sourceSubDistrictId` naye official values lete hain.
     - **Override ab bhi waisa jaisa diff ne dekha** (same `override.districtId`):
       - `override.stateCode` us district ke naye state pe set hota hai;
       - override ka sub-district agar ab us district ke andar nahi, ya retired hai, to "koi nahi" ho jaata hai, `OVERRIDE_SUBDISTRICT_DROPPED` aur `overrideSubDistrictDropped` change row ke saath.
     - **Override beech me badla:** waisa hi chhoda jaata hai, aur verify pass use dobara check karta hai.
     - **Effective triple:** `override != null` pe ek `$cond`: override se, warna naye official values aur official district ke naye state se.
     - **Confirmation:**
       - naya official **district** usse alag ho to hatao (`confirmationLapsed` change row);
       - sirf sub-district alag ho to `confirmed.subDistrictId` naya (`confirmationUpdated` change row).
     - **Override ka district ab retired:** override hatta hai, PIN ko `OVERRIDE_DROPPED` milta hai, aur `overrideDropped` change row likhi jaati hai.
     - **Override ke neeche official move:** `OFFICIAL_MOVED` aur `sourceMoved` change row.
     - **Review flags:** `review` = dataset ke prepare flags, stored import-owned flags aur upar jode flags ka `$setUnion`.
   - **Verify pass.** Aakhri batch ke baad apply diff dobara chalata hai (read-only, live pe lagbhag 1 min).
     - Jo ab bhi alag ho (planner ke save se race, pichhla crash), wo aur batches me likha jaata hai.
     - Max 3 passes; uske baad run rukti hai aur bacha hua list karti hai.
   - **Throttle (`pacing.ts`):** `--rate` (documents per second) har likhe document ko ginta hai: upserts, change rows aur progress update.
     - Har batch ke baad importer tab tak rukta hai jab tak *ab tak likhe documents ÷ beeta samay ≤ rate* na ho (token bucket), aur live pe do batch transactions ke beech kam se kam 1 s.
     - Live pe default 50 docs/s, to 101 documents ka bhaari batch ~2 s ke baad agla batch.
     - Core ke relay polling (~4 ops/s, ARCHITECTURE.md:113) aur raat ke traffic ke saath ye Atlas ke 80/s Opscounter alert se neeche rehta hai (ARCHITECTURE.md:567).
     - Laptop pe koi limit nahi.
6. **Finish, ek `withTransaction` me:**
   - import record `done` hota hai, counts ke saath;
   - **ek** `writeAudit` entry (L21):
     - action `location.import.applied`, actor `{userId:null, …, system:'location.import'}`, resource `{type:'location_import', id}`;
     - `after {datasetVersion, source, counts, guardsBypassed: {allowRetire: n|null, acceptLiveChanges: bool}, liveAreasTouched: {total, byKind, pincodes: [pehle 100]}}`, 8,000-character after limit ke andar (audit store.ts:34);
     - reason = `--note` (≤ 500 chars). CLI `--allow-retire` ya `--accept-live-changes` ko bina `--note` mana karti hai;
   - `writeEvent('location.import.completed', {importId, datasetVersion, state:'done', counts})`, 16 KB event limit se kaafi neeche;
   - T4.3 PR 10 se, har us state ka ek `location.districts.changed` bhi jiske districts badle (§6.5).
   - Fail hui run apne chhote transaction me `result:'failed'` audit entry likhti hai, phase, counts aur wahi guard flags ke saath.
7. **`--abandon <id>`** record ko abandoned mark karta hai aur apne transaction me `location.import.completed` `state:'abandoned'` ke saath bhejta hai, taaki subscribers phir bhi apply hue batches ki change rows padh sakein.
8. **Crash:** wahi command dobara chalao. Diff expected stored fields milata hai (step 3), to committed batches barabar dikhte hain, aur crash se purane reh gaye derived fields mil ke likhe jaate hain.

**Identity reset ke baad places dobara bhejna** location ki command nahi hai. Ye `npm run db:resend-places [--env live]` hai (T4.3 PR 10, §6.5), ek bundle command jo location aur network ke facades call karti hai.

**Retire, delete kabhi nahi.** Gayab record ko `retiredAt` milta hai. Wapas aaye to usi `_id` ke saath restore hota hai. Retired jagahon pe naye addresses ya settings mana hain; purane references padhe ja sakte hain.

### 3.6 Sudhaar (L13, L14, L22)

**Facts (repo, PR-reviewed).** `aliases.json` me purane naam, splits, PIN facts aur code replacements. Example: `MH.ahmednagar → Ahilyanagar`.

**Business choices (DB, audited API), do routes**, kyunki step-up alag hai (route.stepUp = permission.mfa, contracts `test/iam.test.ts:101`):
- **Confirm:** `POST /locations/pincodes/:pincode/confirmations` (`location.pincodes.confirm`), permission `location.pincode.confirm` (medium, bina step-up).
  - Body `{reason 10–500}`.
  - `confirmed` = maujooda official district aur sub-district save hota hai.
  - Sirf audit, event nahi: is pe koi react nahi karta.
- **Override:** `PUT /locations/pincodes/:pincode/override` (`location.pincodes.override`), permission `location.pincode.override` (high, `mfa:true`, yaani step-up).
  - Body `{districtId|null, subDistrictId|null, reason 10–500}`; `districtId: null` override hatata hai.
  - Target district maujood ho aur retired na ho. Diya gaya `subDistrictId` us district ka ho aur retired na ho, warna 422 `SUBDISTRICT_NOT_IN_DISTRICT`.
  - `override.stateCode` target district se copy hota hai (aur har import use refresh karta hai, §3.5).
- **Flags:**
  - Confirmation ya override save karna, ya override hatana, import ke apne flags (`OVERRIDE_DROPPED`, `OVERRIDE_SUBDISTRICT_DROPPED`, `OFFICIAL_MOVED`) hatata hai. **Sirf yahi handlers inhe hatate hain**; imports inhe rakhte hain (§3.5).
  - Prepare ke flags data ke facts ki tarah rehte hain. L22 PIN ko reviewed isliye ginta hai ki `confirmed`/`override` maujood hai.
- Dono permissions identity `roles.ts` me `logistics_head` aur `network_planner` (scope types global/state) ko jaati hain. Owner L13 (b) ya (c) chune to sirf `mfa` flags badalte hain.
- **Handler:**
  1. PIN code load karo;
  2. uski maujooda chain pe `authorize` (scope ke bahar 404, permission na ho to 403);
  3. override ke liye target district aur sub-district load karo (upar ke niyam) aur target ki chain pe dobara `authorize`, taaki state planner PIN ko doosre state me na le ja sake;
  4. ek transaction:
     - `updatedAt` pe conditional update (beech me badla to 409);
     - `writeAudit`;
     - overrides ke liye `writeEvent('location.pincode.overridden', {pincodeId, pincode, districtId, previousDistrictId, stateCode})`.
- **T4.4 ke liye "Mapped" (L22):** deliverable, retired nahi, apne district ke hub wala PIN area, aur ya to koi review flag nahi ya `confirmed`/`override` maujood.
- **Needs review** (page ka filter): flag hai aur na `confirmed` na `override`, ya import ka koi apna flag.
- `rolesOf(access)` `audit/routes.ts` se platform `authz.ts` me jaata hai, taaki dono modules use kar sakein.
- **Page** (L15 (a), PR 6): logistics "PIN code review". Dikhata hai:
  - har district ki needs-review list;
  - official vs effective district, evidence aur `districtSource` ke saath;
  - Confirm aur Override buttons (override ke liye step-up dialog; sub-district list chune hue district se);
  - §3.7 wala CDN note.

### 3.7 Read API aur facade

**Public routes** (rate limit `public`, `cache {sMaxAge: 86400, staleWhileRevalidate: 3600}`, to sabse bura case lagbhag 25 ghante purana; ye repo ke pehle cached routes hain):

| id | route |
|---|---|
| `location.districts.list` | GET `/locations/states/:stateCode/districts` → `[{id, lgdCode, name, formerNames, retired}]` |
| `location.subDistricts.list` | GET `/locations/districts/:districtId/sub-districts` |
| `location.pincodes.lookup` | GET `/locations/pincodes/lookup?pincode=411038` → `{pincode, state{code,name}, district{id,name}, subDistrict\|null, offices:[names], deliverable, retired}`; 404 `PINCODE_NOT_FOUND` |

- Lookup query parameter leta hai, **strict** query schema ke saath.
  - Request log query ke bina `req.path` rakhta hai, to PIN codes logs se bahar rehte hain.
  - Strict schema cache-busting extras ko sasta, uncached 400 bana deta hai; warna server-kit anjaan keys ko ignore karta hai.
- 25 ghante wali seema REPORT.md me likhi jaati hai aur override page pe dikhti hai: "Customers may see the old district for up to about a day; checkout uses fresh data."

**Staff routes** (apps logistics/master):
- `location.pincodes.list`: GET `/locations/districts/:districtId/pincodes?cursor&limit&needsReview=`.
  - Permission `location.master.read` (low; global/state/district; Logistics Head aur Planner).
  - `scopeFilter(access, perm, {state:'stateCode', district:'districtId'})` se scoped.
  - Har row me `districtSource: 'official'|'override'`.
- `location.pincodeOverrides.list`: GET `/locations/pincode-overrides` (partial-index query, §3.4).
- `location.pincodes.confirm` aur `location.pincodes.override` (§3.6).

**Facade** (`location/index.ts`; har function `{session}` leta hai taaki checkout apne transaction ke andar dobara padh sake):
- `pincodeByCode`, `placeOfPincode(code|id)` → `{stateCode, districtId, subDistrictId, pincodeId, pincode, retired, deliverable}`, `placesOfPincodes(ids)`;
- `districtById`, `districtByLgd`, `districtsOfState`, `subDistrictsOf`, `pincodesOfDistrict(districtId, {after, limit})`, T4.4 ke liye `isMapped…` inputs;
- `changesOf(importId, kind, {after})`;
- `resendDistrictEvents()` (T4.3 PR 10, §6.5);
- `LOCATION_INDEXES`, `LOCATION_SCHEMA_VERSION`;
- `locationSubscribers = {'location.import.completed': [], 'location.pincode.overridden': []}`. Har naya event type yahan list hona chahiye, warna uski outbox rows hamesha pending rehti hain.

T4.2 me Redis nahi.

### 3.8 Events aur audit

- **Events:**
  - `location.import.completed`: contract, khaali subscriber list aur audit naam, teeno **PR 3** me;
  - `location.pincode.overridden`: PR 6 me;
  - `location.districts.changed {stateCode, version, districts:[…]}`: T4.3 PR 10 me.
  - Har ek `event-catalogue` release-step fingerprint badalta hai (§3.5 step 2).
- **Audit:** har import ki ek System entry, guard bypass ke saath (L21); har confirm ya override ki ek user entry.
- `AUDIT_ACTION_NAMES` me judte hain: "Location data imported" (PR 3), "PIN code district confirmed" aur "PIN code district changed" (PR 6).

### 3.9 Ops aur run book

**Laptop:**
1. `prepare` ko Docker nahi chahiye.
2. `npm run infra:up -- mongo` (sirf Mongo, memory ke niyam "Docker sirf zaroorat ka" ke hisaab se).
3. `npm run db:release`.
4. `npm run db:locations -- diff`, phir `-- apply` (seconds me, bina throttle).
5. `npm run dev:backend` se pehle: `npm run infra:up -- mongo valkey`. Core ko start pe Redis chahiye; Mailpit sirf tab jab koi check email bheje.
6. Gateway se GET `/api/v1/locations/pincodes/lookup?pincode=<pin>` check karo.
7. Kaam khatam hone pe `npm run infra:down`.

**Live** (sirf owner; `.env.production` sirf owner ke paas hai, aur Claude use kabhi nahi kholta):
1. Merge, release aur deploy; `release` ko deployed commit pe check out karo.
2. Atlas Network Access me temporary IP entry jodo, aur Atlas metrics page se cluster ka "Logical Size" note karo.
3. `npm run db:locations -- diff --env live`, aur report padho.
4. `npm run db:locations -- apply --env live --note "<sources aur dates>"`.
   - Poochhe jaane pe Logical Size type karo, phir `live`.
   - Diff ko `--allow-retire` ya `--accept-live-changes` chahiye ho to note me wajah likho.
   - Raat ko (IST) chalao; lagbhag 10–11 min.
5. Checks:
   - live lookup URL do baar (doosre jawab me `x-vercel-cache: HIT`);
   - Master audit viewer "System (location.import)" dikhaye, agar guard flags use hue to unke saath;
   - Atlas storage aur ops graphs (Opscounter 80/s se neeche).
6. IP entry hatao.

Maujooda `bq-core` Atlas user kaafi hai: CLI sirf bq_core padhti aur likhti hai, aur uski ek audit entry wahi insert right use karti hai jo bq-core ke paas bq_audit pe pehle se hai.

---

## 4. T4.2 edge cases

| Case | Asli example | Theek kya hota hai |
|---|---|---|
| District ka naam badla, India Post purana naam use karta hai | 414001 "Ahmed Nagar" vs LGD Ahilyanagar (gazette 2024-10-05) | Prepare rukta hai aur match suggest karta hai; ek `aliases.json` line hamesha ke liye theek kar deti hai |
| Sub-district ka naam badla (same code) | Velhe → Rajgad (Aug 2025) | Same code, to same ObjectId. Naam update, "Velhe" `formerNames` me, aur `renamed` change row. Hubs, grants aur settings apni ids rakhte hain |
| Sub-district naye district me gaya (same code) | 2026 split ke baad Leh ke sub-districts | `REPARENTED` change row. Village rows portal parent se vote karti hain, to naye district ke liye ginti hoti hain. Usme hub ya warehouse ho to LIVE guard. Network, identity aur settings ke subscribers re-point ya flag karte hain |
| Village file reparent se purani | Village rows me ab bhi purana parent district code | Votes portal parent ko, row ke district column ko kabhi nahi; un PIN codes pe `VILLAGE_CODES_STALE`; REPORT har state ki ginti deta hai |
| Retired sub-district code wali village rows | Village export ke baad LGD ne sub-district re-code kiya | Rows skip aur gini jaati hain; un PIN codes pe `VILLAGE_CODES_STALE`, taaki go-live se pehle koi insaan dekhe |
| District doosre state me gaya (same code) | kam hi hota hai (UT ka badlav) | `STATE_CHANGED`. Har PIN ka effective `stateCode`, aur us pe point karta har `override.stateCode`, dobara nikaala jaata hai. LIVE guard |
| State change ke district batches ke baad crash | District X ka state badla; PIN batches se pehle laptop so gaya | Rerun ka diff dataset se expected `stateCode` nikaal ke purane PIN codes dhoondhta hai, X *me* override kiye PIN bhi; har ek ki ek `stateChanged` row |
| Postal district ≠ revenue district | 400050 "Mumbai" vs LGD Mumbai / Mumbai Suburban | Split alias → gaon faisla karte hain; warna pehla candidate + `SPLIT_GUESS`. Repo PIN fact ya override se theek |
| District split, India Post me ab bhi parent | East Godavari → Kakinada (2022); Leh → naye districts (2026) | Report warning "LGD district with 0 PIN codes". Split alias (Leh ke liye `JK.leh` keyed, targets LA me) gaon ko faisla karne deta hai. Shehar ke PIN codes ko fact ya override milta hai |
| District khatam par kisi source me ab bhi | Mirror 2024-12-28 ke baad bhi "Jaipur (Gramin)" 783 dikhata hai | Live LGD portal tay karta hai. Hata to `retiredAt` (delete kabhi nahi). Re-import pe mirror kabhi use nahi |
| Merge, phir wapas | Assam ke 4 districts (2022 → 2023) | Retired, phir usi code aur usi `_id` pe restored |
| Do states me same district naam | Aurangabad: Bihar (LGD 189) aur Maharashtra | Naam sirf claimed state ke andar milaye jaate hain, poore desh me kabhi nahi |
| Do live districts ek matching key pe aa jaayein | jaise ek state me "X Nagar" aur "Xnagar" | Prepare rukta hai |
| Alias retired district ki taraf point kare | split ke baad | Prepare rukta hai, alias, uska note aur source list karke |
| PIN 2 districts me | 412213 Bhor + Rajgad | L20 order ek chunta hai; baaki `alsoIn` me. Flag sirf tab jab runner-up ke paas ≥ 40% ho (district ya sub-district) |
| PIN 2 states me | 673310 Kerala + Puducherry (Mahe); 396230 Gujarat + DH | Office winner ka state primary + `MULTI_STATE`; checkout L7 follow karta hai. Run PIN fact ke liye sirf tab rukti hai jab village winner ke state ke paas ≥ 3 gaon aur PIN ke > 50% gaon hon |
| State border ke paar bhatka gaon | 396230, 1 gaon Valsad me mapped | Office winner ka state rehta hai; `MULTI_STATE` + `SOURCES_DISAGREE`; stop nahi |
| Cross-state PIN jisme sirf non-delivery offices | Non-deliverable PIN, offices ek state me aur gaon doosre me | Office winner saare offices se chuna jaata hai; wahi cross-state rule lagta hai |
| `villages` order, kamzor cross-state saboot | Village winner state B me, office winner state A me, stop line se neeche | State A rehta hai; vote sirf state A ke districts pe dobara chalta hai |
| Gaon wala shehar-kinare ka PIN | 411057 Hinjawadi + Wakad | Pune district; sub-district gaon se; hub doori se chuna jaata hai aur PIN owner ki kinare wali list me jaata hai (N9) |
| Purane state naam / UT badlav | "Pondicherry", "Jammu & Kashmir" ke neeche Leh, "Dadra & Nagar Haveli" | State aliases, aur claimed state se keyed district aliases; aakhri state district se aata hai; anjaan state naam run rokta hai |
| LGD ki state list ≠ INDIAN_STATES | "The Dadra And Nagar Haveli And Daman And Diu" | Key "the" hata deti hai; exactly 36 ek-ek match, warna stop |
| LGD code ≠ GST code | AP: LGD 28, GST 37 | `lgdCode` file se copy, kabhi derive nahi |
| Village file anjaan code bataye | Mirror lag (785 vs 790) | Rows ignore aur report me gini jaati hain |
| Kuch states ki village file nahi | 36 me se 30 download hui | States ki list ke saath warning; wahan India Post ke naam use hote hain |
| Village file kati hui | Bade state ka export capped | Inme se kisi pe stop: aakhri row adhoori; kul < "Total records" ka 99.9%; kisi state ki sub-district coverage < 90%; kisi state ki ginti jaane-pehchane cap ke barabar; re-import pe kisi state ki rows pichhle snapshot ke < 98%. Aakhri wale ke alawa sab pehli import pe chalte hain |
| Delivery aur non-delivery offices mix | 414001: 1 delivery HO + 6 "Non Delivery" SOs | `deliverable=true`; naamon ke liye har office rakha jaata hai |
| Sirf non-delivery offices | dry run inki list dega | `deliverable=false`; kabhi servable nahi; "all mapped" me gine nahi jaate (L22) |
| Army Postal Service | koi bhi 9xxxxx | Skip aur gini jaati hain |
| Anjaan delivery text | jaise "Del." | Run rukti hai (format badla); variant `rules.json` me jodo |
| Anjaan office type | "PO" ya koi nayi value | Jaane-pehchane variants map hote hain (PO → SO, G.P.O → HO); koi bhi anjaan value run rokti hai; REPORT alag-alag values dikhata hai |
| Lat/lng "NA", ulte, DMS, samundar me, bahut door | Kukuda B.O 504299 "NA" | Kramshah: null; swap; null (pattern-wise gine); null; district radius ke bahar null. Koi point na bache → `NO_COORDINATES` |
| Bahut bada district | Kutch, Leh | Radius district ke apne phailaav ke saath badhta hai (≥ 100 km) |
| Duplicate rows | 165,627 rows vs 1,64,999 POs (31.03.2025) | Exact duplicates hatte aur gine jaate hain; doosre district ke neeche wahi office rakha aur flag kiya jaata hai |
| Kharab PIN code | khaali, "NA", 5 digits | Row reject aur gini jaati hai; 0.5% se zyada pe run rukti hai |
| Special characters | NBSP, zero-width, "&", "( )" | Save hone wale naamon se hatte hain (NFKC, spaces ek); poori stripping sirf matching keys me |
| Ek LGD code ke do naam | tooti file | Stop |
| Kati ya adhoori download | 35 states; India Post ka aadha | Count bounds ya retire guard rok dete hain; kuch nahi likha jaata |
| Apply ke beech crash | 551 me se batch 300 ke baad laptop so gaya | Batches transactions hain: 300 apni change rows ke saath committed, 301 gaya. Wahi command same dataset hash pe resume karti hai; diff expected fields dobara nikaalta hai |
| Kuch batches ke baad import abandon | owner dataset badalta hai | `--abandon` completion event bhejta hai, to subscribers apply hue moves phir bhi dekhte hain |
| Ek saath do imports | dono developers apply chalaate hain | Lease ek ko jeetne deta hai; doosra dataset hash `--abandon` tak mana |
| Undeployed checkout se live import | `prerelease` checkout, ya naye event type wala checkout | Fingerprint guard (`event-catalogue` step ke saath) mana karta hai |
| Cluster lagbhag bhara | audit + outbox 400 MB ke paas | Type kiya Atlas Logical Size + badhat > 400 MB → mana |
| Stats mana | M0 ya bq-core ke rights `$collStats` mana karein | "not readable with bq-core" print karke aage; type kiya Logical Size phir bhi guard karta hai |
| Import ke dauran override save | 10 me se minute 4 pe | Pipeline likhte waqt stored override padhti hai; verify pass race wali cheez dobara check karta hai |
| Sirf-district override (shehar ka PIN) + official sub-district badla | Override → district X, sub-district koi nahi | Effective triple X / koi nahi rehta; official sub-district sirf `sourceSubDistrictId` me jaata hai |
| Override ka sub-district reparented ya retired | Override → X / sub-district S; S district Y me gaya | Override ka sub-district "koi nahi", `OVERRIDE_SUBDISTRICT_DROPPED` aur change row ke saath. District X hi rehta hai, to LIVE guard nahi |
| Override ke neeche official district badla | override X; official Y → Z | Effective X hi; `sourceMoved` change row + `OFFICIAL_MOVED` flag; review page pe list; LIVE guard nahi |
| Import ka apna flag jise abhi kisi ne nahi dekha | pichhle quarter ka `OFFICIAL_MOVED`, is quarter koi badlav nahi | Agla import rakhta hai (expected review me stored import-owned flags hain); sirf insaan ke confirm ya override se hatta hai |
| Override ka district retired | split ke baad | Override hata, `OVERRIDE_DROPPED` flag, change row + report line; LIVE guard; T4.3 subscriber alert deta hai |
| Confirmed PIN ka official district badla | baad ka re-import use move karta hai | Confirmation khatam (`confirmationLapsed`); PIN wapas review me |
| Confirmed PIN ka sirf official sub-district badla | Shehar-kinare ka PIN jiski gaon ginti quarters ke beech badli | Confirmation rehti hai; `confirmed.subDistrictId` saath chalta hai; `confirmationUpdated` change row; ab bhi mapped (L22); LIVE guard nahi |
| LIVE area chhoota badlav (T4.3 ke baad) | served PIN ka district badla | `--accept-live-changes` + `--note` ke bina stop, har PIN list karke; bypass audit entry me jaata hai |
| LGD kabhi rename pe re-code kare | diff ek jagah ke liye RETIRED + NEW dikhaye | `aliases.replacements` entry → `replaced` change row; network aur settings subscribers apni rows re-point karte hain |
| Save As ke baad galat encoding | Windows-1252 | Line number + sudhaar ke saath stop |
| Import ya override ke baad CDN purana | moved PIN ab bhi purana district dikhaye | Max ~25 ghante (s-maxage 86,400 + SWR 3,600); report aur override page pe likha; checkout taaza data use karta hai |

---

## 5. T4.1 PR E Area settings: design

### 5.0 Kya milega (lakshya)

- Setting keys ka ek catalogue: cut-off, last-mile days, holidays, weekly off, UPI on delivery aur uska cap, UPI emergency block, aur orders paused.
- Values global, state, district ya PIN code level pe save ho sakti hain. Har value:
  - versioned, audited aur event se announced hai;
  - typed ids ke saath save hoti hai (strings ke andar ids nahi);
  - owner ki chuni limits se storage me bandhi hai (S4, S10).
- Resolver kisi bhi PIN code ke liye "value + kahan se aayi" do indexed queries me deta hai.
- District aur PIN code ids asli T4.2 data se check hote hain; isiliye PR E T4.2 ke baad aata hai.
- Saath me logistics ka "Area settings" page (L15, S7).
- *Example:* holidays global pe (26 Jan, 15 Aug, 2 Oct), MH pe (1 May) aur Pune pe (Ganesh Visarjan, plus "1 May open") hon, to Pune ke PIN ke liye 26 Jan, 15 Aug, 2 Oct aur Visarjan holidays hain, aur 1 May working day.

### 5.1 Kya hai, aur kya badalta hai

- **Kya hai:** contracts me pehle se:
  - `AREA_LEVELS` (`global|state|district|pincode`, area-settings.ts:4);
  - `defineAreaSetting` (key format `<area>.<name>`, description, valid default);
  - ek pure closest-wins `resolveAreaSetting` (area-settings.ts:4-78). Aaj ye PIN code values ko code string se key karta hai aur code ke liye `stateId` use karta hai.
- **Contracts me badlav:**
  - har definition me `levels` (non-empty subset), `kind` (`value|switch|dates`) aur `permission` jodo;
  - duplicate check ke saath `areaSettingCatalogue([...])` jodo;
  - `AreaLocation` ban jaata hai `{stateCode, districtId, pincodeId}`, district aur PIN code ke liye ObjectId hex;
  - merge teeno kinds sambhalta hai aur dates ke liye `parts` lautata hai;
  - test aur README ke examples state ke liye `'27'` (GST code) use karte hain; inhe `'MH'` aur ObjectId hex pe badlo.
- Packages publish nahi hote (owner, 2026-10-21; docs/packages/README.md:3), to breaking change sirf monorepo ke callers update karta hai. Version packages/README ke hisaab se badhao; npm publish nahi.

### 5.2 PR E ke keys (S3, S4, S10)

| key | value (shared-zod) | default | levels | permission | kind | kaun padhta hai |
|---|---|---|---|---|---|---|
| `delivery.cutoff_time` | `"HH:MM"` 24 h IST | "14:00" | G S D P | `network.area_setting.manage` | value | T4.3 promise, T7.2 |
| `delivery.last_mile_days` | int 0–5 | 1 | G S D P | manage | value | T4.3 promise |
| `delivery.holidays` | `{date: isoDateZod, name 1–60, closed: boolean}` items, unique dates; ≤ 60 stored (neeche dekhein) | `[]` | G S D P | manage | dates | T4.3, T4.4 |
| `delivery.weekly_off` | unique ISO weekdays 1–7 (1 = Mon) | `[]` | G S D P | manage | value | T4.3 |
| `upi_on_delivery.enabled` | boolean | true | G S D P | `network.payment_rule.manage` | value | T4.3, T7.4 |
| `upi_on_delivery.max_order_paise` | `paiseZod` 10,000–5,000,000 | 500000 (₹5,000) | G S D P | payment_rule | value | T7.4 |
| `upi_on_delivery.blocked` | sirf true | false | G S D P | `network.area_switch.set` | switch | T4.3, T7.4 |
| `orders.paused` | sirf true | false | G S D P | area_switch | switch | T4.3, T7.2 |

- UPI on delivery tab allowed hai jab `enabled && !blocked && total ≤ cap` (PR 1 me T7.4 line me likha jaata hai).
- Switch sirf on ho sakta hai ya hat sakta hai. Example: MH paused matlab Pune bhi paused, aur Pune khud ko un-pause nahi kar sakta.
- Holidays merge ka example: Pune ke PIN ke liye global 26 Jan/15 Aug/2 Oct, MH 1 May, aur Pune {Visarjan, 1 May `closed:false`} ho, to 26 Jan, 15 Aug, 2 Oct aur Visarjan band, aur 1 May khula.
- **Holiday pruning (S10 (a) item 4):**
  - Ek save request me 400 tak items ho sakte hain.
  - Har save pe (routes aur seed) store function aaj (IST) − 30 din se purani dates hatata hai. "Aaj" transaction ke bahar ek baar nikaala jaata hai, taaki retry wahi date use kare.
  - 60 items ki stored limit bache hue pe lagti hai (warna 400 validation error).
  - No-op check pruned value se milata hai. Audit before/after hati hui dates dikhata hai, aur history har purani value rakhti hai.
  - Page kehta hai "Dates more than 30 days old are removed when you save."
  - *Example:* Pune ki list me pichhle saalon ki 60 dates + 1 nayi date ho, to save ke baad sirf pichhle 30 din se aage ki dates + nayi date bachti hain.
- Global national holidays T4.3 PR 11 ki data file se seed hoti hain (S9), code se nahi.

### 5.3 Storage (network module, +2 collections; typed area fields, strings ke andar ids nahi)

**`network_area_settings`**: har (key, area) ka ek current document.
- **Fields:** `{_id, key, area:{level, stateCode|null, districtId|null, pincodeId|null}, pincode:'411038'|null (display), chain:{stateCode, districtId|null}, active, value, version, reason, updatedBy: ObjectId|null, updatedSystem: string|null, updatedApp, updatedAt, createdAt, changesToday:{day:'2026-11-16', count}}`.
  - `area` me sirf us level ki apni id hoti hai: global → sab null; state → `stateCode`; district → `districtId`; pincode → `pincodeId`. Baaki fields null likhe jaate hain.
  - `chain` batata hai ki area abhi kahan baitha hai, scoped lists ke liye.
  - **Kisne badla:**
    - insaan ke badlav me `updatedBy` (ObjectId) aur `updatedSystem: null`;
    - system ke badlav (seed) me `updatedBy: null` aur `updatedSystem: 'seed:pune@v1'`, audit actor ke `system` field wala hi pattern;
    - `…By` field me string ObjectId guard fail karti (object-ids.ts:11); null pass hota hai.
- Hatane (clear) pe tombstone likha jaata hai (`active:false`), taaki version ginti chalti rahe.
- **Indexes:**
  - unique `{key:1,'area.level':1,'area.stateCode':1,'area.districtId':1,'area.pincodeId':1}`. Har query chaaron area fields ka naam leti hai (jahan kaam nahi wahan null), to har branch exact seek hai;
  - lists: `{key:1,_id:-1}`, `{'chain.stateCode':1,key:1,_id:-1}`, `{'chain.districtId':1,key:1,_id:-1}`. Lists ko hamesha `key` chahiye;
  - `pincodeId_pin {'area.pincodeId':1}` with `partialFilterExpression {'area.level':'pincode'}`, moved PIN ke rechain ke liye. Iski query me hamesha `'area.level':'pincode'` hota hai (MEMORY lesson 33), aur ek explain test ise cover karta hai.
- **Row cap (S4):** max 20,000 documents. Uske upar *naya* row 409 `AREA_SETTINGS_FULL` paata hai; updates aur clears chalte rehte hain.
  - Ginti `estimatedDocumentCount` hai, `withTransaction` se **pehle** soft cap ki tarah padhi jaati hai, platform/routes.ts:45 wale comment ke saath: "the collection's own count (no scan); a few parallel requests may pass it by a few, that is fine".
  - Ye transaction ke andar kabhi nahi chalti. MongoDB transaction me `count` ya uske helpers nahi chalne deta, aur driver ka `estimatedDocumentCount` `count` command bhejta hai.
- **Din ki seema (S10):** value aur dates keys ke liye har (key, area) pe har IST din max 20 badlav.
  - Current document ke `changesToday` me, usi transaction me gine jaate hain.
  - Upar: 429 `AREA_SETTING_TOO_MANY_CHANGES` ("This setting was changed many times today. Try again tomorrow.").
  - Switches bahar hain: wo emergencies hain, aur unka step-up pehle se brake hai.

**`network_area_setting_versions`**: append-only, TTL nahi.
- Fields: `{settingId, key, area, chain, version, action:'set'|'clear', value, reason, changedBy: ObjectId|null, changedSystem: string|null, app, changedAt, requestId}`.
- Indexes: unique `{settingId:1,version:1}`, `{key:1,_id:-1}`, `{'chain.stateCode':1,_id:-1}`.
- History aur audit dono kyun:
  - history setting ki apni diary hai ("3 March ko kya tha");
  - audit tamper-evident security log hai, 400 din rehta hai.
- **Badhat ka guard aur retention (S10)**, andaaze §7 me:
  - **Alert:** ek daily network task (audit ke daily chain check wala scheduled-task pattern) `estimatedDocumentCount` padhta hai aur 60,000 rows (≈ 20 MB) se upar alert deta hai.
  - **Prune (S10 (a) item 3):** 60,000 rows ke upar wahi task safai karta hai. Har setting ke newest 50 versions aur pichhle 400 din ke har version rakhta hai, baaki delete.
    - Settings 500 ke batches me padhi jaati hain, `comment: 'full read: history prune checks every setting'`, `hint {_id:1}` ke saath.
    - Deletes `{settingId, version: {$lte: current − 50}, changedAt: {$lt: now − 400 days}}` hain, unique `{settingId, version}` index pe. Har setting ka delete apne chhote transaction me.
    - Har prune run ki ek System audit entry (`network.areaSettingHistory.pruned`, counts).
    - Owner S10 (b) chune to koi prune task nahi.
  - **Hard stop:** 150,000 rows (≈ 50 MB) ke upar value aur dates badlav 409 `AREA_SETTINGS_FULL` paate hain, jabki switches chalte rehte hain.
    - Row cap ki tarah ye ginti bhi transaction se pehle soft cap ki tarah padhi jaati hai.

### 5.4 Resolver

- **Place:** location facade ka `placeOfPincode` (overrides pehle se lage) → `{stateCode, districtId, pincodeId, retired, deliverable}`.
- **Values:** ek query, to lookup **kul 2 queries**: `find({active:true, key:{$in:keys}, $or:[…]}, {session})`. `$or` me har level ki ek branch, har branch chaaron area fields ke saath:

  | level | `area.stateCode` | `area.districtId` | `area.pincodeId` |
  |---|---|---|---|
  | `global` | null | null | null |
  | `state` | `'MH'` | null | null |
  | `district` | null | D | null |
  | `pincode` | null | null | P |

  Har branch unique index pe seek hai (explain test).
- **Do places** (serviceability: delivery PIN aur warehouse ki jagah): dono places ki deduplicated branches ka ek `$or` (max 7, kyunki global saajha hai) → **1 query**.
- **Bulk** (≥ 3 places: go-live checks, cache warm): har batch ≤ 500 places, har level ki ek `$in` query, phir memory me pure merge.
- Har stored value key ke maujooda schema se dobara parse hoti hai. Invalid value Sentry me log hoti hai aur us level pe unset maani jaati hai, to resolver kabhi crash nahi karta.
- **Output:** `{key, value, from:{level:'pincode'|'district'|'state'|'global'|'default', settingId, version, updatedAt}}`; dates ke liye `from:{level:'merged', parts:[…]}`.
- **Resolver me Redis nahi.** Free mode sirf serviceability aur Ola caches ki ijazat deta hai (ARCHITECTURE §6.6).
- **Facade:** `resolveAreaSettings(place, keys, {session})`, `resolveAreaSettingsFor(places, keys, {session})` (do places, ek query), `resolveAreaSettingsMany(places, keys, {session})`.

### 5.5 Kaun kya badal sakta hai, aur area check

**Permissions** (S5; roles identity `roles.ts` me, usi PR me badle):

| permission | risk / step-up | scope types | roles | apps |
|---|---|---|---|---|
| `network.area_setting.read` | low / nahi | global, state, district | Logistics Head, Planner, Master | logistics, master |
| `network.area_setting.manage` | medium / nahi | global, state, district | Logistics Head, Planner | logistics |
| `network.payment_rule.manage` | high / haan | global, state, district | Logistics Head | logistics |
| `network.area_switch.set` | high / haan | global, state, district | Logistics Head, Master | logistics, master |

Step-up route-wise tay hota hai (route.stepUp permission.mfa ke barabar hona chahiye), isliye har edit permission ka **apna change route** hai.

**`authorizeArea(access, permission, place|'global')`** (platform `authz.ts`):
- **district ya PIN code:** `authorize(access, perm, {state, district})`. PIN code scope type nahi hai, to uski district chain se check hota hai.
- **state:** `authorize(access, perm, {state})`.
- **global:** `scopeSpec(...).global === true` zaroori, warna **403** "Only a global role can change the India-wide value". Bina resource ke seedha `authorize()` kisi bhi scope ko pass kar deta hai (matcher.ts:91).
- *Example:* MH scope wala planner Pune badal sakta hai. Bengaluru Urban pe 404, global pe 403, aur `orders.paused` pe 403.

**Area validation:**
- state `INDIAN_STATES` me ho;
- district ya PIN code transaction ke andar dekha jaata hai:
  - anjaan → 404;
  - retired → 409 `AREA_RETIRED` (clear phir bhi allowed);
  - non-deliverable PIN code pe set → 422 `PINCODE_NOT_DELIVERABLE`;
- jo level key allow nahi karti → 400.

District **grants** identity me T4.3 PR 10 tak mana rehte hain. Tab tak sirf global aur state editors hote hain.

### 5.6 Write flow (3 change routes, ek saajha store function)

**Body:** `{key, area:{level:'global'}|{level:'state', stateCode}|{level:'district', districtId}|{level:'pincode', pincode}, action:'set', value | action:'clear', expectedVersion ≥ 0, reason 5–500}`.

**Saajha store function** `applyAreaSettingChange(change, actor, {session})`. `actor` ya to user `{userId, app, sessionId, roles}` hai ya system `{system:'seed:pune@v1'}`. Teeno routes aur T4.3 ka seed (§6.6) ise hi call karte hain, to har write ko versions, history, audit aur event milte hain.

**`withTransaction` se pehle:**
1. `accessOf`.
2. Value key ke schema se parse karo (switch `true` hi ho). `delivery.holidays` ke liye aaj (IST) − 30 din se purani dates hatao, phir 60-item limit lagao (§5.2).
3. Level check karo.
4. Do soft-cap ginti `estimatedDocumentCount` se padho (sasta metadata, platform/routes.ts:45 wala comment):
   - settings rows;
   - history rows.

**`withTransaction` ke andar, queries ek ke baad ek:**
1. Place dekho, phir `authorizeArea`. Sirf routes: seed ka system actor authorize skip karta hai, aur uski audit entry ye batati hai.
2. Current document padho.
3. `version ≠ expectedVersion` → 409 `AREA_SETTING_CHANGED`, `currentVersion` ke saath. *Example:* do editors version 3 kholte hain; pehla save 4 banata hai; doosre ko 409.
4. No-op (wahi value pehle se active, ya jo active nahi use hatana) → current state lautao, bina version, audit ya event.
5. Limits lagao:
   - naya row jab settings pre-count ≥ 20,000 → 409 `AREA_SETTINGS_FULL`;
   - value ya dates badlav jab history pre-count ≥ 150,000 → 409 `AREA_SETTINGS_FULL`;
   - din ki seema, current document ke `changesToday` se → 429.
6. Insert, ya `version+1` aur `changesToday` ke saath update.
7. History row insert.
8. `writeAudit`: action = route id (seed ke liye `network.areaSettings.seeded`), resource `{type:'area_setting', id}`, scope, before/after, reason, ip, userAgent, requestId, `rolesOf` se roles.
9. `writeEvent('network.areaSetting.changed', {settingId, key, level, area, version, action, changedAt})`, value ke bina: consumers taaza resolve karte hain.

Phir: `idempotency: true` (double tap pehla jawab replay karta hai), aur jawab commit ke baad jaata hai.

**Routes:**

| id | route | permission |
|---|---|---|
| `network.areaSettings.effective` | GET `/network/area-settings/effective?pincode=\|districtId=\|stateCode=` (theek ek) | read |
| `network.areaSettings.values` | GET `…/values?key=&level=&stateCode=&cursor` (`chain.stateCode`/`chain.districtId` pe `scopeFilter`) | read |
| `network.areaSettings.history` | GET `…/history` | read |
| `network.areaSettings.change` | POST `/network/area-settings/changes` | manage |
| `network.paymentRules.change` | POST `/network/payment-rules/changes` | payment_rule (step-up) |
| `network.areaSwitches.change` | POST `/network/area-switches/changes` | area_switch (step-up; apps logistics + master) |

Naye error codes: `AREA_SETTING_CHANGED` 409, `AREA_RETIRED` 409, `AREA_SETTINGS_FULL` 409, `PINCODE_NOT_DELIVERABLE` 422, `AREA_SETTING_TOO_MANY_CHANGES` 429. Naye audit action names, `network.areaSettingHistory.pruned` samet.

**Subscribers (settings ka rechain PR E ka hai):**
- `{'network.areaSetting.changed': []}` PR E me register hota hai; warna uski outbox rows hamesha pending rehti hain. T4.3 cache bump jodta hai.
- **Rechain:** ek network subscriber area-setting rows ka `chain` refresh karta hai. Ye sunta hai:
  - `location.import.completed`, `changesOf(importId, 'moved' | 'reparented' | 'stateChanged' | 'overrideDropped')` page karke, `state:'abandoned'` pe bhi;
  - `location.pincode.overridden`.
- Iski queries indexes use karti hain:
  - moved PIN P: `{'area.level':'pincode','area.pincodeId':P}` (partial index `pincodeId_pin`);
  - district D jiska state badla: `{'chain.districtId':D}` (list index ka prefix).
- Ye eventual hai, seconds me. Beech me values sahi rehti hain, kyunki resolver live chain use karta hai; sirf scoped lists peeche rehti hain.

**Module ki seema:** network `location/index.ts` import karta hai, aur location network ko kabhi nahi. PR 7 ek dependency-cruiser rule `core-modules-no-cycle` jodta hai (`from` `modules/`, `to: {circular: true}`). Saath me ek core test jo fail hota hai agar `modules/location/` ki koi file kisi `network_` collection ka naam le, ya `modules/network/` ki koi file kisi `location_` collection ka. Maujooda facade rule sirf imports pakadta hai, collection-name strings nahi.

**Page** (S7 (a)): logistics "Area settings". Dikhata hai:
- har PIN code, district ya state ki effective value, source ke saath;
- history;
- reason ke saath set/clear;
- holiday pruning ka note.

Payment-rule aur switch forms step-up dialog use karte hain. Browser checks 360/768/1280 pe light aur dark me, plus axe.

### 5.7 PR E edge cases

| Case | Example | Kya hota hai |
|---|---|---|
| State planner global likhe | MH planner, level global | 403 (scopeSpec global zaroori); ek (b) mutation is line ki pehredari karti hai |
| Neeche switch false set karna | MH paused, Pune false bhejta hai | 400; MH hatao aur baaki districts ko pause karo |
| Wo din kholna jo upar ke level ne band kiya | MH 1 May band, Pune kaam karta hai | Pune `{1 May, closed:false}` save karta hai; us date pe paas wala level jeetta hai |
| Do editors / double tap | dono version 3 se | Doosre ko 409; same key wala double tap replay hota hai |
| Re-import ne PIN move kiya | P district X → Y | P ki apni rows rehti hain (pincodeId se keyed); inherited values turant Y ki; scoped lists rechain subscriber ke baad |
| Retired district | retired X pe holidays set | 409; clear allowed |
| Row cap pahuncha | 20,000 stored values | Naye rows 409 `AREA_SETTINGS_FULL`; updates aur clears allowed; storage alert |
| Cap pe parallel writes | ginti 19,999 pe do naye rows | Soft cap: dono pass ho sakte hain (20,001), ping cap ki tarah; parallel writers ki ginti se zyada kabhi nahi |
| Din me bahut badlav | ek script Pune ka cut-off 25 baar badalti hai | 21vi baar 429; switches pe ye seema kabhi nahi |
| History 60,000 se upar | saalon ke edits | Alert; daily prune har setting ke newest 50 versions aur pichhle 400 din rakhta hai; har run ki ek System audit entry |
| History bahut badi | 150,000 version rows | Value aur dates badlav 409; switches chalte hain |
| Holiday list har saal badhe | Pune har saal ~15 dates jodta hai | 30 din se purani dates save pe hatti hain; 60-item limit bache hue ko ginti hai; history purani lists rakhti hai |
| Schema baad me tight hua | max 15 → 10, ek district ke 12 stored | Invalid value log aur skip; usi PR me aisi rows theek karne ki migration |
| Key ka naam badla ya hati | `delivery.cutoff_time` renamed | Anjaan keys ignore; ek forward-only migration rows copy ya tombstone karti hai |
| Inherited ke barabar value | district 14:00 set kare jab global 14:00 | Allowed: ye asli override hai, aur UI ye batata hai |
| Form khula tha aur grant khatam | validTo beet gaya | Save pe 403 |
| City-scoped role | City manager cut-off badalta hai | 404: chain me city nahi; city roles ko edit permission nahi |
| System writer | Pune seed Pune ki holidays set karta hai | Wahi store function: version, history, audit ("System (seed:pune@v1)"), event, holiday pruning; `updatedBy: null` + `updatedSystem` |
| Event jiska abhi koi subscriber nahi | T4.3 se pehle PR E | Khaali list ke saath registered, to 0 subscribers ke saath relay hota hai |

---

## 6. T4.3 Network: design (network, serviceability, Pune seed)

### 6.0 Kya milega (lakshya)

- Network records write APIs aur pause/close ke saath: warehouses, cities, hubs, lanes, aur areas (STATE, DISTRICT, PINCODE, har ek ka status).
- Ek public serviceability API:
  - CDN pe aur ek bounded Redis cache me cached;
  - uske Mongo reads ek global read budget se bandhe (N17);
  - checkout ke andar Mongo me dobara check.
- Identity ek khud theek hone wali copy se hub, city, warehouse aur district ids seekhta hai, to wo grants mumkin hote hain. Master Staff page ko milta hai:
  - district, city, hub aur warehouse pickers (T3.7 faisla 3; N16);
  - uske tables me jagah ke naam.
- Pune seed (Chakan + 21 hubs, LGD codes se keyed) aur global national holiday list (S9).
- Customer PIN check, aur logistics network pages (N5).
- *Example:* Bhor taluka ka PIN → Bhor taluka hub → lane transit 1 din. Mon 16 Nov 1:30 pm ka order Wed 18 Nov pahunchta hai.

### 6.1 Collections (core `network_` prefix; states ke liye `stateCode`, baaki sab ObjectIds; +5 collections)

**`network_warehouses`**
- Fields:
  - pehchaan: `code` (unique, `chakan-fc`), `name`;
  - jagah: `stateCode`, `districtId`, `subDistrictId`, `address{…, pincodeId, pincode}`, `point` (GeoJSON);
  - dummy legal data: `gst{gstin (dummy, valid check digit), isDummy:true}`, `licences[{type, number, validTo}]`;
  - operations: `hours`, `dispatchCutoff 'HH:mm'`;
  - halat: `status` PLANNED|READY|ACTIVE|PAUSED|CLOSED, `version`, `updatedAt`.
- Settings resolver ke liye iski jagah `{stateCode, districtId, pincodeId: address.pincodeId}` hai, to serviceability ko alag location lookup nahi chahiye.
- Indexes: `{code:1}` unique, `{stateCode:1,status:1}`, `{districtId:1}`, `{subDistrictId:1}` (LIVE guard, reparent flag), `{updatedAt:1}` (catch-up sweep).

**`network_cities`**
- Fields: `code` (unique), `name`, `stateCode`, `districtId` (theek ek district), `kind` CITY|CLUSTER, `status`, `version`, `updatedAt`.
- Indexes: `{code:1}` unique, `{districtId:1}`, `{updatedAt:1}`.

**`network_hubs`**
- Fields:
  - pehchaan: `code` (unique), `name`, `kind` CITY|TALUKA;
  - jagah: `stateCode`, `districtId`, `subDistrictId`, `cityId` (**zaroori**: shared-authz bina city ke hub mana karta hai, matcher.ts:65-80), `address`, `point`;
  - `zone` (Polygon ya null; T8.4 routing ke liye, serviceability use nahi karti);
  - operations: `capacity{ordersPerDay, riders}`, `hours`;
  - halat: `status`, `version`, `updatedAt`.
- Indexes: `{code:1}` unique, `{cityId:1,status:1}`, `{districtId:1,status:1}`, `{subDistrictId:1}` (LIVE guard, reparent pe `HUB_DISTRICT_MISMATCH`), `{stateCode:1}`, `{updatedAt:1}`.

**`network_lanes`**
- Fields: `fromWarehouseId`, `toHubId`, `transitDays` (0–7), `departs`, `primary`, `status` ACTIVE|PAUSED|CLOSED, `stateCode`, `districtId`.
- Indexes: unique `{fromWarehouseId:1,toHubId:1}`; partial unique `{toHubId:1}` jahan `primary:true, status:'ACTIVE'`.

**`network_areas`** (document nahi matlab CLOSED, to 19k PIN codes ko khaali rows nahi chahiye; document khud bhi CLOSED ho sakta hai)
- **Fields:**
  - `area:{level:'STATE'|'DISTRICT'|'PINCODE', stateCode|null, districtId|null, pincodeId|null}`: sirf us level ki apni id set hoti hai;
  - chain: `stateCode`, `districtId|null`, plus `pincode` (display);
  - `hubId` + `cityId` (PIN code level pe ye **PIN → hub assignment** hai, status kuch bhi ho rakha jaata hai);
  - status fields: `status`, `statusReason`, `statusChangedAt`, `statusChangedBy: ObjectId|null`, `statusChangedSystem: string|null` (seed `null` + `'seed:pune@v1'` likhta hai), `liveSince`;
  - `flags[]` (jaise `HUB_DISTRICT_MISMATCH`), `version`.
- **Indexes:**
  - unique `{'area.level':1,'area.stateCode':1,'area.districtId':1,'area.pincodeId':1}` (queries chaaron fields deti hain, jahan kaam nahi wahan null);
  - `{hubId:1,status:1}`, `{districtId:1,'area.level':1,status:1}`, `{stateCode:1,'area.level':1,status:1}`.

**Niyam:**
- Ek PIN ka ek waqt me ek hub (unique area key).
- Hub sirf apne district ke PIN serve karta hai (N8).
- Orders apna `hubId` snapshot rakhte hain, to reassignment sirf naye orders pe asar karta hai.

### 6.2 Status machine

| Se → Tak | Kaun | Task |
|---|---|---|
| CLOSED → PLANNED → READYING | Door A (planner → Logistics Head; naye state ke liye Master ka doosra signature) | T4.4 |
| CLOSED → READYING | Door B (Master, step-up) | T4.4 |
| READYING → LIVE, PAUSED → LIVE | **sirf** `goLive` (saare items PASS, state pehle) | T4.4 |
| LIVE → PAUSED | `network.area.pause` (Logistics Head; state scope me Planner; step-up; reason) | T4.3 |
| koi bhi → CLOSED | `network.area.close` (global; step-up; reason) | T4.3 |

- T4.3 ka koi code path LIVE nahi likhta: status helper me LIVE target hi nahi, aur ek unit test plus ek (b) go-live mutation ise bachate hain.
- Areas ke liye READY checklist ka nateeja hai, status nahi (N11). Hubs aur warehouses ka READY saved status hai (neeche).
- Hubs aur warehouses: PLANNED → READY (City Logistics Manager attest karta hai) → ACTIVE (sirf goLive se) → PAUSED/CLOSED.

### 6.3 Serviceability

**Route** `network.serviceability.get`:
- GET `/network/serviceability?pincode=411038`; public; app customer.
- Rate limit `search` (120/min/IP; rate-limits.ts:21-30); strict query schema.
- `cache {sMaxAge:120, staleWhileRevalidate:60}` (N7); non-200 jawabon pe gateway no-store bhejta hai.

**Steps (pehle Redis):**
1. Galat format → 400.
2. **Redis:** GET `bq:svc:pin:gen` (na ho to bump script banati hai), phir GET `bq:svc:pin:<gen>:<pincode>`. Hit pe stored facts se promise nikalo, jinme location facts bhi hain: **0 Mongo reads**.
3. **Read budget (N17).**
   - Neeche ke har Mongo read step se pehle `INCRBY bq:svc:pin:reads:<epoch second> <n>` (EX 5): step 4 se pehle n = 1, step 5 se pehle 1, aur steps 6–7 se pehle 4.
   - Counter **30** se upar jaaye to jawab 503 `SERVICE_BUSY` "Please try again in a moment", `Retry-After: 5` ke saath, cached nahi.
   - Isliye ye route kitna bhi traffic ho, har second 30 se zyada Mongo reads kabhi nahi karta.
   - Anjaan PIN codes ki baadh (har ek 1 read) ko 30 per second tak pahunchna padta hai (lagbhag 15 IPs, har ek per-IP limit pe) tab jaake kisi ko "busy" dikhe. Purane 5-misses wale niyam me 3 IPs kaafi the.
   - Checkout facade pe kabhi limit nahi.
4. **Location lookup (1 read):** anjaan → 404 `PINCODE_NOT_FOUND`; `deliverable:false` → `NOT_DELIVERABLE`; retired → anjaan ki tarah.
5. **Areas (1 read):** `network_areas.find({$or:[state, district, pincode branches]})` (exact seeks). Sabse kamzor status jeetta hai:
   - koi CLOSED ya PLANNED, ya PIN code ka doc nahi → `NOT_SERVED`;
   - koi READYING → `COMING_SOON`;
   - koi PAUSED, ya kisi level pe `orders.paused` → `PAUSED`;
   - sab LIVE → `SERVED`.
6. **Hub, lane, warehouse (3 reads):** hub ACTIVE → primary ACTIVE lane → warehouse ACTIVE. Kuch bhi missing → `PAUSED` + error log (kharab data, customer ki galti nahi).
7. **Settings (1 read):** delivery PIN aur warehouse ki jagah, dono ke liye ek resolver query (§5.4).
8. Promise nikalo.
9. **Sirf positive:** agar PIN ka PIN area doc hai aur write budget ijazat de, to step 2 me padhe gen ke neeche facts SET karo, EX 600 ke saath.

**Har jawab ke Mongo reads:** Redis hit 0; anjaan PIN 1; not served 2; served miss 6.

**Jawab:** `{pincode, state{code,name}, district{id,name}, status, promise:{orderBy, ifOrderedBefore, ifOrderedAfter}|null, upiOnDelivery:{allowed, maxOrderPaise}, notifyMe, checkedAt}` (example §0.4 me).
- Hub public jawab me nahi (N6).
- Internal facade `serviceabilityFor(pincode, {session})` hamesha Mongo padhta hai aur checkout ke liye hubId, warehouseId aur laneId jodta hai (T7.2 order transaction ke andar dobara check karta hai).
- Staff route `GET /network/pincodes/:pincode` (`network.place.read`) sab kuch dikhata hai, `districtSource` samet.

**Promise** (saara calendar hisaab IST me, naye `@beautinique/shared-utils` helpers se: `istMinutesOfDay`, `istWeekday`, `addDaysToKey`, `istInstant`):
- **Asli cut-off** = `delivery.cutoff_time` aur warehouse `dispatchCutoff` me jo pehle (N13). Theek cut-off pe order **baad** gina jaata hai.
- **Dispatch day** = aaj, agar cut-off se pehle aur aaj warehouse ka working day ho (warehouse-place ki holidays aur weekly off); warna agla working day.
- **Hub day** = dispatch day + lane `transitDays`.
- **Delivery** = hub day ke baad `last_mile_days`-va delivery working day (0 = hub day khud, agar working day ho).
- `ifOrderedAfter` = agle dispatch day se wahi hisaab.
- Loops 60 din pe rukte hain → `promise:null` + error log.

**Worked examples** (Mon 16 Nov 2026, cut-off 14:00, last-mile 1):
- 411038, city lane 0 din: 1:30 pm ka order → dispatch Mon → **Tue 17 Nov**; 3:00 pm → **Wed 18 Nov**.
- Bhor taluka ka PIN, lane 1 din: Mon 1:30 pm ka order → hub Tue → **Wed 18 Nov**.
- Tue 17 Nov Pune holiday: 411038 ka Mon 1:30 pm order → dispatch Mon (Monday khula) → Tue skip → **Wed 18 Nov**.
- 00:10 Tue IST = 18:40Z Mon: IST date key Tuesday kehti hai. UTC date galti se Monday kehti.

**Redis facts cache** (Ola token ke saath saajhe 4 MB cache budget ke andar, ARCHITECTURE.md:203; har key ka TTL; sab `bq:svc:pin:*` ke neeche):

| key | TTL | kya |
|---|---|---|
| `bq:svc:pin:gen` | EX 86,400, har bump pe refresh | generation |
| `bq:svc:pin:<gen>:<pincode>` | EX 600 | clock-free facts: location (state, district, deliverable), statuses, hub, warehouse, transit, cut-offs, last-mile, agle 60 din ki holidays, weekly off, paused, UPI |
| `bq:svc:pin:budget:<10-minute window>` | EX 1,200 | write counter |
| `bq:svc:pin:reads:<epoch second>` | EX 5 | Mongo read budget counter (step 3, N17) |

- **Bump:** ek atomic Redis script `gen = max(old + 1, now in ms)` EX 86,400 ke saath set karti hai. Missing gen clock se dobara banta hai, to aisi value kabhi dobara use nahi hoti jiske entries ab bhi zinda ho sakti hain. Koi open-areas key nahi; kisi ko zaroorat nahi thi.
- **Subscriber** `core.svcCacheBump` har `network.*` event, `network.areaSetting.changed`, `location.import.completed` aur `location.pincode.overridden` pe bump karta hai.
- **Race:** reader pehle `gen` padhta hai, phir Mongo, phir usi gen ke neeche SET karta hai, to purana hisaab kabhi naye gen ke neeche nahi utar sakta.
- **Sirf positive:** NOT_SERVED aur anjaan PIN codes kabhi cache nahi hote (noeviction; enumeration Redis ko badha na sake).
- **Write budget:** har SET se pehle window counter INCR; 3,000 se upar write skip (har window me ek baar log). To max ~6,000 zinda entries (do overlapping windows).
- **Size, naapa hua, andaaza nahi:**
  - Ek entry ki keemat uski ~350 B value plus key ka naam aur Redis ka per-key overhead. Andaaza kul ~450 B, to 6,000 ke liye ~2.7 MB.
  - Valkey test representative entries likhta hai, har ek ka `MEMORY USAGE` padhta hai, aur assert karta hai `2 × write budget × naapa size ≤ 3.5 MB`.
  - Fail ho to write budget constant ghatta hai, threshold kabhi nahi badhta.
- Redis down → Mongo padho (tab read budget nahi) aur warning log karo.

### 6.4 Write APIs, permissions, events (N14)

**Contract routes** (logistics app): poori chain `{state, district, city, hub}` ke saath `authorize`, lists pe `scopeFilter`, Idempotency-Key, usi transaction me audit + event, optimistic `version` (takraav pe 409).

| Kya | Permission |
|---|---|
| Hubs, cities, warehouses (create/update; delete nahi, uski jagah CLOSED) | `network.hub.manage`, `network.city.manage`, `network.warehouse.manage` (global, state; medium) |
| Lanes | `network.lane.manage` (+ Line-haul) |
| PIN code assign/unassign | `network.pincode.assign` |
| Pause | `network.area.pause` (high, step-up) |
| Close | `network.area.close` (global, high, step-up) |
| Padhna | `network.place.read` (global, state, district, city, hub, warehouse) |

**Events**, har ek ki relay map entry ke saath (aur isliye `event-catalogue` fingerprint ka hissa):
- `network.place.changed` (hub/city/warehouse snapshot: id, type, code, name, chain, status, version)
- `network.pincode.assigned`
- `network.area.statusChanged`
- `network.lane.changed`

**T4.3 location subscribers me jodta hai** (settings ka rechain PR E ka hai):
- `network_areas` pe chain refresh:
  - moved PIN: unique area key pe exact seek;
  - jis district ka state badla: `{districtId, 'area.level'}` index;
- `HUB_DISTRICT_MISMATCH` flag jab PIN ka effective district uske hub ke district se na mile, aur jab hub ka sub-district reparent ho (hubs `subDistrictId` se milte hain);
- alert.

Ye importer ke liye LIVE guard hook bhi composition root se register karta hai (§3.5).

### 6.5 Identity scope-id validation aur Staff place pickers (N2, N16; PRs 10 aur 10b)

**Core bhejta hai:**
- `network.place.changed`;
- har state ka `location.districts.changed`: `{stateCode, version, districts:[{id, lgdCode, name, retired}]}`, 16 KB event limit ke neeche. `version` = import ka ObjectId; imports lease ke neeche ek-ek karke chalte hain, to baad wala bada hota hai.

**Kiska kya** (iske liye koi module doosre ko import nahi karta):

| Hissa | Owner | Kaise |
|---|---|---|
| `location.districts.changed` | location | import finish pe likha jaata hai (§3.5 step 6); facade `resendDistrictEvents()` `stateCode_name` se har state ke districts padhta hai; release step `location-districts-first-copy` |
| `network.place.changed` | network | iske write APIs likhte hain; facade `resendPlaceEvents()`; release step `network-places-first-copy`; catch-up task |
| `resendPlaceEvents()` padhta hai | network | hubs, cities aur warehouses, `comment: 'full read: resend every place after an identity reset'`, `hint {_id:1}`, 500 ke batches |
| `npm run db:resend-places [--env live]` | bundle (composition) | root script `"db:resend-places": "npm run resend-places --workspace bundle --"`; dono facades `core/src/service.ts` se call karta hai; location CLI wala hi fingerprint guard aur typed `live` |
| Dono release steps register karna | core `src/release.ts` + `modules/index.ts` (composition) | har module apna step export karta hai |

Network location ka facade import karta hai; location network ko kabhi nahi (dependency-cruiser `core-modules-no-cycle`, §5.6).

**Pehli copy aur uski marammat, chaar raaste:**
1. **Release steps.** Upar ke do one-time release steps, saare 36 states aur har place ke liye. Live pe T4.2 import is PR se pehle chal chuka hoga.
2. **Import finish.** Har import finish har us state ka event bhejta hai jiske districts badle (renamed, reparented, retired, restored, added). Ye naye laptop aur CI DBs (release → import) cover karta hai.
3. **Haath se resend.** `npm run db:resend-places [--env live]` saare states aur saari places dobara bhejta hai, identity DB reset ya dead letter ke baad.
4. **Catch-up task.** Har start ke ~5 minute baad ek network catch-up task (lease, 4 attempts, identity ke sweep wala pattern). Ye un places ko dobara bhejta hai jinka `updatedAt` us start se pehle ke 30 minute me hai, jo deploy overlap cover karta hai (`{updatedAt:1}` indexes).

**Identity:**
- Apne maujooda `q.identity` consumer (runtime.ts:79, `subscriptions: []` at :206) me apna pehla event subscription jodta hai, plus `processed_events`. Koi naya Redis connection nahi.
- Subscriber `identity.placeCopy` `identity_places{_id = wahi ObjectId, type, stateCode, districtId, cityId, name, status, version}` rakhta hai; newest version jeetta hai. Index `{type:1, stateCode:1, name:1}`.
- `scopeIdProblems` scope ki ids ek `_id $in` query se pehle load karta hai aur us map se synchronous `ChainOf` banata hai:
  - hub → {state, district, city};
  - city → {state, district};
  - warehouse → {state, district};
  - district → {state}.
- `NOT_KNOWN_YET` hata diya jaata hai.

**Jawab:**
- anjaan id → "This hub is not known. If it was just created, try again in a minute.";
- CLOSED ya retired jagah → naya grant mana.

**Staff place pickers aur naam (PR 10b, N16 (a)):**
- **Search route.** Naya contract route `iam.places.list`: GET `/iam/places?type=district|city|hub|warehouse&stateCode=&q=&cursor`, permission `iam.grant.read`.
  - Sirf wo jagahein list karta hai jo caller ke apne grant scope ke andar hain; wahi containment jo identity grant save karte waqt lagata hai.
  - `identity_places` upar wale index se padhta hai.
  - CLOSED aur retired jagahein bahar, kyunki unka grant nahi ho sakta.
- **Names route.** Naya contract route `iam.places.byIds`: GET `/iam/places/by-ids?ids=<max 100, comma-separated>`, permission `iam.grant.read`, `identity_places` pe ek `_id $in` query.
  - CLOSED aur retired jagahein bhi lautata hai, unke status ke saath.
  - Caller ke scope ke bahar ki ids `{id, hidden:true}`, aur anjaan ids `{id, unknown:true}` aati hain.
- **Master `RoleForm`** (frontend/master/src/staff/role-form.tsx):
  - `GIVABLE_SCOPES` me district, city, hub aur warehouse judte hain.
  - Scope step ek picker dikhata hai jo `iam.places.list` se naam se dhoondhta hai.
  - `NOT_YET` (labels.ts:40-44) ki chaar "Comes with the location master" entries hat jaati hain.
  - Brand, category, sellerOrg aur creatorAgency apni wajah ke saath disabled hi rehte hain.
- **`scopeText` ginti ki jagah jagah ke naam dikhata hai**, jaise "Hubs: Kothrud–Warje, Baner–Aundh".
  - People aur Invitations tables (people.tsx:113, :320; invitations.tsx:82) page ki ids jama karke ek `iam.places.byIds` call karti hain.
  - Band hub "Kothrud–Warje (closed)" dikhta hai; hidden ya anjaan "1 other hub".
  - Audit viewer ka "Where" (audit-log.tsx:358) wahi call use karta hai jab viewer ke paas `iam.grant.read` ho; warna ginti wala text.
- *Example:* Master Staff → Priya → Give role → "Hub Manager" kholta hai → "Koth" type karta hai → "Kothrud–Warje" chunta hai → save. Identity us hub ko chain {MH, Pune, city Pune} ke saath dhoondh ke allow karta hai. People table phir "Hubs: Kothrud–Warje" dikhata hai.
- N16 = (a) ho to Logistics Head ka apna Staff page (logistics app) PR 1 me T6.5 ki logistics line me likha jaata hai.

### 6.6 Pune seed aur national holidays (PR 11; N1, N3, N9, N10, S9)

**Data file** `backend/core/data/network/pune.json` (`src/` ke bahar data, test me zod se validated). Isme:
- state `MH`; district LGD code se; talukas LGD sub-district code se (to Velhe/Rajgad sirf location se liya display naam hai);
- PIN codes code se, baaki sab apne `code` se;
- 1 warehouse (Chakan MIDC, Khed, dummy address aur GSTIN, `isDummy`);
- 2 cities (Pune, Pune Rural);
- 21 hubs (8 CITY, 13 TALUKA) dummy points ke saath (public locality centres, 3 decimals);
- 21 primary lanes;
- saaf PIN → hub list, plus bahar rakhe PIN codes wajah ke saath;
- Pune ki area-setting values (cut-off, last-mile, dummy Pune holiday list, UPI cap);
- suggestion settings (city catchment 6 km, fringe band 12 km).

**Data file** `backend/core/data/network/holidays-india.json` (S9): 2026 aur 2027 ki global national holidays (26 Jan, 15 Aug, 2 Oct; dummy policy), har ek naam ke saath.

**Suggestion script** (laptop, T4.2 data padhti hai; N9):
- Jis PIN ka centre kisi city hub se 6 km ke andar → nazdeeki city hub, sub-district kuch bhi ho (LGD gaon hon to flag `VILLAGES_IN_URBAN_PIN`).
- Baaki har PIN → uske sub-district ka taluka hub. Sub-district na ho to nazdeeki taluka hub + flag.
- Barabari pe chhota hub code.
- **Flags:**
  - `FRINGE` (centre nazdeeki city hub se 6–12 km);
  - `SUBDISTRICT_CLOSE_VOTE`;
  - centre point nahi;
  - centre district ke bahar;
  - suggested hub se 25 km se zyada;
  - kisi bhi tarah ka nazdeeki hub suggestion se 5 km se zyada paas.
- Owner **sirf flagged rows** dekhta hai, kinare wali list samet (jaise 411057, 412207, 411028, 411048, asli file se). File nateeja save karti hai, to seeding kabhi dobara andaaza nahi lagati.

**CLI** `npm run db:seed-network -- --file pune` aur `-- --file holidays-india` (`--env live` + `live` type karna):
1. Poori file validate karo.
2. Har code ko ObjectId me badlo. Koi anjaan ya retired code, ya location data missing ho, to kisi bhi write se pehle run rukti hai ("import the location data first").
3. Har hub ka ek chhota transaction likho, ek ke baad ek, jisme:
   - hub, uska lane aur uske PIN code area docs (`statusChangedBy: null`, `statusChangedSystem: 'seed:pune@v1'`);
   - actor `system:'seed:pune@v1'` ke saath audit;
   - events.
4. Area settings (Pune values, national holidays) `applyAreaSettingChange` se system actor ke saath likho, har (key, area) ka ek chhota transaction. Har ek ko version, history, audit, holiday pruning aur `network.areaSetting.changed` event milta hai.

**Behaviour:**
- Idempotent: same document ya same setting value skip (store function ka no-op niyam).
- Planner ke edits **drift** ke roop me report hote hain, overwrite nahi (sirf `--update`, audited).
- Kabhi LIVE nahi: schema me LIVE value hi nahi, aur ek test ye saabit karta hai.
- Statuses: hubs aur warehouse PLANNED; PIN code area docs CLOSED, `hubId` ke saath; koi state ya district area doc nahi.
- Har saal 1 December se ek daily network task alert deta hai agar global holiday list me agle saal ki koi date nahi (S9).

### 6.7 UI (N5, N15, N16)

**Customer `PincodeCheck`** (abhi home page; product page T4.6 ke saath, uski line me likha jayega):
- States:
  - SERVED: "Delivery by Tue, 17 Nov if you order in the next 2 h 30 min";
  - COMING_SOON / NOT_SERVED, Notify-me slot ke saath (T4.4);
  - PAUSED, anjaan, galat format, busy (503: "Please try again in a moment"), aur server jaag raha hai.
- Guest ka PIN code **sirf us visit ke liye memory me** rehta hai; owner N15 ka jawab de tab tak kuch persist nahi hota.
- "Data sources" credits section (L19) yahan judta hai agar T4.2 PR 4 ne pehle se nahi joda.

**Logistics app:**
- Sign-in aur account PR 5 me, PIN review page PR 6 me, area settings page PR 7 me.
- T4.3 PR 13 jodta hai: areas, hubs aur unke PIN codes, PIN lookup, reassign aur pause.

**Master app:** Staff place pickers aur jagah ke naam PR 10b me (§6.5).

Har UI badlav asli browser me 360, 768 aur 1280 px pe light aur dark me check hota hai (RULES §1.5, §5.6), plus axe.

### 6.8 M4 demo ke liye T4.4 ko kya jodna hai (PR 1 me T4.4 line me likha jaata hai)

- Door A aur Door B (Master) → READYING.
- Ek Pune checklist template jo M4 me pass ho sake (riders, GST/TCS aur support ke liye N4 attestations), checklist screens, aur L22 wala "mapped" predicate.
- Har hub ka ek Hub Manager, Master app me PR 10b ke picker se. Ek dummy insaan ek grant me saare 21 hub ids rakh sakta hai.
- `goLive` (transaction + identity grant snapshot call) aur `expansion.area.wentLive` → cache warm, Notify me. Naam contracts EVENT_TYPE regex ke hisaab se camelCase hai, aur ARCHITECTURE §8.8 usse milaya jaata hai.
- `open-district-by-config` CI test, T4.3 ke public write APIs se.

### 6.9 T4.3 edge cases

| Case | Example | Kya hota hai |
|---|---|---|
| Galat format | '41104', '041104', 'abcdef' | 400 "Enter a valid 6-digit PIN code", kabhi cached nahi |
| India Post ka PIN nahi | 999999 | 404, kahin cached nahi, search rate limit, budget se 1 read |
| Sirf non-delivery offices | deliverable=false | `NOT_DELIVERABLE`, notifyMe false |
| LIVE district, PIN unmapped | re-import ke baad naya PIN | NOT_SERVED; post-live checklist alert |
| District LIVE par state nahi | data error | Sabse kamzor status → not served |
| State ya global pause | MH pe `orders.paused` | MH ke saare PIN PAUSED; gen bump; CDN max ~3 min purana; checkout mana karta hai |
| Hub paused, ya primary lane nahi | baadh ki wajah se Bhor hub paused | Uske PIN PAUSED; missing lane error bhi log karta hai aur alert deta hai |
| Theek cut-off pe | 14:00:00 IST | Cut-off ke baad gina jaata hai |
| Client ki ghadi galat | phone 20 min aage | Sirf dikhane ke liye; checkout server ki ghadi se dobara nikaalta hai |
| Lambi holiday ki lagatar | 3 din ka tyohaar + weekly off | Skip; 60 din pe stop |
| Agle saal ki national holidays nahi daali | 1 Dec, global list December me khatam | Logistics Head ko daily alert (S9); promises chalte rehte hain, bas agle saal ki holidays ke bina |
| Do planners ek PIN reassign karein | 411038 do hubs ko | Version / unique area key → doosre ko 409 |
| Chalte orders ke saath reassign | 30 orders bahar | Orders apna hub snapshot rakhte hain |
| Bina city ka hub | taluka hub, khaali cityId | zod mana karta hai |
| Do districts me phaili city | ek metro | Har district ka ek city record |
| Doosre district ko serve karta hub | Pune hub Satara ka PIN le | Mana (N8) |
| Gaon wala shehar-kinare ka PIN | 411057 | Catchment rule → city hub; owner ki kinare wali list me |
| Re-import served PIN ko move ya retire kare | district split | `--accept-live-changes` + `--note` ke bina import rukta hai; baad me area doc flag aur alert |
| Override mapped PIN ko doosre district me le jaaye | planner override | `HUB_DISTRICT_MISMATCH`; us district ka "all mapped" fail → alert; planner reassign karta hai |
| Hub ka sub-district reparent | taluka naye district me gaya | LIVE guard (hub `subDistrictId` se mila); baad me `HUB_DISTRICT_MISMATCH` |
| Redis down, bhara ya saaf | OOM, restart | Mongo raasta; positive-only cache + write budget usage ko naapi seema me rakhte hain; missing gen clock se dobara |
| 10 minute me kai generations | planner 30 settings save kare | Purane generations 600 s me expire; write budget kul ko bandhta hai |
| Cache busting | `?pincode=411038&x=1` | Strict schema → 400 |
| Enumeration | ek bot 19k PIN check kare | Unserved: har ek 2 indexed reads, Redis write nahi; served: 10 minute me max 3,000 writes; per-IP rate limit; read budget kul ko bandhta hai |
| Kuch IPs se anjaan PIN ki baadh | 3 IPs × 2/s random PIN | 30 ke budget me se 6 reads/s; asli customer ka served miss (6 reads) phir bhi jawab paata hai |
| Badi distributed baadh | ≥ 30 reads/s, lagbhag 15+ IPs se | Redis me na pade PIN ke liye 503 `SERVICE_BUSY`; cached PIN aur checkout pe asar nahi; is route ka Mongo kharch ≤ 30 reads/s |
| Seed do baar / planner edits ke baad / location import se pehle | network drop, capacity badli, khaali live DB | Same skip / drift report / kisi write se pehle stop |
| Abhi bane hub ka grant | banne ke seconds baad | Picker me abhi nahi; API se: "not known yet, try again in a minute" |
| Identity DB reset ke baad grant | copy khaali | `npm run db:resend-places`, phir allowed |
| CLOSED hub ka grant | pichhle hafte band hua | Picker me nahi; identity mana karta hai |
| Purana grant us hub pe jo baad me band hua | band hub pe Priya ka grant | People table "Kothrud–Warje (closed)" dikhata hai (byIds band jagahein lautata hai) |
| Scope ke bahar edit | MH planner KA hub badle | 404; Hub Manager reassign kare to 403 |

---

## 7. M0 budget (Atlas uncompressed BSON + index bytes ginta hai)

Repo ke bson (`calculateObjectSize`) se document shapes pe naapa gaya, ek scratchpad script (`bson-size3.cjs`) se jo repo me nahi hai.

| Collection | Docs | Bytes/doc | Data |
|---|---|---|---|
| location_pincodes | ~19,600 | ≈ **880** (note 1) | **17.2 MB** (isme office names ≈ 9.6 MB) |
| location_subdistricts | 7,112 | 164 | 1.17 MB |
| location_districts | 790 | 159 | 0.13 MB |
| location_imports + changes | saal me kuch / har import me kuch sau | ~500 / 191 | < 0.1 MB/saal |
| **Data total** | | | **≈ 18.5 MB** |
| Indexes | ~83k entries × 10–40 B + 13 indexes × 36 KB floor | | **≈ 1.3–3.8 MB** |
| **Location total** | | | **≈ 20–22 MB = 512 MB ka 3.9–4.4%** |
| Area settings (PR E) | 328 B per row | Pune launch ~20 rows ≈ 7 KB | 20,000 stored values pe capped ≈ 6.6 MB |
| Area-setting history (PR E) | ~330 B per badlav | note 2 | note 2 |
| Network (T4.3) | Pune: 1 + 2 + 21 + 21 + ~200 area docs (~300 B) | | ≈ 0.1 MB (baad me poora India ≈ 6 MB) |
| Gaon (proposed nahi) | 677k × ~170 B | | ≈ 115 MB + indexes |

Notes:
1. PIN code document 371 B base hai, plus 58 B × 8.45 offices (165,627 rows ÷ 19,600), plus `alsoIn` ke ~18 B (unme se ~20% pe +91 B). Jin kuch pe override ya confirmation hai, wo ~130 B aur jodte hain.
2. History Pune ke liye ~0.6 MB/saal (~5 badlav/din) aur poore India ke liye ~6 MB/saal (~50/din) badhti hai. 60,000 rows (≈ 20 MB) pe alert. 60,000 ke upar S10 prune har setting ke newest 50 versions plus pichhle 400 din rakhta hai. Non-switch badlav 150,000 rows (≈ 50 MB) pe rukte hain. Detail §5.3 me.

**Baaki budgets:**
- **Ops, pehli import:** 27,502 upserts (790 + 7,112 + 19,600) + ~551 progress updates (additions ki change rows nahi) ≈ 28,053 documents ÷ 50/s ≈ **9.4 min**, plus verify diff (lagbhag 1 min).
- **Ops, re-imports:** badle records + unki change rows + progress updates, 50 docs/s pe.
  - Shaant quarter kuch sau writes, ek minute se kam.
  - 2,000 badlav wala bhaari quarter ≈ 4,040 documents ≈ 81 s.
- **Diff** 500 ke ~55 batches 1 s ke pause ke saath padhta hai ≈ 1 min.
- **Network in:** ≈ 18.5 MB × 1.15 ≈ 21 MB, 7 din ke 10 GB ka lagbhag 0.2%.
- **Collections:** +5 (location) + 2 (PR E) + 5 (T4.3) + 1 (`identity_places`, bq_identity, PR 10) = 500 me se 13.
- **Committed text:** ~6–7 MB, git pack me lagbhag 2 MB (andaaza; pack aaj 7.85 MiB hai).
- **Redis:** serviceability facts ≤ ~2.7 MB andaazan (6,000 entries × ~450 B), test seema 3.5 MB, 4 MB cache budget ke andar (§6.3).
- **Mongo ops, PIN check:** max 30 reads/s is route pe (N17).

---

## 8. PR breakdown

Har PR `prerelease` se branch hota hai aur `prerelease` me wapas jaata hai. CI `check` green zaroori; approval nahi chahiye. Commit aur push sirf jo insaan kaam kar raha hai uske kehne pe. Kahin bhi AI attribution nahi. Branch names maujooda jaise, jaise `feat/t4.1-authorize`.

**Har PR ki saajhi checklist:**
- [ ] code + unit tests + zaroori integration/E2E tests
- [ ] lint (dependency-cruiser facade aur no-cycle rules, geo aur role lint), typecheck, format
- [ ] profiler (har query indexed, jaan-boojh ke poore reads commented) aur ObjectId guards green
- [ ] mutations sirf wahan jahan RULES §6.2 kehta hai, category ke naam ke saath: (b) authz, money, go-live, checkout; (c) koi nahi
- [ ] UI: asli browser me 360/768/1280, light + dark, axe
- [ ] docs update, change-log line ke saath (Hinglish)
- [ ] kaam rokte waqt HANDOFF §1/§4
- [ ] koi checkbox badle to TASKS §P table, poora %, itihaas line aur HANDOFF "Progress" line **usi commit me**

**Step 0 (PR 1 se pehle):**
- Owner §1 ke sawalon ke jawab deta hai. Kuch ruk sakte hain: L13, L15 aur L22 PR 5 tak; L20 PR 2 me numbers ke saath pakka; S10 PR 7 tak; N17 PR 9 tak.
- Owner §2 ke downloads shared folder me karta hai.

### 8.1 T4.2 (6 PR + live)

**PR 1: `feat/t4.2-location-prepare`**
- [ ] location module ka dhaancha
- [ ] dataset zod schemas, CSV reader, format sniffer, `prepare` + CLI subcommand. `prepare` pure hai aur cover karta hai:
  - dono vote orders, office winner rule ke saath;
  - thresholds ke saath cross-state rule;
  - portal parent se village districts, `VILLAGE_CODES_STALE` ke saath;
  - saare village checks.
- [ ] `rules.json`: asli header texts se mapped column lists, `crossStateStop`, `villageChecks`
- [ ] khaali `aliases.json`
- [ ] `SOURCE.md` (Hinglish, status header, change log, dekhe gaye formats, download steps, attribution text; naamon ka varnan ARCHITECTURE:321 jaisa, columns ke baare me koi extra note nahi)
- [ ] `.gitignore` `raw/`, `.prettierignore`
- [ ] fixtures: trimmed asli rows (official, attributed), plus synthetic contingency cases:
  - formats: UTF-16, BOM, title/footer rows, merged headers, error page, galat encoding;
  - village files: kati hui file, round count pe saaf capped state, kam sub-district coverage wala state, purane parent district wali village row, retired sub-district code wali village row;
  - votes: border paar bhatka gaon, pakka cross-state jhagda, non-deliverable cross-state PIN;
  - names: key collision, retired alias target, doosre state se keyed split alias;
  - anjaan office type.
- [ ] unit tests, determinism samet
- [ ] docs: core README; ARCHITECTURE §8.1 + §4 location row (states `INDIAN_STATES` se, `lgdCode` ke saath)
- [ ] TASKS: T4.2/T4.3/T4.1 ke faislon ke saath "Plan (owner ne maana, <date>)" lines, aur har hand-off apni target line me change-log line ke saath:
  - T4.4: Door A/B, N4 attestations wala Pune checklist template, L22 "mapped" predicate, checklist screens, Notify me, har hub ka Hub Manager, `goLive` + `expansion.area.wentLive`, `open-district-by-config`, go-live minimums aur waitlist weights (S3);
  - T4.5: review SLA key (S3); T4.6: product page ka PIN check;
  - T7.2: L7 state choice aur GST place of supply; sign-in customer ka PIN address se (N15); order transaction ke andar serviceability re-check;
  - T7.4: UPI rule `enabled && !blocked && total ≤ cap`;
  - T8.2: near-expiry days (S8); T8.4: zone editor aur max reattempts (S3);
  - T8.5 / T9.3 / T9.5: riders / GST-TCS / support-coverage attestations ko asli checks se badalna (N4); T9.3: gig/tax keys (S3);
  - T10.4: Master emergency-switch page (S7);
  - T6.5: logistics app me Logistics Head ka Staff page (agar N16 = a)
- [ ] TASKS T4.2 → `[~]` (§P: Phase 4 2.5→3.0 of 12 = 25%; poora 24% hi)

**PR 2: `feat/t4.2-location-dataset`**
- [ ] asli NDJSON, `manifest.json`, `aliases.json`, aur `REPORT.md` jisme:
  - 0 unresolved names;
  - review list ka saar;
  - vote-order comparison aur har threshold pe cross-state ginti;
  - har state ki village coverage, parent mismatches aur retired-code rows.
- [ ] owner numbers dekh ke L20 (order aur thresholds) pakka karta hai; `coverageExceptions` / `roundCountOk` entries sirf notes ke saath
- [ ] `INDIAN_STATES.lgdCode` file se copy
- [ ] committed dataset ka tez consistency test (sorted, valid, hashes)
- [ ] PRD §7.5 "Rajgad (formerly Velhe)" agar L10 = (a)

**PR 3: `feat/t4.2-location-import`**
- [ ] contracts `catalogue/location.ts` ka dhaancha: event `location.import.completed`, uski khaali subscriber list, "Location data imported" audit naam
- [ ] `modules/index.ts` me collections aur indexes; `LOCATION_SCHEMA_VERSION`
- [ ] core release step `event-catalogue` (no-op; fingerprint = relay map + `LOCATION_SCHEMA_VERSION`)
- [ ] `diff`: expected stored fields, effective triple, `override.stateCode`, confirmation rule (district pe lapse, sub-district pe refresh) aur review = prepare ∪ stored import-owned ∪ naye samet
- [ ] importer: har batch ka transaction, likhte waqt override/confirmation/review pipeline, verify pass (≤ 3), `pacing.ts`, lease, `--abandon` event
- [ ] guards: retire, mirror, space (best-effort bq_core stats aur type kiya Atlas size), LIVE hook
- [ ] audit (guard flags aur chhoote live areas samet) + event wala finish transaction; bypass flags ke saath `--note` zaroori
- [ ] bundle CLI `diff|apply`, `--env live`, fingerprint guard, `--rate`, `--report`, `--abandon`, `--allow-retire`, `--accept-live-changes`, `--note` ke saath
- [ ] `collections-budget` test (L18)
- [ ] integration aur full-data tests; CLI tests
- [ ] docs:
  - bundle README; CLAUDE.md + AGENTS.md command rows;
  - ARCHITECTURE §6.1 sach rahe, §11.1 release steps (`event-catalogue`);
  - L21 ke liye MEMORY + RULES §4.3 line.

**PR 4: `feat/t4.2-location-read-api`**
- [ ] `cache {86400, 3600}` wale routes, error codes; generated OpenAPI refresh
- [ ] `mountCoreRoute` routes; facade
- [ ] gateway bundle test: `public, max-age=0, s-maxage=86400, stale-while-revalidate=3600`, Set-Cookie nahi, strict query 400
- [ ] customer credits ka "Data sources" section naye attribution ke saath (browser checks)

**PR 5: `feat/t6.5-logistics-sign-in`** (agar L15 = (a))
- [ ] logistics app sign-in + account, Master wale hi auth-ui aur api-client ke saath
- [ ] khaali dashboard, dono themes
- [ ] browser checks + Playwright sign-in
- [ ] TASKS T6.5 note (logistics sign-in ho gaya)

**PR 6: `feat/t4.2-pincode-review`**
- [ ] permissions `location.pincode.confirm`, `location.pincode.override` (L13 ke hisaab se mfa), `location.master.read` + identity roles
- [ ] confirm aur override routes (sub-district-in-district check, import-owned flags ka akela hatane wala flag clearing), `districtSource` wale list routes (partial-index query + explain test)
- [ ] `rolesOf` platform me; `location.pincode.overridden`; audit names
- [ ] logistics "PIN code review" page: step-up dialog, needs-review filter aur CDN note
- [ ] refusal-path tests; confirm/override authz lines pe (b) changed-line mutations
- [ ] ARCHITECTURE §8.7 "mapped" (L22); MEMORY decision line

**Live (owner):**
1. Release → laptop pe ek copy pe diff → live diff → apply (§3.9).
2. Live checks, QA_AUDIT_REPORT §7a ke style me likhe:
   - lookup HIT;
   - audit "System (location.import)";
   - logistics app me ek asli confirm aur ek asli override (step-up ke saath);
   - Atlas graphs.
3. TASKS T4.2 `[x]` (§P: Phase 4 3.5/12 = 29%, poora ≈ 25%), HANDOFF.

### 8.2 T4.1 PR E (1 PR)

**PR 7: `feat/t4.1-area-settings`**
- [ ] contracts: badhayi definitions, catalogue, 8 keys (holidays ka 400-item request / 60-item stored niyam), 4 permissions, 6 routes, event, errors (429 `AREA_SETTING_TOO_MANY_CHANGES` samet); `AreaLocation` rename; README/test `'27'` fix
- [ ] core `network` module:
  - store, typed area fields aur system-actor fields ke saath;
  - transaction se pehle soft-cap counts (row cap, history cap); andar din ki seema;
  - save pe holiday pruning;
  - daily task me history alert + S10 prune;
  - resolver, do-place query samet;
  - `applyAreaSettingChange` aur routes.
- [ ] platform `authorizeArea`; identity roles
- [ ] subscribers: event ki khaali list + location events pe settings rechain (indexed queries)
- [ ] dependency-cruiser `core-modules-no-cycle` rule + core collection-name test (location ↔ network)
- [ ] audit action names (`network.areaSettingHistory.pruned` samet)
- [ ] logistics "Area settings" page (S7), holiday pruning note ke saath
- [ ] integration + bundle tests; resolver `$or` aur rechain queries pe explain tests
- [ ] (b) changed-line mutations: `authorizeArea` ki global line, switch rule, UPI allowed/cap rule (core + shared-contracts)
- [ ] docs:
  - ARCHITECTURE §4 rows;
  - ARCHITECTURE §8.3 (teen kinds, storage, S10 limits aur prune rule, permissions, do tarah ke pause), change-log line ke saath;
  - T4.1 title text; MEMORY decision.
- [ ] logistics app me live check: cut-off badlav, step-up ke saath UPI cap badlav, aur step-up ke saath Logistics Head ka switch
- [ ] TASKS T4.1 `[x]` (§P: Phase 4 4.0/12 = 33%, poora ≈ 25%), HANDOFF

### 8.3 T4.3 (7 PR + live)

**PR 8: `feat/t4.3-network-records`**
- [ ] contracts network catalogue (permissions, routes, events, response zod)
- [ ] collections (typed area fields, `subDistrictId` indexes, system-actor status fields) aur write APIs (koi LIVE raasta nahi), pause/close, authz, audit, events
- [ ] network ki taraf ke location subscribers (area chain refresh, mismatch flag) + composition root se LIVE guard hook
- [ ] TASKS T4.3 `[~]` (§P: Phase 4 4.5/12 = 38%, poora ≈ 26%)
- [ ] status-machine aur authz lines pe (b) mutations

**PR 9: `feat/t4.3-serviceability`**
- [ ] shared-utils IST helpers (sirf unit tests; kernel package nahi; publish nahi)
- [ ] algorithm, promise, generation script ke saath Redis-first facts, TTLs, write budget, N17 read budget, cache-bump subscriber
- [ ] public cached route, checkout facade, staff PIN code route
- [ ] **test fixture network** pe bundle E2E (pune.json nahi):
  - gateway → CDN headers → Redis hit (0 Mongo ops) → pause → doosra generation;
  - Redis wipe drill; har miss ke reads ki ginti (profiler);
  - 20/s ki anjaan-PIN baadh me bhi served miss nikal jaata hai; 30 reads/s ke upar → 503.
- [ ] Valkey tests: har `bq:svc:*` key pe TTL; naapa `MEMORY USAGE` ≤ 3.5 MB
- [ ] serviceability status decision pe (b) mutations
- [ ] ARCHITECTURE §6.6 (svc keys, write budget, read budget N17), change-log line ke saath

**PR 10: `feat/t4.3-identity-places`**
- [ ] `network.place.changed` / `location.districts.changed`, import finish pe har state ke events
- [ ] location aur network ke first-copy release steps, facades `resendDistrictEvents` / `resendPlaceEvents`, bundle command `db:resend-places` (root script), network catch-up task
- [ ] maujooda `q.identity` consumer pe identity subscription, `identity_places` + index, copy se chainOf, `NOT_KNOWN_YET` hataya
- [ ] grant refusal tests; fresh-DB order test; reset → resend test
- [ ] badli authz lines pe (b) mutations
- [ ] identity README; CLAUDE.md + AGENTS.md command row; live run book line "run `db:resend-places --env live` only after an identity reset"

**PR 10b: `feat/t4.3-staff-place-pickers`** (N16)
- [ ] contracts `iam.places.list` aur `iam.places.byIds`; identity routes (permission `iam.grant.read`, caller-scope containment, indexed)
- [ ] Master `RoleForm`: `GIVABLE_SCOPES` me district/city/hub/warehouse, naam se dhoondhne wala place picker, chaar `NOT_YET` entries hatayi
- [ ] People, Invitations aur audit viewer me naamon wala `scopeText` (har page ek byIds call; "(closed)"; "1 other hub"; `iam.grant.read` ke bina ginti wala text)
- [ ] unit tests; Playwright: Master ek hub ke liye Hub Manager deta hai aur table me uska naam dekhta hai; browser checks 360/768/1280, light/dark, axe
- [ ] routes ki scope containment pe (b) changed-line mutations
- [ ] TASKS T3.7 note ("faisla 3: location master ke chaar scope T4.3 PR 10b se khule"); zaroorat ho to DESIGN/ARCHITECTURE §7.3 line

**PR 11: `feat/t4.3-pune-seed`**
- [ ] suggestion script (catchment rule) + review report (owner kinare wali list samet flagged rows dekhta hai)
- [ ] `pune.json`, `holidays-india.json` (S9)
- [ ] `--env live` ke saath `db:seed-network` CLI (drift, `--update`, idempotent); settings `applyAreaSettingChange` se
- [ ] network daily task me saalana holiday alert
- [ ] tests: kabhi LIVE nahi; anjaan code run rokta hai; seeded settings rows ObjectId guard pass karti hain aur history aur audit ke saath events banati hain
- [ ] CLAUDE.md command row

**PR 12: `feat/t4.3-customer-pincode-check`**
- [ ] `PincodeCheck` component + states (N15 tak koi persistence nahi)
- [ ] browser checks + axe + Playwright E2E

**PR 13: `feat/t4.3-logistics-network-pages`**
- [ ] areas, hubs aur unke PIN codes, PIN lookup, reassign, pause
- [ ] browser checks

**Live (owner):**
1. Release → `db:seed-network --env live --file pune`, phir `--file holidays-india`.
2. Live checks:
   - Pune ke PIN pe customer check T4.4 tak `NOT_SERVED` dikhaye (seed PIN areas CLOSED chhodta hai, N3; "Coming soon" sirf Door B ke baad, T4.4 me);
   - logistics network pages asli sign-in ke saath chalein;
   - Master app me picker se ek test staff account ko asli hub grant. Table me uska hub naam dikhe, aur CLOSED hub ke liye mana ho.
3. TASKS T4.3 `[x]` (§P: Phase 4 5/12 = 42%, poora ≈ 26%).
4. ARCHITECTURE §8.2/§8.4/§8.6 (READY wording) aur §8.8 (`wentLive`).
5. HANDOFF.

L15 = (b) ho to: PR 5, PR 6 ka page aur PR 7 ka page PR 13 me jaate hain, aur T4.2 aur T4.1 tab tak `[~]` rehte hain jab tak PR 13 live check na ho.

(§P ke numbers maante hain ki beech me Phase 4 me aur kuch nahi badla; har commit me dobara nikaale jaate hain.)

---

## 9. Test plan

### 9.1 T4.2

- **Unit:**
  - CSV/format sniffing aur §2.2 ki har contingency; header aur footer detection;
  - state ka 1:1 match;
  - aliases, split names (doosre state se keyed split alias `JK.leh → [LA codes]` samet), run rokne wale unresolved names, key collisions, retired alias targets;
  - vote orders:
    - dono orders aur barabari;
    - delivery offices ke saath aur bina office winner;
    - sub-district close vote;
  - cross-state rule:
    - pakka saboot rokta hai;
    - 1 bhatka gaon office winner ka state `MULTI_STATE` + `SOURCES_DISAGREE` ke saath rakhta hai, dono orders me;
    - `villages` mode me kamzor saboot office winner ke state ke andar dobara vote karata hai;
    - non-deliverable cross-state PIN all-offices winner use karta hai;
  - village districts: jis row ka district column portal parent se alag hai wo portal parent ko vote deti hai aur `VILLAGE_CODES_STALE` lagati hai; retired sub-district code skip, gina aur flag;
  - deliverable; coordinates (NA, DMS, swap, box, district radius, 25 km); office suffix → kind; anjaan delivery ya office type run rokta hai;
  - village checks: adhoori aakhri row, total < 99.9%, pehli import pe sub-district coverage < 90%, note ke saath coverage exception, round export-cap ginti, `roundCountOk`, re-import pe kisi state < 98%;
  - count bounds, retire guard, mirror rule;
  - determinism (byte-identical output) aur manifest hashes;
  - `diff`:
    - expected-field computation, reparented, stateChanged, restore aur replace samet;
    - `moved` (effective) vs `sourceMoved`;
    - expected review = prepare ∪ stored import-owned ∪ naye;
    - bookkeeping fields ignore;
  - override aur confirm rules: rakha, hata, sub-district hata, district badalne pe lapse, sub-district badalne pe refresh, poora triple, `override.stateCode` refresh;
  - `pacing()`: 50/s pe 101-document batch ~2 s rukta hai; live pe 1 s se kam kabhi nahi.
- **Integration** (Mongo replica set, Pune subset fixture):
  - **Dohrana aur badlav:**
    - v1 apply, phir dobara v1 → 0 writes;
    - moved, renamed, reparented, retired aur restored records wala v2 → stable `_id`s aur sahi change rows.
  - **Crashes:**
    - batch k ke andar daali failure, phir rerun → wahi aakhri halat aur har move ki theek ek change row;
    - **STATE_CHANGED import ke district batches ke baad crash, phir rerun** → district ke neeche har PIN, aur usme override kiya har PIN, naya `stateCode` rakhta hai (effective aur `override.stateCode`), har ek ki ek `stateChanged` row ke saath.
  - **Overrides aur flags:**
    - override jiska sub-district reparent hua → sub-district koi nahi + `OVERRIDE_SUBDISTRICT_DROPPED`;
    - override ke neeche official move → `sourceMoved` + `OFFICIAL_MOVED`, LIVE guard nahi;
    - **import v2 `OFFICIAL_MOVED` lagata hai; us PIN ke liye bina badlav wala import v3 use rakhta hai**; baad ka override save use hatata hai;
    - diff aur write ke beech save hua override → rakha gaya; verify pass 0 farak chhodta hai.
  - **Confirmations:** jis confirmed PIN ka sirf official sub-district badla, wo naye sub-district ke saath confirmation rakhta hai (`confirmationUpdated`, ab bhi mapped); jiska official district badla wo kho deta hai (`confirmationLapsed`).
  - **Lifecycle:**
    - `--abandon` completion event bhejta hai;
    - lease conflict; alag hash mana;
    - dry run kuch nahi likhta (profiler me koi update op nahi);
    - finish transaction me audit entry (use hue ho to guard flags ke saath) aur outbox event dono;
    - `event-catalogue` step: core ke relay map me event type jodne se core ka release fingerprint badalta hai.
  - **Confirm/override routes:**
    - MH planner MH ke PIN pe allowed, KA ke PIN pe 404;
    - permission nahi → 403;
    - scope ke bahar target → 404;
    - doosre district ka sub-district → 422 `SUBDISTRICT_NOT_IN_DISTRICT`;
    - bina step-up override → 401 `STEP_UP_REQUIRED`;
    - re-import override ka poora triple rakhta hai, cross-state override ka `stateCode` samet;
    - sirf-district override official sub-district badlav ke baad bhi bachta hai;
    - save import ke flags hatata hai.
  - **Guards:**
    - overrides list ka partial-index explain test, state `scopeFilter` ke neeche bhi;
    - `core` + `core-location-import` pe collection-scan guard; aakhir me ObjectId guard.
- **Full-data test** (asli dataset, bina throttle):
  - counts manifest ke barabar; doosri run 0 writes; `$collStats` size + indexes ≤ 30 MB (test ki jaldi chetavani; import ka rokne wala guard 40 MB hai, L16);
  - naapa samay PR me likha jaata hai (sirf > 60 s ho to env flag ke peeche).
- **Bundle:**
  - CLI:
    - `--env` sirf `live` maanta hai; galat jawab kuch nahi chalata; env file missing;
    - Atlas-size prompt ka mana; mana kiya stats command print karke aage;
    - bina `--note` ke `--allow-retire`/`--accept-live-changes` mana;
    - bq_audit kabhi nahi padha.
  - Gateway cache headers.
- **Mutations:** sirf confirm/override authz lines (RULES §6.2 (b)); import aur prepare pe koi nahi (c).
- **Browser:** sign-in page aur PIN review page 360/768/1280 pe, light/dark, axe.

### 9.2 T4.1 PR E

- **Contracts unit:**
  - catalogue ke niyam;
  - har kind ka merge; state pe on switch neeche ke levels cover karta hai;
  - invalid stored value skip;
  - har permission ka theek ek change route;
  - holidays: 60 purani dates + 1 nayi pruning ke baad save; 61 current dates mana.
- **Core integration:**
  - **Set aur clear:** har level pe; source ke saath effective value; versions aur tombstones.
  - **Takraav aur replays:** purana version → 409, race samet; idempotent replay; no-op kuch nahi likhta; reason zaroori.
  - **Mana aur limits:**
    - har refusal (403/404/400/409/422/429);
    - replica set pe 20,000 pe row cap 409, jo saabit karta hai ki ginti transaction ke bahar chalti hai (andar `count` fail hota);
    - din ki seema 429 (switch bahar);
    - history cap 409 (switch phir bhi allowed).
  - **History prune:** newest 50 versions aur 400 din ke andar ka sab rakhta hai, baaki delete, ek System audit entry, sirf indexed ya commented queries.
  - **Atomicity aur actors:**
    - audit + history + event ya to saath likhe jaate hain ya koi nahi;
    - system actor (`updatedBy: null` + `updatedSystem`) ObjectId guard pass karta hai aur audit me "System (seed:…)" likhta hai;
    - 0 subscribers ke saath relay.
  - **Resolver equivalence:** bulk results single results ke barabar; do-place query do single lookups ke barabar.
  - **Re-import:** simulated re-import (moved PIN apni row rakhta hai aur naye district ki values leta hai; chain indexed queries se rechain hoti hai).
  - **Explain:** har resolver branch, partial `pincodeId_pin` query aur `chain.districtId` rechain pe.
- **Lint:** jaan-boojh ke `modules/location` → `modules/network` import `core-modules-no-cycle` fail karta hai (rule test); location me `network_` string pe collection-name test fail hota hai.
- **Bundle:** Logistics Head step-up ke saath pause karta hai (bina step-up 401 `STEP_UP_REQUIRED`); planner cut-off badalta hai.
- **Mutations (b):** `authorizeArea` (global line), switch rule, UPI allowed/cap rule. Mutations nahi (c): version compare, no-op, date merge, level checks, limits, pruning.
- **Browser:** Area settings page 360/768/1280 pe, light/dark, axe; logistics app me asli flow.

### 9.3 T4.3

- **Unit:** midnight, mahine ke aakhir aur 31 Dec → 1 Jan ke paar IST helpers; promise examples (§6.3); weakest-status function; status machine (koi LIVE target nahi); suggestion script ke catchment aur fringe flags; saalana holiday alert rule; har step ka read-budget charge.
- **Integration:**
  - scope refusals ke saath write APIs; ek PIN, ek hub; same-district rule;
  - LIVE guard import rokta hai (moved, `subDistrictId` se mile hub wala reparented sub-district, override-dropped) aur `sourceMoved` aur `confirmationUpdated` ko ignore karta hai;
  - drift-safe, idempotent seed jiski settings store function se jaati hain (history, audit, event, ObjectId guard);
  - network_areas `$or` aur hub/warehouse `subDistrictId` queries pe explain;
  - `resendPlaceEvents` full read ki tarah marked.
- **Bundle E2E:**
  - **Jawab aur reads:** serviceability headers aur statuses; 0 Mongo ops wala Redis hit; har miss ke reads (anjaan 1, not served 2, served 6) profiler se gine.
  - **Redis:** sirf positive, generation race, write budget, har key pe TTL, Redis wipe.
  - **Read budget:** 20/s ki anjaan-PIN baadh me bhi served miss nikal jaata hai; 30 reads/s ke upar → 503, cached nahi.
  - **Identity place copy:**
    - jaane-pehchane hub ke liye grant allowed, anjaan ya band ke liye mana;
    - fresh-DB order (release → import → district grant allowed);
    - reset → `db:resend-places` → allowed.
  - **Place routes:**
    - `iam.places.list`: sirf caller ke scope ke andar ki jagahein; CLOSED jagahein bahar;
    - `iam.places.byIds`: band hub apne status ke saath aata hai aur "Kothrud–Warje (closed)" dikhta hai; scope ke bahar ki ids hidden; 100 se zyada ids → 400.
- **Valkey:** har representative entry ka `MEMORY USAGE`; `2 × budget × size ≤ 3.5 MB`.
- **Playwright + axe:** customer check; logistics pages; place picker se Master grant aur People table me naam. Browser checks 360/768/1280, light/dark.
- **Mutations (b):** status machine, pause/authz, serviceability status decision, identity scope-id checks, place routes ki scope containment. IST helpers aur promise date ko sirf unit tests.

**"Verified" ka matlab** (RULES §6.4): sirf asli flow ke baad, yaani browser clicks ya gateway se asli API call. Live verification owner ki live run hai.

---

## 10. Risks aur bachaav

| Risk | Bachaav |
|---|---|
| India Post ka data purana ya galat (naam, flags, coordinates) | Owner ka chuna vote order, village codes, go-live rokne wale review flags, aliases, confirm/override |
| Split ke baad India Post parent district pe hi rehta hai | "0 PIN codes" warning + `SOURCES_DISAGREE` → split alias gaon ko faisla karne deta hai |
| Village file LGD reparent se purani | Village votes hamesha portal parent se; `VILLAGE_CODES_STALE` go-live se pehle insaan se check karwata hai |
| Border paar bhatke gaon har import rokein | Cross-state stop sirf pakke village saboot pe (≥ 3 gaon aur > 50%); kamzor case review flags; thresholds PR 2 me asli ginti se |
| Portal band ya uska captcha/dialog toota | Mirror sirf pehli import ke liye; re-imports intezaar; unofficial data kabhi nahi |
| Capped ya kata village export, pehli import pe bhi | Total ≥ 99.9%, aakhri row, har state ki sub-district coverage, round-count aur (re-import) state-wise checks prepare rokte hain |
| Metros me bahut `SPLIT_GUESS` flags (Mumbai, Delhi 11 → 13) | Ye sirf un districts ka go-live rokte hain; Pune me koi split naam nahi |
| Shehar-kinare ke PIN galat hub pe | Catchment rule + owner ki dekhi kinare wali list |
| Crash derived fields purane chhod de (state, override) | Diff change kinds nahi, expected stored fields milata hai; apply ke baad verify pass |
| Re-import wo flags mita de jo sirf insaan hata sakta hai | Expected review me stored import-owned flags; sirf confirm/override handlers hatate hain |
| Sub-district ki adla-badli pe confirmations tootein | Sirf official district badalne pe lapse |
| Atlas bulk writes ko andaaze se alag gine | `--rate` har likhe document ko token-bucket pacing se ginta hai; raat ki runs; Atlas fail nahi, throttle karta hai |
| Location + audit + outbox + aage ke modules ek 512 MB baantein | Location cap; operator ka type kiya Atlas size ≤ 400 MB; area-setting row cap; history alert, prune aur cap (S10); holiday pruning; `collections-budget` test (L18); storage alert |
| Cap check jo har write tod de | Counts transaction se pehle soft caps ki tarah (MongoDB andar `count` nahi chalne deta) |
| Live import ke ~10 min me readers ko purana-naya mila data dikhe | Har batch apne aap me consistent; raat ka window |
| CDN purana jawab dikhaye (location ~25 ghante, serviceability ~3 min) | Checkout Mongo dobara dekhta hai; reports aur override page pe likha |
| Pehle cached routes gateway ya Vercel ki dikkat khol dein | Bundle header test; live `x-vercel-cache` check |
| Live pe insaani galti | Fingerprint guard (`event-catalogue` ke saath), typed `live`, pehle diff, har bypass pe `--note` aur audit |
| Aise code se live import jisse deployed core match nahi karta | `event-catalogue` release step; LIVE-006 anjaan types ko pending rakhta hai, khota nahi |
| Module ki seemayein ghisein (location network ka data padhe) | Har event aur resend hisse ka saaf owner; `core-modules-no-cycle`; collection-name test |
| Identity ki copy khaali ya purani | Import-finish events, release steps, catch-up task, `db:resend-places`; fail closed |
| Logistics grants asli user na de sake | PR 10b me Master place pickers aur naam (N16) |
| Redis noeviction | Sirf positive cache, global write budget, har key pe TTL, naapa size test |
| Serviceability pe distributed bot M0 pe bojh daale | Global read budget (is route pe ≤ 30 Mongo reads/s, N17). Saste floods ko "busy" dikhane ke liye pehle se lagbhag 5× bada hona padta hai. Cached PIN codes aur checkout pe asar nahi |
| Agle saal ki national holidays nahi daali gayi | Do saal ka S9 seed + 1 December se saalana alert |
| Logistics routes asli user check na kar sake | Review PR se pehle logistics sign-in PR (L15) |
| T4.3 me scope creep | 7 chhote PR; area settings, override pages aur pickers apne PRs me |
| Contracts badlav | Branch + PR, jahan lagu (b) changed-line mutations, npm publish nahi (owner rule) |
| Stored setting `chain` purana ho jaaye | Indexed subscriber rechain; resolver live chain use karta hai, to values sahi rehti hain |
| Licence ki shartein | Naam LGD jaise deta hai waise save; sudhaar hamare naam se, staff ke set kiye districts samet; attribution page |

---

## 11. Change-proofing (anjaan cheezein, niyam abhi se tay)

| Anjaan | Kaise pata chalega | Pehle se tay niyam (plan nahi badalta) |
|---|---|---|
| LGD file format | PR 1 se pehle ke downloads me dikhega; har run pe sniffer | Hamesha CSV UTF-8 me badlo (§2.1); reader sirf CSV maanta hai |
| LGD/mirror column names | Missing-column error | Variant `rules.json` ki column lists me jodo (data PR); raw files kabhi edit nahi |
| India Post value spellings (delivery, office type) | Anjaan value run rokti hai | Variant `rules.json` me jodo |
| Owner kaunsa vote order rakhega | REPORT ka vote-order comparison | `rules.json` me `districtVote` palto; code badlav nahi |
| Cross-state jhagde | REPORT me har threshold ki ginti; pakke case pe prepare rukta hai | Owner ke saath PR 2 me `crossStateStop` set; pakke cases ke liye PIN facts (PR-reviewed) |
| LGD purane ya naye naam dikhaye (Velhe/Rajgad, Ahilyanagar) | `REPORT.md` | LGD ka naam hamesha jeetta hai; purane naam `formerNames`/aliases me; hum kabhi rename nahi karte |
| LGD rename pe re-code kare | Diff RETIRED + NEW dikhaye | `aliases.replacements` entry → `replaced` change rows; owning modules subscriber se re-point |
| Split sub-districts ko re-parent kare | `REPARENTED` change rows; REPORT ke village parent mismatches | Village votes portal parent ke saath; un PIN codes pe `VILLAGE_CODES_STALE`; subscribers re-point ya flag; wahan ke hubs aur warehouses ke liye LIVE guard; override sub-districts hate aur flagged |
| Unresolved India Post naam | Prepare rukta hai | Alias lines jodo (ek baar, PR-reviewed), India Post ke claimed state se keyed |
| Bahut review flags | Report counts | Phir bhi import; flags sirf un districts ka go-live rokte hain (L22); Pune ki list T4.3 seed se pehle saaf |
| Asli counts bounds ke bahar | Bound error | Ek baar `rules.json` me bound badlo, `REPORT.md` me note ke saath; baad ki runs retire guard use karti hain |
| Village files missing, adhoori ya capped | Warning ya stop | Missing: un states ke liye India Post ke naam. Kati: dobara download. Asli kam coverage ya round count: `rules.json` me note ke saath exception |
| Village file aise codes use kare jo portal me nahi | Ignored-row ginti | Ignore aur gino (retired codes flag bhi); portal list sach hai |
| Portal band | Fetch fail | Pehli import: mirror, manifest me marked; re-import: intezaar |
| data.gov.in login maange | Owner ko "Please login" dikhe | Owner ki apni marzi; mana kare to T4.2 ruka aur report (doosra sarkari source nahi) |
| Space andaaze se zyada | Full-data test, space guard | ≤ 40 MB aage; upar to stop aur L4 (office names) naape number ke saath owner ke paas wapas |
| Cluster 400 MB alert ke paas | Type kiya Atlas Logical Size | Import mana; owner jagah khaali kare ya faisla le |
| M0 stats commands mana kare | Pehla live diff | "not readable with bq-core" print karke aage; type kiya Logical Size guard karta hai |
| Atlas 50/s pe throttle kare | Dheeme batches, Atlas graph | `--rate` kam karo; code badlav nahi |
| Crash ya race derived fields purane chhode | Verify pass / agla diff | Diff expected fields likhta hai (import-owned flags bache); haath ki marammat nahi |
| Pune PIN bina centre point | Suggestion report | `pune.json` me haath se hub |
| Kinare ke PIN codes | Suggestion report flags | Owner har ek tay kare; nateeja `pune.json` me |
| Vercel cache headers ignore kare | Live pe `x-vercel-cache: HIT` nahi | Sahi par uncached: origin serve karta hai aur serviceability ko Redis cover karta hai; QA report me likha, code badlav nahi |
| Redis budget pahuncha | "budget reached" log | Jawab sahi rehte hain (Mongo raasta, read budget); budget sirf size naap ke badhao |
| Redis entry andaaze se badi | Valkey size test fail | Write budget constant ghatao; threshold kabhi mat badhao |
| Read budget asli traffic ke liye tight | Kam bot hisse ke saath 503 `SERVICE_BUSY` logs | Atlas ops headroom check karke hi constant badhao (N17) |
| Area-setting history tez badhe | 60,000-row alert | S10 prune 60,000 ke upar apne aap chalta hai; 150,000 cap M0 ko bachata hai; alert pe koi faisla nahi atakta |
| Owner S10 (b) chune | Owner ka jawab | Koi prune task nahi; 150,000 rows pe sirf switches chalte hain, aur owner ko 60,000 se alert |
| Holiday lists har saal badhein | n/a | 30 din se purani dates save pe hatti hain; 60-item limit baaki ko ginti hai (S10) |
| Agle saal ki national holidays missing | 1 December se saalana alert | Logistics Head Area settings page se jodta hai (S9) |
| Hobby pe tag purge | n/a | Use nahi |
| Contracts breaking change | Typecheck | Usi PR me monorepo callers update; publish nahi |
| Logistics sign-in jaldi (L15) mana | Owner ka jawab | Saare pages PR 13 me; tab tak T4.2 aur T4.1 `[~]`; aur kuch nahi badalta |
| Logistics grants kahan se (N16) | Owner ka jawab | (a) plan jaisa; (b) shared staff package aur logistics Staff page T4.3 me; (c) sirf PR 10b |
| M4 checklist items (N4) | Owner ka jawab | Haan to attestation items; warna Pune M8/M9 tak "Coming soon" aur M4 demo wahi halat dikhata hai |
| Guest PIN storage (N15) | Owner ka jawab | (a) kuch nahi badalta; (b) localStorage (try/catch) + RULES §5.9 exception line |
| PIN check limit (N17) | Owner ka jawab | (a) plan jaisa read budget; (b) global budget hatao, per-IP limits rakho; (c) purane draft jaisi request ginti |
| Reset ke baad identity copy khaali | Grant "not known" kahe | `npm run db:resend-places`; catch-up task deploy overlaps cover karta hai |
| Mapped PIN doosre district me move hua | Subscriber flag | Area doc apna hub rakhta hai; us district ka "all mapped" fail; planner reassign karta hai |
| Re-import LIVE areas chhoye | LIVE guard | `--accept-live-changes` + `--note` ke bina stop, insaani faisle ke baad; bypass audited |
| Import naya event type bheje | Live pe `event-catalogue` fingerprint alag | Pehle release aur deploy; tab tak guard mana karta hai |
| India Post ki "monthly" taazgi | Manifest dates | Phir bhi quarterly (L17) |
| Owner kahe "saari salah theek" | n/a | §1 ka exactly "Meri salah" column banao |

---

## 12. Verified vs assumed

### 12.1 Verified (source ke saath)

**Bahar ke sources**

| Fact | Source |
|---|---|
| LGD download page: 3 modes, PDF/HTML/XLS/ODT, captcha (+ audio), all-India state/district/sub-district entities, pincode-village aur pincode-urban mappings, dates ke saath "Download Only Modifications" | https://lgdirectory.gov.in/downloadDirectory.do (2026-11-16 ko sources analysis me padha) |
| LGD counts: 36 states/UTs, 790 districts, 7,112 sub-districts, 677,660 villages | https://lgdirectory.gov.in/ |
| LGD reuse allowed agar sahi reproduce ho aur prominent acknowledgement ho; legal use ka daava nahi | https://lgdirectory.gov.in/copyRightPolicy.do ; https://lgdirectory.gov.in/termsconditions.do |
| India Post file: 165,627 rows, 11 columns (taluka nahi), updated 10/08/2026, GODL; download naam/email/usage/purpose/captcha maangta hai, kabhi login | https://www.data.gov.in/resource/all-india-pincode-directory-till-last-month ; https://www.data.gov.in/help |
| GODL attribution template aur no-endorsement niyam | https://www.data.gov.in/Godl |
| "LGD - Villages with PIN Codes": 677,323 rows LGD state/district/sub-district codes ke saath, state-wise download, updated 01/11/2026 | https://www.data.gov.in/resource/local-government-directory-lgd-villages-pin-codes |
| data.gov.in LGD mirror: 785 districts, 7,151 sub-districts, sample rows Last Updated 2024-10-07 | data.gov.in LGD states/districts/sub-districts resources |
| 31.03.2025 ko 1,64,999 post offices | https://www.indiapost.gov.in/po-network |
| Velhe → Rajgad official Aug 2025; Ahmednagar → Ahilyanagar 2024-10-05; Rajasthan ne 9 districts 2024-12-28 ko khatam kiye; Ladakh ke 5 naye districts 2026-04-27 | theweek.in, theprint.in, deccanherald.com, scroll.in, ladakh.gov.in (links sources analysis me) |
| Atlas M0: 0.5 GB uncompressed BSON + indexes ginta hai; 100 ops/s pe throttle karta hai, reject nahi | https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/ |
| Transactions: "count and their helpers" restricted operations hain; transaction ke andar counts `$count`/`$group` (countDocuments) use karte hain | https://www.mongodb.com/docs/manual/core/transactions-operations/ (2026-11-16 ko padha) |
| npm `xlsx` 0.18.5 me unfixed CVEs | https://git.sheetjs.com/sheetjs/sheetjs/issues/2961 |

**Repo**

| Fact | Source |
|---|---|
| State badlav `withTransaction` me, outbox aur audit rows usi transaction me | docs/RULES.md:60 (§4.3); docs/ARCHITECTURE.md:154 |
| Lambe jobs chhote idempotent steps me | docs/ARCHITECTURE.md:158 |
| Har cache key ka TTL; Redis noeviction; caches ≤ 4 MB (free mode me sirf serviceability aur Ola token); `bq:svc:pin:*` prefix | docs/RULES.md:69; docs/ARCHITECTURE.md:188, :197, :203 |
| Har reference ObjectId; naam apni unique field me | docs/RULES.md:74 (§4.17) |
| localStorage sirf UI preferences ke liye | docs/RULES.md:86 (§5.9) |
| Mutation categories (a)/(b)/(c); kernel list | docs/RULES.md:92 (§6.2) |
| "Verified" = asli user action (browser click ya asli API flow) | docs/RULES.md:94 (§6.4) |
| Screens 360/768/1280 pe dono themes me | docs/RULES.md:13, :83 |
| Sensitive actions pe step-up | docs/RULES.md:100 (§7.1) |
| Planning docs Hinglish me; har doc ke top pe status aur neeche change log | docs/RULES.md:109-110 (§8.1, §8.2) |
| Agents ek waqt me ek, parallel kabhi nahi; workflow/ultracode mode ki wajah se agents ya workflow nahi chalte (is plan ke liye owner ka override, §13) | docs/RULES.md:116 (§9.1); CLAUDE.md "Kam tokens" |
| LGD naamon ka varnan | docs/ARCHITECTURE.md:321 |
| bq_audit: bq-core ke paas sirf insert, find, createIndex aur listIndexes (Atlas custom role `bq-core-audit`); har Atlas DB user ke paas sirf apne database pe readWrite | docs/ARCHITECTURE.md:139, :141; docs/TASKS.md:426 (`bq-core-audit` 2026-11-15 ko bana) |
| Audit-index release step bq_audit pe sirf createIndex aur listIndexes use karta hai | backend/core/src/modules/audit/index.ts:126-141 |
| M0 limits, 100 ops/s samet, aur `collections-budget` check jo bana nahi | docs/ARCHITECTURE.md:144-152; grep me koi implementation nahi |
| Relay har deployable pe ~1/s poll karta hai, kul ~4 ops/s | docs/ARCHITECTURE.md:113 |
| LIVE-006: relay anjaan event types pending chhodta hai; naya instance unhe bhejta hai | docs/ARCHITECTURE.md:116 |
| Atlas alerts: Opscounter 80/s, Logical Size 400 MB | docs/ARCHITECTURE.md:567 |
| ARCHITECTURE §4: area settings network me, resolver kernel me, location "states" rakhta hai | docs/ARCHITECTURE.md §4 table (platform kernel / location / network rows) |
| §8: location master me LGD states (:321), "Saare pincodes mapped" (:338), `expansion.area.went_live` (:342) | docs/ARCHITECTURE.md:319-344 |
| Event type = 3 camelCase parts, underscore nahi | packages/shared/contracts/src/events.ts:21-22 |
| Route cache: sMaxAge 1–86,400, SWR 0–604,800, sirf public GET; abhi koi catalogue route `cache` use nahi karta | packages/shared/contracts/src/routes.ts:67-68, :158-173; grep `sMaxAge` |
| Cached 200/304 pe gateway header `public, max-age=0, s-maxage=…, stale-while-revalidate=…`, warna `private, no-store` | backend/gateway/src/proxy.ts:149-158 |
| route.stepUp permission.mfa ke barabar | packages/shared/contracts/test/iam.test.ts:101; catalogue/audit.ts:164, :184 |
| Route ka access ek permission ka naam leta hai | packages/shared/contracts/src/catalogue/audit.ts:161, :181, :206 |
| Grant permissions `iam.grant.read` / `iam.grant.manage` | packages/shared/contracts/src/catalogue/iam.ts:37-48 |
| `AREA_LEVELS` = global/state/district/pincode; key regex; closest-wins resolver; `stateId` naming | packages/shared/contracts/src/area-settings.ts:4-78 |
| ObjectId guard: `…Id/…Ids/…By` ya `by` strings fail; null skip; hex check anchored (sirf poori string) | scripts/e2e/object-ids.ts:11, :34-35, :37-62 |
| Profiler guard har COLLSCAN fail karta hai jab tak comment `full read:` se shuru na ho | scripts/e2e/collection-scans.ts:12, :52-80 |
| Audit: before/after 8,000 chars tak, reason 500 pe kata, system actors ke liye `actor.system` (40 pe kata) | backend/core/src/modules/audit/store.ts:34, :43-44, :194, :210 |
| `withTransaction`: har query ko `{ session }`, ek ke baad ek, Promise.all nahi, outbox aur audit andar, 10 s timeout | packages/backend/server-mongo/src/transaction.ts:150-165 (:159) |
| Installed driver ka `estimatedDocumentCount` `count` command bhejta hai | node_modules/mongodb/lib/operations/estimated_document_count.js:19 |
| Soft-cap ki misaal: `withTransaction` se pehle `estimatedDocumentCount`, comment "a few parallel requests may pass it by a few" | backend/core/src/modules/platform/routes.ts:45-55 |
| dependency-cruiser me sirf `core-module-facade-only` (imports) aur `core-no-other-deployable`; circular rule nahi | backend/core/.dependency-cruiser.json:2-20 |
| "Modules use each other only through those facades, never models"; subscribers, indexes, schedules aur tasks `modules/index.ts` me merge | backend/core/src/modules/index.ts:11-50 |
| Lease (`platform_locks`) server-queue package se | packages/backend/server-release/README.md:13; packages/backend/server-release/src/release.ts:24 |
| Identity ka rbac-sync release step bina transaction bulkWrite use karta hai (misaal, yahan follow nahi) | backend/identity/src/rbac/sync.ts:257 |
| Release steps har fingerprint pe ek baar (`platform_release`); `releaseFingerprint` sirf migrations, indexes aur step fingerprints hash karta hai; step `{name, fingerprint, run}` hai | packages/backend/server-release/src/release.ts:24-29, :54-61, :111-125 |
| Core ka release: migrations nahi, outbox/consumer/module indexes, ek step `audit-indexes` | backend/core/src/release.ts:19-25 |
| Identity pehle se `q.identity` pe consumer chalata hai, `subscriptions: []` ke saath | backend/identity/src/runtime.ts:79, :206 |
| Logistics app khaali shell (auth-ui nahi, api-client nahi); T6.5 `[~]` | frontend/logistics/package.json; frontend/logistics/src; docs/TASKS.md:212 |
| Master Staff RoleForm sirf global/state scopes deta hai; baaki disabled; district/city/hub/warehouse pe "Comes with the location master" | frontend/master/src/staff/role-form.tsx:47-49, :154-167; frontend/master/src/staff/labels.ts:40-52 |
| `scopeText` non-state scopes ko ginti dikhata hai; People, Invitations aur audit viewer me use | frontend/master/src/staff/labels.ts:56-61; people.tsx:113, :320; invitations.tsx:82; frontend/master/src/audit/audit-log.tsx:358 |
| T3.7 owner faisla (3): jin scope types ka data nahi, wo data aane tak dikhte hain par disabled | docs/TASKS.md:175 |
| Hub, warehouse aur city roles Master aur Logistics Head appoint karte hain; Hub Manager hub_ops aur rider_onboarding bhi appoint karta hai | backend/identity/src/rbac/roles.ts:89-90, :192-232 |
| Partial index ke liye query ko uski condition saabit karni padti hai | docs/MEMORY.md:201 (lesson 33) |
| `infra:up` seedha `docker compose up` hai; core ko start pe Mongo + Redis chahiye | package.json:40; docs/HANDOFF.md:47 |
| T8.4 line me zone editor nahi; PRD: planner zones banata hai | docs/TASKS.md:234; docs/PRD.md:149 |
| Aaj ki task lines: T4.4 (waitlist, suggestions, requests, checklist templates, goLive, open-district test); T7.2, T7.4, T8.5, T9.3, T9.5 Support Desk, T10.4 emergency switches | docs/TASKS.md:184, :221, :223, :235, :245, :247, :257 |
| Code me abhi `dbStats`/`$collStats` ka use nahi | backend, packages, scripts pe grep |
| Resource chain me hub ko city chahiye; resource na ho to koi bhi scope pass | packages/shared/authz/src/matcher.ts:65-80, :87-97 |
| `scopeFilter` scope types ko kisi bhi field naam pe map karta hai; state code se, baaki ObjectId | backend/core/src/modules/platform/authz.ts:111-141 |
| Rate classes: public 600/min, search 120/min | backend/gateway/src/rate-limits.ts:21-30 |
| Request log `req.path` rakhta hai (query nahi); monitoring query hatata hai | packages/backend/server-kit/src/request.ts:50 ; monitoring.ts:19-20 |
| Schema strict na ho to anjaan query keys ignore | packages/backend/server-kit/src/route.ts:47 |
| Event size limit 16 KB | packages/backend/server-queue/src/outbox.ts:21 |
| Identity district/city/hub/warehouse ids mana karta hai; `chainOf` sirf states jaanta hai | backend/identity/src/rbac/authority.ts:100-135 |
| PRD ki Pune network list, "Velhe" samet | docs/PRD.md:524-532 |
| T4.1 PR E T4.2 ke baad; T4.2/T4.3 khule; §P formula aur table (Phase 4: 12 me 2 `[x]`, 1 `[~]` = 21%; poora 24%) | docs/TASKS.md:14-36, :181-183 |
| Packages abhi publish nahi hote | docs/packages/README.md:3 |
| Customer credits page hai (sirf icons) | frontend/customer/app/routes/credits.tsx:1-12 |
| BSON sizes: PIN code 371 B + 58 B/office, `alsoIn` +91 B, override +128 B, district 159 B, sub-district 164 B, setting 328 B | scratchpad script bson-size3.cjs (repo ke bahar), repo ke node_modules/bson se chalaya |
| 2026-11-16 Monday hai | nikaala gaya (din 320; 1 Jan 2026 Thursday) |

### 12.2 Assumed (confirm karna hai)

- **LGD files:**
  - XLS format (binary ya HTML) abhi dekha nahi. Column names mirror jaise maane gaye hain; PR 1 se pehle ke downloads ye tay karenge.
  - Rename pe LGD codes same rehte hain, ye maana gaya hai. Pehla dry run Ahilyanagar aur Rajgad ko modifications file se check karta hai.
- **LGD reparenting:** maana gaya hai ki LGD sub-district ko naye district me le jaate waqt uska code rakhta hai (Ladakh aur Kakinada cases). Agar re-code karta hai, to village rows retired codes rakhti hain, skip hoti hain aur `VILLAGE_CODES_STALE` lagta hai.
- **India Post office types:** ek public copy unhe BO/PO code karti hai (reviewer ki batayi Esri India layer, yahan check nahi). Variant list aur anjaan pe stop wala niyam ise sambhalta hai.
- **Pune ka kinara:** 411057 ka Hinjawadi (Mulshi ke gaon) aur Wakad cover karna reviewer ki batayi villageinfo.in aur postoffices.onrender.com se hai, yahan check nahi. 411038 Kothrud, 411045 Baner aur 412213 Bhor/Rajgad ki tarah ye illustrative hai. Asli kinare wali list file se aayegi.
- **Leh:** ki India Post ki Leh rows ab bhi "Jammu & Kashmir" kehti hain, aur Leh se kaunse naye Ladakh districts bane, ye asli files padhne tak illustrative hai.
- **Village export:**
  - data.gov.in ka state-wise export capped nahi, ye maana gaya hai.
  - Capped ho to maana gaya hai ki code se ordered hai, to cap aakhri sub-districts hatata hai aur coverage check pakadta hai. Kisi aur order me ho to 99.9% total check backstop hai.
  - Har state ki asli sub-district coverage (shehri states) pehli run ke baad hi pata chalegi.
- **Cross-state jhagde:** kitne PIN 3-gaon/50% line paar karte hain, ye pehle prepare tak anjaan; L20 tay hone se pehle REPORT numbers deta hai.
- **Counts:** lagbhag 19.6k unique PIN codes (third-party counts); lagbhag 20% PIN codes pe `alsoIn`; office naam ki average lambai lagbhag 15 chars; index ki keemat 10–40 B per entry.
- **Atlas:**
  - har likha document Opscounter me ek operation ginta hai;
  - M0 pe bq-core ko bq_core pe `$collStats`/`dbStats` allowed hai (best-effort; pehla live diff dikhayega);
  - 50-upsert + ≤ 50-insert transaction 10 s ke andar aaram se commit hota hai;
  - Network Access me temporary IP entries hoti hain.
- **Vercel:** in projects ke rewrites pe upstream cache headers maanta hai, aur cache key me query string hoti hai.
- **Sizes aur rates:**
  - Redis me har facts entry ≈ 450 B (value ~350 B + key + overhead; Valkey test naapta hai);
  - UP ke ~75 districts ek 16 KB event me aate hain;
  - Pune ke liye area-setting edits lagbhag 5/din;
  - har district har saal lagbhag 15 dated holidays.
- **data.gov.in:** usage/purpose options me non-commercial/education hai.
- **Shuruaati values:** ye sab `rules.json`, seed config ya ek naamit constant me rehte hain:
  - geography: India box; 100 km floor, 1.5 × p95, 25 km aur 40% thresholds; 6 km catchment aur 12 km fringe band;
  - cross-state: 3-gaon/50% line;
  - village checks: 99.9% total, 90% coverage, re-import pe 98%;
  - Redis aur PIN check: 10 minute me 3,000 ka write budget; har second 30 Mongo reads ka read budget (N17);
  - area settings: 20,000 rows; har setting din me 20 badlav; 60,000/150,000 history rows; prune rule (newest 50 versions + 400 din); 30 din ki holiday window; holiday request me 400 items.
- **Geography:** Pune ke talukas ki ginti (14 vs 15), aur har city hub kis taluka me hai, ye seed ke waqt LGD data se aata hai.

---

## 13. Review me kya mila aur kaise theek hua

Ye plan chaar analyses (sources, T4.2 model, T4.1 E area settings, T4.3 network) se bana, aur teen review rounds se guzra: round 1 me 38, round 2 me 18 aur round 3 me 13 issues; har issue ka jawab neeche ki tables me hai. Repo me is file ke alawa kuch nahi badla.

**Process.** Is plan ke liye analysts aur reviewers ek saath (parallel) chale. Ye RULES §9.1 se alag hai, par owner ne **sirf isi plan ke liye** iski saaf manzoori di thi (2026-11-16). Reviewers ko ye manzoori pata nahi thi, isliye unhone ise mudda bataya. Baaki saare kaam pe RULES §9.1 waisa hi laagu hai.

### 13.1 Round 1 (38 issues)

| Mudda | Kaise theek hua |
|---|---|
| Import ke data writes kisi transaction me nahi the (RULES §4.3) | Har batch ek chhota `withTransaction`: ≤ 50 upserts, us batch ki change rows, progress; finish me audit + event; L21 owner sawal; crash test (§3.5) |
| Redis `gen` aur open-areas key bina TTL (RULES §4.12) | Har key ka TTL, atomic bump script `max(old+1, now ms)`, open-areas key hataya, TTL ka Valkey test (§6.3) |
| District chunne ka niyam chupchaap badla (gaon pehle) | L20 owner sawal, dono order `rules.json` switch ke peeche, REPORT me state-wise farak (§3.3) |
| "Saare PIN mapped" ka naya matlab bina owner ke | L22 owner sawal, `confirmed` field aur alag confirm route (§3.6) |
| `network_areas.key` jaisi strings me ObjectIds (RULES §4.17) | Typed `area {level, stateCode, districtId, pincodeId}` + `chain`, chaaron fields wala unique index, explain tests (§5.3, §6.1) |
| Guest PIN localStorage me (RULES §5.9) | Sirf visit ki memory; N15 owner sawal (§6.7) |
| Owner wale hisse English me the | Owner ke hisse Hinglish me; ab ye poora doc Hinglish (RULES §8.1) |
| Reviewers ek saath chale (RULES §9.1) | Owner ki manzoori se tha, sirf is plan ke liye; upar "Process" dekhein |
| Event PR 3 me, contract PR 4 me | `catalogue/location.ts` event, khaali subscriber list aur audit naam PR 3 me (§8.1) |
| `expansion.area.went_live` regex fail karta | `expansion.area.wentLive`; ARCHITECTURE §8.8 theek (§6.8) |
| Docs aur task lines plan se alag reh jaate | PR 1 me ARCHITECTURE §8.1/§4, TASKS "Plan" lines aur har hand-off apni line me (§8.1) |
| `override_at` partial index ki query shape nahi | `partialFilterExpression {'override.at': {$type: 'date'}}` + wahi query, explain test (§3.4) |
| Mutations ki RULES §6.2 category nahi | Har group ki category; CRUD aur IST helpers se mutations hataye (§8, §9) |
| Cross-state override bina step-up | L13 me step-up sawal; confirm aur override ke do routes (§3.6) |
| SOURCE.md/REPORT.md ka format aur naamon wala column | Status header, change log, generated header; `name` asli header se (§3.2) |
| Laptop run book me Valkey nahi | `dev:backend` se pehle Valkey (§3.9) |
| Crash pe change rows kho jaati | Per-batch transaction; `--abandon` bhi event bhejta hai (§3.5) |
| Override aur official values mix ho jaate | Poora triple ek `$cond` se; retired target pe `OVERRIDE_DROPPED`; LIVE guard me (§3.5) |
| Sub-district ka parent ya district ka state badalne ka koi kind nahi | `reparented`, `stateChanged` kinds, LIVE guard aur subscribers (§3.3, §3.4) |
| Mirror re-import pe data palat deta | Mirror sirf pehli import pe; mirror pe `--allow-retire` mana (L1) |
| Kinare ke PIN (411057) taluka hub pe chale jaate | N9 catchment rule, fringe list, `SUBDISTRICT_CLOSE_VOTE` (§6.6) |
| Space guard sirf location ka | Operator ka type kiya Atlas Logical Size ≤ 400 MB; area settings row cap (L16, §5.3) |
| Office type "PO" chupchaap OTHER banta | PO → SO; anjaan type pe stop; REPORT me values (§3.3) |
| Bade districts me sahi coordinates null | Radius `max(100 km, 1.5 × p95)`; sirf decimal parse (§3.3) |
| Matching key collision aur retired alias target | Dono pe stop, fixtures ke saath (§3.3) |
| Har re-import saare ~27.5k docs dobara likhta | Sirf badle records likhe jaate hain (§3.5) |
| Raw files sirf owner ke paas | Private shared folder + sha256 (L8) |
| Logistics app ke routes ka asli user check mumkin nahi | Logistics sign-in PR 5, pages PR 6/7 (L15) |
| Fresh DB pe identity ki copy khaali reh jaati | Chaar raaste: release steps, import finish, resend command, catch-up task (§6.5) |
| Redis cache poore India pe 4 MB se upar | Sirf positive entries + 3,000 ka write budget (§6.3) |
| Fixtures downloads se pehle | Downloads PR 1 se pehle (§2) |
| Village files ka truncation check nahi | Aakhri row, "Total records" aur state checks (§3.3) |
| CDN SWR 604,800 se ~8 din purana | Location routes `sMaxAge 86400, SWR 3600`, ~25 ghante, page pe likha (§3.7) |
| Hit pe bhi location ka Mongo read | Redis pehle, facts me location (§6.3) |

### 13.2 Round 2 (18 issues)

| Mudda | Kaise theek hua |
|---|---|
| Process note parallel reviewers ko kam bata raha tha | Owner ki manzoori upar "Process" me likhi |
| Grant UI (Master Staff) me pickers ka koi plan nahi | PR 10b, `iam.places.list`, N16 (§6.5) |
| Kai hand-offs kisi task line me nahi likhe | PR 1 ki hand-off list (§8.1) |
| Nayi queries ke indexes nahi | Hubs/warehouses `subDistrictId`, partial `pincodeId_pin`, resend ka full-read comment (§5.3, §6.1, §6.5) |
| Seed settings write service ke bina | `applyAreaSettingChange` + system actor fields (§5.6, §6.6) |
| National holidays ki list kaun bhare, tay nahi | S9 + `holidays-india.json` + saalana alert |
| Audit me guard bypass nahi dikhta | `guardsBypassed`, `liveAreasTouched`, `--note` zaroori (§3.5) |
| Crash ke baad stale `stateCode`/`override.stateCode`, sub-district district ke bahar | Expected-fields diff, verify pass, 422 `SUBDISTRICT_NOT_IN_DISTRICT` (§3.5, §3.6) |
| Ek bhatke gaon se poori import rukti | Stop sirf ≥ 3 gaon aur > 50% pe; baaki flags (L20) |
| `moved` official hai ya effective, saaf nahi | `moved` = effective; naya `sourceMoved` + `OFFICIAL_MOVED` (§3.4) |
| Throttle asal me ~100 docs/s | Token-bucket `pacing()` (§3.5) |
| History ki koi seema nahi | Din ki seema, 60,000 alert, 150,000 stop (§5.3) |
| Attribution overrides ko chhupa deta | "for some PIN codes our staff have also set the district by hand" (§3.2) |
| Pehli import pe capped state chhoot sakta | Coverage, `roundCounts`, 99.9% total (§3.3) |
| bq_audit pe `dbStats` mana hota | CLI bq_audit kabhi nahi padhti; sirf bq_core best-effort (§3.5) |
| Fingerprint events cover nahi karta | `event-catalogue` release step (§3.5) |
| Miss ka kharch aur Redis size ka test galat | Reads ki ginti, limiter, naapa `MEMORY USAGE` test ≤ 3.5 MB (§6.3) |

### 13.3 Round 3 (13 issues)

| Mudda | Kaise theek hua |
|---|---|
| Process note round 3 aur RULES §9.1 ka doosra hissa bhool gaya | Owner ki manzoori upar "Process" me likhi; poochhna baaki nahi |
| Users pe asar wali limits owner rows nahi thi | S10 (area settings limits aur prune) aur N17 (read budget) |
| `resend-places` kis module ka, saaf nahi | Har module apna hissa; bundle command; `core-modules-no-cycle` aur collection-name test (§6.5, §5.6) |
| `rules.json`/SOURCE.md me columns par ek note CLAUDE.md ke sakht niyam se takrati | Note hatayi; `name` sirf asli header text se map (§3.2) |
| `scopeText` ids ko naam me nahi badal sakta | `iam.places.byIds`, "(closed)", "1 other hub" (§6.5) |
| Import apne flags mita deta | review = prepare ∪ stored import-owned ∪ naye; `$setUnion` (§3.5) |
| Purani village file galat district ko vote deti | Portal parent se vote + `VILLAGE_CODES_STALE` (§3.3) |
| Sub-district badalne pe confirmation toot-ti | Sirf district badalne pe lapse; `confirmationUpdated` (§3.4, §3.5) |
| Cross-state rule ke do case undefined | Office winner ki paribhasha; state ke andar dobara vote (§3.3) |
| Leh ka example galat alias sikhata | Split alias `JK.leh → [...]` (§3.3) |
| Transaction ke andar `count` | Soft caps transaction se pehle (§5.3, §5.6) |
| Limiter saste requests pe bhi trip karta | Read budget 30 reads/s (§6.3, N17) |
| Holiday list 4 saal me 60 pe bhar jaati | Save pe 30 din se purani dates hatti hain (§5.2) |

---

## Change log

| Version | Date | Badlav |
|---|---|---|
| v1.0 | 2026-11-16 | Pehla version (draft, owner ke faislon ka intezaar): T4.2 Location, T4.1 PR E Area settings aur T4.3 Network ka plan; owner ke 49 sawal (L1–L22, S1–S10, N1–N17), downloads, design, edge cases, M0 budget, 14 PR, tests, risks, change-proofing aur teen review rounds ka saar. |
| v1.1 | 2026-11-17 | Poori file ki jaanch ke 9 sudhaar: Pune seed ke baad live check `NOT_SERVED` (Coming soon nahi; §2.3, §8.3); §13 ka process note ab owner ka override batata hai; §0 ka cut-off example 13:00 pe ek jaisa; N11 sirf areas ke liye; 30 MB test vs 40 MB guard ka farak; collections 13 (`identity_places` samet); bq_audit ke chaaron rights; S5 aur N14 me option (b). |
| v1.2 | 2026-11-17 | Owner ne §1 ke saare 49 faisle "Meri salah" ke hisaab se maane (TASKS T4.1, T4.2, T4.3 ki "Plan" lines, MEMORY). Agla: owner ke downloads (§2), phir PR 1. |
