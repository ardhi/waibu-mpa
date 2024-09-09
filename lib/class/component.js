import commonTags from './component/index.js'
import getCachedResult from '../get-cached-result.js'

class Component {
  constructor (plugin, $, theme) {
    this.plugin = plugin
    this.$ = $
    this.theme = theme
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
    const result = await getCachedResult.call(this.plugin, params.html, merged, { reply: params.reply, ttl: this.cacheMaxAge, fn: true })
    params.html = result
    return await this._render(params)
  }

  _isValidMethod (method) {
    if (this.nativeProps.includes(method) || ['any', 'buildTag', 'buildChildTag'].includes(method) ||
      method.startsWith('_')) return false
    return true
  }

  _normalizeAttr (params = {}) {
    params.attr = params.attr ?? {}
    params.attr.class = this.plugin.app.waibuMpa.attrToArray(params.attr.class)
    params.attr.style = this.plugin.app.waibuMpa.attrToObject(params.attr.style)
  }

  async _render (params = {}) {
    const { config } = this.plugin.app.waibuMpa
    const { isEmpty, merge, kebabCase, camelCase } = this.plugin.app.bajo.lib._
    const { objectToAttrs } = this.plugin.app.waibuMpa
    params.attr = params.attr ?? {}

    const tag = params.attr.tag ?? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(params.tag) ? params.tag : kebabCase(params.tag)
    delete params.attr.tag
    params.html = params.html ?? ''
    let attrs = objectToAttrs(params.attr)
    if (params.insertCtagAsAttr || config.theme.component.insertCtagAsAttr) attrs += ` ctag="${this.namespace}${params.ctag}"`
    if (!isEmpty(attrs)) attrs = ' ' + attrs
    let html = params.html
    if (!params.noTag) {
      html = params.selfClosing ? `<${tag}${attrs}/>` : `<${tag}${attrs}>${params.html}</${tag}>`
      if (this.afterHook[camelCase(params.ctag)]) await this.afterHook[camelCase(params.ctag)].call(this, merge({}, params, { el: html }))
    }
    if (params.prepend) html = `${params.prepend}${html}`
    if (params.append) html += params.append
    return html
  }

  async _iconAttr (params = {}) {
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'iconEnd'].includes(k)) continue
      const _params = { attr: { name: v }, reply: params.reply }
      const icon = await this.icon(_params)
      params.html = k.endsWith('End') ? `${params.html} ${icon}` : `${icon} ${params.html}`
      delete params.attr[k]
    }
  }

  _getIconset (name) {
    const { find } = this._
    const { iconsets } = this.mpa
    let iconset = find(iconsets, { name })
    if (!iconset) {
      name = this.mpa.config.iconset.default
      iconset = find(iconsets, { name })
    }
    return iconset
  }

  _buildOptions (params) {
    const { has, omit, find } = this._
    const { attrToArray } = this.mpa
    const items = []
    if (!has(params.attr, 'options')) return
    let values = attrToArray(params.attr.value)
    if (!has(params.attr, 'multiple') && values.length > 0) values = [values[0]]
    for (const opt of attrToArray(params.attr.options)) {
      const [val, text] = opt.split(':')
      const sel = find(values, v => val === v)
      items.push(`<option value="${val}"${sel ? ' selected' : ''}>${text ?? ''}</option>`)
    }
    params.attr = omit(params.attr, ['options'])
    return items.join('\n')
  }

  async _beforeBuildTag (tag, { params, reply, el, locals }) {}
  async _afterBuildTag (tag, { params, reply, el, locals }) {}

  async buildChildTag (detector, { tag, params, reply, inner }) {
    const { has, pickBy, omit, keys } = this._
    if (has(params.attr, detector)) {
      const [prefix] = detector.split('-')
      const attr = {}
      const html = tag ? params.attr[detector] : undefined
      tag = tag ?? prefix
      const picked = pickBy(params.attr, (v, k) => k.startsWith(`${prefix}-`))
      for (const k in picked) {
        attr[k.slice(prefix.length + 1)] = picked[k]
      }
      const child = await this.buildTag({ tag, params: { attr, html }, reply })
      params.html += `\n${child}`
      const omitted = [detector, ...keys(picked)]
      params.attr = omit(params.attr, omitted)
    }
  }
}

export default Component
