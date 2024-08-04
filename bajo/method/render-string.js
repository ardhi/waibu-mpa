import applyFormat from '../../lib/apply-format.js'

async function renderString (text, params = {}, reply, opts = {}) {
  const ve = this.getViewEngine(opts.ext)
  text = await ve.renderString(text, params, reply, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, reply, opts })
}

export default renderString
