# Testing

JalVayu AI uses [Vitest](https://vitest.dev/) for unit tests covering core business logic.

## Run tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage report:

```bash
npm run test:coverage
```

## What is covered

| Area | Tests |
|------|-------|
| Plan validation | `lib/plan-validation.test.ts` — location, family size, housing, language |
| AI response schema | `lib/types/plan.test.ts` — checklist/recommendations JSON guard |
| Auth / OTP | `lib/auth.test.ts`, `lib/auth/login-identifier.test.ts` |
| Phone parsing | `lib/phone/parse-for-interakt.test.ts` |
| Housing enums | `lib/housing.server.test.ts` |
| Languages | `lib/languages.test.ts` |
| Google Translate helpers | `lib/housing.server.test.ts` — availability + no-op paths |

CI runs `npm test` and `npm run lint` on every push to `main` via `.github/workflows/ci.yml`.
