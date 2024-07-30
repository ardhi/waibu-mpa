import buildLocals from '../build-locals.js'

const cache = []

class Component {
  constructor (plugin, $, theme) {
    this.plugin = plugin
    this.$ = $
    this.bajo = plugin.app.bajo
    this._ = this.bajo.lib._
    this.mpa = plugin.app.waibuMpa
    this.theme = theme
    this.cacheMaxAge = this.mpa.config.theme.component.cacheMaxAge
    this.nativeProps = Object.keys(this)
    this.namespace = 'c:'
  }

  async buildTag ({ tag, params, reply, el } = {}) {
    const { isSet, getCachedItem } = this.bajo
    const { isString, camelCase, isEmpty, template, isFunction } = this._

    const method = camelCase(tag)
    if (['buildTag', '_tAttr', '_getIconset', '_renderTag'].includes(method) || !this[method] || !isFunction(this[method])) return false
    if (isString(params.attr.class)) params.attr.class = this.attrToArray(params.attr.class)
    if (isString(params.attr.style)) params.attr.style = this.attrToObject(params.attr.style)
    params.attr.class = params.attr.class ?? []
    params.attr.style = params.attr.style ?? {}
    await this._tAttr({ params, reply })
    let result = await this[method]({ params, reply, el })
    if (!isSet(result)) result = params
    if (isEmpty(result.attr.class)) delete result.attr.class
    if (isEmpty(result.attr.style)) delete result.attr.style
    delete result.attr.tag
    if (isEmpty(result.html)) return await this._renderTag(tag, { params: result, reply, el })

    const locals = await buildLocals.call(this.plugin, null, { attr: result.attr }, reply)
    const cacheItem = await getCachedItem(cache, result.html, template, this.cacheMaxAge)
    result.html = cacheItem.item(locals)
    return await this._renderTag(tag, { params: result, reply, el })
  }

  async _renderTag (tag, { params, reply, el } = {}) {
    const { config } = this.mpa
    const { isSet } = this.bajo
    const { isEmpty, forOwn, isArray, isPlainObject } = this._
    const { arrayToAttr, objectToAttr } = this.mpa

    let attrs = []
    if (config.theme.component.insertCtag) attrs.push(`ctag="${this.namespace}${tag}"`)
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

  async _tAttr ({ params, reply } = {}) {
    const { importModule } = this.bajo
    const { get, map } = this._
    const { attrToArray } = this.mpa

    const ns = get(reply.request, 'routeOptions.config.ns')
    const i18n = get(reply, 'request.i18n')
    const translate = await importModule('bajo:/boot/lib/translate.js')
    for (const k in params.attr) {
      if (k.slice(0, 2) === 't:') {
        let value = attrToArray(params.attr[k], '|')
        value = map(value, v => {
          if (v.slice(0, 2) === 't:') v = translate.call(this.plugin.app[ns], i18n, [v.slice(2)])
          return v
        })
        params.attr[k.slice(2)] = translate.call(this.plugin.app[ns], i18n, ...value)
        delete params.attr[k]
      }
    }
  }

  async t ({ params, reply } = {}) {
    const { importModule } = this.bajo
    const { get } = this._
    const { attrToArray } = this.mpa
    const value = attrToArray(params.attr.value, '|')
    const ns = get(reply.request, 'routeOptions.config.ns')
    const i18n = get(reply, 'request.i18n')
    const translate = await importModule('bajo:/boot/lib/translate.js')
    params.html = translate.call(this.plugin.app[ns], i18n, params.html, ...value)
    params.noTag = true
  }

  async include ({ params, reply } = {}) {
    params.noTag = true
    const { render } = this.mpa
    const locals = await buildLocals.call(this.plugin, params.attr.value, {}, reply)
    params.html = await render(params.attr.value, locals, reply, { partial: true })
  }

  async script ({ params } = {}) {
    const { routePath } = this.plugin.app.waibuStatic
    const { merge, isEmpty } = this._
    const { objectToAttrs, attrToObject } = this.plugin
    params.noTag = true
    const result = []
    params.html.trim().split('\n').forEach(i => {
      let [url, ...args] = i.trim().split(';').map(item => item.trim())
      args = attrToObject(args.join(';')) ?? {}
      if (isEmpty(args)) args = params.attr
      const parts = url.split(':')
      if (parts.length === 2 && !parts[1].startsWith('//')) url = routePath(url)
      const attrs = objectToAttrs(merge({}, { src: url }, args))
      result.push(`<script ${attrs}> </script>`)
    })
    params.html = result.length === 0 ? '' : `\n${result.join('\n')}\n`
  }

  _getIconset (name) {
    const { find } = this._
    const { iconsets } = this.mpa
    let iconset = find(iconsets, { name })
    if (!iconset) iconset = find(iconsets, { name: 'default' })
    return iconset
  }

  async icon ({ params, reply } = {}) {
    const { get } = this._
    params.tag = 'i'
    const defIconset = this._getIconset('default')
    let name = get(this.iconset, `mapping.${params.attr.name}`)
    if (!name) name = get(defIconset, `mapping.${params.attr.name}`)
    if (!name) name = get(defIconset, 'mapping._notFound')
    params.attr.class = params.attr.class ?? []
    params.attr.class.unshift(name)
    delete params.attr.name
  }
}

export default Component
