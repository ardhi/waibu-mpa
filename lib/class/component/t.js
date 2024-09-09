async function t (params = {}) {
  const { importModule } = this.plugin.app.bajo
  const { get } = this.plugin.app.bajo.lib._
  const { attrToArray } = this.plugin.app.waibuMpa

  params.noTag = true
  const value = attrToArray(params.attr.value, '|')
  const i18n = get(params, 'params.request.i18n')
  if (!i18n) return
  const ns = get(params, 'params.request.routeOptions.config.ns')
  const translate = await importModule('bajo:/boot/lib/translate.js')
  params.html = translate.call(this.plugin.app[ns], i18n, params.html, ...value)
}

export default t
