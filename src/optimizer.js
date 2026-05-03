import * as core from "./core.js"

export default function optimize(node) {
  if (node == null) return node
  return optimizers[node.kind]?.(node) ?? node
}

function isIntLiteral(node, value) {
  return node?.kind === "IntegerLiteral" && node.value === BigInt(value)
}

function isFloatLiteral(node, value) {
  return node?.kind === "FloatLiteral" && node.value === Number(value)
}

function isNumberLiteral(node) {
  return node?.kind === "IntegerLiteral" || node?.kind === "FloatLiteral"
}

function isZero(node) {
  return isIntLiteral(node, 0) || isFloatLiteral(node, 0)
}

function isOne(node) {
  return isIntLiteral(node, 1) || isFloatLiteral(node, 1)
}

function isBooleanLiteral(node, value) {
  return node?.kind === "BooleanLiteral" && node.value === value
}

function int(value) {
  const node = new core.IntegerLiteral(value)
  node.type = core.intType
  return node
}

function float(value) {
  const node = new core.FloatLiteral(value)
  node.type = core.floatType
  return node
}

function bool(value) {
  const node = new core.BooleanLiteral(value)
  node.type = core.boolType
  return node
}

function unary(op, operand, type = operand.type) {
  const node = new core.UnaryExpression(op, operand)
  node.type = type
  return node
}

function sameIdentifier(left, right) {
  return (
    left?.kind === "IdentifierExpression" &&
    right?.kind === "IdentifierExpression" &&
    left.name === right.name
  )
}

function sameTargetAndSource(target, source) {
  return sameIdentifier(target, source)
}

function optimizeBlock(block) {
  const statements = []

  for (const statement of block.statements.flatMap(optimize)) {
    statements.push(statement)

    if (
      statement.kind === "ReturnStatement" ||
      statement.kind === "BreakStatement"
    ) {
      break
    }
  }

  block.statements = statements
  return block
}

function foldNumber(op, left, right, originalType) {
  const leftValue = left.value
  const rightValue = right.value

  if (left.kind === "IntegerLiteral" && right.kind === "IntegerLiteral") {
    if (op === "+") return int(leftValue + rightValue)
    if (op === "-") return int(leftValue - rightValue)
    if (op === "*") return int(leftValue * rightValue)
    if (op === "%") return int(leftValue % rightValue)
    if (op === "**") return int(leftValue ** rightValue)

    if (op === "/" && rightValue !== 0n) {
      const result = Number(leftValue) / Number(rightValue)
      return originalType === core.floatType ? float(result) : int(BigInt(Math.trunc(result)))
    }

    if (op === "<") return bool(leftValue < rightValue)
    if (op === "<=") return bool(leftValue <= rightValue)
    if (op === "==") return bool(leftValue === rightValue)
    if (op === "!=") return bool(leftValue !== rightValue)
    if (op === ">=") return bool(leftValue >= rightValue)
    if (op === ">") return bool(leftValue > rightValue)

    if (op === "|") return int(leftValue | rightValue)
    if (op === "^") return int(leftValue ^ rightValue)
    if (op === "&") return int(leftValue & rightValue)
    if (op === "<<") return int(leftValue << rightValue)
    if (op === ">>") return int(leftValue >> rightValue)
  }

  const l = Number(leftValue)
  const r = Number(rightValue)

  if (op === "+") return float(l + r)
  if (op === "-") return float(l - r)
  if (op === "*") return float(l * r)
  if (op === "/" && r !== 0) return float(l / r)
  if (op === "%") return float(l % r)
  if (op === "**") return float(l ** r)

  if (op === "<") return bool(l < r)
  if (op === "<=") return bool(l <= r)
  if (op === "==") return bool(l === r)
  if (op === "!=") return bool(l !== r)
  if (op === ">=") return bool(l >= r)
  if (op === ">") return bool(l > r)

  return null
}

const optimizers = {
  Program(program) {
    program.statements = program.statements.flatMap(optimize)
    return program
  },

  Block(block) {
    return optimizeBlock(block)
  },

  VariableDeclaration(declaration) {
    declaration.initializer = optimize(declaration.initializer)
    return declaration
  },

  ConstantDeclaration(declaration) {
    declaration.initializer = optimize(declaration.initializer)
    return declaration
  },

  CourseDeclaration(declaration) {
    declaration.fields = declaration.fields.map(optimize)
    return declaration
  },

  Field(field) {
    return field
  },

  FunctionDeclaration(declaration) {
    declaration.body = optimize(declaration.body)
    return declaration
  },

  Parameter(parameter) {
    return parameter
  },

  AssignmentStatement(statement) {
    statement.target = optimize(statement.target)
    statement.source = optimize(statement.source)

    if (sameTargetAndSource(statement.target, statement.source)) {
      return []
    }

    return statement
  },

  CallStatement(statement) {
    statement.call = optimize(statement.call)
    return statement
  },

  IfStatement(statement) {
    statement.test = optimize(statement.test)
    statement.consequent = optimize(statement.consequent)

    if (statement.alternate) {
      statement.alternate = optimize(statement.alternate)
    }

    if (isBooleanLiteral(statement.test, true)) {
      return statement.consequent
    }

    if (isBooleanLiteral(statement.test, false)) {
      return statement.alternate ?? new core.Block([])
    }

    return statement
  },

  WhileStatement(statement) {
    statement.test = optimize(statement.test)

    if (isBooleanLiteral(statement.test, false)) {
      return []
    }

    statement.body = optimize(statement.body)
    return statement
  },

  PracticeStatement(statement) {
    statement.body = optimize(statement.body)
    statement.test = optimize(statement.test)
    return statement
  },

  ForStatement(statement) {
    statement.collection = optimize(statement.collection)
    statement.body = optimize(statement.body)

    if (
      statement.collection?.kind === "EmptyArrayLiteral" ||
      (statement.collection?.kind === "ArrayLiteral" &&
        statement.collection.elements.length === 0)
    ) {
      return []
    }

    return statement
  },

  BreakStatement(statement) {
    return statement
  },

  ReturnStatement(statement) {
    if (statement.expression) {
      statement.expression = optimize(statement.expression)
    }
    return statement
  },

  IdentifierExpression(expression) {
    return expression
  },

  IntegerLiteral(expression) {
    return expression
  },

  FloatLiteral(expression) {
    return expression
  },

  BooleanLiteral(expression) {
    return expression
  },

  StringLiteral(expression) {
    return expression
  },

  ArrayLiteral(expression) {
    expression.elements = expression.elements.map(optimize)
    return expression
  },

  EmptyArrayLiteral(expression) {
    return expression
  },

  EmptyOptionalExpression(expression) {
    return expression
  },

  UnaryExpression(expression) {
    expression.operand = optimize(expression.operand)

    if (expression.op === "-" && expression.operand.kind === "IntegerLiteral") {
      return int(-expression.operand.value)
    }

    if (expression.op === "-" && expression.operand.kind === "FloatLiteral") {
      return float(-expression.operand.value)
    }

    if (expression.op === "!" && expression.operand.kind === "BooleanLiteral") {
      return bool(!expression.operand.value)
    }

    return expression
  },

  BinaryExpression(expression) {
    expression.left = optimize(expression.left)
    expression.right = optimize(expression.right)

    if (expression.op === "??") {
      if (expression.left?.kind === "EmptyOptionalExpression") {
        return expression.right
      }
      return expression
    }

    if (expression.op === "&&") {
      if (isBooleanLiteral(expression.left, true)) return expression.right
      if (isBooleanLiteral(expression.right, true)) return expression.left
      if (isBooleanLiteral(expression.left, false)) return bool(false)
      if (isBooleanLiteral(expression.right, false)) return bool(false)
    }

    if (expression.op === "||") {
      if (isBooleanLiteral(expression.left, false)) return expression.right
      if (isBooleanLiteral(expression.right, false)) return expression.left
      if (isBooleanLiteral(expression.left, true)) return bool(true)
      if (isBooleanLiteral(expression.right, true)) return bool(true)
    }

    if (isNumberLiteral(expression.left) && isNumberLiteral(expression.right)) {
      const folded = foldNumber(
        expression.op,
        expression.left,
        expression.right,
        expression.type,
      )
      if (folded) return folded
    }

    if (expression.op === "+" && isZero(expression.right)) return expression.left
    if (expression.op === "+" && isZero(expression.left)) return expression.right
    if (expression.op === "-" && isZero(expression.right)) return expression.left
    if (expression.op === "-" && isZero(expression.left)) {
      return unary("-", expression.right, expression.right.type)
    }

    if (expression.op === "*" && isOne(expression.right)) return expression.left
    if (expression.op === "*" && isOne(expression.left)) return expression.right
    if (expression.op === "*" && isZero(expression.right)) return expression.right
    if (expression.op === "*" && isZero(expression.left)) return expression.left

    if (expression.op === "/" && isOne(expression.right)) return expression.left
    if (expression.op === "/" && isZero(expression.left)) return expression.left

    if (expression.op === "**" && isZero(expression.right)) return int(1)
    if (expression.op === "**" && isOne(expression.right)) return expression.left
    if (expression.op === "**" && isOne(expression.left)) return expression.left

    return expression
  },

  TernaryExpression(expression) {
    expression.test = optimize(expression.test)
    expression.consequent = optimize(expression.consequent)
    expression.alternate = optimize(expression.alternate)

    if (isBooleanLiteral(expression.test, true)) {
      return expression.consequent
    }

    if (isBooleanLiteral(expression.test, false)) {
      return expression.alternate
    }

    return expression
  },

  CallExpression(expression) {
    expression.callee = optimize(expression.callee)
    expression.args = expression.args.map(optimize)
    return expression
  },

  SubscriptExpression(expression) {
    expression.array = optimize(expression.array)
    expression.index = optimize(expression.index)
    return expression
  },

  MemberExpression(expression) {
    expression.object = optimize(expression.object)
    return expression
  },
}