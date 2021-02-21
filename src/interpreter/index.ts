import {
  Program,
  Function as PFunction,
  StatementType,
  DeclarationStatement,
  ReturnStatement,
  ExpressionStatement,
  Expression,
  ExpressionType,
  EqualityExpression,
  TermExpression,
  FactorExpression,
  CallExpression,
  PrimaryExpression,
  ValueType as PValueType,
} from '../parser'
import { TokenType } from '../scanner'

const MAIN_FUNCTION_ID = 'main'

interface Function {
  pFunc: PFunction
  vars: Record<string, Value>
}

enum ValueType {
  Number = 'Number',
  Bool = 'Bool',
  Void = 'Void',
  String = 'String',
}

interface Value {
  type: ValueType
  value: any
}

const VOID: Value = {
  type: ValueType.Void,
  value: null
}

export function interpret(program: Program): any {
  const mainFunc = program.functions[MAIN_FUNCTION_ID]
  if (!program.functions[MAIN_FUNCTION_ID]) {
    throw new Error('No main function found')
  }
  const val = runFunction(mainFunc, {}, program)
  return val.value
}

function runFunction(pFunc: PFunction, params: Record<string, Value>, prog: Program): Value {
  const func: Function = {
    pFunc,
    vars: {
      ...params
    }
  }

  for (const stmt of func.pFunc.statements) {
    switch (stmt.type) {
      case StatementType.Declaration:
        runDeclarationStatement(stmt as DeclarationStatement, func, prog)
        break
      case StatementType.Expression:
        const exprStmt = stmt as ExpressionStatement
        runExpression(exprStmt.expression, func, prog)
        break
      case StatementType.Return:
        const retStmt = stmt as ReturnStatement
        const val = runExpression(retStmt.expression, func, prog)
        return val
      default:
        throw new Error(`Unrecognized stmt type ${stmt.type}`)
    }
  }

  return VOID
}

function runDeclarationStatement(stmt: DeclarationStatement, func: Function, prog: Program) {
  const varName = stmt.varName.source
  const val = runExpression(stmt.expression, func, prog)
  if (func.vars[varName]) {
    throw new Error(`Cannot redeclare var name ${varName}`)
  }
  func.vars[varName] = val
} 

function runExpression(expr: Expression, func: Function, prog: Program): Value {
  switch (expr.type) {
    case ExpressionType.Equality:
      return runEqualityExpression(expr as EqualityExpression, func, prog)
    case ExpressionType.Term:
      return runTermExpression(expr as TermExpression, func, prog)
    case ExpressionType.Factor:
      return runFactorExpression(expr as FactorExpression, func, prog)
    case ExpressionType.Primary:
      return runPrimaryExpression(expr as PrimaryExpression, func)
    case ExpressionType.Call:
      return runCallExpression(expr as CallExpression, func, prog)
    default:
      throw new Error(`ExpressionType not recognized ${expr.type}`)

  }
}

function runEqualityExpression(expr: EqualityExpression, func: Function, prog: Program): Value {
  const lhs = runExpression(expr.lhs, func, prog)
  const rhs = runExpression(expr.rhs, func, prog)
  if (lhs.type !== rhs.type) {
    return {
      type: ValueType.Bool,
      value: false,
    }
  }

  let value: boolean
  switch (expr.op.type) {
    case TokenType.Equal:
      value = lhs.value === rhs.value
      break
    case TokenType.NotEqual:
      value = lhs.value !== rhs.value
      break
    default:
      throw new Error(`Unrecognized operator ${expr.op.type}`)
  }

  return {
    type: ValueType.Bool,
    value,
  }
}

function runTermExpression(expr: TermExpression, func: Function, prog: Program): Value {
  const lhs = runExpression(expr.lhs, func, prog)
  const rhs = runExpression(expr.rhs, func, prog)
  if (lhs.type !== ValueType.Number || rhs.type !== ValueType.Number) {
    throw new Error(`Can only add and subtract numbers`)
  }

  let value: number
  switch (expr.op.type) {
    case TokenType.Minus:
      value = lhs.value - rhs.value
      break
    case TokenType.Plus:
      value = lhs.value + rhs.value
      break
    default:
      throw new Error(`Unrecognized operator ${expr.op.type}`)
  }

  return {
    type: ValueType.Number,
    value,
  }
}

function runFactorExpression(expr: FactorExpression, func: Function, prog: Program): Value {
  const lhs = runExpression(expr.lhs, func, prog)
  const rhs = runExpression(expr.rhs, func, prog)
  if (lhs.type !== ValueType.Number || rhs.type !== ValueType.Number) {
    throw new Error(`Can only add and subtract numbers`)
  }

  let value: number
  switch (expr.op.type) {
    case TokenType.Star:
      value = lhs.value * rhs.value
      break
    case TokenType.Slash:
      value = lhs.value / rhs.value
      break
    default:
      throw new Error(`Unrecognized operator ${expr.op.type}`)
  }

  return {
    type: ValueType.Number,
    value,
  }
}

function runCallExpression(expr: CallExpression, func: Function, prog: Program): Value {
  const callFunc = prog.functions[expr.funcName.source]
  if (!callFunc) {
    throw new Error(`No function found ${expr.funcName.source}`)
  }
  const params: Record<string, Value> = {}
  if (expr.params.length !== callFunc.args.length) {
    throw new Error(`Called func ${callFunc.name.source} with wrong num of params`)
  }
  for (let i = 0; i < expr.params.length; i++) {
    const val = runExpression(expr.params[i], func, prog)
    const name = callFunc.args[i]
    params[name.source] = val
  }
  return runFunction(callFunc, params, prog)
}

function runPrimaryExpression(expr: PrimaryExpression, func: Function): Value {
  switch (expr.value.type) {
    case PValueType.Number:
      return {
        type: ValueType.Number,
        value: expr.value.value
      }
    case PValueType.Bool:
      return {
        type: ValueType.Bool,
        value: expr.value.value
      }
    case PValueType.Identifier:
      const name = expr.value.tokens[0].source
      const val = func.vars[name]
      if (!val) {
        throw new Error(`Undeclared var ${name}`)
      }
      return val
    case PValueType.String:
      return {
        type: ValueType.String,
        value: expr.value.value
      }
    default:
      throw new Error(`Unrecognized value type ${expr.value.type}`)
  }
}