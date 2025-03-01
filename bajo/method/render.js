import path from 'path'

async function render (tpl, params = {}, opts = {}) {
  const { importModule } = this.app.bajo
  const buildLocals = await importModule('waibu:/lib/build-locals.js')
  const locals = await buildLocals.call(this, { tpl, params, opts })
  const ext = path.extname(tpl)
  if (['.json', '.js', '.css'].includes(ext)) opts.partial = true
  opts.ext = ext
  opts.cacheMaxAge = this.config.page.cacheMaxAgeDur
  const viewEngine = this.getViewEngine(ext)
  return await viewEngine.render(tpl, locals, opts)
}

export default render
