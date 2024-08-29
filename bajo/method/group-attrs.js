function groupAttrs (attribs = {}, keys = []) {
  const { isString, filter, omit } = this.app.bajo.lib._
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
      const name = a.slice(k.length + 1)
      if (!a.startsWith(k + '-')) {
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
    for (const k of keys) {
      if (m.startsWith(k + '-')) match = true
    }
    return match
  })
  attr._ = omit(attr._, deleted)
  return attr
}

export default groupAttrs
