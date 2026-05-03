import { describe, it } from "node:test"
import assert from "node:assert/strict"
import compile from "../src/compiler.js"

const sampleProgram = `
teeOff
  print(0);
clubHouse
`

describe("The compiler", () => {
  it("throws when the output type is missing", () => {
    assert.throws(() => compile(sampleProgram), /Unknown output type/)
  })

  it("throws when the output type is unknown", () => {
    assert.throws(() => compile(sampleProgram, "no such type"), /Unknown output type/)
  })

  it("accepts the parsed option", () => {
    const compiled = compile(sampleProgram, "parsed")
    assert.equal(compiled, "Syntax is ok")
  })

  it("accepts the analyzed option", () => {
    const compiled = compile(sampleProgram, "analyzed")
    assert.equal(compiled.kind, "Program")
  })

  it("accepts the optimized option", () => {
    const compiled = compile(sampleProgram, "optimized")
    assert.equal(compiled.kind, "Program")
  })

  it("generates js code when given the js option", () => {
    const compiled = compile(sampleProgram, "js")
    assert.equal(compiled, "console.log(0);")
  })

  it("compiles a program with declarations to js", () => {
    const source = `
teeOff
  bag score = 70 + 2;
  pin par = 72;
  print(score);
clubHouse
`
    const compiled = compile(source, "js")
    assert.equal(
      compiled,
      `let score = 72;
const par = 72;
console.log(score);`,
    )
  })

  it("compiles a function program to js", () => {
    const source = `
teeOff
  swing relativeToPar(score: int): int {
    sink score - 72;
  }

  bag result = relativeToPar(70);
  print(result);
clubHouse
`
    const compiled = compile(source, "js")
    assert.equal(
      compiled,
      `function relativeToPar(score) {
  return (score - 72);
}
let result = relativeToPar(70);
console.log(result);`,
    )
  })

  it("throws for syntactically invalid programs", () => {
    assert.throws(
      () =>
        compile(
          `
teeOff
  bag score = ;
clubHouse
`,
          "parsed",
        ),
      /Line/,
    )
  })

  it("throws for semantically invalid programs", () => {
    assert.throws(
      () =>
        compile(
          `
teeOff
  bag score: int = "bad";
clubHouse
`,
          "analyzed",
        ),
      /Cannot assign|int|string|Line/i,
    )
  })
})