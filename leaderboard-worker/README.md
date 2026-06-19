# Classifica globale — Cloudflare Worker + D1

Backend gratuito e GDPR-friendly (dati in UE) per la classifica del mini-game
**"La Corsa di Pablo"**. È deployato **separatamente** dal sito (Vercel): il sito
ci parla solo via `fetch`, leggendo l'URL del Worker dall'env
`NEXT_PUBLIC_LEADERBOARD_URL`.

Finché questa env non è impostata, il sito usa la classifica **locale** (top-10
in `localStorage`) come oggi — quindi puoi deployare il Worker con calma senza
rompere nulla.

---

## Cosa salva (e cosa NO)

| Salvato in D1 | NON salvato |
|---|---|
| `name` (nickname, max 12 char, ri-sanificato lato server) | email / telefono |
| `score` (intero) | IP grezzo (per il rate-limit si usa un **hash** effimero) |
| `created_at` (timestamp) | user-agent, cookie, tracciamento |

Data minimization by design: l'unico dato personale potenziale è il nickname,
che l'utente sceglie e che viene mostrato pubblicamente in classifica.

---

## Prerequisiti

- Un account **Cloudflare** (gratuito, senza carta di credito).
- Node + npm installati.

## Setup passo-passo

Tutti i comandi vanno eseguiti **in questa cartella** (`leaderboard-worker/`).

```bash
cd leaderboard-worker
npm install
npx wrangler login          # apre il browser per autenticarti (interattivo)
```

### 1) Crea il database D1 in UE

> ⚠️ La residenza UE va scelta **alla creazione** e non è modificabile dopo.

```bash
npx wrangler d1 create pablo-leaderboard --location=weur
```

`--location=weur` = Western Europe. Il comando stampa un blocco con il
`database_id`: **copialo dentro `wrangler.toml`** al posto di
`INCOLLA_QUI_IL_DATABASE_ID`.

### 2) Crea le tabelle

```bash
npm run db:init             # esegue schema.sql sul DB remoto
```

### 3) Imposta i segreti

```bash
# Genera due valori casuali robusti (uno qualsiasi va bene, es. da un password manager).
npx wrangler secret put SIGNING_SECRET   # firma i token di sessione + hash IP
npx wrangler secret put ADMIN_TOKEN      # ti serve per cancellare voci (moderazione)
```

### 4) Imposta le origini autorizzate

In `wrangler.toml`, dentro `[vars] ALLOWED_ORIGINS`, metti le origini del sito
(produzione + eventuali anteprime). Esempio già pre-compilato:

```
http://localhost:3000,https://pablothegarden.com,https://www.pablothegarden.com
```

Solo i browser su queste origini potranno leggere/scrivere. Evita `*.vercel.app`
in produzione (autorizzerebbe qualsiasi sito su vercel.app); per un'anteprima
aggiungi semmai il dominio esatto del deploy.

### 5) Deploy

```bash
npm run deploy
```

Wrangler stampa l'URL pubblico, tipo
`https://pablo-leaderboard.<tuo-subdominio>.workers.dev`.

### 6) Collega il sito

Imposta l'env sul progetto **Vercel** (Settings → Environment Variables) e in
locale in `.env.local`:

```
NEXT_PUBLIC_LEADERBOARD_URL=https://pablo-leaderboard.<tuo-subdominio>.workers.dev
```

Poi **ridepoya il sito** (l'env `NEXT_PUBLIC_*` viene inlinata al build). Da quel
momento la classifica diventa globale e permanente. ✅

---

## Verifica veloce

```bash
# top-10 (vuota all'inizio)
curl https://pablo-leaderboard.<sub>.workers.dev/scores

# un token di sessione
curl https://pablo-leaderboard.<sub>.workers.dev/session
```

## Moderazione (cancellare una voce)

La top-10 mostra l'ordine; per trovare l'`id` di una voce molesta interroga il DB:

```bash
npx wrangler d1 execute pablo-leaderboard --remote \
  --command "SELECT id, name, score FROM scores ORDER BY score DESC LIMIT 20"

# poi cancella via API (usa l'ADMIN_TOKEN impostato sopra)
curl -X DELETE https://pablo-leaderboard.<sub>.workers.dev/scores/123 \
  -H "Authorization: Bearer IL_TUO_ADMIN_TOKEN"
```

---

## Privacy & retention (GDPR)

- L'unico dato personale è il **nickname**, scelto dall'utente e mostrato
  pubblicamente. Nessun IP in chiaro, nessun cookie, nessun tracciamento.
- **Retention**: i punteggi fuori dalla top-200 vengono scartati automaticamente;
  i restanti restano finché non vengono superati o cancellati a mano.
- **Cancellazione su richiesta**: usa l'endpoint `DELETE` qui sopra. Assicurati che
  la **privacy policy** del sito citi la classifica e indichi un canale (es. la
  pagina Contatti / Instagram) per chiedere la rimozione del proprio nome.

---

## Anti-cheat: cosa garantisce (e cosa no)

- ✅ Blocca i punteggi assurdi: serve un **token firmato dal server** e
  `tempo_trascorso ≥ punteggio × 50ms` → niente "9999 in 1 secondo".
- ✅ Cap di punteggio (`50.000`) e validazione intero.
- ✅ Rate-limit per IP (IP **hashed**, mai salvato in chiaro).
- ✅ Nome ri-sanificato lato server; board potata ai top 200.
- ⚠️ Limite onesto: il gioco gira nel browser, quindi un attaccante davvero
  determinato può ancora inviare un punteggio "plausibile ma falso" replicando
  le chiamate. Per un easter-egg di festival senza premi è un compromesso giusto;
  la moderazione manuale (DELETE) copre i casi estremi.

## Costi

Free tier di Cloudflare Workers + D1: ampiamente sufficiente per un festival
(ordine di grandezza: il consumo reale è una frazione minima dei limiti
gratuiti). Nessuna carta richiesta.
