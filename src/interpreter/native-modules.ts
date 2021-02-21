import { NativeFunction } from './index'
import http from './http'
import fs from './fs'
import io from './io'

const modules: Record<string, Record<string, NativeFunction>> = {
  http,
  fs,
  io,
}
export default modules