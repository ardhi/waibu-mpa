import path from 'path'
import applyFormat from '../../lib/apply-format.js'

async function render (tpl, locals = {}, reply, opts = {}) {
  const { runHook } = this.app.bajo

  await runHook(`${this.name}:beforeRender`, { tpl, locals, reply, opts })
  const ext = path.extname(tpl)
  const viewEngine = this.getViewEngine(ext)
  const text = await viewEngine.render(tpl, locals, reply, opts)
  if (ext === '.md') opts.markdown = true
  const result = await applyFormat.call(this, { text, ext, opts, reply, locals })
  await runHook(`${this.name}:afterRender`, { tpl, locals, reply, opts, ext, result })
  return result
}

export default render
