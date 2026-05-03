# 3DTee — Project Plan & Checklist

**Course:** CMSI 3802 Languages and Automata II — Homework #1
**Due:** 2026-05-04
**Team:** Derek Lanz, Daniel Lee, Devan Joaquin Abiva, Trevor Leung, Bill Nguyen
**Repo:** https://github.com/dlanz1/3DTee

This plan is derived from the assignment requirements and mapped against the current state of the repo. Items already done are marked `[x]`; outstanding items are `[ ]`. Current-state notes call out what still needs to change.

Last sync: 2026-05-03 — reflects work through commit `1ead4aa` (coverage to 100% statements; tests aligned with generator and analyzer).

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
| Tests | **253 / 253 passing** across 8 suites; full pipeline + targeted core-level fallback tests |
| Coverage | **100% lines / 100% statements / 100% functions** across all source files; branches at 95.96% overall |
| README | Done — companion site link, pipeline table, example, and structure all reflect the real repo |
| Examples folder | Present — 7 example programs (`caddie`, `course_stats`, `front_nine`, `handicap`, `leaderboard`, `scorecard`, `tee_time`); still need to be re-validated end-to-end through the full pipeline |
| Docs folder | Done — `docs/index.html` is the 708-line companion site |
| Companion website | Done — site source ready; verify GitHub Pages is enabled at `https://dlanz1.github.io/3DTee/` |
| Presentation / slides | Not started |
| Repo hygiene | Good — `.claude/` ignored only locally; otherwise clean working tree off `main` |

---

## 1. Individual Readings & Watchings

Each team member must personally complete the assigned readings/watchings. Group coverage does not count.

- [ ] Atul Gawande, *The Checklist*
- [ ] All course notes: Language Design through Code Optimization
- [ ] Ohm README, Tutorial, Syntax Reference, API Reference, Philosophy, and Patterns & Pitfalls
- [ ] Mogenson Ch. 1–1.4
- [ ] Mogenson Ch. 2.1–2.5, 2.10, 3.1–3.6
- [ ] Mogenson Ch. 4–6
- [ ] Mogenson Ch. 7
- [ ] Mogenson Ch. 10–12, with focus on 11–12
- [ ] Java 9–25 language-changes overview
- [ ] Wikipedia: Static Program Analysis
- [ ] OWASP: Static Code Analysis
- [ ] Assigned video
- [ ] Wikipedia: Program Optimization
- [ ] Optimization Killers article
- [ ] Graydon Hoare presentation
- [ ] Frances Allen, *A Catalogue of Optimizing Transformations*
- [ ] Draft and sign individual affidavit for submission text

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
- [ ] Verify grammar passes every repo example program in `examples/` end-to-end (parser + analyzer + generator)
- [ ] Decide final static checks and document them in README and website
- [ ] Negotiate optimization set with instructor early

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
| analyzer.js | 100 | 93.84 | 100 | 100 |
| compiler.js | 100 | 100 | 100 | 100 |
| core.js | 100 | 100 | 100 | 100 |
| errors.js | 100 | 100 | 100 | 100 |
| generator.js | 100 | 96.49 | 100 | 100 |
| optimizer.js | 100 | 96.74 | 100 | 100 |
| parser.js | 100 | 100 | 100 | 100 |
| **All files** | **100** | **95.96** | **100** | **100** |

- [x] Every source file at 100% lines, 100% statements, 100% functions
- [ ] Lift the remaining ~4% of branch coverage if/where it represents reachable paths (analyzer 93.84%, generator 96.49%, optimizer 96.74%)

### 3.2 Tests

- [x] `test/parser.test.js`
- [x] `test/analyzer.test.js`
- [x] `test/optimizer.test.js`
- [x] `test/generator.test.js` — pipeline fixtures plus targeted core-level tests for `Block` dispatch and the unary-op fallback
- [x] `test/compiler.test.js` — end-to-end pipeline assertions
- [x] **253 / 253 tests passing**
- [ ] Run every program in `examples/` through the full pipeline and snapshot expected JS output as a regression baseline

### 3.3 CLI — `src/3DTee.js`

- [x] Accepts `<filename> <outputType>` with `outputType ∈ {parsed, analyzed, optimized, js}`
- [x] Surfaces user errors via `errors.js`
- [ ] Document CLI exit codes and add `--help` / unknown-flag handling pass

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

- [ ] Verify each example parses, analyzes, optimizes, and generates JS without error
- [ ] Capture expected JS output for each example as a regression baseline
- [ ] Add at least one example per major language feature group if any are missing once the static-check list is finalized

---

## 5. README & Docs

- [x] README intro, features, pipeline table, installation, usage, example, testing, structure, collaborators, license
- [x] README links to companion website at `https://dlanz1.github.io/3DTee/`
- [x] Companion website page (`docs/index.html`, 708 lines) ready for GitHub Pages
- [x] Logo vendored under `docs/3DTee-Logo.svg` for the site
- [ ] Update README "Current status" sentence — pipeline is now fully implemented; the existing "optimization and JavaScript generation are still placeholders" line is stale
- [ ] Add the finalized list of static checks to both README and the companion site
- [ ] Add a section showing a sample 3DTee source and its generated JavaScript side by side

---

## 6. Companion Website

- [x] First version of `docs/index.html` complete, branded, and committed
- [ ] Confirm GitHub Pages is enabled and serving from `main` / `docs/`
- [ ] Cross-check site copy against final README (features, static checks, examples)
- [ ] Add a "Try it" or copy-paste example block matching one of the `examples/` programs

---

## 7. Presentation / Slides

- [ ] Outline: motivation, language tour, pipeline walk-through, demo, lessons learned
- [ ] Slide deck draft
- [ ] Live demo plan: pick one or two `examples/*.3dt` files and show `parsed`, `analyzed`, `optimized`, and `js` outputs
- [ ] Practice run before submission

---

## 8. Submission Checklist

- [ ] All readings/watchings complete and individually attested (§1)
- [ ] All grammar features green in `examples/` (§4)
- [x] `npm test` passes cleanly — 253 / 253 (§3.2)
- [x] Coverage threshold met — 100% lines/stmts/funcs across all source files (§3.1)
- [ ] README accurate, no stale claims (§5)
- [ ] Companion site live (§6)
- [ ] Slides ready (§7)
- [ ] Individual affidavits signed
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
