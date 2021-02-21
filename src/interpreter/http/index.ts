import { NativeFunction, Value, ValueType } from '../index'
import axios from 'axios'

const get: NativeFunction = {
  args: ['url'],
  async function(url: string): Promise<Value> {
    const res = await axios.get<string>(url)
    return {
      type: ValueType.String,
      value: res.data
    }
  }
}

const nativeModule: Record<string, NativeFunction> = {
  get,
}
export default nativeModule
