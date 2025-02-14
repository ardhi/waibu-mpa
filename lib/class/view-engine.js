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
    this.history = {}
  }

  _applySetting (opts = {}) {
    const { req } = opts
    const { get } = this.plugin.app.bajo.lib._
    const reqNs = get(req, 'routeOptions.config.ns')
    const setting = get(this, `app.${reqNs}.config.waibuMpa`, {})
    opts.iconset = get(setting, 'iconset', req.iconset)
    opts.theme = get(setting, 'theme', req.theme)
  }

  _clearHistory () {
    const { omit } = this.plugin.app.bajo.lib._
    const maxAge = 60
    const now = Date.now()
    const omitted = []
    for (const reqId in this.history) {
      const history = this.history[reqId]
      if ((history.ts + (maxAge * 1000)) < now) omitted.push(reqId)
    }
    this.history = omit(this.history, omitted)
  }

  async render (tpl, locals = {}, opts = {}) {
    this._clearHistory()
    const { trim, last } = this.plugin.app.bajo.lib._
    const { fs } = this.plugin.app.bajo.lib
    const { req } = opts
    const mpa = this.plugin.app.waibuMpa
    const { ns, subSubNs, path, qs } = mpa.getResource(tpl)
    this._applySetting(opts)
    opts.qs = qs
    let resp
    if (tpl.includes('.template')) {
      resp = mpa.resolveTemplate(`${ns}.template${subSubNs ? ('.' + subSubNs) : ''}:${path}`, opts)
    } else if (tpl.includes('.partial')) {
      resp = mpa.resolvePartial(`${ns}.partial${subSubNs ? ('.' + subSubNs) : ''}:${path}`, opts)
    }
    const file = resp.file
    // prevent looping
    if (this.history[req.id]) {
      if (last(this.history[req.id].file) === file) throw this.plugin.error('Template looping detected: %s => %s', tpl, file)
      this.history[req.id].file.push(file)
    } else {
      this.history[req.id] = {
        ts: Date.now(),
        file: [file]
      }
    }
    const content = trim(fs.readFileSync(file, 'utf8'))
    opts.ext = _path.extname(file)
    opts.fn = true
    opts.tpl = tpl
    return await this.write(content, locals, opts)
  }

  async renderString (content, locals = {}, opts = {}) {
    this._applySetting(opts)
    opts.fn = true
    return await this.write(content, locals, opts)
  }

  async write (content, locals = {}, opts = {}) {
    const { parseObject } = this.plugin.app.bajo
    const { fs } = this.plugin.app.bajo.lib
    const { merge, get, isString, without, isEmpty} = this.plugin.app.bajo.lib._
    const mpa = this.plugin.app.waibuMpa
    const { qs = {}, req } = opts
    locals.page = locals.page ?? {}

    const mdOpts = merge({}, mpa.config.markdown)
    const parsed = await this.md.parse(content, merge({ readFile: false, parseContent: false, i18n: req.i18n }, mpa.config.markdown))
    content = opts.ext === '.md' ? this.md.parseContent(parsed.content, mdOpts) : parsed.content
    if (isEmpty(content) && (opts.tpl ?? '').includes('.template')) {
      content = '<c:include resource="' + opts.tpl.replace('.template', '.partial') + '" />'
    }
    const reqNs = get(req, 'routeOptions.config.ns') ?? mpa.name
    if (opts.prepend) content = `${opts.prepend}\n${content}`
    if (opts.append) content = `${content}\n${opts.append}`
    let layout
    if (!opts.partial) {
      locals.page = merge(locals.page, parseObject(parsed.frontMatter, { parseValue: true, i18n: req.i18n, ns: reqNs }))
      layout = locals.page.layout ?? qs.layout ?? opts.layout ?? (locals.page.ns ? `${locals.page.ns}.layout:/default.html` : 'main.layout:/default.html')
      const ext = _path.extname(layout)
      const { file } = mpa.resolveLayout(layout, opts)
      let layoutContent = fs.readFileSync(file, 'utf8')
      const layoutParsed = await this.md.parse(layoutContent, merge({ readFile: false, parseContent: false, i18n: req.i18n }, mpa.config.markdown))
      layoutContent = ext === '.md' ? this.md.parseContent(layoutParsed.content, mdOpts) : layoutParsed.content
      const fm = parseObject(layoutParsed.frontMatter, { parseValue: true, i18n: req.i18n, ns: reqNs })
      const keys = without(Object.keys(fm), 'css', 'scripts')
      for (const item of ['css', 'scripts']) {
        locals.page[item] = locals.page[item] ?? []
        if (isString(locals.page[item])) locals.page[item] = [locals.page[item]]
        fm[item] = fm[item] ?? []
        if (isString(fm[item])) fm[item] = [fm[item]]
        locals.page[item].unshift(...fm[item])
      }
      for (const key of keys) {
        locals.page[key] = locals.page[key] ?? fm[key]
      }
      if (fm.title && !locals.page.title) locals.page.title = fm.title
      content = layoutContent.replace('<!-- body -->', content)
      locals.page.fullTitle = locals.fullTitle ?? (locals.page.title ? `${locals.page.title} - ${req.t(locals.page.appTitle)}` : req.t(locals.page.appTitle))
    }
    // if (['.js'].includes(opts.ext)) return content // TODO: clash with lodash template
    return await getCachedResult.call(this.plugin, content, locals, { req, ttl: this.cacheMaxAge, fn: opts.fn, tpl: opts.tpl })
  }
}

export default ViewEngine
