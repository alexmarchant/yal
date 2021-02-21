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
  FunctionType,
  NativeFunction as PNativeFunction,
} from '../parser'
import { TokenType } from '../scanner'
import nativeModules from './native-modules'

const MAIN_FUNCTION_ID = 'main'

export interface NativeFunction {
  args: string[]
  function: any
}

export interface Function {
  pFunc: PFunction
  vars: Record<string, Value>
}

export enum ValueType {
  Number = 'Number',
  Bool = 'Bool',
  Void = 'Void',
  String = 'String',
}

export interface Value {
  type: ValueType
  value: any
}

export const VOID: Value = {
  type: ValueType.Void,
  value: null
}

export async function interpret(program: Program): Promise<any> {
  const mainFunc = program.functions[MAIN_FUNCTION_ID]
  if (!program.functions[MAIN_FUNCTION_ID]) {
    throw new Error('No main function found')
  }
  const val = await runFunction(mainFunc as PFunction, [], program)
  return val.value
}

async function runFunction(pFunc: PFunction, params: Value[], prog: Program): Promise<Value> {
  if (pFunc.args.length !== params.length) {
    throw new Error(`Called func ${pFunc.name.source} with wrong num of params`)
  }
  const paramMap = pFunc.args.reduce<Record<string, Value>>((acc, arg, i) => {
    acc[arg.source] = params[i]
    return acc
  }, {})
  const func: Function = {
    pFunc,
    vars: {
      ...paramMap
    }
  }

  for (const stmt of func.pFunc.statements) {
    switch (stmt.type) {
      case StatementType.Declaration:
        await runDeclarationStatement(stmt as DeclarationStatement, func, prog)
        break
      case StatementType.Expression:
        const exprStmt = stmt as ExpressionStatement
        await runExpression(exprStmt.expression, func, prog)
        break
      case StatementType.Return:
        const retStmt = stmt as ReturnStatement
        const val = await runExpression(retStmt.expression, func, prog)
        return val
      default:
        throw new Error(`Unrecognized stmt type ${stmt.type}`)
    }
  }

  return VOID
}

async function runNativeFunction(pNativeFunc: PNativeFunction, params: Value[], prog: Program): Promise<Value> {
  const nativeModule = nativeModules[pNativeFunc.moduleName]
  if (!nativeModule) {
    throw new Error(`Module ${pNativeFunc.moduleName} not found`)
  }
  const nativeFunc = nativeModule[pNativeFunc.name]
  if (!nativeFunc) {
    throw new Error(`Module ${pNativeFunc.moduleName} does not have function ${pNativeFunc.name}`)
  }
  if (nativeFunc.args.length !== params.length) {
    throw new Error(`Called func ${pNativeFunc.name} with wrong num of args`)
  }
  const paramsNativeValues = params.map(param => param.value)
  return await nativeFunc.function(...paramsNativeValues)
}

async function runDeclarationStatement(stmt: DeclarationStatement, func: Function, prog: Program) {
  const varName = stmt.varName.source
  const val = await runExpression(stmt.expression, func, prog)
  if (func.vars[varName]) {
    throw new Error(`Cannot redeclare var name ${varName}`)
  }
  func.vars[varName] = val
} 

async function runExpression(expr: Expression, func: Function, prog: Program): Promise<Value> {
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

async function runEqualityExpression(expr: EqualityExpression, func: Function, prog: Program): Promise<Value> {
  const lhs = await runExpression(expr.lhs, func, prog)
  const rhs = await runExpression(expr.rhs, func, prog)
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

async function runTermExpression(expr: TermExpression, func: Function, prog: Program): Promise<Value> {
  const lhs = await runExpression(expr.lhs, func, prog)
  const rhs = await runExpression(expr.rhs, func, prog)
  if (lhs.type !== rhs.type) {
    throw new Error(`Can only add and subtract values of same type`)
  }

  let value: number
  switch (expr.op.type) {
    case TokenType.Minus:
      if (lhs.type !== ValueType.Number) {
        throw new Error(`Cannot subtract this type`)
      }
      value = lhs.value - rhs.value
      break
    case TokenType.Plus:
      if (![ValueType.String, ValueType.Number].includes(lhs.type)) {
        throw new Error(`Cannot add this type`)
      }
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

async function runFactorExpression(expr: FactorExpression, func: Function, prog: Program): Promise<Value> {
  const lhs = await runExpression(expr.lhs, func, prog)
  const rhs = await runExpression(expr.rhs, func, prog)
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

async function runCallExpression(expr: CallExpression, func: Function, prog: Program): Promise<Value> {
  const callFunc = prog.functions[expr.funcName.source]
  if (!callFunc) {
    throw new Error(`No function found ${expr.funcName.source}`)
  }

  const params: Value[] = []
  for (const param of expr.params) {
    const paramValue = await runExpression(param, func, prog)
    params.push(paramValue)
  }

  switch (callFunc.type) {
    case FunctionType.Script:
      return runFunction(callFunc, params, prog)
    case FunctionType.Native:
      const nativeFunc = callFunc as PNativeFunction
      return runNativeFunction(nativeFunc, params, prog)
    default:
      throw new Error('Unexpected FunctionType')
  }
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
        console.error(func.vars)
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
