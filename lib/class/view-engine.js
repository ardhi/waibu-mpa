import buildLocals from '../build-locals.js'
import getCachedResult from '../get-cached-result.js'

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.theme.component.cacheMaxAge
  }

  async render (tpl, locals, reply) {
    const { fs } = this.plugin.app.bajo.lib

    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    const content = fs.readFileSync(file, 'utf8')
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
  }

  async renderString (content, params = {}, reply, opts = {}) {
    const mpa = this.plugin.app.waibuMpa
    const locals = await buildLocals.call(mpa, null, params, opts)
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge })
  }
}

export default ViewEngine
