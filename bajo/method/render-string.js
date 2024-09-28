import applyFormat from '../../lib/apply-format.js'
import buildLocals from '../../lib/build-locals.js'

async function renderString (text, params = {}, opts = {}) {
  const ve = this.getViewEngine(opts.ext)
  const locals = await buildLocals.call(this, { template: null, params, opts })
  text = await ve.renderString(text, locals, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, opts, locals })
}

export default renderString
