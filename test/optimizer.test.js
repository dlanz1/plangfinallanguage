import { describe, it } from "node:test"
import assert from "node:assert/strict"
import optimize from "../src/optimizer.js"
import * as core from "../src/core.js"

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

function string(value) {
  const node = new core.StringLiteral(value)
  node.type = core.stringType
  return node
}

function id(name, type = core.intType) {
  const node = new core.IdentifierExpression(name)
  node.type = type
  node.entity = {
    kind: "Variable",
    name,
    type,
    mutable: true,
  }
  return node
}

function unary(op, operand, type = operand.type) {
  const node = new core.UnaryExpression(op, operand)
  node.type = type
  return node
}

function binary(op, left, right, type = left.type) {
  const node = new core.BinaryExpression(op, left, right)
  node.type = type
  return node
}

function ternary(test, consequent, alternate, type = consequent.type) {
  const node = new core.TernaryExpression(test, consequent, alternate)
  node.type = type
  return node
}

function call(callee, args, type = core.voidType) {
  const node = new core.CallExpression(callee, args)
  node.type = type
  return node
}

function array(elements, baseType = elements[0]?.type ?? core.anyType) {
  const node = new core.ArrayLiteral(elements)
  node.type = new core.ArrayType(baseType)
  return node
}

function emptyArray(baseType = core.intType) {
  const node = new core.EmptyArrayLiteral(baseType)
  node.type = new core.ArrayType(baseType)
  return node
}

function subscript(arrayExpression, indexExpression) {
  const node = new core.SubscriptExpression(arrayExpression, indexExpression)
  node.type = arrayExpression.type.baseType
  return node
}

function optional(baseType = core.intType) {
  const node = new core.EmptyOptionalExpression(baseType)
  node.type = new core.OptionalType(baseType)
  return node
}

function program(statements) {
  return new core.Program(statements)
}

function block(statements) {
  return new core.Block(statements)
}

const x = id("x", core.intType)
const y = id("y", core.intType)
const xs = id("xs", new core.ArrayType(core.intType))
const xf = id("xf", core.floatType)
const mopt = id("mopt", new core.OptionalType(core.intType))

const tests = [
  ["folds integer +", binary("+", int(5), int(8), core.intType), int(13)],
  ["folds integer -", binary("-", int(5), int(8), core.intType), int(-3)],
  ["folds integer *", binary("*", int(5), int(8), core.intType), int(40)],
  ["folds integer %", binary("%", int(17), int(5), core.intType), int(2)],
  ["folds integer **", binary("**", int(2), int(3), core.intType), int(8)],

  ["folds float +", binary("+", float(1.5), float(2.5), core.floatType), float(4)],
  ["folds float -", binary("-", float(5.5), float(2.5), core.floatType), float(3)],
  ["folds float *", binary("*", float(2.5), float(4), core.floatType), float(10)],
  ["folds float /", binary("/", float(5), float(2), core.floatType), float(2.5)],

  ["folds <", binary("<", int(5), int(8), core.boolType), bool(true)],
  ["folds <=", binary("<=", int(5), int(8), core.boolType), bool(true)],
  ["folds ==", binary("==", int(5), int(8), core.boolType), bool(false)],
  ["folds !=", binary("!=", int(5), int(8), core.boolType), bool(true)],
  ["folds >=", binary(">=", int(5), int(8), core.boolType), bool(false)],
  ["folds >", binary(">", int(5), int(8), core.boolType), bool(false)],

  ["folds &&", binary("&&", bool(true), bool(false), core.boolType), bool(false)],
  ["folds ||", binary("||", bool(true), bool(false), core.boolType), bool(true)],

  ["folds unary - on int", unary("-", int(8), core.intType), int(-8)],
  ["folds unary - on float", unary("-", float(8.5), core.floatType), float(-8.5)],
  ["folds unary !", unary("!", bool(false), core.boolType), bool(true)],

  ["optimizes x + 0", binary("+", x, int(0), core.intType), x],
  ["optimizes 0 + x", binary("+", int(0), x, core.intType), x],
  ["optimizes x - 0", binary("-", x, int(0), core.intType), x],
  ["optimizes x * 1", binary("*", x, int(1), core.intType), x],
  ["optimizes 1 * x", binary("*", int(1), x, core.intType), x],
  ["optimizes x * 0", binary("*", x, int(0), core.intType), int(0)],
  ["optimizes 0 * x", binary("*", int(0), x, core.intType), int(0)],
  ["optimizes x / 1", binary("/", x, int(1), core.intType), x],
  ["optimizes x ** 0", binary("**", x, int(0), core.intType), int(1)],
  ["optimizes x ** 1", binary("**", x, int(1), core.intType), x],

  [
    "optimizes false || x",
    binary("||", bool(false), y, core.boolType),
    y,
  ],
  [
    "optimizes x || false",
    binary("||", y, bool(false), core.boolType),
    y,
  ],
  [
    "optimizes true && x",
    binary("&&", bool(true), y, core.boolType),
    y,
  ],
  [
    "optimizes x && true",
    binary("&&", y, bool(true), core.boolType),
    y,
  ],

  [
    "optimizes x || true",
    binary("||", y, bool(true), core.boolType),
    bool(true),
  ],

  [
    "optimizes true || x",
    binary("||", bool(true), y, core.boolType),
    bool(true),
  ],

  [
    "optimizes x && false",
    binary("&&", y, bool(false), core.boolType),
    bool(false),
  ],

  [
    "optimizes false && x",
    binary("&&", bool(false), y, core.boolType),
    bool(false),
  ],

  [
    "optimizes true ? x : y",
    ternary(bool(true), int(1), int(2), core.intType),
    int(1),
  ],
  [
    "optimizes false ? x : y",
    ternary(bool(false), int(1), int(2), core.intType),
    int(2),
  ],

  [
    "optimizes null coalescing with empty optional",
    binary("??", optional(core.intType), int(72), core.intType),
    int(72),
  ],

  [
    "leaves null coalescing when left is not an empty optional",
    binary("??", mopt, int(72), core.intType),
    binary("??", mopt, int(72), core.intType),
  ],

  [
    "optimizes 0 - x",
    binary("-", int(0), x, core.intType),
    unary("-", x, core.intType),
  ],

  [
    "optimizes x * float 1",
    binary("*", xf, float(1), core.floatType),
    xf,
  ],

  [
    "optimizes member object subexpression",
    new core.MemberExpression(binary("+", int(1), int(1), core.intType), "score"),
    new core.MemberExpression(int(2), "score"),
  ],

  [
    "passes through non-constant ternary",
    ternary(id("b", core.boolType), int(1), int(2), core.intType),
    ternary(id("b", core.boolType), int(1), int(2), core.intType),
  ],

  [
    "optimizes if false without alternate",
    new core.IfStatement(bool(false), block([new core.AssignmentStatement(x, int(1))]), null),
    block([]),
  ],

  [
    "optimizes inside variable declaration",
    new core.VariableDeclaration("score", core.intType, binary("+", int(70), int(2), core.intType)),
    new core.VariableDeclaration("score", core.intType, int(72)),
  ],

  [
    "optimizes inside constant declaration",
    new core.ConstantDeclaration("par", core.intType, binary("+", int(36), int(36), core.intType)),
    new core.ConstantDeclaration("par", core.intType, int(72)),
  ],

  [
    "optimizes inside assignment",
    new core.AssignmentStatement(x, binary("+", int(70), int(2), core.intType)),
    new core.AssignmentStatement(x, int(72)),
  ],

  [
    "optimizes inside return",
    new core.ReturnStatement(binary("+", int(1), int(1), core.intType)),
    new core.ReturnStatement(int(2)),
  ],

  [
    "optimizes inside call arguments",
    call(id("print", new core.FunctionType([core.anyType], core.voidType)), [
      binary("+", int(70), int(2), core.intType),
    ]),
    call(id("print", new core.FunctionType([core.anyType], core.voidType)), [
      int(72),
    ]),
  ],

  [
    "optimizes inside array literal",
    array([int(70), binary("+", int(70), int(2), core.intType), int(74)]),
    array([int(70), int(72), int(74)]),
  ],

  [
    "optimizes inside subscript index",
    subscript(xs, binary("+", int(1), int(1), core.intType)),
    subscript(xs, int(2)),
  ],

  [
    "optimizes if true",
    new core.IfStatement(bool(true), block([new core.CallStatement(call(id("print", new core.FunctionType([core.anyType], core.voidType)), [string('"yes"')]))]), block([])),
    block([new core.CallStatement(call(id("print", new core.FunctionType([core.anyType], core.voidType)), [string('"yes"')]))]),
  ],

  [
    "optimizes if false",
    new core.IfStatement(bool(false), block([]), block([new core.CallStatement(call(id("print", new core.FunctionType([core.anyType], core.voidType)), [string('"no"')]))])),
    block([new core.CallStatement(call(id("print", new core.FunctionType([core.anyType], core.voidType)), [string('"no"')]))]),
  ],

  [
    "optimizes while false away",
    program([
      new core.WhileStatement(bool(false), block([new core.AssignmentStatement(x, int(1))])),
    ]),
    program([]),
  ],

  [
    "optimizes inside while true body",
    new core.WhileStatement(bool(true), block([
      new core.AssignmentStatement(x, binary("+", int(1), int(1), core.intType)),
    ])),
    new core.WhileStatement(bool(true), block([
      new core.AssignmentStatement(x, int(2)),
    ])),
  ],

  [
    "optimizes inside practice body and condition",
    new core.PracticeStatement(
      block([new core.AssignmentStatement(x, binary("+", int(1), int(1), core.intType))]),
      binary("==", int(1), int(1), core.boolType),
    ),
    new core.PracticeStatement(
      block([new core.AssignmentStatement(x, int(2))]),
      bool(true),
    ),
  ],

  [
    "optimizes play body",
    new core.ForStatement("score", xs, block([
      new core.AssignmentStatement(x, binary("+", int(1), int(1), core.intType)),
    ])),
    new core.ForStatement("score", xs, block([
      new core.AssignmentStatement(x, int(2)),
    ])),
  ],

  [
    "optimizes empty play through empty array away",
    program([
      new core.ForStatement("score", emptyArray(core.intType), block([
        new core.AssignmentStatement(x, int(1)),
      ])),
    ]),
    program([]),
  ],

  [
    "removes x = x at beginning",
    program([
      new core.AssignmentStatement(x, x),
      new core.AssignmentStatement(x, int(1)),
    ]),
    program([
      new core.AssignmentStatement(x, int(1)),
    ]),
  ],

  [
    "removes x = x at end",
    program([
      new core.AssignmentStatement(x, int(1)),
      new core.AssignmentStatement(x, x),
    ]),
    program([
      new core.AssignmentStatement(x, int(1)),
    ]),
  ],

  [
    "removes unreachable statements after sink",
    block([
      new core.ReturnStatement(int(1)),
      new core.AssignmentStatement(x, int(2)),
    ]),
    block([
      new core.ReturnStatement(int(1)),
    ]),
  ],

  [
    "removes unreachable statements after shank",
    block([
      new core.BreakStatement(),
      new core.AssignmentStatement(x, int(2)),
    ]),
    block([
      new core.BreakStatement(),
    ]),
  ],

  [
    "optimizes inside function body",
    new core.FunctionDeclaration(
      "f",
      [],
      core.intType,
      block([new core.ReturnStatement(binary("+", int(1), int(1), core.intType))]),
    ),
    new core.FunctionDeclaration(
      "f",
      [],
      core.intType,
      block([new core.ReturnStatement(int(2))]),
    ),
  ],

  [
    "passes through nonoptimizable identifier",
    x,
    x,
  ],

  [
    "passes through nonoptimizable string",
    string('"hello"'),
    string('"hello"'),
  ],

  [
    "passes through break statement",
    new core.BreakStatement(),
    new core.BreakStatement(),
  ],

  [
    "passes through empty return statement",
    new core.ReturnStatement(),
    new core.ReturnStatement(),
  ],

  [
    "folds integer division to float when expression is float-typed",
    binary("/", int(3), int(2), core.floatType),
    float(1.5),
  ],

  [
    "folds integer division with truncation for int-typed expression",
    binary("/", int(5), int(2), core.intType),
    int(2),
  ],

  ["folds integer bitwise or", binary("|", int(1), int(2), core.intType), int(3)],
  ["folds integer bitwise xor", binary("^", int(5), int(3), core.intType), int(6)],
  ["folds integer bitwise and", binary("&", int(6), int(3), core.intType), int(2)],
  ["folds integer left shift", binary("<<", int(2), int(3), core.intType), int(16)],
  ["folds integer right shift", binary(">>", int(-8), int(2), core.intType), int(-2)],

  ["folds float remainder", binary("%", float(5.5), float(2), core.floatType), float(1.5)],
  ["folds float exponentiation", binary("**", float(2), float(3), core.floatType), float(8)],

  ["folds float less than", binary("<", float(1), float(2), core.boolType), bool(true)],
  ["folds float less or equal", binary("<=", float(2), float(1), core.boolType), bool(false)],
  ["folds float equal", binary("==", float(1), float(1), core.boolType), bool(true)],
  ["folds float not equal", binary("!=", float(1), float(2), core.boolType), bool(true)],
  ["folds float greater or equal", binary(">=", float(2), float(2), core.boolType), bool(true)],
  ["folds float greater than", binary(">", float(2), float(1), core.boolType), bool(true)],

  [
    "returns null from numeric fold for unsupported op on float operands",
    binary("|", float(1), float(2), core.floatType),
    binary("|", float(1), float(2), core.floatType),
  ],

  [
    "optimizes course declaration field list",
    new core.CourseDeclaration("C", [new core.Field("x", core.intType)]),
    new core.CourseDeclaration("C", [new core.Field("x", core.intType)]),
  ],

  [
    "passes through parameter",
    new core.Parameter("p", core.intType),
    new core.Parameter("p", core.intType),
  ],
]

describe("The optimizer", () => {
  for (const [scenario, before, after] of tests) {
    it(scenario, () => {
      assert.deepEqual(optimize(before), after)
    })
  }
})