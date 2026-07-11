# Testing

JalVayu AI uses **Jest** + **React Testing Library** for component tests and **Vitest** for unit tests.

## Run tests

```bash
npm test
```

Component/integration tests (Jest):

```bash
npm test
npm run test:jest:watch
```

Unit tests (Vitest):

```bash
npm run test:unit
```

## Jest component tests (`__tests__/`)

| File | Coverage |
|------|----------|
| `__tests__/Home.test.tsx` | Landing page hero heading |
| `__tests__/AlertBanner.test.tsx` | `JuryAlertBanner` severe weather alert UI |

## Vitest unit tests (`lib/**/*.test.ts`)
