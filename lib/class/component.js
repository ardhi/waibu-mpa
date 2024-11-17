import getCachedResult from '../get-cached-result.js'
import path from 'path'

class Component {
  constructor ({ plugin, $, theme, iconset, locals, reply, req } = {}) {
    this.plugin = plugin
    this.$ = $
    this.theme = theme
    this.iconset = iconset
    this.locals = locals
    this.reply = reply
    this.req = req
    this.cacheMaxAge = plugin.app.waibuMpa.config.theme.component.cacheMaxAge
    this.namespace = 'c:'
    this.noTags = []
    this.factory = {}
  }

  async loadBaseFactories () {
    const { isPlainObject, camelCase } = this.plugin.app.bajo.lib._
    const { importModule } = this.plugin.app.bajo
    const { fastGlob } = this.plugin.app.bajo.lib
    const pattern = `${this.plugin.app.waibuMpa.dir.pkg}/lib/class/component/*.js`
    const files = await fastGlob(pattern)
    for (const file of files) {
      const mod = await importModule(file)
      const name = camelCase(path.basename(file, '.js'))
      this.factory[name] = isPlainObject(mod) ? mod : { handler: mod }
    }
  }

  async buildTag (params = {}, opts = {}) {
    const { sprintf } = this.plugin.app.bajo.lib
    const { isEmpty, merge, uniq, without } = this.plugin.app.bajo.lib._
    params.ctag = params.tag
    let method = params.tag
    if (!this.factory[method]) method = 'any'
    if (opts.attr) params.attr = merge({}, opts.attr, params.attr)
    this._normalizeAttr(params)
    params.attr.content = params.attr.content ?? ''
    if (params.attr.content.includes('%s')) params.html = sprintf(params.attr.content, params.html)
    else if (isEmpty(params.html)) params.html = params.attr.content

    await this._iconAttr(params, method)
    await this._beforeBuildTag(method, params)
    const resp = await this.factory[method].handler.call(this, params)
    await this._afterBuildTag(method, params)
    if (resp === false) return resp
    params.attr.class = without(uniq(params.attr.class), undefined, null, '')
    if (isEmpty(params.attr.class)) delete params.attr.class
    if (isEmpty(params.attr.style)) delete params.attr.style
    if (isEmpty(params.html)) return await this._render(params)

    const merged = merge({}, params.locals, { attr: params.attr })
    const result = await getCachedResult.call(this.plugin, params.html, merged, { reply: this.reply, ttl: this.cacheMaxAge, fn: true })
    params.html = result
    return await this._render(params)
  }

  _normalizeAttr (params = {}, opts = {}) {
    const { without, keys, isString, isArray } = this.plugin.app.bajo.lib._
    const { generateId } = this.plugin.app.bajo
    params.attr = params.attr ?? {}
    params.attr.class = this.plugin.app.waibuMpa.attrToArray(params.attr.class)
    params.attr.style = this.plugin.app.waibuMpa.attrToObject(params.attr.style)
    if (isString(opts.cls)) params.attr.class.push(opts.cls)
    else if (isArray(opts.cls)) params.attr.class.push(...opts.cls)
    if (opts.tag) params.tag = opts.tag
    if (opts.autoId) params.attr.id = isString(params.attr.id) ? params.attr.id : generateId('alpha')
    for (const k of without(keys(opts), 'cls', 'tag', 'autoId')) {
      params.attr[k] = opts[k]
    }
    params.html = params.html ?? ''
  }

  async _render (params = {}) {
    const { omit, isEmpty, merge, kebabCase, camelCase, isArray, get } = this.plugin.app.bajo.lib._
    const { attribsStringify } = this.plugin.app.waibuMpa
    params.attr = params.attr ?? {}

    params.tag = params.attr.tag ?? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(params.tag) ? params.tag : kebabCase(params.tag)
    params.attr = omit(params.attr, ['tag', 'content'])
    params.html = params.html ?? ''
    params.attrs = attribsStringify(params.attr)
    if (!isEmpty(params.attrs)) params.attrs = ' ' + params.attrs
    let html = isArray(params.html) ? params.html.join('\n') : params.html
    if (!params.noTag) {
      html = params.selfClosing ? `<${params.tag}${params.attrs}/>` : `<${params.tag}${params.attrs}>${params.html}</${params.tag}>`
      const after = get(this, `factory.${camelCase(params.ctag)}.after`)
      if (after) {
        html = (await after.call(this, merge({}, params, { result: html }))) ?? html
      }
    } else if (!this.noTags.includes(params.attr.octag)) this.noTags.push(params.attr.octag)
    if (params.prepend) html = `${params.prepend}${html}`
    if (params.append) html += params.append
    return html
  }

  async _iconAttr (params = {}, method) {
    if (['modal', 'toast'].includes(method)) return
    const { groupAttrs } = this.plugin.app.waibuMpa
    const { merge } = this.plugin.app.bajo.lib._
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'iconEnd'].includes(k)) continue
      const group = groupAttrs(params.attr, ['icon', 'iconEnd'])
      const _params = { attr: merge(k.endsWith('End') ? group.iconEnd : group.icon, { name: v }) }
      const icon = await this.factory.icon.handler.call(this, _params)
      params.html = k.endsWith('End') ? `${params.html} ${icon}` : `${icon} ${params.html}`
      delete params.attr[k]
    }
  }

  _buildOptions (params) {
    const { has, omit, find, isPlainObject, isArray } = this.plugin.app.bajo.lib._
    const { attrToArray } = this.plugin.app.waibuMpa
    const items = []
    if (!has(params.attr, 'options')) return
    let values = attrToArray(params.attr.value)
    if (!has(params.attr, 'multiple') && values.length > 0) values = [values[0]]
    const options = isArray(params.attr.options) ? params.attr.options : attrToArray(params.attr.options)
    for (const opt of options) {
      let val
      let text
      if (isPlainObject(opt)) {
        val = opt.value
        text = opt.text
      } else [val, text] = opt.split(':')
      const sel = find(values, v => val === v)
      items.push(`<option value="${val}"${sel ? ' selected' : ''}>${this.req.t(text ?? val)}</option>`)
    }
    params.attr = omit(params.attr, ['options'])
    return items.join('\n')
  }

  _buildUrl ({ exclude, prefix, base, url, params = {} }) {
    const { buildUrl } = this.plugin.app.waibuMpa
    url = url ?? this.req.referer ?? this.req.url
    return buildUrl({ exclude, prefix, base, url, params })
  }

  async buildSentence (sentence, params = {}) {
    const { renderString } = this.plugin.app.waibuMpa
    const opts = {
      partial: true,
      ext: params.ext ?? '.html',
      req: this.req,
      reply: this.reply
    }
    return await renderString(sentence, params, opts)
  }

  async _beforeBuildTag (tag, params) {}
  async _afterBuildTag (tag, params) {}

  async buildChildTag (detector, { tag, params, inner }) {
    const { has, pickBy, omit, keys } = this.plugin.app.bajo.lib._
    if (has(params.attr, detector)) {
      const [prefix] = detector.split('-')
      const attr = {}
      const html = tag ? params.attr[detector] : undefined
      tag = tag ?? prefix
      const picked = pickBy(params.attr, (v, k) => k.startsWith(`${prefix}-`))
      for (const k in picked) {
        attr[k.slice(prefix.length + 1)] = picked[k]
      }
      const child = await this.buildTag({ tag, params: { attr, html } })
      params.html += `\n${child}`
      const excluded = [detector, ...keys(picked)]
      params.attr = omit(params.attr, excluded)
    }
  }
}

export default Component
