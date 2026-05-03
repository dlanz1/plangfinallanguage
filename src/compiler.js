import { parse } from "./parser.js"
import analyze from "./analyzer.js"
import optimize from "./optimizer.js"
import generate from "./generator.js"
import { CompileUserError } from "./errors.js"

const OUTPUT_MODES = ["parsed", "analyzed", "optimized", "js"]

export default function compile(source, outputType) {
    if (!OUTPUT_MODES.includes(outputType)) {
        throw new CompileUserError(
            `Unknown output type "${outputType}". Use one of: ${OUTPUT_MODES.join(", ")}`,
        )
    }
    const match = parse(source)
    if (outputType === "parsed") return "Syntax is ok"
    const analyzed = analyze(match)
    if (outputType === "analyzed") return analyzed
    const optimized = optimize(analyzed)
    if (outputType === "optimized") return optimized
    return generate(optimized)
}