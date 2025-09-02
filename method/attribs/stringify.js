function attribsStringify (obj = {}, kebabCasedKey = true) {
  const { isSet } = this.app.lib.aneka
  const { forOwn, kebabCase, isArray, isPlainObject, isEmpty } = this.app.lib._
  const attrs = []
  const names = this.app.getAllNs()
  forOwn(obj, (v, k) => {
    let retain = false
    for (const name of names) {
      const plugin = this.app[name]
      if (plugin && plugin.retainAttrKey && plugin.retainAttrKey(k)) retain = true
    }
    if (retain) {
      if (v === true) attrs.push(k)
      else attrs.push(`${k}="${v}"`)
      return undefined
    }
    if (kebabCasedKey) k = kebabCase(k)
    if (!isSet(v)) return undefined
    if (['class', 'style'].includes(k) && isEmpty(v)) return undefined
    if (isArray(v)) v = this.arrayToAttr(v)
    if (isPlainObject(v)) v = this.objectToAttr(v)
    if (k !== 'content' && v === true) attrs.push(k)
    else attrs.push(`${k}="${v}"`)
  })
  return attrs.join(' ')
}

export default attribsStringify
