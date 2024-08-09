import path from 'path'
import crypto from 'crypto'
import applyFormat from '../../lib/apply-format.js'

async function render (tpl, locals = {}, reply, opts = {}) {
  const { runHook } = this.app.bajo
  const cache = this.app.bajoCache
  const key = crypto.createHash('md5').update(`${tpl}:${JSON.stringify(locals)}`).digest('hex')
  if (cache) {
    const item = await cache.get({ key })
    if (item) return item
  }
  await runHook(`${this.name}:beforeRender`, { tpl, locals, reply, opts })
  const ext = path.extname(tpl)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(tpl, locals, reply, opts)
  if (ext === '.md') opts.markdown = true
  const result = await applyFormat.call(this, { text, ext, opts, reply, locals })
  await runHook(`${this.name}:afterRender`, { tpl, locals, reply, opts, ext, result })
  if (cache) await cache.set({ key, value: result, ttl: this.config.page.cacheMaxAge * 1000 })
  return result
}

export default render
