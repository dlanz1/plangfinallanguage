import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import vm from "node:vm"
import compile from "../src/compiler.js"

const examplesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "examples",
)

function load(name) {
  return readFileSync(path.join(examplesDir, `${name}.3dt`), "utf8")
}

const expectedJs = {
  caddie: [
    "function applyFn(f, x) {",
    "  return f(x);",
    "}",
    "let helper = undefined;",
  ].join("\n"),

  course_stats: [
    'let courseName = "Pebble\\\\nBeach\\\\u{26F3}";',
    'let player = "コンパイラ";',
    "let strokes = 71;",
  ].join("\n"),

  front_nine: [
    "let powerScore = 16;",
    "let science = 25;",
    "let mask = 0;",
  ].join("\n"),

  handicap: [
    "function relativeToPar(score, par) {",
    "  return (score - par);",
    "}",
    "let today = relativeToPar(74, 72);",
  ].join("\n"),

  leaderboard: [
    "let strokes = 0;",
    "while ((strokes < 5)) {",
    "  strokes = (strokes + 1);",
    "  if ((strokes === 3)) {",
    "    break;",
    "  }",
    "}",
    "do {",
    "  strokes = (strokes - 1);",
    "} while ((strokes > 0));",
  ].join("\n"),

  scorecard: [
    "class HoleScore {",
    "  constructor(hole, strokes) {",
    "    this.hole = hole;",
    "    this.strokes = strokes;",
    "  }",
    "}",
    "let totals = [3, 4, 5, 4];",
    "let backups = [];",
    "let holes = totals.length;",
    "let first = totals[0];",
    "for (let s of totals) {",
    "  console.log(s);",
    "}",
  ].join("\n"),

  tee_time: [
    "let preferred = undefined;",
    'let teeTime = (preferred ?? "07:30");',
  ].join("\n"),
}

describe("Each example program", () => {
  for (const name of Object.keys(expectedJs)) {
    it(`${name}.3dt parses, analyzes, optimizes, and generates expected JS`, () => {
      const source = load(name)

      assert.equal(compile(source, "parsed"), "Syntax is ok")
      assert.equal(compile(source, "analyzed").kind, "Program")
      assert.equal(compile(source, "optimized").kind, "Program")
      assert.equal(compile(source, "js"), expectedJs[name])
    })

    it(`${name}.3dt generated JS executes without throwing`, () => {
      const source = load(name)
      const js = compile(source, "js")
      const sandbox = { console: { log() {} } }
      vm.createContext(sandbox)
      assert.doesNotThrow(() => vm.runInContext(js, sandbox))
    })
  }
})
