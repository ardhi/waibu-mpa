async function buildLocals ({ template, params = {}, opts = {} } = {}) {
  const { runHook } = this.app.bajo
  const { merge, pick, get, isEmpty, find } = this.app.bajo.lib._
  const { req, reply } = opts
  const plugin = this.app[req.ns]
  params.page = merge(params.page ?? {}, { ns: req.ns, appTitle: req.t(plugin.title) })

  const { site, user, lang, darkMode } = req
  const theme = pick(find(this.themes, { name: req.theme }) ?? {}, ['name', 'framework'])
  const iconset = pick(find(this.iconsets, { name: req.iconset }) ?? {}, ['name'])
  const routeOpts = get(req, 'routeOptions.config', {})
  const plugins = this.app.bajo.pluginNames
  const _meta = { theme, iconset, site, user, lang, darkMode, routeOpts, plugins }
  merge(_meta, pick(req, ['url', 'params', 'query']))
  _meta.url = _meta.url.split('?')[0].split('#')[0]
  _meta.route = get(req, 'routeOptions.url')
  if (req.flash && !opts.partial) _meta.flash = reply.flash()
  const merged = merge({}, params, { _meta })
  await runHook(`${this.name}:afterBuildLocals`, merged, req)
  if (!isEmpty(routeOpts.ns)) await runHook(`${this.name}.${routeOpts.ns}:afterBuildLocals`, merged, req)
  return merged
}

export default buildLocals
