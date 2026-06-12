# Benchmark — Festival di Musica Elettronica

> Ricerca condotta a Giugno 2026 analizzando i siti di elrow, Awakenings, Sonus.
> Usata per aggiornare il design di pablothegarden.com.

---

## Festival analizzati

| Festival | URL | Dimensione | Stile |
|---|---|---|---|
| **elrow** | elrow.com | Globale, 3.8M presenze | House/techno immersiva, tematica |
| **Awakenings** | awakenings.com | 80.000/weekend, Olanda | Techno minimale/dark |
| **Sonus** | sonuscroatia.com | 5+ giorni, Croazia | Techno/house, beach festival |
| Tomorrowland | tomorrowland.com | 400.000/edizione, Belgio | EDM mainstream, mega-brand |

---

## Pattern universali (tutti i festival top li condividono)

### 1. Hero = video full-screen autoplay muto — SEMPRE

Non un'immagine, non un gradient. Un **video** che mostra la folla, le luci, le scenografie, l'energia. Autoplay, muted, loop, senza controlli visibili. Il video viene prima di qualsiasi testo.

**Implicazione per Pablo:** Serve un video editato dalle clip delle edizioni 2023, 2024 e 2025. Lunghezza ideale: 20–45 secondi. Se non disponibile al lancio, usare una foto HD come fallback temporaneo ma pianificare subito la produzione del video.

```html
<!-- Implementazione corretta -->
<video autoplay muted loop playsinline>
  <source src="/video/hero.mp4" type="video/mp4" />
</video>
```

### 2. Tagline del brand PRIMA del nome evento

Il posizionamento emozionale viene prima della descrizione:
- elrow: **"The kind of craziness this world needs"**
- Sonus: **"Your ultimate Festival Vacation in Croatia"**
- Awakenings: l'identità "techno underground" pervade tutto il sito senza essere dichiarata esplicitamente

Non si apre con "Festival di musica elettronica · 15 agosto". Si apre con un'emozione.

**Tagline proposta per Pablo:** *"Una notte. Un giardino. Un altro mondo."*
(Da discutere e approvare con il team di Gobananas Events — deve essere una scelta consapevole, non automatica)

### 3. Il tema dell'edizione è un prodotto a sé

elrow tratta ogni "show" (Kaos Garden, Hallucinarium, Delusionville) come un prodotto con nome proprio, identità visiva, pagina dedicata e video teaser. Tomorrowland costruisce un'intera narrativa fantasy attorno al tema di ogni anno.

**Implicazione per Pablo:** La Sweet Edition non è solo un palette di colori — è un mondo da raccontare. Serve una sezione dedicata che mostri il "perché" del tema candy, le scenografie previste, l'atmosfera. Questo è esattamente il tipo di contenuto che genera condivisione organica sui social prima dell'evento.

### 4. I numeri sono social proof scalata

elrow mostra: **680 shows · 3.8M attendees · 56 stage at festivals · 8 festivals · 48 countries · 150 cities**

Non è vanteria — è prova che altri ci credono. Anche a scala locale, i numeri funzionano: "4 edizioni" dice "siamo cresciuti", "15.000 presenze" dice "ci sono stati i tuoi amici", "1 giardino" dice "è qualcosa di unico, non replicabile".

**Stats suggerite per Pablo:**
```json
[
  { "value": 4, "label": "Edizioni" },
  { "value": 1, "label": "Giardino" },
  { "value": 15000, "label": "Presenze", "suffix": "+" },
  { "value": 1, "label": "Estate Marchigiana" }
]
```
*I numeri di presenze devono essere verificati con il team prima di pubblicare.*

### 5. Navigazione ultra-minimale

| Festival | Voci nav principale |
|---|---|
| Sonus | 4 (Home, This Is Sonus, Guide, Gallery) |
| Awakenings | 5 (Tickets, Artists, FAQ, About, Sustainability) |
| elrow | 6 (Events, Shows, Music, Sustainability, Chi siamo, Work with us) |

**Implicazione per Pablo:** Max 4–5 voci. Proposta: **Lineup · Biglietti · Gallery · About**. Blog e Regolamento vanno nel footer.

### 6. Social proof testuale prima della self-description

Sonus mette le citazioni di Mixmag, Timeout e Resident Advisor **prima** di scrivere di sé stessi. Il principio: lascia che gli altri dicano quanto sei bravo, non farlo tu.

**Applicazione per Pablo:** Sostituire o affiancare l'auto-descrizione con screenshot o citazioni di commenti Instagram delle edizioni passate (frasi dei partecipanti, reazioni). Possibile anche sezione con articoli di stampa locale.

---

## Differenze rilevanti rispetto al design originale di Pablo

| Elemento | Design originale (Feb 2026) | Design aggiornato (Giu 2026) | Fonte |
|---|---|---|---|
| Hero | Gradient + particles + logo + date | **Video autoplay** + overlay + tagline + CTA | Tutti i benchmark |
| Brand tagline | Assente | **Presente** (sezione dedicata dopo hero) | elrow, Sonus |
| Tema Sweet Edition | Solo nell'estetica visiva | **Sezione narrativa dedicata** (Sweet World) | elrow themes |
| Numeri/statistiche | Assenti | **Stats counter animato** (4 edizioni, 1 giardino, ecc.) | elrow "Planet Elrow" |
| Navigazione | 5+ voci | **Max 4 voci** (Lineup, Biglietti, Gallery, About) | Sonus, Awakenings |
| Ordine sezioni homepage | Hero → Countdown → Lineup → Experience | Hero → Tagline → Countdown → **Sweet World** → Lineup → Experience → **Stats** → Sponsors | Benchmark |

---

## Elementi dei benchmark NON adottati (e perché)

| Elemento | Motivo dell'esclusione |
|---|---|
| Sustainability page dedicata | Rilevante per festival da 100k+ presenze; troppo presto per Pablo |
| Newsletter come CTA principale | Instagram funziona meglio per il target 18-40 italiano |
| Blog/press section | Mantenuto ma bassa priorità — pubblicazione post-lancio |
| Pre-registration (Tomorrowland) | Complessità non giustificata per la scala di Pablo |
| Multi-product (elrow Town, Snowrow...) | Pablo è un evento singolo; future espansioni da valutare |

---

## Riferimenti

- elrow.com — analizzato in live su Claude, giugno 2026
- awakenings.com — analizzato in live su Claude, giugno 2026
- sonuscroatia.com — analizzato in live su Claude, giugno 2026
- Tomorrowland — dati da fonti secondarie (sito non accessibile direttamente)
