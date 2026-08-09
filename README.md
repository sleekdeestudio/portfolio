# SleekDee portfolio

Production static site for Tirth Mody / SleekDee, rebuilt from the updated design handoff as dependency-free HTML, CSS and JavaScript and published at `tirthmody.space`.

## What ships

- Responsive home, work index and eight real case-study URLs
- Shared design tokens and component styles in `styles.css`
- Accessible full-screen menu with focus trapping and Escape support
- Scroll-driven card deck, progressive content reveals and reduced-motion support
- Three optimized process videos with viewport-aware playback
- Optimized WebP project images with explicit dimensions and descriptive alt text
- Per-page titles, descriptions, canonical URLs, Open Graph cards and structured data
- `sitemap.xml`, `robots.txt`, `.nojekyll`, `CNAME`, web manifest and a custom `404.html`
- GitHub Pages deployment workflow

The contact section intentionally uses direct email, phone and profile links. GitHub Pages cannot process forms, so the prototype's unwired form was removed instead of presenting a submit action that could not reliably succeed.

## Local preview

Serve the repository root with any static server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Rebuild pages

The committed HTML is generated from `data/projects.mjs`:

```bash
npm run build
npm run check
```

## Refresh assets from the design handoff

Install dependencies, then run:

```bash
npm install
npm run prepare-assets -- "/absolute/path/to/sleekdee-site-handoff/assets"
npm run build
npm run check
```

`prepare-assets` converts project JPG/PNG files to WebP, caps oversized images at 2400px, creates the favicon/touch icon and writes the image dimension manifest used by the page generator.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the repository root on pushes to `main`. The custom domain is declared in `CNAME` as `tirthmody.space`; GitHub Pages should remain set to **GitHub Actions** with HTTPS enforcement enabled.
