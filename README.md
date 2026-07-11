# JalVayu AI

Monsoon preparedness PWA — [ai.rohanbhoi.in](https://ai.rohanbhoi.in)

## Testing

```bash
npm test
```

Uses **Jest** + **React Testing Library** with `jsdom`:

- `__tests__/Home.test.tsx` — landing page hero heading
- `__tests__/AlertBanner.test.tsx` — `JuryAlertBanner` when alert is active

Config: `jest.config.ts` (Next.js `next/jest` wrapper).
