import { describe, it } from "node:test"
import assert from "node:assert/strict"
import parse, { match } from "../src/parser.js"
import { ParseError } from "../src/errors.js"

const okPrograms = [
    [
        "minimal program",
        `
teeOff
clubHouse
`,
    ],
    [
        "declarations and assignment",
        `
teeOff
  bag score = 72;
  pin par = 72;
  score = score - 1;
clubHouse
`,
    ],
    [
        "function with optional and array types",
        `
teeOff
  swing pick(a: int?, b: [int]): int {
    sink a ?? b[0];
  }
clubHouse
`,
    ],
    [
        "struct declaration and member access",
        `
teeOff
  course Hole { number: int distance: float }
  bag h = hazard Hole;
  bag value = h?.number ?? 0;
clubHouse
`,
    ],
    [
        "if / else-if / else chain",
        `
teeOff
  bag x = 3;
  readLie x < 0 { x = 0; } otherwise readLie x == 0 { x = 1; } otherwise { x = 2; }
clubHouse
`,
    ],
    [
        "while and repeat loops",
        `
teeOff
  bag i = 0;
  whileBall i < 3 { i++; }
  practice 2 { i--; }
clubHouse
`,
    ],
    [
        "range and collection loops",
        `
teeOff
  bag xs = [1, 2, 3];
  play i through 1...3 { bag a = i; }
  play j through 0..<2 { bag b = j; }
  play x through xs { bag c = x; }
clubHouse
`,
    ],
    [
        "typed empty array literal",
        `
teeOff
  bag xs = [int]();
clubHouse
`,
    ],
    [
        "unicode identifier and string escapes",
        `
teeOff
  bag コンパイラ = 1;
  bag s = "line\\n\\t\\u{1f3cc}";
clubHouse
`,
    ],
    [
        "comments",
        `
teeOff
  bag x = 1; // keep score
clubHouse
`,
    ],
    [
        "ternary expression",
        `
teeOff
  bag x = fairway ? 1 : 2;
clubHouse
`,
    ],
    [
        "null coalescing (parenthesized optional to avoid ? vs ?? ambiguity)",
        `
teeOff
  bag x = (hazard int) ?? 5;
clubHouse
`,
    ],
    [
        "logical or chain",
        `
teeOff
  bag x = rough || fairway || rough;
clubHouse
`,
    ],
    [
        "logical and chain",
        `
teeOff
  bag x = fairway && rough && fairway;
clubHouse
`,
    ],
    [
        "bitwise or chain (single operator per precedence level)",
        `
teeOff
  bag x = 1 | 2 | 3;
clubHouse
`,
    ],
    [
        "shift operators",
        `
teeOff
  bag x = 8 << 2 >> 1;
clubHouse
`,
    ],
    [
        "arithmetic mix",
        `
teeOff
  bag x = 1 + 2 * 3 - 4 / 2 % 3;
clubHouse
`,
    ],
    [
        "exponentiation",
        `
teeOff
  bag x = 2 ** 3 ** 2;
clubHouse
`,
    ],
    [
        "scientific float literal",
        `
teeOff
  bag x = 1.5e+2 * 2.0e0;
clubHouse
`,
    ],
    [
        "loft and bounce unary",
        `
teeOff
  bag a = loft hazard int;
  bag b = bounce fairway;
clubHouse
`,
    ],
    [
        "break shank in loop",
        `
teeOff
  whileBall fairway { shank; }
clubHouse
`,
    ],
    [
        "short return sink",
        `
teeOff
  swing f(): int { sink; }
clubHouse
`,
    ],
    [
        "function type as parameter",
        `
teeOff
  swing map1(f: (int)->int, x: int): int {
    sink f(x);
  }
clubHouse
`,
    ],
    [
        "nested array type",
        `
teeOff
  swing rows(a: [[int]]): int {
    sink 0;
  }
clubHouse
`,
    ],
    [
        "call and member chain",
        `
teeOff
  bag f = hazard (int)->int;
  bag y = f(1)?.field;
clubHouse
`,
    ],
    [
        "bump increment decrement",
        `
teeOff
  bag n = 0;
  n++;
  n--;
clubHouse
`,
    ],
    [
        "readLie short form",
        `
teeOff
  readLie fairway { bag x = 1; }
clubHouse
`,
    ],
    [
        "length hash operator",
        `
teeOff
  bag xs = [1, 2, 3];
  bag n = #xs;
clubHouse
`,
    ],
]

const badPrograms = [
    ["missing teeOff", "bag x = 1; clubHouse", /Line 1, col 1/],
    ["missing semicolon", "teeOff bag x = 1 clubHouse", /Line 1/],
    ["bad float", "teeOff bag x = 2.; clubHouse", /Line 1/],
    ["bad unicode escape", 'teeOff bag s = "\\u{1111111}"; clubHouse', /Line 1/],
    ["missing block braces in whileBall", "teeOff whileBall fairway bag x = 1; clubHouse", /Line 1/],
    ["keyword bag as identifier", "teeOff bag bag = 1; clubHouse", /Line 1/],
    ["mixing && and ||", "teeOff bag x = fairway || rough && fairway; clubHouse", /Line 1/],
    ["unclosed string", 'teeOff bag s = "oops; clubHouse', /Line 1/],
    ["typo end keyword", "teeOff bag x = 1; clubHous", /Line 1/],
]

describe("The parser", () => {
    for (const [scenario, source] of okPrograms) {
        it(`matches ${scenario}`, () => {
            assert.ok(match(source).succeeded())
            assert.ok(parse(source).succeeded())
        })
    }
    for (const [scenario, source, errorPattern] of badPrograms) {
        it(`throws on ${scenario}`, () => {
            assert.throws(() => parse(source), errorPattern)
        })
    }

    it("throws ParseError with trimmed Ohm message", () => {
        assert.throws(
            () => parse("teeOff\n"),
            (err) => err instanceof ParseError && /Line 2/.test(err.message),
        )
    })
})