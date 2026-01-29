# @quienatiende/shared

Shared utilities & RPC client for QuienAtiende.

## Build

Hybrid build setup uses:

- **esbuild** - Bundles TS → JS + env var injection
- **tsc** - Generates type declarations only

```bash
pnpm build
```

### Environment Configuration

Set `BASE_URL_API` in `.env` (default: `http://localhost:8787`):

```env
BASE_URL_API=http://localhost:8787
```

Build-time injection means the URL is embedded in the final JS bundle - consumers don't need to pass it.

## Usage

### Pre-configured Client (Recommended)

```ts
import { client } from '@quienatiende/shared';

const data = await client.api.parties.$get();
```

### Custom URL (Fallback)

```ts
import { createClient } from '@quienatiende/shared';

const client = createClient('https://api.example.com');
```

## Exports

- `client` - Pre-configured RPC client with BASE_URL_API
- `createClient(baseUrl)` - Factory for custom URLs
- `Client` - Type for RPC client instance
