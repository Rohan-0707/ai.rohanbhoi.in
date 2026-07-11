# ⛈️ JalVayu AI: Monsoon Command Center

**A hyper-localized emergency preparedness platform featuring real-time alerts, live-weather AI plans, and secure household tracking.**

**Live demo:** [https://ai.rohanbhoi.in](https://ai.rohanbhoi.in)

![JalVayu AI Dashboard](./public/screenshot-placeholder.png)

---

## 🚨 Hackathon Evaluator Access

To comply with **“No Mock Data”** and **“Share Test Credentials”** rules, JalVayu AI implements a secure evaluator bypass. Judges can sign in instantly without waiting for a live OTP email or SMS dispatch.

Use these **exact** credentials on the landing page or `/login`:

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

The landing page **Quick Emergency Survival Plan** (`/#quick-plan`) works **without sign-in**. Guests generate full AI plans instantly; nothing is stored on the server. **Sign in is optional** and only needed for:

- Encrypted plan history (AES-256)
- Saved location & household defaults
- Real-time dashboard alerts

### Live Weather Intelligence

| Feature | Endpoint / Component | APIs |
|---------|---------------------|------|
| **Hero weather badge** | `LiveWeatherWidget` | ipapi.co → Open-Meteo |
| **Weather checker** | `/#weather-check` → `/api/weather/briefing` | Geocode + Open-Meteo → GPT briefing |
| **Plan generation** | `/api/plan/generate` | Geocode + Open-Meteo → GPT plan |

PIN codes (e.g. `560064`, `413105`) and place names are supported via `postalpincode.in`, Open-Meteo Geocoding, and Nominatim fallback.

### True Real-Time Alerts

A parallel **Node.js + Socket.io** server (`server/server.js`) runs under **PM2** and pushes severe weather events (e.g. **Flash Flood Alerts**) over WebSockets—no page reload. Alerts render in `JuryAlertBanner`. Admin triggers require live JSON (`type`, `severity`, `headline`, `message`) with `ADMIN_SECRET`—no mock payloads.

### Enterprise Security

Sensitive fields—**location** and **special medical needs**—are encrypted at rest (**AES-256-CBC**, `lib/encryption.ts`). `ENCRYPTION_KEY` must be exactly **32 characters**.

### Offline PDF Export

**Save Offline (PDF)** uses native browser print with print-isolation CSS—only the survival plan is exported (weather context, phased checklist, travel advisories). Works on landing page and dashboard.

### No Permission Popups

IP-based geolocation for the hero weather widget—no browser geolocation prompts. Graceful fallback to Bengaluru if lookup fails.

---

## 🤖 Gen AI Services

| Service | Where Used |
|---------|------------|
| **OpenAI GPT-4o-mini** | Emergency plan generation, weather briefing analysis |
| **Google Cloud Translation** (optional) | Hindi / Kannada plan localization |
| **Open-Meteo** | Live weather + forecast (not generative; feeds GPT) |

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS |
| **Backend** | Node.js (standalone HTTP server), Socket.io |
| **Database** | MySQL, Prisma ORM |
| **AI & APIs** | OpenAI, Google Cloud Translation (optional), Open-Meteo, ipapi.co, postalpincode.in |
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
| `OPENAI_API_KEY` | GPT-4o-mini plan + weather briefing |
| `ENCRYPTION_KEY` | Exactly **32 characters** (AES-256-CBC) |
| `ADMIN_SECRET` | Admin alert trigger auth |
| `NEXT_PUBLIC_APP_URL` | e.g. `http://localhost:2510` |
| `NEXT_PUBLIC_SOCKET_URL` | Same origin or socket proxy |
| `SOCKET_PORT` | Default `3001` |
| `CORS_ORIGIN` | e.g. `http://localhost:2510` |

**Optional:** `GOOGLE_TRANSLATE_API_KEY`, SMTP / Interakt for live OTP.

> Never commit `.env`.

### 3. Initialize the database

```bash
npx prisma db push
```

### 4. Start development servers

```bash
npm run pm2:dev
```

- **Next.js** → port **2510**
- **Socket.io** → port **3001**

Or separately: `npm run dev` + `npm run dev:socket`

### 5. Test

```bash
npm test              # Jest + React Testing Library
npm run test:unit     # Vitest (52+ tests)
```

### 6. Try without login

- [http://localhost:2510/#quick-plan](http://localhost:2510/#quick-plan) — generate a plan instantly
- [http://localhost:2510/#weather-check](http://localhost:2510/#weather-check) — AI weather briefing

Sign in with **`judge@google.com`** / **`123456`** for the full dashboard.

---

## 📄 License

Private — Google PromptWars Hackathon submission.
