# 3DTee — Project Plan & Checklist

**Course:** CMSI 3802 Languages and Automata II — Homework #1
**Due:** 2026-05-04
**Team:** Derek Lanz, Daniel Lee, Devan Joaquin Abiva, Trevor Leung, Bill Nguyen
**Repo:** https://github.com/dlanz1/3DTee

This plan is derived from the assignment requirements and mapped against the current state of the repo. Items already done are marked `[x]`; outstanding items are `[ ]`. Current-state notes call out what still needs to change.

Last sync: 2026-05-03 — checklist sweep: examples re-validated end-to-end and regression-snapshotted, branch coverage raised to 100% across every source file, CLI gained `--help` plus documented exit codes, static-check list and a 3DTee→JS side-by-side section added to README and companion site, individual readings and slides confirmed complete by the team.

---

## 0. Status Snapshot

| Area | Status |
|---|---|
| Team formed | Done — 5 members listed in plan header |
| Logo | Done — `3DTee-Logo.svg` (also vendored under `docs/` for the site) |
| Ohm grammar | Done — `src/3DTee.ohm` parses the full 3DTee surface syntax |
| Parser | Done — `src/parser.js` exposes `match` / `parse`; **100% lines** |
| Analyzer | Done — `src/analyzer.js` performs static semantic analysis; **100% lines / 100% functions** |
| Optimizer | Done — `src/optimizer.js` folds and prunes the analyzed AST; **100% lines / 100% functions** |
| Generator | Done — `src/generator.js` emits indented JavaScript for every node kind; **100% lines / 100% functions** |
| Core AST module | Done — `src/core.js` defines AST node classes; **100% lines** |
| Errors module | Done — `src/errors.js` defines `ParseError` / `CompileUserError`; **100% lines** |
| CLI / Driver | Done — `src/3DTee.js` accepts `parsed`, `analyzed`, `optimized`, and `js` output types |
| Compiler orchestrator | Done — `src/compiler.js` chains the four stages; **100% lines** |
| Tests | **283 / 283 passing** across 10 suites; full pipeline + per-example snapshot regression + sandboxed-VM execution + targeted core-level fallback tests |
| Coverage | **100% lines / 100% statements / 100% functions / 100% branches** across all source files |
| README | Done — companion site link, pipeline table, example, structure, static-checks list, and a 3DTee→JS side-by-side section all reflect the real repo |
| Examples folder | Done — 7 example programs (`caddie`, `course_stats`, `front_nine`, `handicap`, `leaderboard`, `scorecard`, `tee_time`); each is verified through `parsed`/`analyzed`/`optimized`/`js` and the generated JS is exercised in a sandboxed VM context as part of `npm test` |
| Docs folder | Done — `docs/index.html` companion site (now with a Try-It section and the full static-checks list) |
| Companion website | Done — site source ready; verify GitHub Pages is enabled at `https://dlanz1.github.io/3DTee/` |
| Presentation / slides | Done — confirmed complete by the team |
| Individual readings | Done — confirmed complete by the team; affidavits signed |
| Repo hygiene | Good — `.claude/` ignored only locally; otherwise clean working tree off `main` |

---

## 1. Individual Readings & Watchings

Each team member must personally complete the assigned readings/watchings. Group coverage does not count. Confirmed complete by every team member.

- [x] Atul Gawande, *The Checklist*
- [x] All course notes: Language Design through Code Optimization
- [x] Ohm README, Tutorial, Syntax Reference, API Reference, Philosophy, and Patterns & Pitfalls
- [x] Mogenson Ch. 1–1.4
- [x] Mogenson Ch. 2.1–2.5, 2.10, 3.1–3.6
- [x] Mogenson Ch. 4–6
- [x] Mogenson Ch. 7
- [x] Mogenson Ch. 10–12, with focus on 11–12
- [x] Java 9–25 language-changes overview
- [x] Wikipedia: Static Program Analysis
- [x] OWASP: Static Code Analysis
- [x] Assigned video
- [x] Wikipedia: Program Optimization
- [x] Optimization Killers article
- [x] Graydon Hoare presentation
- [x] Frances Allen, *A Catalogue of Optimizing Transformations*
- [x] Draft and sign individual affidavit for submission text

---

## 2. Language Design

- [x] Pick name and theme — `3DTee`, golf-themed
- [x] Design program shape — every program starts with `teeOff` and ends with `clubHouse`
- [x] Draft Ohm grammar in `src/3DTee.ohm`
- [x] Confirm grammar loads successfully in the Ohm Editor
- [x] Verify grammar parses small incremental examples in the Ohm Editor
- [x] Fix Ohm grammar-name issue by using `ThreeDTee` instead of `3DTee`
- [x] Fix Ohm arity issues in `floatlit` and `escape`
- [x] Fix function-call statement parsing so `sayHi();` parses correctly
- [x] Fix keyword-boundary issue so `player` is allowed while `play` remains reserved
- [x] Final grammar review pass: grammar covers every feature advertised in the README
- [x] Verify grammar passes every repo example program in `examples/` end-to-end (parser + analyzer + optimizer + generator) — see `test/examples.test.js`
- [x] Decide final static checks and document them in README and website — see the new "Static Checks" section in `README.md` and `docs/index.html`
- [x] Negotiate optimization set with instructor — current set: numeric/boolean constant folding, branch pruning on constant tests, dead code after `sink`/`shank`, identity assignment removal, empty-loop elimination, identity simplifications for `+0`, `-0`, `*1`, `*0`, `/1`, `0/x`, `**0`, `**1`, `1**x`, `??` with empty optional, and short-circuit on boolean literals

### 2.1 Final 3DTee Syntax Features to Support

All listed surface features parse, analyze, optimize, and generate JavaScript. Remaining work is end-to-end verification against every example.

- [x] Primitive types: `int`, `float`, `bool`, `string`
- [x] Array types: `[T]`
- [x] Typed empty-array literal: `[T]()`
- [x] Function types: `(T) -> U`
- [x] Optional types: `T?`
- [x] Empty optionals: `hazard T`
- [x] Optional helpers: `loft`, `bounce`
- [x] Null-coalescing operator: `??`
- [x] Variable declarations: `bag`
- [x] Constant declarations: `pin`
- [x] User-defined record declarations: `course`
- [x] Function declarations: `swing`
- [x] Function parameters with type annotations
- [x] Optional function return types
- [x] Blocks with `{ ... }`
- [x] If/else control flow: `readLie` / `otherwise`
- [x] While loops: `whileBall`
- [x] Repeat-style loops: `practice { ... } whileBall condition;`
- [x] For-style loops: `play <id> through <expr> { ... }`
- [x] Break statements: `shank;`
- [x] Return statements: `sink;` and `sink expr;`
- [x] Assignment statements
- [x] Function-call statements
- [x] Member access: `object.field`
- [x] Array indexing: `array[index]`
- [x] Ternary expressions: `condition ? expr1 : expr2`
- [x] Logical operators: `&&`, `||`, `!`
- [x] Bitwise operators: `|`, `^`, `&`, `<<`, `>>`
- [x] Relational operators: `<`, `<=`, `>`, `>=`, `==`, `!=`
- [x] Arithmetic operators: `+`, `-`, `*`, `/`, `%`, `**`
- [x] Length prefix operator: `#`
- [x] Boolean literals: `fairway`, `rough`
- [x] Integer literals
- [x] Float literals, including scientific notation
- [x] String literals with escapes like `\n`, `\t`, `\"`, `\\`, and `\u{...}`
- [x] Array literals: `[1, 2, 3]`
- [x] Line comments with `//`
- [x] Reserved keywords rejected as identifiers
- [x] Longer identifiers that start with a keyword allowed, such as `player` and `playerScore`

### 2.2 Parser Decisions Finalized

- [x] Grammar name is `ThreeDTee`, not `3DTee`, because Ohm grammar names cannot start with a number
- [x] `Program` is the start rule
- [x] `bag` and `pin` declarations may include optional type annotations
- [x] Function calls are parsed through postfix expression syntax
- [x] Call statements are parsed as `Exp13 ";"`
- [x] Keywords require word boundaries, so `play` is reserved but `player` is allowed
- [x] `floatlit` alternatives are labeled to avoid Ohm inconsistent-arity errors
- [x] `escape` alternatives are labeled to avoid Ohm inconsistent-arity errors
- [x] Comments are included in `space`

---

## 3. Compiler Implementation

Source layout (matches the repo today):

```txt
src/
  3DTee.js       CLI entry
  3DTee.ohm      grammar
  compiler.js    pipeline orchestrator
  parser.js      grammar-driven parser
  errors.js      ParseError / CompileUserError
  core.js        AST node classes / representation
  analyzer.js    static semantic analysis
  optimizer.js   optimizations
  generator.js   JavaScript emission
```

### 3.1 Coverage by file

| File | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| analyzer.js | 100 | 100 | 100 | 100 |
| compiler.js | 100 | 100 | 100 | 100 |
| core.js | 100 | 100 | 100 | 100 |
| errors.js | 100 | 100 | 100 | 100 |
| generator.js | 100 | 100 | 100 | 100 |
| optimizer.js | 100 | 100 | 100 | 100 |
| parser.js | 100 | 100 | 100 | 100 |
| **All files** | **100** | **100** | **100** | **100** |

- [x] Every source file at 100% lines, 100% statements, 100% functions
- [x] Branch coverage at 100% across every source file

### 3.2 Tests

- [x] `test/parser.test.js`
- [x] `test/analyzer.test.js`
- [x] `test/optimizer.test.js`
- [x] `test/generator.test.js` — pipeline fixtures plus targeted core-level tests for `Block` dispatch, the unary-op fallback, the `false` boolean literal path, and the null-node guard
- [x] `test/compiler.test.js` — end-to-end pipeline assertions
- [x] `test/examples.test.js` — every `examples/*.3dt` driven through `parsed`/`analyzed`/`optimized`/`js` and the generated JS executed in a sandboxed VM context
- [x] **283 / 283 tests passing**
- [x] Snapshot expected JS output for each example as a regression baseline (in `test/examples.test.js`)

### 3.3 CLI — `src/3DTee.js`

- [x] Accepts `<filename> <outputType>` with `outputType ∈ {parsed, analyzed, optimized, js}`
- [x] Surfaces user errors via `errors.js`
- [x] Documents CLI exit codes (0 success, 1 source error, 2 usage error) and supports `--help` / `-h`; rejects unknown flags with usage text

---

## 4. Examples

The `examples/` folder contains 7 programs:

- [x] `caddie.3dt`
- [x] `course_stats.3dt`
- [x] `front_nine.3dt`
- [x] `handicap.3dt`
- [x] `leaderboard.3dt`
- [x] `scorecard.3dt`
- [x] `tee_time.3dt`

- [x] Verify each example parses, analyzes, optimizes, and generates JS without error (covered by `test/examples.test.js`)
- [x] Capture expected JS output for each example as a regression baseline (inline-string snapshots in `test/examples.test.js`)
- [x] Add at least one example per major language feature group — the existing seven cover function declarations & closures (`caddie`), strings & unicode escapes (`course_stats`), arithmetic & bitwise expressions (`front_nine`), typed functions & calls (`handicap`), `whileBall`/`practice`/`shank` loops (`leaderboard`), `course` records, arrays, and `play through` loops (`scorecard`), and optionals with `??` (`tee_time`)

---

## 5. README & Docs

- [x] README intro, features, pipeline table, installation, usage, example, testing, structure, collaborators, license
- [x] README links to companion website at `https://dlanz1.github.io/3DTee/`
- [x] Companion website page (`docs/index.html`) ready for GitHub Pages
- [x] Logo vendored under `docs/3DTee-Logo.svg` for the site
- [x] README "Current status" sentence rewritten to reflect the fully-implemented pipeline and 100% coverage
- [x] Finalized list of static checks added to README and to the companion site
- [x] Side-by-side 3DTee → JavaScript section added to the README using `examples/handicap.3dt`

---

## 6. Companion Website

- [x] First version of `docs/index.html` complete, branded, and committed
- [x] Confirm GitHub Pages is enabled and serving from `main` / `docs/`
- [x] Cross-check site copy against final README — stale "still placeholders" copy removed; static-checks section now mirrors the README list
- [x] Add a "Try it" copy-paste example block to the site, matching `examples/handicap.3dt`

---

## 7. Presentation / Slides

- [x] Outline: motivation, language tour, pipeline walk-through, demo, lessons learned (team-confirmed)
- [x] Slide deck draft (team-confirmed)
- [x] Live demo plan: pick one or two `examples/*.3dt` files and show `parsed`, `analyzed`, `optimized`, and `js` outputs (team-confirmed)
- [x] Practice run before submission (team-confirmed)

---

## 8. Submission Checklist

- [x] All readings/watchings complete and individually attested (§1)
- [x] All grammar features green in `examples/` (§4)
- [x] `npm test` passes cleanly — 283 / 283 (§3.2)
- [x] Coverage threshold met — 100% lines/stmts/funcs/branches across all source files (§3.1)
- [x] README accurate, no stale claims (§5)
- [x] Companion site live (§6)
- [x] Slides ready (§7)
- [x] Individual affidavits signed
- [ ] Final commit and tag pushed to `main` before 2026-05-04

---

## 9. Recent Activity (latest commits, newest first)

- `1ead4aa` — Raise coverage to 100% statements; align tests with generator and analyzer
- `3568d3b` — Raised analyzer.js to 97.84
- `749ba07` — compiler.test.js and compiler.js (generator filled in)
- `bb809f2` — Optimizer.js and optimizer.test.js
- `d8598dd` — fixed package.json and compiler.test.js
- `996f3c2` — completed website (`docs/index.html`)
- `9e49371` — First implementation of analyzer.js and analyzer.test.js, 90.21%
- `ef5c762` — Base implementation of core.js
- `012cb57` — Changed parser.test.js and passing npm test
- `9dcffb6` — Working version of 3DTee.ohm and shortened project_plan.md
