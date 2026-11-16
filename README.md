# UniSat Wallet Demo

A developer-facing DApp for testing UniSat Wallet account access, signing,
transactions, Bitcoin assets, RGB, and WebRGB APIs.

## Development

Use Node.js 22.12 or newer and pnpm 10.11.0.

```bash
pnpm install --frozen-lockfile
pnpm start
```

The Vite development server runs at [http://localhost:5173](http://localhost:5173)
and reloads the page when source files change.

## Tests

Run the Vitest suite once:

```bash
pnpm test
```

Use `pnpm test:watch` for interactive watch mode.

## Production Build

```bash
pnpm build
pnpm preview
```

The optimized static site is written to `build`. Deploy that directory instead
of exposing the development or preview server.

## Production Security Headers

Vite injects a baseline Content Security Policy into production builds. The
hosting layer should additionally send these response headers because
anti-framing directives cannot be enforced through an HTML meta tag:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https: wss:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
