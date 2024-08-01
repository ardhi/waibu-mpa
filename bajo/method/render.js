import path from 'path'
import applyFormat from '../../lib/apply-format.js'

async function render (tpl, locals = {}, reply, opts = {}) {
  const ext = path.extname(tpl)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(tpl, locals, reply, opts)
  if (ext === '.md') opts.markdown = true
  return await applyFormat.call(this, { text, ext, opts, reply, locals })
}

export default render
