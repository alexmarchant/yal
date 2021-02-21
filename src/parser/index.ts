import { Token, TokenType } from '../scanner'

export interface Program {
  functions: Record<string, Function | NativeFunction>
}

export interface Import {
  functions: Token[]
  moduleName: Value
  tokens: Token[]
}

export enum FunctionType {
  Native = 'Native',
  Script = 'Script',
}

export interface NativeFunction {
  type: FunctionType.Native
  name: string
  moduleName: string
}

export interface Function {
  type: FunctionType.Script
  name: Token
  args: Token[]
  statements: Statement[]
  tokens: Token[]
}

export enum StatementType {
  Expression = 'Expression',
  Return = 'Return',
  Declaration = 'Declaration',
}

export interface Statement {
  type: StatementType
  tokens: Token[]
}

export interface ExpressionStatement extends Statement {
  type: StatementType.Expression,
  expression: Expression
}

export interface ReturnStatement extends Statement{
  type: StatementType.Return,
  expression: Expression
}

export interface DeclarationStatement extends Statement{
  type: StatementType.Declaration,
  varName: Token
  expression: Expression
}

export enum ExpressionType {
  Equality = 'Equality',
  Term = 'Term',
  Factor = 'Factor',
  Call = 'Call',
  Primary = 'Primary',
}

export interface Expression {
  type: ExpressionType
  tokens: Token[]
}

export interface EqualityExpression extends Expression {
  type: ExpressionType.Equality
  lhs: Expression
  op: Token
  rhs: Expression
}

export interface TermExpression extends Expression {
  type: ExpressionType.Term
  lhs: Expression
  op: Token
  rhs: Expression
}

export interface FactorExpression extends Expression {
  type: ExpressionType.Factor
  lhs: Expression
  op: Token
  rhs: Expression
}

export interface CallExpression extends Expression {
  type: ExpressionType.Call
  funcName: Token,
  params: Expression[],
}

export interface PrimaryExpression extends Expression {
  type: ExpressionType.Primary
  value: Value
}

export enum ValueType {
  Number = 'Number',
  Identifier = 'Identifier',
  Bool = 'Bool',
  String = 'String',
}

export interface Value {
  type: ValueType,
  value: any,
  tokens: Token[],
}

export function parse(tokens: Token[]): Program {
  const functions: Record<string, Function | NativeFunction> = {}
  let position = 0

  // Imports
  while (true) {
    if (position >= tokens.length) break
    if (tokens[position].type === TokenType.NewLine) {
      position++
      continue
    }

    if (tokens[position].type === TokenType.KeyImport) {
      const imp = parseImport(tokens, position)
      for (const func of imp.functions) {
        const nativeFunc: NativeFunction = {
          type: FunctionType.Native,
          name: func.source,
          moduleName: imp.moduleName.value,
        }
        functions[nativeFunc.name] = nativeFunc
      }
      position += imp.tokens.length
    } else {
      break
    }
  }

  // Functions
  while (true) {
    if (position >= tokens.length) break
    if (tokens[position].type === TokenType.NewLine) {
      position++
      continue
    }

    const func = parseFunction(tokens, position)
    if (functions[func.name.source]) {
      throw new Error(`Cannot redeclare function ${func.name.source}`)
    }
    functions[func.name.source] = func
    position += func.tokens.length
  }

  return { functions }
}

function parseImport(tokens: Token[], position: number): Import {
  let lp = position

  if (tokens[lp].type !== TokenType.KeyImport) {
    throw new Error('Expecting keyword import')
  }
  lp++
  if (tokens[lp].type !== TokenType.OpenCurly) {
    throw new Error('Expecting {')
  }
  lp++

  const functions: Token[] = []
  while (true) {
    if (lp >= tokens.length) break
    if (tokens[lp].type === TokenType.CloseCurly) {
      lp++
      break
    }
    if (tokens[lp].type === TokenType.Comma) {
      lp++
      continue
    }

    if (tokens[lp].type !== TokenType.Identifier) {
      throw new Error('Expecting import vars')
    }
    functions.push(tokens[lp])
    lp++
  }

  if (tokens[lp].type !== TokenType.KeyFrom) {
    throw new Error('Expecting keyword from')
  }
  lp++
  if (tokens[lp].type !== TokenType.String) {
    throw new Error('Expecting module name')
  }
  const moduleNameExpr = parsePrimaryExpression(tokens, lp)
  const moduleName = moduleNameExpr.value
  lp++

  return {
    functions,
    moduleName,
    tokens: tokens.slice(position, lp)
  }
}

function parseFunction(tokens: Token[], position: number): Function {
  let lp = position

  if (tokens[lp].type !== TokenType.KeyFunc) {
    throw new Error(`Expected keyword func`)
  }
  lp++

  const name = tokens[lp]
  lp++

  if (tokens[lp].type !== TokenType.OpenParen) {
    throw new Error('Missing open paren')
  }
  lp++

  const args: Token[] = []
  while (true) {
    if (tokens[lp].type === TokenType.CloseParen) {
      lp++
      break
    }
    if (tokens[lp].type === TokenType.Identifier) {
      args.push(tokens[lp])
      lp++
      continue
    }
    if (tokens[lp].type === TokenType.Comma) {
      lp++
      continue
    }
    throw new Error(`Unexpected token in func declaration ${tokens[lp].type}`)
  }

  if (tokens[lp].type !== TokenType.OpenCurly) {
    throw new Error('Missing opening curly')
  }
  lp++

  if (tokens[lp].type !== TokenType.NewLine) {
    throw new Error('Missing new line after opening curly')
  }
  lp++

  const statements: Statement[] = []

  while (true) {
    if (lp >= tokens.length) {
      throw new Error(`Expected end of function`)
    }
    if (tokens[lp].type === TokenType.CloseCurly) {
      lp++
      break
    }

    const stmt = parseStatement(tokens, lp)
    statements.push(stmt)
    lp += stmt.tokens.length
    if (tokens[lp].type === TokenType.NewLine) lp++
  }

  return {
    type: FunctionType.Script,
    name,
    args,
    statements,
    tokens: tokens.slice(position, lp)
  }
}


function parseStatement(tokens: Token[], position: number): Statement {
  if (tokens[position].type === TokenType.KeyReturn) {
    let lp = position
    lp++
    const expr = parseExpression(tokens, lp)
    lp += expr.tokens.length
    const stmt: ReturnStatement = {
      type: StatementType.Return,
      expression: expr,
      tokens: tokens.slice(position, lp),
    }
    return stmt
  } else if (tokens[position].type === TokenType.Identifier && tokens[position + 1].type === TokenType.Declaration) {
    let lp = position
    const varName = tokens[lp]
    lp += 2
    const expr = parseExpression(tokens, lp)
    const stmt: DeclarationStatement = {
      type: StatementType.Declaration,
      varName,
      expression: expr,
      tokens: tokens.slice(position, lp),
    }
    return stmt
  } else {
    const expr = parseExpression(tokens, position)
    const stmt: ExpressionStatement = {
      type: StatementType.Expression,
      expression: expr,
      tokens: expr.tokens,
    }
    return stmt
  }
}

function parseExpression(tokens: Token[], position: number): Expression {
  return parseEqualityExpression(tokens, position)
}

function parseEqualityExpression(tokens: Token[], position: number): Expression {
  let lp = position

  const lhs = parseTermExpression(tokens, lp)
  lp += lhs.tokens.length

  const op = tokens[lp]
  if ([TokenType.NotEqual, TokenType.Equal].includes(op.type)) {
    lp++
    const rhs = parseExpression(tokens, lp)
    lp += rhs.tokens.length
    const expr: EqualityExpression = {
      type: ExpressionType.Equality,
      lhs,
      op,
      rhs,
      tokens: tokens.slice(position, lp)
    }
    return expr
  } else {
    return lhs
  }
}

function parseTermExpression(tokens: Token[], position: number): Expression {
  let lp = position

  const lhs = parseFactorExpression(tokens, lp)
  lp += lhs.tokens.length

  const op = tokens[lp]
  if ([TokenType.Plus, TokenType.Minus].includes(op.type)) {
    lp++
    const rhs = parseExpression(tokens, lp)
    lp += rhs.tokens.length
    const expr: TermExpression = {
      type: ExpressionType.Term,
      lhs,
      op,
      rhs,
      tokens: tokens.slice(position, lp)
    }
    return expr
  } else {
    return lhs
  }
}

function parseFactorExpression(tokens: Token[], position: number): Expression {
  let lp = position

  const lhs = parseCallExpression(tokens, lp)
  lp += lhs.tokens.length

  const op = tokens[lp]
  if ([TokenType.Star, TokenType.Slash].includes(op.type)) {
    lp++
    const rhs = parseExpression(tokens, lp)
    lp += rhs.tokens.length
    const expr: FactorExpression = {
      type: ExpressionType.Factor,
      lhs,
      op,
      rhs,
      tokens: tokens.slice(position, lp)
    }
    return expr
  } else {
    return lhs
  }
}

function parseCallExpression(tokens: Token[], position: number): Expression {
  if (tokens[position].type === TokenType.Identifier && tokens[position + 1].type === TokenType.OpenParen) {
    let lp = position + 2

    const params: Expression[] = []

    while (true) {
      if (tokens[lp].type === TokenType.CloseParen) {
        lp++
        break
      }
      if (tokens[lp].type === TokenType.Comma) {
        lp++
        continue
      }
      const expr = parseExpression(tokens, lp)
      params.push(expr)
      lp += expr.tokens.length
    }

    const expr: CallExpression = {
      type: ExpressionType.Call,
      funcName: tokens[position],
      params,
      tokens: tokens.slice(position, lp)
    }
    return expr
  } else {
    return parsePrimaryExpression(tokens, position)
  }
}

function parsePrimaryExpression(tokens: Token[], position: number): PrimaryExpression {
  const token = tokens[position]
  let value: Value
  switch (token.type) {
    case TokenType.Number:
      value = {
        type: ValueType.Number,
        value: parseFloat(token.source),
        tokens: [token]
      }
      break
    case TokenType.Bool:
      value = {
        type: ValueType.Bool,
        value: token.source === 'true' ? true : false,
        tokens: [token]
      }
      break
    case TokenType.Identifier:
      value = {
        type: ValueType.Identifier,
        value: null,
        tokens: [token]
      }
      break
    case TokenType.String:
      value = {
        type: ValueType.String,
        value: token.source.substring(1, token.source.length - 1),
        tokens: [token]
      }
      break
    default:
      throw new Error(`Unexpected primary expression ${token.type}`)
  }
  return {
    type: ExpressionType.Primary,
    value,
    tokens: tokens.slice(position, position + 1)
  }
}