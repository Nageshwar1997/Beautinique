# TASK 06: media (photos, dastavez, video aur files)

> **Status:** v1.0.3 (2026-11-23). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `06-media`; charan 1 se shuru (D-446). Progress: 0 / 14 points.

## 1. Lakshya

Har file ka ek record aur ek maalik, upload seedha provider pe, private file sirf chhote signed URL se, aur har file apne samay pe mite ([ARCHITECTURE.md](../../ARCHITECTURE.md) §7, D-284, D-296, D-420).

## 2. Scope

**Andar:** media service (`backend/media`); file ke records; public aur review images media provider (Cloudinary, D-420) pe; private files object storage (Backblaze B2, EU Central, D-456) pe; retention ke jobs; exports ki files; kanooni rok wali files.

**Bahar:**

- Ports aur fakes: `02-platform` ka `backend-media`.
- Kaunsi file kab judti hai aur kaun dekh sakta hai: maalik service (catalog, commerce, logistics, support, finance) ka faisla; media sirf unke kehne pe URL deta hai.
- PDF ka content (invoice, statements, labels): maalik service ke module me (`14-finance`, `13-commerce`); media unki file ka record aur raasta.
- Upload ki screens: apps ke modules me; components `03-frontend-kit` me.

## 3. Functional requirements

### 3.1 Upload aur record

1. Client maalik service se upload maangta hai (maqsad, type, size); maalik service authorize karke media se signed upload leti hai (misaal 10 minute, exact type aur size); file seedha provider pe; client `assetId` deta hai, aur media file ki asli halat dekh ke `ready` hone pe hi judne deta hai (§7 niyam 1, SR-061). Backend ke raaste file kabhi nahi.
2. Record: maalik service aur record, maqsad, public ya private, type, size, hash, halat (`uploaded`, `ready`, `attached`, `deleting`, `deleted`, `rejected`) aur retention ki tareekh (§7 niyam 2).
3. Type bytes se: JPEG, PNG, WebP; PDF jahan zaroori; video sirf daawe me. Size misaal: image 5 MB, PDF 10 MB, video 30 MB. SVG, HTML aur baaki types kabhi nahi. File ka naam kabhi istemaal nahi. Account ki din ki seema (SR-061, SR-008).
4. Ek file ek maalik; wahi image doosri jagah chahiye to nayi copy (§7 niyam 6).

### 3.2 Public aur review images (SR-096)

Upload sirf media ke signed params se; `public_id` random, folder, type, allowed formats, size ki seema aur `overwrite` band server tay karta hai; upload pe hi dobara encode aur EXIF hatana; sirf naam wale transformations; provider ki khabar signature jaanch ke baad hi.

### 3.3 Private files (SR-062)

1. Object storage pe presigned PUT, exact `Content-Type` ke saath; upload ke baad asli size aur type ki jaanch.
2. Private images ka dobara encode aur EXIF hatana server pe: `heavy` queue, concurrency 1, pixels ki seema (misaal 24 MP) aur memory ka pehra; bani copy rakhi jaati hai, kachchi file turant mitti hai (§7 niyam 3).
3. Dekhna: maalik service authorize kare, phir chhota presigned URL (misaal 5 minute); PDF `attachment` ke roop me; app ke origin se kabhi nahi (§7 niyam 4).

### 3.4 Retention

1. Har maqsad ka samay maalik service ke "maamla band" se: delivery ki photo (D-191), daawe ki photos aur video (D-192), seller ke dastavez (D-193, D-227); roz ka job mitata hai (SR-065).
2. Roz: 24 ghante se purane bina jude uploads aur atke deletes saaf; hafte: provider ki list se milaan (§7 niyam 9).
3. File badli to nayi `assetId`; purani turant `deleting` me, siwaye jis purani file ki kisi record ko zaroorat ho (§7 niyam 10).

### 3.5 Exports ki files

Export maalik service DB cursor se stream karti hai, CSV seedha private file me; ek baar ka chhota link; file pehle download ke baad ya misaal 24 ghante me mite (§7 niyam 8, D-144, SR-075).

### 3.6 Kanooni rok

Lagbhag 13 May 2027 se delivery aur daawon ki photos aur video capture se 1 saal band encrypted jagah me (D-262, SR-097), aur rok wali files ek alag B2 bucket me Object Lock ke saath, rok ki muddat jitna (D-439, D-456).

## 4. Niyam

1. Provider ki chaabi sirf media ke config namespace me; business data me sirf `assetId` (D-284, SR-071, CR-21).
2. Private media kabhi service worker ke cache me nahi, page pe `no-referrer` (DS-7.7).
3. Har file ka record; koi file bina kisi record ke hamesha nahi rehti (§7 niyam 10).

## 5. Data model

| Collection | Kaam                                                    | Retention class | Samay                         |
| ---------- | ------------------------------------------------------- | --------------- | ----------------------------- |
| `assets`   | Har file ka record (maalik, maqsad, halat, hash, samay) | `case`          | Maqsad ke samay tak, phir rok |

Saath me platform collections ([ARCHITECTURE.md](../../ARCHITECTURE.md) §10.2). Fields aur indexes code ke saath is file me judte hain.

## 6. API

Facade (sync, §2.3): upload ka signed URL, file ki halat, private file ka chhota URL; catalog, commerce, logistics, support aur finance bulaate hain. Bhejta hai: `media.asset.ready`, `media.asset.rejected`. Leta hai: maalik services ke "maamla band" events, ya unki facade call ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-061 (uploads), SR-062 (private media), SR-065 (samay pe mitna), SR-096 (media provider), SR-097 (rok ki band copy), SR-071 (provider ki chaabi sirf yahan).

## 8. Dependencies

- **Tika hai:** `02-platform` (`backend-media`, `backend-crypto`, `backend-events`).
- **Is pe tike:** `10-logistics`, `11-catalog`, `13-commerce`, `14-finance`, `15-support`, aur upload wale apps.
- **Owner ke kaam:** OT-3 (Backblaze B2 ka account, region EU Central, D-456) 2026-11-23 ko ho gaya; Cloudinary ka account abhi baaki ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.12 `MEDIA` (`AC-MEDIA-1` se `AC-MEDIA-7`).
- **Manuals aur testing:** media kisi role ka feature nahi; upload aur dekhne ke kaam jis app me judte hain, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446): exports charan 12 me (seller ki reports), kanooni rok charan 13 me; baaki charan 1 me. Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #    | Subtask                                                                | Charan | Size   | Halat |
| ---- | ---------------------------------------------------------------------- | ------ | ------ | ----- |
| ST-1 | Service ka dhaancha, file ka record, `ready` pe judna aur facade       | 1      | M (2)  | Baaki |
| ST-2 | Type bytes se, size aur din ki seemaayein                              | 1      | S (1)  | Baaki |
| ST-3 | Public aur review images: provider ke signed params aur khabar         | 1      | M (2)  | Baaki |
| ST-4 | Private files: presigned PUT aur GET, server pe encode aur EXIF hatana | 1      | L (4)  | Baaki |
| ST-5 | Retention ke roz aur hafte ke jobs                                     | 1      | M (2)  | Baaki |
| ST-6 | Exports ki files aur ek baar ka link                                   | 12     | S (1)  | Baaki |
| ST-7 | Kanooni rok: band jagah aur lock wala folder                           | 13     | M (2)  | Baaki |
|      | **Kul**                                                                |        | **14** |       |

## Change log

| Version          | Date       | Badlav                                                                                         |
| ---------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| v1.0.0           | 2026-11-22 | Module 06 ka pehla spec aur 7 subtasks (D-446); code abhi nahi.                                |
| v1.0.1 se v1.0.3 | 2026-11-23 | Object storage Backblaze B2 (EU Central), rok wali files alag bucket me (D-456); OT-3 ho gaya. |
