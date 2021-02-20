import { scan } from './scanner'
import { readFileSync } from 'fs'

const source = readFileSync('./samples/function.yal', { encoding: 'utf8' })
const tokens = scan(source)
console.log(tokens)