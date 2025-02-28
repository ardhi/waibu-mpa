import buildLocals from '../../lib/build-locals.js'

async function renderString (text, params = {}, opts = {}) {
  const locals = await buildLocals.call(this, { tpl: null, params, opts })
  const ve = this.getViewEngine(opts.ext)
  return await ve.renderString(text, locals, opts)
}

export default renderString
