export default function generate(program) {
  const output = []
  let depth = 0

  const push = line => {
    output.push("  ".repeat(depth) + line)
  }

  const gen = node => {
    if (node == null) return ""
    return generators[node.kind]?.(node) ?? node
  }

  function emitBlock(block) {
    depth++
    block.statements.forEach(gen)
    depth--
  }

  function generateBinaryExpression(expression) {
    const op =
      {
        "==": "===",
        "!=": "!==",
      }[expression.op] ?? expression.op

    return `(${gen(expression.left)} ${op} ${gen(expression.right)})`
  }

  const generators = {
    Program(program) {
      program.statements.forEach(gen)
    },

    Block(block) {
      emitBlock(block)
    },

    VariableDeclaration(declaration) {
      push(`let ${declaration.id} = ${gen(declaration.initializer)};`)
    },

    ConstantDeclaration(declaration) {
      push(`const ${declaration.id} = ${gen(declaration.initializer)};`)
    },

    CourseDeclaration(declaration) {
      push(`class ${declaration.id} {`)
      push(
        `  constructor(${declaration.fields.map(field => gen(field)).join(", ")}) {`,
      )

      for (const field of declaration.fields) {
        push(`    this.${field.id} = ${field.id};`)
      }

      push("  }")
      push("}")
    },

    Field(field) {
      return field.id
    },

    FunctionDeclaration(declaration) {
      push(
        `function ${declaration.id}(${declaration.params.map(param => gen(param)).join(", ")}) {`,
      )
      emitBlock(declaration.body)
      push("}")
    },

    Parameter(parameter) {
      return parameter.id
    },

    AssignmentStatement(statement) {
      push(`${gen(statement.target)} = ${gen(statement.source)};`)
    },

    CallStatement(statement) {
      push(`${gen(statement.call)};`)
    },

    IfStatement(statement) {
      push(`if (${gen(statement.test)}) {`)
      emitBlock(statement.consequent)

      if (statement.alternate) {
        push("} else {")
        emitBlock(statement.alternate)
        push("}")
      } else {
        push("}")
      }
    },

    WhileStatement(statement) {
      push(`while (${gen(statement.test)}) {`)
      emitBlock(statement.body)
      push("}")
    },

    PracticeStatement(statement) {
      push("do {")
      emitBlock(statement.body)
      push(`} while (${gen(statement.test)});`)
    },

    ForStatement(statement) {
      push(`for (let ${statement.iterator} of ${gen(statement.collection)}) {`)
      emitBlock(statement.body)
      push("}")
    },

    BreakStatement() {
      push("break;")
    },

    ReturnStatement(statement) {
      if (statement.expression) {
        push(`return ${gen(statement.expression)};`)
      } else {
        push("return;")
      }
    },

    IdentifierExpression(expression) {
      return expression.name
    },

    IntegerLiteral(literal) {
      return literal.value.toString()
    },

    FloatLiteral(literal) {
      return literal.value.toString()
    },

    BooleanLiteral(literal) {
      return literal.value ? "true" : "false"
    },

    StringLiteral(literal) {
      return literal.value
    },

    ArrayLiteral(expression) {
      return `[${expression.elements.map(gen).join(", ")}]`
    },

    EmptyArrayLiteral() {
      return "[]"
    },

    EmptyOptionalExpression() {
      return "undefined"
    },

    UnaryExpression(expression) {
      const operand = gen(expression.operand)

      if (expression.op === "#") {
        return `${operand}.length`
      }

      if (expression.op === "loft") {
        return `(${operand} !== undefined)`
      }

      if (expression.op === "bounce") {
        return operand
      }

      if (expression.op === "-") {
        return `-(${operand})`
      }

      if (expression.op === "!") {
        return `!(${operand})`
      }

      return `${expression.op}(${operand})`
    },

    BinaryExpression(expression) {
      if (expression.op === "??") {
        return `(${gen(expression.left)} ?? ${gen(expression.right)})`
      }

      return generateBinaryExpression(expression)
    },

    TernaryExpression(expression) {
      return `(${gen(expression.test)} ? ${gen(expression.consequent)} : ${gen(expression.alternate)})`
    },

    CallExpression(expression) {
      if (
        expression.callee.kind === "IdentifierExpression" &&
        expression.callee.name === "print"
      ) {
        return `console.log(${expression.args.map(gen).join(", ")})`
      }

      return `${gen(expression.callee)}(${expression.args.map(gen).join(", ")})`
    },

    SubscriptExpression(expression) {
      return `${gen(expression.array)}[${gen(expression.index)}]`
    },

    MemberExpression(expression) {
      return `${gen(expression.object)}.${expression.field}`
    },
  }

  gen(program)
  return output.join("\n")
}
