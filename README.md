# CPL Live Scoreboard

A standalone, read-only broadcast view for Code Premier League public rooms. The app polls the producer's compact public feed through a same-origin Vite proxy and keeps deterministic fixtures available for tests and local demos.

## Run locally

Requirements: Node.js 22.12.x, 24.x, or 26+ and npm 11+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, enter a room code, and leave the dashboard open. The default producer upstream is `http://localhost:3000`.

To point the Vite proxy at another producer:

```bash
CPL_UPSTREAM_URL=http://localhost:3001 npm run dev
```

The browser always requests the same-origin endpoint:

```text
GET /api/rooms/:roomCode/public-feed
```

Vite's proxy is a development convenience. A production deployment must route `/api` to the Code Premier League producer with the same path.

## Fixture desk

Use either the environment flag or the runtime query parameter:

```bash
VITE_CPL_FIXTURE_MODE=true npm run dev
```

```text
http://localhost:5173/?fixture=1
```

Available room codes:

| Code | State |
| --- | --- |
| `LIVE24` | Active auction, standings, and latest bid |
| `RESULTS` | Published final rankings and scores |
| `EMPTY` | Valid waiting room with no teams |
| `ERROR` | Recoverable feed failure |

Unknown fixture codes render the room-not-found state. Set `VITE_CPL_POLL_INTERVAL_MS` to change the default 3,000 ms polling interval; values below 1,000 ms are ignored.

## Contract boundary

- `src/api/contract.ts` is the typed public response for `GET /api/rooms/:roomCode/public-feed`.
- `src/api/adapter.ts` validates the response and maps it to the UI-owned model.
- `src/api/client.ts` owns the endpoint, `no-store` request behavior, error mapping, and fixture/live selection.
- `src/hooks/useRoomFeed.ts` owns polling, cancellation, manual retries, and stale-data preservation.

The public feed intentionally contains no credentials, participant IDs, bid history, quiz data, score breakdowns, idempotency records, or internal snapshot fields. Results remain `null` until publication.

## Validation

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
