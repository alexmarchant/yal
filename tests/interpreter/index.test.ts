import{ interpretFile } from '../helpers'

describe('variables', () => {
  it('succesfully declares vars', async () => {
    const res = await interpretFile(__dirname + '/../samples/variables.yal')
    expect(res).toBe(null)
  })
})

describe('function dec', () => {
  it('declares a function', async () => {
    const res = await interpretFile(__dirname + '/../samples/function.yal')
    expect(res).toBe(null)
  })
})

describe('term expr', () => {
  it('calcs add and sub', async () => {
    const res = await interpretFile(__dirname + '/../samples/term-expr.yal')
    expect(res).toBe(-2)
  })
})

describe('factor expr', () => {
  it('calcs mul and div', async () => {
    const res = await interpretFile(__dirname + '/../samples/factor-expr.yal')
    expect(res).toBe(15)
  })
})

describe('call expr', () => {
  it('calls a func', async () => {
    const res = await interpretFile(__dirname + '/../samples/call-expr.yal')
    expect(res).toBe(8)
  })
})

describe('bool', () => {
  it('returns bool', async () => {
    const res = await interpretFile(__dirname + '/../samples/bool.yal')
    expect(res).toBe(true)
  })
})

describe('equal', () => {
  it('equal', async () => {
    const res = await interpretFile(__dirname + '/../samples/equal.yal')
    expect(res).toBe(true)
  })

  it('equal fail', async () => {
    const res = await interpretFile(__dirname + '/../samples/equal-fail.yal')
    expect(res).toBe(false)
  })
})

describe('not equal', () => {
  it('not equal', async () => {
    const res = await interpretFile(__dirname + '/../samples/not-equal.yal')
    expect(res).toBe(true)
  })

  it('not equal fail', async () => {
    const res = await interpretFile(__dirname + '/../samples/not-equal-fail.yal')
    expect(res).toBe(false)
  })
})

describe('string', () => {
  it('works', async () => {
    const res = await interpretFile(__dirname + '/../samples/string.yal')
    expect(res).toBe('test')
  })
})

describe('string addition', () => {
  it('works', async () => {
    const res = await interpretFile(__dirname + '/../samples/string-add.yal')
    expect(res).toBe('hello world')
  })
})