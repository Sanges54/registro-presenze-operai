# PLAN.md - Registro Presenze Operai

## 1. Obiettivo del progetto

Realizzare una Progressive Web App professionale, moderna, mobile-first e installabile su Android e iPhone per la gestione quotidiana delle presenze degli operai.

L'applicazione sara usata principalmente dal titolare dell'azienda e dovra permettere di:

- gestire l'anagrafica degli operai;
- disattivare operai mantenendo lo storico;
- registrare presenze giornaliere;
- registrare ferie, malattie, permessi e trasferte;
- registrare ore ordinarie e straordinarie;
- aggiungere note giornaliere;
- consultare riepiloghi mensili;
- generare PDF professionali di fine mese;
- gestire impostazioni aziendali e backup.

Il progetto deve nascere semplice, solido e pronto per crescere in futuro verso piu utenti, piu aziende, notifiche e backup cloud.

## 2. Stack tecnologico vincolato

Tecnologie da utilizzare:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Supabase
- PostgreSQL
- Supabase Auth
- Zod
- GitHub Pages
- GitHub Actions
- configurazione PWA

Tecnologie escluse:

- Next.js
- Vercel
- Firebase
- SQLite
- Docker

## 3. Principi architetturali

### 3.1 Architettura generale

L'app sara una Single Page Application React, compilata con Vite e distribuita come sito statico su GitHub Pages.

Il backend sara gestito da Supabase:

- PostgreSQL come database principale;
- Supabase Auth per autenticazione;
- Row Level Security obbligatoria;
- Supabase Storage opzionale in futuro per backup, esportazioni o allegati;
- funzioni database e trigger PostgreSQL per logiche semplici lato dati.

La SPA comunichera direttamente con Supabase tramite client ufficiale, usando policy RLS per proteggere i dati.

### 3.2 Modello tenancy iniziale

La prima versione avra un solo amministratore e una sola azienda.

Nonostante questo, lo schema dovra essere predisposto per evolvere verso:

- piu utenti;
- piu aziende;
- utenti collegati ad aziende diverse;
- ruoli diversi;
- permessi granulari.

Per questo motivo le tabelle principali dovranno includere un riferimento a `company_id`, anche se inizialmente esistera una sola azienda.

### 3.3 Separazione dei livelli

La codebase dovra distinguere chiaramente:

- routing e layout;
- pagine;
- componenti riutilizzabili;
- moduli feature;
- accesso ai dati;
- validazione;
- tipi TypeScript;
- logica di dominio;
- generazione PDF;
- configurazione PWA.

L'obiettivo e impedire che pagine e componenti contengano query, validazioni e logica di business mescolate in modo fragile.

## 4. Struttura cartelle proposta

```text
registro-presenze-operai/
  .github/
    workflows/
      deploy.yml

  public/
    icons/
      icon-192.png
      icon-512.png
      apple-touch-icon.png
    manifest.webmanifest

  supabase/
    migrations/
    seed/
    policies/
    README.md

  src/
    app/
      App.tsx
      router.tsx
      providers.tsx

    assets/
      images/
      logos/

    components/
      ui/
        Button.tsx
        Input.tsx
        Select.tsx
        Textarea.tsx
        Modal.tsx
        Sheet.tsx
        Toast.tsx
        EmptyState.tsx
        LoadingState.tsx
        ConfirmDialog.tsx
      layout/
        AppShell.tsx
        BottomNav.tsx
        Header.tsx
        Page.tsx

    config/
      env.ts
      routes.ts
      constants.ts

    features/
      auth/
        LoginPage.tsx
        auth.service.ts
        auth.schemas.ts
        auth.types.ts
        ProtectedRoute.tsx

      dashboard/
        DashboardPage.tsx
        dashboard.service.ts
        dashboard.types.ts

      workers/
        WorkersPage.tsx
        WorkerDetailPage.tsx
        WorkerForm.tsx
        workers.service.ts
        workers.schemas.ts
        workers.types.ts

      attendance/
        AttendancePage.tsx
        AttendanceDayPage.tsx
        AttendanceForm.tsx
        attendance.service.ts
        attendance.schemas.ts
        attendance.types.ts

      monthly-summary/
        MonthlySummaryPage.tsx
        monthly-summary.service.ts
        monthly-summary.types.ts

      pdf/
        PdfGenerationPage.tsx
        pdf.service.ts
        pdf.templates.ts
        pdf.types.ts

      settings/
        SettingsPage.tsx
        settings.service.ts
        settings.schemas.ts
        settings.types.ts

      backup/
        BackupPage.tsx
        backup.service.ts
        backup.types.ts

    lib/
      supabase/
        client.ts
        database.types.ts
      date/
        date-utils.ts
      errors/
        app-error.ts
        error-map.ts
      pdf/
        pdf-utils.ts
      validation/
        zod-utils.ts

    styles/
      globals.css

    types/
      common.ts

    main.tsx

  .env.example
  .gitignore
  index.html
  package.json
  postcss.config.js
  tailwind.config.ts
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  PLAN.md
```

### 4.1 Note sulla struttura

- `features/` contiene i moduli funzionali principali.
- `components/ui/` contiene componenti generici e riutilizzabili.
- `components/layout/` contiene shell, navigazione e struttura app.
- `lib/supabase/` contiene il client Supabase e i tipi generati.
- `supabase/migrations/` contiene lo schema versionato.
- `supabase/policies/` puo contenere documentazione o script separati per RLS.
- `supabase/seed/` contiene dati iniziali controllati, non dati reali sensibili.

## 5. Pagine previste

### 5.1 Login

Percorso suggerito: `/login`

Funzioni:

- accesso tramite Supabase Auth;
- nessuna registrazione pubblica;
- recupero sessione;
- redirect automatico alla Dashboard se gia autenticato.

### 5.2 Dashboard

Percorso suggerito: `/`

Funzioni:

- riepilogo del giorno;
- numero operai attivi;
- presenze registrate oggi;
- assenze, ferie, malattie, permessi e trasferte del giorno;
- accesso rapido alla registrazione presenze;
- avvisi su giornate non completate.

### 5.3 Operai

Percorso suggerito: `/operai`

Funzioni:

- lista operai attivi;
- ricerca;
- filtro attivi/disattivati;
- creazione operaio;
- modifica operaio;
- disattivazione senza cancellazione;
- vista dettaglio con storico sintetico.

### 5.4 Presenze

Percorso suggerito: `/presenze`

Funzioni:

- selezione data;
- lista operai attivi;
- inserimento rapido stato giornaliero;
- ore ordinarie;
- ore straordinarie;
- ferie;
- malattia;
- permesso;
- trasferta;
- note;
- validazioni prima del salvataggio.

### 5.5 Riepilogo mensile

Percorso suggerito: `/riepilogo`

Funzioni:

- selezione mese e anno;
- tabella per operaio;
- totale giorni presenti;
- totale ferie;
- totale malattie;
- totale permessi;
- totale trasferte;
- totale ore ordinarie;
- totale ore straordinarie;
- evidenza dati mancanti o incoerenti.

### 5.6 Generazione PDF

Percorso suggerito: `/pdf`

Funzioni:

- selezione mese e anno;
- anteprima dati;
- generazione PDF professionale;
- intestazione aziendale;
- dati riepilogativi per operaio;
- eventuali note;
- download locale.

### 5.7 Impostazioni

Percorso suggerito: `/impostazioni`

Funzioni:

- dati azienda;
- ragione sociale;
- partita IVA o codice fiscale;
- indirizzo;
- email;
- telefono;
- eventuale logo in futuro;
- preferenze PDF;
- parametri orari standard.

### 5.8 Backup

Percorso suggerito: `/backup`

Funzioni iniziali:

- esportazione dati in formato JSON o CSV;
- esportazione riepilogo mensile;
- istruzioni operative per conservazione backup.

Funzioni future:

- backup cloud;
- ripristino controllato;
- storico esportazioni.

## 6. Schema database

Tutte le tabelle principali devono usare:

- `id` UUID come chiave primaria;
- `created_at` timestamp con timezone;
- `updated_at` timestamp con timezone;
- trigger automatico per aggiornare `updated_at`.

### 6.1 Tabella `company_settings`

Contiene le impostazioni dell'azienda.

| Campo | Tipo | Note |
| --- | --- | --- |
| id | uuid | primary key |
| name | text | ragione sociale |
| vat_number | text | opzionale |
| tax_code | text | opzionale |
| address | text | opzionale |
| city | text | opzionale |
| province | text | opzionale |
| postal_code | text | opzionale |
| country | text | default Italia |
| email | text | opzionale |
| phone | text | opzionale |
| default_daily_hours | numeric | es. 8 |
| pdf_footer_notes | text | opzionale |
| created_at | timestamptz | obbligatorio |
| updated_at | timestamptz | obbligatorio |

Nota evolutiva: inizialmente contiene un solo record. In futuro potra diventare la tabella `companies` o essere affiancata da una tabella dedicata.

### 6.2 Tabella `user_profiles`

Contiene il profilo applicativo collegato a Supabase Auth.

| Campo | Tipo | Note |
| --- | --- | --- |
| id | uuid | primary key, uguale ad auth.users.id |
| company_id | uuid | riferimento a company_settings.id |
| full_name | text | nome amministratore |
| role | text | inizialmente admin |
| is_active | boolean | default true |
| created_at | timestamptz | obbligatorio |
| updated_at | timestamptz | obbligatorio |

Vincoli suggeriti:

- `role` limitato inizialmente a `admin`;
- nessuna creazione pubblica lato client;
- profilo creato manualmente o tramite procedura amministrativa controllata.

### 6.3 Tabella `workers`

Contiene l'anagrafica degli operai.

| Campo | Tipo | Note |
| --- | --- | --- |
| id | uuid | primary key |
| company_id | uuid | riferimento a company_settings.id |
| first_name | text | obbligatorio |
| last_name | text | obbligatorio |
| fiscal_code | text | opzionale |
| employee_code | text | opzionale |
| phone | text | opzionale |
| email | text | opzionale |
| hire_date | date | opzionale |
| termination_date | date | opzionale |
| is_active | boolean | default true |
| notes | text | opzionale |
| created_at | timestamptz | obbligatorio |
| updated_at | timestamptz | obbligatorio |

Regole:

- un operaio non va eliminato se ha storico;
- la disattivazione imposta `is_active = false`;
- gli operai disattivati restano disponibili nei riepiloghi storici.

### 6.4 Tabella `attendance`

Contiene la registrazione giornaliera per operaio.

| Campo | Tipo | Note |
| --- | --- | --- |
| id | uuid | primary key |
| company_id | uuid | riferimento a company_settings.id |
| worker_id | uuid | riferimento a workers.id |
| attendance_date | date | giorno registrazione |
| status | text | stato principale |
| ordinary_hours | numeric | default 0 |
| overtime_hours | numeric | default 0 |
| leave_hours | numeric | default 0 |
| sick_hours | numeric | default 0 |
| permit_hours | numeric | default 0 |
| travel_hours | numeric | default 0 |
| travel_location | text | opzionale |
| notes | text | opzionale |
| created_by | uuid | riferimento a user_profiles.id |
| updated_by | uuid | riferimento a user_profiles.id |
| created_at | timestamptz | obbligatorio |
| updated_at | timestamptz | obbligatorio |

Valori suggeriti per `status`:

- `present`
- `absent`
- `holiday`
- `sick`
- `permit`
- `travel`
- `mixed`

Vincoli suggeriti:

- unicita su `company_id`, `worker_id`, `attendance_date`;
- ore non negative;
- massimo ore giornaliere configurabile con validazione applicativa;
- `worker_id` non cancellabile se esistono presenze.

### 6.5 Tabelle future opzionali

Non necessarie nella prima versione, ma utili da prevedere:

| Tabella | Scopo |
| --- | --- |
| companies | multi-azienda reale |
| audit_logs | storico modifiche sensibili |
| backups | storico backup generati |
| notifications | notifiche e promemoria |
| pdf_exports | storico PDF generati |
| holidays | festivita aziendali o nazionali |
| work_sites | cantieri o luoghi di lavoro |

## 7. Row Level Security

RLS deve essere attiva su tutte le tabelle applicative.

### 7.1 Regola iniziale

Solo l'utente amministratore autenticato puo leggere e modificare i dati della propria azienda.

La registrazione pubblica non deve essere disponibile nell'interfaccia.

### 7.2 Strategia consigliata

- `user_profiles.id` deve corrispondere a `auth.uid()`.
- Ogni tabella dati deve avere `company_id`.
- Le policy devono consentire accesso solo se l'utente autenticato ha un profilo attivo e la stessa `company_id`.
- Le operazioni di inserimento devono impedire di creare record per aziende diverse.
- Le operazioni di aggiornamento devono impedire cambi di `company_id`.

### 7.3 Policy concettuali

Per `company_settings`:

- select consentita solo agli admin collegati alla company;
- update consentito solo agli admin collegati alla company;
- insert preferibilmente solo tramite setup controllato.

Per `workers`:

- select per admin della company;
- insert per admin della company;
- update per admin della company;
- delete da evitare o bloccare.

Per `attendance`:

- select per admin della company;
- insert per admin della company;
- update per admin della company;
- delete da evitare o consentire solo con conferma applicativa forte.

Per `user_profiles`:

- select del proprio profilo;
- eventuale select admin sui profili della propria company in futuro;
- insert/update non pubblici o estremamente limitati.

## 8. Autenticazione

### 8.1 Prima versione

- Un solo amministratore.
- Login con email e password tramite Supabase Auth.
- Nessuna pagina di registrazione.
- Creazione utente gestita manualmente dal pannello Supabase.
- Sessione persistente su dispositivo.
- Logout esplicito.

### 8.2 Evoluzione futura

Il modello deve permettere:

- invito nuovi utenti;
- ruoli come admin, manager, viewer;
- associazione utenti-azienda;
- eventuale blocco utenti non attivi.

## 9. Validazione dati

Zod dovra essere usato per validare:

- form operai;
- form presenze;
- impostazioni aziendali;
- parametri di generazione PDF;
- filtri di mese e anno;
- dati import/export backup.

Le validazioni dovranno essere condivise tra UI e servizi dove possibile.

Regole chiave:

- nomi obbligatori per operaio;
- ore numeriche non negative;
- data presenza obbligatoria;
- una sola presenza per operaio per giorno;
- stati ammessi solo da elenco controllato;
- email valida se presente;
- mese e anno validi per riepilogo e PDF.

## 10. Librerie consigliate

Vincolate o gia previste:

- `@vitejs/plugin-react`
- `typescript`
- `react`
- `react-dom`
- `react-router-dom`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- `@supabase/supabase-js`
- `zod`

Consigliate per qualita applicativa:

- `vite-plugin-pwa` per manifest, service worker e installabilita PWA;
- `react-hook-form` per form performanti e mobile-friendly;
- `@hookform/resolvers` per integrare Zod nei form;
- `date-fns` per gestione date e calcoli mensili;
- `jspdf` o `pdfmake` per generazione PDF lato client;
- `jspdf-autotable` se si sceglie jsPDF e servono tabelle;
- `lucide-react` per icone coerenti e leggere;
- `clsx` per composizione classi CSS;
- `tailwind-merge` per risolvere conflitti Tailwind;
- `sonner` o libreria equivalente per toast moderni;
- `@tanstack/react-query` per cache, sincronizzazione e gestione stati server.

Consigliate per sviluppo:

- `eslint`
- `typescript-eslint`
- `prettier`
- `prettier-plugin-tailwindcss`
- `vitest`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `playwright` per test end-to-end e verifica PWA in fasi successive.

Nota: prima dell'installazione effettiva bisognera decidere se mantenere il set minimale o includere subito React Query e React Hook Form. Per questa app sono fortemente consigliati.

## 11. Design system

### 11.1 Stile visivo

Direzione:

- minimal;
- professionale;
- colori neutri;
- accenti blu;
- mobile-first;
- touch friendly;
- aspetto da app nativa;
- interazioni fluide;
- layout rapido da usare tutti i giorni.

### 11.2 Palette indicativa

- Sfondo app: grigio molto chiaro.
- Superfici: bianco.
- Testo principale: quasi nero.
- Testo secondario: grigio freddo.
- Bordi: grigio chiaro.
- Accento primario: blu professionale.
- Stati positivi: verde misurato.
- Stati attenzione: ambra.
- Stati errore: rosso sobrio.

La UI non deve risultare monotematica o troppo carica di blu. Il blu va usato per azioni primarie, stati selezionati e navigazione.

### 11.3 UX mobile

Principi:

- navigazione inferiore persistente;
- pulsanti grandi e facilmente toccabili;
- form brevi, con input chiari;
- modali o bottom sheet per azioni rapide;
- salvataggio con feedback immediato;
- uso ridotto di tabelle su mobile;
- riepiloghi mensili adattati con righe espandibili o viste a schede compatte;
- nessun testo descrittivo superfluo nell'interfaccia.

### 11.4 Componenti UI base

Componenti da prevedere:

- button primario, secondario, ghost e destructive;
- input testo;
- input numero;
- select;
- textarea;
- date picker o input data nativo ottimizzato;
- segmented control per stato presenza;
- checkbox o toggle;
- bottom sheet;
- modal;
- toast;
- empty state;
- loading state;
- confirm dialog;
- badge stato;
- card compatte per liste mobile;
- tabella responsive per riepilogo desktop.

## 12. Routing

Percorsi suggeriti:

| Percorso | Pagina | Accesso |
| --- | --- | --- |
| `/login` | Login | pubblico |
| `/` | Dashboard | autenticato |
| `/operai` | Operai | autenticato |
| `/operai/:id` | Dettaglio operaio | autenticato |
| `/presenze` | Presenze | autenticato |
| `/riepilogo` | Riepilogo mensile | autenticato |
| `/pdf` | Generazione PDF | autenticato |
| `/impostazioni` | Impostazioni | autenticato |
| `/backup` | Backup | autenticato |

Considerazione GitHub Pages:

- essendo una SPA su GitHub Pages, bisognera gestire correttamente fallback routing;
- opzioni possibili: usare `HashRouter` oppure configurare una strategia di fallback con `404.html`;
- per massima semplicita su GitHub Pages, `HashRouter` e la scelta piu robusta;
- se si vuole URL piu pulito, usare `BrowserRouter` con configurazione specifica di deploy.

## 13. PWA

### 13.1 Requisiti

- manifest web app;
- icone 192x192 e 512x512;
- apple touch icon;
- tema colore;
- viewport mobile corretto;
- service worker;
- installabilita su Android;
- supporto aggiunta a schermata Home su iPhone;
- comportamento full-screen o standalone;
- cache degli asset statici.

### 13.2 Offline

Prima versione consigliata:

- app shell disponibile offline;
- dati Supabase disponibili solo online;
- messaggio chiaro quando la rete non e disponibile.

Evoluzione futura:

- coda locale modifiche;
- sincronizzazione differita;
- gestione conflitti;
- backup automatici.

La modalita offline completa e una criticita importante per un gestionale presenze: va progettata con attenzione, non aggiunta in modo superficiale.

## 14. Generazione PDF

### 14.1 Contenuto PDF mensile

Il PDF dovrebbe includere:

- intestazione aziendale;
- mese e anno;
- data generazione;
- elenco operai;
- riepilogo per operaio;
- giorni presenti;
- ferie;
- malattie;
- permessi;
- trasferte;
- ore ordinarie;
- ore straordinarie;
- note rilevanti;
- eventuale firma o spazio firma.

### 14.2 Approccio tecnico

Opzione consigliata iniziale:

- generazione lato client;
- download immediato;
- nessun salvataggio obbligatorio del PDF nel database.

Librerie candidate:

- `pdfmake`, piu dichiarativa e adatta a documenti tabellari;
- `jspdf` con `jspdf-autotable`, molto diffusa e semplice per tabelle.

Scelta preliminare consigliata: `pdfmake`, se la priorita e ottenere layout professionali e ripetibili.

## 15. Backup

### 15.1 Prima versione

Backup manuale:

- esportazione JSON completa dei dati aziendali;
- esportazione CSV per presenze mensili;
- eventuale esportazione CSV operai;
- download locale dal browser.

### 15.2 Future versioni

- salvataggio backup in Supabase Storage;
- storico backup;
- verifica integrita;
- ripristino guidato;
- backup programmati;
- notifica esito backup.

## 16. Roadmap di sviluppo

### Fase 0 - Preparazione

- confermare architettura;
- confermare librerie extra;
- confermare strategia routing GitHub Pages;
- confermare struttura database;
- creare repository Git;
- inizializzare progetto Vite React TypeScript;
- configurare Tailwind;
- configurare linting e formattazione.

### Fase 1 - Fondamenta applicative

- configurare routing;
- configurare layout mobile-first;
- configurare theme Tailwind;
- configurare Supabase client;
- configurare env validation;
- creare shell autenticata;
- creare pagina login;
- implementare protected routes.

### Fase 2 - Database e sicurezza

- creare migrazioni Supabase;
- creare tabelle principali;
- creare trigger `updated_at`;
- configurare RLS;
- creare policy;
- creare admin iniziale;
- testare accessi consentiti e negati;
- generare tipi TypeScript da Supabase.

### Fase 3 - Gestione operai

- lista operai;
- creazione operaio;
- modifica operaio;
- disattivazione operaio;
- filtri;
- ricerca;
- dettaglio operaio;
- validazione Zod;
- gestione errori.

### Fase 4 - Presenze giornaliere

- selezione data;
- lista operai attivi;
- inserimento stato;
- ore ordinarie e straordinarie;
- ferie, malattia, permesso, trasferta;
- note;
- salvataggio rapido;
- aggiornamento presenze esistenti;
- prevenzione duplicati.

### Fase 5 - Dashboard

- KPI del giorno;
- operai attivi;
- presenze registrate;
- stati del giorno;
- alert giornate incomplete;
- scorciatoie operative.

### Fase 6 - Riepilogo mensile

- query mensile;
- aggregazioni per operaio;
- totali mensili;
- vista mobile;
- vista desktop;
- evidenza anomalie;
- filtri mese/anno.

### Fase 7 - PDF

- template PDF;
- dati azienda;
- riepilogo mensile;
- tabella professionale;
- download;
- verifica layout con casi reali;
- gestione mesi senza dati.

### Fase 8 - Impostazioni

- form dati azienda;
- default ore giornaliere;
- preferenze PDF;
- validazione;
- salvataggio protetto.

### Fase 9 - Backup

- export JSON;
- export CSV;
- backup mensile presenze;
- documentazione interna;
- eventuale import controllato in fase successiva.

### Fase 10 - PWA e deploy

- manifest;
- service worker;
- icone;
- meta tag iOS;
- test installazione Android;
- test aggiunta Home iPhone;
- configurazione GitHub Actions;
- deploy GitHub Pages;
- verifica routing produzione.

### Fase 11 - Qualita e rifinitura

- test unitari principali;
- test componenti critici;
- test flussi principali;
- audit accessibilita;
- audit mobile;
- ottimizzazione prestazioni;
- gestione error boundary;
- revisione UX finale.

## 17. Criticita

### 17.1 GitHub Pages e routing SPA

GitHub Pages non gestisce nativamente il fallback delle route SPA. Bisogna scegliere tra:

- `HashRouter`, piu semplice e robusto;
- `BrowserRouter` con configurazione fallback piu curata.

Per un gestionale privato, `HashRouter` puo essere accettabile.

### 17.2 Sicurezza Supabase

La sicurezza non puo dipendere solo dal frontend.

RLS e policy devono essere corrette fin dall'inizio, altrimenti un utente autenticato potrebbe leggere o modificare dati non previsti.

### 17.3 Singolo amministratore

Supabase Auth consente tecnicamente registrazioni se abilitate. Bisogna configurare il progetto Supabase in modo che:

- non esista registrazione pubblica nell'app;
- l'utente admin sia creato manualmente;
- eventuali inviti futuri siano controllati.

### 17.4 PDF lato client

La generazione PDF lato client e comoda, ma bisogna testare:

- tabelle lunghe;
- nomi lunghi;
- note molto lunghe;
- mesi con molti operai;
- rendering su mobile.

### 17.5 Offline PWA

Installabile non significa automaticamente funzionante offline.

La prima versione puo essere online-first. Se serve offline reale, bisogna progettare:

- storage locale;
- coda modifiche;
- sincronizzazione;
- risoluzione conflitti;
- protezione dati sul dispositivo.

### 17.6 Dati storici e operai disattivati

Gli operai non devono essere cancellati se collegati a presenze storiche.

La UI deve distinguere chiaramente:

- operai attivi per nuove presenze;
- operai disattivati visibili nei riepiloghi storici.

### 17.7 Date e timezone

Le presenze sono dati giornalieri, quindi bisogna evitare errori di timezone.

Consigli:

- usare campi `date` PostgreSQL per `attendance_date`;
- evitare conversioni inutili a timestamp;
- mostrare e filtrare date in locale italiano;
- testare cambio mese e fine mese.

## 18. Best practice

### 18.1 TypeScript

- evitare `any`;
- usare tipi generati da Supabase;
- definire tipi di dominio chiari;
- centralizzare enum e costanti;
- mantenere separati DTO, form values e modelli UI quando divergono.

### 18.2 React

- componenti piccoli e leggibili;
- logica dati fuori dai componenti UI;
- pagine come orchestratori;
- componenti di form riutilizzabili;
- gestione esplicita di loading, empty ed error state.

### 18.3 Supabase

- RLS sempre attiva;
- policy testate;
- migrazioni versionate;
- tipi generati dopo modifiche schema;
- chiavi pubbliche Supabase solo lato client;
- mai inserire service role key nel frontend.

### 18.4 Database

- UUID primary key;
- `created_at` e `updated_at` su tutte le tabelle;
- foreign key esplicite;
- vincoli di unicita dove necessario;
- check constraint per ore non negative;
- indici su `company_id`, `worker_id`, `attendance_date`;
- niente cancellazioni distruttive per dati storici.

### 18.5 UI/UX

- mobile-first reale;
- target touch comodi;
- bottom navigation;
- azioni frequenti sempre vicine;
- feedback immediato dopo salvataggio;
- testi brevi;
- form con validazione chiara;
- evitare layout da sito marketing;
- usare una gerarchia visiva sobria e professionale.

### 18.6 PWA

- icone corrette;
- manifest validato;
- service worker testato;
- fallback offline chiaro;
- test su Android e iOS;
- evitare cache aggressiva dei dati dinamici Supabase.

### 18.7 GitHub Actions

- build automatica a ogni push su branch principale;
- controllo TypeScript;
- lint;
- test se presenti;
- deploy su GitHub Pages solo dopo build riuscita.

## 19. Decisioni da confermare prima dello sviluppo

Prima di scrivere codice vanno confermate queste scelte:

1. Usare `HashRouter` o `BrowserRouter` per GitHub Pages.
2. Usare `pdfmake` o `jspdf` per i PDF.
3. Includere subito `@tanstack/react-query`.
4. Includere subito `react-hook-form`.
5. Stabilire se il backup iniziale deve essere solo export o anche import.
6. Stabilire se le trasferte richiedono solo flag/ore o anche localita obbligatoria.
7. Stabilire se ferie, malattia e permessi sono a giornata intera o anche a ore.
8. Stabilire se il PDF deve avere un formato specifico gia usato dall'azienda.

## 20. Strategia consigliata

Per la prima versione e consigliato costruire un MVP solido con:

- singolo admin;
- singola azienda;
- gestione operai completa;
- presenze giornaliere;
- riepilogo mensile;
- PDF mensile;
- backup export;
- PWA installabile;
- deploy automatico.

Il codice dovra pero includere gia `company_id`, `user_profiles`, policy RLS e separazione feature-based, cosi da non dover riscrivere l'app quando arriveranno piu utenti o piu aziende.

## 21. Stato attuale

Questo documento e solo una pianificazione iniziale.

Non sono stati creati:

- progetto Vite;
- componenti;
- pagine;
- codice applicativo;
- dipendenze;
- configurazioni Supabase;
- workflow GitHub Actions.

Il prossimo passo sara attendere conferma sulle decisioni aperte e solo dopo iniziare lo sviluppo.
