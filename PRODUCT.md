# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Inferred from the implementation brief: Code Premier League spectators, organizers, and demo presenters who need to join a public room and follow the auction without using the producer application.

## Product Purpose

Provide a standalone, broadcast-style live scoreboard for a Code Premier League room. Success means a viewer can enter a room code, immediately understand the auction state, compare team standings, and see published results.

## Positioning

The scoreboard is a read-only consumer of a compact public room feed. It is independently deployable, uses a same-origin proxy for local integration, and retains deterministic fixture scenarios for demos and visual development.

## Operating Context

The surface runs in a browser on presentation displays, laptops, and phones. A viewer joins by room code, then leaves the dashboard open while it polls for updates.

## Capabilities and Constraints

- React, Vite, and TypeScript.
- Room-code entry and a responsive scoreboard dashboard.
- Loading, empty, recoverable error, active auction, team standings, latest event, and published results states.
- Exact public producer contract from `GET /api/rooms/:roomCode/public-feed`, including the success/error envelope, room metadata, current auction, sorted team summary, latest event, and nullable published results.
- Browser requests use a same-origin Vite development proxy. The default local producer upstream is `http://localhost:3000` and must remain configurable.
- Public feed requests do not send credentials and bypass browser caches.

## Evidence on Hand

The producer contract is fixed by the Code Premier League public-feed endpoint. No production room data, branding assets, customer claims, or private producer fields are included. Fixture data is synthetic and exists only for deterministic development and tests.

## Product Principles

- Make the current room state legible at broadcast distance.
- Keep entry simple and recovery explicit.
- Treat producer data as authoritative while keeping the consumer resilient to loading and transport failures.
- Validate the public response at one adapter boundary so UI components remain independent of transport details.
- Keep fixture scenarios deterministic and first-class.

## Accessibility & Inclusion

Use semantic HTML, visible focus states, sufficient contrast, reduced-motion support, and responsive layouts that preserve the same information on narrow screens.
