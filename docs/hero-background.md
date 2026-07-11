# Hero Background Images

The landing page hero (`components/landing/CinematicHero.tsx`) uses responsive background images so mobile and desktop each get an asset suited to their aspect ratio.

## Assets

| Breakpoint | File | Source | Dimensions | Usage |
|------------|------|--------|------------|-------|
| Mobile (`< md`) | `public/monsoon-hero-bg-mobile.png` | Root `image.png` | 941 × 1672 (portrait) | Full-bleed hero on phones |
| Desktop (`md+`) | `public/monsoon-hero-bg.jpg` | Root `hero.png` | Landscape | Full-bleed hero on tablets and desktop |

## Implementation

Two stacked `next/image` layers sit inside an `absolute inset-0` container:

- **Mobile image** — `className="object-cover md:hidden"`
- **Desktop image** — `className="hidden object-cover md:block"`

Both use `fill`, `priority`, and `sizes="100vw"`.

Dark gradient overlays sit above the images (`slate-900` tints) so headline text and the glassmorphism login card remain readable.

## Updating images

1. Replace `public/monsoon-hero-bg-mobile.png` for mobile (keep portrait orientation).
2. Replace `public/monsoon-hero-bg.jpg` for desktop (landscape works best).
3. Restart the dev server: `pm2 restart jalvayu-dev-web`

No code changes are required unless filenames change — update the `src` paths in `CinematicHero.tsx` if they do.
