import fs from "node:fs"
import * as ohm from "ohm-js"
import { ParseError } from "./errors.js"

const grammar = ohm.grammar(fs.readFileSync(new URL("./3DTee.ohm", import.meta.url), "utf-8"))

export function match(sourceCode) {
    return grammar.match(sourceCode)
}

export function parse(sourceCode) {
    const result = match(sourceCode)
    if (result.succeeded()) {
        return result
    }
    throw new ParseError(result.message.trim())
}

export default parse
