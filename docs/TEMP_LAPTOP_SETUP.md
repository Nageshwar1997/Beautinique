# TEMP: Do laptop ka setup, step by step

> **Status:** v1.0.3 (2026-11-25). Temp doc: primary aur secondary laptop pe kya karna hai, kram se, ek jagah. Setup poora hone (`01-foundation` ST-8 ho gaya) ke baad ye file hategi. Kaam ki asli list OT-10 se OT-13 [OWNER_TASKS.md](OWNER_TASKS.md) me; faisle D-462 aur D-463 [DECISIONS.md](DECISIONS.md) me; roz ke niyam [OPERATIONS.md](OPERATIONS.md) §1 niyam 11 se 14 me.

## 0. Pehle se ho chuka (2026-11-24)

- Secondary ka CPU Core i5-6200U, AVX aur AVX2 hai (OT-9).
- D: ka saara data `E:\D-drive-copy` aur `C:\D-drive-copy` me, har file ka SHA-256 mila; owner ne E: wali copy khol ke dekhi.
- Secondary pe Fast Startup band; drives ke naam: D: `Ubuntu Disk`, E: `Personal Disk`, C: `Windows Disk`.

## 0.1 Ho gaya (2026-11-25), aur jo asli install me seekha

- Ubuntu Server 26.04.1 LTS secondary ke partition 3 pe install (legacy/BIOS mode, GRUB menu me Windows 10 bhi), Windows boot hota hai. Primary se ssh key se login, password login band, Docker aur `infra:up` / `infra:down` chal gaye, `dev-data:copy` ka dump-restore chala ([OWNER_TASKS.md](OWNER_TASKS.md)). Router nahi, network phone ka hotspot hai: fixed IP (OT-11) ki jagah secondary ka naam `bq-infra.local`, ssh hosts us naam par (OT-11 ho gaya). `infra:up` aur `dev-data:copy` ke ports ka takraav D-462 ke badle se theek: `dev-data:copy` ab secondary ka Mongo khud bina tunnel uthata hai ([HANDOFF.md](HANDOFF.md) §2). Baaki: `dev-data:restore` ki asli jaanch.
- **Dobara install karna pade to:** Rufus me ISO Image mode, MBR, BIOS; "Grub 2.14 vs 2.16, Download required" pe **Yes** (24.04.5 legacy GRUB pe "Welcome to GRUB!" pe atka, 26.04.1 chala). Installer ko **network chahiye** (Wi-Fi ya cable): bina network "configuring apt" pe ghanton atka. Har screen pe **ek hi baar Enter**; baar-baar Enter dabane se screens skip hokar seedha "Installing system" pe chala jata hai. Keyboard laga ho tabhi Esc/F9 chalte hain; boot menu me **non-UEFI USB** wali entry chuno (UEFI wali GRUB menu me atak sakti hai).

## 1. Sabse zaroori niyam

- **Secondary ka purana data aur Windows nahi mitna (D-463).** Install sirf partition 3 (302.7 GB, `Ubuntu Disk`, jo D: tha) ko chhoota hai. Partition 1 (System Reserved, ~0.5 GB), 2 (C:, ~185 GB) aur 4 (E:, ~443 GB) ko kabhi haath nahi.
- Installer me **"Use an entire disk" kabhi mat chuno**; sirf **"Custom storage layout"**.
- Koi screen samajh na aaye, ya partition 3 ke alawa kisi aur pe "format" dikhe: **wahi ruko, Done/Continue mat dabao**, screen ki photo Claude ko dikhao.
- Password, passphrase ya private key kabhi chat, repo ya kisi doc me nahi; sirf password manager me.

## 2. Primary laptop: install ka USB banao (OT-10 ka kadam 3)

1. Ek pendrive lo, kam se kam 4 GB. **Uska saara data mit jayega**, isliye koi zaroori file ho to pehle kahin aur rakh lo.
2. Ubuntu Server 26.04 LTS ki ISO official site se download karo: <https://ubuntu.com/download/server> (file ka naam `ubuntu-26.04.x-live-server-amd64.iso` jaisa).
3. ISO pakki hai, ye jaancho: usi release page se `SHA256SUMS` file lo, phir PowerShell me (Downloads folder me):

   ```powershell
   Get-FileHash .\ubuntu-26.04.*-live-server-amd64.iso -Algorithm SHA256
   ```

   Jo hash aaye wo `SHA256SUMS` me us file ke saamne wale hash se bilkul mile. Na mile to ISO dobara download karo.

4. Rufus official site se lo: <https://rufus.ie>. Chalao aur ye chuno:
   - **Device:** aapki pendrive (naam aur size dekh ke pakka karo ki koi aur drive nahi).
   - **Boot selection:** SELECT dabake wahi ISO.
   - **Partition scheme:** `MBR`.
   - **Target system:** `BIOS (or UEFI-CSM)`.
   - Baaki sab jaisa hai waisa.
5. START. Rufus "ISOHybrid image detected" pooche to **"Write in ISO Image mode (Recommended)"**. Koi extra file download karne ki permission maange to Yes. Pendrive mitne ki chetavni pe OK.
6. "READY" aane pe pendrive nikaal lo.

## 3. Secondary laptop: Ubuntu Server install (OT-10 ka kadam 4)

**Taiyaari:** charger laga ho. LAN cable se router se jodna behtar hai (server ke liye Wi-Fi se zyada pakka); cable na ho to Wi-Fi bhi chalega. Windows me Start → Power → **Shut down** (Restart nahi).

**Dhyan:** installer ki screens ka kram 26.04 me thoda alag ho sakta hai (naam ya jagah). Jo screen yahan likhi se mile na, **ruko aur photo Claude ko dikhao**. Partition wale niyam (§1) har haal me wahi.

1. Pendrive lagao, laptop on karo, aur turant **Esc** baar-baar dabao. "Startup Menu" me **F9 (Boot Device Options)** → pendrive chuno (USB ya pendrive ke naam se).
2. GRUB ka menu aaye to **"Try or Install Ubuntu Server"**.
3. Installer ki screens, kram se:
   1. **Language:** English.
   2. **Installer update available:** "Continue without updating".
   3. **Keyboard:** English (US), Done.
   4. **Type of installation:** "Ubuntu Server" (minimized nahi). "Search for third-party drivers" khaali rehne do. Done.
   5. **Network:** cable laga ho to `enp...` ke saamne DHCP se mila IP (jaise `192.168.1.x`) dikhega; **ye IP likh lo**. Sirf Wi-Fi ho to `wl...` chuno → Edit Wi-Fi → apna network aur password. Done.
   6. **Proxy:** khaali, Done.
   7. **Ubuntu archive mirror:** jaisa hai, jaanch poori hone do, Done.
   8. **Guided storage configuration:** **"Custom storage layout"** chuno (**"Use an entire disk" nahi**). Done.
   9. **Storage configuration:** list me disk `sda` (~931 GB) aur uske 4 partition dikhenge: ~512 MB ntfs, ~185 GB ntfs, **~302.7 GB ntfs**, ~443 GB ntfs. Naam (`Ubuntu Disk`) shayad na dikhe; tab **302.7 GB size se pehchaano**.
      - **~302.7 GB wala partition** chuno → **Edit** → Format: `ext4`, Mount: `/` → Save.
      - Phir disk `sda` (pura disk, partition nahi) chuno → **"Use As Boot Device"** (GRUB disk ke shuru me jaata hai; partitions ko nahi chhoota).
      - Neeche **FILE SYSTEM SUMMARY** me sirf ek line honi chahiye: `/`, ~302.7 GB, new ext4, partition 3 of sda. Baaki teeno partitions "format" me nahi hone chahiye. **Kuch bhi aur dikhe, ya koi naya partition bane, to Done mat dabao: photo Claude ko.**
      - Ye screen ki photo Claude ko dikhao, Claude haan kahe tab Done.
   10. **"Confirm destructive action":** ye sirf partition 3 ko format karega (uska data pehle hi copy ho chuka). Continue.
   11. **Profile:** Your name `bq`, Your server's name `bq-infra`, Pick a username `bq`, password mazboot aur password manager me. Done.
   12. **Upgrade to Ubuntu Pro:** "Skip for now".
   13. **SSH configuration:** **"Install OpenSSH server" pe tick**. "Allow password authentication over SSH" pe bhi tick rehne do (pehli baar key bhejne ke liye; baad me Claude band karega). "Import SSH key" nahi. Done.
   14. **Featured server snaps:** kuch mat chuno. Done.
   15. Install chalega (HDD pe kuch minute). "Install complete" pe **"Reboot Now"**; pendrive nikaalne ko bole to nikaal ke Enter.
4. Reboot ke baad laptop seedha Ubuntu me jayega. **Windows abhi menu me nahi dikhega**: Ubuntu me os-prober aam taur pe pehle se band hota hai. Windows aur saara data disk pe hai; kadam 6 me Claude Windows ki entry jod dega.
5. `bq-infra login:` pe `bq` aur password. Phir ye chalao aur screen ki photo Claude ko dikhao:

   ```bash
   hostname -I
   lsblk -f
   ip link
   ```

   - `hostname -I`: secondary ka IP.
   - `lsblk -f`: `sda1`, `sda2`, `sda4` abhi bhi `ntfs` hone chahiye, aur `sda3` `ext4` jo `/` pe mounted ho.
   - `ip link`: network card ka MAC (`link/ether` ke baad), router ke liye.

## 4. Secondary ka naam, fixed IP ki jagah (OT-11)

Owner ka network phone ka hotspot hai (2026-11-25), router nahi, to DHCP reservation ho nahi sakti. Hotspot har baar naya IP de sakta hai, isliye secondary ko IP ki jagah naam `bq-infra.local` se jodte hain:

1. Claude secondary pe `avahi-daemon` chalu karne ka script bhejta hai (aur `ufw` me 5353/udp).
2. Owner use `ssh.exe -t bq@<SECONDARY_IP> "sudo bash ~/bq-mdns.sh"` se chalata hai (`bq` ka password ek baar).
3. Claude jaanchta hai ki primary se `bq-infra.local` milta hai, aur tab `%USERPROFILE%\.ssh\config` me `HostName` ko naam par karta hai.

Hotspot band ho ya phone ka data khatam ho to secondary aur primary ek dusre ko nahi milenge; dono ek hi hotspot pe hone chahiye.

## 5. Primary laptop: SSH key, agent aur Docker Desktop (OT-12, OT-13)

1. **Key banao** (normal PowerShell):

   ```powershell
   ssh-keygen -t ed25519 -C "primary-to-bq-infra"
   ```

   File ka raasta pooche to Enter (default `C:\Users\<aap>\.ssh\id_ed25519`). Passphrase mazboot rakho aur password manager me save karo.

2. **ssh-agent hamesha chalu** (PowerShell ko **Run as administrator** se kholo):

   ```powershell
   Get-Service ssh-agent | Set-Service -StartupType Automatic
   ```

   ```powershell
   Start-Service ssh-agent
   ```

3. **Key agent me daalo** (wapas normal PowerShell). Passphrase sirf ek baar poochega:

   ```powershell
   ssh-add $env:USERPROFILE\.ssh\id_ed25519
   ```

4. **Public key secondary pe bhejo** (`<SECONDARY_IP>` ki jagah asli IP; `bq` ka password ek baar poochega):

   ```powershell
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | ssh bq@<SECONDARY_IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
   ```

   Sirf `.pub` wali file jaati hai; `id_ed25519` (bina `.pub`) private key hai, wo kabhi kahin nahi jaati.

5. **Jaancho:** ye command bina password pooche `bq-infra` likhe:

   ```powershell
   ssh bq@<SECONDARY_IP> hostname
   ```

6. **Docker Desktop (OT-13):** Docker Desktop kholo → Settings (gear) → General → **"Start Docker Desktop when you sign in to your computer"** ka tick hatao → Apply. Docker Desktop installed rahe; emergency me haath se chalu karna.

Itna ho jaye to Claude ko batao "OT-10 se OT-13 ho gaye", saath me secondary ka IP.

## 6. Claude ka kaam, aapke saath (primary se, ssh ke upar)

Claude primary pe chalta hai aur ye kaam karta hai; har `sudo` pe secondary ke `bq` ka password aap daaloge (Claude nahi dekhta).

**Secondary pe:**

1. Updates: `sudo apt update` aur `sudo apt full-upgrade`.
2. Lid band hone pe bhi chalta rahe, aur kabhi sleep na ho: `systemd-logind` me lid ka action `ignore`, aur sleep, suspend aur hibernate band.
3. Firewall `ufw`: sirf SSH khula.
4. Docker Engine, Docker ke apne apt repo se (snap nahi); user `bq` docker group me.
5. **Windows ki entry GRUB me:** `os-prober` chalu, GRUB ka menu 10 second dikhe, default Ubuntu; `update-grub` ke output me "Found Windows 10" dikhna chahiye. Iske baad laptop on karne pe menu me Ubuntu aur Windows dono.
6. Key se login pakka hone ke baad hi ssh ka password login band (ho gaya 2026-11-25).

**Primary pe:**

7. `%USERPROFILE%\.ssh\config` me do host: `bq-infra` (Docker context ke liye) aur `bq-infra-tunnel` (sirf tunnel ke liye), dono `bq@<SECONDARY_IP>` aur aapki ed25519 key ke saath.
8. Docker context `bq-infra` (`ssh://bq-infra`), phir `npm run infra:use -- secondary` aur `npm run infra:status`.
9. Pehla asli `npm run infra:up -- backend`: containers secondary pe, tunnel primary ke `127.0.0.1` tak; phir `npm run infra:down` (snapshot primary pe `%USERPROFILE%\bq-dev-data\` me).
10. `npm run dev-data:copy` ki jaanch (Docker Desktop thodi der haath se chalu karke): dump aur restore chala (2026-11-25); `infra:up` ke saath ports ka takraav aaya, jo D-462 ke badle se theek hua ([HANDOFF.md](HANDOFF.md) §2). `dev-data:restore` ki asli jaanch aur code ke commit ke baad `01-foundation` ST-8 ho gaya, aur ye temp file hat jayegi.

## 7. Baad me roz

- **Secondary:** charger pe, lid band chalegi. Windows chahiye to laptop on karte hi GRUB menu me "Windows 10" chuno; kaam ke baad shut down karke wapas on karo (default Ubuntu).
- **Primary:** `npm run infra:up -- backend` se din shuru, `npm run infra:down` se band ([OPERATIONS.md](OPERATIONS.md) §1 niyam 12).

## Change log

| Version | Date       | Badlav                                                                                      |
| ------- | ---------- | ------------------------------------------------------------------------------------------- |
| v1.0.0 se v1.0.3 | 2026-11-24 se 2026-11-25 | Temp doc: primary aur secondary ke kadam, OT-10 se OT-13 aur Claude ka kaam (D-462, D-463). Ubuntu 26.04 LTS. Asli install ke sabak (Rufus GRUB, network, Enter) aur ab tak jo ho gaya. |
