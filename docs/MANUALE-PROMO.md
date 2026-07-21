# Sito Pablo — Versione Promo (per il team marketing)

Una copia del sito pablothegarden.it, online a un indirizzo separato, pensata **solo per registrare
contenuti promozionali**. Il sito pubblico non è toccato in nessun modo.

## 👉 https://pablothegarden-promo.vercel.app

---

## Cosa cambia rispetto al sito vero

| | Sito pubblico | Versione promo |
|---|---|---|
| Comparsa del pappagallo Pablo | dopo 15 secondi | **dopo 40 secondi** |
| Formato del mini-gioco | verticale (come un telefono) | **ultra-panoramico 4224×1092** |
| Schermo nero a fondo pagina | non c'è | **c'è**, occupa tutto lo schermo |
| Banner cookie | c'è | tolto (sporcherebbe le riprese) |
| Punteggi del gioco | finiscono nella classifica ufficiale | **restano sul PC**, non sporcano la classifica |

Tutto il resto — grafica, testi, foto, lineup, musica del gioco — è identico al sito vero.

> **Nota sul formato.** 4224×1092 corrisponde a una proporzione di **3,87 : 1** (molto più largo
> del 16:9 e anche del 21:9). Il gioco si adatta automaticamente a quella proporzione: si vede una
> fascia orizzontale con bande nere sopra e sotto. La difficoltà è identica alla versione verticale,
> cambia solo quanto campo si vede davanti a Pablo.

---

## Come si usa

### 1. Aprire il sito
Aprire il link in **Chrome** (a schermo intero, tasto `F11`).

### 2. Lo schermo nero di partenza
Scorrere **fino in fondo alla pagina**: si arriva a una schermata completamente nera.
Da lì si fa partire la registrazione, poi si risale con la rotella.

Scorciatoia: aggiungere `#recording-start` in fondo all'indirizzo per aprire il sito
già sullo schermo nero.
Esempio: `https://pablothegarden-promo.vercel.app/it#recording-start`

### 3. Il pappagallo
Dopo **40 secondi** dall'apertura della pagina compare Pablo, il pappagallo che svolazza ai lati
dello schermo. Cliccandolo si apre il mini-gioco.

Scorciatoia per le riprese ripetute: aggiungere `?parrot=now` all'indirizzo e il pappagallo
compare **subito**, senza aspettare.
Esempio: `https://pablothegarden-promo.vercel.app/it?parrot=now`

### 4. Il gioco
- **Barra spaziatrice** (o clic) per far volare Pablo.
- **Esc** per mettere in pausa / chiudere.
- Sulla schermata iniziale del gioco, digitare **`p-a-b-l-o`** sulla tastiera: parte il **filmato
  automatico** — Pablo vola da solo tra le casse neon, entra in un portale arcobaleno e appare il
  logo del festival. Dura circa 15 secondi, nessuno deve giocare. **È il contenuto migliore da
  registrare.**

---

## Registrare a 4224×1092 esatti (con OBS)

Nessun monitor è largo così: per ottenere la risoluzione esatta serve OBS Studio (gratuito).

1. In OBS: **Impostazioni → Video** → Risoluzione di base e di uscita: `4224 x 1092`.
2. Nella scena, **+ → Browser**.
3. URL: il link della versione promo. Larghezza `4224`, altezza `1092`.
4. Spuntare *"Controlla l'audio tramite OBS"* per catturare la musica del gioco.
5. Tasto destro sulla sorgente → **Interagisci**: si apre una finestrella in cui si può cliccare
   il pappagallo e giocare. Da lì si digita anche `pablo` per il filmato automatico.

Senza OBS si può registrare normalmente lo schermo: il gioco resta nella proporzione giusta, si
ritaglia poi in montaggio.

---

## Cose da sapere

- Il link **non è indicizzato da Google** e non è collegato dal sito pubblico: nessuno ci arriva per caso.
- È comunque **raggiungibile da chiunque abbia il link** — non condividerlo fuori dal team.
- Le modifiche valgono **solo** su questo indirizzo. pablothegarden.it resta esattamente com'è.
- Se il link smette di funzionare (succede se qualcuno cancella il ramo su Vercel), basta chiedere
  un nuovo deploy: il codice resta salvato.

---

## Per chi sviluppa

Ramo `promo-marketing`, deployato come **progetto Vercel separato**
`pablothegarden-promo` (non come preview del progetto principale: le preview
sono dietro il login SSO di Vercel e il marketing non potrebbe aprirle).

Tutte le modifiche sono dietro il flag `PROMO` in `src/lib/game/promo.ts`, che è
**opt-in**: si accende solo con `NEXT_PUBLIC_PROMO_MODE=1`, impostata come
variabile di build sul solo progetto `pablothegarden-promo`. Un merge accidentale
in `main` non cambierebbe quindi nulla in produzione.

Aggiornare il sito promo: `vercel deploy --prod` dal ramo (il progetto non è
collegato a Git). `vercel.json` forza il preset `nextjs` e l'header
`X-Robots-Tag: noindex` su tutte le pagine.

File toccati:

- `src/lib/game/promo.ts` *(nuovo)* — flag, risoluzione target, delay del pappagallo, cap DPR.
- `src/lib/game/engine.ts` — estratta una `Layout` (larghezza mondo, x del pappagallo, passo/velocità
  dei cancelli); il layout ultrawide è `2785×720` logici, l'altezza — e quindi tutta la fisica — è
  invariata. `ensureGates` ora riempie la pipeline con un `while` (sul layout verticale il corpo gira
  al massimo una volta, comportamento identico a prima).
- `src/lib/game/showcase.ts` — la cinematica passa da 32:9 alla proporzione promo.
- `src/lib/game/leaderboard.ts` — legge la classifica globale, non ci scrive (`CAN_SUBMIT`).
- `src/components/easteregg/FloatingParrot.tsx` — delay da `promo.ts` + query `?parrot=now`.
- `src/components/easteregg/ParrotGame.tsx` — `computeSize` sulla proporzione promo, DPR 2.5, niente
  cornice arrotondata, fondo nero.
- `src/components/promo/PromoBlackFrame.tsx` *(nuovo)* — il div nero, `z-index: 90` (sopra header,
  CTA e banner cookie; sotto il modale del gioco a `z-100`).
- `src/app/[locale]/layout.tsx` — monta il div nero, salta il banner cookie.
