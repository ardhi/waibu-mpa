async function parseAttrib ({ $, el, reply }) {
  const { routePath } = this.app.waibu
  const { importModule } = this.app.bajo
  const { get, map } = this.app.bajo.lib._
  const { attrToArray } = this.app.waibuMpa

  const ns = get(reply.request, 'routeOptions.config.ns')
  const i18n = get(reply, 'request.i18n')
  const translate = await importModule('bajo:/boot/lib/translate.js')

  el.attribs = el.attribs ?? {}
  for (const key in el.attribs) {
    const parent = $(el).parent()
    const val = el.attribs[key]
    // parse urls
    if (['href', 'src'].includes(key) && parent.length > 0 && !['code', 'pre'].includes(parent[0].name)) {
      el.attribs[key] = routePath(val)
    }
    // translate
    if (key.slice(0, 2) === 't:') {
      if (i18n) {
        const value = map(attrToArray(val, '|'), (v, idx) => {
          if (idx > 0 && v.slice(0, 2) === 't:') v = translate.call(this.app[ns], i18n, v.slice(2))
          return v
        })
        el.attribs[key.slice(2)] = translate.call(this.app[ns], i18n, ...value)
      } else {
        el.attribs[key.slice(2)] = val
      }
      delete el.attribs[key]
    }
    // teleport
    if (key === 'teleport') {
      delete el.attribs[key]
      $(`#${val}`).replaceWith(el)
    }
  }
}

async function mutation ({ $, el, reply } = {}) {
  const me = this
  const children = $(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await mutation.call(me, { $, el: child, reply })
      await parseAttrib.call(me, { $, el: child, reply })
    }
  }
}

export default mutation
