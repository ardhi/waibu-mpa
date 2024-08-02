async function t ({ params, reply } = {}) {
  const { importModule } = this.bajo
  const { get } = this._
  const { attrToArray } = this.mpa

  params.noTag = true
  const value = attrToArray(params.attr.value, '|')
  const i18n = get(reply, 'request.i18n')
  if (!i18n) return
  const ns = get(reply, 'request.routeOptions.config.ns')
  const translate = await importModule('bajo:/boot/lib/translate.js')
  params.html = translate.call(this.plugin.app[ns], i18n, params.html, ...value)
}

export default t
