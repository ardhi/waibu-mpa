import path from 'path'
import crypto from 'crypto'
import applyFormat from '../../lib/apply-format.js'
import buildLocals from '../../lib/build-locals.js'

async function render (tpl, params = {}, reply, opts = {}) {
  const { runHook } = this.app.bajo
  const { merge } = this.app.bajo.lib._
  const cache = this.app.bajoCache
  const locals = await buildLocals.call(this, tpl, merge({}, params, opts), reply)
  const key = crypto.createHash('md5').update(`${tpl}:${JSON.stringify(locals)}`).digest('hex')
  if (cache) {
    const item = await cache.get({ key })
    if (item) return item
  }
  await runHook(`${this.name}:beforeRender`, { tpl, locals, reply, opts })
  const ext = path.extname(tpl)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(tpl, locals, reply, opts)
  const result = await applyFormat.call(this, { text, ext, opts, reply, locals })
  await runHook(`${this.name}:afterRender`, { tpl, locals, reply, opts, ext, result })
  if (cache) await cache.set({ key, value: result, ttl: this.config.page.cacheMaxAge * 1000 })
  return result
}

export default render
