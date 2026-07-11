# ai.rohanbhoi.in — Modular Build Plan

Emergency preparedness AI dashboard with real-time admin alerts, built as a dual-server architecture on a CloudPanel VPS.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CloudPanel VPS                          │
│                                                             │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │  Next.js (3000)  │◄─────►│  Express + Socket.io       │   │
│  │  App Router      │ HTTP  │  (4000)                    │   │
│  │  Tailwind UI     │  WS   │  Admin triggers, events    │   │
│  └────────┬─────────┘       └────────────┬─────────────┘   │
│           │                               │                  │
│           ▼                               ▼                  │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │  /api/generate   │       │  Redis (6379)             │   │
│  │  GenAI + translate│       │  BullMQ job queue         │   │
│  └────────┬─────────┘       └────────────┬─────────────┘   │
│           │                               │                  │
│           └───────────────┬───────────────┘                  │
│                           ▼                                  │
│                ┌──────────────────┐                         │
│                │  PostgreSQL       │                         │
│                │  (Prisma ORM)     │                         │
│                └──────────────────┘                         │
│                                                             │
│  PM2 manages both processes in production                   │
└─────────────────────────────────────────────────────────────┘
```

### Already Installed

| Tool | Status | Purpose |
|------|--------|---------|
| Prisma + PostgreSQL | Ready | Persist plans, admin logs |
| Redis | Running (v7.0.15) | BullMQ backend, Socket.io adapter (optional) |
| BullMQ | Installed | Async AI jobs, translation queue |
| PM2 | Installed (v7.0.3) | Process management |
| Git + SSH | Configured | `github.com/Rohan-0707/ai.rohanbhoi.in` |

---

## Target Directory Structure

```
ai.rohanbhoi.in/
├── web/                        # Next.js App Router frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── globals.css
│   │   └── api/
│   │       └── generate/route.ts
│   ├── components/
│   │   ├── AlertBanner.tsx
│   │   ├── EmergencyForm.tsx
│   │   ├── ResultCards.tsx
│   │   └── LanguageToggle.tsx
│   ├── lib/
│   │   ├── socket.ts
│   │   └── types.ts
│   └── package.json
│
├── server/                     # Express + Socket.io backend
│   ├── index.ts
│   ├── routes/
│   │   └── admin.ts            # Hidden jury-mode trigger
│   ├── socket/
│   │   └── handlers.ts
│   └── package.json
│
├── prisma/
│   └── schema.prisma
├── ecosystem.config.cjs        # PM2 config (both apps)
├── plan.md
└── README.md
```

---

## Module 1: The Foundation & Server Skeleton

**Goal:** Two servers running in parallel, able to communicate across the VPS.

### Tasks

- [ ] Scaffold Next.js 15 with App Router, TypeScript, and Tailwind CSS inside `web/`
  ```bash
  npx create-next-app@latest web --typescript --tailwind --app --src-dir=false --import-alias "@/*"
  ```
- [ ] Scaffold Express + Socket.io server inside `server/`
  ```bash
  mkdir server && cd server && npm init -y
  npm install express socket.io cors dotenv
  npm install -D typescript tsx @types/express @types/node
  ```
- [ ] Configure ports and CORS
  - Next.js → `:3000` (public, behind CloudPanel reverse proxy)
  - Express/Socket.io → `:4000` (internal + WebSocket upgrade)
  - Allow cross-origin from `NEXT_PUBLIC_APP_URL` → `SOCKET_SERVER_URL`
- [ ] Add health-check routes on both sides
  - `GET /api/health` (Next.js)
  - `GET /health` (Express)
- [ ] Verify connectivity: Next.js server component or API route pings Express health endpoint
- [ ] Create root `ecosystem.config.cjs` with both apps defined for PM2

### Environment Variables (Module 1)

```env
# web/.env.local
NEXT_PUBLIC_APP_URL=https://ai.rohanbhoi.in
NEXT_PUBLIC_SOCKET_URL=https://ai.rohanbhoi.in:4000   # or wss:// via proxy

# server/.env
PORT=4000
CORS_ORIGIN=https://ai.rohanbhoi.in
ADMIN_SECRET=<random-long-string>
```

### Done When

- Both servers start locally without errors
- Next.js page loads with Tailwind styling
- Socket.io client connects and receives a `connected` event
- PM2 can start/stop both processes

---

## Module 2: The "Jury Mode" Alert System

**Goal:** A hidden admin trigger on the backend instantly pushes a high-visibility alert banner to every connected frontend client.

### Backend Tasks

- [ ] Create `POST /admin/jury-trigger` endpoint (protected by `ADMIN_SECRET` header or query param)
- [ ] Accept payload: `{ message: string, severity: "info" | "warning" | "critical" }`
- [ ] On hit, broadcast via Socket.io: `io.emit("jury-alert", payload)`
- [ ] Optionally persist alert to Prisma (`AlertLog` model) for audit trail
- [ ] Rate-limit endpoint (express-rate-limit) to prevent abuse

### Frontend Tasks

- [ ] Create `lib/socket.ts` — singleton Socket.io client, reconnect logic
- [ ] Build `AlertBanner.tsx`
  - Fixed/sticky top, full width, `z-50`
  - Severity-based Tailwind colors (amber/red/slate)
  - Dismiss button + auto-dismiss timer (optional)
  - Slide-down animation (`animate-in` or custom keyframes)
- [ ] Mount banner in root `layout.tsx`, listen for `jury-alert` event
- [ ] Store active alert in React state; clear on dismiss

### Prisma Model (optional, Module 2)

```prisma
model AlertLog {
  id        String   @id @default(cuid())
  message   String
  severity  String
  createdAt DateTime @default(now())
}
```

### Test Plan

```bash
curl -X POST http://localhost:4000/admin/jury-trigger \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message":"Evacuation order issued for Zone 3","severity":"critical"}'
```

Banner should appear instantly on all open browser tabs.

### Done When

- Trigger endpoint works with secret auth
- Banner renders within ~100ms of trigger on connected clients
- Unauthorized requests return 401

---

## Module 3: The Core AI Engine (API & State)

**Goal:** Accept user inputs, generate a structured emergency plan via GenAI, and manage loading/error/success states on the frontend.

### Input Schema

| Field | Type | Example |
|-------|------|---------|
| location | string | "Mumbai, Maharashtra" |
| familySize | number | 4 |
| housingType | enum | apartment / house / temporary / vehicle |

### AI Response Schema (strict JSON)

```json
{
  "emergencyChecklist": [
    { "item": "Fill water containers", "priority": "high", "category": "supplies" }
  ],
  "safetyRecommendations": [
    { "title": "Secure windows", "detail": "...", "urgency": "immediate" }
  ],
  "summary": "Brief overview of the plan"
}
```

### Backend / API Tasks

- [ ] Create `POST /api/generate` in Next.js App Router (`web/app/api/generate/route.ts`)
- [ ] Build system prompt template that injects location, family size, housing type
- [ ] Enforce JSON-only output (response_format or post-parse validation with Zod)
- [ ] Wire optional BullMQ queue for long-running generations (Redis already running)
- [ ] Store completed plans in Prisma (`EmergencyPlan` model)
- [ ] Return structured JSON or typed error (`{ error, code }`)

### Frontend State Tasks

- [ ] Define TypeScript types in `lib/types.ts` matching AI schema
- [ ] Use React state or Zustand for: `idle | loading | success | error`
- [ ] Show skeleton/spinner during generation
- [ ] Error boundary + user-friendly error messages (rate limit, invalid JSON, network)
- [ ] Parse and validate AI response before rendering

### Prisma Model

```prisma
model EmergencyPlan {
  id           String   @id @default(cuid())
  location     String
  familySize   Int
  housingType  String
  checklist    Json
  safety       Json
  summary      String
  language     String   @default("en")
  createdAt    DateTime @default(now())
}
```

### Environment Variables (Module 3)

```env
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=gpt-4o-mini
DATABASE_URL=postgresql://...
REDIS_URL=redis://127.0.0.1:6379
```

### Done When

- Form submission hits `/api/generate` and returns valid JSON
- Frontend transitions through loading → success/error correctly
- Malformed AI output is caught and surfaced gracefully
- Plans persist to PostgreSQL via Prisma

---

## Module 4: The Dashboard UI (Tailwind & Vibe Coding)

**Goal:** A clean, accessible dashboard for rapid data entry and rich result display.

### Form Component (`EmergencyForm.tsx`)

- [ ] Location input with autocomplete hint (text, required)
- [ ] Family size stepper or number input (min 1, max 20)
- [ ] Housing type radio group or select (accessible labels, keyboard nav)
- [ ] Submit button with disabled state while loading
- [ ] Mobile-first layout, max-w-2xl centered card

### Result Cards (`ResultCards.tsx`)

- [ ] **Emergency Checklist** — checkbox list, priority badges (high/medium/low), grouped by category
- [ ] **Safety Recommendations** — card grid with urgency indicators
- [ ] **Summary** — concise paragraph at top
- [ ] Empty state before first generation
- [ ] Staggered fade-in animation on results

### Multilingual Toggle (`LanguageToggle.tsx`)

- [ ] Language selector: EN, HI, MR, TA, TE (expandable)
- [ ] Secondary fast AI call (`/api/translate`) to translate the generated plan
- [ ] Cache translations in component state (avoid re-translating same content)
- [ ] Show translating spinner on toggle; fallback to English on failure

### Design Tokens

- Background: slate-950 / slate-900
- Accent: amber-500 (warnings), red-600 (critical), emerald-500 (safe/checklist)
- Typography: system font stack or Inter via `next/font`
- Spacing: generous padding, clear visual hierarchy

### Done When

- Full flow works: form → generate → display cards
- Language toggle translates all visible content
- UI is usable on mobile (375px) and desktop (1280px+)
- All interactive elements are keyboard-accessible

---

## Module 5: Final Polish & Live Deployment

**Goal:** Production-ready build on CloudPanel VPS with PM2, print support, and verified env config.

### Print-Friendly CSS

- [ ] Add `@media print` rules in `globals.css`
  - Hide nav, form, language toggle, alert dismiss buttons
  - Expand checklist with checkboxes rendered as ☐
  - Force white background, black text
  - Page-break-inside: avoid on cards
- [ ] Add "Print Checklist" button that calls `window.print()`

### PM2 Ecosystem Config

```js
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "ai-web",
      cwd: "./web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
    },
    {
      name: "ai-server",
      cwd: "./server",
      script: "node_modules/.bin/tsx",
      args: "index.ts",
      env: { NODE_ENV: "production", PORT: 4000 },
    },
  ],
};
```

### CloudPanel / VPS Checklist

- [ ] Point domain `ai.rohanbhoi.in` to VPS
- [ ] Reverse proxy `:3000` for Next.js (SSL via CloudPanel)
- [ ] Proxy WebSocket path `/socket.io` to `:4000` (critical for Jury Mode)
- [ ] Confirm Redis and PostgreSQL are running as system services
- [ ] Set all production env vars (never commit `.env`)
- [ ] Run `npm run build` in `web/` before PM2 start
- [ ] Enable PM2 startup: `pm2 startup && pm2 save`

### Pre-Launch Verification

- [ ] `curl https://ai.rohanbhoi.in/api/health` → 200
- [ ] Jury trigger fires banner on production URL
- [ ] Generate plan end-to-end with real AI key
- [ ] Print preview looks clean and readable
- [ ] PM2 restart survives server reboot

### Done When

- Site is live at `https://ai.rohanbhoi.in`
- Both PM2 processes show `online`
- All five modules pass their acceptance criteria

---

## Build Order & Dependencies

```
Module 1 ──► Module 2 ──► Module 3 ──► Module 4 ──► Module 5
(foundation)  (alerts)    (AI core)    (UI)        (deploy)
```

| Module | Depends On | Estimated Effort |
|--------|-----------|-----------------|
| 1 — Foundation | — | 2–3 hours |
| 2 — Jury Mode | Module 1 | 2–3 hours |
| 3 — AI Engine | Module 1 | 3–4 hours |
| 4 — Dashboard UI | Module 3 | 4–5 hours |
| 5 — Deploy & Polish | Modules 1–4 | 2–3 hours |

**Total estimate:** ~14–18 hours

---

## Key Commands Reference

```bash
# Development
cd web && npm run dev          # Next.js on :3000
cd server && npm run dev       # Express on :4000

# Database
npm run db:migrate             # Apply Prisma migrations
npm run db:generate            # Regenerate client
npm run db:studio              # Visual DB browser

# Production
cd web && npm run build
pm2 start ecosystem.config.cjs
pm2 status
pm2 logs

# Jury Mode test
curl -X POST http://localhost:4000/admin/jury-trigger \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test alert","severity":"warning"}'
```

---

## Risk Notes

| Risk | Mitigation |
|------|-----------|
| WebSocket blocked by proxy | Configure CloudPanel/nginx `Upgrade` + `Connection` headers for `/socket.io` |
| AI returns invalid JSON | Zod validation + retry with stricter prompt |
| Admin trigger exposed | Secret header, rate limit, IP allowlist optional |
| High AI latency | BullMQ queue + polling or SSE for async results |
| Print layout breaks | Test in Chrome/Firefox print preview early |

---

*Last updated: July 11, 2026*
