# KYC UX

Redesigned personal and corporate KYC verification flows for web and mobile. Built as a pnpm monorepo with shared validation and mocked verification APIs.

---

## Why this redesign

The previous flow worked, but users lost orientation once they left the overview screen. This redesign keeps the same data requirements (BVN, NIN, CAC, address, face) while fixing the main UX gaps:

| Gap in the old flow                | What we do now                                                  |
| ---------------------------------- | --------------------------------------------------------------- |
| Progress only on the overview      | Persistent step indicator on every screen                       |
| Bare “Personal / Corporate” list   | Decision screen with what’s required and how long it takes      |
| Weak field feedback                | Live validation with success/error before Continue              |
| No explanation of sensitive fields | Expandable “Why do we need this?” help                          |
| Camera opens cold                  | Face priming screen + clear permission / retry states           |
| Manual CAC type toggle only        | Auto-detect RC vs business name, toggle as fallback             |
| Refresh lost progress              | Draft persistence (localStorage on web, AsyncStorage on mobile) |
| No way to revisit a step           | Click completed steps in the progress bar to jump back          |

Face verification is intentionally **last**, after identity data is collected and checked.

---

## Account paths

### Personal (~3 min, 4 steps)

1. **Identity** — BVN (11 digits) + date of birth
2. **NIN** — must align with the BVN provided
3. **Address** — street, city, state (postal code optional)
4. **Face** — priming tips → camera capture → stubbed verify

### Corporate (~5 min, 4 steps)

1. **Business registration** — CAC number; type auto-detected when possible
2. **Principal** — director/owner BVN + date of birth
3. **Business address** — street, city, state
4. **Face** — priming → camera → stubbed verify for the principal

Routes are only the account branch:

- `/` — choose account
- `/personal` — personal wizard (step lives in draft state)
- `/corporate` — corporate wizard

There are no per-step URLs. That keeps the funnel gated and avoids shareable deep links into half-finished KYC.

---

## Features

### Progress & navigation

- **Step progress bar** on every inner screen (`Step X of 4 — …`)
- Completed steps show a checkmark and are **clickable** to jump back and edit
- Upcoming steps stay locked until reached
- Jumping back keeps later completed steps marked done and clickable

### Account selection

- Clear cards for Personal vs Corporate
- Effort cues: step count and approximate time
- Short copy of what each path needs
- Trust note: information is only used for verification

### Forms & validation

- BVN / NIN: digit filtering, `n/11` counter, inline success or error
- Continue disabled until the step is valid
- DOB: native / accessible date picker; future dates blocked
- Address: required street, city, state
- CAC: format validation; RC vs BN detection from the number when unambiguous

### Contextual help

Expandable **“Why do we need this?”** next to BVN, NIN, and face — one-sentence purpose, dismissible inline (not a blocking modal).

### Face verification

1. Priming screen (lighting, remove glasses/mask, hold still)
2. Camera permission request with clear denied / unavailable messaging
3. Capture + stubbed `verifyFace` call
4. Retry-friendly failure copy (e.g. better lighting)

Biometric vendor SDKs (Smile ID, VerifyMe, etc.) are **not** wired yet — the capture → `verifyFace(photo)` integration point is ready to swap.

### Save & resume

- Personal and corporate drafts are stored **separately**
- Web: `localStorage`
- Mobile: `AsyncStorage` via `configureDraftStorage()`
- Refresh / app relaunch resumes the active flow
- Completing “Done” clears that path’s draft

### Platform-specific UX

**Web**

- Two-column layout: form + live summary of entered details
- Collapses to a single column on smaller screens
- Tailwind CSS v4
- Webcam via `getUserMedia`

**Mobile (Expo)**

- Single-column layout with safe areas and keyboard avoidance
- NativeWind (Tailwind for React Native)
- `expo-camera` for face capture
- Native date picker
- Haptics on validation success / error
- Expo Router for `/`, `/personal`, `/corporate`

---

## Repo structure

```
kyc-ux/
  apps/
    web/                 # React + Vite + React Router
    mobile/              # Expo + Expo Router + NativeWind
  packages/
    validation/          # @kyc/validation — Zod schemas & field helpers
    api-client/          # @kyc/api-client — mocked verify* + draft store
  package.json
  pnpm-workspace.yaml
```

Shared packages are consumed as `workspace:*`. No publish step needed.

---

## Getting started

Requirements: Node 20+, pnpm 9+.

```bash
pnpm install

# build shared packages (needed for mobile Metro resolution)
pnpm --filter @kyc/validation build
pnpm --filter @kyc/api-client build

# web
pnpm dev                 # http://localhost:5173

# mobile
pnpm dev:mobile          # Expo; use iOS Simulator / Android / Expo Go
```

Useful scripts:

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Start the web app                             |
| `pnpm dev:mobile` | Start Expo                                    |
| `pnpm typecheck`  | Typecheck all packages                        |
| `pnpm build`      | Build all packages that define a build script |

---

## Tech stack

| Layer         | Web                         | Mobile                               |
| ------------- | --------------------------- | ------------------------------------ |
| UI            | React 19, Vite, Tailwind v4 | Expo 57, React Native, NativeWind v4 |
| Routing       | React Router                | Expo Router                          |
| Validation    | `@kyc/validation` (Zod)     | same                                 |
| API stubs     | `@kyc/api-client`           | same                                 |
| Draft storage | `localStorage`              | `AsyncStorage`                       |
| Camera        | Browser `getUserMedia`      | `expo-camera`                        |

---

## What’s stubbed vs real

**Stubbed (replace when integrating vendors)**

- `verifyBvn`, `verifyNin`, `verifyCac`, `verifyFace`, `saveAddress`
- Face “match” randomly fails ~15% of the time so retry UX can be demoed

**Real in this repo**

- Full wizard UX and navigation
- Client-side validation rules
- Camera capture pipeline
- Cross-refresh draft persistence

---

## Design notes

- Brand accent: coral/orange (`#e85d3b`), light canvas background
- Web uses DM Sans; mobile uses system fonts with the same color tokens
- Progress and primary actions use a pointer cursor where clickable
- Validation never relies on color alone (icons + text)

---
