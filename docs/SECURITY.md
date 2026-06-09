# Security

Defense-in-depth appropriate for an internal monitoring dashboard. The app
renders data and holds no user-authored content, so the main risks are XSS,
clickjacking, and secret leakage — all addressed below.

## Content-Security-Policy (per-request nonce)

`middleware.ts` sets a fresh nonce per request and a strict CSP in production:

```
default-src 'self';
script-src 'self' 'nonce-<random>' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
font-src 'self';
img-src 'self' data:;
connect-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests;
```

- **No `unsafe-inline` / `unsafe-eval` for scripts in production.** The only
  inline script (theme bootstrap) carries the request nonce; Next's own scripts
  inherit it, and `strict-dynamic` lets them load the rest.
- Development relaxes `script-src` (eval + ws) for HMR only.
- Fonts are self-hosted via `next/font` — no third-party origins in the policy.
  `style-src` allows `unsafe-inline` only for the small set of inline style
  attributes; styles are not an injection sink here.

## HTTP security headers

Set for every response in `next.config.mjs`:

| Header | Value | Purpose |
| --- | --- | --- |
| `X-Content-Type-Options` | `nosniff` | block MIME sniffing |
| `X-Frame-Options` | `DENY` | anti-clickjacking (+ `frame-ancestors 'none'`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | limit referrer leakage |
| `Permissions-Policy` | camera/mic/geo/topics off | drop unused capabilities |
| `Strict-Transport-Security` | 2y, preload | force HTTPS |
| `X-Powered-By` | *removed* (`poweredByHeader: false`) | reduce fingerprinting |

## Secrets & the server/client boundary

- `lib/env.ts`, `data-source.ts`, and `api-client.ts` import `server-only`:
  the build **fails** if they're ever pulled into a client bundle.
- API base URL and token are read server-side and never prefixed
  `NEXT_PUBLIC_`, so they cannot reach the browser.
- `.env.local` is git-ignored; only `.env.example` (no secrets) is committed.

## Output safety

- All dynamic values render through React/JSX, which escapes by default.
- The single `dangerouslySetInnerHTML` is a **static, app-controlled** constant
  (the theme bootstrap) — no interpolation of external data.

## Dependencies

- Pinned Next.js patched against the known advisory (see README).
- Run `npm audit` in CI; treat high/critical as release blockers.

## Recommended for deployment

- Put the app behind the corporate SSO/identity proxy (it has no built-in
  auth — it's a read-only internal view).
- Terminate TLS at the edge; HSTS assumes HTTPS.
- Forward the API token from a secrets manager, not the image.
