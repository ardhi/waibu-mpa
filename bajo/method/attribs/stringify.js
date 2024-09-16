function attribsStringify (obj = {}, kebabCasedKey = true) {
  const { isSet } = this.app.bajo
  const { forOwn, kebabCase, isArray, isPlainObject, isEmpty } = this.app.bajo.lib._
  const attrs = []
  forOwn(obj, (v, k) => {
    // check for keyAttrHandler on ALL plugins
    let mutated = true
    for (const name of this.app.bajo.pluginNames) {
      const plugin = this.app[name]
      if (plugin && plugin.keyAttrHandler && plugin.keyAttrHandler(k)) mutated = false
    }
    if (!mutated) {
      attrs.push(`${k}="${v}"`)
      return undefined
    }
    if (kebabCasedKey) k = kebabCase(k)
    if (!isSet(v)) return undefined
    if (isArray(v)) v = this.arrayToAttr(v)
    if (isPlainObject(v)) v = this.objectToAttr(v)
    if (['class', 'style'].includes(k) && isEmpty(v)) return undefined
    if (v === true) attrs.push(k)
    else attrs.push(`${k}="${v}"`)
  })
  return attrs.join(' ')
}

export default attribsStringify
