import decorate from '../lib/decorate.js'
import buildRoutes from '../lib/build-routes.js'
import collectViewEngines from '../lib/collect-view-engines.js'
import collectThemes from '../lib/collect-themes.js'
import collectIconsets from '../lib/collect-iconsets.js'
import handleSession from '../lib/session/setup.js'
import subApp from '../lib/sub-app.js'
import notFound from '../lib/not-found.js'
import error from '../lib/error.js'

const boot = {
  level: 10,
  handler: async function (ctx, prefix) {
    const { importPkg, importModule } = this.app.bajo
    const bodyParser = await importPkg('waibu:@fastify/formbody')
    const routeHook = await importModule('waibu:/lib/webapp-scope/route-hook.js')
    const handleMultipart = await importModule('waibu:/lib/webapp-scope/handle-multipart-body.js')
    const handleCors = await importModule('waibu:/lib/webapp-scope/handle-cors.js')
    const handleHelmet = await importModule('waibu:/lib/webapp-scope/handle-helmet.js')
    const handleCompress = await importModule('waibu:/lib/webapp-scope/handle-compress.js')
    const handleRateLimit = await importModule('waibu:/lib/webapp-scope/handle-rate-limit.js')

    await ctx.register(bodyParser)
    await handleRateLimit.call(this, ctx, this.config.rateLimit)
    await handleCors.call(this, ctx, this.config.cors)
    await handleHelmet.call(this, ctx, this.config.helmet)
    await handleCompress.call(this, ctx, this.config.compress)
    await handleMultipart.call(this, ctx, this.config.multipart)
    await decorate.call(this, ctx)
    await handleSession.call(this, ctx)
    await routeHook.call(this, this.name)
    await error.call(this, ctx)
    await collectViewEngines.call(this, ctx)
    await collectThemes.call(this, ctx)
    await collectIconsets.call(this, ctx)
    await buildRoutes.call(this, ctx, prefix)
    await subApp.call(this, ctx)
    await notFound.call(this, ctx)
  }
}

export default boot
