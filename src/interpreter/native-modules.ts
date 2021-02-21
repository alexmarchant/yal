import { NativeFunction } from './index'
import http from './http'
import fs from './fs'

const modules: Record<string, Record<string, NativeFunction>> = {
  http,
  fs,
}
export default modules