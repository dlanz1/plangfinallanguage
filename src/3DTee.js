#! /usr/bin/env node

import * as fs from "node:fs/promises"
import util from "node:util"
import compile from "./compiler.js"
import { CompileUserError, ParseError } from "./errors.js"

const OUTPUT_MODES = ["parsed", "analyzed", "optimized", "js"]

const help = `3DTee compiler

Usage:
  node src/3DTee.js <file.3dt> <outputType>
  3dtee <file.3dt> <outputType>          (if npm link / global bin)

outputType must be one of:
  parsed      Grammar match only — prints "Syntax is ok"
  analyzed    Static analysis (not yet implemented)
  optimized   Optimized IR (not yet implemented)
  js          JavaScript output (not yet implemented)
`

function exitWithError(message, code = 1) {
    console.error(message)
    process.exit(code)
}

async function compileFromFile(filename, outputType) {
    if (!OUTPUT_MODES.includes(outputType)) {
        exitWithError(
            `Unknown output type "${outputType}". Use one of: ${OUTPUT_MODES.join(", ")}`,
            2,
        )
    }

    let source
    try {
        const buffer = await fs.readFile(filename)
        source = buffer.toString()
    } catch (err) {
        if (err && err.code === "ENOENT") {
            exitWithError(`File not found: ${filename}`, 1)
        }
        exitWithError(err instanceof Error ? err.message : String(err), 1)
    }

    try {
        const compiled = compile(source, outputType)
        if (typeof compiled === "string") {
            console.log(compiled)
        } else {
            console.log(util.inspect(compiled, { depth: null, colors: false }))
        }
        process.exit(0)
    } catch (e) {
        if (e instanceof ParseError || e instanceof CompileUserError) {
            exitWithError(e.message, 1)
        }
        if (e instanceof Error && e.message === "Not implemented yet") {
            exitWithError(e.message, 1)
        }
        console.error(e instanceof Error ? e.message : String(e))
        process.exit(1)
    }
}

if (process.argv.length === 4) {
    await compileFromFile(process.argv[2], process.argv[3])
} else {
    console.error(help.trimEnd())
    process.exit(2)
}
