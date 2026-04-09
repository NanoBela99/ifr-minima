# IFR Planning Brief

Application de planification IFR suivant le logigramme de l'école.

## Stack

- **Next.js 14** (App Router, static export)
- **TypeScript** — typage strict
- **Tailwind CSS** — design pro
- **Cloudflare Worker** — proxy CORS gratuit pour les APIs météo
- **GitHub Pages** — hébergement gratuit

## Architecture

```
ifr-minima/
├── app/
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # State management principal
│   └── globals.css         # Tailwind + design tokens
├── components/
│   ├── ui/index.tsx        # Composants partagés (TopBar, Card, Segment…)
│   └── screens/
│       ├── SetupScreen.tsx       # Terrains + type avion + horaires
│       ├── MinimaScreen.tsx      # Minima Jeppesen (saisis manuellement)
│       ├── LoadingScreen.tsx     # Fetch METAR/TAF/NOTAMs
│       ├── NotamScreen.tsx       # Affichage + checkbox NOTAMs
│       ├── DepartureScreen.tsx   # Vérification départ
│       ├── DestinationScreen.tsx # Vérification destination
│       └── SummaryScreen.tsx     # Synthèse GO/GO*
├── lib/
│   ├── types.ts            # Types TypeScript
│   ├── metar-parser.ts     # Parseur METAR/TAF (JSON aviationweather.gov)
│   ├── planning-rules.ts   # Règles de planification IFR école
│   └── api.ts              # Fetch via proxy Cloudflare
├── worker/
│   └── proxy.js            # Cloudflare Worker (CORS proxy gratuit)
└── .github/workflows/
    └── deploy.yml          # Auto-deploy vers GitHub Pages
```

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# Remplir NEXT_PUBLIC_PROXY_URL après étape 2
npm run dev
```

## Déploiement — 3 étapes

### Étape 1 — Cloudflare Worker (résout le CORS)

1. Créer un compte gratuit sur cloudflare.com
2. Dans le terminal :
```bash
npx wrangler login
npx wrangler deploy worker/proxy.js --name ifr-proxy --compatibility-date 2024-01-01
```
3. Copier l'URL obtenue (ex: `https://ifr-proxy.ton-nom.workers.dev`)

### Étape 2 — Secret GitHub

Sur github.com → repo → **Settings → Secrets → Actions → New secret** :
- Name : `NEXT_PUBLIC_PROXY_URL`
- Value : l'URL du Worker

### Étape 3 — Push

```bash
git add .
git commit -m "feat: Next.js IFR app"
git push
```

GitHub Actions build et déploie automatiquement sur GitHub Pages.

## Limites connues

- **NOTAMs France** : aviationweather.gov couvre partiellement les aéroports français. Les liens SIA officiels sont toujours affichés pour vérification manuelle.
- **Minima** : saisis manuellement depuis vos cartes Jeppesen (logique métier dans `lib/planning-rules.ts`).
- **TAF** : disponible uniquement sur les grands aéroports. Sur les petits terrains, le METAR est utilisé à la place.
