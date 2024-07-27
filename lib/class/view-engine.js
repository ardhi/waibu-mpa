import buildLocals from '../build-locals.js'

const cache = []

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.wakatobiMpa.config.theme.component.cacheMaxAge
  }

  async render (tplFile, params, reply) {
    const { getCachedItem } = this.plugin.app.bajo
    const { fs, _ } = this.plugin.app.bajo.lib
    const { template } = _
    const { getTplAndTheme } = this.plugin.app.wakatobiMpa

    const { file } = getTplAndTheme(tplFile)
    const text = fs.readFileSync(file, 'utf8')
    const locals = await buildLocals.call(this.plugin, tplFile, params, reply)
    const cacheItem = await getCachedItem(cache, text, template, this.cacheMaxAge)
    return cacheItem.item(locals)
  }

  async renderString (text, params = {}, opts = {}) {
    const { getCachedItem } = this.plugin.app.bajo
    const { template } = this.plugin.app.bajo._

    const locals = await buildLocals.call(this.plugin, null, params, opts)
    const cacheItem = await getCachedItem(cache, text, template, this.cacheMaxAge)
    return cacheItem.item(locals)
  }
}

export default ViewEngine
