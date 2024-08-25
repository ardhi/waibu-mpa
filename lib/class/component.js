import commonTags from './component/index.js'
import getCachedResult from '../get-cached-result.js'

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
    this.getAttrValues = getAttrValues
    this.hasAttrValues = hasAttrValues
    this.nativeProps = Object.keys(this)
    Object.assign(this, commonTags)
  }

  async buildTag ({ tag, params, reply, el, locals = {} } = {}) {
    const { camelCase, isEmpty, merge, uniq } = this._

    let method = camelCase(tag)
    if (!this._isValidMethod(method)) return false
    if (!this[method]) {
      method = 'any'
      params.tag = tag
    }
    params.attr.class = this.mpa.attrToArray(params.attr.class)
    params.attr.style = this.mpa.attrToObject(params.attr.style)
    await this._iconAttr({ params, reply })
    await this._beforeBuildTag(method, { params, reply, el, locals })
    const resp = await this[method]({ params, reply, el, locals })
    await this._afterBuildTag(method, { params, reply, el, locals })
    if (resp === false) return resp
    this._applyEzAttrs({ params, reply })
    params.attr.class = uniq(params.attr.class)
    if (isEmpty(params.attr.class)) delete params.attr.class
    if (isEmpty(params.attr.style)) delete params.attr.style
    delete params.attr.tag
    if (isEmpty(params.html)) return await this._render(tag, { params, reply, el })

    const merged = merge({}, locals, { attr: params.attr })
    const result = await getCachedResult.call(this.plugin, params.html, merged, { reply, ttl: this.cacheMaxAge, fn: true })
    params.html = result
    return await this._render(tag, { params, reply, el })
  }

  _isValidMethod (method) {
    if (this.nativeProps.includes(method) || ['any', 'buildTag', 'buildChildTag'].includes(method) ||
      method.startsWith('_')) return false
    return true
  }

  async _render (tag, { params, reply, el, insertCtagAsAttr } = {}) {
    const { config } = this.mpa
    const { isSet } = this.bajo
    const { isEmpty, forOwn, isArray, isPlainObject, kebabCase } = this._
    const { arrayToAttr, objectToAttr } = this.mpa

    let attrs = []
    if (insertCtagAsAttr || config.theme.component.insertCtagAsAttr) attrs.push(`ctag="${this.namespace}${tag}"`)
    const otag = tag
    tag = params.tag ?? kebabCase(tag)
    params.html = params.html ?? ''
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
    const html = params.selfClosing ? `<${tag}${attrs} />` : `<${tag}${attrs}>${params.html}</${tag}>`
    if (this.afterHook[otag]) await this.afterHook[otag].call(this, { params, reply, el: html })
    return html
  }

  async _iconAttr ({ params, reply } = {}) {
    for (const k in params.attr) {
      const v = params.attr[k]
      if (!['icon', 'icon-end'].includes(k)) continue
      const args = { attr: { name: v }, html: '' }
      await this.icon({ params: args, reply })
      const icon = await this._render('i', { params: args, reply })
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
    const { isEmpty, isPlainObject } = this._
    if (!isEmpty(cls)) cls += '-'
    if (!values) values = this.getAttrValues
    let value = attr[type]
    if (isPlainObject(values[type])) {
      value = (values[type].values ?? []).includes(value) ? attr[type] : undefined
      cls = values[type].prefix + '-'
    } else {
      value = (values[type] ?? []).includes(value) ? attr[type] : undefined
    }
    if (value) attr.class.push(`${cls}${value}`)
    delete attr[type]
  }

  _hasAttr (attr, value, cls, values) {
    const { has, isEmpty } = this._
    if (!isEmpty(cls)) cls += '-'
    if (!values) values = this.hasAttrValues
    if (values.includes(value) && has(attr, value)) {
      attr.class.push(`${cls}${value}`)
      delete attr[value]
    }
  }

  _applyEzAttrs ({ params }) {
    const { get, has, isFunction, isEmpty } = this._
    for (const item of params.ezAttrs ?? []) {
      const key = get(item, 'key', item)
      const value = get(item, 'value')
      const cls = get(item, 'baseClass', params.baseClass)
      const values = get(item, 'values')
      if (this.getAttrValues[key]) this._getAttr(params.attr, key, cls, values)
      else if (this.hasAttrValues.includes(key)) this._hasAttr(params.attr, key, cls, values)
      else if (has(params.attr, key)) {
        if (isFunction(value)) value(params)
        else params.attr.class.push(`${cls}${!isEmpty(value) ? `-${value}` : key}`)
        delete params.attr[key]
      }
    }
    delete params.baseClass
    delete params.autoAttr
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
