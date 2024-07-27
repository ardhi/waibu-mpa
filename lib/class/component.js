import buildLocals from '../build-locals.js'

const cache = []

class Component {
  constructor (plugin, $, theme) {
    this.plugin = plugin
    this.$ = $
    this.theme = theme
    this.cacheMaxAge = plugin.app.wakatobiMpa.config.theme.component.cacheMaxAge
  }

  async buildTag (tag, params, reply) {
    const { isSet, getCachedItem } = this.plugin.app.bajo
    const { camelCase, isEmpty, template } = this.plugin.app.bajo.lib._

    const method = camelCase(tag)
    if (!this[method]) return false
    let result = await this[method](params, reply)
    if (!isSet(result)) result = params
    if (isEmpty(result.html)) return result

    const locals = await buildLocals.call(this.plugin, null, params, reply)
    const cacheItem = await getCachedItem(cache, result.html, template, this.cacheMaxAge)
    result.html = cacheItem.item(locals)
    return result
  }

  async t (params, reply) {
    const { sprintf } = this.plugin.app.bajo.lib
    const { get, isPlainObject } = this.plugin.app.bajo.lib._
    const { attrToObject, attrToArray } = this.plugin.app.wakatobiMpa
    let value = params.html.includes('%') ? attrToArray(params.attr.value) : attrToObject(params.attr.value)
    const i18n = get(reply, 'request.i18n')
    if (i18n) {
      const ns = get(reply.request, 'routeOptions.config.ns')
      if (isPlainObject(value)) params.html = i18n.t(params.html, value)
      else params.html = i18n.t(params.html, { ns, postProcess: 'sprintf', sprintf: value })
    } else {
      if (isPlainObject(value)) value = []
      params.html = sprintf(params.html, ...value)
    }
    params.noTag = true
  }

  async include (params, reply) {
    /*
    const { getTplAndTheme } = this.plugin.app.wakatobiMpa
    const { fs } = this.plugin.app.bajo.lib
    params.noTag = true
    const { file } = getTplAndTheme(params.attr.value)
    const text = fs.readFileSync(file, 'utf8')
    params.html = await parseComponents.call(this.plugin, text, this.theme, reply)
    */
    params.noTag = true
    const { render } = this.plugin.app.wakatobiMpa
    const locals = await buildLocals.call(this.plugin, params.attr.value, {}, reply)
    params.html = await render(params.attr.value, locals, reply, { partial: true })
  }

  async script (params) {
    const { routePath } = this.plugin.app.wakatobiStatic
    const { merge, isEmpty } = this.plugin.app.bajo.lib._
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
}

export default Component
