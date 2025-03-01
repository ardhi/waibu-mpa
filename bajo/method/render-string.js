async function renderString (text, params = {}, opts = {}) {
  const { importModule } = this.app.bajo
  const buildLocals = await importModule('waibu:/lib/build-locals.js')
  const locals = await buildLocals.call(this, { tpl: null, params, opts })
  const ve = this.getViewEngine(opts.ext)
  return await ve.renderString(text, locals, opts)
}

export default renderString
