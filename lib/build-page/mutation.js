async function parseAttrib ({ $, el, req } = {}) {
  const { routePath } = this.app.waibu
  const { map } = this.app.bajo.lib._
  const { attrToArray } = this.app.waibuMpa

  // const ns = get(req, 'routeOptions.config.ns')

  el.attribs = el.attribs ?? {}
  for (const key in el.attribs) {
    const parent = $(el).parent()
    const val = el.attribs[key]
    // parse urls
    if (['href', 'src', 'action'].includes(key) && parent.length > 0 && !['code', 'pre'].includes(parent[0].name)) {
      el.attribs[key] = routePath(val)
    }
    // translate
    if (key.slice(0, 2) === 't:') {
      const value = map(attrToArray(val, '|'), (v, idx) => {
        if (idx > 0 && v.slice(0, 2) === 't:') v = req.t(v.slice(2))
        return v
      })
      el.attribs[key.slice(2)] = req.t(...value)
      delete el.attribs[key]
    }
    // teleport
    if (key === 'teleport') {
      delete el.attribs[key]
      $(`#${val}`).replaceWith(el)
    }
  }
}

async function mutation ({ $, el, req } = {}) {
  const me = this
  const children = $(el).children()
  if (children.length > 0) {
    for (const child of children) {
      await mutation.call(me, { $, el: child, req })
      await parseAttrib.call(me, { $, el: child, req })
    }
  }
}

export default mutation
