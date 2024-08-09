import crypto from 'crypto'
import getImports from './get-imports.js'

async function getCachedResult (content, locals, { reply, ttl = 0, fn = false } = {}) {
  const { template } = this.app.bajo.lib._
  const cache = this.app.bajoCache
  const imports = getImports.call(this, reply)
  const tplOpts = { imports }
  let result
  if (cache) {
    let key = crypto.createHash('md5').update(content).digest('hex')
    if (fn) key = 'fn:' + key
    let item = await cache.get({ key })
    if (item) result = fn ? item(locals) : item
    else {
      item = fn ? template(content, tplOpts) : content
      result = fn ? item(locals) : item
      await cache.set({ key, value: item, ttl: ttl * 1000 })
    }
  } else {
    const item = fn ? template(content, tplOpts) : content
    result = fn ? item(locals) : item
  }
  return result
}

export default getCachedResult
