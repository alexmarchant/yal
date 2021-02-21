import { Token, TokenType } from '../scanner'

export interface Program {
  functions: Record<string, Function>
}

export interface Function {
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
  Primary = 'Primary',
  Term = 'Term',
  Call = 'Call',
}

export interface Expression {
  type: ExpressionType
  tokens: Token[]
}

export interface TermExpression extends Expression {
  type: ExpressionType.Term
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
  Identifier = 'Identifier'
}

export interface Value {
  type: ValueType,
  value: any,
  token: Token,
}

export function parse(tokens: Token[]): Program {
  const functions: Record<string, Function> = {}
  let position = 0

  while (true) {
    if (position >= tokens.length) break
    if (tokens[position].type === TokenType.NewLine) {
      position++
      continue
    }

    let func = parseFunction(tokens, position)
    if (functions[func.name.source]) {
      throw new Error(`Cannot redeclare function ${func.name.source}`)
    }
    functions[func.name.source] = func
    position += func.tokens.length
  }

  return { functions }
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
  return parseTermExpression(tokens, position)
}

function parseTermExpression(tokens: Token[], position: number): Expression {
  let lp = position

  const lhs = parseCallExpression(tokens, lp)
  lp += lhs.tokens.length

  const op = tokens[lp]

  if ([TokenType.Plus, TokenType.Minus].includes(op.type)) {
    lp++
    const rhs = parseCallExpression(tokens, lp)
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
        token
      }
      break
    case TokenType.Identifier:
      value = {
        type: ValueType.Identifier,
        value: null,
        token
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