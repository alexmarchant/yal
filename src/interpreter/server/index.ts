import { NativeFunction, Value, VOID } from '../index'
import express from 'express'

const serveStatic: NativeFunction = {
  args: ['path', 'port'],
  async function(path: string, port: number): Promise<Value> {
    const app = express()
    app.use(express.static(path))
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
    return VOID
  }
}

const nativeModule: Record<string, NativeFunction> = {
  serveStatic,
}
export default nativeModule
