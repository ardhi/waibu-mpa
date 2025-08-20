import path from 'path'

export async function build ({ files, pathPrefix, dir, ns, cfg, parent, urlPrefix, subRoute }) {
  const { defaultsDeep } = this.lib.aneka
  const { importModule, readJson } = this.app.bajo
  const { isFunction, isPlainObject, pick, last, camelCase } = this.lib._
  const { titleize } = this.lib.aneka
  const { getPluginPrefix } = this.app.waibu
  const mergeRouteHooks = await importModule('waibu:/lib/webapp-scope/merge-route-hooks.js')
  const mods = []
  const me = this
  for (const f of files) {
    const ext = path.extname(f)
    const url = f.slice(0, f.length - ext.length).replace(`${dir}/extend/${pathPrefix}`, '').replaceAll('@', ':')
    let mod
    if (ext === '.js') mod = await importModule(f)
    else if (ext === '.json') mod = await readJson(f)
    else if (['.html', '.md'].includes(ext)) mod = [{ view: f }]
    if (!mod) continue
    if (isFunction(mod)) mod = [{ handler: mod }]
    else if (isPlainObject(mod)) mod = [mod]
    for (let m of mod) {
      m.url = m.url ?? url
      if (isFunction(m.url)) m.url = await m.url.call(this)
      if (m.redirect) {
        m.handler = async function (req, reply) {
          return reply.redirectTo(m.redirect)
        }
      }
      if (!m.handler) {
        m.handler = async function (req, reply) {
          const params = {}
          let tpl = m.view ?? `${ns}.template:${m.url}.html`
          if (m.tbd) {
            params.page = { title: titleize(last(m.url.split('/'))) }
            tpl = 'waibuMpa.template:/tbd.html'
          }
          return await reply.view(tpl, params)
        }
      }
      if (urlPrefix) m.url = `/${urlPrefix}/${m.url}`
      m.method = m.method ?? 'GET'
      await mergeRouteHooks.call(me, m)
      m.config = m.config ?? {}
      m.config.prefix = getPluginPrefix(ns)
      m.config.pathSrc = m.url
      m.config.webApp = parent ?? ns
      m.config.ns = ns
      m.config.subNs = ''
      m.config.title = m.title ?? camelCase(last(m.url.split('/')))
      m.config.subRoute = subRoute
      delete m.title
      m = defaultsDeep(pick(cfg, ['exposeHeadRoute', 'bodyLimit']), m)
      mods.push(m)
    }
  }
  return mods
}

async function addRoutes ({ appPrefix, prefix, mods, ctx, appCtx, cfg }) {
  const { importModule } = this.app.bajo
  const isRouteDisabled = await importModule('waibu:/lib/webapp-scope/is-route-disabled.js')
  const reroutedPath = await importModule('waibu:/lib/webapp-scope/rerouted-path.js')
  for (const mod of mods) {
    const fullPath = `/${appPrefix}${mod.url}`
    if (await isRouteDisabled.call(this, fullPath, mod.method, cfg.disabled)) {
      this.log.warn('routeDisabled%s%s', `${prefix}${fullPath}`, mod.method)
      continue
    }
    const rpath = await reroutedPath.call(this, fullPath, cfg.rerouted)
    if (rpath) {
      this.log.warn('rerouted%s%s', `${prefix}${fullPath}`, `${prefix}${rpath}`)
      mod.url = rpath
      mod.pathReroutedTo = rpath
      await ctx.route(mod)
    } else await appCtx.route(mod)
  }
}

async function buildRoutes (ctx, prefix) {
  const { eachPlugins, runHook } = this.app.bajo
  const { getPluginPrefix } = this.app.waibu
  const { fastGlob } = this.lib
  const { groupBy } = this.lib._
  const cfg = this.config
  const pathPrefix = 'waibuMpa/route'
  const me = this
  const appCtxs = {}
  let subRoutes = []
  await runHook(`${this.name}:beforeBuildRoutes`, ctx)
  await eachPlugins(async function ({ dir, alias, ns }) {
    let appPrefix = getPluginPrefix(ns)
    if (ns === me.ns || (ns === me.app.bajo.mainNs && cfg.mountMainAsRoot)) appPrefix = ''
    const pattern = `${dir}/extend/${pathPrefix}/**/*.{js,json,html,md}`
    const files = await fastGlob(pattern)
    // subRoutes
    const spattern = `${dir}/extend/waibuMpa/extend/{${me.app.bajo.pluginNames.join(',')}}/route/**/*.{js,json,html,md}`
    const sfiles = await fastGlob(spattern)
    for (const file of sfiles) {
      const [sns] = file.replace(`${dir}/extend/waibuMpa/extend/`, '').split('/')
      subRoutes.push({ file, ns: sns, sns: ns, dir })
    }
    if (files.length === 0) return undefined
    await ctx.register(async (appCtx) => {
      appCtxs[ns] = appCtx
      await runHook(`${me.name}.${this.name}:beforeBuildRoutes`, appCtx, appPrefix)
      const mods = await build.call(this, { appCtx, files, appPrefix, pathPrefix, dir, ns, cfg, parent: me.name })
      await addRoutes.call(me, { appPrefix, prefix, mods, ctx, appCtx, cfg })
      await runHook(`${me.name}.${this.name}:afterBuildRoutes`, appCtx, appPrefix)
    }, { prefix: appPrefix })
  })
  if (subRoutes.length > 0) {
    subRoutes = groupBy(subRoutes, 'ns')
    for (const k in subRoutes) {
      const items = subRoutes[k]
      if (items.length === 0) continue
      const { sns, ns } = items[0]
      const appCtx = appCtxs[ns]
      if (!appCtx) throw this.error('cantHaveSubroutesWithoutContext%s', ns)
      let appPrefix = getPluginPrefix(sns)
      if (sns === me.ns || (sns === me.app.bajo.mainNs && cfg.mountMainAsRoot)) appPrefix = ''
      await runHook(`${me.name}.${k}:beforeBuildSubRoutes`, appCtx, appPrefix)
      for (const item of items) {
        const { file, sns, ns, dir } = item
        const scope = this.app[ns]
        const pathPrefix = `waibuMpa/extend/${ns}/route/`
        const urlPrefix = getPluginPrefix(sns)
        const mods = await build.call(scope, { appCtx, files: [file], pathPrefix, dir, ns, cfg, parent: me.name, urlPrefix, subRoute: sns })
        await addRoutes.call(me, { appPrefix, prefix, mods, ctx, appCtx, cfg })
      }
      await runHook(`${me.name}.${k}:afterBuildSubRoutes`, appCtx, appPrefix)
    }
  }

  await runHook(`${this.name}:afterBuildRoutes`, ctx)
}

export default buildRoutes
