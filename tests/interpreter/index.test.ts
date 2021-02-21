import { scan } from '../../src/scanner'
import { parse } from '../../src/parser'
import { interpret } from '../../src/interpreter'
import { readFileSync } from 'fs'

function interpretFile(path: string): any {
  const source = readFileSync(path, { encoding: 'utf8'})
  const tokens = scan(source)
  const prog = parse(tokens)
  return interpret(prog)
}


describe('variables', () => {
  it('succesfully declares vars', () => {
    expect(interpretFile(__dirname + '/../samples/variables.yal')).toBe(null)
  })
})

describe('function dec', () => {
  it('declares a function', () => {
    expect(interpretFile(__dirname + '/../samples/function.yal')).toBe(null)
  })
})

describe('term expr', () => {
  it('calcs add and sub', () => {
    expect(interpretFile(__dirname + '/../samples/term-expr.yal')).toBe(-2)
  })
})

describe('factor expr', () => {
  it('calcs mul and div', () => {
    expect(interpretFile(__dirname + '/../samples/factor-expr.yal')).toBe(15)
  })
})

describe('call expr', () => {
  it('calls a func', () => {
    expect(interpretFile(__dirname + '/../samples/call-expr.yal')).toBe(8)
  })
})

describe('bool', () => {
  it('returns bool', () => {
    expect(interpretFile(__dirname + '/../samples/bool.yal')).toBe(true)
  })
})

describe('equal', () => {
  it('equal', () => {
    expect(interpretFile(__dirname + '/../samples/equal.yal')).toBe(true)
  })

  it('equal fail', () => {
    expect(interpretFile(__dirname + '/../samples/equal-fail.yal')).toBe(false)
  })
})

describe('not equal', () => {
  it('not equal', () => {
    expect(interpretFile(__dirname + '/../samples/not-equal.yal')).toBe(true)
  })

  it('not equal fail', () => {
    expect(interpretFile(__dirname + '/../samples/not-equal-fail.yal')).toBe(false)
  })
})

describe('string', () => {
  it('works', () => {
    expect(interpretFile(__dirname + '/../samples/string.yal')).toBe('test')
  })
})