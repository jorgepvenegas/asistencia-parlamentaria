---
description: All per-package lint/test commands must use pnpm -F <package-name> to scope execution to the intended package
type: pattern
status: active
created: 2026-02-19
---

# pnpm -F flag is required to scope commands to individual packages

Running `pnpm lint` or `pnpm test` from the root runs the full suite. To target one package, always use `-F @quienatiende/<package>`:

```
pnpm -F @quienatiende/frontend lint test
pnpm -F @quienatiende/api lint test
pnpm -F @quienatiende/shared test
```

Omitting `-F` will run root-level scripts or fail silently depending on the script. This is a common gotcha in pnpm workspaces.

---

Relevant Records:
- [[monorepo uses pnpm workspaces with four packages]] — the workspace structure that makes this necessary

Topics:
- [[architecture-map]]
