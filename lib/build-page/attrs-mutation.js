async function parseAttrib ({ $, el, req } = {}) {
  const { routePath } = this.app.waibu
  const { map, isString } = this.app.bajo.lib._
  const { attrToArray } = this.app.waibuMpa

  // const ns = get(req, 'routeOptions.config.ns')

  el.attribs = el.attribs ?? {}
  const parent = $(el).parent()
  for (const key in el.attribs) {
    const val = el.attribs[key]
    // parse urls
    if (!(parent.length > 0 && ['code', 'pre'].includes(parent[0].name)) && ['href', 'src', 'action'].includes(key)) {
      el.attribs[key] = routePath(val)
    }
    // translate
    if (key.slice(0, 2) === 't:') {
      const value = map(attrToArray(val, '|'), (v, idx) => {
        if (idx > 0) v = req.t(v)
        return v
      })
      el.attribs[key.slice(2)] = req.t(...value)
      delete el.attribs[key]
    }
    // open modal/offcanvas etc
    if (key === 'open' && isString(el.attribs[key])) {
      const [id, type = 'modal'] = el.attribs[key].split(':')
      el.attribs['data-bs-target'] = `#${id}`
      el.attribs['data-bs-toggle'] = type === 'drawer' ? 'offcanvas' : type
      el.attribs['aria-controls'] = id
      delete el.attribs[key]
    }
  }
}

async function attrsMutation ({ $, el, req } = {}) {
  const me = this
  const children = $(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await attrsMutation.call(me, { $, el: child, req })
      await parseAttrib.call(me, { $, el: child, req })
    }
  }
}

export default attrsMutation
