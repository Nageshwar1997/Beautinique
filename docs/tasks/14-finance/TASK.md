# TASK 14: finance (books, tax documents, payouts aur milaan)

> **Status:** v1.0.0 (2026-11-22). Halat: planning; code abhi nahi. Module [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §3 ka `14-finance`; charan 8 se shuru (D-446). Progress: 0 / 33 points.

## 1. Lakshya

Har rupaye ka sachcha hisaab, double-entry aur sirf jodne wali books me: invoice aur credit note sahi seller ke GSTIN se aur bina gap ke number ke saath, sellers ka paisa platform ke kharche me kabhi nahi, payout do haath se, aur roz ka milaan ([ARCHITECTURE.md](../../ARCHITECTURE.md) §1, §10.6; D-001, D-282).

## 2. Scope

**Andar:** finance service (`backend/finance`, PostgreSQL Neon pe, D-057): journal aur sub-ledgers, documents aur numbering, tax archive, payables aur payouts, statements, TCS aur TDS, milaan, seller ke bank details (SR-052), mahine ka close.

**Bahar:**

- Pool, migrations aur transaction helper: `02-platform` ka `backend-postgres` (charan 8).
- Payment aur refund ka gateway: `12-payments`. Pack ka kaam: `13-commerce`.
- Screens: `22-app-finance`, `17-app-seller` (statements aur payouts), `20-app-master` (payout ki manzoori).
- Partner ki kamaai aur payout (D-104), transporter ka bill, aur finance ki poori reports: R2.
- Asli sarkari filings aur asli bank transfer nahi: dummy, aur payout "paid" haath se mark (D-026, PROJECT_PLAN §1 hissa 11).

## 3. Functional requirements

### 3.1 Books ki neev (charan 8)

1. Schemas `ledger`, `doc`, `payout`, `tax`, `recon`, `archive`, `sys`; app ke role ko books ki tables pe sirf `INSERT` aur `SELECT`, aur `UPDATE` aur `DELETE` rokne wala trigger (§10.6 niyam 1 aur 4, SR-053).
2. Journal: har line pe debit ya credit me se ek; commit pe jod barabar aur kam se kam 2 lines, database khud jaanche (deferred trigger) (§1.1 niyam 1, §10.6 niyam 2, AC-FINANCE-1).
3. Ek ghatna ek journal: `UNIQUE (source_type, source_id)` (§1.1 niyam 4, AC-FINANCE-4); band mahine me journal nahi; sudhaar sirf ulti entry se (§1.1 niyam 3 aur 7, AC-FINANCE-2).
4. Chart of accounts aur reference data release step ke seed se (§1.2); parties, sub-ledgers aur GSTINs; control khaate aur sub-ledgers ki raat ki jaanch (§1.1 niyam 5).
5. Neon sirf zaroorat pe: events ka batch misaal 15 minute pe sirf pending hone pe; `/health`, `/ready` aur `/wake` finance tak nahi; pool 2 (D-057, D-288, §10.6 niyam 13, AC-FINANCE-12).
6. Payment capture, refunds aur customer advances ki entries; prepaid pe capture ke pal delivery fee ka platform invoice (§1.3, §1.6, AC-FINANCE-7).

### 3.2 Tax documents (charan 9 aur 10)

1. Numbering: series row `FOR UPDATE`, bina gap, 1 April (IST) pe nayi series, `doc_no` 16 characters tak; cancel alag table me, number kabhi dobara nahi (§1.7, §10.6 niyam 6, AC-FINANCE-3).
2. Pack pe har seller ka tax invoice, commerce ki sync call `(parcel, seller, packSeq)` ki key se idempotent; seller ka naam sabse upar aur §1.9 ke saare fields; `packVoided` pe dispatch se pehle cancel (D-077, D-239, D-319, AC-FINANCE-5).
3. Credit notes (return, RTO, pack ke baad ki kami): asli invoice aur line ka hawala, quantity asli se zyada nahi, rakam asli line se (§1.8 niyam 5, AC-FINANCE-6); return fee ka invoice aur fee wapas pe platform ka credit note (AC-FINANCE-7).
4. Document me buyer ka state, shehar, pincode aur GSTIN; ₹50,000 ya upar pe naam aur pata sirf `archive.tax_copies` me, alag key se; account delete pe documents nahi badalte; seller copy ek-ek karke le, har download audit me (D-225, D-226, D-320, AC-FINANCE-11).
5. PDFs ek halki library se, ek waqt me 1, template ke version ke saath; har PDF pe SPECIMEN (D-145, [ARCHITECTURE.md](../../ARCHITECTURE.md) §7 niyam 7).

### 3.3 Seller ka paisa (charan 12)

1. Seller ki line man badle wali return muddat (misaal 7 din) poori aur koi return khula na ho to payable (D-081, D-369); hafte ke batch me udhaar aur fees katein, bharpai jude; misaal ₹100 se kam agle hafte; ek cycle me seller ka ek payout, sirf `due` lines (AC-FINANCE-9, D-071).
2. Payout batch: banane wala hi manzoor kare to mana (CHECK aur 403); naye bank khaate pe misaal 72 ghante payout nahi; payouts ka kill switch; manzoori pe step-up; asli transfer nahi, "paid" haath se mark (D-189, D-190, SR-052, AC-FINANCE-10).
3. Seller ke bank details encrypted, sirf aakhri 4 ank dikhe (SR-052).
4. Fees ka invoice har payout cycle; statements aur reports §1.10 se (payout statement, mahine ka saar, GSTR-1 ki madad, TCS, TDS, ITC ulatne ki report, udhaar ki yaad); seller ki reports bina customer ki pehchaan, CSV seemit (D-143, D-144).
5. Seller ka udhaar ke kadam aur `finance.seller.duesStage` (D-103).

### 3.4 Milaan aur close (charan 12)

Milaan M1 se M12 apne samay pe (§1.11); M1 me farak suspense me aur alert; M3 toote to payouts rukein (SR-053, AC-FINANCE-12); mahine ka close (§1.1 niyam 7).

### 3.5 Band financial year (charan 13)

Band FY ki encrypted export file, closing balances, documents ki list aur hash Neon me; file public key se band, hash audit chain aur backup ke manifest me (D-309, SR-097, §10.6 niyam 15).

## 4. Niyam

1. Rakam integer paise, rates basis points; float kabhi nahi (§1.1 niyam 2).
2. Tax ka din IST se; timestamps UTC (§1.1 niyam 6).
3. Sellers ka paisa platform ke kharche me nahi (§1.1 niyam 9, §1.5, D-269).
4. Driver `pg` aur type-safe query builder, sirf parameterized queries, ORM nahi (§10.6 niyam 14).
5. Saari posting aur numbering paise ka code hai: badli lines pe mutation aur 85% branch coverage (RT-21, RT-23).

## 5. Data model

[ARCHITECTURE.md](../../ARCHITECTURE.md) §10.6 ki tables: `ledger.*` (accounts, parties, party_gstins, periods, journals, journal_lines), `doc.*` (series, documents, document_lines, cancellations), `archive.*` (tax_copies, access_log), `tax.*` (party_tax_ids, tds_entries, tcs_monthly), `payout.*` (bank_accounts, payable_lines, batches, payouts), `recon.*` (runs, items) aur `sys.*` (outbox aur baaki platform tables; purge roz ke batch me). Columns, CHECKs aur triggers numbered SQL migrations me.

## 6. API

Routes contracts me ([tasks/README.md](../README.md)): Finance app ke routes (payables, batches, statements, reports, milaan), seller ke statements aur downloads. Facade: commerce (pack pe invoice) (§2.3). Bhejta hai: `finance.invoice.issued`, `finance.creditNote.issued`, `finance.payout.paid`, `finance.seller.duesStage`, `finance.reconciliation.mismatch`. Leta hai: `payments.payment.captured`, `payments.settlement.reported`, `payments.refund.*`, `payments.chargeback.*`, `commerce.return.inspected`, `commerce.orderLine.cancelled`, `commerce.orderLine.delivered`, `commerce.parcel.packVoided` ([ARCHITECTURE.md](../../ARCHITECTURE.md) §2.2).

## 7. Security

SR-009 (kill switch), SR-047 (paisa), SR-052 (bank), SR-053 (books ki suraksha aur milaan), SR-075 aur SR-088 (exports aur seller ka data), SR-097 (band FY ki file).

## 8. Dependencies

- **Tika hai:** `02-platform` (`backend-postgres`), `12-payments`, `13-commerce`.
- **Is pe tike:** `13-commerce` (pack), `11-catalog` (seller ka udhaar), `17-app-seller`, `20-app-master`, `22-app-finance`.
- **Owner ke kaam:** Neon ka finance project, charan 8 se pehle ([OWNER_TASKS.md](../../OWNER_TASKS.md) §3).

## 9. Acceptance criteria, manuals aur testing

- **Acceptance criteria:** [ACCEPTANCE.md](../../ACCEPTANCE.md) §1.9 `FINANCE` (`AC-FINANCE-1` se `AC-FINANCE-12`).
- **Manuals aur testing:** jis app me screen judti hai, uske manual aur testing file usi app ke module me (D-440).

## 10. Subtasks

Charan [PROJECT_PLAN.md](../../PROJECT_PLAN.md) §5 se (D-446). Points D-433 ke hisaab se, aur "ho gaya" sirf [RULES.md](../../RULES.md) §1 ki Definition of Done ke baad.

| #     | Subtask                                                                        | Charan | Size   | Halat |
| ----- | ------------------------------------------------------------------------------ | ------ | ------ | ----- |
| ST-1  | Service ka dhaancha: schemas, roles, triggers, chart of accounts, parties      | 8      | L (4)  | Baaki |
| ST-2  | Journal posting: ek ghatna ek entry, events ka batch, capture aur delivery fee | 8      | L (4)  | Baaki |
| ST-3  | Numbering aur documents                                                        | 9      | M (2)  | Baaki |
| ST-4  | Pack pe tax invoices aur tax archive                                           | 9      | L (4)  | Baaki |
| ST-5  | PDFs aur SPECIMEN                                                              | 9      | M (2)  | Baaki |
| ST-6  | Credit notes aur return fee ke documents                                       | 10     | M (2)  | Baaki |
| ST-7  | Seller ke payables, udhaar, set-off aur bharpai                                | 12     | L (4)  | Baaki |
| ST-8  | Payout batch: do haath, naye bank ki rok, kill switch                          | 12     | M (2)  | Baaki |
| ST-9  | Fees invoices, statements, TCS aur TDS, seller ki reports                      | 12     | L (4)  | Baaki |
| ST-10 | Milaan M1 se M12, mahine ka close aur udhaar ke kadam                          | 12     | L (4)  | Baaki |
| ST-11 | Band financial year ka export                                                  | 13     | S (1)  | Baaki |
|       | **Kul**                                                                        |        | **33** |       |

## Change log

| Version | Date       | Badlav                                                           |
| ------- | ---------- | ---------------------------------------------------------------- |
| v1.0.0  | 2026-11-22 | Module 14 ka pehla spec aur 11 subtasks (D-446); code abhi nahi. |
