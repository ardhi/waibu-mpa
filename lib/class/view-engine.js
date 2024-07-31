import buildLocals from '../build-locals.js'

const cache = []

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.theme.component.cacheMaxAge
  }

  async render (tpl, params, reply) {
    const { getCachedItem } = this.plugin.app.bajo
    const { fs, _ } = this.plugin.app.bajo.lib
    const { template: handler } = _
    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    const content = fs.readFileSync(file, 'utf8')
    const handlerOpts = { imports: { _app: this.plugin.app } }
    const cacheItem = await getCachedItem({ store: cache, content, handler, handlerOpts, maxAge: this.cacheMaxAge })
    return cacheItem.item(params)
  }

  async renderString (content, params = {}, opts = {}) {
    const { getCachedItem } = this.plugin.app.bajo
    const { template: handler } = this.plugin.app.bajo._
    const mpa = this.plugin.app.waibuMpa
    const handlerOpts = { imports: { _app: this.plugin.app } }

    const locals = await buildLocals.call(mpa, null, params, opts)
    const cacheItem = await getCachedItem({ store: cache, content, handler, handlerOpts, maxAge: this.cacheMaxAge })
    return cacheItem.item(locals)
  }
}

export default ViewEngine
