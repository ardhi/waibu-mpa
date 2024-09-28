import commonTags from './component/index.js'
import getCachedResult from '../get-cached-result.js'

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
    this.nativeProps = Object.keys(this)
    Object.assign(this, commonTags)
  }

  async buildTag (params = {}) {
    const { camelCase, isEmpty, merge, uniq, without } = this.plugin.app.bajo.lib._
    params.ctag = params.tag
    let method = camelCase(params.tag)
    if (!this._isValidMethod(method)) return false
    if (!this[method]) method = 'any'
    this._normalizeAttr(params)
    await this._iconAttr(params)
    await this._beforeBuildTag(method, params)
    const resp = await this[method](params)
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

  _isValidMethod (method) {
    if (this.nativeProps.includes(method) || ['any', 'buildTag', 'buildChildTag'].includes(method) ||
      method.startsWith('_')) return false
    return true
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
    if (opts.autoId) params.attr.id = isString(params.attr.id) ? params.attr.id : generateId()
    for (const k of without(keys(opts), 'cls', 'tag', 'autoId')) {
      params.attr[k] = opts[k]
    }
  }

  async _render (params = {}) {
    const { omit, isEmpty, merge, kebabCase, camelCase, isArray } = this.plugin.app.bajo.lib._
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
      if (this.afterHook[camelCase(params.ctag)]) {
        html = (await this.afterHook[camelCase(params.ctag)].call(this, merge({}, params, { result: html }))) ?? html
      }
    }
    if (params.prepend) html = `${params.prepend}${html}`
    if (params.append) html += params.append
    return html
  }

  async _iconAttr (params = {}) {
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'iconEnd'].includes(k)) continue
      const _params = { attr: { name: v } }
      const icon = await this.icon(_params)
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
      items.push(`<option value="${val}"${sel ? ' selected' : ''}>${text ?? val}</option>`)
    }
    params.attr = omit(params.attr, ['options'])
    return items.join('\n')
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
      const omitted = [detector, ...keys(picked)]
      params.attr = omit(params.attr, omitted)
    }
  }
}

export default Component
