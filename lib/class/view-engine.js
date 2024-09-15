import _path from 'path'
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
    const { readConfig } = this.plugin.app.bajo
    const { get } = this.plugin.app.bajo.lib._
    const { fs } = this.plugin.app.bajo.lib
    const mpa = this.plugin.app.waibuMpa
    const reqNs = get(reply, 'request.routeOptions.config.ns')
    const setting = (await readConfig(`${reqNs}:/waibuMpa/setting.*`, { ignoreError: true })) ?? {}

    const { ns, path, qs } = mpa.getResource(tpl)
    qs.theme = get(setting, 'theme', reply.request.theme)

    opts.theme = qs.theme
    opts.iconset = get(setting, 'iconset', reply.request.iconset)
    opts.qs = qs
    opts.fn = true
    const { file } = mpa.resolveTemplate(`${ns}.template:${path}?${querystring.stringify(qs)}`, opts)
    const content = fs.readFileSync(file, 'utf8')
    opts.ext = _path.extname(file)
    return await this.write({ content, locals, reply, setting, opts })
  }

  async renderString (content, locals = {}, reply, opts = {}) {
    const { readConfig } = this.plugin.app.bajo
    const { get } = this.plugin.app.bajo.lib._

    const reqNs = get(reply, 'request.routeOptions.config.ns')
    const setting = (await readConfig(`${reqNs}:/waibuMpa/setting.*`, { ignoreError: true })) ?? {}
    opts.theme = get(setting, 'theme', reply.request.theme)
    opts.iconset = get(setting, 'iconset', reply.request.iconset)
    opts.fn = true
    return await this.write({ content, locals, reply, setting, opts })
  }

  async write ({ content, locals = {}, reply, setting, opts = {} } = {}) {
    const { parseObject } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const { merge, get } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const qs = opts.qs ?? {}
    locals.page = locals.page ?? {}

    const mdOpts = merge({}, mpa.config.markdown)
    const parsed = this.md.parse(content, merge({ readFile: false, parseContent: false }, mpa.config.markdown))
    content = opts.ext === '.md' ? this.md.parseContent(parsed.content, mdOpts) : parsed.content

    const frontMatter = parseObject(parsed.frontMatter, { parseValue: true, i18n: reply.request.i18n, plugin: this.plugin })
    merge(locals, { frontMatter })
    if (opts.prepend) content = `${opts.prepend}\n${content}`
    if (opts.append) content = `${content}\n${opts.append}`
    const reqNs = get(reply, 'request.routeOptions.config.ns')
    const layout = frontMatter.layout ?? qs.layout ?? opts.layout ?? get(setting, 'layout')
    if (!opts.partial && layout !== false) {
      const { file } = mpa.resolveLayout(layout ?? `${reqNs}.layout:/default.html`, opts)
      const layoutContent = fs.readFileSync(file, 'utf8')
      content = layoutContent.replace('<!-- content -->', content)
    }
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: opts.fn })
  }
}

export default ViewEngine
