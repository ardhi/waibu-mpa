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
    const { template } = _
    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    const text = fs.readFileSync(file, 'utf8')
    const cacheItem = await getCachedItem(cache, text, template, this.cacheMaxAge)
    return cacheItem.item(params)
  }

  async renderString (text, params = {}, opts = {}) {
    const { getCachedItem } = this.plugin.app.bajo
    const { template } = this.plugin.app.bajo._
    const mpa = this.plugin.app.waibuMpa

    const locals = await buildLocals.call(mpa, null, params, opts)
    const cacheItem = await getCachedItem(cache, text, template, this.cacheMaxAge)
    return cacheItem.item(locals)
  }
}

export default ViewEngine
