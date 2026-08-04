# Supabase - Registro Presenze Operai

Questa cartella contiene solo la struttura database. Il frontend non e ancora collegato a Supabase.

## 1. Creare un progetto Supabase

1. Accedere a Supabase.
2. Creare un nuovo progetto.
3. Scegliere una password sicura per il database.
4. Attendere il completamento della creazione del progetto.

## 2. Eseguire gli script SQL

Aprire il pannello Supabase, andare in `SQL Editor` ed eseguire gli script in questo ordine:

1. `01_schema.sql`
2. `02_updated_at_triggers.sql`
3. `03_rls_policies.sql`
4. `04_demo_data_optional.sql` solo se servono dati demo

Lo script demo e facoltativo. Prima di usarlo bisogna sostituire l'UUID placeholder con l'id reale del primo utente.

## 3. Creare manualmente il primo utente

1. Aprire `Authentication`.
2. Andare in `Users`.
3. Creare manualmente il primo utente amministratore con email e password.
4. Copiare l'id UUID dell'utente creato.
5. Inserire manualmente il profilo collegato:

```sql
insert into public.profiles (id, full_name, role)
values (
  'UUID_UTENTE_AUTH',
  'Nome Amministratore',
  'admin'
);
```

Sostituire `UUID_UTENTE_AUTH` con l'id reale dell'utente in `auth.users`.

## 4. Disattivare la registrazione pubblica

Nel pannello Supabase:

1. Aprire `Authentication`.
2. Aprire `Providers`.
3. Verificare la configurazione Email.
4. Disabilitare o limitare le registrazioni pubbliche secondo le opzioni disponibili nel progetto.

L'app non dovra mostrare una pagina di registrazione pubblica.

## 5. Recuperare URL e anon key

Nel pannello Supabase:

1. Aprire `Project Settings`.
2. Aprire `API`.
3. Copiare `Project URL`.
4. Copiare la chiave `anon public`.

## 6. Inserire le variabili in `.env`

Creare un file `.env` partendo da `.env.example`:

```env
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co
VITE_SUPABASE_ANON_KEY=chiave_anon_pubblica
```

Non inserire mai la service role key nel frontend.

## 7. Verificare le policy RLS

Controlli consigliati:

1. Verificare che RLS sia attiva su tutte le tabelle:
   - `profiles`
   - `workers`
   - `attendance`
   - `company_settings`
   - `backup_preferences`
2. Effettuare login come utente autenticato.
3. Provare a leggere solo i record con `user_id = auth.uid()`.
4. Provare a inserire record con il proprio `user_id`.
5. Provare a inserire o modificare record con un `user_id` diverso: l'operazione deve fallire.
6. Provare a creare una presenza per un operaio di un altro utente: l'operazione deve fallire.

## 8. Note di sicurezza

- Nessun accesso anonimo e previsto dalle policy.
- Ogni policy e limitata al ruolo `authenticated`.
- Ogni utente autenticato puo leggere e modificare solo i propri record.
- La tabella `attendance` verifica che l'operaio appartenga allo stesso utente.
- La cancellazione e tecnicamente permessa solo sui propri record, ma l'app potra scegliere di preferire disattivazioni e storico non distruttivo.
