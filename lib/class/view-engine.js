import buildLocals from '../build-locals.js'

const cache = []

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.theme.component.cacheMaxAge
  }

  getImports () {
    return {
      _: this.plugin.app.bajo.lib._,
      app: this.plugin.app
    }
  }

  async render (tpl, params, reply) {
    const { getCachedItem } = this.plugin.app.bajo
    const { fs, _ } = this.plugin.app.bajo.lib
    const { get } = this.plugin.app.bajo.lib._

    const { template: handler } = _
    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    const content = fs.readFileSync(file, 'utf8')
    const imports = this.getImports()
    imports.i18n = get(reply, 'request.i18n')
    const handlerOpts = { imports }
    const cacheItem = await getCachedItem({ store: cache, content, handler, handlerOpts, maxAge: this.cacheMaxAge })
    return cacheItem.item(params)
  }

  async renderString (content, params = {}, reply, opts = {}) {
    const { getCachedItem } = this.plugin.app.bajo
    const { template: handler } = this.plugin.app.bajo._
    const { get } = this.plugin.app.bajo.lib._

    const mpa = this.plugin.app.waibuMpa
    const imports = this.getImports()
    imports.i18n = get(reply, 'request.i18n')
    const handlerOpts = { imports }
    const locals = await buildLocals.call(mpa, null, params, opts)
    const cacheItem = await getCachedItem({ store: cache, content, handler, handlerOpts, maxAge: this.cacheMaxAge })
    return cacheItem.item(locals)
  }
}

export default ViewEngine
