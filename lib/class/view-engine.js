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

  async _applySetting (locals, opts = {}) {
    const { req } = opts
    const { readConfig } = this.plugin.app.bajo
    const { get } = this.plugin.app.bajo.lib._
    const reqNs = get(req, 'routeOptions.config.ns')
    const settingOpts = { locals, req }
    const setting = (await readConfig(`${reqNs}:/waibuMpa/setting.*`, { ns: reqNs, ignoreError: true, opts: settingOpts })) ?? {}
    opts.iconset = get(setting, 'iconset', req.iconset)
    opts.theme = get(setting, 'theme', req.theme)
  }

  async render (tpl, locals = {}, opts = {}) {
    const { fs } = this.plugin.app.bajo.lib
    const mpa = this.plugin.app.waibuMpa
    const { ns, path, qs } = mpa.getResource(tpl)
    await this._applySetting(locals, opts)
    opts.qs = qs
    opts.fn = true
    // const { file } = mpa.resolveTemplate(`${ns}.template:${path}?${querystring.stringify(qs)}`, opts)
    const { file } = mpa.resolveTemplate(`${ns}.template:${path}`, opts)
    const content = fs.readFileSync(file, 'utf8')
    opts.ext = _path.extname(file)
    return await this.write(content, locals, opts)
  }

  async renderString (content, locals = {}, opts = {}) {
    await this._applySetting(locals, opts)
    opts.fn = true
    return await this.write(content, locals, opts)
  }

  async write (content, locals = {}, opts = {}) {
    const { parseObject } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const { merge, get } = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const { qs = {}, req } = opts
    locals.page = locals.page ?? {}

    const mdOpts = merge({}, mpa.config.markdown)
    const parsed = await this.md.parse(content, merge({ readFile: false, parseContent: false, i18n: req.i18n }, mpa.config.markdown))
    content = opts.ext === '.md' ? this.md.parseContent(parsed.content, mdOpts) : parsed.content

    const frontMatter = parseObject(parsed.frontMatter, { parseValue: true, i18n: req.i18n, ns: this.plugin.name })
    merge(locals, { frontMatter })
    if (opts.prepend) content = `${opts.prepend}\n${content}`
    if (opts.append) content = `${content}\n${opts.append}`
    const reqNs = get(req, 'routeOptions.config.ns')
    const layout = frontMatter.layout ?? qs.layout ?? opts.layout
    if (!opts.partial && layout !== false) {
      const { file } = mpa.resolveLayout(layout ?? `${reqNs}.layout:/default.html`, opts)
      const layoutContent = fs.readFileSync(file, 'utf8')
      content = layoutContent.replace('<!-- body -->', content)
    }
    return await getCachedResult.call(this.plugin, content, locals, { req, ttl: this.cacheMaxAge, fn: opts.fn })
  }
}

export default ViewEngine
