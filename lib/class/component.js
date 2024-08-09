import icon from './component/icon.js'
import include from './component/include.js'
import link from './component/link.js'
import script from './component/script.js'
import style from './component/style.js'
import t from './component/t.js'
import pageStart from './component/page-start.js'
import pageEnd from './component/page-end.js'
import getImports from '../get-imports.js'

const cache = []
const getAttrValues = {
  variant: ['primary', 'secondary', 'success', 'warning', 'danger'],
  size: ['xs', 'sm', 'md', 'lg', 'xl']
}
const hasAttrValues = ['active']

class Component {
  constructor (plugin, $, theme) {
    this.plugin = plugin
    this.$ = $
    this.bajo = plugin.app.bajo
    this._ = this.bajo.lib._
    this.mpa = plugin.app.waibuMpa
    this.theme = theme
    this.cacheMaxAge = this.mpa.config.theme.component.cacheMaxAge
    this.namespace = 'c:'
    this.sizes = getAttrValues.size
    this.nativeProps = Object.keys(this)
    Object.assign(this, { icon, include, link, script, style, t, pageStart, pageEnd })
  }

  async buildTag ({ tag, params, reply, el, locals = {} } = {}) {
    const { getCachedItem } = this.bajo
    const { camelCase, isEmpty, template: handler, merge } = this._

    const method = camelCase(tag)
    if (!this._isValidMethod(method)) return false
    params.attr.class = this.mpa.attrToArray(params.attr.class)
    params.attr.style = this.mpa.attrToObject(params.attr.style)
    await this._iconAttr({ params, reply })
    await this[method]({ params, reply, el, locals })
    if (isEmpty(params.attr.class)) delete params.attr.class
    if (isEmpty(params.attr.style)) delete params.attr.style
    delete params.attr.tag
    if (isEmpty(params.html)) return await this._renderTag(tag, { params, reply, el })

    const merged = merge({}, locals, { attr: params.attr })
    const imports = getImports.call(this.plugin, reply)
    const handlerOpts = { imports }
    const cacheItem = await getCachedItem({ store: cache, content: params.html, handler, handlerOpts, maxAge: this.cacheMaxAge })
    params.html = cacheItem.item(merged)
    return await this._renderTag(tag, { params, reply, el })
  }

  _isValidMethod (method) {
    const { isFunction } = this._
    if (this.nativeProps.includes(method) || ['buildTag'].includes(method) || method.startsWith('_') ||
      !this[method] || !isFunction(this[method])) return false
    return true
  }

  async _renderTag (tag, { params, reply, el, insertCtagAsAttr } = {}) {
    const { config } = this.mpa
    const { isSet } = this.bajo
    const { isEmpty, forOwn, isArray, isPlainObject } = this._
    const { arrayToAttr, objectToAttr } = this.mpa

    let attrs = []
    if (insertCtagAsAttr || config.theme.component.insertCtagAsAttr) attrs.push(`ctag="${this.namespace}${tag}"`)
    tag = params.tag ?? config.theme.component.defaultTag
    forOwn(params.attr, (v, k) => {
      if (!isSet(v)) return undefined
      if (isArray(v)) v = arrayToAttr(v)
      if (isPlainObject(v)) v = objectToAttr(v)
      if (['class', 'style'].includes(k) && isEmpty(v)) return undefined
      if (v === '') attrs.push(k)
      else attrs.push(`${k}="${v}"`)
    })
    attrs = attrs.join(' ')
    if (!isEmpty(attrs)) attrs = ' ' + attrs
    if (params.noTag) return params.html
    if (params.selfClosing) return `<${tag}${attrs} />`
    return `<${tag}${attrs}>${params.html}</${tag}>`
  }

  async _iconAttr ({ params, reply } = {}) {
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'icon-end'].includes(k)) continue
      const args = { attr: { name: v }, html: '' }
      await this.icon({ params: args, reply })
      const icon = await this._renderTag('i', { params: args, reply })
      params.html = k.endsWith('-end') ? `${params.html} ${icon}` : `${icon} ${params.html}`
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

  _getAttr (attr, type, cls, values) {
    const { isEmpty, cloneDeep } = this._
    if (!isEmpty(cls)) cls += '-'
    if (!values) values = cloneDeep(getAttrValues)
    let value = attr[type]
    value = (values[type] ?? []).includes(value) ? attr[type] : undefined
    if (value) attr.class.push(`${cls}${value}`)
    delete attr[type]
  }

  _hasAttr (attr, value, cls, values) {
    const { has, cloneDeep, isEmpty } = this._
    if (!isEmpty(cls)) cls += '-'
    if (!values) values = cloneDeep(hasAttrValues)
    if (values.includes(value) && has(attr, value)) {
      attr.class.push(`${cls}${value}`)
      delete attr.active
    }
  }
}

export default Component
