# 3DTee — Project Plan & Checklist

**Course:** CMSI 3802 Languages and Automata II — Homework #1
**Due:** 2026-05-04
**Team:** Derek Lanz, Daniel Lee, Devan Joaquin Abiva, Trevor Leung, Bill Nguyen
**Repo:** https://github.com/dlanz1/3DTee (canonical remote; older `plangfinallanguage` URL may still appear in legacy notes)

This plan is derived directly from the assignment PDF and mapped against the current state of the repo. Items already done are marked `[x]`; outstanding items are `[ ]`. "Current state" notes call out what needs to change.

---

## 0. Status Snapshot (as of 2026-05-02)

| Area | Status |
|---|---|
| Team formed (3–6 students) | Done — 4 members |
| Logo | Done (`3DTee-Logo.svg`) |
| Ohm grammar | In progress — `src/3DTee.ohm` has substantive golf-keyword syntax |
| Parser | **Working** — `src/parser.js` loads Ohm grammar; exposes `match` / `parse`; syntax errors include line/column (Ohm message) |
| Analyzer / Optimizer / Generator | Stubs only (`throw` / not implemented); pipeline calls them after parse |
| Core AST module | **Scaffolded** — `src/core.js` exports placeholder node classes; **no** real AST construction from parse yet |
| Tests | Parser suite expanded (`test/parser.test.js`); analyzer/optimizer/generator tests are `it.todo` placeholders; `compiler.test.js` is minimal smoke |
| README | Good baseline content; companion-site link & static-constraints list still TODO |
| Examples folder | **Present** — five syntax-valid `.3dt` files under `examples/` (parse-level only until analyzer exists) |
| Docs folder | **Missing** |
| Companion website (GitHub Pages) | **Not started** |
| Presentation / slides | **Not started** |
| `.gitignore` hygiene | Improved (`.DS_Store`, `.env*`, editor dirs, etc.); confirm no stray `node_modules`/`.DS_Store` **committed** on fresh clone |
| Legacy cleanup | Top-level `index.js` and root `grammar.ohm` **removed**; authoritative grammar is `src/3DTee.ohm` |

---

## 1. Individual Readings & Watchings (each team member, signed affidavit)

Each member must personally complete — group coverage does not count.

- [ ] Atul Gawande, *The Checklist*
- [ ] All course notes: Language Design → Code Optimization
- [ ] Ohm: README, Tutorial, and the four main docs (Syntax, API, Philosophy, Patterns & Pitfalls)
- [ ] Mogenson Ch. 1–1.4 (read)
- [ ] Mogenson Ch. 2.1–2.5, 2.10, 3.1–3.6 (skim)
- [ ] Mogenson Ch. 4–6 (read)
- [ ] Mogenson Ch. 7 (skim)
- [ ] Mogenson Ch. 10–12 (skim, focus 11–12)
- [ ] Java 9–25 language-changes overview
- [ ] Wikipedia: Static Program Analysis (skim)
- [ ] OWASP: Static Code Analysis (skim)
- [ ] Assigned video (1.5× OK)
- [ ] Wikipedia: Program Optimization (browse)
- [ ] "Optimization Killers" article (study)
- [ ] Graydon Hoare presentation (browse, note big ideas)
- [ ] Frances Allen, *A Catalogue of Optimizing Transformations* (+ IBM remembrance, optional)
- [ ] **Draft and sign affidavit** for submission text

---

## 2. Language Design

- [x] Pick name & theme — "3DTee", golf-themed
- [x] Draft Ohm grammar (`src/3DTee.ohm`)
- [ ] Final grammar review pass: ensure it covers every feature advertised in the README
- [ ] Verify grammar passes all example programs (see §6)
- [ ] Confirm language hits "sufficient complexity" bar — features beyond Carlos-level examples. Current planned features to confirm are fully spec'd and implemented:
  - [ ] Primitives: `int`, `float`, `bool`, `string`
  - [ ] Array types `[T]` and typed empty-array literal `[T]()`
  - [ ] Function types `(T) -> U`
  - [ ] Optional types `T?` with `some`, `??`, null-coalescing
  - [ ] `let` / `const` declarations
  - [ ] `struct` user-defined record types
  - [ ] First-class functions, nested function types
  - [ ] Control flow: `if/else if/else`, `while`, `repeat`, `for i in a...b`, `for i in a..<b`, `for i in collection`
  - [ ] Operators: `?:`, `??`, `&&`, `||`, `|`, `^`, `&`, `<<`, `>>`, relational, arithmetic, `**`, `#` (length)
  - [ ] Unary: `some`, `no`, `random`
  - [ ] Literals: numeric (incl. scientific), bool, string (incl. `\u{...}`), typed array
  - [ ] Unicode identifiers
  - [ ] `//` line comments
- [ ] Decide final static checks (see §3.2) — document in README and site
- [ ] Negotiate optimization set with instructor **early** (required by spec)

---

## 3. Compiler Implementation

Target layout per spec:
```
src/
  3DTee.js       CLI entry
  3DTee.ohm      grammar
  compiler.js    pipeline orchestrator
  parser.js      grammar-driven parser
  core.js        AST node classes / representation
  analyzer.js    static semantic analysis
  optimizer.js   optimizations
  generator.js   JS code emission
```

### 3.1 CLI & Pipeline (`3DTee.js` + `compiler.js`)

- [x] CLI entry `src/3DTee.js` exists
- [x] CLI accepts `parsed`, `analyzed`, `optimized`, `js` (`parsed` succeeds on valid source; later modes fail until analyzer/optimizer/generator exist)
- [x] Parse / syntax-check via `parsed` mode
- [ ] Clean error reporting from CLI (line/column + message for all expected failures; no stack dumps) — partial today
- [x] `compiler.js` wires parse → analyze → optimize → generate (stubs throw after parse for non-`parsed` modes)
- [ ] Exit codes consistently sane (0 success, non-zero on error) — verify across all modes

### 3.2 Core AST (`core.js`) — scaffolded, not semantic yet

- [ ] Define node classes / factories used across analyzer, optimizer, generator:
  - [ ] Program, Block
  - [ ] VariableDeclaration, ConstantDeclaration
  - [ ] FunctionDeclaration, Parameter
  - [ ] StructDeclaration, Field
  - [ ] Types: IntType, FloatType, BoolType, StringType, ArrayType, FunctionType, OptionalType, StructType
  - [ ] Statements: IfStmt, WhileStmt, RepeatStmt, ForRangeStmt, ForEachStmt, AssignStmt, ReturnStmt, BreakStmt, PrintStmt (or equivalent)
  - [ ] Expressions: BinaryExpr, UnaryExpr, TernaryExpr, Call, Subscript, MemberAccess, Identifier, literals, ArrayExpr, EmptyArrayExpr
  - [ ] Built-ins (`print`, `random`, etc.)
- [ ] Export everything the analyzer and generator will import
- [x] Placeholder exports exist in `src/core.js` (replace/extend with real AST as semantics are implemented)

### 3.3 Parser (`parser.js`)

- [x] Loads `3DTee.ohm`
- [x] Exposes `match(source)` / `parse(source)` (`parse` throws on failure with Ohm message)
- [x] Syntax errors include line/column (via Ohm failure message)

### 3.4 Analyzer (`analyzer.js`) — must be substantial

The assignment explicitly calls out the statics as where the "significant work" lives. Required checks:

- [ ] Symbol table / scoped context with nested scopes
- [ ] Static scoping & scope resolution (use before declaration, shadowing rules)
- [ ] Type checking for every expression
- [ ] Type inference where the grammar allows it
- [ ] Parameter matching on calls (arity + types)
- [ ] Return-type checking vs function signature
- [ ] Contextual checks: `return` only in functions, `break` only in loops
- [ ] `const` is not reassignable
- [ ] Struct field access on struct-typed values only
- [ ] Array indexing only on arrays; index must be int
- [ ] Optional handling: `??` requires optional on LHS; `some` wraps; dereference rules enforced
- [ ] Range loops: bounds are int, iteration variable is int
- [ ] `for x in collection`: collection is array, element type matches
- [ ] Pattern exhaustiveness (where relevant)
- [ ] Access controls (if language defines `pub`/`private` or similar — decide)
- [ ] No duplicate declarations in same scope
- [ ] String literal / unicode escape validation
- [ ] Every analyzer method is well-named and documented with a one-liner

### 3.5 Optimizer (`optimizer.js`)

- [ ] Confirm optimization set with instructor (required by spec)
- [ ] Candidate optimizations (pick a non-trivial subset):
  - [ ] Constant folding (int, float, bool, string-concat)
  - [ ] Constant propagation
  - [ ] Dead-code elimination (unreachable after return, `if true`/`if false` branch pruning)
  - [ ] Strength reduction (e.g., `x * 2` → `x + x`, `x ** 2` → `x * x`)
  - [ ] Algebraic simplification (`x + 0`, `x * 1`, `x && true`, etc.)
  - [ ] Optional unwrapping when value is known non-nil
  - [ ] For-range with empty range elimination
  - [ ] Redundant assignment removal
- [ ] Each optimization has its own dedicated tests

### 3.6 Generator (`generator.js`)

- [ ] Emit readable JavaScript from the optimized AST
- [ ] Name mangling strategy for reserved JS keywords and Unicode identifiers
- [ ] Preserve semantics (e.g., int division vs float, optionals → `undefined`/wrapper)
- [ ] "Interesting" code generation: at least one case where the translation is non-trivial (e.g., optional chaining, struct → class, range iteration)
- [ ] Sample generated output lands in README or companion site (explicit checklist item, 2 pts)

---

## 4. Testing — target **100% coverage**

Using Node's built-in test runner + `c8`. The spec is blunt: 100% or lose points.

- [x] `test/parser.test.js` — grammar acceptance/rejection (expanded for current `3DTee.ohm` shapes)
- [ ] `test/analyzer.test.js` — one test per static rule, both pass and fail (currently TODO placeholders only)
- [ ] `test/optimizer.test.js` — one test per optimization (TODO placeholders only)
- [ ] `test/generator.test.js` — golden-output tests for each syntactic form (TODO placeholders only)
- [ ] `test/compiler.test.js` — end-to-end with at least one sample from `examples/` (smoke test only today)
- [ ] **≥ 50 tests total** (5 pt gate, all-or-nothing)
- [ ] Aim for "hundreds of tests" (checklist item)
- [ ] `npm test` runs the suite **and** reports coverage out of the box
- [ ] Coverage report shows **100%** lines/branches/functions
- [ ] All tests pass on a clean clone (`git clone && npm install && npm test`)

---

## 5. Repository Hygiene

Target tree (per spec):
```
.
├── .gitignore
├── README.md
├── LICENSE
├── package.json
├── .prettierrc.json            (optional)
├── docs/                       logo, companion website
├── examples/                   lots of example programs
├── src/
│   ├── 3DTee.js
│   ├── 3DTee.ohm
│   ├── compiler.js
│   ├── parser.js
│   ├── core.js
│   ├── analyzer.js
│   ├── optimizer.js
│   └── generator.js
└── test/
    ├── compiler.test.js
    ├── parser.test.js
    ├── analyzer.test.js
    ├── optimizer.test.js
    └── generator.test.js
```

- [ ] Remove committed `.DS_Store` (if any appear — verify on clone)
- [ ] Remove committed `node_modules/` (if any appear — verify on clone)
- [x] `.gitignore` expanded (`.DS_Store`, `node_modules/`, `coverage/`, `.env*`, editor dirs, logs, etc.)
- [x] Top-level duplicate `index.js` and `grammar.ohm` **removed**; `src/3DTee.ohm` is authoritative
- [ ] Create `docs/` (for website + logo + slides)
- [x] Create `examples/` (see §6) — five starter programs present; expand + semantic correctness still TODO
- [x] Public GitHub repo is **`3DTee`** under `dlanz1` (align any remaining `plangfinallanguage` references)
- [ ] `package.json`:
  - [x] `name` is suitable slug (`3dtee`)
  - [ ] `author` lists all 4 team members by name (currently generic placeholder)
  - [x] `"type": "module"`
  - [x] `repository` / `bugs` / `homepage` point at `3DTee` repo
  - [x] `scripts.test` runs tests + coverage (`c8 node --test …`)
  - [x] `description`, `keywords` partially filled — tighten to assignment expectations
  - [ ] `license` field semantics vs `LICENSE` file (verify ISC vs file text if required)
- [ ] Run Prettier across entire repo; add `.prettierrc.json` if useful
- [ ] Confirm clone → `npm install` → `npm test` works from a clean machine

---

## 6. Example Programs (`examples/`)

- [x] **≥ 5** example files present (`scorecard`, `handicap`, `tee_time`, `leaderboard`, `course_stats`)
- [ ] **Semantically correct** once analyzer exists (today: parse-valid only)
- [ ] Collectively cover **every syntactic form** in the grammar (expand set)
- [ ] Cover most/all interesting semantic checks (types, optionals, structs, control flow)
- [x] Golf-theme flavor (keeps the brand consistent)
- [x] Each example has a one-line comment at top describing what it demonstrates
- [ ] At least 2 examples are also embedded in README ("3DTee on left, JS on right")

Suggested programs:
- [x] `scorecard.3dt` — structs, arrays, for-each loops
- [x] `handicap.3dt` — functions, type inference, arithmetic
- [x] `tee_time.3dt` — optionals, `??`, conditionals
- [x] `leaderboard.3dt` — sorting/iteration with ranges, `for in`
- [x] `course_stats.3dt` — string handling, Unicode, print
- [ ] `caddie.3dt` — first-class functions, function-typed params

---

## 7. README (GitHub repo)

Current README is a good baseline. Remaining items:

- [x] Logo prominently displayed
- [x] Language name in large font
- [x] One-paragraph story intro
- [x] Features list
- [x] All team members listed
- [ ] **Link to the companion GitHub Pages site** (add once §8 is live)
- [ ] **List of static/safety/security checks performed** (copy from §3.4 once finalized)
- [ ] "3DTee on left, JS on right" side-by-side examples (≥ 2)
- [ ] Sample of generated JS output included somewhere
- [ ] Link to the grammar file for easy lookup
- [ ] "Not yet implemented" tags on any README feature that didn't land
- [ ] Proofread for any stale/aspirational claims

---

## 8. Companion Website (GitHub Pages)

- [ ] Create `docs/` with `index.html` (or Jekyll setup)
- [ ] Enable GitHub Pages from `docs/` in repo settings
- [ ] Use a nice template or hand-crafted CSS (3 pt line item — don't cheap out)
- [ ] Language story in **≤ 3 paragraphs**
- [ ] **≥ 5 example programs** shown on the site, covering every syntactic form
- [ ] List of static constraints (same list as README)
- [ ] Developer bios (short), optionally photos
- [ ] Link to GitHub repo
- [ ] Link to grammar file (can be in README OR site — at least one)
- [ ] Optional: document any easter egg here (recommended by spec)
- [ ] Site URL added to README (closes loop with §7)

---

## 9. Lightning Talk (last day of class, ~5 minutes)

- [ ] Pick a theme angle consistent with golf branding
- [ ] Decide roles: who introduces, who demos, who closes
- [ ] Each member says their own name during intros
- [ ] Write a tight outline — intro → concept → demo → outro
- [ ] Build slides (colorful, image-rich, minimal text)
- [ ] Include actual code snippets of 3DTee on slides
- [ ] Rehearse for timing — 5 min, not 3, not 8
- [ ] Memorable intro & outro (spec calls this out explicitly)
- [ ] Commit slides into the repo (spec requires this)
- [ ] Optional: music, video, costumes (respectful, no stereotypes)
- [ ] Read the three linked lightning-talk tip articles before writing slides

---

## 10. Submission (BrightSpace, single group submission)

Text submission must contain:

- [ ] Names of every student
- [ ] Per-student affidavit that each reading/watching in §1 was completed individually
- [ ] Link to the public GitHub repo
- [ ] Repo's README links to: the companion site, the slide deck/presentation

---

## 11. Participation & Interview Prep

- [ ] Each member commits from their **own** GitHub account — no "all commits from one laptop"
- [ ] Commit log shows continuous work across the semester, not a last-week crunch
- [ ] Be prepared for instructor's 1-on-1 contribution interview

---

## 12. Final QA Pass (day before submission)

- [ ] Fresh clone on a different machine → `npm install` → `npm test` → all pass, 100% coverage
- [ ] Every checklist item in the PDF ticked
- [ ] README, site, and repo all agree on the feature list
- [ ] No stray files (`.DS_Store`, `node_modules`, editor backups)
- [ ] Prettier clean
- [ ] GH Pages site loads and all links work
- [ ] Slides rendered and committed
- [ ] Submission text drafted and reviewed by all 4 members

---

## Suggested timeline (from status date → due 2026-05-04)

| Window | Focus |
|---|---|
| 05-02 → 05-03 | Real AST from parse + analyzer skeleton → core static checks; grow `compiler.test.js` |
| 05-03 | Generator MVP (subset) + golden tests; keep parser/examples aligned |
| 05-03 → 05-04 | Optimizer subset + per-opt tests; chase coverage toward 100% |
| 05-04 (AM) | `docs/` + GH Pages; README static list + side-by-side examples + sample JS |
| 05-04 (PM) | Slides committed; fresh-clone QA; submission text |
| Post-submit | Buffer only if allowed by instructor |

*(Original April timeline superseded — adjust with team if dates slip.)*

---

## Risk Register

- **Analyzer underscoped** — highest risk; spec demands "significant work" in statics. Keep the check list in §3.4 honest.
- **Optimization set un-negotiated** — confirm with instructor this week or risk surprise grading.
- **Repo naming** — public repo is `3DTee`; keep README/plan/instructor-facing links consistent (`plangfinallanguage` is legacy only).
- **Coverage gap** — anything less than 100% forfeits points; plan tests alongside implementation, not after.
- **Uneven contributions** — instructor interviews each member; make sure everyone owns a real slice of the code and can speak to it.
