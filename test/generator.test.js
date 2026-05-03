import { describe, it } from "node:test"
import assert from "node:assert/strict"
import generate from "../src/generator.js"
import optimize from "../src/optimizer.js"
import analyze from "../src/analyzer.js"
import { parse } from "../src/parser.js"

function dedent(s) {
  return `${s}`
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .replace(/(?<=\n) {6}/g, "")
}

function compile(source) {
  return generate(optimize(analyze(parse(source))))
}

const fixtures = [
  {
    name: "variables and constants",
    source: `
teeOff
  bag score = 70 + 2;
  pin par = 72;
  score = score - 1;
  print(score);
clubHouse
`,
    expected: dedent`
let score = 72;
const par = 72;
score = (score - 1);
console.log(score);
`,
  },

  {
    name: "booleans and conditionals",
    source: `
teeOff
  bag madePutt = fairway;

  readLie madePutt {
    print("Nice putt!");
  } otherwise {
    print("Try again.");
  }
clubHouse
`,
    expected: dedent`
let madePutt = true;
if (madePutt) {
  console.log("Nice putt!");
} else {
  console.log("Try again.");
}
`,
  },

  {
    name: "short readLie",
    source: `
teeOff
  bag underPar = fairway;

  readLie underPar {
    print("Under par!");
  }
clubHouse
`,
    expected: dedent`
let underPar = true;
if (underPar) {
  console.log("Under par!");
}
`,
  },

  {
    name: "whileBall loop",
    source: `
teeOff
  bag strokes = 0;

  whileBall strokes < 3 {
    print(strokes);
    strokes = strokes + 1;
  }
clubHouse
`,
    expected: dedent`
let strokes = 0;
while ((strokes < 3)) {
  console.log(strokes);
  strokes = (strokes + 1);
}
`,
  },

  {
    name: "practice loop",
    source: `
teeOff
  bag strokes = 0;

  practice {
    strokes = strokes + 1;
  } whileBall strokes < 3;
clubHouse
`,
    expected: dedent`
let strokes = 0;
do {
  strokes = (strokes + 1);
} while ((strokes < 3));
`,
  },

  {
    name: "play through array loop",
    source: `
teeOff
  bag scores = [70, 72, 74];

  play score through scores {
    print(score);
  }
clubHouse
`,
    expected: dedent`
let scores = [70, 72, 74];
for (let score of scores) {
  console.log(score);
}
`,
  },

  {
    name: "function declaration and call",
    source: `
teeOff
  swing relativeToPar(score: int): int {
    sink score - 72;
  }

  bag result = relativeToPar(70);
  print(result);
clubHouse
`,
    expected: dedent`
function relativeToPar(score) {
  return (score - 72);
}
let result = relativeToPar(70);
console.log(result);
`,
  },

  {
    name: "void function and empty sink",
    source: `
teeOff
  swing sayHi() {
    print("hi");
    sink;
  }

  sayHi();
clubHouse
`,
    expected: dedent`
function sayHi() {
  console.log("hi");
  return;
}
sayHi();
`,
  },

  {
    name: "arrays and indexing",
    source: `
teeOff
  bag scores = [70, 72, 74];
  bag first = scores[0];
  bag emptyScores = [int]();
  print(first);
clubHouse
`,
    expected: dedent`
let scores = [70, 72, 74];
let first = scores[0];
let emptyScores = [];
console.log(first);
`,
  },

  {
    name: "optionals and null coalescing",
    source: `
teeOff
  bag maybeScore: int? = hazard int;
  bag score = maybeScore ?? 72;
  print(score);
clubHouse
`,
    expected: dedent`
let maybeScore = undefined;
let score = (maybeScore ?? 72);
console.log(score);
`,
  },

  {
    name: "loft and bounce",
    source: `
teeOff
  bag maybeScore: int? = hazard int;
  bag hasScore = loft maybeScore;
  bag score = bounce maybeScore;
clubHouse
`,
    expected: dedent`
let maybeScore = undefined;
let hasScore = (maybeScore !== undefined);
let score = maybeScore;
`,
  },

  {
    name: "length operator",
    source: `
teeOff
  bag scores = [70, 72, 74];
  bag count = #scores;
  print(count);
clubHouse
`,
    expected: dedent`
let scores = [70, 72, 74];
let count = scores.length;
console.log(count);
`,
  },

  {
    name: "ternary expression",
    source: `
teeOff
  bag score = fairway ? 72 : 100;
  print(score);
clubHouse
`,
    expected: dedent`
let score = 72;
console.log(score);
`,
  },

  {
    name: "shank break",
    source: `
teeOff
  whileBall fairway {
    shank;
  }
clubHouse
`,
    expected: dedent`
while (true) {
  break;
}
`,
  },
]

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected JavaScript for ${fixture.name}`, () => {
      assert.equal(compile(fixture.source), fixture.expected)
    })
  }
})