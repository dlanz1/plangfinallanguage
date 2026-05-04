import { describe, it } from "node:test"
import assert from "node:assert/strict"
import analyze, { typeDescription } from "../src/analyzer.js"
import * as core from "../src/core.js"
import { parse } from "../src/parser.js"
import { CompileUserError } from "../src/errors.js"

function analyzed(source) {
  return analyze(parse(source))
}

function assertAnalyzes(source) {
  assert.doesNotThrow(() => analyzed(source))
}

function assertRejects(source, pattern = /Line|Expected|Cannot|Identifier|argument|field|return|shank|sink/i) {
  assert.throws(
    () => analyzed(source),
    error => error instanceof CompileUserError && pattern.test(error.message),
  )
}

describe("The analyzer", () => {
  describe("valid programs", () => {
    it("analyzes a minimal program", () => {
      assertAnalyzes(`
teeOff
clubHouse
`)
    })

    it("analyzes inferred variable declarations", () => {
      assertAnalyzes(`
teeOff
  bag score = 72;
  bag name = "Devan";
  bag madePutt = fairway;
  bag average = 72.5;
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

    it("allows assigning int to float", () => {
      assertAnalyzes(`
teeOff
  bag average: float = 72;
clubHouse
`)
    })

    it("analyzes constants", () => {
      assertAnalyzes(`
teeOff
  pin par: int = 72;
  pin courseName: string = "Torrey Pines";
clubHouse
`)
    })

    it("analyzes assignments", () => {
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

    it("analyzes numeric comparisons", () => {
      assertAnalyzes(`
teeOff
  bag a = 72 <= 73;
  bag b = 72 == 72;
  bag c = 70 != 71;
clubHouse
`)
    })

    it("analyzes string comparisons", () => {
      assertAnalyzes(`
teeOff
  bag result = "a" < "b";
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

    it("analyzes bitwise expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = 1 | 2 ^ 3 & 4;
clubHouse
`)
    })

    it("analyzes shift expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = 8 << 2 >> 1;
clubHouse
`)
    })

    it("analyzes unary expressions", () => {
      assertAnalyzes(`
teeOff
  bag a = -72;
  bag b = !rough;
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

    it("analyzes length operator", () => {
      assertAnalyzes(`
teeOff
  bag scores = [70, 72, 74];
  bag count = #scores;
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

    it("analyzes function call statements", () => {
      assertAnalyzes(`
teeOff
  swing sayHi() {
    print("hi");
  }

  sayHi();
clubHouse
`)
    })

    it("analyzes empty return in void function", () => {
      assertAnalyzes(`
teeOff
  swing done() {
    sink;
  }
clubHouse
`)
    })

    it("analyzes function type parameters", () => {
      assertAnalyzes(`
teeOff
  swing apply(f: (int) -> int, x: int): int {
    sink f(x);
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

    it("analyzes play through array loops", () => {
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

    it("analyzes loft and bounce", () => {
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

    it("analyzes course type annotations", () => {
      assertAnalyzes(`
teeOff
  course Player {
    score: int;
  }

  bag player = Player;
  bag score = player.score;
clubHouse
`)
    })

    it("analyzes course name in type annotation (Type_id)", () => {
      assertAnalyzes(`
teeOff
  course Hole { score: int; }
  bag h: Hole? = hazard Hole;
clubHouse
`)
    })

    it("accepts parenthesized primary expressions", () => {
      assertAnalyzes(`
teeOff
  bag x = (1 + 2);
  bag b = (fairway);
clubHouse
`)
    })

  })

  describe("invalid programs", () => {
    it("rejects use before declaration", () => {
      assertRejects(`
teeOff
  bag x = y;
clubHouse
`, /not declared/i)
    })

    it("rejects duplicate declarations", () => {
      assertRejects(`
teeOff
  bag score = 72;
  bag score = 73;
clubHouse
`, /already declared/i)
    })

    it("rejects wrong typed variable initializer", () => {
      assertRejects(`
teeOff
  bag score: int = "seventy two";
clubHouse
`, /Cannot assign/i)
    })

    it("rejects wrong typed constant initializer", () => {
      assertRejects(`
teeOff
  pin par: int = rough;
clubHouse
`, /Cannot assign/i)
    })

    it("rejects array type mismatch", () => {
      assertRejects(`
teeOff
  bag scores: [int] = 1;
clubHouse
`, /Cannot assign/i)
    })

    it("rejects optional type mismatch", () => {
      assertRejects(`
teeOff
  bag maybeScore: int? = 72;
clubHouse
`, /Cannot assign/i)
    })

    it("rejects function type mismatch", () => {
      assertRejects(`
teeOff
  bag f: (int) -> int = 1;
clubHouse
`, /Cannot assign/i)
    })

    it("rejects reassignment to constants", () => {
      assertRejects(`
teeOff
  pin par = 72;
  par = 71;
clubHouse
`, /immutable/i)
    })

    it("rejects non-bool readLie condition", () => {
      assertRejects(`
teeOff
  readLie 72 {
    print("bad");
  }
clubHouse
`, /boolean/i)
    })

    it("rejects non-bool whileBall condition", () => {
      assertRejects(`
teeOff
  whileBall 72 {
    print("bad");
  }
clubHouse
`, /boolean/i)
    })

    it("rejects non-bool practice condition", () => {
      assertRejects(`
teeOff
  practice {
    print("again");
  } whileBall 72;
clubHouse
`, /boolean/i)
    })

    it("rejects shank outside loops", () => {
      assertRejects(`
teeOff
  shank;
clubHouse
`, /loop/i)
    })

    it("rejects sink outside functions", () => {
      assertRejects(`
teeOff
  sink 1;
clubHouse
`, /function/i)
    })

    it("rejects return value from void function", () => {
      assertRejects(`
teeOff
  swing f() {
    sink 1;
  }
clubHouse
`, /return a value/i)
    })

    it("rejects empty return from non-void function", () => {
      assertRejects(`
teeOff
  swing f(): int {
    sink;
  }
clubHouse
`, /return no value/i)
    })

    it("rejects wrong return type", () => {
      assertRejects(`
teeOff
  swing f(): int {
    sink "bad";
  }
clubHouse
`, /Cannot assign/i)
    })

    it("rejects too few function arguments", () => {
      assertRejects(`
teeOff
  swing add(x: int, y: int): int {
    sink x + y;
  }

  bag z = add(1);
clubHouse
`, /argument/i)
    })

    it("rejects too many function arguments", () => {
      assertRejects(`
teeOff
  swing add(x: int): int {
    sink x;
  }

  bag z = add(1, 2);
clubHouse
`, /argument/i)
    })

    it("rejects wrong function argument type", () => {
      assertRejects(`
teeOff
  swing addOne(x: int): int {
    sink x + 1;
  }

  bag z = addOne("bad");
clubHouse
`, /Cannot assign/i)
    })

    it("rejects calling a non-function", () => {
      assertRejects(`
teeOff
  bag x = 1;
  x();
clubHouse
`, /non-function/i)
    })

    it("rejects duplicate parameters", () => {
      assertRejects(`
teeOff
  swing bad(x: int, x: int): int {
    sink x;
  }
clubHouse
`, /already declared/i)
    })

    it("rejects mixed array elements", () => {
      assertRejects(`
teeOff
  bag xs = [1, "two", 3];
clubHouse
`, /same type|elements/i)
    })

    it("rejects indexing non-array", () => {
      assertRejects(`
teeOff
  bag x = 72;
  bag y = x[0];
clubHouse
`, /array/i)
    })

    it("rejects non-integer array index", () => {
      assertRejects(`
teeOff
  bag xs = [1, 2, 3];
  bag y = xs["zero"];
clubHouse
`, /integer/i)
    })

    it("rejects null coalescing on non-optional", () => {
      assertRejects(`
teeOff
  bag x = 1 ?? 2;
clubHouse
`, /optional/i)
    })

    it("rejects null coalescing fallback mismatch", () => {
      assertRejects(`
teeOff
  bag maybeScore: int? = hazard int;
  bag score = maybeScore ?? "bad";
clubHouse
`, /Cannot assign/i)
    })

    it("rejects unary minus on strings", () => {
      assertRejects(`
teeOff
  bag x = -"bad";
clubHouse
`, /number/i)
    })

    it("rejects not on integers", () => {
      assertRejects(`
teeOff
  bag x = !72;
clubHouse
`, /boolean/i)
    })

    it("rejects length on non-array", () => {
      assertRejects(`
teeOff
  bag x = #72;
clubHouse
`, /array/i)
    })

    it("rejects loft on non-optional", () => {
      assertRejects(`
teeOff
  bag x = loft 72;
clubHouse
`, /optional/i)
    })

    it("rejects bounce on non-optional", () => {
      assertRejects(`
teeOff
  bag x = bounce 72;
clubHouse
`, /optional/i)
    })

    it("rejects logical or on integers", () => {
      assertRejects(`
teeOff
  bag x = 1 || 2;
clubHouse
`, /boolean/i)
    })

    it("rejects logical and on integers", () => {
      assertRejects(`
teeOff
  bag x = 1 && 2;
clubHouse
`, /boolean/i)
    })

    it("rejects bitwise or on floats", () => {
      assertRejects(`
teeOff
  bag x = 1.5 | 2.5;
clubHouse
`, /integer/i)
    })

    it("rejects bitwise xor on floats", () => {
      assertRejects(`
teeOff
  bag x = 1.5 ^ 2.5;
clubHouse
`, /integer/i)
    })

    it("rejects bitwise and on floats", () => {
      assertRejects(`
teeOff
  bag x = 1.5 & 2.5;
clubHouse
`, /integer/i)
    })

    it("rejects shift with float left operand", () => {
      assertRejects(`
teeOff
  bag x = 1.5 << 2;
clubHouse
`, /integer/i)
    })

    it("rejects shift with float right operand", () => {
      assertRejects(`
teeOff
  bag x = 8 >> 2.5;
clubHouse
`, /integer/i)
    })

    it("rejects subtraction on strings", () => {
      assertRejects(`
teeOff
  bag x = "a" - "b";
clubHouse
`, /number/i)
    })

    it("rejects multiplication on booleans", () => {
      assertRejects(`
teeOff
  bag x = fairway * rough;
clubHouse
`, /number/i)
    })

    it("rejects exponentiation on strings", () => {
      assertRejects(`
teeOff
  bag x = "a" ** "b";
clubHouse
`, /number/i)
    })

    it("rejects ternary with non-boolean condition", () => {
      assertRejects(`
teeOff
  bag x = 1 ? 2 : 3;
clubHouse
`, /boolean/i)
    })

    it("rejects ternary branch mismatch", () => {
      assertRejects(`
teeOff
  bag x = fairway ? 1 : "bad";
clubHouse
`, /same type/i)
    })

    it("rejects comparing different types", () => {
      assertRejects(`
teeOff
  bag x = 1 < "bad";
clubHouse
`, /same type/i)
    })

    it("rejects duplicate course fields", () => {
      assertRejects(`
teeOff
  course Player {
    score: int;
    score: int;
  }
clubHouse
`, /Fields must be distinct/i)
    })

    it("rejects member access on non-course value", () => {
      assertRejects(`
teeOff
  bag x = 72;
  bag y = x.score;
clubHouse
`, /course/i)
    })

    it("rejects missing course field", () => {
      assertRejects(`
teeOff
  course Player {
    score: int;
  }

  bag player = Player;
  bag name = player.name;
clubHouse
`, /No such field/i)
    })

    it("rejects invalid unicode escape", () => {
      assertRejects(`
teeOff
  bag s = "\\u{1111111}";
clubHouse
`, /unicode/i)
    })
  })
})

describe("more branch coverage", () => {
  it("infers an empty array literal as having an any element type", () => {
    assertAnalyzes(`
teeOff
  bag empty = [];
clubHouse
`)
  })

  it("treats subscript and member targets as mutable", () => {
    assertAnalyzes(`
teeOff
  bag scores: [int] = [1, 2, 3];
  scores[0] = 9;

  course Player { score: int; }
  bag p = Player;
  p.score = 5;
clubHouse
`)
  })

  it("rejects assigning to a constant via subscript or member", () => {
    assertRejects(`
teeOff
  pin scores: [int] = [1, 2, 3];
  scores[0] = 9;
clubHouse
`, /immutable/i)
  })

  it("treats two function declarations with matching signatures as assignment-compatible", () => {
    assertAnalyzes(`
teeOff
  swing add(a: int, b: int): int { sink a + b; }
  swing alias(a: int, b: int): int { sink add(a, b); }
clubHouse
`)
  })

  it("allows binding a swing to a typed function variable", () => {
    assertAnalyzes(`
teeOff
  swing add(a: int, b: int): int { sink a + b; }
  bag op: (int, int) -> int = add;
  bag total = op(3, 4);
clubHouse
`)
  })

  it("rejects binding a swing to a typed function variable with mismatched return type", () => {
    assertRejects(`
teeOff
  swing add(a: int, b: int): int { sink a + b; }
  bag op: (int, int) -> bool = add;
clubHouse
`, /Cannot assign/i)
  })

  it("rejects binding a swing to a typed function variable with mismatched arity", () => {
    assertRejects(`
teeOff
  swing add(a: int, b: int): int { sink a + b; }
  bag op: (int) -> int = add;
clubHouse
`, /Cannot assign/i)
  })

  it("rejects binding a swing to a typed function variable with a mismatched parameter type", () => {
    assertRejects(`
teeOff
  swing greet(name: string): int { sink 1; }
  bag op: (int) -> int = greet;
clubHouse
`, /Cannot assign/i)
  })
})

describe("typeDescription", () => {
  it("returns unknown for nullish or unrecognized types", () => {
    assert.equal(typeDescription(null), "unknown")
    assert.equal(typeDescription(undefined), "unknown")
    assert.equal(typeDescription({ kind: "Weird" }), "unknown")
  })

  it("formats array, optional, and function types", () => {
    assert.equal(typeDescription(new core.ArrayType(core.intType)), "[int]")
    assert.equal(typeDescription(new core.OptionalType(core.intType)), "int?")
    assert.equal(
      typeDescription(new core.FunctionType([core.intType, core.boolType], core.stringType)),
      "(int, bool) -> string",
    )
  })
})