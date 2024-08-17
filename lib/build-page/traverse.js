import replaceTag from './replace-tag.js'

async function parseAttrib ({ el, cmp, reply, locals }) {
  const { routePath } = this.app.waibu
  const { importModule } = this.app.bajo
  const { get, map } = this.app.bajo.lib._
  const { attrToArray } = this.app.waibuMpa

  const ns = get(reply.request, 'routeOptions.config.ns')
  const i18n = get(reply, 'request.i18n')
  const translate = await importModule('bajo:/boot/lib/translate.js')

  el.attribs = el.attribs ?? {}
  for (const key in el.attribs) {
    // parse urls
    if (['href', 'src'].includes(key)) {
      el.attribs[key] = routePath(el.attribs[key])
    }
    // translate
    if (key.slice(0, 2) === 't:') {
      if (i18n) {
        const value = map(attrToArray(el.attribs[key], '|'), (v, idx) => {
          if (idx > 0 && v.slice(0, 2) === 't:') v = translate.call(this.app[ns], i18n, v.slice(2))
          return v
        })
        el.attribs[key.slice(2)] = translate.call(this.app[ns], i18n, ...value)
      } else {
        el.attribs[key.slice(2)] = el.attribs[key]
      }
      delete el.attribs[key]
    }
  }
}

async function traverse ({ el, cmp, reply, locals = {} } = {}) {
  const me = this
  const children = cmp.$(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await traverse.call(me, { el: child, cmp, reply, locals })
      await parseAttrib.call(me, { el: child, cmp, reply, locals })
      if (child.name.startsWith(cmp.namespace)) await replaceTag.call(me, { el: child, cmp, reply, locals })
    }
  }
}

export default traverse
