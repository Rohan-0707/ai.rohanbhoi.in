# ⛈️ JalVayu AI: Monsoon Command Center

**A hyper-localized emergency preparedness platform featuring real-time alerts, live-weather AI plans, and secure household tracking.**

**Live demo:** [https://ai.rohanbhoi.in](https://ai.rohanbhoi.in)

![JalVayu AI Dashboard](./public/jalvayu-dashboard.png)

---

## 🚨 Hackathon Evaluator Access

To comply with **“No Mock Data”** and **“Share Test Credentials”** rules, JalVayu AI implements a secure evaluator bypass. Judges can sign in instantly without waiting for a live OTP email or SMS dispatch.

Use these **exact** credentials on the landing page (`/#get-started`) or `/login`:

```
Email: judge@google.com
OTP:   123456
```

> Entering these credentials bypasses live OTP dispatch and immediately authenticates a real session against the production database—no canned demo accounts, no pre-filled plans, and no hardcoded alert payloads.

---

## 🧠 Core Features & Compliance

### Zero Canned AI

Every emergency plan is generated live via **OpenAI `gpt-4o-mini`** (`app/api/plan/generate/route.ts`) with strict `response_format: { type: "json_object" }`. Inputs are real user data: **location**, **family size**, **housing type**, **language** (EN / HI / KN), and optional **special medical or accessibility needs**.

**Live weather is fed into every plan:** the API geocodes the user’s area, fetches **Open-Meteo** current conditions + 3-day forecast, and passes `liveWeatherContext` to GPT so checklist phases and travel advisories reflect actual rain, wind, and outlook.

**Structured output:**
- **Timeline checklist** — 3 phases: *Before the storm*, *During the storm*, *After the storm* (2–4 items each)
- **Safety recommendations** — 3 broader household guidelines
- **Travel advisories** — 3–5 neighborhood-aware routes and flood-risk guidance

Optional **Google Cloud Translation** (`lib/google-translate.ts`) localizes English plans into Hindi or Kannada when configured.

### No Login Required (Quick Plan)

The **Quick Emergency Survival Plan** wizard lives in the **hero right column** (`/#quick-plan`):

- **No sign-in** — generate instantly as a guest (`saved: false`, nothing stored)
- **Auto-detected area** — ipapi.co prefills your city silently
- **Glass dark UI** — compact 3-step wizard in the hero
- **Results below hero** — full plan renders in `#plan-results` with **smooth auto-scroll** after generation (weather panel, checklist, PDF export)

Optional OTP sign-in is at `/#get-started` for encrypted history and dashboard tools.

### Live Weather Intelligence

| Feature | Endpoint / Component | APIs |
|---------|---------------------|------|
| **Hero weather badge** | `LiveWeatherWidget` | ipapi.co → Open-Meteo |
| **Weather checker** | `/#weather-check` → `/api/weather/briefing` | Geocode + Open-Meteo → GPT briefing |
| **Plan generation** | `/api/plan/generate` | Geocode + Open-Meteo → GPT plan |
| **Alert feeds** | `/#realtime-alerts` → `/api/alerts/feed` | ipapi.co + Open-Meteo (local + 5 metros) → GPT |

PIN codes (e.g. `560064`, `413105`) and place names are supported via `postalpincode.in`, Open-Meteo Geocoding, and Nominatim fallback.

### True Real-Time Alerts (Auto-Location · Local + National)

On `/#realtime-alerts`, JalVayu **silently detects your location** (ipapi.co), fetches **Open-Meteo** for your area plus five Indian metros, and uses **GPT-4o-mini** to produce:

| Column | Content |
|--------|---------|
| **Left** | Local area alerts & updates (before · during · after) for your auto-detected city |
| **Right** | India country-level outlook aggregated from Delhi, Mumbai, Chennai, Kolkata, Bengaluru |

Socket.io pushes instant emergency broadcasts into the **local** column. Feed auto-refreshes every 15 minutes.

| API | Purpose |
|-----|---------|
| `POST /api/alerts/feed` | Location + Open-Meteo → local & national alert arrays |
| `POST /api/evaluator/demo-alert` | Optional Socket.io broadcast demo (evaluators) |
| `POST /api/admin/trigger-alert` | Custom alerts with `ADMIN_SECRET` |

### Enterprise Security

Sensitive fields—**location** and **special medical needs**—are encrypted at rest (**AES-256-CBC**, `lib/encryption.ts`). `ENCRYPTION_KEY` must be exactly **32 characters**.

### Offline PDF Export

**Save Offline (PDF)** uses native browser print with print-isolation CSS—only the survival plan is exported (weather context, phased checklist, travel advisories). Works on landing page and dashboard.

### No Permission Popups

IP-based geolocation for the hero weather widget, quick plan area prefill, and alert feeds—no browser geolocation prompts. Graceful fallback to Bengaluru if lookup fails.

---

## 🗺 Landing Page Map

| Anchor | What judges see |
|--------|-----------------|
| `/#quick-plan` | Hero wizard — 3-step guest plan generator (glass UI) |
| `#plan-results` | Full AI plan output below hero (auto-scroll on generate) |
| `/#weather-check` | Place/PIN weather briefing |
| `/#realtime-alerts` | Auto-location local + India national alert columns |
| `/#get-started` | Optional OTP sign-in (evaluator bypass visible) |
| `/#how-it-works` | Three-step explainer |
| `/#features` | Feature grid |

---

## 🤖 Gen AI Services

| Service | Where Used |
|---------|------------|
| **OpenAI GPT-4o-mini** | Emergency plans, weather briefings, local + national alert feeds |
| **Google Cloud Translation** (optional) | Hindi / Kannada plan localization |
| **Open-Meteo** | Live weather + forecast (not generative; feeds GPT) |

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS |
| **Backend** | Node.js (standalone HTTP server), Socket.io |
| **Database** | MySQL, Prisma ORM |
| **AI & APIs** | OpenAI, Google Cloud Translation (optional), Open-Meteo, ipapi.co, postalpincode.in, Nominatim |
| **Infrastructure** | PM2, Nginx |

---

## 🚀 Local Run Instructions

### 1. Clone and install

```bash
git clone https://github.com/Rohan-0707/ai.rohanbhoi.in.git
cd ai.rohanbhoi.in
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

**Required:**

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | MySQL connection string |
| `OPENAI_API_KEY` | GPT-4o-mini plan + weather briefing + alert feeds |
| `ENCRYPTION_KEY` | Exactly **32 characters** (AES-256-CBC) |
| `ADMIN_SECRET` | Admin alert trigger auth |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:2510` |
| `NEXT_PUBLIC_SOCKET_URL` | Same origin or socket proxy |
| `SOCKET_PORT` | Default `3001` |
| `SOCKET_INTERNAL_URL` | e.g. `http://127.0.0.1:3001` |
| `CORS_ORIGIN` | e.g. `http://localhost:2510` |

**Optional:** `GOOGLE_TRANSLATE_API_KEY`, SMTP / Interakt for live OTP.

> Never commit `.env`.

### 3. Initialize the database

```bash
npx prisma db push
```

### 4. Start servers

**Development:**

```bash
npm run pm2:dev
```

**Production:**

```bash
npm run build
npm run pm2:start
```

- **Next.js** → port **2510**
- **Socket.io** → port **3001**

Or separately: `npm run dev` + `npm run dev:socket`

### 5. Test

```bash
npm test              # Jest + React Testing Library
npm run test:unit     # Vitest (57+ tests)
```

### 6. Try without login

1. [https://ai.rohanbhoi.in/#quick-plan](https://ai.rohanbhoi.in/#quick-plan) — fill wizard in hero → plan appears below with auto-scroll
2. [https://ai.rohanbhoi.in/#weather-check](https://ai.rohanbhoi.in/#weather-check) — AI weather briefing (city or PIN)
3. [https://ai.rohanbhoi.in/#realtime-alerts](https://ai.rohanbhoi.in/#realtime-alerts) — auto-location local + national feeds

Sign in with **`judge@google.com`** / **`123456`** for encrypted history, profile, and dashboard tools.

### 7. Evaluator quick test script

```bash
# Health
curl -s https://ai.rohanbhoi.in/api/health

# Local + national alert feed
curl -s -X POST https://ai.rohanbhoi.in/api/alerts/feed \
  -H "Content-Type: application/json" \
  -d '{"city":"Bengaluru","region":"Karnataka","country":"India","latitude":12.9716,"longitude":77.5946}'

# Socket.io demo alert (Before → During → After rotation)
curl -s -X POST https://ai.rohanbhoi.in/api/evaluator/demo-alert

# Weather briefing (rural PIN)
curl -s -X POST https://ai.rohanbhoi.in/api/weather/briefing \
  -H "Content-Type: application/json" \
  -d '{"query":"413105"}'

# Guest plan (no auth)
curl -s -X POST https://ai.rohanbhoi.in/api/plan/generate \
  -H "Content-Type: application/json" \
  -d '{"location":"Bengaluru","familySize":4,"housingType":"Apartment","language":"en"}'
```

---

## 📄 License

Private — Google PromptWars Hackathon submission.
