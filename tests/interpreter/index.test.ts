import { scan } from '../../src/scanner'
import { parse } from '../../src/parser'
import { interpret } from '../../src/interpreter'
import { readFileSync } from 'fs'


describe('variables', () => {
  it('succesfully declares vars', () => {
    const source = readFileSync(__dirname + '/../samples/variables.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(null)
  })
})

describe('function dec', () => {
  it('declares a function', () => {
    const source = readFileSync(__dirname + '/../samples/function.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(null)
  })
})

describe('term expr', () => {
  it('calcs add and sub', () => {
    const source = readFileSync(__dirname + '/../samples/term-expr.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(-2)
  })
})

describe('factor expr', () => {
  it('calcs mul and div', () => {
    const source = readFileSync(__dirname + '/../samples/factor-expr.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(15)
  })
})

describe('call expr', () => {
  it('calls a func', () => {
    const source = readFileSync(__dirname + '/../samples/call-expr.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(8)
  })
})

describe('bool', () => {
  it('returns bool', () => {
    const source = readFileSync(__dirname + '/../samples/bool.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(true)
  })
})

describe('equal', () => {
  it('equal', () => {
    const source = readFileSync(__dirname + '/../samples/equal.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(true)
  })

  it('equal fail', () => {
    const source = readFileSync(__dirname + '/../samples/equal-fail.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(false)
  })
})

describe('not equal', () => {
  it('not equal', () => {
    const source = readFileSync(__dirname + '/../samples/not-equal.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(true)
  })

  it('not equal fail', () => {
    const source = readFileSync(__dirname + '/../samples/not-equal-fail.yal', { encoding: 'utf8' })
    const tokens = scan(source)
    const prog = parse(tokens)
    expect(interpret(prog)).toBe(false)
  })
})