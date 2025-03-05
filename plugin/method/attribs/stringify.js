function attribsStringify (obj = {}, kebabCasedKey = true) {
  const { isSet } = this.app.bajo
  const { forOwn, kebabCase, isArray, isPlainObject, isEmpty } = this.app.bajo.lib._
  const attrs = []
  forOwn(obj, (v, k) => {
    let retain = false
    for (const name of this.app.bajo.pluginNames) {
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
