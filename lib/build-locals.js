async function buildLocals (template, params = {}, reply) {
  const { runHook } = this.app.bajo
  const { find, merge, pick, get, isEmpty } = this.app.bajo.lib._
  const theme = find(this.themes, { name: reply.request.theme }) ?? {}
  const { site, user, lang, i18n } = reply.request
  // const ns = concat([name.split(':')[0]], cfg.i18n.defaultNs)
  const routeOpts = get(reply.request, 'routeOptions.config', {})
  const _meta = { theme, site, user, lang, i18n, template, routeOpts }
  merge(_meta, pick(reply.request, ['url', 'params', 'query']))
  _meta.url = _meta.url.split('?')[0].split('#')[0]
  _meta.qsKey = this.app.waibu.config.qsKey // what's that for?
  _meta.route = get(reply.request, 'routeOptions.url')
  if (reply.request.session) _meta.flash = reply.flash()
  const merged = merge({}, params, { _meta })
  await runHook(`${this.name}:afterBuildLocals`, merged, reply.request)
  if (!isEmpty(routeOpts.ns)) await runHook(`${this.name}.${routeOpts.ns}:afterBuildLocals`, merged, reply.request)
  return merged
}

export default buildLocals
