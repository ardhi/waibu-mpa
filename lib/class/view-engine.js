import path from 'path'
import getCachedResult from '../get-cached-result.js'

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    const { get } = plugin.app.bajo.lib._
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.viewEngine.cacheMaxAge
    this.parseMd = get(plugin, 'app.bajoMarkdown.parse')
  }

  async render (tpl, locals, reply) {
    const { fs } = this.plugin.app.bajo.lib
    const { merge } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const { file } = mpa.resolveTemplate(`${tpl}:${reply.request.theme}`)
    let content = fs.readFileSync(file, 'utf8')
    if (this.parseMd && this.fileExts.includes(path.extname(file))) {
      const parsed = this.parseMd(content, mpa.config.markdown)
      merge(locals, { fm: parsed.meta })
      content = parsed.content
    }
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
  }

  async renderString (content, locals = {}, reply, opts = {}) {
    const { merge } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    if (this.parseMd && this.fileExts.includes(opts.ext)) {
      const parsed = this.parseMd(content, mpa.config.markdown)
      merge(locals, { fm: parsed.meta })
      content = parsed.content
    }
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
  }
}

export default ViewEngine
