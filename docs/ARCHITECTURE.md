# ARCHITECTURE: Beautinique

> **Status:** v1.1.1 (2026-11-20). System kaise bana hai, ek nazar me. Cheezein ek-ek karke, owner ki haan ke baad judengi. Abhi sirf §1 (finance ke accounting niyam, D-282).

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

## Change log

| Version | Date       | Badlav                                                                                                                  |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| v1.0.0  | 2026-11-17 | Khaali file bani.                                                                                                       |
| v1.1.1  | 2026-11-20 | §1 finance ke accounting niyam (CA (AI) ki raay, D-282): ledger, documents, numbering, rounding, statements aur milaan. |
