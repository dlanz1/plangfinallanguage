// Core AST definitions for 3DTee

export class Program {
  constructor(statements) {
    this.kind = "Program"
    this.statements = statements
  }
}

export class Block {
  constructor(statements) {
    this.kind = "Block"
    this.statements = statements
  }
}

// Declarations

export class VariableDeclaration {
  constructor(id, type, initializer) {
    this.kind = "VariableDeclaration"
    this.id = id
    this.type = type
    this.initializer = initializer
  }
}

export class ConstantDeclaration {
  constructor(id, type, initializer) {
    this.kind = "ConstantDeclaration"
    this.id = id
    this.type = type
    this.initializer = initializer
  }
}

export class CourseDeclaration {
  constructor(id, fields) {
    this.kind = "CourseDeclaration"
    this.id = id
    this.fields = fields
  }
}

export class Field {
  constructor(id, type) {
    this.kind = "Field"
    this.id = id
    this.type = type
  }
}

export class FunctionDeclaration {
  constructor(id, params, returnType, body) {
    this.kind = "FunctionDeclaration"
    this.id = id
    this.params = params
    this.returnType = returnType
    this.body = body
  }
}

export class Parameter {
  constructor(id, type) {
    this.kind = "Parameter"
    this.id = id
    this.type = type
  }
}

// Statements

export class AssignmentStatement {
  constructor(target, source) {
    this.kind = "AssignmentStatement"
    this.target = target
    this.source = source
  }
}

export class CallStatement {
  constructor(call) {
    this.kind = "CallStatement"
    this.call = call
  }
}

export class IfStatement {
  constructor(test, consequent, alternate = null) {
    this.kind = "IfStatement"
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }
}

export class WhileStatement {
  constructor(test, body) {
    this.kind = "WhileStatement"
    this.test = test
    this.body = body
  }
}

export class PracticeStatement {
  constructor(body, test) {
    this.kind = "PracticeStatement"
    this.body = body
    this.test = test
  }
}

export class ForStatement {
  constructor(iterator, collection, body) {
    this.kind = "ForStatement"
    this.iterator = iterator
    this.collection = collection
    this.body = body
  }
}

export class BreakStatement {
  constructor() {
    this.kind = "BreakStatement"
  }
}

export class ReturnStatement {
  constructor(expression = null) {
    this.kind = "ReturnStatement"
    this.expression = expression
  }
}

// Types

export class Type {
  constructor(name) {
    this.kind = "Type"
    this.name = name
  }
}

export class ArrayType {
  constructor(baseType) {
    this.kind = "ArrayType"
    this.baseType = baseType
  }
}

export class FunctionType {
  constructor(paramTypes, returnType) {
    this.kind = "FunctionType"
    this.paramTypes = paramTypes
    this.returnType = returnType
  }
}

export class OptionalType {
  constructor(baseType) {
    this.kind = "OptionalType"
    this.baseType = baseType
  }
}

export const intType = new Type("int")
export const floatType = new Type("float")
export const boolType = new Type("bool")
export const stringType = new Type("string")
export const voidType = new Type("void")
export const anyType = new Type("any")

// Expressions

export class IdentifierExpression {
  constructor(name) {
    this.kind = "IdentifierExpression"
    this.name = name
  }
}

export class IntegerLiteral {
  constructor(value) {
    this.kind = "IntegerLiteral"
    this.value = BigInt(value)
  }
}

export class FloatLiteral {
  constructor(value) {
    this.kind = "FloatLiteral"
    this.value = Number(value)
  }
}

export class BooleanLiteral {
  constructor(value) {
    this.kind = "BooleanLiteral"
    this.value = value
  }
}

export class StringLiteral {
  constructor(value) {
    this.kind = "StringLiteral"
    this.value = value
  }
}

export class ArrayLiteral {
  constructor(elements) {
    this.kind = "ArrayLiteral"
    this.elements = elements
  }
}

export class EmptyArrayLiteral {
  constructor(type) {
    this.kind = "EmptyArrayLiteral"
    this.type = type
  }
}

export class EmptyOptionalExpression {
  constructor(type) {
    this.kind = "EmptyOptionalExpression"
    this.type = type
  }
}

export class UnaryExpression {
  constructor(op, operand) {
    this.kind = "UnaryExpression"
    this.op = op
    this.operand = operand
  }
}

export class BinaryExpression {
  constructor(op, left, right) {
    this.kind = "BinaryExpression"
    this.op = op
    this.left = left
    this.right = right
  }
}

export class TernaryExpression {
  constructor(test, consequent, alternate) {
    this.kind = "TernaryExpression"
    this.test = test
    this.consequent = consequent
    this.alternate = alternate
  }
}

export class CallExpression {
  constructor(callee, args) {
    this.kind = "CallExpression"
    this.callee = callee
    this.args = args
  }
}

export class SubscriptExpression {
  constructor(array, index) {
    this.kind = "SubscriptExpression"
    this.array = array
    this.index = index
  }
}

export class MemberExpression {
  constructor(object, field) {
    this.kind = "MemberExpression"
    this.object = object
    this.field = field
  }
}

// Built-ins

export const standardLibrary = Object.freeze({
  print: {
    kind: "BuiltinFunction",
    name: "print",
    type: new FunctionType([anyType], voidType),
  },
})