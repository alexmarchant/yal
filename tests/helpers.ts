import { scan } from '../src/scanner'
import { parse } from '../src/parser'
import { interpret } from '../src/interpreter'
import { readFileSync } from 'fs'

export async function interpretFile(path: string): Promise<any> {
  const source = readFileSync(path, { encoding: 'utf8'})
  const tokens = scan(source)
  const prog = parse(tokens)
  return interpret(prog)
}