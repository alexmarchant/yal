import { NativeFunction, Value, VOID } from '../index'

const print: NativeFunction = {
  args: ['val'],
  async function(val: any): Promise<Value> {
    console.log(val)
    return VOID
  }
}

const nativeModule: Record<string, NativeFunction> = {
  print,
}
export default nativeModule
