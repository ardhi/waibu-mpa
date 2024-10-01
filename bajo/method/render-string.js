import applyFormat from '../../lib/apply-format.js'
import buildLocals from '../../lib/build-locals.js'

async function renderString (text, params = {}, opts = {}) {
  const locals = await buildLocals.call(this, { template: null, params, opts })
  const ve = this.getViewEngine(opts.ext)
  text = await ve.renderString(text, locals, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, opts, locals })
}

export default renderString
