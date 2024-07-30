import path from 'path'
import applyFormat from '../../lib/apply-format.js'

async function render (tpl, params = {}, reply, opts = {}) {
  const ext = path.extname(tpl)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(tpl, params, reply, opts)
  if (ext === '.md') opts.markdown = true
  return applyFormat.call(this, { text, ext, opts, reply })
}

export default render
