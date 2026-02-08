import decorate from '../../lib/decorate.js'
import buildRoutes from '../../lib/build-routes.js'
import collectViewEngines from '../../lib/collect-view-engines.js'
import collectThemes from '../../lib/collect-themes.js'
import collectIconsets from '../../lib/collect-iconsets.js'
import handleSession from '../../lib/session/setup.js'
import subApp from '../../lib/sub-app.js'
import errorHandler from '../../lib/error-handler.js'

const boot = {
  level: 10,
  errorHandler,
  handler: async function (prefix) {
    const { importPkg, importModule } = this.app.bajo
    const bodyParser = await importPkg('waibu:@fastify/formbody')
    const routeHook = await importModule('waibu:/lib/webapp-scope/route-hook.js')
    const handleMultipart = await importModule('waibu:/lib/webapp-scope/handle-multipart-body.js')
    const handleCors = await importModule('waibu:/lib/webapp-scope/handle-cors.js')
    const handleHelmet = await importModule('waibu:/lib/webapp-scope/handle-helmet.js')
    const handleCompress = await importModule('waibu:/lib/webapp-scope/handle-compress.js')
    const handleRateLimit = await importModule('waibu:/lib/webapp-scope/handle-rate-limit.js')

    await this.webAppCtx.register(bodyParser)
    await handleRateLimit.call(this, this.config.rateLimit)
    await handleCors.call(this, this.config.cors)
    await handleHelmet.call(this, this.config.helmet)
    await handleCompress.call(this, this.config.compress)
    await handleMultipart.call(this, this.config.multipart)
    await decorate.call(this)
    await handleSession.call(this)
    await routeHook.call(this, this.ns)
    await collectViewEngines.call(this)
    await collectThemes.call(this)
    await collectIconsets.call(this)
    await buildRoutes.call(this, prefix)
    await subApp.call(this)
  }
}

export default boot
