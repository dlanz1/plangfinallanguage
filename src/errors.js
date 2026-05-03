/** Base for expected user-facing compiler errors (no stack trace in CLI). */
export class CompileUserError extends Error {
    constructor(message) {
        super(message)
        this.name = "CompileUserError"
    }
}

/** Syntax / grammar failure from Ohm (message already includes line/column). */
export class ParseError extends CompileUserError {
    constructor(message) {
        super(message)
        this.name = "ParseError"
    }
}
