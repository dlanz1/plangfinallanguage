<p align="center">
  <img src="./3DTee-Logo.svg" alt="3DTee Logo" width="200">
</p>

# 3DTee — A Golf-Themed Programming Language

3DTee is a statically-typed language where the source code plays like a round of golf. Every program starts at `teeOff` and finishes at `clubHouse`; variables live in `bag`s, constants are `pin`ned, functions are `swing`s, and the compiler keeps score with static types, scope checking, and safety rules. 3DTee is designed to compile to clean, readable JavaScript.

## Companion Website

Visit the 3DTee companion site at [https://dlanz1.github.io/3DTee/](https://dlanz1.github.io/3DTee/). The site source lives in [`docs/index.html`](./docs/index.html).

## Features

- **Program shape** — every program opens with `teeOff` and closes with `clubHouse`
- **Static typing** with primitives (`int`, `float`, `bool`, `string`), arrays (`[T]`), function types (`(T) -> U`), and optionals (`T?`)
- **Declarations** — `bag` for variables, `pin` for constants, `course` for user-defined record types
- **First-class functions** via `swing`, with typed parameters, return types, and nested function types
- **Control flow** — `readLie` / `otherwise` (if/else), `whileBall` (while), `practice { ... } whileBall <condition>;` (repeat), and `play <id> through <collection>` (for-each)
- **Flow exits** — `shank` to break out of a loop, `sink` to return from a function
- **Rich expression language**: ternary (`?:`), null-coalescing (`??`), logical (`&&`, `||`), bitwise (`|`, `^`, `&`), shifts (`<<`, `>>`), relational, arithmetic, exponentiation (`**`), and length prefix (`#`)
- **Booleans**: `fairway` (true) and `rough` (false)
- **Optionals**: `hazard T` for an empty optional of type `T`; `loft` and `bounce` as unary optional/value helpers
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

Current status: the full pipeline — parser, analyzer, optimizer, and JavaScript generator — is implemented. `npm test` runs the full suite with 100% line, statement, function, and branch coverage on every source file.

## Static Checks

The analyzer enforces the following rules; violations are reported as `CompileUserError` with the offending line and column:

- An identifier cannot be redeclared in the same scope.
- An identifier must be declared before it is used.
- Variable, parameter, and field types must resolve to a known type.
- A variable's initializer must be assignable to its declared (or inferred) type.
- `int` widens to `float` on assignment; otherwise types must match exactly. Function types match by arity and component-wise assignability.
- The target of an assignment must be mutable (a `bag`, a parameter, an element of one of those, or a field of one of those — never a `pin`).
- Arithmetic operators require numeric operands; `+` additionally accepts two strings.
- Bitwise (`|`, `^`, `&`) and shift (`<<`, `>>`) operators require integer operands.
- Logical operators (`&&`, `||`, `!`) and conditional tests (`readLie`, `whileBall`, `practice`, ternary) require booleans.
- Relational ordering (`<`, `<=`, `>`, `>=`) requires numeric or string operands; both sides of any comparison must have the same type.
- Array indexing requires an array on the left and an integer on the right; `#` requires an array.
- Member access requires a `course` value and a field name declared on that `course`.
- A `course` declaration's fields must have distinct names.
- A function call's argument count must match the declared arity, and each argument must be assignable to its parameter type.
- `loft` and `bounce` require an optional value; `??` requires an optional on the left and a base-type-compatible value on the right.
- `shank` may appear only inside a loop; `sink` may appear only inside a function, and a value-`sink` is allowed only when the function declares a non-void return type.
- Array literals must be homogeneous; the empty bracketed literal `[]` infers as `[any]`, and a typed empty array uses `[T]()`.
- Unicode escapes inside strings must be valid code points (≤ `0x10FFFF`).

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

### 3DTee → JavaScript

The same `examples/handicap.3dt` program, side by side with what the generator emits when invoked as `node src/3DTee.js examples/handicap.3dt js`:

<table>
<tr>
<th>handicap.3dt</th>
<th>generated JavaScript</th>
</tr>
<tr>
<td>

```
teeOff
  swing relativeToPar(score: int, par: int): int {
    sink score - par;
  }

  bag today = relativeToPar(74, 72);
clubHouse
```

</td>
<td>

```js
function relativeToPar(score, par) {
  return (score - par);
}
let today = relativeToPar(74, 72);
```

</td>
</tr>
</table>

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
