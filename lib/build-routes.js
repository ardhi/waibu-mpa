export async function build ({ files, pathPrefix, dir, ns, cfg, parent }) {
  const { importModule, defaultsDeep } = this.app.bajo
  const { isFunction, isPlainObject, pick } = this.app.bajo.lib._
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
      m.method = m.method ?? 'GET'
      await mergeRouteHooks.call(me, m)
      m.config = m.config ?? {}
      m.config.pathSrc = m.url
      m.config.engine = this.name
      m.config.ns = parent ?? ns
      m.config.title = m.title ?? m.config.name
      if (parent) m.config.subRouteOf = ns
      delete m.title
      m = defaultsDeep(pick(cfg, ['exposeHeadRoute', 'bodyLimit']), m)
      mods.push(m)
    }
  }
  return mods
}

async function buildRoutes (ctx, prefix) {
  const { eachPlugins, runHook, importModule } = this.app.bajo
  const { fastGlob } = this.app.bajo.lib
  const cfg = this.config
  const pathPrefix = 'waibuMpa/route'
  const isRouteDisabled = await importModule('waibu:/lib/webapp-scope/is-route-disabled.js')
  const reroutedPath = await importModule('waibu:/lib/webapp-scope/rerouted-path.js')
  const me = this
  await runHook(`${this.name}:beforeBuildRoutes`, ctx)
  await eachPlugins(async function ({ dir, alias, ns }) {
    let appPrefix = alias
    if (ns === me.ns || (ns === me.app.bajo.mainNs && cfg.mountMainAsRoot)) appPrefix = ''
    const pattern = `${dir}/${pathPrefix}/**/*.js`
    const files = await fastGlob(pattern)
    if (files.length === 0) return undefined
    await ctx.register(async (appCtx) => {
      await runHook(`${me.name}.${alias}:beforeBuildRoutes`, appCtx, appPrefix)
      const mods = await build.call(this, { appCtx, files, pathPrefix, dir, ns, cfg })
      for (const mod of mods) {
        const fullPath = `/${appPrefix}${mod.url}`
        if (await isRouteDisabled.call(me, fullPath, mod.method, cfg.disabled)) {
          me.log.warn('Route %s (%s) is disabled', `${prefix}${fullPath}`, mod.method)
          continue
        }
        const rpath = await reroutedPath.call(me, fullPath, cfg.rerouted)
        if (rpath) {
          me.log.warn('Rerouted %s -> %s', `${prefix}${fullPath}`, `${prefix}${rpath}`)
          mod.url = rpath
          mod.pathReroutedTo = rpath
          await ctx.route(mod)
        } else await appCtx.route(mod)
      }
      await runHook(`${me.name}.${alias}:afterBuildRoutes`, appCtx, appPrefix)
    }, { prefix: appPrefix })
  })
  await runHook(`${this.name}:afterBuildRoutes`, ctx)
}

export default buildRoutes
