import path from 'path'
import crypto from 'crypto'
import applyFormat from '../../lib/apply-format.js'
import buildLocals from '../../lib/build-locals.js'

async function render (template, params = {}, opts = {}) {
  const { runHook } = this.app.bajo
  const cache = this.app.bajoCache
  const locals = await buildLocals.call(this, { template, params, opts })
  const key = crypto.createHash('md5').update(`${template}:${JSON.stringify(locals)}`).digest('hex')
  if (cache) {
    const item = await cache.get({ key })
    if (item) return item
  }
  await runHook(`${this.name}:beforeRender`, { template, locals, opts })
  const ext = path.extname(template)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(template, locals, opts)
  const result = await applyFormat.call(this, { text, ext, opts, locals })
  await runHook(`${this.name}:afterRender`, { template, locals, opts, result })
  if (cache) await cache.set({ key, value: result, ttl: this.config.page.cacheMaxAge * 1000 })
  return result
}

export default render
