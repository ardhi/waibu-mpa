export async function build ({ files, pathPrefix, dir, ns, cfg, parent, urlPrefix }) {
  const { importModule, defaultsDeep } = this.app.bajo
  const { isFunction, isPlainObject, pick } = this.app.bajo.lib._
  const { getAppPrefix } = this.app.waibu
  const mergeRouteHooks = await importModule('waibu:/lib/webapp-scope/merge-route-hooks.js')
  const mods = []
  const me = this
  for (const f of files) {
    const url = f.slice(0, f.length - 3).replace(`${dir}/${pathPrefix}`, '').replaceAll('@', ':')
    let mod = await importModule(f)
    if (isFunction(mod)) mod = [{ handler: mod }]
    else if (isPlainObject(mod)) mod = [mod]
    for (let m of mod) {
      m.url = m.url ?? url
      if (urlPrefix) m.url = `/${urlPrefix}/${m.url}`
      m.method = m.method ?? 'GET'
      await mergeRouteHooks.call(me, m)
      m.config = m.config ?? {}
      m.config.prefix = getAppPrefix(ns)
      m.config.pathSrc = m.url
      m.config.webApp = parent ?? ns
      m.config.ns = ns
      m.config.title = m.title
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
      this.log.warn('Route %s (%s) is disabled', `${prefix}${fullPath}`, mod.method)
      continue
    }
    const rpath = await reroutedPath.call(this, fullPath, cfg.rerouted)
    if (rpath) {
      this.log.warn('Rerouted %s -> %s', `${prefix}${fullPath}`, `${prefix}${rpath}`)
      mod.url = rpath
      mod.pathReroutedTo = rpath
      await ctx.route(mod)
    } else await appCtx.route(mod)
  }
}

async function buildRoutes (ctx, prefix) {
  const { eachPlugins, runHook } = this.app.bajo
  const { getAppPrefix } = this.app.waibu
  const { fastGlob } = this.app.bajo.lib
  const { groupBy } = this.app.bajo.lib._
  const cfg = this.config
  const pathPrefix = 'waibuMpa/route'
  const me = this
  const appCtxs = {}
  let subRoutes = []
  await runHook(`${this.name}:beforeBuildRoutes`, ctx)
  await eachPlugins(async function ({ dir, alias, ns }) {
    let appPrefix = getAppPrefix(ns)
    if (ns === me.ns || (ns === me.app.bajo.mainNs && cfg.mountMainAsRoot)) appPrefix = ''
    const pattern = `${dir}/${pathPrefix}/**/*.js`
    const files = await fastGlob(pattern)
    // subRoutes
    const spattern = `${dir}/waibuMpa/{${me.app.bajo.pluginNames.join(',')}}/route/**/*.js`
    const sfiles = await fastGlob(spattern)
    for (const file of sfiles) {
      const [sns] = file.replace(`${dir}/waibuMpa/`, '').split('/')
      subRoutes.push({ file, ns: sns, sns: ns, dir })
    }
    if (files.length === 0) return undefined
    await ctx.register(async (appCtx) => {
      appCtxs[ns] = appCtx
      await runHook(`${me.name}.${this.name}:beforeBuildRoutes`, appCtx, appPrefix)
      const mods = await build.call(this, { appCtx, files, pathPrefix, dir, ns, cfg, parent: me.name })
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
      let appPrefix = getAppPrefix(sns)
      if (sns === me.ns || (sns === me.app.bajo.mainNs && cfg.mountMainAsRoot)) appPrefix = ''
      await runHook(`${me.name}.${k}:beforeBuildSubRoutes`, appCtx, appPrefix)
      for (const item of items) {
        const { file, sns, ns, dir } = item
        const scope = this.app[ns]
        const pathPrefix = `waibuMpa/${ns}/route/`
        const urlPrefix = getAppPrefix(sns)
        const mods = await build.call(scope, { appCtx, files: [file], pathPrefix, dir, ns, cfg, parent: me.name, urlPrefix })
        await addRoutes.call(me, { appPrefix, prefix, mods, ctx, appCtx, cfg })
      }
      await runHook(`${me.name}.${k}:afterBuildSubRoutes`, appCtx, appPrefix)
    }
  }

  await runHook(`${this.name}:afterBuildRoutes`, ctx)
}

export default buildRoutes
