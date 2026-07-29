# Spike tecnico — Verifica API AVES

**Data:** 29 luglio 2026  
**Fonti (AVES XML 1.8.0):**

- `Aves Xml 1.8.0 Eng - Booking CPX.pdf` (Booking Lite) — fonte principale
- `Aves Xml 1.8.0 Eng - MasterRecord.pdf` — anagrafiche
- `Aves Xml 1.8.0 Eng - Doc (1).pdf` (Booking Document) — documenti
- `Aves Xml 1.8.0 Eng - CRM (2).pdf` (CRM) — anagrafiche CRM / ToDo

---

## Contesto

Obiettivo: verificare le API necessarie per:

1. creazione e ricerca del **Programma**
2. aggiornamento delle **voci di costo** su una pratica esistente
3. cancellazione di voci di costo (overwrite integrale della pratica)
4. assegnazione / riassegnazione del Programma a una pratica già caricata (collegamento retroattivo Lead)
5. annullabilità di una pratica

Il **Programma** è la proprietà che raggruppa più pratiche sotto lo stesso cappello.

---

## Cos’è il Programma in AVES

Nei documenti inglesi il Programma corrisponde a **Package / Program**:

| Nome in doc | Uso |
|---|---|
| `pCode` / `PackageCode` | codice package su booking e servizi |
| `SelectedPackageList` / `SelectedPackageDetail` | collegamento package → pratica |
| `ProgramCode` | filtro stampa (Rooming List, Doc PDF) |
| `DocumentType = PACKAGE` | archivio/ricerca documenti legati al package |

Sulla pratica compare in `BookingFileDetail.PackageCode`; sui servizi in `AvesServiceInfo.PackageCode` + `PackageReference`.

---

## Esito per requisito

### 1. Creazione e ricerca del Programma

**Non coperto** dai quattro PDF disponibili.

- Booking CPX **usa** il package (`SelectedPackageList`) ma non documenta create/search.
- MasterRecord, Doc e CRM non espongono CRUD Package.
- Nel Booking CPX compaiono riferimenti a `GetPackageDetail`, `CommitPackage`, `Search`/`GetDetail` sulle common structure Package, **senza endpoint**.

**Azione:** richiedere a Datagest la documentazione Catalog/Package.

---

### 2. Aggiornamento voci di costo su pratica esistente

**Coperto** — `ModBookingFileServices`

```
POST /interop/booking/v2/rest/ModBookingFileServices
```

- Obbligatori: `CustomerRecordCode`, `BookingFileCode`, `SelectedServiceList`
- Per aggiornare una riga esistente: `BookedServiceRef` (RPH, es. `001`) + incrementare `AvesSession`
- Costi/prezzi: `ServiceFare` (`Cost`, `CostTax`, `Price`, `PriceTax`, `CurrencyCode`, …) e/o `CostListCode` / `PriceListCode` in `AvesServiceInfo`

`ModBookingFileHeader` gestisce solo header (cliente, pax, note, billing) — **non** i costi.

---

### 3. Cancellazione voci di costo (overwrite)

**Coperto** — stesso endpoint `ModBookingFileServices`, via:

```
CancellableBookedServiceList / CancellableBookedServiceDetail
  @CancelOperationType = NULLIFY | DELETE
  @ServiceRefType      = RPH | FILE
  @ServiceRefValue     = RPH del servizio
```

| Operazione | Significato tipico |
|---|---|
| `DELETE` | rimozione della voce (utile a wipe + re-insert) |
| `NULLIFY` | annullamento della riga |

Alternativa per singola riga: `SetBookingFileServiceStatus` → solo `NULLIFIED`  
`POST /interop/booking/v2/rest/SetBookingFileServiceStatus`

**Pattern overwrite proposto:** cancellare/nullificare tutte le voci → reinserire il nuovo set con `SelectedServiceList` (+ eventuale `SelectedPackageDetail`).

Da verificare in test: vincoli di stato pratica / documenti / pagamenti su `DELETE`.

---

### 4. Assegnazione / riassegnazione Programma

**Parzialmente coperto**

| API | Cambia Package? |
|---|---|
| `CreateBookingFile` + `SelectedPackageList` | Sì (in creazione) |
| `ModBookingFileServices` + `SelectedPackageDetail` | Sì — *“NEW program that need to be added to booked file”* |
| `ModBookingFileHeader` | No |

Endpoint: `POST /interop/booking/v2/rest/ModBookingFileServices`

Campi `SelectedPackageDetail`: `pCode`, `StartDate`, `EndDate`, `GetServicesFromPackage` (solo ADV/GRP).

**Da verificare in test:** se l’operazione **sostituisce** o **aggiunge** il package; impatto su `PackageCode` della pratica e sui servizi già presenti (necessario per Lead retroattivi).

**Nota Lead / CRM:** il PDF CRM non collega Lead ↔ Programma. Espone solo:

- `InsertToDo` — richiesta libera (es. preventivo) associata a un master CRM  
  `POST /interop/cmr/v2/rest/InsertToDo`
- insert/update/search master CRM (`/interop/cmr/v2/rest/InsertMasterRecord`, `SearchMasterRecords`)
- in search: `BookingInfo` in sola lettura (ultima prenotazione / totali per anno), senza package né modifica pratica

Il collegamento retroattivo Lead ↔ Programma resta da fare lato booking (`SelectedPackageDetail`), non via API CRM.

---

### 5. Annullabilità di una pratica

**Coperto** — due modalità distinte:

| API | Endpoint | Effetto |
|---|---|---|
| `CancelBookingFile` | `/interop/booking/v2/rest/CancelBookingFile` | delete della pratica |
| `SetBookingFileStatus` | `/interop/booking/v2/rest/SetBookingFileStatus` | stato `CANCELED` o `NULLIFIED` |

Per `NULLIFIED`: supporto penali (`Penalty`, `SimulateCancelAndGetPenaltyAmount`).

**Da verificare in test:** differenza operativa tra delete e cambio stato, e stati ammessi.

---

## Matrice copertura documenti

| Requisito | MasterRecord | Booking CPX | Doc | CRM |
|---|---|---|---|---|
| Create/search Programma | ❌ | ❌ (solo uso) | ❌ | ❌ |
| Update costi | ❌ | ✅ | ❌ | ❌ |
| Delete voci (overwrite) | ❌ | ✅ | ❌ | ❌ |
| Riassegna Programma | ❌ | ✅ (da testare) | ❌ (solo filtro `ProgramCode`) | ❌ (ToDo/Lead senza package) |
| Annulla pratica | ❌ | ✅ | ❌ | ❌ |

---

## Endpoint rilevanti (Booking)

| Interfaccia | Endpoint |
|---|---|
| CreateBookingFile | `/interop/booking/v2/rest/CreateBookingFile` |
| ModBookingFileHeader | `/interop/booking/v2/rest/ModBookingFileHeader` |
| ModBookingFileServices | `/interop/booking/v2/rest/ModBookingFileServices` |
| SetBookingFileStatus | `/interop/booking/v2/rest/SetBookingFileStatus` |
| SetBookingFileServiceStatus | `/interop/booking/v2/rest/SetBookingFileServiceStatus` |
| CancelBookingFile | `/interop/booking/v2/rest/CancelBookingFile` |

Protocollo: REST XML, method `POST`, auth via `RqHeader` (`HostID`, `Xtoken`, …).

---

## PDF CRM — cosa contiene (fuori scope operativo)

| Interfaccia | Endpoint | Scopo |
|---|---|---|
| InsertToDo | `/interop/cmr/v2/rest/InsertToDo` | richiesta libera (quotation) su CRM |
| InsertMasterRecord | `/interop/cmr/v2/rest/InsertMasterRecord` | crea anagrafica CRM |
| UpdateMasterRecord | (stesso schema ManageCrm) | aggiorna anagrafica CRM |
| SearchMasterRecords | `/interop/cmr/v2/rest/SearchMasterRecords` | cerca anagrafiche CRM (+ `BookingInfo` read-only) |

Nessun riferimento a Package/Programma, voci di costo, overwrite pratica o cancel booking.

---

## Gap aperti

1. Documentazione API **CRUD/search Package (Programma)** — assente nei quattro PDF attuali.
2. Semantica esatta **DELETE vs NULLIFY** e vincoli di stato.
3. Comportamento **riassegnazione package** (replace vs add) per Lead retroattivi.
4. Differenza **CancelBookingFile** vs status `CANCELED` / `NULLIFIED`.

---

## Prossimo passo consigliato

Spike live sull’ambiente AVES, in ordine:

1. create pratica con `SelectedPackageList`
2. update costi (`ModBookingFileServices` + `ServiceFare` / `BookedServiceRef`)
3. delete/nullify voci + re-insert (overwrite)
4. riassegna package su pratica esistente
5. cancel / set status `CANCELED`–`NULLIFIED`
