import { NativeFunction, Value, ValueType } from '../index'
import { readFileSync } from 'fs'

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

const nativeModule: Record<string, NativeFunction> = {
  readFile,
}
export default nativeModule
