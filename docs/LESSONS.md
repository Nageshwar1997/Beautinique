# LESSONS: Beautinique

> **Status:** v1.1.2 (2026-11-25). Sabak aur traps: kya hua, kyun hua, ab kya karte hain. Faisle yahan nahi, [DECISIONS.md](DECISIONS.md) me. Cheezein ek-ek karke judengi.

## Is file me kya aayega

Har sabak: **Kya hua**, **Kyun**, **Ab kya karte hain**, **Kab** (date).

## 1. Git

### Nayi branch ka upstream `prerelease` (2026-11-23)

- **Kya hua:** `01-foundation` ST-8 ka commit (`19be6c2`, lagbhag 30 files) PR ke bina seedha `prerelease` pe push ho gaya. CI green raha, par PR aur uska "kaise jaancha" nahi bana.
- **Kyun:** branch `git switch -c <branch> origin/prerelease` se bani thi. Remote branch se bani nayi branch use apna upstream maan leti hai, to saada `git push` (ya VS Code ka Sync) kaam ko seedha `origin/prerelease` pe bhej deta hai.
- **Ab kya karte hain:** nayi branch hamesha `git switch -c <branch> --no-track origin/prerelease` se (hotfix: `--no-track origin/release`), aur push `/push` se, jo upstream na ho ya kisi aur branch ke naam ka ho to usi naam ki remote branch banata hai ([GIT_SKILLS.md](GIT_SKILLS.md) §4, `.claude/skills/_shared/git-rules.md` §3).

## 2. Secondary laptop

### Ubuntu Server ka install, aur dobara karna pade to (2026-11-25)

- **Kya hua:** secondary (HP 15-ay503TX, Windows 10 ke saath dual boot) pe Ubuntu Server ka install kai baar atka: 24.04.5 legacy GRUB pe "Welcome to GRUB!" pe ruka; bina network ke "configuring apt" pe ghanton; aur baar-baar Enter dabane se screens skip hokar seedha "Installing system" pe chala gaya.
- **Kyun:** purani GRUB legacy/BIOS boot me nahi chali (26.04.1 chali); installer apt ke liye network maangta hai; har screen ek Enter maanti hai, to dobara Enter agli screens ko bina padhe daba deta hai. Aur us disk pe Windows aur owner ka purana data bhi hai, jo galat storage choice se mit sakta tha.
- **Ab kya karte hain:** Ubuntu Server **26.04.1 LTS**. Rufus me **ISO Image mode**, partition scheme **MBR**, target **BIOS (or UEFI-CSM)**, aur "Grub 2.14 vs 2.16, Download required" pe **Yes**. Boot menu me **non-UEFI USB** wali entry chuno (UEFI wali GRUB menu me atak sakti hai); Esc aur F9 tabhi chalte hain jab keyboard laga ho. Install ke waqt **network** (Wi-Fi ya cable) ho. Har screen pe **ek hi baar Enter**. Storage me **kabhi "Use an entire disk" nahi**, sirf **"Custom storage layout"**: sirf partition 3 (302.7 GB, `Ubuntu Disk`, pehle D:) `ext4` aur mount `/`, disk `sda` "Use As Boot Device"; partition 1, 2 aur 4 ko haath nahi (D-463). Koi screen samajh na aaye, ya kisi aur partition pe "format" dikhe, to wahin ruko. Windows GRUB menu me tab dikhta hai jab `os-prober` chalu ho: `update-grub` ke output me "Found Windows 10" dekho. Poora purana kadam-ba-kadam text git me hai.
- **Kab:** 2026-11-25.

## Change log

| Version | Date       | Badlav                                                                                         |
| ------- | ---------- | ---------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                              |
| v1.1.1  | 2026-11-23 | Pehla sabak: nayi branch ka upstream `prerelease` (`--no-track`).                              |
| v1.1.2  | 2026-11-25 | §2: secondary pe Ubuntu Server ke install ke sabak (Rufus, GRUB, network, Enter, partition 3). |
