# ARCHITECTURE: Beautinique

> **Status:** v1.3.11 (2026-11-22). System kaise bana hai, ek nazar me. Cheezein ek-ek karke, owner ki haan ke baad judengi. Abhi §1 (finance ke accounting niyam, D-282), §2 se §9 (system ke hisse, D-291 se D-298) aur §10 (data aur database, D-310 se D-317).

## Is file me kya aayega

- Tech stack.
- Services aur unki seemaayein.
- Data: kis data ka maalik kaun, kaunsa database.
- Services ke beech baat: seedhe request aur events.
- Auth aur permissions.
- Deployment aur environments.
- Logs, monitoring aur alerts.
- Finance ke accounting niyam: ledger, documents, statements aur milaan (§1, D-282).

Module ki detail apni `tasks/<nn-module>/TASK.md` me; yahan sirf poore system ki tasveer.

## 1. Finance ke accounting niyam (D-282)

Project ke CA (AI, D-257) ki raay se. Ye platform company (Beautinique Pvt Ltd) ke books ka dhaancha hai, jo finance service (PostgreSQL, D-001, D-057) me banta hai. Sellers ke apne books (unka GST, unka income-tax) unke hain; hum unke liye documents aur statements banate hain. Database ka asli design Database Architect ke saath (D-257 ka kram); yahan sirf accounting ke niyam. Tax ke niyam aur sources [COMPLIANCE.md](COMPLIANCE.md) §1 me. Saari rakamein misaal hain; registrations dummy (D-026).

### 1.1 Bunyadi niyam

1. **Double-entry:** har ghatna ek journal; lines ka jod debit = jod credit, commit pe database khud jaanche (deferred constraint ya trigger), code pe bharosa nahi.
2. **Rakam:** hamesha integer paise (₹1 = 100), currency INR; rates basis points me (18% = 1800). Float kabhi nahi.
3. **Sirf jodna (append-only):** journal lines pe update ya delete nahi; galti ka sudhaar ulti entry aur nayi entry se, dono me asli ka hawala. Yahi books ka audit trail hai (CL-131).
4. **Ek ghatna, ek entry:** har journal pe source ka unique key (gateway event id, invoice id, credit note id, payout id); unique index se do baar post hona namumkin, chahe webhook dobara aaye.
5. **Sub-ledgers:** har seller (seller + GSTIN), har partner aur har order ka apna hisaab; control khaate (jaise "Seller payable") ka jod sub-ledgers ke jod ke barabar; raat ki jaanch, farak pe alert.
6. **Tax ka din:** timestamps UTC me, par GST ka mahina aur financial year document ki India ki tareekh (IST) se. Raat 11:30 PM IST ka invoice usi din ka.
7. **Mahine ka close:** band mahine me nayi entry nahi; baad ka sudhaar khule mahine me, purane document ke hawale ke saath. GST return ke baad us mahine ke documents nahi badalte.
8. **Har rakam ka document:** seller ko dikhne wali har line kisi document se judi: invoice, credit note, fees invoice, bharpai ka record, kaat ka case, TDS ya TCS ki kaat.
9. **Sellers ka paisa platform ke kharche me nahi** (§1.5, D-269).
10. **Tax ke khaate GSTIN ke hisaab se:** platform ka normal GSTIN aur har state ka TCS GSTIN alag; CGST, SGST aur IGST ke alag khaate.
11. **Records ka samay:** platform ke books 8 financial years; sellers ke tax documents 72 mahine (D-280, CL-021, CL-131).

### 1.2 Chart of accounts (saar)

| Code | Khaata                                    | Kism      | Kaam                                                                       |
| ---- | ----------------------------------------- | --------- | -------------------------------------------------------------------------- |
| 1100 | Bank: Operating                           | Asset     | Platform ka apna paisa: kharche, taxes, partners ka payout                 |
| 1110 | Bank: Seller Settlement                   | Asset     | Gateway ka saara settlement; sellers ka payout; refunds (D-269)            |
| 1200 | Gateway receivable                        | Asset     | Captured, par settle nahi hua (gateway ke hisaab se)                       |
| 1210 | Gift card issuer receivable (R2)          | Asset     | Gift card se aaya payment (D-249)                                          |
| 1300 | Seller fees receivable (sub-ledger)       | Asset     | Fees invoice ki rakam jo abhi set-off ya chukai nahi; udhaar (D-071) yahin |
| 1310 | Partner receivable                        | Asset     | Vasooli jo kamaai se nahi kati                                             |
| 1320 | Chargeback receivable                     | Asset     | Gateway ne kaata, faisla baaki                                             |
| 1400 | Input GST (CGST, SGST, IGST)              | Asset     | Platform ke kharchon pe ITC                                                |
| 1420 | TDS receivable                            | Asset     | Doosron ne hamari aamdani pe kaata (CL-134)                                |
| 2100 | Customer advances (order ke hisaab se)    | Liability | Order ka paisa mila, seller ka invoice abhi nahi                           |
| 2200 | Seller payable (sub-ledger: pending, due) | Liability | Invoice hui bikri ka seller ka hissa                                       |
| 2300 | Customer refunds payable                  | Liability | Refund tay, abhi gaya nahi                                                 |
| 2400 | Output GST (platform ki apni supplies)    | Liability | Fees, delivery fee, return fee                                             |
| 2410 | GST TCS payable (state ka TCS GSTIN)      | Liability | CGST s.52 (CL-013)                                                         |
| 2420 | TDS payable: e-commerce                   | Liability | Sellers (CL-014)                                                           |
| 2430 | TDS payable: contractor                   | Liability | Partners (CL-113)                                                          |
| 2440 | GST RCM payable                           | Liability | Jahan laage (CL-135)                                                       |
| 2500 | Partner payable (sub-ledger)              | Liability | Partner ki kamaai                                                          |
| 2600 | Loyalty points liability (R2)             | Liability | Pakke points ka provision (CL-008)                                         |
| 2700 | Social security contribution provision    | Liability | Notify hone pe (CL-112)                                                    |
| 4100 | Commission income                         | Income    | D-078                                                                      |
| 4110 | Handling fee income                       | Income    | Fulfilment fee ka handling hissa, 18% (D-275)                              |
| 4111 | Fulfilment delivery fee income            | Income    | Fulfilment fee ka delivery hissa, 5% bina ITC (D-275)                      |
| 4120 | Storage fee income                        | Income    | D-066                                                                      |
| 4130 | Disposal fee income                       | Income    | D-062                                                                      |
| 4140 | Return-to-seller charges                  | Income    | Wapsi ka kharcha (D-071, D-112)                                            |
| 4200 | Delivery fee income                       | Income    | Customer se delivery fee (D-107)                                           |
| 4210 | Return fee income                         | Income    | D-114 (CL-129)                                                             |
| 5100 | Delivery partner cost                     | Expense   | D-104                                                                      |
| 5110 | Transport cost                            | Expense   | Transporter (D-027, R2)                                                    |
| 5200 | Payment gateway fees                      | Expense   | MDR aur uska GST                                                           |
| 5300 | Promotions: platform ke offers aur points | Expense   | D-101, D-175, D-177                                                        |
| 5400 | Compensation to sellers                   | Expense   | D-063, D-276                                                               |
| 5410 | Recoveries (contra)                       | Expense   | D-068 (partner, transporter)                                               |
| 5500 | Chargeback losses                         | Expense   | D-095, D-280                                                               |
| 5600 | Bad debts                                 | Expense   | Udhaar ka write-off (CL-126)                                               |
| 5700 | ITC not available (delivery)              | Expense   | Delivery seva ke inputs (CL-132)                                           |
| 9000 | Reconciliation suspense                   | Control   | Milaan ka farak; mahine ke close pe zero                                   |

### 1.3 Ghatnaon ki entries

| Ghatna                                         | Debit                                                            | Credit                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Payment capture (prepaid)                      | Gateway receivable (poori rakam)                                 | Customer advances (maal ka hissa); Delivery fee income + Output GST      |
| Platform offer ya points ka hissa (R2)         | Promotions (offer) ya Points liability (points)                  | Customer advances (us hisse ki rakam)                                    |
| Gateway settlement                             | Bank: Settlement (net); Gateway fees; Input GST                  | Gateway receivable                                                       |
| Top-up (gateway fees, platform offer, points)  | Bank: Settlement                                                 | Bank: Operating                                                          |
| Dispatch: seller ka invoice                    | Customer advances                                                | Seller payable (pending)                                                 |
| E-commerce TDS (seller ke credit pe)           | Seller payable                                                   | TDS payable: e-commerce                                                  |
| Fees invoice (har payout cycle)                | Seller fees receivable                                           | Commission, Handling, Fulfilment delivery, Storage, Disposal; Output GST |
| Mahine ka TCS                                  | Seller payable                                                   | GST TCS payable (CGST + SGST, ya IGST)                                   |
| Return ya RTO: seller ka credit note           | Seller payable (ya Seller fees receivable, payout ho chuka)      | Customer refunds payable                                                 |
| Return fee (man badla)                         | Customer refunds payable                                         | Return fee income; Output GST                                            |
| Delivery fee ki wapsi: platform ka credit note | Delivery fee income; Output GST                                  | Customer refunds payable                                                 |
| Refund ka jaana                                | Customer refunds payable                                         | Gateway receivable ya Bank: Settlement                                   |
| Fees ka credit note (D-277)                    | Fee ka income khaata; Output GST                                 | Seller fees receivable                                                   |
| Payout (set-off ke saath)                      | Seller payable (due)                                             | Seller fees receivable (set-off); Bank: Settlement (net)                 |
| Sweep (platform ka kamaya hissa)               | Bank: Operating                                                  | Bank: Settlement                                                         |
| Udhaar ki chukai (payment link)                | Bank: Operating                                                  | Seller fees receivable                                                   |
| Udhaar ka write-off                            | Bad debts                                                        | Seller fees receivable (GST ulta nahi)                                   |
| Bharpai (D-063, D-276)                         | Compensation to sellers                                          | Seller payable (ek net line; GST, TCS, TDS nahi)                         |
| Bharpai wapas (maal mil gaya)                  | Seller payable                                                   | Compensation to sellers                                                  |
| Chargeback: gateway ne kaata                   | Chargeback receivable                                            | Bank: Settlement (aur usi din Operating se top-up)                       |
| Chargeback haara: seller ki galti              | Seller payable ya Seller fees receivable (seller ka credit note) | Chargeback receivable                                                    |
| Chargeback haara: platform ka                  | Chargeback losses                                                | Chargeback receivable (seller ki bikri waisi; credit note nahi)          |
| Partner ki kamaai                              | Delivery partner cost                                            | Partner payable                                                          |
| Partner TDS                                    | Partner payable                                                  | TDS payable: contractor                                                  |
| Partner se vasooli (D-068)                     | Partner payable                                                  | Recoveries                                                               |
| Partner payout                                 | Partner payable                                                  | Bank: Operating                                                          |
| Points pakke (R2)                              | Promotions                                                       | Points liability (andaaze ke saath)                                      |
| Points expire (R2)                             | Points liability                                                 | Promotions (ulta)                                                        |
| Gift card se payment (R2)                      | Gift card issuer receivable                                      | Customer advances                                                        |
| Delivery inputs ka ITC ulatna (mahine)         | ITC not available                                                | Input GST                                                                |
| GST, TCS, TDS jama                             | Output GST, TCS payable, TDS payable                             | Input GST (set-off); Bank: Operating                                     |

### 1.4 Ek misaal (R1 jaisa, saari rakam misaal)

Seller S (Maharashtra GSTIN) ka item ₹1,180 (18%: taxable ₹1,000.00, CGST ₹90.00, SGST ₹90.00); delivery fee ₹49 (5%: taxable ₹46.66, CGST ₹1.17, SGST ₹1.17); customer prepaid ₹1,229. Gateway fees ₹29.00 (₹24.58 + GST ₹4.42). Commission 10% taxable value pe = ₹100.00; fulfilment fee ₹25 = handling ₹15.00 (18%) + delivery ₹10.00 (5% bina ITC) (D-275); GST: (₹100 + ₹15) pe 18% = ₹20.70, ₹10 pe 5% = ₹0.50. TDS 0.1% = ₹1.00; TCS 0.5% = ₹5.00.

1. **Capture:** Dr Gateway receivable 1,229.00 / Cr Customer advances 1,180.00, Delivery fee income 46.66, Output CGST 1.17, Output SGST 1.17.
2. **Settlement:** Dr Bank: Settlement 1,200.00, Gateway fees 24.58, Input GST 4.42 / Cr Gateway receivable 1,229.00. Top-up: Dr Bank: Settlement 29.00 / Cr Bank: Operating 29.00. Delivery fee ka sweep: Dr Bank: Operating 49.00 / Cr Bank: Settlement 49.00.
3. **Dispatch (seller ka invoice):** Dr Customer advances 1,180.00 / Cr Seller payable 1,180.00. TDS: Dr Seller payable 1.00 / Cr TDS payable 1.00.
4. **Fees invoice:** Dr Seller fees receivable 146.20 / Cr Commission 100.00, Handling 15.00, Fulfilment delivery 10.00, Output CGST 10.60, Output SGST 10.60.
5. **Mahine ka TCS:** Dr Seller payable 5.00 / Cr TCS payable CGST 2.50, SGST 2.50.
6. **Payout:** Dr Seller payable 1,174.00 / Cr Seller fees receivable 146.20, Bank: Settlement 1,027.80.
7. **Sweep:** Dr Bank: Operating 152.20 / Cr Bank: Settlement 152.20 (fees 146.20 + TCS 5.00 + TDS 1.00). Settlement khaata is order pe ab zero.

Return (man badla, payout se pehle): seller ka credit note ₹1,180; return fee ₹49 (5%); refund ₹1,131. TDS ka ₹1.00 seller S ki agli bikri ke TDS me usi financial year me adjust; TCS me us mahine ki net value ₹1,000 kam; fees D-277 se (man badla: commission wapas, fulfilment fee nahi).

### 1.5 Seller settlement khaate ke niyam (D-269, D-280)

1. **Aata kya hai:** gateway ke saare settlements (aur R2 me gift card issuer ke).
2. **Jaata kya hai:** sellers ke payouts; refunds (jab gateway settlement se na kaate); platform ke kamaye hisse ka sweep.
3. **Platform ka kamaya hissa:** delivery fee aur return fee usi din sweep; fees, TCS aur TDS seller ke payable se kat-te hain aur payout ke din sweep. Fees ka paisa payout ke set-off se pehle sweep nahi, taaki seller ka paisa uski haan se pehle na nikle.
4. **Top-up usi din:** gateway fees, platform offer aur points ka hissa, aur chargeback ki kati rakam (faisle tak) Operating se Settlement me.
5. **Kabhi nahi:** partners ka payout, transporter, salaries, taxes ya koi platform kharcha Settlement se.
6. **Roz ka invariant:** Settlement ka bank balance ≥ Seller payable (pending + due) + Customer advances + Customer refunds payable + bina sweep wala TCS aur TDS. Kam ho to alert, aur payouts rukte hain jab tak farak samjha na jaaye.
7. **Byaaj:** khaata current account (bina byaaj), taaki sellers ke paise pe platform ki kamaai ka sawal na uthe; asli business pe bank ke saath tay.
8. **Dummy:** test mode me dono khaate dummy; bank statement test data se (D-055 ka haath ka "paid").

### 1.6 Kaun kya document jaari karta hai

| Document                                       | Jaari karne wala (GSTIN)                   | Kisko           | Kab                                                                                           | Hawala         |
| ---------------------------------------------- | ------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------- | -------------- |
| Tax invoice (maal)                             | Seller; platform seller ki taraf se banata | Customer        | Pack ya dispatch scan (D-239)                                                                 | CL-003         |
| Bill of supply / invoice-cum-bill of supply    | Seller                                     | Customer        | Wahi, jab Nil rate maal ho                                                                    | CL-130         |
| Credit note (maal)                             | Seller                                     | Customer        | Return manzoor, RTO hub scan, nuksaan pe refund, chargeback (seller ki galti), baad ki chhoot | CL-005, CL-017 |
| Delivery challan (bina keemat replacement, R2) | Seller                                     | Customer        | Replacement ke dispatch pe                                                                    | CL-006, D-280  |
| Tax invoice (fees)                             | Platform                                   | Seller (B2B)    | Har payout cycle                                                                              | CL-011, D-275  |
| Credit note (fees)                             | Platform                                   | Seller          | Fees ki wapsi (D-277) ya galti                                                                | CL-011         |
| Tax invoice (delivery fee)                     | Platform                                   | Customer (B2C)  | Prepaid: payment capture pe; delivery pe UPI: delivery pe                                     | CL-012, D-280  |
| Tax invoice (return fee)                       | Platform                                   | Customer (B2C)  | Return ki manzoori pe                                                                         | CL-129         |
| Credit note (delivery fee)                     | Platform                                   | Customer        | Fee ki wapsi pe                                                                               | CL-129         |
| Payout statement (tax document nahi)           | Platform                                   | Seller, partner | Har payout                                                                                    | D-081, D-104   |
| TDS certificate (Form 131)                     | Platform (TAN)                             | Seller, partner | Har quarter                                                                                   | CL-014, CL-113 |
| TCS ka mahine ka statement (jaankari)          | Platform (TCS GSTIN)                       | Seller          | Har mahine, GSTR-8 ke baad                                                                    | CL-013         |

Apna brand Unibelle bhi isi table me ek seller hai (D-031). Partners unregistered hain, to un se koi invoice nahi; platform ka payout statement hi record. Gateway aur transporter platform ko apne invoice dete hain.

### 1.7 Numbering

1. **Series:** har jaari karne wale GSTIN, har document type aur har financial year ki apni series. Misaal: seller invoice `S001/2627/000123`, seller credit note `S001C/2627/00045`, seller delivery challan `S001D/2627/0007`; platform fees `PF/2627/000123`, platform delivery fee `PD/2627/000123`, platform credit notes `PFC/...`, `PDC/...`. Seller ka chhota code (3 characters, jaise S001 me `001`; §10.1 niyam 10) platform deta hai.
2. **Format:** zyada se zyada 16 characters; sirf A-Z, 0-9, "/" aur "-"; financial year me unique (CL-003).
3. **Bina gap:** number document banne ke usi database transaction me, series ki counter row ko lock karke (`SELECT ... FOR UPDATE`); database sequence nahi (rollback pe gap chhodta hai). Number tabhi jab document pakka bane (pack ya dispatch scan); pack se pehle cancel pe number nahi (D-239).
4. **Cancel:** jaari number kabhi delete ya dobara use nahi; "cancelled" ka nishaan, wajah ke saath; GSTR-1 ke documents ke saar me ginti. Dispatch ke baad cancel nahi, credit note (D-239).
5. **1 April:** nayi series apne aap; purane saal ka document naye saal me nahi badalta.
6. **Ek se zyada warehouse state (baad me, D-037):** seller ke har state GSTIN ki alag series.
7. **Hawala:** har credit note pe asli invoice ka number aur tareekh; har fees invoice pe payout cycle; har delivery challan pe asli invoice.

### 1.8 Rounding

1. **Line ka hisaab:** daam GST samet (MRP ke niyam). Taxable value = daam × 10000 / (10000 + rate bps), paise tak; CGST aur SGST har ek = taxable value × (rate/2), paise tak, aadha paisa upar. Phir taxable value itni sudhaari jaaye ki taxable + CGST + SGST = daam bilkul (±1 paisa ka farak taxable value me, tax me nahi). IGST me ek hi tax. Misaal: ₹49 pe 5% = ₹46.66 + ₹1.17 + ₹1.17.
2. **Kai units:** line ka tax line ki kul rakam pe, unit pe nahi.
3. **Chhoot ka bantwara:** combo ya baante offer ki chhoot lines me "largest remainder" se, taaki jod bilkul barabar (D-278).
4. **Invoice ka round-off:** nahi (daam pehle se poore rupaye); field rahe, value 0.
5. **Return pe:** credit note asli line ki rakam se, dobara hisaab nahi (aadhi quantity pe anupaat, aur aakhri unit pe bacha paisa).
6. **TCS:** seller ke hisaab se mahine ki net value pe, paise tak. **TDS:** har credit pe paise tak; din ke ant me seller ka jod ek row. TDS ki rakam ke rounding ka naya niyam nahi jaancha.

### 1.9 Invoice pe kya

Seller ka naam (sabse upar, CL-084), pata, GSTIN; "Sold through Beautinique (e-commerce operator)" aur platform ka GSTIN (CA ki salah; kanoon ka niyam nahi jaancha); invoice number aur tareekh; customer ka state (aur ₹50,000 se upar naam aur pata, D-226); place of supply; har line: description, HSN, batch aur MRP (D-064), quantity, daam, brand ki chhoot, taxable value, rate, CGST/SGST ya IGST; platform offer ki line (CL-007); return ki muddatein (D-221); B2B me customer ka GSTIN (D-092); e-invoice wale seller pe IRN aur QR (CL-004); demo pe "SPECIMEN" (D-145).

### 1.10 Statements aur returns

Sab register, report, export aur yaad ki tarah; asli filing nahi (D-026, D-134). Har export "SPECIMEN" (D-145). Form numbers aur due dates setting me, kyunki ye badalte hain (CL-136).

| Kya                                    | Kis GSTIN ya TAN         | Kab (abhi ki samajh)                    | Kya jaata hai (hamare data se)                                                                                             |
| -------------------------------------- | ------------------------ | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| GSTR-1                                 | Platform ka normal GSTIN | Mahine (ya QRMP me quarter)             | B2B: sellers ko fees invoices; B2C: delivery aur return fee (state ke hisaab se); credit notes; HSN/SAC; documents ka saar |
| GSTR-3B                                | Wahi                     | Mahine                                  | Output tax (GSTR-1 se, badla nahi ja sakta; sudhaar GSTR-1A se); ITC (delivery wala ulta); RCM; net cash                   |
| GSTR-8 (TCS)                           | Har state ka TCS GSTIN   | Agle mahine ki 10 tak                   | Seller GSTIN ke hisaab se: mahine ki supplies, returns, net value, TCS; pichhle mahinon ke sudhaar                         |
| TCS ka saal ka statement               | TCS GSTIN                | 31 December tak                         | Saal ka saar                                                                                                               |
| GSTR-9 / 9C                            | Normal GSTIN             | Saal; seema ke hisaab se                | Saal ka saar aur books se milaan (nahi jaancha)                                                                            |
| TDS jama                               | TAN                      | Agle mahine ki 7 (March ki 30 April)    | Seller aur partner ka TDS alag                                                                                             |
| TDS statement (Form 140)               | TAN                      | Quarter: 31 Jul, 31 Oct, 31 Jan, 31 May | Har deductee: PAN, rakam, credit ki tareekh, TDS, section ka code                                                          |
| TDS certificate (Form 131)             | TAN                      | Statement ki due date ke 15 din me      | Sellers aur partners ko                                                                                                    |
| Income-tax return, tax audit, accounts | Platform company         | Saal                                    | Books se (8 saal); related party ki list (CL-015)                                                                          |

**Sellers ke liye:**

1. **Payout statement (har hafte):** pichhla balance; is cycle ki bikri (invoice number ke saath), returns (credit note ke saath), platform offer ka hissa, brand ki chhoot (jaankari), fees (fees invoice ke number ke saath), TCS, TDS (aur adjust hua TDS), bharpai (record id), kaat aur udhaar, payout aur bank ka UTR (dummy). Har line ka document.
2. **Mahine ka settlement saar:** gross invoices, credit notes, net; TCS ki net value aur TCS; TDS; fees aur unka GST (ITC ke liye); bharpai; udhaar.
3. **GSTR-1 ki madad ka export:** seller ke apne GSTR-1 ke liye B2B invoices, B2C ka state ke hisaab se saar, credit notes, HSN saar, documents ka saar, aur ECO ke through supplies (platform ke GSTIN ke saath). Seller khud file karta hai; hum sirf data dete hain.
4. **TCS statement (mahine):** jo GSTR-8 me us seller ke liye gaya, taaki seller portal pe credit maan sake aur apne GSTR-1 se mila sake; mismatch ki list.
5. **TDS:** mahine ka TDS statement aur quarterly Form 131.
6. **ITC ulatne ki report (mahine):** kho gaye, chori, nasht aur toote units (D-063, D-062) aur bina shart ke samples (D-229), batch ke saath (CL-009, CL-017).
7. **Fees invoices:** har cycle ka PDF, seller ke warehouse state wale GSTIN pe.
8. **Udhaar ki yaad:** 150 din se purane bina chukaye fees invoices (seller ke ITC ka 180 din ka niyam, CL-126).

**Partners ke liye:** hafte ka payout statement (har kaam ki rakam, kaat aur wajah, TDS, net, saal ka jod aur TDS ki seema tak kitna baaki); quarterly Form 131.

### 1.11 Milaan (reconciliation)

| #   | Kya milana                                  | Kab             | Kaise                                                                                                           | Farak pe                         |
| --- | ------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| M1  | Gateway ↔ ledger                            | Roz             | Har payment id: capture, refund, chargeback ki rakam aur status; settlement batch = captures − refunds − fees   | Suspense (9000), finance ka kaam |
| M2  | Settlement bank ↔ ledger                    | Roz             | Bank ki har line: settlement batch (UTR), payout, sweep, top-up                                                 | Payouts rukte hain               |
| M3  | Settlement invariant (§1.5 niyam 6)         | Roz             | Bank balance ≥ sellers ka payable + customer advances + refunds payable + bina sweep TCS aur TDS                | Alert; payouts rukte hain        |
| M4  | Seller sub-ledger ↔ documents               | Roz             | Seller ka gross = invoices − credit notes + platform offers; fees receivable = fees invoices − set-off − chukai | Seller ka statement rukta hai    |
| M5  | Control khaate ↔ sub-ledgers                | Raat            | Seller payable, partner payable, customer advances                                                              | Alert                            |
| M6  | Platform ka GSTR-1 ↔ ledger                 | Mahine          | Platform ke invoices aur credit notes ka jod = output GST ke khaate                                             | Return se pehle sudhaar          |
| M7  | GSTR-8 ↔ sellers ke invoices ↔ TCS payable  | Mahine          | Seller ke hisaab se net value aur TCS; jama challan                                                             | Sudhaar agle GSTR-8 me           |
| M8  | Hamara GSTR-8 ↔ seller ka GSTR-1            | Mahine          | Seller ka bataya (ya portal ka) data, jahan mile                                                                | Seller ko notice (tay din)       |
| M9  | TDS: ledger ↔ challan ↔ Form 140 ↔ Form 131 | Mahine, quarter | Deductee ke hisaab se                                                                                           | Correction statement             |
| M10 | Partner payouts ↔ kaam ↔ bank               | Hafte           | Delivery ke records se kamaai                                                                                   | Payout rukta hai                 |
| M11 | Bharpai ↔ nuksaan ke records                | Mahine          | Har compensation line ka D-063 ka record                                                                        | Alert                            |
| M12 | Stock ↔ invoices                            | Mahine          | Dispatch hui units = invoice lines (replacement ka challan alag)                                                | Warehouse aur finance            |

Mahine ka close tabhi jab M1 se M7 me koi khula farak na ho, ya har farak ka likhit kaaran ho.

## 2. Services aur data ki seema (D-291)

§2 se §9: Principal Software Architect ki raay se (D-257 ka kram), owner ki haan ke baad. "Misaal" wale saare numbers settings me rehte hain aur asli naap ke baad badalte hain. Data model, indexes aur migrations ki detail Database Architect ke saath; deployment aur alerts ka chalna DevOps / SRE ke saath.

### 2.1 Ek nazar me

```text
 Browser: 11 apps (Vercel Hobby, har app ka apna *.vercel.app, D-010, D-048)
   |  /api/*  same-origin rewrite + secret header (D-052, SR-002)
   |  /wake   seedha Render pe, sirf jagane ke liye (D-028)
   v
 Render free web service, Singapore, 512 MB, ek process (bundle mode, D-049, D-056, D-058)
 +--------------------------------------------------------------------------+
 | gateway (koi DB nahi): session, rate limit, CSRF, route manifest          |
 |    | process ke andar facade call (laptop ke split mode me signed HTTP)    |
 |    v                                                                       |
 | identity  notify  payments  catalog  commerce  logistics                   |
 | finance   support audit     media    logs                                  |
 |    | har service ka outbox usi DB transaction me                           |
 |    v                                                                       |
 | outbox dispatcher -> subscriber ka handler (inbox se dedupe)               |
 | ticker (har minute) -> DB ki due dates -> BullMQ jobs (email, PDF, export) |
 +--------------------------------------------------------------------------+
    | Atlas M0 (har service ka apna project aur cluster, Singapore)
    |   identity | notify | payments | catalog (+ Search) | commerce
    |   logistics | support | audit | media | logs
    | Neon free: finance (PostgreSQL, sirf kaam aane pe)
    | Render Key Value: BullMQ, rate limits, session ke marks (sach nahi)
    v
 Bahar: Razorpay (webhook seedha Render pe), Brevo (HTTPS API, D-287),
        browser push services, media provider (D-284), jagane ke pings (D-028)
```

### 2.2 Services aur data ka maalik

| Service   | Data ka maalik (saar)                                                                                                                                                                                                                                                                                                                                                 | Bhejta hai (mukhya events)                                                                                                                                                                                                                                                              | Leta hai (mukhya events)                                                                                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gateway   | Kuch nahi (koi DB nahi)                                                                                                                                                                                                                                                                                                                                               | Kuch nahi                                                                                                                                                                                                                                                                               | Kuch nahi; session ki jaanch identity se (SR-029)                                                                                                                                                                                            |
| identity  | Accounts, insaan ka jod (D-017, SR-076), credentials, authenticator, recovery codes, sessions, devices (D-183), roles, grants, invites, allowlist (D-133), consents aur 18+ ka record (D-150, D-255), signing keys                                                                                                                                                    | `identity.account.created`, `.changed`, `.erased`; `identity.grant.changed`; `identity.consent.recorded`                                                                                                                                                                                | `catalog.seller.statusChanged` (seller ka grant), `logistics.partner.activated` (partner ka grant)                                                                                                                                           |
| notify    | Templates, in-app inbox, push subscriptions, emails ki line aur din ki ginti (D-142), digest (D-140), bheje emails ka record (bina code ke)                                                                                                                                                                                                                           | `notify.emailCap.reached` (andar ka alert)                                                                                                                                                                                                                                              | Har woh event jispe khabar jaati hai (order, invoice, refund, delivery, recall, area khulna); `identity.account.erased`                                                                                                                      |
| payments  | Gateway orders, payments, webhook inbox (event id), refunds, delivery pe UPI QR, chargebacks, settlement reports                                                                                                                                                                                                                                                      | `payments.payment.captured`, `.failed`; `payments.refund.succeeded`, `.failed`; `payments.settlement.reported`; `payments.chargeback.opened`                                                                                                                                            | `commerce.refund.requested`                                                                                                                                                                                                                  |
| catalog   | Sellers (KYC ke refs, GSTIN, EPR, seller ka block D-238), brands, products, variants, listing versions (D-098, SR-041), daam aur itihaas (D-061, D-223), HSN table (D-086), ingredients aur blocklist (D-132), claims aur saboot (D-224), reviews aur moderation (D-135, D-136), search ka read model, synonyms (D-152)                                               | `catalog.seller.statusChanged`, `catalog.listing.published`, `catalog.price.changed`, `catalog.taxRate.changed`, `catalog.review.published`, `.hidden`                                                                                                                                  | `commerce.stock.changed`, `commerce.nextBatch.changed`, `commerce.orderLine.delivered`, `commerce.sales.rolledUp`, `finance.seller.duesStage`                                                                                                |
| commerce  | Cart, wishlist, addresses, orders, seller ke hisse, lines aur snapshots, reservations, stock (batch, bin, balance, movements), inbound shipment aur receiving (D-096), pick aur pack, cancel, return requests, refund ka hisaab (SR-047), customer ki seemaayein (D-091, D-109, D-204)                                                                                | `commerce.order.placed`, `.confirmed`; `commerce.orderLine.cancelled`, `.delivered`; `commerce.parcel.packed`, `.packVoided`; `commerce.stock.changed`; `commerce.nextBatch.changed`; `commerce.return.requested`, `.inspected`; `commerce.refund.requested`; `commerce.sales.rolledUp` | `payments.payment.*`, `logistics.parcel.*`, `logistics.pickup.completed`, `logistics.area.changed` (copy), `catalog.listing.published` aur `catalog.price.changed` (copy), `support.return.decided`                                          |
| logistics | Location master (Sub-District aur pincode, D-015, D-016), areas, switches aur live, pincode se hub, area settings (delivery fee D-107, cut-off D-117, UPI ki seema D-109), hubs, warehouses ki jagah, trips (D-027), partners, assignment, delivery attempts, delivery codes (encrypted), saboot ke refs, return pickups, RTO, waitlist (D-046), carrier port (D-014) | `logistics.area.changed`; `logistics.parcel.planned`, `.dispatched`, `.atHub`, `.outForDelivery`, `.delivered`, `.attemptFailed`, `.rtoReceived`; `logistics.pickup.completed`; `logistics.partner.activated`                                                                           | `commerce.order.confirmed`, `commerce.parcel.packed`, `support.return.decided`, `payments.payment.captured` (delivery pe UPI, SR-050)                                                                                                        |
| finance   | §1 ka sab: journal, sub-ledgers, documents aur numbering, payables, payouts, statements, TCS aur TDS, milaan, tax archive (D-225), seller ke bank details (SR-052), partner ki kamaai (R2)                                                                                                                                                                            | `finance.invoice.issued`, `finance.creditNote.issued`, `finance.payout.paid`, `finance.seller.duesStage` (D-103), `finance.reconciliation.mismatch`                                                                                                                                     | `payments.payment.captured`, `payments.settlement.reported`, `payments.refund.*`, `payments.chargeback.*`, `commerce.return.inspected`, `commerce.orderLine.cancelled`, `commerce.orderLine.delivered`, `commerce.parcel.packVoided` (D-319) |
| support   | Daawe (D-072, D-106), return aur daawe ke faisle (D-105), appeals (D-147), staff ki rakam ki seema (D-188), fraud ke signals (SR-058), grievance register (D-163); R2: tickets, SLA, skin reaction                                                                                                                                                                    | `support.claim.decided`, `support.return.decided`, `support.appeal.decided`                                                                                                                                                                                                             | Order, parcel aur return ke events (maamle ka context)                                                                                                                                                                                       |
| audit     | Audit entries hash chain ke saath (SR-076), security events (D-194)                                                                                                                                                                                                                                                                                                   | Kuch nahi                                                                                                                                                                                                                                                                               | Har service ka `*.audit.recorded`                                                                                                                                                                                                            |
| media     | Har file ka record (maalik service, maalik record, maqsad, public ya private, size, halat, samay; SR-062); provider ki chaabi sirf yahan (D-284)                                                                                                                                                                                                                      | `media.asset.ready`, `media.asset.rejected`                                                                                                                                                                                                                                             | Retention ke liye maalik services ke "maamla band" events, ya unki facade call                                                                                                                                                               |
| logs      | Request logs ke gzip chunks (D-285, D-250 niyam 5, CL-106)                                                                                                                                                                                                                                                                                                            | Kuch nahi                                                                                                                                                                                                                                                                               | Kuch nahi; gateway seedha likhta hai                                                                                                                                                                                                         |

### 2.3 Seedhi (sync) calls

D-011 ka "services ke beech data sirf events se" ka matlab: kisi service ke data ki copy doosri service me sirf events se banti hai, aur doosri service ka database koi nahi padhta (D-050, SR-068). Jahan user usi pal jawab ka intezaar karta hai, wahan typed facade call, sirf is list me (SR-071):

| Kaun bulata                                    | Kise                | Kya                                                                                  | Kyun sync                                                                  |
| ---------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| gateway                                        | identity            | Session aur revoke ki jaanch (Redis khaali ho to DB, SR-029)                         | Har request                                                                |
| identity                                       | notify              | OTP aur codes ka email turant (D-142 ki OTP line)                                    | Code DB ya outbox me saade roop me nahi rakh sakte (SR-015)                |
| commerce                                       | payments            | Gateway order banana (SR-048)                                                        | Checkout pe customer ruka hai                                              |
| commerce                                       | finance             | Pack pe invoices jaari karna, idempotent (parcel + seller)                           | Invoice parcel ke andar (D-077, CL-003)                                    |
| logistics                                      | payments            | Delivery pe UPI ka QR, exact rakam (SR-050)                                          | Partner darwaze pe                                                         |
| logistics                                      | commerce            | Assign aur Delivery sync ke waqt parcel ka naam, address aur phone (resolver; D-319) | Partner ko darwaze ka pata chahiye; logistics me copy nahi (§10.7 niyam 8) |
| notify                                         | identity, logistics | Bhejte waqt recipient ka email, aur delivery code (resolver)                         | Personal data aur code ki copy notify me nahi                              |
| catalog, commerce, logistics, support, finance | media               | Upload ka signed URL, file ki halat, private file ka chhota URL                      | User upload ya download kar raha hai                                       |

### 2.4 Niyam

1. Backend ki services: gateway (koi database nahi), identity, notify, payments, catalog, commerce, logistics, finance, support, audit, media (D-284) aur logs (D-285). Har data wali service ka apna database, apna DB user aur apna cluster (D-011, D-050); finance PostgreSQL pe, Neon me (D-001, D-057).
2. Har cheez ka ek maalik service (§2.2). Doosri service ka database koi nahi padhta; zaroori copy sirf events se (D-011, SR-068).
3. Stock, reservation aur order commerce me, ek transaction me (D-118, SR-045). Serviceability ki jaanch order ke transaction me, commerce ki apni pincode se hub aur area ki copy pe (D-016 niyam 9); copy `logistics.area.changed` se banti hai.
4. Daam ki copy commerce me, `catalog.price.changed` se; checkout ka total server pe isi copy se (SR-044).
5. Invoice, credit note aur fees ke documents finance jaari karta hai, number usi PostgreSQL transaction me (§1.7). Pack scan pe commerce finance ko idempotent sync call karta hai (parcel aur seller ki key se).
6. Files ka record aur provider ki chaabi sirf media me; baaki data me sirf `assetId` (SR-062, SR-071).
7. Settings aur kill switches maalik service ke paas (SR-009, SR-043); alag settings service nahi. Master app har maalik service ki settings API bulata hai.
8. Aankde (D-149) har maalik service khud banati hai; Master ka dashboard gateway ke ek composition route se. Alag "insights" service nahi.
9. Sync calls sirf §2.3 ki list wali. Unka graph bina chakkar (cycle) ke; resolver jaise interfaces maangne wali service me, aur implementation jodne ki jagah (composition root) pe. Ye dependency rule CI me jaancha jaata hai (SR-071). Finance kisi tez padhne wale raaste (product page, cart) me nahi bulaya jaata (R-014).
10. Bundle mode me saari services ek Express app me: gateway ke middleware ke baad seedha maalik service ka router, localhost HTTP hop nahi. Split mode me gateway HTTP se aage bhejta hai aur andar ki calls signed (D-049, SR-071). Dono mode me ek hi facade, sirf transport alag.
11. Har service ka config apne namespace me, aur service sirf apna namespace padhti hai (SR-071).

## 3. Events aur messaging (D-292)

**Order ka mukhya safar:**

```text
commerce.order.placed -> (prepaid) payments.payment.captured -> commerce.order.confirmed
  -> logistics.parcel.planned (delivery code bane) -> notify: confirmation email (D-126)
pack scan (commerce) --sync--> finance: invoices (number usi transaction me, §1.7)
  -> commerce.parcel.packed -> logistics: trip, hub, partner
  -> logistics.parcel.delivered -> commerce.orderLine.delivered -> catalog: review ka haq (D-135)
  -> finance: return window ke baad payable (D-081) -> hafte ka payout (D-189)
return: commerce.return.requested -> support.return.decided -> logistics.pickup.completed
  -> commerce.return.inspected -> finance.creditNote.issued + commerce.refund.requested
  -> payments.refund.succeeded -> finance, notify
```

**Niyam:**

1. Producer apna badlav aur event ek hi DB transaction me apne outbox me likhta hai (MongoDB me collection, finance me table). HTTP jawab commit ke baad (D-011).
2. Har producer ka dispatcher outbox se event uthata hai aur har subscriber ko alag deliver karta hai: bundle mode me process ke andar handler call, split mode me signed HTTP (SR-071). Har subscriber ki delivery ka haal (`pending`, attempts, `nextAttemptAt`) outbox me hi. Event ka sach outbox me hai, Redis me kabhi nahi (R-010, SR-070).
3. Commit ke turant baad process ke andar ek "nudge" dispatcher ko jagata hai; fallback poll misaal har 5 second.
4. Consumer apna asar aur `processed_events` (event id + subscriber, unique) ek transaction me likhta hai: delivery kam se kam ek baar, asar theek ek baar.
5. Ek subscriber ke liye ek aggregate (jaise ek order) ke events kram se. Ek fail ho to usi aggregate ke agle events rukte hain, baaki chalte rahte hain.
6. Retry backoff ke saath, misaal 8 koshish lagbhag 6 ghante me; phir consumer ke DB me dead letter aur owner ko ops alert. Dobara chalana Master app se, permission ke saath.
7. Envelope: `eventId`, `type` (`<service>.<aggregate>.<pastTense>`), `version`, `occurredAt` (UTC, server ka), `producer`, `aggregate {type, id, version}`, `actor`, `correlationId`, `causationId`, `data`. Zod se jaanch; galat producer ka event reject (SR-071). Size misaal 16 KB tak; event me sirf ids aur zaroori halat.
8. Event me kabhi nahi: OTP, delivery code, password, token, bank ya PAN, poora address, ya koi secret (SR-015, SR-054, SR-063, SR-077). Jise chahiye wo maalik se facade call se le.
9. Naya field jodna theek; tootne wala badlav naya `version`, aur consumer kam se kam pichhla version bhi samjhe (deploy ke waqt outbox me purane events baaki ho sakte hain).
10. Staff ka har likhne wala kaam aur mana hua kaam usi transaction me `audit.recorded` event likhta hai, jo audit service me hash chain me judta hai (SR-076). Isse "badlav hua par audit nahi" namumkin.
11. Outbox ke delivered events misaal 7 din baad aur `processed_events` misaal 14 din baad TTL se hatte hain (sabse lambi retry window se zyada).

## 4. Background jobs aur samay (D-293)

**Niyam:**

1. Har samay wala kaam maalik service ke DB me `timers` me (`dueAt`, `kind`, `ref`, halat). Process ka ticker misaal har 60 second DB lease ke saath due timers uthata hai; boot ke misaal 30 second baad ek poora sweep. Soya server (R-002) jaagte hi pichhla kaam pakad leta hai: kaam late hota hai, khota nahi.
2. BullMQ sirf kaam chalane ke liye (D-001): email, PDF, export, import, media ka kaam. Kaam ka record DB me, aur BullMQ ka job id wahi record id. Redis khaali ho to ticker "pending, par queue me nahi" wale records dobara daalta hai (R-010).
3. Har service ki ek halki queue (concurrency 2) aur poore process ki ek `heavy` queue (PDF, export, import, media; concurrency 1, R-007). Redis connections ek instance pe misaal 20 tak, taaki deploy ke waqt do instance bhi free plan ki seema me rahein.
4. Dispatcher, ticker aur har schedule DB lease ke peeche, aur har handler dobara chalne pe surakshit (deploy ke waqt do instance saath chalte hain).
5. "Din" IST ka calendar din (emails ki chhat D-142, aankde D-149, roz ke kaam); timestamps UTC me (CL-106, §1.1).
6. Har roz ka kaam "aakhri poora din" yaad rakhta hai, aur jaagne pe har chhoota din kram se banata hai (D-149).
7. Finance (Neon) pe kaam sirf zaroorat pe: payment, return aur refund ke events misaal har 15 minute ke batch me, sirf jab kuch pending ho (D-288); roz ke milaan ek batch me. `/health`, `/wake` aur `/ready` finance tak nahi jaate (D-057). Sirf pack pe invoice aur Finance app ka istemaal turant. Neon ka compute 0.25 CU pe ruka (R-014).
8. Jis kaam ka kanooni ya suraksha samay chhota hai (D-251 ki report pe turant chhupna aur alert, D-248 ka leak), wo job nahi: usi request me hota hai jo use shuru karti hai, kyunki tab server jaaga hai.
9. Neeche ki table module design ka shuruaati saar hai; har naya timer isi table me judta hai.

**Mukhya jobs (R1):**

| Kaam                                                    | Kab                                       | Service                | Zaroorat                                                              |
| ------------------------------------------------------- | ----------------------------------------- | ---------------------- | --------------------------------------------------------------------- |
| Reservation khatam (misaal 15 minute)                   | Timer                                     | commerce               | D-118                                                                 |
| Der se aaya payment: stock ho to order, warna refund    | Event pe                                  | commerce, payments     | D-118, SR-049, CL-109                                                 |
| Delivery pe UPI ka payment fail, 10 minute              | Timer                                     | logistics              | D-109                                                                 |
| Customer ka jawab nahi (pick pe kami): line cancel      | Timer                                     | commerce               | D-090                                                                 |
| Hub pe 3 din, phir RTO; doosri koshish                  | Timer                                     | logistics              | D-108                                                                 |
| Vaada toota to "der" aur khabar                         | Timer (cut-off ke hisaab)                 | logistics              | D-117, D-222                                                          |
| Return window band: payable                             | Timer                                     | finance                | D-081, D-221                                                          |
| Hafte ka payout batch (do haath)                        | Hafte                                     | finance                | D-081, D-189                                                          |
| Fees invoice har payout cycle; mahine ka TCS            | Cycle, mahine                             | finance                | §1.3, §1.6                                                            |
| Milaan M1 se M5 roz, M6 se M12 mahine                   | Roz, mahine                               | finance                | §1.11, SR-053                                                         |
| Seller udhaar ke kadam                                  | Roz                                       | finance, catalog       | D-071, D-103                                                          |
| Storage fee                                             | Mahine                                    | commerce, finance      | D-066                                                                 |
| Expiry: bikri band aur near-expiry alert                | Roz                                       | commerce               | D-062, D-082, D-124                                                   |
| Pichhle 30 din ka sabse kam daam                        | Daam badalne pe aur roz                   | catalog                | D-223                                                                 |
| "Bestseller" aur "kam stock" ke niyam                   | Roz, stock event pe                       | catalog                | D-154                                                                 |
| Search ke kram ke liye 30 din ki bikri aur rating       | Roz, review event pe                      | commerce, catalog      | D-139                                                                 |
| Aankde: din, hafte, mahine                              | Roz (catch-up ke saath)                   | har maalik service     | D-149                                                                 |
| Zero result ki hafte ki report                          | Hafte                                     | catalog                | D-152                                                                 |
| Emails: din ki line, chhat, agle din ki line, 80% alert | Ticker                                    | notify                 | D-126, D-142                                                          |
| Sellers aur staff ka din ka saar                        | Roz (misaal 09:00 IST ke baad pehli jaag) | notify                 | D-140                                                                 |
| Data ke samay: delete ya pehchaan hatana                | Roz                                       | har service, media     | SR-065, D-191 se D-194                                                |
| Kanooni rok ka erase                                    | Roz                                       | maalik services, media | D-250, D-262                                                          |
| Account delete ke 7 din baad (wapsi ki khidki)          | Timer                                     | identity, phir event   | SR-066, D-151                                                         |
| Audit chain ka roz ka verify aur security ka saar       | Roz                                       | audit                  | SR-076, SR-078                                                        |
| Signing keys badalna (misaal 30 din)                    | Timer                                     | identity               | SR-031, D-197                                                         |
| Invite ki expiry (72 ghante)                            | Timer                                     | identity               | SR-025                                                                |
| Chhode hue uploads aur provider se milaan               | Roz, hafte                                | media                  | SR-061, SR-062                                                        |
| Har Atlas cluster se samay-samay pe ek connection       | Har jaag pe (dispatcher se apne aap)      | sab                    | Free cluster ka ruk jaana ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2) |

## 5. API aur apps se baat (D-294)

1. REST aur JSON, path `/api/v1/<service>/<resource>`. Har route contract me ek hi jagah: method, path, input aur output ka zod schema, allowed apps, permission, rate limit ki class, idempotency, step-up (D-185), public cache, maalik service. Isi se validation, gateway ka route manifest aur typed client (SR-032, SR-035, SR-036).
2. Ek screen ke liye ek ya do calls; maalik service apne read model se screen ka jawab deti hai (jaise order page me parcel ki halat aur invoice numbers commerce ki copy se), taaki India se Singapore ki der (R-012) aur bandwidth kam rahe.
3. Pagination cursor se, page 100 tak (SR-007); jawab ka size misaal 100 KB tak.
4. v1 me sirf jodna; tootne wala badlav naye version ke path pe, aur purana misaal 30 din `Deprecation` aur `Sunset` header ke saath.
5. Har app `X-App-Version` bhejta hai; har app ka kam se kam version setting me. Purana ho to 426 aur saaf sandesh. Delivery app (D-042) ka offline data purane version ka ho sakta hai, isliye sync API pichhla version bhi maanti hai.
6. Delivery app ka sync ek batch route (misaal 50 kaam tak): har kaam ka client ka UUIDv7 id idempotency key, har kaam ka alag nateeja, device ka samay `deviceAt` aur server ka `serverAt` (SR-055); photos alag upload, sync me sirf `assetId`. Delivery code ka milaan sirf online (SR-054).
7. Live halat polling se (misaal har 60 second, sirf jab tab dikhe; delivery pe UPI ke 10 minute me order page misaal har 5 second) aur browser push (D-126, D-141). Khule connection (WebSocket, SSE) nahi (R-008). Polling aur ping background ke header ke saath; ye session ka bina kaam ka samay nahi badhate (SR-094).
8. Error ka ek roop: `{"error": {"code", "message", "details", "requestId"}}`. `code` sthir aur bade aksharon me (common codes ke alawa module ka prefix, jaise `COMMERCE_STOCK_UNAVAILABLE`); `message` user ke liye saada; stack kabhi nahi (SR-077).
9. Status codes: 400 validation (SR-036), 401, 403 permission, 404 scope ke bahar (SR-032), 409 halat ka takrav ya wahi idempotency key chal rahi (SR-045), 413 (SR-007), 422 business niyam ya key alag body ke saath (SR-045), 426 app purana, 429 `Retry-After` ke saath (SR-008), 503 `Retry-After` ke saath (fail-closed ya server ki seema, SR-031).
10. Idempotency key in routes pe zaroori: place order (SR-045), payment retry, refund aur daawe ka faisla, payout ki manzoori, receiving aur scans, delivery attempt aur saboot, offline sync, upload ka jodna, export. Key + route + caller; wahi body pe pehla jawab; 2xx aur 4xx yaad, 5xx nahi; record misaal 48 ghante maalik service ke DB me.
11. Client sirf GET aur idempotency key wale routes ko retry karta hai, network ya 503 pe, backoff aur `Retry-After` ke saath, misaal 2 baar; baaki mutations pe apne aap retry nahi.
12. Server se provider ki har call pe timeout (misaal payment 10 s, email 10 s, push 5 s); retry sirf job queue se, request ke andar nahi; provider ki idempotency (jaise refund) jahan mile wahan. Redis na mile to sign-in, codes, payment shuru, review, report aur daawa 503; padhna chalta rahe (SR-008).
13. Har app ka apna Vercel project aur host (D-010, D-048); `/api/*` gateway pe rewrite ek hi template se (SR-002); token ka `aud` app (SR-031, SR-035). Har app ek saajhe typed client se (contracts se bana), TanStack Query ke saath; custom header (SR-030) aur `X-App-Version` client khud lagata hai.
14. App khulte hi app-shell `/wake` ko seedha Render pe bulata hai aur jawab tak "server jaag raha hai" dikhata hai; jawab se pehle koi API call nahi (D-028). Razorpay ka webhook bhi seedha Render pe (SR-002 ki tay list, signature ke saath, SR-049); soya server pehli koshish pe der se jaage to Razorpay ki dobara koshish aur roz ka milaan M1 (§1.11). `/wake` SR-089 ke hisaab se: CSP me sirf exact URL, CORS sirf apne apps ke origins bina credentials, jawab 204 bina body aur cookie, koi database nahi. Jab tak jawab na aaye app ka koi hissa nahi khulta; jaagne ke baad app use hote tak background me `/wake` ki ping (D-349).
15. R1 me saare apps SPA; koi server-side rendering nahi (D-290). Customer app ka Payment screen alag HTML document, poore page ke load ke saath (SR-090, D-407).

## 6. Search aur caching (D-295)

1. Storefront ka search catalog ke cluster pe Atlas Search se, ek `search_documents` read model ke upar. Ek document har bikne layak variant group ka: naam, brand, category, shade family (D-085), free-from (D-099), skin type aur concern (D-137), claims (D-100), country of origin (D-127, D-240), size, daam, discount, rating aur reviews ki ginti, 30 din ki bikri, in-stock. Ye catalog aur commerce ke events se banta hai; filters D-138 ke.
2. Free cluster pe 3 indexes: storefront, Admin ka catalog search, aur ek khaali. Index ki definition code me, release step se laagu.
3. Kram (D-139): text ka score, phir rating (kam se kam misaal 5 reviews pe), 30 din ki bikri aur stock; out-of-stock sabse neeche (D-153). Kisi seller ke boost ka koi field hi nahi.
4. Synonyms staff ki setting wali collection se, bina deploy (D-152); spelling ki galti ke liye fuzzy matching, aur naam aur brand pe autocomplete. Free cluster pe in operators ka chalna jaanchna baaki ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2).
5. Zero result ke shabd ki din ki ginti, bina user id ke (D-152, D-157); search ke jawab CDN pe cache nahi.
6. Search ka text 100 characters tak, regex escape, IP pe rate limit (SR-007, SR-008, SR-069).
7. Laptop aur CI pe search ke tests MongoDB ke local Atlas container (`mongodb/mongodb-atlas-local`, exact version pe) pe, asli search ke saath; text index ka adapter nahi (D-422). Container ko kam se kam 2 GB khaali RAM aur 2 CPU cores (R-070); free cluster ki apni seemaayein us me nahi dikhti (R-066).
8. CDN (Vercel) pe public cache sirf contract me "public cacheable" routes pe (SR-004): category tree, brand page, product ka content (misaal `s-maxage=300, stale-while-revalidate=600`), aur product ki availability (daam, agle batch ka MRP aur expiry D-064 aur D-067, stock ki halat, kam stock ka label; misaal `s-maxage=30`). Inpe kabhi `Set-Cookie` nahi.
9. Kabhi public cache nahi: search, cart, checkout, Pro daam (SR-042), aur signed-in ka har jawab (`private, no-store`, SR-004). Checkout pe daam server pe dobara (SR-044): CDN ka purana daam sirf dikhne me, kabhi bill me nahi.
10. Polling routes (inbox ka saar, order ki halat) pe ETag aur `304`.
11. Process ke andar cache sirf kam badalne wali config ka (settings, HSN table, synonyms, route manifest), LRU, kul misaal 20 MB, maalik ke `settings.changed` event pe saaf. Redis me sirf session ke revoke marks (SR-029), rate limit ki ginti (SR-008) aur BullMQ; koi data cache nahi (SR-070, R-010). Service worker SR-010 ke hisaab se.

## 7. Media aur files (D-296)

1. Upload: client maalik service se upload maangta hai (maqsad, type, size); maalik service authorize karti hai aur media se chhota signed upload URL leti hai (misaal 10 minute, exact type aur size, SR-061); file seedha provider pe: public aur review images media service pe, private files object storage pe presigned PUT se (D-284, D-420); phir client maalik service ko `assetId` deta hai, aur media file ki asli halat dekh ke `ready` hone pe hi use record se jodta hai. Backend ke raaste file kabhi nahi (SR-007, R-007).
2. Har file ka record media me: maalik service aur record, maqsad, public ya private, type, size, hash (SR-055), halat (`uploaded`, `ready`, `attached`, `deleting`, `deleted`, `rejected`), retention ki tareekh. Business data me sirf `assetId` (SR-062).
3. Type bytes se (JPEG, PNG, WebP; PDF jahan zaroori; video sirf daawe me). Har image ka dobara encode aur EXIF hatana (SR-061): public aur review images ka provider pe (D-284); private images ka server pe, kyunki object storage file jaisi aayi waisi rakhta hai (D-420): `heavy` queue, concurrency 1, pixels ki seema (misaal 24 MP) aur memory ka pehra (§9); bani copy rakhi jaati hai aur kachchi file turant mitti hai.
4. Private file: maalik service authorize kare, phir media object storage ka chhota presigned URL de (misaal 5 minute, D-420); PDF attachment ke roop me; app ke origin se kabhi nahi (SR-062).
5. Har maqsad ka samay (D-191, D-192, D-193, D-227) maalik service ke "maamla band" se; roz ka job mitata hai (SR-065). Lagbhag 13 May 2027 se delivery aur daawon ki photos aur video app se hat ke encrypted band jagah me, capture se 1 saal (D-262).
6. Ek file ek maalik: wahi image doosri jagah chahiye to nayi copy, apne maalik ke saath. Jis product ka order hua uski images archive ke saath rehti hain (order, return, invoice aur daawe ke liye).
7. PDFs (invoice, credit note, statements, labels) ek halki PDF library se, ek waqt me 1; headless browser kabhi nahi (R-007). Jaari document ka PDF uske na badalne wale data aur template ke version se; template jagah pe nahi badalta, naya version banta hai (D-225). Ye PDF tax archive ki "asli copy" maani jaaye ya nahi: Lawyer (ya CA) se nahi jaancha (CL-021).
8. Export DB cursor se stream, CSV seedha private file me (buffer me poora nahi), ek baar ka chhota link (D-144, SR-075). File pehle download ke baad ya misaal 24 ghante me mite.
9. Roz: 24 ghante se purane bina jude uploads aur atke deletes saaf; hafte: provider ki list se milaan.
10. File badalna (jaise nayi photo): nayi file nayi `assetId` ke saath judti hai, to uska URL bhi naya hota hai aur CDN me purani cached copy nahi dikhti. Purani file turant `deleting` me jaati hai, aur niyam 9 ka roz ka job use provider se mitata hai. Apvaad: jis purani file ki kisi record ko zaroorat hai (niyam 5 aur 6, jaise jis product ka order hua uski images, ya kanooni rok wali review aur daawe ki photos), wo apne retention ke samay tak rehti hai. Nateeja: koi file bina kisi record ke hamesha nahi rehti; bina judi upload lagbhag 24 ghante tak, aur hafte ke milaan me pakdi file agle milaan tak.

## 8. Observability (D-297)

1. Logs structured JSON, stdout pe; request pe SR-077 ke fields; route ka template, raw URL aur query nahi. Request id gateway pe banta hai aur jawab, facade calls, events (`correlationId`), audit aur error me jaata hai.
2. Request logs logs service (D-285) me kam se kam 180 din, lagbhag 13 May 2027 se 1 saal (D-250 niyam 5, CL-106): lines misaal har 60 second ya 1,000 lines pe ek gzip chunk me (ek document = ek chunk). Security events audit service me 1 saal (D-194).
3. Kabhi log nahi: SR-077 ki list, private media ke signed URLs, idempotency keys, event ka poora `data`, search ka text. Error objects ka serializer aur redaction SR-098 se.
4. Audit ke misaal 30 din se purane din ek compressed, hash se band chunk me, usi chain ke saath; roz ki jaanch chunk pe bhi (SR-076, D-194, R-006).
5. Server ki errors fingerprint ke saath logs me; apps ki errors ek rate-limited route se, bina personal data aur size ki seema ke saath; nayi error ki khabar aur roz ka saar Master ke ops inbox me (D-286, R-024). Route ki seemaayein aur safai SR-099 se.
6. Ops snapshot har 60 second (jab server jaaga ho): RSS, heap, event loop ki der, chalte requests, har queue ki gehrai, sabse purane outbox event ki umar, dead letters, Redis ki memory aur connections, DB pool ka intezaar; roz ka saar logs store me (R-007).
7. `/health` sirf process aur event loop (DB nahi); `/ready` Mongo clusters, Redis, dispatcher aur ticker (finance nahi, D-057); Render ka health check `/health` (SR-007).
8. Alerts Master ke ops inbox aur push me; email sirf gambhir pe (SR-078). Misaal thresholds: RSS 400 MB se upar; event loop ki der 1 minute tak 500 ms se upar; 5 minute me 2% se zyada 5xx; sabse purana outbox event 60 second se upar; dead letter 0 se upar; Redis ki memory 60% se upar; kisi cluster ki jagah 70% aur 85%; Neon ke CU-ghante mahine ke 70%; emails din ke 80% (D-142); audit chain tooti, ya milaan me farak (SR-078).
9. Hafte me ek baar haath se dekhna (provider API ke bina): Render ki bandwidth aur ghante, Neon ke CU-ghante, Atlas ki jagah (DevOps / SRE ke saath).
10. Har record me server ka UTC samay, server ki ghadi provider ki time service se; client ka samay sirf `deviceAt` ke roop me (CL-106, SR-055).

## 9. Scale aur capacity (D-298)

**Do alag cheezein:** (1) design ka target, jis pe code, indexes aur tests bante hain (D-283); (2) ₹0 pe asli chalne ki seema, jo neeche saaf likhi hai (D-028, D-053).

**₹0 pe seema (misaal; naap ke pakka):**

| Seema                     | Number                                                                                                                  | Matlab                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Render CPU                | Free instance ka CPU kam hai (misaal 0.1; Render ne number nahi diya, jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2) | Lagbhag 5 requests/second lagataar; password se sign-in lagbhag 2/second (argon2id, SR-013) |
| Render RAM                | 512 MB (D-049)                                                                                                          | Neeche memory budget                                                                        |
| Render outbound bandwidth | 5 GB/mahina (Render ke docs, 2026-11-20); khatam ho aur payment method na ho to free services mahine ke ant tak band    | Lagbhag 170 MB din; isliye public browsing CDN se (§6)                                      |
| Render ghante             | 750/mahina (R-008)                                                                                                      | Raat ko server soya                                                                         |
| Atlas har cluster         | 0.5 GB (bina compression BSON + indexes), 100 ops/second, 500 connections (Atlas ke docs, 2026-11-20)                   | Neeche ek order ka hisaab                                                                   |
| Neon                      | 100 CU-ghante/mahina, 0.25 CU (D-057, R-014)                                                                            | Finance ke batch (D-288)                                                                    |
| Neon ki jagah             | 1 GB (jaancha 2026-11-21, [RISKS.md](RISKS.md) §2.5; D-319)                                                             | Finance ₹0 pe 100 orders/din pe lagbhag 2.8 saal me bharta hai; band FY ka export (D-309)   |
| Redis                     | Free Key Value 25 MB aur 50 connections; maxmemory policy `noeviction` (BullMQ ki shart, D-425)                         | §4 aur §6 ke niyam                                                                          |
| Emails                    | 300/din, OTP ke pakke aur "baaki" ki chhat (D-142)                                                                      | Lagbhag 100 orders/din se upar confirmation aur invoice ke emails agle din pe khisakte      |

**Ek order ka data (misaal):** commerce lagbhag 6 KB, logistics 3 KB, finance 8 KB, notify 3 KB, payments 2 KB, aur audit me staff ke scans (SR-076) lagbhag 12 KB. 0.5 GB ka 80% istemaal karein to commerce lagbhag 65,000 orders, finance lagbhag 50,000, aur audit bina compression sirf lagbhag 33,000 orders, yaani 2 saal (D-194) me lagbhag 45 orders/din. Compressed chunks (§8 niyam 4) ke saath 2 saal me lagbhag 250 orders/din tak.

**Memory budget (R-007, misaal; code banne pe Docker me 512 MB ki seema pe naap ke pakka):**

| Hissa                                             | Aam (MB) | Sabse zyada (MB) | Pehra                                                             |
| ------------------------------------------------- | -------- | ---------------- | ----------------------------------------------------------------- |
| Node, V8 aur gateway + 11 services ka code        | 120      | 130              | Compiled JS, ek process                                           |
| JS heap ka kaam (requests, process cache ≤ 20 MB) | 60       | 100              | `--max-old-space-size` misaal 256                                 |
| DB clients (10 Atlas clusters, Neon zaroorat pe)  | 15       | 20               | Har Atlas client ka pool misaal 3, Neon ka 2                      |
| Redis aur BullMQ clients (≤ 20 connections)       | 5        | 8                |                                                                   |
| Password hash (argon2id 19 MiB × 2)               | 0        | 40               | Ek waqt me 2, baaki line me (SR-007)                              |
| PDF (ek waqt me 1)                                | 0        | 30               | `heavy` queue, concurrency 1                                      |
| Export aur import (stream)                        | 0        | 15               | Cursor + stream, poora buffer nahi                                |
| **Kul**                                           | **~200** | **~345**         | Alarm 400 MB RSS; 450 MB pe heavy queue ruke aur upload jodna 503 |

Images ka dobara encode provider pe hai (D-284); server pe hota to sabse bure pal me lagbhag 80 MB aur lagta, aur jagah bahut kam bachti.

**Performance targets (D-053: sirf jaage server pe, misaal):** CDN hit p95 300 ms; bina CDN padhna p95 800 ms; place order p95 2 s; password se sign-in p95 3 s; webhook se order confirm p95 10 s; event delivery p95 5 s; cold start 90 s tak.

**Niyam:**

1. Design target D-283 ka: har list ka pagination, har query ka index, aur sale ke din ke peak (5 guna) ka load test laptop pe.
2. ₹0 pe chalne ki seema upar ki table jaisi saaf likhi rahe; numbers naap ke badlein.
3. Memory budget upar jaisa: `--max-old-space-size` misaal 256; argon2id ek waqt me 2; PDF aur heavy kaam ek waqt me 1; har Atlas client ka pool misaal 3, Neon ka 2.
4. RSS 400 MB pe alert; 450 MB pe heavy queue rukti hai aur upload jodna 503, jab tak memory neeche na aaye.
5. Har cluster ki jagah ka roz ka naap; 70% pe chetavni, 85% pe owner ko alert; har collection pe TTL ya archive ka niyam module design me (R-006).
6. R1 se pehle Docker me 512 MB aur kam CPU ki seema pe bundle mode ka naap (sign-ins, place order, PDF, 50,000 rows ka export aur import ek saath). Aam RSS 400 MB se upar rahe, ya live pe hafte me ek se zyada OOM restart ho, to D-049 dobara khule.
7. Render ki bandwidth aur ghante, aur Neon ke CU-ghante har hafte dekhe jaayein; 70% pe owner ka kaam (bandwidth ke liye CDN cache aur polling kam).
8. Har Atlas cluster se samay-samay pe kam se kam ek connection (dispatcher apne aap karta hai); system lambe samay band rahe to clusters ka resume operations ke kram me.

## 10. Data aur database (D-310 se D-317)

Database Architect ki raay se (D-257 ka kram), owner ki haan ke baad. Ye saare services ke data ke saajhe niyam hain. Har service ki collections, fields aur indexes ki poori list module ki `TASK.md` me (planning stage me) inhi niyamon se banti hai. "Misaal" wale numbers settings me.

### 10.1 Ids, numbers, paisa aur samay (D-310)

1. MongoDB ke har entity document ka `_id` ObjectId; settings, leases, roles, counters aur din ki ginti jaise naam wale chhote records ka `_id` unka naam.
2. Doosri service ka reference ObjectId ke roop me (`<cheez>Id`); events me 24 hex ka string; finance me `char(24)` ka domain, hex ki CHECK ke saath.
3. Finance ke apne primary keys `bigint` identity; ye bahar nahi jaate, bahar sirf document number.
4. Client ke banaye ids (offline kaam, idempotency key) UUIDv7; database me sirf unka SHA-256.
5. Rakam hamesha integer paise: MongoDB me BSON `long` (ek saajhe money codec se; validator `long` maange), PostgreSQL me `bigint`. Rates basis points (`int`, 0 se 10000). Float ya decimal kabhi nahi.
6. Taxable value, tax aur bantwara ek saajhe package se (§1.8 ke niyam), mutation tests ke saath. Order line pe us pal ka daam, MRP, HSN, rate, tax aur chhoot ka hissa jam jaata hai.
7. Har timestamp UTC, server ki ghadi se; jahan din se ginti ya query ho wahan alag `istDay` (`YYYY-MM-DD`) field. Finance me `doc_date` (IST), `period` aur `fy`, document ke IST din se, CHECK ke saath.
8. Batch ka `expiryDate` system me aakhri din (expiry ke roop se); dikhana mahina aur saal.
9. Bahar dikhne wale numbers (tax ke alawa) har service ke `counters` se; gap chal sakta hai. Tax ke document numbers sirf finance me, §1.7 se.
10. Seller ka code 3 characters (A-Z, 0-9), taaki 500 se zyada sellers aur document number ki 16 characters ki seema dono fit (`S001C/2627/00045` = 16).

| Number        | Roop (misaal)                                                | Kahan             | Gap chalega |
| ------------- | ------------------------------------------------------------ | ----------------- | ----------- |
| Order         | 10 ank, aakhri ank check digit, jaise `4827-1930-56` (D-308) | commerce          | Haan        |
| Parcel        | `<order>-P1`                                                 | commerce          | Haan        |
| Return, daawa | `R` / `C` + order jaisa roop                                 | commerce, support | Haan        |
| ASN, receipt  | `ASN-2611-00042`, `GRN-...`                                  | commerce          | Haan        |
| Trip          | `T-261120-03`                                                | logistics         | Haan        |
| Payout batch  | `2627-W08`                                                   | finance           | Haan        |
| Tax documents | §1.7                                                         | finance           | Nahi        |

### 10.2 Transactions, concurrency aur platform collections (D-311)

1. Har MongoDB service ka ek transaction helper: snapshot read, majority write; transient error pe poora kaam dobara; commit ka nateeja anjaana ho to sirf commit dobara; kul misaal 10 second, phir 503.
2. Badlav, outbox event, `audit.recorded` event aur (consumer me) `processed_events` ek transaction me; jawab commit ke baad (§3).
3. Transaction ke andar queries ek ke baad ek; bahar ki koi call nahi; misaal 100 documents aur 1 second ke andar; har query pe `maxTimeMS` misaal 2 second.
4. Transaction ek hi service ke cluster me; do jagah likhna ho to idempotent kadam aur halat ki shart.
5. Har badalne wale aggregate pe `version`; update `{_id, version}` pe, mel na ho to 409; event ka `aggregate.version` yahi.
6. Halat badalne wale update me purani halat filter me, taaki do scans ya do staff ek kaam do baar na karein.
7. "Ek hi" wali cheezein (ek customer ek product ek review, ek parcel ek khula QR, ek refund request ek refund) unique ya partial unique index se.
8. Din ki chhat, staff ki rakam ki seema aur customer ki seemaayein ek counter document pe conditional `$inc` se, kaam ke transaction me.
9. Event se bani copy (`copy_<cheez>`) me `srcVersion`; upsert sirf bade version pe; har copy ka resync producer ke "abhi ka event dobara" se.
10. Outbox ka dispatcher sirf `pendingCount > 0` aur `nextAttemptAt <= now` wale events uthata hai; ek aggregate ka pehla pending fail ho to us subscriber ke agle events rukte hain.
11. Subscriber band ho (jaise finance ka database ghante khatam hone pe) to koshish ki ginti nahi badhti; dead letter sirf handler ki apni galti pe.
12. TTL ka kram: `processed_events` ki umar outbox ke purge aur sabse lambe retry se zyada; test me jaancha jaata hai.
13. PostgreSQL me `READ COMMITTED`; series ke rows tay kram me lock; `40001` aur `40P01` pe misaal 3 baar dobara; statement aur idle transaction ke timeouts.

| Collection (har service)             | Kaam                                  | Samay                           |
| ------------------------------------ | ------------------------------------- | ------------------------------- |
| `outbox`                             | Events aur har subscriber ki delivery | Sab delivered ke 7 din baad TTL |
| `processed_events`                   | Consumer ka dedupe                    | 14 din TTL                      |
| `dead_letters`                       | Fail events                           | Hal ke 90 din baad              |
| `timers`                             | Samay wale kaam                       | `done` ke 7 din baad            |
| `leases`                             | Dispatcher, ticker, release           | Hamesha                         |
| `idempotency_keys`                   | Pehla jawab (key ka hash)             | 48 ghante TTL                   |
| `migrations`, `settings`, `counters` | Release, settings, numbers            | Hamesha                         |
| `sealed_records`                     | Kanooni rok                           | `eraseAt` pe TTL                |
| `daily_stats`                        | Aankde                                | 3 saal (D-307)                  |

### 10.3 Personal data, retention aur kanooni rok (D-312)

1. Har collection ki ek retention class (`tech`, `case`, `account`, `book`, `tax`, `ref`, `agg`) code ki registry me; koi collection bina class ya bina delete handler ke ho to CI fail.
2. Business ki cheez (product, variant, seller, hub) jise koi order ya document dekhta hai, kabhi delete nahi; `archived`.
3. Personal data ka erase = field hatana ya document delete, usi transaction me rok ki copy aur event; sirf flag kaafi nahi.
4. Rok ki copy har service ke apne `sealed_records` me: hate fields ka JSON, ek public key se band (sealed; SR-097, D-399), live server ke paas sirf public key, `eraseAt` setting se (abhi 180 din, lagbhag 13 May 2027 se 365 din; D-250, D-262). Sirf break-glass facade se, Master aur wajah ke saath, audit me; kisi staff screen ya list me kabhi nahi. Retention class `tech` ke records (OTP ke hash, idempotency ke jawab, sessions, outbox, inbox) rok me nahi aate; unka personal data request logs me pehle se rehta hai (D-321).
5. Field encryption AES-256-GCM, roop `v1.<keyId>.<iv>.<ciphertext>.<tag>`, associated data `<service>.<collection>.<field>:<recordId>` (SR-063). Keys service ke namespace me (`field`, `blind`, `hold`, finance me `taxArchive`), har key ka id, aur purane records ka roz ka chhota re-encrypt.
6. Dhoondhne ke liye HMAC-SHA256 blind index (alag key); dikhane ke liye aakhri 4.
7. Codes, recovery codes aur invite tokens sirf hash. Delivery code encrypted, kyunki customer ko dikhana zaroori hai; milaan server pe (SR-054).
8. Seller aur partner ka PAN aur bank khaata finance me encrypted; catalog me sirf KYC ke dastavez ke `assetId` aur GSTIN.
9. Invoice pe naam aur pata sirf finance ke `archive.tax_copies` me (alag key); isliye account delete pe finance ke documents nahi badalte (D-225, D-226).
10. Account delete ka event har service ka handler chalata hai (neeche ki table); identity har subscriber ka "ho gaya" outbox ki delivery se dekhti hai. Delete hue ids ki list (bina personal data) restore ke baad deletes dobara chalane ke liye.
11. Accounts ke jod ke liye address, device cookie aur payment ki pehchaan sirf HMAC ke roop me (`limits_link_keys`).
12. Account delete ke baad bhi seller apne invoice ki copy (₹50,000 ya zyada pe naam aur pata ke saath, D-226) ek-ek karke finance ke tax archive se download kar sakta hai, finance ke raaste, har download audit me (D-320).

| Service     | Account delete pe                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| identity    | Account tombstone; credentials, sessions, devices, codes delete; consents aur registration data rok me; id restore wali list me                                                                          |
| notify      | Inbox, push subscriptions, digest, email jobs delete                                                                                                                                                     |
| commerce    | Addresses, cart, wishlist, link keys delete; orders ke address se naam, phone aur lines hatein (shehar, pincode, state rahein); band orders ke archive ke chunks bhi naye hash ke saath (SR-066); rok me |
| catalog     | Reviews D-305 ke hisaab se (star aur text rahein, photos hatein); review ka haq delete                                                                                                                   |
| logistics   | Waitlist delete; photos aur location apne samay pe                                                                                                                                                       |
| support     | Case ke text se pehchaan hate; saboot apne samay pe                                                                                                                                                      |
| payments    | Payment ki pehchaan ka hash delete                                                                                                                                                                       |
| finance     | Kuch nahi badalta                                                                                                                                                                                        |
| audit, logs | Apne samay tak waise                                                                                                                                                                                     |

### 10.4 Migrations, release steps, seeds aur M0 ki aadatein (D-313)

1. Boot pe har MongoDB service ka release step lease ke peeche: collections aur validators, indexes, data migrations, aur (catalog me) Atlas Search ki definitions; ek fingerprint, wahi ho to kuch nahi. Schema wala hissa (collections, validators, indexes, Search ki definitions) listen se pehle; lambi data migration listen ke baad background me, lease ke saath ([OPERATIONS.md](OPERATIONS.md) §3 niyam 5; D-338).
2. Index ke naam ke neeche roop kabhi nahi badalta; naya roop naya naam; purana agle release me drop.
3. Expand aur contract do releases me: pehle optional field aur dono roop padhna, backfill, phir purana hatana. Ek release me jodna aur hatana kabhi nahi.
4. Data migration idempotent, `_id` ke kram me chhote batches, M0 ke 100 ops/second ke hisaab se ruk-ruk ke; kahan tak hua, ye `migrations` me.
5. Validators aur TTL badalne ka kaam alag release user se (`dbAdmin` ya `collMod` wala custom role; app ke user ke `readWrite` me `collMod` nahi, D-425), jo sirf release step me judta hai; app ka user sirf apne database pe data ke kaam. Audit aur logs ke clusters me ye kaam sirf laptop ke release command se, alag credentials se; boot pe in dono me sirf fingerprint ki jaanch aur alert (D-400, SR-100).
6. Finance ki migrations numbered SQL files, sirf aage, checksum ke saath, advisory lock aur migration role se; boot pe nahi, finance ke pehle kaam pe (taaki Neon na jaage). Migrations aur `pg_dump` Neon ke seedhe connection se, pooler se nahi (pooler pe session wala advisory lock nahi chalta); app ka pool pooler se, bina SQL `PREPARE`, `SET` aur session wale locks (D-425).
7. Har collection ka `$jsonSchema` validator sirf zaroori fields pe (ids, rakam `long` aur 0 se upar, `status` ki list, `version`); baaki khule.
8. Har list cursor se, page 100 tak, `skip` nahi; har sort index se; CI me har repository query ka `explain` aur collection scan ka pehra; bade reports cursor aur stream se.
9. Seeds: reference data (chart of accounts, series, HSN, roles, ingredients, settings) har jagah release step se; location master Master app ke import se; local seed tay ObjectIds ke saath; tests me factories aur har worker ka alag database; live demo me sirf reference aur catalog, `demo: true` ke nishaan ke saath, koi customer account ya asli personal data nahi.
10. Backup: MongoDB Extended JSON (har collection ek file); PostgreSQL `pg_dump` custom format, read-only backup role se, usi major version ke container se; dono encrypted (D-013). Finance ke band FY ki export files (D-309) bhi isi command me.

### 10.5 Commerce: orders, stock aur reservation (D-314)

1. Order ek document: lines aur unke batch wale hisse (batch, quantity, MRP, expiry) embedded; seller ke hisse (invoice) aur parcels (delivery) alag, aapas me bandhe nahi.
2. Stock batch ke level pe: `stock_batches` (pehchaan, expiry, MRP, halat), `stock_balances` (har batch aur warehouse: `onHand`, `reserved`, `available`), `stock_bins` (ek bin ek batch) aur `stock_movements` (sirf jodna).
3. Place order ek transaction me: serviceability (`copy_area`), daam (`copy_listing`), quantity aur customer ki seemaayein, FEFO se batches, har hisse pe `available >= q` ki shart ke saath reservation, order aur outbox. Koi hissa na mile to poora ulta, `409` (D-118, SR-045).
4. FEFO = bikne layak batches me sabse pehle expire hone wala; daam batch ke MRP se upar ho to wo batch ruka.
5. Customer ko jo MRP aur expiry dikhi, wahi batch (D-064, D-067); server dobara nikale, farak ho to order nahi aur naya total.
6. Prepaid reservation ka timer (misaal 15 minute); khatam hone pe reservation wapas aur order `paymentExpired`, ek transaction me.
7. Der se aaya payment: dobara FEFO, sirf usi MRP aur kam se kam utni expiry wale batch se; na mile to ek hi refund (`late:<paymentId>`).
8. Pick pe kami me barabar batch = wahi variant, wahi MRP, expiry kam se kam utni.
9. Pack teen kadam me: parcel `packing` aur `packSeq + 1`; finance ko invoice ki sync call `(parcel, seller, packSeq)` ki key se; phir parcel `packed`, invoice ke numbers, stock movements aur event ek transaction me. Har kadam dobara chalne layak. Pack adhoora rahe ya dobara ho (D-090) to `commerce.parcel.packVoided` (parcel, seller, `packSeq`); finance dispatch se pehle us invoice ko cancel karta hai, aur naya pack naye `packSeq` se (D-319).
10. Cancel sirf pack se pehle; refund ka jod kabhi captured se zyada nahi (order pe conditional `$inc`).
11. Roz ka job: expiry ki seema paar batch `stopped`. Raat ka job: `reserved` = khule reservations, `onHand` = bins + raaste me; farak pe alert.
12. Storage fee ki ghadi batch ke accept scan se; lauta band maal usi batch me, ghadi nahi badalti (D-066).
13. Batch ke customers ki chhoti list (`stock_batch_sales`) dispatch pe, batch ki expiry + 12 mahine tak, recall ke liye (D-129).
14. Band order (delivered, return ki khidki khatam, koi khula maamla nahi) D-306 ke hisaab se archive; chhota saar `order_index` me.

### 10.6 Finance ka PostgreSQL (D-315)

1. Schemas: `ledger`, `doc`, `payout`, `tax`, `recon`, `archive`, `sys`.
2. Journal aur lines: har line pe debit ya credit me se ek hi (CHECK); `journal_balanced` deferred constraint trigger commit pe jod barabar aur kam se kam 2 lines jaanchta hai.
3. `UNIQUE (source_type, source_id)`: ek ghatna ek journal; dobara aaye to pehla.
4. App role ko books ki tables pe sirf `INSERT` aur `SELECT`; saath me har role pe `UPDATE` aur `DELETE` rokne wala trigger; sudhaar ulti entry se.
5. Band mahine me journal nahi (trigger); `fy` aur `period` `doc_date` se (CHECK).
6. Bina gap number: series row `FOR UPDATE`, document `seq = next_no`, `next_no + 1`, ek transaction me; `UNIQUE (issuer_gstin, doc_type, fy, seq)`; `doc_no` 16 characters tak, sirf A-Z, 0-9, `/`, `-` (CHECK).
7. Cancel ek alag insert-only table me; credit note pe asli document aur line ka hawala (CHECK, aur deferred trigger se quantity ki seema).
8. Pack pe idempotency: partial `UNIQUE (parcel_ref, seller_party_id, doc_type, pack_seq)`.
9. Document me buyer ka state, shehar, pincode aur GSTIN; naam aur pata sirf `archive.tax_copies` me (alag key), har pahunch `archive.access_log` aur audit me; `retain_until` FY ke hisaab se, jhagde pe aage.
10. Payout: batch pe CHECK `approved_by <> created_by` (D-189); naye bank khaate pe rok ke dauraan payout nahi; ek cycle me seller ka ek payout; sirf `due` lines.
11. TDS ka adjust usi FY me (trigger); TCS seller GSTIN aur mahine ki ek row.
12. `sys` me outbox, deliveries, processed events, idempotency, timers aur dead letters; purge roz ke batch me (PostgreSQL me TTL nahi).
13. Finance ka dispatcher aur ticker sirf jab finance pehle se jaaga ho (batch, pack, Finance app), aur roz ke ek batch me; pool 2, idle timeout chhota (R-014).
14. Driver `pg` aur ek type-safe query builder; sirf parameterized queries; ORM nahi.
15. Band financial years D-309 ke hisaab se: encrypted export file aur Neon me closing balances, documents ki list aur hash. File public key se band, aur uska hash audit chain aur backup ke manifest me bhi (SR-097).

| Table                                                         | Kaam                                              |
| ------------------------------------------------------------- | ------------------------------------------------- |
| `ledger.accounts`, `parties`, `party_gstins`, `periods`       | Chart, sub-ledger ke log, GSTINs, mahine ka close |
| `ledger.journals`, `journal_lines`                            | Books                                             |
| `doc.series`, `documents`, `document_lines`, `cancellations`  | Tax documents aur numbering                       |
| `archive.tax_copies`, `access_log`                            | Tax archive                                       |
| `tax.party_tax_ids`, `tds_entries`, `tcs_monthly`             | PAN, TDS, TCS                                     |
| `payout.bank_accounts`, `payable_lines`, `batches`, `payouts` | Seller ka paisa                                   |
| `recon.runs`, `items`                                         | Milaan M1 se M12                                  |
| `sys.*`                                                       | Outbox aur baaki platform tables                  |

### 10.7 Baaki services ke data niyam (D-316)

1. identity: unique `(emailNorm, family)` (D-304); `emailNorm` ka roop SR-092 se (lowercase, domain ASCII, `+` aur dots waise hi); credentials alag collection me; refresh token `<sessionId>.<random>`, session me abhi aur pichhla hash; consents sirf jodna.
2. identity: code ek baar aur 5 koshish tak, ek conditional update se; delete ka 7 din ka timer, wapsi pe cancel.
3. notify: line ki din ki chhat ek counter document pe conditional `$inc`; OTP ka code notify ke DB ya outbox me kabhi nahi; email job ka id hi queue ka job id.
4. payments: webhook ka event id `_id` pe, asar ke transaction me; refund kabhi captured se zyada nahi (payment pe conditional `$inc`); ek refund request ek refund; ek parcel ek khula QR; halat sirf aage badhti hai.
5. catalog: ek brand ek seller (D-075); barcode unique; live listing version badla nahi ja sakta, manzoori version id pe; daam ka har badlav itihaas ke saath ek transaction me; pichhle 30 din ka sabse kam daam (D-223) pehle se gina.
6. catalog: ek customer ek product ek review (D-135); review sirf haq wali line se (₹0 line nahi); rating ka jod review ke transaction me, aur raat ki jaanch.
7. catalog: lambe dikhne wale text aur purane listing versions gzip; `search_documents` ki static mapping sirf filter aur kram ke fields; Pro daam search me nahi.
8. logistics: parcel me sirf pincode; naam, address aur phone maalik se, logistics me save nahi. Code ka milaan conditional update se (`outForDelivery`, usi partner, 5 se kam galat koshish).
9. logistics: location sirf delivered, fail aur pickup ke pal; photo aur location apne samay pe roz ke job se.
10. support: daawe ki khidki, staff ki rakam ki seema (counter) aur appeal ka alag faisla karne wala, teeno transaction me.

### 10.8 Audit, media, logs aur jagah (D-317)

1. audit: app ka DB user sirf `insert` aur `find`; har entry ka `contentHash`; din ki chain roz ke job me (`audit_days`), pichhle din se judi (SR-076); din ki chain ka aakhri hash logs aur roz ke saar me bhi (SR-100).
2. audit: purane din gzip chunk me (`audit_chunks`, hash ke saath); taaza entries ka hatna sirf TTL se, chunk ki umar se misaal 15 din baad; chunk 7 din peeche ho to alert.
3. audit: chunk ki umar setting (design target pe misaal 3 din, ₹0 pe 30 din); security events alag, 1 saal TTL (D-194).
4. media: har file ka record; `ready` hone pe hi judna; samay pe file delete aur record rok ke samay tak; lagbhag 13 May 2027 se photos aur video capture se 1 saal rok ki jagah me (D-262).
5. logs: ek chunk ek document, `startAt` pe TTL (180 din, lagbhag 13 May 2027 se 365 din; D-285); errors fingerprint ke hisaab se. Logs ka DB user sirf `insert` aur `find`; padhna SR-100 ke hisaab se (D-402).
6. Band records (orders, payments, parcels, stock movements) ka mahine ka gzip archive usi cluster me, hash ke saath; kram: chunk likho, hash jaancho, phir delete.
7. Har collection ka roz ka `collStats` ops snapshot me; 70% aur 85% pe alert (§9).

| Cluster                   | Design target (D-283) pe 80% (misaal) | ₹0 pe (100 orders/din) 80% | Bachav          |
| ------------------------- | ------------------------------------- | -------------------------- | --------------- |
| audit                     | Lagbhag 1 mahina (30 din ki khidki)   | 2 saal me nahi (~45%)      | Chunks, khidki  |
| commerce                  | Lagbhag 7 hafte                       | Lagbhag 1.7 saal           | Archive (D-306) |
| finance (Neon)            | Lagbhag 50 din                        | Lagbhag 2.8 saal (1 GB)    | Export (D-309)  |
| logs                      | Lagbhag 2.5 mahine                    | Nahi                       | TTL             |
| logistics                 | Lagbhag 4.5 mahine                    | Lagbhag 3.5 saal           | Archive         |
| payments                  | Lagbhag 7 mahine                      | Lagbhag 5 saal             | Archive         |
| catalog, media            | Lagbhag 1 saal                        | Nahi                       | Gzip, TTL       |
| identity, notify, support | Nahi ya saalon me                     | Nahi                       | TTL             |

Design target pe ₹0 ke clusters kuch hafton me bhar jaate hain: target sirf code aur tests ke liye hai (D-283), ₹0 ki asli seema §9 me.

## Change log

| Version | Date       | Badlav                                                                                                                                                                                                                                    |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                                                                                                         |
| v1.1.1  | 2026-11-20 | §1 finance ke accounting niyam (CA (AI) ki raay, D-282): ledger, documents, numbering, rounding, statements aur milaan.                                                                                                                   |
| v1.2.1  | 2026-11-20 | §2 se §9 (Principal Software Architect, D-291 se D-298): services aur data, events, jobs, API, search aur caching, media, observability, scale aur capacity.                                                                              |
| v1.2.2  | 2026-11-21 | §7 niyam 10: file badalne pe purani file ka niyam (owner, D-296 me jod).                                                                                                                                                                  |
| v1.3.1  | 2026-11-21 | §10 data aur database (Database Architect, D-310 se D-317): ids aur paisa, transactions, personal data aur rok, migrations aur seeds, commerce, finance ka PostgreSQL, baaki services, audit aur jagah; §1.7 me seller code 3 characters. |
| v1.3.2  | 2026-11-21 | D-319 se D-321 ke sudhaar: §2.3 me logistics → commerce, §2.2 me finance ke naye events aur `packVoided`, §9 me Neon ki jagah, §10.3 aur §10.5 me jod.                                                                                    |
| v1.3.3  | 2026-11-21 | §10.4 niyam 1 me jod: schema wala hissa listen se pehle, lambi data migration background me (D-338).                                                                                                                                      |
| v1.3.4  | 2026-11-21 | §9 aur §10.8 me Neon ki jagah 1 GB pakki (RISKS §2.5): finance lagbhag 2.8 saal me bharta hai.                                                                                                                                            |
| v1.3.5  | 2026-11-21 | §5 niyam 14: jaagne tak app band, phir background ping (D-349).                                                                                                                                                                           |
| v1.3.6  | 2026-11-21 | §5 niyam 14 me `/wake` SR-089 se; niyam 15 me Payment ka alag document (security review batch 1, D-408).                                                                                                                                  |
| v1.3.7  | 2026-11-22 | §5 niyam 7 me background header (SR-094); §10.7 niyam 1 me `emailNorm` ka roop (SR-092) (security review batch 2, D-409).                                                                                                                 |
| v1.3.8  | 2026-11-22 | §7 niyam 8: export ki file pehle download ke baad ya 24 ghante me mite (security review batch 3, D-410).                                                                                                                                  |
| v1.3.9  | 2026-11-22 | §10.3 niyam 4 aur commerce row, §10.6 niyam 15: band data public key se, archive ka delete (security review batch 5, D-412).                                                                                                              |
| v1.3.10 | 2026-11-22 | §8 niyam 3 aur 5, §10.4 niyam 5, §10.8 niyam 1 aur 5: logger, errors ka route, audit aur logs (security review batch 6, D-413).                                                                                                           |
| v1.3.11 | 2026-11-22 | §6 niyam 7 local Atlas container (D-422); §7 niyam 1, 3, 4 private files object storage pe (D-420); §9 Redis row aur §10.4 niyam 5, 6 (D-425).                                                                                            |
