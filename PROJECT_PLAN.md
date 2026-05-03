# 3DTee — Project Plan & Checklist

**Course:** CMSI 3802 Languages and Automata II — Homework #1  
**Due:** 2026-05-04  
**Team:** Derek Lanz, Daniel Lee, Devan Joaquin Abiva, Trevor Leung, Bill Nguyen  
**Repo:** https://github.com/dlanz1/3DTee

This plan is derived from the assignment requirements and mapped against the current state of the repo. Items already done are marked `[x]`; outstanding items are `[ ]`. Current-state notes call out what still needs to change.

---

## 0. Status Snapshot

| Area | Status |
|---|---|
| Team formed | Done — 5 members listed in plan header |
| Logo | Done — `3DTee-Logo.svg` |
| Ohm grammar | **Working** — `src/3DTee.ohm` parses the core 3DTee syntax in the Ohm Editor |
| Parser | **Working** — `src/parser.js` loads Ohm grammar and exposes `match` / `parse` |
| Analyzer | Not implemented / stub only |
| Optimizer | Not implemented / stub only |
| Generator | Not implemented / stub only |
| Core AST module | Scaffolded — `src/core.js` exists, but real AST construction still needs to be completed |
| CLI / Driver | Working for `parsed`; later pipeline stages fail until analyzer, optimizer, and generator are implemented |
| Tests | Parser tests exist; analyzer, optimizer, generator, and full compiler tests still need to be expanded |
| README | Good baseline content; still needs companion site link, static-check list, generated JS examples, and stale-claim cleanup |
| Examples folder | Present — example programs exist, but need to be verified against the final grammar and later against analyzer semantics |
| Docs folder | Missing / not started |
| Companion website | Not started |
| Presentation / slides | Not started |
| Repo hygiene | Mostly improved; still verify no stray committed files on fresh clone |

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
- [ ] Final grammar review pass: ensure grammar covers every feature advertised in the README
- [ ] Verify grammar passes every repo example program in `examples/`
- [ ] Decide final static checks and document them in README and website
- [ ] Negotiate optimization set with instructor early

### 2.1 Final 3DTee Syntax Features to Support

- [ ] Primitive types: `int`, `float`, `bool`, `string`
- [ ] Array types: `[T]`
- [ ] Typed empty-array literal: `[T]()`
- [ ] Function types: `(T) -> U`
- [ ] Optional types: `T?`
- [ ] Empty optionals: `hazard T`
- [ ] Optional helpers: `loft`, `bounce`
- [ ] Null-coalescing operator: `??`
- [ ] Variable declarations: `bag`
- [ ] Constant declarations: `pin`
- [ ] User-defined record declarations: `course`
- [ ] Function declarations: `swing`
- [ ] Function parameters with type annotations
- [ ] Optional function return types
- [ ] Blocks with `{ ... }`
- [ ] If/else control flow: `readLie` / `otherwise`
- [ ] While loops: `whileBall`
- [ ] Repeat-style loops: `practice { ... } whileBall condition;`
- [ ] For-style loops: `play <id> through <expr> { ... }`
- [ ] Break statements: `shank;`
- [ ] Return statements: `sink;` and `sink expr;`
- [ ] Assignment statements
- [ ] Function-call statements
- [ ] Member access: `object.field`
- [ ] Array indexing: `array[index]`
- [ ] Ternary expressions: `condition ? expr1 : expr2`
- [ ] Logical operators: `&&`, `||`, `!`
- [ ] Bitwise operators: `|`, `^`, `&`, `<<`, `>>`
- [ ] Relational operators: `<`, `<=`, `>`, `>=`, `==`, `!=`
- [ ] Arithmetic operators: `+`, `-`, `*`, `/`, `%`, `**`
- [ ] Length prefix operator: `#`
- [ ] Boolean literals: `fairway`, `rough`
- [ ] Integer literals
- [ ] Float literals, including scientific notation
- [ ] String literals with escapes like `\n`, `\t`, `\"`, `\\`, and `\u{...}`
- [ ] Array literals: `[1, 2, 3]`
- [ ] Line comments with `//`
- [ ] Reserved keywords rejected as identifiers
- [ ] Longer identifiers that start with a keyword allowed, such as `player` and `playerScore`

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

Target source layout:

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