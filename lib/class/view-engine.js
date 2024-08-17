import path from 'path'
import querystring from 'querystring'
import getCachedResult from '../get-cached-result.js'

class ViewEngine {
  constructor (plugin, name, fileExts = []) {
    const { get } = plugin.app.bajo.lib._
    this.plugin = plugin
    this.name = name
    this.fileExts = typeof fileExts === 'string' ? [fileExts] : fileExts
    this.cacheMaxAge = plugin.app.waibuMpa.config.viewEngine.cacheMaxAge
    this.md = get(plugin, 'app.bajoMarkdown')
  }

  async render (tpl, locals = {}, reply, opts = {}) {
    const { breakNsPath } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const mpa = this.plugin.app.waibuMpa

    const { ns, path: fullPath, qs } = breakNsPath(tpl)
    qs.theme = reply.request.theme

    const { file } = mpa.resolveTemplate(`${ns}:${fullPath}?${querystring.stringify(qs)}`)
    const content = fs.readFileSync(file, 'utf8')
    opts.ext = path.extname(file)
    opts.qs = qs
    return await this.renderString(content, locals, reply, opts)
  }

  async renderString (content, locals = {}, reply, opts = {}) {
    const { parseObject } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const { merge } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const qs = opts.qs ?? {}
    locals.page = locals.page ?? {}

    const parsed = this.md.parse(content, merge({ readFile: false, parseContent: false }, mpa.config.markdown))
    const frontMatter = parseObject(parsed.frontMatter, { parseValue: true, i18n: reply.request.i18n, plugin: this.plugin })
    merge(locals, { frontMatter })
    content = opts.ext === '.md' ? this.md.parseContent(parsed.content, mpa.config.markdown) : parsed.content
    const { file: layoutFile } = mpa.resolveLayout(frontMatter.layout ?? qs.layout ?? opts.layout)
    const layout = fs.readFileSync(layoutFile, 'utf8')
    if (opts.prepend) content = `${opts.prepend}\n${content}`
    if (opts.append) content = `${content}\n${opts.append}`
    content = layout.replace('{content}', content)
    content = await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: true })
    return content
  }
}

export default ViewEngine
