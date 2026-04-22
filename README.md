<p align="center">
  <img src="./3DTee-Logo.svg" alt="3DTee Logo" width="200">
</p>

# 3DTee — A Golf-Themed Programming Language

3DTee is a statically-typed, golf-themed programming language that compiles to JavaScript. Written with a familiar C-style syntax and a grammar built on [ohm-js](https://ohmjs.org/), 3DTee aims to make programming feel like a round on the links — concise expressions, clear holes (scopes), and a clean follow-through from source to target code.

## Features

- **Static typing** with primitives (`int`, `float`, `bool`, `string`), arrays (`[T]`), function types (`(T) -> U`), and optionals (`T?`)
- **Declarations** via `let` / `const` for variables and `struct` for user-defined record types
- **First-class functions** with typed parameters, return types, and nested function types
- **Control flow**: `if` / `else if` / `else`, `while`, `repeat`, `for i in 2...9`, `for i in 2..<9`, and `for i in collection`
- **Rich expression language**: ternary (`?:`), null-coalescing (`??`), logical (`&&`, `||`), bitwise (`|`, `^`, `&`), shifts (`<<`, `>>`), relational, arithmetic, exponentiation (`**`), and length (`#`)
- **Unary goodies**: `some`, `no`, and `random` operators for working with optionals and collections
- **Literals**: numeric (including scientific notation), booleans, strings (with escape sequences and Unicode code points like `\u{1f4a9}`), and typed array literals (`[1, 2, 3]`, `[int]()`)
- **Unicode identifiers** — e.g., `let コンパイラ = 100;`
- **Line comments** with `//`

## Pipeline

3DTee follows a classic compiler pipeline:

```
source → parser → analyzer → optimizer → generator → JavaScript
```

| Stage       | File                  | Role                                              |
|-------------|-----------------------|---------------------------------------------------|
| Parser      | `src/parser.js`       | Matches source against `grammar.ohm` (ohm-js)     |
| Analyzer    | `src/analyzer.js`     | Static semantic analysis                          |
| Optimizer   | `src/optimizer.js`    | Transforms the analyzed representation            |
| Generator   | `src/generator.js`    | Emits JavaScript                                  |
| Driver      | `src/3DTee.js`        | CLI entry point                                   |
| Compiler    | `src/compiler.js`     | Orchestrates the four stages                      |

## Installation

```bash
git clone https://github.com/dlanz1/plangfinallanguage.git
cd plangfinallanguage
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
let score = 72;
const par = 72;

function relativeToPar(s: int): int {
  return s - par;
}

if score <= par {
  print("Under or at par!");
} else {
  print("Keep practicing.");
}
```

## Testing

Tests are written with Node's built-in test runner and cover parser, analyzer, optimizer, generator, and full compiler flows:

```bash
npm test
```

Coverage is reported via [c8](https://github.com/bcoe/c8).

## Project Structure

```
plangfinallanguage/
├── src/
│   ├── 3DTee.js        # CLI entry point
│   ├── compiler.js     # Pipeline orchestrator
│   ├── parser.js       # Grammar-driven parser
│   ├── analyzer.js     # Semantic analysis
│   ├── optimizer.js    # Optimizations
│   ├── generator.js    # JavaScript emitter
│   └── 3DTee.ohm       # Language grammar
├── test/               # Node test runner suites
├── grammar.ohm         # Top-level grammar file
├── index.js            # Grammar match demo
└── package.json
```

## Collaborators

- [Derek Lanz](https://github.com/dlanz1) — Collaborator
- [Daniel Lee](https://github.com/DanielJLee0917) — Collaborator
- [Devan Joaquin Abiva](https://github.com/DevanJoaquin) — Collaborator
- [Trevor Leung](https://github.com/TrevorLeung05) — Collaborator

## License

This project is licensed under the terms of the included [LICENSE](./LICENSE) file.
