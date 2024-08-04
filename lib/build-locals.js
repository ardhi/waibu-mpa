async function buildLocals (template, params = {}, reply) {
  const { runHook } = this.app.bajo
  const { merge, pick, get, isEmpty, find } = this.app.bajo.lib._

  const { site, user, lang, i18n, darkMode } = reply.request
  const theme = pick(find(this.themes, { name: reply.request.theme }) ?? {}, ['name', 'framework'])
  const iconset = pick(find(this.iconsets, { name: reply.request.iconset }) ?? {}, ['name'])
  const routeOpts = get(reply.request, 'routeOptions.config', {})
  const _meta = { theme, iconset, site, user, lang, i18n, darkMode, template, routeOpts }
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
