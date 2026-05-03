import { describe, it } from "node:test"
import assert from "node:assert/strict"
import analyze from "../src/analyzer.js"
import { parse } from "../src/parser.js"

function analyzed(source) {
  return analyze(parse(source))
}

function assertAnalyzes(source) {
  assert.doesNotThrow(() => analyzed(source))
}

function assertRejects(source, pattern = /./) {
  assert.throws(() => analyzed(source), pattern)
}

describe("The analyzer", () => {
  describe("valid programs", () => {
    it("analyzes a minimal program", () => {
      assertAnalyzes(`
teeOff
clubHouse
`)
    })

    it("analyzes variable declarations with inferred types", () => {
      assertAnalyzes(`
teeOff
  bag score = 72;
  bag name = "Devan";
  bag madePutt = fairway;
clubHouse
`)
    })

    it("analyzes typed variable declarations", () => {
      assertAnalyzes(`
teeOff
  bag score: int = 72;
  bag name: string = "Devan";
  bag madePutt: bool = fairway;
  bag average: float = 72.5;
clubHouse
`)
    })

    it("analyzes constant declarations", () => {
      assertAnalyzes(`
teeOff
  pin par: int = 72;
  pin courseName: string = "Torrey Pines";
clubHouse
`)
    })

    it("analyzes assignments to variables", () => {
      assertAnalyzes(`
teeOff
  bag score = 72;
  score = score - 1;
clubHouse
`)
    })

    it("analyzes arithmetic expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = 1 + 2 * 3 - 4 / 2 % 3;
  bag y = 2 ** 3;
clubHouse
`)
    })

    it("analyzes relational and equality expressions", () => {
      assertAnalyzes(`
teeOff
  bag a = 72 <= 73;
  bag b = 72 == 72;
  bag c = 70 != 71;
clubHouse
`)
    })

    it("analyzes logical expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = fairway && rough || fairway;
clubHouse
`)
    })

    it("analyzes ternary expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = fairway ? 1 : 2;
clubHouse
`)
    })

    it("analyzes arrays", () => {
      assertAnalyzes(`
teeOff
  bag scores: [int] = [70, 72, 74];
  bag first: int = scores[0];
clubHouse
`)
    })

    it("analyzes typed empty arrays", () => {
      assertAnalyzes(`
teeOff
  bag scores: [int] = [int]();
clubHouse
`)
    })

    it("analyzes function declarations and calls", () => {
      assertAnalyzes(`
teeOff
  swing addOne(x: int): int {
    sink x + 1;
  }

  bag y = addOne(5);
clubHouse
`)
    })

    it("analyzes function calls as statements", () => {
      assertAnalyzes(`
teeOff
  swing sayHi() {
    print("hi");
  }

  sayHi();
clubHouse
`)
    })

    it("analyzes return without value in a void function", () => {
      assertAnalyzes(`
teeOff
  swing done() {
    sink;
  }
clubHouse
`)
    })

    it("analyzes if statements", () => {
      assertAnalyzes(`
teeOff
  bag score = 72;

  readLie score <= 72 {
    print("good");
  } otherwise {
    print("practice");
  }
clubHouse
`)
    })

    it("analyzes short if statements", () => {
      assertAnalyzes(`
teeOff
  readLie fairway {
    print("yes");
  }
clubHouse
`)
    })

    it("analyzes while loops", () => {
      assertAnalyzes(`
teeOff
  bag strokes = 0;

  whileBall strokes < 5 {
    strokes = strokes + 1;
  }
clubHouse
`)
    })

    it("analyzes practice loops", () => {
      assertAnalyzes(`
teeOff
  bag strokes = 0;

  practice {
    strokes = strokes + 1;
  } whileBall strokes < 5;
clubHouse
`)
    })

    it("analyzes shank inside a loop", () => {
      assertAnalyzes(`
teeOff
  whileBall fairway {
    shank;
  }
clubHouse
`)
    })

    it("analyzes play through collection loops", () => {
      assertAnalyzes(`
teeOff
  bag scores: [int] = [70, 72, 74];

  play score through scores {
    print(score);
  }
clubHouse
`)
    })

    it("analyzes optional values", () => {
      assertAnalyzes(`
teeOff
  bag maybeScore: int? = hazard int;
  bag score = maybeScore ?? 72;
clubHouse
`)
    })

    it("analyzes loft and bounce on optionals", () => {
      assertAnalyzes(`
teeOff
  bag maybeScore: int? = hazard int;
  bag hasScore = loft maybeScore;
  bag score = bounce maybeScore;
clubHouse
`)
    })

    it("analyzes course declarations", () => {
      assertAnalyzes(`
teeOff
  course Player {
    name: string;
    score: int;
  }
clubHouse
`)
    })
  })

  describe("invalid programs", () => {
    it("rejects use before declaration", () => {
      assertRejects(
        `
teeOff
  bag x = y;
clubHouse
`,
        /declared|defined|identifier|variable/i,
      )
    })

    it("rejects duplicate declarations in the same scope", () => {
      assertRejects(
        `
teeOff
  bag score = 72;
  bag score = 73;
clubHouse
`,
        /duplicate|already/i,
      )
    })

    it("rejects assigning wrong type to typed variable", () => {
      assertRejects(
        `
teeOff
  bag score: int = "seventy two";
clubHouse
`,
        /type|int|string/i,
      )
    })

    it("rejects assigning wrong type to typed constant", () => {
      assertRejects(
        `
teeOff
  pin par: int = rough;
clubHouse
`,
        /type|int|bool/i,
      )
    })

    it("rejects reassignment to constants", () => {
      assertRejects(
        `
teeOff
  pin par = 72;
  par = 71;
clubHouse
`,
        /constant|pin|assign/i,
      )
    })

    it("rejects non-bool readLie condition", () => {
      assertRejects(
        `
teeOff
  readLie 72 {
    print("bad");
  }
clubHouse
`,
        /bool|condition/i,
      )
    })

    it("rejects non-bool whileBall condition", () => {
      assertRejects(
        `
teeOff
  whileBall 72 {
    print("bad");
  }
clubHouse
`,
        /bool|condition/i,
      )
    })

    it("rejects non-bool practice condition", () => {
      assertRejects(
        `
teeOff
  practice {
    print("again");
  } whileBall 72;
clubHouse
`,
        /bool|condition/i,
      )
    })

    it("rejects shank outside loops", () => {
      assertRejects(
        `
teeOff
  shank;
clubHouse
`,
        /loop|shank|break/i,
      )
    })

    it("rejects sink outside functions", () => {
      assertRejects(
        `
teeOff
  sink 1;
clubHouse
`,
        /function|sink|return/i,
      )
    })

    it("rejects return value with wrong function return type", () => {
      assertRejects(
        `
teeOff
  swing f(): int {
    sink "bad";
  }
clubHouse
`,
        /return|type|int|string/i,
      )
    })

    it("rejects missing return value in non-void function", () => {
      assertRejects(
        `
teeOff
  swing f(): int {
    sink;
  }
clubHouse
`,
        /return|type|int|void/i,
      )
    })

    it("rejects function call with too few arguments", () => {
      assertRejects(
        `
teeOff
  swing add(x: int, y: int): int {
    sink x + y;
  }

  bag z = add(1);
clubHouse
`,
        /argument|arity|parameter/i,
      )
    })

    it("rejects function call with too many arguments", () => {
      assertRejects(
        `
teeOff
  swing add(x: int): int {
    sink x;
  }

  bag z = add(1, 2);
clubHouse
`,
        /argument|arity|parameter/i,
      )
    })

    it("rejects function call with wrong argument type", () => {
      assertRejects(
        `
teeOff
  swing addOne(x: int): int {
    sink x + 1;
  }

  bag z = addOne("bad");
clubHouse
`,
        /argument|type|int|string/i,
      )
    })

    it("rejects calling a non-function", () => {
      assertRejects(
        `
teeOff
  bag x = 1;
  x();
clubHouse
`,
        /function|call/i,
      )
    })

    it("rejects mixed array literal element types", () => {
      assertRejects(
        `
teeOff
  bag xs = [1, "two", 3];
clubHouse
`,
        /array|type/i,
      )
    })

    it("rejects array indexing with non-int index", () => {
      assertRejects(
        `
teeOff
  bag xs = [1, 2, 3];
  bag x = xs["zero"];
clubHouse
`,
        /index|int/i,
      )
    })

    it("rejects indexing a non-array", () => {
      assertRejects(
        `
teeOff
  bag x = 1;
  bag y = x[0];
clubHouse
`,
        /array|index/i,
      )
    })

    it("rejects null coalescing with non-optional left operand", () => {
      assertRejects(
        `
teeOff
  bag x = 1 ?? 2;
clubHouse
`,
        /optional|\?\?/i,
      )
    })

    it("rejects null coalescing fallback with wrong type", () => {
      assertRejects(
        `
teeOff
  bag maybeScore: int? = hazard int;
  bag score = maybeScore ?? "bad";
clubHouse
`,
        /optional|type|int|string/i,
      )
    })

    it("rejects bounce on non-optional value", () => {
      assertRejects(
        `
teeOff
  bag score = 72;
  bag x = bounce score;
clubHouse
`,
        /optional|bounce/i,
      )
    })

    it("rejects duplicate course fields", () => {
      assertRejects(
        `
teeOff
  course Player {
    score: int;
    score: int;
  }
clubHouse
`,
        /field|duplicate|already/i,
      )
    })
  })
})