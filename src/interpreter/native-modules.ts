import { NativeFunction } from './index'
import http from './http'
import fs from './fs'
import io from './io'
import server from './server'

const modules: Record<string, Record<string, NativeFunction>> = {
  http,
  fs,
  io,
  server,
}
export default modules