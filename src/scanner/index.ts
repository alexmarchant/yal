export interface Token {
  type: TokenType
  source: string
  line: number
  col: number
}

export enum TokenType {
  Number = 'Number',
  Plus = 'Plus',
  Minus = 'Minus',
  Star = 'Star',
  Slash = 'Slash',
  NewLine = 'NewLine',
  Identifier = 'Identifier',
  Declaration = 'Declaration',
  OpenParen = 'OpenParen',
  CloseParen = 'CloseParen',
  Comma = 'Comma',
  OpenCurly = 'OpenCurly',
  CloseCurly = 'CloseCurly',
  KeyFunc = 'KeyFunc',
  KeyReturn = 'KeyReturn',
  Bool = 'Bool',
  NotEqual = 'NotEqual',
  Equal = 'Equal',
}

export function scan(source: string): Token[] {
  let position = 0
  const tokens: Token[] = []

  while (true) {
    if (position >= source.length) {
      break
    }

    const spaces = getSpaces(source, position)
    if (spaces) {
      position += spaces.length
      continue
    }

    const token = getToken(source, position)
    if (token) {
      tokens.push(token)
      position += token.source.length
      continue
    }

    throw new Error(`Unknown token: ${sourceAtPosition(source, position)}`)
  }

  return tokens
}

function getSpaces(source: string, position: number): string | false {
  const match = sourceAtPosition(source, position).match(/^ +/)
  if (match) {
    return match[0]
  } else {
    return false
  }
}

function getToken(source: string, position: number): Token | false {
  const { line, col } = getLineAndColForPosition(source, position)

  // Single char tokens
  let type: TokenType | undefined
  switch(source[position]) {
    case '\n':
      type = TokenType.NewLine
      break
    case '(':
      type = TokenType.OpenParen
      break
    case ')':
      type = TokenType.CloseParen
      break
    case '+':
      type = TokenType.Plus
      break
    case '-':
      type = TokenType.Minus
      break
    case '*':
      type = TokenType.Star
      break
    case '/':
      type = TokenType.Slash
      break
    case ',':
      type = TokenType.Comma
      break
    case '{':
      type = TokenType.OpenCurly
      break
    case '}':
      type = TokenType.CloseCurly
      break
  }

  if (type) {
    return {
      type,
      source: source[position],
      line,
      col
    }
  }

  const notEq = getMatch(source, position, /^!=/)
  if (notEq) {
    return {
      type: TokenType.NotEqual,
      source: notEq,
      line,
      col
    }
  }

  const eq = getMatch(source, position, /^==/)
  if (eq) {
    return {
      type: TokenType.Equal,
      source: eq,
      line,
      col
    }
  }

  const num = getMatch(source, position, /^\d+/)
  if (num) {
    return {
      type: TokenType.Number,
      source: num,
      line,
      col
    }
  }

  const id = getMatch(source, position, /^\w+/)
  if (id) {
    // Match keywords, or else id
    let type: TokenType
    switch (id) {
      case 'func':
        type = TokenType.KeyFunc
        break
      case 'return':
        type = TokenType.KeyReturn
        break
      case 'true':
      case 'false':
        type = TokenType.Bool
        break
      default:
        type = TokenType.Identifier
    }

    return {
      type,
      source: id,
      line,
      col
    }
  }

  const dec = getMatch(source, position, /^:=/)
  if (dec) {
    return {
      type: TokenType.Declaration,
      source: dec,
      line,
      col
    }
  }

  return false
}

function getMatch(source: string, position: number, regex: RegExp): string | false {
  const match = sourceAtPosition(source, position).match(regex)
  if (match) {
    return match[0]
  } else {
    return false
  }
}

function sourceAtPosition(source: string, position: number) {
  return source.slice(position)
}

function getLineAndColForPosition(source: string, position: number): { line: number, col: number } {
  let val = { line: 0, col: 0 }
  for (let i = 0; i < position; i++) {
    val.col += 1
    if (source[i] === '\n') {
      val.line += 1 
      val.col = 0
    }
  }
  return val
}
