---
id: 2026-06-17-cors-origin-configuration-boundary
title: "CORS Origin Configuration Boundary"
date: 2026-06-17
topic: ai-triage
type: decision
status: active
source:
  - ../API.md
  - ../python_api/README.md
  - ../python_api/triage_contract.py
  - ../python_api/main.py
  - ../source/2026-06-08-imedtac-teams-cors-preflight-block/source.md
  - ../handoff/2026-05-25-imedtac-integration-next-steps.md
---

# CORS Origin Configuration Boundary

## First Principle

The scarce resource is integration trust during the imedtac browser-direct
rehearsal. CORS should remain predictable for the externally discussed local
test origins, while still giving NYCU a fast deployment control if imedtac's
formal machine reports a different browser `Origin`.

The CORS allowlist is therefore a browser-origin compatibility control, not a
new API endpoint, payload field, authentication rule, or clinical behavior.

## Decision

`DEMO_ALLOWED_ORIGINS` is optional. Render does not need this environment
variable when imedtac's browser calls the API from one of the Python runtime's
default local test origins:

```text
http://localhost
http://localhost:5174
http://127.0.0.1
http://127.0.0.1:5174
```

The environment variable exists as a deployment extension point for exact
origins that cannot be known safely at code-writing time, such as a LAN IP,
another port, HTTPS test domain, or WebView origin.

## Compatibility

The current Python/FastAPI runtime preserves the same browser-direct operating
scope that was used in the earlier JavaScript backend: the backend echoes
`Access-Control-Allow-Origin` only when the request `Origin` is in the
allowlist. Unknown origins still receive the preflight status response without
being granted browser access.

This does not change:

- endpoint paths;
- request or response JSON shape;
- bearer-token header format;
- preflight exemption from bearer-token checks;
- `staff_review_summary` behavior;
- doebow `Question_DB/` runtime content;
- the imedtac two-endpoint MVP contract.

## Operating Rule

Use no Render `DEMO_ALLOWED_ORIGINS` value for the default local rehearsal path.
Add `DEMO_ALLOWED_ORIGINS` only after imedtac confirms the actual browser
`Origin` header and that value is not one of the defaults.

Do not use `*` wildcard. The demo API may be bearer-token protected and should
keep a bounded browser surface.

## Verification

The Python contract tests now cover:

- `localhost:5174` preflight;
- `127.0.0.1:5174` preflight for sessions and answers;
- unknown origins not being echoed;
- configured exact origins being echoed;
- wildcard configuration being ignored;
- bearer-auth errors still carrying CORS headers for allowed origins.

The runtime verification for the commit set ending at `c86a269` passed:

```text
npm run test:python
npm run smoke
npm run demo:ready
git diff --check
```

## Next Gate

For imedtac testing, ask for the exact browser `Origin` visible in DevTools
only if a CORS block recurs. If the origin is already covered by the defaults,
the next diagnostic layer should move to bearer-token delivery, stale frontend
bundle/cache, request payload shape, or Render logs.
