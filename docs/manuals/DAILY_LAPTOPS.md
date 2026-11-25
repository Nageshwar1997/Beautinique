# MANUAL: Roz ka kaam, dono laptop on aur off (owner)

> **Status:** v1.0.5 (2026-11-25). Roz subah dono laptop on karne aur raat ko band karne ke kadam, aur har kadam andar kya karta hai. Niyam aur kaaran [OPERATIONS.md](../OPERATIONS.md) §1 niyam 11 se 16 me; yahan sirf kram.

## Kaun sa laptop kya karta hai

| Laptop                                     | Kya chalta hai                                                                                    | Kaise judte hain                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary** (Windows 11)                   | Code, VS Code, Node, tests, git. Docker Desktop band rehta hai (sign-in pe apne aap nahi khulta). | Primary secondary ke Docker se SSH ke upar judta hai (Docker context `bq-infra`).                                                                                     |
| **Secondary** (Ubuntu Server, bina screen) | Containers: MongoDB (replica set) aur Valkey. Lid band, charger pe chalti hai.                    | Ek SSH tunnel containers ke ports primary ke `127.0.0.1` pe laata hai (MongoDB 27017, Valkey 6379), isliye code, tests aur `.env.development` bina badle chalte hain. |

Dono laptop **ek hi hotspot** (phone) pe hone chahiye. Secondary `bq-infra.local` naam se milta hai, to hotspot ka IP badle to farak nahi. Hotspot band ho ya phone ka data khatam ho to dono ek dusre ko nahi milenge.

## Subah: dono on karna

1. **Phone ka hotspot on karo.**
2. **Secondary on karo** (power button). GRUB ka menu 10 second dikhta hai: kuch mat dabao, default **Ubuntu** hai. Windows 10 chahiye ho tabhi uski entry chuno (roz ka kaam nahi). Login nahi karna: ye server hai, primary se hi chalta hai. Boot me lagbhag 1 se 2 minute lagte hain (HDD). Boot hone ke baad lid band rakh sakte ho (neeche "Secondary ka screen aur lid").
   - **Andar kya hota hai:** Ubuntu uthta hai, SSH, Docker Engine aur `bq-infra.local` naam wali service apne aap chalu. Containers apne aap **nahi** uthte; wo kadam 6 me.
3. **Primary on karo**, Windows me sign-in karo, aur wahi hotspot juda ho. Docker Desktop **mat kholo**.
   - **Andar kya hota hai:** ssh-agent apne aap chalta hai aur key yaad rakhta hai (passphrase dobara nahi). Docker ka current context `bq-infra` hi rehta hai.
4. **Repo ke root me terminal kholo** (VS Code ka terminal chalega).
5. **Jaancho ki sab sahi hai:**

   ```powershell
   npm run infra:status
   ```

   Ye sirf dekhta hai, kuch badalta nahi. Ye dikhna chahiye:

   ```text
   Containers run on: the secondary laptop (Docker context bq-infra)
   Docker: answering
   Containers: none
   SSH tunnel: not open
   ```

   - Pehli line me **secondary** hi ho. "this laptop" dikhe to Docker Desktop khula tha: neeche "Dikkat aaye to" dekho.
   - `Docker: not answering` ho to secondary abhi boot ho rahi hai: 1 minute ruko, dobara chalao.

6. **Containers uthao:**

   ```powershell
   npm run infra:up -- backend
   ```

   - **Andar kya hota hai:** (a) jaanchta hai ki secondary ka Docker jawab de raha hai, aur primary ke `27017` aur `6379` ports khaali hain; (b) secondary pe MongoDB (rs0) aur Valkey uthata aur healthy hone tak rukta hai; (c) SSH tunnel kholta hai. Aakhir me `SSH tunnel open for 127.0.0.1 ports ...` dikhna chahiye.
7. **Kaam shuru:** ab `npm run dev`, tests ya jo bhi; sab `127.0.0.1` pe MongoDB aur Valkey dekhte hain, jo asal me secondary pe hain.

## Din me

- Beech ka chhota break: kuch mat karo, containers aur tunnel chalte rahte hain.
- Containers kisi bhi waqt `npm run infra:status` se dekho.
- Primary restart karni ho, ya hotspot beech me gaya aur wapas aaya: tunnel toot sakta hai. `npm run infra:down` phir `npm run infra:up -- backend`.

## Secondary ka screen aur lid

- **Screen on rakhna zaroori nahi.** `infra:up` chalne ke baad **lid band kar do**: laptop chalta rahta hai (lid band hone pe bhi chalne ki setting, [OPERATIONS.md](../OPERATIONS.md) §1 niyam 15). Charger laga rahe, battery ke bharose nahi.
- **Lock ya sleep ki zaroorat nahi, aur ho bhi nahi sakta:** Ubuntu Server me desktop nahi, to lock screen nahi; sleep, suspend aur hibernate band hain. Sleep ho jaye to containers aur tunnel band ho jaate.
- **Power button mat dabana:** default me wo laptop ko shutdown kar deta hai. Band karna ho to neeche "Raat" ke kadam.
- **Hawa:** band lid ke saath bhi laptop khuli jagah rakho, bag ya kapde me nahi; band lid me wo garam hota hai.
- **Pehli baar test:** `infra:up` ke baad lid band karo, 1 se 2 minute ruko, phir primary pe `npm run infra:status`: `Docker: answering` aana chahiye. `not answering` aaye to ye setting kaam nahi kar rahi (Claude ko batao). Ye test abhi hua nahi.

## Raat: dono band karna

Kram yahi rakho: **pehle containers, phir secondary, aakhir me primary.**

1. **Kaam band karo:** chalte dev servers aur tests rok do (terminal me `Ctrl+C`).
2. **Containers band karo (secondary ko band karne se pehle, hamesha):**

   ```powershell
   npm run infra:down
   ```

   - **Andar kya hota hai:** (a) MongoDB ka snapshot primary pe `%USERPROFILE%\bq-dev-data\` me (aakhri 3 rakhta hai); (b) containers hat jaate hain, par data volume (`beautinique_mongo-data`) secondary pe bacha rehta hai; (c) SSH tunnel band.
   - Ye dikhna chahiye: `Saved the MongoDB snapshot ... to this laptop.` aur `SSH tunnel closed.` Snapshot ki warning aaye to batao; containers phir bhi band ho jaate hain.

3. **Jaancho (optional):** `npm run infra:status` me `Containers: none` aur `SSH tunnel: not open`.
4. **Secondary band karo:**

   ```powershell
   ssh -t bq-infra "sudo shutdown -h now"
   ```

   Secondary ke `bq` user ka password poochega (password manager se). Uske baad connection toot jaata hai: ye normal hai. Power light band hone tak (lagbhag 30 second) ruko, tabhi charger ya lid ko haath lagao. Power button dabaa ke band mat karo.
5. **Primary band karo:** Start, Power, Shut down.
6. **Hotspot band karo.**

> Ye `shutdown` command Claude ne abhi chalakar nahi dekhi (secondary band thi). Pehli baar chalao to dekhna ki password maangti hai aur laptop band hota hai; kuch alag dikhe to batao.

## Kaun sa command kya karta hai

| Command                                  | Kab                                 | Kya karta hai                                                                                                              |
| ---------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run infra:status`                   | Kabhi bhi, aur `infra:up` se pehle  | Sirf dikhata hai: containers kis laptop pe, Docker jawab de raha hai ya nahi, kaunse containers, tunnel khula hai ya nahi. |
| `npm run infra:up -- backend`            | Subah, kaam se pehle                | Secondary pe MongoDB aur Valkey uthata hai, aur SSH tunnel kholta hai.                                                     |
| `npm run infra:down`                     | Raat, secondary band karne se pehle | Snapshot primary pe, containers band, tunnel band.                                                                         |
| `npm run infra:use -- secondary`         | Docker Desktop khulne ke baad       | Docker ka context secondary pe karta hai. Containers ya tunnel chalu ho to rukta hai aur batata hai kya karna hai.         |
| `npm run infra:use -- primary`           | Sirf emergency                      | Docker ka context primary ke Docker Desktop pe karta hai.                                                                  |
| `ssh -t bq-infra "sudo shutdown -h now"` | Raat, `infra:down` ke baad          | Secondary ko saaf tareeke se band karta hai.                                                                               |
| `npm run dev-data:copy`                  | Kabhi-kabhi, neeche                 | Secondary ka development MongoDB primary ke local MongoDB me copy karta hai (ulta kabhi nahi).                             |
| `npm run dev-data:restore`               | Kabhi-kabhi, neeche                 | Aakhri snapshot primary ke local MongoDB me wapas.                                                                         |

## Dikkat aaye to

| Kya dikha                                                                                                       | Matlab                                                                              | Kya karo                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Docker is not running ... check that it is on and that ssh bq-infra works`                                     | Secondary band hai, abhi boot ho rahi hai, ya alag hotspot pe hai                   | 1 se 2 minute ruko. Dono ek hi hotspot pe hain, ye dekho. Phir `ssh bq-infra hostname`: `bq-infra` aana chahiye.                                                                                                                                                                                        |
| `infra:status` ki pehli line me `this laptop (Docker context desktop-linux)`                                    | Docker Desktop khula, to context apne aap primary pe aa gaya                        | Docker Desktop ke containers chal rahe hon to `npm run infra:down`, Docker Desktop band (tray icon se Quit), phir `npm run infra:use -- secondary`. `infra:use` rukne ka karan batata hai, wahi karo.                                                                                                   |
| `Port 27017 on 127.0.0.1 is already taken ...`                                                                  | Primary ke local Docker ke containers ya purana tunnel ports le kar baithe hain     | Message ka karan padho. Local containers hon to upar wali tarah; `An SSH tunnel is still open` likha ho to `npm run infra:down`.                                                                                                                                                                        |
| `The SSH tunnel (bq-infra-tunnel) did not open its ports ...`                                                   | Tunnel nahi khula: secondary band, ya ssh key agent me nahi                         | Secondary on hai ye dekho. Key: `ssh-add $env:USERPROFILE\.ssh\id_ed25519` (passphrase ek baar), phir `infra:down` aur `infra:up -- backend`.                                                                                                                                                           |
| `SSH tunnel: remembered but not answering`                                                                      | Tunnel ki yaad bachi hai par wo mar chuka (restart, hotspot)                        | `npm run infra:down`: purani yaad saaf karta hai. Snapshot ki warning aa sakti hai agar containers chal hi nahi rahe the. Phir `infra:up -- backend`.                                                                                                                                                   |
| Secondary `infra:down` ke bina band ho gayi (bijli gayi, ya bhool gaye)                                         | Snapshot nahi bana; containers apne aap nahi uthte                                  | Secondary on karo, `infra:down` (tunnel saaf), phir `infra:up -- backend`. Data volume `down` nahi hatata. Snapshot chahiye tha to agle `infra:down` pe banega.                                                                                                                                         |
| `infra:use` ya `infra:down` ne kaha "run npm run infra:down first" ya "infra:use -- secondary, then infra:down" | Containers ya tunnel abhi chalu hai                                                 | Jo message kahe, usi kram se.                                                                                                                                                                                                                                                                           |
| Git for Windows ka dialog "Enter passphrase for key ..."                                                        | Terminal me Git ka apna `ssh` chal raha hai, jo Windows ke ssh-agent ko nahi dekhta | Dialog me **Cancel** (passphrase yahan mat daalo). PowerShell terminal me chalao, ya Git Bash me `export PATH="/c/Windows/System32/OpenSSH:$PATH"`. Hamesha ke liye wahi line `C:\Users\<aap>\.bash_profile` me ([OPERATIONS.md](../OPERATIONS.md) §1 niyam 16 (3)); file na ho (naya laptop) to banao. |
| Lid band karne ke baad `Docker: not answering` ya tunnel toota                                                  | Secondary lid band hone pe so gayi, ya hotspot gaya                                 | Lid kholo aur power button ek baar dabao (so rahi ho to jaag jaati hai, band ho to boot hoti hai), 1 se 2 minute ruko, phir `infra:down` aur `infra:up -- backend`. Dobara ho to Claude ko batao, taaki lid ki setting dekhi jaaye.                                                                     |
| Secondary Windows 10 me boot ho gayi                                                                            | GRUB menu me Windows chuna gaya                                                     | Windows me Start, Power, Shut down; wapas on karke menu me Ubuntu (ya kuch mat dabao).                                                                                                                                                                                                                  |

## Kabhi-kabhi: secondary ka development data primary me lana

Roz ka kaam nahi. Tab karo jab secondary ke MongoDB me jo development data hai wo primary ke local MongoDB me chahiye. Data sirf secondary se primary ki taraf jaata hai, ulta kabhi nahi. Sab kuch **primary ke Docker Desktop** pe hota hai, to pehle secondary ke containers band:

1. `npm run infra:down` (snapshot bhi banta hai; secondary pe `infra:up` chalu ho to copy nahi chalti).
2. Docker Desktop haath se kholo.
3. `npm run infra:use -- primary`
4. `npm run infra:up -- backend` (local MongoDB uthta hai)
5. `npm run dev-data:copy`: copy se pehle primary ke local MongoDB ka backup `%USERPROFILE%\bq-dev-data\before-copy.archive.gz` me; copy beech me toote to wahi wapas aa jaata hai. Secondary ka MongoDB khud uthata aur copy ke baad band karta hai.
6. `npm run infra:down`, Docker Desktop band (tray icon se Quit), `npm run infra:use -- secondary`.

Snapshot se wapas lana ho (jaise secondary ka data ud gaya): kadam 2 se 4 wahi, phir `npm run dev-data:restore`, phir kadam 6.

## Dhyan rakho

- **`docker volume prune` kabhi nahi:** containers band hon to ye `beautinique_mongo-data` (development ka data) bhi hata deta hai.
- **Secondary pe koi live key ya credential nahi**, aur uski disk encrypt nahi; wahan sirf nakli development data hai. Live data ka kaam sirf primary pe.
- **Secondary ka Windows 10 aur purana data** (partition 1, 2, 4) ko haath nahi lagana (D-463).
- **Primary pe Docker Desktop sirf emergency me.** Emergency (secondary band ya kharab): Docker Desktop kholo, `npm run infra:use -- primary`, `npm run infra:up -- backend`, kaam, `npm run infra:down`, Docker Desktop Quit, `npm run infra:use -- secondary`. Primary 8 GB pe containers ke saath dheeli ho jaati hai.
- Secondary dobara install karna pade to pehle [LESSONS.md](../LESSONS.md) §2 padho: sirf partition 3, baaki partition aur Windows ko haath nahi. Secondary ki settings (ssh, firewall, lid, GRUB) [OPERATIONS.md](../OPERATIONS.md) §1 niyam 15 me, aur primary ki (tools, ssh, Docker context) niyam 16 me.
- **Terminal:** PowerShell ya Git Bash, dono chalte hain. Git Bash me Windows ka `ssh` pehle chale, iske liye `C:\Users\<aap>\.bash_profile` me PATH ki ek line hai (2026-11-25). Ye file na ho to Git ka ssh passphrase ka dialog kholta hai (Dikkat ki table).
- Password aur passphrase sirf password manager me; chat, repo ya docs me kabhi nahi.

## Change log

| Version          | Date       | Badlav                                                                                                                                                                                                                |
| ---------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.5 | 2026-11-25 | Nayi file: roz subah dono laptop on aur raat ko off karne ke kadam, commands, dikkat ki list (D-462). Secondary ka screen aur lid band karne ka hissa. Git Bash me ssh ka dialog: terminal ka note aur dikkat ki row. |
