import { scan } from './scanner'
import { parse } from './parser'
import { interpret } from './interpreter'
import { readFileSync } from 'fs'

const source = readFileSync(__dirname + '/test.yal', { encoding: 'utf8' })
const tokens = scan(source)
const prog = parse(tokens)
interpret(prog)