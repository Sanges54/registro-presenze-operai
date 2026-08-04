# Registro Presenze Operai

Progressive Web App mobile-first per la gestione delle presenze giornaliere degli operai.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router con `HashRouter`
- Supabase client
- Zod
- vite-plugin-pwa
- lucide-react
- jsPDF
- jsPDF AutoTable

## Stato attuale

Funzioni implementate:

- login Supabase
- gestione operai
- registrazione presenze
- dashboard reale
- rendiconto mensile
- impostazioni aziendali
- generazione PDF mensile nel browser
- PWA installabile

Non e ancora implementato il backup.

## Configurazione ambiente

Copiare `.env.example` in `.env.local` e inserire le credenziali Supabase.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Non inserire credenziali reali nel repository.

## Script

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Avvio locale

```bash
npm run dev
```

## GitHub Pages

Il progetto e predisposto per il repository `registro-presenze-operai`.

La configurazione Vite usa:

```ts
base: "/registro-presenze-operai/"
```

Il routing usa `HashRouter` per funzionare correttamente su GitHub Pages senza configurazioni server aggiuntive.

Il manifest PWA usa:

```ts
scope: "/registro-presenze-operai/"
start_url: "/registro-presenze-operai/#/"
```

## Pubblicazione con GitHub Actions

Il workflow e in:

```text
.github/workflows/deploy-pages.yml
```

Parte automaticamente a ogni push sul branch `main` ed esegue:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Poi carica `dist` come artifact GitHub Pages e pubblica con `actions/deploy-pages`.

### Secrets richiesti

Nel repository GitHub aggiungere questi secrets in `Settings > Secrets and variables > Actions`:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Non usare service role key, secret key o password database nel frontend.

### Abilitare GitHub Pages

Nel repository GitHub:

1. Aprire `Settings`.
2. Aprire `Pages`.
3. In `Build and deployment`, selezionare `GitHub Actions`.
4. Verificare che il branch principale sia `main`.
5. Fare push del codice su `main`.

L'app sara pubblicata indicativamente su:

```text
https://<utente-github>.github.io/registro-presenze-operai/
```
