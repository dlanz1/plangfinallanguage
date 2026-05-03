import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parse, match } from "../src/parser.js"
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
    "variable declaration",
    `
teeOff
  bag score = 72;
clubHouse
`,
  ],

  [
    "constant declaration",
    `
teeOff
  pin par = 72;
clubHouse
`,
  ],

  [
    "typed declarations",
    `
teeOff
  bag score: int = 72;
  pin playerName: string = "Devan";
clubHouse
`,
  ],

  [
    "assignment",
    `
teeOff
  bag score = 72;
  score = score - 1;
clubHouse
`,
  ],

  [
    "boolean literals",
    `
teeOff
  bag madePutt: bool = fairway;
  bag missedPutt: bool = rough;
clubHouse
`,
  ],

  [
    "arithmetic expressions",
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
    "relational expression",
    `
teeOff
  bag x = 72 <= 73;
clubHouse
`,
  ],

  [
    "logical expressions",
    `
teeOff
  bag x = fairway && rough || fairway;
clubHouse
`,
  ],

  [
    "bitwise expressions",
    `
teeOff
  bag x = 1 | 2 ^ 3 & 4;
clubHouse
`,
  ],

  [
    "shift expressions",
    `
teeOff
  bag x = 8 << 2 >> 1;
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
    "null coalescing",
    `
teeOff
  bag x = (hazard int) ?? 5;
clubHouse
`,
  ],

  [
    "integer and float literals",
    `
teeOff
  bag a = 10;
  bag b = 3.14;
  bag c = 1.5e+2;
  bag d = 2e3;
clubHouse
`,
  ],

  [
    "string escapes",
    `
teeOff
  bag s = "line\\n\\t\\u{1f3cc}";
clubHouse
`,
  ],

  [
    "array literal",
    `
teeOff
  bag scores = [70, 72, 74];
clubHouse
`,
  ],

  [
    "typed empty array literal",
    `
teeOff
  bag scores = [int]();
clubHouse
`,
  ],

  [
    "array indexing",
    `
teeOff
  bag scores = [70, 72, 74];
  bag first = scores[0];
clubHouse
`,
  ],

  [
    "course declaration",
    `
teeOff
  course Player {
    name: string;
    score: int;
  }
clubHouse
`,
  ],

  [
    "member access",
    `
teeOff
  bag player = golfer;
  bag playerScore = player.score;
clubHouse
`,
  ],

  [
    "function declaration",
    `
teeOff
  swing relativeToPar(s: int): int {
    sink s - 72;
  }
clubHouse
`,
  ],

  [
    "function declaration without return type",
    `
teeOff
  swing sayHi() {
    print("hi");
  }
clubHouse
`,
  ],

  [
    "function call statement",
    `
teeOff
  swing sayHi(): int {
    sink 1;
  }

  sayHi();
clubHouse
`,
  ],

  [
    "function call expression",
    `
teeOff
  swing addOne(x: int): int {
    sink x + 1;
  }

  bag y = addOne(5);
clubHouse
`,
  ],

  [
    "function type parameter",
    `
teeOff
  swing apply(f: (int) -> int, x: int): int {
    sink f(x);
  }
clubHouse
`,
  ],

  [
    "array type parameter",
    `
teeOff
  swing first(scores: [int]): int {
    sink scores[0];
  }
clubHouse
`,
  ],

  [
    "optional type and hazard",
    `
teeOff
  bag maybeScore: int? = hazard int;
clubHouse
`,
  ],

  [
    "loft and bounce unary expressions",
    `
teeOff
  bag maybeScore: int? = hazard int;
  bag hasScore = loft maybeScore;
  bag realScore = bounce maybeScore;
clubHouse
`,
  ],

  [
    "length operator",
    `
teeOff
  bag scores = [70, 72, 74];
  bag count = #scores;
clubHouse
`,
  ],

  [
    "readLie with otherwise",
    `
teeOff
  bag score = 72;
  pin par = 72;

  readLie score <= par {
    print("Under or at par!");
  } otherwise {
    print("Keep practicing.");
  }
clubHouse
`,
  ],

  [
    "readLie without otherwise",
    `
teeOff
  readLie fairway {
    bag x = 1;
  }
clubHouse
`,
  ],

  [
    "whileBall loop",
    `
teeOff
  bag strokes = 0;

  whileBall strokes < 5 {
    strokes = strokes + 1;
  }
clubHouse
`,
  ],

  [
    "practice loop",
    `
teeOff
  bag strokes = 0;

  practice {
    strokes = strokes + 1;
  } whileBall strokes < 5;
clubHouse
`,
  ],

  [
    "play through loop",
    `
teeOff
  bag scores = [70, 72, 74];

  play score through scores {
    print(score);
  }
clubHouse
`,
  ],

  [
    "shank in loop",
    `
teeOff
  whileBall fairway {
    shank;
  }
clubHouse
`,
  ],

  [
    "empty sink",
    `
teeOff
  swing done() {
    sink;
  }
clubHouse
`,
  ],

  [
    "line comments",
    `
teeOff
  // Store the player's score
  bag score = 72;
clubHouse
`,
  ],

  [
    "identifier that starts with keyword",
    `
teeOff
  bag player = golfer;
  bag playerScore = player.score;
clubHouse
`,
  ],
]

const badPrograms = [
  [
    "missing teeOff",
    `
bag score = 72;
clubHouse
`,
  ],

  [
    "missing clubHouse",
    `
teeOff
  bag score = 72;
`,
  ],

  [
    "missing semicolon after declaration",
    `
teeOff
  bag score = 72
clubHouse
`,
  ],

  [
    "missing semicolon after assignment",
    `
teeOff
  bag score = 72;
  score = 71
clubHouse
`,
  ],

  [
    "bad float literal",
    `
teeOff
  bag x = 2.;
clubHouse
`,
  ],

  [
    "unclosed string",
    `
teeOff
  bag s = "oops;
clubHouse
`,
  ],

  [
    "keyword used as identifier",
    `
teeOff
  bag bag = 1;
clubHouse
`,
  ],

  [
    "missing block braces in readLie",
    `
teeOff
  readLie fairway bag x = 1;
clubHouse
`,
  ],

  [
    "missing block braces in whileBall",
    `
teeOff
  whileBall fairway bag x = 1;
clubHouse
`,
  ],

  [
    "old increment syntax not supported",
    `
teeOff
  bag i = 0;
  i++;
clubHouse
`,
  ],

  [
    "old decrement syntax not supported",
    `
teeOff
  bag i = 0;
  i--;
clubHouse
`,
  ],

  [
    "old practice count syntax not supported",
    `
teeOff
  practice 2 {
    print("again");
  }
clubHouse
`,
  ],

  [
    "old else-if syntax not supported",
    `
teeOff
  readLie fairway {
    bag x = 1;
  } otherwise readLie rough {
    bag y = 2;
  }
clubHouse
`,
  ],

  [
    "optional chaining not supported",
    `
teeOff
  bag h = hazard int;
  bag x = h?.score;
clubHouse
`,
  ],

  [
    "range syntax not supported by current grammar",
    `
teeOff
  play i through 1...3 {
    print(i);
  }
clubHouse
`,
  ],
]

describe("The parser", () => {
  for (const [scenario, source] of okPrograms) {
    it(`matches ${scenario}`, () => {
      assert.ok(match(source).succeeded())
      assert.ok(parse(source).succeeded())
    })
  }

  for (const [scenario, source] of badPrograms) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => parse(source), ParseError)
    })
  }

  it("throws ParseError with Ohm line and column information", () => {
    assert.throws(
      () => parse("teeOff\n"),
      (error) =>
        error instanceof ParseError &&
        /Line/.test(error.message) &&
        /col/.test(error.message),
    )
  })
})