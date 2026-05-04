import * as core from "./core.js"
import { CompileUserError } from "./errors.js"

function equivalent(t1, t2) {
  return (
    t1 === t2 ||
    (t1?.kind === "Type" && t2?.kind === "Type" && t1.name === t2.name) ||
    (t1?.kind === "OptionalType" &&
      t2?.kind === "OptionalType" &&
      equivalent(t1.baseType, t2.baseType)) ||
    (t1?.kind === "ArrayType" &&
      t2?.kind === "ArrayType" &&
      equivalent(t1.baseType, t2.baseType)) ||
    (t1?.kind === "FunctionType" &&
      t2?.kind === "FunctionType" &&
      equivalent(t1.returnType, t2.returnType) &&
      t1.paramTypes.length === t2.paramTypes.length &&
      t1.paramTypes.every((t, i) => equivalent(t, t2.paramTypes[i])))
  )
}

function assignable(fromType, toType) {
  return (
    toType === core.anyType ||
    equivalent(fromType, toType) ||
    (fromType === core.intType && toType === core.floatType) ||
    (fromType?.kind === "FunctionType" &&
      toType?.kind === "FunctionType" &&
      assignable(fromType.returnType, toType.returnType) &&
      fromType.paramTypes.length === toType.paramTypes.length &&
      toType.paramTypes.every((t, i) => assignable(t, fromType.paramTypes[i])))
  )
}

export function typeDescription(type) {
  if (type?.kind === "Type") return type.name
  if (type?.kind === "ArrayType") return `[${typeDescription(type.baseType)}]`
  if (type?.kind === "OptionalType") return `${typeDescription(type.baseType)}?`
  if (type?.kind === "FunctionType") {
    const params = type.paramTypes.map(typeDescription).join(", ")
    return `(${params}) -> ${typeDescription(type.returnType)}`
  }
  return "unknown"
}

function isNumeric(type) {
  return type === core.intType || type === core.floatType
}

function numericResult(t1, t2) {
  return t1 === core.floatType || t2 === core.floatType ? core.floatType : core.intType
}

function isMutable(e) {
  return (
    (e?.kind === "IdentifierExpression" && e.entity?.mutable) ||
    (e?.kind === "SubscriptExpression" && isMutable(e.array)) ||
    (e?.kind === "MemberExpression" && isMutable(e.object))
  )
}

class Context {
  constructor({ parent = null, locals = new Map(), inLoop = false, function: f = null }) {
    Object.assign(this, { parent, locals, inLoop, function: f })
  }

  add(name, entity) {
    this.locals.set(name, entity)
  }

  lookup(name) {
    return this.locals.get(name) || this.parent?.lookup(name)
  }

  static root() {
    const context = new Context({ locals: new Map() })

    for (const [name, entity] of Object.entries(core.standardLibrary)) {
      context.add(name, {
        kind: "Function",
        name,
        type: entity.type,
        mutable: false,
      })
    }

    return context
  }

  newChildContext(props = {}) {
    return new Context({ ...this, ...props, parent: this, locals: new Map() })
  }
}

function must(condition, message, errorLocation) {
  if (!condition) {
    const prefix = errorLocation.at.source.getLineAndColumnMessage()
    throw new CompileUserError(`${prefix}${message}`)
  }
}

Object.assign(must, {
  notAlreadyBeDeclared(context, name, at) {
    must(!context.locals.has(name), `Identifier ${name} already declared`, at)
  },

  haveBeenFound(entity, name, at) {
    must(entity, `Identifier ${name} not declared`, at)
  },

  haveNumericType(e, at) {
    must(isNumeric(e.type), "Expected a number", at)
  },

  haveIntegerType(e, at) {
    must(e.type === core.intType, "Expected an integer", at)
  },

  haveBooleanType(e, at) {
    must(e.type === core.boolType, "Expected a boolean", at)
  },

  haveNumericOrStringType(e, at) {
    must(
      isNumeric(e.type) || e.type === core.stringType,
      "Expected a number or string",
      at,
    )
  },

  haveAnArrayType(e, at) {
    must(e.type?.kind === "ArrayType", "Expected an array", at)
  },

  haveAnOptionalType(e, at) {
    must(e.type?.kind === "OptionalType", "Expected an optional", at)
  },

  haveACourseType(e, at) {
    must(e.type?.kind === "Type" && e.type.course, "Expected a course value", at)
  },

  beAType(t, at) {
    const isType =
      t === core.intType ||
      t === core.floatType ||
      t === core.boolType ||
      t === core.stringType ||
      t === core.voidType ||
      t === core.anyType ||
      t?.kind === "ArrayType" ||
      t?.kind === "OptionalType" ||
      t?.kind === "FunctionType" ||
      t?.kind === "Type"

    must(isType, "Type expected", at)
  },

  beAssignable(source, { toType }, at) {
    const sourceDesc = typeDescription(source.type)
    const targetDesc = typeDescription(toType)
    must(
      assignable(source.type, toType),
      `Cannot assign a ${sourceDesc} to a ${targetDesc}`,
      at,
    )
  },

  beMutable(e, at) {
    must(isMutable(e), "Cannot assign to immutable variable", at)
  },

  bothHaveTheSameType(e1, e2, at) {
    must(equivalent(e1.type, e2.type), "Operands do not have the same type", at)
  },

  allHaveSameType(expressions, at) {
    must(
      expressions.length === 0 ||
        expressions.slice(1).every(e => equivalent(e.type, expressions[0].type)),
      "Not all elements have the same type",
      at,
    )
  },

  haveDistinctFields(fields, at) {
    const names = fields.map(f => f.id)
    must(new Set(names).size === names.length, "Fields must be distinct", at)
  },

  haveMember(courseType, fieldName, at) {
    must(
      courseType.course.fields.some(f => f.id === fieldName),
      `No such field ${fieldName}`,
      at,
    )
  },

  beInLoop(context, at) {
    must(context.inLoop, "shank can only appear in a loop", at)
  },

  beInAFunction(context, at) {
    must(context.function, "sink can only appear in a function", at)
  },

  beCallable(e, at) {
    must(e.type?.kind === "FunctionType", "Call of non-function", at)
  },

  notReturnAnything(f, at) {
    must(f.type.returnType === core.voidType, "Cannot return no value from this function", at)
  },

  returnSomething(f, at) {
    must(f.type.returnType !== core.voidType, "Cannot return a value from this function", at)
  },

  beReturnable(e, { from: f }, at) {
    must.beAssignable(e, { toType: f.type.returnType }, at)
  },

  haveCorrectArgumentCount(argCount, paramCount, at) {
    must(
      argCount === paramCount,
      `${paramCount} argument(s) required but ${argCount} passed`,
      at,
    )
  },
})

export default function analyze(match) {
  let context = Context.root()

  const builder = match.matcher.grammar.createSemantics().addOperation("rep", {
    Program(_teeOff, statements, _clubHouse) {
      return new core.Program(statements.children.map(s => s.rep()))
    },

    Statement(statement) {
      return statement.rep()
    },

    Block(_open, statements, _close) {
      return new core.Block(statements.children.map(s => s.rep()))
    },

    VarDecl(_bag, id, typeAnn, _eq, exp, _semicolon) {
      must.notAlreadyBeDeclared(context, id.sourceString, { at: id })

      const initializer = exp.rep()
      const declaredType =
        typeAnn.children.length > 0 ? typeAnn.children[0].rep() : initializer.type

      must.beAssignable(initializer, { toType: declaredType }, { at: exp })

      const variable = {
        kind: "Variable",
        name: id.sourceString,
        type: declaredType,
        mutable: true,
      }

      context.add(id.sourceString, variable)

      return new core.VariableDeclaration(id.sourceString, declaredType, initializer)
    },

    ConstDecl(_pin, id, typeAnn, _eq, exp, _semicolon) {
      must.notAlreadyBeDeclared(context, id.sourceString, { at: id })

      const initializer = exp.rep()
      const declaredType =
        typeAnn.children.length > 0 ? typeAnn.children[0].rep() : initializer.type

      must.beAssignable(initializer, { toType: declaredType }, { at: exp })

      const constant = {
        kind: "Constant",
        name: id.sourceString,
        type: declaredType,
        mutable: false,
      }

      context.add(id.sourceString, constant)

      return new core.ConstantDeclaration(id.sourceString, declaredType, initializer)
    },

    TypeAnn(_colon, type) {
      return type.rep()
    },

    CourseDecl(_course, id, _open, fields, _close) {
      must.notAlreadyBeDeclared(context, id.sourceString, { at: id })

      const courseType = new core.Type(id.sourceString)
      courseType.course = null
      context.add(id.sourceString, courseType)

      const fieldList = fields.children.map(f => f.rep())
      must.haveDistinctFields(fieldList, { at: id })

      const course = new core.CourseDeclaration(id.sourceString, fieldList)
      courseType.course = course

      return course
    },

    Field(id, _colon, type, _semicolon) {
      return new core.Field(id.sourceString, type.rep())
    },

    SwingDecl(_swing, id, params, returnType, block) {
      must.notAlreadyBeDeclared(context, id.sourceString, { at: id })

      const fun = {
        kind: "Function",
        name: id.sourceString,
        type: null,
        mutable: false,
      }

      context.add(id.sourceString, fun)

      context = context.newChildContext({ inLoop: false, function: fun })

      const parameters = params.rep()
      const resolvedReturnType =
        returnType.children.length > 0 ? returnType.children[0].rep() : core.voidType

      fun.type = new core.FunctionType(
        parameters.map(p => p.type),
        resolvedReturnType,
      )

      const body = block.rep()

      context = context.parent

      return new core.FunctionDeclaration(
        id.sourceString,
        parameters,
        resolvedReturnType,
        body,
      )
    },

    Params(_open, params, _close) {
      return params.asIteration().children.map(p => p.rep())
    },

    Param(id, _colon, type) {
      must.notAlreadyBeDeclared(context, id.sourceString, { at: id })

      const param = new core.Parameter(id.sourceString, type.rep())

      context.add(id.sourceString, {
        kind: "Variable",
        name: id.sourceString,
        type: param.type,
        mutable: true,
      })

      return param
    },

    ReturnType(_colon, type) {
      return type.rep()
    },

    Type_optional(baseType, _questionMark) {
      return new core.OptionalType(baseType.rep())
    },

    Type_array(_open, baseType, _close) {
      return new core.ArrayType(baseType.rep())
    },

    Type_function(_open, types, _close, _arrow, returnType) {
      return new core.FunctionType(
        types.asIteration().children.map(t => t.rep()),
        returnType.rep(),
      )
    },

    Type_int(_) {
      return core.intType
    },

    Type_float(_) {
      return core.floatType
    },

    Type_bool(_) {
      return core.boolType
    },

    Type_string(_) {
      return core.stringType
    },

    Type_id(id) {
      const entity = context.lookup(id.sourceString)
      must.haveBeenFound(entity, id.sourceString, { at: id })
      must.beAType(entity, { at: id })
      return entity
    },

    AssignStmt(target, _eq, source, _semicolon) {
      const targetExpression = target.rep()
      const sourceExpression = source.rep()

      must.beMutable(targetExpression, { at: target })
      must.beAssignable(sourceExpression, { toType: targetExpression.type }, { at: source })

      return new core.AssignmentStatement(targetExpression, sourceExpression)
    },

    CallStmt(call, _semicolon) {
      const callExpression = call.rep()
      must(
        callExpression.kind === "CallExpression",
        "Call statement must be a function call",
        { at: call },
      )
      return new core.CallStatement(callExpression)
    },

    IfStmt_long(_readLie, exp, block1, _otherwise, block2) {
      const test = exp.rep()
      must.haveBooleanType(test, { at: exp })

      context = context.newChildContext()
      const consequent = block1.rep()
      context = context.parent

      context = context.newChildContext()
      const alternate = block2.rep()
      context = context.parent

      return new core.IfStatement(test, consequent, alternate)
    },

    IfStmt_short(_readLie, exp, block) {
      const test = exp.rep()
      must.haveBooleanType(test, { at: exp })

      context = context.newChildContext()
      const consequent = block.rep()
      context = context.parent

      return new core.IfStatement(test, consequent, null)
    },

    WhileStmt(_whileBall, exp, block) {
      const test = exp.rep()
      must.haveBooleanType(test, { at: exp })

      context = context.newChildContext({ inLoop: true })
      const body = block.rep()
      context = context.parent

      return new core.WhileStatement(test, body)
    },

    PracticeStmt(_practice, block, _whileBall, exp, _semicolon) {
      context = context.newChildContext({ inLoop: true })
      const body = block.rep()
      context = context.parent

      const test = exp.rep()
      must.haveBooleanType(test, { at: exp })

      return new core.PracticeStatement(body, test)
    },

    ForStmt(_play, id, _through, collection, block) {
      const collectionExpression = collection.rep()
      must.haveAnArrayType(collectionExpression, { at: collection })

      const iterator = {
        kind: "Variable",
        name: id.sourceString,
        type: collectionExpression.type.baseType,
        mutable: true,
      }

      context = context.newChildContext({ inLoop: true })
      context.add(id.sourceString, iterator)
      const body = block.rep()
      context = context.parent

      return new core.ForStatement(id.sourceString, collectionExpression, body)
    },

    BreakStmt(shank, _semicolon) {
      must.beInLoop(context, { at: shank })
      return new core.BreakStatement()
    },

    ReturnStmt_value(sink, exp, _semicolon) {
      must.beInAFunction(context, { at: sink })
      must.returnSomething(context.function, { at: sink })

      const returnExpression = exp.rep()
      must.beReturnable(returnExpression, { from: context.function }, { at: exp })

      return new core.ReturnStatement(returnExpression)
    },

    ReturnStmt_empty(sink, _semicolon) {
      must.beInAFunction(context, { at: sink })
      must.notReturnAnything(context.function, { at: sink })
      return new core.ReturnStatement()
    },

    Exp_conditional(exp, _question, exp1, colon, exp2) {
      const test = exp.rep()
      must.haveBooleanType(test, { at: exp })

      const consequent = exp1.rep()
      const alternate = exp2.rep()
      must.bothHaveTheSameType(consequent, alternate, { at: colon })

      const node = new core.TernaryExpression(test, consequent, alternate)
      node.type = consequent.type
      return node
    },

    Exp_basic(exp) {
      return exp.rep()
    },

    Exp1_coal(exp1, op, exp2) {
      const optional = exp1.rep()
      const alternate = exp2.rep()

      must.haveAnOptionalType(optional, { at: exp1 })
      must.beAssignable(alternate, { toType: optional.type.baseType }, { at: exp2 })

      const node = new core.BinaryExpression(op.sourceString, optional, alternate)
      node.type = optional.type.baseType
      return node
    },

    Exp1_basic(exp) {
      return exp.rep()
    },

    Exp2_or(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveBooleanType(l, { at: left })
      must.haveBooleanType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.boolType
      return node
    },

    Exp2_basic(exp) {
      return exp.rep()
    },

    Exp3_and(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveBooleanType(l, { at: left })
      must.haveBooleanType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.boolType
      return node
    },

    Exp3_basic(exp) {
      return exp.rep()
    },

    Exp4_bitor(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveIntegerType(l, { at: left })
      must.haveIntegerType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.intType
      return node
    },

    Exp4_basic(exp) {
      return exp.rep()
    },

    Exp5_bitxor(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveIntegerType(l, { at: left })
      must.haveIntegerType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.intType
      return node
    },

    Exp5_basic(exp) {
      return exp.rep()
    },

    Exp6_bitand(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveIntegerType(l, { at: left })
      must.haveIntegerType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.intType
      return node
    },

    Exp6_basic(exp) {
      return exp.rep()
    },

    Exp7_compare(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      if (["<", "<=", ">", ">="].includes(op.sourceString)) {
        must.haveNumericOrStringType(l, { at: left })
      }

      must.bothHaveTheSameType(l, r, { at: op })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.boolType
      return node
    },

    Exp7_basic(exp) {
      return exp.rep()
    },

    Exp8_shift(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveIntegerType(l, { at: left })
      must.haveIntegerType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = core.intType
      return node
    },

    Exp8_basic(exp) {
      return exp.rep()
    },

    Exp9_add(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      if (op.sourceString === "+") {
        must.haveNumericOrStringType(l, { at: left })
      } else {
        must.haveNumericType(l, { at: left })
      }

      must.bothHaveTheSameType(l, r, { at: op })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = l.type
      return node
    },

    Exp9_basic(exp) {
      return exp.rep()
    },

    Exp10_mul(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveNumericType(l, { at: left })
      must.haveNumericType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = numericResult(l.type, r.type)
      return node
    },

    Exp10_basic(exp) {
      return exp.rep()
    },

    Exp11_power(left, op, right) {
      const l = left.rep()
      const r = right.rep()

      must.haveNumericType(l, { at: left })
      must.haveNumericType(r, { at: right })

      const node = new core.BinaryExpression(op.sourceString, l, r)
      node.type = numericResult(l.type, r.type)
      return node
    },

    Exp11_basic(exp) {
      return exp.rep()
    },

    Exp12_prefix(op, exp) {
      const operand = exp.rep()
      let type

      if (op.sourceString === "#") {
        must.haveAnArrayType(operand, { at: exp })
        type = core.intType
      } else if (op.sourceString === "-") {
        must.haveNumericType(operand, { at: exp })
        type = operand.type
      } else if (op.sourceString === "!") {
        must.haveBooleanType(operand, { at: exp })
        type = core.boolType
      } else if (op.sourceString === "loft") {
        must.haveAnOptionalType(operand, { at: exp })
        type = core.boolType
      } else if (op.sourceString === "bounce") {
        must.haveAnOptionalType(operand, { at: exp })
        type = operand.type.baseType
      }

      const node = new core.UnaryExpression(op.sourceString, operand)
      node.type = type
      return node
    },

    Exp12_basic(exp) {
      return exp.rep()
    },

    Exp13_subscript(exp, _open, index, _close) {
      const array = exp.rep()
      const subscript = index.rep()

      must.haveAnArrayType(array, { at: exp })
      must.haveIntegerType(subscript, { at: index })

      const node = new core.SubscriptExpression(array, subscript)
      node.type = array.type.baseType
      return node
    },

    Exp13_member(exp, _dot, id) {
      const object = exp.rep()

      must.haveACourseType(object, { at: exp })
      must.haveMember(object.type, id.sourceString, { at: id })

      const field = object.type.course.fields.find(f => f.id === id.sourceString)

      const node = new core.MemberExpression(object, id.sourceString)
      node.type = field.type
      return node
    },

    Exp13_call(exp, open, args, _close) {
      const callee = exp.rep()

      must.beCallable(callee, { at: exp })

      const argExpressions = args.asIteration().children.map(a => a.rep())
      const targetTypes = callee.type.paramTypes

      must.haveCorrectArgumentCount(argExpressions.length, targetTypes.length, { at: open })

      argExpressions.forEach((arg, i) => {
        must.beAssignable(arg, { toType: targetTypes[i] }, { at: args })
      })

      const node = new core.CallExpression(callee, argExpressions)
      node.type = callee.type.returnType
      return node
    },

    Exp13_basic(primary) {
      return primary.rep()
    },

    Primary_float(floatlit) {
      const node = new core.FloatLiteral(floatlit.sourceString)
      node.type = core.floatType
      return node
    },

    Primary_int(intlit) {
      const node = new core.IntegerLiteral(intlit.sourceString)
      node.type = core.intType
      return node
    },

    Primary_string(stringlit) {
      const source = stringlit.sourceString

      for (const match of source.matchAll(/\\u\{([0-9a-fA-F]+)\}/g)) {
        const codePoint = Number.parseInt(match[1], 16)
        must(codePoint <= 0x10ffff, "Invalid unicode escape", { at: stringlit })
      }

      const node = new core.StringLiteral(source)
      node.type = core.stringType
      return node
    },

    Primary_true(_) {
      const node = new core.BooleanLiteral(true)
      node.type = core.boolType
      return node
    },

    Primary_false(_) {
      const node = new core.BooleanLiteral(false)
      node.type = core.boolType
      return node
    },

    Primary_emptyoptional(_hazard, type) {
      const baseType = type.rep()
      const node = new core.EmptyOptionalExpression(baseType)
      node.type = new core.OptionalType(baseType)
      return node
    },

    Primary_array(array) {
      return array.rep()
    },

    Primary_emptyarray(emptyArray) {
      return emptyArray.rep()
    },

    Primary_id(id) {
      const entity = context.lookup(id.sourceString)
      must.haveBeenFound(entity, id.sourceString, { at: id })

      const node = new core.IdentifierExpression(id.sourceString)
      node.entity = entity
      node.type = entity.type ?? entity
      return node
    },

    Primary_parens(_open, exp, _close) {
      return exp.rep()
    },

    ArrayLit(_open, args, _close) {
      const elements = args.asIteration().children.map(e => e.rep())
      must.allHaveSameType(elements, { at: args })

      const node = new core.ArrayLiteral(elements)
      node.type = new core.ArrayType(elements.length > 0 ? elements[0].type : core.anyType)
      return node
    },

    EmptyArrayLit(_openBracket, type, _closeBracket, _openParen, _closeParen) {
      const baseType = type.rep()
      const node = new core.EmptyArrayLiteral(baseType)
      node.type = new core.ArrayType(baseType)
      return node
    },
  })

  return builder(match).rep()
}