# Coolify Static SPA

This project is ready to deploy as a static SPA.

Build command:
```
pnpm install
pnpm run build
```

Output directory:
```
dist/spa
```

Notes:
- Enable SPA fallback (rewrite to /index.html) in Coolify's static settings.
- If you ever need the Express server build, run `pnpm run build:full`.
