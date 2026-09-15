---
name: CPL Live Scoreboard
description: A ruled cricket scorebook translated into a responsive live broadcast surface.
colors:
  paper: "#eee6d5"
  paper-deep: "#d9cfba"
  ink: "#17140f"
  ink-muted: "#625c50"
  vermilion: "#b93623"
  vermilion-dark: "#872416"
typography:
  display:
    fontFamily: "Avenir Next, Avenir, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "clamp(3.4rem, 7vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Avenir Next, Avenir, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "Avenir Next, Avenir, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 850
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  square: "0"
spacing:
  rule: "1px"
  field: "16px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.vermilion}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "12px 16px"
  input-room-code:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    height: "64px"
---

# Design System: CPL Live Scoreboard

## Overview

**Creative North Star: "The Auction Scorer's Ledger"**

The interface treats the public room as a live scorebook under a broadcast desk lamp: authoritative, quickly scanned, and visibly updated without becoming a conventional analytics dashboard. The active player and bid own the field; standings and event history remain ruled supporting registers.

**Key Characteristics:**

- One dominant auction field, not a grid of equal cards.
- Square geometry and device-pixel rules throughout.
- Vermilion is reserved for live state, recovery, rank, and final certification.
- Printed marks communicate state without decorative iconography.
- Responsive layouts drop columns rather than shrinking critical type.

## Colors

The palette uses unbleached paper, iron ink, and a single signal color.

- **Scorebook Paper** (`#eee6d5`): Primary page and control ground.
- **Ledger Backing** (`#d9cfba`): Browser surround and subtle depth.
- **Iron Ink** (`#17140f`): Primary text, rules, and inactive state.
- **Pencil Note** (`#625c50`): Secondary labels and timestamps.
- **Auction Vermilion** (`#b93623`): Live state and primary action.
- **Stamped Vermilion** (`#872416`): Accessible accent text and hover state.

**The One Signal Rule.** Vermilion marks information that is live, actionable, ranked, or officially final; it is never ambient decoration.

## Typography

One workhorse sans family carries display, labels, and data. Weight, measure, and tabular numerals create hierarchy without mixing type families.

- **Display** (900, up to 6rem, 0.86): Active player and winning team only.
- **Heading** (850, 1.5rem, 1.15): Room title and state-page titles.
- **Body** (500–650, 1rem, 1.6): Instructions and event copy.
- **Ledger Label** (800–850, 0.58–0.78rem): Uppercase register headings and state marks.
- **Figures:** Use tabular numerals for bids, balances, versions, ranks, and times.

## Layout

The desktop broadcast grid gives the auction roughly two-thirds of the primary row and the team register the remainder. Latest event spans the full width beneath them. At 900px, the surface becomes a single ruled column; at 620px, bid cells and metadata resolve into two-column or stacked registers while all primary type retains broadcast scale.

## Elevation & Depth

The application is flat and rule-driven. Shadows are limited to isolated fatal/error sheets, where a 10px by 12px soft offset distinguishes the recovery layer from the scorebook ground.

## Shapes

All controls, registers, and state marks are square. Borders are one device-pixel except the two-pixel primary ledger divisions. Avoid pills, rounded cards, and floating soft panels.

## Components

- **Primary button:** Solid vermilion, square, uppercase, and at least 48px tall.
- **Text action:** Ink text with a one-pixel underline; vermilion on hover.
- **Room input:** 64px ruled field with uppercase, widely tracked code text.
- **Room register:** Three ruled cells for code, state, and feed version.
- **Auction board:** A large player field followed by bid and lot metadata registers.
- **Team register:** Ordered rows preserving producer sort order, with operator display name secondary.
- **Status pages:** One oversized printed mark, direct recovery copy, and explicit action.

## Do's and Don'ts

- Do preserve producer order and exact public-feed semantics.
- Do keep live and recoverable state visible without hiding confirmed data.
- Do maintain full keyboard focus and reduced-motion behavior.
- Don't introduce decorative gradients, glow, glass, or rounded dashboard cards.
- Don't use vermilion for inactive decoration.
- Don't compress the player name or results winner below readable broadcast scale.
