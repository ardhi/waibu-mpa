import applyFormat from '../../lib/apply-format.js'

async function renderString (text, params = {}, opts = {}) {
  const ve = this.getViewEngine(opts.ext)
  text = await ve.renderString(text, params, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, opts })
}

export default renderString
