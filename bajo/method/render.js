import path from 'path'
import buildLocals from '../../lib/build-locals.js'

async function render (tpl, params = {}, opts = {}) {
  const locals = await buildLocals.call(this, { tpl, params, opts })
  const ext = path.extname(tpl)
  if (['.json', '.js', '.css'].includes(ext)) opts.partial = true
  opts.ext = ext
  const viewEngine = this.getViewEngine(ext)
  return await viewEngine.render(tpl, locals, opts)
}

export default render
