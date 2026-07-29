# Guida implementazione — Booking ops AVES SDK 1.6.0

Guida pratica per le operazioni di booking (aves-sdk@1.6.0), derivate dallo spike API AVES XML 1.8.0.

**Escluso:** creazione/ricerca del Programma come entità master (gap Datagest — non coperto dai PDF).  
**Incluso:** uso del Programma su pratica, update/delete costi, riassegnazione package, annullamento pratica.

---

## Setup client

```ts
import { AvesClient } from 'aves-sdk';

const client = new AvesClient({
  baseURL: 'https://<aves-host>',
  hostID: '000000', // 6 digit
  xtoken: 'TOKEN000000',
  languageCode: '01', // opzionale
  timeoutMs: 30_000,
});
```

Tutti i metodi restituiscono `Result<T, AvesError>`:

```ts
const result = await client.modBookingServices(/* ... */);
if (!result.success) {
  console.error(result.error.kind, result.error.message, result.error.code);
  return;
}
const data = result.data; // tipizzato
```

---

## Mappa task → metodo SDK

| Task spike                    | Metodo                                                  | Endpoint                                               |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Update voci di costo          | `modBookingServices`                                    | `/interop/booking/v2/rest/ModBookingFileServices`      |
| Delete voci / overwrite       | `modBookingServices` (+ opz. `setBookingServiceStatus`) | stesso / `SetBookingFileServiceStatus`                 |
| Assegna / riassegna Programma | `modBookingServices` (`selectedPackageDetail`)          | stesso                                                 |
| Annulla pratica (soft)        | `setBookingStatus`                                      | `/interop/booking/v2/rest/SetBookingFileStatus`        |
| Annulla pratica (delete)      | `cancelBooking`                                         | `/interop/booking/v2/rest/CancelBookingFile`           |
| Nullify singola riga          | `setBookingServiceStatus`                               | `/interop/booking/v2/rest/SetBookingFileServiceStatus` |
| Incassi sul booking           | `insertFilePaymentList`                                 | `/interop/booking/v2/rest/InsertFilePaymentList`       |
| Header (pax/note/billing)     | `modBookingHeader`                                      | `/interop/booking/v2/rest/ModBookingFileHeader`        |

> **Programma** = Package AVES (`pCode` / `PackageCode`). Non esiste API SDK per create/search package.

---

## 1. Aggiornamento voci di costo

Aggiorna una riga già presente: passa `bookedServiceRef` (RPH) e incrementa `avesSession`. Imposta costi/prezzi con `serviceFare`.

```ts
const result = await client.modBookingServices({
  customerRecordCode: '138311',
  bookingFileCode: '14/036654',
  selectedServiceList: [
      {
        sCode: 'HT00110840',
        ssCode: 'DL',
        avesServiceType: 'TOP',
        toServiceType: 'RESIDENCE',
        subServiceDesc: 'DOPPIA DE LUXE',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '1',
        pax: '2',
        paxAssociated: [{ pax: '001' }, { pax: '002' }],
        avesSession: '2', // incrementare ad ogni modifica della stessa riga
        bookedServiceRef: '001', // RPH servizio già in pratica
        serviceFare: {
          currencyCode: 'EUR',
          cost: '180.00',
          costTax: '0.00',
          costType: 'FORFAIT',
          price: '220.00',
          priceTax: '0.00',
          priceType: 'FORFAIT',
        },
        avesServiceInfo: {
          packageCode: '2014MDE0000010',
          packageReference: '05',
          priceListCode: 'G',
          costListCode: 'G',
        },
      },
    ],
});

if (result.success) {
  console.log(result.data.bookingFileDetail?.bookingFileCode);
  console.log(result.data.bookingFileDetail?.totalAmountDetail);
}
```

### Note

- `selectedServiceList` / `passengerList` / altre `*List` sono **array flat di Detail**; lo SDK wrappa verso AVES (Create ≠ Mod sul wire).
- `ModBookingFileHeader` **non** aggiorna costi.

---

## 2. Cancellazione voci + overwrite integrale

Pattern: `DELETE`/`NULLIFY` delle righe esistenti → re-insert del nuovo set nello stesso (o successivo) `modBookingServices`.

```ts
const result = await client.modBookingServices({
  customerRecordCode: '138311',
  bookingFileCode: '14/036654',
  cancellableBookedServiceList: [
      {
        cancelOperationType: 'DELETE', // o "NULLIFY"
        serviceRefType: 'RPH',
        serviceRefValue: '001',
      },
      {
        cancelOperationType: 'DELETE',
        serviceRefType: 'RPH',
        serviceRefValue: '002',
      },
    ],
  // nuovo set (obbligatorio: almeno 1 servizio nello schema SDK)
  selectedServiceList: [
      {
        sCode: 'VLGENFLEX',
        avesServiceType: 'OTHER',
        toServiceType: 'OTHER',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '2',
        pax: '2',
        paxAssociated: [],
        avesSession: '1',
        serviceFare: {
          currencyCode: 'EUR',
          cost: '50.00',
          price: '80.00',
        },
      },
      {
        sCode: 'HT00110840',
        ssCode: 'DIN',
        avesServiceType: 'TOP',
        toServiceType: 'RESIDENCE',
        subServiceDesc: 'CENA ADULTO',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '2',
        pax: '2',
        paxAssociated: [{ pax: '001' }, { pax: '002' }],
        avesSession: '1',
        serviceFare: {
          currencyCode: 'EUR',
          cost: '40.00',
          price: '60.00',
        },
      },
    ],
});
```

### Alternativa: nullify di una sola riga

```ts
const result = await client.setBookingServiceStatus({
  customerRecordCode: '000001',
  bookingFileCode: '18/000252',
  bookingServiceRef: '002',
  bookingFileServiceStatus: 'NULLIFIED',
  bookingFileServiceStatusDate: '2018-11-29T12:50:00+01:00',
});
```

| `cancelOperationType` | Uso tipico                                  |
| --------------------- | ------------------------------------------- |
| `DELETE`              | rimozione (wipe + re-insert)                |
| `NULLIFY`             | annullamento contabile/operativo della riga |

---

## 3. Assegnazione / riassegnazione Programma

Su pratica già esistente: `selectedPackageDetail` in `modBookingServices`.  
Collegare i servizi al package con `avesServiceInfo.packageCode` + `packageReference`.

```ts
const result = await client.modBookingServices({
  customerRecordCode: '138311',
  bookingFileCode: '14/036654',
  selectedPackageDetail: {
    pCode: '2014MDE0000010',
    startDate: '2015-01-22T00:00:00',
    endDate: '2015-01-25T00:00:00',
    getServicesFromPackage: false, // true = auto-carica solo ADV/GRP
  },
  selectedServiceList: [
      {
        sCode: 'HT00110840',
        ssCode: 'DL',
        avesServiceType: 'TOP',
        toServiceType: 'RESIDENCE',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '1',
        pax: '2',
        paxAssociated: [{ pax: '001' }, { pax: '002' }],
        avesSession: '1',
        bookedServiceRef: '001', // se aggiorni riga esistente
        avesServiceInfo: {
          packageCode: '2014MDE0000010',
          packageReference: '01',
        },
        serviceFare: {
          currencyCode: 'EUR',
          cost: '100.00',
          price: '120.00',
        },
      },
    ],
});

if (result.success) {
  // PackageCode sulla pratica (se AVES lo aggiorna)
  console.log(result.data.bookingFileDetail?.packageCode);
}
```

### In creazione pratica (riferimento)

```ts
await client.createBooking({
  customerDetail: { recordCode: '138311' },
  bookingFileStatus: { value: 'QUOTATION' },
  startDate: '2015-01-22T00:00:00',
  endDate: '2015-01-25T00:00:00',
  selectedPackageList: [
      {
        pCode: '2014MDE0000010',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
      },
    ],
  selectedServiceList: [
    {
        sCode: 'HT00110840',
        ssCode: 'DL',
        avesServiceType: 'TOP',
        toServiceType: 'RESIDENCE',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '1',
        pax: '2',
        paxAssociated: [],
        avesSession: '1',
        avesServiceInfo: {
          packageCode: '2014MDE0000010',
          packageReference: '01',
        },
      }
  ],
  passengerList: [
    {
        rph: '001',
        roomRph: '001',
        name: 'ADULTI 001',
        categoryCode: 'AD', // obbligatorio in create
        sex: 'M',
      }
  ],
});
```

> Input SDK unificato: `selectedServiceList: Detail[]`. Sul wire Create usa array di wrapper, Mod usa oggetto con array.

---

## 4. Annullabilità pratica

### Soft — cambio stato

```ts
// CANCELED
const canceled = await client.setBookingStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: { value: 'CANCELED' },
  backOfficeRequest: true,
  bookingFileDocument: {
    printDoc: false,
    sendDocViaEmail: false,
  },
});

// NULLIFIED con penali
const nullified = await client.setBookingStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: { value: 'NULLIFIED' },
  backOfficeRequest: true,
  penalty: {
    apply: true, // false = penali automatiche di sistema
    specificCode: 'ZPENAL', // Top service code penali (se apply=true)
  },
  simulateCancelAndGetPenaltyAmount: false,
});

// Solo simulazione penali
const simulation = await client.setBookingStatus({
  customerRecordCode: '000170',
  bookingFileCode: '14/000081',
  fileStatus: { value: 'NULLIFIED' },
  simulateCancelAndGetPenaltyAmount: true,
});
if (simulation.success) {
  console.log(simulation.data.totalAmountDetailAfterCancellation);
}
```

Stati `fileStatus.value` ammessi:  
`QUOTATION` | `WORK_IN_PROGRESS` | `CONFIRMED` | `OPTIONED` | `NULLIFIED` | `CANCELED`

### Hard — delete pratica

```ts
const result = await client.cancelBooking({
  bookingFileCode: '14/000081',
  customerRecordCode: '000170',
});

if (result.success) {
  console.log(result.data.rsStatus.status); // "OK"
}
```

| Metodo                                        | Effetto                      |
| --------------------------------------------- | ---------------------------- |
| `setBookingStatus` → `CANCELED` / `NULLIFIED` | pratica resta, cambia stato  |
| `cancelBooking`                               | delete della pratica in AVES |

---

## 5. Modifica header (senza costi)

```ts
const result = await client.modBookingHeader({
  bookingFileCode: '14/000043',
  bookingFileStartDate: '2014-04-28',
  customerRecordCode: '103737',
  bookingNote: 'Nota libera max 999 caratteri',
  passengerList: [
      {
        rph: '001',
        name: 'ADULTI 001',
        sex: 'M',
        birthDate: '1964-09-26T00:00:00',
        // categoryCode opzionale in Mod
      },
      {
        rph: '002',
        name: 'ADULTI 002',
        sex: 'F',
        birthDate: '1964-09-26T00:00:00',
      },
    ],
  bookingFinancialInfo: {
    customer_PaymentType: 'BANK',
  },
});
```

---

## Payload combinato tipico (Lead retroattivo + overwrite)

Flusso consigliato dopo lo spike:

1. Opzionale: `DELETE` voci obsolete
2. `selectedPackageDetail` con il Programma Lead
3. Nuovo `selectedServiceList` con costi e `packageCode` sui servizi

```ts
const result = await client.modBookingServices({
  customerRecordCode: '138311',
  bookingFileCode: '14/036654',
  selectedPackageDetail: {
    pCode: '2014MDE0000010',
    startDate: '2015-01-22T00:00:00',
    endDate: '2015-01-25T00:00:00',
  },
  cancellableBookedServiceList: [
      {
        cancelOperationType: 'DELETE',
        serviceRefType: 'RPH',
        serviceRefValue: '001',
      },
      {
        cancelOperationType: 'DELETE',
        serviceRefType: 'RPH',
        serviceRefValue: '002',
      },
    ],
  selectedServiceList: [
      {
        sCode: 'HT00110840',
        ssCode: 'DL',
        avesServiceType: 'TOP',
        toServiceType: 'RESIDENCE',
        startDate: '2015-01-22T00:00:00',
        endDate: '2015-01-25T00:00:00',
        qty: '1',
        pax: '2',
        paxAssociated: [{ pax: '001' }, { pax: '002' }],
        avesSession: '1',
        avesServiceInfo: {
          packageCode: '2014MDE0000010',
          packageReference: '01',
          costListCode: 'G',
          priceListCode: 'G',
        },
        serviceFare: {
          currencyCode: 'EUR',
          cost: '180.00',
          price: '220.00',
          costType: 'FORFAIT',
          priceType: 'FORFAIT',
        },
      },
    ],
});
```

---

## 6. InsertFilePaymentList — incassi sul booking

Registra uno o più pagamenti sul booking file appena creato (flusso Lead confermato).

```ts
const payments = await client.insertFilePaymentList({
  bookingFileCode: '18/000172', // da createBooking → bookingFileDetail.bookingFileCode
  paymentUser: 'MLDN',
  enableMultiplePayments: true,
  operationType: 'AbsoluteAmountsInsertion',
  filePaymentList: [
      {
        paymentDate: '2018-09-08',
        paymentNote: 'INCASSO LEAD',
        amount: '100.00',
        paymentType: 'B', // C cash | B bank | R credit card | …
      },
      {
        paymentDate: '2018-10-08',
        paymentNote: 'INCASSO LEAD',
        amount: '800.25',
        paymentType: 'C',
      },
    ],
});
```

`operationType`:

- `AbsoluteAmountsInsertion` — inserisce gli importi da incassare (anche multipli)
- `FinalAmountToAchieve` / `FinalAmountToAchieveWithoutControls` — totale già incassato; AVES calcola la differenza

Obbligatorio: `bookingFileCode` **oppure** `bookingFileRefCode`.

### Flusso atomico applicativo (Lead → AVES)

```ts
const created = await client.createBooking(/* ... */);
if (!created.success) throw created.error;

const bookingFileCode = created.data.bookingFileDetail?.bookingFileCode;
// 1) salva subito bookingFileCode sul Lead (#76002)
await saveAvesCodeOnLead(leadId, bookingFileCode);

const paid = await client.insertFilePaymentList({
  bookingFileCode,
  enableMultiplePayments: true,
  operationType: 'AbsoluteAmountsInsertion',
  filePaymentList: leadPayments.map((p) => ({
    paymentDate: p.date,
    paymentNote: p.note,
    amount: p.amount,
    paymentType: p.type,
  })),
});

if (!paid.success) {
  // 2) errore parziale (#76003): pratica AVES già creata, payment fallito
  await markPartialSyncError(leadId, paid.error);
}
```

---

## Tipi esportati (1.6.0)

```ts
import type {
  ModFileServicesRQ,
  ModFileHeaderRQ,
  CancelFileRQ,
  SetFileStatusRQ,
  SetFileServiceStatusRQ,
  FilePaymentListRQ,
  BookingFileDetailRS, // alias di BookingFileRS
  BookingStatusOnlyRS,
  BookingFileRQ,
  BookingFileRS,
} from 'aves-sdk';
```

---

## Caveat operativi (da verificare live)

1. `DELETE` vs `NULLIFY` — vincoli di stato pratica / documenti / pagamenti.
2. `selectedPackageDetail` su pratica già con package — replace vs add.
3. Differenza operativa `cancelBooking` vs status `CANCELED`/`NULLIFIED`.
4. Create/search Programma — **non disponibile** in questo SDK; serve doc Catalog/Package Datagest.
