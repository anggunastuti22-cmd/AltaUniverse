# Alta Universe — Design Handoff Requirements

> Status: Draft 1 (architecture & planning phase)
> Last updated: 2026-06-18

This document defines what design must deliver for engineering to build Alta
Universe consistently across web, mobile, and admin. It is a requirements
contract, not the visual design itself.

## 1. Brand & tone

- **Feel:** calm, premium, accessible. Low visual noise; generous whitespace.
- **Voice:** reflective, supportive, never judgmental or clinical.
- **Three domains, one family:** AltaMind, AltaWear, AltaLab should feel
  distinct yet clearly part of one universe (shared layout, type, motion; domain
  accent differentiation).

## 2. Design tokens (single source of truth)

Design must deliver tokens that map directly to `packages/design-tokens`:

- **Color:** base palette + semantic roles (background, surface, text, border,
  success/warn/error) + one accent per domain (mind/wear/lab) + a universe
  accent. Must meet contrast requirements (see accessibility).
- **Typography:** type scale, families, weights, line heights, responsive
  steps.
- **Spacing:** consistent spacing scale.
- **Radii, elevation/shadow, borders.**
- **Motion:** durations and easing for standard transitions.
- **Light and dark themes** for every token.

Tokens are platform-neutral so both web (Next.js) and mobile (RN) consume the
same values.

## 3. Component inventory (for `packages/ui`)

Reusable, accessible primitives required for MVP:

- Buttons (primary/secondary/ghost/destructive), inputs, textareas, selects,
  toggles, checkboxes, radio, date pickers.
- Cards, list items, empty states, badges/tags, chips.
- Navigation (web nav + mobile tab/stack patterns), headers, modals/sheets.
- Forms with inline validation and error states.
- Feedback: toasts, loading/skeletons, confirmation dialogs.
- Domain-specific composites: check-in widget, journal editor, outfit composer,
  cabinet/product card, routine step list, observation entry, cost-per-wear and
  routine-cost displays.

Each component must specify: states (default/hover/focus/active/disabled/
loading/error), responsive behavior, and accessibility notes.

## 4. Accessibility (mandatory)

- Target **WCAG 2.1 AA**.
- Color contrast: ≥ 4.5:1 for body text, ≥ 3:1 for large text/UI components.
- Full keyboard operability; visible focus states on all interactive elements.
- Semantic structure and ARIA where needed; screen-reader labels for icons.
- Touch targets ≥ 44×44 pt on mobile.
- Respect reduced-motion and OS theme/text-size settings.
- Forms: associated labels, clear error messaging, no color-only signaling.

## 5. Responsive design

- **Web:** mobile-first; defined breakpoints for small/medium/large; layouts
  must work from ~320px up to large desktop.
- **Mobile (RN):** optimized for capture; thumb-friendly; supports common
  device sizes and safe areas.
- **Admin:** desktop-first (operator workflows) but must remain usable on
  tablet.

## 6. Surface-specific guidance

- **Public web:** marketing/editorial layouts, article templates, domain
  landing pages; performance and SEO friendly.
- **App web:** Alta Home dashboard, three workspaces, account/privacy centre;
  dense but calm information design.
- **Mobile:** capture flows (check-in, journal, outfit/skin logging),
  reminders, notification centre; minimal taps to log.
- **Admin:** content/catalogue/program management, analytics dashboards,
  support tools; clearly distinct visual treatment from user surfaces.

## 7. Content & privacy in design

- Private content screens must never expose data to non-owners in any shared/
  demo state.
- Empty states should encourage gentle, mindful engagement — no dark patterns,
  no streak pressure, no consumption nudges.
- AI features (when added) must be visibly labeled and opt-in in the UI.

## 8. Deliverables checklist

- [ ] Token set (color/type/spacing/radii/elevation/motion) for light + dark.
- [ ] Component library covering the inventory above, with all states.
- [ ] Responsive layouts for key screens on each surface.
- [ ] Accessibility annotations (contrast, focus order, labels).
- [ ] Iconography set with text alternatives.
- [ ] Empty/loading/error states for primary flows.
- [ ] Domain differentiation guidelines (accents, but one family).

## 9. Handoff format

- Tokens delivered in a structured, code-mappable format (e.g., JSON/Style
  Dictionary) so they can be imported into `packages/design-tokens` without
  manual transcription.
- Components specified with redlines/specs that engineers can implement once in
  `packages/ui` and reuse everywhere.
