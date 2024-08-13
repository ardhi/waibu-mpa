import applyFormat from '../../lib/apply-format.js'

async function renderString (text, locals = {}, reply, opts = {}) {
  const ve = this.getViewEngine(opts.ext)
  text = await ve.renderString(text, locals, reply, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, reply, opts, locals })
}

export default renderString
