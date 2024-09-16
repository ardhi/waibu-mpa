import isAlpinejs from '../../lib/is-alpinejs.js'

function attrsToObject (text = '', delimiter = ' ', kvDelimiter = '=', kebabCasedKey = true) {
  const { trim, kebabCase, map, isPlainObject, forOwn } = this.app.bajo.lib._
  let attrs = []
  if (isPlainObject(text)) {
    forOwn(text, (v, k) => {
      attrs.push(`${k}${kvDelimiter}"${v}"`)
    })
  } else attrs = map(text.split(delimiter), t => trim(t))
  const result = {}
  for (const attr of attrs) {
    let [k, ...v] = map(attr.split(kvDelimiter), a => trim(a))
    v = v.join(kvDelimiter)
    v = v.slice(1, v.length - 1)
    if (v === '') v = true
    if (isAlpinejs.call(this, k)) {
      result[k] = v
      continue
    }
    if (kebabCasedKey) k = kebabCase(k)
    result[k] = v
  }
  return result
}

export default attrsToObject
