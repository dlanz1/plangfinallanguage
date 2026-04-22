<p align="center">
  <img src="./3DTee-Logo.svg" alt="3DTee Logo" width="200">
</p>

# 3DTee — A Golf-Themed Programming Language

3DTee is a statically-typed language where the source code plays like a round of golf. Every program starts at `teeOff` and finishes at `clubHouse`; variables live in `bag`s, constants are `pin`ned, functions are `swing`s, and the compiler keeps score with static types, scope checking, and safety rules. 3DTee compiles to clean, readable JavaScript.

## Features

- **Program shape** — every program opens with `teeOff` and closes with `clubHouse`
- **Static typing** with primitives (`int`, `float`, `bool`, `string`), arrays (`[T]`), function types (`(T) -> U`), and optionals (`T?`)
- **Declarations** — `bag` for variables, `pin` for constants, `course` for user-defined record types
- **First-class functions** via `swing`, with typed parameters, return types, and nested function types
- **Control flow** — `readLie` / `otherwise` (if/else), `whileBall` (while), `practice` (repeat), and `play <id> through <range-or-collection>` (for)
- **Flow exits** — `shank` to break out of a loop, `sink` to return from a function
- **Rich expression language**: ternary (`?:`), null-coalescing (`??`), logical (`&&`, `||`), bitwise (`|`, `^`, `&`), shifts (`<<`, `>>`), relational, arithmetic, exponentiation (`**`), and length prefix (`#`)
- **Booleans**: `fairway` (true) and `rough` (false) <!-- confirm truth assignment with team -->
- **Optionals**: `hazard T` for an empty optional of type `T`; `loft` and `bounce` as unary optional/value helpers <!-- confirm exact semantics with team -->
- **Literals**: numeric (including scientific notation), strings (with `\n`, `\t`, and `\u{...}` code-point escapes), and typed array literals (`[1, 2, 3]`, `[int]()`)
- **Line comments** with `//`

## Pipeline

3DTee follows a classic compiler pipeline:

```
source → parser → analyzer → optimizer → generator → JavaScript
```

| Stage       | File                  | Role                                              |
|-------------|-----------------------|---------------------------------------------------|
| Parser      | `src/parser.js`       | Matches source against `src/3DTee.ohm` (ohm-js)   |
| Analyzer    | `src/analyzer.js`     | Static semantic analysis                          |
| Optimizer   | `src/optimizer.js`    | Transforms the analyzed representation            |
| Generator   | `src/generator.js`    | Emits JavaScript                                  |
| Driver      | `src/3DTee.js`        | CLI entry point                                   |
| Compiler    | `src/compiler.js`     | Orchestrates the four stages                      |

## Installation

```bash
git clone https://github.com/dlanz1/3DTee.git
cd 3DTee
npm install
```

## Usage

Compile a 3DTee source file and choose what the CLI emits:

```bash
node src/3DTee.js <filename> <outputType>
```

Where `<outputType>` is one of:

- `parsed` — confirms the program was matched by the grammar
- `analyzed` — the statically analyzed representation
- `optimized` — the optimized representation
- `js` — the JavaScript translation

## Example

```
teeOff
  bag score = 72;
  pin par = 72;

  swing relativeToPar(s: int): int {
    sink s - par;
  }

  readLie score <= par {
    print("Under or at par!");
  } otherwise {
    print("Keep practicing.");
  }
clubHouse
```

## Testing

Tests are written with Node's built-in test runner and cover parser, analyzer, optimizer, generator, and full compiler flows:

```bash
npm test
```

Coverage is reported via [c8](https://github.com/bcoe/c8).

## Project Structure

```
3DTee/
├── src/
│   ├── 3DTee.js        # CLI entry point
│   ├── compiler.js     # Pipeline orchestrator
│   ├── parser.js       # Grammar-driven parser
│   ├── core.js         # AST node definitions
│   ├── analyzer.js     # Semantic analysis
│   ├── optimizer.js    # Optimizations
│   ├── generator.js    # JavaScript emitter
│   └── 3DTee.ohm       # Language grammar
├── test/               # Node test runner suites
└── package.json
```

## Collaborators

- [Derek Lanz](https://github.com/dlanz1) — Collaborator
- [Daniel Lee](https://github.com/DanielJLee0917) — Collaborator
- [Devan Joaquin Abiva](https://github.com/DevanJoaquin) — Collaborator
- [Trevor Leung](https://github.com/TrevorLeung05) — Collaborator
- [Bill Nguyen](https://github.com/BillNg2801) — Collaborator

## License

This project is licensed under the terms of the included [LICENSE](./LICENSE) file.
