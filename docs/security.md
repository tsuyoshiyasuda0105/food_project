# Security Notes

## Production secrets

- Keep `.env.local` out of Git. The repository `.gitignore` already excludes `.env` and `.env.*`.
- Set `ADMIN_API_TOKEN` in Vercel Environment Variables for Production, Preview, and Development if admin APIs should be usable.
- Use a long random value for `ADMIN_API_TOKEN` and rotate it if it is ever shared.

## Admin APIs

The following endpoints require `Authorization: Bearer <ADMIN_API_TOKEN>` in production:

- `/api/admin/sync`
- `/api/scraping/schedule`
- `/api/local-archive/status`

If `ADMIN_API_TOKEN` is missing in production, these endpoints return `401` and do not expose local paths, scheduler state, or database sync actions.

## Browser hardening

`next.config.mjs` adds security headers for all routes:

- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

The CSP keeps inline scripts/styles enabled because Next.js and the LP structured data currently require them. Tighten this later with nonces if the app moves to a stricter auth model.

## Admin screen usage

Open the admin screen, paste the same `ADMIN_API_TOKEN`, and press save. The token is stored only in `sessionStorage`, so it disappears when the browser session ends.
