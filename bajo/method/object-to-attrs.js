import isAlpinejs from '../../lib/is-alpinejs.js'

function objectToAttrs (obj = {}, kebabCasedKey = true) {
  const { isSet } = this.app.bajo
  const { forOwn, kebabCase, isArray, isPlainObject, isEmpty } = this.app.bajo.lib._
  const attrs = []
  forOwn(obj, (v, k) => {
    if (isAlpinejs.call(this, k)) {
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

export default objectToAttrs
