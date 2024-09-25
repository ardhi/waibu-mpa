import _path from 'path'
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

  async _applySetting ({ locals, reply, opts = {} }) {
    const { readConfig } = this.plugin.app.bajo
    const { get } = this.plugin.app.bajo.lib._
    const reqNs = get(reply, 'request.routeOptions.config.ns')
    const settingOpts = { locals, req: reply.request }
    const setting = (await readConfig(`${reqNs}:/waibuMpa/setting.*`, { ns: reqNs, ignoreError: true, opts: settingOpts })) ?? {}
    opts.iconset = get(setting, 'iconset', reply.request.iconset)
    opts.theme = get(setting, 'theme', reply.request.theme)
  }

  async render (tpl, locals = {}, reply, opts = {}) {
    const { fs } = this.plugin.app.bajo.lib
    const mpa = this.plugin.app.waibuMpa
    const { ns, path, qs } = mpa.getResource(tpl)
    await this._applySetting({ locals, reply, opts })
    opts.qs = qs
    opts.fn = true
    // const { file } = mpa.resolveTemplate(`${ns}.template:${path}?${querystring.stringify(qs)}`, opts)
    const { file } = mpa.resolveTemplate(`${ns}.template:${path}`, opts)
    const content = fs.readFileSync(file, 'utf8')
    opts.ext = _path.extname(file)
    return await this.write({ content, locals, reply, opts })
  }

  async renderString (content, locals = {}, reply, opts = {}) {
    await this._applySetting({ locals, reply, opts })
    opts.fn = true
    return await this.write({ content, locals, reply, opts })
  }

  async write ({ content, locals = {}, reply, opts = {} } = {}) {
    const { parseObject } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const { merge, get } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const qs = opts.qs ?? {}
    locals.page = locals.page ?? {}

    const mdOpts = merge({}, mpa.config.markdown)
    const parsed = await this.md.parse(content, merge({ readFile: false, parseContent: false, i18n: reply.request.i18n }, mpa.config.markdown))
    content = opts.ext === '.md' ? this.md.parseContent(parsed.content, mdOpts) : parsed.content

    const frontMatter = parseObject(parsed.frontMatter, { parseValue: true, i18n: reply.request.i18n, ns: this.plugin.name })
    merge(locals, { frontMatter })
    if (opts.prepend) content = `${opts.prepend}\n${content}`
    if (opts.append) content = `${content}\n${opts.append}`
    const reqNs = get(reply, 'request.routeOptions.config.ns')
    const layout = frontMatter.layout ?? qs.layout ?? opts.layout
    if (!opts.partial && layout !== false) {
      const { file } = mpa.resolveLayout(layout ?? `${reqNs}.layout:/default.html`, opts)
      const layoutContent = fs.readFileSync(file, 'utf8')
      content = layoutContent.replace('<!-- body -->', content)
    }
    return await getCachedResult.call(this.plugin, content, locals, { reply, ttl: this.cacheMaxAge, fn: opts.fn })
  }
}

export default ViewEngine
