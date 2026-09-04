# Contract: Accessible UI Surface

The stable role + accessible-name surface that Playwright specs (FR-057) and
assistive technology depend on. Rewrite e2e selectors against **this**, not CSS
classes or DOM ids. If markup changes, this file changes with it — in the same
PR.

## Landmarks & headings

| Region | Role / element | Accessible name |
|---|---|---|
| App header / HUD | `banner` (`<header>`) | — |
| Primary nav | `navigation` | "Game navigation" |
| Screen body | `main` | — |
| Every screen | one `h1` | screen title (see below) |
| Live status | `status` (`aria-live="polite"`) | — |

Screen `h1` names: Intro → "Welcome to the Studio"; Studio → "Chromatic Mastery
Studio"; Station → the station name (e.g. "Light Laboratory"); Puzzle → the
puzzle title (e.g. "Create White Light"); Collection → "Chromatic Pet
Collection"; Grand Canvas → "Grand Canvas".

## Controls by screen

### HUD (persistent)
| Element | Role | Name |
|---|---|---|
| Score readout | `status` text | contains the number; label "Score" |
| Pets readout | `status` text | "Pets collected: N of 22" |
| Streak readout | `status` text | "Streak: N" (hidden when not applicable) |
| Menu trigger | `button` | "Menu" |
| Menu items | `menuitem` | "Reset run", "Replay intro", "Feedback"; dev/e2e only: "Auto solve journey" |

### Intro screen
| Element | Role | Name |
|---|---|---|
| Enter | `button` | "Enter the Studio" |
| Skip | `button` | "Skip" |

### Studio screen
| Element | Role | Name |
|---|---|---|
| Station card | `article` or `group` containing a heading | station name |
| Enter/Continue | `button` (within the card) | "Enter <station>" / "Continue <station>" |
| Locked station | `button` `aria-disabled` OR non-interactive with text | name + "Locked — finish previous stations" |
| Recommended next | `link`/`button` | "Recommended: <station or puzzle>" |
| Open collection | `link`/`button` | "View pet collection" |

### Station screen
| Element | Role | Name |
|---|---|---|
| Back to Studio | `button`/`link` | "Back to Studio" |
| Puzzle list item | `listitem` with a heading | puzzle title |
| Play/Continue puzzle | `button`/`link` | "Play <title>" / "Continue <title>" / "Practice <title>" (solved) |
| Locked puzzle | non-interactive | title + "Locked" |
| Next station CTA (when complete) | `button`/`link` | "Go to <next station>" |

### Puzzle screen
| Element | Role | Name |
|---|---|---|
| Learning intro "start" | `button` | "Start quiz" |
| Quiz option | `radio`/`checkbox` | the option text |
| Quiz submit | `button` | "Submit quiz" |
| Info card opener | `button` | "How this works" |
| Puzzle controls | `slider` / `combobox` / `checkbox` / `button` | each individually labelled |
| Check | `button` | "Check" |
| Result panel | `alert` or `status` region | starts with "Correct" / "Not quite" |
| Retry | `button` | "Try again" |
| Continue after solve | `button` | "Continue" |
| Reward/pet reveal | `img` | "<pet name> collected" |

### Collection screen
| Element | Role | Name |
|---|---|---|
| Pet (unlocked) | `img` inside a focusable `button`/`group` | "<pet name> — from <station>" |
| Pet (locked) | `img` | "Locked pet — solve <puzzle/station> to reveal" |

### Grand Canvas screen
| Element | Role | Name |
|---|---|---|
| Stats | `status`/text | "Puzzles solved: N", "Pets rescued: N", "Best streak: N" |
| Return | `button` | "Return to Studio" |
| Review/practice | `button` | "Review & practise puzzles" |

### Info modal
| Element | Role | Name |
|---|---|---|
| Dialog | `dialog` (modal, focus-trapped) | the puzzle title |
| Close | `button` | "Close" |
| Chroma Tree (puzzle-06 only) | `button` | "Open Chroma Tree explorer" |

## Behavioural guarantees (asserted by tests)

- **Keyboard**: Studio → station → learning gate → puzzle → Check → Continue →
  next station → Grand Canvas is completable with Tab / Shift+Tab / Enter / Space
  / arrow keys only; a visible focus ring is present at every stop (SC-006).
- **Dialog**: opening the info modal traps focus; `Escape` closes it; focus
  returns to "How this works" (US7-3).
- **Live region**: solving, failing (with the specific reason), unlocking a
  station, and collecting a pet each produce a `status` announcement (FR-036).
- **No colour-only state**: locked/solved/success/failure each carry an icon +
  text, verified by querying for the text/role not the colour (FR-035, SC-008).
- **No horizontal page scroll** at 320 px on every screen; wide strips scroll in
  their own container (FR-054, SC-007).
- **Reduced motion**: with `prefers-reduced-motion: reduce` emulated, no screen
  has a looping animation and the celebration is a static state (SC-009).

## Contrast matrix (WCAG AA — verified T093, 2026-09-02)

Ratios computed from `design-system/tokens.css` with the WCAG 2.1 relative-luminance
formula. Two provisional values were adjusted to pass: `--state-locked`
`#7a719f → #a99fce` and `--station-04` `#7c5cff → #977dff`.

| Token pair | Usage | Required | Ratio | Pass |
|---|---|---|---|---|
| `--text-primary` on `--bg-base` | body text | ≥ 4.5 | 17.45 | ✅ |
| `--text-secondary` on `--surface-1` | secondary text | ≥ 4.5 | 10.41 | ✅ |
| `--text-muted` on `--surface-1` | muted text (min surface) | ≥ 4.5 | 5.70 | ✅ |
| `--text-muted` on `--bg-base` | muted text | ≥ 4.5 | 6.62 | ✅ |
| `--accent-primary` on `--bg-base` | primary CTA / large text | ≥ 3.0 | 6.82 | ✅ |
| `--accent-secondary` on `--bg-base` | links / large text | ≥ 3.0 | 11.87 | ✅ |
| `--accent-gold` on `--bg-base` | reward / large text | ≥ 3.0 | 13.25 | ✅ |
| `--state-failure` text/icon on `--state-failure-bg` | error panel | ≥ 4.5 | 6.93 | ✅ |
| `--state-success` text/icon on `--state-success-bg` | reward panel | ≥ 4.5 | 6.98 | ✅ |
| `--state-locked` on `--state-locked-bg` | locked text | ≥ 4.5 | 7.10 | ✅ |
| `--state-locked` on `--surface-2` | locked badge (badge bg) | ≥ 4.5 | 6.00 | ✅ |
| `--accent-secondary` focus ring vs `--surface-2` | `:focus-visible` (graphical) | ≥ 3.0 | 9.02 | ✅ |
| each `--station-0N` accent on `--surface-1` | station card strip / label | ≥ 4.5 | 5.33–11.59 | ✅ |
