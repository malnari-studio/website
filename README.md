# malnari.com

Static website for Malnari Studio, served by GitHub Pages. No build step.

## Deploy

Push to `main`. GitHub Pages serves the repo root (Settings → Pages → Deploy from a branch →
`main` / `/ (root)`). `CNAME` sets the custom domain `malnari.com`.

## DNS (at the domain registrar)

- Apex `malnari.com`: `A` records → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`,
  `185.199.111.153`
- `www`: `CNAME` → `<github-user>.github.io`

Then enable "Enforce HTTPS" in Settings → Pages.

## Layout

This repo lives inside the private app monorepo folder as `website/` but is its own git repo;
the monorepo ignores it via `.gitignore`.
