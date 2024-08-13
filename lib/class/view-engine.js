import getCachedResult from '../get-cached-result.js'

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.viewEngine.cacheMaxAge
  }

  async render (tpl, locals, reply) {
    const { fs } = this.plugin.app.bajo.lib

    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    const content = fs.readFileSync(file, 'utf8')
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
  }

  async renderString (content, locals = {}, reply, opts = {}) {
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
  }
}

export default ViewEngine
