---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/RoomEntry.tsx","src/components/Scoreboard.tsx"]
---

Scope: the room entry and public live-scoreboard surface in `src/App.tsx`. Visitor mode: Operate.

Audience and job: spectators, organizers, and demo presenters enter a public room code and keep a read-only auction view open across presentation displays, laptops, or phones.

Task and content: make the room phase, current player, leading bid, team standings, latest event, and nullable published results understandable within seconds. Preserve explicit loading, room-not-found, valid-empty, recoverable transport error, and fatal render recovery.

Chosen direction: The Auction Scorer's Ledger. Unbleached paper, iron rules, and one vermilion signal translate a physical cricket scorebook into a broadcast surface. The memorable moment is the active player's name filling the auction field while the latest bid is recorded beneath it like a scored entry.

Constraints: no invented producer fields, no private room data, no decorative card grid, no broad CORS dependency, and no loss of information on narrow screens. Fixture data is synthetic.
