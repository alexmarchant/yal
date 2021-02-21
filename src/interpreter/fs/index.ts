import { NativeFunction, Value, ValueType, VOID } from '../index'
import { readFileSync, writeFileSync } from 'fs'

const readFile: NativeFunction = {
  args: ['path'],
  async function(path: string): Promise<Value> {
    const str = readFileSync(path, { encoding: 'utf8' })
    return {
      type: ValueType.String,
      value: str
    }
  }
}

const writeFile: NativeFunction = {
  args: ['path', 'content'],
  async function(path: string, content: string): Promise<Value> {
    writeFileSync(path, content)
    return VOID
  }
}

const nativeModule: Record<string, NativeFunction> = {
  readFile,
  writeFile,
}
export default nativeModule
