function groupAttrs (attribs = {}, keys = []) {
  const { isString, filter, omit, kebabCase, camelCase, isEmpty } = this.app.bajo.lib._
  if (isString(keys)) keys = [keys]
  const attr = { _: {} }
  for (const a in attribs) {
    for (const k of keys) {
      if (a === k) {
        attr._[k] = attribs[a]
        continue
      }
      attr[k] = attr[k] ?? {}
      attr[k].class = attr[k].class ?? []
      attr[k].style = attr[k].style ?? {}
      const _k = kebabCase(k)
      const name = camelCase(kebabCase(a).slice(_k.length + 1))
      if (!kebabCase(a).startsWith(k + '-')) {
        if (!keys.includes(a)) {
          attr._[a] = attribs[a]
          if (a === 'class' && isString(attribs[a])) attr._.class = this.attrToArray(attr._.class)
          if (a === 'style' && isString(attribs[a])) attr._.style = this.attrToObject(attr._.style)
        }
        continue
      }
      attr[k][name] = attribs[a]
      if (name === 'class' && isString(attribs[a])) attr[k].class = this.attrToArray(attr[k].class)
      if (name === 'style' && isString(attribs[a])) attr[k].style = this.attrToObject(attr[k].style)
    }
  }
  const deleted = filter(Object.keys(attr._), m => {
    let match
    m = kebabCase(m)
    for (const k of keys) {
      if (m.startsWith(k + '-')) match = true
    }
    return match
  })
  attr._ = omit(attr._, deleted)
  for (const k of keys) {
    const item = attr[k]
    if (!attr._[k] && Object.keys(item).length === 2 && isEmpty(item.class) && isEmpty(item.style)) delete attr[k]
  }
  return attr
}

export default groupAttrs
