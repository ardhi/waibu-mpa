import applyFormat from '../../lib/apply-format.js'
import buildLocals from '../../lib/build-locals.js'

async function renderString (text, params = {}, reply, opts = {}) {
  const { merge } = this.app.bajo.lib._
  const ve = this.getViewEngine(opts.ext)
  const locals = await buildLocals.call(this, null, merge({}, params, { opts }), reply)
  text = await ve.renderString(text, locals, reply, opts)
  return await applyFormat.call(this, { text, ext: opts.ext, reply, opts, locals })
}

export default renderString
