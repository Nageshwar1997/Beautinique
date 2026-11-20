# ARCHITECTURE: Beautinique

> **Status:** v1.2.1 (2026-11-20). System kaise bana hai, ek nazar me. Cheezein ek-ek karke, owner ki haan ke baad judengi. Abhi §1 (finance ke accounting niyam, D-282) aur §2 se §9 (system ke hisse, D-291 se D-298).

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

1. **Series:** har jaari karne wale GSTIN, har document type aur har financial year ki apni series. Misaal: seller invoice `S01/2627/000123`, seller credit note `S01C/2627/00045`, seller delivery challan `S01D/2627/0007`; platform fees `PF/2627/000123`, platform delivery fee `PD/2627/000123`, platform credit notes `PFC/...`, `PDC/...`. Seller ka chhota code (S01) platform deta hai.
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

| Service   | Data ka maalik (saar)                                                                                                                                                                                                                                                                                                                                                 | Bhejta hai (mukhya events)                                                                                                                                                                                                                                               | Leta hai (mukhya events)                                                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gateway   | Kuch nahi (koi DB nahi)                                                                                                                                                                                                                                                                                                                                               | Kuch nahi                                                                                                                                                                                                                                                                | Kuch nahi; session ki jaanch identity se (SR-029)                                                                                                                                                   |
| identity  | Accounts, insaan ka jod (D-017, SR-076), credentials, authenticator, recovery codes, sessions, devices (D-183), roles, grants, invites, allowlist (D-133), consents aur 18+ ka record (D-150, D-255), signing keys                                                                                                                                                    | `identity.account.created`, `.changed`, `.erased`; `identity.grant.changed`; `identity.consent.recorded`                                                                                                                                                                 | `catalog.seller.statusChanged` (seller ka grant), `logistics.partner.activated` (partner ka grant)                                                                                                  |
| notify    | Templates, in-app inbox, push subscriptions, emails ki line aur din ki ginti (D-142), digest (D-140), bheje emails ka record (bina code ke)                                                                                                                                                                                                                           | `notify.emailCap.reached` (andar ka alert)                                                                                                                                                                                                                               | Har woh event jispe khabar jaati hai (order, invoice, refund, delivery, recall, area khulna); `identity.account.erased`                                                                             |
| payments  | Gateway orders, payments, webhook inbox (event id), refunds, delivery pe UPI QR, chargebacks, settlement reports                                                                                                                                                                                                                                                      | `payments.payment.captured`, `.failed`; `payments.refund.succeeded`, `.failed`; `payments.settlement.reported`; `payments.chargeback.opened`                                                                                                                             | `commerce.refund.requested`                                                                                                                                                                         |
| catalog   | Sellers (KYC ke refs, GSTIN, EPR, seller ka block D-238), brands, products, variants, listing versions (D-098, SR-041), daam aur itihaas (D-061, D-223), HSN table (D-086), ingredients aur blocklist (D-132), claims aur saboot (D-224), reviews aur moderation (D-135, D-136), search ka read model, synonyms (D-152)                                               | `catalog.seller.statusChanged`, `catalog.listing.published`, `catalog.price.changed`, `catalog.taxRate.changed`, `catalog.review.published`, `.hidden`                                                                                                                   | `commerce.stock.changed`, `commerce.nextBatch.changed`, `commerce.orderLine.delivered`, `commerce.sales.rolledUp`, `finance.seller.duesStage`                                                       |
| commerce  | Cart, wishlist, addresses, orders, seller ke hisse, lines aur snapshots, reservations, stock (batch, bin, balance, movements), inbound shipment aur receiving (D-096), pick aur pack, cancel, return requests, refund ka hisaab (SR-047), customer ki seemaayein (D-091, D-109, D-204)                                                                                | `commerce.order.placed`, `.confirmed`; `commerce.orderLine.cancelled`, `.delivered`; `commerce.parcel.packed`; `commerce.stock.changed`; `commerce.nextBatch.changed`; `commerce.return.requested`, `.inspected`; `commerce.refund.requested`; `commerce.sales.rolledUp` | `payments.payment.*`, `logistics.parcel.*`, `logistics.pickup.completed`, `logistics.area.changed` (copy), `catalog.listing.published` aur `catalog.price.changed` (copy), `support.return.decided` |
| logistics | Location master (Sub-District aur pincode, D-015, D-016), areas, switches aur live, pincode se hub, area settings (delivery fee D-107, cut-off D-117, UPI ki seema D-109), hubs, warehouses ki jagah, trips (D-027), partners, assignment, delivery attempts, delivery codes (encrypted), saboot ke refs, return pickups, RTO, waitlist (D-046), carrier port (D-014) | `logistics.area.changed`; `logistics.parcel.planned`, `.dispatched`, `.atHub`, `.outForDelivery`, `.delivered`, `.attemptFailed`, `.rtoReceived`; `logistics.pickup.completed`; `logistics.partner.activated`                                                            | `commerce.order.confirmed`, `commerce.parcel.packed`, `support.return.decided`, `payments.payment.captured` (delivery pe UPI, SR-050)                                                               |
| finance   | §1 ka sab: journal, sub-ledgers, documents aur numbering, payables, payouts, statements, TCS aur TDS, milaan, tax archive (D-225), seller ke bank details (SR-052), partner ki kamaai (R2)                                                                                                                                                                            | `finance.invoice.issued`, `finance.creditNote.issued`, `finance.payout.paid`, `finance.seller.duesStage` (D-103), `finance.reconciliation.mismatch`                                                                                                                      | `payments.payment.captured`, `payments.settlement.reported`, `payments.refund.*`, `payments.chargeback.*`, `commerce.return.inspected`, `commerce.orderLine.cancelled`                              |
| support   | Daawe (D-072, D-106), return aur daawe ke faisle (D-105), appeals (D-147), staff ki rakam ki seema (D-188), fraud ke signals (SR-058), grievance register (D-163); R2: tickets, SLA, skin reaction                                                                                                                                                                    | `support.claim.decided`, `support.return.decided`, `support.appeal.decided`                                                                                                                                                                                              | Order, parcel aur return ke events (maamle ka context)                                                                                                                                              |
| audit     | Audit entries hash chain ke saath (SR-076), security events (D-194)                                                                                                                                                                                                                                                                                                   | Kuch nahi                                                                                                                                                                                                                                                                | Har service ka `*.audit.recorded`                                                                                                                                                                   |
| media     | Har file ka record (maalik service, maalik record, maqsad, public ya private, size, halat, samay; SR-062); provider ki chaabi sirf yahan (D-284)                                                                                                                                                                                                                      | `media.asset.ready`, `media.asset.rejected`                                                                                                                                                                                                                              | Retention ke liye maalik services ke "maamla band" events, ya unki facade call                                                                                                                      |
| logs      | Request logs ke gzip chunks (D-285, D-250 niyam 5, CL-106)                                                                                                                                                                                                                                                                                                            | Kuch nahi                                                                                                                                                                                                                                                                | Kuch nahi; gateway seedha likhta hai                                                                                                                                                                |

### 2.3 Seedhi (sync) calls

D-011 ka "services ke beech data sirf events se" ka matlab: kisi service ke data ki copy doosri service me sirf events se banti hai, aur doosri service ka database koi nahi padhta (D-050, SR-068). Jahan user usi pal jawab ka intezaar karta hai, wahan typed facade call, sirf is list me (SR-071):

| Kaun bulata                                    | Kise                | Kya                                                             | Kyun sync                                                   |
| ---------------------------------------------- | ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| gateway                                        | identity            | Session aur revoke ki jaanch (Redis khaali ho to DB, SR-029)    | Har request                                                 |
| identity                                       | notify              | OTP aur codes ka email turant (D-142 ki OTP line)               | Code DB ya outbox me saade roop me nahi rakh sakte (SR-015) |
| commerce                                       | payments            | Gateway order banana (SR-048)                                   | Checkout pe customer ruka hai                               |
| commerce                                       | finance             | Pack pe invoices jaari karna, idempotent (parcel + seller)      | Invoice parcel ke andar (D-077, CL-003)                     |
| logistics                                      | payments            | Delivery pe UPI ka QR, exact rakam (SR-050)                     | Partner darwaze pe                                          |
| notify                                         | identity, logistics | Bhejte waqt recipient ka email, aur delivery code (resolver)    | Personal data aur code ki copy notify me nahi               |
| catalog, commerce, logistics, support, finance | media               | Upload ka signed URL, file ki halat, private file ka chhota URL | User upload ya download kar raha hai                        |

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
7. Live halat polling se (misaal har 60 second, sirf jab tab dikhe; delivery pe UPI ke 10 minute me order page misaal har 5 second) aur browser push (D-126, D-141). Khule connection (WebSocket, SSE) nahi (R-008).
8. Error ka ek roop: `{"error": {"code", "message", "details", "requestId"}}`. `code` sthir aur bade aksharon me (common codes ke alawa module ka prefix, jaise `COMMERCE_STOCK_UNAVAILABLE`); `message` user ke liye saada; stack kabhi nahi (SR-077).
9. Status codes: 400 validation (SR-036), 401, 403 permission, 404 scope ke bahar (SR-032), 409 halat ka takrav ya wahi idempotency key chal rahi (SR-045), 413 (SR-007), 422 business niyam ya key alag body ke saath (SR-045), 426 app purana, 429 `Retry-After` ke saath (SR-008), 503 `Retry-After` ke saath (fail-closed ya server ki seema, SR-031).
10. Idempotency key in routes pe zaroori: place order (SR-045), payment retry, refund aur daawe ka faisla, payout ki manzoori, receiving aur scans, delivery attempt aur saboot, offline sync, upload ka jodna, export. Key + route + caller; wahi body pe pehla jawab; 2xx aur 4xx yaad, 5xx nahi; record misaal 48 ghante maalik service ke DB me.
11. Client sirf GET aur idempotency key wale routes ko retry karta hai, network ya 503 pe, backoff aur `Retry-After` ke saath, misaal 2 baar; baaki mutations pe apne aap retry nahi.
12. Server se provider ki har call pe timeout (misaal payment 10 s, email 10 s, push 5 s); retry sirf job queue se, request ke andar nahi; provider ki idempotency (jaise refund) jahan mile wahan. Redis na mile to sign-in, codes, payment shuru, review, report aur daawa 503; padhna chalta rahe (SR-008).
13. Har app ka apna Vercel project aur host (D-010, D-048); `/api/*` gateway pe rewrite ek hi template se (SR-002); token ka `aud` app (SR-031, SR-035). Har app ek saajhe typed client se (contracts se bana), TanStack Query ke saath; custom header (SR-030) aur `X-App-Version` client khud lagata hai.
14. App khulte hi app-shell `/wake` ko seedha Render pe bulata hai aur jawab tak "server jaag raha hai" dikhata hai; jawab se pehle koi API call nahi (D-028). Razorpay ka webhook bhi seedha Render pe (SR-002 ki tay list, signature ke saath, SR-049); soya server pehli koshish pe der se jaage to Razorpay ki dobara koshish aur roz ka milaan M1 (§1.11). `/wake` ke liye CSP ka apvaad Security Architect ke doosre run me (SR-005).
15. R1 me saare apps SPA; koi server-side rendering nahi (D-290).

## 6. Search aur caching (D-295)

1. Storefront ka search catalog ke cluster pe Atlas Search se, ek `search_documents` read model ke upar. Ek document har bikne layak variant group ka: naam, brand, category, shade family (D-085), free-from (D-099), skin type aur concern (D-137), claims (D-100), country of origin (D-127, D-240), size, daam, discount, rating aur reviews ki ginti, 30 din ki bikri, in-stock. Ye catalog aur commerce ke events se banta hai; filters D-138 ke.
2. Free cluster pe 3 indexes: storefront, Admin ka catalog search, aur ek khaali. Index ki definition code me, release step se laagu.
3. Kram (D-139): text ka score, phir rating (kam se kam misaal 5 reviews pe), 30 din ki bikri aur stock; out-of-stock sabse neeche (D-153). Kisi seller ke boost ka koi field hi nahi.
4. Synonyms staff ki setting wali collection se, bina deploy (D-152); spelling ki galti ke liye fuzzy matching, aur naam aur brand pe autocomplete. Free cluster pe in operators ka chalna jaanchna baaki ([OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2).
5. Zero result ke shabd ki din ki ginti, bina user id ke (D-152, D-157); search ke jawab CDN pe cache nahi.
6. Search ka text 100 characters tak, regex escape, IP pe rate limit (SR-007, SR-008, SR-069).
7. Laptop aur CI pe Atlas Search nahi milta, to ek adapter jo MongoDB text index se chale; ranking ke tests dono pe.
8. CDN (Vercel) pe public cache sirf contract me "public cacheable" routes pe (SR-004): category tree, brand page, product ka content (misaal `s-maxage=300, stale-while-revalidate=600`), aur product ki availability (daam, agle batch ka MRP aur expiry D-064 aur D-067, stock ki halat, kam stock ka label; misaal `s-maxage=30`). Inpe kabhi `Set-Cookie` nahi.
9. Kabhi public cache nahi: search, cart, checkout, Pro daam (SR-042), aur signed-in ka har jawab (`private, no-store`, SR-004). Checkout pe daam server pe dobara (SR-044): CDN ka purana daam sirf dikhne me, kabhi bill me nahi.
10. Polling routes (inbox ka saar, order ki halat) pe ETag aur `304`.
11. Process ke andar cache sirf kam badalne wali config ka (settings, HSN table, synonyms, route manifest), LRU, kul misaal 20 MB, maalik ke `settings.changed` event pe saaf. Redis me sirf session ke revoke marks (SR-029), rate limit ki ginti (SR-008) aur BullMQ; koi data cache nahi (SR-070, R-010). Service worker SR-010 ke hisaab se.

## 7. Media aur files (D-296)

1. Upload: client maalik service se upload maangta hai (maqsad, type, size); maalik service authorize karti hai aur media se chhota signed upload URL leti hai (misaal 10 minute, exact type aur size, SR-061); file seedha provider pe (D-284); phir client maalik service ko `assetId` deta hai, aur media file ki asli halat dekh ke `ready` hone pe hi use record se jodta hai. Backend ke raaste file kabhi nahi (SR-007, R-007).
2. Har file ka record media me: maalik service aur record, maqsad, public ya private, type, size, hash (SR-055), halat (`uploaded`, `ready`, `attached`, `deleting`, `deleted`, `rejected`), retention ki tareekh. Business data me sirf `assetId` (SR-062).
3. Type bytes se (JPEG, PNG, WebP; PDF jahan zaroori; video sirf daawe me). Har image ka dobara encode aur EXIF hatana (SR-061) provider pe (D-284). Server pe karna pade to `heavy` queue, concurrency 1, pixels ki seema (misaal 24 MP) aur memory ka pehra (§9).
4. Private file: maalik service authorize kare, phir media chhota URL de (misaal 5 minute); PDF attachment ke roop me; app ke origin se kabhi nahi (SR-062).
5. Har maqsad ka samay (D-191, D-192, D-193, D-227) maalik service ke "maamla band" se; roz ka job mitata hai (SR-065). Lagbhag 13 May 2027 se delivery aur daawon ki photos aur video app se hat ke encrypted band jagah me, capture se 1 saal (D-262).
6. Ek file ek maalik: wahi image doosri jagah chahiye to nayi copy, apne maalik ke saath. Jis product ka order hua uski images archive ke saath rehti hain (order, return, invoice aur daawe ke liye).
7. PDFs (invoice, credit note, statements, labels) ek halki PDF library se, ek waqt me 1; headless browser kabhi nahi (R-007). Jaari document ka PDF uske na badalne wale data aur template ke version se; template jagah pe nahi badalta, naya version banta hai (D-225). Ye PDF tax archive ki "asli copy" maani jaaye ya nahi: Lawyer (ya CA) se nahi jaancha (CL-021).
8. Export DB cursor se stream, CSV seedha private file me (buffer me poora nahi), ek baar ka chhota link (D-144, SR-075).
9. Roz: 24 ghante se purane bina jude uploads aur atke deletes saaf; hafte: provider ki list se milaan.

## 8. Observability (D-297)

1. Logs structured JSON, stdout pe; request pe SR-077 ke fields; route ka template, raw URL aur query nahi. Request id gateway pe banta hai aur jawab, facade calls, events (`correlationId`), audit aur error me jaata hai.
2. Request logs logs service (D-285) me kam se kam 180 din, lagbhag 13 May 2027 se 1 saal (D-250 niyam 5, CL-106): lines misaal har 60 second ya 1,000 lines pe ek gzip chunk me (ek document = ek chunk). Security events audit service me 1 saal (D-194).
3. Kabhi log nahi: SR-077 ki list, private media ke signed URLs, idempotency keys, event ka poora `data`, search ka text.
4. Audit ke misaal 30 din se purane din ek compressed, hash se band chunk me, usi chain ke saath; roz ki jaanch chunk pe bhi (SR-076, D-194, R-006).
5. Server ki errors fingerprint ke saath logs me; apps ki errors ek rate-limited route se, bina personal data aur size ki seema ke saath; nayi error ki khabar aur roz ka saar Master ke ops inbox me (D-286, R-024).
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
| Redis                     | Free plan ki chhoti memory aur connections ki seema (jaanch [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) §2)                  | §4 aur §6 ke niyam                                                                          |
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

## Change log

| Version | Date       | Badlav                                                                                                                                                       |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                                                            |
| v1.1.1  | 2026-11-20 | §1 finance ke accounting niyam (CA (AI) ki raay, D-282): ledger, documents, numbering, rounding, statements aur milaan.                                      |
| v1.2.1  | 2026-11-20 | §2 se §9 (Principal Software Architect, D-291 se D-298): services aur data, events, jobs, API, search aur caching, media, observability, scale aur capacity. |
