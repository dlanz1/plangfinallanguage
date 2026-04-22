# 3DTee — Project Plan & Checklist

**Course:** CMSI 3802 Languages and Automata II — Homework #1
**Due:** 2026-05-04
**Team:** Derek Lanz, Daniel Lee, Devan Joaquin Abiva, Trevor Leung
**Repo:** https://github.com/dlanz1/plangfinallanguage

This plan is derived directly from the assignment PDF and mapped against the current state of the repo. Items already done are marked `[x]`; outstanding items are `[ ]`. "Current state" notes call out what needs to change.

---

## 0. Status Snapshot (as of 2026-04-22)

| Area | Status |
|---|---|
| Team formed (3–6 students) | Done — 4 members |
| Logo | Done (`3DTee Logo.svg`) |
| Ohm grammar | In progress — `src/3DTee.ohm` has substantive content |
| Parser | In progress — `src/parser.js` implemented |
| Analyzer / Optimizer / Generator | Stubs only (~85 bytes each) |
| Core AST module | Empty (`src/core.js`) |
| Tests | Parser suite started; analyzer/optimizer/generator/compiler empty |
| README | Good draft — missing companion-site link & static-constraints list |
| Examples folder | **Missing** |
| Docs folder | **Missing** |
| Companion website (GH Pages) | **Not started** |
| Presentation / slides | **Not started** |
| `.gitignore` hygiene | Needs work — `.DS_Store` and `node_modules` committed |

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
- [ ] CLI supports `parsed`, `analyzed`, `optimized`, `js` output modes (mirrors Carlos)
- [ ] `syntax-check` / `parse` mode callable from CLI
- [ ] Clean error reporting from CLI (source location + message, no stack dumps for user errors)
- [ ] `compiler.js` orchestrates: parse → analyze → optimize → generate
- [ ] Exit codes are sane (0 success, non-zero on error)

### 3.2 Core AST (`core.js`) — currently empty

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

### 3.3 Parser (`parser.js`)

- [x] Loads `3DTee.ohm`
- [ ] Exposes `match(source)` / `parse(source)` returning either a match or a structured syntax error
- [ ] Syntax errors include line/column and a helpful message

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

- [ ] `test/parser.test.js` — grammar acceptance/rejection (already started)
- [ ] `test/analyzer.test.js` — one test per static rule, both pass and fail
- [ ] `test/optimizer.test.js` — one test per optimization
- [ ] `test/generator.test.js` — golden-output tests for each syntactic form
- [ ] `test/compiler.test.js` — end-to-end with at least one sample from `examples/`
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

- [ ] Remove committed `.DS_Store`
- [ ] Remove committed `node_modules/`
- [ ] Regenerate `.gitignore` using GitHub's Node template (add `.DS_Store`, `node_modules/`, `coverage/`, `.env`)
- [ ] Decide fate of top-level `index.js` and `grammar.ohm` — if they duplicate `src/`, delete; if they're needed, document why
- [ ] Create `docs/` (for website + logo + slides)
- [ ] Create `examples/` (see §6)
- [ ] Confirm repo name matches language name — **current repo is `plangfinallanguage`, language is `3DTee`.** Either rename the repo or decide this is acceptable (flag with instructor)
- [ ] `package.json`:
  - [ ] `name` is `3DTee` (or suitable slug)
  - [ ] `author` lists all 4 team members
  - [ ] `"type": "module"`
  - [ ] `repository` field present
  - [ ] `scripts.test` runs tests + coverage
  - [ ] `description`, `keywords`, `license`, `bugs`, `homepage` all filled
- [ ] Run Prettier across entire repo; add `.prettierrc.json` if useful
- [ ] Confirm clone → `npm install` → `npm test` works from a clean machine

---

## 6. Example Programs (`examples/`)

- [ ] **≥ 5 full, semantically correct example programs**
- [ ] Collectively cover **every syntactic form** in the grammar
- [ ] Cover most/all interesting semantic checks (types, optionals, structs, control flow)
- [ ] Golf-theme flavor (keeps the brand consistent)
- [ ] Each example has a one-line comment at top describing what it demonstrates
- [ ] At least 2 examples are also embedded in README ("3DTee on left, JS on right")

Suggested programs:
- [ ] `scorecard.3dt` — structs, arrays, for-each loops
- [ ] `handicap.3dt` — functions, type inference, arithmetic
- [ ] `tee_time.3dt` — optionals, `??`, conditionals
- [ ] `leaderboard.3dt` — sorting/iteration with ranges, `for in`
- [ ] `course_stats.3dt` — string handling, Unicode, print
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

## Suggested Two-Week Timeline (12 days remaining)

| Days | Focus |
|---|---|
| 04-22 → 04-24 | Finalize grammar + `core.js` AST; flesh out analyzer; start writing example programs |
| 04-25 → 04-27 | Finish analyzer + its full test suite; start generator with golden tests |
| 04-28 → 04-29 | Optimizer + tests; push coverage to 100%; clean up repo hygiene |
| 04-30 → 05-01 | Companion site (GH Pages), README polish, finalize all 5+ examples |
| 05-02 | Slides, rehearsal, submission text, fresh-clone QA |
| 05-03 | Buffer / fixes |
| 05-04 | Submit |

---

## Risk Register

- **Analyzer underscoped** — highest risk; spec demands "significant work" in statics. Keep the check list in §3.4 honest.
- **Optimization set un-negotiated** — confirm with instructor this week or risk surprise grading.
- **Repo name ≠ language name** — flag early; cheap to fix if instructor wants it.
- **Coverage gap** — anything less than 100% forfeits points; plan tests alongside implementation, not after.
- **Uneven contributions** — instructor interviews each member; make sure everyone owns a real slice of the code and can speak to it.
