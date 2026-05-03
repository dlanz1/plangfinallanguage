import { describe, it } from "node:test"
import assert from "node:assert/strict"
import compile from "../src/compiler.js"
import { CompileUserError } from "../src/errors.js"

describe("compiler", () => {
    it("parsed mode returns syntax ok for minimal program", () => {
        const out = compile(
            `
teeOff
clubHouse
`,
            "parsed",
        )
        assert.equal(out, "Syntax is ok")
    })

    it("rejects unknown output type with CompileUserError", () => {
        assert.throws(
            () => compile("teeOff\nclubHouse\n", "typo"),
            (e) => e instanceof CompileUserError && /Unknown output type/.test(e.message),
        )
    })

    it("analyzed mode surfaces not implemented from analyzer", () => {
        assert.throws(
            () =>
                compile(
                    `
teeOff
clubHouse
`,
                    "analyzed",
                ),
            /Not implemented yet/,
        )
    })
})
