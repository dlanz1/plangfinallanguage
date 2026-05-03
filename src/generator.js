import { voidType } from "./core.js"

export default function generate(program) {
  const output = []

  const gen = node => {
    if (node == null) return ""
    return generators[node.kind]?.(node) ?? node
  }

  function emitBlock(block) {
    block.statements.forEach(gen)
  }

  function parenthesize(expression) {
    return `(${expression})`
  }

  function generateBinaryExpression(expression) {
    const op = {
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
      output.push(`let ${declaration.id} = ${gen(declaration.initializer)};`)
    },

    ConstantDeclaration(declaration) {
      output.push(`const ${declaration.id} = ${gen(declaration.initializer)};`)
    },

    CourseDeclaration(declaration) {
      output.push(`class ${declaration.id} {`)
      output.push(`  constructor(${declaration.fields.map(field => field.id).join(", ")}) {`)

      for (const field of declaration.fields) {
        output.push(`    this.${field.id} = ${field.id};`)
      }

      output.push("  }")
      output.push("}")
    },

    Field(field) {
      return field.id
    },

    FunctionDeclaration(declaration) {
      output.push(
        `function ${declaration.id}(${declaration.params.map(param => param.id).join(", ")}) {`,
      )
      emitBlock(declaration.body)
      output.push("}")
    },

    Parameter(parameter) {
      return parameter.id
    },

    AssignmentStatement(statement) {
      output.push(`${gen(statement.target)} = ${gen(statement.source)};`)
    },

    CallStatement(statement) {
      output.push(`${gen(statement.call)};`)
    },

    IfStatement(statement) {
      output.push(`if (${gen(statement.test)}) {`)
      emitBlock(statement.consequent)

      if (statement.alternate) {
        output.push("} else {")
        emitBlock(statement.alternate)
        output.push("}")
      } else {
        output.push("}")
      }
    },

    WhileStatement(statement) {
      output.push(`while (${gen(statement.test)}) {`)
      emitBlock(statement.body)
      output.push("}")
    },

    PracticeStatement(statement) {
      output.push("do {")
      emitBlock(statement.body)
      output.push(`} while (${gen(statement.test)});`)
    },

    ForStatement(statement) {
      output.push(`for (let ${statement.iterator} of ${gen(statement.collection)}) {`)
      emitBlock(statement.body)
      output.push("}")
    },

    BreakStatement() {
      output.push("break;")
    },

    ReturnStatement(statement) {
      if (statement.expression) {
        output.push(`return ${gen(statement.expression)};`)
      } else {
        output.push("return;")
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