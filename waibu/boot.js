import decorate from '../lib/decorate.js'
import buildRoutes from '../lib/build-routes.js'
import collectViewEngines from '../lib/collect-view-engines.js'
import collectThemes from '../lib/collect-themes.js'
import collectIconsets from '../lib/collect-iconsets.js'
import handleSession from '../lib/session/setup.js'
import subApp from '../lib/sub-app.js'
// import notFound from '../lib/not-found.js'
import error from '../lib/error.js'

const boot = {
  level: 10,
  handler: async function () {
    const { importPkg, importModule, runHook } = this.app.bajo
    const bodyParser = await importPkg('waibu:@fastify/formbody')
    const cfg = this.config
    let prefix = cfg.prefix === '' ? '' : ('/' + cfg.prefix)
    if (cfg.i18n.detectors.includes('path')) prefix = `/:lang${prefix}`
    const routeHook = await importModule('waibu:/lib/webapp-scope/route-hook.js')
    const handleMultipart = await importModule('waibu:/lib/webapp-scope/handle-multipart-body.js')
    const handleCors = await importModule('waibu:/lib/webapp-scope/handle-cors.js')
    const handleHelmet = await importModule('waibu:/lib/webapp-scope/handle-helmet.js')
    const handleCompress = await importModule('waibu:/lib/webapp-scope/handle-compress.js')
    const handleRateLimit = await importModule('waibu:/lib/webapp-scope/handle-rate-limit.js')
    await this.app.waibu.instance.register(async (ctx) => {
      this.instance = ctx
      await runHook(`${this.name}:afterCreateContext`, ctx)
      await ctx.register(bodyParser)
      await handleRateLimit.call(this, ctx, cfg.rateLimit)
      await handleCors.call(this, ctx, cfg.cors)
      await handleHelmet.call(this, ctx, cfg.helmet)
      await handleCompress.call(this, ctx, cfg.compress)
      await handleMultipart.call(this, ctx, cfg.multipart)
      await decorate.call(this, ctx)
      await handleSession.call(this, ctx)
      await routeHook.call(this, this.name)
      await error.call(this, ctx)
      await collectViewEngines.call(this, ctx)
      await collectThemes.call(this, ctx)
      await collectIconsets.call(this, ctx)
      await runHook(`${this.name}:beforeCreateRoutes`, ctx)
      await buildRoutes.call(this, ctx, prefix)
      await runHook(`${this.name}:afterCreateRoutes`, ctx)
      await subApp.call(this, ctx)
      // await notFound.call(this, ctx)
    }, { prefix })
  }
}

export default boot
